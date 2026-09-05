export interface BookmarkHealth {
  status: 'healthy' | 'broken' | 'untested';
  lastChecked?: string | null;
  error?: string | null;
  code?: number | null;
}

export interface BookmarkEntry {
  id: string;
  name: string;
  url: string;
  description?: string;
  categories: string[];
  folderId?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
  customIcon?: boolean;
  isFavorite?: boolean;
  visitCount?: number;
  lastVisited?: string | null;
  dateAdded: string;
  dateModified?: string;
  health?: BookmarkHealth;
}

export interface PendingIconUpdate {
  entryId: string;
  candidateUrl: string;
  source?: string;
}

export type ViewLayoutMode = 'cards' | 'table' | 'icons';

export type SortMode =
  | 'dateAdded-desc'
  | 'dateAdded-asc'
  | 'name-asc'
  | 'name-desc'
  | 'visitCount-desc'
  | 'visitCount-asc';
