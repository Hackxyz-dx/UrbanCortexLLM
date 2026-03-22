/**
 * LLM Recommendation Generator
 *
 * Builds the traffic context, calls the LLM, parses the structured output,
 * and returns a validated LLMRecommendationOutput.
 *
 * Falls back to mock output on LLMQuotaError (429) or any other LLM failure.
 */

import { callLLM, getMockProvider, LLMQuotaError } from './client';
import { buildRecommendationPrompt } from './prompts';
import { parseRecommendationOutput } from './parser';
import { buildTrafficContext, serializeContext } from './context';
import type { IncidentState } from '@/data/mockIncident';
import type { LLMRecommendation, LLMRecommendationOutput } from '@/types/llm';

export async function generateLLMRecommendations(
  incident: IncidentState,
  existingRecs: LLMRecommendation[] = [],
): Promise<LLMRecommendationOutput> {
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
    if (err instanceof LLMQuotaError) {
      console.warn('[LLM recommendations] Quota exceeded — falling back to mock provider.');
    } else {
      console.error('[LLM recommendations] LLM call failed — falling back to mock provider:', err);
    }

    // Call the mock directly so we always return a valid response.
    const mockRaw = await getMockProvider().complete(request);
    return parseRecommendationOutput(mockRaw.text, mockRaw.provider);
  }
}

