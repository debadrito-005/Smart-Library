import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { QrScannerModal } from './components/common/QrScannerModal';
import { HomePage } from './views/HomePage';
import { RegistrationPage } from './views/RegistrationPage';
import { SessionLoginPage } from './views/SessionLoginPage';
import { ResearchPapersPage } from './views/ResearchPapersPage';
import { ProjectReportsPage } from './views/ProjectReportsPage';
import { PresentationsPage } from './views/PresentationsPage';
import { UserDashboardPage } from './views/UserDashboardPage';
import { AdminDashboardPage } from './views/AdminDashboardPage';
import { QrCodeManagementPage } from './views/QrCodeManagementPage';
import { RegistrationAnalyticsPage } from './views/RegistrationAnalyticsPage';
import { SessionHistoryPage } from './views/SessionHistoryPage';
import { SettingsPage } from './views/SettingsPage';
import { api } from './services/api';
import { Lock, X, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewExtraData, setViewExtraData] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Listen to hash and URL paths on initial load and popstate
  useEffect(() => {
    const parseRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');

      // Check path first (for direct QR scans /register or /library-login)
      if (path === '/register' || hash === 'register') {
        setCurrentView('register');
      } else if (path === '/library-login' || hash === 'library-login') {
        setCurrentView('library-login');
      } else if (path === '/papers' || hash === 'papers') {
        setCurrentView('papers');
      } else if (path === '/projects' || hash === 'projects') {
        setCurrentView('projects');
      } else if (path === '/presentations' || hash === 'presentations') {
        setCurrentView('presentations');
      } else if (path === '/admin' || hash === 'admin') {
        setCurrentView('admin');
      } else if (path === '/qr-codes' || hash === 'qr-codes') {
        setCurrentView('qr-codes');
      } else if (path === '/analytics' || hash === 'analytics') {
        setCurrentView('analytics');
      } else if (path === '/sessions' || hash === 'sessions') {
        setCurrentView('sessions');
      } else if (path === '/settings' || hash === 'settings') {
        setCurrentView('settings');
      } else if (path === '/user-dashboard' || hash === 'user-dashboard') {
        setCurrentView('user-dashboard');
      } else {
        setCurrentView('home');
      }
    };

    parseRoute();
    window.addEventListener('popstate', parseRoute);
    window.addEventListener('hashchange', parseRoute);

    // Check saved admin session
    const savedToken = localStorage.getItem('smart_library_admin_token');
    if (savedToken) {
      setIsAdminLoggedIn(true);
    }

    return () => {
      window.removeEventListener('popstate', parseRoute);
      window.removeEventListener('hashchange', parseRoute);
    };
  }, []);

  const handleNavigate = (view: string, extraData?: any) => {
    setCurrentView(view);
    setViewExtraData(extraData || null);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanResult = (decodedText: string) => {
    const trimmed = decodedText.trim();
    // 1. If scanned URL contains /register -> go to register
    if (trimmed.includes('/register') || trimmed === 'register') {
      handleNavigate('register');
    }
    // 2. If scanned URL contains /library-login -> go to login
    else if (trimmed.includes('/library-login') || trimmed === 'library-login') {
      handleNavigate('library-login');
    }
    // 3. If raw registration ID (e.g. LIB-2026-XXXXX) -> go to login with prefilled ID
    else if (trimmed.startsWith('LIB-')) {
      handleNavigate('library-login', { prefilledRegId: trimmed });
    }
    // Fallback: search or open user dashboard
    else {
      handleNavigate('library-login', { prefilledRegId: trimmed });
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setIsLoggingIn(true);

    try {
      const res = await api.adminLogin(adminUsername, adminPassword);
      if (res.success && res.token) {
        localStorage.setItem('smart_library_admin_token', res.token);
        setIsAdminLoggedIn(true);
        setIsAdminLoginModalOpen(false);
        setAdminPassword('');
        handleNavigate('admin');
      } else {
        setAdminAuthError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err: any) {
      setAdminAuthError('Server error during administrator sign-in.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('smart_library_admin_token');
    setIsAdminLoggedIn(false);
    handleNavigate('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenScanner={() => setIsScannerOpen(true)}
        onToggleSidebar={() => setIsSidebarOpenMobile((prev) => !prev)}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogoutAdmin={handleAdminLogout}
      />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
        />

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {currentView === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {currentView === 'register' && (
            <RegistrationPage onNavigate={handleNavigate} />
          )}

          {currentView === 'library-login' && (
            <SessionLoginPage
              initialRegId={viewExtraData?.prefilledRegId || ''}
              onOpenScanner={() => setIsScannerOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'papers' && <ResearchPapersPage />}

          {currentView === 'projects' && <ProjectReportsPage />}

          {currentView === 'presentations' && <PresentationsPage />}

          {currentView === 'user-dashboard' && (
            <UserDashboardPage onNavigate={handleNavigate} />
          )}

          {currentView === 'admin' && (
            <AdminDashboardPage onNavigate={handleNavigate} />
          )}

          {currentView === 'qr-codes' && (
            <QrCodeManagementPage
              onOpenScanner={() => setIsScannerOpen(true)}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'analytics' && <RegistrationAnalyticsPage />}

          {currentView === 'sessions' && <SessionHistoryPage />}

          {currentView === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Camera & File QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanResult={handleScanResult}
      />

      {/* Admin Sign-in Modal */}
      {isAdminLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Lock className="w-4 h-4 text-blue-700" />
                <span>Admin Sign In</span>
              </div>
              <button
                onClick={() => setIsAdminLoginModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminAuthError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Username / Email</label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter admin password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Default Credentials:</span>
                <div>User: <code className="font-mono text-blue-700">admin</code></div>
                <div>Pass: <code className="font-mono text-blue-700">Admin@Library2026</code></div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Sign In as Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Central University Smart Library OS · Academic Year 2026–2027
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
            <span>Daemon: 24h Cycle</span>
            <span>·</span>
            <span>Timezone: Asia/Kolkata (IST)</span>
            <span>·</span>
            <button
              onClick={() => handleNavigate('settings')}
              className="text-blue-700 hover:underline font-sans font-medium"
            >
              Test Suite (Module 12)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
