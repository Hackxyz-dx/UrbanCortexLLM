/**
 * useRecommendations — fetches live recommendation data from /api/recommendations.
 * Derives the incident coordinate from the Zustand simulation store.
 * Re-fetches when the incident location changes.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSimulationStore } from '@/lib/store';
import type { RecommendationSet } from '@/lib/recommendations/service';

export interface RecommendationContextMeta {
  incidentId: string;
  road: string;
  severity: string;
  clearance: number;
  routeCount: number;
  locationSource: string;
}

export interface UseRecommendationsResult {
  isLoading: boolean;
  error: string | null;
  recommendation: RecommendationSet | null;
  meta: RecommendationContextMeta | null;
  refresh: () => void;
}

export function useRecommendations(): UseRecommendationsResult {
  const incidentLocation = useSimulationStore(s => s.incident.location);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationSet | null>(null);
  const [meta, setMeta] = useState<RecommendationContextMeta | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { lat, lng } = incidentLocation;
      const res = await fetch(`/api/recommendations?incidentLat=${lat}&incidentLng=${lng}`);
      const data = await res.json();
      if (data.success) {
        setRecommendation(data.recommendation);
        setMeta(data.context ?? null);
      } else {
        setError(data.error ?? 'Unknown error from recommendations API.');
      }
    } catch (err) {
      setError('Failed to fetch recommendations. Check server connection.');
      console.error('[useRecommendations]', err);
    } finally {
      setIsLoading(false);
    }
  }, [incidentLocation.lat, incidentLocation.lng]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { isLoading, error, recommendation, meta, refresh: fetchData };
}
