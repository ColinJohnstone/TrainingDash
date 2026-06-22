import React, { useMemo, useState } from 'react';
import { Target, Check } from 'lucide-react';
import { ActivitySummary } from '../data/strava';

interface Props {
  activities: ActivitySummary[];
}

const GOAL_KEY = 'weekly_goal_mi';
const DEFAULT_GOAL = 20;

function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

const WeeklyGoal: React.FC<Props> = ({ activities }) => {
  const [goal, setGoal] = useState<number>(() => {
    const saved = Number(localStorage.getItem(GOAL_KEY));
    return saved > 0 ? saved : DEFAULT_GOAL;
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(goal));

  const done = useMemo(() => {
    const start = weekStart(new Date()).getTime();
    return activities.reduce((sum, a) => (new Date(a.date).getTime() >= start ? sum + a.distanceMi : sum), 0);
  }, [activities]);

  const pct = Math.min(1, goal > 0 ? done / goal : 0);
  const complete = done >= goal && goal > 0;
  const remaining = Math.max(0, goal - done);

  const save = () => {
    const v = Math.max(1, Math.round(Number(draft) || 0));
    setGoal(v);
    localStorage.setItem(GOAL_KEY, String(v));
    setEditing(false);
  };

  // Ring geometry
  const R = 52;
  const C = 2 * Math.PI * R;
  const accent = complete ? '#34d399' : '#22d3ee';

  return (
    <div className="glass-card rounded-xl p-5 border border-white/10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target size={18} className="text-cyan-400" />
          Weekly goal
        </h3>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-16 bg-gray-800 border border-white/15 rounded px-2 py-1 text-white text-sm"
              autoFocus
            />
            <button onClick={save} className="p-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white" aria-label="Save goal">
              <Check size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setDraft(String(goal));
              setEditing(true);
            }}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition"
          >
            Edit
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center py-2">
        <div className="relative" style={{ width: 140, height: 140 }}>
          <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={accent}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{done.toFixed(1)}</span>
            <span className="text-xs text-gray-400">of {goal} mi</span>
          </div>
        </div>
      </div>

      <p className="text-center text-sm mt-1">
        {complete ? (
          <span className="text-emerald-400 font-medium">Goal smashed! 🎉</span>
        ) : (
          <span className="text-gray-400">{remaining.toFixed(1)} mi to go</span>
        )}
      </p>
    </div>
  );
};

export default WeeklyGoal;
