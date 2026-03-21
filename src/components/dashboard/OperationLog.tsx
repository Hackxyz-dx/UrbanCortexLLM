'use client';

import { useSimulationStore } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Radio, CheckCircle2, MessageSquare, ShieldAlert, Activity } from 'lucide-react';
import type { TimelineEvent } from '@/data/mockIncident';

const eventIcon = (type: TimelineEvent['type']) => {
  switch (type) {
    case 'approval': return <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />;
    case 'alert': return <Radio size={14} className="text-amber-600 shrink-0 mt-0.5" />;
    case 'chat': return <MessageSquare size={14} className="text-blue-600 shrink-0 mt-0.5" />;
    case 'simulation': return <Activity size={14} className="text-slate-400 shrink-0 mt-0.5" />;
    case 'incident': return <ShieldAlert size={14} className="text-red-500 shrink-0 mt-0.5" />;
    default: return <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />;
  }
};

export default function OperationLog() {
  const timeline = useSimulationStore(state => state.incident.timeline);

  return (
    <div className="flex flex-col h-full bg-white flex-1 overflow-hidden">
      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center h-11 shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
          <Clock size={14} className="text-slate-400" />
          Operation Log
          <span className="ml-auto font-mono text-slate-400">{timeline.length} events</span>
        </h2>
      </div>
      <ScrollArea className="flex-1 w-full bg-slate-50">
        <div className="flex flex-col-reverse p-2">
          {[...timeline].reverse().map(event => (
            <div key={event.id} className="flex items-start gap-3 px-4 py-3 border-b border-slate-100/50 text-sm bg-white mb-1.5 rounded-md shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
              {eventIcon(event.type)}
              <div className="min-w-0 flex-1">
                <span className="text-slate-700 leading-snug break-words font-medium">{event.message}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded">{event.timestamp}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
