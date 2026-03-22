/**
 * LLM Client
 *
 * Wraps the active LLMProvider with timeout enforcement, one-retry logic,
 * and structured error surfacing. Callers (recommendations, chat, alerts)
 * never deal with the raw provider directly.
 *
 * Quota/rate-limit errors (429) are NOT retried — they are re-thrown as
 * LLMQuotaError so the caller can immediately fall back to the mock provider.
 */

import { getLLMProvider, getMockProvider, LLMQuotaError } from './provider';
import type { LLMRequest, LLMRawResponse } from '@/types/llm';

const TIMEOUT_MS = 20_000;  // 20-second hard limit per LLM call
const MAX_RETRIES = 1;

// Re-export so callers only need one import from this module.
export { LLMQuotaError, getMockProvider } from './provider';

/** Call the active LLM provider with one automatic retry on non-quota failures. */
export async function callLLM(request: LLMRequest): Promise<LLMRawResponse> {
  const provider = getLLMProvider();

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await withTimeout(provider.complete(request), TIMEOUT_MS);
      return result;
    } catch (err) {
      lastError = err;

      // Quota errors must NOT be retried — they will not resolve and each
      // retry burns more of the depleted quota. Re-throw immediately.
      if (err instanceof LLMQuotaError) {
        console.warn('[LLM client] Quota/rate-limit hit — skipping retry, caller should use mock fallback.');
        throw err;
      }

      if (attempt < MAX_RETRIES) {
        console.warn(`[LLM client] Attempt ${attempt + 1} failed, retrying…`, err);
        await sleep(500);
      }
    }
  }

  console.error('[LLM client] All attempts failed:', lastError);
  throw new LLMClientError('LLM call failed after retries.', lastError);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new LLMClientError(`LLM call timed out after ${ms}ms.`)),
      ms,
    );
    promise.then(
      val => { clearTimeout(timer); resolve(val); },
      err => { clearTimeout(timer); reject(err); },
    );
  });
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export class LLMClientError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'LLMClientError';
  }
}
