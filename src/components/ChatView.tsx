'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, HeartHandshake, ShieldAlert, Sparkles, RefreshCw, Volume2, VolumeX, Square } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isCrisis?: boolean;
}

export default function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: 'Guten Tag. Ich bin Clara, Ihre digitale Begleiterin während Ihrer Wartezeit auf die Psychotherapie. Wie fühlen Sie sich heute oder was liegt Ihnen im Moment besonders auf dem Herzen?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);

  // Voice Companion state (ElevenLabs)
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [autoVoice, setAutoVoice] = useState(false);
  const [voiceId, setVoiceId] = useState<string>('pFZP5JQG7iQjIQuC4Bku'); // Lily (warm & soothing)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playVoice = async (messageId: string, text: string) => {
    // If already playing this message, stop it
    if (playingId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingId(null);
      return;
    }

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Check client cache first to save ElevenLabs quota & latency
    const cacheKey = `${messageId}_${voiceId}`;
    let audioUrl = audioCacheRef.current.get(cacheKey);

    if (!audioUrl) {
      setLoadingAudioId(messageId);
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId }),
        });

        if (!res.ok) {
          throw new Error('TTS request failed');
        }

        const blob = await res.blob();
        audioUrl = URL.createObjectURL(blob);
        audioCacheRef.current.set(cacheKey, audioUrl);
      } catch (err) {
        console.error('Audio playback error:', err);
        setLoadingAudioId(null);
        return;
      } finally {
        setLoadingAudioId(null);
      }
    }

    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingId(null);
    };

    audio.onerror = () => {
      setPlayingId(null);
    };

    setPlayingId(messageId);
    audio.play().catch(e => {
      console.warn('Audio play was prevented by browser policy:', e);
      setPlayingId(null);
    });
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setCrisisAlert(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (data.isCrisis) {
        setCrisisAlert(data.response);
      }

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantResponse = data.response || 'Ich habe Ihre Nachricht erhalten.';

      setMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: assistantResponse,
          isCrisis: data.isCrisis
        }
      ]);

      // If auto-voice is enabled, automatically play Clara's voice
      if (autoVoice && assistantResponse) {
        playVoice(assistantMsgId, assistantResponse);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Entschuldigung, es gab ein Verbindungsproblem zum Begleitungsdienst.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-lg shadow-sm">
            C
          </div>
          <div>
            <h2 className="font-semibold text-emerald-950 flex items-center gap-2">
              Clara <span className="text-xs bg-emerald-100 text-emerald-800 font-normal px-2 py-0.5 rounded-full">Begleiterin</span>
            </h2>
            <p className="text-xs text-emerald-700">Wartezeit-Unterstützung • Mit ElevenLabs Sprachausgabe</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Selector */}
          <select
            value={voiceId}
            onChange={(e) => {
              setVoiceId(e.target.value);
              if (playingId && audioRef.current) {
                audioRef.current.pause();
                setPlayingId(null);
              }
            }}
            className="text-xs bg-white text-emerald-900 border border-emerald-200 rounded-full px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
            title="Stimme auswählen"
          >
            <option value="pFZP5JQG7iQjIQuC4Bku">🎙️ Lily (Sanft & Beruhigend)</option>
            <option value="EXAVITQu4vr4xnSDxMaL">🎙️ Sarah (Weich & Warm)</option>
            <option value="cgSgspJ2msm6clMCkdW9">🎙️ Jessica (Natürlich)</option>
          </select>

          {/* Voice Auto-play Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setAutoVoice(!autoVoice);
              if (playingId && audioRef.current) {
                audioRef.current.pause();
                setPlayingId(null);
              }
            }}
            title={autoVoice ? 'Automatische Sprachausgabe deaktivieren' : 'Automatische Sprachausgabe aktivieren'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              autoVoice
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
            }`}
          >
            {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{autoVoice ? 'Stimme aktiv' : 'Stimme stumm'}</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-800 bg-white px-3 py-1.5 rounded-full border border-emerald-200">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>Geschützter Raum (DSGVO)</span>
          </div>
        </div>
      </div>

      {/* Crisis Warning Banner */}
      {crisisAlert && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-sm flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="whitespace-pre-line leading-relaxed">{crisisAlert}</div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-emerald-50/20 to-white">
        {messages.map((m) => {
          const isClara = m.role === 'assistant';
          const isPlaying = playingId === m.id;
          const isLoadingAudio = loadingAudioId === m.id;

          return (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : m.isCrisis
                    ? 'bg-rose-50 text-rose-950 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-950 border border-emerald-100'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {/* ElevenLabs Voice Playback Control for Clara's messages */}
                {isClara && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => playVoice(m.id, m.content)}
                      disabled={isLoadingAudio}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isPlaying
                          ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                          : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs'
                      }`}
                    >
                      {isLoadingAudio ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                          <span>Lädt Stimme...</span>
                        </>
                      ) : isPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-600" />
                          <span>Vorlesen (ElevenLabs)</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-emerald-700/80">Clara Audio • Sanfte Pacing</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center space-x-2 text-emerald-700 text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>Clara antwortet einfühlsam...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="px-6 py-2 bg-emerald-50/40 border-t border-emerald-50 flex items-center gap-2 overflow-x-auto text-xs text-emerald-700">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="font-medium text-emerald-800">Vorschläge:</span>
        <button
          onClick={() => setInput('Ich kann abends schwer einschalten und grüble viel.')}
          className="whitespace-nowrap px-3 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors"
        >
          Gedankenkreisen am Abend
        </button>
        <button
          onClick={() => setInput('Haben Sie eine kurze Beruhigungsübung für mich?')}
          className="whitespace-nowrap px-3 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors"
        >
          Kurze Beruhigungsübung
        </button>
        <button
          onClick={() => setInput('Wie kann ich mich auf das Erstgespräch vorbereiten?')}
          className="whitespace-nowrap px-3 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors"
        >
          Erstgespräch vorbereiten
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-emerald-100 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Schreiben Sie vertraulich mit Clara..."
          className="flex-1 px-4 py-3 bg-emerald-50/40 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 placeholder-emerald-800/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm"
        >
          <span>Senden</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
