'use client';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Radio, AlertCircle, Video } from 'lucide-react';

const mockFeedItems = [
  { id: 1, time: '10:24 AM', type: 'cctv', source: 'DOT Cam 42', text: 'Spillback reaching Market St off-ramp. Queue length: 2.1 miles.', conf: '99%' },
  { id: 2, time: '10:22 AM', type: 'waze', source: 'Waze API', text: 'Crowdsourced reports of standstill traffic moving 3 mph.', conf: 'High' },
  { id: 3, time: '10:19 AM', type: 'sensor', source: 'IoT Loop #902', text: 'Volume on Alternate Route Columbus Blvd is currently 40% below capacity.', conf: '94%' },
  { id: 4, time: '10:16 AM', type: 'ems', source: 'Dispatch API', text: 'Ambulance Unit 7 delayed by 4 minutes on approach due to rubbernecking.', conf: '100%' },
];

export default function LiveFeed() {
  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm flex flex-col min-h-0 flex-1">
      <CardHeader className="p-3 border-b border-neutral-800 bg-neutral-900/80 sticky top-0 z-10">
        <CardTitle className="text-[11px] font-bold text-neutral-300 uppercase tracking-widest flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Radio size={14} className="animate-pulse" /> Live Telemetry Feed
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden relative">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col">
            {mockFeedItems.map((item, idx) => (
              <div 
                key={item.id} 
                className={`p-3 border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors ${idx === 0 ? 'bg-neutral-950/20' : ''}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'cctv' && <Video size={10} className="text-emerald-400" />}
                    {item.type === 'waze' && <Activity size={10} className="text-blue-400" />}
                    {item.type === 'sensor' && <Radio size={10} className="text-purple-400" />}
                    {item.type === 'ems' && <AlertCircle size={10} className="text-red-400" />}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                      {item.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] uppercase tracking-wider text-green-500/80 border border-green-500/20 bg-green-500/5 px-1 rounded-sm font-mono">
                        VER: {item.conf}
                     </span>
                     <span className="text-[9px] font-mono text-neutral-600">{item.time}</span>
                  </div>
                </div>
                <p className={`text-[11px] leading-relaxed ${idx === 0 ? 'text-neutral-200' : 'text-neutral-400'}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <div className="p-3 text-center border-t border-neutral-800/50">
             <span className="text-[9px] uppercase tracking-widest text-neutral-600">End of recent telemetry</span>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
