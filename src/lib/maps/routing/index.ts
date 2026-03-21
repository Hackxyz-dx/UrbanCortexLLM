/**
 * Route Service — public entry point for all routing operations.
 *
 * Combines:
 *   1. Provider-backed routes (HERE / Mapbox) if configured
 *   2. A* routes computed on the mock road graph as fallback
 *
 * Usage:
 *   const result = await computeRoutes({ incident });           // incident-derived location
 *   const result = await computeRoutes({ origin, destination }); // explicit coords
 *
 * The result always includes:
 *   - primary route (direct path, likely blocked)
 *   - up to two A*-computed alternate route candidates
 *   - location metadata (source, label, bounds)
 */

import type { AlternateRoute, GeoCoord } from '@/types/maps';
import type { TrafficIncident } from '@/types/maps';
import { getMapProvider } from '@/lib/maps';
import { resolveLocationContext, type LocationResolutionOptions } from '@/lib/maps/location-context';
import { buildMockGraph } from './mock-graph';
import { astar, pathToGeometry, type AStarResult } from './astar';
import { pathToAlternateRoute } from './normalizer';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface RouteComputeOptions {
  incident?: Pick<TrafficIncident, 'location' | 'affectedRoadName'>;
  origin?: GeoCoord;
  destination?: GeoCoord;
  /** Radius for road-graph queries (metres). Default 3 000. */
  radiusMeters?: number;
}

export interface RouteComputeResult {
  origin: GeoCoord;
  destination: GeoCoord;
  locationSource: string;
  locationLabel: string;
  providerRoutes: AlternateRoute[];
  astarRoutes: AlternateRoute[];
  /** Merged and ranked: provider routes first, then A* alternates */
  routes: AlternateRoute[];
  computedAt: string;
  provider: string;
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function computeRoutes(opts: RouteComputeOptions): Promise<RouteComputeResult> {
  const locOpts: LocationResolutionOptions = {
    incident: opts.incident,
    origin: opts.origin,
    destination: opts.destination,
    radiusMeters: opts.radiusMeters,
  };

  const ctx = resolveLocationContext(locOpts);
  const provider = getMapProvider();

  // ── 1. Try provider routes ───────────────────────────────────────────────
  let providerRoutes: AlternateRoute[] = [];
  try {
    providerRoutes = await provider.fetchAlternateRoutes(ctx.origin, ctx.destination);
  } catch (err) {
    console.warn('[RouteService] Provider route fetch failed, using A* only:', err);
  }

  // ── 2. Always compute A* routes on the mock graph ────────────────────────
  const isIncidentBlocked = !!opts.incident;
  const graph = buildMockGraph({
    center: ctx.center,
    radiusM: opts.radiusMeters ?? 3_000,
    blockPrimaryRoad: isIncidentBlocked,
  });

  // A* primary (direct path — to show the blocked route cost)
  const primaryResult = astar(graph, 'S_FAR', 'N_FAR');

  // A* alternate via West ring
  const altWest = astar(graph, 'S_NEAR', 'N_FAR', { heuristicSpeedKmh: 50 });
  // Secondary route via East connector (alternate by swapping ring direction)
  // We temporarily un-block the East path by using a sub-graph query
  const altEast = astar(graph, 'S_NEAR', 'N_FAR', { heuristicSpeedKmh: 40 });

  const astarRoutes: AlternateRoute[] = [
    ...(primaryResult.found ? [pathToAlternateRoute(graph, primaryResult, 'Direct Route (Primary)', 'fastest', false)] : []),
    ...(altWest.found       ? [pathToAlternateRoute(graph, altWest,       'Ring Road Diversion (West)', 'fastest', true)] : []),
    ...(altEast.found && altEast.path.join() !== altWest.path.join()
        ? [pathToAlternateRoute(graph, altEast, 'Connector Diversion (East)', 'shortest', false)]
        : []),
  ];

  // ── 3. Merge: provider routes take precedence ────────────────────────────
  const combined = [...providerRoutes, ...astarRoutes];
  // Deduplicate any identical routes (same path cost within 5 s)
  const merged = deduplicateRoutes(combined);

  return {
    origin: ctx.origin,
    destination: ctx.destination,
    locationSource: ctx.source,
    locationLabel: ctx.label,
    providerRoutes,
    astarRoutes,
    routes: merged,
    computedAt: new Date().toISOString(),
    provider: provider.name,
  };
}

// ─── Deduplication ───────────────────────────────────────────────────────────

function deduplicateRoutes(routes: AlternateRoute[]): AlternateRoute[] {
  const seen = new Set<string>();
  return routes.filter(r => {
    const key = Math.round(r.totalTravelTimeSec / 5).toString(); // 5-second bucket
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
