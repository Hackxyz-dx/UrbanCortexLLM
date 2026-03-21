'use client';

import { useSimulationStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Car, Clock, ShieldAlert, Layers } from 'lucide-react';

export default function IncidentSummary() {
  const incident = useSimulationStore((state) => state.incident);

  const severityColors: Record<string, string> = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high:     'bg-orange-50 text-orange-700 border-orange-200',
    medium:   'bg-amber-50 text-amber-700 border-amber-200',
    low:      'bg-slate-50 text-slate-700 border-slate-200',
  };

  const statusColors: Record<string, string> = {
    active:    'text-red-600',
    resolving: 'text-amber-600',
    cleared:   'text-emerald-600',
  };

  const activeStrategies = incident.strategies.filter(s => s.status === 'approved');
  const pendingStrategies = incident.strategies.filter(s => s.status === 'pending');

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* ── Header details ───────────────────────────────────────────── */}
      <div className="p-5 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={`${severityColors[incident.severity] ?? 'bg-slate-50 text-slate-700 border-slate-200'} hover:bg-transparent rounded-sm text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 shrink-0`}>
            {incident.severity} incident
          </Badge>
          <span className="text-[11px] font-mono text-slate-400 truncate">{incident.id}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 leading-snug break-words">
          {incident.title}
        </h3>
        <p className="text-sm text-slate-500 flex items-start gap-2 break-words leading-relaxed">
          <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
          <span className="min-w-0">{incident.location.desc}</span>
        </p>
      </div>

      {/* ── Live stats grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
        <div className="bg-slate-50/50 p-5">
          <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center gap-1.5">
            <Car size={14} /> Blocked Lanes
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-bold font-mono text-slate-800 tracking-tight">{incident.blockedLanes}</span>
            <span className="text-sm text-slate-400 font-medium">/ {incident.totalLanes}</span>
          </div>
        </div>
        <div className="bg-slate-50/50 p-5">
          <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center gap-1.5">
            <Clock size={14} /> Est. Clearance
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-bold font-mono tracking-tight ${incident.estimatedClearance < 20 ? 'text-red-600' : 'text-amber-600'}`}>
              {incident.estimatedClearance}
            </span>
            <span className="text-sm text-slate-400 font-medium ml-1">min</span>
          </div>
        </div>
      </div>

      {/* ── Live context fusion block ────────────────────────────────── */}
      <div className="p-5 border-b border-slate-100 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={14} className="text-blue-600" />
          <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">Live Context</span>
          <span className={`ml-auto text-xs font-bold uppercase tracking-widest ${statusColors[incident.status] ?? 'text-slate-500'}`}>
            {incident.status}
          </span>
        </div>
        <ul className="text-sm text-slate-600 space-y-3 leading-relaxed font-medium">
          <li className="flex items-start gap-2.5">
            <span className="text-slate-300 mt-[3px]">—</span>
            <span><strong className="text-slate-800">{incident.vehiclesInvolved}</strong> vehicles involved. <strong className="text-slate-800">{incident.blockedLanes}</strong> of {incident.totalLanes} lanes blocked.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-slate-300 mt-[3px]">—</span>
            <span>
              {incident.simulationElapsed > 0
                ? `Incident active for ${Math.floor(incident.simulationElapsed / 60)} min ${incident.simulationElapsed % 60}s.`
                : 'Incident just reported. Emergency response initiated.'}
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-slate-300 mt-[3px]">—</span>
            <span>
              {activeStrategies.length > 0
                ? <><strong className="text-blue-700">{activeStrategies.length} strategy active:</strong> {activeStrategies.map(s => s.name).join(', ')}.</>
                : <><strong className="text-amber-600">{pendingStrategies.length} response {pendingStrategies.length !== 1 ? 'strategies' : 'strategy'}</strong> pending operator approval.</>}
            </span>
          </li>
        </ul>
      </div>

      {/* ── Alert publish status ─────────────────────────────────────── */}
      <div className="p-4 bg-slate-50 flex items-center gap-5 mt-auto border-t border-slate-100">
        <div className="flex items-center gap-1.5 hidden sm:flex">
          <Layers size={14} className="text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Comms</span>
        </div>
        {(['vms', 'social', 'sms'] as const).map(ch => {
          const published = ch === 'vms' ? incident.alerts.vmsPublished
            : ch === 'social' ? incident.alerts.socialPublished
            : incident.alerts.smsPublished;
          return (
            <span key={ch} className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${published ? 'text-emerald-600' : 'text-slate-400'}`}>
              {ch} {published ? 'LIVE' : 'PENDING'}
            </span>
          );
        })}
      </div>
    </div>
  );
}
