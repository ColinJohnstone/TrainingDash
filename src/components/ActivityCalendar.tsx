import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { sportIcon, sportColor, formatDistance, dayKey } from '../lib/activity';

interface Props {
  activities: ActivitySummary[];
  onSelect: (a: ActivitySummary) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ActivityCalendar: React.FC<Props> = ({ activities, onSelect }) => {
  const [cursor, setCursor] = useState(() => {
    const d = activities.length ? new Date(activities[0].date) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const byDay = useMemo(() => {
    const map = new Map<string, ActivitySummary[]>();
    for (const a of activities) {
      const k = dayKey(a.date);
      (map.get(k) ?? map.set(k, []).get(k)!).push(a);
    }
    return map;
  }, [activities]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dayKey(new Date().toISOString());

  // 6 rows x 7 cols grid; leading blanks for the first week.
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthTotal = activities
    .filter((a) => {
      const d = new Date(a.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, a) => sum + a.distanceMi, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-white/15 text-gray-300"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <div className="text-xs text-gray-500">{monthTotal.toFixed(1)} mi this month</div>
        </div>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-white/15 text-gray-300"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] uppercase tracking-wide text-gray-500 py-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="min-h-[72px]" />;
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayActs = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          return (
            <div
              key={i}
              className={`min-h-[72px] rounded-lg border p-1 ${
                isToday ? 'border-blue-500/60 bg-blue-500/5' : 'border-white/10 bg-gray-900/30'
              }`}
            >
              <div className={`text-[11px] mb-0.5 px-1 ${isToday ? 'text-blue-300 font-bold' : 'text-gray-500'}`}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayActs.slice(0, 3).map((a) => {
                  const color = sportColor(a.sport);
                  return (
                    <button
                      key={a.id}
                      onClick={() => onSelect(a)}
                      title={`${a.name} · ${formatDistance(a)}`}
                      className={`w-full flex items-center gap-1 rounded px-1 py-0.5 text-[10px] border ${color.badge} hover:brightness-125 transition`}
                    >
                      <span>{sportIcon(a.sport)}</span>
                      <span className="truncate">{formatDistance(a)}</span>
                    </button>
                  );
                })}
                {dayActs.length > 3 && (
                  <div className="text-[10px] text-gray-500 px-1">+{dayActs.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityCalendar;
