import type { BookmarkEntry, Folder } from '../../types';
import type { DecryptedSyncPayload, SyncTombstone } from './types';
import { getEntryFolderIds, syncLegacyFolderFields, SPECIAL_FOLDER_IDS } from '../../utils/collections';

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

    const normalized = syncLegacyFolderFields(
      { ...entry },
      getEntryFolderIds(entry),
      Boolean(entry.hiddenFromMain)
    );

    const entryTime = new Date((normalized as any).dateModified || normalized.dateAdded || 0).getTime();
    const deletedTime = activeTombstoneLookup.get(normalized.id);

    // If deleted after entry was modified, do not include
    if (deletedTime && deletedTime >= entryTime) {
      return;
    }

    if (!entryMap.has(normalized.id)) {
      entryMap.set(normalized.id, normalized);
    } else {
      const current = entryMap.get(normalized.id)!;
      const currentTime = new Date((current as any).dateModified || current.dateAdded || 0).getTime();
      if (entryTime >= currentTime) {
        entryMap.set(normalized.id, normalized);
      }
    }
  };

  for (const item of localEntries) processEntry(item);
  for (const item of remotePayload.entries || []) processEntry(item);

  const mergedEntries = Array.from(entryMap.values());

  // 3. Merge Folders
  const folderMap = new Map<string, Folder>();

  const processFolder = (folder: Folder) => {
    if (!folder || !folder.id) return;
    const deletedTime = activeTombstoneLookup.get(folder.id);
    if (deletedTime && !SPECIAL_FOLDER_IDS.has(folder.id)) {
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
    mergedEntries.some((e, i) => {
      const loc = localEntries[i];
      if (!loc) return true;
      return (
        loc.id !== e.id ||
        loc.name !== e.name ||
        loc.url !== e.url ||
        JSON.stringify(getEntryFolderIds(loc)) !== JSON.stringify(getEntryFolderIds(e)) ||
        Boolean(loc.hiddenFromMain) !== Boolean(e.hiddenFromMain) ||
        loc.isFavorite !== e.isFavorite ||
        loc.description !== e.description ||
        (loc as any).dateModified !== (e as any).dateModified ||
        JSON.stringify(loc.categories || []) !== JSON.stringify(e.categories || [])
      );
    });

  const hasFoldersChanged =
    mergedFolders.length !== localFolders.length ||
    mergedFolders.some((f, i) => {
      const loc = localFolders[i];
      if (!loc) return true;
      return (
        loc.id !== f.id ||
        loc.name !== f.name ||
        loc.icon !== f.icon ||
        loc.color !== f.color ||
        (loc as any).dateModified !== (f as any).dateModified
      );
    });

  const hasTombstonesChanged = mergedTombstones.length !== localTombstones.length;

  return {
    mergedEntries,
    mergedFolders,
    mergedTombstones,
    hasChanges: hasEntriesChanged || hasFoldersChanged || hasTombstonesChanged
  };
}
