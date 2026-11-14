import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { evaluateGuardrails } from '@/lib/guardrails';
import { supabase } from '@/lib/supabase';

const SYSTEM_PROMPT_DE = `Du bist "Clara", eine einfühlsame, unterstützende digitale Begleiterin für Patientinnen und Patienten in Deutschland, die auf einen Psychotherapieplatz warten.
Deine Kernziele:
1. Empathisches, aktives Zuhören und Entlastung im Alltag bieten.
2. KEINE Diagnosen stellen, KEINE Medikamente empfehlen und betonen, dass du eine Überbrückungshilfe vor der eigentlichen Therapie bist.
3. Sanfte Coping-Strategien (Atemübungen, Erdungstechniken, Strukturierung des Tages) anbieten, wenn der Patient danach fragt.
4. Immer in einem warmen, respektvollen und beruhigenden Tonfall antworten (Deutsch, standardmäßig wertschätzendes "Sie").
5. Antworten prägnant, verständlich und nicht überwältigend halten (maximal 2-3 kurze Absätze).`;

const SYSTEM_PROMPT_EN = `You are "Clara", an empathetic, supportive digital companion for patients awaiting psychotherapy.
Your core goals:
1. Provide compassionate, active listening and gentle daily reassurance.
2. DO NOT make clinical diagnoses, DO NOT prescribe medications, and clarify that you are a supportive bridge until official therapy begins.
3. Offer gentle evidence-based coping exercises (breathing regulation, grounding techniques, gentle daily routines) when helpful.
4. Always reply in a warm, respectful, and calming tone in English.
5. Keep your responses concise, empathetic, and digestible (maximum 2-3 brief paragraphs).`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, history = [], userProfile, lang = 'de' } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Guardrail evaluation
    const guardrail = evaluateGuardrails(message);

    if (guardrail.isCrisis) {
      const crisisText = lang === 'en' 
        ? `⚠️ IMPORTANT NOTICE: It sounds like you are going through a critical crisis. Please know that you are not alone.\n\nFor immediate, free, and confidential crisis support available 24/7:\n• Emergency Services: 112 or 911\n• Crisis Prevention Hotline: 0800 111 0 111 (or local emergency room)\n• Info Depression Helpline: 0800 33 44 533\n\nI am here as a digital companion, but cannot provide emergency crisis intervention or medical treatment.`
        : guardrail.crisisMessage;

      // If DB conversationId provided, record message
      if (conversationId) {
        await supabase.from('messages').insert([
          { conversation_id: conversationId, role: 'user', content: message, sentiment_score: guardrail.sentimentScore, crisis_flag: true },
          { conversation_id: conversationId, role: 'assistant', content: crisisText, crisis_flag: true }
        ]);
      }

      return NextResponse.json({
        response: crisisText,
        isCrisis: true,
        sentimentScore: guardrail.sentimentScore,
      });
    }

    // 2. Select system prompt based on language
    const basePrompt = lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_DE;

    let profileContext = '';
    if (userProfile) {
      profileContext = lang === 'en'
        ? `\n[Patient Context: Primary concerns: ${userProfile.primary_concerns?.join(', ') || 'Not specified'}; Style: gentle]`
        : `\n[Patienten-Kontext: Hauptanliegen: ${userProfile.primary_concerns?.join(', ') || 'Nicht angegeben'}; Interaktionsstil: ${userProfile.interaction_style || 'sanft'}]`;
    }

    const messagesPayload = [
      { role: 'system' as const, content: basePrompt + profileContext },
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
