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
      <div className="p-6 border-b border-slate-100 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2 mb-1">
          <Badge variant="outline" className={`${severityColors[incident.severity] ?? 'bg-slate-50 text-slate-700 border-slate-200'} hover:bg-transparent rounded text-xs uppercase font-bold tracking-widest px-2.5 py-1 shrink-0`}>
            {incident.severity} incident
          </Badge>
          <span className="text-xs font-mono font-medium text-slate-400 truncate">{incident.id}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 leading-snug break-words">
          {incident.title}
        </h3>
        <p className="text-base text-slate-600 flex items-start gap-2.5 break-words leading-relaxed">
          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <span className="min-w-0">{incident.location.desc}</span>
        </p>
      </div>

      {/* ── Live stats grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 border-b border-slate-100">
        <div className="bg-slate-50/50 p-6">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-2">
            <Car size={16} /> Blocked Lanes
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-4xl font-bold font-mono text-slate-800 tracking-tight">{incident.blockedLanes}</span>
            <span className="text-base text-slate-500 font-medium">/ {incident.totalLanes}</span>
          </div>
        </div>
        <div className="bg-slate-50/50 p-6">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-2">
            <Clock size={16} /> Est. Clearance
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-4xl font-bold font-mono tracking-tight ${incident.estimatedClearance < 20 ? 'text-red-600' : 'text-amber-600'}`}>
              {incident.estimatedClearance}
            </span>
            <span className="text-base text-slate-500 font-medium ml-1">min</span>
          </div>
        </div>
      </div>

      {/* ── Live context fusion block ────────────────────────────────── */}
      <div className="p-6 border-b border-slate-100 flex-1">
        <div className="flex items-center gap-2 mb-5">
          <ShieldAlert size={16} className="text-blue-600" />
          <span className="text-sm font-bold text-slate-700 tracking-wider uppercase">Live Context</span>
          <span className={`ml-auto text-xs font-bold uppercase tracking-widest ${statusColors[incident.status] ?? 'text-slate-500'}`}>
            {incident.status}
          </span>
        </div>
        <ul className="text-base text-slate-600 space-y-4 leading-relaxed font-medium">
          <li className="flex items-start gap-3">
            <span className="text-slate-300 mt-[5px]">—</span>
            <span><strong className="text-slate-800">{incident.vehiclesInvolved}</strong> vehicles involved. <strong className="text-slate-800">{incident.blockedLanes}</strong> of {incident.totalLanes} lanes blocked.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-slate-300 mt-[5px]">—</span>
            <span>
              {incident.simulationElapsed > 0
                ? `Incident active for ${Math.floor(incident.simulationElapsed / 60)} min ${incident.simulationElapsed % 60}s.`
                : 'Incident just reported. Emergency response initiated.'}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-slate-300 mt-[5px]">—</span>
            <span>
              {activeStrategies.length > 0
                ? <><strong className="text-blue-700">{activeStrategies.length} strategy active:</strong> {activeStrategies.map(s => s.name).join(', ')}.</>
                : <><strong className="text-amber-600">{pendingStrategies.length} response {pendingStrategies.length !== 1 ? 'strategies' : 'strategy'}</strong> pending operator approval.</>}
            </span>
          </li>
        </ul>
      </div>

      {/* ── Alert publish status ─────────────────────────────────────── */}
      <div className="p-5 bg-slate-50 flex items-center gap-6 mt-auto border-t border-slate-100">
        <div className="flex items-center gap-2 hidden sm:flex">
          <Layers size={16} className="text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Comms</span>
        </div>
        {(['vms', 'social', 'sms'] as const).map(ch => {
          const published = ch === 'vms' ? incident.alerts.vmsPublished
            : ch === 'social' ? incident.alerts.socialPublished
            : incident.alerts.smsPublished;
          return (
            <span key={ch} className={`text-xs font-bold uppercase tracking-widest ${published ? 'text-emerald-600' : 'text-slate-500'}`}>
              {ch} {published ? 'LIVE' : 'PENDING'}
            </span>
          );
        })}
      </div>
    </div>
  );
}
