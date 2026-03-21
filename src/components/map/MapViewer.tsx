'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulationStore } from '@/lib/store';
import { useMapData } from '@/hooks/useMapData';
import L from 'leaflet';
import { useEffect } from 'react';
import type { AlternateRoute } from '@/types/maps';

// ─── Leaflet icon fix ─────────────────────────────────────────────────────────

const incidentIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ─── Map re-center helper (runs inside MapContainer context) ──────────────────

function MapCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

// ─── Route style ──────────────────────────────────────────────────────────────

function routeStyle(route: AlternateRoute, index: number) {
  const label = route.label.toLowerCase();

  // Recommended diversion: solid blue
  if (route.isRecommended) {
    return { color: '#2563eb', weight: 5, dashArray: undefined as string | undefined, opacity: 0.9 };
  }
  // A* primary (likely the blocked direct route): red dashed
  if (label.includes('direct') || label.includes('primary')) {
    return { color: '#ef4444', weight: 4, dashArray: '6, 6' as string | undefined, opacity: 0.75 };
  }
  // Additional alternates: muted colors
  const altColors = ['#a855f7', '#f59e0b', '#10b981'];
  return { color: altColors[index % altColors.length], weight: 3, dashArray: '4, 8' as string | undefined, opacity: 0.7 };
}

// ─── Main viewer ─────────────────────────────────────────────────────────────

export default function MapViewer() {
  const storeIncident = useSimulationStore(s => s.incident);
  const isStratApproved = storeIncident.strategies.find(s => s.id === 'strat-1')?.status === 'approved';

  // Live data from backend (incidents + A* routes)
  const { incidents, routes, isLoading, error } = useMapData();

  // Prefer the first fetched incident for the map center; fall back to store location
  const primaryIncident = incidents[0];
  const centerLat = primaryIncident?.location.lat ?? storeIncident.location.lat;
  const centerLng = primaryIncident?.location.lng ?? storeIncident.location.lng;

  // Store routes (from mockIncident.ts) are shown when backend routes are absent
  const hasBackendRoutes = routes.length > 0;

  return (
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={14}
      className="w-full h-full z-0"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Dynamic re-center when incident location changes */}
      <MapCenter lat={centerLat} lng={centerLng} />

      {/* ── Incident markers (from backend) ──────────────────────────────── */}
      {incidents.map(inc => (
        <Marker key={inc.id} position={[inc.location.lat, inc.location.lng]} icon={incidentIcon}>
          <Popup className="text-black">
            <strong>{inc.title}</strong><br />
            {inc.affectedRoadName}<br />
            Severity: <span className="text-red-600 uppercase text-xs font-bold">{inc.severity}</span><br />
            Clearance: <span className="font-semibold">{inc.estimatedClearance} min</span>
          </Popup>
        </Marker>
      ))}

      {/* ── Fallback marker from store if backend incidents are empty ─────── */}
      {incidents.length === 0 && (
        <Marker
          position={[storeIncident.location.lat, storeIncident.location.lng]}
          icon={incidentIcon}
        >
          <Popup className="text-black">
            <strong>{storeIncident.title}</strong><br />
            {storeIncident.location.desc}<br />
            Severity: <span className="text-red-600 uppercase text-xs font-bold">{storeIncident.severity}</span>
          </Popup>
        </Marker>
      )}

      {/* ── Backend routes (A* + provider) ───────────────────────────────── */}
      {hasBackendRoutes && routes.map((route, i) => {
        const positions = route.coordinates.map(c => [c.lat, c.lng] as [number, number]);
        if (positions.length < 2) return null;
        const style = routeStyle(route, i);
        return (
          <Polyline
            key={route.id}
            positions={positions}
            color={style.color}
            weight={style.weight}
            dashArray={style.dashArray}
            opacity={style.opacity}
          >
            <Popup className="text-black text-sm">
              <strong>{route.label}</strong><br />
              Distance: {(route.totalDistanceM / 1000).toFixed(1)} km<br />
              Est. time: {Math.round(route.totalTravelTimeSec / 60)} min<br />
              {route.isRecommended && <span className="text-blue-600 font-bold">✓ Recommended diversion</span>}
            </Popup>
          </Polyline>
        );
      })}

      {/* ── Fallback: store routes when backend routes are not yet loaded ─── */}
      {!hasBackendRoutes && storeIncident.routes.map(route => {
        const isApprovedDiversion = route.type === 'diversion' && route.id === 'r2' && isStratApproved;
        const color = route.type === 'primary' ? '#ef4444'
          : route.type === 'emergency-corridor' ? '#10b981'
          : isApprovedDiversion ? '#2563eb' : '#94a3b8';
        const weight = isApprovedDiversion ? 5 : route.type === 'primary' ? 5 : 3;
        const dashArray = (!isApprovedDiversion && route.type === 'diversion') ? '8, 8' : undefined;

        return (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            color={color}
            weight={weight}
            dashArray={dashArray}
            opacity={0.85}
          >
            <Popup className="text-black text-sm">
              <strong>{route.name}</strong><br />
              Type: {route.type}<br />
              Congestion: {route.congestionLevel}<br />
              {route.type === 'diversion' && route.id === 'r2' && (
                <span className={isApprovedDiversion ? 'text-blue-600 font-bold' : 'text-gray-500'}>
                  {isApprovedDiversion ? '✓ ACTIVE — Diversion Live' : 'Pending Approval'}
                </span>
              )}
            </Popup>
          </Polyline>
        );
      })}

      {/* ── Loading overlay ───────────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 border border-slate-700 text-slate-400 text-[10px] font-mono px-3 py-1.5 rounded-sm uppercase tracking-widest">
          Fetching map data...
        </div>
      )}

      {/* ── Error notice ──────────────────────────────────────────────────── */}
      {error && !isLoading && (
        <div className="absolute top-3 right-3 z-[1000] bg-red-950/90 border border-red-800 text-red-400 text-[10px] font-mono px-3 py-1.5 rounded-sm uppercase tracking-widest">
          {error}
        </div>
      )}
    </MapContainer>
  );
}
