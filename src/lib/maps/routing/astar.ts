/**
 * A* pathfinding implementation on the RoadGraph.
 *
 * Cost function: effective traversal time in seconds (see edgeCost in graph.ts)
 * Heuristic: straight-line distance converted to estimated time (admissible, never overestimates)
 *
 * Returns:
 *   - AStarResult.path    : ordered node IDs from start to goal
 *   - AStarResult.edges   : edges traversed in order
 *   - AStarResult.costSec : total path cost in seconds
 *   - AStarResult.found   : whether a path exists
 */

import type { GeoCoord } from '@/types/maps';
import { type RoadGraph, type GraphEdge, edgeCost, timeHeuristic } from './graph';

// ─── Result type ─────────────────────────────────────────────────────────────

export interface AStarResult {
  found: boolean;
  path: string[];          // ordered node IDs
  edges: GraphEdge[];      // ordered edges traversed
  costSec: number;         // total weighted cost in seconds
  distanceM: number;       // total distance in metres
}

const EMPTY_RESULT: AStarResult = { found: false, path: [], edges: [], costSec: Infinity, distanceM: 0 };

// ─── Options ─────────────────────────────────────────────────────────────────

export interface AStarOptions {
  /** Free-flow speed used in the heuristic (km/h). Default 50. */
  heuristicSpeedKmh?: number;
  /** Hard limit on nodes expanded (prevents runaway search). Default 10 000. */
  maxIterations?: number;
}

// ─── Min-priority queue (binary heap) ────────────────────────────────────────

class MinHeap<T extends { f: number }> {
  private data: T[] = [];

  push(item: T): void {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }

  pop(): T | undefined {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0 && last !== undefined) {
      this.data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  get size(): number { return this.data.length; }

  private _bubbleUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].f <= this.data[i].f) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private _siftDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l].f < this.data[smallest].f) smallest = l;
      if (r < n && this.data[r].f < this.data[smallest].f) smallest = r;
      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

// ─── A* search ───────────────────────────────────────────────────────────────

interface OpenItem { nodeId: string; f: number; }

export function astar(
  graph: RoadGraph,
  startNodeId: string,
  goalNodeId: string,
  options: AStarOptions = {},
): AStarResult {
  const { heuristicSpeedKmh = 50, maxIterations = 10_000 } = options;

  const startNode = graph.nodes.get(startNodeId);
  const goalNode  = graph.nodes.get(goalNodeId);
  if (!startNode || !goalNode) return EMPTY_RESULT;

  // g(n): best known cost from start to n
  const g = new Map<string, number>();
  g.set(startNodeId, 0);

  // came_from for path reconstruction
  const cameFromNode = new Map<string, string>();
  const cameFromEdge = new Map<string, GraphEdge>();

  const closed = new Set<string>();
  const open = new MinHeap<OpenItem>();
  open.push({ nodeId: startNodeId, f: 0 });

  let iterations = 0;

  while (open.size > 0 && iterations < maxIterations) {
    iterations++;
    const current = open.pop()!;
    const { nodeId } = current;

    if (nodeId === goalNodeId) {
      return reconstructPath(graph, cameFromNode, cameFromEdge, startNodeId, goalNodeId);
    }

    if (closed.has(nodeId)) continue;
    closed.add(nodeId);

    const edges = graph.adjacency.get(nodeId) ?? [];
    for (const edge of edges) {
      if (edge.isClosed) continue;
      const neighbour = edge.toNodeId;
      if (closed.has(neighbour)) continue;

      const tentativeG = (g.get(nodeId) ?? Infinity) + edgeCost(edge);
      if (tentativeG >= (g.get(neighbour) ?? Infinity)) continue;

      g.set(neighbour, tentativeG);
      cameFromNode.set(neighbour, nodeId);
      cameFromEdge.set(neighbour, edge);

      const neighbourCoord = graph.nodes.get(neighbour)?.coord ?? goalNode.coord;
      const h = timeHeuristic(neighbourCoord, goalNode.coord, heuristicSpeedKmh);
      open.push({ nodeId: neighbour, f: tentativeG + h });
    }
  }

  return EMPTY_RESULT; // no path found
}

// ─── Path reconstruction ──────────────────────────────────────────────────────

function reconstructPath(
  graph: RoadGraph,
  cameFromNode: Map<string, string>,
  cameFromEdge: Map<string, GraphEdge>,
  startId: string,
  goalId: string,
): AStarResult {
  const path: string[] = [];
  const edges: GraphEdge[] = [];
  let current = goalId;

  while (current !== startId) {
    path.unshift(current);
    const edge = cameFromEdge.get(current);
    if (edge) edges.unshift(edge);
    const prev = cameFromNode.get(current);
    if (!prev) break;
    current = prev;
  }
  path.unshift(startId);

  const costSec = edges.reduce((sum, e) => sum + edgeCost(e), 0);
  const distanceM = edges.reduce((sum, e) => sum + e.distanceM, 0);

  return { found: true, path, edges, costSec, distanceM };
}

// ─── Geometry extraction helper ───────────────────────────────────────────────

/**
 * Converts an AStarResult into an ordered GeoCoord[] suitable for map rendering.
 * Uses node coordinates for each waypoint in the path.
 */
export function pathToGeometry(graph: RoadGraph, result: AStarResult): GeoCoord[] {
  return result.path
    .map(nodeId => graph.nodes.get(nodeId)?.coord)
    .filter((c): c is GeoCoord => c !== undefined);
}
