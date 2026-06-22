import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, CalendarRange } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { formatDuration } from '../lib/activity';

interface Props {
  activities: ActivitySummary[];
}

interface Agg {
  miles: number;
  timeSec: number;
  count: number;
  elevFt: number;
}

function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // back to Monday
  return x;
}

const empty = (): Agg => ({ miles: 0, timeSec: 0, count: 0, elevFt: 0 });

const Delta: React.FC<{ now: number; prev: number; suffix?: string }> = ({ now, prev }) => {
  if (prev === 0) {
    return now > 0 ? <span className="text-emerald-400 text-xs font-medium">new</span> : <span className="text-gray-600 text-xs">—</span>;
  }
  const pct = Math.round(((now - prev) / prev) * 100);
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  const color = pct > 0 ? 'text-emerald-400' : pct < 0 ? 'text-red-400' : 'text-gray-400';
  return (
    <span className={`flex items-center gap-0.5 text-xs font-medium ${color}`}>
      <Icon size={12} />
      {Math.abs(pct)}%
    </span>
  );
};

const WeeklySummary: React.FC<Props> = ({ activities }) => {
  const { thisWeek, lastWeek } = useMemo(() => {
    const tw = empty();
    const lw = empty();
    const startThis = weekStart(new Date()).getTime();
    const startLast = startThis - 7 * 24 * 3600 * 1000;
    for (const a of activities) {
      const t = new Date(a.date).getTime();
      const bucket = t >= startThis ? tw : t >= startLast && t < startThis ? lw : null;
      if (!bucket) continue;
      bucket.miles += a.distanceMi;
      bucket.timeSec += a.movingTimeSec;
      bucket.count += 1;
      bucket.elevFt += a.elevationFt;
    }
    return { thisWeek: tw, lastWeek: lw };
  }, [activities]);

  const rows: { label: string; now: string; nowN: number; prevN: number }[] = [
    { label: 'Distance', now: `${thisWeek.miles.toFixed(1)} mi`, nowN: thisWeek.miles, prevN: lastWeek.miles },
    { label: 'Time', now: formatDuration(thisWeek.timeSec), nowN: thisWeek.timeSec, prevN: lastWeek.timeSec },
    { label: 'Activities', now: `${thisWeek.count}`, nowN: thisWeek.count, prevN: lastWeek.count },
    { label: 'Elevation', now: `${thisWeek.elevFt.toLocaleString()} ft`, nowN: thisWeek.elevFt, prevN: lastWeek.elevFt },
  ];

  return (
    <div className="glass-card rounded-xl p-5 border border-white/10 h-full">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
        <CalendarRange size={18} className="text-cyan-400" />
        This week
      </h3>
      <p className="text-xs text-gray-500 mb-4">vs last week</p>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{r.label}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">{r.now}</span>
              <span className="w-14 text-right">
                <Delta now={r.nowN} prev={r.prevN} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklySummary;
