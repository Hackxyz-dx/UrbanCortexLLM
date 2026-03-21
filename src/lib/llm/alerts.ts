/**
 * LLM Alert Draft Generator
 *
 * Generates VMS, social media, and SMS alert drafts from the current
 * incident state using the LLM. Falls back to template strings on error.
 */

import { callLLM } from './client';
import { buildTrafficContext } from './context';
import { buildAlertPrompt } from './prompts';
import { parseAlertOutput } from './parser';
import type { IncidentState } from '@/data/mockIncident';
import type { LLMRecommendation, LLMAlertDrafts } from '@/types/llm';

export async function generateLLMAlerts(
  incident: IncidentState,
  llmRecommendations: LLMRecommendation[] = [],
): Promise<LLMAlertDrafts> {
  const ctx = buildTrafficContext(incident, llmRecommendations);
  const request = buildAlertPrompt(ctx);

  try {
    const raw = await callLLM(request);
    const drafts = parseAlertOutput(raw.text, raw.provider);

    console.info(
      `[LLM alerts] provider=${raw.provider} duration=${raw.durationMs}ms`,
    );

    return drafts;
  } catch (err) {
    console.error('[LLM alerts] Failed, using template fallback:', err);
    return buildTemplateFallback(incident);
  }
}

// ─── Template fallback ────────────────────────────────────────────────────────

function buildTemplateFallback(incident: IncidentState): LLMAlertDrafts {
  const { estimatedClearance: clearance, blockedLanes, totalLanes, location } = incident;
  const diversion = incident.routes.find(r => r.type === 'diversion');
  const divName = diversion?.name ?? 'Ring Road';

  return {
    vms: `ACCIDENT AHEAD\n${location.desc.slice(0, 24).toUpperCase()}\nUSE ${divName.slice(0, 20).toUpperCase()}\nEXPECT ${clearance} MIN DELAY`,
    social: `[TRAFFIC ALERT] ${incident.title}.\n\nSTATUS: ${blockedLanes}/${totalLanes} lanes blocked. Emergency crews on scene.\nACTION: Avoid area — use ${divName} as alternate route.\nDELAY: Expect ${clearance}+ minutes. #TrafficAlert #Gandhinagar`,
    sms: `TRAFFIC ALERT: ${incident.title}. ${blockedLanes}/${totalLanes} lanes blocked. Use ${divName}. Expect ${clearance}+ min delay.`.slice(0, 160),
    source: 'mock',
    generatedAt: new Date().toISOString(),
  };
}
