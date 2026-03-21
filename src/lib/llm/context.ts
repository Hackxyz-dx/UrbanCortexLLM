/**
 * Traffic Context Formatter
 *
 * Converts the live IncidentState (from Zustand store / API body) into a
 * structured, LLM-ready context object. This is the single source of truth
 * for what the LLM "knows" about the current traffic situation.
 */

import type { IncidentState, TimelineEvent, ResponseStrategy, Recommendation } from '@/data/mockIncident';
import type { LLMRecommendation } from '@/types/llm';

export interface TrafficLLMContext {
  incidentId: string;
  title: string;
  status: string;
  severity: string;
  location: string;
  vehiclesInvolved: number;
  blockedLanes: number;
  totalLanes: number;
  estimatedClearanceMin: number;
  simulationElapsedSec: number;

  routes: {
    id: string;
    name: string;
    type: string;
    congestion: string;
  }[];

  approvedStrategies: {
    name: string;
    actions: { title: string; type: string }[];
  }[];

  pendingStrategies: {
    name: string;
    rank: number;
    confidence: number;
    actions: { title: string; description: string; type: string }[];
  }[];

  llmRecommendations: {
    id: string;
    type: string;
    title: string;
    status: string;
    confidence: number;
  }[];

  recentTimeline: {
    timestamp: string;
    type: string;
    message: string;
  }[];

  alertState: {
    vmsPublished: boolean;
    socialPublished: boolean;
    smsPublished: boolean;
  };
}

/**
 * Formats the IncidentState into a clean context object for LLM prompts.
 * Only the last 10 timeline events are included to keep token count reasonable.
 */
export function buildTrafficContext(
  incident: IncidentState,
  llmRecommendations: LLMRecommendation[] = [],
): TrafficLLMContext {
  const approvedStrategies = incident.strategies
    .filter(s => s.status === 'approved')
    .map(s => ({
      name: s.name,
      actions: s.actions.map(a => ({ title: a.title, type: a.type })),
    }));

  const pendingStrategies = incident.strategies
    .filter(s => s.status === 'pending')
    .map(s => ({
      name: s.name,
      rank: s.rank,
      confidence: s.overallConfidence,
      actions: s.actions.map(a => ({
        title: a.title,
        description: a.description,
        type: a.type,
      })),
    }));

  const recentTimeline = incident.timeline
    .slice(-10)
    .map(e => ({ timestamp: e.timestamp, type: e.type, message: e.message }));

  const routes = incident.routes.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    congestion: r.congestionLevel,
  }));

  const llmRecs = llmRecommendations.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    status: r.status,
    confidence: r.confidence,
  }));

  return {
    incidentId: incident.id,
    title: incident.title,
    status: incident.status,
    severity: incident.severity,
    location: incident.location.desc,
    vehiclesInvolved: incident.vehiclesInvolved,
    blockedLanes: incident.blockedLanes,
    totalLanes: incident.totalLanes,
    estimatedClearanceMin: incident.estimatedClearance,
    simulationElapsedSec: incident.simulationElapsed,
    routes,
    approvedStrategies,
    pendingStrategies,
    llmRecommendations: llmRecs,
    recentTimeline,
    alertState: {
      vmsPublished: incident.alerts.vmsPublished,
      socialPublished: incident.alerts.socialPublished,
      smsPublished: incident.alerts.smsPublished,
    },
  };
}

/** Serialize the context to a compact JSON string for embedding in prompts. */
export function serializeContext(ctx: TrafficLLMContext): string {
  return JSON.stringify(ctx, null, 2);
}
