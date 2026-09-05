import type { BookmarkEntry, Folder } from '../../types';
import { generateId, ensureProtocol, getFaviconUrl } from '../../utils/dom';

export function decodeHtmlEntities(str?: string | null): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function normalizeUrlForDuplicateCheck(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const clean = ensureProtocol(rawUrl.trim());
  try {
    const parsed = new URL(clean);
    let path = parsed.pathname;
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${path}${parsed.search}${parsed.hash}`;
  } catch {
    return clean.toLowerCase().replace(/\/+$/, '');
  }
}

export interface NetscapeParseResult {
  importedEntries: BookmarkEntry[];
  newFolders: Folder[];
}

export function parseNetscapeBookmarks(htmlContent: string, existingFolders: Folder[] = []): NetscapeParseResult {
  const importedEntries: BookmarkEntry[] = [];
  const newFolders: Folder[] = [];
  const folderStack: (string | null)[] = [];
  let pendingFolderName: string | null = null;

  const systemFolders = new Set([
    'bookmarks bar',
    'bookmarksbar',
    'bookmarks toolbar',
    'bookmarkstoolbar',
    'bookmarks menu',
    'bookmarksmenu',
    'favorites bar',
    'favoritesbar',
    'other bookmarks',
    'otherbookmarks',
    'other favorites',
    'otherfavorites',
    'mobile bookmarks',
    'mobilebookmarks',
    'imported',
    'bookmarks'
  ]);

  const tagRegex = /<(\/?(?:H3|A|DL|DD))([^>]*)>([^<]*)/gi;
  let match: RegExpExecArray | null;
  let lastEntry: BookmarkEntry | null = null;

  while ((match = tagRegex.exec(htmlContent)) !== null) {
    const rawTag = match[1].toUpperCase();
    const attrs = match[2];
    const text = decodeHtmlEntities(match[3].trim());

    if (rawTag === 'H3') {
      pendingFolderName = text || 'Untitled Folder';
      if (pendingFolderName && !systemFolders.has(pendingFolderName.toLowerCase())) {
        const existsInApp = existingFolders.some(f => f.name.toLowerCase() === pendingFolderName!.toLowerCase());
        const existsInNew = newFolders.some(f => f.name.toLowerCase() === pendingFolderName!.toLowerCase());
        if (!existsInApp && !existsInNew) {
          newFolders.push({
            id: generateId(),
            name: pendingFolderName,
            icon: '📁',
            color: '#0a84ff',
            dateAdded: new Date().toISOString()
          });
        }
      }
      lastEntry = null;
    } else if (rawTag === 'DL') {
      if (pendingFolderName) {
        folderStack.push(pendingFolderName);
        pendingFolderName = null;
      } else {
        folderStack.push(null);
      }
      lastEntry = null;
    } else if (rawTag === '/DL') {
      if (folderStack.length > 0) {
        folderStack.pop();
      }
      lastEntry = null;
    } else if (rawTag === 'A') {
      const hrefMatch = attrs.match(/HREF=["']([^"']+)["']/i);
      if (!hrefMatch) continue;
      const rawUrl = decodeHtmlEntities(hrefMatch[1].trim());
      if (!rawUrl || rawUrl.toLowerCase().startsWith('javascript:') || rawUrl.toLowerCase().startsWith('place:')) continue;

      const title = text || rawUrl;

      const iconMatch = attrs.match(/ICON(?:_URI)?=["']([^"']+)["']/i);
      let iconUrl: string | null = null;
      if (iconMatch) {
        iconUrl = iconMatch[1].trim();
      }

      const dateMatch = attrs.match(/ADD_DATE=["']([0-9]+)["']/i);
      let dateAdded = new Date().toISOString();
      if (dateMatch) {
        const sec = parseInt(dateMatch[1], 10);
        if (!isNaN(sec) && sec > 0) {
          dateAdded = new Date(sec * 1000).toISOString();
        }
      }

      const activeFolderNames = folderStack.filter((f): f is string => !!f && !systemFolders.has(f.toLowerCase()));
      const categories = [...activeFolderNames];

      const tagsMatch = attrs.match(/TAGS=["']([^"']+)["']/i);
      if (tagsMatch) {
        const ffTags = decodeHtmlEntities(tagsMatch[1])
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);
        ffTags.forEach(tag => {
          if (!categories.some(c => c.toLowerCase() === tag.toLowerCase())) {
            categories.push(tag);
          }
        });
      }

      const immediateFolderName = [...activeFolderNames].reverse()[0] || null;
      let matchedFolderId: string | null = null;
      if (immediateFolderName) {
        const inApp = existingFolders.find(f => f.name.toLowerCase() === immediateFolderName.toLowerCase());
        if (inApp) {
          matchedFolderId = inApp.id;
        } else {
          const inNew = newFolders.find(f => f.name.toLowerCase() === immediateFolderName.toLowerCase());
          if (inNew) matchedFolderId = inNew.id;
        }
      }

      const resolvedIcon = iconUrl || getFaviconUrl(rawUrl);
      const entry: BookmarkEntry = {
        id: generateId(),
        name: title,
        url: ensureProtocol(rawUrl),
        description: '',
        icon: resolvedIcon,
        iconUrl: resolvedIcon,
        folderId: matchedFolderId,
        categories: categories,
        dateAdded: dateAdded,
        visitCount: 0,
        lastVisited: null,
        isFavorite: false
      };

      importedEntries.push(entry);
      lastEntry = entry;
    } else if (rawTag === 'DD' && lastEntry) {
      lastEntry.description = text;
    }
  }

  return { importedEntries, newFolders };
}
