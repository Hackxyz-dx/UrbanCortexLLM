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
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          {isLoading ? (
            <span className="uppercase tracking-widest text-xs animate-pulse">Running analysis...</span>
          ) : (
            <span className="uppercase tracking-widest text-xs">Model ready</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={refresh} title="Re-run analysis" className="text-slate-500 hover:text-blue-700 transition-colors flex items-center gap-2 focus:outline-none">
            <RotateCcw size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Refresh</span>
          </button>
          <Badge variant="secondary" className="bg-white text-slate-700 text-xs uppercase font-bold tracking-widest border border-slate-200 px-3 py-1 rounded shadow-sm">
            {pendingStrats.length} Pending
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 w-full p-6">
        <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">

          {/* ── Live backend recommendation ────────────────────────────── */}
          {!isLoading && !error && recommendation && (
            <div className="flex flex-col gap-4">

              {/* Diversion card */}
              {recommendation.diversion && (
                <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-5 w-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Navigation size={18} className="text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-widest">
                      Recommended Diversion
                    </span>
                    <span className="ml-auto text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded">
                      {(recommendation.confidence * 100).toFixed(0)}% Conf.
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-800 mb-2.5 leading-snug break-words pr-2">
                    {recommendation.diversion.routeLabel}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm font-semibold text-slate-600">
                    <span className="bg-white border border-slate-200 px-3 py-1 rounded shadow-sm">{recommendation.diversion.distanceKm} km</span>
                    <span className="bg-white border border-slate-200 px-3 py-1 rounded shadow-sm text-slate-700">{Math.round(recommendation.diversion.estimatedTimeSec / 60)} min est.</span>
                    {meta && <span className="text-slate-500 truncate ...">{meta.road}</span>}
                  </div>
                  <div className="text-base text-slate-600 leading-relaxed border-t border-blue-200/60 pt-4">
                    {recommendation.diversion.reason}
                  </div>
                </div>
              )}

              {/* Operational explanation */}
              <div className="border border-slate-200 bg-white rounded-lg p-5 shadow-sm w-full">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={18} className="text-slate-400 shrink-0" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Operational Assessment
                  </span>
                </div>
                <p className="text-base text-slate-600 leading-relaxed">
                  {recommendation.explanation}
                </p>
              </div>

              {/* Public alert summary */}
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-5 w-full">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                    Alert Summary
                  </span>
                </div>
                <p className="text-base text-amber-900 leading-relaxed font-mono font-medium">
                  "{recommendation.alertSummary}"
                </p>
              </div>
            </div>
          )}

          {/* ── Error state ────────────────────────────────────────────── */}
          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-5 text-base font-medium">
              {error}
            </div>
          )}

          {/* ── Approved strategies from store ────────────────────────── */}
          {activeStrats.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">Active Operations</h3>
              {activeStrats.map(strat => (
                <div key={strat.id} className="border border-emerald-200 bg-emerald-50 rounded-lg p-5 mb-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {strat.name}
                    </h4>
                  </div>
                  <p className="text-base text-emerald-700/80 leading-relaxed ml-7">
                    IoT control sequences linked to this strategy are currently engaged and active.
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* ── Pending strategies from store (approve/reject) ─────────── */}
          {pendingStrats.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">Pending Executive Action</h3>
              {pendingStrats.map(strat => (
                <div key={strat.id} className="border border-slate-200 bg-white rounded-lg shadow-sm p-6 mb-5 overflow-hidden w-full">
                  <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-sm font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded border border-blue-200 shrink-0 mt-0.5">
                        OP-{strat.rank}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 tracking-tight leading-snug break-words">
                        {strat.name}
                      </h4>
                    </div>
                    <div className="text-sm text-slate-500 font-mono flex flex-col items-end shrink-0">
                      <span className="uppercase tracking-widest text-slate-400 text-[10px] mb-1">Rating</span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded text-sm">{(strat.overallConfidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {strat.actions.map(a => (
                      <div key={a.id} className="bg-slate-50 p-5 rounded border border-slate-100 w-full overflow-hidden">
                        <div className="text-base font-bold text-slate-700 mb-2">{a.title}</div>
                        <div className="text-base text-slate-600 mb-3 leading-relaxed">{a.description}</div>
                        <div className="flex gap-2.5 text-sm items-center bg-white border border-slate-200 px-4 py-2 rounded w-fit max-w-full">
                          <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0">Impact:</span>
                          <span className="text-slate-700 font-medium truncate">{a.expectedImpact}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-5 border-t border-slate-100">
                    <Button
                      size="lg"
                      className="text-base h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded shadow-sm hover:shadow transition-all"
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
