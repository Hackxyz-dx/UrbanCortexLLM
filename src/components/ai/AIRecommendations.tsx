'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Cpu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AIRecommendations() {
  const { incident, updateStrategyStatus } = useSimulationStore();
  const pendingStrats = incident.strategies.filter(s => s.status === 'pending');
  const activeStrats = incident.strategies.filter(s => s.status === 'approved');

  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm flex flex-col h-full flex-1">
      <CardHeader className="p-4 border-b border-neutral-800 bg-neutral-900/80 sticky top-0 z-10 pb-4 shadow-sm">
        <CardTitle className="text-sm font-bold text-neutral-200 uppercase flex items-center justify-between">
          <span className="flex items-center gap-2"><Cpu size={16} className="text-cyan-400" /> AI Tactics Generated</span>
          <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 text-[10px] uppercase font-mono tracking-widest border-cyan-500/20">
            {pendingStrats.length} Plans
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="h-full w-full p-4">
          <div className="flex flex-col gap-4">
            {activeStrats.map(strat => (
              <div key={strat.id} className="border border-green-500/30 rounded-lg bg-green-500/5 p-4 shadow-inner">
                 <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider">Active: {strat.name}</h4>
                 </div>
                 <p className="text-xs text-neutral-400 leading-relaxed">System is currently executing actions associated with this strategy via connected IoT controllers.</p>
              </div>
            ))}

            {pendingStrats.map(strat => (
              <div key={strat.id} className="border border-neutral-700 rounded-lg bg-neutral-950 p-4 shadow-sm hover:border-neutral-600 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold bg-cyan-900/50 text-cyan-400">
                      #{strat.rank}
                    </div>
                    <h4 className="text-sm font-bold text-white">{strat.name}</h4>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-neutral-900 border-neutral-700 text-neutral-400 font-mono">
                    Conf: {(strat.overallConfidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                
                <div className="mb-4">
                   <span className="text-[10px] uppercase tracking-wider text-cyan-500/70 mb-2 block font-semibold">Suggested Actions ({strat.actions.length})</span>
                   <ul className="space-y-3">
                      {strat.actions.map(a => (
                        <li key={a.id} className="bg-neutral-900 rounded p-3 border border-neutral-800">
                          <div className="text-xs font-bold text-neutral-200 mb-1">{a.title}</div>
                          <div className="text-[11px] text-neutral-400 mb-2">{a.description}</div>
                          <div className="flex items-start gap-2 text-[10px] text-neutral-500">
                            <span className="shrink-0 font-medium text-neutral-600">Impact:</span>
                            <span>{a.expectedImpact}</span>
                          </div>
                        </li>
                      ))}
                   </ul>
                </div>

                <div className="flex justify-end pt-2 border-t border-neutral-800 mt-2">
                  <Button size="sm" className="h-8 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium w-full" onClick={() => updateStrategyStatus(strat.id, 'approved')}>
                    Approve Strategy
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
