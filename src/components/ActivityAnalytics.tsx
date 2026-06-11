import React, { useMemo } from 'react';
import { Activity, Route, Clock, Mountain } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { sportColor, sportIcon, formatDuration } from '../lib/activity';

interface Props {
  activities: ActivitySummary[];
}

const WEEKS = 12;

// Monday 00:00 of the week containing `d`.
function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // 0 = Monday
  x.setDate(x.getDate() - dow);
  return x;
}

const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-gray-900/40 rounded-lg p-4 border border-white/10">
    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
      {icon}
      {label}
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const ActivityAnalytics: React.FC<Props> = ({ activities }) => {
  const { weeks, sports, maxWeek, totals } = useMemo(() => {
    const thisWeekStart = weekStart(new Date());
    // Build the last WEEKS week-buckets (oldest first).
    const buckets = Array.from({ length: WEEKS }, (_, i) => {
      const start = new Date(thisWeekStart);
      start.setDate(start.getDate() - (WEEKS - 1 - i) * 7);
      return { start, bySport: {} as Record<string, number>, total: 0 };
    });
    const firstStart = buckets[0].start.getTime();
    const sportSet = new Set<string>();

    const totals = { count: 0, miles: 0, timeSec: 0, elevFt: 0 };
    for (const a of activities) {
      totals.count += 1;
      totals.miles += a.distanceMi;
      totals.timeSec += a.movingTimeSec;
      totals.elevFt += a.elevationFt;

      const t = new Date(a.date).getTime();
      if (t < firstStart) continue;
      const idx = Math.floor((t - firstStart) / (7 * 24 * 3600 * 1000));
      if (idx < 0 || idx >= WEEKS) continue;
      const b = buckets[idx];
      b.bySport[a.sport] = (b.bySport[a.sport] ?? 0) + a.distanceMi;
      b.total += a.distanceMi;
      sportSet.add(a.sport);
    }

    const maxWeek = Math.max(1, ...buckets.map((b) => b.total));
    return { weeks: buckets, sports: [...sportSet], maxWeek, totals };
  }, [activities]);

  // Per-sport breakdown over the loaded window.
  const breakdown = useMemo(() => {
    const map = new Map<string, { miles: number; count: number }>();
    for (const a of activities) {
      const cur = map.get(a.sport) ?? { miles: 0, count: 0 };
      cur.miles += a.distanceMi;
      cur.count += 1;
      map.set(a.sport, cur);
    }
    return [...map.entries()].sort((a, b) => b[1].miles - a[1].miles);
  }, [activities]);

  const totalMiles = breakdown.reduce((s, [, v]) => s + v.miles, 0) || 1;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={<Activity size={12} />} label="Activities" value={`${totals.count}`} />
        <SummaryCard icon={<Route size={12} />} label="Distance" value={`${totals.miles.toFixed(0)} mi`} />
        <SummaryCard icon={<Clock size={12} />} label="Moving time" value={formatDuration(totals.timeSec)} />
        <SummaryCard icon={<Mountain size={12} />} label="Elevation" value={`${totals.elevFt.toLocaleString()} ft`} />
      </div>

      {/* Weekly volume chart */}
      <div className="bg-gray-900/40 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Weekly volume (last {WEEKS} weeks)</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {sports.map((s) => (
              <span key={s} className="flex items-center gap-1 text-[11px] text-gray-400">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: sportColor(s).hex }} />
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between gap-1 h-32">
          {weeks.map((w, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div
                className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition bg-gray-800 border border-white/15 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 pointer-events-none"
              >
                {w.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {w.total.toFixed(1)} mi
              </div>
              <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${(w.total / maxWeek) * 100}%` }}>
                {sports.map((s) =>
                  w.bySport[s] ? (
                    <div key={s} style={{ height: `${(w.bySport[s] / w.total) * 100}%`, background: sportColor(s).hex }} />
                  ) : null,
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-600">
          <span>{weeks[0].start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span>this week</span>
        </div>
      </div>

      {/* Sport breakdown */}
      {breakdown.length > 0 && (
        <div className="bg-gray-900/40 rounded-lg p-4 border border-white/10">
          <h3 className="text-sm font-semibold text-white mb-3">By sport</h3>
          <div className="space-y-2">
            {breakdown.map(([sport, v]) => (
              <div key={sport} className="flex items-center gap-3">
                <span className="w-20 text-sm text-gray-300 flex items-center gap-1.5">
                  {sportIcon(sport)} {sport}
                </span>
                <div className="flex-1 bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(v.miles / totalMiles) * 100}%`, background: sportColor(sport).hex }} />
                </div>
                <span className="w-28 text-right text-xs text-gray-400">
                  {v.miles.toFixed(0)} mi · {v.count} act
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityAnalytics;
