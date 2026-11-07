import React, { useEffect, useState, useRef } from 'react';
import {
  PlayCircle,
  StopCircle,
  Clock,
  User,
  GraduationCap,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
  RotateCcw,
  BookOpen,
  QrCode,
} from 'lucide-react';
import { api } from '../services/api';
import { User as UserType, LibrarySession } from '../types';

interface SessionLoginPageProps {
  initialRegId?: string;
  onOpenScanner: () => void;
  onNavigate: (view: string) => void;
}

export const SessionLoginPage: React.FC<SessionLoginPageProps> = ({
  initialRegId = '',
  onOpenScanner,
  onNavigate,
}) => {
  const [registrationIdInput, setRegistrationIdInput] = useState(initialRegId);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // User details retrieved from DB
  const [verifiedUser, setVerifiedUser] = useState<UserType | null>(null);

  // Active Session state & persistent countdown
  const [activeSession, setActiveSession] = useState<LibrarySession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState<number>(3 * 3600); // 3 hours default
  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(3);
  const [workstationInput, setWorkstationInput] = useState('Reading Carrel A-12');
  const [purposeInput, setPurposeInput] = useState('Research & Academic Study');

  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [concludedSession, setConcludedSession] = useState<LibrarySession | null>(null);

  // Countdown timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check saved session on mount or when initialRegId changes
  useEffect(() => {
    const targetId = initialRegId || localStorage.getItem('smart_library_active_reg_id') || '';
    if (targetId) {
      setRegistrationIdInput(targetId);
      handleLookup(targetId);
    }
  }, [initialRegId]);

  // Synchronize countdown timer
  useEffect(() => {
    if (!activeSession) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Compute remaining time from scheduledEndTime against real current time
    const syncRemaining = () => {
      const scheduledEnd = new Date(activeSession.scheduledEndTime).getTime();
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((scheduledEnd - now) / 1000));
      setRemainingSeconds(diffSecs);

      const start = new Date(activeSession.startTime).getTime();
      const totalSec = Math.max(1, Math.floor((scheduledEnd - start) / 1000));
      setTotalSessionSeconds(totalSec);

      if (diffSecs <= 0) {
        // Session expired
        if (timerRef.current) clearInterval(timerRef.current);
        // Prompt re-check with backend
        api.getCurrentSession(activeSession.registrationId).then((res) => {
          if (!res.hasActiveSession) {
            setActiveSession(null);
            localStorage.removeItem('smart_library_active_reg_id');
          }
        });
      }
    };

    syncRemaining();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          syncRemaining();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  // LOOKUP USER BY REGISTRATION ID (QR-2 step 2 & 3)
  const handleLookup = async (idToLookUp?: string) => {
    const cleanId = (idToLookUp || registrationIdInput).trim();
    if (!cleanId) {
      setLookupError('Please enter your Registration ID.');
      return;
    }

    setLookupError(null);
    setIsLoadingUser(true);
    setConcludedSession(null);

    try {
      const res = await api.lookupUser(cleanId);
      if (res.success && res.user) {
        setVerifiedUser(res.user);
        if (res.activeSession) {
          setActiveSession(res.activeSession);
          localStorage.setItem('smart_library_active_reg_id', res.user.registrationId);
        } else {
          setActiveSession(null);
        }
      } else {
        setVerifiedUser(null);
        setActiveSession(null);
        setLookupError(res.message || `Registration ID "${cleanId}" not found in database.`);
      }
    } catch (err: any) {
      setLookupError('Server error retrieving registration information.');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // START LIBRARY SESSION (QR-2 step 5 & 6)
  const handleStartSession = async () => {
    if (!verifiedUser) return;
    setIsStartingSession(true);
    setLookupError(null);

    try {
      const res = await api.startSession({
        registrationId: verifiedUser.registrationId,
        durationHours: selectedDurationHours,
        purpose: purposeInput,
        workstation: workstationInput,
      });

      if (res.success && res.session) {
        setActiveSession(res.session);
        localStorage.setItem('smart_library_active_reg_id', verifiedUser.registrationId);
      } else {
        setLookupError(res.message || 'Failed to start session.');
      }
    } catch (err: any) {
      setLookupError('Network error starting library session.');
    } finally {
      setIsStartingSession(false);
    }
  };

  // END LIBRARY SESSION (QR-2 step 8, 9, 10)
  const handleEndSession = async () => {
    if (!activeSession) return;
    setIsEndingSession(true);

    try {
      const res = await api.endSession({
        sessionId: activeSession.id,
        registrationId: activeSession.registrationId,
      });

      if (res.success && res.session) {
        setConcludedSession(res.session);
        setActiveSession(null);
        localStorage.removeItem('smart_library_active_reg_id');
      } else {
        setLookupError(res.message || 'Failed to conclude library session.');
      }
    } catch (err: any) {
      setLookupError('Network error ending session.');
    } finally {
      setIsEndingSession(false);
    }
  };

  const formatHHMMSS = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const progressPercent = totalSessionSeconds > 0
    ? Math.max(0, Math.min(100, Math.round(((totalSessionSeconds - remainingSeconds) / totalSessionSeconds) * 100)))
    : 0;

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
          <span>QR CODE 2 · OFFICIAL DESTINATION</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Library Session & Verification Station</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Scan QR Code 2 at reading hall terminals, validate your Registration ID, and initiate your verified library study session.
        </p>
      </div>

      {/* Lookup Bar (Step 2) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <label htmlFor="reg-id-input" className="block text-xs font-semibold text-slate-800 mb-2">
          Enter or Scan Registration ID
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="reg-id-input"
              type="text"
              placeholder="e.g. LIB-2026-10024"
              value={registrationIdInput}
              onChange={(e) => setRegistrationIdInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLookup();
              }}
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white uppercase tracking-wider"
            />
            {registrationIdInput && (
              <button
                type="button"
                onClick={() => setRegistrationIdInput('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={isLoadingUser}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLoadingUser ? 'Verifying...' : 'Validate ID'}</span>
          </button>

          <button
            onClick={onOpenScanner}
            title="Scan with Camera"
            className="p-2.5 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-700"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Fast Fill */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Need a sample reader ID?</span>
          <button
            onClick={() => {
              setRegistrationIdInput('LIB-2026-10024');
              handleLookup('LIB-2026-10024');
            }}
            className="text-blue-700 hover:text-blue-800 font-medium font-mono text-[11px]"
          >
            Load Debadrito Chakraborty (LIB-2026-10024)
          </button>
        </div>

        {lookupError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{lookupError}</p>
              <button
                onClick={() => onNavigate('register')}
                className="text-blue-700 hover:underline mt-1 font-medium block"
              >
                Click here to Register with QR-1 first →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 4: Personalized Welcome Message & Verified User Card */}
      {verifiedUser && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          {/* Exact requirement formatted welcome card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-mono tracking-widest uppercase text-blue-300">
                  VERIFIED READER CREDENTIAL
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Welcome, {verifiedUser.fullName}!
                </h2>
                <div className="text-xs text-slate-300 space-y-0.5 pt-1">
                  <div>
                    <span className="text-slate-400">Department:</span> {verifiedUser.department}
                  </div>
                  <div>
                    <span className="text-slate-400">Position:</span> {verifiedUser.position}
                  </div>
                  <div className="font-mono text-[11px] text-blue-300 pt-0.5">
                    ID: {verifiedUser.registrationId}
                  </div>
                </div>
              </div>

              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <GraduationCap className="w-6 h-6 text-blue-300" />
              </div>
            </div>
          </div>

          {/* ACTIVE COUNTDOWN SESSION (Step 6, 7, 8, 11) */}
          {activeSession ? (
            <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-lg space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    Session In Progress · Persistent Server Sync
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Started: {activeSession.startTimeIST}
                </div>
              </div>

              {/* Countdown Display: Hours, Minutes, Seconds */}
              <div className="text-center py-4">
                <div className="text-[11px] uppercase font-mono tracking-widest text-slate-400 mb-1">
                  REMAINING SESSION TIME
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-widest tabular-nums text-shadow-sm">
                  {formatHHMMSS(remainingSeconds)}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-2">
                  <span>Scheduled Expiry:</span>
                  <span className="font-mono text-blue-300">
                    {new Intl.DateTimeFormat('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    }).format(new Date(activeSession.scheduledEndTime))}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Session Meta */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-lg text-xs border border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[10px] block">Desk / Workstation</span>
                  <span className="font-medium text-slate-200">{activeSession.workstation || 'Reading Carrel'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Research Focus</span>
                  <span className="font-medium text-slate-200 truncate block">{activeSession.purpose || 'Study'}</span>
                </div>
              </div>

              {/* Persistence Guarantee Notice */}
              <p className="text-[11px] text-slate-400 text-center">
                Refreshed your browser? Your timer automatically resumes from the server-recorded expiration time.
              </p>

              {/* End Session Button (Step 8) */}
              <div className="pt-2">
                <button
                  onClick={handleEndSession}
                  disabled={isEndingSession}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>{isEndingSession ? 'Concluding Session...' : 'END SESSION'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* START SESSION CONTROLS (Step 5) */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration-select" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Session Duration Limit
                  </label>
                  <select
                    id="duration-select"
                    value={selectedDurationHours}
                    onChange={(e) => setSelectedDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                  >
                    <option value={1}>1 Hour (Quick Reference)</option>
                    <option value={2}>2 Hours (Standard Study)</option>
                    <option value={3}>3 Hours (Default Research Session)</option>
                    <option value={4}>4 Hours (Extended Reading)</option>
                    <option value={6}>6 Hours (Scholar Deep Work)</option>
                    <option value={8}>8 Hours (Maximum Daily Cap)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="workstation-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Assigned Desk / Station
                  </label>
                  <input
                    id="workstation-input"
                    type="text"
                    value={workstationInput}
                    onChange={(e) => setWorkstationInput(e.target.value)}
                    placeholder="e.g. Carrel C-14, Terminal 03"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="purpose-input" className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Research Topic / Study Purpose
                </label>
                <input
                  id="purpose-input"
                  type="text"
                  value={purposeInput}
                  onChange={(e) => setPurposeInput(e.target.value)}
                  placeholder="e.g. Thesis Preparation, Journal Paper Review"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartSession}
                  disabled={isStartingSession}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>{isStartingSession ? 'Activating Timer...' : 'START SESSION'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Concluded Session Summary Card */}
      {concludedSession && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Session Concluded & Stored in Database</h3>
              <p className="text-xs text-slate-500">Your total study credits have been permanently updated.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg text-xs border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block">Duration</span>
              <span className="font-semibold text-slate-900 font-mono text-sm">
                {concludedSession.durationMinutes} min
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Status</span>
              <span className="font-semibold text-emerald-700">{concludedSession.status}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Check-in</span>
              <span className="text-slate-700 text-[11px] font-mono">{concludedSession.startTimeIST.split(',')[1]}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Check-out</span>
              <span className="text-slate-700 text-[11px] font-mono">
                {concludedSession.actualEndTimeIST ? concludedSession.actualEndTimeIST.split(',')[1] : 'Just now'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                setConcludedSession(null);
                handleLookup();
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
            >
              Start Another Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
