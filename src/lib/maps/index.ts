/**
 * Main entry point for the map service layer.
 * Reads MAP_PROVIDER env var and returns the correct provider instance.
 * All application code should import from here — never from individual provider files.
 */

import type { MapProvider } from './provider';
import { env } from '@/lib/config/env';

// Lazy-initialise providers to avoid loading unused code.
let _provider: MapProvider | null = null;

export function getMapProvider(): MapProvider {
  if (_provider) return _provider;

  switch (env.activeProvider) {
    case 'here': {
      // Dynamically import so HERE SDK doesn't bloat the Mapbox path.
      const { HereProvider } = require('./here') as { HereProvider: new () => MapProvider };
      _provider = new HereProvider();
      break;
    }
    case 'mapbox': {
      const { MapboxProvider } = require('./mapbox') as { MapboxProvider: new () => MapProvider };
      _provider = new MapboxProvider();
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
