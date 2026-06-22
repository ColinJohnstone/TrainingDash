import React, { useMemo } from 'react';
import { Medal, Zap } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { formatDate } from '../lib/activity';

interface Props {
  activities: ActivitySummary[];
  onSelect: (a: ActivitySummary) => void;
}

const BENCHMARKS = [
  { label: '1 mile', mi: 1 },
  { label: '5K', mi: 3.107 },
  { label: '10K', mi: 6.214 },
  { label: 'Half', mi: 13.109 },
  { label: 'Marathon', mi: 26.219 },
];

function hms(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function isoWeekKey(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`;
}

const PersonalBests: React.FC<Props> = ({ activities, onSelect }) => {
  const bests = useMemo(() => {
    const runs = activities.filter((a) => a.sport === 'Run' && a.movingTimeSec > 0 && a.distanceMi > 0);
    return BENCHMARKS.map((b) => {
      let best: { time: number; act: ActivitySummary } | null = null;
      for (const a of runs) {
        if (a.distanceMi < b.mi * 0.97) continue; // must be at least ~this far
        const est = (a.movingTimeSec / a.distanceMi) * b.mi; // est. time at this distance
        if (!best || est < best.time) best = { time: est, act: a };
      }
      return { ...b, best };
    }).filter((x) => x.best);
  }, [activities]);

  const aggregates = useMemo(() => {
    const byWeek = new Map<string, number>();
    const byMonth = new Map<string, number>();
    const weekCount = new Map<string, number>();
    for (const a of activities) {
      const d = new Date(a.date);
      const wk = isoWeekKey(d);
      const mo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byWeek.set(wk, (byWeek.get(wk) ?? 0) + a.distanceMi);
      byMonth.set(mo, (byMonth.get(mo) ?? 0) + a.distanceMi);
      weekCount.set(wk, (weekCount.get(wk) ?? 0) + 1);
    }
    const maxWeek = Math.max(0, ...byWeek.values());
    const maxMonth = Math.max(0, ...byMonth.values());
    const maxWeekCount = Math.max(0, ...weekCount.values());
    return { maxWeek, maxMonth, maxWeekCount };
  }, [activities]);

  return (
    <div className="glass-card rounded-xl p-5 shadow-xl border border-white/10">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
        <Medal size={20} className="text-amber-400" />
        Personal bests
      </h3>
      <p className="text-xs text-gray-500 mb-4">Estimated from average pace (run distances)</p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
        {bests.map((b) => (
          <button
            key={b.label}
            onClick={() => b.best && onSelect(b.best.act)}
            className="bg-gray-900/40 hover:bg-gray-900/70 rounded-lg p-3 border border-white/10 hover:border-white/20 transition text-center"
          >
            <div className="text-xs text-gray-400 mb-1">{b.label}</div>
            <div className="text-lg font-bold text-white tabular-nums">{hms(b.best!.time)}</div>
            <div className="text-[10px] text-gray-500 truncate">{formatDate(b.best!.act.date, { month: 'short', year: '2-digit' })}</div>
          </button>
        ))}
        {bests.length === 0 && <p className="text-sm text-gray-500 col-span-full">No runs to estimate from yet.</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-1"><Zap size={11} className="text-amber-400" /> Biggest week</div>
          <div className="text-xl font-bold text-white">{aggregates.maxWeek.toFixed(0)} mi</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10 text-center">
          <div className="text-xs text-gray-400 mb-1">Biggest month</div>
          <div className="text-xl font-bold text-white">{aggregates.maxMonth.toFixed(0)} mi</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10 text-center">
          <div className="text-xs text-gray-400 mb-1">Most acts / week</div>
          <div className="text-xl font-bold text-white">{aggregates.maxWeekCount}</div>
        </div>
      </div>
    </div>
  );
};

export default PersonalBests;
