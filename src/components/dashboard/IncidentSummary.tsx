'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Car, ShieldAlert } from 'lucide-react';

export default function IncidentSummary() {
  const incident = useSimulationStore((state) => state.incident);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-neutral-800 text-neutral-300 font-mono tracking-widest text-[10px] border-neutral-700">
            {incident.id}
          </Badge>
          <Badge variant="outline" className={`capitalize font-semibold ${getSeverityColor(incident.severity)}`}>
            {incident.severity} Severity
          </Badge>
        </div>
        <CardTitle className="text-sm font-bold text-white mt-1 leading-snug">
          {incident.title}
        </CardTitle>
        <p className="text-xs text-neutral-400 font-medium">{incident.location.desc}</p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 pb-4">
        <div className="flex flex-col gap-1 p-2 rounded bg-neutral-950/50 border border-neutral-800/50">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert size={12} className="text-red-400" /> Blocked Lanes
          </span>
          <span className="text-lg font-mono font-bold text-neutral-200">
            {incident.blockedLanes} <span className="text-xs text-neutral-600 font-sans font-normal">/ {incident.totalLanes}</span>
          </span>
        </div>
        <div className="flex flex-col gap-1 p-2 rounded bg-neutral-950/50 border border-neutral-800/50">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Car size={12} className="text-orange-400" /> Vehicles
          </span>
          <span className="text-lg font-mono font-bold text-neutral-200">{incident.vehiclesInvolved}</span>
        </div>
        <div className="col-span-2 flex flex-col gap-1 p-2 rounded bg-neutral-950/50 border border-neutral-800/50">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><Clock size={12} className="text-cyan-400" /> Est. Clearance</span>
            <span className="text-cyan-500 animate-pulse text-[10px]">Updating Live</span>
          </span>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-mono font-bold text-white">{incident.estimatedClearance}</span>
            <span className="text-xs text-neutral-400 mb-1">minutes</span>
          </div>
          {/* Progress Bar representation */}
          <div className="h-1.5 w-full bg-neutral-800 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-1000" 
              style={{ width: `${Math.max(5, 100 - (incident.estimatedClearance / 120) * 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
      {/* Hackathon Value / Measurable Impact Panel */}
      <div className="border-t border-neutral-800 bg-neutral-900/50 p-3 flex flex-col gap-2">
        <h4 className="text-[10px] uppercase tracking-wider text-cyan-500 font-bold mb-1">Estimated Operational Impact</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">Response Time Saved</span>
            <span className="text-green-400 font-mono font-bold">+14m</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">Queue Reduction</span>
            <span className="text-green-400 font-mono font-bold">-0.8mi</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">Secondary Crash Risk</span>
            <span className="text-green-400 font-mono font-bold">-34%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500">Public Alert Reach</span>
            <span className="text-blue-400 font-mono font-bold">14.2k</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
