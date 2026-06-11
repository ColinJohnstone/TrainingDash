// Client-side data layer for races (synced via the /api/races serverless
// function, backed by Vercel KV).

import { useCallback, useEffect, useState } from 'react';

export interface Race {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type?: string;
  location?: string;
  distance?: string;
}

export type RaceInput = Omit<Race, 'id'>;
export type RaceError = 'not_configured' | 'request_failed';

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (res.status === 503) throw 'not_configured' as RaceError;
  if (!res.ok) throw 'request_failed' as RaceError;
  try {
    return (await res.json()) as T;
  } catch {
    // Not JSON — e.g. Vite's SPA fallback when no serverless backend is running.
    throw 'not_configured' as RaceError;
  }
}

export async function getRaces(): Promise<Race[]> {
  let res: Response;
  try {
    res = await fetch('/api/races');
  } catch {
    throw 'not_configured' as RaceError;
  }
  const data = await parseOrThrow<{ races?: Race[]; error?: string }>(res);
  if (data.error) throw 'request_failed' as RaceError;
  return data.races ?? [];
}

export async function addRace(input: RaceInput): Promise<Race> {
  const res = await fetch('/api/races', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await parseOrThrow<{ race: Race }>(res);
  return data.race;
}

export async function deleteRace(id: string): Promise<void> {
  const res = await fetch(`/api/races?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  await parseOrThrow<{ ok: boolean }>(res);
}

export interface UseRaces {
  races: Race[];
  loading: boolean;
  error: RaceError | null;
  add: (input: RaceInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reload: () => void;
}

export function useRaces(): UseRaces {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<RaceError | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    getRaces()
      .then(setRaces)
      .catch((e: RaceError) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(async (input: RaceInput) => {
    const race = await addRace(input);
    setRaces((prev) => [...prev, race]);
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteRace(id);
    setRaces((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { races, loading, error, add, remove, reload };
}
