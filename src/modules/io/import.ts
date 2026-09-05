import type { BookmarkEntry, Folder } from '../../types';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries, saveFolders } from '../../core/storage';
import { generateId, ensureProtocol, getFaviconUrl, showToast } from '../../utils/dom';
import { parseNetscapeBookmarks, normalizeUrlForDuplicateCheck } from './browser-importer';

export function importData(file: File, onImportSuccess?: () => void): void {
  const reader = new FileReader();
  reader.onerror = err => {
    console.error('[Import] FileReader error:', err);
    showToast('Error: Failed to read file from disk.');
  };
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const content = e.target?.result as string;
    if (!content) return;

    const trimmed = content.trim();
    const isExplicitJson = file.name && file.name.toLowerCase().endsWith('.json');
    const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[');
    const isExplicitHtml = file.name && (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm'));
    const looksLikeHtml = /<!doctype\s+netscape|<title>bookmarks|<h1[^>]*>bookmarks|<dl/i.test(content);

    const isHtml = isExplicitHtml || (!isExplicitJson && !looksLikeJson && looksLikeHtml);

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
      } catch (err: any) {
        console.error('[Import] HTML Parse Error:', err);
        showToast(`Error: ${err?.message || 'Failed to parse browser bookmarks file.'}`);
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
        throw new Error('Invalid format: File does not contain bookmark entries or folders.');
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
          // Use canonical iconUrl; avoid duplicating huge data URLs in both icon and iconUrl
          const resolvedIcon = item.iconUrl || item.icon || getFaviconUrl(item.url);
          diskList.push({
            id: item.id || generateId(),
            name: item.name,
            url: ensureProtocol(item.url),
            description: item.description || '',
            iconUrl: resolvedIcon,
            folderId: item.folderId || null,
            categories: cats,
            dateAdded: item.dateAdded || new Date().toISOString(),
            dateModified: item.dateModified || item.dateAdded || new Date().toISOString(),
            visitCount: item.visitCount || 0,
            lastVisited: item.lastVisited || null,
            isFavorite: item.isFavorite || false,
            health: item.health
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
    } catch (err: any) {
      console.error('[Import] Error parsing or saving backup file:', err);
      if (err && (err.name === 'QuotaExceededError' || (typeof err.message === 'string' && err.message.toLowerCase().includes('quota')))) {
        showToast('Error: Browser storage limit reached. Backup is too large.');
      } else {
        showToast(`Error: ${err?.message || 'Invalid JSON or bookmarks file.'}`);
      }
    }
  };
  reader.readAsText(file);
}
