import React from 'react';
import { QrCode, Shield, Menu } from 'lucide-react';
import { CycleCountdownBadge } from '../common/CycleCountdownBadge';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenScanner: () => void;
  onToggleSidebar: () => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenScanner,
  onToggleSidebar,
  isAdminLoggedIn,
  onLogoutAdmin,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between gap-8 px-4 lg:px-8 py-3.5">
        {/* Zone 1: Single text element wordmark + mobile sidebar toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="text-base lg:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 bg-blue-700 rounded-sm inline-block" />
            <span>Smart Library Research OS</span>
          </a>
        </div>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden xl:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentView === 'home' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('register')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentView === 'register' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Registration (QR-1)
          </button>
          <button
            onClick={() => onNavigate('library-login')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentView === 'library-login' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Session Login (QR-2)
          </button>
          <button
            onClick={() => onNavigate('papers')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentView === 'papers' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Research Papers
          </button>
          <button
            onClick={() => onNavigate('qr-codes')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentView === 'qr-codes' ? 'text-blue-700 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Static QR Codes
          </button>
        </nav>

        {/* Zone 3: 1 primary action + compact cycle status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:block">
            <CycleCountdownBadge compact />
          </div>

          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>

          {isAdminLoggedIn ? (
            <button
              onClick={onLogoutAdmin}
              className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => onNavigate('admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
