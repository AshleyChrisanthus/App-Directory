export const SPECIAL_FOLDER_IDS = new Set(['all', 'favorites', 'unorganized', 'broken']);

export interface CollectionMembershipLike {
  folderIds?: string[];
  folderId?: string | null;
  hiddenFromMain?: boolean;
}

/** Returns true when `id` identifies a user collection rather than a virtual sidebar view. */
export function isUserCollectionId(id?: string | null): id is string {
  return Boolean(id) && !SPECIAL_FOLDER_IDS.has(id as string);
}

/**
 * Extracts normalized, deduplicated collection IDs from an entry,
 * supporting backward-compatible migration from legacy single `folderId`.
 */
export function getEntryFolderIds(entry?: CollectionMembershipLike | null): string[] {
  if (!entry) return [];

  if (Array.isArray(entry.folderIds)) {
    const seen = new Set<string>();
    const clean: string[] = [];
    for (const raw of entry.folderIds) {
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (trimmed && !seen.has(trimmed)) {
          seen.add(trimmed);
          clean.push(trimmed);
        }
      }
    }
    return clean;
  }

  if (typeof entry.folderId === 'string' && entry.folderId.trim()) {
    return [entry.folderId.trim()];
  }

  return [];
}

/** Checks whether a bookmark belongs to the given collection ID. */
export function entryBelongsToCollection(
  entry: CollectionMembershipLike,
  folderId: string
): boolean {
  return getEntryFolderIds(entry).includes(folderId);
}

/**
 * Updates `folderIds`, mirrors legacy `folderId` to the first collection (or null),
 * and enforces the orphan auto-unhide invariant when no collections remain.
 */
export function syncLegacyFolderFields<T extends CollectionMembershipLike>(
  entry: T,
  folderIds: string[],
  hiddenFromMain?: boolean
): T {
  const seen = new Set<string>();
  const cleanIds: string[] = [];
  for (const raw of folderIds) {
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        cleanIds.push(trimmed);
      }
    }
  }

  entry.folderIds = cleanIds;
  entry.folderId = cleanIds[0] ?? null;
  entry.hiddenFromMain = cleanIds.length > 0 ? Boolean(hiddenFromMain ?? entry.hiddenFromMain) : false;

  return entry;
}
