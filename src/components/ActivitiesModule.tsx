'use client';

import React, { useState } from 'react';
import { Wind, Anchor, BookOpen, PenTool, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ActivitiesModule() {
  const { language, t } = useLanguage();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const activities = [
    {
      id: 'act-1',
      title: language === 'de' ? '4-7-8 Atemregulation' : '4-7-8 Breathing Regulation',
      desc: language === 'de'
        ? 'Beruhigt das vegetative Nervensystem bei akuter Anspannung oder Grübeln.'
        : 'Soothes the autonomic nervous system during acute tension or racing thoughts.',
      duration: '4 Min.',
      category: language === 'de' ? 'Atemübung' : 'Breathing',
      icon: Wind,
    },
    {
      id: 'act-2',
      title: language === 'de' ? '5-4-3-2-1 Sinnes-Erdung' : '5-4-3-2-1 Sensory Grounding',
      desc: language === 'de'
        ? 'Bringt Sie zurück in die Gegenwart bei Reizüberflutung oder Panikempfinden.'
        : 'Anchors you back into the present moment during sensory overload or panic.',
      duration: '3 Min.',
      category: language === 'de' ? 'Erdung' : 'Grounding',
      icon: Anchor,
    },
    {
      id: 'act-3',
      title: language === 'de' ? 'Psychoedukation: Das Angstfenster' : 'Psychoeducation: The Anxiety Window',
      desc: language === 'de'
        ? 'Warum Symptome in der Wartezeit schwanken und wie man Erwartungsangst abbaut.'
        : 'Why symptoms fluctuate during wait periods and how to defuse anticipatory fear.',
      duration: '6 Min.',
      category: language === 'de' ? 'Wissen' : 'Education',
      icon: BookOpen,
    },
    {
      id: 'act-4',
      title: language === 'de' ? 'Drei-Punkte-Entlastungstagebuch' : 'Three-Point Relief Journal',
      desc: language === 'de'
        ? 'Strukturiertes Aufschreiben vor dem Schlafen gegen nächtliche Unruhe.'
        : 'Structured bedtime note taking to calm nocturnal rumination.',
      duration: '5 Min.',
      category: language === 'de' ? 'Journaling' : 'Journaling',
      icon: PenTool,
    },
  ];

  const toggleComplete = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-emerald-950 text-sm sm:text-base">{t.activitiesTitle}</h3>
          <p className="text-xs text-emerald-700">{t.activitiesSubtitle}</p>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map(act => {
          const Icon = act.icon;
          const isDone = !!completed[act.id];

          return (
            <div
              key={act.id}
              onClick={() => toggleComplete(act.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-300 opacity-80'
                  : 'bg-white border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isDone ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs sm:text-sm font-semibold ${isDone ? 'line-through text-emerald-800' : 'text-emerald-950'}`}>
                      {act.title}
                    </h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                      {act.category}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700/90 mt-1 leading-snug">
                    {act.desc}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium mt-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{act.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                  isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-emerald-200 bg-emerald-50/50'
                }`}>
                  {isDone && <CheckCircle className="w-4 h-4" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
