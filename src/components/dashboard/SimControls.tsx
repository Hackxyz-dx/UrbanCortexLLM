'use client';

import { useSimulationStore } from '@/lib/store';
import { Play, Pause } from 'lucide-react';

export default function SimControls() {
  const { isSimRunning, startSimulation, stopSimulation, incident } = useSimulationStore();

  return (
    <div className="hidden sm:flex items-center gap-4 text-base font-mono text-slate-500">
      <span className="hidden md:block">
        <span className="text-slate-400 mr-2">ETA:</span>
        <span className={incident.estimatedClearance < 20 ? 'text-red-600 font-bold' : 'text-slate-700 font-bold'}>
          {incident.estimatedClearance}
        </span>
        <span className="text-slate-500 font-medium ml-1">min</span>
      </span>
      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-widest border shadow-sm ${
        incident.status === 'active' ? 'bg-red-50 border-red-200 text-red-700' :
        incident.status === 'resolving' ? 'bg-amber-50 border-amber-200 text-amber-700' :
        'bg-emerald-50 border-emerald-200 text-emerald-700'
      }`}>
        {incident.status}
      </span>
      <button
        onClick={isSimRunning ? stopSimulation : startSimulation}
        title={isSimRunning ? 'Pause Simulation' : 'Start Simulation'}
        className={`flex items-center gap-2.5 px-4 py-2 rounded border text-sm font-bold uppercase tracking-wide transition-all shadow-sm ${
          isSimRunning
            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-700'
        }`}
      >
        {isSimRunning ? <Pause size={16} /> : <Play size={16} />}
        {isSimRunning ? 'Pause' : 'Run Sim'}
      </button>
    </div>
  );
}
