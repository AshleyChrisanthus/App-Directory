export interface DiscoveredModel {
  name: string; // e.g. 'gemini-2.5-flash'
  displayName: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  family?: 'flash' | 'flash-lite' | 'pro' | 'preview' | 'other';
}

export const DEFAULT_KNOWN_MODELS: DiscoveredModel[] = [
  { name: 'gemini-2.5-flash', displayName: 'Gemini 2.5 Flash', family: 'flash', description: 'Fast, high-quality multimodal model' },
  { name: 'gemini-2.5-flash-lite', displayName: 'Gemini 2.5 Flash Lite', family: 'flash-lite', description: 'Ultra-fast with dedicated quota bucket' },
  { name: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash', family: 'flash', description: 'High-throughput standard model' },
  { name: 'gemini-2.0-flash-lite', displayName: 'Gemini 2.0 Flash Lite', family: 'flash-lite', description: 'Efficient lightweight model' },
  { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', family: 'flash', description: 'Reliable, long context window' },
  { name: 'gemini-3.8-flash', displayName: 'Gemini 3.8 Flash', family: 'preview', description: 'Next-gen preview model' }
];

export interface AppGlobalSettings {
  // AI & Companion
  geminiApiKey: string;
  geminiModel: string; // Primary model ID
  geminiFallbackModels: string[]; // Ordered fallback models to try if primary fails
  discoveredModels: DiscoveredModel[]; // Discovered/cached available models
  braveApiKey: string;
  autoClassify: boolean;

  // General Preferences
  openInNewTab: boolean;
  defaultSort: string;
}

export const DEFAULT_GLOBAL_SETTINGS: AppGlobalSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  geminiFallbackModels: ['gemini-2.5-flash-lite'],
  discoveredModels: [...DEFAULT_KNOWN_MODELS],
  braveApiKey: '',
  autoClassify: true,
  openInNewTab: true,
  defaultSort: 'dateAdded-desc'
};
