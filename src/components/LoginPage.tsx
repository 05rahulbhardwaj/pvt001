'use client';

import React, { useState } from 'react';
import { UserSession } from '@/types/auth';
import { DEMO_ACCOUNTS } from '@/lib/mockData';
import { Heart, Stethoscope, UserCheck, Shield, ArrowRight, Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserSession) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'practitioner'>('patient');

  const currentDemoUser = DEMO_ACCOUNTS.find(a => a.role === selectedRole)!;

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="text-center max-w-md mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md mb-4">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-950 tracking-tight">Brücke • MagdeHack</h1>
        <p className="text-sm text-emerald-700 mt-1">
          Digitale Begleit-Plattform für Psychotherapie-Wartezeiten
        </p>
      </div>

      {/* Role Selection Box */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Rollen-Auswahl</span>
          <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Geschützter Zugang
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole('patient')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedRole === 'patient'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <Heart className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
            <span className="text-xs font-semibold block">Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('doctor')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedRole === 'doctor'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <Stethoscope className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
            <span className="text-xs font-semibold block">Arzt / Klinik</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('practitioner')}
            className={`p-3 rounded-2xl border text-center transition-all ${
              selectedRole === 'practitioner'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
            }`}
          >
            <UserCheck className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
            <span className="text-xs font-semibold block">Reviewer</span>
          </button>
        </div>

        {/* Selected Account Card Preview */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Angemeldeter Account:</span>
            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-800 font-bold uppercase">
              {currentDemoUser.role}
            </span>
          </div>
          <div className="font-bold text-emerald-950 text-sm">{currentDemoUser.name}</div>
          <div className="text-xs text-emerald-700">{currentDemoUser.title}</div>
          {currentDemoUser.clinic && (
            <div className="text-[11px] text-emerald-800 font-medium">📍 {currentDemoUser.clinic}</div>
          )}
          <div className="text-[11px] text-emerald-600/80 pt-1 font-mono">{currentDemoUser.email}</div>
        </div>

        {/* Login Button */}
        <button
          onClick={() => onLogin(currentDemoUser)}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
        >
          <span>Als {currentDemoUser.role === 'patient' ? 'Patient' : currentDemoUser.role === 'doctor' ? 'Arzt / Fachklinik' : 'Practitioner'} einloggen</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Role Privileges Explanation */}
        <div className="mt-6 pt-5 border-t border-emerald-100 text-xs text-emerald-700 space-y-2">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              {selectedRole === 'patient' && 'Direkter Zugriff auf Clara KI-Begleitung, Tagebuch und Notfall-Hilfen.'}
              {selectedRole === 'doctor' && 'Klinik-Übersicht: Triage, Schweregrade, Vorab-Termin-Freigabe & Export.'}
              {selectedRole === 'practitioner' && 'Oversight-Portal: Überprüfung von KI-Chatlogs, Chat-Bewertung & Validierung.'}
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-emerald-700/70 mt-8 text-center">
        MagdeHack 2026 • DSGVO-konforme Rollen-Trennung nach klinischem Sicherheitsstandard
      </p>
    </div>
  );
}
