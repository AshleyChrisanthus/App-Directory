import { DiscoveredModel, DEFAULT_KNOWN_MODELS } from './types';

export function getCleanModelName(rawName: string): string {
  if (!rawName) return '';
  return rawName.startsWith('models/') ? rawName.slice('models/'.length) : rawName;
}

export function categorizeModelFamily(cleanName: string): 'flash' | 'flash-lite' | 'pro' | 'preview' | 'other' {
  const lower = cleanName.toLowerCase();
  if (lower.includes('flash-lite') || lower.includes('-8b')) {
    return 'flash-lite';
  }
  if (lower.includes('preview') || lower.includes('exp') || lower.includes('3.8')) {
    return 'preview';
  }
  if (lower.includes('flash')) {
    return 'flash';
  }
  if (lower.includes('pro')) {
    return 'pro';
  }
  return 'other';
}

export function formatModelDisplayName(cleanName: string, officialDisplayName?: string): string {
  if (officialDisplayName && officialDisplayName.trim()) {
    return officialDisplayName.trim();
  }
  // Humanize common model names
  return cleanName
    .replace(/^gemini-/i, 'Gemini ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

export async function fetchAvailableModels(apiKey: string): Promise<{
  success: boolean;
  models: DiscoveredModel[];
  error?: string;
}> {
  const key = apiKey.trim();
  if (!key) {
    return {
      success: false,
      models: [...DEFAULT_KNOWN_MODELS],
      error: 'Please enter a Gemini API key first.'
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      if (res.status === 400 || res.status === 403) {
        return {
          success: false,
          models: [...DEFAULT_KNOWN_MODELS],
          error: `Invalid API key (HTTP ${res.status}). Check your Google AI Studio key.`
        };
      }
      return {
        success: false,
        models: [...DEFAULT_KNOWN_MODELS],
        error: `Failed to fetch models (HTTP ${res.status}).`
      };
    }

    const data = await res.json();
    const rawList = Array.isArray(data.models) ? data.models : [];

    const discovered: DiscoveredModel[] = [];

    for (const m of rawList) {
      if (!m || !m.name) continue;
      const methods: string[] = Array.isArray(m.supportedGenerationMethods) ? m.supportedGenerationMethods : [];
      // Only include models that support content generation
      if (!methods.includes('generateContent')) continue;

      const cleanName = getCleanModelName(m.name);
      // Filter to Gemini models (exclude legacy text-bison, embedding models, etc.)
      if (!cleanName.toLowerCase().startsWith('gemini')) continue;

      discovered.push({
        name: cleanName,
        displayName: formatModelDisplayName(cleanName, m.displayName),
        description: m.description || '',
        inputTokenLimit: typeof m.inputTokenLimit === 'number' ? m.inputTokenLimit : undefined,
        outputTokenLimit: typeof m.outputTokenLimit === 'number' ? m.outputTokenLimit : undefined,
        family: categorizeModelFamily(cleanName)
      });
    }

    // Sort order: flash -> flash-lite -> preview -> pro -> other
    const familyWeight = {
      'flash': 1,
      'flash-lite': 2,
      'preview': 3,
      'pro': 4,
      'other': 5
    };

    discovered.sort((a, b) => {
      const wA = familyWeight[a.family || 'other'];
      const wB = familyWeight[b.family || 'other'];
      if (wA !== wB) return wA - wB;
      return a.displayName.localeCompare(b.displayName);
    });

    if (discovered.length === 0) {
      return {
        success: true,
        models: [...DEFAULT_KNOWN_MODELS]
      };
    }

    return {
      success: true,
      models: discovered
    };
  } catch (err: any) {
    return {
      success: false,
      models: [...DEFAULT_KNOWN_MODELS],
      error: err?.message || 'Network error fetching models from Gemini API.'
    };
  }
}
