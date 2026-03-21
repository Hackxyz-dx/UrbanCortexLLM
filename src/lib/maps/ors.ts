/**
 * OpenRouteService (ORS) provider.
 *
 * Free tier: 2,000 requests/day — plenty for demo/production of this app.
 * Signup: https://openrouteservice.org/dev/#/signup
 *
 * Supports:
 *   - /v2/directions/driving-car  → primary + alternate routes
 *   - Returns GeoJSON with full geometry, distance, and duration
 *
 * Does NOT provide live traffic incidents (none of the free providers do).
 * Incident feed is app-managed (see lib/incidents/service.ts).
 */

import type { MapProvider, BoundingBox } from './provider';
import type { TrafficIncident, AlternateRoute, RoadSegment, GeoCoord } from '@/types/maps';
import { env } from '@/lib/config/env';

export class OrsProvider implements MapProvider {
  readonly name = 'OpenRouteService';

  private get apiKey() {
    return env.ors.apiKey;
  }

  /**
   * ORS does not provide live traffic incident data.
   * Returning empty — app-managed incident feed is used instead.
   */
  async fetchIncidents(_center: GeoCoord, _radiusMeters?: number): Promise<TrafficIncident[]> {
    return [];
  }

  /**
   * ORS does not provide road segment flow/congestion.
   * Returning empty — not needed for this app's routing logic.
   */
  async fetchRoadSegments(_bounds: BoundingBox): Promise<RoadSegment[]> {
    return [];
  }

  /**
   * Fetch driving routes via ORS Directions API v2 (GeoJSON output).
   * Requests up to 3 alternative routes when possible.
   */
  async fetchAlternateRoutes(
    origin: GeoCoord,
    destination: GeoCoord,
  ): Promise<AlternateRoute[]> {
    if (!this.apiKey) {
      console.warn('[OrsProvider] No OPENROUTESERVICE_API_KEY configured. Using A* only.');
      return [];
    }

    const url = `${env.ors.baseUrl}/v2/directions/driving-car/geojson`;

    const body = {
      coordinates: [
        [origin.lng, origin.lat],
        [destination.lng, destination.lat],
      ],
      alternative_routes: {
        target_count: 3,
        weight_factor: 1.4,
        share_factor: 0.6,
      },
      instructions: false,
      geometry_simplify: true,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json, application/geo+json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => String(response.status));
      throw new Error(`[OrsProvider] Directions API failed ${response.status}: ${text}`);
    }

    const raw = await response.json();
    return parseOrsRoutes(raw, origin, destination);
  }
}

// ─── ORS GeoJSON response parser ──────────────────────────────────────────────

function parseOrsRoutes(raw: unknown, origin: GeoCoord, destination: GeoCoord): AlternateRoute[] {
  try {
    const geojson = raw as {
      features?: {
        geometry: { coordinates: [number, number][] };
        properties: {
          summary: { distance: number; duration: number };
          way_points?: number[];
        };
      }[];
    };

    if (!geojson?.features?.length) return [];

    return geojson.features.map((feature, idx) => {
      const summary = feature.properties?.summary;
      const distanceM = summary?.distance ?? 0;
      const durationSec = summary?.duration ?? 0;

      // Convert [lng, lat] pairs to GeoCoord
      const coordinates: GeoCoord[] = feature.geometry.coordinates.map(([lng, lat]) => ({
        lat,
        lng,
      }));

      // First route is typically the fastest/primary
      const label = idx === 0
        ? 'ORS — Fastest Route'
        : idx === 1
        ? 'ORS — Alternate Diversion'
        : `ORS — Secondary Alternate ${idx}`;

      const isRecommended = idx === 1; // treat second route as recommended diversion

      return {
        id: `ors-route-${idx}`,
        label,
        type: idx === 0 ? 'fastest' : 'alternate',
        segments: [],
        totalDistanceM: distanceM,
        totalTravelTimeSec: durationSec,
        // deltaTimeSec relative to idx=0 (use 0 for primary itself)
        deltaTimeSec: idx === 0
          ? 0
          : Math.round(durationSec - (geojson.features![0].properties?.summary?.duration ?? durationSec)),
        coordinates,
        isRecommended,
      } as AlternateRoute;
    });
  } catch (err) {
    console.error('[OrsProvider] parseOrsRoutes failed:', err);
    return [];
  }
}
