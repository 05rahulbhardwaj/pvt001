'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  HeartHandshake, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Square, 
  Mic, 
  MicOff 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isCrisis?: boolean;
}

// Browser SpeechRecognition interface
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export default function ChatView() {
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: t.claraInitMessage
    }
  ]);

  // Update initial message when language changes if no conversation has taken place yet
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ id: 'init-1', role: 'assistant', content: t.claraInitMessage }];
      }
      return prev;
    });
  }, [language, t.claraInitMessage]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);

  // Voice Companion state (ElevenLabs)
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [autoVoice, setAutoVoice] = useState(false);
  const [voiceId, setVoiceId] = useState<string>('pFZP5JQG7iQjIQuC4Bku'); // Lily
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // Speech-to-Text / Microphone state (Requirement 1)
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Cleanup audio & speech recognition on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  // Initialize and toggle speech recognition
  const toggleSpeechRecognition = () => {
    setSpeechError(null);

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Check window browser support for Web Speech API
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError(t.micNotSupported);
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'de' ? 'de-DE' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInput(prev => {
            // If input is empty or ends with space, just append
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      recognition.onerror = (event: { error: string }) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            language === 'de'
              ? 'Mikrofon-Zugriff im Browser verweigert.'
              : 'Microphone access denied in browser.'
          );
        } else if (event.error !== 'no-speech') {
          setSpeechError(
            language === 'de'
              ? 'Spracherkennung unterbrochen.'
              : 'Speech recognition interrupted.'
          );
        }
        setTimeout(() => setSpeechError(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
      setSpeechError(t.micNotSupported);
      setTimeout(() => setSpeechError(null), 3500);
    }
  };

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

    // Check client cache first
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

    // Stop listening if user sends
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
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
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          lang: language,
        })
      });

      const data = await res.json();
      if (data.isCrisis) {
        setCrisisAlert(data.response);
      }

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantResponse = data.response || (language === 'de' ? 'Ich habe Ihre Nachricht erhalten.' : 'I have received your message.');

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
          content: language === 'de'
            ? 'Entschuldigung, es gab ein Verbindungsproblem zum Begleitungsdienst.'
            : 'Sorry, there was a connection issue with the companion service.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
      {/* Top Bar - Fully Responsive */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-emerald-50/80 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm flex-shrink-0">
            C
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-1.5 sm:gap-2">
              {t.claraTitle} <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">{t.claraRole}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-emerald-700 truncate max-w-[200px] sm:max-w-none">
              {t.claraSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
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
            className="text-xs bg-white text-emerald-900 border border-emerald-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer shadow-2xs"
            title="Stimme auswählen"
          >
            <option value="pFZP5JQG7iQjIQuC4Bku">{t.voiceLily}</option>
            <option value="EXAVITQu4vr4xnSDxMaL">{t.voiceSarah}</option>
            <option value="cgSgspJ2msm6clMCkdW9">{t.voiceJessica}</option>
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
            title={autoVoice ? t.voiceMuted : t.voiceActive}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              autoVoice
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100/60 shadow-2xs'
            }`}
          >
            {autoVoice ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{autoVoice ? t.voiceActive : t.voiceMuted}</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-800 bg-white px-2.5 py-1.5 rounded-xl border border-emerald-200">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.safeSpaceDSGVO}</span>
          </div>
        </div>
      </div>

      {/* Crisis Warning Banner */}
      {crisisAlert && (
        <div className="p-3.5 sm:p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start space-x-2.5 sm:space-x-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="whitespace-pre-line leading-relaxed">{crisisAlert}</div>
        </div>
      )}

      {/* Speech Notification Banner */}
      {speechError && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="text-amber-600 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-emerald-50/20 to-white">
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
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : m.isCrisis
                    ? 'bg-rose-50 text-rose-950 border border-rose-200'
                    : 'bg-emerald-50/90 text-emerald-950 border border-emerald-100 shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.content}</p>

                {/* ElevenLabs Voice Playback Control for Clara's messages */}
                {isClara && (
                  <div className="mt-2.5 pt-2 border-t border-emerald-200/50 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => playVoice(m.id, m.content)}
                      disabled={isLoadingAudio}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                          : 'bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs'
                      }`}
                    >
                      {isLoadingAudio ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                          <span>{t.loadingVoice}</span>
                        </>
                      ) : isPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>{t.stopVoiceBtn}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-600" />
                          <span>{t.readVoiceBtn}</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-emerald-700/80 hidden xs:inline">{t.claraAudioTag}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-3.5 py-2.5 flex items-center space-x-2 text-emerald-700 text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>{t.claraThinking}</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 sm:px-6 py-2 bg-emerald-50/40 border-t border-emerald-50 flex items-center gap-2 overflow-x-auto text-xs text-emerald-700">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span className="font-semibold text-emerald-800 whitespace-nowrap">{t.suggestionsHeader}</span>
        <button
          type="button"
          onClick={() => setInput(t.suggestion1Prompt)}
          className="whitespace-nowrap px-2.5 sm:px-3 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors text-[11px] sm:text-xs cursor-pointer"
        >
          {t.suggestion1}
        </button>
        <button
          type="button"
          onClick={() => setInput(t.suggestion2Prompt)}
          className="whitespace-nowrap px-2.5 sm:px-3 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors text-[11px] sm:text-xs cursor-pointer"
        >
          {t.suggestion2}
        </button>
        <button
          type="button"
          onClick={() => setInput(t.suggestion3Prompt)}
          className="whitespace-nowrap px-2.5 sm:px-3 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors text-[11px] sm:text-xs cursor-pointer"
        >
          {t.suggestion3}
        </button>
      </div>

      {/* Listening Status Bar */}
      {isListening && (
        <div className="px-4 py-1.5 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold">{t.micListening}</span>
          </div>
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className="text-[11px] font-bold text-rose-700 hover:underline"
          >
            {t.micStop}
          </button>
        </div>
      )}

      {/* Input Form with MIC BUTTON (Requirement 1) */}
      <form onSubmit={sendMessage} className="p-3 sm:p-4 bg-white border-t border-emerald-100 flex items-center gap-2 sm:gap-3">
        {/* Microphone Button */}
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          title={isListening ? t.micStop : t.micStart}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
            isListening
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400 ring-offset-1 animate-pulse'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs'
          }`}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5 text-emerald-600" />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 placeholder-emerald-800/40 min-w-0"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer"
        >
          <span className="hidden sm:inline">{t.sendBtn}</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
