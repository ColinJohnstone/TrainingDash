import React, { useMemo, useState } from 'react';
import { RefreshCw, Flame, CalendarClock, Activity as ActivityIcon } from 'lucide-react';
import Header from './Header';
import RaceCountdown from './RaceCountdown';
import RacesManager from './RacesManager';
import StravaStats from './StravaStats';
import ActivityList from './ActivityList';
import ActivityDetailModal from './ActivityDetailModal';
import FunFact from './FunFact';
import WeeklyGoal from './WeeklyGoal';
import WeeklySummary from './WeeklySummary';
import WorkoutSummary from './WorkoutSummary';
import { useRaces } from '../data/races';
import { useStravaData, ActivitySummary } from '../data/strava';
import { formatDistance, sportIcon, parseLocalDate } from '../lib/activity';
import { computeDayStreaks } from '../lib/stats';

const Kpi: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  onClick?: () => void;
}> = ({ icon, label, value, sub, onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`glass-card rounded-xl p-4 border border-white/10 text-left ${onClick ? 'hover:border-white/20 transition' : ''}`}
    >
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-white leading-tight truncate">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5 truncate">{sub}</div>}
    </Tag>
  );
};

const Home: React.FC = () => {
  const { races, loading: racesLoading, error: racesError, add, edit, remove } = useRaces();
  const { data, loading: stravaLoading, reload: reloadStrava } = useStravaData();
  const [selected, setSelected] = useState<ActivitySummary | null>(null);

  const activities = useMemo(() => data?.activities ?? [], [data]);
  const streaks = useMemo(() => computeDayStreaks(activities), [activities]);
  const allTime = data ? data.stats.totalRun + data.stats.totalBike + data.stats.totalSwim : 0;
  const last = activities[0] ?? null;
  const recent = useMemo(() => activities.slice(0, 5), [activities]);
  const initialLoading = stravaLoading && !data;

  const nextRace = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = [...races]
      .sort((a, b) => a.date.localeCompare(b.date))
      .find((r) => parseLocalDate(r.date) >= today);
    if (!upcoming) return null;
    const days = Math.round((parseLocalDate(upcoming.date).getTime() - today.getTime()) / 86400000);
    return { name: upcoming.name, days };
  }, [races]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Header />
        <button
          onClick={reloadStrava}
          disabled={stravaLoading}
          className="flex items-center gap-2 glass-soft hover:bg-white/10 disabled:opacity-50 text-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition border border-white/10 shrink-0"
        >
          <RefreshCw size={15} className={stravaLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Next race */}
      <div className="mb-5">
        <RaceCountdown races={races} />
      </div>

      {/* Weekly goal + this-week vs last-week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <WeeklyGoal activities={activities} />
        <WeeklySummary activities={activities} />
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Kpi
          icon={<Flame size={12} className="text-orange-400" />}
          label="Current streak"
          value={`${streaks.current}d`}
          sub={`Longest ${streaks.longest}d`}
        />
        <Kpi
          icon={<ActivityIcon size={12} className="text-red-400" />}
          label="Last activity"
          value={last ? `${sportIcon(last.sport)} ${formatDistance(last)}` : '—'}
          sub={last ? last.name : undefined}
          onClick={last ? () => setSelected(last) : undefined}
        />
        <Kpi
          icon={<CalendarClock size={12} className="text-indigo-400" />}
          label="All-time"
          value={`${allTime.toFixed(0)} mi`}
          sub="run + ride + swim"
        />
      </div>

      {/* AI coach summary */}
      <div className="mb-4">
        <WorkoutSummary stats={data?.stats ?? null} activities={activities} nextRace={nextRace} />
      </div>

      {/* Fun fact */}
      <div className="mb-6">
        <FunFact stats={data?.stats ?? null} />
      </div>

      {/* Recent activities + all-time breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="glass-card rounded-xl p-5 shadow-xl border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <ActivityIcon size={18} className="text-cyan-400" />
            Recent activities
          </h3>
          {initialLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recent.length > 0 ? (
            <ActivityList activities={recent} onSelect={setSelected} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No activities yet.</p>
          )}
        </div>
        <StravaStats stats={data?.stats ?? null} loading={initialLoading} />
      </div>

      <RacesManager
        races={races}
        loading={racesLoading}
        error={racesError}
        onAdd={add}
        onEdit={edit}
        onDelete={remove}
      />

      {selected && <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default Home;
