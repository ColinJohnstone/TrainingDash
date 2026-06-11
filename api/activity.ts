// GET /api/activity?id=123  → rich detail for one activity (splits, gear,
// description, calories, route polyline).

import { isAuthed, unauthorized } from '../lib/auth';
import {
  getAccessToken,
  summarize,
  StravaApiActivity,
  METERS_PER_MILE,
  METERS_PER_FOOT,
} from '../lib/strava';

export const config = { runtime: 'edge' };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 's-maxage=300, stale-while-revalidate=600',
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (!(await isAuthed(req))) return unauthorized();
  if (!process.env.STRAVA_REFRESH_TOKEN) return json({ error: 'not_configured' }, 503);

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return json({ error: 'id is required' }, 400);

  try {
    const accessToken = await getAccessToken();
    const res = await fetch(
      `https://www.strava.com/api/v3/activities/${encodeURIComponent(id)}?include_all_efforts=false`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (res.status === 404) return json({ error: 'not found' }, 404);
    if (!res.ok) throw new Error(`Strava activity fetch failed (${res.status})`);

    const a = (await res.json()) as StravaApiActivity;

    const splits = (a.splits_standard ?? []).map((s) => ({
      index: s.split,
      distanceMi: s.distance / METERS_PER_MILE,
      timeSec: s.moving_time,
      paceSecPerMi: s.distance ? s.moving_time / (s.distance / METERS_PER_MILE) : 0,
      elevationFt: s.elevation_difference != null
        ? Math.round(s.elevation_difference / METERS_PER_FOOT)
        : undefined,
      avgHeartrate: s.average_heartrate ? Math.round(s.average_heartrate) : undefined,
    }));

    return json({
      ...summarize(a),
      description: a.description || undefined,
      calories: a.calories ?? undefined,
      gear: a.gear?.name || undefined,
      deviceName: a.device_name || undefined,
      prCount: a.pr_count ?? undefined,
      kilojoules: a.kilojoules ? Math.round(a.kilojoules) : undefined,
      splits,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'unknown_error' }, 502);
  }
}
