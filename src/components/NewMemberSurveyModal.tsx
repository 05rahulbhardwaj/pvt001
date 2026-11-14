'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, ArrowRight, ArrowLeft, Heart, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface NewMemberSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewMemberSurveyModal({ isOpen, onClose }: NewMemberSurveyModalProps) {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '28',
    insurance: 'public',
    symptoms: [] as string[],
    waitWeeks: '8',
    burden: '7',
    previousTherapy: 'no',
    consentPrivacy: true,
    consentCrisis: true,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleSymptom = (symKey: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symKey)
        ? prev.symptoms.filter(s => s !== symKey)
        : [...prev.symptoms, symKey],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleStartCompanion = () => {
    onClose();
    router.push('/patient');
  };

  const symptomOptions = [
    { key: 'depression', label: t.symDepression },
    { key: 'anxiety', label: t.symAnxiety },
    { key: 'sleep', label: t.symSleep },
    { key: 'burnout', label: t.symBurnout },
    { key: 'grief', label: t.symGrief },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-emerald-950">
                {t.surveyTitle}
              </h3>
              <p className="text-[11px] text-emerald-700 hidden sm:block">
                {t.surveySubtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-emerald-200/50 text-emerald-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        {!isSubmitted && (
          <div className="px-5 sm:px-6 pt-3 pb-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 mb-1.5">
              <span>{t.step} {step} {t.of} 4</span>
              <span>
                {step === 1 && t.step1Title}
                {step === 2 && t.step2Title}
                {step === 3 && t.step3Title}
                {step === 4 && t.step4Title}
              </span>
            </div>
            <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {isSubmitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-emerald-950">
                  {t.surveySuccessTitle}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto leading-relaxed">
                  {t.surveySuccessDesc}
                </p>
              </div>

              {/* Triage Summary Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left text-xs text-emerald-900 space-y-2 max-w-md mx-auto">
                <div className="flex justify-between font-semibold">
                  <span>Wartelisten-Priorität:</span>
                  <span className="text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {Number(formData.burden) >= 7 ? 'Hohe Priorität (Triage A)' : 'Standard (Triage B)'}
                  </span>
                </div>
                <div><strong>Name:</strong> {formData.name || 'Sarah M. (Pseudonym)'}</div>
                <div><strong>Gemeldete Belastung:</strong> {formData.burden} / 10</div>
                <div>
                  <strong>Fokus:</strong>{' '}
                  {formData.symptoms.length > 0
                    ? formData.symptoms.map(s => symptomOptions.find(o => o.key === s)?.label).join(', ')
                    : t.symSleep}
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleStartCompanion}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 inline-flex items-center justify-center gap-2 transition-all"
                >
                  <span>{t.startCompanionNow}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); setStep(s => s + 1); }}>
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-950 mb-1">
                      {t.fullNameLabel} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. Sarah M."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-emerald-950 mb-1">
                        {t.emailLabel} *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sarah.m@example.de"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-950 mb-1">
                        {t.ageLabel}
                      </label>
                      <input
                        type="number"
                        min="16"
                        max="99"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                      {t.insuranceLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, insurance: 'public' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          formData.insurance === 'public'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                            : 'bg-white border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {t.insurancePublic}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, insurance: 'private' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          formData.insurance === 'private'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                            : 'bg-white border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {t.insurancePrivate}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Symptoms */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-emerald-800 font-medium">
                    {t.symptomsQuestion}
                  </p>
                  <div className="space-y-2">
                    {symptomOptions.map(option => {
                      const selected = formData.symptoms.includes(option.key);
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => toggleSymptom(option.key)}
                          className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs sm:text-sm transition-all ${
                            selected
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                              : 'bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50/40'
                          }`}
                        >
                          <span>{option.label}</span>
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            selected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-emerald-300'
                          }`}>
                            {selected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Wait Time & Burden */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-emerald-950 mb-1.5">
                      <span>{t.waitMonthsLabel}</span>
                      <span className="text-emerald-700 font-bold">{formData.waitWeeks} {language === 'de' ? 'Wochen' : 'weeks'}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="52"
                      value={formData.waitWeeks}
                      onChange={(e) => setFormData({ ...formData, waitWeeks: e.target.value })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-emerald-950 mb-1.5">
                      <span>{t.burdenLabel}</span>
                      <span className="text-emerald-700 font-bold">{formData.burden} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.burden}
                      onChange={(e) => setFormData({ ...formData, burden: e.target.value })}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-950 mb-1.5">
                      {t.hadPreviousTherapy}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, previousTherapy: 'yes' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          formData.previousTherapy === 'yes'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                            : 'bg-white border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {t.yes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, previousTherapy: 'no' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          formData.previousTherapy === 'no'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                            : 'bg-white border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {t.no}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Consent & Complete */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
                    <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {t.privacyNote}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      {t.crisisNoteConsent}
                    </p>
                  </div>

                  <div className="pt-2 text-xs text-emerald-700">
                    ✓ Sofortige Freischaltung von Clara (ElevenLabs Audio Companion)
                    <br />
                    ✓ Automatischer Eintrag in die klinikinterne Überbrückungs-Warteliste
                  </div>
                </div>
              )}

              {/* Modal Bottom Buttons */}
              <div className="mt-6 pt-4 border-t border-emerald-100 flex items-center justify-between gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s - 1)}
                    className="px-4 py-2.5 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.back}</span>
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 1 && !formData.name.trim()) {
                        setFormData({ ...formData, name: 'Sarah M.' });
                      }
                      setStep(s => s + 1);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>{t.next}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <span>{t.finish}</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
