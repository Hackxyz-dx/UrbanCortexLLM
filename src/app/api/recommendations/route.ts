/**
 * POST /api/recommendations
 *
 * Accepts the full IncidentState and existing LLM recommendations from the
 * frontend store. Runs the LLM recommendation pipeline and returns a
 * structured LLMRecommendationOutput.
 *
 * Request body (JSON):
 * {
 *   incident:         IncidentState           // full incident state from Zustand
 *   llmRecommendations?: LLMRecommendation[]  // existing recs (to avoid duplicates)
 * }
 *
 * Response:
 * {
 *   success:    boolean
 *   output:     LLMRecommendationOutput
 *   generatedAt: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateLLMRecommendations } from '@/lib/llm/recommendations';
import type { IncidentState } from '@/data/mockIncident';
import type { LLMRecommendation } from '@/types/llm';

interface RecommendationsRequestBody {
  incident: IncidentState;
  llmRecommendations?: LLMRecommendation[];
}

export async function POST(req: NextRequest) {
  let body: RecommendationsRequestBody;
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
    const output = await generateLLMRecommendations(incident, llmRecommendations);

    return NextResponse.json({
      success: true,
      output,
      generatedAt: output.generatedAt,
    });
  } catch (err) {
    console.error('[POST /api/recommendations] Unhandled error:', err);
    return NextResponse.json(
      { success: false, error: 'Recommendation generation failed. Check server logs.' },
      { status: 500 },
    );
  }
}
