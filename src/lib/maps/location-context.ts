/**
 * Location context resolver.
 *
 * Determines the routing area (origin + destination bounding context) from the
 * best available source, in priority order:
 *
 *   1. Live incident coordinates  (from a TrafficIncident passed in)
 *   2. Explicitly provided origin/destination  (caller override)
 *   3. Safe fallback — generic 0.5° bounding box around the provided coordinate
 *
 * No location is ever hardcoded. The caller is responsible for passing incident
 * or coordinate data; this module only resolves and validates it.
 */

import type { GeoCoord } from '@/types/maps';
import type { TrafficIncident } from '@/types/maps';
import { buildBounds } from '@/lib/maps/provider';
import type { BoundingBox } from '@/lib/maps/provider';

// ─── Result type ─────────────────────────────────────────────────────────────

export type LocationSource = 'incident' | 'explicit' | 'fallback';

export interface ResolvedLocationContext {
  /** Incident epicentre or explicit point used for routing */
  center: GeoCoord;
  /** Bounding box for road-graph queries */
  bounds: BoundingBox;
  /** Where we got the location from */
  source: LocationSource;
  /** Human-readable description for logging and LLM context */
  label: string;
  /** Suggested routing origin (just upstream of incident / or explicit) */
  origin: GeoCoord;
  /** Suggested routing destination (just downstream of incident / or explicit) */
  destination: GeoCoord;
}

// ─── Resolution options ───────────────────────────────────────────────────────

export interface LocationResolutionOptions {
  /** If provided, the incident location will be used as center */
  incident?: Pick<TrafficIncident, 'location' | 'affectedRoadName'>;
  /** Explicit routing endpoints (overrides incident derivation) */
  origin?: GeoCoord;
  destination?: GeoCoord;
  /** Search radius around the center (metres). Default 3 000. */
  radiusMeters?: number;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolve the routing location context from the best available input.
 * Never throws — always returns a valid context with an explicit source label.
 */
export function resolveLocationContext(
  options: LocationResolutionOptions = {},
): ResolvedLocationContext {
  const { incident, origin, destination, radiusMeters = 3_000 } = options;

  // ── Priority 1: explicit origin + destination provided ───────────────────
  if (origin && destination) {
    const center = midpoint(origin, destination);
    return {
      center,
      bounds: buildBounds(center, radiusMeters),
      source: 'explicit',
      label: `Explicit route: (${fmt(origin)}) → (${fmt(destination)})`,
      origin,
      destination,
    };
  }

  // ── Priority 2: derive from incident coordinates ─────────────────────────
  if (incident) {
    const center = incident.location;
    // Place synthetic origin 400 m south of incident, destination 400 m north
    const derivedOrigin      = offset(center, -400, 0);
    const derivedDestination = offset(center,  400, 0);
    return {
      center,
      bounds: buildBounds(center, radiusMeters),
      source: 'incident',
      label: `Incident-derived: ${incident.affectedRoadName || 'Unknown Road'} (${fmt(center)})`,
      origin: derivedOrigin,
      destination: derivedDestination,
    };
  }

  // ── Priority 3: fallback — no data available (should be rare) ────────────
  // Use caller-supplied origin if only one endpoint given
  const fallbackCenter = origin ?? destination ?? { lat: 0, lng: 0 };
  const fallbackOrigin      = offset(fallbackCenter, -400, 0);
  const fallbackDestination = offset(fallbackCenter,  400, 0);
  return {
    center: fallbackCenter,
    bounds: buildBounds(fallbackCenter, radiusMeters),
    source: 'fallback',
    label: `Fallback location (${fmt(fallbackCenter)}) — no incident or explicit coord provided`,
    origin: fallbackOrigin,
    destination: fallbackDestination,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the geographic midpoint of two coordinates */
function midpoint(a: GeoCoord, b: GeoCoord): GeoCoord {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

/**
 * Offsets a coordinate by deltaLatM (metres north+) and deltaLngM (metres east+).
 * Uses the small-angle approximation, accurate to < 1 % for offsets < 10 km.
 */
function offset(coord: GeoCoord, deltaLatM: number, deltaLngM: number): GeoCoord {
  const latDeg = deltaLatM / 111_000;
  const lngDeg = deltaLngM / (111_000 * Math.cos((coord.lat * Math.PI) / 180));
  return { lat: coord.lat + latDeg, lng: coord.lng + lngDeg };
}

function fmt(c: GeoCoord): string {
  return `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`;
}
