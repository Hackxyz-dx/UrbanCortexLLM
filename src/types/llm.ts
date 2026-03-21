/**
 * LLM domain types for UrbanCortexLLM.
 * All LLM outputs are strongly typed here so the service layer and UI
 * never deal with raw, unparsed strings.
 */

// ─── Provider abstraction ─────────────────────────────────────────────────────

export type LLMProviderName = 'gemini' | 'mock';

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  /** Maximum tokens for completion */
  maxOutputTokens?: number;
}

export interface LLMRawResponse {
  text: string;
  provider: LLMProviderName;
  durationMs: number;
}

// ─── Recommendation output ────────────────────────────────────────────────────

export type LLMRecommendationType =
  | 'signal-timing'
  | 'diversion'
  | 'lane-management'
  | 'emergency-corridor'
  | 'public-alert';

/** Status lifecycle for a single LLM recommendation */
export type LLMRecommendationStatus =
  | 'suggested'
  | 'approved'
  | 'active'
  | 'rejected'
  | 'completed';

/** A single actionable recommendation item from the LLM */
export interface LLMRecommendation {
  id: string;
  type: LLMRecommendationType;
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: string;
  confidence: number;          // 0–1
  status: LLMRecommendationStatus;
  generatedAt: string;         // ISO 8601
  approvedAt?: string;
  /** If type === 'diversion', the route name the LLM suggests activating */
  diversionRouteName?: string;
  /** If type === 'public-alert', a publishable alert text */
  alertText?: string;
}

/** Full structured output from the recommendations LLM call */
export interface LLMRecommendationOutput {
  recommendations: LLMRecommendation[];
  explanation: string;           // operator-facing overall assessment
  confidence: number;            // aggregate confidence 0–1
  cautionNote?: string;          // optional safety caveat
  source: LLMProviderName;
  generatedAt: string;
}

// ─── Chat output ──────────────────────────────────────────────────────────────

export interface LLMChatOutput {
  answer: string;
  source: LLMProviderName;
  timestamp: string;
}

// ─── Alert output ─────────────────────────────────────────────────────────────

export interface LLMAlertDrafts {
  vms: string;      // 4-line VMS board text (ALL CAPS)
  social: string;   // social media post
  sms: string;      // short SMS advisory
  source: LLMProviderName;
  generatedAt: string;
}
