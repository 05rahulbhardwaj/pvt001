'use client';

import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle, ArrowRight, Stethoscope, UserCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DoctorLoginModalProps {
  isOpen: boolean;
  role: 'doctor' | 'practitioner';
  onClose: () => void;
  onSuccess: () => void;
}

export default function DoctorLoginModal({
  isOpen,
  role,
  onClose,
  onSuccess,
}: DoctorLoginModalProps) {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Hardcoded dummy ID and password check: 'doctor' / 'doctor'
    if (username.trim().toLowerCase() === 'doctor' && password === 'doctor') {
      try {
        sessionStorage.setItem(`magdehack_auth_${role}`, 'true');
      } catch {
        // Ignore
      }
      onSuccess();
    } else {
      setError(t.invalidCreds);
    }
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              {isDoctor ? (
                <Stethoscope className="w-5 h-5 text-white" />
              ) : (
                <UserCheck className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-emerald-950">
                {t.loginModalTitle}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {isDoctor ? t.doctor : t.practitioner}
              </span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-emerald-700 leading-relaxed">
            {t.loginModalSub}
          </p>

          {/* Hint Badge */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{t.dummyHint}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUsername('doctor');
                setPassword('doctor');
              }}
              className="text-[11px] text-emerald-700 underline font-semibold hover:text-emerald-900"
            >
              Auto-fill
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-emerald-950 mb-1">
              {t.usernameLabel}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                placeholder="doctor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-sm text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password */}
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

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
