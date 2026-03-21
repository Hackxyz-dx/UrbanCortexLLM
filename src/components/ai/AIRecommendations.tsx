'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AIRecommendations() {
  const { incident, updateStrategyStatus } = useSimulationStore();
  const pendingStrats = incident.strategies.filter(s => s.status === 'pending');
  const activeStrats = incident.strategies.filter(s => s.status === 'approved');

  return (
    <Card className="bg-slate-950 border-0 rounded-none flex flex-col h-full flex-1 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <CardTitle className="text-[11px] font-bold text-slate-300 uppercase flex flex-wrap items-center justify-between tracking-wide gap-3">
          <span className="flex items-center gap-2 text-slate-400">
            Decision Support Items
          </span>
          <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[9px] uppercase font-mono tracking-widest border border-slate-700 px-1.5 py-0 rounded-sm shrink-0">
            {pendingStrats.length} Pending
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-slate-950">
        <ScrollArea className="h-full w-full p-4">
          <div className="flex flex-col gap-4">
            {activeStrats.map(strat => (
              <div key={strat.id} className="border-l-2 border-emerald-600 bg-slate-900 p-4 relative overflow-hidden">
                 <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">Active: {strat.name}</h4>
                 </div>
                 <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-2">IoT control sequences linked to this strategy are currently engaged.</p>
              </div>
            ))}

            {pendingStrats.map(strat => (
              <div key={strat.id} className="border border-slate-800 bg-slate-900 p-4 transition-colors">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] font-mono font-bold text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded-sm">
                      #{strat.rank}
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 tracking-tight break-words min-w-0">{strat.name}</h4>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex flex-col items-end shrink-0">
                    <span className="uppercase tracking-widest text-slate-600 text-[8px]">Confidence</span>
                    <span>{(strat.overallConfidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="mb-4">
                   <span className="text-[9px] uppercase tracking-widest text-slate-500 mb-2 block font-bold border-b border-slate-800 pb-1">Recommended Actions</span>
                   <ul className="space-y-2 mt-2">
                      {strat.actions.map(a => (
                        <li key={a.id} className="bg-slate-950/50 p-2.5 border border-slate-800/80 rounded-sm">
                          <div className="text-[11px] font-bold text-slate-300 mb-1 break-words">{a.title}</div>
                          <div className="text-[11px] text-slate-500 mb-2 leading-snug break-words">{a.description}</div>
                          <div className="flex items-start gap-2 text-[10px]">
                            <span className="font-bold text-slate-600 uppercase tracking-wider shrink-0">Impact:</span>
                            <span className="text-slate-400 font-medium break-words min-w-0">{a.expectedImpact}</span>
                          </div>
                        </li>
                      ))}
                   </ul>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <Button size="sm" className="h-8 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded-sm transition-colors" onClick={() => updateStrategyStatus(strat.id, 'approved')}>
                    Approve & Execute
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
