/**
 * LLM Provider abstraction.
 *
 * Selects Google Gemini when GEMINI_API_KEY is present; falls back to the
 * deterministic mock provider. Adding a new provider (OpenAI, Anthropic, etc.)
 * requires only implementing the LLMProvider interface below.
 */

import type { LLMRequest, LLMRawResponse, LLMProviderName } from '@/types/llm';
import { env } from '@/lib/config/env';

// ─── Error types ──────────────────────────────────────────────────────────────

/**
 * Thrown when the Gemini API returns 429 (quota/rate-limit exhausted).
 * Callers should catch this and serve the mock fallback immediately —
 * retrying will only consume more of the depleted quota.
 */
export class LLMQuotaError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LLMQuotaError';
  }
}

/** Thrown for non-quota Gemini API errors (4xx/5xx other than 429). */
export class LLMCallError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LLMCallError';
  }
}

// ─── Provider interface ────────────────────────────────────────────────────────

export interface LLMProvider {
  readonly name: LLMProviderName;
  complete(request: LLMRequest): Promise<LLMRawResponse>;
}

// ─── Gemini provider ──────────────────────────────────────────────────────────

class GeminiProvider implements LLMProvider {
  readonly name: LLMProviderName = 'gemini';
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.model = env.gemini.model;
  }

  async complete(request: LLMRequest): Promise<LLMRawResponse> {
    const start = Date.now();

    try {
      // Dynamic import to keep edge-runtime safe if ever needed
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.apiKey);

      const model = genAI.getGenerativeModel({
        model: this.model,
        systemInstruction: request.systemPrompt,
        generationConfig: {
          maxOutputTokens: request.maxOutputTokens ?? 1024,
          temperature: 0.2,        // low temp for deterministic, operational output
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(request.userPrompt);
      const text = result.response.text();

      return { text, provider: 'gemini', durationMs: Date.now() - start };
    } catch (err) {
      // The @google/generative-ai SDK attaches `status` to API errors.
      const status = (err as Record<string, unknown>)?.status as number | undefined;
      const httpStatus = (err as Record<string, unknown>)?.httpStatus as number | undefined;
      const code = status ?? httpStatus;

      if (code === 429) {
        console.warn(
          `[LLM] Gemini quota/rate-limit hit (429). ` +
          `Throwing LLMQuotaError — callers will switch to mock. ` +
          `Elapsed: ${Date.now() - start}ms`,
        );
        throw new LLMQuotaError('Gemini API quota exceeded (429).', err);
      }

      console.error(`[LLM] Gemini API error (status=${code ?? 'unknown'}):`, err);
      throw new LLMCallError(`Gemini API call failed (status=${code ?? 'unknown'}).`, err);
    }
  }
}

// ─── Mock provider ────────────────────────────────────────────────────────────
// Returns a valid JSON string matching whichever LLM output schema is expected.
// The prompt includes a JSON schema comment that mock reads to determine output type.

class MockLLMProvider implements LLMProvider {
  readonly name: LLMProviderName = 'mock';

  async complete(request: LLMRequest): Promise<LLMRawResponse> {
    const start = Date.now();

    let text: string;

    if (request.systemPrompt.includes('RECOMMENDATIONS_OUTPUT')) {
      text = JSON.stringify(buildMockRecommendations());
    } else if (request.systemPrompt.includes('CHAT_OUTPUT')) {
      text = JSON.stringify(buildMockChatOutput(request.userPrompt));
    } else if (request.systemPrompt.includes('ALERTS_OUTPUT')) {
      text = JSON.stringify(buildMockAlerts(request.userPrompt));
    } else {
      text = JSON.stringify({ answer: 'Mock response: LLM provider not configured. Set GEMINI_API_KEY to enable real AI responses.' });
    }

    // Simulate a brief network delay for realism in dev
    await new Promise(r => setTimeout(r, 150));

    return { text, provider: 'mock', durationMs: Date.now() - start };
  }
}

// ─── Mock output builders ──────────────────────────────────────────────────────

function buildMockRecommendations() {
  return {
    recommendations: [
      {
        id: `llm-rec-${Date.now()}-1`,
        type: 'diversion',
        title: 'Activate Sardar Patel Ring Road Diversion',
        description: 'Redirect all non-emergency westbound traffic to Sardar Patel Ring Road via Sector-23 off-ramp.',
        reasoning: 'Ring Road has 45% spare capacity and fully bypasses the blocked mainline. This is the highest-throughput option available.',
        expectedImpact: 'Expected to divert ~700 vph away from blocked mainline, reducing queue growth by 2.1 km.',
        confidence: 0.93,
        status: 'suggested',
        generatedAt: new Date().toISOString(),
        diversionRouteName: 'Sardar Patel Ring Road Diversion',
      },
      {
        id: `llm-rec-${Date.now()}-2`,
        type: 'signal-timing',
        title: 'Extend Green Phase at Indroda Circle (+20s N-S)',
        description: 'Increase northbound/southbound green phase by 20 seconds at Indroda Circle, Sector-23 gate, and PDEU West entry.',
        reasoning: 'Surge in Ring Road traffic will cause spillback at Indroda Circle without signal adjustment. Green extension accommodates diverted volume.',
        expectedImpact: 'Prevents gridlock at the junction; maintains throughput for diverted Ring Road traffic.',
        confidence: 0.88,
        status: 'suggested',
        generatedAt: new Date().toISOString(),
      },
      {
        id: `llm-rec-${Date.now()}-3`,
        type: 'public-alert',
        title: 'Publish VMS + Social Alert for Incident',
        description: 'Broadcast public advisory on VMS board GJ-27 and social media channels.',
        reasoning: 'Public is unaware of alternate route. Early advisory reduces incoming traffic volume on blocked approach.',
        expectedImpact: 'Reduces approach volume by an estimated 20–30% as commuters self-divert.',
        confidence: 0.91,
        status: 'suggested',
        generatedAt: new Date().toISOString(),
        alertText: 'ACCIDENT AHEAD — KOBA-GANDHINAGAR HWY NEAR PDEU — USE RING ROAD — EXPECT 45 MIN DELAY',
      },
    ],
    explanation: 'Critical multi-vehicle incident with 3 of 4 lanes blocked. Primary throughput strategy is Ring Road diversion with signal cascade. Public advisory is required to reduce incoming approach volume. Incident clearance estimated at 90 minutes without intervention; with active diversion, effective delay reduces to ~45 minutes.',
    confidence: 0.91,
    cautionNote: 'Confirm Ring Road capacity is not already saturated from prior peak volume before activating diversion.',
    source: 'mock',
    generatedAt: new Date().toISOString(),
  };
}

function buildMockChatOutput(userPrompt: string) {
  const q = userPrompt.toLowerCase();
  let answer: string;

  if (q.includes('diversion') || q.includes('route') || q.includes('which road') || q.includes('first')) {
    answer = 'DIVERSION ADVISORY: Activate "Sardar Patel Ring Road Diversion" immediately. It is the only route with sufficient spare capacity (45%) to absorb the mainline volume. Approve Recommendation #1 in the Decision Support panel.';
  } else if (q.includes('lane') || q.includes('safe') || q.includes('open') || q.includes('reopen')) {
    answer = 'SAFETY ADVISORY: Emergency services are actively operating on Koba-Gandhinagar Hwy near PDEU Main Gate. Lane re-opening is NOT permitted until on-scene commander confirms clearance. ETA to safe opening: +60 minutes minimum.';
  } else if (q.includes('status') || q.includes('update') || q.includes('clearance') || q.includes('eta')) {
    answer = 'INCIDENT STATUS [CRITICAL]: Multi-vehicle collision, Koba-Gandhinagar Hwy. 3/4 lanes blocked. Estimated clearance: 90 minutes. No diversion active yet. Queue growth continues on mainline approach.';
  } else if (q.includes('alert') || q.includes('vms') || q.includes('publish') || q.includes('message')) {
    answer = 'PUBLIC ALERT DRAFT ready in Comm Drafts panel. VMS recommended text: "ACCIDENT AHEAD — GJ-27 NEAR PDEU — USE RING ROAD — EXPECT 45 MIN DELAY". Navigate to the Alerts panel to publish over VMS, social, and SMS channels.';
  } else if (q.includes('recommend') || q.includes('strategy') || q.includes('why') || q.includes('confidence')) {
    answer = 'RECOMMENDATION ASSESSMENT: Ring Road Diversion + Signal Cascade ranks highest at 93% confidence. Rationale: Ring Road has 45% spare capacity, fully bypasses the incident zone, and signal adjustment at Indroda Circle prevents spillback. Net impact: -2.1 km queue, -27 min delay.';
  } else {
    answer = 'QUERY PROCESSED: Incident INC-2026-PDEU-01 is active. 3/4 lanes blocked on Koba-Gandhinagar Hwy. Recommended action: Approve Ring Road Diversion and signal cascade. Publish public alert. Monitor clearance ETA.';
  }

  return { answer };
}

function buildMockAlerts(userPrompt: string) {
  // Extract clearance from prompt if available
  const match = userPrompt.match(/clearance[^0-9]*(\d+)/i);
  const clearance = match ? match[1] : '90';

  return {
    vms: `ACCIDENT AHEAD\nGJ-27 NEAR PDEU MAIN GATE\nUSE RING ROAD ALT ROUTE\nEXPECT ${clearance} MIN DELAY`,
    social: `[TRAFFIC ALERT] Multi-vehicle collision reported on Koba-Gandhinagar Highway near PDEU Main Gate, Sector-23, Gandhinagar.\n\nSTATUS: Incident under control. Emergency services on scene.\nACTION: Avoid area — use Sardar Patel Ring Road as alternate route.\nDELAY: Expect ${clearance}+ minutes on mainline approach.\n\nFollow @TrafficGujarat for live updates. #TrafficAlert #Gandhinagar`,
    sms: `PDEU/GJ TRAFFIC ALERT: Crash near PDEU Gate, Koba-Gandhinagar Hwy. Heavy delays (${clearance}+ min). Use Ring Road alternate. Avoid area until further notice.`,
  };
}

// ─── Factory ───────────────────────────────────────────────────────────────────

let _instance: LLMProvider | null = null;

/**
 * Returns the singleton LLM provider.
 * Call this inside server-only code (API routes, server actions).
 */
export function getLLMProvider(): LLMProvider {
  if (_instance) return _instance;

  const apiKey = env.gemini.apiKey;
  const model = env.gemini.model;

  if (apiKey) {
    console.info(`[LLM] Key loaded — provider=gemini model=${model}`);
    _instance = new GeminiProvider(apiKey);
  } else {
    // No key — safe mock fallback. Set GEMINI_API_KEY in .env.local to enable real AI.
    console.warn('[LLM] GEMINI_API_KEY not set — using mock LLM provider (no real AI).');
    _instance = new MockLLMProvider();
  }

  return _instance;
}

/**
 * Returns a fresh MockLLMProvider instance.
 * Use this as an in-request fallback when the real provider hits a quota error —
 * do NOT reset the singleton so that caching behaviour is preserved across requests.
 */
export function getMockProvider(): LLMProvider {
  return new MockLLMProvider();
}
