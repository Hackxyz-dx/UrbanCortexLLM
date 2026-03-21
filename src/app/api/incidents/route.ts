/**
 * GET /api/incidents
 *
 * Returns normalized traffic incidents near a given coordinate.
 * Falls back to PDEU Gandhinagar mock data if provider fails or returns nothing.
 *
 * Query params (all optional):
 *   lat      – center latitude   (default: auto from incident service)
 *   lng      – center longitude
 *   radius   – search radius in metres (default 5000)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIncidentsNear, buildPDEUFallbackIncidents, PDEU_CENTER, PDEU_RADIUS_M } from '@/lib/incidents/service';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  const lat    = parseFloat(p.get('lat')    ?? String(PDEU_CENTER.lat));
  const lng    = parseFloat(p.get('lng')    ?? String(PDEU_CENTER.lng));
  const radius = parseInt  (p.get('radius') ?? String(PDEU_RADIUS_M), 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { success: false, error: 'Invalid lat/lng query params.' },
      { status: 400 },
    );
  }

  try {
    const incidents = await getIncidentsNear({ lat, lng }, isNaN(radius) || radius <= 0 ? PDEU_RADIUS_M : radius);

    return NextResponse.json({
      success: true,
      count: incidents.length,
      center: { lat, lng },
      radiusMeters: radius,
      fetchedAt: new Date().toISOString(),
      incidents,
    });
  } catch (err) {
    console.error('[GET /api/incidents] Unhandled error:', err);

    // Hard fallback — response is always usable by frontend
    const fallback = buildPDEUFallbackIncidents();
    return NextResponse.json({
      success: false,
      error: 'Provider failed. Returning fallback data.',
      count: fallback.length,
      center: { lat, lng },
      radiusMeters: radius,
      fetchedAt: new Date().toISOString(),
      incidents: fallback,
    }, { status: 200 }); // 200 so frontend can still consume it
  }
}
