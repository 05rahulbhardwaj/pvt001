'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  title: string;
  roleName: string;
  userName: string;
}

export default function RoleHeader({ title, roleName, userName }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    // Clear clinical authentication state
    try {
      sessionStorage.removeItem('magdehack_auth_doctor');
      sessionStorage.removeItem('magdehack_auth_practitioner');
    } catch {
      // Ignore
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <Link
            href="/"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm hover:bg-emerald-700 transition-colors flex-shrink-0"
          >
            <Heart className="w-5 h-5 fill-current" />
          </Link>
          <div className="min-w-0">
            <span className="font-bold text-base sm:text-lg tracking-tight text-emerald-950 truncate block">
              {title}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-medium hidden sm:block truncate -mt-0.5 sm:-mt-1">
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Right Actions: Language Switcher, User Info, Logout */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-xl p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLanguage('de')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'de'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60'
              }`}
              title="Deutsch"
            >
              DE
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === 'en'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* User & Role Details */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-emerald-950">{userName}</span>
            <span className="text-[10px] text-emerald-700">{roleName}</span>
          </div>

          {/* Logout Button */}
          <Link
            href="/"
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="hidden sm:inline">{t.logout}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
