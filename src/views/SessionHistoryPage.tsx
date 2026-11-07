import React, { useEffect, useState } from 'react';
import {
  History,
  Search,
  Download,
  Clock,
  UserCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { LibrarySession } from '../types';

export const SessionHistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<LibrarySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.getSessionHistory({
        search,
        status: statusFilter,
        department: departmentFilter,
      });
      if (res.success) setSessions(res.sessions);
    } catch (e) {
      console.error('Error fetching session history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [search, statusFilter, departmentFilter]);

  const exportSessionsCsv = () => {
    const headers = [
      'Session ID',
      'Reader Name',
      'Registration ID',
      'Department',
      'Position',
      'Desk / Station',
      'Start Time (IST)',
      'Scheduled End Time',
      'Actual End Time (IST)',
      'Duration (Minutes)',
      'Status',
    ];

    const rows = sessions.map((s) => [
      `"${s.id}"`,
      `"${s.userName.replace(/"/g, '""')}"`,
      `"${s.registrationId}"`,
      `"${s.department.replace(/"/g, '""')}"`,
      `"${s.position}"`,
      `"${(s.workstation || '').replace(/"/g, '""')}"`,
      `"${s.startTimeIST}"`,
      `"${s.scheduledEndTime}"`,
      `"${s.actualEndTimeIST || 'Active'}"`,
      s.durationMinutes || 0,
      `"${s.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `library_sessions_history_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Library Reading Session History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full audit log of reader check-ins, persistent session durations, and reading hall station utilization.
          </p>
        </div>

        <button
          onClick={exportSessionsCsv}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Export Sessions CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search sessions by reader name, registration ID, or workstation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              statusFilter === 'ACTIVE' ? 'bg-white text-emerald-800 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Now
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              statusFilter === 'COMPLETED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No session records match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Reader & Reg ID</th>
                  <th className="py-3 px-4">Academic Dept</th>
                  <th className="py-3 px-4">Workstation / Topic</th>
                  <th className="py-3 px-4">Login Time (IST)</th>
                  <th className="py-3 px-4">Logout Time (IST)</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((s) => {
                  const isActive = s.status === 'ACTIVE';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{s.userName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{s.registrationId}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-900">{s.department}</div>
                        <div className="text-[11px] text-slate-500">{s.position}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">{s.workstation || 'Carrel'}</div>
                        <div className="text-[11px] text-slate-500 truncate">{s.purpose || 'Study'}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                        {s.startTimeIST}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                        {s.actualEndTimeIST || '— (In Progress)'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-900">
                        {s.durationMinutes} min
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
