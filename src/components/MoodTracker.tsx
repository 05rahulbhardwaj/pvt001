'use client';

import React, { useState } from 'react';
import { Smile, Zap, Moon, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MoodTracker() {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleep, setSleep] = useState(6);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-emerald-950 text-base">Täglicher Check-in</h3>
          <p className="text-xs text-emerald-700">Verfolgen Sie Ihr Befinden während der Wartezeit</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
          Heute
        </span>
      </div>

      {submitted ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h4 className="font-semibold text-emerald-950">Vielen Dank für Ihre Reflexion!</h4>
          <p className="text-xs text-emerald-700">Ihre Daten fließen pseudonymisiert in Ihren Vorab-Bericht ein.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mood Slider */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-emerald-600" /> Stimmung (1 = sehr belastet, 10 = sehr gut)
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
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-600" /> Energie & Antrieb
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
              <span className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-emerald-600" /> Schlafqualität
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
            <label className="block text-xs font-medium text-emerald-900 mb-1">
              Kurze Notiz für den Therapeuten (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Konnte nach Spaziergang besser abschalten..."
              className="w-full px-3.5 py-2.5 bg-emerald-50/30 border border-emerald-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-emerald-950"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            Check-in speichern
          </button>
        </form>
      )}
    </div>
  );
}
