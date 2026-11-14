import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { evaluateGuardrails } from '@/lib/guardrails';
import { supabase } from '@/lib/supabase';

const SYSTEM_PROMPT = `Du bist "Clara", eine einfühlsame, unterstützende digitale Begleiterin für Patientinnen und Patienten in Deutschland, die auf einen Psychotherapieplatz warten.
Deine Kernziele:
1. Empathisches, aktives Zuhören und Entlastung im Alltag bieten.
2. KEINE Diagnosen stellen, KEINE Medikamente empfehlen und betonen, dass du eine Überbrückungshilfe vor der eigentlichen Therapie bist.
3. Sanfte Coping-Strategien (Atemübungen, Erdungstechniken, Strukturierung des Tages) anbieten, wenn der Patient danach fragt.
4. Immer in einem warmen, respektvollen und beruhigenden Tonfall antworten (Deutsch, "Sie" oder "Du" je nach Wunsch, standardmäßig wertschätzendes "Sie").
5. Antworten prägnant, verständlich und nicht überwältigend halten (maximal 2-3 kurze Absätze).`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, history = [], userProfile } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Guardrail evaluation
    const guardrail = evaluateGuardrails(message);

    if (guardrail.isCrisis) {
      // If DB conversationId provided, record message
      if (conversationId) {
        await supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user', content: message, sentiment_score: guardrail.sentimentScore, crisis_flag: true },
          { conversation_id: conversationId, role: 'assistant', content: guardrail.crisisMessage, crisis_flag: true }
        ]);
      }

      return NextResponse.json({
        response: guardrail.crisisMessage,
        isCrisis: true,
        sentimentScore: guardrail.sentimentScore,
      });
    }

    // 2. Build conversation context for LLM
    let profileContext = '';
    if (userProfile) {
      profileContext = `\n[Patienten-Kontext: Hauptanliegen: ${userProfile.primary_concerns?.join(', ') || 'Nicht angegeben'}; Interaktionsstil: ${userProfile.interaction_style || 'sanft'}]`;
    }

    const messagesPayload = [
      { role: 'system' as const, content: SYSTEM_PROMPT + profileContext },
      ...history.slice(-8).map((h: { role: string; content: string }) => ({
        role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // 3. Call LLM
    const aiResponse = await callLLM(messagesPayload);

    // 4. Save to Supabase if conversationId is provided
    if (conversationId) {
      try {
        await supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user', content: message, sentiment_score: guardrail.sentimentScore, crisis_flag: false },
          { conversation_id: conversationId, role: 'assistant', content: aiResponse, crisis_flag: false }
        ]);
      } catch (err) {
        console.warn('DB logging warning (table might be empty or not yet created):', err);
      }
    }

    return NextResponse.json({
      response: aiResponse,
      isCrisis: false,
      sentimentScore: guardrail.sentimentScore,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Chat API Error:', errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
