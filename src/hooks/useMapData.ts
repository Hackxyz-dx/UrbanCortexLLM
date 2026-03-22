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
 *   - Polls every POLL_INTERVAL_MS while the browser tab is visible
 *   - Pauses polling when the tab is hidden; resumes on tab focus
 *   - In-flight guard prevents overlapping concurrent fetches
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSimulationStore } from '@/lib/store';
import type { TrafficIncident, AlternateRoute } from '@/types/maps';

/** How often to re-fetch while the tab is visible (ms). */
const POLL_INTERVAL_MS = 30_000;

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

  // Guard: skip a scheduled poll if a fetch is already in-flight
  const isFetching = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    const { lat, lng } = incidentLocation;

    try {
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
    } finally {
      isFetching.current = false;
    }
  }, [incidentLocation.lat, incidentLocation.lng]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Polling interval — only fires when tab is visible
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, POLL_INTERVAL_MS);

    // Resume immediately when the user returns to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  return { ...state, refresh: fetchData };
}
