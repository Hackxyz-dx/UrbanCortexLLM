/**
 * Mock road graph builder.
 *
 * Generates a synthetic road graph from a center coordinate and a radius.
 * Used when real road-network topology is not available from a provider.
 *
 * The mock graph produces a realistic grid+ring structure:
 *   - a primary road running north-south through the incident area (blocked segment)
 *   - a ring road circumnavigating the incident
 *   - cross-street connectors
 *
 * All edge costs are calibrated so A* produces believable results.
 * Incident-affected segments carry extra incidentPenaltySec to model the block.
 *
 * No location is hardcoded — the graph is always built relative to the given center.
 */

import type { GeoCoord } from '@/types/maps';
import {
  createGraph, addNode, addEdge,
  haversineMetres,
  type RoadGraph, type GraphNode, type GraphEdge,
} from './graph';

// ─── Public API ───────────────────────────────────────────────────────────────

export interface MockGraphOptions {
  center: GeoCoord;
  /** Approximate radius of the road network to model (metres). Default 2 500. */
  radiusM?: number;
  /** Mark the primary road through center as incident-blocked */
  blockPrimaryRoad?: boolean;
}

export function buildMockGraph(opts: MockGraphOptions): RoadGraph {
  const { center, radiusM = 2_500, blockPrimaryRoad = true } = opts;
  const graph = createGraph();

  // Derive offsets (approximate metres → degrees)
  const latDeg = (m: number) => m / 111_000;
  const lngDeg = (m: number) => m / (111_000 * Math.cos((center.lat * Math.PI) / 180));

  const pt = (dLat: number, dLng: number): GeoCoord => ({
    lat: center.lat + latDeg(dLat),
    lng: center.lng + lngDeg(dLng),
  });

  // ── Define key nodes ─────────────────────────────────────────────────────

  // Primary road: runs N-S through the incident
  const nodes: GraphNode[] = [
    { id: 'N_FAR',    coord: pt( radiusM,       0),    label: 'Primary Rd — North Far' },
    { id: 'N_NEAR',   coord: pt( radiusM * 0.3, 0),    label: 'Primary Rd — North Near Incident' },
    { id: 'INCIDENT', coord: center,                    label: 'Incident Location' },
    { id: 'S_NEAR',   coord: pt(-radiusM * 0.3, 0),    label: 'Primary Rd — South Near Incident' },
    { id: 'S_FAR',    coord: pt(-radiusM,       0),    label: 'Primary Rd — South Far' },

    // Ring road nodes (4 quadrants)
    { id: 'RING_N',   coord: pt( radiusM * 0.8, 0),            label: 'Ring Road — North' },
    { id: 'RING_E',   coord: pt( 0,             radiusM * 0.8), label: 'Ring Road — East' },
    { id: 'RING_S',   coord: pt(-radiusM * 0.8, 0),            label: 'Ring Road — South' },
    { id: 'RING_W',   coord: pt( 0,            -radiusM * 0.8), label: 'Ring Road — West' },

    // Cross-street connectors
    { id: 'X_NW',     coord: pt( radiusM * 0.5, -radiusM * 0.4), label: 'Cross St — NW' },
    { id: 'X_NE',     coord: pt( radiusM * 0.5,  radiusM * 0.4), label: 'Cross St — NE' },
    { id: 'X_SW',     coord: pt(-radiusM * 0.5, -radiusM * 0.4), label: 'Cross St — SW' },
    { id: 'X_SE',     coord: pt(-radiusM * 0.5,  radiusM * 0.4), label: 'Cross St — SE' },
  ];

  nodes.forEach(n => addNode(graph, n));

  // ── Helper to create an edge with auto-calculated freeFlowSec ────────────
  const makeEdge = (
    fromId: string, toId: string,
    name: string,
    speedKmh: number,
    congestionFactor: number,
    incidentPenaltySec: number,
    isClosed = false,
  ): GraphEdge => {
    const from = graph.nodes.get(fromId)!;
    const to   = graph.nodes.get(toId)!;
    const distanceM = haversineMetres(from.coord, to.coord);
    const freeFlowSec = distanceM / ((speedKmh * 1000) / 3600);
    return {
      id: `${fromId}->${toId}`,
      fromNodeId: fromId,
      toNodeId: toId,
      name,
      distanceM,
      freeFlowSec,
      congestionFactor,
      incidentPenaltySec,
      isClosed,
      isOneWay: false,
    };
  };

  // ── Primary road edges ────────────────────────────────────────────────────
  // The segment through the incident is blocked or heavily penalised
  addEdge(graph, makeEdge('S_FAR',    'S_NEAR',   'Primary Road', 70, 1.0, 0));
  addEdge(graph, makeEdge('S_NEAR',   'INCIDENT', 'Primary Road', 70,
    blockPrimaryRoad ? 6.0 : 1.5,
    blockPrimaryRoad ? 9999 : 0,
    false,
  ));
  addEdge(graph, makeEdge('INCIDENT', 'N_NEAR',   'Primary Road', 70,
    blockPrimaryRoad ? 6.0 : 1.5,
    blockPrimaryRoad ? 9999 : 0,
    false,
  ));
  addEdge(graph, makeEdge('N_NEAR',   'N_FAR',    'Primary Road', 70, 1.0, 0));

  // ── Ring road edges (free-flow, moderate congestion) ─────────────────────
  addEdge(graph, makeEdge('RING_N', 'RING_E', 'Ring Road — NE Arc', 80, 1.2, 0));
  addEdge(graph, makeEdge('RING_E', 'RING_S', 'Ring Road — SE Arc', 80, 1.2, 0));
  addEdge(graph, makeEdge('RING_S', 'RING_W', 'Ring Road — SW Arc', 80, 1.2, 0));
  addEdge(graph, makeEdge('RING_W', 'RING_N', 'Ring Road — NW Arc', 80, 1.2, 0));

  // ── North–ring connectors ─────────────────────────────────────────────────
  addEdge(graph, makeEdge('N_NEAR', 'X_NW', 'North Cross St West', 50, 1.3, 0));
  addEdge(graph, makeEdge('N_NEAR', 'X_NE', 'North Cross St East', 50, 1.3, 0));
  addEdge(graph, makeEdge('X_NW',  'RING_W', 'NW Connector',        60, 1.1, 0));
  addEdge(graph, makeEdge('X_NE',  'RING_E', 'NE Connector',        60, 1.1, 0));

  // ── South–ring connectors ─────────────────────────────────────────────────
  addEdge(graph, makeEdge('S_NEAR', 'X_SW', 'South Cross St West', 50, 1.3, 0));
  addEdge(graph, makeEdge('S_NEAR', 'X_SE', 'South Cross St East', 50, 1.3, 0));
  addEdge(graph, makeEdge('X_SW',  'RING_W', 'SW Connector',        60, 1.1, 0));
  addEdge(graph, makeEdge('X_SE',  'RING_E', 'SE Connector',        60, 1.1, 0));

  // ── Ring to primary road far ends (diversion exit points) ────────────────
  addEdge(graph, makeEdge('RING_N', 'N_FAR', 'Ring–North Exit', 60, 1.1, 0));
  addEdge(graph, makeEdge('RING_S', 'S_FAR', 'Ring–South Exit', 60, 1.1, 0));

  return graph;
}
