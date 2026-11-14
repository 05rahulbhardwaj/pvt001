'use client';

import React, { useState } from 'react';
import { UserSession, PatientRecord } from '@/types/auth';
import { INITIAL_PATIENTS } from '@/lib/mockData';
import { 
  FileText, 
  FastForward, 
  Download, 
  Calendar, 
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DoctorPortalProps {
  user: UserSession;
}

export default function DoctorPortal({ user }: DoctorPortalProps) {
  const { language, t } = useLanguage();
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [clinicalBrief, setClinicalBrief] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveSoonerAppointment = (patientId: string) => {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          appointmentFastTracked: true,
          allocatedDate: language === 'de' ? 'Nächste Woche (vorgezogen)' : 'Next week (fast-tracked)',
          severityStatus: 'beobachten',
        };
      }
      return p;
    }));
    showToast(language === 'de' 
      ? 'Priorisierter Termin genehmigt! Patient wurde für nächste Woche vorgezogen.'
      : 'Fast-track appointment approved! Patient scheduled for next week.'
    );
  };

  const handleGenerateAndExportSummary = async (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setGeneratingReport(true);
    setClinicalBrief(null);

    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientProfile: {
            primary_concerns: patient.primaryConcerns,
            interaction_style: patient.interactionStyle,
            waitlist_duration_weeks: patient.waitWeeks,
          },
          moodHistory: [{ mood_score: 3 }, { mood_score: 4 }, { mood_score: 3 }, { mood_score: 5 }],
          messageCount: patient.totalChats,
        }),
      });
      const data = await res.json();
      setClinicalBrief(data.summary || (language === 'de' ? 'Zusammenfassung konnte nicht geladen werden.' : 'Could not load summary.'));
    } catch {
      setClinicalBrief(language === 'de' ? 'Fehler beim Abruf des Vorab-Berichts.' : 'Error generating clinical brief.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const filtered = patients.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.pseudonym.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.primaryConcerns.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchFilter = filterSeverity === 'all' || p.severityStatus === filterSeverity;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 sm:p-4 bg-emerald-800 text-white rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-100 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-xl font-bold text-emerald-950">
              {t.doctorPortalTitle}
            </h1>
            <span className="text-[10px] sm:text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {t.doctor}
            </span>
          </div>
          <p className="text-xs text-emerald-700 mt-1">
            {t.loggedInAs} <span className="font-semibold">{user.name}</span> • {user.clinic}
          </p>
        </div>

        {/* Quick Triage Stats - Responsive Grid */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3">
          <div className="px-3.5 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">{t.statTotal}</span>
            <span className="text-sm sm:text-base font-bold text-emerald-950">{patients.length}</span>
          </div>
          <div className="px-3.5 py-2 bg-rose-50 rounded-2xl border border-rose-100 text-center">
            <span className="text-[10px] text-rose-700 font-bold uppercase block">{t.statCritical}</span>
            <span className="text-sm sm:text-base font-bold text-rose-700">
              {patients.filter(p => p.severityStatus === 'kritisch' || p.severityStatus === 'dringend').length}
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter */}
      <div className="bg-white rounded-2xl border border-emerald-100 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-2.5 sm:top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPatientPlaceholder}
            className="w-full pl-9 pr-3.5 py-2 bg-emerald-50/40 border border-emerald-200 rounded-xl text-xs text-emerald-950 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold text-emerald-800 whitespace-nowrap">{t.thSeverity}:</span>
          {(['all', 'kritisch', 'dringend', 'beobachten', 'stabil'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {sev === 'all'
                ? t.allSeverities
                : sev === 'kritisch'
                ? (language === 'de' ? 'Kritisch' : 'Critical')
                : sev === 'dringend'
                ? (language === 'de' ? 'Dringend' : 'Urgent')
                : sev === 'beobachten'
                ? (language === 'de' ? 'Beobachten' : 'Monitor')
                : (language === 'de' ? 'Stabil' : 'Stable')}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Card Grid - Fully Responsive */}
      <div className="space-y-3">
        {filtered.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
          >
            {/* Left: Patient info */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="font-bold text-sm text-emerald-950">{patient.pseudonym}</span>
                {patient.severityStatus === 'kritisch' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    {language === 'de' ? 'Kritisch (Akut)' : 'Critical (Acute)'}
                  </span>
                )}
                {patient.severityStatus === 'dringend' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {language === 'de' ? 'Dringend' : 'Urgent'}
                  </span>
                )}
                {patient.severityStatus === 'beobachten' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    {language === 'de' ? 'Beobachten' : 'Monitor'}
                  </span>
                )}
                {patient.severityStatus === 'stabil' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {language === 'de' ? 'Stabil' : 'Stable'}
                  </span>
                )}
                {patient.appointmentFastTracked && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ⚡ {t.btnFastTrackDone}
                  </span>
                )}
              </div>

              <div className="text-xs text-emerald-700">{patient.fullName}</div>

              <div className="flex flex-wrap gap-1 pt-1">
                {patient.primaryConcerns.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] border border-emerald-100 font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Middle: Stats */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs text-emerald-900 border-t md:border-t-0 md:border-l border-emerald-100 pt-2.5 md:pt-0 md:pl-5">
              <div>
                <span className="text-[10px] text-emerald-700 block">{t.thWaitWeeks}</span>
                <span className="font-bold">{patient.waitWeeks} {language === 'de' ? 'Wochen' : 'wks'}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 block">Risk Score</span>
                <span className="font-bold">{(patient.riskScore * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-700 block">{t.thScheduled}</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  {patient.allocatedDate}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 pt-2 md:pt-0">
              {!patient.appointmentFastTracked && (patient.severityStatus === 'kritisch' || patient.severityStatus === 'dringend') && (
                <button
                  type="button"
                  onClick={() => handleApproveSoonerAppointment(patient.id)}
                  className="px-3 sm:px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{t.btnFastTrack}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleGenerateAndExportSummary(patient)}
                className="px-3 sm:px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.btnExportSummary}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal or Inline Viewer */}
      {(generatingReport || clinicalBrief) && selectedPatient && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-4 sm:p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-100 pb-4 gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-emerald-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{t.modalClinicalSummaryTitle}: {selectedPatient.pseudonym}</span>
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {t.modalClinicalSummaryDesc}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  alert(language === 'de'
                    ? `PDF-Bericht für ${selectedPatient.pseudonym} wurde generiert und an Ihr Praxisverwaltungssystem übermittelt.`
                    : `PDF report for ${selectedPatient.pseudonym} generated and forwarded to Practice Management System.`
                  );
                }}
                disabled={generatingReport}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.modalPrint}</span>
              </button>
              <button
                type="button"
                onClick={() => setClinicalBrief(null)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                {t.modalClose}
              </button>
            </div>
          </div>

          {generatingReport ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-emerald-800 font-medium">
                {t.generatingSummary}
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-xs text-emerald-950 leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto font-mono sm:font-sans">
              {clinicalBrief}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
