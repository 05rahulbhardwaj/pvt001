'use client';

import React from 'react';
import RoleHeader from '@/components/RoleHeader';
import PractitionerPortal from '@/components/PractitionerPortal';
import { DEMO_ACCOUNTS } from '@/lib/mockData';

export default function PractitionerPage() {
  const pracUser = DEMO_ACCOUNTS.find(a => a.role === 'practitioner')!;

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#1C2E24] flex flex-col">
      <RoleHeader 
        title="Oversight- & Reviewer-Portal" 
        roleName="Klinische Psychologin & RLHF Reviewerin" 
        userName={pracUser.name} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <PractitionerPortal user={pracUser} />
      </main>
    </div>
  );
}
