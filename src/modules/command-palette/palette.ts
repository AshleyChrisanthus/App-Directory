import type { BookmarkEntry, Folder } from '../../types';
import { PIN_FAVORITES_KEY } from '../../core/constants';
import { state } from '../../core/state';
import { getDomain, escapeHtml, showToast } from '../../utils/dom';

export interface CommandPaletteCallbacks {
  openAddModal: () => void;
  toggleTheme: () => void;
  openThemeModal: () => void;
  refreshAllIcons: () => void;
  openHealthModal: () => void;
  exportData: () => void;
  triggerImport: () => void;
  openCatModal: () => void;
  setViewMode: (mode: 'cards' | 'table' | 'icons') => void;
  toggleInsightsDrawer: () => void;
  setActiveFolder: (folderId: string) => void;
  visitEntry: (id: string) => void;
  updateCardsOnly: () => void;
  lockApp?: () => void;
  openSecurityModal?: () => void;
  openSyncModal?: () => void;
}

export interface PaletteItem {
  id: string;
  type: 'action' | 'folder' | 'bookmark';
  title: string;
  subtitle: string;
  icon?: string;
  iconUrl?: string | null;
  badge?: string;
  color?: string | null;
  keywords?: string[];
  run: () => void;
}

let isCommandPaletteOpen = false;
let paletteSelectedIndex = 0;
let paletteFlatItems: PaletteItem[] = [];

export function openCommandPalette(callbacks: CommandPaletteCallbacks): void {
  const commandPaletteBackdrop = document.getElementById('commandPaletteBackdrop');
  const commandPaletteInput = document.getElementById('commandPaletteInput') as HTMLInputElement | null;
  const commandPaletteClearBtn = document.getElementById('commandPaletteClearBtn');

  if (!commandPaletteBackdrop || !commandPaletteInput) return;
  isCommandPaletteOpen = true;
  commandPaletteBackdrop.style.display = 'flex';
  commandPaletteInput.value = '';
  if (commandPaletteClearBtn) commandPaletteClearBtn.style.display = 'none';
  paletteSelectedIndex = 0;
  renderCommandPaletteResults('', callbacks);
  setTimeout(() => {
    commandPaletteInput.focus();
  }, 40);
}

export function closeCommandPalette(): void {
  const commandPaletteBackdrop = document.getElementById('commandPaletteBackdrop');
  if (!commandPaletteBackdrop) return;
  isCommandPaletteOpen = false;
  commandPaletteBackdrop.style.display = 'none';
}

export function toggleCommandPalette(callbacks: CommandPaletteCallbacks): void {
  if (isCommandPaletteOpen) {
    closeCommandPalette();
  } else {
    openCommandPalette(callbacks);
  }
}

export function updatePaletteSelection(): void {
  const commandPaletteResults = document.getElementById('commandPaletteResults');
  if (!commandPaletteResults) return;
  const items = commandPaletteResults.querySelectorAll('.palette-item');
  items.forEach((el, idx) => {
    const isSelected = idx === paletteSelectedIndex;
    el.classList.toggle('is-selected', isSelected);
    if (isSelected) {
      el.scrollIntoView({ block: 'nearest' });
    }
  });
}

export function getCommandPaletteActions(callbacks: CommandPaletteCallbacks): PaletteItem[] {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const actions: PaletteItem[] = [
    {
      id: 'action-add',
      type: 'action',
      title: 'Add Website',
      subtitle: 'Save a new bookmark with title, URL, tags & icon',
      icon: '➕',
      badge: 'Action',
      keywords: ['add', 'new', 'create', 'bookmark', 'website', 'url'],
      run: () => callbacks.openAddModal()
    },
    {
      id: 'action-theme-toggle',
      type: 'action',
      title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: isDark ? 'Toggle light appearance' : 'Toggle dark appearance',
      icon: isDark ? '☀️' : '🌙',
      badge: 'Theme',
      keywords: ['theme', 'dark', 'light', 'mode', 'color', 'appearance'],
      run: () => callbacks.toggleTheme()
    },
    {
      id: 'action-theme-customizer',
      type: 'action',
      title: 'Customize Theme & Colors',
      subtitle: 'Edit palettes, accent colors, modal surfaces & tag styles',
      icon: '🎨',
      badge: 'Theme',
      keywords: ['theme', 'customizer', 'palette', 'colors', 'accent', 'personalize'],
      run: () => callbacks.openThemeModal()
    },
    {
      id: 'action-refresh-icons',
      type: 'action',
      title: 'Refresh All Icons',
      subtitle: 'Batch update website favicons using multi-source HD resolver',
      icon: '🔄',
      badge: 'Action',
      keywords: ['refresh', 'icon', 'favicon', 'logo', 'update'],
      run: () => callbacks.refreshAllIcons()
    },
    {
      id: 'action-health-check',
      type: 'action',
      title: 'Check Website Health & Broken Links',
      subtitle: 'Probe all saved bookmarks for 404s, timeouts, or dead links',
      icon: '🏥',
      badge: 'Health',
      keywords: ['health', 'broken', 'dead', 'links', 'check', 'status', '404'],
      run: () => callbacks.openHealthModal()
    },
    {
      id: 'action-export-backup',
      type: 'action',
      title: 'Export JSON Backup',
      subtitle: 'Save directory backup directly to your exports folder',
      icon: '💾',
      badge: 'Backup',
      keywords: ['export', 'backup', 'save', 'json', 'download'],
      run: () => callbacks.exportData()
    },
    {
      id: 'action-import-backup',
      type: 'action',
      title: 'Import Bookmarks',
      subtitle: 'Import from JSON backup or browser bookmarks.html (Chrome, Firefox, Safari, Edge)',
      icon: '📥',
      badge: 'Import',
      keywords: ['import', 'restore', 'load', 'json', 'html', 'browser', 'chrome', 'firefox', 'safari', 'edge', 'bookmarks'],
      run: () => callbacks.triggerImport()
    },
    {
      id: 'action-manage-categories',
      type: 'action',
      title: 'Manage Categories & Colors',
      subtitle: 'Rename, recolor, delete, or organize your categories',
      icon: '🏷️',
      badge: 'Categories',
      keywords: ['category', 'categories', 'tags', 'colors', 'manage'],
      run: () => callbacks.openCatModal()
    },
    {
      id: 'action-pin-favorites',
      type: 'action',
      title: state.pinFavorites ? 'Unpin Favorites from Top' : 'Pin Favorites to Top',
      subtitle: state.pinFavorites ? 'Restore natural chronological order' : 'Bring all starred favorites to the top',
      icon: '⭐',
      badge: 'Sort',
      keywords: ['favorite', 'favorites', 'pin', 'star', 'top', 'sort'],
      run: () => {
        state.pinFavorites = !state.pinFavorites;
        localStorage.setItem(PIN_FAVORITES_KEY, String(state.pinFavorites));
        callbacks.updateCardsOnly();
        showToast(state.pinFavorites ? 'Favorites pinned to top ⭐' : 'Natural sort order restored');
      }
    },
    {
      id: 'action-lock-app',
      type: 'action',
      title: 'Lock App Directory',
      subtitle: 'Lock with Master Passcode immediately',
      icon: '🔒',
      badge: 'Security',
      keywords: ['lock', 'passcode', 'password', 'security', 'protect'],
      run: () => {
        if (callbacks.lockApp) callbacks.lockApp();
      }
    },
    {
      id: 'action-security-settings',
      type: 'action',
      title: 'Master Passcode Security Settings',
      subtitle: 'Configure, change, or remove your app master passcode',
      icon: '🛡️',
      badge: 'Security',
      keywords: ['security', 'passcode', 'password', 'pin', 'lock', 'settings'],
      run: () => {
        if (callbacks.openSecurityModal) callbacks.openSecurityModal();
      }
    },
    {
      id: 'action-view-cards',
      type: 'action',
      title: 'Switch to Bento Cards View',
      subtitle: 'Rich cards with descriptions, tags, and spotlight hover glow',
      icon: '🎴',
      badge: 'Layout',
      keywords: ['view', 'layout', 'cards', 'bento', 'grid'],
      run: () => callbacks.setViewMode('cards')
    },
    {
      id: 'action-view-table',
      type: 'action',
      title: 'Switch to Compact Table View',
      subtitle: 'High-density tabular rows for fast scanning and power users',
      icon: '📋',
      badge: 'Layout',
      keywords: ['view', 'layout', 'table', 'list', 'compact', 'rows'],
      run: () => callbacks.setViewMode('table')
    },
    {
      id: 'action-view-icons',
      type: 'action',
      title: 'Switch to Minimal Icon Grid',
      subtitle: 'Speed Dial / app launcher style with large squircle icons',
      icon: '📱',
      badge: 'Layout',
      keywords: ['view', 'layout', 'icons', 'speed dial', 'minimal', 'launcher'],
      run: () => callbacks.setViewMode('icons')
    },
    {
      id: 'action-toggle-insights',
      type: 'action',
      title: state.isInsightsOpen ? 'Collapse Insights Dashboard' : 'Open Insights & Usage Dashboard',
      subtitle: 'Speed Dial, site launch analytics, category distribution & dormant links',
      icon: '📊',
      badge: 'Dashboard',
      keywords: ['insights', 'analytics', 'speed dial', 'stats', 'dashboard', 'usage', 'dormant', 'visits'],
      run: () => callbacks.toggleInsightsDrawer()
    }
  ];

  if (callbacks.openSyncModal) {
    actions.push({
      id: 'action-cloud-sync',
      type: 'action',
      title: 'Cloud Sync & Devices (E2EE)',
      subtitle: 'Pair mobile devices via QR code and sync bookmarks end-to-end encrypted',
      icon: '☁️',
      badge: 'Sync',
      keywords: ['sync', 'cloud', 'e2ee', 'devices', 'mobile', 'qr', 'pair', 'vault'],
      run: callbacks.openSyncModal
    });
  }

  return actions;
}

export function getCommandPaletteFolders(callbacks: CommandPaletteCallbacks): PaletteItem[] {
  const list: PaletteItem[] = [
    {
      id: 'folder-all',
      type: 'folder',
      title: 'All Bookmarks',
      subtitle: `View all ${state.entries.length} saved bookmarks`,
      icon: '📁',
      badge: 'View',
      keywords: ['all', 'bookmarks', 'library'],
      run: () => callbacks.setActiveFolder('all')
    },
    {
      id: 'folder-favorites',
      type: 'folder',
      title: 'Favorites',
      subtitle: `View your starred favorites (${state.entries.filter(e => e.isFavorite).length})`,
      icon: '⭐',
      badge: 'View',
      keywords: ['favorite', 'favorites', 'starred'],
      run: () => callbacks.setActiveFolder('favorites')
    },
    {
      id: 'folder-unorganized',
      type: 'folder',
      title: 'Unorganized',
      subtitle: `Bookmarks not in any collection (${state.entries.filter(e => !e.folderId).length})`,
      icon: '📂',
      badge: 'View',
      keywords: ['unorganized', 'inbox', 'unsorted'],
      run: () => callbacks.setActiveFolder('unorganized')
    }
  ];

  const brokenCount = state.entries.filter(e => e.health && e.health.status === 'broken').length;
  if (brokenCount > 0) {
    list.push({
      id: 'folder-broken',
      type: 'folder',
      title: 'Broken Links',
      subtitle: `${brokenCount} unreachable or dead links found`,
      icon: '⚠️',
      badge: 'Health',
      keywords: ['broken', 'dead', 'offline', 'error'],
      run: () => callbacks.setActiveFolder('broken')
    });
  }

  state.folders.forEach(f => {
    const count = state.entries.filter(e => e.folderId === f.id).length;
    list.push({
      id: `folder-${f.id}`,
      type: 'folder',
      title: f.name,
      subtitle: `Collection • ${count} site${count !== 1 ? 's' : ''}`,
      icon: f.icon || '📁',
      badge: 'Collection',
      color: f.color,
      keywords: ['folder', 'collection', f.name.toLowerCase()],
      run: () => callbacks.setActiveFolder(f.id)
    });
  });

  return list;
}

export function getCommandPaletteBookmarks(query: string, callbacks: CommandPaletteCallbacks): PaletteItem[] {
  if (!query) {
    return state.entries
      .slice()
      .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0) || new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 6)
      .map(entry => createBookmarkPaletteItem(entry, 'Frequent', callbacks));
  }

  const q = query.toLowerCase().trim();
  const matched: PaletteItem[] = [];

  for (const entry of state.entries) {
    const nameMatch = entry.name.toLowerCase().includes(q);
    const urlMatch = entry.url.toLowerCase().includes(q);
    const descMatch = (entry.description || '').toLowerCase().includes(q);
    const catMatch = (entry.categories || []).some(c => c.toLowerCase().includes(q));

    if (nameMatch || urlMatch || descMatch || catMatch) {
      matched.push(createBookmarkPaletteItem(entry, 'Bookmark', callbacks));
    }
  }

  return matched;
}

function createBookmarkPaletteItem(entry: BookmarkEntry, badgeLabel: string, callbacks: CommandPaletteCallbacks): PaletteItem {
  const domain = getDomain(entry.url);
  const folder = entry.folderId ? state.folders.find(f => f.id === entry.folderId) : null;
  return {
    id: `bookmark-${entry.id}`,
    type: 'bookmark',
    title: entry.name,
    subtitle: `${domain}${entry.description ? ` • ${entry.description}` : ''}`,
    iconUrl: entry.iconUrl || entry.icon,
    badge: folder ? folder.name : badgeLabel,
    color: folder ? folder.color : null,
    run: () => callbacks.visitEntry(entry.id)
  };
}

export function renderCommandPaletteResults(rawQuery: string, callbacks: CommandPaletteCallbacks): void {
  const commandPaletteResults = document.getElementById('commandPaletteResults');
  const paletteMatchCount = document.getElementById('paletteMatchCount');
  if (!commandPaletteResults) return;

  const query = (rawQuery || '').trim().toLowerCase();
  paletteFlatItems = [];

  const allActions = getCommandPaletteActions(callbacks);
  const allFolders = getCommandPaletteFolders(callbacks);
  const bookmarks = getCommandPaletteBookmarks(query, callbacks);

  let filteredActions: PaletteItem[] = [];
  let filteredFolders: PaletteItem[] = [];

  if (!query) {
    filteredActions = allActions;
    filteredFolders = allFolders;
  } else {
    filteredActions = allActions.filter(
      a =>
        a.title.toLowerCase().includes(query) ||
        a.subtitle.toLowerCase().includes(query) ||
        (a.keywords && a.keywords.some(k => k.includes(query)))
    );
    filteredFolders = allFolders.filter(
      f =>
        f.title.toLowerCase().includes(query) ||
        f.subtitle.toLowerCase().includes(query) ||
        (f.keywords && f.keywords.some(k => k.includes(query)))
    );
  }

  commandPaletteResults.innerHTML = '';

  const sections: { title: string; items: PaletteItem[] }[] = [];
  if (filteredActions.length > 0) {
    sections.push({ title: 'Quick Actions', items: filteredActions });
  }
  if (filteredFolders.length > 0) {
    sections.push({ title: 'Collections & Views', items: filteredFolders });
  }
  if (bookmarks.length > 0) {
    sections.push({ title: query ? 'Bookmarks' : 'Frequently Visited', items: bookmarks });
  }

  if (sections.length === 0) {
    commandPaletteResults.innerHTML = `
      <div class="palette-empty">
        No matches found for "<strong>${escapeHtml(rawQuery)}</strong>"
      </div>
    `;
    if (paletteMatchCount) paletteMatchCount.textContent = '0 items';
    return;
  }

  let totalItems = 0;
  sections.forEach(sec => {
    const secEl = document.createElement('div');
    secEl.className = 'palette-section';

    const titleEl = document.createElement('div');
    titleEl.className = 'palette-section-title';
    titleEl.textContent = sec.title;
    secEl.appendChild(titleEl);

    sec.items.forEach(item => {
      const itemIdx = paletteFlatItems.length;
      paletteFlatItems.push(item);
      totalItems++;

      const row = document.createElement('div');
      row.className = `palette-item ${itemIdx === paletteSelectedIndex ? 'is-selected' : ''}`;
      row.setAttribute('data-index', String(itemIdx));

      const iconHtml = item.iconUrl
        ? `<div class="palette-item-icon"><img src="${escapeHtml(item.iconUrl)}" alt="" onerror="this.parentElement.textContent='🌐'"></div>`
        : `<div class="palette-item-icon" ${item.color ? `style="border-color: ${escapeHtml(item.color)};"` : ''}>${escapeHtml(
            item.icon || '⚡'
          )}</div>`;

      const badgeHtml = item.badge
        ? `<span class="palette-item-badge" ${item.color ? `style="background: ${escapeHtml(item.color)}18; color: ${escapeHtml(item.color)};"` : ''}>${escapeHtml(
            item.badge
          )}</span>`
        : '';

      row.innerHTML = `
        ${iconHtml}
        <div class="palette-item-info">
          <div class="palette-item-title">${escapeHtml(item.title)}</div>
          <div class="palette-item-subtitle">${escapeHtml(item.subtitle)}</div>
        </div>
        ${badgeHtml}
      `;

      row.addEventListener('click', () => {
        closeCommandPalette();
        item.run();
      });

      row.addEventListener('mouseenter', () => {
        paletteSelectedIndex = itemIdx;
        updatePaletteSelection();
      });

      secEl.appendChild(row);
    });

    commandPaletteResults.appendChild(secEl);
  });

  if (paletteMatchCount) {
    paletteMatchCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
  }

  if (paletteSelectedIndex >= totalItems) {
    paletteSelectedIndex = 0;
  }
  updatePaletteSelection();
}

export function initCommandPalette(callbacks: CommandPaletteCallbacks): void {
  const cmdPaletteTrigger = document.getElementById('cmdPaletteTrigger');
  const commandPaletteBackdrop = document.getElementById('commandPaletteBackdrop');
  const commandPaletteInput = document.getElementById('commandPaletteInput') as HTMLInputElement | null;
  const commandPaletteClearBtn = document.getElementById('commandPaletteClearBtn');
  const commandPaletteEscBadge = document.getElementById('commandPaletteEscBadge');
  const cmdPaletteKbdLabel = document.getElementById('cmdPaletteKbdLabel');

  if (cmdPaletteKbdLabel) {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    cmdPaletteKbdLabel.textContent = isMac ? '⌘K' : 'Ctrl+K';
  }

  if (cmdPaletteTrigger) {
    cmdPaletteTrigger.addEventListener('click', () => {
      openCommandPalette(callbacks);
    });
  }

  if (commandPaletteBackdrop) {
    commandPaletteBackdrop.addEventListener('click', e => {
      if (e.target === commandPaletteBackdrop) {
        closeCommandPalette();
      }
    });
  }

  if (commandPaletteEscBadge) {
    commandPaletteEscBadge.addEventListener('click', () => {
      closeCommandPalette();
    });
  }

  if (commandPaletteInput) {
    commandPaletteInput.addEventListener('input', () => {
      const q = commandPaletteInput.value;
      if (commandPaletteClearBtn) {
        commandPaletteClearBtn.style.display = q ? 'inline-flex' : 'none';
      }
      paletteSelectedIndex = 0;
      renderCommandPaletteResults(q, callbacks);
    });

    commandPaletteInput.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (paletteFlatItems.length > 0) {
          paletteSelectedIndex = (paletteSelectedIndex + 1) % paletteFlatItems.length;
          updatePaletteSelection();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (paletteFlatItems.length > 0) {
          paletteSelectedIndex = (paletteSelectedIndex - 1 + paletteFlatItems.length) % paletteFlatItems.length;
          updatePaletteSelection();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = paletteFlatItems[paletteSelectedIndex];
        if (selected) {
          closeCommandPalette();
          selected.run();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
      }
    });
  }

  if (commandPaletteClearBtn && commandPaletteInput) {
    commandPaletteClearBtn.addEventListener('click', () => {
      commandPaletteInput.value = '';
      commandPaletteClearBtn.style.display = 'none';
      paletteSelectedIndex = 0;
      renderCommandPaletteResults('', callbacks);
      commandPaletteInput.focus();
    });
  }

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && target !== commandPaletteInput) {
        return;
      }
      e.preventDefault();
      toggleCommandPalette(callbacks);
      return;
    }

    if (isCommandPaletteOpen && e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
      return;
    }

    if (e.key === '/' && !isCommandPaletteOpen) {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        openCommandPalette(callbacks);
        return;
      }
    }
  });
}
