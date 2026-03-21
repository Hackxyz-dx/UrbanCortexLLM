'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the map to avoid SSR issues with Leaflet
const MapViewer = dynamic(() => import('./MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-neutral-900 flex items-center justify-center border-y border-neutral-800 relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-2 opacity-20 p-4">
        {Array.from({ length: 72 }).map((_, i) => (
          <div key={i} className="bg-neutral-800 rounded-sm"></div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4 z-10">
        <Skeleton className="w-16 h-16 rounded-full bg-neutral-800/50" />
        <Skeleton className="h-4 w-[200px] bg-neutral-800/50" />
        <div className="text-neutral-500 font-mono text-xs uppercase tracking-widest animate-pulse">
          Initializing Urban Graph...
        </div>
      </div>
    </div>
  ),
});

export default function MapWidget() {
  return <MapViewer />;
}
