// Client-side data layer for the Strava integration.
// Fetches from the /api/activities serverless function (which holds the
// secrets). The browser never sees any Strava credentials.

export interface StravaWorkout {
  id: string;
  name: string;
  type: string;
  distance: number; // miles
  duration: string;
  date: string; // YYYY-MM-DD
  pace?: string;
  elevation?: number; // feet
  location?: string;
}

export interface StravaStatsData {
  totalRun: number;
  totalBike: number;
  totalSwim: number;
  thisWeekRun: number;
  thisWeekBike: number;
  thisWeekSwim: number;
  lastUpdated: string;
}

export interface StravaPayload {
  lastWorkout: StravaWorkout | null;
  stats: StravaStatsData;
}

export type StravaError = 'not_configured' | 'request_failed';

export async function fetchStravaData(): Promise<StravaPayload> {
  let res: Response;
  try {
    res = await fetch('/api/activities');
  } catch {
    // Network error — e.g. running plain `vite` with no serverless backend.
    throw 'not_configured' as StravaError;
  }

  if (res.status === 503) {
    throw 'not_configured' as StravaError;
  }
  if (!res.ok) {
    throw 'request_failed' as StravaError;
  }

  let data: StravaPayload & { error?: string };
  try {
    data = (await res.json()) as StravaPayload & { error?: string };
  } catch {
    // Not JSON — typically Vite's SPA fallback when no serverless backend.
    throw 'not_configured' as StravaError;
  }
  if (data.error) {
    throw (data.error === 'not_configured' ? 'not_configured' : 'request_failed') as StravaError;
  }
  return data;
}
