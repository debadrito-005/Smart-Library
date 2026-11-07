import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  FileText,
  FolderGit2,
  Presentation as PresentationIcon,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  PlayCircle,
  StopCircle,
  BarChart3,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { DashboardStats, LibrarySession } from '../types';

interface AdminDashboardPageProps {
  onNavigate: (view: string) => void;
}

const COLORS = ['#1d4ed8', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#4b5563'];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeSessions, setActiveSessions] = useState<LibrarySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isRollingOver, setIsRollingOver] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, activeRes] = await Promise.all([
        api.getDashboardStats(),
        api.getActiveSessions(),
      ]);
      if (statsRes.success) setStats(statsRes);
      if (activeRes.success) setActiveSessions(activeRes.sessions);
    } catch (e) {
      console.error('Error fetching admin dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 20000); // 20s poll
    return () => clearInterval(interval);
  }, []);

  const handleRemoteEndSession = async (sessionId: string, userName: string) => {
    if (!confirm(`End session for reader "${userName}"?`)) return;
    try {
      const res = await api.endSession({ sessionId });
      if (res.success) {
        setNotification(`Session for ${userName} has been successfully closed.`);
        setTimeout(() => setNotification(null), 3000);
        fetchDashboard();
      }
    } catch (e) {
      console.error('Error ending session remotely:', e);
    }
  };

  const handleCycleRollover = async () => {
    if (!confirm('Manually roll over the 24-hour cycle now? (Existing records will remain permanently preserved)')) return;
    setIsRollingOver(true);
    try {
      const res = await api.rolloverCycle();
      if (res.success) {
        setNotification(res.message);
        setTimeout(() => setNotification(null), 4000);
        fetchDashboard();
      }
    } catch (e) {
      console.error('Error rolling over cycle:', e);
    } finally {
      setIsRollingOver(false);
    }
  };

  const kpis = stats?.kpis;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Administrative Intelligence Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time library usage telemetry, registration cycle tracking, and research repository metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.getUsersExportUrl()}
            download
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={handleCycleRollover}
            disabled={isRollingOver}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRollingOver ? 'animate-spin' : ''}`} />
            <span>Test 24h Rollover</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* MODULE 4: 9 OFFICIAL DASHBOARD METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Registered Users */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">1. Total Registered Users</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {kpis?.totalRegisteredUsers ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">All university scholars</div>
        </div>

        {/* 2. Today's Registrations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">2. Today's Registrations</div>
          <div className="text-2xl font-bold text-blue-600 font-mono tabular-nums mt-1">
            {kpis?.todayRegistrations ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Current 24h cycle window</div>
        </div>

        {/* 3. Active Library Sessions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">3. Active Sessions</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {kpis?.activeLibrarySessions ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Currently studying</div>
        </div>

        {/* 4. Completed Sessions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">4. Completed Sessions</div>
          <div className="text-2xl font-bold text-slate-700 font-mono tabular-nums mt-1">
            {kpis?.completedSessions ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Archived checkouts</div>
        </div>

        {/* 5. Total Research Papers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">5. Total Research Papers</div>
          <div className="text-2xl font-bold text-purple-700 font-mono tabular-nums mt-1">
            {kpis?.totalResearchPapers ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Academic manuscripts</div>
        </div>

        {/* 6. Communicated Papers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">6. Communicated Papers</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {kpis?.communicatedResearchPapers ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Journals & conferences</div>
        </div>

        {/* 7. Not Communicated Papers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">7. Not Communicated</div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {kpis?.notCommunicatedResearchPapers ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pre-submission stage</div>
        </div>

        {/* 8. Total Project Reports */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">8. Total Project Reports</div>
          <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-1">
            {kpis?.totalProjectReports ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Capstone & theses</div>
        </div>

        {/* 9. Total PPT Presentations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">9. PPT Presentations</div>
          <div className="text-2xl font-bold text-pink-700 font-mono tabular-nums mt-1">
            {kpis?.totalPresentations ?? '...'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Seminar decks</div>
        </div>

        {/* Avg Duration */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Avg Session Duration</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {kpis?.averageSessionDurationMinutes ?? 120}m
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Average reader stay</div>
        </div>
      </div>

      {/* MODULE 4: INTERACTIVE CHARTS & ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Registration & Session Velocity (Daily / Weekly / Monthly) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registration & Session Analytics</h3>
              <p className="text-xs text-slate-500">Trend of reader intake and completed sessions over time</p>
            </div>

            {/* Timeframe switch */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  activeTab === 'daily' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily (7D)
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  activeTab === 'weekly' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Weekly (4W)
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  activeTab === 'monthly' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly (6M)
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'daily' ? (
                <BarChart data={stats?.charts.dailyRegistrations || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="registrations" name="New Registrations" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sessions" name="Sessions Logged" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : activeTab === 'weekly' ? (
                <BarChart data={stats?.charts.weeklyRegistrations || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="registrations" name="Registrations" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="researchUploads" name="Research Papers" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={stats?.charts.monthlyRegistrations || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="registrations" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 3 }} name="Registrations" />
                  <Line type="monotone" dataKey="papers" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3 }} name="Research Papers" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-Wise Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Distribution</h3>
            <p className="text-xs text-slate-500">Registration shares across colleges</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.charts.departmentStats || []}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={2}
                >
                  {(stats?.charts.departmentStats || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-24 overflow-y-auto text-xs">
            {(stats?.charts.departmentStats || []).slice(0, 4).map((d, i) => (
              <div key={d.department} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-700 truncate">{d.department}</span>
                </div>
                <span className="font-mono text-slate-900 font-semibold">{d.count} ({d.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODULE 6: LIVE ACTIVE LIBRARY SESSIONS IN DASHBOARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Reading Hall Sessions ({activeSessions.length} Active Readers)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live server timers synchronized with scheduled exit times in Asia/Kolkata timezone
            </p>
          </div>

          <button
            onClick={() => onNavigate('sessions')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Session Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeSessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No active reading sessions currently in progress. Readers check-in via QR-2.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Reader Name & ID</th>
                  <th className="py-3 px-4">Department & Position</th>
                  <th className="py-3 px-4">Desk / Station</th>
                  <th className="py-3 px-4">Check-in Time (IST)</th>
                  <th className="py-3 px-4">Time Elapsed</th>
                  <th className="py-3 px-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.userName}</div>
                      <div className="text-[10px] font-mono text-slate-500">{s.registrationId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800">{s.department}</div>
                      <div className="text-[11px] text-slate-500">{s.position}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {s.workstation || 'Reading Carrel'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {s.startTimeIST}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-emerald-700 font-semibold">
                        {s.elapsedMinutes || 0} min
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRemoteEndSession(s.id, s.userName)}
                        className="px-2.5 py-1 text-[11px] bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded border border-red-200 transition-colors"
                      >
                        Checkout Reader
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
