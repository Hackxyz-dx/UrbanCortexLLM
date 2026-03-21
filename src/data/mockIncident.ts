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
  recommendations: Recommendation[];
  timeline: { time: string; event: string }[];
}

export const initialMockIncident: IncidentState = {
  id: 'INC-2024-089',
  title: 'Multi-Vehicle Collision on I-95 North',
  status: 'active',
  severity: 'critical',
  location: { lat: 39.9526, lng: -75.1652, desc: 'I-95 Northbound at Exit 22' },
  blockedLanes: 3,
  totalLanes: 4,
  vehiclesInvolved: 4,
  estimatedClearance: 120, // 2 hours
  routes: [
    {
      id: 'r1',
      name: 'I-95 N Mainline',
      congestionLevel: 'blocked',
      type: 'primary',
      coordinates: [
        [39.9400, -75.1600],
        [39.9526, -75.1652],
        [39.9600, -75.1700],
      ]
    },
    {
      id: 'r2',
      name: 'Columbus Blvd Diversion',
      congestionLevel: 'moderate',
      type: 'diversion',
      coordinates: [
        [39.9400, -75.1600],
        [39.9450, -75.1500],
        [39.9600, -75.1550],
        [39.9650, -75.1700],
      ]
    }
  ],
  recommendations: [
    {
      id: 'rec-1',
      type: 'diversion',
      title: 'Activate Columbus Blvd Diversion',
      description: 'Route all non-essential northbound traffic to Columbus Blvd.',
      reasoning: 'I-95 main queue is growing at 2 miles/hr. Columbus Blvd has 40% spare capacity.',
      expectedImpact: '-15 mins avg delay, reduces secondary accident risk.',
      confidence: 0.92,
      status: 'pending'
    },
    {
      id: 'rec-2',
      type: 'signal-timing',
      title: 'Extend Green Phase on Columbus Blvd',
      description: 'Increase N-S green timing by +15s at 4 intersections.',
      reasoning: 'To handle the +600 vph expected from the diversion route.',
      expectedImpact: 'Prevents spillback onto local grid.',
      confidence: 0.88,
      status: 'pending'
    },
    {
      id: 'rec-3',
      type: 'emergency-corridor',
      title: 'Preserve Broad St for EMS',
      description: 'Reserve right lane on Broad St for approaching ambulances.',
      reasoning: 'Nearest trauma center is 12 mins away via Broad St. Current EMS delayed by 4 mins.',
      expectedImpact: 'Reduces EMS arrival time by 30%.',
      confidence: 0.95,
      status: 'pending'
    }
  ],
  timeline: [
    { time: '10:14 AM', event: 'Initial crash detected via Waze crowd-source' },
    { time: '10:16 AM', event: 'CCTV confirmed multi-vehicle collision, 3 lanes blocked' },
    { time: '10:18 AM', event: 'AI Co-Pilot engaged, calculating incident impact' }
  ]
};
