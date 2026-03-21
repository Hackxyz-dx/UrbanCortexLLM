/**
 * Graph representation for the A* routing engine.
 *
 * Nodes represent geographic points (intersections, waypoints).
 * Edges represent road segments with weighted traversal cost.
 *
 * The graph supports:
 *   - base travel time cost (seconds)
 *   - congestion multiplier (1.0 = free flow, 4.0 = standstill)
 *   - incident/closure weight (added penalty in seconds)
 *   - directional edges (one-way roads supported)
 *
 * Future-ready: add closure flags, incident overlaps, or signal phases as edge properties.
 */

import type { GeoCoord } from '@/types/maps';

// ─── Node ────────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  coord: GeoCoord;
  /** Optional label for display/logging (e.g. intersection or road name) */
  label?: string;
}

// ─── Edge ────────────────────────────────────────────────────────────────────

export interface GraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  /** Road/segment human name */
  name: string;
  /** Base distance in metres */
  distanceM: number;
  /** Base free-flow travel time in seconds */
  freeFlowSec: number;
  /**
   * Congestion multiplier applied to freeFlowSec.
   * 1.0 = free, 1.5 = moderate, 3.0 = heavy, 6.0 = standstill
   */
  congestionFactor: number;
  /**
   * Extra penalty in seconds added on top of congested travel time.
   * Use this for closures, incidents on the segment, or roadworks.
   */
  incidentPenaltySec: number;
  /** If true this edge cannot be used in routing (full closure) */
  isClosed: boolean;
  /** If true only traversable from fromNodeId→toNodeId, not in reverse */
  isOneWay: boolean;
}

// ─── Derived cost helper ──────────────────────────────────────────────────────

/**
 * Computes the effective traversal cost for an edge.
 * cost = (freeFlowSec × congestionFactor) + incidentPenaltySec
 */
export function edgeCost(edge: GraphEdge): number {
  if (edge.isClosed) return Infinity;
  return edge.freeFlowSec * edge.congestionFactor + edge.incidentPenaltySec;
}

// ─── Graph ───────────────────────────────────────────────────────────────────

export interface RoadGraph {
  nodes: Map<string, GraphNode>;
  /** Adjacency: nodeId → list of outgoing edges */
  adjacency: Map<string, GraphEdge[]>;
}

export function createGraph(): RoadGraph {
  return { nodes: new Map(), adjacency: new Map() };
}

export function addNode(graph: RoadGraph, node: GraphNode): void {
  graph.nodes.set(node.id, node);
  if (!graph.adjacency.has(node.id)) graph.adjacency.set(node.id, []);
}

export function addEdge(graph: RoadGraph, edge: GraphEdge): void {
  // Forward direction
  const fwd = graph.adjacency.get(edge.fromNodeId) ?? [];
  fwd.push(edge);
  graph.adjacency.set(edge.fromNodeId, fwd);

  // Reverse direction (unless one-way)
  if (!edge.isOneWay) {
    const rev = graph.adjacency.get(edge.toNodeId) ?? [];
    rev.push({ ...edge, id: `${edge.id}-rev`, fromNodeId: edge.toNodeId, toNodeId: edge.fromNodeId });
    graph.adjacency.set(edge.toNodeId, rev);
  }
}

// ─── Euclid-based heuristic (degree → approximate metres) ────────────────────

const METRES_PER_LAT_DEGREE = 111_000;

export function haversineMetres(a: GeoCoord, b: GeoCoord): number {
  const dLat = (b.lat - a.lat) * METRES_PER_LAT_DEGREE;
  const avgLat = ((a.lat + b.lat) / 2) * (Math.PI / 180);
  const dLng = (b.lng - a.lng) * METRES_PER_LAT_DEGREE * Math.cos(avgLat);
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * A* heuristic: converts straight-line metres to estimated seconds at free-flow speed.
 * Default free-flow speed: 50 km/h on urban roads.
 */
export function timeHeuristic(a: GeoCoord, b: GeoCoord, freeFlowKmh = 50): number {
  const distM = haversineMetres(a, b);
  const speedMs = (freeFlowKmh * 1000) / 3600;
  return distM / speedMs;
}
