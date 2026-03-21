/**
 * HERE Maps & Traffic provider implementation.
 * Uses HERE Routing v8 and HERE Traffic v6.3 APIs.
 * Requires HERE_API_KEY in environment variables.
 */

import type { MapProvider, BoundingBox } from './provider';
import type { TrafficIncident, AlternateRoute, RoadSegment, GeoCoord } from '@/types/maps';
import { env } from '@/lib/config/env';
import { normalizeIncident } from '@/lib/incidents/service';

export class HereProvider implements MapProvider {
  readonly name = 'HERE';

  private get apiKey() {
    return env.here.apiKey;
  }

  /** Fetch incidents via HERE Traffic incidents endpoint */
  async fetchIncidents(center: GeoCoord, radiusMeters = 2000): Promise<TrafficIncident[]> {
    if (!this.apiKey) {
      console.warn('[HereProvider] No API key configured. Returning empty incidents.');
      return [];
    }
    const url = new URL(`${env.here.trafficBaseUrl}/incidents.json`);
    url.searchParams.set('apiKey', this.apiKey);
    url.searchParams.set('prox', `${center.lat},${center.lng},${radiusMeters}`);
    url.searchParams.set('criticality', '0,1,2,3');

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HERE incidents fetch failed: ${response.status}`);

    const raw = await response.json();
    return parseHereIncidents(raw);
  }

  /** Fetch road flow data for a bounding box */
  async fetchRoadSegments(bounds: BoundingBox): Promise<RoadSegment[]> {
    if (!this.apiKey) return [];

    const bbox = `${bounds.south},${bounds.west};${bounds.north},${bounds.east}`;
    const url = new URL(`${env.here.trafficBaseUrl}/flow.json`);
    url.searchParams.set('apiKey', this.apiKey);
    url.searchParams.set('bbox', bbox);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HERE flow fetch failed: ${response.status}`);

    const raw = await response.json();
    return parseHereFlow(raw);
  }

  /** Fetch alternate routes using HERE Routing v8 */
  async fetchAlternateRoutes(
    origin: GeoCoord,
    destination: GeoCoord,
  ): Promise<AlternateRoute[]> {
    if (!this.apiKey) return [];

    const url = new URL(`${env.here.routingBaseUrl}/routes`);
    url.searchParams.set('apiKey', this.apiKey);
    url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
    url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
    url.searchParams.set('transportMode', 'car');
    url.searchParams.set('alternatives', '3');
    url.searchParams.set('return', 'polyline,summary');

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HERE routing fetch failed: ${response.status}`);

    const raw = await response.json();
    return parseHereRoutes(raw);
  }
}

// ─── HERE response parsers ────────────────────────────────────────────────────

/**
 * Parses the HERE Traffic 6.3 incidents response.
 * Schema: raw.TRAFFICITEMS.TRAFFICITEM[]
 * CRITICALITY.id: 0=Low, 1=Major, 2=Critical, 3=Blocking
 */
function parseHereIncidents(raw: unknown): TrafficIncident[] {
  try {
    const root = raw as Record<string, unknown>;
    const items = root?.TRAFFICITEMS as Record<string, unknown> | undefined;
    if (!items) return [];

    const list = items.TRAFFICITEM;
    const arr: unknown[] = Array.isArray(list) ? list : [list];

    return arr.filter(Boolean).map((item) => {
      const t = item as Record<string, unknown>;
      const loc = extractHereLocation(t.LOCATION);
      const criticality = (t.CRITICALITY as Record<string, unknown>)?.id ?? '1';
      const locationBlock = t.LOCATION as Record<string, unknown> | undefined;
      const roadName = String(locationBlock?.ROAD_NAME ?? locationBlock?.DESCRIPTION ?? '');

      return normalizeIncident(
        {
          id: t.TRAFFIC_ITEM_ID,
          title: t.SHORT_DESC ?? t.DESCRIPTION ?? 'HERE Incident',
          description: t.DESCRIPTION ?? t.SHORT_DESC ?? '',
          severity: criticality,
          location: loc,
          affectedRoadName: roadName,
          blockedLanes: 0,    // HERE v6.3 does not expose lane counts
          totalLanes: 0,
          startTime: t.START_TIME,
          estimatedClearance: t.DURATION ?? 60,
        },
        'HERE',
      );
    });
  } catch (err) {
    console.error('[HereProvider] parseHereIncidents failed:', err);
    return [];
  }
}

/** Extracts a GeoCoord from the HERE LOCATION block */
function extractHereLocation(location: unknown): GeoCoord {
  if (!location || typeof location !== 'object') return { lat: 0, lng: 0 };
  const loc = location as Record<string, unknown>;

  // Format A: GEO_NODE array
  const geoNode = loc.GEO_NODE;
  if (Array.isArray(geoNode) && geoNode.length > 0) {
    const node = geoNode[0] as Record<string, unknown>;
    return { lat: Number(node.LAT ?? 0), lng: Number(node.LON ?? 0) };
  }

  // Format B: direct LAT/LON on LOCATION
  if (typeof loc.LAT === 'number' && typeof loc.LON === 'number') {
    return { lat: loc.LAT, lng: loc.LON };
  }

  return { lat: 0, lng: 0 };
}

function parseHereFlow(_raw: unknown): RoadSegment[] {
  // TODO: map raw.RWS[].RW[].FIS[].FI[] to RoadSegment[]
  return [];
}

function parseHereRoutes(_raw: unknown): AlternateRoute[] {
  // TODO: map raw.routes[] to AlternateRoute[]
  return [];
}
