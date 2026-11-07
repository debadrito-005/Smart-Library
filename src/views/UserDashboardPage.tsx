import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Search,
  Clock,
  FileText,
  FolderGit2,
  Presentation as PresentationIcon,
  PlayCircle,
  Calendar,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { api } from '../services/api';
import { User, LibrarySession, ResearchPaper, ProjectReport, Presentation } from '../types';

interface UserDashboardPageProps {
  onNavigate: (view: string, extraData?: any) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const [searchId, setSearchId] = useState('LIB-2026-10024');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<LibrarySession | null>(null);
  const [sessions, setSessions] = useState<LibrarySession[]>([]);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [projects, setProjects] = useState<ProjectReport[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUserData = async (regId: string) => {
    if (!regId.trim()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.lookupUser(regId.trim());
      if (res.success && res.user) {
        setUser(res.user);
        setActiveSession(res.activeSession || null);
        setSessions(res.recentSessions || []);
        setPapers(res.documents?.papers || []);
        setProjects(res.documents?.projects || []);
        setPresentations(res.documents?.presentations || []);
      } else {
        setErrorMsg(res.message || 'Reader record not found.');
        setUser(null);
      }
    } catch (e: any) {
      setErrorMsg('Failed to retrieve user portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('smart_library_active_reg_id') || 'LIB-2026-10024';
    setSearchId(saved);
    fetchUserData(saved);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reader Portal & Portfolio</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal portal for verified library readers, research scholars, and academic faculty.
          </p>
        </div>

        {/* Reader ID switcher */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Registration ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && fetchUserData(searchId)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono uppercase text-slate-900"
          />
          <button
            onClick={() => fetchUserData(searchId)}
            className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Switch Reader
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {errorMsg}
        </div>
      )}

      {user && (
        <>
          {/* Profile Overview Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-900/60 border border-blue-700/60 text-blue-300 text-xs font-mono">
                  <span>ID: {user.registrationId}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>{user.department}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-blue-300 font-medium">{user.position}</span>
                  <span className="text-slate-500">·</span>
                  <span>Registered: {user.createdAtIST}</span>
                  <span className="text-slate-500">·</span>
                  <span>Cycle #{user.cycleNumber}</span>
                </div>
              </div>

              {/* Status and Action */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {activeSession ? (
                  <div className="bg-emerald-950/80 border border-emerald-700 p-3 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Active Session Running</span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      Desk: {activeSession.workstation || 'Reading Carrel'}
                    </div>
                    <button
                      onClick={() => onNavigate('library-login', { prefilledRegId: user.registrationId })}
                      className="mt-2 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      View Live Countdown Timer →
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onNavigate('library-login', { prefilledRegId: user.registrationId })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Check-in to Reading Hall</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User Portfolio Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Recorded Library Sessions</div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {sessions.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)} total minutes logged
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Research Manuscripts</div>
              <div className="text-2xl font-bold text-purple-700 font-mono tabular-nums mt-1">
                {papers.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {papers.filter((p) => p.communicationStatus === 'Communicated').length} Communicated
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Project Reports</div>
              <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-1">
                {projects.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Dissertations archived</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Presentation Decks</div>
              <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
                {presentations.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Seminars & colloquia</div>
            </div>
          </div>

          {/* Research Documents Vault for This User */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User's Papers */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>My Research Papers ({papers.length})</span>
                </h3>
                <button
                  onClick={() => onNavigate('papers')}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  Upload New →
                </button>
              </div>

              {papers.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No research papers uploaded under this ID yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {papers.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div className="font-semibold text-slate-900 leading-snug">{p.title}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span className="font-medium text-slate-700">{p.researchDomain}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            p.communicationStatus === 'Communicated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.communicationStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User's Library Sessions History */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Recent Reading Sessions ({sessions.length})</span>
                </h3>
                <button
                  onClick={() => onNavigate('library-login', { prefilledRegId: user.registrationId })}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  Check In →
                </button>
              </div>

              {sessions.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No study sessions recorded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {sessions.slice(0, 5).map((s) => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {s.purpose || 'Academic Study Session'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {s.startTimeIST} · {s.workstation}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800 text-xs block">
                          {s.durationMinutes} min
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            s.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
