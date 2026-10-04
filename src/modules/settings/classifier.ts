import { getSettings } from './manager';
import { TAXONOMY_SYSTEM_PROMPT, buildTaxonomyUserPrompt } from '../../extension/taxonomy';
import { ExtractedPageContext, ClassificationResult } from '../../extension/types';

export async function classifyBookmarkWithAI(
  url: string,
  title: string,
  description: string = '',
  availableCategories: string[],
  forceSearch: boolean = false
): Promise<ClassificationResult> {
  const settings = getSettings();
  const geminiApiKey = settings.geminiApiKey?.trim();
  const selectedModel = settings.geminiModel || 'gemini-2.5-flash';
  const braveApiKey = settings.braveApiKey?.trim();

  if (!geminiApiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      recommendedTags: []
    };
  }

  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch {
    hostname = url;
  }

  const isSparse = !description || description.trim().length < 30;

  const pageContext: ExtractedPageContext = {
    url,
    hostname,
    title: title || hostname,
    description: description || '',
    keywords: [],
    headings: [],
    bodySummary: description || '',
    schemaTypes: [],
    isSparse
  };

  let searchSnippets: string[] = [];
  let method: 'DOM_DIRECT' | 'BRAVE_GROUNDED' = 'DOM_DIRECT';

  // If description is sparse and Brave Search is available, ground classification with search results
  if ((isSparse || forceSearch) && braveApiKey) {
    try {
      const query = `${title || hostname} ${hostname} what is it product summary`;
      const braveUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=4`;
      const braveResp = await fetch(braveUrl, {
        headers: {
          'Accept': 'application/json',
          'X-Subscription-Token': braveApiKey
        }
      });
      if (braveResp.ok) {
        const braveData = await braveResp.json();
        const results = braveData.web?.results || [];
        for (const r of results) {
          if (r.title && r.description) {
            searchSnippets.push(`${r.title}: ${r.description}`);
          }
        }
        if (searchSnippets.length > 0) {
          method = 'BRAVE_GROUNDED';
        }
      }
    } catch (bErr) {
      console.warn('[Classifier] Brave Search failed, continuing with direct prompt:', bErr);
    }
  }

  const userPrompt = buildTaxonomyUserPrompt(pageContext, availableCategories, searchSnippets);

  // Helper to query Gemini API
  async function callGemini(modelToUse: string): Promise<Response> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelToUse)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: TAXONOMY_SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.2
        }
      })
    });
  }

  let effectiveModel = selectedModel;
  let response = await callGemini(effectiveModel);

  // Automatic 503 fallback: If gemini-3.8-flash returns 503 (service overloaded), fallback to gemini-2.5-flash
  if (response.status === 503 && effectiveModel === 'gemini-3.8-flash') {
    console.warn('[Classifier] gemini-3.8-flash returned 503 (overloaded). Falling back to gemini-2.5-flash...');
    effectiveModel = 'gemini-2.5-flash';
    response = await callGemini(effectiveModel);
  }

  if (!response.ok) {
    if (response.status === 429) {
      return { success: false, error: 'RATE_LIMIT_EXCEEDED', recommendedTags: [] };
    } else if (response.status === 400 || response.status === 403) {
      return { success: false, error: 'INVALID_API_KEY', recommendedTags: [] };
    } else if (response.status === 503) {
      return { success: false, error: 'SERVICE_OVERLOADED_503', recommendedTags: [] };
    } else {
      return { success: false, error: `API_ERROR_${response.status}`, recommendedTags: [] };
    }
  }

  try {
    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return { success: false, error: 'NO_RESPONSE_TEXT', recommendedTags: [] };
    }

    const parsed = JSON.parse(rawText);

    const recommendedTags: string[] = Array.isArray(parsed.recommendedTags)
      ? parsed.recommendedTags.map((t: any) => String(t).trim()).filter(Boolean)
      : [];

    const newTags: string[] = [];
    if (Array.isArray(parsed.newTags)) {
      for (const nt of parsed.newTags) {
        const trimmed = String(nt).trim();
        if (trimmed && !newTags.includes(trimmed)) newTags.push(trimmed);
      }
    }
    if (parsed.suggestedNewTag) {
      const snt = String(parsed.suggestedNewTag).trim();
      if (snt && snt.toLowerCase() !== 'null' && snt.toLowerCase() !== 'none' && !newTags.includes(snt)) {
        newTags.push(snt);
      }
    }

    // Ensure any proposed new tag is present in recommendedTags
    for (const nt of newTags) {
      if (!recommendedTags.includes(nt)) {
        recommendedTags.push(nt);
      }
    }

    const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning.trim() : '';

    return {
      success: true,
      method,
      recommendedTags,
      newTags,
      reasoning,
      suggestedNewTag: newTags[0] || null,
      modelUsed: effectiveModel
    };
  } catch (err: any) {
    console.error('[Classifier] Error parsing Gemini classification response:', err);
    return { success: false, error: 'PARSE_ERROR', recommendedTags: [] };
  }
}
