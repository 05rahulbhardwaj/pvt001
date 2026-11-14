'use client';

import React, { useState } from 'react';
import { Wind, Anchor, BookOpen, PenTool, CheckCircle, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  title: string;
  desc: string;
  duration: string;
  category: string;
  icon: React.ElementType;
}

export default function ActivitiesModule() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      title: '4-7-8 Atemregulation',
      desc: 'Beruhigt das vegetative Nervensystem bei akuter Anspannung oder Grübeln.',
      duration: '4 Min.',
      category: 'Atemübung',
      icon: Wind,
    },
    {
      id: 'act-2',
      title: '5-4-3-2-1 Sinnes-Erdung',
      desc: 'Bringt Sie zurück in die Gegenwart bei Reizüberflutung oder Panikempfinden.',
      duration: '3 Min.',
      category: 'Erdung',
      icon: Anchor,
    },
    {
      id: 'act-3',
      title: 'Psychoedukation: Das Angstfenster',
      desc: 'Warum Symptome in der Wartezeit schwanken und wie man Erwartungsangst abbaut.',
      duration: '6 Min.',
      category: 'Wissen',
      icon: BookOpen,
    },
    {
      id: 'act-4',
      title: 'Drei-Punkte-Entlastungstagebuch',
      desc: 'Strukturiertes Aufschreiben vor dem Schlafen gegen nächtliche Unruhe.',
      duration: '5 Min.',
      category: 'Journaling',
      icon: PenTool,
    },
  ];

  const toggleComplete = (id: string) => {
    setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-emerald-950 text-base">Begleitende Übungen</h3>
          <p className="text-xs text-emerald-700">Evidenzbasierte Mikro-Interventionen</p>
        </div>
        <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
          Algorithmus-Empfehlung
        </span>
      </div>

      <div className="space-y-3">
        {activities.map((a) => {
          const Icon = a.icon;
          const isDone = completed[a.id];

          return (
            <div
              key={a.id}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200 opacity-75'
                  : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${isDone ? 'line-through text-emerald-900/60' : 'text-emerald-950'}`}>
                      {a.title}
                    </h4>
                    <p className="text-xs text-emerald-800/80 mt-0.5">{a.desc}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-emerald-700 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {a.duration}
                      </span>
                      <span>•</span>
                      <span>{a.category}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleComplete(a.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Erledigt' : 'Starten'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
