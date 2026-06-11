import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { decodePolyline } from '../lib/activity';

interface Props {
  polyline: string;
  color?: string;
  height?: number;
}

// Route drawn on real dark map tiles (CARTO dark basemap, no API key) so you
// can see *where* the activity happened.
const RouteMap: React.FC<Props> = ({ polyline, color = '#fb923c', height = 240 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const points = decodePolyline(polyline);
    if (!containerRef.current || points.length < 2) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap, &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    const latlngs = points.map(([lat, lng]) => [lat, lng] as [number, number]);
    const line = L.polyline(latlngs, { color, weight: 4, opacity: 0.95 }).addTo(map);

    L.circleMarker(latlngs[0], { radius: 5, color: '#0a0a0a', weight: 1.5, fillColor: '#22c55e', fillOpacity: 1 }).addTo(map);
    L.circleMarker(latlngs[latlngs.length - 1], { radius: 5, color: '#0a0a0a', weight: 1.5, fillColor: '#ef4444', fillOpacity: 1 }).addTo(map);

    // Container is freshly laid out — recompute size before fitting bounds.
    map.invalidateSize();
    map.fitBounds(line.getBounds(), { padding: [20, 20] });

    return () => {
      map.remove();
    };
  }, [polyline, color]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden border border-white/10 z-0"
      style={{ height }}
    />
  );
};

export default RouteMap;
