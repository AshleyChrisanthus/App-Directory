import type { Folder } from '../types';

export const STORAGE_KEY = 'appDirectory_entries';
export const THEME_KEY = 'appDirectory_theme';
export const STORAGE_FOLDERS_KEY = 'appDirectory_folders';
export const SIDEBAR_STATE_KEY = 'appDirectory_sidebarCollapsed';
export const FILTER_MODE_KEY = 'app_directory_cat_filter_mode';
export const PIN_FAVORITES_KEY = 'appDirectory_pinFavorites';
export const INSIGHTS_STATE_KEY = 'app_directory_insights_open';
export const ACTIVE_PRESET_KEY = 'appDirectory_activePreset';
export const CUSTOM_THEME_KEY = 'appDirectory_customTheme';
export const CAT_COLORS_KEY = 'appDirectory_categoryColors';
export const VIEW_LAYOUT_KEY = 'app_directory_view_layout';
export const EXPORT_FOLDER_KEY = 'app_directory_export_folder_handle';

export const DEFAULT_CATEGORIES: string[] = [
  'Development',
  'Social',
  'News',
  'Entertainment',
  'Productivity',
  'Other'
];

export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'f-work', name: 'Work', icon: '💼', color: '#0a84ff', dateAdded: '2026-01-01T00:00:00.000Z' },
  { id: 'f-personal', name: 'Personal', icon: '🏠', color: '#10b981', dateAdded: '2026-01-01T00:00:00.000Z' },
  { id: 'f-research', name: 'Research', icon: '🔬', color: '#88c0d0', dateAdded: '2026-01-01T00:00:00.000Z' }
];

export interface KnownAppIcon {
  test: (url: string) => boolean;
  icon: string;
}

export const KNOWN_APP_ICONS: KnownAppIcon[] = [
  {
    test: (url: string) => /notebook(lm)?\.google\.com|google\.com\/notebooklm/i.test(url),
    icon: 'https://notebooklm.google.com/_/static/branding/v4/dark_mode/favicon/apple-touch-icon.png'
  },
  {
    test: (url: string) => /gemini\.google\.com|bard\.google\.com/i.test(url),
    icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg'
  },
  {
    test: (url: string) => /drive\.google\.com/i.test(url),
    icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png'
  },
  {
    test: (url: string) => /docs\.google\.com\/(document|d\/)/i.test(url),
    icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
  },
  {
    test: (url: string) => /sheets\.google\.com|docs\.google\.com\/spreadsheets/i.test(url),
    icon: 'https://ssl.gstatic.com/docs/spreadsheets/images/favicon_table_auto_sized.ico'
  },
  {
    test: (url: string) => /slides\.google\.com|docs\.google\.com\/presentation/i.test(url),
    icon: 'https://ssl.gstatic.com/docs/presentations/images/favicon_show_auto_sized.ico'
  },
  {
    test: (url: string) => /keep\.google\.com/i.test(url),
    icon: 'https://ssl.gstatic.com/keep/keep_2020q4v2.ico'
  },
  {
    test: (url: string) => /colab\.research\.google\.com/i.test(url),
    icon: 'https://colab.research.google.com/img/favicon.ico'
  },
  {
    test: (url: string) => /meet\.google\.com/i.test(url),
    icon: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png'
  },
  {
    test: (url: string) => /mail\.google\.com/i.test(url),
    icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico'
  },
  {
    test: (url: string) => /calendar\.google\.com/i.test(url),
    icon: 'https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31.ico'
  },
  {
    test: (url: string) => /music\.youtube\.com/i.test(url),
    icon: 'https://music.youtube.com/img/favicon_144.png'
  },
  {
    test: (url: string) => /photos\.google\.com/i.test(url),
    icon: 'https://ssl.gstatic.com/social/photosui/images/logo/1x/photos_96dp.png'
  },
  {
    test: (url: string) => /maps\.google\.com/i.test(url),
    icon: 'https://maps.gstatic.com/mapfiles/maps_lite/pwa/icons/pwa_icon_192.png'
  },
  {
    test: (url: string) => /chatgpt\.com|chat\.openai\.com/i.test(url),
    icon: 'https://chatgpt.com/favicon.ico'
  },
  {
    test: (url: string) => /claude\.ai/i.test(url),
    icon: 'https://claude.ai/favicon.ico'
  },
  {
    test: (url: string) => /github\.com/i.test(url),
    icon: 'https://github.githubassets.com/favicons/favicon.svg'
  }
];
