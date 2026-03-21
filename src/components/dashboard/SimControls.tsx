'use client';

import { useSimulationStore } from '@/lib/store';
import { Play, Pause } from 'lucide-react';

export default function SimControls() {
  const { isSimRunning, startSimulation, stopSimulation, incident } = useSimulationStore();

  return (
    <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-400">
      <span className="hidden md:block">
        <span className="text-slate-600 mr-1">ETA:</span>
        <span className={incident.estimatedClearance < 20 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
          {incident.estimatedClearance}
        </span>
        <span className="text-slate-600"> min</span>
      </span>
      <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${
        incident.status === 'active' ? 'bg-red-950/50 border-red-900/50 text-red-400' :
        incident.status === 'resolving' ? 'bg-amber-950/50 border-amber-900/50 text-amber-400' :
        'bg-emerald-950/50 border-emerald-900/50 text-emerald-400'
      }`}>
        {incident.status}
      </span>
      <button
        onClick={isSimRunning ? stopSimulation : startSimulation}
        title={isSimRunning ? 'Pause Simulation' : 'Start Simulation'}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-bold uppercase tracking-wide transition-colors ${
          isSimRunning
            ? 'bg-amber-950/40 border-amber-900/50 text-amber-400 hover:bg-amber-900/40'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
        }`}
      >
        {isSimRunning ? <Pause size={12} /> : <Play size={12} />}
        {isSimRunning ? 'Pause' : 'Run Sim'}
      </button>
    </div>
  );
}
