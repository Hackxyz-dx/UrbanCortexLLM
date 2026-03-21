/**
 * POST /api/chat
 *
 * Accepts an officer query alongside live traffic context and recommendation data.
 * Returns a concise, official operational answer.
 *
 * Architecture is ready for real LLM: set CHAT_PROVIDER=llm to route through
 * an LLM completion — the request/response schema stays identical.
 *
 * Request body (JSON):
 * {
 *   query:           string          // officer's question
 *   incidentLat:     number
 *   incidentLng:     number
 *   incidentRoad?:   string
 *   recentMessages?: { role: 'user'|'system', text: string }[]  // short history
 * }
 *
 * Response:
 * {
 *   success:   boolean
 *   answer:    string
 *   source:    'mock-engine' | 'llm'
 *   timestamp: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIncidentsNear, buildPDEUFallbackIncidents } from '@/lib/incidents/service';
import { computeRoutes } from '@/lib/maps/routing/index';
import { generateRecommendations } from '@/lib/recommendations/service';
import type { TrafficContextInput, TrafficIncident, AlternateRoute } from '@/types/maps';
import type { RecommendationSet } from '@/lib/recommendations/service';

// ─── Request / response types ─────────────────────────────────────────────────

interface ChatRequestBody {
  query: string;
  incidentLat: number;
  incidentLng: number;
  incidentRoad?: string;
  recentMessages?: { role: 'user' | 'system'; text: string }[];
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { query, incidentLat, incidentLng, incidentRoad = '', recentMessages = [] } = body;

  if (!query?.trim()) {
    return NextResponse.json({ success: false, error: 'query is required.' }, { status: 400 });
  }
  if (typeof incidentLat !== 'number' || typeof incidentLng !== 'number') {
    return NextResponse.json({ success: false, error: 'incidentLat and incidentLng are required numbers.' }, { status: 400 });
  }

  try {
    const center = { lat: incidentLat, lng: incidentLng };

    // ── 1. Assemble context (parallel fetches) ───────────────────────────
    let incidents = await getIncidentsNear(center, 5_000);
    if (incidents.length === 0) incidents = buildPDEUFallbackIncidents();
    const primaryIncident = incidents[0];

    const routeResult = await computeRoutes({
      incident: { location: primaryIncident.location, affectedRoadName: primaryIncident.affectedRoadName || incidentRoad },
      radiusMeters: 3_000,
    });

    const context: TrafficContextInput = {
      incident: primaryIncident,
      affectedSegments: [],
      alternateRoutes: routeResult.routes,
      areaLabel: routeResult.locationLabel,
      timestamp: new Date().toISOString(),
    };

    const recommendation = await generateRecommendations(context);

    // ── 2. Dispatch to provider ──────────────────────────────────────────
    const provider = process.env.CHAT_PROVIDER ?? 'mock';
    const answer = provider === 'llm'
      ? await answerWithLLM(query, context, recommendation, recentMessages)        // Step 10
      : answerWithMockEngine(query, context, recommendation);

    return NextResponse.json({
      success: true,
      answer,
      source: provider === 'llm' ? 'llm' : 'mock-engine',
      timestamp: new Date().toISOString(),
    });

  } catch (err) {
    console.error('[POST /api/chat] Error:', err);
    return NextResponse.json({
      success: false,
      error: 'Chat processing failed. Check server logs.',
    }, { status: 500 });
  }
}

// ─── Mock engine ──────────────────────────────────────────────────────────────

function answerWithMockEngine(
  query: string,
  ctx: TrafficContextInput,
  rec: RecommendationSet,
): string {
  const q = query.toLowerCase();
  const inc = ctx.incident;
  const best = rec.diversion;
  const bestRoute = ctx.alternateRoutes.find(r => r.isRecommended) ?? ctx.alternateRoutes[0];

  // Lane / safety queries
  if (q.includes('safe') || q.includes('open') || q.includes('lane') || q.includes('reopen')) {
    return `SAFETY ADVISORY: Emergency services are active on ${inc.affectedRoadName}. `
      + `${inc.blockedLanes} of ${inc.totalLanes} lanes remain blocked. `
      + `Lane re-opening is not permitted until clearance is confirmed. `
      + `Estimated safe window: +${Math.max(inc.estimatedClearance - 15, 10)} min from now.`;
  }

  // Diversion / route queries
  if (q.includes('diversion') || q.includes('route') || q.includes('alternate') || q.includes('which road') || q.includes('first')) {
    if (best) {
      return `DIVERSION ADVISORY: Activate "${best.routeLabel}" — ${best.distanceKm} km, ~${Math.round(best.estimatedTimeSec / 60)} min. `
        + `${best.reason}`;
    }
    return `No alternate routes computed yet. Run route analysis or check /api/routes for current options.`;
  }

  // Status / clearance queries
  if (q.includes('status') || q.includes('clearance') || q.includes('update') || q.includes('eta')) {
    return `INCIDENT STATUS [${inc.severity.toUpperCase()}]: ${inc.title}. `
      + `${inc.blockedLanes}/${inc.totalLanes} lanes blocked on ${inc.affectedRoadName}. `
      + `Estimated clearance: ${inc.estimatedClearance} min. `
      + (best ? `Best diversion: "${best.routeLabel}".` : 'No diversion active.');
  }

  // Alert / VMS / publish queries
  if (q.includes('alert') || q.includes('vms') || q.includes('publish') || q.includes('message')) {
    return `PUBLIC ALERT DRAFT: "${rec.alertSummary}" — Navigate to the Comm Drafts panel to publish over VMS, social, or SMS.`;
  }

  // Recommendation / confidence / why queries
  if (q.includes('recommend') || q.includes('why') || q.includes('confidence') || q.includes('strategy')) {
    return `${rec.explanation} Confidence: ${(rec.confidence * 100).toFixed(0)}%.`;
  }

  // Route count / options
  if (q.includes('option') || q.includes('how many') || q.includes('route') || q.includes('alternate')) {
    const count = ctx.alternateRoutes.length;
    const labels = ctx.alternateRoutes.map(r => `"${r.label}"`).join(', ');
    return `${count} route option${count !== 1 ? 's' : ''} computed: ${labels || 'none'}. `
      + (bestRoute ? `Fastest alternate: "${bestRoute.label}" at ${Math.round(bestRoute.totalTravelTimeSec / 60)} min.` : '');
  }

  // Default: contextual summary
  return `QUERY PROCESSED: Incident on ${inc.affectedRoadName}, severity ${inc.severity.toUpperCase()}, `
    + `clearance in ${inc.estimatedClearance} min. `
    + (best ? `Recommended diversion: "${best.routeLabel}".` : 'No diversion identified.')
    + ` Confidence: ${(rec.confidence * 100).toFixed(0)}%.`;
}

// ─── LLM stub (Step 10) ───────────────────────────────────────────────────────

async function answerWithLLM(
  _query: string,
  _ctx: TrafficContextInput,
  _rec: RecommendationSet,
  _history: { role: 'user' | 'system'; text: string }[],
): Promise<string> {
  // TODO Step 10: build prompt from context + history, call LLM API, return completion
  throw new Error('LLM provider not yet implemented. Set CHAT_PROVIDER=mock.');
}
