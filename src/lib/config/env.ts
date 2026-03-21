/**
 * Centralised environment variable access with safe fallbacks.
 * All API keys and external config must be read from here.
 *
 * Free/open stack:
 *   - MAP_PROVIDER: 'ors' | 'mock' (default: 'mock')
 *   - OPENROUTESERVICE_API_KEY: free key from openrouteservice.org
 *   - GRAPHHOPPER_API_KEY: free-tier key from graphhopper.com (optional)
 *
 * Legacy paid providers (HERE, Mapbox) are no longer used.
 */

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  // ── openrouteservice (preferred free routing provider) ─────────────────────
  // Free tier: 2000 req/day. Get key at: https://openrouteservice.org/dev/#/signup
  ors: {
    apiKey: optionalEnv('OPENROUTESERVICE_API_KEY'),
    baseUrl: optionalEnv('ORS_BASE_URL', 'https://api.openrouteservice.org'),
  },

  // ── GraphHopper (optional free-tier routing provider) ──────────────────────
  // Free tier: 500 req/day. Get key at: https://www.graphhopper.com/
  graphhopper: {
    apiKey: optionalEnv('GRAPHHOPPER_API_KEY'),
    baseUrl: optionalEnv('GRAPHHOPPER_BASE_URL', 'https://graphhopper.com/api/1'),
  },

  // ── Active routing provider: 'ors' | 'graphhopper' | 'mock' ───────────────
  // Resolved automatically if key is present; can be forced via MAP_PROVIDER.
  get activeProvider(): 'ors' | 'graphhopper' | 'mock' {
    const override = process.env.MAP_PROVIDER as string | undefined;
    if (override === 'ors' || override === 'graphhopper' || override === 'mock') {
      return override;
    }
    if (this.ors.apiKey) return 'ors';
    if (this.graphhopper.apiKey) return 'graphhopper';
    return 'mock';
  },

  // ── Gemini LLM ─────────────────────────────────────────────────────────────
  gemini: {
    apiKey: optionalEnv('GEMINI_API_KEY'),
    model: optionalEnv('LLM_MODEL', 'gemini-2.0-flash'),
  },
} as const;
