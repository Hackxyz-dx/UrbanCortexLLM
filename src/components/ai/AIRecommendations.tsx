'use client';

import { useEffect } from 'react';
import { useSimulationStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2, Navigation, AlertTriangle, Info, RotateCcw,
  XCircle, Zap, Clock, ShieldCheck, Radio
} from 'lucide-react';
import type { LLMRecommendation } from '@/types/llm';

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LLMRecommendation['status'] }) {
  const styles: Record<typeof status, string> = {
    suggested:  'bg-blue-50 text-blue-700 border-blue-200',
    approved:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    active:     'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse',
    rejected:   'bg-red-50 text-red-600 border-red-200',
    completed:  'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${styles[status]}`}>
      {status}
    </span>
  );
}

// ─── Recommendation type icon ─────────────────────────────────────────────────

function TypeIcon({ type }: { type: LLMRecommendation['type'] }) {
  switch (type) {
    case 'diversion':         return <Navigation size={16} className="text-blue-600 shrink-0" />;
    case 'signal-timing':     return <Zap size={16} className="text-amber-500 shrink-0" />;
    case 'public-alert':      return <Radio size={16} className="text-orange-500 shrink-0" />;
    case 'emergency-corridor': return <ShieldCheck size={16} className="text-red-600 shrink-0" />;
    case 'lane-management':   return <Clock size={16} className="text-slate-500 shrink-0" />;
    default:                  return <Info size={16} className="text-slate-400 shrink-0" />;
  }
}

// ─── Single recommendation card ───────────────────────────────────────────────

function RecommendationCard({ rec }: { rec: LLMRecommendation }) {
  const { approveRecommendation, rejectRecommendation, markRecommendationActive, completeRecommendation } = useSimulationStore();
  const isSuggested = rec.status === 'suggested';
  const isApproved  = rec.status === 'approved';
  const isActive    = rec.status === 'active';
  const isDone      = rec.status === 'completed' || rec.status === 'rejected';

  return (
    <div className={`border rounded-lg p-5 mb-4 w-full transition-colors ${
      isActive    ? 'border-emerald-300 bg-emerald-50/50' :
      isApproved  ? 'border-blue-200 bg-blue-50/30' :
      isDone      ? 'border-slate-100 bg-slate-50 opacity-60' :
                    'border-slate-200 bg-white shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <TypeIcon type={rec.type} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {rec.type.replace('-', ' ')}
            </span>
            <StatusBadge status={rec.status} />
          </div>
          <h4 className="text-base font-bold text-slate-800 leading-snug">{rec.title}</h4>
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded shrink-0">
          {(rec.confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Body */}
      <p className="text-sm text-slate-600 leading-relaxed mb-2">{rec.description}</p>
      <div className="bg-slate-50 border border-slate-100 rounded px-4 py-2.5 mb-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Impact: </span>
        <span className="text-sm text-slate-700">{rec.expectedImpact}</span>
      </div>

      {/* Reasoning */}
      <details className="mb-4">
        <summary className="text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:text-slate-600 transition-colors">
          Reasoning
        </summary>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed pl-2 border-l-2 border-slate-100">{rec.reasoning}</p>
      </details>

      {/* Action buttons */}
      {!isDone && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {isSuggested && (
            <>
              <Button
                size="sm"
                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 rounded shadow-sm"
                onClick={() => approveRecommendation(rec.id)}
              >
                <CheckCircle2 size={14} className="mr-1.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-bold px-5 rounded"
                onClick={() => rejectRecommendation(rec.id)}
              >
                <XCircle size={14} className="mr-1.5" />
                Reject
              </Button>
            </>
          )}
          {isApproved && (
            <>
              <Button
                size="sm"
                className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 rounded shadow-sm"
                onClick={() => markRecommendationActive(rec.id)}
              >
                <Zap size={14} className="mr-1.5" />
                Mark Active
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs text-slate-600 border-slate-200 hover:bg-slate-100 font-bold px-5 rounded"
                onClick={() => rejectRecommendation(rec.id)}
              >
                <XCircle size={14} className="mr-1.5" />
                Reject
              </Button>
            </>
          )}
          {isActive && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-bold px-5 rounded"
              onClick={() => completeRecommendation(rec.id)}
            >
              <CheckCircle2 size={14} className="mr-1.5" />
              Mark Completed
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function AIRecommendations() {
  const {
    incident,
    updateStrategyStatus,
    llmRecommendations,
    llmRecsLoading,
    llmRecsError,
    llmExplanation,
    llmConfidence,
    llmCautionNote,
    fetchLLMRecommendations,
  } = useSimulationStore();

  // Auto-fetch on mount
  useEffect(() => {
    fetchLLMRecommendations();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const activeStrats  = incident.strategies.filter(s => s.status === 'approved');
  const pendingStrats = incident.strategies.filter(s => s.status === 'pending');

  const suggestedRecs = llmRecommendations.filter(r => r.status === 'suggested');
  const activeRecs    = llmRecommendations.filter(r => r.status === 'active' || r.status === 'approved');
  const completedRecs = llmRecommendations.filter(r => r.status === 'completed' || r.status === 'rejected');

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white min-h-0">
      {/* ── Sub-header ────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          {llmRecsLoading ? (
            <span className="uppercase tracking-widest text-xs animate-pulse text-blue-600">Running LLM analysis…</span>
          ) : (
            <span className="uppercase tracking-widest text-xs text-slate-400">
              {llmRecommendations.length > 0 ? `LLM · ${llmRecommendations.length} rec` : 'Model ready'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchLLMRecommendations}
            disabled={llmRecsLoading}
            title="Re-run LLM analysis"
            className="text-slate-500 hover:text-blue-700 transition-colors flex items-center gap-2 focus:outline-none disabled:opacity-40"
          >
            <RotateCcw size={16} className={llmRecsLoading ? 'animate-spin' : ''} />
            <span className="text-xs font-bold uppercase tracking-widest">Refresh</span>
          </button>
          <Badge variant="secondary" className="bg-white text-slate-700 text-xs uppercase font-bold tracking-widest border border-slate-200 px-3 py-1 rounded shadow-sm">
            {suggestedRecs.length} Pending
          </Badge>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <ScrollArea className="h-full w-full p-6">
            <div className="flex flex-col gap-5 w-full max-w-full overflow-hidden">

              {/* ── Error ─────────────────────────────────────────────────── */}
              {llmRecsError && (
                <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4 text-sm font-medium">
                  {llmRecsError}
                </div>
              )}

              {/* ── LLM Explanation ───────────────────────────────────────── */}
              {!llmRecsLoading && llmExplanation && (
                <div className="border border-slate-200 bg-white rounded-lg p-5 shadow-sm w-full">
                  <div className="flex items-center gap-2 mb-3">
                    <Info size={16} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Operational Assessment</span>
                    {llmConfidence !== null && (
                      <span className="ml-auto text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {(llmConfidence * 100).toFixed(0)}% overall
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{llmExplanation}</p>
                  {llmCautionNote && (
                    <div className="mt-3 flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed">{llmCautionNote}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── LLM Suggestions ───────────────────────────────────────── */}
              {suggestedRecs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">
                    LLM Recommendations · Pending Action
                  </h3>
                  {suggestedRecs.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
                </div>
              )}

              {/* ── Active / Approved LLM Recs ────────────────────────────── */}
              {activeRecs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-3 mb-4">
                    LLM Recommendations · Active
                  </h3>
                  {activeRecs.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
                </div>
              )}

              {/* ── Active Strategies (legacy)  ───────────────────────────── */}
              {activeStrats.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">Pre-loaded Tactics · Active</h3>
                  {activeStrats.map(strat => (
                    <div key={strat.id} className="border border-emerald-200 bg-emerald-50 rounded-lg p-5 mb-4">
                      <div className="flex items-center gap-2.5 mb-2">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">{strat.name}</h4>
                      </div>
                      <p className="text-sm text-emerald-700/80 leading-relaxed ml-7">
                        IoT control sequences linked to this strategy are currently engaged.
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Pending Tactics (legacy: approve/reject) ──────────────── */}
              {pendingStrats.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">Pre-loaded Tactics · Pending</h3>
                  {pendingStrats.map(strat => (
                    <div key={strat.id} className="border border-slate-200 bg-white rounded-lg shadow-sm p-6 mb-5">
                      <div className="flex flex-wrap justify-between items-start mb-5 gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="text-sm font-mono font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded border border-blue-200 shrink-0 mt-0.5">
                            OP-{strat.rank}
                          </div>
                          <h4 className="text-base font-bold text-slate-800 leading-snug">{strat.name}</h4>
                        </div>
                        <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded text-sm shrink-0">
                          {(strat.overallConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="space-y-4 mb-6">
                        {strat.actions.map(a => (
                          <div key={a.id} className="bg-slate-50 p-4 rounded border border-slate-100">
                            <div className="text-sm font-bold text-slate-700 mb-1">{a.title}</div>
                            <div className="text-sm text-slate-600 leading-relaxed mb-2">{a.description}</div>
                            <div className="flex gap-2 text-xs items-center bg-white border border-slate-200 px-3 py-1.5 rounded w-fit">
                              <span className="font-bold text-slate-500 uppercase tracking-wider">Impact:</span>
                              <span className="text-slate-700">{a.expectedImpact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button
                          size="sm"
                          className="text-sm h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded shadow-sm"
                          onClick={() => updateStrategyStatus(strat.id, 'approved')}
                        >
                          Authorize & Execute
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Completed / rejected ──────────────────────────────────── */}
              {completedRecs.length > 0 && (
                <details className="mt-2">
                  <summary className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer select-none hover:text-slate-600 transition-colors">
                    Completed / Rejected ({completedRecs.length})
                  </summary>
                  <div className="mt-3">
                    {completedRecs.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
                  </div>
                </details>
              )}

              {/* ── Empty state ────────────────────────────────────────────── */}
              {!llmRecsLoading && llmRecommendations.length === 0 && !llmRecsError && (
                <div className="text-center text-slate-400 py-12">
                  <Info size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Click Refresh to generate LLM recommendations.</p>
                </div>
              )}

            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
