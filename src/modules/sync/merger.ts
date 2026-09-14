import type { BookmarkEntry, Folder } from '../../types';
import type { DecryptedSyncPayload, SyncTombstone } from './types';

const TOMBSTONE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function pruneTombstones(tombstones: SyncTombstone[]): SyncTombstone[] {
  const cutoff = Date.now() - TOMBSTONE_MAX_AGE_MS;
  return tombstones.filter((t) => {
    const time = new Date(t.deletedAt).getTime();
    return !isNaN(time) && time > cutoff;
  });
}

export function mergeSyncPayload(
  localEntries: BookmarkEntry[],
  localFolders: Folder[],
  localTombstones: SyncTombstone[],
  remotePayload: DecryptedSyncPayload
): {
  mergedEntries: BookmarkEntry[];
  mergedFolders: Folder[];
  mergedTombstones: SyncTombstone[];
  hasChanges: boolean;
} {
  // 1. Merge and prune tombstones
  const tombstoneMap = new Map<string, SyncTombstone>();

  for (const t of [...localTombstones, ...(remotePayload.tombstones || [])]) {
    if (!t || !t.id) continue;
    const existing = tombstoneMap.get(t.id);
    if (!existing) {
      tombstoneMap.set(t.id, t);
    } else {
      const existingTime = new Date(existing.deletedAt).getTime();
      const newTime = new Date(t.deletedAt).getTime();
      if (newTime > existingTime) {
        tombstoneMap.set(t.id, t);
      }
    }
  }

  const mergedTombstones = pruneTombstones(Array.from(tombstoneMap.values()));
  const activeTombstoneLookup = new Map<string, number>();
  for (const t of mergedTombstones) {
    activeTombstoneLookup.set(t.id, new Date(t.deletedAt).getTime());
  }

  // 2. Merge Entries
  const entryMap = new Map<string, BookmarkEntry>();

  const processEntry = (entry: BookmarkEntry) => {
    if (!entry || !entry.id) return;

    const entryTime = new Date((entry as any).dateModified || entry.dateAdded || 0).getTime();
    const deletedTime = activeTombstoneLookup.get(entry.id);

    // If deleted after entry was modified, do not include
    if (deletedTime && deletedTime >= entryTime) {
      return;
    }

    if (!entryMap.has(entry.id)) {
      entryMap.set(entry.id, entry);
    } else {
      const current = entryMap.get(entry.id)!;
      const currentTime = new Date((current as any).dateModified || current.dateAdded || 0).getTime();
      if (entryTime >= currentTime) {
        entryMap.set(entry.id, entry);
      }
    }
  };

  for (const item of localEntries) processEntry(item);
  for (const item of remotePayload.entries || []) processEntry(item);

  const mergedEntries = Array.from(entryMap.values());

  // 3. Merge Folders
  const folderMap = new Map<string, Folder>();

  const DEFAULT_FOLDER_IDS = new Set(['all', 'favorites', 'unorganized', 'broken']);

  const processFolder = (folder: Folder) => {
    if (!folder || !folder.id) return;
    const deletedTime = activeTombstoneLookup.get(folder.id);
    if (deletedTime && !DEFAULT_FOLDER_IDS.has(folder.id)) {
      return;
    }

    if (!folderMap.has(folder.id)) {
      folderMap.set(folder.id, folder);
    } else {
      const current = folderMap.get(folder.id)!;
      // Prefer non-empty or newer folder properties
      folderMap.set(folder.id, {
        ...current,
        ...folder
      });
    }
  };

  for (const f of localFolders) processFolder(f);
  for (const f of remotePayload.folders || []) processFolder(f);

  const mergedFolders = Array.from(folderMap.values());

  // 4. Check if anything actually changed from local
  const hasEntriesChanged =
    mergedEntries.length !== localEntries.length ||
    mergedEntries.some((e, i) => localEntries[i]?.id !== e.id || localEntries[i]?.name !== e.name);

  const hasFoldersChanged =
    mergedFolders.length !== localFolders.length ||
    mergedFolders.some((f, i) => localFolders[i]?.id !== f.id || localFolders[i]?.name !== f.name);

  const hasTombstonesChanged = mergedTombstones.length !== localTombstones.length;

  return {
    mergedEntries,
    mergedFolders,
    mergedTombstones,
    hasChanges: hasEntriesChanged || hasFoldersChanged || hasTombstonesChanged
  };
}
