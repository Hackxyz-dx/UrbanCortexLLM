/**
 * LLM Chat Answer Generator
 *
 * Builds the chat prompt with full traffic context + conversation history,
 * calls the LLM, parses the answer, and returns a clean operational string.
 *
 * Falls back to mock on LLMQuotaError (429) or a hardcoded safe answer on
 * any other failure — the chat API route must never return an unhandled 500.
 */

import { callLLM, getMockProvider, LLMQuotaError } from './client';
import { buildTrafficContext } from './context';
import { buildChatPrompt } from './prompts';
import { parseChatOutput } from './parser';
import type { IncidentState } from '@/data/mockIncident';
import type { LLMRecommendation, LLMChatOutput } from '@/types/llm';

export async function generateLLMChatAnswer(
  incident: IncidentState,
  llmRecommendations: LLMRecommendation[],
  query: string,
  history: { role: 'user' | 'system'; text: string }[],
): Promise<LLMChatOutput> {
  const ctx = buildTrafficContext(incident, llmRecommendations);
  const request = buildChatPrompt(ctx, query, history);

  try {
    const raw = await callLLM(request);
    const answer = parseChatOutput(raw.text);

    console.info(
      `[LLM chat] provider=${raw.provider} query="${query.slice(0, 60)}" duration=${raw.durationMs}ms`,
    );

    return {
      answer,
      source: raw.provider,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    if (err instanceof LLMQuotaError) {
      console.warn('[LLM chat] Quota exceeded — serving mock answer.');
      // Use the mock provider directly for a context-aware response.
      const mockRaw = await getMockProvider().complete(request);
      const answer = parseChatOutput(mockRaw.text);
      return { answer, source: 'mock', timestamp: new Date().toISOString() };
    }

    // Generic fallback — surface a safe message rather than crash the route.
    console.error('[LLM chat] LLM call failed — returning safe fallback answer:', err);
    return {
      answer: 'LLM temporarily unavailable. Please check server logs or retry in a moment.',
      source: 'mock',
      timestamp: new Date().toISOString(),
    };
  }
}
