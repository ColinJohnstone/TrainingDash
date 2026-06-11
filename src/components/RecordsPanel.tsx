import React, { useMemo } from 'react';
import { Trophy, Award } from 'lucide-react';
import { ActivitySummary } from '../data/strava';
import { sportIcon, formatDistance, formatDuration, formatDate } from '../lib/activity';
import { eddington, eddingtonNext } from '../lib/stats';

interface Props {
  activities: ActivitySummary[];
  onSelect: (a: ActivitySummary) => void;
}

function maxBy(list: ActivitySummary[], fn: (a: ActivitySummary) => number): ActivitySummary | null {
  let best: ActivitySummary | null = null;
  let bestV = -Infinity;
  for (const a of list) {
    const v = fn(a);
    if (v > bestV) {
      bestV = v;
      best = a;
    }
  }
  return best;
}
function minBy(list: ActivitySummary[], fn: (a: ActivitySummary) => number): ActivitySummary | null {
  let best: ActivitySummary | null = null;
  let bestV = Infinity;
  for (const a of list) {
    const v = fn(a);
    if (v < bestV) {
      bestV = v;
      best = a;
    }
  }
  return best;
}

const EddCard: React.FC<{ label: string; e: number; need: number }> = ({ label, e, need }) => (
  <div className="bg-gray-900/40 rounded-lg p-3 border border-gray-700 text-center">
    <div className="text-xs text-gray-400 mb-1">{label} Eddington</div>
    <div className="text-3xl font-bold text-white">{e}</div>
    <div className="text-[11px] text-gray-500 mt-1">{need} more ≥{e + 1}mi to reach {e + 1}</div>
  </div>
);

const RecordsPanel: React.FC<Props> = ({ activities, onSelect }) => {
  const records = useMemo(() => {
    const runs = activities.filter((a) => a.sport === 'Run');
    const rides = activities.filter((a) => a.sport === 'Ride');
    const swims = activities.filter((a) => a.sport === 'Swim');

    const items: { label: string; value: string; act: ActivitySummary | null }[] = [
      { label: 'Longest run', value: '', act: maxBy(runs, (a) => a.distanceMi) },
      { label: 'Longest ride', value: '', act: maxBy(rides, (a) => a.distanceMi) },
      { label: 'Longest swim', value: '', act: maxBy(swims, (a) => a.distanceMi) },
      { label: 'Biggest climb', value: '', act: maxBy(activities, (a) => a.elevationFt) },
      { label: 'Longest duration', value: '', act: maxBy(activities, (a) => a.movingTimeSec) },
      {
        label: 'Fastest run pace',
        value: '',
        act: minBy(runs.filter((a) => a.distanceMi >= 1 && a.movingTimeSec > 0), (a) => a.movingTimeSec / a.distanceMi),
      },
    ];

    return items
      .filter((it) => it.act)
      .map((it) => {
        const a = it.act!;
        let value = '';
        if (it.label === 'Biggest climb') value = `${a.elevationFt.toLocaleString()} ft`;
        else if (it.label === 'Longest duration') value = formatDuration(a.movingTimeSec);
        else if (it.label === 'Fastest run pace') {
          const sec = a.movingTimeSec / a.distanceMi;
          value = `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}/mi`;
        } else value = formatDistance(a);
        return { ...it, value, act: a };
      });
  }, [activities]);

  const edd = useMemo(() => {
    const all = activities.map((a) => a.distanceMi);
    const run = activities.filter((a) => a.sport === 'Run').map((a) => a.distanceMi);
    const ride = activities.filter((a) => a.sport === 'Ride').map((a) => a.distanceMi);
    const mk = (d: number[]) => {
      const e = eddington(d);
      return { e, need: eddingtonNext(d, e) };
    };
    return { all: mk(all), run: mk(run), ride: mk(ride) };
  }, [activities]);

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 shadow-xl border border-gray-700">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <Trophy size={20} className="text-yellow-400" />
        Records
      </h3>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <EddCard label="Overall" e={edd.all.e} need={edd.all.need} />
        <EddCard label="Run" e={edd.run.e} need={edd.run.need} />
        <EddCard label="Ride" e={edd.ride.e} need={edd.ride.need} />
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {records.map((r) => (
          <button
            key={r.label}
            onClick={() => r.act && onSelect(r.act)}
            className="text-left bg-gray-900/40 hover:bg-gray-900/70 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition flex items-center gap-3"
          >
            <Award size={16} className="text-yellow-500/80 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-400">{r.label}</div>
              <div className="font-bold text-white">{r.value}</div>
              <div className="text-xs text-gray-500 truncate">
                {sportIcon(r.act.sport)} {r.act.name} · {formatDate(r.act.date, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecordsPanel;
