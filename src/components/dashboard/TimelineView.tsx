'use client';

import { useSimulationStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitCommitHorizontal, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TimelineView() {
  const incident = useSimulationStore(state => state.incident);

  return (
    <div className="w-[500px] flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shrink-0">
      <div className="p-3 border-b border-neutral-800 bg-neutral-900/80 flex justify-between items-center">
        <h3 className="text-xs font-bold text-neutral-300 uppercase flex items-center gap-2">
          <GitCommitHorizontal size={14} className="text-purple-400" />
          Decision Memory
        </h3>
        <Button size="sm" variant="outline" className="h-6 text-[10px] bg-neutral-950 border-neutral-700 text-neutral-300 px-2 py-0">
          <FileText size={10} className="mr-1" /> Export Audit Log
        </Button>
      </div>
      
      <div className="flex-1 p-0 overflow-hidden relative">
        {/* Timeline Path Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-neutral-800 z-0"></div>
        
        <ScrollArea className="h-[220px] w-full p-3 pl-2 relative z-10">
          <div className="flex flex-col gap-4">
            {incident.timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="flex flex-col items-center mt-0.5 z-10">
                  <div className="w-8 h-8 rounded-full bg-neutral-950 border-2 border-neutral-700 flex items-center justify-center group-hover:border-purple-500 transition-colors">
                    {item.event.includes('Operator approved') ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col bg-neutral-950/50 p-2 rounded-md border border-neutral-800">
                  <span className="text-[10px] font-mono text-neutral-500 mb-1">{item.time}</span>
                  <p className={`text-xs ${item.event.includes('Operator approved') ? 'text-green-400 font-medium' : 'text-neutral-300'}`}>
                    {item.event}
                  </p>
                </div>
              </div>
            ))}
            <div className="h-4"></div> {/* Scroll padding */}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
