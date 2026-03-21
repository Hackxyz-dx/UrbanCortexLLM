'use client';

import { useSimulationStore } from '@/lib/store';
import { Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export default function DemoControls() {
  const advanceSimulation = useSimulationStore(state => state.advanceSimulation);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let intId: any;
    if (isPlaying) {
      intId = setInterval(() => {
        advanceSimulation();
      }, 5000); // Ticks every 5s while playing
    }
    return () => clearInterval(intId);
  }, [isPlaying, advanceSimulation]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="absolute top-0 right-[420px] m-4 z-40 flex items-center bg-neutral-900/90 backdrop-blur border border-neutral-800 rounded-full px-3 py-1.5 shadow-2xl gap-3">
       <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-none text-[9px] uppercase tracking-wider px-1">
          Demo Mode
       </Badge>
       
       <div className="w-px h-4 bg-neutral-800"></div>
       
       <div className="flex gap-2 items-center">
          <button onClick={togglePlay} className="text-neutral-400 hover:text-white transition-colors p-1" title={isPlaying ? "Pause Simulation" : "Play Simulation"}>
             {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => advanceSimulation()} className="text-neutral-400 hover:text-cyan-400 transition-colors p-1" title="Step Forward">
             <FastForward size={14} />
          </button>
          <button className="text-neutral-400 hover:text-red-400 transition-colors p-1" title="Reset (Refresh Page)">
             <RotateCcw size={14} onClick={() => window.location.reload()} />
          </button>
       </div>
    </div>
  );
}
