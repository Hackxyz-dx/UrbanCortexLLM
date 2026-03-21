/**
 * Route normalizer — converts A* result data into the shared AlternateRoute type.
 *
 * This keeps the A* engine decoupled from the domain type,
 * and provides a single place to adjust route metadata fields.
 */

import type { AlternateRoute, RouteType } from '@/types/maps';
import { type RoadGraph } from './graph';
import { type AStarResult, pathToGeometry } from './astar';
import { edgeCost } from './graph';

/**
 * Converts an AStarResult into a normalized AlternateRoute suitable for
 * use in the route service and eventually LLM context / map rendering.
 */
export function pathToAlternateRoute(
  graph: RoadGraph,
  result: AStarResult,
  label: string,
  type: RouteType,
  isRecommended: boolean,
  baselineTravelTimeSec = 0,
): AlternateRoute {
  const coords = pathToGeometry(graph, result);

  // Build segment summaries from edges (named road segments)
  const segmentNames = [...new Set(result.edges.map(e => e.name))];

  return {
    id: `astar-${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    label,
    type,
    segments: [], // Populated in future step when full RoadSegment fetch is available
    totalDistanceM: result.distanceM,
    totalTravelTimeSec: result.costSec,
    deltaTimeSec: baselineTravelTimeSec > 0 ? result.costSec - baselineTravelTimeSec : 0,
    coordinates: coords,
    isRecommended,
    // Attach extra metadata as a non-schema field for debugging
    // @ts-expect-error intentional extension for internal use
    _meta: {
      source: 'astar',
      nodeCount: result.path.length,
      edgeCount: result.edges.length,
      segmentNames,
    },
  };
}
