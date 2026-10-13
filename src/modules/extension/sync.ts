import type { BookmarkEntry } from '../../types';
import { state } from '../../core/state';
import { saveEntries, migrateEntry } from '../../core/storage';
import { getAllCategories } from '../categories/manager';
import { showToast } from '../../utils/dom';
import { syncSettingsFromExtension } from '../settings/manager';

let isExtensionSyncInitialized = false;
let currentOnDataChanged: (() => void) | null = null;
const recentlyProcessedBookmarks = new Map<string, number>();

function isDuplicateBookmark(key: string): boolean {
  const now = Date.now();
  const lastTime = recentlyProcessedBookmarks.get(key);
  if (lastTime && now - lastTime < 1500) {
    return true;
  }
  recentlyProcessedBookmarks.set(key, now);

  // Tidy up older entries
  if (recentlyProcessedBookmarks.size > 100) {
    for (const [k, time] of recentlyProcessedBookmarks) {
      if (now - time > 5000) {
        recentlyProcessedBookmarks.delete(k);
      }
    }
  }
  return false;
}

export function initExtensionSync(onDataChanged: () => void): void {
  currentOnDataChanged = onDataChanged;

  if (isExtensionSyncInitialized) {
    return;
  }
  isExtensionSyncInitialized = true;

  const broadcastState = (): void => {
    if (typeof window === 'undefined' || typeof window.postMessage !== 'function') return;
    try {
      window.postMessage({
        type: 'APP_DIRECTORY_SYNC_RESPONSE',
        folders: (state.folders || []).map(f => ({
          id: f.id,
          name: f.name,
          icon: f.icon || '📁',
          color: f.color || '#0a84ff'
        })),
        categories: getAllCategories(),
        entries: (state.entries || []).map(e => ({
          id: e.id,
          name: e.name,
          url: e.url,
          icon: e.icon || null,
          iconUrl: e.iconUrl || null,
          categories: e.categories || [],
          folderId: e.folderId || null,
          dateAdded: e.dateAdded
        }))
      }, '*');
    } catch (_) {}
  };

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('message', async (event: MessageEvent) => {
    if (!event.data || typeof event.data !== 'object') return;

    const { type, entry, entries } = event.data;

    if (type === 'APP_DIRECTORY_PING' || type === 'APP_DIRECTORY_GET_STATE') {
      broadcastState();
    } else if (type === 'APP_DIRECTORY_EXTENSION_SETTINGS' && event.data.settings) {
      syncSettingsFromExtension(event.data.settings);
    } else if (type === 'APP_DIRECTORY_NEW_BOOKMARK' && entry) {
      const migrated = migrateEntry(entry);
      if (!migrated) return;

      const dedupeKey = migrated.id || migrated.url;
      if (dedupeKey && isDuplicateBookmark(dedupeKey)) {
        if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
          window.postMessage({
            type: 'APP_DIRECTORY_SAVE_SUCCESS',
            id: migrated.id
          }, '*');
        }
        return;
      }

      const existingIdx = state.entries.findIndex(e => e.id === migrated.id || e.url === migrated.url);
      if (existingIdx !== -1) {
        state.entries[existingIdx] = migrated;
      } else {
        state.entries.unshift(migrated);
      }

      await saveEntries(state.entries);
      if (currentOnDataChanged) {
        currentOnDataChanged();
      }
      showToast(`Added "${migrated.name}" from extension!`);

      if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
        window.postMessage({
          type: 'APP_DIRECTORY_SAVE_SUCCESS',
          id: migrated.id
        }, '*');
      }
    } else if (type === 'APP_DIRECTORY_INGEST_PENDING' && Array.isArray(entries) && entries.length > 0) {
      let addedCount = 0;
      for (const raw of entries) {
        const item = migrateEntry(raw);
        if (!item) continue;
        const dedupeKey = item.id || item.url;
        if (dedupeKey && isDuplicateBookmark(dedupeKey)) {
          continue;
        }
        const exists = state.entries.some(e => e.id === item.id || e.url === item.url);
        if (!exists) {
          state.entries.unshift(item);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        await saveEntries(state.entries);
        if (currentOnDataChanged) {
          currentOnDataChanged();
        }
        showToast(`Imported ${addedCount} bookmark${addedCount !== 1 ? 's' : ''} from extension!`);
      }

      if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
        window.postMessage({
          type: 'APP_DIRECTORY_INGEST_SUCCESS',
          entryIds: entries.map((e: any) => e.id).filter(Boolean)
        }, '*');
      }
    }
  });
  }

  // Announce readiness so the bridge knows App Directory is active
  setTimeout(broadcastState, 200);

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        broadcastState();
      }
    });
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('focus', () => {
      broadcastState();
    });
  }
}
