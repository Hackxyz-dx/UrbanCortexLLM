'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the map to avoid SSR issues with Leaflet
const MapViewer = dynamic(() => import('./MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-2 opacity-20 p-4">
        {Array.from({ length: 72 }).map((_, i) => (
          <div key={i} className="bg-slate-800 rounded-sm"></div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4 z-10">
        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
           <Skeleton className="w-10 h-10 rounded-full bg-cyan-500/20" />
        </div>
        <Skeleton className="h-4 w-[200px] bg-slate-800/50" />
        <div className="text-cyan-500/70 font-mono text-xs uppercase tracking-widest animate-pulse font-semibold">
          Initializing Urban Graph...
        </div>
      </div>
    </div>
  ),
});

export default function MapWidget() {
  return <MapViewer />;
}
