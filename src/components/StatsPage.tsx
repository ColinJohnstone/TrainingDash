import React, { useMemo, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useStravaData, ActivitySummary } from '../data/strava';
import ActivityHeatmap from './ActivityHeatmap';
import RecordsPanel from './RecordsPanel';
import PeriodBreakdown from './PeriodBreakdown';
import TrendsCharts from './TrendsCharts';
import ActivityDetailModal from './ActivityDetailModal';

const StatsPage: React.FC = () => {
  const { data, loading, error, reload } = useStravaData();
  const [selected, setSelected] = useState<ActivitySummary | null>(null);
  const activities = useMemo(() => data?.activities ?? [], [data]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">📈</span>
          Stats
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

      {error && (
        <div className="glass-card rounded-xl p-6 shadow-xl border border-yellow-600/40 mb-4 flex items-start gap-3">
          <AlertCircle size={22} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-300">
            {error === 'not_configured'
              ? 'Strava isn’t connected. Set the Strava env vars and redeploy.'
              : 'Couldn’t load your activities. Try Refresh.'}
          </p>
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300">Crunching your stats…</span>
        </div>
      ) : activities.length === 0 && !error ? (
        <p className="text-gray-400 text-center py-16">No activities found on Strava yet.</p>
      ) : activities.length > 0 ? (
        <div className="space-y-6">
          <ActivityHeatmap activities={activities} />
          <RecordsPanel activities={activities} onSelect={setSelected} />
          <PeriodBreakdown activities={activities} />
          <TrendsCharts activities={activities} />
        </div>
      ) : null}

      {selected && <ActivityDetailModal activity={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default StatsPage;
