/**
 * Mock provider for local development and testing.
 * Returns deterministic PDEU Gandhinagar data so the UI works without real API keys.
 * MAP_PROVIDER=mock (default if env var is not set)
 */

import type { MapProvider, BoundingBox } from './provider';
import type { TrafficIncident, AlternateRoute, RoadSegment, GeoCoord } from '@/types/maps';

export class MockProvider implements MapProvider {
  readonly name = 'Mock';

  async fetchIncidents(_center: GeoCoord, _radiusMeters?: number): Promise<TrafficIncident[]> {
    return [
      {
        id: 'INC-2026-PDEU-01',
        title: 'Multi-Vehicle Collision — Koba-Gandhinagar Hwy',
        description: 'Severe multi-vehicle collision blocking 3 of 4 lanes near PDEU Main Gate.',
        severity: 'critical',
        location: { lat: 23.1565, lng: 72.6659 },
        affectedRoadName: 'Koba-Gandhinagar Highway, Sector-23',
        blockedLanes: 3,
        totalLanes: 4,
        startTime: new Date().toISOString(),
        estimatedClearance: 90,
        source: 'Mock',
      },
    ];
  }

  async fetchRoadSegments(_bounds: BoundingBox): Promise<RoadSegment[]> {
    return [
      {
        id: 'seg-koba-1',
        name: 'Koba-Gandhinagar Hwy (Northbound)',
        coordinates: [
          { lat: 23.1480, lng: 72.6640 },
          { lat: 23.1565, lng: 72.6659 },
          { lat: 23.1620, lng: 72.6670 },
        ],
        congestion: 'standstill',
        speedKmh: 4,
        freeFlowSpeedKmh: 70,
        travelTimeSec: 1800,
        freeFlowTravelTimeSec: 120,
      },
      {
        id: 'seg-ring-1',
        name: 'Sardar Patel Ring Road',
        coordinates: [
          { lat: 23.1480, lng: 72.6640 },
          { lat: 23.1430, lng: 72.6580 },
          { lat: 23.1400, lng: 72.6430 },
          { lat: 23.1560, lng: 72.6400 },
          { lat: 23.1620, lng: 72.6670 },
        ],
        congestion: 'moderate',
        speedKmh: 45,
        freeFlowSpeedKmh: 80,
        travelTimeSec: 360,
        freeFlowTravelTimeSec: 240,
      },
    ];
  }

  async fetchAlternateRoutes(
    _origin: GeoCoord,
    _destination: GeoCoord,
  ): Promise<AlternateRoute[]> {
    return [
      {
        id: 'alt-ring-road',
        label: 'Sardar Patel Ring Road Diversion',
        type: 'fastest',
        segments: [],
        totalDistanceM: 9_200,
        totalTravelTimeSec: 360,
        deltaTimeSec: 120,   // 2 min longer than free-flow but much faster than blocked mainline
        coordinates: [
          { lat: 23.1480, lng: 72.6640 },
          { lat: 23.1430, lng: 72.6580 },
          { lat: 23.1400, lng: 72.6430 },
          { lat: 23.1560, lng: 72.6400 },
          { lat: 23.1620, lng: 72.6670 },
        ],
        isRecommended: true,
      },
      {
        id: 'alt-sector7',
        label: 'Sector-7 Internal Road',
        type: 'shortest',
        segments: [],
        totalDistanceM: 6_400,
        totalTravelTimeSec: 510,
        deltaTimeSec: 270,
        coordinates: [
          { lat: 23.1480, lng: 72.6640 },
          { lat: 23.1510, lng: 72.6570 },
          { lat: 23.1560, lng: 72.6530 },
          { lat: 23.1620, lng: 72.6670 },
        ],
        isRecommended: false,
      },
    ];
  }
}
