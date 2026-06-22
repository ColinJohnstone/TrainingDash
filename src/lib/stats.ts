// Pure stat computations for the Stats page.

import { ActivitySummary } from '../data/strava';
import { dayKey } from './activity';

// Eddington number: the largest E such that at least E activities each cover
// >= E miles.
export function eddington(distancesMi: number[]): number {
  const sorted = [...distancesMi].sort((a, b) => b - a);
  let e = 0;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] >= i + 1) e = i + 1;
    else break;
  }
  return e;
}

// Progress toward the next Eddington number: how many more >= (E+1)-mile
// activities are needed.
export function eddingtonNext(distancesMi: number[], e: number): number {
  const target = e + 1;
  const have = distancesMi.filter((d) => d >= target).length;
  return Math.max(0, target - have);
}

// Per-sport baseline intensity when no heart-rate data is available.
function sportBaseIntensity(sport: string): number {
  switch (sport) {
    case 'Run': return 0.85;
    case 'Ride': return 0.75;
    case 'Swim': return 0.8;
    case 'Workout': return 0.7;
    case 'Hike': return 0.6;
    case 'Walk': return 0.45;
    default: return 0.6;
  }
}

export function maxObservedHr(activities: ActivitySummary[]): number {
  return activities.reduce((m, a) => Math.max(m, a.maxHeartrate ?? a.avgHeartrate ?? 0), 0);
}

// Estimated relative effort (Strava-style "suffer score" approximation):
// minutes weighted by intensity². Intensity from HR when available, else a
// per-sport baseline. Not a medical metric — a consistent relative number.
export function effortScore(a: ActivitySummary, maxHr: number): number {
  const minutes = a.movingTimeSec / 60;
  const intensity = a.avgHeartrate && maxHr > 0
    ? Math.min(1, Math.max(0.5, a.avgHeartrate / maxHr))
    : sportBaseIntensity(a.sport);
  return Math.round(minutes * intensity * intensity * 1.5);
}

// Riegel race-time prediction: T2 = T1 * (D2/D1)^1.06.
export function riegelPredict(knownTimeSec: number, knownMiles: number, targetMiles: number): number {
  if (knownMiles <= 0 || knownTimeSec <= 0 || targetMiles <= 0) return 0;
  return knownTimeSec * Math.pow(targetMiles / knownMiles, 1.06);
}

function localKeyFromParts(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function nextDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d + 1);
  return localKeyFromParts(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

// Current and longest streaks of consecutive calendar days with >= 1 activity.
export function computeDayStreaks(activities: ActivitySummary[]): { current: number; longest: number } {
  const set = new Set(activities.map((a) => dayKey(a.date)));
  if (set.size === 0) return { current: 0, longest: 0 };

  const uniq = [...set].sort();
  let longest = 0;
  let run = 0;
  for (let i = 0; i < uniq.length; i++) {
    run = i > 0 && uniq[i] === nextDayKey(uniq[i - 1]) ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // Current streak: walk back from today (allow it to end yesterday).
  const now = new Date();
  let cursor = localKeyFromParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
  let current = 0;
  if (!set.has(cursor)) {
    const [y, m, d] = cursor.split('-').map(Number);
    const yest = new Date(y, m - 1, d - 1);
    cursor = localKeyFromParts(yest.getFullYear(), yest.getMonth() + 1, yest.getDate());
  }
  while (set.has(cursor)) {
    current += 1;
    const [y, m, d] = cursor.split('-').map(Number);
    const prev = new Date(y, m - 1, d - 1);
    cursor = localKeyFromParts(prev.getFullYear(), prev.getMonth() + 1, prev.getDate());
  }

  return { current, longest };
}
