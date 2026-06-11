// Vercel Serverless Function (Edge runtime).
// Talks to the Strava API using server-only secrets and returns your real
// activity data. The client secret + refresh token NEVER reach the browser.
//
// Required environment variables (set in Vercel project settings, or .env for
// local `vercel dev`):
//   STRAVA_CLIENT_ID
//   STRAVA_CLIENT_SECRET
//   STRAVA_REFRESH_TOKEN
//
// See STRAVA_SETUP.md for how to obtain these.

import { isAuthed, unauthorized } from '../lib/auth';

export const config = { runtime: 'edge' };

const METERS_PER_MILE = 1609.34;
const METERS_PER_FOOT = 0.3048;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Subset of the Strava activity fields we consume.
interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time?: number;
  elapsed_time?: number;
  start_date: string;
  start_date_local?: string;
  total_elevation_gain?: number;
  location_city?: string | null;
  location_state?: string | null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      // Cache at the edge for 5 min so we don't hammer Strava's rate limit.
      'cache-control': 's-maxage=300, stale-while-revalidate=600',
    },
  });
}

// Exchange the long-lived refresh token for a short-lived access token.
async function getAccessToken(): Promise<string> {
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
  if (!res.ok) {
    throw new Error(`Strava token refresh failed (${res.status})`);
  }
  const data = await res.json();
  return data.access_token as string;
}

// Collapse Strava's many activity subtypes into the three the UI knows about.
function normalizeType(t: string): 'Run' | 'Ride' | 'Swim' | string {
  if (t.includes('Run')) return 'Run';
  if (t.includes('Ride')) return 'Ride';
  if (t.includes('Swim')) return 'Swim';
  return t;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function pacePerMile(distanceMeters: number, timeSeconds: number): string | undefined {
  if (!distanceMeters || !timeSeconds) return undefined;
  const miles = distanceMeters / METERS_PER_MILE;
  const paceSeconds = timeSeconds / miles;
  const m = Math.floor(paceSeconds / 60);
  const s = Math.floor(paceSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}/mi`;
}

export default async function handler(req: Request): Promise<Response> {
  if (!(await isAuthed(req))) return unauthorized();
  if (!process.env.STRAVA_REFRESH_TOKEN) {
    return json({ error: 'not_configured' }, 503);
  }

  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    // Athlete (needed for the all-time stats endpoint) + recent activity list.
    const [athleteRes, activitiesRes] = await Promise.all([
      fetch('https://www.strava.com/api/v3/athlete', { headers }),
      fetch('https://www.strava.com/api/v3/athlete/activities?per_page=30', { headers }),
    ]);

    if (!athleteRes.ok) throw new Error(`Strava athlete fetch failed (${athleteRes.status})`);
    if (!activitiesRes.ok) throw new Error(`Strava activities fetch failed (${activitiesRes.status})`);

    const athlete = await athleteRes.json();
    const activities = (await activitiesRes.json()) as StravaActivity[];

    // All-time totals come from the dedicated stats endpoint (accurate, not
    // limited to the last 30 activities).
    const statsRes = await fetch(
      `https://www.strava.com/api/v3/athletes/${athlete.id}/stats`,
      { headers },
    );
    if (!statsRes.ok) throw new Error(`Strava stats fetch failed (${statsRes.status})`);
    const athleteStats = await statsRes.json();

    const totalRun = (athleteStats.all_run_totals?.distance ?? 0) / METERS_PER_MILE;
    const totalBike = (athleteStats.all_ride_totals?.distance ?? 0) / METERS_PER_MILE;
    const totalSwim = (athleteStats.all_swim_totals?.distance ?? 0) / METERS_PER_MILE;

    // "This week" = rolling last 7 days, summed from the recent activity list.
    const cutoff = Date.now() - WEEK_MS;
    let thisWeekRun = 0;
    let thisWeekBike = 0;
    let thisWeekSwim = 0;
    for (const a of activities) {
      if (new Date(a.start_date).getTime() < cutoff) continue;
      const miles = a.distance / METERS_PER_MILE;
      const type = normalizeType(a.type);
      if (type === 'Run') thisWeekRun += miles;
      else if (type === 'Ride') thisWeekBike += miles;
      else if (type === 'Swim') thisWeekSwim += miles;
    }

    // Most recent activity (Strava returns newest first).
    const a0 = activities[0];
    const lastWorkout = a0
      ? {
          id: String(a0.id),
          name: a0.name,
          type: normalizeType(a0.type),
          distance: a0.distance / METERS_PER_MILE,
          duration: formatDuration(a0.moving_time ?? a0.elapsed_time ?? 0),
          date: (a0.start_date_local ?? a0.start_date ?? '').split('T')[0],
          pace: normalizeType(a0.type) === 'Run'
            ? pacePerMile(a0.distance, a0.moving_time)
            : undefined,
          elevation: Math.round((a0.total_elevation_gain ?? 0) / METERS_PER_FOOT),
          location: [a0.location_city, a0.location_state].filter(Boolean).join(', ') || undefined,
        }
      : null;

    return json({
      lastWorkout,
      stats: {
        totalRun,
        totalBike,
        totalSwim,
        thisWeekRun,
        thisWeekBike,
        thisWeekSwim,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'unknown_error' }, 502);
  }
}
