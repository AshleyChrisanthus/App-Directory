// Type definitions for App Directory Companion Extension
import type { DiscoveredModel } from '../modules/settings/types';

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

export interface ModelAuditEntry {
  model: string;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
  latencyMs?: number;
}

export interface ClassificationProgressEvent {
  stage: 'INIT' | 'ATTEMPTING' | 'MODEL_FAILED' | 'FALLBACK_SWITCH' | 'BRAVE_SEARCH' | 'SUCCESS' | 'ERROR';
  model?: string;
  targetModel?: string;
  attemptIndex?: number;
  totalModels?: number;
  errorReason?: string;
  message: string;
}

export interface ClassificationResult {
  success: boolean;
  method?: ClassificationMethod;
  recommendedTags: string[];
  newTags?: string[];
  reasoning?: string;
  suggestedNewTag?: string | null;
  error?: string;
  modelUsed?: string;
  auditChain?: ModelAuditEntry[];
}

export interface ExtensionSettings {
  geminiApiKey: string;
  geminiModel: string;
  geminiFallbackModels?: string[];
  discoveredModels?: DiscoveredModel[];
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
