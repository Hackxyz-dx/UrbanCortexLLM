/**
 * Main entry point for the map service layer.
 *
 * Reads MAP_PROVIDER env var (or auto-detects from API keys) and returns
 * the correct routing provider instance.
 *
 * Provider priority:
 *   1. ORS (openrouteservice.org) — free, 2000 req/day
 *   2. GraphHopper               — free, 500 req/day
 *   3. Mock                      — deterministic, no key needed
 *
 * All app code should import from here — never from individual provider files.
 */

import type { MapProvider } from './provider';
import { env } from '@/lib/config/env';

let _provider: MapProvider | null = null;

export function getMapProvider(): MapProvider {
  if (_provider) return _provider;

  switch (env.activeProvider) {
    case 'ors': {
      const { OrsProvider } = require('./ors') as { OrsProvider: new () => MapProvider };
      _provider = new OrsProvider();
      break;
    }
    case 'graphhopper': {
      const { GraphHopperProvider } = require('./graphhopper') as { GraphHopperProvider: new () => MapProvider };
      _provider = new GraphHopperProvider();
      break;
    }
    case 'mock':
    default: {
      const { MockProvider } = require('./mock') as { MockProvider: new () => MapProvider };
      _provider = new MockProvider();
      break;
    }
  }

  console.info(`[UrbanCortex] Map provider initialised: ${_provider!.name}`);
  return _provider!;
}

// Re-export types so callers don't need to import from multiple places.
export type { MapProvider } from './provider';
export type { BoundingBox } from './provider';
export { buildBounds } from './provider';
