/**
 * POST /api/alerts
 *
 * Accepts the full IncidentState and generates LLM-drafted public alert
 * messages for VMS, social media, and SMS channels.
 *
 * Request body (JSON):
 * {
 *   incident:          IncidentState
 *   llmRecommendations?: LLMRecommendation[]
 * }
 *
 * Response:
 * {
 *   success:    boolean
 *   drafts:     LLMAlertDrafts
 *   generatedAt: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateLLMAlerts } from '@/lib/llm/alerts';
import type { IncidentState } from '@/data/mockIncident';
import type { LLMRecommendation } from '@/types/llm';

interface AlertsRequestBody {
  incident: IncidentState;
  llmRecommendations?: LLMRecommendation[];
}

export async function POST(req: NextRequest) {
  let body: AlertsRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { incident, llmRecommendations = [] } = body;

  if (!incident?.id) {
    return NextResponse.json(
      { success: false, error: 'incident is required in request body.' },
      { status: 400 },
    );
  }

  try {
    const drafts = await generateLLMAlerts(incident, llmRecommendations);

    return NextResponse.json({
      success: true,
      drafts,
      generatedAt: drafts.generatedAt,
    });
  } catch (err) {
    console.error('[POST /api/alerts] Unhandled error:', err);
    return NextResponse.json(
      { success: false, error: 'Alert generation failed. Check server logs.' },
      { status: 500 },
    );
  }
}
