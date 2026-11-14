'use client';

import React, { useState } from 'react';
import { Smile, Zap, Moon, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function MoodTracker() {
  const { t } = useLanguage();
  const [mood, setMood] = useState(6);
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(6);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-emerald-950 text-sm sm:text-base">{t.moodTitle}</h3>
          <p className="text-xs text-emerald-700">{t.moodSubtitle}</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
          {t.moodToday}
        </span>
      </div>

      {submitted ? (
        <div className="p-5 sm:p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-in fade-in">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-emerald-950 text-sm">{t.moodThanksTitle}</h4>
          <p className="text-xs text-emerald-700">{t.moodThanksDesc}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Mood Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-emerald-900">
              <span className="flex items-center gap-1.5 font-semibold">
                <Smile className="w-4 h-4 text-emerald-600" /> {t.moodScaleLabel}
              </span>
              <span className="text-emerald-700 font-bold text-sm">{mood}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Energy Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-emerald-900">
              <span className="flex items-center gap-1.5 font-semibold">
                <Zap className="w-4 h-4 text-emerald-600" /> {t.energyScaleLabel}
              </span>
              <span className="text-emerald-700 font-bold text-sm">{energy}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Sleep Quality */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-emerald-900">
              <span className="flex items-center gap-1.5 font-semibold">
                <Moon className="w-4 h-4 text-emerald-600" /> {t.sleepScaleLabel}
              </span>
              <span className="text-emerald-700 font-bold text-sm">{sleep}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={sleep}
              onChange={(e) => setSleep(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Short note */}
          <div>
            <label className="block text-xs font-semibold text-emerald-950 mb-1">
              {t.notesLabel}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50/30 text-xs sm:text-sm text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-emerald-700/40"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            {t.saveMoodBtn}
          </button>
        </form>
      )}
    </div>
  );
}
