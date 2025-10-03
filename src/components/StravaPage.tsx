import React from 'react';
import StravaLastWorkout from './StravaLastWorkout';
import StravaStats from './StravaStats';

const StravaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Strava Metrics
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-full">
            <StravaLastWorkout />
          </div>
          <div className="flex flex-col gap-4 h-full">
            <StravaStats />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StravaPage;
