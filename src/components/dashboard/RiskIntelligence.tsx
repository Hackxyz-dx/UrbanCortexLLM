'use client';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertOctagon, TrendingUp } from 'lucide-react';

const riskHotspots = [
  { id: '1', loc: 'Market St Intersection', risk: 'High', reason: 'Queue spillback (+800 vph)', score: 88, color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: '2', loc: 'Broad St Off-ramp', risk: 'Medium', reason: 'Diverted heavy freight flow', score: 64, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: '3', loc: 'I-676 Merge Point', risk: 'Elevated', reason: 'Upstream bottlenecking', score: 42, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
];

export default function RiskIntelligence() {
  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm shrink-0">
      <CardHeader className="p-3 border-b border-neutral-800 bg-neutral-900/80">
        <CardTitle className="text-xs font-bold text-neutral-300 uppercase flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertOctagon size={14} className="text-red-400" />
            Secondary Risk Radar
          </span>
          <Badge variant="outline" className="bg-red-500/10 text-[9px] text-red-500 border-red-500/20 px-1 py-0 h-4">
            Critical
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 flex flex-col gap-2">
        {riskHotspots.map(spot => (
          <div key={spot.id} className="flex flex-col gap-1 p-2 rounded bg-neutral-950/50 border border-neutral-800/50">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-neutral-200">{spot.loc}</span>
              <span className={`text-[10px] font-mono font-bold ${spot.color}`}>{spot.score}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[8px] uppercase tracking-wider h-4 px-1 rounded-sm border-none ${spot.bg} ${spot.color}`}>
                {spot.risk}
              </Badge>
              <span className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
                 <TrendingUp size={10} className="text-neutral-500" /> {spot.reason}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
