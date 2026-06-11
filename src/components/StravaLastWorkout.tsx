import React from 'react';
import { Activity, Calendar, Clock, MapPin } from 'lucide-react';
import { StravaWorkout } from '../data/strava';

interface Props {
  workout: StravaWorkout | null;
  loading: boolean;
}

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'run':
      return '🏃‍♂️';
    case 'ride':
    case 'bike':
      return '🚴‍♂️';
    case 'swim':
      return '🏊‍♂️';
    default:
      return '💪';
  }
};

const getActivityColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'run':
      return 'from-red-500/20 to-red-600/20 border-red-400';
    case 'ride':
    case 'bike':
      return 'from-green-500/20 to-green-600/20 border-green-400';
    case 'swim':
      return 'from-blue-500/20 to-blue-600/20 border-blue-400';
    default:
      return 'from-purple-500/20 to-purple-600/20 border-purple-400';
  }
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="glass-card rounded-xl p-6 shadow-xl border border-white/10 h-full">
    <div className="flex items-center gap-2 mb-4">
      <Activity size={24} className="text-orange-400" />
      <h3 className="text-xl font-bold text-white">Last Workout</h3>
    </div>
    {children}
  </div>
);

const StravaLastWorkout: React.FC<Props> = ({ workout, loading }) => {
  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-300">Loading your latest workout…</span>
        </div>
      </Shell>
    );
  }

  if (!workout) {
    return (
      <Shell>
        <p className="text-gray-400 text-center py-8">No recent workouts found on Strava.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className={`bg-gradient-to-r ${getActivityColor(workout.type)} rounded-lg p-4 border`}>
        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl">{getActivityIcon(workout.type)}</span>
          <div>
            <h4 className="font-bold text-white text-lg leading-tight">{workout.name}</h4>
            <p className="text-sm text-gray-300">{workout.type}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={14} />
            <span>{workout.distance.toFixed(2)} miles</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock size={14} />
            <span>{workout.duration}</span>
          </div>
          {workout.pace && (
            <div className="flex items-center gap-2 text-gray-300">
              <Activity size={14} />
              <span>{workout.pace}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar size={14} />
            <span>{new Date(workout.date).toLocaleDateString()}</span>
          </div>
        </div>

        {workout.location && (
          <div className="mt-3 pt-3 border-t border-white/15">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin size={12} />
              <span>{workout.location}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => window.open(`https://www.strava.com/activities/${workout.id}`, '_blank')}
        className="w-full mt-4 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-orange-600/30 hover:border-orange-500/50 flex items-center justify-center gap-2"
      >
        <Activity size={14} />
        View on Strava
      </button>
    </Shell>
  );
};

export default StravaLastWorkout;
