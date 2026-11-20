import type { Folder, ActiveFolderId } from '../../types';
import { SIDEBAR_STATE_KEY } from '../../core/constants';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries, saveFolders } from '../../core/storage';
import { escapeHtml, showToast } from '../../utils/dom';
import {
  isUserCollectionId,
  getEntryFolderIds,
  entryBelongsToCollection,
  syncLegacyFolderFields
} from '../../utils/collections';
import { openFolderModal } from './modal';

export function initSidebar(): void {
  const foldersSidebar = document.getElementById('foldersSidebar');
  const backdrop = document.getElementById('mobileSidebarBackdrop');
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const isCollapsed = isMobile ? true : localStorage.getItem(SIDEBAR_STATE_KEY) === 'true';
  if (foldersSidebar) {
    foldersSidebar.classList.toggle('collapsed', isCollapsed);
  }
  if (backdrop) {
    backdrop.classList.remove('active');
  }
}

export function openMobileFoldersDrawer(): void {
  const foldersSidebar = document.getElementById('foldersSidebar');
  const backdrop = document.getElementById('mobileSidebarBackdrop');
  const navTabFolders = document.getElementById('navTabFolders');
  if (!foldersSidebar) return;
  foldersSidebar.classList.remove('collapsed');
  if (backdrop) backdrop.classList.add('active');
  if (navTabFolders) navTabFolders.classList.add('is-active');
}

export function closeMobileFoldersDrawer(): void {
  const foldersSidebar = document.getElementById('foldersSidebar');
  const backdrop = document.getElementById('mobileSidebarBackdrop');
  const navTabFolders = document.getElementById('navTabFolders');
  if (!foldersSidebar) return;
  foldersSidebar.classList.add('collapsed');
  if (backdrop) backdrop.classList.remove('active');
  if (navTabFolders && !isUserCollectionId(state.activeFolderId)) {
    navTabFolders.classList.remove('is-active');
  }
}

export function toggleSidebar(): void {
  const foldersSidebar = document.getElementById('foldersSidebar');
  const backdrop = document.getElementById('mobileSidebarBackdrop');
  if (!foldersSidebar) return;
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  if (isMobile) {
    if (foldersSidebar.classList.contains('collapsed')) {
      openMobileFoldersDrawer();
    } else {
      closeMobileFoldersDrawer();
    }
    return;
  }
  foldersSidebar.classList.toggle('collapsed');
  const isCollapsed = foldersSidebar.classList.contains('collapsed');
  localStorage.setItem(SIDEBAR_STATE_KEY, String(isCollapsed));
  if (backdrop) backdrop.classList.toggle('active', !isCollapsed && isMobile);
}

export function setActiveFolder(folderId: ActiveFolderId, onFolderChanged?: () => void): void {
  state.activeFolderId = folderId;
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    closeMobileFoldersDrawer();
  }
  if (onFolderChanged) {
    onFolderChanged();
  } else {
    renderFoldersSidebar();
  }
}

export function updateActiveFolderBanner(onFolderChanged?: () => void): void {
  const activeFolderBanner = document.getElementById('activeFolderBanner');
  const folderBannerIcon = document.getElementById('folderBannerIcon');
  const folderBannerTitle = document.getElementById('folderBannerTitle');
  const folderBannerCount = document.getElementById('folderBannerCount');
  const bannerActions = document.getElementById('folderBannerActions');
  const bulkVisWrap = document.getElementById('folderBulkVisibility');
  if (!activeFolderBanner) return;

  if (activeFolderBanner.style && typeof activeFolderBanner.style.removeProperty === 'function') {
    activeFolderBanner.style.removeProperty('--folder-color');
  }

  if (isUserCollectionId(state.activeFolderId)) {
    const folder = state.folders.find(f => f.id === state.activeFolderId);
    if (folder) {
      const members = state.entries.filter(e => entryBelongsToCollection(e, folder.id));
      const folderCount = members.length;
      const hiddenCount = members.filter(e => e.hiddenFromMain).length;
      const visibleCount = folderCount - hiddenCount;

      if (activeFolderBanner.style && typeof activeFolderBanner.style.setProperty === 'function') {
        activeFolderBanner.style.setProperty('--folder-color', folder.color || '#0a84ff');
      }
      if (folderBannerIcon) folderBannerIcon.textContent = folder.icon || '📁';
      if (folderBannerTitle) folderBannerTitle.textContent = folder.name;
      if (folderBannerCount) {
        if (hiddenCount === 0) {
          folderBannerCount.textContent = `${folderCount} site${folderCount !== 1 ? 's' : ''}`;
        } else if (hiddenCount === folderCount && folderCount > 0) {
          folderBannerCount.textContent = `${folderCount} site${folderCount !== 1 ? 's' : ''} · All hidden from Main`;
        } else {
          folderBannerCount.textContent = `${folderCount} site${folderCount !== 1 ? 's' : ''} · ${hiddenCount} hidden from Main`;
        }
      }

      if (bulkVisWrap) {
        if (folderCount === 0) {
          bulkVisWrap.style.display = 'none';
          bulkVisWrap.innerHTML = '';
        } else if (hiddenCount === 0) {
          bulkVisWrap.style.display = 'inline-flex';
          bulkVisWrap.innerHTML = `<button type="button" class="btn btn-secondary btn-sm folder-bulk-vis-btn" data-bulk-visibility="hide" title="Hide all webpages in this collection from the Main view">🙈 Hide All from Main</button>`;
        } else if (hiddenCount === folderCount) {
          bulkVisWrap.style.display = 'inline-flex';
          bulkVisWrap.innerHTML = `<button type="button" class="btn btn-secondary btn-sm folder-bulk-vis-btn is-active" data-bulk-visibility="show" title="Show all webpages in this collection in the Main view">👁️ Show All in Main</button>`;
        } else {
          bulkVisWrap.style.display = 'inline-flex';
          bulkVisWrap.innerHTML = `
            <button type="button" class="btn btn-secondary btn-sm folder-bulk-vis-btn" data-bulk-visibility="hide" title="Hide remaining ${visibleCount} visible webpage${visibleCount !== 1 ? 's' : ''} from Main view">🙈 Hide All (${visibleCount})</button>
            <button type="button" class="btn btn-secondary btn-sm folder-bulk-vis-btn is-active" data-bulk-visibility="show" title="Show ${hiddenCount} hidden webpage${hiddenCount !== 1 ? 's' : ''} in Main view">👁️ Show All (${hiddenCount})</button>
          `;
        }
      }

      if (bannerActions) bannerActions.style.display = 'flex';
      activeFolderBanner.style.display = 'flex';
      return;
    }
  } else if (state.activeFolderId === 'favorites') {
    const favCount = state.entries.filter(e => e.isFavorite).length;
    if (folderBannerIcon) folderBannerIcon.textContent = '⭐';
    if (folderBannerTitle) folderBannerTitle.textContent = 'Favorites';
    if (folderBannerCount) folderBannerCount.textContent = `${favCount} site${favCount !== 1 ? 's' : ''}`;
    if (bulkVisWrap) { bulkVisWrap.style.display = 'none'; bulkVisWrap.innerHTML = ''; }
    if (bannerActions) bannerActions.style.display = 'none';
    activeFolderBanner.style.display = 'flex';
    return;
  } else if (state.activeFolderId === 'unorganized') {
    const unorgCount = state.entries.filter(e => getEntryFolderIds(e).length === 0).length;
    if (folderBannerIcon) folderBannerIcon.textContent = '📂';
    if (folderBannerTitle) folderBannerTitle.textContent = 'Unorganized';
    if (folderBannerCount) folderBannerCount.textContent = `${unorgCount} site${unorgCount !== 1 ? 's' : ''}`;
    if (bulkVisWrap) { bulkVisWrap.style.display = 'none'; bulkVisWrap.innerHTML = ''; }
    if (bannerActions) bannerActions.style.display = 'none';
    activeFolderBanner.style.display = 'flex';
    return;
  } else if (state.activeFolderId === 'broken') {
    const brokenCount = state.entries.filter(e => e.health && e.health.status === 'broken').length;
    if (folderBannerIcon) folderBannerIcon.textContent = '⚠️';
    if (folderBannerTitle) folderBannerTitle.textContent = 'Broken / Offline Links';
    if (folderBannerCount) folderBannerCount.textContent = `${brokenCount} site${brokenCount !== 1 ? 's' : ''}`;
    if (bulkVisWrap) { bulkVisWrap.style.display = 'none'; bulkVisWrap.innerHTML = ''; }
    if (bannerActions) bannerActions.style.display = 'none';
    activeFolderBanner.style.display = 'flex';
    return;
  }

  if (bulkVisWrap) { bulkVisWrap.style.display = 'none'; bulkVisWrap.innerHTML = ''; }
  activeFolderBanner.style.display = 'none';
}

/** Bulk-hides or bulk-shows all member webpages of a collection in the Main view. */
export function setCollectionMembersVisibility(
  folderId: string,
  hide: boolean,
  onUpdate?: () => void
): void {
  const folder = state.folders.find(f => f.id === folderId);
  if (!folder) return;

  const diskList = getLatestStoredEntries();
  let updatedCount = 0;
  const now = new Date().toISOString();

  diskList.forEach(entry => {
    if (entryBelongsToCollection(entry, folderId)) {
      const currentHidden = Boolean(entry.hiddenFromMain);
      if (currentHidden !== hide) {
        syncLegacyFolderFields(entry, getEntryFolderIds(entry), hide);
        entry.dateModified = now;
        updatedCount++;
      }
    }
  });

  if (updatedCount === 0) return;

  saveEntries(diskList);
  if (onUpdate) onUpdate();
  showToast(
    hide
      ? `Hidden ${updatedCount} website${updatedCount !== 1 ? 's' : ''} from Main view`
      : `Shown ${updatedCount} website${updatedCount !== 1 ? 's' : ''} in Main view`
  );
}

export function setupFolderDropTarget(element: HTMLElement, targetFolderId: string, onDropSuccess?: () => void): void {
  if (element.getAttribute('data-drop-bound') === 'true') return;
  element.setAttribute('data-drop-bound', 'true');

  element.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = targetFolderId === 'unorganized' ? 'move' : 'copy';
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
      const wasHidden = Boolean(entry.hiddenFromMain);
      syncLegacyFolderFields(entry, [], false);
      (entry as any).dateModified = new Date().toISOString();
      saveEntries(diskList);
      if (onDropSuccess) onDropSuccess();
      showToast(
        wasHidden
          ? `Removed "${entry.name}" from collections — now visible in Main`
          : `Moved "${entry.name}" to Unorganized`
      );
    } else if (targetFolderId === 'all' || targetFolderId === 'broken') {
      // No collection change needed
    } else {
      const folder = state.folders.find(f => f.id === targetFolderId);
      const currentIds = getEntryFolderIds(entry);
      if (currentIds.includes(targetFolderId)) {
        showToast(`"${entry.name}" is already in ${folder ? folder.name : 'collection'}`);
        return;
      }
      syncLegacyFolderFields(entry, [...currentIds, targetFolderId], entry.hiddenFromMain);
      (entry as any).dateModified = new Date().toISOString();
      saveEntries(diskList);
      if (onDropSuccess) onDropSuccess();
      showToast(`Added "${entry.name}" to ${folder ? folder.name : 'collection'} 📁`);
    }
  });
}

export function deleteFolder(folderId: string, onFolderDeleted?: () => void): void {
  const folder = state.folders.find(f => f.id === folderId);
  if (!folder) return;
  if (!confirm(`Delete collection "${folder.name}"? Websites inside will remain in your library (any site with no other collections will become unorganized and visible in Main).`)) return;

  state.folders = state.folders.filter(f => f.id !== folderId);
  saveFolders(state.folders);

  try {
    if (typeof (window as any).__APP_SYNC_MANAGER__ !== 'undefined') {
      (window as any).__APP_SYNC_MANAGER__.recordDeletion(folderId, 'folder');
    }
  } catch (_) {}

  const diskList = getLatestStoredEntries();
  diskList.forEach(e => {
    const currentIds = getEntryFolderIds(e);
    if (currentIds.includes(folderId)) {
      const nextIds = currentIds.filter(id => id !== folderId);
      syncLegacyFolderFields(e, nextIds, e.hiddenFromMain);
      (e as any).dateModified = new Date().toISOString();
    }
  });
  saveEntries(diskList);

  if (state.activeFolderId === folderId) {
    state.activeFolderId = 'all';
  }

  if (onFolderDeleted) {
    onFolderDeleted();
  } else {
    renderFoldersSidebar();
  }
  showToast(`Deleted collection "${folder.name}"`);
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
  let allVisibleTotal = 0;
  let favTotal = 0;
  let unorgTotal = 0;
  let brokenTotal = 0;
  const folderCounts = new Map<string, number>();

  for (let i = 0; i < diskList.length; i++) {
    const e = diskList[i];
    if (!e.hiddenFromMain) allVisibleTotal++;
    if (e.isFavorite) favTotal++;
    const fids = getEntryFolderIds(e);
    if (fids.length === 0) unorgTotal++;
    else {
      for (const fid of fids) {
        folderCounts.set(fid, (folderCounts.get(fid) || 0) + 1);
      }
    }
    if (e.health && e.health.status === 'broken') brokenTotal++;
  }

  if (countAll) countAll.textContent = String(allVisibleTotal);
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
  const frag = document.createDocumentFragment();
  state.folders.forEach(folder => {
    const folderCount = folderCounts.get(folder.id) || 0;
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
        <button type="button" class="sidebar-action-btn edit-folder-action" title="Edit collection">✏️</button>
        <button type="button" class="sidebar-action-btn delete-folder-action" title="Delete collection">🗑️</button>
      </div>
    `;

    item.addEventListener('click', e => {
      const target = e.target as HTMLElement;
      if (target.closest('.edit-folder-action')) {
        e.stopPropagation();
        if (onEditFolder) onEditFolder(folder.id);
        else openFolderModal(folder.id);
        return;
      }
      if (target.closest('.delete-folder-action')) {
        e.stopPropagation();
        deleteFolder(folder.id, onFolderChanged);
        return;
      }
      setActiveFolder(folder.id, onFolderChanged);
    });

    setupFolderDropTarget(item, folder.id, onFolderChanged);
    frag.appendChild(item);
  });
  sidebarFoldersList.appendChild(frag);

  updateActiveFolderBanner(onFolderChanged);
}

/** Shows or hides the "Hide from Main view" checkbox based on whether >= 1 collection is selected. */
export function updateHiddenFromMainVisibility(): void {
  const hiddenGroup = document.getElementById('entryHiddenGroup');
  const hiddenCheckbox = document.getElementById('entryHiddenFromMain') as HTMLInputElement | null;
  const hasCollections = state.selectedModalFolderIds.length > 0;

  if (hiddenGroup) {
    hiddenGroup.style.display = hasCollections ? 'block' : 'none';
  }
  if (!hasCollections && hiddenCheckbox) {
    hiddenCheckbox.checked = false;
  }
}

/** Renders toggleable collection pills in the Add/Edit Website modal. */
export function renderModalCollectionPicker(): void {
  const picker = document.getElementById('entryCollectionsPicker');
  if (!picker) return;

  const validIds = new Set(state.folders.map(f => f.id));
  state.selectedModalFolderIds = state.selectedModalFolderIds.filter(id => validIds.has(id));

  picker.innerHTML = '';
  if (state.folders.length === 0) {
    picker.innerHTML = '<span class="collection-picker-empty">No collections yet — create one to organize sites.</span>';
    updateHiddenFromMainVisibility();
    return;
  }

  const selectedSet = new Set(state.selectedModalFolderIds);
  state.folders.forEach(folder => {
    const isSelected = selectedSet.has(folder.id);
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = `collection-pill-btn ${isSelected ? 'is-selected' : ''}`;
    pill.setAttribute('data-folder-id', folder.id);
    pill.setAttribute('aria-pressed', String(isSelected));
    if (folder.color) {
      pill.style.setProperty('--folder-color', folder.color);
    }
    pill.innerHTML = `
      <span class="collection-pill-icon">${escapeHtml(folder.icon || '📁')}</span>
      <span class="collection-pill-name">${escapeHtml(folder.name)}</span>
      <span class="collection-pill-check">${isSelected ? '✓' : '+'}</span>
    `;
    pill.addEventListener('click', () => {
      const idx = state.selectedModalFolderIds.indexOf(folder.id);
      if (idx >= 0) {
        state.selectedModalFolderIds.splice(idx, 1);
      } else {
        state.selectedModalFolderIds.push(folder.id);
      }
      renderModalCollectionPicker();
      updateHiddenFromMainVisibility();
    });
    picker.appendChild(pill);
  });

  updateHiddenFromMainVisibility();
}

export function populateFolderSelect(selected?: string | string[]): void {
  if (Array.isArray(selected)) {
    state.selectedModalFolderIds = [...selected];
  } else if (typeof selected === 'string') {
    state.selectedModalFolderIds = selected ? [selected] : [];
  }
  renderModalCollectionPicker();
}
