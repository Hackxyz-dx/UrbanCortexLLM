/**
 * POST /api/chat
 *
 * Accepts an officer query with the full live IncidentState and LLM
 * recommendation state. Runs the LLM chat pipeline and returns an
 * operational answer.
 *
 * Request body (JSON):
 * {
 *   query:             string
 *   incident:          IncidentState
 *   llmRecommendations?: LLMRecommendation[]
 *   recentMessages?:   { role: 'user'|'system', text: string }[]
 * }
 *
 * Response:
 * { success: boolean, answer: string, source: string, timestamp: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateLLMChatAnswer } from '@/lib/llm/chat';
import type { IncidentState } from '@/data/mockIncident';
import type { LLMRecommendation } from '@/types/llm';

interface ChatRequestBody {
  query: string;
  incident: IncidentState;
  llmRecommendations?: LLMRecommendation[];
  recentMessages?: { role: 'user' | 'system'; text: string }[];
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { query, incident, llmRecommendations = [], recentMessages = [] } = body;

  if (!query?.trim()) {
    return NextResponse.json({ success: false, error: 'query is required.' }, { status: 400 });
  }
  if (!incident?.id) {
    return NextResponse.json({ success: false, error: 'incident is required.' }, { status: 400 });
  }

  try {
    const result = await generateLLMChatAnswer(incident, llmRecommendations, query, recentMessages);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      source: result.source,
      timestamp: result.timestamp,
    });
  } catch (err) {
    console.error('[POST /api/chat] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Chat processing failed. Check server logs.' },
      { status: 500 },
    );
  }
}
