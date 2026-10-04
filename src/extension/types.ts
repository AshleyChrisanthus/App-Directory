// Type definitions for App Directory Companion Extension

export type ClassificationMethod = 'DOM_DIRECT' | 'BRAVE_GROUNDED';

export interface ExtractedPageContext {
  url: string;
  hostname: string;
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  headings: string[];
  heroText?: string;
  bodySummary: string;
  schemaTypes: string[];
  schemaSummary?: string;
  isSparse: boolean;
}

export interface ClassificationResult {
  success: boolean;
  method?: ClassificationMethod;
  recommendedTags: string[];
  reasoning?: string;
  suggestedNewTag?: string | null;
  error?: string;
}

export interface ExtensionSettings {
  geminiApiKey: string;
  geminiModel: string; // e.g. 'gemini-2.5-flash' | 'gemini-3.8-flash'
  braveApiKey?: string;
  autoClassify: boolean;
}

export interface CachedFolder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface AppDirectoryState {
  folders: CachedFolder[];
  categories: string[];
}
