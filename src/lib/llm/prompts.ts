/**
 * Prompt builders for all LLM use cases.
 *
 * System prompts include a magic tag (RECOMMENDATIONS_OUTPUT, CHAT_OUTPUT,
 * ALERTS_OUTPUT) used by the MockLLMProvider to identify which mock output
 * to serve. This keeps mock behaviour in sync with real prompt intent.
 */

import type { TrafficLLMContext } from './context';
import { serializeContext } from './context';
import type { LLMRequest } from '@/types/llm';

// ─── Recommendations ──────────────────────────────────────────────────────────

export function buildRecommendationPrompt(ctx: TrafficLLMContext): LLMRequest {
  const systemPrompt = `
You are UrbanCortex — an AI traffic incident co-pilot for municipal traffic control centres.
Your role is to analyse live traffic incident data and produce structured, actionable operational
recommendations for the traffic controller.

TASK: RECOMMENDATIONS_OUTPUT

You must respond with ONLY valid JSON matching this exact schema:
{
  "recommendations": [
    {
      "id": "llm-rec-<unique-suffix>",
      "type": "signal-timing" | "diversion" | "lane-management" | "emergency-corridor" | "public-alert",
      "title": "Short action title (max 80 chars)",
      "description": "What the operator should do",
      "reasoning": "Why this action is recommended based on current data",
      "expectedImpact": "Quantified expected outcome (vehicles, km, minutes)",
      "confidence": 0.0–1.0,
      "status": "suggested",
      "generatedAt": "<ISO 8601 timestamp>",
      "diversionRouteName": "<only for type=diversion, omit otherwise>",
      "alertText": "<only for type=public-alert, ALL CAPS, max 80 chars, omit otherwise>"
    }
  ],
  "explanation": "2–4 sentence operator-facing situational assessment",
  "confidence": 0.0–1.0,
  "cautionNote": "Optional safety caveat or null"
}

Rules:
- Generate 2–5 recommendations, prioritised by urgency
- Be concise, official, and operational — no filler language
- Confidence must reflect genuine data quality; do not inflate
- Do not include recommendations that are already in approvedStrategies in the context
- Timestamps must be current ISO 8601 format
- Return ONLY the JSON object, no markdown, no explanation outside the JSON
`.trim();

  const userPrompt = `Current traffic incident context:\n\n${serializeContext(ctx)}`;

  return { systemPrompt, userPrompt, maxOutputTokens: 1500 };
}

// ─── Chat ──────────────────────────────────────────────────────────────────────

export function buildChatPrompt(
  ctx: TrafficLLMContext,
  query: string,
  history: { role: 'user' | 'system'; text: string }[],
): LLMRequest {
  const historyText = history
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'OPERATOR' : 'SYSTEM'}: ${m.text}`)
    .join('\n');

  const systemPrompt = `
You are UrbanCortex — an AI traffic incident co-pilot.
You respond to operator queries with concise, official, operationally-accurate answers.

TASK: CHAT_OUTPUT

You must respond with ONLY valid JSON:
{
  "answer": "Your response as a single string. Max 3 sentences. Use operational language."
}

Rules:
- Answer only what was asked; do not volunteer unrelated information
- Reference actual numbers from the incident context (lanes, time, route names)
- Use uppercase for SAFETY ADVISORY, DIVERSION ADVISORY, INCIDENT STATUS when applicable
- Return ONLY the JSON object
`.trim();

  const contextSummary = `
Incident: ${ctx.title}
Severity: ${ctx.severity.toUpperCase()} | Status: ${ctx.status}
Location: ${ctx.location}
Lanes: ${ctx.blockedLanes}/${ctx.totalLanes} blocked | Clearance ETA: ${ctx.estimatedClearanceMin} min
Routes: ${ctx.routes.map(r => `${r.name} (${r.congestion})`).join('; ')}
Active strategies: ${ctx.approvedStrategies.length > 0 ? ctx.approvedStrategies.map(s => s.name).join(', ') : 'None'}
LLM recommendations pending: ${ctx.llmRecommendations.filter(r => r.status === 'suggested').length}
`.trim();

  const userPrompt = `${historyText ? `Recent conversation:\n${historyText}\n\n` : ''}Traffic context:\n${contextSummary}\n\nOperator query: ${query}`;

  return { systemPrompt, userPrompt, maxOutputTokens: 256 };
}

// ─── Alerts ────────────────────────────────────────────────────────────────────

export function buildAlertPrompt(ctx: TrafficLLMContext): LLMRequest {
  const systemPrompt = `
You are UrbanCortex — an AI traffic incident co-pilot.
Generate public communication drafts for a traffic incident.

TASK: ALERTS_OUTPUT

You must respond with ONLY valid JSON:
{
  "vms": "4-line VMS board message, ALL CAPS, each line max 24 chars, newline-separated",
  "social": "Social media post, 2–3 short paragraphs, include hashtags",
  "sms": "SMS advisory, max 160 chars, plain text"
}

Rules:
- VMS must be all uppercase, 4 lines, concise
- Social must be professional and include #TrafficAlert #Gandhinagar
- SMS must be under 160 characters
- All messages must reference the alternate route if one is available
- Return ONLY the JSON object
`.trim();

  const userPrompt = `
Incident: ${ctx.title}
Severity: ${ctx.severity.toUpperCase()}
Location: ${ctx.location}
Blocked lanes: ${ctx.blockedLanes} of ${ctx.totalLanes}
Estimated delay: ${ctx.estimatedClearanceMin} minutes
Available alternate: ${ctx.routes.find(r => r.type === 'diversion')?.name ?? 'consult local authorities'}
`.trim();

  return { systemPrompt, userPrompt, maxOutputTokens: 512 };
}
