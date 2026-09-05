import type {
  BookmarkEntry,
  Folder,
  ActiveFolderId,
  CategoryMatchMode,
  ViewLayoutMode,
  CustomThemeStorage,
  CategoryColorMap
} from '../types';
import {
  DEFAULT_FOLDERS,
  FILTER_MODE_KEY,
  PIN_FAVORITES_KEY,
  INSIGHTS_STATE_KEY,
  VIEW_LAYOUT_KEY,
  ACTIVE_PRESET_KEY
} from './constants';

export class AppState {
  entries: BookmarkEntry[] = [];
  folders: Folder[] = [...DEFAULT_FOLDERS];
  activeFolderId: ActiveFolderId = 'all';
  editingFolderId: string | null = null;
  editingId: string | null = null;
  selectedCategories: string[] = [];
  selectedFilterCategories: Set<string> = new Set();
  catFilterMode: CategoryMatchMode = (localStorage.getItem(FILTER_MODE_KEY) as CategoryMatchMode) || 'union';
  pinFavorites: boolean = localStorage.getItem(PIN_FAVORITES_KEY) === 'true';
  isInsightsOpen: boolean = localStorage.getItem(INSIGHTS_STATE_KEY) === 'true';
  pendingIcons: Map<string, string> = new Map();
  currentViewMode: ViewLayoutMode = (localStorage.getItem(VIEW_LAYOUT_KEY) as ViewLayoutMode) || 'cards';
  customThemeColors: CustomThemeStorage = {};
  categoryColors: CategoryColorMap = {};
  activeThemePreset: string = localStorage.getItem(ACTIVE_PRESET_KEY) || 'default';
}

export const state = new AppState();
