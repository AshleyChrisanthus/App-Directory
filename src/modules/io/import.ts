import type { BookmarkEntry, Folder } from '../../types';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries, saveFolders } from '../../core/storage';
import { generateId, ensureProtocol, getFaviconUrl, showToast } from '../../utils/dom';
import { parseNetscapeBookmarks, normalizeUrlForDuplicateCheck } from './browser-importer';

export function importData(file: File, onImportSuccess?: () => void): void {
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const content = e.target?.result as string;
    if (!content) return;

    const isHtml =
      (file.name && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) ||
      /<!doctype\s+netscape|<title>bookmarks|<h1[^>]*>bookmarks|<dl/i.test(content);

    if (isHtml) {
      try {
        const { importedEntries, newFolders } = parseNetscapeBookmarks(content, state.folders);

        if (importedEntries.length === 0 && newFolders.length === 0) {
          showToast('No valid bookmarks found in browser export.');
          return;
        }

        let addedFoldersCount = 0;
        if (newFolders.length > 0) {
          newFolders.forEach(nf => {
            if (!state.folders.some(existing => existing.name.toLowerCase() === nf.name.toLowerCase())) {
              state.folders.push(nf);
              addedFoldersCount++;
            }
          });
          if (addedFoldersCount > 0) {
            saveFolders(state.folders, false);
          }
        }

        const diskList = getLatestStoredEntries();
        const existingNormalizedUrls = new Set(diskList.map(item => normalizeUrlForDuplicateCheck(item.url)));
        let importedCount = 0;

        importedEntries.forEach(item => {
          const norm = normalizeUrlForDuplicateCheck(item.url);
          if (!existingNormalizedUrls.has(norm)) {
            diskList.push(item);
            existingNormalizedUrls.add(norm);
            importedCount++;
          }
        });

        saveEntries(diskList);
        if (onImportSuccess) onImportSuccess();

        const skippedCount = importedEntries.length - importedCount;
        const folderPart = addedFoldersCount > 0 ? ` and ${addedFoldersCount} folder${addedFoldersCount !== 1 ? 's' : ''}` : '';
        showToast(
          `Imported ${importedCount} site${importedCount !== 1 ? 's' : ''}${folderPart} from browser bookmarks (${skippedCount} duplicate${
            skippedCount !== 1 ? 's' : ''
          } skipped).`
        );
      } catch (err) {
        console.error('[Import] HTML Parse Error:', err);
        showToast('Error: Failed to parse browser bookmarks file.');
      }
      return;
    }

    // Standard JSON parser
    try {
      const parsed = JSON.parse(content);
      let importedEntries: any[] = [];
      let importedFolders: Folder[] = [];

      if (Array.isArray(parsed)) {
        importedEntries = parsed;
      } else if (parsed && typeof parsed === 'object') {
        importedEntries = Array.isArray(parsed.entries) ? parsed.entries : [];
        importedFolders = Array.isArray(parsed.folders) ? parsed.folders : [];
      } else {
        throw new Error('Invalid format');
      }

      const valid = importedEntries.filter(item => item && item.name && item.url);
      if (valid.length === 0 && importedFolders.length === 0) {
        showToast('No valid entries or folders found in file.');
        return;
      }

      if (importedFolders.length > 0) {
        importedFolders.forEach(f => {
          if (f && f.id && f.name) {
            if (!state.folders.some(existing => existing.id === f.id)) {
              state.folders.push(f);
            }
          }
        });
        saveFolders(state.folders, false);
      }

      const diskList = getLatestStoredEntries();
      const existingNormalizedUrls = new Set(diskList.map(item => normalizeUrlForDuplicateCheck(item.url)));
      let imported = 0;

      valid.forEach(item => {
        const norm = normalizeUrlForDuplicateCheck(item.url);
        if (!existingNormalizedUrls.has(norm)) {
          let cats = item.categories || [];
          if (!Array.isArray(cats) || cats.length === 0) {
            if (item.category && typeof item.category === 'string') {
              cats = [item.category.trim()];
            } else {
              cats = [];
            }
          }
          const resolvedIcon = item.icon || item.iconUrl || getFaviconUrl(item.url);
          diskList.push({
            id: item.id || generateId(),
            name: item.name,
            url: ensureProtocol(item.url),
            description: item.description || '',
            icon: resolvedIcon,
            iconUrl: resolvedIcon,
            folderId: item.folderId || null,
            categories: cats,
            dateAdded: item.dateAdded || new Date().toISOString(),
            visitCount: item.visitCount || 0,
            lastVisited: item.lastVisited || null,
            isFavorite: item.isFavorite || false
          });
          existingNormalizedUrls.add(norm);
          imported++;
        }
      });

      saveEntries(diskList);
      if (onImportSuccess) onImportSuccess();
      showToast(
        `Imported ${imported} new site${imported !== 1 ? 's' : ''} (${valid.length - imported} duplicate${
          valid.length - imported !== 1 ? 's' : ''
        } skipped).`
      );
    } catch {
      showToast('Error: Invalid JSON or bookmarks file.');
    }
  };
  reader.readAsText(file);
}
