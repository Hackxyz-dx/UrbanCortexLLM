/**
 * Recommendation Service
 *
 * Generates structured operational recommendations from a TrafficContextInput.
 * Architecture is designed for real LLM integration — the mock engine produces
 * output in the exact same schema, so swapping in an LLM call requires only
 * replacing generateWithMock() with generateWithLLM().
 *
 * Output schema: RecommendationSet
 *   ├─ diversion    : best alternate route to activate
 *   ├─ alertSummary : short public-facing message
 *   ├─ explanation  : operator-facing operational reasoning
 *   └─ metadata     : confidence, source, timestamp
 */

import type { TrafficContextInput, AlternateRoute } from '@/types/maps';

// ─── Output types ─────────────────────────────────────────────────────────────

export type RecommendationSource = 'llm' | 'mock-engine';

export interface DiversionRecommendation {
  routeId: string;
  routeLabel: string;
  distanceKm: number;
  estimatedTimeSec: number;
  reason: string;
}

export interface RecommendationSet {
  diversion: DiversionRecommendation | null;
  alertSummary: string;
  explanation: string;
  confidence: number;          // 0–1
  source: RecommendationSource;
  generatedAt: string;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a RecommendationSet from the provided traffic context.
 * Uses mock engine by default; set RECOMMENDATION_PROVIDER=llm to use real LLM.
 */
export async function generateRecommendations(
  context: TrafficContextInput,
): Promise<RecommendationSet> {
  const provider = process.env.RECOMMENDATION_PROVIDER ?? 'mock';

  if (provider === 'llm') {
    // Placeholder — Step 8 will implement this path
    return generateWithMock(context);
  }

  return generateWithMock(context);
}

// ─── Mock engine ──────────────────────────────────────────────────────────────

function generateWithMock(ctx: TrafficContextInput): RecommendationSet {
  const { incident, alternateRoutes } = ctx;

  // Pick the best diversion: prefer isRecommended, then shortest travel time
  const bestRoute = pickBestRoute(alternateRoutes);

  const diversion: DiversionRecommendation | null = bestRoute
    ? {
        routeId: bestRoute.id,
        routeLabel: bestRoute.label,
        distanceKm: parseFloat((bestRoute.totalDistanceM / 1000).toFixed(2)),
        estimatedTimeSec: bestRoute.totalTravelTimeSec,
        reason: buildDiversionReason(bestRoute, ctx),
      }
    : null;

  const severityLabel = incident.severity.toUpperCase();
  const clearance = incident.estimatedClearance;
  const road = incident.affectedRoadName || 'the affected road';
  const blockedLanes = incident.blockedLanes;
  const totalLanes = incident.totalLanes || 4;

  const alertSummary = buildAlertSummary(road, clearance, bestRoute, severityLabel);
  const explanation = buildExplanation(road, blockedLanes, totalLanes, clearance, bestRoute, ctx);
  const confidence = computeConfidence(ctx, bestRoute);

  return {
    diversion,
    alertSummary,
    explanation,
    confidence,
    source: 'mock-engine',
    generatedAt: new Date().toISOString(),
  };
}

// ─── Picking logic ────────────────────────────────────────────────────────────

function pickBestRoute(routes: AlternateRoute[]): AlternateRoute | null {
  if (!routes.length) return null;

  // Exclude the primary/direct route (it's the blocked one)
  const candidates = routes.filter(r => {
    const label = r.label.toLowerCase();
    return !label.includes('direct') && !label.includes('primary');
  });

  if (!candidates.length) return routes[0]; // nothing else available

  // Recommended flag first, then lowest effective travel time
  const recommended = candidates.find(r => r.isRecommended);
  if (recommended) return recommended;

  return candidates.sort((a, b) => a.totalTravelTimeSec - b.totalTravelTimeSec)[0];
}

// ─── Text builders ────────────────────────────────────────────────────────────

function buildDiversionReason(route: AlternateRoute, ctx: TrafficContextInput): string {
  const distKm = (route.totalDistanceM / 1000).toFixed(1);
  const timeMins = Math.round(route.totalTravelTimeSec / 60);
  const delta = route.deltaTimeSec > 0 ? ` (+${Math.round(route.deltaTimeSec / 60)} min vs free-flow)` : '';
  return `${route.label} is ${distKm} km and estimated at ${timeMins} min${delta}. `
    + `This route bypasses ${ctx.incident.affectedRoadName || 'the incident zone'} entirely.`;
}

function buildAlertSummary(
  road: string,
  clearance: number,
  best: AlternateRoute | null,
  severity: string,
): string {
  const alt = best ? ` Use ${best.label} as alternate.` : '';
  return `TRAFFIC ALERT [${severity}]: Incident on ${road}. `
    + `Expect delays of up to ${clearance} min.${alt} Follow instructions from traffic authorities.`;
}

function buildExplanation(
  road: string,
  blocked: number,
  total: number,
  clearance: number,
  best: AlternateRoute | null,
  ctx: TrafficContextInput,
): string {
  const laneInfo = total > 0
    ? `${blocked} of ${total} lane${blocked !== 1 ? 's are' : ' is'} blocked`
    : `${blocked} lane${blocked !== 1 ? 's are' : ' is'} blocked`;

  let text = `Incident on ${road}: ${laneInfo}. Estimated clearance in ${clearance} min. `;

  if (best) {
    const distKm = (best.totalDistanceM / 1000).toFixed(1);
    const timeMins = Math.round(best.totalTravelTimeSec / 60);
    text += `Best diversion identified: "${best.label}" (${distKm} km, ~${timeMins} min). `;
    text += `This route avoids the incident zone and maintains reasonable throughput. `;
  } else {
    text += `No suitable diversion identified from current route data. Manual assessment required. `;
  }

  if (ctx.operatorNotes) {
    text += `Operator note: ${ctx.operatorNotes}`;
  }

  return text.trim();
}

function computeConfidence(ctx: TrafficContextInput, best: AlternateRoute | null): number {
  let score = 0.5;

  // Boost for having route data
  if (ctx.alternateRoutes.length > 0) score += 0.2;
  // Boost for having a recommended route
  if (best?.isRecommended) score += 0.15;
  // Boost for having road segment data
  if (ctx.affectedSegments.length > 0) score += 0.1;
  // Slight penalty for fallback source
  if (ctx.incident.source === 'mock-fallback') score -= 0.1;

  return parseFloat(Math.min(Math.max(score, 0), 1).toFixed(2));
}
