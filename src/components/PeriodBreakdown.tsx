import React, { useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { formatDuration } from '../lib/activity';

interface Props {
  activities: ActivitySummary[];
}

interface Agg {
  count: number;
  miles: number;
  timeSec: number;
  elevFt: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const empty = (): Agg => ({ count: 0, miles: 0, timeSec: 0, elevFt: 0 });
const add = (agg: Agg, a: ActivitySummary) => {
  agg.count += 1;
  agg.miles += a.distanceMi;
  agg.timeSec += a.movingTimeSec;
  agg.elevFt += a.elevationFt;
};

const Row: React.FC<{ label: string; agg: Agg; bold?: boolean }> = ({ label, agg, bold }) => (
  <tr className={`border-t border-gray-700/60 ${bold ? 'font-semibold text-white bg-gray-900/30' : 'text-gray-300'}`}>
    <td className="py-2 px-3">{label}</td>
    <td className="py-2 px-3 text-right">{agg.count || '—'}</td>
    <td className="py-2 px-3 text-right">{agg.miles ? agg.miles.toFixed(1) : '—'}</td>
    <td className="py-2 px-3 text-right">{agg.timeSec ? formatDuration(agg.timeSec) : '—'}</td>
    <td className="py-2 px-3 text-right">{agg.elevFt ? agg.elevFt.toLocaleString() : '—'}</td>
  </tr>
);

const Head = () => (
  <thead>
    <tr className="text-xs uppercase tracking-wide text-gray-500">
      <th className="py-2 px-3 text-left font-medium">Period</th>
      <th className="py-2 px-3 text-right font-medium">Acts</th>
      <th className="py-2 px-3 text-right font-medium">Miles</th>
      <th className="py-2 px-3 text-right font-medium">Time</th>
      <th className="py-2 px-3 text-right font-medium">Elev (ft)</th>
    </tr>
  </thead>
);

const PeriodBreakdown: React.FC<Props> = ({ activities }) => {
  const years = useMemo(() => {
    const set = new Set(activities.map((a) => new Date(a.date).getFullYear()));
    return [...set].sort((a, b) => b - a);
  }, [activities]);

  const [year, setYear] = useState<number>(years[0] ?? new Date().getFullYear());

  const byYear = useMemo(() => {
    const map = new Map<number, Agg>();
    for (const a of activities) {
      const y = new Date(a.date).getFullYear();
      const agg = map.get(y) ?? map.set(y, empty()).get(y)!;
      add(agg, a);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [activities]);

  const months = useMemo(() => {
    const arr = MONTHS.map(empty);
    const total = empty();
    for (const a of activities) {
      const d = new Date(a.date);
      if (d.getFullYear() !== year) continue;
      add(arr[d.getMonth()], a);
      add(total, a);
    }
    return { arr, total };
  }, [activities, year]);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 shadow-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <CalendarClock size={20} className="text-blue-400" />
        Breakdown
      </h3>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Yearly */}
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">By year</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <Head />
              <tbody>
                {byYear.map(([y, agg]) => (
                  <Row key={y} label={`${y}`} agg={agg} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly for selected year */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">By month</p>
            <div className="flex items-center gap-1">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`text-xs px-2 py-0.5 rounded border transition ${
                    year === y ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <Head />
              <tbody>
                {months.arr.map((agg, i) => (
                  <Row key={i} label={MONTHS[i]} agg={agg} />
                ))}
                <Row label={`${year} total`} agg={months.total} bold />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodBreakdown;
