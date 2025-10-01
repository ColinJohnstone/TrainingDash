import React, { useState, useEffect } from 'react';
import { Activity, ExternalLink, Calendar, Clock, MapPin } from 'lucide-react';

interface StravaWorkout {
  id: string;
  name: string;
  type: string;
  distance: number;
  duration: string;
  date: string;
  pace?: string;
  elevation?: number;
  location?: string;
}

const StravaLastWorkout: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastWorkout, setLastWorkout] = useState<StravaWorkout | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is connected to Strava (mock)
    const stravaConnected = localStorage.getItem('strava_connected') === 'true';
    setIsConnected(stravaConnected);
    
    if (stravaConnected) {
      fetchLastWorkout();
    }
  }, []);

  const fetchLastWorkout = () => {
    setLoading(true);
    // Mock Strava API call
    setTimeout(() => {
      const mockWorkout: StravaWorkout = {
        id: '12345',
        name: 'Morning Run in Aurora',
        type: 'Run',
        distance: 5.2,
        duration: '42:15',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pace: '8:07/mi',
        elevation: 125,
        location: 'Aurora, ON'
      };
      setLastWorkout(mockWorkout);
      setLoading(false);
    }, 1000);
  };

  const connectToStrava = () => {
    setLoading(true);
    // Mock Strava OAuth flow
    setTimeout(() => {
      localStorage.setItem('strava_connected', 'true');
      setIsConnected(true);
      fetchLastWorkout();
    }, 2000);
  };

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

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity size={24} className="text-orange-400" />
            <h3 className="text-xl font-bold text-white">Last Workout</h3>
          </div>
          <div className="mb-4">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <ExternalLink size={24} className="text-orange-400" />
            </div>
            <p className="text-gray-300 mb-4">
              Connect your Strava account to see your latest workout and track your progress!
            </p>
          </div>
          <button
            onClick={connectToStrava}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-orange-500 hover:border-orange-400 flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <ExternalLink size={18} />
                Connect to Strava
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity size={24} className="text-orange-400" />
            <h3 className="text-xl font-bold text-white">Last Workout</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-300">Loading your latest workout...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!lastWorkout) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity size={24} className="text-orange-400" />
            <h3 className="text-xl font-bold text-white">Last Workout</h3>
          </div>
          <p className="text-gray-400">No recent workouts found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={24} className="text-orange-400" />
          <h3 className="text-xl font-bold text-white">Last Workout</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Strava Connected</span>
        </div>
      </div>

      <div className={`bg-gradient-to-r ${getActivityColor(lastWorkout.type)} rounded-lg p-4 border`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getActivityIcon(lastWorkout.type)}</span>
            <div>
              <h4 className="font-bold text-white text-lg leading-tight">{lastWorkout.name}</h4>
              <p className="text-sm text-gray-300">{lastWorkout.type}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={14} />
            <span>{lastWorkout.distance} miles</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock size={14} />
            <span>{lastWorkout.duration}</span>
          </div>
          {lastWorkout.pace && (
            <div className="flex items-center gap-2 text-gray-300">
              <Activity size={14} />
              <span>{lastWorkout.pace}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar size={14} />
            <span>{new Date(lastWorkout.date).toLocaleDateString()}</span>
          </div>
        </div>

        {lastWorkout.location && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin size={12} />
              <span>{lastWorkout.location}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => window.open(`https://strava.com/activities/${lastWorkout.id}`, '_blank')}
        className="w-full mt-4 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-orange-600/30 hover:border-orange-500/50 flex items-center justify-center gap-2"
      >
        <ExternalLink size={14} />
        View on Strava
      </button>
    </div>
  );
};

export default StravaLastWorkout;