import type { Folder, ActiveFolderId } from '../../types';
import { SIDEBAR_STATE_KEY } from '../../core/constants';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries, saveFolders } from '../../core/storage';
import { escapeHtml, showToast } from '../../utils/dom';

export function initSidebar(): void {
  const foldersSidebar = document.getElementById('foldersSidebar');
  const isCollapsed = localStorage.getItem(SIDEBAR_STATE_KEY) === 'true';
  if (foldersSidebar) {
    foldersSidebar.classList.toggle('collapsed', isCollapsed);
  }
}

export function toggleSidebar(): void {
  const foldersSidebar = document.getElementById('foldersSidebar');
  if (!foldersSidebar) return;
  foldersSidebar.classList.toggle('collapsed');
  const isCollapsed = foldersSidebar.classList.contains('collapsed');
  localStorage.setItem(SIDEBAR_STATE_KEY, String(isCollapsed));
}

export function setActiveFolder(folderId: ActiveFolderId, onFolderChanged?: () => void): void {
  state.activeFolderId = folderId;
  renderFoldersSidebar(onFolderChanged);
  if (onFolderChanged) onFolderChanged();
}

export function updateActiveFolderBanner(onFolderChanged?: () => void): void {
  const activeFolderBanner = document.getElementById('activeFolderBanner');
  const folderBannerIcon = document.getElementById('folderBannerIcon');
  const folderBannerTitle = document.getElementById('folderBannerTitle');
  const folderBannerCount = document.getElementById('folderBannerCount');
  const bannerActions = document.getElementById('folderBannerActions');
  if (!activeFolderBanner) return;

  if (activeFolderBanner.style && typeof activeFolderBanner.style.removeProperty === 'function') {
    activeFolderBanner.style.removeProperty('--folder-color');
  }

  if (state.activeFolderId && state.activeFolderId.startsWith('f-')) {
    const folder = state.folders.find(f => f.id === state.activeFolderId);
    if (folder) {
      const folderCount = state.entries.filter(e => e.folderId === folder.id).length;
      if (activeFolderBanner.style && typeof activeFolderBanner.style.setProperty === 'function') {
        activeFolderBanner.style.setProperty('--folder-color', folder.color || '#0a84ff');
      }
      if (folderBannerIcon) folderBannerIcon.textContent = folder.icon || '📁';
      if (folderBannerTitle) folderBannerTitle.textContent = folder.name;
      if (folderBannerCount) folderBannerCount.textContent = `${folderCount} site${folderCount !== 1 ? 's' : ''}`;
      if (bannerActions) bannerActions.style.display = 'flex';
      activeFolderBanner.style.display = 'flex';
      return;
    }
  } else if (state.activeFolderId === 'favorites') {
    const favCount = state.entries.filter(e => e.isFavorite).length;
    if (folderBannerIcon) folderBannerIcon.textContent = '⭐';
    if (folderBannerTitle) folderBannerTitle.textContent = 'Favorites';
    if (folderBannerCount) folderBannerCount.textContent = `${favCount} site${favCount !== 1 ? 's' : ''}`;
    if (bannerActions) bannerActions.style.display = 'none';
    activeFolderBanner.style.display = 'flex';
    return;
  } else if (state.activeFolderId === 'unorganized') {
    const unorgCount = state.entries.filter(e => !e.folderId).length;
    if (folderBannerIcon) folderBannerIcon.textContent = '📂';
    if (folderBannerTitle) folderBannerTitle.textContent = 'Unorganized';
    if (folderBannerCount) folderBannerCount.textContent = `${unorgCount} site${unorgCount !== 1 ? 's' : ''}`;
    if (bannerActions) bannerActions.style.display = 'none';
    activeFolderBanner.style.display = 'flex';
    return;
  } else if (state.activeFolderId === 'broken') {
    const brokenCount = state.entries.filter(e => e.health && e.health.status === 'broken').length;
    if (folderBannerIcon) folderBannerIcon.textContent = '⚠️';
    if (folderBannerTitle) folderBannerTitle.textContent = 'Broken / Offline Links';
    if (folderBannerCount) folderBannerCount.textContent = `${brokenCount} site${brokenCount !== 1 ? 's' : ''}`;
    if (bannerActions) bannerActions.style.display = 'none';
    activeFolderBanner.style.display = 'flex';
    return;
  }

  activeFolderBanner.style.display = 'none';
}

export function setupFolderDropTarget(element: HTMLElement, targetFolderId: string, onDropSuccess?: () => void): void {
  element.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    element.classList.add('drag-over');
  });

  element.addEventListener('dragleave', () => {
    element.classList.remove('drag-over');
  });

  element.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault();
    element.classList.remove('drag-over');
    if (!e.dataTransfer) return;
    const entryId = e.dataTransfer.getData('text/plain');
    if (!entryId) return;

    const diskList = getLatestStoredEntries();
    const entry = diskList.find(item => item.id === entryId);
    if (!entry) return;

    if (targetFolderId === 'favorites') {
      entry.isFavorite = true;
      (entry as any).dateModified = new Date().toISOString();
      saveEntries(diskList);
      if (onDropSuccess) onDropSuccess();
      showToast(`Pinned "${entry.name}" to Favorites ⭐`);
    } else if (targetFolderId === 'unorganized') {
      entry.folderId = null;
      (entry as any).dateModified = new Date().toISOString();
      saveEntries(diskList);
      if (onDropSuccess) onDropSuccess();
      showToast(`Moved "${entry.name}" to Unorganized`);
    } else if (targetFolderId === 'all' || targetFolderId === 'broken') {
      // No folder change needed
    } else {
      const folder = state.folders.find(f => f.id === targetFolderId);
      entry.folderId = targetFolderId;
      (entry as any).dateModified = new Date().toISOString();
      saveEntries(diskList);
      if (onDropSuccess) onDropSuccess();
      showToast(`Moved "${entry.name}" to ${folder ? folder.name : 'folder'} 📁`);
    }
  });
}

export function deleteFolder(folderId: string, onFolderDeleted?: () => void): void {
  const folder = state.folders.find(f => f.id === folderId);
  if (!folder) return;
  if (!confirm(`Delete folder "${folder.name}"? Bookmarks inside will become unorganized.`)) return;

  state.folders = state.folders.filter(f => f.id !== folderId);
  saveFolders(state.folders);

  const diskList = getLatestStoredEntries();
  diskList.forEach(e => {
    if (e.folderId === folderId) {
      e.folderId = null;
      (e as any).dateModified = new Date().toISOString();
    }
  });
  saveEntries(diskList);

  if (state.activeFolderId === folderId) {
    state.activeFolderId = 'all';
  }

  renderFoldersSidebar(onFolderDeleted);
  if (onFolderDeleted) onFolderDeleted();
  showToast(`Deleted folder "${folder.name}"`);
}

export function renderFoldersSidebar(
  onFolderChanged?: () => void,
  onEditFolder?: (id: string) => void
): void {
  const sidebarFoldersList = document.getElementById('sidebarFoldersList');
  const sidebarQuickViews = document.getElementById('sidebarQuickViews');
  const countAll = document.getElementById('countAll');
  const countFavorites = document.getElementById('countFavorites');
  const countUnorganized = document.getElementById('countUnorganized');
  const countBroken = document.getElementById('countBroken');
  const sidebarBrokenView = document.getElementById('sidebarBrokenView');

  if (!sidebarFoldersList) return;

  const diskList = state.entries;
  const allTotal = diskList.length;
  const favTotal = diskList.filter(e => e.isFavorite).length;
  const unorgTotal = diskList.filter(e => !e.folderId).length;
  const brokenTotal = diskList.filter(e => e.health && e.health.status === 'broken').length;

  if (countAll) countAll.textContent = String(allTotal);
  if (countFavorites) countFavorites.textContent = String(favTotal);
  if (countUnorganized) countUnorganized.textContent = String(unorgTotal);
  if (countBroken) countBroken.textContent = String(brokenTotal);
  if (sidebarBrokenView) {
    sidebarBrokenView.style.display = brokenTotal > 0 ? 'flex' : 'none';
  }

  if (sidebarQuickViews) {
    sidebarQuickViews.querySelectorAll('.sidebar-nav-item').forEach(item => {
      const el = item as HTMLElement;
      const fid = el.getAttribute('data-folder-id') || 'all';
      el.classList.toggle('active', fid === state.activeFolderId);
      setupFolderDropTarget(el, fid, onFolderChanged);
    });
  }

  sidebarFoldersList.innerHTML = '';
  state.folders.forEach(folder => {
    const folderCount = diskList.filter(e => e.folderId === folder.id).length;
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `sidebar-nav-item ${state.activeFolderId === folder.id ? 'active' : ''}`;
    item.setAttribute('data-folder-id', folder.id);
    if (folder.color && item.style && typeof item.style.setProperty === 'function') {
      item.style.setProperty('--folder-color', folder.color);
    }

    item.innerHTML = `
      <span class="sidebar-item-icon">${escapeHtml(folder.icon || '📁')}</span>
      <span class="sidebar-item-name">${escapeHtml(folder.name)}</span>
      <span class="sidebar-item-count">${folderCount}</span>
      <div class="sidebar-item-actions">
        <button type="button" class="sidebar-action-btn edit-folder-action" title="Edit folder">✏️</button>
        <button type="button" class="sidebar-action-btn delete-folder-action" title="Delete folder">🗑️</button>
      </div>
    `;

    item.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.closest('.edit-folder-action') || target.closest('.delete-folder-action')) return;
      setActiveFolder(folder.id, onFolderChanged);
    });

    const editBtn = item.querySelector('.edit-folder-action');
    if (editBtn) {
      editBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (onEditFolder) onEditFolder(folder.id);
      });
    }

    const delBtn = item.querySelector('.delete-folder-action');
    if (delBtn) {
      delBtn.addEventListener('click', e => {
        e.stopPropagation();
        deleteFolder(folder.id, onFolderChanged);
      });
    }

    setupFolderDropTarget(item, folder.id, onFolderChanged);
    sidebarFoldersList.appendChild(item);
  });

  updateActiveFolderBanner(onFolderChanged);
}

export function populateFolderSelect(selectedId = ''): void {
  const entryFolder = document.getElementById('entryFolder') as HTMLSelectElement | null;
  if (!entryFolder) return;
  entryFolder.innerHTML = '<option value="">📂 None (Unorganized)</option>';
  state.folders.forEach(folder => {
    const opt = document.createElement('option');
    opt.value = folder.id;
    opt.textContent = `${folder.icon || '📁'} ${folder.name}`;
    if (selectedId && folder.id === selectedId) {
      opt.selected = true;
    }
    entryFolder.appendChild(opt);
  });
}
