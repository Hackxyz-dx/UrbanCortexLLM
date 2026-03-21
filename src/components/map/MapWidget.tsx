'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import the map to avoid SSR issues with Leaflet
const MapViewer = dynamic(() => import('./MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-2 opacity-30 p-4">
        {Array.from({ length: 72 }).map((_, i) => (
          <div key={i} className="bg-slate-200 rounded-sm"></div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-4 z-10 bg-white/80 p-6 rounded-lg shadow-sm backdrop-blur-sm border border-slate-200">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
           <Skeleton className="w-10 h-10 rounded-full bg-blue-200" />
        </div>
        <Skeleton className="h-4 w-[200px] bg-slate-200" />
        <div className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse font-bold mt-2">
          Loading Map Data...
        </div>
      </div>
    </div>
  ),
});

export default function MapWidget() {
  return <MapViewer />;
}
