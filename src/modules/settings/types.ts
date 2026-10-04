export interface AppGlobalSettings {
  // AI & Companion
  geminiApiKey: string;
  geminiModel: string; // 'gemini-2.5-flash' | 'gemini-3.8-flash'
  braveApiKey: string;
  autoClassify: boolean;

  // General Preferences
  openInNewTab: boolean;
  defaultSort: string;
}

export const DEFAULT_GLOBAL_SETTINGS: AppGlobalSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  braveApiKey: '',
  autoClassify: true,
  openInNewTab: true,
  defaultSort: 'dateAdded-desc'
};
