import type { BookmarkEntry } from '../../types';
import { state } from '../../core/state';
import { STORAGE_KEY } from '../../core/constants';
import { getLatestStoredEntries, saveEntries, notifyOtherTabs } from '../../core/storage';
import {
  escapeHtml,
  showToast,
  generateId,
  ensureProtocol,
  getFaviconUrl
} from '../../utils/dom';
import { urlToDataUrl } from '../../utils/icon-converter';
import { fetchWebsiteMetadata } from '../../utils/auto-fill';
import { renderIconCandidates, getCandidateSources } from '../icons/picker';
import { updatePendingIconsUI } from '../icons/refresh';
import { renderCategoryChips, hideCategorySuggestions } from '../categories/manager';
import { populateFolderSelect } from '../folders/sidebar';

let lastAutoDetectedUrl = '';
let isAutoDetecting = false;

export async function autoFillUrlMetadata(force: boolean = false, overwriteTitle: boolean = false): Promise<void> {
  const entryUrl = document.getElementById('entryUrl') as HTMLInputElement | null;
  const entryName = document.getElementById('entryName') as HTMLInputElement | null;
  const entryIcon = document.getElementById('entryIcon') as HTMLInputElement | null;
  const entryDescription = document.getElementById('entryDescription') as HTMLTextAreaElement | null;
  const entryIconPreview = document.getElementById('entryIconPreview');
  const iconCandidatesWrapper = document.getElementById('iconCandidatesWrapper');
  const urlAutofillStatus = document.getElementById('urlAutofillStatus');
  const autoDetectBtn = document.getElementById('autoDetectBtn') as HTMLButtonElement | null;

  if (!entryUrl) return;
  const rawUrl = entryUrl.value.trim();
  if (!rawUrl || (!rawUrl.includes('.') && !rawUrl.startsWith('localhost'))) {
    if (iconCandidatesWrapper) iconCandidatesWrapper.style.display = 'none';
    return;
  }

  // Immediately render candidate options with Google HD selected by default in position 1
  renderIconCandidates(rawUrl, '', 'google');

  if (!force && rawUrl === lastAutoDetectedUrl) {
    return;
  }

  if (isAutoDetecting) return;
  isAutoDetecting = true;
  lastAutoDetectedUrl = rawUrl;

  if (urlAutofillStatus) {
    urlAutofillStatus.className = 'url-autofill-status loading';
    urlAutofillStatus.textContent = '🪄 Detecting info…';
    urlAutofillStatus.style.display = 'inline-flex';
  }

  if (autoDetectBtn) autoDetectBtn.disabled = true;

  try {
    const meta = await fetchWebsiteMetadata(rawUrl);
    if (meta) {
      const currentName = entryName ? entryName.value.trim() : '';
      if (meta.title && (overwriteTitle || !currentName)) {
        if (entryName) entryName.value = meta.title;
      }

      const currentDesc = entryDescription ? entryDescription.value.trim() : '';
      if (meta.description && !currentDesc) {
        if (entryDescription) entryDescription.value = meta.description;
      }

      // Re-render candidates with any scraped high-res icon
      renderIconCandidates(rawUrl, meta.iconUrl, 'google');

      const currentIcon = entryIcon ? entryIcon.value.trim() : '';
      if (force || !currentIcon) {
        const googleCand = getCandidateSources(rawUrl, meta.iconUrl).find(c => c.id === 'google');
        const defaultSrc = googleCand ? googleCand.iconSrc : meta.iconUrl;
        if (entryIcon) entryIcon.value = defaultSrc;
        if (entryIconPreview) {
          entryIconPreview.innerHTML = `<img src="${escapeHtml(defaultSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
        }
      }

      if (urlAutofillStatus) {
        urlAutofillStatus.className = 'url-autofill-status success';
        urlAutofillStatus.textContent = `✓ ${meta.title ? meta.title.slice(0, 24) + (meta.title.length > 24 ? '…' : '') : 'Detected'}`;
        setTimeout(() => {
          if (urlAutofillStatus.className.includes('success')) {
            urlAutofillStatus.style.display = 'none';
          }
        }, 3500);
      }
    }
  } catch {
    if (urlAutofillStatus) {
      urlAutofillStatus.style.display = 'none';
    }
  } finally {
    isAutoDetecting = false;
    if (autoDetectBtn) autoDetectBtn.disabled = false;
  }
}

export function updateModalIconPreview(): void {
  const entryIconPreview = document.getElementById('entryIconPreview');
  const entryIcon = document.getElementById('entryIcon') as HTMLInputElement | null;
  const entryUrl = document.getElementById('entryUrl') as HTMLInputElement | null;
  if (!entryIconPreview) return;

  const custom = entryIcon?.value.trim() || '';
  const url = entryUrl?.value.trim() || '';
  const resolved = custom || (url ? getFaviconUrl(url) : '');

  if (resolved) {
    entryIconPreview.innerHTML = `<img src="${escapeHtml(resolved)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
  } else {
    entryIconPreview.innerHTML = '<span class="icon-fallback">🌐</span>';
  }
}

export interface InitialModalData {
  name?: string;
  url?: string;
  description?: string;
  folderId?: string;
  categories?: string[];
}

export function openModal(id: string | null = null, initialData?: InitialModalData): void {
  state.editingId = id;
  lastAutoDetectedUrl = '';
  const urlAutofillStatus = document.getElementById('urlAutofillStatus');
  const modalTitle = document.getElementById('modalTitle');
  const saveBtn = document.getElementById('saveBtn');
  const entryName = document.getElementById('entryName') as HTMLInputElement | null;
  const entryUrl = document.getElementById('entryUrl') as HTMLInputElement | null;
  const entryIcon = document.getElementById('entryIcon') as HTMLInputElement | null;
  const entryDescription = document.getElementById('entryDescription') as HTMLTextAreaElement | null;
  const entryFavorite = document.getElementById('entryFavorite') as HTMLInputElement | null;
  const entryForm = document.getElementById('entryForm') as HTMLFormElement | null;
  const iconCandidatesWrapper = document.getElementById('iconCandidatesWrapper');
  const entryCategory = document.getElementById('entryCategory') as HTMLInputElement | null;
  const modalBackdrop = document.getElementById('modalBackdrop');

  if (urlAutofillStatus) urlAutofillStatus.style.display = 'none';

  if (id) {
    const entry = state.entries.find(e => e.id === id);
    if (!entry) return;
    if (modalTitle) modalTitle.textContent = 'Edit Website';
    if (saveBtn) saveBtn.textContent = 'Update';
    if (entryName) entryName.value = entry.name || '';
    if (entryUrl) entryUrl.value = entry.url || '';
    populateFolderSelect(entry.folderId || '');
    state.selectedCategories = [...(entry.categories || [])];
    const icon = entry.icon || (entry as any).iconUrl || '';
    if (entryIcon) entryIcon.value = icon;
    if (entryDescription) entryDescription.value = entry.description || '';
    if (entryFavorite) entryFavorite.checked = entry.isFavorite || false;
    renderIconCandidates(entry.url, icon, 'google');
  } else {
    if (modalTitle) modalTitle.textContent = 'Add Website';
    if (saveBtn) saveBtn.textContent = 'Save';
    if (entryForm) entryForm.reset();
    const defaultFid = initialData?.folderId || (state.activeFolderId && state.activeFolderId.startsWith('f-') ? state.activeFolderId : '');
    populateFolderSelect(defaultFid);
    state.selectedCategories = initialData?.categories ? [...initialData.categories] : [];
    if (iconCandidatesWrapper) iconCandidatesWrapper.style.display = 'none';

    if (initialData) {
      if (entryName && initialData.name) entryName.value = initialData.name;
      if (entryDescription && initialData.description) entryDescription.value = initialData.description;
      if (entryUrl && initialData.url) {
        entryUrl.value = initialData.url;
        autoFillUrlMetadata(true, false);
      }
    }
  }

  if (entryCategory) entryCategory.value = '';
  hideCategorySuggestions();
  renderCategoryChips();
  updateModalIconPreview();

  // Clear validation
  if (entryForm) {
    entryForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }

  if (modalBackdrop) modalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    if (entryUrl) {
      entryUrl.focus();
      if (entryUrl.select) entryUrl.select();
    }
  }, 100);
}

export function closeModal(): void {
  hideCategorySuggestions();
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (modalBackdrop) modalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
  state.editingId = null;
}

export async function addEntry(data: {
  name: string;
  url: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  folderId?: string | null;
  categories?: string[];
  isFavorite?: boolean;
}, onUpdate?: () => void): Promise<void> {
  const now = new Date().toISOString();
  const rawIcon = data.icon || data.iconUrl || getFaviconUrl(data.url);
  const entry: BookmarkEntry = {
    id: generateId(),
    name: data.name,
    url: ensureProtocol(data.url),
    description: data.description || '',
    iconUrl: rawIcon,
    folderId: data.folderId || null,
    categories: data.categories || [],
    dateAdded: now,
    dateModified: now,
    visitCount: 0,
    lastVisited: null,
    isFavorite: data.isFavorite || false
  };

  const diskList = getLatestStoredEntries();
  diskList.push(entry);
  state.entries = diskList;
  saveEntries(diskList);
  if (onUpdate) onUpdate();
  showToast(`"${entry.name}" added!`);

  // Asynchronously convert and cache icon offline as Data URL
  const targetIcon = entry.iconUrl || entry.icon;
  if (targetIcon && !targetIcon.startsWith('data:')) {
    const permanentDataUrl = await urlToDataUrl(targetIcon);
    if (permanentDataUrl && permanentDataUrl.startsWith('data:')) {
      const latest = getLatestStoredEntries();
      const target = latest.find(e => e.id === entry.id);
      if (target) {
        target.iconUrl = permanentDataUrl;
        delete target.icon;
        saveEntries(latest);
        // In-place DOM update (avoids full grid destroy & flash)
        const grid = document.getElementById('grid');
        const card = grid ? grid.querySelector(`.card[data-id="${entry.id}"]`) : null;
        if (card) {
          const iconDiv = card.querySelector('.card-icon:not(.new-icon-preview)');
          if (iconDiv) {
            iconDiv.innerHTML = `<img src="${escapeHtml(permanentDataUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
          }
        }
      }
    }
  }
}

export async function updateEntry(id: string, data: {
  name: string;
  url: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  folderId?: string | null;
  categories?: string[];
  isFavorite?: boolean;
}, onUpdate?: () => void): Promise<void> {
  const diskList = getLatestStoredEntries();
  const rawIcon = data.icon || data.iconUrl || getFaviconUrl(data.url);
  let target = diskList.find(e => e.id === id);

  if (!target) {
    target = {
      id,
      name: data.name,
      url: ensureProtocol(data.url),
      description: data.description || '',
      iconUrl: rawIcon,
      folderId: data.folderId || null,
      categories: data.categories || [],
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      visitCount: 0,
      lastVisited: null,
      isFavorite: data.isFavorite || false
    };
    diskList.push(target);
  } else {
    target.name = data.name;
    target.url = ensureProtocol(data.url);
    target.description = data.description || '';
    target.iconUrl = rawIcon;
    delete target.icon;
    target.folderId = data.folderId !== undefined ? data.folderId : (target.folderId || null);
    target.categories = data.categories || [];
    target.isFavorite = data.isFavorite || false;
    target.dateModified = new Date().toISOString();
  }

  const finalTarget: BookmarkEntry = target;
  state.entries = diskList;
  saveEntries(diskList);
  if (onUpdate) onUpdate();
  showToast(`"${finalTarget.name}" updated!`);

  if (state.pendingIcons.has(id)) {
    state.pendingIcons.delete(id);
    updatePendingIconsUI();
  }

  // Asynchronously convert and cache icon offline as Data URL
  const targetIcon = finalTarget.iconUrl || finalTarget.icon;
  if (targetIcon && !targetIcon.startsWith('data:')) {
    const permanentDataUrl = await urlToDataUrl(targetIcon);
    if (permanentDataUrl && permanentDataUrl.startsWith('data:')) {
      const latest = getLatestStoredEntries();
      const item = latest.find(e => e.id === id);
      if (item) {
        item.iconUrl = permanentDataUrl;
        delete item.icon;
        saveEntries(latest);
        const grid = document.getElementById('grid');
        const card = grid ? grid.querySelector(`.card[data-id="${id}"]`) : null;
        if (card) {
          const iconDiv = card.querySelector('.card-icon:not(.new-icon-preview)');
          if (iconDiv) {
            iconDiv.innerHTML = `<img src="${escapeHtml(permanentDataUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
          }
        }
      }
    }
  }
}

export function deleteEntry(id: string, onUpdate?: () => void): void {
  const entry = state.entries.find(e => e.id === id);
  if (!entry) return;
  if (!confirm(`Delete "${entry.name}"?`)) return;

  if (state.pendingIcons.has(id)) {
    state.pendingIcons.delete(id);
    updatePendingIconsUI();
  }

  const diskList = getLatestStoredEntries();
  const filtered = diskList.filter(e => e.id !== id);
  saveEntries(filtered);
  showToast(`"${entry.name}" deleted.`);
  if (onUpdate) onUpdate();
}

export function toggleFavorite(id: string, onUpdate?: () => void): void {
  const diskList = getLatestStoredEntries();
  const entry = diskList.find(e => e.id === id);
  if (!entry) return;
  entry.isFavorite = !entry.isFavorite;
  (entry as any).dateModified = new Date().toISOString();
  saveEntries(diskList);
  if (onUpdate) onUpdate();
}

export function visitEntry(id: string, onUpdate?: () => void): void {
  const diskList = getLatestStoredEntries();
  const entry = diskList.find(e => e.id === id);
  if (!entry) return;
  entry.visitCount = (entry.visitCount || 0) + 1;
  entry.lastVisited = new Date().toISOString();
  (entry as any).dateModified = new Date().toISOString();
  saveEntries(diskList);
  window.open(entry.url, '_blank', 'noopener,noreferrer');
  if (onUpdate) onUpdate();
}
