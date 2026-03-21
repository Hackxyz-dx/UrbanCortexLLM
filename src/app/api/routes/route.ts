/**
 * GET /api/routes
 *
 * Computes primary and alternate routes around an incident or explicit origin/destination.
 * Always returns at least A*-computed alternates as fallback if provider routing fails.
 *
 * Query params:
 *   incidentLat  – latitude of incident  (derives origin/destination automatically)
 *   incidentLng  – longitude of incident
 *   incidentRoad – affected road name (optional, for labeling)
 *   originLat    – explicit origin latitude  (overrides incident derivation)
 *   originLng    – explicit origin longitude
 *   destLat      – explicit destination latitude
 *   destLng      – explicit destination longitude
 *   radius       – road-graph search radius in metres (default 3000)
 */

import { NextRequest, NextResponse } from 'next/server';
import { computeRoutes } from '@/lib/maps/routing/index';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const incidentLat  = parseNum(p.get('incidentLat'));
  const incidentLng  = parseNum(p.get('incidentLng'));
  const incidentRoad = p.get('incidentRoad') ?? undefined;
  const originLat    = parseNum(p.get('originLat'));
  const originLng    = parseNum(p.get('originLng'));
  const destLat      = parseNum(p.get('destLat'));
  const destLng      = parseNum(p.get('destLng'));
  const radius       = parseInt(p.get('radius') ?? '3000', 10);

  const hasIncident = incidentLat !== undefined && incidentLng !== undefined;
  const hasOrigin   = originLat   !== undefined && originLng   !== undefined;
  const hasDest     = destLat     !== undefined && destLng     !== undefined;

  if (!hasIncident && !(hasOrigin && hasDest)) {
    return NextResponse.json({
      success: false,
      error: 'Provide either incidentLat+incidentLng, or both originLat+originLng+destLat+destLng.',
    }, { status: 400 });
  }

  try {
    const result = await computeRoutes({
      incident: hasIncident
        ? { location: { lat: incidentLat!, lng: incidentLng! }, affectedRoadName: incidentRoad ?? '' }
        : undefined,
      origin:      hasOrigin ? { lat: originLat!, lng: originLng! } : undefined,
      destination: hasDest   ? { lat: destLat!,   lng: destLng!  } : undefined,
      radiusMeters: isNaN(radius) || radius <= 0 ? 3_000 : radius,
    });

    return NextResponse.json({
      success: true,
      locationSource: result.locationSource,
      locationLabel: result.locationLabel,
      origin: result.origin,
      destination: result.destination,
      provider: result.provider,
      routeCount: result.routes.length,
      computedAt: result.computedAt,
      routes: result.routes,
    });
  } catch (err) {
    console.error('[GET /api/routes] Unhandled error:', err);
    return NextResponse.json({
      success: false,
      error: 'Route computation failed. Check server logs.',
      routes: [],
    }, { status: 500 });
  }
}

function parseNum(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}
