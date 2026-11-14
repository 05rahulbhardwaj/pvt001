'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoleHeader from '@/components/RoleHeader';
import PractitionerPortal from '@/components/PractitionerPortal';
import { DEMO_ACCOUNTS } from '@/lib/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { Lock, UserCheck, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PractitionerPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const pracUser = DEMO_ACCOUNTS.find(a => a.role === 'practitioner')!;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = sessionStorage.getItem('magdehack_auth_practitioner');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    } catch {
      // Ignore
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().toLowerCase() === 'doctor' && password === 'doctor') {
      try {
        sessionStorage.setItem('magdehack_auth_practitioner', 'true');
      } catch {
        // Ignore
      }
      setIsAuthenticated(true);
    } else {
      setError(t.invalidCreds);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, show clinical login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-emerald-100 shadow-xl p-6 sm:p-8 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-emerald-950">{t.loginModalTitle}</h2>
            <p className="text-xs text-emerald-700">{t.loginModalSub}</p>
          </div>

          {/* Hint Badge */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{t.dummyHint}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('doctor');
                setPassword('doctor');
              }}
              className="text-[11px] text-emerald-700 underline font-semibold cursor-pointer"
            >
              Auto-fill
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                {t.usernameLabel}
              </label>
              <input
                type="text"
                required
                placeholder="doctor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-950 mb-1">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <Lock className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-xs text-emerald-700 hover:text-emerald-950 font-medium underline cursor-pointer"
            >
              {t.backToHome}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#1C2E24] flex flex-col">
      <RoleHeader 
        title={t.practitionerPortalTitle} 
        roleName={t.practitionerRoleName} 
        userName={pracUser.name} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        <PractitionerPortal user={pracUser} />
      </main>
    </div>
  );
}
