import React, { useMemo, useState } from 'react';
import { Flame, CalendarRange } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { dayKey } from '../lib/activity';
import { computeDayStreaks } from '../lib/stats';

interface Props {
  activities: ActivitySummary[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function localKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const ActivityHeatmap: React.FC<Props> = ({ activities }) => {
  const years = useMemo(() => {
    const set = new Set(activities.map((a) => new Date(a.date).getFullYear()));
    return [...set].sort((a, b) => b - a);
  }, [activities]);

  const [year, setYear] = useState<number>(years[0] ?? new Date().getFullYear());
  const streaks = useMemo(() => computeDayStreaks(activities), [activities]);

  const { weeks, monthLabels, maxDaily, yearTotal, activeDays } = useMemo(() => {
    const daily = new Map<string, number>();
    for (const a of activities) {
      if (new Date(a.date).getFullYear() !== year) continue;
      const k = dayKey(a.date);
      daily.set(k, (daily.get(k) ?? 0) + a.distanceMi);
    }

    const start = new Date(year, 0, 1);
    const startSunday = new Date(start);
    startSunday.setDate(start.getDate() - start.getDay());
    const end = new Date(year, 11, 31);

    const weeks: ({ key: string; miles: number; date: Date } | null)[][] = [];
    const monthLabels: { col: number; label: string }[] = [];
    let lastMonth = -1;
    const cur = new Date(startSunday);
    while (cur <= end) {
      const week: ({ key: string; miles: number; date: Date } | null)[] = [];
      for (let i = 0; i < 7; i++) {
        if (cur.getFullYear() === year) {
          const k = localKey(cur);
          week.push({ key: k, miles: daily.get(k) ?? 0, date: new Date(cur) });
          if (cur.getMonth() !== lastMonth && cur.getDate() <= 7) {
            monthLabels.push({ col: weeks.length, label: MONTHS[cur.getMonth()] });
            lastMonth = cur.getMonth();
          }
        } else {
          week.push(null);
        }
        cur.setDate(cur.getDate() + 1);
      }
      weeks.push(week);
    }

    const maxDaily = Math.max(1, ...[...daily.values()]);
    const yearTotal = [...daily.values()].reduce((s, v) => s + v, 0);
    return { weeks, monthLabels, maxDaily, yearTotal, activeDays: daily.size };
  }, [activities, year]);

  const level = (miles: number) => {
    if (miles <= 0) return 0;
    return Math.min(4, Math.ceil((miles / maxDaily) * 4));
  };
  const cellClass = (lvl: number) =>
    ['bg-gray-800', 'bg-emerald-900', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-300'][lvl];

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CalendarRange size={20} className="text-emerald-400" />
          Training calendar
        </h3>
        <div className="flex items-center gap-1.5">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`text-xs px-2.5 py-1 rounded-md border transition ${
                year === y ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Flame size={12} className="text-orange-400" /> Current streak</div>
          <div className="text-xl font-bold text-white">{streaks.current} <span className="text-sm text-gray-400">days</span></div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">Longest streak</div>
          <div className="text-xl font-bold text-white">{streaks.longest} <span className="text-sm text-gray-400">days</span></div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">{year} active days</div>
          <div className="text-xl font-bold text-white">{activeDays}</div>
        </div>
        <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700">
          <div className="text-xs text-gray-400 mb-1">{year} distance</div>
          <div className="text-xl font-bold text-white">{yearTotal.toFixed(0)} <span className="text-sm text-gray-400">mi</span></div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          <div className="flex gap-[3px] mb-1 ml-7 text-[10px] text-gray-500 relative h-3">
            {monthLabels.map((m, i) => (
              <span key={i} className="absolute" style={{ left: `${m.col * 13}px` }}>{m.label}</span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="flex flex-col gap-[3px] mr-1 text-[9px] text-gray-500 justify-around pr-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day ? `${day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${day.miles.toFixed(1)} mi` : ''}
                    className={`w-[10px] h-[10px] rounded-sm ${day ? cellClass(level(day.miles)) : 'bg-transparent'}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500 justify-end">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <div key={l} className={`w-[10px] h-[10px] rounded-sm ${cellClass(l)}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
