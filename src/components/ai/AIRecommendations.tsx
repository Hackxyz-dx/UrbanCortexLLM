'use client';

import { useSimulationStore } from '@/lib/store';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, Navigation, AlertTriangle, Info, RotateCcw } from 'lucide-react';

export default function AIRecommendations() {
  const { incident, updateStrategyStatus } = useSimulationStore();
  const { isLoading, error, recommendation, meta, refresh } = useRecommendations();

  const pendingStrats = incident.strategies.filter(s => s.status === 'pending');
  const activeStrats  = incident.strategies.filter(s => s.status === 'approved');

  return (
    <Card className="bg-slate-950 border-0 rounded-none flex flex-col flex-1 overflow-hidden">
      <CardHeader className="px-4 py-3 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
        <CardTitle className="text-[11px] font-bold text-slate-300 uppercase flex flex-wrap items-center justify-between tracking-wide gap-2">
          <span className="text-slate-400">Decision Support</span>
          <div className="flex items-center gap-2">
            {isLoading && (
              <span className="text-[9px] text-slate-600 font-mono uppercase animate-pulse">Fetching…</span>
            )}
            <button onClick={refresh} title="Refresh recommendations" className="text-slate-600 hover:text-slate-400 transition-colors">
              <RotateCcw size={11} />
            </button>
            <Badge variant="secondary" className="bg-slate-800 text-slate-400 text-[9px] uppercase font-mono tracking-widest border border-slate-700 px-1.5 py-0 rounded-sm">
              {pendingStrats.length} Pending
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-slate-950">
        <ScrollArea className="h-full w-full p-4">
          <div className="flex flex-col gap-4">

            {/* ── Live backend recommendation ────────────────────────────── */}
            {!isLoading && !error && recommendation && (
              <div className="flex flex-col gap-3">

                {/* Diversion card */}
                {recommendation.diversion && (
                  <div className="border border-blue-900/50 bg-blue-950/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation size={13} className="text-blue-400 shrink-0" />
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Recommended Diversion
                      </span>
                      <span className="ml-auto text-[9px] font-mono text-slate-600">
                        {(recommendation.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <div className="text-[13px] font-bold text-slate-200 mb-1">
                      {recommendation.diversion.routeLabel}
                    </div>
                    <div className="flex gap-4 mb-3 text-[10px] font-mono text-slate-400">
                      <span>{recommendation.diversion.distanceKm} km</span>
                      <span>{Math.round(recommendation.diversion.estimatedTimeSec / 60)} min est.</span>
                      {meta && <span className="text-slate-600">{meta.road}</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-2">
                      {recommendation.diversion.reason}
                    </div>
                  </div>
                )}

                {/* Operational explanation */}
                <div className="border border-slate-800 bg-slate-900 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={12} className="text-slate-500 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Operational Assessment
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {recommendation.explanation}
                  </p>
                </div>

                {/* Public alert summary */}
                <div className="border border-amber-900/40 bg-amber-950/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={12} className="text-amber-500 shrink-0" />
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                      Alert Summary
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-200/70 leading-relaxed font-mono">
                    {recommendation.alertSummary}
                  </p>
                </div>
              </div>
            )}

            {/* ── Error state ────────────────────────────────────────────── */}
            {error && (
              <div className="border border-red-900/40 bg-red-950/20 p-4 text-[11px] text-red-400">
                {error}
              </div>
            )}

            {/* ── Approved strategies from store ────────────────────────── */}
            {activeStrats.map(strat => (
              <div key={strat.id} className="border-l-2 border-emerald-600 bg-slate-900 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">
                    Active: {strat.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
                  IoT control sequences linked to this strategy are currently engaged.
                </p>
              </div>
            ))}

            {/* ── Pending strategies from store (approve/reject) ─────────── */}
            {pendingStrats.map(strat => (
              <div key={strat.id} className="border border-slate-800 bg-slate-900 p-4">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] font-mono font-bold text-blue-400 bg-blue-950/50 px-1.5 py-0.5 rounded-sm">
                      #{strat.rank}
                    </div>
                    <h4 className="text-sm font-bold text-slate-200 tracking-tight">{strat.name}</h4>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex flex-col items-end shrink-0">
                    <span className="uppercase tracking-widest text-slate-600 text-[8px]">Confidence</span>
                    <span>{(strat.overallConfidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {strat.actions.map(a => (
                    <li key={a.id} className="bg-slate-950/50 p-2.5 border border-slate-800/80">
                      <div className="text-[11px] font-bold text-slate-300 mb-1">{a.title}</div>
                      <div className="text-[11px] text-slate-500 mb-1 leading-snug">{a.description}</div>
                      <div className="flex gap-2 text-[10px]">
                        <span className="font-bold text-slate-600 uppercase tracking-wider shrink-0">Impact:</span>
                        <span className="text-slate-400">{a.expectedImpact}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <Button
                    size="sm"
                    className="h-8 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded-sm transition-colors"
                    onClick={() => updateStrategyStatus(strat.id, 'approved')}
                  >
                    Approve &amp; Execute
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
