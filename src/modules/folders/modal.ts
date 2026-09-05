import type { Folder, BookmarkEntry } from '../../types';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries, saveFolders } from '../../core/storage';
import { escapeHtml, showToast, getFaviconUrl } from '../../utils/dom';
import { closeEmojiPicker, renderFolderEmojiQuickRow } from './emoji-picker';
import { renderFoldersSidebar, setActiveFolder } from './sidebar';

let inlineFolderCallback: ((id: string) => void) | null = null;

export function openFolderModal(folderId: string | null = null, onCreatedCallback: ((id: string) => void) | null = null): void {
  state.editingFolderId = folderId;
  inlineFolderCallback = typeof onCreatedCallback === 'function' ? onCreatedCallback : null;
  closeEmojiPicker();

  const folderModalTitle = document.getElementById('folderModalTitle');
  const folderNameInput = document.getElementById('folderNameInput') as HTMLInputElement | null;
  const folderIconInput = document.getElementById('folderIconInput') as HTMLInputElement | null;
  const folderColorInput = document.getElementById('folderColorInput') as HTMLInputElement | null;
  const folderIconDisplay = document.getElementById('folderIconDisplay');
  const folderModalBackdrop = document.getElementById('folderModalBackdrop');

  if (folderId) {
    const folder = state.folders.find(f => f.id === folderId);
    if (folder) {
      if (folderModalTitle) folderModalTitle.textContent = 'Edit Folder';
      if (folderNameInput) folderNameInput.value = folder.name || '';
      if (folderIconInput) folderIconInput.value = folder.icon || '📁';
      if (folderColorInput) folderColorInput.value = folder.color || '#0a84ff';
      if (folderIconDisplay) folderIconDisplay.textContent = folder.icon || '📁';
    }
  } else {
    if (folderModalTitle) folderModalTitle.textContent = 'New Folder';
    if (folderNameInput) folderNameInput.value = '';
    if (folderIconInput) folderIconInput.value = '📁';
    if (folderColorInput) folderColorInput.value = '#0a84ff';
    if (folderIconDisplay) folderIconDisplay.textContent = '📁';
  }

  renderFolderEmojiQuickRow();
  if (folderModalBackdrop) {
    folderModalBackdrop.classList.add('active');
  }
  document.body.style.overflow = 'hidden';
  if (folderNameInput) {
    setTimeout(() => folderNameInput.focus(), 60);
  }
}

export function closeFolderModal(): void {
  closeEmojiPicker();
  const folderModalBackdrop = document.getElementById('folderModalBackdrop');
  if (folderModalBackdrop) {
    folderModalBackdrop.classList.remove('active');
  }
  const modalBackdrop = document.getElementById('modalBackdrop');
  const isMainModalActive = modalBackdrop && modalBackdrop.classList.contains('active');
  if (!isMainModalActive) {
    document.body.style.overflow = '';
  }
  inlineFolderCallback = null;
}

export function saveFolderForm(e: Event, onFolderUpdated?: () => void): void {
  e.preventDefault();
  const folderNameInput = document.getElementById('folderNameInput') as HTMLInputElement | null;
  const folderIconInput = document.getElementById('folderIconInput') as HTMLInputElement | null;
  const folderColorInput = document.getElementById('folderColorInput') as HTMLInputElement | null;

  if (!folderNameInput) return;
  const name = folderNameInput.value.trim();
  if (!name) {
    folderNameInput.focus();
    return;
  }
  const icon = (folderIconInput && folderIconInput.value.trim()) || '📁';
  const color = (folderColorInput && folderColorInput.value) || '#0a84ff';

  let createdFolderId: string | null = null;

  if (state.editingFolderId) {
    const folder = state.folders.find(f => f.id === state.editingFolderId);
    if (folder) {
      folder.name = name;
      folder.icon = icon;
      folder.color = color;
      (folder as any).dateModified = new Date().toISOString();
      showToast(`Updated folder "${name}"`);
    }
  } else {
    const newFolder: Folder = {
      id: `f-${Date.now()}`,
      name,
      icon,
      color,
      dateAdded: new Date().toISOString()
    };
    state.folders.push(newFolder);
    createdFolderId = newFolder.id;
    showToast(`Created folder "${name}" 📁`);
  }

  saveFolders();
  const cb = inlineFolderCallback;
  closeFolderModal();
  renderFoldersSidebar(onFolderUpdated);
  if (onFolderUpdated) onFolderUpdated();

  if (createdFolderId && typeof cb === 'function') {
    cb(createdFolderId);
  }
}

let selectedBookmarksToMove = new Set<string>();
let addBmSearchQuery = '';
let addBmSourceFilter = 'all';

export function openAddBookmarksModal(onSuccess?: () => void): void {
  let folder = state.folders.find(f => f.id === state.activeFolderId);
  if (!folder) {
    if (state.folders.length > 0) {
      setActiveFolder(state.folders[0].id, onSuccess);
      folder = state.folders.find(f => f.id === state.activeFolderId);
    } else {
      openFolderModal(null, newFolderId => {
        setActiveFolder(newFolderId, onSuccess);
        openAddBookmarksModal(onSuccess);
      });
      return;
    }
  }
  if (!folder) return;

  selectedBookmarksToMove.clear();
  addBmSearchQuery = '';
  addBmSourceFilter = 'all';

  const addBmSearchInput = document.getElementById('addBmSearchInput') as HTMLInputElement | null;
  const addBmSearchClear = document.getElementById('addBmSearchClear');
  const addBookmarksModalIcon = document.getElementById('addBookmarksModalIcon');
  const addBookmarksModalTitle = document.getElementById('addBookmarksModalTitle');
  const addBmFilterPills = document.getElementById('addBmFilterPills');
  const addBookmarksModalBackdrop = document.getElementById('addBookmarksModalBackdrop');

  if (addBmSearchInput) addBmSearchInput.value = '';
  if (addBmSearchClear) addBmSearchClear.style.display = 'none';

  if (addBookmarksModalIcon) addBookmarksModalIcon.textContent = folder.icon || '📁';
  if (addBookmarksModalTitle) addBookmarksModalTitle.textContent = `Add Bookmarks to "${folder.name}"`;

  if (addBmFilterPills) {
    addBmFilterPills.querySelectorAll('.pill-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-source') === 'all');
    });
  }

  renderAddBookmarksList();

  if (addBookmarksModalBackdrop) {
    addBookmarksModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (addBmSearchInput) addBmSearchInput.focus();
    }, 60);
  }
}

export function closeAddBookmarksModal(): void {
  const addBookmarksModalBackdrop = document.getElementById('addBookmarksModalBackdrop');
  if (addBookmarksModalBackdrop) {
    addBookmarksModalBackdrop.classList.remove('active');
  }
  document.body.style.overflow = '';
}

export function renderAddBookmarksList(): void {
  const addBmListContainer = document.getElementById('addBmListContainer');
  const addBmSubmitBtn = document.getElementById('addBmSubmitBtn') as HTMLButtonElement | null;
  if (!addBmListContainer) return;

  const currentFolder = state.folders.find(f => f.id === state.activeFolderId);
  if (!currentFolder) return;

  let candidates = state.entries.filter(e => e.folderId !== currentFolder.id);

  if (addBmSourceFilter === 'unorganized') {
    candidates = candidates.filter(e => !e.folderId);
  } else if (addBmSourceFilter === 'other') {
    candidates = candidates.filter(e => !!e.folderId);
  }

  const q = addBmSearchQuery.trim().toLowerCase();
  if (q) {
    candidates = candidates.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.url.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
    );
  }

  candidates.sort((a, b) => a.name.localeCompare(b.name));
  addBmListContainer.innerHTML = '';

  if (candidates.length === 0) {
    addBmListContainer.innerHTML = `<div class="add-bm-empty">No available bookmarks found.</div>`;
    if (addBmSubmitBtn) {
      addBmSubmitBtn.disabled = true;
      addBmSubmitBtn.textContent = 'Add Selected (0)';
    }
    return;
  }

  candidates.forEach(entry => {
    const isSelected = selectedBookmarksToMove.has(entry.id);
    const item = document.createElement('div');
    item.className = `add-bm-item ${isSelected ? 'selected' : ''}`;
    item.setAttribute('data-id', entry.id);

    const iconUrl = entry.icon || getFaviconUrl(entry.url);
    const existingFolder = state.folders.find(f => f.id === entry.folderId);
    const folderBadge = existingFolder
      ? `<span class="add-bm-folder-badge">${existingFolder.icon || '📁'} ${escapeHtml(existingFolder.name)}</span>`
      : `<span class="add-bm-folder-badge unorg">Unorganized</span>`;

    item.innerHTML = `
      <input type="checkbox" class="add-bm-checkbox" ${isSelected ? 'checked' : ''}>
      <img class="add-bm-icon" src="${escapeHtml(iconUrl)}" alt="" onerror="this.src='https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(entry.url)}&size=64'">
      <div class="add-bm-info">
        <div class="add-bm-name">${escapeHtml(entry.name)}</div>
        <div class="add-bm-url">${escapeHtml(entry.url)}</div>
      </div>
      ${folderBadge}
    `;

    item.addEventListener('click', e => {
      const cb = item.querySelector('.add-bm-checkbox') as HTMLInputElement | null;
      if (e.target !== cb && cb) {
        cb.checked = !cb.checked;
      }
      if (cb && cb.checked) {
        selectedBookmarksToMove.add(entry.id);
        item.classList.add('selected');
      } else {
        selectedBookmarksToMove.delete(entry.id);
        item.classList.remove('selected');
      }
      updateAddBmSubmitBtn();
    });

    addBmListContainer.appendChild(item);
  });

  updateAddBmSubmitBtn();
}

function updateAddBmSubmitBtn(): void {
  const addBmSubmitBtn = document.getElementById('addBmSubmitBtn') as HTMLButtonElement | null;
  if (!addBmSubmitBtn) return;
  const count = selectedBookmarksToMove.size;
  addBmSubmitBtn.disabled = count === 0;
  addBmSubmitBtn.textContent = `Add Selected (${count})`;
}

export function commitAddBookmarksToFolder(onSuccess?: () => void): void {
  const folder = state.folders.find(f => f.id === state.activeFolderId);
  if (!folder) return;
  const count = selectedBookmarksToMove.size;
  if (count === 0) return;

  const diskList = getLatestStoredEntries();
  diskList.forEach(entry => {
    if (selectedBookmarksToMove.has(entry.id)) {
      entry.folderId = folder.id;
      (entry as any).dateModified = new Date().toISOString();
    }
  });

  saveEntries(diskList);
  closeAddBookmarksModal();
  renderFoldersSidebar(onSuccess);
  if (onSuccess) onSuccess();
  showToast(`Added ${count} bookmark${count !== 1 ? 's' : ''} to "${folder.name}" 📁`);
}

export const confirmMoveBookmarksToFolder = commitAddBookmarksToFolder;

export function setAddBmSearchQuery(q: string): void {
  addBmSearchQuery = q;
}

export function setAddBmSourceFilter(source: string): void {
  addBmSourceFilter = source;
}

export function getFilteredBookmarksToMove(): BookmarkEntry[] {
  const currentFolder = state.folders.find(f => f.id === state.activeFolderId);
  if (!currentFolder) return [];

  let candidates = state.entries.filter(e => e.folderId !== currentFolder.id);

  if (addBmSourceFilter === 'unorganized') {
    candidates = candidates.filter(e => !e.folderId);
  } else if (addBmSourceFilter === 'other') {
    candidates = candidates.filter(e => !!e.folderId);
  }

  const q = addBmSearchQuery.trim().toLowerCase();
  if (q) {
    candidates = candidates.filter(
      e =>
        e.name.toLowerCase().includes(q) ||
        e.url.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
    );
  }

  return candidates;
}

export function selectAllBookmarksToMove(): void {
  const available = getFilteredBookmarksToMove();
  available.forEach(e => selectedBookmarksToMove.add(e.id));
  renderAddBookmarksList();
}

export function deselectAllBookmarksToMove(): void {
  selectedBookmarksToMove.clear();
  renderAddBookmarksList();
}

