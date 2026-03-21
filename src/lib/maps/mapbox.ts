/**
 * Mapbox Maps & Traffic provider implementation.
 * Uses Mapbox Directions v5 API.
 * Requires NEXT_PUBLIC_MAPBOX_TOKEN in environment variables.
 */

import type { MapProvider, BoundingBox } from './provider';
import type { TrafficIncident, AlternateRoute, RoadSegment, GeoCoord } from '@/types/maps';
import { env } from '@/lib/config/env';

export class MapboxProvider implements MapProvider {
  readonly name = 'Mapbox';

  private get token() {
    return env.mapbox.accessToken;
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
    const url = new URL(`${env.mapbox.baseUrl}/directions/v5/mapbox/driving-traffic/${coords}`);
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
