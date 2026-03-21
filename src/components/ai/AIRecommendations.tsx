'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldAlert, Cpu, GitCompare, Play, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function AIRecommendations() {
  const { incident, updateStrategyStatus } = useSimulationStore();
  const pendingStrats = incident.strategies.filter(s => s.status === 'pending');
  const activeStrats = incident.strategies.filter(s => s.status === 'approved');

  // What-If State
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);

  const simulateScenario = (type: string) => {
    setWhatIfLoading(true);
    setWhatIfResult(null);
    setTimeout(() => {
      setWhatIfResult({
        type,
        queueChange: type === 'delay' ? '+1.2 mi' : '-0.5 mi',
        delayChange: type === 'delay' ? '+15 mins' : '-5 mins',
        riskChange: type === 'delay' ? '+22%' : '-10%',
        summary: type === 'delay' 
          ? 'Delaying intervention causes significant queue spillback onto Market St.' 
          : 'Minor improvements expected, but does not solve mainline congestion.'
      });
      setWhatIfLoading(false);
    }, 1200);
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm flex flex-col h-full flex-1">
      <CardHeader className="p-3 border-b border-neutral-800 bg-neutral-900/80 sticky top-0 z-10 pb-0 shadow-sm">
        <CardTitle className="text-xs font-bold text-neutral-300 uppercase flex flex-col gap-1 mb-2">
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1.5"><Cpu size={14} className="text-cyan-400" /> Tactical Recommendations</span>
            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 text-[10px] uppercase font-mono tracking-widest border-cyan-500/20">
              {pendingStrats.length} Plans
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="tactical" className="flex-1 flex flex-col h-full">
          <TabsList className="bg-neutral-950 border-b border-neutral-800 w-full justify-start h-10 rounded-none px-2 shrink-0">
            <TabsTrigger value="tactical" className="text-[10px] uppercase tracking-wider data-[state=active]:bg-neutral-800"><Cpu size={10} className="mr-1" /> Strategies</TabsTrigger>
            <TabsTrigger value="whatif" className="text-[10px] uppercase tracking-wider data-[state=active]:bg-neutral-800"><GitCompare size={10} className="mr-1" /> What-If</TabsTrigger>
            <TabsTrigger value="lanes" className="text-[10px] uppercase tracking-wider data-[state=active]:bg-neutral-800"><ShieldAlert size={10} className="mr-1" /> Lanes</TabsTrigger>
          </TabsList>

          <TabsContent value="tactical" className="m-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full p-3">
              <div className="flex flex-col gap-4">
                {activeStrats.map(strat => (
                  <div key={strat.id} className="border border-green-500/20 rounded-md bg-green-500/5 p-3">
                     <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-green-500 animate-pulse" />
                        <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider">Active: {strat.name}</h4>
                     </div>
                     <p className="text-[10px] text-neutral-400">System is currently executing actions associated with this strategy via connected IoT controllers.</p>
                  </div>
                ))}

                {pendingStrats.map(strat => (
                  <div key={strat.id} className="border border-neutral-800 rounded-md bg-neutral-950/50 p-3 hover:bg-neutral-800/20 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                          {strat.rank}
                        </div>
                        <h4 className="text-xs font-bold text-neutral-200">{strat.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-neutral-900 border-neutral-700 text-neutral-400 font-mono">
                        Conf: {(strat.overallConfidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    
                    <div className="bg-neutral-900 rounded p-2 mb-3 border border-neutral-800/50 grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-neutral-500">Queue Impact</span>
                        <span className="text-[11px] font-mono text-green-400">{strat.metrics.queueReduction}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-neutral-500">Delay Impact</span>
                        <span className="text-[11px] font-mono text-green-400">{strat.metrics.delayReduction}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-neutral-500">Secondary Risk</span>
                        <span className="text-[11px] font-mono text-blue-400">{strat.metrics.secondaryCrashRisk}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase text-neutral-500">Complexity</span>
                        <span className="text-[11px] font-mono text-yellow-500">{strat.metrics.complexity}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                       <span className="text-[9px] uppercase tracking-wider text-neutral-500 mb-1 block">Included Actions ({strat.actions.length})</span>
                       <ul className="list-disc pl-4 text-[10px] text-neutral-400 flex flex-col gap-1">
                          {strat.actions.map(a => <li key={a.id}>{a.title}</li>)}
                       </ul>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button size="sm" className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium w-full" onClick={() => updateStrategyStatus(strat.id, 'approved')}>
                        Approve Strategy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="whatif" className="m-0 flex-1 overflow-hidden p-3 flex flex-col gap-4">
             <div className="text-xs text-neutral-400 mb-2 leading-relaxed">Ensure safe operational parameters by testing alternate network conditions against the live simulation matrix.</div>
             
             <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => simulateScenario('delay')} className="h-8 text-[10px] bg-neutral-950 border-neutral-800 justify-start hover:border-orange-500/50">
                   <Play size={10} className="mr-2 text-orange-500" /> Delay Divert 10m
                </Button>
                <Button variant="outline" size="sm" onClick={() => simulateScenario('freight')} className="h-8 text-[10px] bg-neutral-950 border-neutral-800 justify-start hover:border-cyan-500/50">
                   <Play size={10} className="mr-2 text-cyan-500" /> Sep. Freight
                </Button>
                <Button variant="outline" size="sm" onClick={() => simulateScenario('signals')} className="h-8 text-[10px] bg-neutral-950 border-neutral-800 justify-start hover:border-neutral-500/50">
                   <Play size={10} className="mr-2 text-neutral-500" /> No Signal Retime
                </Button>
             </div>

             {whatIfLoading && (
                <div className="flex-1 flex flex-col items-center justify-center text-cyan-500 animate-pulse text-xs gap-2">
                   <Cpu size={16} className="animate-spin" /> Running Simulation...
                </div>
             )}

             {whatIfResult && !whatIfLoading && (
                <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md p-3 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                   <h5 className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider mb-2 border-b border-neutral-800 pb-2">Simulation Outcome</h5>
                   <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-500">Queue Change:</span>
                      <span className={`font-mono ${whatIfResult.queueChange.includes('+') ? 'text-red-400' : 'text-green-400'}`}>{whatIfResult.queueChange}</span>
                   </div>
                   <div className="flex justify-between text-xs mb-1">
                      <span className="text-neutral-500">Delay Change:</span>
                      <span className={`font-mono ${whatIfResult.delayChange.includes('+') ? 'text-red-400' : 'text-green-400'}`}>{whatIfResult.delayChange}</span>
                   </div>
                   <div className="flex justify-between text-xs mb-3">
                      <span className="text-neutral-500">Risk Profile:</span>
                      <span className={`font-mono ${whatIfResult.riskChange.includes('+') ? 'text-red-400' : 'text-green-400'}`}>{whatIfResult.riskChange}</span>
                   </div>
                   <p className="text-[10px] text-neutral-400 italic bg-neutral-900 p-2 rounded leading-relaxed border border-neutral-800/50">{whatIfResult.summary}</p>
                </div>
             )}
          </TabsContent>

          <TabsContent value="lanes" className="m-0 flex-1 overflow-hidden p-3 flex flex-col gap-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 flex gap-3">
               <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Danger: 3 Lanes Blocked</span>
                  <p className="text-[10px] text-red-400/80 mt-1 leading-relaxed">First Responders actively operating in Lanes 1 & 2. Do not reopen without ground confirmation to avoid catastrophic risk.</p>
               </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              <Button disabled className="bg-neutral-950 border-neutral-800 text-neutral-600 justify-between h-10 w-full opacity-50 cursor-not-allowed">
                 Full Reopen <Badge className="bg-neutral-800 text-[9px] border-none text-neutral-500">LOCKED</Badge>
              </Button>
              <Button className="bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white justify-between h-10 w-full trasi">
                 Partial Open (Lane 4) <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-[9px] border-none">Marginal Risk</Badge>
              </Button>
            </div>
            
            <div className="mt-auto border-t border-neutral-800 pt-3">
              <p className="text-[9px] uppercase tracking-wide text-neutral-500 text-center flex items-center justify-center gap-1">
                 <ShieldAlert size={10} /> Lane rules updated via CCTV analysis 2m ago.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
