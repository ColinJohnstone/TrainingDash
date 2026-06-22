import React, { useEffect, useMemo, useState } from 'react';
import { Bot, RefreshCw, AlertCircle } from 'lucide-react';
import { ActivitySummary, StravaStatsData } from '../data/strava';
import { fetchSummary, SummaryError } from '../data/summary';
import { formatDistance, formatDuration, formatPace, formatDate } from '../lib/activity';
import { computeDayStreaks } from '../lib/stats';

interface Props {
  stats: StravaStatsData | null;
  activities: ActivitySummary[];
  nextRace: { name: string; days: number } | null;
}

const CACHE_KEY = 'workout_summary_v1';

function weekKey(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function weekStartMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

function buildFacts(stats: StravaStatsData | null, activities: ActivitySummary[], nextRace: Props['nextRace']): string {
  const startThis = weekStartMs();
  const startLast = startThis - 7 * 24 * 3600 * 1000;
  let twMi = 0, twCt = 0, twSec = 0, lwMi = 0;
  for (const a of activities) {
    const t = new Date(a.date).getTime();
    if (t >= startThis) { twMi += a.distanceMi; twCt += 1; twSec += a.movingTimeSec; }
    else if (t >= startLast) lwMi += a.distanceMi;
  }
  const streaks = computeDayStreaks(activities);
  const lines: string[] = [];
  lines.push(`This week so far: ${twMi.toFixed(1)} mi across ${twCt} activit${twCt === 1 ? 'y' : 'ies'}, ${formatDuration(twSec)} moving time.`);
  lines.push(`Last week total: ${lwMi.toFixed(1)} mi.`);
  lines.push(`Current activity streak: ${streaks.current} days (longest ever ${streaks.longest}).`);
  if (stats) {
    lines.push(`All-time distance — run ${stats.totalRun.toFixed(0)} mi, ride ${stats.totalBike.toFixed(0)} mi, swim ${stats.totalSwim.toFixed(0)} mi.`);
  }
  const recent = activities.slice(0, 6);
  if (recent.length) {
    lines.push('Most recent activities:');
    for (const a of recent) {
      lines.push(`- ${a.sport} "${a.name}" ${formatDistance(a)} in ${formatDuration(a.movingTimeSec)} (${formatPace(a)})${a.avgHeartrate ? `, avg HR ${a.avgHeartrate}` : ''} on ${formatDate(a.date, { month: 'short', day: 'numeric' })}`);
    }
  }
  if (nextRace) {
    lines.push(`Upcoming race: ${nextRace.name} in ${nextRace.days} day${nextRace.days === 1 ? '' : 's'}.`);
  }
  return lines.join('\n');
}

const WorkoutSummary: React.FC<Props> = ({ stats, activities, nextRace }) => {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SummaryError | null>(null);

  const facts = useMemo(() => buildFacts(stats, activities, nextRace), [stats, activities, nextRace]);

  const generate = (force: boolean) => {
    if (!activities.length) return;
    setLoading(true);
    setError(null);
    fetchSummary(facts)
      .then((t) => {
        setText(t);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ text: t, week: weekKey() }));
        } catch {
          // best-effort cache
        }
      })
      .catch((e: SummaryError) => setError(e))
      .finally(() => setLoading(false));
    void force;
  };

  // On first load: use this-week's cached summary if present, else generate once.
  useEffect(() => {
    if (!activities.length) return;
    let cached: { text?: string; week?: string } | null = null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      cached = raw ? JSON.parse(raw) : null;
    } catch {
      cached = null;
    }
    if (cached?.text && cached.week === weekKey()) {
      setText(cached.text);
    } else if (!text) {
      generate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities.length]);

  return (
    <div className="glass-card rounded-xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500/30 to-cyan-500/30 border border-white/10">
            <Bot size={16} className="text-cyan-300" />
          </span>
          Coach's notes
        </h3>
        <button
          onClick={() => generate(true)}
          disabled={loading || !activities.length}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition disabled:opacity-40"
          title="Regenerate"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Regenerate
        </button>
      </div>

      {error === 'not_configured' ? (
        <div className="flex items-start gap-2 text-sm text-gray-300">
          <AlertCircle size={18} className="text-yellow-400 mt-0.5 shrink-0" />
          <p>
            AI summary isn't connected. Add a free <code className="text-yellow-300">GROQ_API_KEY</code> env var
            (see <code className="text-yellow-300">AI_SUMMARY_SETUP.md</code>), then redeploy.
          </p>
        </div>
      ) : error === 'request_failed' ? (
        <p className="text-sm text-gray-400">Couldn't generate a summary right now — try Regenerate.</p>
      ) : loading && !text ? (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          Analyzing your training…
        </div>
      ) : text ? (
        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{text}</p>
      ) : (
        <p className="text-sm text-gray-500">No training data yet.</p>
      )}
    </div>
  );
};

export default WorkoutSummary;
