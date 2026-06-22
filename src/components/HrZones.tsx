import React, { useMemo } from 'react';
import { HeartPulse, Gauge } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { formatDuration, formatPaceValue } from '../lib/activity';
import { maxObservedHr } from '../lib/stats';

interface Props {
  activities: ActivitySummary[];
}

const ZONES = [
  { label: 'Z1 Recovery', lo: 0, hi: 0.6, color: '#60a5fa' },
  { label: 'Z2 Easy', lo: 0.6, hi: 0.7, color: '#34d399' },
  { label: 'Z3 Aerobic', lo: 0.7, hi: 0.8, color: '#fbbf24' },
  { label: 'Z4 Threshold', lo: 0.8, hi: 0.9, color: '#fb923c' },
  { label: 'Z5 Max', lo: 0.9, hi: 1.01, color: '#f87171' },
];

const HrZones: React.FC<Props> = ({ activities }) => {
  const maxHr = useMemo(() => maxObservedHr(activities), [activities]);

  const hrZones = useMemo(() => {
    const secs = ZONES.map(() => 0);
    let total = 0;
    if (maxHr > 0) {
      for (const a of activities) {
        if (!a.avgHeartrate) continue;
        const frac = a.avgHeartrate / maxHr;
        const idx = ZONES.findIndex((z) => frac >= z.lo && frac < z.hi);
        const z = idx === -1 ? ZONES.length - 1 : idx;
        secs[z] += a.movingTimeSec;
        total += a.movingTimeSec;
      }
    }
    return { secs, total };
  }, [activities, maxHr]);

  const paceBuckets = useMemo(() => {
    const runs = activities.filter((a) => a.sport === 'Run' && a.distanceMi >= 1 && a.movingTimeSec > 0);
    if (runs.length < 2) return null;
    const paces = runs.map((a) => ({ pace: a.movingTimeSec / a.distanceMi, time: a.movingTimeSec }));
    const min = Math.min(...paces.map((p) => p.pace));
    const max = Math.max(...paces.map((p) => p.pace));
    const N = 6;
    const width = (max - min) / N || 1;
    const buckets = Array.from({ length: N }, (_, i) => ({
      lo: min + i * width,
      hi: min + (i + 1) * width,
      time: 0,
    }));
    for (const p of paces) {
      let i = Math.floor((p.pace - min) / width);
      if (i >= N) i = N - 1;
      if (i < 0) i = 0;
      buckets[i].time += p.time;
    }
    return buckets;
  }, [activities]);

  const maxBucket = paceBuckets ? Math.max(1, ...paceBuckets.map((b) => b.time)) : 1;

  return (
    <div className="glass-card rounded-xl p-5 shadow-xl border border-white/10">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
        <HeartPulse size={20} className="text-red-400" />
        Heart-rate zones
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        By each activity's average HR (est. max {maxHr || '—'} bpm)
      </p>

      {hrZones.total > 0 ? (
        <div className="space-y-2 mb-6">
          {ZONES.map((z, i) => {
            const pct = (hrZones.secs[i] / hrZones.total) * 100;
            return (
              <div key={z.label} className="flex items-center gap-3 text-sm">
                <span className="w-28 text-gray-300 text-xs">{z.label}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: z.color }} />
                </div>
                <span className="w-24 text-right text-xs text-gray-400">
                  {formatDuration(hrZones.secs[i])} · {pct.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-6">No heart-rate data on your activities.</p>
      )}

      <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
        <Gauge size={15} className="text-cyan-400" />
        Run pace distribution
      </h4>
      {paceBuckets ? (
        <div className="space-y-1.5">
          {paceBuckets.map((b, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-24 text-gray-400 tabular-nums">
                {formatPaceValue(b.lo)}–{formatPaceValue(b.hi)}
              </span>
              <div className="flex-1 bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div className="h-full bg-cyan-500/70 rounded-full" style={{ width: `${(b.time / maxBucket) * 100}%` }} />
              </div>
              <span className="w-14 text-right text-gray-500">{formatDuration(b.time)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Not enough runs for a pace distribution yet.</p>
      )}
    </div>
  );
};

export default HrZones;
