import { create } from 'zustand';
import { IncidentState, initialMockIncident, ActionStatus, TimelineEvent } from '../data/mockIncident';
import type { LLMRecommendation, LLMRecommendationOutput, LLMAlertDrafts, LLMRecommendationStatus } from '@/types/llm';

// ─────────────────────────────────────────────
// Chat types
// ─────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
  isLoading?: boolean;
  source?: 'llm' | 'mock-engine';
}

// ─────────────────────────────────────────────
// Store shape
// ─────────────────────────────────────────────
interface SimulationStore {
  incident: IncidentState;
  chatMessages: ChatMessage[];
  isSimRunning: boolean;

  // LLM recommendation state
  llmRecommendations: LLMRecommendation[];
  llmRecsLoading: boolean;
  llmRecsError: string | null;
  llmExplanation: string | null;
  llmConfidence: number | null;
  llmCautionNote: string | null;

  // Alert drafts from LLM
  alertDrafts: { vms: string; social: string; sms: string; source: string } | null;
  alertDraftsLoading: boolean;
  alertDraftsError: string | null;

  // --- Strategy & Recommendation Actions (pre-existing mock flow) ---
  updateStrategyStatus: (id: string, status: ActionStatus) => void;

  // --- LLM Recommendation Lifecycle ---
  approveRecommendation: (id: string) => void;
  rejectRecommendation: (id: string) => void;
  markRecommendationActive: (id: string) => void;
  completeRecommendation: (id: string) => void;

  // --- Fetch LLM Outputs ---
  fetchLLMRecommendations: () => Promise<void>;
  fetchAlertDrafts: () => Promise<void>;

  // --- Chat Actions ---
  sendChatMessage: (text: string) => void;

  // --- Alert Actions ---
  publishAlert: (channel: 'vms' | 'social' | 'sms') => void;

  // --- Simulation ---
  startSimulation: () => void;
  stopSimulation: () => void;
  simulateTick: () => void;

  // --- Internal Utility ---
  _addTimelineEvent: (type: TimelineEvent['type'], message: string) => void;
  _setRecommendationStatus: (id: string, status: LLMRecommendationStatus) => void;
}

// ─────────────────────────────────────────────
// Simulation interval reference (module-level)
// ─────────────────────────────────────────────
let simInterval: ReturnType<typeof setInterval> | null = null;

const ts = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// ─────────────────────────────────────────────
// Zustand Store
// ─────────────────────────────────────────────
export const useSimulationStore = create<SimulationStore>((set, get) => ({
  incident: initialMockIncident,
  chatMessages: [
    {
      id: 'sys-0',
      sender: 'system',
      text: 'UrbanCortex Tactical Query Console initialized. Monitoring INC-2026-PDEU-01 — Koba-Gandhinagar Highway, near PDEU Main Gate. LLM co-pilot is active.',
      timestamp: ts()
    }
  ],
  isSimRunning: false,

  // LLM state
  llmRecommendations: [],
  llmRecsLoading: false,
  llmRecsError: null,
  llmExplanation: null,
  llmConfidence: null,
  llmCautionNote: null,

  // Alert drafts
  alertDrafts: null,
  alertDraftsLoading: false,
  alertDraftsError: null,

  // ── Utility ──────────────────────────────────
  _addTimelineEvent: (type, message) => set(state => ({
    incident: {
      ...state.incident,
      timeline: [
        ...state.incident.timeline,
        { id: `evt-${Date.now()}`, timestamp: ts(), type, message }
      ]
    }
  })),

  _setRecommendationStatus: (id, status) => set(state => ({
    llmRecommendations: state.llmRecommendations.map(r =>
      r.id === id ? { ...r, status } : r
    )
  })),

  // ── Strategy Approval (pre-existing mock strategies) ─────────────────────
  updateStrategyStatus: (id, status) => {
    set(state => ({
      incident: {
        ...state.incident,
        strategies: state.incident.strategies.map(s => {
          if (s.id === id) return { ...s, status };
          if (status === 'approved') return { ...s, status: s.id !== id ? 'rejected' : s.status };
          return s;
        })
      }
    }));
    const strat = get().incident.strategies.find(s => s.id === id);
    const name = strat?.name || id;
    if (status === 'approved') {
      get()._addTimelineEvent('approval', `Strategy "${name}" approved and executed by operator.`);
    } else if (status === 'rejected') {
      get()._addTimelineEvent('recommendation', `Strategy "${name}" held/rejected by operator.`);
    }
  },

  // ── LLM Recommendation Lifecycle ─────────────────────────────────────────

  approveRecommendation: (id) => {
    get()._setRecommendationStatus(id, 'approved');
    const rec = get().llmRecommendations.find(r => r.id === id);
    if (rec) {
      set(state => ({
        llmRecommendations: state.llmRecommendations.map(r =>
          r.id === id ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r
        )
      }));
      get()._addTimelineEvent('approval', `LLM recommendation approved: "${rec.title}".`);

      // If it's a diversion, flag it on the incident (map overlay)
      if (rec.type === 'diversion') {
        const divName = rec.diversionRouteName;
        if (divName) {
          set(state => ({
            incident: {
              ...state.incident,
              routes: state.incident.routes.map(r =>
                r.name === divName ? { ...r, congestionLevel: 'moderate' as const } : r
              )
            }
          }));
        }
      }
      // If it's a public-alert, generate alert drafts
      if (rec.type === 'public-alert') {
        get().fetchAlertDrafts();
      }
    }
  },

  rejectRecommendation: (id) => {
    get()._setRecommendationStatus(id, 'rejected');
    const rec = get().llmRecommendations.find(r => r.id === id);
    if (rec) {
      get()._addTimelineEvent('recommendation', `LLM recommendation rejected: "${rec.title}".`);
    }
  },

  markRecommendationActive: (id) => {
    get()._setRecommendationStatus(id, 'active');
    const rec = get().llmRecommendations.find(r => r.id === id);
    if (rec) {
      get()._addTimelineEvent('approval', `LLM recommendation marked active: "${rec.title}".`);
    }
  },

  completeRecommendation: (id) => {
    get()._setRecommendationStatus(id, 'completed');
    const rec = get().llmRecommendations.find(r => r.id === id);
    if (rec) {
      get()._addTimelineEvent('approval', `LLM recommendation completed: "${rec.title}".`);
    }
  },

  // ── Fetch LLM Recommendations ─────────────────────────────────────────────
  fetchLLMRecommendations: async () => {
    const { incident, llmRecommendations } = get();
    set({ llmRecsLoading: true, llmRecsError: null });
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident, llmRecommendations }),
      });
      const data = await res.json() as { success: boolean; output?: LLMRecommendationOutput; error?: string };
      if (data.success && data.output) {
        set({
          llmRecommendations: data.output.recommendations,
          llmExplanation: data.output.explanation,
          llmConfidence: data.output.confidence,
          llmCautionNote: data.output.cautionNote ?? null,
          llmRecsLoading: false,
          llmRecsError: null,
        });
        get()._addTimelineEvent(
          'recommendation',
          `LLM generated ${data.output.recommendations.length} recommendation(s). Provider: ${data.output.source}.`,
        );
      } else {
        set({ llmRecsLoading: false, llmRecsError: data.error ?? 'Recommendation fetch failed.' });
      }
    } catch (err) {
      console.error('[store] fetchLLMRecommendations error:', err);
      set({ llmRecsLoading: false, llmRecsError: 'Network error fetching recommendations.' });
    }
  },

  // ── Fetch Alert Drafts ────────────────────────────────────────────────────
  fetchAlertDrafts: async () => {
    const { incident, llmRecommendations } = get();
    set({ alertDraftsLoading: true, alertDraftsError: null });
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident, llmRecommendations }),
      });
      const data = await res.json() as { success: boolean; drafts?: LLMAlertDrafts; error?: string };
      if (data.success && data.drafts) {
        set({
          alertDrafts: {
            vms: data.drafts.vms,
            social: data.drafts.social,
            sms: data.drafts.sms,
            source: data.drafts.source,
          },
          alertDraftsLoading: false,
          alertDraftsError: null,
        });
        get()._addTimelineEvent('alert', `LLM generated alert drafts. Provider: ${data.drafts.source}.`);
      } else {
        set({ alertDraftsLoading: false, alertDraftsError: data.error ?? 'Alert draft fetch failed.' });
      }
    } catch (err) {
      console.error('[store] fetchAlertDrafts error:', err);
      set({ alertDraftsLoading: false, alertDraftsError: 'Network error fetching alert drafts.' });
    }
  },

  // ── Chat Engine ──────────────────────────────────────────────────────────
  sendChatMessage: (text) => {
    const msgId = `msg-${Date.now()}`;
    const loadingId = `sys-${Date.now()}`;
    const { incident, llmRecommendations } = get();

    // Push user message + loading bubble
    set(state => ({
      chatMessages: [
        ...state.chatMessages,
        { id: msgId, sender: 'user', text, timestamp: ts() },
        { id: loadingId, sender: 'system', text: '...', timestamp: ts(), isLoading: true }
      ]
    }));

    get()._addTimelineEvent('chat', `Operator query: "${text.substring(0, 60)}"`);

    // Build short recent history (last 6 exchange pairs)
    const recentMessages = get().chatMessages.slice(-12).map(m => ({
      role: m.sender as 'user' | 'system',
      text: m.text,
    }));

    // Call backend /api/chat with full incident context + LLM recommendations
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: text,
        incident,
        llmRecommendations,
        recentMessages,
      }),
    })
      .then(res => res.json())
      .then((data: { success: boolean; answer?: string; source?: string; error?: string }) => {
        const answer = data.success && data.answer
          ? data.answer
          : (data.error ?? 'LLM co-pilot unavailable. Please retry.');

        set(state => ({
          chatMessages: state.chatMessages.map(m =>
            m.id === loadingId
              ? { ...m, text: answer, isLoading: false, timestamp: ts(), source: (data.source as 'llm' | 'mock-engine') ?? 'mock-engine' }
              : m
          )
        }));
      })
      .catch(() => {
        // Network failure fallback
        const fallback = buildOfflineChatFallback(text, incident);
        set(state => ({
          chatMessages: state.chatMessages.map(m =>
            m.id === loadingId ? { ...m, text: fallback, isLoading: false, timestamp: ts() } : m
          )
        }));
      });
  },

  // ── Alert Publishing ─────────────────────────────────────────────────────
  publishAlert: (channel) => {
    set(state => ({
      incident: {
        ...state.incident,
        alerts: {
          ...state.incident.alerts,
          [`${channel}Published`]: true
        }
      }
    }));
    const labels: Record<string, string> = { vms: 'VMS Board', social: 'Social Media', sms: 'SMS/Civic Advisory' };
    get()._addTimelineEvent('alert', `Public alert published via ${labels[channel] || channel}.`);
  },

  // ── Simulation Engine ────────────────────────────────────────────────────
  simulateTick: () => {
    set(state => {
      const elapsed = state.incident.simulationElapsed + 30;
      const hasActiveStrat = state.incident.strategies.some(s => s.status === 'approved');
      const hasActiveLLMRec = state.llmRecommendations.some(r => r.status === 'active' || r.status === 'approved');

      const reduction = (hasActiveStrat || hasActiveLLMRec) ? 1 : 0;
      const newClearance = Math.max(0, state.incident.estimatedClearance - reduction);
      const newStatus = newClearance === 0 ? 'cleared' : (newClearance < 20 ? 'resolving' : 'active');

      return {
        incident: {
          ...state.incident,
          simulationElapsed: elapsed,
          estimatedClearance: newClearance,
          status: newStatus
        }
      };
    });

    const elapsed = get().incident.simulationElapsed;
    if (elapsed % 120 === 0 && elapsed > 0) {
      const clearance = get().incident.estimatedClearance;
      get()._addTimelineEvent('simulation', `Simulation tick: T+${elapsed / 60} min. Est. clearance: ${clearance} min.`);
    }
  },

  startSimulation: () => {
    if (simInterval) return;
    simInterval = setInterval(() => {
      get().simulateTick();
    }, 5000);
    set({ isSimRunning: true });
    get()._addTimelineEvent('simulation', 'Live simulation started.');
  },

  stopSimulation: () => {
    if (simInterval) { clearInterval(simInterval); simInterval = null; }
    set({ isSimRunning: false });
    get()._addTimelineEvent('simulation', 'Live simulation paused by operator.');
  }
}));

// ─────────────────────────────────────────────
// Offline chat fallback (network unavailable)
// ─────────────────────────────────────────────
function buildOfflineChatFallback(text: string, incident: IncidentState): string {
  const q = text.toLowerCase();
  if (q.includes('lane') || q.includes('safe') || q.includes('open')) {
    return `SAFETY ADVISORY: Emergency services active on ${incident.location.desc}. ${incident.blockedLanes}/${incident.totalLanes} lanes blocked. Lane re-opening not permitted until on-scene clearance. [Offline mode — LLM unavailable]`;
  }
  if (q.includes('diversion') || q.includes('route')) {
    return `DIVERSION ADVISORY: Use Sardar Patel Ring Road diversion. Approve LLM Recommendation #1 in the Decision Support panel. [Offline mode — LLM unavailable]`;
  }
  return `QUERY PROCESSED (offline): ${incident.title}. Status: ${incident.status.toUpperCase()}. Clearance ETA: ${incident.estimatedClearance} min. [LLM co-pilot unavailable — check network]`;
}
