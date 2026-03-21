/**
 * LLM Recommendation Generator
 *
 * Builds the traffic context, calls the LLM, parses the structured output,
 * and returns a validated LLMRecommendationOutput.
 *
 * Falls back to the mock provider output on any LLM or parse error.
 */

import { callLLM } from './client';
import { getLLMProvider } from './provider';
import { buildRecommendationPrompt } from './prompts';
import { parseRecommendationOutput } from './parser';
import { buildTrafficContext, serializeContext } from './context';
import type { IncidentState } from '@/data/mockIncident';
import type { LLMRecommendation, LLMRecommendationOutput } from '@/types/llm';

export async function generateLLMRecommendations(
  incident: IncidentState,
  existingRecs: LLMRecommendation[] = [],
): Promise<LLMRecommendationOutput> {
  const provider = getLLMProvider();
  const ctx = buildTrafficContext(incident, existingRecs);
  const request = buildRecommendationPrompt(ctx);

  try {
    const raw = await callLLM(request);
    const output = parseRecommendationOutput(raw.text, raw.provider);
    console.info(
      `[LLM recommendations] provider=${raw.provider} recs=${output.recommendations.length} duration=${raw.durationMs}ms`,
    );
    return output;
  } catch (err) {
    console.error('[LLM recommendations] Failed, using mock fallback:', err);
    // Fallback: call mock directly
    const { getLLMProvider: getMock } = await import('./provider');
    // Force mock by temporarily importing directly
    const { MockFallback } = await getMockFallback();
    return MockFallback.recommendations(ctx);
  }
}

// ─── Inline mock fallback (avoids circular provider reset) ────────────────────

async function getMockFallback() {
  // Build deterministic output matching the schema, same as MockLLMProvider
  return {
    MockFallback: {
      recommendations: (ctx: ReturnType<typeof buildTrafficContext>): LLMRecommendationOutput => {
        const ts = new Date().toISOString();
        return {
          recommendations: [
            {
              id: `llm-rec-${Date.now()}-1`,
              type: 'diversion',
              title: 'Activate Sardar Patel Ring Road Diversion',
              description: 'Redirect all non-emergency westbound traffic to Sardar Patel Ring Road via Sector-23 off-ramp.',
              reasoning: 'Ring Road has 45% spare capacity and fully bypasses the blocked mainline.',
              expectedImpact: 'Expected to divert ~700 vph, reducing queue growth by 2.1 km.',
              confidence: 0.93,
              status: 'suggested',
              generatedAt: ts,
              diversionRouteName: 'Sardar Patel Ring Road Diversion',
            },
            {
              id: `llm-rec-${Date.now()}-2`,
              type: 'signal-timing',
              title: 'Extend Green Phase at Indroda Circle (+20s N-S)',
              description: 'Increase N-S green phase by 20s at Indroda Circle, Sector-23 gate, PDEU West entry.',
              reasoning: 'Surge in Ring Road traffic will cause spillback without signal adjustment.',
              expectedImpact: 'Prevents gridlock at Indroda Circle; maintains throughput.',
              confidence: 0.88,
              status: 'suggested',
              generatedAt: ts,
            },
            {
              id: `llm-rec-${Date.now()}-3`,
              type: 'public-alert',
              title: 'Publish VMS + Social Alert',
              description: 'Broadcast public advisory on VMS board GJ-27 and social channels.',
              reasoning: 'Early advisory reduces incoming traffic on blocked approach by 20–30%.',
              expectedImpact: 'Reduces approach volume as commuters self-divert.',
              confidence: 0.91,
              status: 'suggested',
              generatedAt: ts,
              alertText: 'ACCIDENT AHEAD — KOBA-GANDHINAGAR HWY NEAR PDEU — USE RING ROAD — EXPECT 45 MIN DELAY',
            },
          ],
          explanation: `Critical incident (${ctx.severity.toUpperCase()}) on ${ctx.location}: ${ctx.blockedLanes}/${ctx.totalLanes} lanes blocked. Ring Road diversion with signal cascade is the primary throughput strategy. Public advisory required.`,
          confidence: 0.91,
          cautionNote: 'Confirm Ring Road capacity is not already saturated before activating diversion.',
          source: 'mock',
          generatedAt: ts,
        };
      },
    },
  };
}
