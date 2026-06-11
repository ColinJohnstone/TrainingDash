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
import { getAccessToken, normalizeSport, summarize, StravaApiActivity } from '../lib/strava';

export const config = { runtime: 'edge' };

const METERS_PER_MILE = 1609.34;
const METERS_PER_FOOT = 0.3048;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// How many recent activities to pull (Strava max per page is 200).
const PER_PAGE = 200;

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
      fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${PER_PAGE}`, { headers }),
    ]);

    if (!athleteRes.ok) throw new Error(`Strava athlete fetch failed (${athleteRes.status})`);
    if (!activitiesRes.ok) throw new Error(`Strava activities fetch failed (${activitiesRes.status})`);

    const athlete = await athleteRes.json();
    const raw = (await activitiesRes.json()) as StravaApiActivity[];

    // All-time totals come from the dedicated stats endpoint (accurate, not
    // limited to the recent activity list).
    const statsRes = await fetch(
      `https://www.strava.com/api/v3/athletes/${athlete.id}/stats`,
      { headers },
    );
    if (!statsRes.ok) throw new Error(`Strava stats fetch failed (${statsRes.status})`);
    const athleteStats = await statsRes.json();

    const totalRun = (athleteStats.all_run_totals?.distance ?? 0) / METERS_PER_MILE;
    const totalBike = (athleteStats.all_ride_totals?.distance ?? 0) / METERS_PER_MILE;
    const totalSwim = (athleteStats.all_swim_totals?.distance ?? 0) / METERS_PER_MILE;

    // Full normalized list for the list/calendar/analytics views.
    const activities = raw.map(summarize);

    // "This week" = rolling last 7 days, summed from the recent activity list.
    const cutoff = Date.now() - WEEK_MS;
    let thisWeekRun = 0;
    let thisWeekBike = 0;
    let thisWeekSwim = 0;
    for (const a of raw) {
      if (new Date(a.start_date).getTime() < cutoff) continue;
      const miles = a.distance / METERS_PER_MILE;
      const sport = normalizeSport(a.sport_type || a.type);
      if (sport === 'Run') thisWeekRun += miles;
      else if (sport === 'Ride') thisWeekBike += miles;
      else if (sport === 'Swim') thisWeekSwim += miles;
    }

    // Most recent activity (Strava returns newest first) — kept for the Home card.
    const a0 = raw[0];
    const lastWorkout = a0
      ? {
          id: String(a0.id),
          name: a0.name,
          type: normalizeSport(a0.sport_type || a0.type),
          distance: a0.distance / METERS_PER_MILE,
          duration: formatDuration(a0.moving_time ?? a0.elapsed_time ?? 0),
          date: (a0.start_date_local ?? a0.start_date ?? '').split('T')[0],
          pace: normalizeSport(a0.sport_type || a0.type) === 'Run'
            ? pacePerMile(a0.distance, a0.moving_time ?? 0)
            : undefined,
          elevation: Math.round((a0.total_elevation_gain ?? 0) / METERS_PER_FOOT),
          location: [a0.location_city, a0.location_state].filter(Boolean).join(', ') || undefined,
        }
      : null;

    return json({
      lastWorkout,
      activities,
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
