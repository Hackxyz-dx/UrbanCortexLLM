import { create } from 'zustand';
import { IncidentState, initialMockIncident, ActionStatus } from '../data/mockIncident';

interface SimulationStore {
  incident: IncidentState;
  updateRecommendationStatus: (id: string, status: ActionStatus) => void;
  addTimelineEvent: (eventText: string) => void;
  advanceSimulation: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  incident: initialMockIncident,
  
  updateRecommendationStatus: (id, status) => set((state) => {
    // Find the recommendation to get its title for the timeline
    const rec = state.incident.recommendations.find(r => r.id === id);
    const timelineUpdates = [...state.incident.timeline];
    
    if (rec && status === 'approved') {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timelineUpdates.push({ time, event: `Operator approved: ${rec.title}` });
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
    const isDiversionActive = state.incident.recommendations.find(r => r.id === 'rec-1')?.status === 'approved';
    const queueReduction = isDiversionActive ? 10 : 0;
    
    return {
      incident: {
        ...state.incident,
        estimatedClearance: Math.max(0, state.incident.estimatedClearance - 5 - queueReduction)
      }
    };
  })
}));
