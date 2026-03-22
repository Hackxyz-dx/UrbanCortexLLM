/**
 * Mapbox Maps & Traffic provider implementation.
 * Uses Mapbox Directions v5 API.
 *
 * @deprecated Mapbox is a paid provider and is NO LONGER used by this app.
 * The active provider is selected in src/lib/maps/index.ts (ors | graphhopper | mock).
 * This file is kept only as an implementation reference.
 */

import type { MapProvider, BoundingBox } from './provider';
import type { TrafficIncident, AlternateRoute, RoadSegment, GeoCoord } from '@/types/maps';

// Mapbox has been removed from env.ts — read directly from process.env as a legacy fallback.
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
const MAPBOX_BASE_URL = process.env.MAPBOX_BASE_URL ?? 'https://api.mapbox.com';

export class MapboxProvider implements MapProvider {
  readonly name = 'Mapbox';

  private get token() {
    return MAPBOX_TOKEN;
  }

  /** Mapbox does not have a native incident API. Returns empty by default. */
  async fetchIncidents(_center: GeoCoord, _radiusMeters?: number): Promise<TrafficIncident[]> {
    console.warn('[MapboxProvider] Incident data not natively available via Mapbox. Returning empty.');
    return [];
  }

  /** Mapbox does not expose raw road segment congestion. Returns empty by default. */
  async fetchRoadSegments(_bounds: BoundingBox): Promise<RoadSegment[]> {
    console.warn('[MapboxProvider] Road segment flow data not supported. Returning empty.');
    return [];
  }

  /** Fetch alternate routes using Mapbox Directions API v5 */
  async fetchAlternateRoutes(
    origin: GeoCoord,
    destination: GeoCoord,
  ): Promise<AlternateRoute[]> {
    if (!this.token) {
      console.warn('[MapboxProvider] No access token configured. Returning empty routes.');
      return [];
    }

    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = new URL(`${MAPBOX_BASE_URL}/directions/v5/mapbox/driving-traffic/${coords}`);
    url.searchParams.set('access_token', this.token);
    url.searchParams.set('alternatives', 'true');
    url.searchParams.set('geometries', 'geojson');
    url.searchParams.set('overview', 'simplified');

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Mapbox directions fetch failed: ${response.status}`);

    const raw = await response.json();
    return parseMapboxRoutes(raw);
  }
}

// ─── Private parsers (stubs — fill when Mapbox responses are confirmed) ───────

function parseMapboxRoutes(_raw: unknown): AlternateRoute[] {
  // TODO: map raw.routes[] to AlternateRoute[]
  // Each route has: distance (m), duration (s), geometry.coordinates[]
  return [];
}
