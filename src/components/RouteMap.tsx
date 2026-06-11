import React from 'react';
import { decodePolyline } from '../lib/activity';

interface Props {
  polyline: string;
  color?: string;
  height?: number;
}

// Lightweight route preview: decodes the GPS polyline and draws it as an SVG
// path (no map tiles / external deps).
const RouteMap: React.FC<Props> = ({ polyline, color = '#fb923c', height = 180 }) => {
  const points = decodePolyline(polyline);
  if (points.length < 2) return null;

  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const pad = 8;
  const w = 400;
  const h = height;
  const spanLat = maxLat - minLat || 1e-6;
  const spanLng = maxLng - minLng || 1e-6;
  // Keep aspect ratio roughly correct (latitude degrees ≈ constant length).
  const scale = Math.min((w - pad * 2) / spanLng, (h - pad * 2) / spanLat);
  const offX = (w - spanLng * scale) / 2;
  const offY = (h - spanLat * scale) / 2;

  const d = points
    .map(([lat, lng], i) => {
      const x = offX + (lng - minLng) * scale;
      const y = h - (offY + (lat - minLat) * scale); // flip Y (north up)
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const start = points[0];
  const end = points[points.length - 1];
  const sx = offX + (start[1] - minLng) * scale;
  const sy = h - (offY + (start[0] - minLat) * scale);
  const ex = offX + (end[1] - minLng) * scale;
  const ey = h - (offY + (end[0] - minLat) * scale);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-lg bg-gray-900/60 border border-white/10" style={{ height }}>
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={sx} cy={sy} r={5} fill="#22c55e" stroke="#0a0a0a" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={5} fill="#ef4444" stroke="#0a0a0a" strokeWidth={1.5} />
    </svg>
  );
};

export default RouteMap;
