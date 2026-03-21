'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Car, Clock, ShieldAlert } from 'lucide-react';

export default function IncidentSummary() {
  const incident = useSimulationStore((state) => state.incident);

  return (
    <Card className="bg-slate-950 border-0 rounded-none shrink-0 w-full max-w-full">
      <CardHeader className="p-4 border-b border-slate-800 bg-slate-950">
        <div className="flex justify-between items-start mb-2">
          <Badge className="bg-red-700 text-red-50 hover:bg-red-800 rounded-sm text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 whitespace-nowrap shrink-0 border-0">
             Critical Incident
          </Badge>
          <span className="text-[10px] font-mono text-slate-500 font-medium tracking-wider truncate">{incident.id}</span>
        </div>
        <CardTitle className="text-base font-bold text-slate-100 leading-snug break-words">
          {incident.title}
        </CardTitle>
        <p className="text-[13px] text-slate-400 flex items-start gap-2 mt-1 break-words">
          <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <span className="min-w-0 break-words">{incident.location.desc}</span>
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-px bg-slate-800 border-b border-slate-800">
          <div className="bg-slate-900 p-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5 flex items-center gap-1.5"><Car size={12} className="text-slate-500" /> Blocked Lanes</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-slate-200 tracking-tight">{incident.blockedLanes}</span>
              <span className="text-xs text-slate-500 font-medium font-sans">/ {incident.totalLanes}</span>
            </div>
          </div>
          <div className="bg-slate-900 p-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5 flex items-center gap-1.5"><Clock size={12} className="text-slate-500" /> Est. Clearance</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-amber-500 tracking-tight">{incident.estimatedClearance}</span>
              <span className="text-xs text-amber-500/70 font-medium font-sans">min</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2.5">
            <ShieldAlert size={12} className="text-blue-500" />
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">Context Fusion</span>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed font-medium">
            <li className="flex items-start gap-2"><span className="text-slate-600 mt-[2px]">-</span> Mainline queue reaching 2.1 miles (Waze/CCTV).</li>
            <li className="flex items-start gap-2"><span className="text-slate-600 mt-[2px]">-</span> Expected delay increase: +25 mins without intervention.</li>
            <li className="flex items-start gap-2"><span className="text-slate-600 mt-[2px]">-</span> Emergency responders actively sweeping Lane 2.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
