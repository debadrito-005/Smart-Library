import React, { useEffect, useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { CycleStatusReport } from '../../types';

export const CycleCountdownBadge: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [cycle, setCycle] = useState<CycleStatusReport | null>(null);
  const [remainingSecs, setRemainingSecs] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCycle = async () => {
    try {
      const res = await api.getCycleReport();
      if (res.success && res.cycle) {
        setCycle(res.cycle);
        setRemainingSecs(res.cycle.remainingSeconds);
      }
    } catch (e) {
      console.error('Error fetching cycle status:', e);
    }
  };

  useEffect(() => {
    fetchCycle();
    // Poll every 15 seconds to sync with server daemon
    const syncInterval = setInterval(fetchCycle, 15000);
    return () => clearInterval(syncInterval);
  }, []);

  // Second-by-second countdown decrement
  useEffect(() => {
    if (remainingSecs <= 0) return;
    const timer = setInterval(() => {
      setRemainingSecs((prev) => {
        if (prev <= 1) {
          fetchCycle(); // Trigger fetch on cycle completion
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSecs]);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await fetchCycle();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const formatHoursMinutesSeconds = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (!cycle) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono py-1">
        <Clock className="w-3.5 h-3.5 animate-spin text-slate-400" />
        <span>Syncing 24h cycle...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs bg-slate-900 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
          <span className="text-slate-300">Cycle #{cycle.cycleNumber}</span>
        </div>
        <span className="text-slate-600">·</span>
        <div className="flex items-center gap-1 text-slate-100 font-mono tabular-nums">
          <Clock className="w-3 h-3 text-blue-400" />
          <span>{formatHoursMinutesSeconds(remainingSecs)}</span>
        </div>
        <span className="text-slate-600">·</span>
        <span className="text-slate-400 text-[11px]">Today: {cycle.todayRegistrations}</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                24-Hour Registration Cycle #{cycle.cycleNumber}
              </span>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                {cycle.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Automated server daemon (Asia/Kolkata Timezone · IST)
            </div>
          </div>
        </div>

        <button
          onClick={handleManualSync}
          title="Refresh cycle state"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-xs">
        <div>
          <div className="text-slate-400 text-[11px]">Remaining Window</div>
          <div className="font-mono text-base font-semibold text-blue-300 tabular-nums mt-0.5">
            {formatHoursMinutesSeconds(remainingSecs)}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Cycle Span (IST)</div>
          <div className="text-slate-200 text-[11px] font-mono truncate mt-0.5" title={`${cycle.startTimeIST} to ${cycle.endTimeIST}`}>
            {cycle.startTimeIST.split(',')[1]?.trim() || cycle.startTimeIST} → {cycle.endTimeIST.split(',')[1]?.trim() || cycle.endTimeIST}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Today's Registrations</div>
          <div className="font-mono text-base font-semibold text-emerald-400 tabular-nums mt-0.5">
            {cycle.todayRegistrations}
          </div>
        </div>

        <div>
          <div className="text-slate-400 text-[11px]">Lifetime Archive</div>
          <div className="font-mono text-base font-semibold text-slate-200 tabular-nums mt-0.5">
            {cycle.totalLifetimeRegistrations}
          </div>
        </div>
      </div>
    </div>
  );
};
