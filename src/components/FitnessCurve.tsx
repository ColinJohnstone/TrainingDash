import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { effortScore, maxObservedHr } from '../lib/stats';

interface Props {
  activities: ActivitySummary[];
}

const DISPLAY_DAYS = 120;
const DAY = 24 * 3600 * 1000;

function dayKeyLocal(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const FitnessCurve: React.FC<Props> = ({ activities }) => {
  const series = useMemo(() => {
    if (!activities.length) return null;
    const maxHr = maxObservedHr(activities);

    // Daily load
    const daily = new Map<string, number>();
    let earliest = Infinity;
    for (const a of activities) {
      const t = new Date(a.date).getTime();
      earliest = Math.min(earliest, t);
      const k = dayKeyLocal(t);
      daily.set(k, (daily.get(k) ?? 0) + effortScore(a, maxHr));
    }

    // Walk day-by-day from earliest (capped to ~1y before today) to today,
    // updating CTL (42d) and ATL (7d) exponential averages.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startMs = Math.max(earliest, today.getTime() - 400 * DAY);
    const start = new Date(startMs);
    start.setHours(0, 0, 0, 0);

    let ctl = 0;
    let atl = 0;
    const points: { t: number; ctl: number; atl: number; form: number }[] = [];
    for (let t = start.getTime(); t <= today.getTime(); t += DAY) {
      const load = daily.get(dayKeyLocal(t)) ?? 0;
      const formBefore = ctl - atl; // yesterday's balance
      ctl += (load - ctl) / 42;
      atl += (load - atl) / 7;
      points.push({ t, ctl, atl, form: formBefore });
    }
    return points.slice(-DISPLAY_DAYS);
  }, [activities]);

  if (!series || series.length < 2) {
    return (
      <div className="glass-card rounded-xl p-5 shadow-xl border border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <Activity size={20} className="text-emerald-400" />
          Fitness &amp; Freshness
        </h3>
        <p className="text-sm text-gray-500">Not enough activity history yet.</p>
      </div>
    );
  }

  const last = series[series.length - 1];
  const maxVal = Math.max(...series.map((p) => Math.max(p.ctl, p.atl)), 1);
  const W = 600;
  const H = 160;
  const x = (i: number) => (i / (series.length - 1)) * W;
  const y = (v: number) => H - (v / maxVal) * (H - 10);

  const path = (key: 'ctl' | 'atl') =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ');

  const form = last.form;
  const formStatus =
    form > 15 ? { label: 'Very fresh / detraining', color: '#60a5fa' }
    : form > 5 ? { label: 'Fresh — race ready', color: '#34d399' }
    : form > -10 ? { label: 'Neutral', color: '#a3e635' }
    : form > -30 ? { label: 'Building / fatigued', color: '#fbbf24' }
    : { label: 'Very fatigued', color: '#f87171' };

  return (
    <div className="glass-card rounded-xl p-5 shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity size={20} className="text-emerald-400" />
          Fitness &amp; Freshness
        </h3>
        <span className="text-[11px] text-gray-500">last {series.length} days · estimated</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Fitness (CTL)</div>
          <div className="text-2xl font-bold" style={{ color: '#22d3ee' }}>{Math.round(last.ctl)}</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Fatigue (ATL)</div>
          <div className="text-2xl font-bold" style={{ color: '#fb923c' }}>{Math.round(last.atl)}</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Form (TSB)</div>
          <div className="text-2xl font-bold" style={{ color: formStatus.color }}>{Math.round(form)}</div>
          <div className="text-[10px]" style={{ color: formStatus.color }}>{formStatus.label}</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
        <path d={path('ctl')} fill="none" stroke="#22d3ee" strokeWidth={2.5} />
        <path d={path('atl')} fill="none" stroke="#fb923c" strokeWidth={2} strokeDasharray="4 3" />
      </svg>
      <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Fitness</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400 inline-block" /> Fatigue</span>
      </div>
    </div>
  );
};

export default FitnessCurve;
