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
    return { color: '#2563eb', weight: 6, dashArray: undefined as string | undefined, opacity: 0.9 };
  }
  // A* primary (likely the blocked direct route): red dashed
  if (label.includes('direct') || label.includes('primary')) {
    return { color: '#ef4444', weight: 5, dashArray: '6, 6' as string | undefined, opacity: 0.8 };
  }
  // Additional alternates: muted colors
  const altColors = ['#8b5cf6', '#f59e0b', '#10b981'];
  return { color: altColors[index % altColors.length], weight: 4, dashArray: '4, 8' as string | undefined, opacity: 0.75 };
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
      className="w-full h-full z-0 font-sans"
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Dynamic re-center when incident location changes */}
      <MapCenter lat={centerLat} lng={centerLng} />

      {/* ── Incident markers (from backend) ──────────────────────────────── */}
      {incidents.map(inc => (
        <Marker key={inc.id} position={[inc.location.lat, inc.location.lng]} icon={incidentIcon}>
          <Popup className="text-slate-700 text-base p-2">
            <strong className="text-slate-900 block mb-1 text-lg">{inc.title}</strong>
            <span className="block text-sm mb-3 text-slate-500">{inc.affectedRoadName}</span>
            <div className="flex gap-2 text-sm mb-1">
              <span className="font-medium">Severity:</span>
              <span className="text-red-600 uppercase font-bold">{inc.severity}</span>
            </div>
            <div className="flex gap-2 text-sm mt-1">
              <span className="font-medium">Clearance:</span>
              <span className="font-semibold text-amber-600">{inc.estimatedClearance} min</span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* ── Fallback marker from store if backend incidents are empty ─────── */}
      {incidents.length === 0 && (
        <Marker
          position={[storeIncident.location.lat, storeIncident.location.lng]}
          icon={incidentIcon}
        >
          <Popup className="text-slate-700 text-base p-2">
            <strong className="text-slate-900 block mb-1 text-lg">{storeIncident.title}</strong>
            <span className="block text-sm mb-3 text-slate-500">{storeIncident.location.desc}</span>
            <div className="flex gap-2 text-sm">
              <span className="font-medium">Severity:</span>
              <span className="text-red-600 uppercase font-bold">{storeIncident.severity}</span>
            </div>
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
            <Popup className="text-slate-700 text-base p-2">
              <strong className="text-slate-900 block mb-3 text-lg">{route.label}</strong>
              <div className="flex justify-between gap-5 text-sm mb-2">
                <span className="font-medium text-slate-500">Distance:</span>
                <span className="font-bold">{(route.totalDistanceM / 1000).toFixed(1)} km</span>
              </div>
              <div className="flex justify-between gap-5 text-sm mb-3">
                <span className="font-medium text-slate-500">Est. Time:</span>
                <span className="font-bold text-amber-600">{Math.round(route.totalTravelTimeSec / 60)} min</span>
              </div>
              {route.isRecommended && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-blue-600 font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
                  ✓ Recommended Diversion
                </div>
              )}
            </Popup>
          </Polyline>
        );
      })}

      {/* ── Fallback: store routes when backend routes are not yet loaded ─── */}
      {!hasBackendRoutes && storeIncident.routes.map(route => {
        const isApprovedDiversion = route.type === 'diversion' && route.id === 'r2' && isStratApproved;
        const color = route.type === 'primary' ? '#ef4444'
          : route.type === 'emergency-corridor' ? '#10b981'
          : isApprovedDiversion ? '#2563eb' : '#64748b';
        const weight = isApprovedDiversion ? 6 : route.type === 'primary' ? 6 : 4;
        const dashArray = (!isApprovedDiversion && route.type === 'diversion') ? '6, 6' : undefined;

        return (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            color={color}
            weight={weight}
            dashArray={dashArray}
            opacity={0.85}
          >
            <Popup className="text-slate-700 text-base p-2">
              <strong className="text-slate-900 block mb-2 text-lg">{route.name}</strong>
              <div className="text-sm text-slate-500 mb-3 capitalize">{route.type} Route</div>
              <div className="flex justify-between gap-5 text-sm mb-3">
                <span className="font-medium text-slate-500">Congestion:</span>
                <span className="font-bold">{route.congestionLevel}</span>
              </div>
              {route.type === 'diversion' && route.id === 'r2' && (
                <div className={`mt-3 pt-3 border-t border-slate-100 text-sm font-bold uppercase tracking-wider ${isApprovedDiversion ? 'text-blue-600' : 'text-slate-400'}`}>
                  {isApprovedDiversion ? '✓ Active — Diversion Live' : 'Pending Approval'}
                </div>
              )}
            </Popup>
          </Polyline>
        );
      })}

      {/* ── Loading overlay ───────────────────────────────────────────────── */}
      {isLoading && (
        <div className="absolute top-5 right-5 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-600 text-xs font-bold px-5 py-3 rounded shadow-sm uppercase tracking-widest flex items-center gap-2.5">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Fetching live map data...
        </div>
      )}

      {/* ── Error notice ──────────────────────────────────────────────────── */}
      {error && !isLoading && (
        <div className="absolute top-5 right-5 z-[1000] bg-red-50/95 backdrop-blur-sm border border-red-200 text-red-700 text-xs font-bold px-5 py-3 rounded shadow-sm uppercase tracking-widest flex items-center gap-2.5">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          {error}
        </div>
      )}
    </MapContainer>
  );
}
