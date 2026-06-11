import React from 'react';
import { TrendingUp, Target } from 'lucide-react';
import { StravaStatsData } from '../data/strava';

interface Props {
  stats: StravaStatsData | null;
  loading: boolean;
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700 h-full flex flex-col">
    <div className="flex items-center gap-2 mb-6">
      <TrendingUp size={24} className="text-blue-400" />
      <h3 className="text-xl font-bold text-white">Training Stats</h3>
    </div>
    {children}
  </div>
);

const StatItem = ({ icon, label, total, thisWeek, color }: {
  icon: string;
  label: string;
  total: number;
  thisWeek: number;
  color: string;
}) => (
  <div className={`bg-gradient-to-r ${color} rounded-lg p-4 border`}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-xl">{icon}</span>
      <span className="font-semibold text-white text-sm">{label}</span>
    </div>
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300">All-time:</span>
        <span className="font-bold text-white">{total.toFixed(1)} mi</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-300">This week:</span>
        <span className="font-medium text-gray-200">{thisWeek.toFixed(1)} mi</span>
      </div>
    </div>
  </div>
);

const StravaStats: React.FC<Props> = ({ stats, loading }) => {
  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300 text-sm">Loading stats…</span>
        </div>
      </Shell>
    );
  }

  if (!stats) {
    return (
      <Shell>
        <p className="text-gray-400 text-sm text-center py-8">No stats available.</p>
      </Shell>
    );
  }

  const allTimeTotal = stats.totalRun + stats.totalBike + stats.totalSwim;
  const weekTotal = stats.thisWeekRun + stats.thisWeekBike + stats.thisWeekSwim;

  return (
    <Shell>
      <div className="grid grid-cols-1 gap-4 mb-4">
        <StatItem
          icon="🏃‍♂️"
          label="Running"
          total={stats.totalRun}
          thisWeek={stats.thisWeekRun}
          color="from-red-500/20 to-red-600/20 border-red-400"
        />
        <StatItem
          icon="🚴‍♂️"
          label="Cycling"
          total={stats.totalBike}
          thisWeek={stats.thisWeekBike}
          color="from-green-500/20 to-green-600/20 border-green-400"
        />
        <StatItem
          icon="🏊‍♂️"
          label="Swimming"
          total={stats.totalSwim}
          thisWeek={stats.thisWeekSwim}
          color="from-blue-500/20 to-blue-600/20 border-blue-400"
        />
      </div>

      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-600">
        <div className="flex items-center justify-center gap-2 text-center">
          <Target size={16} className="text-yellow-400" />
          <div>
            <div className="text-sm font-semibold text-white">
              All-time distance: {allTimeTotal.toFixed(1)} miles
            </div>
            <div className="text-xs text-gray-400">
              This week: {weekTotal.toFixed(1)} miles
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center mt-3">
        Last updated: {new Date(stats.lastUpdated).toLocaleString()}
      </div>
    </Shell>
  );
};

export default StravaStats;
