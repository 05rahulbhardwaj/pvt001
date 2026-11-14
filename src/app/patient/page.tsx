'use client';

import React, { useState } from 'react';
import RoleHeader from '@/components/RoleHeader';
import ChatView from '@/components/ChatView';
import MoodTracker from '@/components/MoodTracker';
import ActivitiesModule from '@/components/ActivitiesModule';
import { Clock, ShieldCheck, MessageSquare, LineChart, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PatientPage() {
  const { t } = useLanguage();
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'mood' | 'activities'>('chat');

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#1C2E24] flex flex-col">
      <RoleHeader 
        title={t.brandTitle} 
        roleName={t.patientRoleName} 
        userName="Sarah M." 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Context Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-200/60 text-emerald-800 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-emerald-950">
                {t.waitBannerTitle}
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-700 mt-0.5">
                {t.waitBannerDesc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-emerald-800 bg-white px-3 sm:px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{t.dsgvoSafetyNote}</span>
          </div>
        </div>

        {/* Mobile View Switcher Tabs (Only visible on screens < lg) */}
        <div className="lg:hidden flex items-center bg-white p-1 rounded-2xl border border-emerald-200 shadow-2xs gap-1">
          <button
            type="button"
            onClick={() => setActiveMobileTab('chat')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeMobileTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.tabChat}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('mood')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeMobileTab === 'mood'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>{t.tabMood}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('activities')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeMobileTab === 'activities'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.tabActivities}</span>
          </button>
        </div>

        {/* Responsive Patient Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[720px]">
          {/* Chat Column */}
          <div className={`h-[560px] sm:h-[620px] lg:h-full lg:col-span-7 ${
            activeMobileTab === 'chat' ? 'block' : 'hidden lg:block'
          }`}>
            <ChatView />
          </div>

          {/* Side Column (Mood + Activities) */}
          <div className={`lg:col-span-5 flex flex-col gap-6 lg:overflow-y-auto lg:pr-1 ${
            activeMobileTab !== 'chat' ? 'block' : 'hidden lg:flex'
          }`}>
            <div className={activeMobileTab === 'mood' || activeMobileTab === 'chat' ? 'block' : 'hidden lg:block'}>
              <MoodTracker />
            </div>
            <div className={activeMobileTab === 'activities' || activeMobileTab === 'chat' ? 'block' : 'hidden lg:block'}>
              <ActivitiesModule />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
