import { create } from 'zustand';
import { IncidentState, initialMockIncident, ActionStatus } from '../data/mockIncident';

interface SimulationStore {
  incident: IncidentState;
  updateStrategyStatus: (id: string, status: ActionStatus) => void;
  updateRecommendationStatus: (id: string, status: ActionStatus) => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  incident: initialMockIncident,
  
  updateStrategyStatus: (id, status) => set((state) => {
    return {
      incident: {
        ...state.incident,
        strategies: state.incident.strategies.map(s => {
          if (s.id === id) return { ...s, status };
          if (status === 'approved') return { ...s, status: 'rejected' }; // Exclusivity
          return s;
        })
      }
    };
  }),

  updateRecommendationStatus: (id, status) => set((state) => {
    return {
      incident: {
        ...state.incident,
        recommendations: state.incident.recommendations.map(r => 
          r.id === id ? { ...r, status } : r
        )
      }
    };
  })
}));
