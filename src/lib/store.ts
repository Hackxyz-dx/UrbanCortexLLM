import { create } from 'zustand';
import { IncidentState, initialMockIncident, ActionStatus, TimelineEvent } from '../data/mockIncident';

// ─────────────────────────────────────────────
// Chat types
// ─────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  timestamp: string;
  isLoading?: boolean;
}

// ─────────────────────────────────────────────
// Store shape
// ─────────────────────────────────────────────
interface SimulationStore {
  incident: IncidentState;
  chatMessages: ChatMessage[];
  isSimRunning: boolean;

  // --- Strategy & Recommendation Actions ---
  updateStrategyStatus: (id: string, status: ActionStatus) => void;
  updateRecommendationStatus: (id: string, status: ActionStatus) => void;

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
}

// ─────────────────────────────────────────────
// Helper: build a contextual mock-LLM response
// ─────────────────────────────────────────────
function buildChatResponse(text: string, incident: IncidentState): string {
  const q = text.toLowerCase();
  const activeStrat = incident.strategies.find(s => s.status === 'approved');
  const clearMins = incident.estimatedClearance;

  if (q.includes('safe') || q.includes('open') || q.includes('lane')) {
    return `SAFETY ADVISORY: Emergency services are actively operating on Koba-Gandhinagar Hwy near PDEU Gate. Lane re-opening is not permitted. Estimated safe window: ${Math.max(clearMins - 20, 10)} minutes.`;
  }
  if (q.includes('diversion') || q.includes('first') || q.includes('route')) {
    if (activeStrat) {
      return `Diversion "${activeStrat.name}" is currently ACTIVE. Sardar Patel Ring Road is handling ~700 vph of re-routed traffic. No new diversion required.`;
    }
    return `Recommended: Activate "Sardar Patel Ring Road Diversion" (Rank #1, 93% confidence). It provides 45% spare capacity and bypasses the mainline queue. Approve Strategy #1 to execute.`;
  }
  if (q.includes('10 minutes') || q.includes('delay') || q.includes('queue') || q.includes('clearance')) {
    return `Current queue is estimated at 2.3 km on Koba-Gandhinagar Hwy. Without intervention, delayed clearance by 25+ min is projected. With active Ring Road diversion, queue should stabilize within ${clearMins} minutes.`;
  }
  if (q.includes('message') || q.includes('alert') || q.includes('publish') || q.includes('vms')) {
    return `Draft VMS message ready in the Comm Drafts panel. Recommended broadcast: "ACCIDENT AHEAD — GJ-27 NEAR PDEU — USE RING ROAD — EXPECT ${clearMins} MIN DELAY". Navigate to the right panel to publish.`;
  }
  if (q.includes('status') || q.includes('update') || q.includes('what changed') || q.includes('last')) {
    const lastEvents = incident.timeline.slice(-3).reverse().map(e => `  [${e.timestamp}] ${e.message}`).join('\n');
    return `Recent operational log:\n${lastEvents}`;
  }
  if (q.includes('recommend') || q.includes('strategy') || q.includes('why')) {
    return `Strategy #1 "Ring Road Diversion + Signal Cascade" is ranked highest (93% confidence). It provides the best queue reduction (-2.1 km) and reduced secondary crash risk (-38%). Reason: Ring Road capacity is currently adequate to handle diverted volume.`;
  }
  return `Query processed. Current incident: ${incident.title}. Status: ${incident.status.toUpperCase()}. ETA clearance: ${clearMins} min. ${incident.strategies.filter(s => s.status === 'approved').length} strategies active.`;
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
      text: 'UrbanCortex Tactical Query Console initialized. Monitoring INC-2026-PDEU-01 — Koba-Gandhinagar Highway, near PDEU Main Gate.',
      timestamp: ts()
    }
  ],
  isSimRunning: false,

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

  // ── Strategy Approval ────────────────────────
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

  // ── Recommendation Status ────────────────────
  updateRecommendationStatus: (id, status) => set(state => ({
    incident: {
      ...state.incident,
      recommendations: state.incident.recommendations.map(r =>
        r.id === id ? { ...r, status } : r
      )
    }
  })),

  // ── Chat Engine ──────────────────────────────
  sendChatMessage: (text) => {
    const msgId = `msg-${Date.now()}`;
    const loadingId = `sys-${Date.now()}`;
    const { incident } = get();

    // Push user message + loading bubble
    set(state => ({
      chatMessages: [
        ...state.chatMessages,
        { id: msgId, sender: 'user', text, timestamp: ts() },
        { id: loadingId, sender: 'system', text: '...', timestamp: ts(), isLoading: true }
      ]
    }));

    get()._addTimelineEvent('chat', `Operator query: "${text.substring(0, 60)}"`);

    // Build short recent history for context (last 4 exchange pairs)
    const recentMessages = get().chatMessages.slice(-8).map(m => ({
      role: m.sender as 'user' | 'system',
      text: m.text,
    }));

    // Call backend /api/chat with full incident context
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: text,
        incidentLat: incident.location.lat,
        incidentLng: incident.location.lng,
        incidentRoad: incident.location.desc ?? '',
        recentMessages,
      }),
    })
      .then(res => res.json())
      .then((data: { success: boolean; answer?: string; error?: string }) => {
        const answer = data.success && data.answer
          ? data.answer
          : (data.error ?? buildChatResponse(text, get().incident)); // offline fallback

        set(state => ({
          chatMessages: state.chatMessages.map(m =>
            m.id === loadingId ? { ...m, text: answer, isLoading: false, timestamp: ts() } : m
          )
        }));
      })
      .catch(() => {
        // Network down — use local fallback so UI is never stuck
        const fallback = buildChatResponse(text, get().incident);
        set(state => ({
          chatMessages: state.chatMessages.map(m =>
            m.id === loadingId ? { ...m, text: fallback, isLoading: false, timestamp: ts() } : m
          )
        }));
      });
  },

  // ── Alert Publishing ─────────────────────────
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

  // ── Simulation Engine ────────────────────────
  simulateTick: () => {
    set(state => {
      const elapsed = state.incident.simulationElapsed + 30;
      const hasActiveStrat = state.incident.strategies.some(s => s.status === 'approved');

      // Deterministic reduction: faster clearance if strategy is active
      const reduction = hasActiveStrat ? 1 : 0;
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

    // Every 2 minutes of sim time, log a simulation event
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
    }, 5000); // Every 5 real seconds = 30 sim seconds
    set({ isSimRunning: true });
    get()._addTimelineEvent('simulation', 'Live simulation started.');
  },

  stopSimulation: () => {
    if (simInterval) { clearInterval(simInterval); simInterval = null; }
    set({ isSimRunning: false });
    get()._addTimelineEvent('simulation', 'Live simulation paused by operator.');
  }
}));
