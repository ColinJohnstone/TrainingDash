import React, { useMemo } from 'react';
import { Gauge } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { effortScore, maxObservedHr } from '../lib/stats';

interface Props {
  activities: ActivitySummary[];
}

const WEEKS = 12;
const DAY = 24 * 3600 * 1000;

function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

const TrainingLoad: React.FC<Props> = ({ activities }) => {
  const { weeks, maxWeek, acute, chronic } = useMemo(() => {
    const maxHr = maxObservedHr(activities);
    const thisWeekStart = weekStart(new Date());
    const buckets = Array.from({ length: WEEKS }, (_, i) => {
      const start = new Date(thisWeekStart);
      start.setDate(start.getDate() - (WEEKS - 1 - i) * 7);
      return { start, load: 0 };
    });
    const firstStart = buckets[0].start.getTime();

    const now = Date.now();
    let acute = 0; // last 7 days
    let last28 = 0; // last 28 days

    for (const a of activities) {
      const t = new Date(a.date).getTime();
      const e = effortScore(a, maxHr);
      const idx = Math.floor((t - firstStart) / (7 * DAY));
      if (idx >= 0 && idx < WEEKS) buckets[idx].load += e;
      if (now - t <= 7 * DAY) acute += e;
      if (now - t <= 28 * DAY) last28 += e;
    }

    const chronic = last28 / 4; // average weekly load over 4 weeks
    const maxWeek = Math.max(1, ...buckets.map((b) => b.load));
    return { weeks: buckets, maxWeek, acute, chronic };
  }, [activities]);

  const ratio = chronic > 0 ? acute / chronic : 0;
  const status =
    ratio === 0 ? { label: 'No recent load', color: '#9ca3af' }
    : ratio < 0.8 ? { label: 'Detraining', color: '#60a5fa' }
    : ratio <= 1.3 ? { label: 'Maintaining', color: '#34d399' }
    : ratio <= 1.5 ? { label: 'Building', color: '#fbbf24' }
    : { label: 'High — watch recovery', color: '#f87171' };

  return (
    <div className="glass-card rounded-xl p-5 shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Gauge size={20} className="text-orange-400" />
          Training load
        </h3>
        <span className="text-[11px] text-gray-500">relative effort · estimated</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">This week</div>
          <div className="text-2xl font-bold text-white">{Math.round(acute)}</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Weekly avg (4wk)</div>
          <div className="text-2xl font-bold text-white">{Math.round(chronic)}</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Form (acute:chronic)</div>
          <div className="text-2xl font-bold" style={{ color: status.color }}>{ratio ? ratio.toFixed(2) : '—'}</div>
          <div className="text-[10px]" style={{ color: status.color }}>{status.label}</div>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Weekly load (last {WEEKS} weeks)</p>
      <div className="flex items-end gap-1 h-28">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition bg-gray-800 border border-white/15 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 pointer-events-none">
              {w.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {Math.round(w.load)}
            </div>
            <div className="w-full bg-orange-500/70 rounded-t hover:bg-orange-400" style={{ height: `${(w.load / maxWeek) * 100}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingLoad;
