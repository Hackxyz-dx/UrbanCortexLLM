/**
 * Core domain types for map and traffic data.
 * Used across the service layer and eventually the LLM context builder.
 */

// ─── Incident ───────────────────────────────────────────────────────────────

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface TrafficIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  location: GeoCoord;
  affectedRoadName: string;
  blockedLanes: number;
  totalLanes: number;
  startTime: string;        // ISO 8601
  estimatedClearance: number; // minutes
  source: string;           // e.g. "HERE", "Mapbox", "mock"
}

// ─── Road Segment ────────────────────────────────────────────────────────────

export type CongestionLevel = 'free' | 'moderate' | 'heavy' | 'standstill';

export interface RoadSegment {
  id: string;
  name: string;
  coordinates: GeoCoord[];
  congestion: CongestionLevel;
  speedKmh: number;
  freeFlowSpeedKmh: number;
  travelTimeSec: number;
  freeFlowTravelTimeSec: number;
}

// ─── Alternate Route ─────────────────────────────────────────────────────────

export type RouteType = 'fastest' | 'shortest' | 'scenic';

export interface AlternateRoute {
  id: string;
  label: string;                 // human-readable name
  type: RouteType;
  segments: RoadSegment[];
  totalDistanceM: number;
  totalTravelTimeSec: number;
  deltaTimeSec: number;          // vs blocked route (positive = slower)
  coordinates: GeoCoord[];       // simplified polyline for rendering
  isRecommended: boolean;
}

// ─── Route Response ──────────────────────────────────────────────────────────

export interface RouteResponse {
  origin: GeoCoord;
  destination: GeoCoord;
  requestedAt: string;           // ISO 8601
  incident?: TrafficIncident;
  primaryRoute: RoadSegment[];
  alternates: AlternateRoute[];
  provider: string;
}

// ─── Traffic Context Input (for LLM) ─────────────────────────────────────────
// This will later be fed into the LLM prompt builder.

export interface TrafficContextInput {
  incident: TrafficIncident;
  affectedSegments: RoadSegment[];
  alternateRoutes: AlternateRoute[];
  areaLabel: string;             // e.g. "PDEU Gandhinagar, Sector-23"
  operatorNotes?: string;
  timestamp: string;             // ISO 8601
}

// ─── Shared ──────────────────────────────────────────────────────────────────

export interface GeoCoord {
  lat: number;
  lng: number;
}
