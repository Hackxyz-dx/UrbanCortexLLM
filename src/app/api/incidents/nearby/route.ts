/**
 * GET /api/incidents/nearby
 *
 * Returns normalized traffic incidents near PDEU Gandhinagar.
 * Uses the configured MAP_PROVIDER (mock by default).
 * Falls back to PDEU mock data if the provider fails.
 *
 * Query params:
 *   lat       – latitude  (default: PDEU_CENTER.lat)
 *   lng       – longitude (default: PDEU_CENTER.lng)
 *   radius    – search radius in metres (default: 5000)
 *
 * Response: { incidents: TrafficIncident[], source: string, fetchedAt: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIncidentsNear, PDEU_CENTER, PDEU_RADIUS_M } from '@/lib/incidents/service';
import { getMapProvider } from '@/lib/maps';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const lat = parseFloat(searchParams.get('lat') ?? String(PDEU_CENTER.lat));
  const lng = parseFloat(searchParams.get('lng') ?? String(PDEU_CENTER.lng));
  const radius = parseInt(searchParams.get('radius') ?? String(PDEU_RADIUS_M), 10);

  // Validate inputs
  if (isNaN(lat) || isNaN(lng) || isNaN(radius) || radius <= 0) {
    return NextResponse.json(
      { error: 'Invalid query parameters. Provide numeric lat, lng, and radius.' },
      { status: 400 },
    );
  }

  try {
    const incidents = await getIncidentsNear({ lat, lng }, radius);
    const provider = getMapProvider();

    return NextResponse.json({
      incidents,
      source: provider.name,
      center: { lat, lng },
      radiusMeters: radius,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[/api/incidents/nearby] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch incidents. Check server logs.' },
      { status: 500 },
    );
  }
}
