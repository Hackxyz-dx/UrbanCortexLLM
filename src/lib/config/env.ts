/**
 * Centralised environment variable access with safe fallbacks.
 * All API keys and external config must be read from here.
 */

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    // Warn loudly at startup rather than silently returning undefined later.
    console.warn(`[UrbanCortex] Missing env var: ${key}. Some features may be disabled.`);
    return '';
  }
  return value;
}

export const env = {
  here: {
    apiKey: requireEnv('HERE_API_KEY'),
    routingBaseUrl: requireEnv('HERE_ROUTING_URL', 'https://router.hereapi.com/v8'),
    trafficBaseUrl: requireEnv('HERE_TRAFFIC_URL', 'https://traffic.ls.hereapi.com/traffic/6.3'),
  },

  mapbox: {
    accessToken: requireEnv('NEXT_PUBLIC_MAPBOX_TOKEN'),
    baseUrl: requireEnv('MAPBOX_BASE_URL', 'https://api.mapbox.com'),
  },

  // Active provider: 'here' | 'mapbox' | 'mock'
  activeProvider: (process.env.MAP_PROVIDER ?? 'mock') as 'here' | 'mapbox' | 'mock',
} as const;
