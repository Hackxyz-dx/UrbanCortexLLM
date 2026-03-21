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
    <Card className="bg-slate-900/60 backdrop-blur-md border-slate-700/50 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col h-full flex-1 overflow-hidden transition-all hover:border-slate-600/60">
      <CardHeader className="p-5 border-b border-slate-700/50 bg-slate-800/40 sticky top-0 z-10">
        <CardTitle className="text-sm font-bold text-slate-200 uppercase flex flex-wrap items-center justify-between tracking-wide gap-3">
          <span className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
              <Cpu size={16} className="text-cyan-400" />
            </div>
            AI Tactics Generated
          </span>
          <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 text-[11px] uppercase font-mono tracking-widest border border-cyan-500/30 px-2 py-0.5 shadow-[0_0_10px_rgba(6,182,212,0.2)] shrink-0">
            {pendingStrats.length} Plans
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-slate-950/20">
        <ScrollArea className="h-full w-full p-5">
          <div className="flex flex-col gap-5">
            {activeStrats.map(strat => (
              <div key={strat.id} className="border border-green-500/40 rounded-xl bg-green-500/10 p-5 shadow-[0_0_15px_rgba(34,197,94,0.1)] relative overflow-hidden backdrop-blur-sm">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                 <div className="flex items-center gap-2.5 mb-2 relative z-10">
                    <CheckCircle2 size={18} className="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" />
                    <h4 className="text-sm font-bold text-green-300 uppercase tracking-wider">Active: {strat.name}</h4>
                 </div>
                 <p className="text-sm text-slate-300 leading-relaxed relative z-10 font-medium">System is currently executing actions associated with this strategy via connected IoT controllers.</p>
              </div>
            ))}

            {pendingStrats.map(strat => (
              <div key={strat.id} className="border border-slate-700/60 rounded-xl bg-slate-900/80 p-5 shadow-sm hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all group backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold bg-slate-800 border border-slate-700 text-cyan-400 group-hover:bg-cyan-900/40 group-hover:border-cyan-700/50 transition-colors shadow-inner shrink-0">
                      #{strat.rank}
                    </div>
                    <h4 className="text-base font-bold text-white tracking-tight break-words min-w-0">{strat.name}</h4>
                  </div>
                  <Badge variant="outline" className="text-xs bg-slate-950/50 border-slate-700 text-slate-300 font-mono font-semibold px-2 shrink-0">
                    Conf: {(strat.overallConfidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                
                <div className="mb-5 min-w-0">
                   <span className="text-[11px] uppercase tracking-widest text-cyan-500/80 mb-3 block font-bold">Suggested Actions ({strat.actions.length})</span>
                   <ul className="space-y-3 min-w-0">
                      {strat.actions.map(a => (
                        <li key={a.id} className="bg-slate-950/50 rounded-lg p-3.5 border border-slate-800/80 hover:border-slate-700 transition-colors max-w-full overflow-hidden">
                          <div className="text-sm font-bold text-slate-200 mb-1.5 break-words">{a.title}</div>
                          <div className="text-xs text-slate-400 mb-2.5 leading-relaxed break-words">{a.description}</div>
                          <div className="flex items-start gap-2 text-[11px] bg-slate-900/80 inline-flex px-2 py-1 rounded border border-slate-800 max-w-full overflow-hidden">
                            <span className="font-semibold text-slate-500 uppercase tracking-wider shrink-0 mt-0.5">Impact:</span>
                            <span className="text-slate-300 font-medium break-words min-w-0">{a.expectedImpact}</span>
                          </div>
                        </li>
                      ))}
                   </ul>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800/80 mt-2">
                  <Button size="sm" className="h-10 text-sm bg-cyan-600/90 hover:bg-cyan-500 text-white font-semibold w-full rounded-lg shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all border border-cyan-400/50" onClick={() => updateStrategyStatus(strat.id, 'approved')}>
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
