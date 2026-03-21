/**
 * Incident Service — central place to fetch, normalize, and cache
 * traffic incidents near a given location.
 *
 * Architecture:
 *  - getIncidentsNearPDEU()  → convenience wrapper for the PDEU default centre
 *  - getIncidentsNear()      → generic fetch using the active provider
 *  - normalizeIncident()     → converts any shape to TrafficIncident (used by parsers)
 *  - withFallback()          → wraps provider calls so the app never crashes on API failure
 */

import { getMapProvider } from '@/lib/maps';
import type { TrafficIncident, GeoCoord } from '@/types/maps';

// ─── PDEU Gandhinagar constants ───────────────────────────────────────────────

/** Coordinates of PDEU Main Gate, Sector-23, Gandhinagar, Gujarat */
export const PDEU_CENTER: GeoCoord = { lat: 23.1565, lng: 72.6659 };

/** Default search radius for incident queries around PDEU (metres) */
export const PDEU_RADIUS_M = 5_000;

/** Human-readable label used in context builders and logs */
export const PDEU_AREA_LABEL = 'PDEU Gandhinagar, Sector-23, Gujarat, India';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch incidents near PDEU Gandhinagar using the configured map provider.
 * Falls back to a realistic PDEU mock if the provider fails or is unconfigured.
 */
export async function getIncidentsNearPDEU(): Promise<TrafficIncident[]> {
  return getIncidentsNear(PDEU_CENTER, PDEU_RADIUS_M);
}

/**
 * Fetch incidents near an arbitrary coordinate, with graceful fallback.
 */
export async function getIncidentsNear(
  center: GeoCoord,
  radiusMeters: number = PDEU_RADIUS_M,
): Promise<TrafficIncident[]> {
  return withFallback(
    () => getMapProvider().fetchIncidents(center, radiusMeters),
    buildPDEUFallbackIncidents(),
    'getIncidentsNear',
  );
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Validates and coerces a raw incident-shaped object into a safe TrafficIncident.
 * Call this inside provider parsers to guarantee the output schema is correct.
 */
export function normalizeIncident(raw: Record<string, unknown>, source: string): TrafficIncident {
  return {
    id: String(raw.id ?? `INC-${Date.now()}`),
    title: String(raw.title ?? 'Unknown Incident'),
    description: String(raw.description ?? ''),
    severity: toSeverity(raw.severity),
    location: toGeoCoord(raw.location ?? raw.position ?? raw.coordinates),
    affectedRoadName: String(raw.affectedRoadName ?? raw.roadName ?? raw.street ?? ''),
    blockedLanes: toPositiveInt(raw.blockedLanes),
    totalLanes: toPositiveInt(raw.totalLanes) || 4,
    startTime: toISOString(raw.startTime ?? raw.startDate ?? raw.occurredAt),
    estimatedClearance: toPositiveInt(raw.estimatedClearance) || 60,
    source,
  };
}

// ─── Fallback data (PDEU Gandhinagar scenario) ────────────────────────────────

/**
 * Returns a realistic deterministic incident list for PDEU if the provider fails.
 * This ensures the UI always has meaningful data in demo / development contexts.
 */
export function buildPDEUFallbackIncidents(): TrafficIncident[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'INC-2026-PDEU-01',
      title: 'Multi-Vehicle Collision — Koba-Gandhinagar Highway',
      description:
        'Severe multi-vehicle collision blocking 3 of 4 lanes near PDEU Main Gate. Emergency services on scene. Debris clearance in progress.',
      severity: 'critical',
      location: PDEU_CENTER,
      affectedRoadName: 'Koba-Gandhinagar Highway, Near PDEU Main Gate, Sector-23',
      blockedLanes: 3,
      totalLanes: 4,
      startTime: now,
      estimatedClearance: 90,
      source: 'mock-fallback',
    },
    {
      id: 'INC-2026-PDEU-02',
      title: 'Minor Breakdown — Indroda Circle Junction',
      description:
        'Heavy goods vehicle broken down at Indroda Circle. Lane 1 partially obstructed. Towing unit dispatched.',
      severity: 'medium',
      location: { lat: 23.1610, lng: 72.6730 },
      affectedRoadName: 'Indroda Circle, Gandhinagar',
      blockedLanes: 1,
      totalLanes: 3,
      startTime: now,
      estimatedClearance: 25,
      source: 'mock-fallback',
    },
  ];
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Wraps an async provider call and returns the fallback if it throws.
 * Logs the error for observability without crashing the request pipeline.
 */
async function withFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  context: string,
): Promise<T> {
  try {
    const result = await fn();
    // If the provider returned an empty array and we have a fallback, use it.
    if (Array.isArray(result) && result.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
      console.info(`[IncidentService:${context}] Provider returned no data. Using fallback.`);
      return fallback;
    }
    return result;
  } catch (err) {
    console.error(`[IncidentService:${context}] Provider error:`, err);
    console.info(`[IncidentService:${context}] Falling back to mock data.`);
    return fallback;
  }
}

function toSeverity(value: unknown): TrafficIncident['severity'] {
  const map: Record<string, TrafficIncident['severity']> = {
    critical: 'critical', high: 'high', major: 'high',
    medium: 'medium', moderate: 'medium',
    low: 'low', minor: 'low',
    // HERE severity codes (0-3)
    '0': 'low', '1': 'medium', '2': 'high', '3': 'critical',
  };
  return map[String(value).toLowerCase()] ?? 'medium';
}

function toGeoCoord(value: unknown): GeoCoord {
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (typeof v.lat === 'number' && typeof v.lng === 'number') return { lat: v.lat, lng: v.lng };
    if (typeof v.lat === 'number' && typeof v.lon === 'number') return { lat: v.lat, lng: v.lon };
    if (typeof v.latitude === 'number' && typeof v.longitude === 'number')
      return { lat: v.latitude, lng: v.longitude };
  }
  // Unresolvable — fall back to PDEU centre
  return PDEU_CENTER;
}

function toPositiveInt(value: unknown): number {
  const n = parseInt(String(value), 10);
  return isNaN(n) || n < 0 ? 0 : n;
}

function toISOString(value: unknown): string {
  if (typeof value === 'string' && value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return new Date().toISOString();
}
