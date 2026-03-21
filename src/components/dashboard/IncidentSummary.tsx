'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Car, Activity, ServerCrash } from 'lucide-react';

export default function IncidentSummary() {
  const incident = useSimulationStore((state) => state.incident);

  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm shrink-0">
      <div className="p-3 border-b border-neutral-800 bg-neutral-900/80 flex justify-between items-center">
        <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-widest flex items-center gap-2">
          <ServerCrash size={14} className="text-orange-500" />
          Event {incident.id}
        </h2>
        <Badge variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50 text-[10px] uppercase font-bold tracking-widest px-2 py-0">
          Crit-1
        </Badge>
      </div>

      <div className="px-3 py-3 border-b border-neutral-800">
        <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{incident.title}</h3>
        <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-2">
          <AlertTriangle size={12} className="text-orange-400" />
          {incident.location.desc}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-neutral-800 border-b border-neutral-800">
        <div className="bg-neutral-900 p-3 flex flex-col justify-center">
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold mb-1 flex items-center gap-1"><Car size={10} /> Blocked Lanes</span>
          <span className="text-xl font-bold font-mono tracking-tight text-white">{incident.blockedLanes}<span className="text-xs text-neutral-600 font-sans tracking-normal"> / {incident.totalLanes}</span></span>
        </div>
        <div className="bg-neutral-900 p-3 flex flex-col justify-center">
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold mb-1 flex items-center gap-1"><Activity size={10} /> Primary Units</span>
          <span className="text-xl font-bold font-mono tracking-tight text-white">{incident.vehiclesInvolved}</span>
        </div>
      </div>
      
      <div className="px-3 py-3 pb-2 border-b border-neutral-800 bg-neutral-900/50">
         <span className="text-[9px] uppercase tracking-widest text-neutral-500 flex items-start gap-1 mb-1">
            <Activity size={10} className="mt-0.5" /> Provenance: Fused from Waze Hub, 14 CCTV feeds, and IoT Loop Detectors. 94% Confidence.
         </span>
      </div>

      <div className="px-3 py-3 border-b border-neutral-800 bg-black/20">
        <div className="flex justify-between text-[11px] mb-1">
          <span className="text-neutral-400 font-medium uppercase tracking-wider">Est. Incident Duration</span>
          <span className="font-mono text-cyan-400 font-bold">{incident.estimatedClearance} min</span>
        </div>
        <div className="w-full bg-neutral-800/80 rounded-full h-1.5 mt-2 overflow-hidden border border-neutral-950">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, 100 - (incident.estimatedClearance / 120) * 100)}%` }}></div>
        </div>
        <p className="text-[9px] text-neutral-500 mt-2 text-right uppercase tracking-widest font-mono">Target T-0: {new Date(Date.now() + incident.estimatedClearance * 60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
      </div>

      <div className="bg-neutral-900/40 p-3 flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-bl-full blur-xl pointer-events-none"></div>
        <h4 className="text-[9px] uppercase tracking-widest text-green-500 font-bold mb-1 flex justify-between z-10">
          <span>Operational Impact Projection</span>
          <span className="text-neutral-600 font-mono">MDL: v4.2</span>
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 z-10">
          <div className="flex justify-between items-center text-[11px] border-b border-neutral-800/50 pb-1">
            <span className="text-neutral-400">EMS Resp. Saved</span>
            <span className="text-green-400 font-mono font-bold">+14m</span>
          </div>
          <div className="flex justify-between items-center text-[11px] border-b border-neutral-800/50 pb-1">
            <span className="text-neutral-400">Queue Reduction</span>
            <span className="text-green-400 font-mono font-bold">-0.8mi</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-neutral-400">Risk Mitigation</span>
            <span className="text-green-400 font-mono font-bold">-34%</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-neutral-400">Alert Saturation</span>
            <span className="text-blue-400 font-mono font-bold">14.2k</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
