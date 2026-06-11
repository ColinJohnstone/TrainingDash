// Vercel Serverless Function (Edge runtime) — races CRUD backed by Vercel KV
// (Upstash Redis). Stores the race list synced across all your devices.
//
// Required environment variables (auto-set when you link a Vercel KV / Upstash
// store to the project; see KV_SETUP.md):
//   KV_REST_API_URL    (or UPSTASH_REDIS_REST_URL)
//   KV_REST_API_TOKEN  (or UPSTASH_REDIS_REST_TOKEN)

import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };

const KEY = 'races';

interface Race {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type?: string;
  location?: string;
  distance?: string;
}

// Seeded on first run only (i.e. when the KV key doesn't exist yet), migrating
// the previously-hardcoded race list. Deleting all races afterward stays empty.
const DEFAULT_RACES: Omit<Race, 'id'>[] = [
  { name: 'Ultra Armor 10K', date: '2025-06-14', type: 'Run', distance: '10K' },
  { name: 'Sprint Triathlon', date: '2025-08-17', type: 'Triathlon', distance: 'Sprint' },
  { name: 'Full Marathon', date: '2025-10-19', type: 'Run', distance: 'Marathon' },
  { name: 'Ironman 70.3', date: '2026-05-24', type: 'Triathlon', distance: '70.3' },
];

function url(): string {
  return process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
}
function token(): string {
  return process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
}
function configured(): boolean {
  return Boolean(url() && token());
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function loadRaces(redis: Redis): Promise<Race[]> {
  const existing = await redis.get<Race[]>(KEY);
  if (existing === null || existing === undefined) {
    const seeded: Race[] = DEFAULT_RACES.map((r) => ({ id: crypto.randomUUID(), ...r }));
    await redis.set(KEY, seeded);
    return seeded;
  }
  return existing;
}

export default async function handler(req: Request): Promise<Response> {
  if (!configured()) return json({ error: 'not_configured' }, 503);

  const redis = new Redis({ url: url(), token: token() });

  try {
    if (req.method === 'GET') {
      return json({ races: await loadRaces(redis) });
    }

    if (req.method === 'POST') {
      const body = (await req.json()) as Partial<Race>;
      if (!body.name || !body.date) {
        return json({ error: 'name and date are required' }, 400);
      }
      const races = await loadRaces(redis);
      const race: Race = {
        id: crypto.randomUUID(),
        name: body.name,
        date: body.date,
        type: body.type,
        location: body.location,
        distance: body.distance,
      };
      races.push(race);
      await redis.set(KEY, races);
      return json({ race }, 201);
    }

    if (req.method === 'PUT') {
      const body = (await req.json()) as Partial<Race>;
      if (!body.id) return json({ error: 'id is required' }, 400);
      const races = await loadRaces(redis);
      const idx = races.findIndex((r) => r.id === body.id);
      if (idx === -1) return json({ error: 'race not found' }, 404);
      races[idx] = { ...races[idx], ...body, id: races[idx].id };
      await redis.set(KEY, races);
      return json({ race: races[idx] });
    }

    if (req.method === 'DELETE') {
      const id = new URL(req.url).searchParams.get('id');
      if (!id) return json({ error: 'id is required' }, 400);
      const races = (await loadRaces(redis)).filter((r) => r.id !== id);
      await redis.set(KEY, races);
      return json({ ok: true });
    }

    return json({ error: 'method not allowed' }, 405);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'unknown_error' }, 500);
  }
}
