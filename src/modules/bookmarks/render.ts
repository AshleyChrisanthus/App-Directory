import type { BookmarkEntry, ViewLayoutMode } from '../../types';
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

export function setViewMode(mode: ViewLayoutMode): void {
  if (!['cards', 'table', 'icons'].includes(mode)) mode = 'cards';
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

export function renderCard(entry: BookmarkEntry): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-id', entry.id);
  card.setAttribute('draggable', 'true');

  // Drag and Drop into Folders
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

  const pendingIcon = state.pendingIcons.get(entry.id);
  if (pendingIcon) {
    card.classList.add('has-pending-icon');
  }

  // Bento Ambient Spotlight Glow cursor tracker
  card.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });

  const domain = getDomain(entry.url);
  const folder = entry.folderId ? state.folders.find(f => f.id === entry.folderId) : null;
  const iconSrc = entry.icon || (entry as any).iconUrl || '';

  card.innerHTML = `
    <button class="card-favorite ${entry.isFavorite ? 'active' : ''}" title="${entry.isFavorite ? 'Unpin from favorites' : 'Pin to favorites'}">
      ${entry.isFavorite ? '★' : '☆'}
    </button>
    <div class="card-top">
      <div class="card-icon" title="Current icon">
        ${iconSrc
          ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
          : '<span class="icon-fallback">🌐</span>'
        }
      </div>
      <div class="card-info">
        <div class="card-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
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
              <img src="${escapeHtml(pendingIcon)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">
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
      ${folder ? `<span class="tag folder-tag" data-folder-id="${escapeHtml(folder.id)}" style="--folder-color: ${escapeHtml(folder.color || '#0a84ff')}; background: color-mix(in srgb, var(--folder-color) 14%, transparent); color: var(--folder-color); border: 1px solid color-mix(in srgb, var(--folder-color) 32%, transparent);" title="Folder: ${escapeHtml(folder.name)} (Click to view folder)"><span>${escapeHtml(folder.icon || '📁')}</span> ${escapeHtml(folder.name)}</span>` : ''}
      ${(entry.categories || []).map(cat => `<span class="tag" ${getCategoryTagStyle(cat)}>${escapeHtml(cat)}</span>`).join('')}
      <span class="meta-item" title="Added: ${formatDateFull(entry.dateAdded)}">Added ${timeAgo(entry.dateAdded)}</span>
      ${(entry.visitCount || 0) > 0 ? `
        <span class="meta-dot"></span>
        <span class="meta-item">${entry.visitCount} visit${entry.visitCount !== 1 ? 's' : ''}</span>
      ` : ''}
      <div class="card-actions">
        <button class="btn btn-ghost refresh-btn" title="Check for updated icon">🔄</button>
        <button class="btn btn-ghost edit-btn" title="Edit">✏️</button>
        <button class="btn btn-danger delete-btn" title="Delete">🗑️</button>
      </div>
    </div>
  `;

  // Click card → visit
  card.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('.folder-tag')) {
      e.stopPropagation();
      if (folder) setActiveFolder(folder.id, render);
      return;
    }
    if (target?.closest('.card-favorite') ||
        target?.closest('.refresh-btn') ||
        target?.closest('.edit-btn') ||
        target?.closest('.delete-btn') ||
        target?.closest('.card-pending-icon-box')) return;
    visitEntry(entry.id, render);
  });

  // Favorite toggle
  const favBtn = card.querySelector('.card-favorite');
  if (favBtn) {
    favBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      toggleFavorite(entry.id, render);
    });
  }

  // Refresh icon
  const refreshBtn = card.querySelector('.refresh-btn') as HTMLElement | null;
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      refreshEntryIcon(entry.id, refreshBtn, render);
    });
  }

  // Accept / Dismiss pending icon
  if (pendingIcon) {
    const acceptBtn = card.querySelector('.accept-icon-btn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        acceptPendingIcon(entry.id, render);
      });
    }
    const dismissBtn = card.querySelector('.dismiss-icon-btn');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        dismissPendingIcon(entry.id, render);
      });
    }
  }

  // Edit
  const editBtn = card.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      openModal(entry.id);
    });
  }

  // Delete
  const deleteBtn = card.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      deleteEntry(entry.id, render);
    });
  }

  return card;
}

export function renderTableRow(entry: BookmarkEntry): HTMLElement {
  const row = document.createElement('div');
  row.className = 'table-row';
  row.setAttribute('data-id', entry.id);
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

  const domain = getDomain(entry.url);
  const folder = entry.folderId ? state.folders.find(f => f.id === entry.folderId) : null;
  const iconSrc = entry.icon || (entry as any).iconUrl || '';

  row.innerHTML = `
    <div class="table-cell-fav">
      <button class="table-fav-btn ${entry.isFavorite ? 'active' : ''}" title="${entry.isFavorite ? 'Unpin from favorites' : 'Pin to favorites'}">
        ${entry.isFavorite ? '★' : '☆'}
      </button>
    </div>
    <div class="table-cell-icon">
      <div class="table-icon-frame" title="${escapeHtml(entry.name)}">
        ${iconSrc
          ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span style=\\'font-size:12px;\\'>🌐</span>'">`
          : '<span style="font-size:12px;">🌐</span>'
        }
      </div>
    </div>
    <div class="table-cell-main">
      <div class="table-title-row">
        <span class="table-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</span>
        ${entry.health && entry.health.status === 'broken' ? '<span class="table-broken-badge">⚠️ Offline</span>' : ''}
      </div>
      <span class="table-domain" title="${escapeHtml(entry.url)}">
        ${escapeHtml(domain)}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
      </span>
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

  // Click row → visit
  row.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('.folder-tag')) {
      e.stopPropagation();
      if (folder) setActiveFolder(folder.id, render);
      return;
    }
    if (target?.closest('.table-fav-btn') ||
        target?.closest('.refresh-btn') ||
        target?.closest('.edit-btn') ||
        target?.closest('.delete-btn')) return;
    visitEntry(entry.id, render);
  });

  // Favorite toggle
  const favBtn = row.querySelector('.table-fav-btn');
  if (favBtn) {
    favBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      toggleFavorite(entry.id, render);
    });
  }

  // Refresh icon
  const refreshBtn = row.querySelector('.refresh-btn') as HTMLElement | null;
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      refreshEntryIcon(entry.id, refreshBtn, render);
    });
  }

  // Edit
  const editBtn = row.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      openModal(entry.id);
    });
  }

  // Delete
  const deleteBtn = row.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      deleteEntry(entry.id, render);
    });
  }

  return row;
}

export function renderIconCard(entry: BookmarkEntry): HTMLElement {
  const card = document.createElement('div');
  card.className = 'icon-card';
  card.setAttribute('data-id', entry.id);
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

  // Ambient Spotlight cursor tracker
  card.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  });

  const folder = entry.folderId ? state.folders.find(f => f.id === entry.folderId) : null;
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
        ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span style=\\'font-size:20px;\\'>🌐</span>'">`
        : '<span style="font-size:20px;">🌐</span>'
      }
    </div>
    <div class="icon-card-name" title="${escapeHtml(entry.name)}">
      ${folder ? `<span class="icon-card-folder-dot" style="background: ${escapeHtml(folder.color || 'var(--accent)')};" title="Folder: ${escapeHtml(folder.name)}"></span>` : ''}
      <span>${escapeHtml(entry.name)}</span>
    </div>
  `;

  // Click card → visit
  card.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('.icon-card-fav') ||
        target?.closest('.edit-btn') ||
        target?.closest('.delete-btn')) return;
    visitEntry(entry.id, render);
  });

  // Favorite toggle
  const favBtn = card.querySelector('.icon-card-fav');
  if (favBtn) {
    favBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      toggleFavorite(entry.id, render);
    });
  }

  // Edit
  const editBtn = card.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      openModal(entry.id);
    });
  }

  // Delete
  const deleteBtn = card.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      deleteEntry(entry.id, render);
    });
  }

  return card;
}

export function renderCardsOnly(): void {
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

  grid.style.display = state.currentViewMode === 'table' ? 'flex' : 'grid';
  grid.className = 'grid view-' + state.currentViewMode;
  emptyState.style.display = 'none';

  grid.innerHTML = '';

  if (state.currentViewMode === 'table') {
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
    grid.appendChild(headerRow);
    filtered.forEach(entry => {
      grid.appendChild(renderTableRow(entry));
    });
  } else if (state.currentViewMode === 'icons') {
    filtered.forEach(entry => {
      grid.appendChild(renderIconCard(entry));
    });
  } else {
    // Default: Bento cards
    filtered.forEach(entry => {
      grid.appendChild(renderCard(entry));
    });
  }
}

export function render(): void {
  renderFoldersSidebar(render);
  populateCategories(renderCardsOnly);
  renderCardsOnly();
  if (state.isInsightsOpen) {
    renderInsightsDashboard(render);
  }
}
