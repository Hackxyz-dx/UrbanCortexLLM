/**
 * GET /api/recommendations
 *
 * Accepts incident coordinates, assembles a TrafficContextInput, and returns
 * a structured RecommendationSet (diversion, alertSummary, explanation).
 *
 * Query params:
 *   incidentLat  – latitude of incident  (required)
 *   incidentLng  – longitude of incident (required)
 *   incidentRoad – affected road name (optional)
 *   radius       – route-graph radius in metres (default 3000)
 *   notes        – operator notes (optional, passed into context)
 *
 * Response:
 * {
 *   success: boolean,
 *   recommendation: RecommendationSet,
 *   context: { incidentId, road, severity, clearance },
 *   generatedAt: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIncidentsNear, buildPDEUFallbackIncidents } from '@/lib/incidents/service';
import { computeRoutes } from '@/lib/maps/routing/index';
import { generateRecommendations } from '@/lib/recommendations/service';
import type { TrafficContextInput } from '@/types/maps';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const incidentLat  = parseNum(p.get('incidentLat'));
  const incidentLng  = parseNum(p.get('incidentLng'));
  const incidentRoad = p.get('incidentRoad') ?? '';
  const radius       = parseInt(p.get('radius') ?? '3000', 10);
  const notes        = p.get('notes') ?? undefined;

  if (incidentLat === undefined || incidentLng === undefined) {
    return NextResponse.json({
      success: false,
      error: 'incidentLat and incidentLng are required.',
    }, { status: 400 });
  }

  const center = { lat: incidentLat, lng: incidentLng };
  const safeRadius = isNaN(radius) || radius <= 0 ? 3_000 : radius;

  try {
    // ── 1. Fetch incidents ────────────────────────────────────────────────
    let incidents = await getIncidentsNear(center, safeRadius);
    if (incidents.length === 0) incidents = buildPDEUFallbackIncidents();
    const primaryIncident = incidents[0];

    // ── 2. Compute routes ────────────────────────────────────────────────
    const routeResult = await computeRoutes({
      incident: {
        location: primaryIncident.location,
        affectedRoadName: primaryIncident.affectedRoadName || incidentRoad,
      },
      radiusMeters: safeRadius,
    });

    // ── 3. Build context input ───────────────────────────────────────────
    const context: TrafficContextInput = {
      incident: primaryIncident,
      affectedSegments: [],
      alternateRoutes: routeResult.routes,
      areaLabel: routeResult.locationLabel,
      operatorNotes: notes,
      timestamp: new Date().toISOString(),
    };

    // ── 4. Generate recommendations ──────────────────────────────────────
    const recommendation = await generateRecommendations(context);

    return NextResponse.json({
      success: true,
      recommendation,
      context: {
        incidentId: primaryIncident.id,
        road: primaryIncident.affectedRoadName,
        severity: primaryIncident.severity,
        clearance: primaryIncident.estimatedClearance,
        routeCount: routeResult.routes.length,
        locationSource: routeResult.locationSource,
      },
      generatedAt: recommendation.generatedAt,
    });

  } catch (err) {
    console.error('[GET /api/recommendations] Unhandled error:', err);
    return NextResponse.json({
      success: false,
      error: 'Recommendation generation failed. Check server logs.',
    }, { status: 500 });
  }
}

function parseNum(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}
