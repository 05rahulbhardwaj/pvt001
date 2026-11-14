'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_ACCOUNTS } from '@/lib/mockData';
import { Heart, Stethoscope, UserCheck, Shield, ArrowRight, UserPlus, Sparkles, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import NewMemberSurveyModal from '@/components/NewMemberSurveyModal';
import DoctorLoginModal from '@/components/DoctorLoginModal';

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'practitioner'>('patient');
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [targetStaffRole, setTargetStaffRole] = useState<'doctor' | 'practitioner'>('doctor');

  const currentDemoUser = DEMO_ACCOUNTS.find(a => a.role === selectedRole)!;

  const handleRoleSelect = (role: 'patient' | 'doctor' | 'practitioner') => {
    setSelectedRole(role);
  };

  const handleProceed = (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedRole === 'patient') {
      router.push('/patient');
    } else {
      // Prompt for dummy credentials 'doctor' / 'doctor'
      setTargetStaffRole(selectedRole);
      setIsLoginModalOpen(true);
    }
  };

  const handleStaffLoginSuccess = () => {
    setIsLoginModalOpen(false);
    if (targetStaffRole === 'doctor') {
      router.push('/doctor');
    } else {
      router.push('/practitioner');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative">
      {/* Top Language Toggle Header */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <div className="flex items-center bg-white border border-emerald-200 rounded-xl p-1 shadow-2xs text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLanguage('de')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'de'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            🇩🇪 DE
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'en'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            🇬🇧 EN
          </button>
        </div>
      </div>

      {/* Brand Header */}
      <div className="text-center max-w-md mb-6 sm:mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md mb-3.5">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-emerald-950 tracking-tight">
          {t.brandTitle}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-700 mt-1 max-w-sm mx-auto">
          {t.brandSubtitle}
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-lg space-y-4">
        {/* NEW MEMBER INTAKE SURVEY BUTTON (Requirement 4) */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-emerald-700/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-white/20 backdrop-blur-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Neuaufnahme
              </span>
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t.newMemberBtn}
            </h2>
            <p className="text-xs text-emerald-100/90 leading-tight">
              {t.newMemberSub}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSurveyOpen(true)}
            className="px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all self-start sm:self-auto flex-shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Survey starten</span>
          </button>
        </div>

        {/* Role Selection Box */}
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5 p-5 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              {t.roleSelection}
            </span>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {t.protectedAccess}
            </span>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => handleRoleSelect('patient')}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all ${
                selectedRole === 'patient'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <Heart className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
              <span className="text-xs font-semibold block">{t.patient}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('doctor')}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all relative ${
                selectedRole === 'doctor'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <div className="relative">
                <Stethoscope className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <Lock className="w-2.5 h-2.5 text-emerald-700 absolute -top-1 -right-1" />
              </div>
              <span className="text-xs font-semibold block">{t.doctor}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('practitioner')}
              className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all relative ${
                selectedRole === 'practitioner'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                  : 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <div className="relative">
                <UserCheck className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <Lock className="w-2.5 h-2.5 text-emerald-700 absolute -top-1 -right-1" />
              </div>
              <span className="text-xs font-semibold block">{t.practitioner}</span>
            </button>
          </div>

          {/* Selected Account Card Preview */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 mb-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">
                {t.loggedInAs}
              </span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-800 font-bold uppercase">
                {selectedRole === 'patient' ? t.patient : selectedRole === 'doctor' ? t.doctor : t.practitioner}
              </span>
            </div>
            <div className="font-bold text-emerald-950 text-sm">{currentDemoUser.name}</div>
            <div className="text-xs text-emerald-700">
              {selectedRole === 'patient'
                ? t.patientRoleName
                : selectedRole === 'doctor'
                ? t.doctorRoleName
                : t.practitionerRoleName}
            </div>
            {currentDemoUser.clinic && (
              <div className="text-[11px] text-emerald-800 font-medium">📍 {currentDemoUser.clinic}</div>
            )}
            <div className="text-[11px] text-emerald-600/80 font-mono">{currentDemoUser.email}</div>

            {selectedRole !== 'patient' && (
              <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
                <span className="flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Passwort-Schutz aktiv
                </span>
                <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-mono font-semibold">
                  doctor / doctor
                </span>
              </div>
            )}
          </div>

          {/* Login / Open Button */}
          <button
            type="button"
            onClick={handleProceed}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <span>
              {selectedRole === 'patient'
                ? t.openAs.replace('{role}', t.patient)
                : selectedRole === 'doctor'
                ? t.openAs.replace('{role}', t.doctor)
                : t.openAs.replace('{role}', t.practitioner)}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Role Privileges Explanation */}
          <div className="mt-5 pt-4 border-t border-emerald-100 text-xs text-emerald-700 space-y-2">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                {selectedRole === 'patient'
                  ? t.patientDesc
                  : selectedRole === 'doctor'
                  ? t.doctorDesc
                  : t.practitionerDesc}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-emerald-700/70 mt-6 sm:mt-8 text-center max-w-sm">
        {t.footerText}
      </p>

      {/* New Member Intake Survey Modal */}
      <NewMemberSurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
      />

      {/* Doctor / Practitioner Dummy Login Modal */}
      <DoctorLoginModal
        isOpen={isLoginModalOpen}
        role={targetStaffRole}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleStaffLoginSuccess}
      />
    </div>
  );
}
