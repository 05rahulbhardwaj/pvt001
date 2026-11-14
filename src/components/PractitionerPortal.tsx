'use client';

import React, { useState } from 'react';
import { UserSession, ChatSessionForReview } from '@/types/auth';
import { INITIAL_CHAT_REVIEWS } from '@/lib/mockData';
import { 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  UserCheck, 
  AlertCircle, 
  FileCheck, 
  Send, 
  Clock, 
  Sparkles,
  Bot,
  User,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PractitionerPortalProps {
  user: UserSession;
}

export default function PractitionerPortal({ user }: PractitionerPortalProps) {
  const { language, t } = useLanguage();
  const [reviews, setReviews] = useState<ChatSessionForReview[]>(INITIAL_CHAT_REVIEWS);
  const [selectedReviewId, setSelectedReviewId] = useState<string>('review-1');
  const [summaryInput, setSummaryInput] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isAiAssisted: boolean;
    confidence: number;
    verdict?: string;
    reasoning?: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedReview = reviews.find(r => r.id === selectedReviewId) || reviews[0];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleValidateSummary = async () => {
    if (!summaryInput.trim()) {
      alert(language === 'de' 
        ? 'Bitte geben Sie zuerst eine fachliche Zusammenfassung ein.' 
        : 'Please enter a clinical summary first.'
      );
      return;
    }

    setValidating(true);
    try {
      const res = await fetch('/api/validate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryText: summaryInput }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch {
      alert(language === 'de' ? 'Fehler bei der Validierung des Texts.' : 'Error during text validation.');
    } finally {
      setValidating(false);
    }
  };

  const handleCloseReview = () => {
    if (!summaryInput.trim()) {
      alert(language === 'de'
        ? 'Bitte geben Sie vor dem Schließen eine kurze Begründung/Zusammenfassung an.'
        : 'Please provide a brief justification/summary before closing.'
      );
      return;
    }

    setReviews(prev => prev.map(r => {
      if (r.id === selectedReviewId) {
        return {
          ...r,
          status: 'closed',
          rating: rating,
          practitionerSummary: summaryInput,
          summaryValidation: validationResult ? {
            isAiAssisted: validationResult.isAiAssisted,
            confidence: validationResult.confidence,
            checkedAt: new Date().toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US'),
          } : undefined,
          reviewedBy: user.name,
          closedAt: new Date().toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US'),
        };
      }
      return r;
    }));

    showToast(language === 'de'
      ? `Prüfung für ${selectedReview.patientPseudonym} mit ${rating} Sternen abgeschlossen & archiviert.`
      : `Review for ${selectedReview.patientPseudonym} authorized with ${rating} stars and archived.`
    );
    setSummaryInput('');
    setValidationResult(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-3.5 sm:p-4 bg-emerald-800 text-white rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-xl font-bold text-emerald-950">
              {t.practitionerPortalTitle}
            </h1>
            <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Part-Time Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            {t.loggedInAs} <span className="font-semibold">{user.name}</span> • {t.practitionerPortalSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 self-start md:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>RLHF Feedback Loop</span>
        </div>
      </div>

      {/* Main Grid: Chat Queue (Left) & Detailed Review (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        {/* Left Column: Chat Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 p-4 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-50">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              {language === 'de' ? 'Prüf-Warteschlange' : 'Review Queue'}
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
              {reviews.filter(r => r.status !== 'closed').length} {language === 'de' ? 'offen' : 'pending'}
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {reviews.map((rev) => {
              const isSelected = rev.id === selectedReviewId;
              const isClosed = rev.status === 'closed';

              return (
                <div
                  key={rev.id}
                  onClick={() => {
                    setSelectedReviewId(rev.id);
                    setSummaryInput(rev.practitionerSummary || '');
                    setRating(rev.rating || 5);
                    setValidationResult(null);
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-emerald-950">{rev.patientPseudonym}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isClosed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isClosed
                        ? (language === 'de' ? 'Abgeschlossen' : 'Closed')
                        : (language === 'de' ? 'Offen' : 'Open')}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-800 line-clamp-1 mb-2">
                    {rev.messages[rev.messages.length - 1]?.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-emerald-700">
                    <span>{rev.messages.length} {language === 'de' ? 'Nachrichten' : 'messages'}</span>
                    {rev.rating && (
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-current" /> {rev.rating}/5
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Transcript + Side Context + Review Action */}
        <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          {/* Top Context Box: Patient Baseline anchored side by side */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 p-4 sm:p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                {language === 'de' ? 'Verankerter Profil-Kontext' : 'Anchored Profile Context'} ({selectedReview.patientPseudonym})
              </span>
              <span className="text-xs text-emerald-700 font-medium">
                {language === 'de' ? `Woche ${selectedReview.patientBaseline.waitWeeks} auf Warteliste` : `Week ${selectedReview.patientBaseline.waitWeeks} on waitlist`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs pt-1">
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                <span className="font-semibold text-emerald-900 block mb-0.5">
                  {language === 'de' ? 'Symptomatik:' : 'Symptoms:'}
                </span>
                <span className="text-emerald-800">{selectedReview.patientBaseline.primaryConcerns.join(', ')}</span>
              </div>
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                <span className="font-semibold text-emerald-900 block mb-0.5">
                  {language === 'de' ? 'Interaktionsstil:' : 'Interaction Style:'}
                </span>
                <span className="text-emerald-800">{selectedReview.patientBaseline.interactionStyle}</span>
              </div>
              <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100">
                <span className="font-semibold text-emerald-900 block mb-0.5">
                  {language === 'de' ? 'Bekannte Trigger:' : 'Known Triggers:'}
                </span>
                <span className="text-emerald-800">{selectedReview.patientBaseline.triggers.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Chat Transcript View */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-sm flex flex-col h-80 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-semibold">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                {t.chatHistoryHeader}
              </span>
              <span className="text-[11px] text-emerald-600 font-normal">
                {language === 'de' ? 'DSGVO-pseudonymisiert' : 'GDPR-pseudonymized'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gradient-to-b from-emerald-50/10 to-white">
              {selectedReview.messages.map((m, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-1">
                      C
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-950 border border-emerald-100'
                  }`}>
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px] flex-shrink-0 mt-1">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Practitioner Assessment Box */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>{t.assessmentHeader}</span>
              </h3>

              {/* Star Rating */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-emerald-700 font-medium mr-1">{t.ratingLabel}:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'text-amber-500 fill-current' : 'text-emerald-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Assessment Input */}
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                {t.practitionerNotesLabel}
              </label>
              <textarea
                rows={3}
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                placeholder={language === 'de'
                  ? 'z.B. Patientin zeigt gute Compliance bei Atemtechniken. Keine akute Suizidalität erkennbar...'
                  : 'e.g., Patient shows positive compliance with relaxation breathing. No acute suicidal ideation detected...'
                }
                className="w-full p-3 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs text-emerald-950 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Validation Feedback & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleValidateSummary}
                disabled={validating}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
              >
                {validating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>{t.checkingAi}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.checkAiButton}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCloseReview}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.submitReviewBtn}</span>
              </button>
            </div>

            {/* Validation Outcome Pill */}
            {validationResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {t.aiCheckSuccess.replace('{conf}', (validationResult.confidence * 100).toFixed(0))}
                  </span>
                  {validationResult.reasoning && (
                    <p className="text-[11px] text-emerald-700 mt-0.5">{validationResult.reasoning}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
