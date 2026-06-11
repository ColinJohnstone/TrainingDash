// Shared Strava helpers for the serverless functions: token refresh, sport
// normalization, and converting raw Strava activities into the normalized
// shape the frontend consumes.

const METERS_PER_MILE = 1609.34;
const METERS_PER_FOOT = 0.3048;

// Fields we read off Strava's activity objects (summary + detail).
export interface StravaApiActivity {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  distance: number;
  moving_time?: number;
  elapsed_time?: number;
  total_elevation_gain?: number;
  start_date: string;
  start_date_local?: string;
  location_city?: string | null;
  location_state?: string | null;
  average_speed?: number;
  max_speed?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  average_cadence?: number;
  kilojoules?: number;
  calories?: number;
  achievement_count?: number;
  pr_count?: number;
  kudos_count?: number;
  description?: string;
  device_name?: string;
  gear?: { name?: string } | null;
  map?: { summary_polyline?: string; polyline?: string } | null;
  splits_standard?: Array<{
    distance: number;
    moving_time: number;
    elevation_difference?: number;
    average_heartrate?: number;
    split: number;
  }>;
}

// The normalized activity summary returned to the client.
export interface ActivitySummary {
  id: string;
  name: string;
  sport: string;
  rawType: string;
  date: string; // local ISO timestamp
  distanceMi: number;
  movingTimeSec: number;
  elapsedTimeSec: number;
  elevationFt: number;
  avgSpeedMph: number;
  avgHeartrate?: number;
  maxHeartrate?: number;
  avgWatts?: number;
  avgCadence?: number;
  achievements?: number;
  kudos?: number;
  location?: string;
  polyline?: string;
}

// Collapse Strava's many subtypes into a handful of display sports.
export function normalizeSport(t: string): string {
  if (!t) return 'Workout';
  if (t.includes('Run')) return 'Run';
  if (t.includes('Ride') || t === 'EBikeRide' || t === 'Velomobile') return 'Ride';
  if (t === 'Swim') return 'Swim';
  if (t === 'Walk') return 'Walk';
  if (t === 'Hike') return 'Hike';
  if (t === 'AlpineSki' || t === 'NordicSki' || t === 'BackcountrySki' || t === 'Snowboard') return 'Ski';
  if (t === 'Rowing' || t === 'Kayaking' || t === 'Canoeing' || t === 'StandUpPaddling') return 'Row';
  if (t === 'WeightTraining' || t === 'Workout' || t === 'Crossfit' || t === 'Yoga' || t === 'HIIT') return 'Workout';
  return t;
}

export function summarize(a: StravaApiActivity): ActivitySummary {
  return {
    id: String(a.id),
    name: a.name,
    sport: normalizeSport(a.sport_type || a.type),
    rawType: a.sport_type || a.type,
    date: a.start_date_local || a.start_date,
    distanceMi: a.distance / METERS_PER_MILE,
    movingTimeSec: a.moving_time ?? 0,
    elapsedTimeSec: a.elapsed_time ?? 0,
    elevationFt: Math.round((a.total_elevation_gain ?? 0) / METERS_PER_FOOT),
    avgSpeedMph: (a.average_speed ?? 0) * 2.23694,
    avgHeartrate: a.average_heartrate ? Math.round(a.average_heartrate) : undefined,
    maxHeartrate: a.max_heartrate ? Math.round(a.max_heartrate) : undefined,
    avgWatts: a.average_watts ? Math.round(a.average_watts) : undefined,
    avgCadence: a.average_cadence ? Math.round(a.average_cadence) : undefined,
    achievements: a.achievement_count,
    kudos: a.kudos_count,
    location: [a.location_city, a.location_state].filter(Boolean).join(', ') || undefined,
    polyline: a.map?.summary_polyline || a.map?.polyline || undefined,
  };
}

// Exchange the long-lived refresh token for a short-lived access token.
export async function getAccessToken(): Promise<string> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
    }),
  });
  if (!res.ok) throw new Error(`Strava token refresh failed (${res.status})`);
  const data = await res.json();
  return data.access_token as string;
}

export { METERS_PER_MILE, METERS_PER_FOOT };
