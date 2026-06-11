import React from 'react';
import { RefreshCw } from 'lucide-react';
import Header from './Header';
import RaceCountdown from './RaceCountdown';
import RacesManager from './RacesManager';
import StravaStats from './StravaStats';
import StravaLastWorkout from './StravaLastWorkout';
import { useRaces } from '../data/races';
import { useStravaData } from '../data/strava';

const Home: React.FC = () => {
  const { races, loading: racesLoading, error: racesError, add, edit, remove } = useRaces();
  const { data, loading: stravaLoading, reload: reloadStrava } = useStravaData();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Header />
        <button
          onClick={reloadStrava}
          disabled={stravaLoading}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-white/15 shrink-0"
        >
          <RefreshCw size={15} className={stravaLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <RaceCountdown races={races} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <StravaLastWorkout workout={data?.lastWorkout ?? null} loading={stravaLoading} />
        <StravaStats stats={data?.stats ?? null} loading={stravaLoading} />
      </div>

      <RacesManager
        races={races}
        loading={racesLoading}
        error={racesError}
        onAdd={add}
        onEdit={edit}
        onDelete={remove}
      />
    </div>
  );
};

export default Home;
