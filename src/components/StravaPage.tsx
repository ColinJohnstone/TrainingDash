import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import StravaLastWorkout from './StravaLastWorkout';
import StravaStats from './StravaStats';
import { fetchStravaData, StravaPayload, StravaError } from '../data/strava';

const StravaPage: React.FC = () => {
  const [data, setData] = useState<StravaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<StravaError | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchStravaData()
      .then((payload) => {
        setData(payload);
        setLoading(false);
      })
      .catch((err: StravaError) => {
        setError(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-4xl">📊</span>
            Strava Metrics
          </h1>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-orange-500"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error === 'not_configured' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-yellow-600/40 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="text-yellow-400 mt-0.5 shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-white mb-1">Strava not connected yet</p>
                <p>
                  Add your <code className="text-yellow-300">STRAVA_CLIENT_ID</code>,{' '}
                  <code className="text-yellow-300">STRAVA_CLIENT_SECRET</code>, and{' '}
                  <code className="text-yellow-300">STRAVA_REFRESH_TOKEN</code> environment
                  variables (see <code className="text-yellow-300">STRAVA_SETUP.md</code>), then
                  redeploy. Locally, run <code className="text-yellow-300">vercel dev</code> instead
                  of <code className="text-yellow-300">npm run dev</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {error === 'request_failed' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-red-600/40 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="text-red-400 mt-0.5 shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-white mb-1">Couldn't reach Strava</p>
                <p>The API request failed. Try Refresh, or check your token hasn't been revoked.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-full">
            <StravaLastWorkout workout={data?.lastWorkout ?? null} loading={loading} />
          </div>
          <div className="flex flex-col gap-4 h-full">
            <StravaStats stats={data?.stats ?? null} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StravaPage;
