/**
 * useMapData — fetches live incident and route data from the backend APIs.
 *
 * Derives the center coordinate from the Zustand simulation store's incident,
 * so the map stays in sync with whatever incident is currently active without
 * any hardcoded location.
 *
 * Refresh behavior:
 *   - Initial fetch on mount
 *   - Re-fetches whenever the incident location changes (e.g. simulation tick)
 *   - Returns loading / error / data states for the map to render conditionally
 */

import { useState, useEffect, useCallback } from 'react';
import { useSimulationStore } from '@/lib/store';
import type { TrafficIncident, AlternateRoute } from '@/types/maps';

export interface MapDataState {
  isLoading: boolean;
  error: string | null;
  incidents: TrafficIncident[];
  routes: AlternateRoute[];
  locationLabel: string;
  fetchedAt: string | null;
}

const INITIAL_STATE: MapDataState = {
  isLoading: true,
  error: null,
  incidents: [],
  routes: [],
  locationLabel: '',
  fetchedAt: null,
};

export function useMapData(): MapDataState & { refresh: () => void } {
  const incidentLocation = useSimulationStore(s => s.incident.location);
  const [state, setState] = useState<MapDataState>(INITIAL_STATE);

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { lat, lng } = incidentLocation;

    try {
      // Fetch incidents and routes in parallel
      const [incRes, routeRes] = await Promise.allSettled([
        fetch(`/api/incidents?lat=${lat}&lng=${lng}&radius=5000`),
        fetch(`/api/routes?incidentLat=${lat}&incidentLng=${lng}&radius=3000`),
      ]);

      let incidents: TrafficIncident[] = [];
      let routes: AlternateRoute[] = [];
      let locationLabel = '';

      if (incRes.status === 'fulfilled' && incRes.value.ok) {
        const data = await incRes.value.json();
        incidents = data.incidents ?? [];
      }

      if (routeRes.status === 'fulfilled' && routeRes.value.ok) {
        const data = await routeRes.value.json();
        routes = data.routes ?? [];
        locationLabel = data.locationLabel ?? '';
      }

      setState({
        isLoading: false,
        error: null,
        incidents,
        routes,
        locationLabel,
        fetchedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[useMapData] Fetch failed:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load map data from backend.',
      }));
    }
  }, [incidentLocation.lat, incidentLocation.lng]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refresh: fetchData };
}
