/**
 * LLM Chat Answer Generator
 *
 * Builds the chat prompt with full traffic context + conversation history,
 * calls the LLM, parses the answer, and returns a clean operational string.
 */

import { callLLM } from './client';
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
}
