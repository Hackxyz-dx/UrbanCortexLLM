'use client';

import { useSimulationStore } from '@/lib/store';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Route, TrafficCone, ShieldAlert, Cpu } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function AIRecommendations() {
  const { incident, updateRecommendationStatus } = useSimulationStore();
  const pendingRecs = incident.recommendations.filter(r => r.status === 'pending');
  const activeRecs = incident.recommendations.filter(r => r.status === 'approved');

  const getIcon = (type: string) => {
    switch (type) {
      case 'diversion': return <Route size={16} className="text-blue-400" />;
      case 'signal-timing': return <TrafficCone size={16} className="text-orange-400" />;
      case 'emergency-corridor': return <ShieldAlert size={16} className="text-green-400" />;
      default: return <Cpu size={16} />;
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800 rounded-lg shadow-sm flex flex-col h-full flex-1">
      <CardHeader className="p-3 border-b border-neutral-800 bg-neutral-900/80 sticky top-0 z-10">
        <CardTitle className="text-xs font-bold text-neutral-300 uppercase flex flex-col gap-1">
          <div className="flex items-center justify-between w-full">
            <span>Tactical Recommendations</span>
            <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 text-[10px] uppercase font-mono tracking-widest border-cyan-500/20">
              {pendingRecs.length} Actionable
            </Badge>
          </div>
          <CardDescription className="text-[10px] text-neutral-500 max-w-sm mt-1">
            Simulation-backed action plans generated based on current network node congestion.
          </CardDescription>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full p-3">
          <div className="flex flex-col gap-3 pb-3">
            {pendingRecs.length === 0 && (
              <div className="text-xs text-neutral-500 text-center py-4 italic">No pending recommendations.</div>
            )}
            
            {pendingRecs.map(rec => (
              <div key={rec.id} className="border border-neutral-800 rounded-md bg-neutral-950/50 p-3 hover:bg-neutral-800/20 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getIcon(rec.type)}
                    <h4 className="text-xs font-bold text-neutral-200">{rec.title}</h4>
                  </div>
                  <Badge variant="outline" className="text-[9px] bg-neutral-900 border-neutral-700 text-neutral-400 font-mono">
                    Conf: {(rec.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>
                
                <p className="text-xs text-neutral-400 mb-2">{rec.description}</p>
                
                <div className="bg-neutral-900 rounded p-2 mb-3 border border-neutral-800/50">
                  <p className="text-[10px] text-neutral-500 italic mb-1"><span className="font-semibold text-neutral-400 non-italic">Reasoning:</span> {rec.reasoning}</p>
                  <p className="text-[10px] text-cyan-500/80 font-medium"><span className="text-neutral-500">Impact preview:</span> {rec.expectedImpact}</p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs bg-neutral-900 border-neutral-700 hover:bg-neutral-800 hover:text-white"
                    onClick={() => updateRecommendationStatus(rec.id, 'rejected')}
                  >
                    Dismiss
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-7 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                    onClick={() => updateRecommendationStatus(rec.id, 'approved')}
                  >
                    Approve Action
                  </Button>
                </div>
              </div>
            ))}
            
            {activeRecs.length > 0 && (
              <div className="mt-2 pt-2 border-t border-neutral-800">
                <h5 className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-2">Active Measures</h5>
                {activeRecs.map(rec => (
                  <div key={rec.id} className="flex items-center justify-between p-2 rounded bg-green-500/5 border border-green-500/10 mb-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-green-500" />
                      <span className="text-xs text-neutral-300 truncate max-w-[200px]">{rec.title}</span>
                    </div>
                    <span className="text-[9px] text-green-500/70 font-mono">Executing</span>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
