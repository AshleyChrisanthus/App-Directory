import type { BookmarkEntry, Folder, ViewLayoutMode } from '../../types';
import { state } from '../../core/state';
import { VIEW_LAYOUT_KEY } from '../../core/constants';
import { escapeHtml, timeAgo, formatDateFull, getDomain } from '../../utils/dom';
import { getCategoryTagStyle } from '../theme/theme';
import { renderFoldersSidebar, setActiveFolder } from '../folders/sidebar';
import { populateCategories, getAllCategories } from '../categories/manager';
import { renderInsightsDashboard } from '../insights/dashboard';
import { refreshEntryIcon, acceptPendingIcon, dismissPendingIcon } from '../icons/refresh';
import { getFilteredEntries } from './filter-sort';
import { openModal, deleteEntry, toggleFavorite, visitEntry } from './crud';

let pendingRenderRafId: number | null = null;
let currentRenderToken = 0;

export function setViewMode(mode: ViewLayoutMode): void {
  if (!['cards', 'table', 'icons'].includes(mode)) mode = 'cards';
  if (state.currentViewMode === mode) {
    const grid = document.getElementById('grid');
    if (grid && grid.children.length > 0) return;
  }
  state.currentViewMode = mode;
  localStorage.setItem(VIEW_LAYOUT_KEY, mode);

  const viewCardsBtn = document.getElementById('viewCardsBtn');
  const viewTableBtn = document.getElementById('viewTableBtn');
  const viewIconsBtn = document.getElementById('viewIconsBtn');

  if (viewCardsBtn) viewCardsBtn.classList.toggle('is-active', mode === 'cards');
  if (viewTableBtn) viewTableBtn.classList.toggle('is-active', mode === 'table');
  if (viewIconsBtn) viewIconsBtn.classList.toggle('is-active', mode === 'icons');

  renderCardsOnly();
}

export function renderCard(entry: BookmarkEntry, folderMap?: Map<string, Folder>): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-id', entry.id);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  if (!isMobile) {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', entry.id);
        e.dataTransfer.effectAllowed = 'move';
      }
      card.classList.add('is-dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
    });
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  }

  const pendingIcon = state.pendingIcons.get(entry.id);
  if (pendingIcon) {
    card.classList.add('has-pending-icon');
  }

  const domain = getDomain(entry.url);
  const folder = entry.folderId
    ? (folderMap ? folderMap.get(entry.folderId) : state.folders.find(f => f.id === entry.folderId)) || null
    : null;
  const iconSrc = entry.icon || (entry as any).iconUrl || '';

  card.innerHTML = `
    <button class="card-favorite ${entry.isFavorite ? 'active' : ''}" title="${entry.isFavorite ? 'Unpin from favorites' : 'Pin to favorites'}">
      ${entry.isFavorite ? '★' : '☆'}
    </button>
    <div class="card-top">
      <div class="card-icon" title="Current icon">
        ${iconSrc
          ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" decoding="async" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
          : '<span class="icon-fallback">🌐</span>'
        }
      </div>
      <div class="card-info">
        <div class="card-name" title="${escapeHtml(entry.name)}">
          <span class="card-title-text">${escapeHtml(entry.name)}</span>
          <span class="card-status-dot ${entry.health && entry.health.status === 'broken' ? 'is-broken' : 'is-online'}" title="${entry.health && entry.health.status === 'broken' ? 'Website unreachable or broken' : 'Website online'}"></span>
        </div>
        <div class="card-url" title="${escapeHtml(entry.url)}">
          <span>${escapeHtml(domain)}</span>
          <svg class="card-url-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </div>
      </div>
      ${pendingIcon ? `
        <div class="card-pending-icon-box" title="New icon proposed">
          <span class="pending-badge">New Icon</span>
          <div class="pending-preview-row">
            <div class="card-icon new-icon-preview" title="New icon preview">
              <img src="${escapeHtml(pendingIcon)}" alt="" decoding="async" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">
            </div>
            <button type="button" class="btn-accept accept-icon-btn" title="Accept new icon">✓ Accept</button>
            <button type="button" class="btn btn-ghost dismiss-icon-btn" title="Dismiss new icon">✕</button>
          </div>
        </div>
      ` : ''}
    </div>
    ${entry.description ? `<div class="card-description">${escapeHtml(entry.description)}</div>` : ''}
    ${entry.health && entry.health.status === 'broken' ? `
      <div class="card-health-pill broken" title="${escapeHtml(entry.health.error || 'Website unreachable or dead link')}">
        ⚠️ Offline / Dead
      </div>
    ` : ''}
    <div class="card-meta">
      <div class="card-tags-row">
        ${folder ? `<span class="tag folder-tag" data-folder-id="${escapeHtml(folder.id)}" style="--folder-color: ${escapeHtml(folder.color || '#0a84ff')}; background: color-mix(in srgb, var(--folder-color) 14%, transparent); color: var(--folder-color); border: 1px solid color-mix(in srgb, var(--folder-color) 32%, transparent);" title="Folder: ${escapeHtml(folder.name)} (Click to view folder)"><span>${escapeHtml(folder.icon || '📁')}</span> ${escapeHtml(folder.name)}</span>` : ''}
        ${(entry.categories || []).map(cat => `<span class="tag" ${getCategoryTagStyle(cat)}>${escapeHtml(cat)}</span>`).join('')}
      </div>
      <div class="card-footer-row">
        <div class="card-footer-left">
          <span class="meta-item meta-added-date" title="Added: ${formatDateFull(entry.dateAdded)}">Added ${timeAgo(entry.dateAdded)}</span>
          ${(entry.visitCount || 0) > 0 ? `
            <span class="meta-dot"></span>
            <span class="meta-item">${entry.visitCount} visit${entry.visitCount !== 1 ? 's' : ''}</span>
          ` : ''}
        </div>
        <div class="card-footer-right">
          <button type="button" class="card-open-btn" title="Open ${escapeHtml(entry.name)} in new tab">
            <span>Open</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
          <div class="card-actions">
            <button class="btn btn-ghost refresh-btn" title="Check for updated icon">🔄</button>
            <button class="btn btn-ghost edit-btn" title="Edit">✏️</button>
            <button class="btn btn-danger delete-btn" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Single delegated click listener for all card actions
  card.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.closest('.folder-tag')) {
      e.stopPropagation();
      if (folder) setActiveFolder(folder.id, render);
      return;
    }
    if (target.closest('.card-favorite')) {
      e.stopPropagation();
      toggleFavorite(entry.id, render);
      return;
    }
    const refreshBtn = target.closest('.refresh-btn') as HTMLElement | null;
    if (refreshBtn) {
      e.stopPropagation();
      refreshEntryIcon(entry.id, refreshBtn, render);
      return;
    }
    if (target.closest('.edit-btn')) {
      e.stopPropagation();
      openModal(entry.id);
      return;
    }
    if (target.closest('.delete-btn')) {
      e.stopPropagation();
      deleteEntry(entry.id, render);
      return;
    }
    if (target.closest('.card-open-btn')) {
      e.stopPropagation();
      visitEntry(entry.id, render);
      return;
    }
    if (pendingIcon) {
      if (target.closest('.accept-icon-btn')) {
        e.stopPropagation();
        acceptPendingIcon(entry.id, render);
        return;
      }
      if (target.closest('.dismiss-icon-btn')) {
        e.stopPropagation();
        dismissPendingIcon(entry.id, render);
        return;
      }
      if (target.closest('.card-pending-icon-box')) return;
    }
    visitEntry(entry.id, render);
  });

  return card;
}

export function renderTableRow(entry: BookmarkEntry, folderMap?: Map<string, Folder>): HTMLElement {
  const row = document.createElement('div');
  row.className = 'table-row';
  row.setAttribute('data-id', entry.id);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  if (!isMobile) {
    row.setAttribute('draggable', 'true');
    row.addEventListener('dragstart', (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', entry.id);
        e.dataTransfer.effectAllowed = 'move';
      }
      row.classList.add('is-dragging');
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('is-dragging');
    });
  }

  const domain = getDomain(entry.url);
  const folder = entry.folderId
    ? (folderMap ? folderMap.get(entry.folderId) : state.folders.find(f => f.id === entry.folderId)) || null
    : null;
  const iconSrc = entry.icon || (entry as any).iconUrl || '';
  const pendingIcon = state.pendingIcons.get(entry.id);
  if (pendingIcon) {
    row.classList.add('has-pending-icon');
  }

  row.innerHTML = `
    <div class="table-cell-fav">
      <button class="table-fav-btn ${entry.isFavorite ? 'active' : ''}" title="${entry.isFavorite ? 'Unpin from favorites' : 'Pin to favorites'}">
        ${entry.isFavorite ? '★' : '☆'}
      </button>
    </div>
    <div class="table-cell-icon">
      <div class="table-icon-frame" title="${escapeHtml(entry.name)}">
        ${iconSrc
          ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" decoding="async" onerror="this.parentElement.innerHTML='<span style=\\'font-size:12px;\\'>🌐</span>'">`
          : '<span style="font-size:12px;">🌐</span>'
        }
      </div>
    </div>
    <div class="table-cell-main">
      <div class="table-main-content">
        <div class="table-title-row">
          <span class="table-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</span>
          ${entry.health && entry.health.status === 'broken' ? '<span class="table-broken-badge">⚠️ Offline</span>' : ''}
        </div>
        <span class="table-domain" title="${escapeHtml(entry.url)}">
          ${escapeHtml(domain)}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </span>
      </div>
      ${pendingIcon ? `
        <div class="table-pending-pill" title="New icon proposed">
          <span class="pending-badge">New Icon</span>
          <div class="table-new-icon-preview" title="New icon preview">
            <img src="${escapeHtml(pendingIcon)}" alt="" decoding="async" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">
          </div>
          <button type="button" class="btn-accept accept-icon-btn table-accept-btn" title="Accept new icon">✓ Accept</button>
          <button type="button" class="btn btn-ghost dismiss-icon-btn table-dismiss-btn" title="Dismiss new icon">✕</button>
        </div>
      ` : ''}
    </div>
    <div class="table-cell-tags">
      ${folder ? `<span class="tag folder-tag" data-folder-id="${escapeHtml(folder.id)}" style="--folder-color: ${escapeHtml(folder.color || '#0a84ff')}; background: color-mix(in srgb, var(--folder-color) 14%, transparent); color: var(--folder-color); border: 1px solid color-mix(in srgb, var(--folder-color) 32%, transparent);" title="Folder: ${escapeHtml(folder.name)}">${escapeHtml(folder.icon || '📁')} ${escapeHtml(folder.name)}</span>` : ''}
      ${(entry.categories || []).map(cat => `<span class="tag" ${getCategoryTagStyle(cat)}>${escapeHtml(cat)}</span>`).join('')}
    </div>
    <div class="table-cell-visits">
      ${(entry.visitCount || 0) > 0 ? `${entry.visitCount} visit${entry.visitCount !== 1 ? 's' : ''}` : '—'}
    </div>
    <div class="table-cell-date" title="Added: ${formatDateFull(entry.dateAdded)}">
      ${timeAgo(entry.dateAdded)}
    </div>
    <div class="table-cell-actions">
      <button class="table-action-btn refresh-btn" title="Refresh icon">🔄</button>
      <button class="table-action-btn edit-btn" title="Edit">✏️</button>
      <button class="table-action-btn delete-btn" title="Delete">🗑️</button>
    </div>
  `;

  row.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.closest('.folder-tag')) {
      e.stopPropagation();
      if (folder) setActiveFolder(folder.id, render);
      return;
    }
    if (target.closest('.table-fav-btn')) {
      e.stopPropagation();
      toggleFavorite(entry.id, render);
      return;
    }
    const refreshBtn = target.closest('.refresh-btn') as HTMLElement | null;
    if (refreshBtn) {
      e.stopPropagation();
      refreshEntryIcon(entry.id, refreshBtn, render);
      return;
    }
    if (target.closest('.edit-btn')) {
      e.stopPropagation();
      openModal(entry.id);
      return;
    }
    if (target.closest('.delete-btn')) {
      e.stopPropagation();
      deleteEntry(entry.id, render);
      return;
    }
    if (pendingIcon) {
      if (target.closest('.accept-icon-btn')) {
        e.stopPropagation();
        acceptPendingIcon(entry.id, render);
        return;
      }
      if (target.closest('.dismiss-icon-btn')) {
        e.stopPropagation();
        dismissPendingIcon(entry.id, render);
        return;
      }
      if (target.closest('.table-pending-pill')) return;
    }
    visitEntry(entry.id, render);
  });

  return row;
}

export function renderIconCard(entry: BookmarkEntry, folderMap?: Map<string, Folder>): HTMLElement {
  const card = document.createElement('div');
  card.className = 'icon-card';
  card.setAttribute('data-id', entry.id);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  if (!isMobile) {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', (e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', entry.id);
        e.dataTransfer.effectAllowed = 'move';
      }
      card.classList.add('is-dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
    });
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
  }

  const folder = entry.folderId
    ? (folderMap ? folderMap.get(entry.folderId) : state.folders.find(f => f.id === entry.folderId)) || null
    : null;
  const iconSrc = entry.icon || (entry as any).iconUrl || '';

  card.innerHTML = `
    <div class="icon-card-header">
      <div class="icon-card-actions">
        <button class="icon-card-action-btn edit-btn" title="Edit">✏️</button>
        <button class="icon-card-action-btn delete-btn" title="Delete">🗑️</button>
      </div>
      <button class="icon-card-fav ${entry.isFavorite ? 'active' : ''}" title="${entry.isFavorite ? 'Unpin from favorites' : 'Pin to favorites'}">
        ${entry.isFavorite ? '★' : '☆'}
      </button>
    </div>
    <div class="icon-card-frame">
      ${iconSrc
        ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" decoding="async" onerror="this.parentElement.innerHTML='<span style=\\'font-size:20px;\\'>🌐</span>'">`
        : '<span style="font-size:20px;">🌐</span>'
      }
    </div>
    <div class="icon-card-name" title="${escapeHtml(entry.name)}">
      ${folder ? `<span class="icon-card-folder-dot" style="background: ${escapeHtml(folder.color || 'var(--accent)')};" title="Folder: ${escapeHtml(folder.name)}"></span>` : ''}
      <span>${escapeHtml(entry.name)}</span>
    </div>
  `;

  card.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.closest('.icon-card-fav')) {
      e.stopPropagation();
      toggleFavorite(entry.id, render);
      return;
    }
    if (target.closest('.edit-btn')) {
      e.stopPropagation();
      openModal(entry.id);
      return;
    }
    if (target.closest('.delete-btn')) {
      e.stopPropagation();
      deleteEntry(entry.id, render);
      return;
    }
    visitEntry(entry.id, render);
  });

  return card;
}

export function renderCardsOnly(): void {
  if (pendingRenderRafId !== null && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(pendingRenderRafId);
    pendingRenderRafId = null;
  }
  const renderToken = ++currentRenderToken;

  const filtered = getFilteredEntries();
  const statsText = document.getElementById('statsText');
  const activeCatFilterBanner = document.getElementById('activeCatFilterBanner');
  const activeCatFilterBannerLeft = document.getElementById('activeCatFilterBannerLeft');
  const grid = document.getElementById('grid');
  const emptyState = document.getElementById('emptyState');

  // Update stats
  const total = state.entries.length;
  const showing = filtered.length;
  const activeCats = Array.from(state.selectedFilterCategories);

  if (statsText) {
    if (total === 0) {
      statsText.textContent = '0 sites';
    } else if (showing === total) {
      statsText.textContent = `${total} site${total !== 1 ? 's' : ''}`;
    } else {
      statsText.textContent = `Showing ${showing} of ${total} site${total !== 1 ? 's' : ''}`;
    }
  }

  // Update header count badge (Stitch mobile header & desktop pill)
  const headerCountBadge = document.getElementById('headerCountBadge');
  if (headerCountBadge) {
    headerCountBadge.textContent = String(total);
  }

  // Dynamic search placeholder
  const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
  if (searchInput && !searchInput.value) {
    searchInput.placeholder = `Search ${total} bookmarks…`;
  }

  // Active Category Filter Banner
  if (activeCatFilterBanner) {
    if (activeCats.length > 0 && activeCats.length < getAllCategories().length) {
      activeCatFilterBanner.style.display = 'flex';
      if (activeCatFilterBannerLeft) {
        activeCatFilterBannerLeft.innerHTML = `
          <span>Filtering by category:</span>
          ${activeCats.map(cat => {
            const color = (state.categoryColors && state.categoryColors[cat.toLowerCase()]) || 'var(--accent)';
            return `<span class="active-cat-filter-tag" style="background: color-mix(in srgb, ${color} 18%, transparent); color: ${color}; border: 1px solid color-mix(in srgb, ${color} 40%, transparent);">${escapeHtml(cat)}</span>`;
          }).join(' ')}
          <span style="color: var(--text-secondary); font-size: 0.78rem;">(${showing} website${showing !== 1 ? 's' : ''})</span>
        `;
      }
    } else {
      activeCatFilterBanner.style.display = 'none';
    }
  }

  if (!grid || !emptyState) return;

  // Show/hide empty state
  if (total === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  const mode = state.currentViewMode;
  grid.style.display = mode === 'table' ? 'flex' : 'grid';
  grid.className = 'grid view-' + mode;
  emptyState.style.display = 'none';

  grid.innerHTML = '';

  const folderMap = new Map<string, Folder>();
  for (const f of state.folders) {
    folderMap.set(f.id, f);
  }

  const renderItem = (entry: BookmarkEntry): HTMLElement => {
    if (mode === 'table') return renderTableRow(entry, folderMap);
    if (mode === 'icons') return renderIconCard(entry, folderMap);
    return renderCard(entry, folderMap);
  };

  const firstFragment = document.createDocumentFragment();
  if (mode === 'table') {
    const headerRow = document.createElement('div');
    headerRow.className = 'table-header-row';
    headerRow.innerHTML = `
      <span class="th-fav"></span>
      <span class="th-icon"></span>
      <span class="th-name">Website</span>
      <span class="th-tags">Folder & Categories</span>
      <span class="th-visits">Visits</span>
      <span class="th-date">Added</span>
      <span class="th-actions" style="text-align: right;">Actions</span>
    `;
    firstFragment.appendChild(headerRow);
  }

  const INITIAL_BATCH = mode === 'icons' ? 36 : 18;
  const CHUNK_SIZE = mode === 'icons' ? 60 : 32;
  const initialEnd = Math.min(filtered.length, INITIAL_BATCH);

  for (let i = 0; i < initialEnd; i++) {
    firstFragment.appendChild(renderItem(filtered[i]));
  }
  grid.appendChild(firstFragment);

  if (initialEnd < filtered.length) {
    let cursor = initialEnd;
    const renderNextChunk = () => {
      if (renderToken !== currentRenderToken) return;
      const frag = document.createDocumentFragment();
      const end = Math.min(filtered.length, cursor + CHUNK_SIZE);
      for (let i = cursor; i < end; i++) {
        frag.appendChild(renderItem(filtered[i]));
      }
      grid.appendChild(frag);
      cursor = end;
      if (cursor < filtered.length && typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        pendingRenderRafId = window.requestAnimationFrame(renderNextChunk);
      } else {
        pendingRenderRafId = null;
      }
    };

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      pendingRenderRafId = window.requestAnimationFrame(renderNextChunk);
    } else {
      renderNextChunk();
    }
  }
}

export function render(): void {
  renderFoldersSidebar(render);
  populateCategories(renderCardsOnly);
  renderCardsOnly();
  if (state.isInsightsOpen) {
    renderInsightsDashboard(undefined, undefined, render);
  }
}
