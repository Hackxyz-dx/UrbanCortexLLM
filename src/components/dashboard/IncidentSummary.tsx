'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Car, Clock, ShieldAlert } from 'lucide-react';

export default function IncidentSummary() {
  const incident = useSimulationStore((state) => state.incident);

  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm shrink-0">
      <CardHeader className="p-4 border-b border-neutral-800 bg-neutral-900/80">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50 text-[10px] uppercase font-bold tracking-widest px-2 py-0">
            Critical Incident
          </Badge>
          <span className="text-[10px] font-mono text-neutral-500">{incident.id}</span>
        </div>
        <CardTitle className="text-base font-bold text-white leading-snug">
          {incident.title}
        </CardTitle>
        <p className="text-sm text-neutral-400 flex items-center gap-1.5 mt-2">
          <AlertTriangle size={14} className="text-orange-400" />
          {incident.location.desc}
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-px bg-neutral-800 border-b border-neutral-800">
          <div className="bg-neutral-900 p-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1 flex items-center gap-1"><Car size={12} /> Blocked Lanes</span>
            <span className="text-xl font-bold font-mono text-white">{incident.blockedLanes}<span className="text-sm text-neutral-600 font-sans"> / {incident.totalLanes}</span></span>
          </div>
          <div className="bg-neutral-900 p-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-1 flex items-center gap-1"><Clock size={12} /> Est. Clearance</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{incident.estimatedClearance} <span className="text-sm text-neutral-600 font-sans">min</span></span>
          </div>
        </div>
        
        <div className="p-4 bg-neutral-950/30 border-b border-neutral-800">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-neutral-300">Live Context Fusion</span>
          </div>
          <ul className="text-[11px] text-neutral-400 space-y-2 leading-relaxed">
            <li>• Mainline queue reaching 2.1 miles (Waze/CCTV).</li>
            <li>• Expected delay increase: +25 mins without intervention.</li>
            <li>• Emergency responders actively sweeping Lane 2.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
