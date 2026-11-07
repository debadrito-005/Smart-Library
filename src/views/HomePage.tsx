import React, { useEffect, useState } from 'react';
import {
  QrCode,
  UserPlus,
  PlayCircle,
  FileText,
  ShieldCheck,
  Clock,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Download,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { QrCodesResponse, DashboardStats } from '../types';
import { CycleCountdownBadge } from '../components/common/CycleCountdownBadge';

interface HomePageProps {
  onNavigate: (view: string) => void;
  onOpenScanner: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenScanner }) => {
  const [qrData, setQrData] = useState<QrCodesResponse | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [qrRes, statsRes] = await Promise.all([
          api.getQrCodes(),
          api.getDashboardStats(),
        ]);
        if (qrRes.success) setQrData(qrRes);
        if (statsRes.success) setStats(statsRes);
      } catch (e) {
        console.error('Error loading home data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const downloadQr = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 lg:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-900/60 border border-blue-700/50 text-blue-200 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Central University Research Infrastructure</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Smart Library QR-Based Research Registration & Session Management System
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Enterprise campus library automation powered by two permanent static QR codes, automatic 24-hour registration
            cycle management in Asia/Kolkata timezone, persistent session timers, and a secured research document repository.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register via QR-1</span>
            </button>
            <button
              onClick={() => onNavigate('library-login')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Start Session via QR-2</span>
            </button>
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>Scan QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module 2: Live 24-Hour Cycle Monitor Card */}
      <CycleCountdownBadge />

      {/* Module 1: The Two Permanent Static QR Codes Showcase */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Permanent Static QR Codes</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These two static QR codes never change throughout the project lifecycle. They are permanently mounted at library turnstiles and kiosks.
            </p>
          </div>
          <button
            onClick={() => onNavigate('qr-codes')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Manage & Print Placards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code 1: Registration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    QR CODE 1 · STATIC PERMANENT
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">Library Registration QR Code</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Opens the Student & Scholar Registration form. Generates unique Registration ID automatically and assigns to current 24-hour cycle.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100 my-4">
                {qrData?.qr1.pngDataUrl ? (
                  <img
                    src={qrData.qr1.pngDataUrl}
                    alt="Registration QR Code"
                    className="w-36 h-36 bg-white p-2 rounded-lg border border-slate-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-lg shrink-0" />
                )}

                <div className="space-y-2 text-xs w-full">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Static Target URL</span>
                    <code className="text-slate-800 font-mono text-[11px] bg-slate-200/60 px-2 py-1 rounded block truncate mt-0.5">
                      {qrData?.qr1.targetUrl || '/register'}
                    </code>
                  </div>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Never expires across cycles</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Department & position auto-validation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigate('register')}
                className="flex-1 py-2 text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-center"
              >
                Open Registration Page
              </button>
              {qrData?.qr1.pngDataUrl && (
                <button
                  onClick={() => downloadQr(qrData.qr1.pngDataUrl, 'Library_Registration_QR1.png')}
                  title="Download High-Res PNG"
                  className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* QR Code 2: Library Login */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    QR CODE 2 · STATIC PERMANENT
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">Library Login & Session QR Code</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Authenticates reader with Registration ID. Displays personalized welcome card and runs persistent session countdown timer.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100 my-4">
                {qrData?.qr2.pngDataUrl ? (
                  <img
                    src={qrData.qr2.pngDataUrl}
                    alt="Library Login QR Code"
                    className="w-36 h-36 bg-white p-2 rounded-lg border border-slate-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-36 h-36 bg-slate-200 animate-pulse rounded-lg shrink-0" />
                )}

                <div className="space-y-2 text-xs w-full">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Static Target URL</span>
                    <code className="text-slate-800 font-mono text-[11px] bg-slate-200/60 px-2 py-1 rounded block truncate mt-0.5">
                      {qrData?.qr2.targetUrl || '/library-login'}
                    </code>
                  </div>
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Persistent countdown on page refresh</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Automatic start/end timestamp recording</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigate('library-login')}
                className="flex-1 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors text-center"
              >
                Open Session Login Page
              </button>
              {qrData?.qr2.pngDataUrl && (
                <button
                  onClick={() => downloadQr(qrData.qr2.pngDataUrl, 'Library_Login_Session_QR2.png')}
                  title="Download High-Res PNG"
                  className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot KPIs Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Current Campus Library Indicators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Registered Readers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats?.kpis.totalRegisteredUsers ?? '...'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Across all academic departments</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Active Study Sessions</span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">
              {stats?.kpis.activeLibrarySessions ?? '...'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Currently in reading carrels</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Research Papers</span>
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats?.kpis.totalResearchPapers ?? '...'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats ? `${stats.kpis.communicatedResearchPapers} Communicated to journals` : ''}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-medium">Projects & PPTs</span>
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats ? stats.kpis.totalProjectReports + stats.kpis.totalPresentations : '...'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Reports and presentation decks</div>
          </div>
        </div>
      </div>

      {/* Operational Flow Step-by-Step Guide */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">4-Step Library Reader Operational Protocol</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-blue-700 font-mono font-bold text-sm mb-1">Step 01</div>
            <div className="font-semibold text-slate-900 mb-1">Scan QR Code 1</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Access registration form on any mobile device. Enter full name, university department, and position.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-blue-700 font-mono font-bold text-sm mb-1">Step 02</div>
            <div className="font-semibold text-slate-900 mb-1">Receive Registration ID</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              The system assigns a unique ID (e.g. LIB-2026-10024). Valid across all library reading halls.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-emerald-700 font-mono font-bold text-sm mb-1">Step 03</div>
            <div className="font-semibold text-slate-900 mb-1">Scan QR Code 2 & Login</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Enter Registration ID upon entry. Verify personalized greeting and press "Start Session" to trigger timer.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="text-emerald-700 font-mono font-bold text-sm mb-1">Step 04</div>
            <div className="font-semibold text-slate-900 mb-1">Persistent Timer & Checkout</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Timer persists across page reloads. Conclude session upon departure to record verified library credits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
