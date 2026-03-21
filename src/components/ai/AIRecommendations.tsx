'use client';

import { useSimulationStore } from '@/lib/store';
import { useRecommendations } from '@/hooks/useRecommendations';
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
    <div className="flex flex-col flex-1 overflow-hidden bg-white">
      {/* ── Sub-header actions ────────────────────────────────────────── */}
      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
          {isLoading ? (
            <span className="uppercase tracking-widest text-[10px] animate-pulse">Running analysis...</span>
          ) : (
            <span className="uppercase tracking-widest text-[10px]">Model ready</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} title="Re-run analysis" className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 focus:outline-none">
            <RotateCcw size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Refresh</span>
          </button>
          <Badge variant="secondary" className="bg-white text-slate-600 text-[10px] uppercase font-bold tracking-widest border border-slate-200 px-2.5 py-0.5 rounded-sm shadow-sm">
            {pendingStrats.length} Pending
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-5">
        <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">

          {/* ── Live backend recommendation ────────────────────────────── */}
          {!isLoading && !error && recommendation && (
            <div className="flex flex-col gap-3">

              {/* Diversion card */}
              {recommendation.diversion && (
                <div className="border border-blue-200 bg-blue-50/50 rounded-md p-4 w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation size={16} className="text-blue-600 shrink-0" />
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-widest">
                      Recommended Diversion
                    </span>
                    <span className="ml-auto text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-sm">
                      {(recommendation.confidence * 100).toFixed(0)}% Conf.
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-800 mb-1.5 leading-snug break-words pr-2">
                    {recommendation.diversion.routeLabel}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-semibold text-slate-500">
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-sm shadow-sm">{recommendation.diversion.distanceKm} km</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-sm shadow-sm text-slate-700">{Math.round(recommendation.diversion.estimatedTimeSec / 60)} min est.</span>
                    {meta && <span className="text-slate-400 truncate ...">{meta.road}</span>}
                  </div>
                  <div className="text-sm text-slate-600 leading-relaxed border-t border-blue-200/60 pt-3">
                    {recommendation.diversion.reason}
                  </div>
                </div>
              )}

              {/* Operational explanation */}
              <div className="border border-slate-200 bg-white rounded-md p-4 shadow-sm w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-slate-400 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    Operational Assessment
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {recommendation.explanation}
                </p>
              </div>

              {/* Public alert summary */}
              <div className="border border-amber-200 bg-amber-50 rounded-md p-4 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                    Alert Summary
                  </span>
                </div>
                <p className="text-sm text-amber-800 leading-relaxed font-mono font-medium">
                  "{recommendation.alertSummary}"
                </p>
              </div>
            </div>
          )}

          {/* ── Error state ────────────────────────────────────────────── */}
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-600 rounded-md p-4 text-sm font-medium">
              {error}
            </div>
          )}

          {/* ── Approved strategies from store ────────────────────────── */}
          {activeStrats.length > 0 && (
            <div className="pt-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Active Operations</h3>
              {activeStrats.map(strat => (
                <div key={strat.id} className="border border-emerald-200 bg-emerald-50 rounded-md p-4 mb-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {strat.name}
                    </h4>
                  </div>
                  <p className="text-sm text-emerald-700/80 leading-relaxed ml-6">
                    IoT control sequences linked to this strategy are currently engaged and active.
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Pending strategies from store (approve/reject) ─────────── */}
          {pendingStrats.length > 0 && (
            <div className="pt-2">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Pending Executive Action</h3>
              {pendingStrats.map(strat => (
                <div key={strat.id} className="border border-slate-200 bg-white rounded-md shadow-sm p-5 mb-4 overflow-hidden w-full">
                  <div className="flex flex-wrap justify-between items-start mb-4 gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded border border-blue-200 shrink-0">
                        OP-{strat.rank}
                      </div>
                      <h4 className="text-base font-bold text-slate-800 tracking-tight leading-snug break-words">
                        {strat.name}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-500 font-mono flex flex-col items-end shrink-0">
                      <span className="uppercase tracking-widest text-slate-400 text-[9px] mb-0.5">Rating</span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{(strat.overallConfidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    {strat.actions.map(a => (
                      <div key={a.id} className="bg-slate-50 p-4 rounded border border-slate-100 w-full overflow-hidden">
                        <div className="text-sm font-bold text-slate-700 mb-1.5">{a.title}</div>
                        <div className="text-sm text-slate-600 mb-2 leading-relaxed">{a.description}</div>
                        <div className="flex gap-2 text-xs items-center bg-white border border-slate-200 px-3 py-1.5 rounded w-fit max-w-full">
                          <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0">Impact:</span>
                          <span className="text-slate-700 font-medium truncate">{a.expectedImpact}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button
                      size="lg"
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded shadow-sm hover:shadow transition-all"
                      onClick={() => updateStrategyStatus(strat.id, 'approved')}
                    >
                      Authorize &amp; Execute
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  );
}
