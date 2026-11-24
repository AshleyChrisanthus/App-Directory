import {
  ExtractedPageContext,
  ClassificationProgressEvent,
  ModelAuditEntry
} from './types';

export const GEMINI_DECISION_MODEL = 'gemini-decision-1';
const DECISIONS_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/decisions';
const MAX_DECISION_QUESTIONS = 1000;
const MAX_RECOMMENDED_TAGS = 5;
const DEFAULT_CONFIDENCE_THRESHOLD = 0.75;
const NEW_TAG_ROUTE_THRESHOLD = 0.5;

export interface DecisionQuestionResult {
  matchedTags: string[];
  needsNewTag: boolean;
  needsNewTagScore: number;
  tagScores: Record<string, number>;
  shouldRouteToGenerative: boolean;
  latencyMs: number;
  error?: string;
}

interface DecisionApiAnswer {
  type?: string;
  noul?: number;
  value?: number;
  confidence?: number;
}

/**
 * Formats extracted page context and optional Brave Search snippets into a
 * single concise input string for the Gemini Decisions API.
 */
export function buildDecisionInputText(
  context: ExtractedPageContext,
  searchSnippets?: string[]
): string {
  const lines: string[] = [
    `URL: ${context.url}`,
    `Title: ${context.title}`
  ];

  if (context.description) {
    lines.push(`Meta Description: ${context.description}`);
  }
  if (context.headings.length > 0) {
    lines.push(`Main Headings: ${context.headings.slice(0, 6).join(' | ')}`);
  }
  if (context.schemaTypes.length > 0) {
    lines.push(`Schema.org Types: ${context.schemaTypes.join(', ')}`);
  }
  if (context.heroText) {
    lines.push(`Hero Text: ${context.heroText}`);
  }
  if (context.bodySummary) {
    lines.push(`Page Content Snippet: ${context.bodySummary.slice(0, 1800)}`);
  }

  if (searchSnippets && searchSnippets.length > 0) {
    lines.push('External Web Search Context:');
    searchSnippets.forEach((snippet, idx) => {
      lines.push(`[Result ${idx + 1}] ${snippet}`);
    });
  }

  return lines.join('\n');
}

function readNoulProbability(answer?: DecisionApiAnswer): number {
  if (!answer || typeof answer !== 'object') return 0;
  if (typeof answer.noul === 'number') return answer.noul;
  if (typeof answer.value === 'number') return answer.value;
  return 0;
}

/**
 * Evaluates all existing categories plus a `needs_new_tag` routing predicate
 * in a single Gemini Decisions API (`gemini-decision-1`) forward pass.
 */
export async function classifyWithDecisionsApi(
  geminiApiKey: string,
  context: ExtractedPageContext,
  availableCategories: string[],
  searchSnippets: string[] = [],
  confidenceThreshold: number = DEFAULT_CONFIDENCE_THRESHOLD,
  onProgress?: (event: ClassificationProgressEvent) => void,
  auditChain?: ModelAuditEntry[]
): Promise<DecisionQuestionResult> {
  // Cannot score against an empty taxonomy; route directly to generative model.
  if (!availableCategories || availableCategories.length === 0) {
    return {
      matchedTags: [],
      needsNewTag: true,
      needsNewTagScore: 1,
      tagScores: {},
      shouldRouteToGenerative: true,
      latencyMs: 0
    };
  }

  onProgress?.({
    stage: 'ATTEMPTING',
    model: GEMINI_DECISION_MODEL,
    message: `Scoring ${availableCategories.length} existing tags via ${GEMINI_DECISION_MODEL}...`
  });

  // Reserve 1 question slot for `needs_new_tag` within the 1,000-question limit.
  const categoriesToCheck = availableCategories.slice(0, MAX_DECISION_QUESTIONS - 1);
  const questions: Record<string, { type: 'noul'; instructions: string }> = {};
  const keyToCategory = new Map<string, string>();

  categoriesToCheck.forEach((category, idx) => {
    const key = `tag_${idx}`;
    keyToCategory.set(key, category);
    questions[key] = {
      type: 'noul',
      instructions:
        `Does this website's core product or primary purpose belong in the "${category}" category? ` +
        `Answer yes only if "${category}" is a substantial, first-class capability of the site rather than a minor feature.`
    };
  });

  questions['needs_new_tag'] = {
    type: 'noul',
    instructions:
      `Is this website's primary product or category missing from all of the existing categories (` +
      `${categoriesToCheck.join(', ')}), such that a brand-new reusable taxonomy tag is genuinely needed?`
  };

  const input = buildDecisionInputText(context, searchSnippets);
  const startTime = Date.now();

  let response: Response | null = null;
  let fetchError: unknown = null;

  try {
    response = await fetch(DECISIONS_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify({
        model: GEMINI_DECISION_MODEL,
        input,
        questions
      })
    });
  } catch (err) {
    fetchError = err;
  }

  const latencyMs = Date.now() - startTime;

  if (fetchError || !response || !response.ok) {
    const status = response ? response.status : 0;
    let errorReason = 'NETWORK_ERROR';
    if (status === 429) {
      errorReason = 'RATE_LIMIT_EXCEEDED';
    } else if (status === 503) {
      errorReason = 'SERVICE_OVERLOADED_503';
    } else if (status === 400 || status === 403) {
      errorReason = 'INVALID_API_KEY';
    } else if (status > 0) {
      errorReason = `HTTP_${status}`;
    }

    auditChain?.push({
      model: GEMINI_DECISION_MODEL,
      status: 'FAILED',
      error: errorReason,
      latencyMs
    });

    return {
      matchedTags: [],
      needsNewTag: true,
      needsNewTagScore: 1,
      tagScores: {},
      shouldRouteToGenerative: true,
      latencyMs,
      error: errorReason
    };
  }

  try {
    const data = await response.json();
    const answers: Record<string, DecisionApiAnswer> = data?.answers || {};

    const tagScores: Record<string, number> = {};
    const scoredMatches: Array<{ category: string; score: number }> = [];

    for (const [key, category] of keyToCategory.entries()) {
      const score = readNoulProbability(answers[key]);
      tagScores[category] = score;
      if (score >= confidenceThreshold) {
        scoredMatches.push({ category, score });
      }
    }

    scoredMatches.sort((a, b) => b.score - a.score);
    const matchedTags = scoredMatches
      .slice(0, MAX_RECOMMENDED_TAGS)
      .map(item => item.category);

    const needsNewTagScore = readNoulProbability(answers['needs_new_tag']);
    const needsNewTag = needsNewTagScore >= NEW_TAG_ROUTE_THRESHOLD;
    const shouldRouteToGenerative = matchedTags.length === 0 || needsNewTag;

    auditChain?.push({
      model: GEMINI_DECISION_MODEL,
      status: 'SUCCESS',
      latencyMs
    });

    if (!shouldRouteToGenerative) {
      onProgress?.({
        stage: 'SUCCESS',
        model: GEMINI_DECISION_MODEL,
        message: `Matched ${matchedTags.length} tag(s) via ${GEMINI_DECISION_MODEL} (${latencyMs}ms)`
      });
    } else {
      const reasonText = matchedTags.length === 0
        ? 'No existing tag cleared threshold'
        : 'New tag may be needed';
      onProgress?.({
        stage: 'FALLBACK_SWITCH',
        model: GEMINI_DECISION_MODEL,
        message: `${GEMINI_DECISION_MODEL} (${latencyMs}ms): ${reasonText} → Routing to generative model...`
      });
    }

    return {
      matchedTags,
      needsNewTag,
      needsNewTagScore,
      tagScores,
      shouldRouteToGenerative,
      latencyMs
    };
  } catch {
    auditChain?.push({
      model: GEMINI_DECISION_MODEL,
      status: 'FAILED',
      error: 'PARSE_ERROR',
      latencyMs
    });

    return {
      matchedTags: [],
      needsNewTag: true,
      needsNewTagScore: 1,
      tagScores: {},
      shouldRouteToGenerative: true,
      latencyMs,
      error: 'PARSE_ERROR'
    };
  }
}
