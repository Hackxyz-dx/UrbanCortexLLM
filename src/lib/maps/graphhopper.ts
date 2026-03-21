/**
 * GraphHopper provider (optional free-tier alternative to ORS).
 *
 * Free tier: 500 req/day. Get key at: https://www.graphhopper.com/
 * Uses Routing API v1 with JSON output and alternative route support.
 *
 * This provider is only selected when GRAPHHOPPER_API_KEY is set
 * and MAP_PROVIDER=graphhopper (or ORS key is absent).
 */

import type { MapProvider, BoundingBox } from './provider';
import type { TrafficIncident, AlternateRoute, RoadSegment, GeoCoord } from '@/types/maps';
import { env } from '@/lib/config/env';

export class GraphHopperProvider implements MapProvider {
  readonly name = 'GraphHopper';

  private get apiKey() {
    return env.graphhopper.apiKey;
  }

  /** Incidents not available from GraphHopper free tier. Uses app-managed feed. */
  async fetchIncidents(_center: GeoCoord, _radiusMeters?: number): Promise<TrafficIncident[]> {
    return [];
  }

  /** Road segment flow not available from GraphHopper free tier. */
  async fetchRoadSegments(_bounds: BoundingBox): Promise<RoadSegment[]> {
    return [];
  }

  /** Fetch routes via GraphHopper Routing API v1 */
  async fetchAlternateRoutes(
    origin: GeoCoord,
    destination: GeoCoord,
  ): Promise<AlternateRoute[]> {
    if (!this.apiKey) {
      console.warn('[GraphHopperProvider] No GRAPHHOPPER_API_KEY configured. Using A* only.');
      return [];
    }

    const url = new URL(`${env.graphhopper.baseUrl}/route`);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('point', `${origin.lat},${origin.lng}`);
    url.searchParams.append('point', `${destination.lat},${destination.lng}`);
    url.searchParams.set('vehicle', 'car');
    url.searchParams.set('locale', 'en');
    url.searchParams.set('calc_points', 'true');
    url.searchParams.set('points_encoded', 'false');
    url.searchParams.set('algorithm', 'alternative_route');
    url.searchParams.set('alternative_route.max_paths', '3');

    const response = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => String(response.status));
      throw new Error(`[GraphHopperProvider] Route API failed ${response.status}: ${text}`);
    }

    const raw = await response.json();
    return parseGHRoutes(raw);
  }
}

// ─── GraphHopper response parser ──────────────────────────────────────────────

interface GHResponse {
  paths?: {
    distance: number;
    time: number;  // milliseconds!
    points: { coordinates: [number, number, number][] };
    points_order?: number[];
  }[];
}

function parseGHRoutes(raw: GHResponse): AlternateRoute[] {
  try {
    if (!raw?.paths?.length) return [];

    return raw.paths.map((path, idx) => {
      const distanceM = path.distance ?? 0;
      const durationSec = Math.round((path.time ?? 0) / 1000);

      const coordinates: GeoCoord[] = (path.points?.coordinates ?? []).map(
        ([lng, lat]) => ({ lat, lng }),
      );

      const label = idx === 0
        ? 'GraphHopper — Fastest Route'
        : `GraphHopper — Alternate ${idx}`;

      return {
        id: `gh-route-${idx}`,
        label,
        type: idx === 0 ? 'fastest' : 'alternate',
        segments: [],
        totalDistanceM: distanceM,
        totalTravelTimeSec: durationSec,
        deltaTimeSec: idx === 0
          ? 0
          : Math.round(durationSec - Math.round((raw.paths![0].time ?? 0) / 1000)),
        coordinates,
        isRecommended: idx === 1,
      } as AlternateRoute;
    });
  } catch (err) {
    console.error('[GraphHopperProvider] parseGHRoutes failed:', err);
    return [];
  }
}
