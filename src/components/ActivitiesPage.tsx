import React, { useMemo, useState } from 'react';
import { RefreshCw, AlertCircle, List, CalendarDays } from 'lucide-react';
import { useStravaData, ActivitySummary } from '../data/strava';
import { sportIcon } from '../lib/activity';
import ActivityAnalytics from './ActivityAnalytics';
import ActivityList from './ActivityList';
import ActivityCalendar from './ActivityCalendar';
import ActivityDetailModal from './ActivityDetailModal';

type View = 'list' | 'calendar';

const ActivitiesPage: React.FC = () => {
  const { data, loading, error, reload } = useStravaData();
  const [view, setView] = useState<View>('list');
  const [sport, setSport] = useState<string>('All');
  const [selected, setSelected] = useState<ActivitySummary | null>(null);

  const activities = useMemo(() => data?.activities ?? [], [data]);
  const sports = useMemo(() => ['All', ...Array.from(new Set(activities.map((a) => a.sport)))], [activities]);
  const filtered = useMemo(
    () => (sport === 'All' ? activities : activities.filter((a) => a.sport === sport)),
    [activities, sport],
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Activities
        </h1>
        <button
          onClick={reload}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-orange-500"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error === 'not_configured' && (
        <div className="glass-card rounded-xl p-6 shadow-xl border border-yellow-600/40 mb-4 flex items-start gap-3">
          <AlertCircle size={22} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-300">
            Strava isn't connected. Set the Strava env vars (see{' '}
            <code className="text-yellow-300">STRAVA_SETUP.md</code>) and redeploy.
          </p>
        </div>
      )}
      {error === 'request_failed' && (
        <div className="glass-card rounded-xl p-6 shadow-xl border border-red-600/40 mb-4 flex items-start gap-3">
          <AlertCircle size={22} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-300">Couldn't load activities. Try Refresh.</p>
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300">Loading your activities…</span>
        </div>
      ) : activities.length === 0 && !error ? (
        <p className="text-gray-400 text-center py-16">No activities found on Strava yet.</p>
      ) : activities.length > 0 ? (
        <div className="space-y-6">
          <ActivityAnalytics activities={activities} />

          <div className="glass-card rounded-xl p-5 shadow-xl border border-white/10">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1.5 flex-wrap">
                {sports.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSport(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      sport === s
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-gray-800 text-gray-300 border-white/15 hover:bg-gray-700'
                    }`}
                  >
                    {s === 'All' ? 'All' : `${sportIcon(s)} ${s}`}
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-gray-800 rounded-lg border border-white/15 p-0.5 shrink-0">
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    view === 'list' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={14} /> List
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    view === 'calendar' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <CalendarDays size={14} /> Calendar
                </button>
              </div>
            </div>

            {view === 'list' ? (
              <ActivityList activities={filtered} onSelect={setSelected} />
            ) : (
              <ActivityCalendar activities={filtered} onSelect={setSelected} />
            )}
          </div>
        </div>
      ) : null}

      {selected && <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default ActivitiesPage;
