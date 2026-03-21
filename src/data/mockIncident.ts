export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'applied';

export interface RouteGeometry {
  id: string;
  name: string;
  coordinates: [number, number][]; // [lat, lng]
  congestionLevel: 'low' | 'moderate' | 'heavy' | 'blocked';
  type: 'primary' | 'diversion' | 'emergency-corridor';
}

export interface Recommendation {
  id: string;
  type: 'signal-timing' | 'diversion' | 'lane-reopen' | 'emergency-corridor' | 'public-alert';
  title: string;
  description: string;
  reasoning: string;
  expectedImpact: string;
  confidence: number;
  status: ActionStatus;
}

export interface ResponseStrategy {
  id: string;
  name: string;
  rank: number;
  overallConfidence: number;
  metrics: {
    queueReduction: string;
    delayReduction: string;
    secondaryCrashRisk: string;
    complexity: 'Low' | 'Medium' | 'High';
  };
  actions: Recommendation[];
  status: ActionStatus;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'incident' | 'recommendation' | 'approval' | 'alert' | 'chat' | 'simulation';
  message: string;
}

export interface AlertState {
  vmsPublished: boolean;
  socialPublished: boolean;
  smsPublished: boolean;
}

export interface IncidentState {
  id: string;
  title: string;
  status: 'active' | 'resolving' | 'cleared';
  severity: IncidentSeverity;
  location: { lat: number; lng: number; desc: string };
  blockedLanes: number;
  totalLanes: number;
  vehiclesInvolved: number;
  estimatedClearance: number; // minutes
  routes: RouteGeometry[];
  strategies: ResponseStrategy[];
  recommendations: Recommendation[];
  timeline: TimelineEvent[];
  alerts: AlertState;
  simulationElapsed: number; // seconds since incident start
}

const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export const initialMockIncident: IncidentState = {
  id: 'INC-2026-PDEU-01',
  title: 'Multi-Vehicle Collision on Koba-Gandhinagar Highway',
  status: 'active',
  severity: 'critical',
  location: { lat: 23.1565, lng: 72.6659, desc: 'Koba-Gandhinagar Hwy, near PDEU Main Gate, Sector-23' },
  blockedLanes: 3,
  totalLanes: 4,
  vehiclesInvolved: 5,
  estimatedClearance: 90,
  routes: [
    {
      id: 'r1',
      name: 'Koba-Gandhinagar Hwy (Incident Mainline)',
      congestionLevel: 'blocked',
      type: 'primary',
      coordinates: [
        [23.1480, 72.6640],
        [23.1520, 72.6653],
        [23.1565, 72.6659],
        [23.1620, 72.6670],
      ]
    },
    {
      id: 'r2',
      name: 'Sardar Patel Ring Road Diversion',
      congestionLevel: 'moderate',
      type: 'diversion',
      coordinates: [
        [23.1480, 72.6640],
        [23.1430, 72.6580],
        [23.1390, 72.6510],
        [23.1400, 72.6430],
        [23.1450, 72.6380],
        [23.1560, 72.6400],
        [23.1620, 72.6670],
      ]
    },
    {
      id: 'r3',
      name: 'Indroda Circle Emergency Corridor',
      congestionLevel: 'low',
      type: 'emergency-corridor',
      coordinates: [
        [23.1565, 72.6659],
        [23.1600, 72.6700],
        [23.1650, 72.6720],
      ]
    }
  ],
  strategies: [
    {
      id: 'strat-1',
      name: 'Ring Road Diversion + Signal Cascade',
      rank: 1,
      overallConfidence: 0.93,
      status: 'pending',
      metrics: {
        queueReduction: '-2.1 km',
        delayReduction: '-27 min',
        secondaryCrashRisk: '-38%',
        complexity: 'Medium'
      },
      actions: [
        {
          id: 'rec-1',
          type: 'diversion',
          title: 'Activate Sardar Patel Ring Road Diversion',
          description: 'Redirect all non-emergency westbound traffic to Sardar Patel Ring Road via Sector-23 off-ramp.',
          reasoning: 'Ring Road has 45% spare capacity and bypasses the primary incident zone.',
          expectedImpact: 'Expected to move ~700 vph away from blocked mainline.',
          confidence: 0.93,
          status: 'pending'
        },
        {
          id: 'rec-2',
          type: 'signal-timing',
          title: 'Extend Green Phase at Indroda Circle',
          description: 'Increase N-S signal green phase by +20s at junctions: Indroda Circle, Sector-23 gate, PDEU West entry.',
          reasoning: 'Accommodates surge in Ring Road traffic without spillback.',
          expectedImpact: 'Prevents grid-lock at Indroda Circle junction.',
          confidence: 0.88,
          status: 'pending'
        }
      ]
    },
    {
      id: 'strat-2',
      name: 'Soft Reroute via Sector-7 Road',
      rank: 2,
      overallConfidence: 0.76,
      status: 'pending',
      metrics: {
        queueReduction: '-0.8 km',
        delayReduction: '-11 min',
        secondaryCrashRisk: '-12%',
        complexity: 'Low'
      },
      actions: [
        {
          id: 'rec-3',
          type: 'diversion',
          title: 'Soft Diversion via Sector-7 Internal Road',
          description: 'Divert light vehicles only to Sector-7 internal road network bypassing the main highway.',
          reasoning: 'Lower impact on broader grid, suitable for lower volume scenarios.',
          expectedImpact: 'Reduces light vehicle density on mainline by ~30%.',
          confidence: 0.76,
          status: 'pending'
        }
      ]
    }
  ],
  recommendations: [],
  timeline: [
    {
      id: 'evt-0',
      timestamp: now(),
      type: 'incident',
      message: 'INC-2026-PDEU-01 initialized. Multi-vehicle collision on Koba-Gandhinagar Hwy near PDEU Main Gate.'
    }
  ],
  alerts: {
    vmsPublished: false,
    socialPublished: false,
    smsPublished: false
  },
  simulationElapsed: 0
};
