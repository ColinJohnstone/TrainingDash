import React, { useMemo } from 'react';
import { LineChart } from 'lucide-react';
import { ActivitySummary } from '../data/strava';

interface Props {
  activities: ActivitySummary[];
}

const MONTHS_BACK = 18;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const TrendsCharts: React.FC<Props> = ({ activities }) => {
  const monthly = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: MONTHS_BACK }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1 - i), 1);
      return { d, miles: 0 };
    });
    const firstKey = buckets[0].d.getFullYear() * 12 + buckets[0].d.getMonth();
    for (const a of activities) {
      const ad = new Date(a.date);
      const idx = ad.getFullYear() * 12 + ad.getMonth() - firstKey;
      if (idx >= 0 && idx < MONTHS_BACK) buckets[idx].miles += a.distanceMi;
    }
    return buckets;
  }, [activities]);

  const dow = useMemo(() => {
    const arr = Array(7).fill(0);
    for (const a of activities) {
      const idx = (new Date(a.date).getDay() + 6) % 7; // Mon=0
      arr[idx] += a.distanceMi;
    }
    return arr;
  }, [activities]);

  const hours = useMemo(() => {
    const arr = Array(24).fill(0);
    for (const a of activities) arr[new Date(a.date).getHours()] += 1;
    return arr;
  }, [activities]);

  const maxMonth = Math.max(1, ...monthly.map((m) => m.miles));
  const maxDow = Math.max(1, ...dow);
  const maxHour = Math.max(1, ...hours);

  return (
    <div className="glass-card rounded-xl p-5 shadow-xl border border-white/10 space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <LineChart size={20} className="text-purple-400" />
        Trends
      </h3>

      {/* Monthly distance */}
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Distance per month (last {MONTHS_BACK})</p>
        <div className="flex items-end gap-1 h-36">
          {monthly.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition bg-gray-800 border border-white/15 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 pointer-events-none">
                {m.d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}: {m.miles.toFixed(0)} mi
              </div>
              <div className="w-full bg-purple-500/70 rounded-t hover:bg-purple-400" style={{ height: `${(m.miles / maxMonth) * 100}%` }} />
              <span className="text-[8px] text-gray-600 mt-0.5">{m.d.getMonth() === 0 ? `'${String(m.d.getFullYear()).slice(2)}` : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Day of week */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">By day of week (miles)</p>
          <div className="space-y-1.5">
            {dow.map((v, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-8 text-gray-400">{WEEKDAYS[i]}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div className="h-full bg-blue-500/70 rounded-full" style={{ width: `${(v / maxDow) * 100}%` }} />
                </div>
                <span className="w-12 text-right text-gray-400">{v.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time of day */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">By time of day (activities)</p>
          <div className="flex items-end gap-[2px] h-28">
            {hours.map((v, h) => (
              <div key={h} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition bg-gray-800 border border-white/15 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap z-10 pointer-events-none">
                  {h}:00 — {v} act
                </div>
                <div className="w-full bg-emerald-500/70 rounded-t hover:bg-emerald-400" style={{ height: `${(v / maxHour) * 100}%` }} />
                {h % 6 === 0 && <span className="text-[8px] text-gray-600 mt-0.5">{h}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsCharts;
