'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Car, Clock, ShieldAlert, Layers } from 'lucide-react';

export default function IncidentSummary() {
  const incident = useSimulationStore((state) => state.incident);

  const severityColors: Record<string, string> = {
    critical: 'bg-red-700 text-red-50',
    high:     'bg-orange-700 text-orange-50',
    medium:   'bg-amber-700 text-amber-50',
    low:      'bg-slate-700 text-slate-200',
  };

  const statusColors: Record<string, string> = {
    active:    'text-red-400',
    resolving: 'text-amber-400',
    cleared:   'text-emerald-400',
  };

  const activeStrategies = incident.strategies.filter(s => s.status === 'approved');
  const pendingStrategies = incident.strategies.filter(s => s.status === 'pending');

  return (
    <Card className="bg-slate-950 border-0 rounded-none shrink-0 w-full max-w-full">
      <CardHeader className="p-4 border-b border-slate-800 bg-slate-950">
        <div className="flex justify-between items-start mb-2 gap-2">
          <Badge className={`${severityColors[incident.severity] ?? 'bg-slate-700 text-slate-200'} hover:opacity-90 rounded-sm text-[10px] uppercase font-bold tracking-widest px-1.5 py-0 border-0 shrink-0`}>
            {incident.severity} incident
          </Badge>
          <span className="text-[10px] font-mono text-slate-500 truncate">{incident.id}</span>
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
        {/* ── Live stats grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-px bg-slate-800 border-b border-slate-800">
          <div className="bg-slate-900 p-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5 flex items-center gap-1.5">
              <Car size={12} /> Blocked Lanes
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-slate-200 tracking-tight">{incident.blockedLanes}</span>
              <span className="text-xs text-slate-500 font-medium">/ {incident.totalLanes}</span>
            </div>
          </div>
          <div className="bg-slate-900 p-4">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5 flex items-center gap-1.5">
              <Clock size={12} /> Est. Clearance
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-xl font-bold font-mono tracking-tight ${incident.estimatedClearance < 20 ? 'text-red-400' : 'text-amber-500'}`}>
                {incident.estimatedClearance}
              </span>
              <span className="text-xs text-amber-500/70 font-medium">min</span>
            </div>
          </div>
        </div>

        {/* ── Live context fusion block ────────────────────────────────── */}
        <div className="p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-2.5">
            <ShieldAlert size={12} className="text-blue-500" />
            <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase">Live Context</span>
            <span className={`ml-auto text-[10px] font-bold uppercase tracking-widest ${statusColors[incident.status] ?? 'text-slate-400'}`}>
              {incident.status}
            </span>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed font-medium">
            <li className="flex items-start gap-2">
              <span className="text-slate-600 mt-[2px]">—</span>
              {incident.vehiclesInvolved} vehicles involved. {incident.blockedLanes} of {incident.totalLanes} lanes blocked.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-600 mt-[2px]">—</span>
              {incident.simulationElapsed > 0
                ? `Incident active for ${Math.floor(incident.simulationElapsed / 60)} min ${incident.simulationElapsed % 60}s.`
                : 'Incident just reported. Emergency response initiated.'}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-600 mt-[2px]">—</span>
              {activeStrategies.length > 0
                ? `${activeStrategies.length} strategy active: ${activeStrategies.map(s => s.name).join(', ')}.`
                : `${pendingStrategies.length} response strateg${pendingStrategies.length !== 1 ? 'ies' : 'y'} pending operator approval.`}
            </li>
          </ul>
        </div>

        {/* ── Alert publish status ─────────────────────────────────────── */}
        <div className="px-4 py-3 bg-slate-950 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Layers size={11} className="text-slate-600" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Comms</span>
          </div>
          {(['vms', 'social', 'sms'] as const).map(ch => {
            const published = ch === 'vms' ? incident.alerts.vmsPublished
              : ch === 'social' ? incident.alerts.socialPublished
              : incident.alerts.smsPublished;
            return (
              <span key={ch} className={`text-[9px] font-bold uppercase tracking-widest ${published ? 'text-emerald-500' : 'text-slate-700'}`}>
                {ch}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
