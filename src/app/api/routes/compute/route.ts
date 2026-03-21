/**
 * GET /api/routes/compute
 *
 * Computes primary and alternate routes for a given incident or origin-destination pair.
 * Uses A* on the mock road graph by default; upgrades to provider routes if configured.
 *
 * Query params (all optional):
 *   incidentLat  – lat of incident (uses incident-derived origin/destination)
 *   incidentLng  – lng of incident
 *   incidentRoad – affected road name (for labeling)
 *   originLat    – explicit origin latitude
 *   originLng    – explicit origin longitude
 *   destLat      – explicit destination latitude
 *   destLng      – explicit destination longitude
 *   radius       – road-graph search radius in metres (default 3000)
 *
 * Response: RouteComputeResult
 */

import { NextRequest, NextResponse } from 'next/server';
import { computeRoutes } from '@/lib/maps/routing/index';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  // Parse incident coordinates (highest priority)
  const incidentLat  = parseFloatOrUndefined(p.get('incidentLat'));
  const incidentLng  = parseFloatOrUndefined(p.get('incidentLng'));
  const incidentRoad = p.get('incidentRoad') ?? undefined;

  // Parse explicit origin/destination (second priority)
  const originLat  = parseFloatOrUndefined(p.get('originLat'));
  const originLng  = parseFloatOrUndefined(p.get('originLng'));
  const destLat    = parseFloatOrUndefined(p.get('destLat'));
  const destLng    = parseFloatOrUndefined(p.get('destLng'));

  const radius = parseInt(p.get('radius') ?? '3000', 10);

  const hasIncident = incidentLat !== undefined && incidentLng !== undefined;
  const hasOrigin   = originLat   !== undefined && originLng   !== undefined;
  const hasDest     = destLat     !== undefined && destLng     !== undefined;

  try {
    const result = await computeRoutes({
      incident: hasIncident
        ? { location: { lat: incidentLat!, lng: incidentLng! }, affectedRoadName: incidentRoad ?? '' }
        : undefined,
      origin:      hasOrigin ? { lat: originLat!, lng: originLng! } : undefined,
      destination: hasDest   ? { lat: destLat!,   lng: destLng!  } : undefined,
      radiusMeters: isNaN(radius) || radius <= 0 ? 3_000 : radius,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/routes/compute] Error:', err);
    return NextResponse.json(
      { error: 'Route computation failed. Check server logs.' },
      { status: 500 },
    );
  }
}

function parseFloatOrUndefined(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}
