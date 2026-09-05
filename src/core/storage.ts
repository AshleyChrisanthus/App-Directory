import type { BookmarkEntry, Folder } from '../types';
import { STORAGE_KEY, STORAGE_FOLDERS_KEY, DEFAULT_FOLDERS } from './constants';
import { state } from './state';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel('app_directory_sync_v1');
  }
} catch (_) {}

export function notifyOtherTabs(type: 'SYNC_DATA' | 'SYNC_THEME' = 'SYNC_DATA'): void {
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type });
    } catch (_) {}
  }
}

export function onBroadcastMessage(
  handler: (data: { type: string }) => void
): void {
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event: MessageEvent) => {
      if (event.data) {
        handler(event.data);
      }
    };
  }
}

export function migrateEntry(entry: any): BookmarkEntry | null {
  if (!entry) return null;
  if (!entry.categories) {
    if (entry.category && typeof entry.category === 'string') {
      entry.categories = [entry.category.trim()];
    } else {
      entry.categories = [];
    }
  }
  delete entry.category;
  return entry as BookmarkEntry;
}

export function getLatestStoredEntries(): BookmarkEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? (list.map(migrateEntry).filter(Boolean) as BookmarkEntry[]) : [];
  } catch {
    return [];
  }
}

export function mergeEntries(localList: BookmarkEntry[], diskList: BookmarkEntry[]): BookmarkEntry[] {
  const map = new Map<string, BookmarkEntry>();

  // 1. Index all disk entries
  for (const item of diskList) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }

  // 2. Merge local entries
  for (const item of localList) {
    if (!item || !item.id) continue;
    if (!map.has(item.id)) {
      map.set(item.id, item);
    } else {
      const diskItem = map.get(item.id)!;
      const localMod = new Date((item as any).dateModified || item.dateAdded || 0).getTime();
      const diskMod = new Date((diskItem as any).dateModified || diskItem.dateAdded || 0).getTime();
      if (localMod >= diskMod) {
        map.set(item.id, item);
      }
    }
  }

  return Array.from(map.values());
}

export function loadEntries(): BookmarkEntry[] {
  state.entries = getLatestStoredEntries();
  return state.entries;
}

export function saveEntries(targetList: BookmarkEntry[] | null = null): void {
  const diskList = getLatestStoredEntries();
  const sourceList = targetList || state.entries;
  const merged = mergeEntries(sourceList, diskList);
  state.entries = merged;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
  notifyOtherTabs('SYNC_DATA');
}

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(STORAGE_FOLDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        state.folders = parsed;
        return state.folders;
      }
    }
    state.folders = [...DEFAULT_FOLDERS];
    saveFolders(state.folders, false);
    return state.folders;
  } catch {
    state.folders = [...DEFAULT_FOLDERS];
    return state.folders;
  }
}

export function saveFolders(data: Folder[] = state.folders, notify = true): void {
  state.folders = data;
  localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(state.folders));
  if (notify) notifyOtherTabs('SYNC_DATA');
}
