'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Car, Clock, ShieldAlert } from 'lucide-react';

export default function IncidentSummary() {
  const incident = useSimulationStore((state) => state.incident);

  return (
    <Card className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] shrink-0 transition-all hover:border-slate-600/60 overflow-hidden w-full max-w-full">
      <CardHeader className="p-5 border-b border-slate-700/50 bg-slate-800/40 relative overflow-hidden min-w-0">
        {/* Subtle glow background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex justify-between items-start mb-3 relative z-10 gap-2 flex-wrap">
          <Badge variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50 text-[11px] uppercase font-bold tracking-widest px-2.5 py-0.5 shadow-[0_0_10px_rgba(239,68,68,0.2)] whitespace-nowrap shrink-0">
             Critical Incident
          </Badge>
          <span className="text-xs font-mono text-slate-400 font-medium tracking-wider truncate">{incident.id}</span>
        </div>
        <CardTitle className="text-lg font-bold text-white leading-snug relative z-10 drop-shadow-sm break-words">
          {incident.title}
        </CardTitle>
        <p className="text-sm text-slate-300 flex items-start gap-2 mt-2 relative z-10 break-words">
          <AlertTriangle size={16} className="text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.8)] mt-0.5 shrink-0" />
          <span className="min-w-0 break-words">{incident.location.desc}</span>
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-[1px] bg-slate-700/50 border-b border-slate-700/50">
          <div className="bg-slate-900/80 p-5 group hover:bg-slate-800/80 transition-colors">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 flex items-center gap-1.5"><Car size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" /> Blocked Lanes</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-white tracking-tight">{incident.blockedLanes}</span>
              <span className="text-sm text-slate-500 font-medium font-sans">/ {incident.totalLanes}</span>
            </div>
          </div>
          <div className="bg-slate-900/80 p-5 group hover:bg-slate-800/80 transition-colors">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2 flex items-center gap-1.5"><Clock size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" /> Est. Clearance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-cyan-400 tracking-tight drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">{incident.estimatedClearance}</span>
              <span className="text-sm text-cyan-700 font-medium font-sans">min</span>
            </div>
          </div>
        </div>
        
        <div className="p-5 bg-slate-950/40 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <ShieldAlert size={12} className="text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-slate-100 tracking-wide">Live Context Fusion</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed font-medium">
            <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Mainline queue reaching 2.1 miles (Waze/CCTV).</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">•</span> Expected delay increase: +25 mins without intervention.</li>
            <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">•</span> Emergency responders actively sweeping Lane 2.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
