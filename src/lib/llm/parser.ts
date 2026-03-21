/**
 * LLM Response Parser
 *
 * Extracts JSON from raw LLM text (handles markdown-fenced code blocks),
 * parses it, and validates the shape against the expected schema.
 * Throws LLMParseError on malformed or schema-invalid responses.
 */

import type { LLMRecommendationOutput, LLMAlertDrafts, LLMProviderName } from '@/types/llm';

export class LLMParseError extends Error {
  constructor(message: string, public readonly raw?: string) {
    super(message);
    this.name = 'LLMParseError';
  }
}

// ─── JSON extraction ───────────────────────────────────────────────────────────

/** Strip markdown fences and extract raw JSON string from LLM output. */
function extractJSON(text: string): string {
  // Try to strip ```json ... ``` or ``` ... ``` blocks
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  // Fallback: find first { and last } (handles extra prose before/after)
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
}

function safeParse(text: string): unknown {
  const json = extractJSON(text);
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new LLMParseError(`JSON parse failed: ${(e as Error).message}`, text);
  }
}

// ─── Recommendation output validator ──────────────────────────────────────────

export function parseRecommendationOutput(
  raw: string,
  provider: LLMProviderName,
): LLMRecommendationOutput {
  const obj = safeParse(raw) as Record<string, unknown>;

  if (!obj || typeof obj !== 'object') {
    throw new LLMParseError('Expected JSON object', raw);
  }

  const recommendations = Array.isArray(obj.recommendations)
    ? obj.recommendations
    : [];

  // Validate and sanitise each recommendation
  const validated = recommendations
    .filter((r): r is Record<string, unknown> => r !== null && typeof r === 'object')
    .map((r, idx) => {
      const id = typeof r.id === 'string' ? r.id : `llm-rec-${Date.now()}-${idx}`;
      const type = validateRecType(r.type);
      const title = typeof r.title === 'string' ? r.title.slice(0, 120) : 'Recommendation';
      const description = typeof r.description === 'string' ? r.description : '';
      const reasoning = typeof r.reasoning === 'string' ? r.reasoning : '';
      const expectedImpact = typeof r.expectedImpact === 'string' ? r.expectedImpact : '';
      const confidence = clampConfidence(r.confidence);
      const diversionRouteName = typeof r.diversionRouteName === 'string' ? r.diversionRouteName : undefined;
      const alertText = typeof r.alertText === 'string' ? r.alertText : undefined;

      return {
        id,
        type,
        title,
        description,
        reasoning,
        expectedImpact,
        confidence,
        status: 'suggested' as const,
        generatedAt: typeof r.generatedAt === 'string' ? r.generatedAt : new Date().toISOString(),
        ...(diversionRouteName ? { diversionRouteName } : {}),
        ...(alertText ? { alertText } : {}),
      };
    });

  const explanation = typeof obj.explanation === 'string'
    ? obj.explanation
    : 'LLM assessment unavailable.';

  const confidence = clampConfidence(obj.confidence ?? 0.7);
  const cautionNote = typeof obj.cautionNote === 'string' ? obj.cautionNote : undefined;

  return {
    recommendations: validated,
    explanation,
    confidence,
    ...(cautionNote ? { cautionNote } : {}),
    source: provider,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Chat output validator ─────────────────────────────────────────────────────

export function parseChatOutput(raw: string): string {
  try {
    const obj = safeParse(raw) as Record<string, unknown>;
    if (typeof obj?.answer === 'string') return obj.answer.trim();
  } catch {
    // If parsing fails, treat the raw text as the answer (Gemini sometimes returns plain text)
  }
  // Strip any JSON artefacts and return cleaned text
  return raw.replace(/^```[a-z]*\n?/, '').replace(/```$/, '').trim();
}

// ─── Alert drafts validator ────────────────────────────────────────────────────

export function parseAlertOutput(raw: string, provider: LLMProviderName): LLMAlertDrafts {
  const obj = safeParse(raw) as Record<string, unknown>;

  const vms = typeof obj?.vms === 'string' ? obj.vms : 'TRAFFIC ALERT\nSEE LOCAL SIGNAGE\nUSE ALTERNATE ROUTES\nFOLLOW AUTHORITY GUIDANCE';
  const social = typeof obj?.social === 'string' ? obj.social : '[TRAFFIC ALERT] Incident reported. Use alternate routes. Follow local authorities.';
  const sms = typeof obj?.sms === 'string' ? obj.sms.slice(0, 160) : 'TRAFFIC ALERT: Incident reported. Use alternate routes.';

  return {
    vms,
    social,
    sms,
    source: provider,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const VALID_REC_TYPES = new Set([
  'signal-timing', 'diversion', 'lane-management', 'emergency-corridor', 'public-alert',
]);

function validateRecType(val: unknown): import('@/types/llm').LLMRecommendationType {
  if (typeof val === 'string' && VALID_REC_TYPES.has(val)) {
    return val as import('@/types/llm').LLMRecommendationType;
  }
  return 'signal-timing';
}

function clampConfidence(val: unknown): number {
  const n = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(n)) return 0.7;
  return parseFloat(Math.min(1, Math.max(0, n)).toFixed(2));
}
