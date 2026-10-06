import { getSettings } from './manager';
import { TAXONOMY_SYSTEM_PROMPT, buildTaxonomyUserPrompt } from '../../extension/taxonomy';
import {
  ExtractedPageContext,
  ClassificationResult,
  ClassificationProgressEvent,
  ModelAuditEntry
} from '../../extension/types';

export async function classifyBookmarkWithAI(
  url: string,
  title: string,
  description: string = '',
  availableCategories: string[],
  forceSearch: boolean = false,
  onProgress?: (event: ClassificationProgressEvent) => void
): Promise<ClassificationResult> {
  const settings = getSettings();
  const geminiApiKey = settings.geminiApiKey?.trim();
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
    onProgress?.({
      stage: 'BRAVE_SEARCH',
      message: 'Grounding with Brave Search results...'
    });

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

  // Construct ordered list of models to try
  const modelsToTry: string[] = [];
  if (settings.geminiModel && settings.geminiModel.trim()) {
    modelsToTry.push(settings.geminiModel.trim());
  }
  if (Array.isArray(settings.geminiFallbackModels)) {
    for (const fm of settings.geminiFallbackModels) {
      const trimmed = (fm || '').trim();
      if (trimmed && !modelsToTry.includes(trimmed)) {
        modelsToTry.push(trimmed);
      }
    }
  }
  if (modelsToTry.length === 0) {
    modelsToTry.push('gemini-2.5-flash');
  }

  const auditChain: ModelAuditEntry[] = [];
  let lastError = 'UNKNOWN_ERROR';

  for (let idx = 0; idx < modelsToTry.length; idx++) {
    const currentModel = modelsToTry[idx];
    const isPrimary = idx === 0;

    onProgress?.({
      stage: 'ATTEMPTING',
      model: currentModel,
      attemptIndex: idx + 1,
      totalModels: modelsToTry.length,
      message: isPrimary
        ? `Querying primary model (${currentModel})...`
        : `Querying fallback model (${currentModel})...`
    });

    const startTime = Date.now();
    let response: Response | null = null;
    let fetchError: any = null;

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(currentModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
      response = await fetch(endpoint, {
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
            temperature: 0.15
          }
        })
      });
    } catch (err) {
      fetchError = err;
    }

    const latencyMs = Date.now() - startTime;

    // Check if network failed or server threw an error
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

      auditChain.push({
        model: currentModel,
        status: 'FAILED',
        error: errorReason,
        latencyMs
      });

      lastError = errorReason;

      // If invalid key, no point in trying other models
      if (errorReason === 'INVALID_API_KEY') {
        onProgress?.({
          stage: 'ERROR',
          model: currentModel,
          errorReason,
          message: 'Invalid Gemini API Key.'
        });
        return {
          success: false,
          error: 'INVALID_API_KEY',
          recommendedTags: [],
          auditChain
        };
      }

      // Check if we can cascade to another model in the fallback chain
      const hasNext = idx + 1 < modelsToTry.length;
      if (hasNext) {
        const nextModel = modelsToTry[idx + 1];
        const friendlyReason = status === 429
          ? 'Rate limited (429)'
          : status === 503
          ? 'Server overloaded (503)'
          : `Unavailable (${errorReason})`;

        onProgress?.({
          stage: 'FALLBACK_SWITCH',
          model: currentModel,
          targetModel: nextModel,
          errorReason,
          attemptIndex: idx + 1,
          totalModels: modelsToTry.length,
          message: `⚠️ ${currentModel} ${friendlyReason} → Trying ${nextModel}...`
        });

        // Continue loop to try next model in fallback chain
        continue;
      } else {
        // Last model failed
        onProgress?.({
          stage: 'ERROR',
          model: currentModel,
          errorReason,
          message: `All configured models failed. Last error: ${errorReason}`
        });
        return {
          success: false,
          error: lastError,
          recommendedTags: [],
          auditChain
        };
      }
    }

    // Success response parsing
    try {
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        auditChain.push({
          model: currentModel,
          status: 'FAILED',
          error: 'NO_RESPONSE_TEXT',
          latencyMs
        });
        continue;
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

      // Ensure any suggested new tag is in recommendedTags
      for (const nt of newTags) {
        if (!recommendedTags.includes(nt)) {
          recommendedTags.push(nt);
        }
      }

      const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning.trim() : '';

      auditChain.push({
        model: currentModel,
        status: 'SUCCESS',
        latencyMs
      });

      onProgress?.({
        stage: 'SUCCESS',
        model: currentModel,
        message: `Classified via ${currentModel} (${latencyMs}ms)`
      });

      return {
        success: true,
        method,
        recommendedTags,
        newTags,
        reasoning,
        suggestedNewTag: newTags[0] || null,
        modelUsed: currentModel,
        auditChain
      };
    } catch (parseErr: any) {
      console.warn(`[Classifier] Parse error from ${currentModel}:`, parseErr);
      auditChain.push({
        model: currentModel,
        status: 'FAILED',
        error: 'PARSE_ERROR',
        latencyMs
      });
      // Try next model if available
      continue;
    }
  }

  return {
    success: false,
    error: lastError,
    recommendedTags: [],
    auditChain
  };
}
