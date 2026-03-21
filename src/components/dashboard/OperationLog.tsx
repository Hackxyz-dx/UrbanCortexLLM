'use client';

import { useSimulationStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Radio, CheckCircle2, MessageSquare, ShieldAlert, Activity } from 'lucide-react';
import type { TimelineEvent } from '@/data/mockIncident';

const eventIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'approval': return <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />;
    case 'alert': return <Radio size={12} className="text-amber-500 shrink-0 mt-0.5" />;
    case 'chat': return <MessageSquare size={12} className="text-blue-400 shrink-0 mt-0.5" />;
    case 'simulation': return <Activity size={12} className="text-slate-500 shrink-0 mt-0.5" />;
    case 'incident': return <ShieldAlert size={12} className="text-red-500 shrink-0 mt-0.5" />;
    default: return <Clock size={12} className="text-slate-500 shrink-0 mt-0.5" />;
  }
};

export default function OperationLog() {
  const timeline = useSimulationStore(state => state.incident.timeline);

  return (
    <div className="flex flex-col border-t border-slate-800 bg-slate-950" style={{ minHeight: '160px', maxHeight: '220px' }}>
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-900 flex items-center h-10 shrink-0">
        <h2 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
          <Clock size={12} className="text-slate-500" />
          Operation Log
          <span className="ml-auto font-mono text-slate-600">{timeline.length} events</span>
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col-reverse">
          {[...timeline].reverse().map(event => (
            <div key={event.id} className="flex items-start gap-2.5 px-4 py-2.5 border-b border-slate-800/50 text-[11px] hover:bg-slate-900/40 transition-colors">
              {eventIcon(event.type)}
              <div className="min-w-0 flex-1">
                <span className="text-slate-300 leading-snug break-words font-medium">{event.message}</span>
              </div>
              <span className="text-[9px] font-mono text-slate-600 shrink-0 mt-0.5">{event.timestamp}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
