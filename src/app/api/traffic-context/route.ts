/**
 * GET /api/traffic-context
 *
 * Assembles a complete TrafficContextInput from live incident + route data.
 * This is the structured payload intended for the LLM context builder (Step 6).
 *
 * Query params:
 *   incidentLat  – latitude of incident  (required)
 *   incidentLng  – longitude of incident (required)
 *   incidentRoad – affected road name (optional)
 *   radius       – road-graph search radius in metres (default 3000)
 *   notes        – optional operator notes string
 *
 * Response schema (TrafficContextInput + metadata):
 * {
 *   success: boolean,
 *   context: TrafficContextInput,
 *   routeCount: number,
 *   fetchedAt: string,
 *   locationSource: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIncidentsNear, buildPDEUFallbackIncidents } from '@/lib/incidents/service';
import { computeRoutes } from '@/lib/maps/routing/index';
import type { TrafficContextInput, TrafficIncident } from '@/types/maps';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const incidentLat  = parseNum(p.get('incidentLat'));
  const incidentLng  = parseNum(p.get('incidentLng'));
  const incidentRoad = p.get('incidentRoad') ?? '';
  const radius       = parseInt(p.get('radius') ?? '3000', 10);
  const operatorNotes = p.get('notes') ?? undefined;

  if (incidentLat === undefined || incidentLng === undefined) {
    return NextResponse.json({
      success: false,
      error: 'incidentLat and incidentLng are required.',
    }, { status: 400 });
  }

  const center = { lat: incidentLat, lng: incidentLng };
  const safeRadius = isNaN(radius) || radius <= 0 ? 3_000 : radius;

  try {
    // ── 1. Fetch incidents near the provided coordinates ─────────────────
    let incidents = await getIncidentsNear(center, safeRadius);
    if (incidents.length === 0) {
      incidents = buildPDEUFallbackIncidents();
    }

    // Use the first (most critical) incident as the primary context subject
    const primaryIncident: TrafficIncident = incidents[0];

    // ── 2. Compute alternate routes around the incident ───────────────────
    const routeResult = await computeRoutes({
      incident: { location: primaryIncident.location, affectedRoadName: primaryIncident.affectedRoadName || incidentRoad },
      radiusMeters: safeRadius,
    });

    // ── 3. Assemble TrafficContextInput ───────────────────────────────────
    const context: TrafficContextInput = {
      incident: primaryIncident,
      affectedSegments: [],         // Road segment fetch is Step 4 — placeholder here
      alternateRoutes: routeResult.routes,
      areaLabel: routeResult.locationLabel,
      operatorNotes,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      locationSource: routeResult.locationSource,
      routeCount: routeResult.routes.length,
      fetchedAt: new Date().toISOString(),
      context,
    });

  } catch (err) {
    console.error('[GET /api/traffic-context] Unhandled error:', err);

    // Hard fallback — always return a usable context so frontend is never broken
    const fallbackIncident = buildPDEUFallbackIncidents()[0];
    const fallbackContext: TrafficContextInput = {
      incident: fallbackIncident,
      affectedSegments: [],
      alternateRoutes: [],
      areaLabel: `Fallback context — error during fetch for (${incidentLat}, ${incidentLng})`,
      operatorNotes,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: false,
      error: 'Context assembly failed. Returning fallback context.',
      locationSource: 'fallback',
      routeCount: 0,
      fetchedAt: new Date().toISOString(),
      context: fallbackContext,
    }, { status: 200 }); // 200 so frontend can still consume the fallback
  }
}

function parseNum(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}
