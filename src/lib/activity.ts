// Display helpers for activities: sport icons/colors, metric formatting, and
// Google-polyline decoding for the route map.

import { ActivitySummary } from '../data/strava';

const YARDS_PER_MILE = 1760;

export function sportIcon(sport: string): string {
  switch (sport) {
    case 'Run':
      return '🏃';
    case 'Ride':
      return '🚴';
    case 'Swim':
      return '🏊';
    case 'Walk':
      return '🚶';
    case 'Hike':
      return '🥾';
    case 'Ski':
      return '⛷️';
    case 'Row':
      return '🚣';
    case 'Workout':
      return '🏋️';
    default:
      return '💪';
  }
}

export interface SportColor {
  hex: string;
  text: string;
  badge: string; // bg + text + border classes
}

export function sportColor(sport: string): SportColor {
  switch (sport) {
    case 'Run':
      return { hex: '#f87171', text: 'text-red-300', badge: 'bg-red-500/20 text-red-300 border-red-400/40' };
    case 'Ride':
      return { hex: '#34d399', text: 'text-green-300', badge: 'bg-green-500/20 text-green-300 border-green-400/40' };
    case 'Swim':
      return { hex: '#60a5fa', text: 'text-blue-300', badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40' };
    case 'Walk':
      return { hex: '#fbbf24', text: 'text-amber-300', badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40' };
    case 'Hike':
      return { hex: '#10b981', text: 'text-emerald-300', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
    case 'Workout':
      return { hex: '#a78bfa', text: 'text-purple-300', badge: 'bg-purple-500/20 text-purple-300 border-purple-400/40' };
    default:
      return { hex: '#9ca3af', text: 'text-gray-300', badge: 'bg-gray-500/20 text-gray-300 border-gray-400/40' };
  }
}

const usesPacePerMile = (sport: string) => sport === 'Run' || sport === 'Walk' || sport === 'Hike';

export function formatDistance(a: Pick<ActivitySummary, 'sport' | 'distanceMi'>): string {
  if (a.sport === 'Swim') {
    return `${Math.round(a.distanceMi * YARDS_PER_MILE).toLocaleString()} yd`;
  }
  return `${a.distanceMi.toFixed(2)} mi`;
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function paceString(secPerMile: number): string {
  const m = Math.floor(secPerMile / 60);
  const s = Math.floor(secPerMile % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Primary pace/speed metric, formatted per sport.
export function formatPace(a: Pick<ActivitySummary, 'sport' | 'distanceMi' | 'movingTimeSec' | 'avgSpeedMph'>): string {
  if (!a.distanceMi || !a.movingTimeSec) return '—';
  if (a.sport === 'Swim') {
    const yards = a.distanceMi * YARDS_PER_MILE;
    const secPer100 = a.movingTimeSec / (yards / 100);
    return `${paceString(secPer100)}/100yd`;
  }
  if (usesPacePerMile(a.sport)) {
    return `${paceString(a.movingTimeSec / a.distanceMi)}/mi`;
  }
  return `${a.avgSpeedMph.toFixed(1)} mph`;
}

export function formatPaceValue(secPerMile: number): string {
  return paceString(secPerMile);
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString(undefined, opts ?? { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// Local YYYY-MM-DD key (avoids UTC off-by-one for calendar bucketing).
export function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Decode a Google encoded polyline into [lat, lng] pairs.
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}
