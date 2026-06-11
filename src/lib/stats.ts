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
