/**
 * Provider abstraction interface.
 * Any map/traffic provider (HERE, Mapbox, mock) must implement this contract.
 */

import type { TrafficIncident, AlternateRoute, RoadSegment, GeoCoord } from '@/types/maps';

export interface MapProvider {
  readonly name: string;

  /** Fetch active traffic incidents near a coordinate within radiusMeters */
  fetchIncidents(center: GeoCoord, radiusMeters?: number): Promise<TrafficIncident[]>;

  /** Fetch congestion data for road segments in a bounding box */
  fetchRoadSegments(bounds: BoundingBox): Promise<RoadSegment[]>;

  /** Fetch alternate routes around a blocked incident location */
  fetchAlternateRoutes(
    origin: GeoCoord,
    destination: GeoCoord,
    incidentLocation?: GeoCoord
  ): Promise<AlternateRoute[]>;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Build a simple bounding box around a center point given a radius in meters */
export function buildBounds(center: GeoCoord, radiusMeters = 2000): BoundingBox {
  const latDelta = radiusMeters / 111_000;
  const lngDelta = radiusMeters / (111_000 * Math.cos((center.lat * Math.PI) / 180));
  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    east: center.lng + lngDelta,
    west: center.lng - lngDelta,
  };
}
