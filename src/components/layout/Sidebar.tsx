import React from 'react';
import {
  Home,
  UserPlus,
  PlayCircle,
  FileText,
  FolderGit2,
  Presentation as PresentationIcon,
  UserCheck,
  LayoutDashboard,
  QrCode,
  BarChart3,
  History,
  Settings,
  X,
  Clock,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navSections = [
    {
      group: 'Reader Operations',
      items: [
        { id: 'home', label: 'Home Overview', icon: Home },
        { id: 'register', label: 'QR-1: Registration', icon: UserPlus, badge: 'Static QR 1' },
        { id: 'library-login', label: 'QR-2: Session Login', icon: PlayCircle, badge: 'Live Timer' },
        { id: 'user-dashboard', label: 'My Reader Portal', icon: UserCheck },
      ],
    },
    {
      group: 'Research Documentation',
      items: [
        { id: 'papers', label: 'Research Papers', icon: FileText },
        { id: 'projects', label: 'Project Reports', icon: FolderGit2 },
        { id: 'presentations', label: 'PPT Presentations', icon: PresentationIcon },
      ],
    },
    {
      group: 'Administration & Intelligence',
      items: [
        { id: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'qr-codes', label: 'Static QR Codes', icon: QrCode },
        { id: 'analytics', label: 'Registration Analytics', icon: BarChart3 },
        { id: 'sessions', label: 'Session History', icon: History },
        { id: 'settings', label: 'Settings & Testing', icon: Settings },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-blue-500" />
              <span>Smart Library OS</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Central University Library</div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((sec, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
                {sec.group}
              </div>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isActive
                              ? 'bg-blue-700 text-blue-100'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info: Server Daemon Active in Asia/Kolkata */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-mono text-[10px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Daemon 24h</span>
            </span>
            <span>Asia/Kolkata</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            No manual reset required
          </div>
        </div>
      </aside>
    </>
  );
};
