import { create } from 'zustand';
import { IncidentState, initialMockIncident, ActionStatus } from '../data/mockIncident';

interface SimulationStore {
  incident: IncidentState;
  updateStrategyStatus: (id: string, status: ActionStatus) => void;
  updateRecommendationStatus: (id: string, status: ActionStatus) => void;
  addTimelineEvent: (eventText: string) => void;
  advanceSimulation: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  incident: initialMockIncident,
  
  updateStrategyStatus: (id, status) => set((state) => {
    const strat = state.incident.strategies.find(s => s.id === id);
    const timelineUpdates = [...state.incident.timeline];
    
    if (strat && status === 'approved') {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timelineUpdates.push({ time, event: `Operator approved Strategy: ${strat.name}` });
      // Implicitly reject other strategies
    }
    
    return {
      incident: {
        ...state.incident,
        timeline: timelineUpdates,
        strategies: state.incident.strategies.map(s => {
          if (s.id === id) return { ...s, status };
          if (status === 'approved') return { ...s, status: 'rejected' }; // Exclusivity
          return s;
        })
      }
    };
  }),

  updateRecommendationStatus: (id, status) => set((state) => {
    // Find the recommendation to get its title for the timeline
    const rec = state.incident.recommendations.find(r => r.id === id);
    const timelineUpdates = [...state.incident.timeline];
    
    if (rec && status === 'approved') {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timelineUpdates.push({ time, event: `Operator approved Action: ${rec.title}` });
    }
    
    return {
      incident: {
        ...state.incident,
        timeline: timelineUpdates,
        recommendations: state.incident.recommendations.map(r => 
          r.id === id ? { ...r, status } : r
        )
      }
    };
  }),

  addTimelineEvent: (eventText) => set((state) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      incident: {
        ...state.incident,
        timeline: [...state.incident.timeline, { time, event: eventText }]
      }
    };
  }),

  advanceSimulation: () => set((state) => {
    // Dummy tick logic to simulate live updates
    const isDiversionActive = state.incident.strategies.find(s => s.id === 'strat-1')?.status === 'approved';
    const queueReduction = isDiversionActive ? 15 : 0;
    
    return {
      incident: {
        ...state.incident,
        estimatedClearance: Math.max(0, state.incident.estimatedClearance - 5 - queueReduction)
      }
    };
  })
}));
