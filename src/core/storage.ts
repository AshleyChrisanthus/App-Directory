import type { BookmarkEntry, Folder } from '../types';
import { STORAGE_KEY, STORAGE_FOLDERS_KEY, DEFAULT_FOLDERS } from './constants';
import { state } from './state';
import {
  openAppDB,
  idbGetAllEntries,
  idbSetAllEntries,
  idbGetAllFolders,
  idbSetAllFolders
} from './idb';

const MIGRATED_FLAG_KEY = 'appDirectory_idb_migrated';

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
  if (!entry.id) {
    entry.id = 'entry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }
  if (!entry.categories) {
    if (entry.category && typeof entry.category === 'string') {
      entry.categories = [entry.category.trim()];
    } else {
      entry.categories = [];
    }
  }
  delete entry.category;

  // Unify and deduplicate icon/iconUrl to prevent quota exhaustion
  if (entry.iconUrl || entry.icon) {
    entry.iconUrl = entry.iconUrl || entry.icon;
    if (entry.icon && (entry.icon === entry.iconUrl || !entry.customIcon)) {
      delete entry.icon;
    }
  }

  return entry as BookmarkEntry;
}

export function getLatestStoredEntries(): BookmarkEntry[] {
  if (state.entries && state.entries.length > 0) {
    return [...state.entries];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list.map(migrateEntry).filter(Boolean) as BookmarkEntry[];
      }
    }
  } catch (_) {}
  return [...(state.entries || [])];
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

/**
 * Initialize storage system.
 * Transparently migrates any legacy localStorage data to IndexedDB.
 * Reads entries and folders into in-memory state.
 */
export async function initStorage(): Promise<void> {
  try {
    await openAppDB();

    let entries = await idbGetAllEntries();
    let folders = await idbGetAllFolders();

    const alreadyMigrated = localStorage.getItem(MIGRATED_FLAG_KEY) === 'true';

    // Auto-migrate from localStorage if IDB has no entries and we haven't migrated yet
    if (entries.length === 0 && !alreadyMigrated) {
      try {
        const rawEntries = localStorage.getItem(STORAGE_KEY);
        if (rawEntries) {
          const parsed = JSON.parse(rawEntries);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const migrated = parsed.map(migrateEntry).filter(Boolean) as BookmarkEntry[];
            if (migrated.length > 0) {
              await idbSetAllEntries(migrated);
              entries = migrated;
              console.log(`[Storage] Auto-migrated ${entries.length} entries from localStorage to IndexedDB.`);
            }
          }
        }
      } catch (err) {
        console.warn('[Storage] Error reading localStorage during entries migration:', err);
      }
    }

    // Auto-migrate folders or set defaults
    if (folders.length === 0) {
      try {
        const rawFolders = localStorage.getItem(STORAGE_FOLDERS_KEY);
        if (rawFolders) {
          const parsed = JSON.parse(rawFolders);
          if (Array.isArray(parsed) && parsed.length > 0) {
            await idbSetAllFolders(parsed);
            folders = parsed;
            console.log(`[Storage] Auto-migrated ${folders.length} folders from localStorage to IndexedDB.`);
          }
        }
      } catch (err) {
        console.warn('[Storage] Error reading localStorage during folders migration:', err);
      }

      if (folders.length === 0) {
        folders = [...DEFAULT_FOLDERS];
        await idbSetAllFolders(folders);
      }
    }

    // Free up localStorage quota after migration
    if (!alreadyMigrated && (entries.length > 0 || folders.length > 0)) {
      try {
        localStorage.setItem(MIGRATED_FLAG_KEY, 'true');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_FOLDERS_KEY);
      } catch (_) {}
    }

    state.entries = entries;
    state.folders = folders;
  } catch (err) {
    console.error('[Storage] IndexedDB initialization failed, falling back to localStorage:', err);
    // Fallback if IndexedDB is disabled
    loadFallbackFromLocalStorage();
  }
}

function loadFallbackFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    state.entries = Array.isArray(list) ? (list.map(migrateEntry).filter(Boolean) as BookmarkEntry[]) : [];
  } catch {
    state.entries = [];
  }

  try {
    const rawF = localStorage.getItem(STORAGE_FOLDERS_KEY);
    const fList = rawF ? JSON.parse(rawF) : null;
    state.folders = Array.isArray(fList) && fList.length > 0 ? fList : [...DEFAULT_FOLDERS];
  } catch {
    state.folders = [...DEFAULT_FOLDERS];
  }
}

/**
 * Reload state from IndexedDB (e.g. after receiving SYNC_DATA from another tab).
 */
export async function reloadFromStorage(): Promise<void> {
  try {
    const [entries, folders] = await Promise.all([idbGetAllEntries(), idbGetAllFolders()]);
    state.entries = entries;
    if (folders && folders.length > 0) {
      state.folders = folders;
    }
  } catch (err) {
    console.warn('[Storage] Failed to reload from IndexedDB:', err);
  }
}

export function loadEntries(): BookmarkEntry[] {
  return state.entries;
}

export function saveEntries(targetList: BookmarkEntry[] | null = null): Promise<void> {
  if (targetList) {
    state.entries = targetList;
  } else if (!state.entries) {
    state.entries = [];
  }

  // Persist to IndexedDB asynchronously
  return idbSetAllEntries(state.entries)
    .then(() => {
      notifyOtherTabs('SYNC_DATA');
    })
    .catch((err) => {
      console.error('[Storage] Failed to save entries to IndexedDB:', err);
      // Fallback attempt to localStorage if IndexedDB failed
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
      } catch (_) {}
    });
}

export function loadFolders(): Folder[] {
  return state.folders;
}

export function saveFolders(data: Folder[] = state.folders, notify = true): Promise<void> {
  state.folders = data;
  return idbSetAllFolders(state.folders)
    .then(() => {
      if (notify) notifyOtherTabs('SYNC_DATA');
    })
    .catch((err) => {
      console.error('[Storage] Failed to save folders to IndexedDB:', err);
      try {
        localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(state.folders));
      } catch (_) {}
    });
}
