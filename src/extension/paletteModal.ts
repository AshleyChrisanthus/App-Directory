// Command Palette (Alt+K) for App Directory Companion Extension
// Allows searching through saved websites and opening in current, new, or background tab.

import modalCss from './modal.css';
import {
  CachedFolder,
  CachedBookmark,
  AppDirectoryState,
  OpenBookmarkMode
} from './types';

function isExtensionContextValid(): boolean {
  try {
    return (
      typeof chrome !== 'undefined' &&
      typeof chrome.runtime !== 'undefined' &&
      !!chrome.runtime.id
    );
  } catch {
    return false;
  }
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getDomain(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return rawUrl;
  }
}

let isPaletteOpening = false;
let lastPaletteToggleTimestamp = 0;

export function togglePaletteModal(): void {
  if (!isExtensionContextValid()) {
    console.warn('[App Directory Companion] Extension was reloaded. Please refresh this page.');
    return;
  }

  const now = Date.now();
  if (now - lastPaletteToggleTimestamp < 350 || isPaletteOpening) {
    return;
  }
  lastPaletteToggleTimestamp = now;

  const existingHost = document.getElementById('app-directory-palette-host');
  if (existingHost) {
    const backdrop = existingHost.shadowRoot?.querySelector('.ad-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('ad-visible');
      setTimeout(() => existingHost.remove(), 200);
    } else {
      existingHost.remove();
    }
    return;
  }

  // If the Add Bookmark modal is open, dismiss it
  const addModalHost = document.getElementById('app-directory-modal-host');
  if (addModalHost) {
    addModalHost.remove();
  }

  isPaletteOpening = true;

  try {
    chrome.runtime.sendMessage({ type: 'GET_APP_DIRECTORY_STATE' }, (response: AppDirectoryState) => {
      isPaletteOpening = false;
      try {
        if (!isExtensionContextValid()) return;
        if (chrome.runtime.lastError) return;

        if (document.getElementById('app-directory-palette-host')) {
          return;
        }

        const folders: CachedFolder[] = (response && response.folders) || [];
        const categories: string[] = (response && response.categories) || [];
        const entries: CachedBookmark[] = (response && response.entries) || [];
        renderPaletteModal(folders, categories, entries);
      } catch (_) {}
    });
  } catch (_) {
    isPaletteOpening = false;
  }
}

interface ActionChoice {
  id: OpenBookmarkMode;
  title: string;
  desc: string;
  icon: string;
  kbd: string;
  numberKey: string;
}

const ACTION_CHOICES: ActionChoice[] = [
  {
    id: 'current',
    title: 'Open in Current Tab',
    desc: 'Navigate active tab to this website',
    icon: '📄',
    kbd: 'Enter',
    numberKey: '1'
  },
  {
    id: 'new-tab',
    title: 'Open in New Tab',
    desc: 'Open in a foreground tab & switch to it',
    icon: '↗️',
    kbd: 'Ctrl+Enter',
    numberKey: '2'
  },
  {
    id: 'background-tab',
    title: 'Open in New Background Tab',
    desc: 'Open silently in background without leaving this page',
    icon: '⧉',
    kbd: 'Shift+Enter',
    numberKey: '3'
  }
];

function renderPaletteModal(
  availableFolders: CachedFolder[],
  _availableCategories: string[],
  cachedEntries: CachedBookmark[] = []
): void {
  // Purge any stale palette hosts
  document.querySelectorAll('#app-directory-palette-host').forEach((node) => node.remove());

  const host = document.createElement('div');
  host.id = 'app-directory-palette-host';
  const shadow = host.attachShadow({ mode: 'open' });

  const styleEl = document.createElement('style');
  styleEl.textContent = modalCss;
  shadow.appendChild(styleEl);

  const folderMap = new Map<string, CachedFolder>();
  availableFolders.forEach((f) => folderMap.set(f.id, f));

  // Sort bookmarks by frequency / favorite / recent
  const allBookmarks: CachedBookmark[] = [...cachedEntries].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    const aVisits = a.visitCount || 0;
    const bVisits = b.visitCount || 0;
    if (bVisits !== aVisits) return bVisits - aVisits;
    const aTime = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
    const bTime = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
    return bTime - aTime;
  });

  let currentView: 'search' | 'actions' = 'search';
  let selectedBookmark: CachedBookmark | null = null;
  let filteredBookmarks: CachedBookmark[] = allBookmarks;
  let searchSelectedIndex = 0;
  let actionSelectedIndex = 0;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;

  const backdrop = document.createElement('div');
  backdrop.className = 'ad-modal-backdrop';

  backdrop.innerHTML = `
    <div class="ad-palette-card">
      <!-- Search View -->
      <div id="ad-palette-search-container" style="display:flex; flex-direction:column;">
        <div class="ad-palette-search-bar">
          <span class="ad-palette-search-icon">🔍</span>
          <input
            type="text"
            id="ad-palette-input"
            class="ad-palette-input"
            placeholder="Search saved websites (Alt+K)..."
            autocomplete="off"
            spellcheck="false"
          >
          <span id="ad-palette-counter" class="ad-palette-counter">${allBookmarks.length} sites</span>
          <span id="ad-palette-esc-btn" class="ad-palette-esc-badge" title="Close">ESC</span>
        </div>

        <div id="ad-palette-results" class="ad-palette-results"></div>

        <div class="ad-palette-footer">
          <div class="ad-palette-footer-shortcuts">
            <span><kbd class="ad-palette-kbd">↑↓</kbd> Navigate</span>
            <span><kbd class="ad-palette-kbd">↵</kbd> Select</span>
            <span><kbd class="ad-palette-kbd">Ctrl+↵</kbd> New Tab</span>
            <span><kbd class="ad-palette-kbd">Shift+↵</kbd> Background Tab</span>
            <span><kbd class="ad-palette-kbd">Esc</kbd> Close</span>
          </div>
        </div>
      </div>

      <!-- Action Chooser View -->
      <div id="ad-palette-action-container" class="ad-palette-action-view" style="display:none;">
        <div class="ad-palette-action-header">
          <button type="button" class="ad-palette-back-btn" id="ad-palette-back-btn">
            ← Back to search
          </button>
          <span id="ad-palette-action-esc-btn" class="ad-palette-esc-badge" title="Close">ESC</span>
        </div>

        <div class="ad-palette-target-info" id="ad-palette-target-info">
          <!-- Filled dynamically -->
        </div>

        <div class="ad-palette-prompt">Choose how to open this website:</div>

        <div class="ad-palette-choices-list" id="ad-palette-choices-list">
          ${ACTION_CHOICES.map(
            (choice, idx) => `
            <div class="ad-palette-choice-card ${idx === 0 ? 'is-selected' : ''}" data-choice="${choice.id}" data-index="${idx}">
              <div class="ad-palette-choice-icon">${choice.icon}</div>
              <div class="ad-palette-choice-text">
                <div class="ad-palette-choice-title">${escapeHtml(choice.title)}</div>
                <div class="ad-palette-choice-desc">${escapeHtml(choice.desc)}</div>
              </div>
              <div class="ad-palette-choice-kbd">
                <span class="ad-palette-kbd">${choice.kbd}</span>
              </div>
            </div>
          `
          ).join('')}
        </div>

        <div class="ad-palette-footer" style="padding: 10px 0 0 0; border-top: 1px solid rgba(255,255,255,0.08); background: transparent;">
          <div class="ad-palette-footer-shortcuts">
            <span><kbd class="ad-palette-kbd">1</kbd>/<kbd class="ad-palette-kbd">2</kbd>/<kbd class="ad-palette-kbd">3</kbd> Quick Choice</span>
            <span><kbd class="ad-palette-kbd">↑↓</kbd> Select</span>
            <span><kbd class="ad-palette-kbd">↵</kbd> Open</span>
            <span><kbd class="ad-palette-kbd">Esc</kbd> Back</span>
          </div>
        </div>
      </div>

      <!-- Floating Confirmation Toast -->
      <div class="ad-palette-toast" id="ad-palette-toast">
        <span>✓</span>
        <span id="ad-palette-toast-msg">Opened in background tab</span>
      </div>
    </div>
  `;

  shadow.appendChild(backdrop);
  document.body.appendChild(host);

  // Trigger animation & focus
  requestAnimationFrame(() => {
    backdrop.classList.add('ad-visible');
    const input = shadow.getElementById('ad-palette-input') as HTMLInputElement | null;
    if (input) {
      input.focus();
    }
  });

  const searchContainer = shadow.getElementById('ad-palette-search-container');
  const actionContainer = shadow.getElementById('ad-palette-action-container');
  const searchInput = shadow.getElementById('ad-palette-input') as HTMLInputElement | null;
  const resultsContainer = shadow.getElementById('ad-palette-results');
  const counterEl = shadow.getElementById('ad-palette-counter');
  const targetInfoEl = shadow.getElementById('ad-palette-target-info');
  const choicesListEl = shadow.getElementById('ad-palette-choices-list');
  const toastEl = shadow.getElementById('ad-palette-toast');
  const toastMsg = shadow.getElementById('ad-palette-toast-msg');

  // Close logic
  const closePalette = (): void => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
    if (keyHandler) {
      window.removeEventListener('keydown', keyHandler, true);
    }
    backdrop.classList.remove('ad-visible');
    setTimeout(() => host.remove(), 200);
  };

  const escBtn = shadow.getElementById('ad-palette-esc-btn');
  const actionEscBtn = shadow.getElementById('ad-palette-action-esc-btn');
  const backBtn = shadow.getElementById('ad-palette-back-btn');

  if (escBtn) escBtn.addEventListener('click', closePalette);
  if (actionEscBtn) actionEscBtn.addEventListener('click', closePalette);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePalette();
  });

  // Prevent keyboard events inside palette from bubbling to host page
  const stopKeyboardPropagation = (e: KeyboardEvent): void => {
    e.stopPropagation();
  };
  backdrop.addEventListener('keydown', stopKeyboardPropagation);
  backdrop.addEventListener('keyup', stopKeyboardPropagation);
  backdrop.addEventListener('keypress', stopKeyboardPropagation);
  host.addEventListener('keydown', stopKeyboardPropagation);
  host.addEventListener('keyup', stopKeyboardPropagation);
  host.addEventListener('keypress', stopKeyboardPropagation);

  // Switch to Action Chooser View
  const selectBookmarkForAction = (bookmark: CachedBookmark): void => {
    selectedBookmark = bookmark;
    currentView = 'actions';
    actionSelectedIndex = 0;

    if (searchContainer) searchContainer.style.display = 'none';
    if (actionContainer) actionContainer.style.display = 'flex';

    if (targetInfoEl) {
      const folder = bookmark.folderId ? folderMap.get(bookmark.folderId) : null;
      const domain = getDomain(bookmark.url);
      const iconSrc = bookmark.iconUrl || bookmark.icon || '';
      const isImg = iconSrc.startsWith('http') || iconSrc.startsWith('data:');

      targetInfoEl.innerHTML = `
        <div class="ad-palette-target-icon">
          ${isImg ? `<img src="${escapeHtml(iconSrc)}" alt="" onerror="this.parentElement.textContent='🌐'">` : (iconSrc || '📁')}
        </div>
        <div class="ad-palette-target-meta">
          <div class="ad-palette-target-title">${escapeHtml(bookmark.name || 'Untitled')}</div>
          <div class="ad-palette-target-url">${escapeHtml(domain)}${bookmark.description ? ` &bull; ${escapeHtml(bookmark.description)}` : ''}</div>
        </div>
        ${folder ? `<span class="ad-palette-folder-badge" style="${folder.color ? `background:${folder.color}1c; color:${folder.color}; border-color:${folder.color}40;` : ''}">${escapeHtml(folder.icon || '📁')} ${escapeHtml(folder.name)}</span>` : ''}
      `;
    }

    updateActionSelection();
  };

  // Switch back to Search View
  const backToSearchView = (): void => {
    currentView = 'search';
    selectedBookmark = null;
    if (actionContainer) actionContainer.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'flex';
    if (searchInput) {
      searchInput.focus();
    }
  };

  if (backBtn) backBtn.addEventListener('click', backToSearchView);

  // Execute Open Action
  const executeAction = (bookmark: CachedBookmark, mode: OpenBookmarkMode): void => {
    if (!bookmark || !bookmark.url) return;

    try {
      chrome.runtime.sendMessage({
        type: 'OPEN_BOOKMARK_URL',
        url: bookmark.url,
        mode,
        id: bookmark.id
      });
    } catch (_) {}

    if (mode === 'background-tab') {
      if (toastEl && toastMsg) {
        toastMsg.textContent = `Opened "${bookmark.name}" in background tab ✓`;
        toastEl.classList.add('ad-show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toastEl.classList.remove('ad-show');
        }, 2200);
      }
      // If was in action chooser view, return to search view so user can keep searching/opening other links
      if (currentView === 'actions') {
        backToSearchView();
      }
    } else {
      closePalette();
    }
  };

  // Update selection highlight in Action Chooser
  const updateActionSelection = (): void => {
    if (!choicesListEl) return;
    const cards = choicesListEl.querySelectorAll('.ad-palette-choice-card');
    cards.forEach((card, idx) => {
      card.classList.toggle('is-selected', idx === actionSelectedIndex);
    });
  };

  // Setup click listeners on action cards
  if (choicesListEl) {
    const cards = choicesListEl.querySelectorAll('.ad-palette-choice-card');
    cards.forEach((card, idx) => {
      card.addEventListener('mouseenter', () => {
        actionSelectedIndex = idx;
        updateActionSelection();
      });
      card.addEventListener('click', () => {
        if (!selectedBookmark) return;
        const choice = ACTION_CHOICES[idx];
        if (choice) {
          executeAction(selectedBookmark, choice.id);
        }
      });
    });
  }

  // Update selection highlight in Search Results
  const updateSearchSelection = (): void => {
    if (!resultsContainer) return;
    const items = resultsContainer.querySelectorAll('.ad-palette-item');
    items.forEach((item, idx) => {
      const isSelected = idx === searchSelectedIndex;
      item.classList.toggle('is-selected', isSelected);
      if (isSelected) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  };

  // Render Search Results
  const renderResults = (query: string): void => {
    if (!resultsContainer) return;

    const q = query.trim().toLowerCase();
    if (!q) {
      filteredBookmarks = allBookmarks;
    } else {
      filteredBookmarks = allBookmarks.filter((entry) => {
        const nameMatch = (entry.name || '').toLowerCase().includes(q);
        const urlMatch = (entry.url || '').toLowerCase().includes(q);
        const descMatch = (entry.description || '').toLowerCase().includes(q);
        const catMatch = (entry.categories || []).some((c) => c.toLowerCase().includes(q));
        const folder = entry.folderId ? folderMap.get(entry.folderId) : null;
        const folderMatch = folder ? folder.name.toLowerCase().includes(q) : false;
        return nameMatch || urlMatch || descMatch || catMatch || folderMatch;
      });
    }

    if (counterEl) {
      counterEl.textContent = `${filteredBookmarks.length} site${filteredBookmarks.length !== 1 ? 's' : ''}`;
    }

    resultsContainer.innerHTML = '';

    if (filteredBookmarks.length === 0) {
      resultsContainer.innerHTML = `
        <div class="ad-palette-empty">
          <div class="ad-palette-empty-icon">🔍</div>
          <div>No matching websites found for "<strong>${escapeHtml(query)}</strong>"</div>
        </div>
      `;
      return;
    }

    if (!q) {
      const secHeader = document.createElement('div');
      secHeader.className = 'ad-palette-section-title';
      secHeader.textContent = '★ Frequently Visited & Starred';
      resultsContainer.appendChild(secHeader);
    }

    filteredBookmarks.forEach((entry, idx) => {
      const folder = entry.folderId ? folderMap.get(entry.folderId) : null;
      const domain = getDomain(entry.url);
      const iconSrc = entry.iconUrl || entry.icon || '';
      const isImg = iconSrc.startsWith('http') || iconSrc.startsWith('data:');

      const row = document.createElement('div');
      row.className = `ad-palette-item ${idx === searchSelectedIndex ? 'is-selected' : ''}`;
      row.setAttribute('data-index', String(idx));

      row.innerHTML = `
        <div class="ad-palette-item-icon">
          ${isImg ? `<img src="${escapeHtml(iconSrc)}" alt="" onerror="this.parentElement.textContent='🌐'">` : (iconSrc || '📁')}
        </div>
        <div class="ad-palette-item-info">
          <div class="ad-palette-item-title-row">
            <span class="ad-palette-item-title">${escapeHtml(entry.name || 'Untitled')}</span>
            ${entry.isFavorite ? `<span class="ad-palette-fav-star" title="Favorite">★</span>` : ''}
          </div>
          <div class="ad-palette-item-subtitle">${escapeHtml(domain)}${entry.description ? ` &bull; ${escapeHtml(entry.description)}` : ''}</div>
        </div>
        <div class="ad-palette-item-badges">
          ${folder ? `<span class="ad-palette-folder-badge" ${folder.color ? `style="background:${folder.color}1c; color:${folder.color}; border-color:${folder.color}40;"` : ''}>${escapeHtml(folder.icon || '📁')} ${escapeHtml(folder.name)}</span>` : ''}
          ${Array.isArray(entry.categories) && entry.categories[0] ? `<span class="ad-palette-tag">${escapeHtml(entry.categories[0])}</span>` : ''}
        </div>
        <div class="ad-palette-quick-actions">
          <button type="button" class="ad-palette-quick-btn" data-mode="current" title="Open in Current Tab (Enter)">📄</button>
          <button type="button" class="ad-palette-quick-btn" data-mode="new-tab" title="Open in New Tab (Ctrl+Enter)">↗️</button>
          <button type="button" class="ad-palette-quick-btn" data-mode="background-tab" title="Open in Background Tab (Shift+Enter)">⧉</button>
        </div>
      `;

      // Quick action button clicks
      row.querySelectorAll('.ad-palette-quick-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const mode = btn.getAttribute('data-mode') as OpenBookmarkMode;
          executeAction(entry, mode);
        });
      });

      // Hover to highlight
      row.addEventListener('mouseenter', () => {
        searchSelectedIndex = idx;
        updateSearchSelection();
      });

      // Clicking row opens Action Chooser
      row.addEventListener('click', () => {
        selectBookmarkForAction(entry);
      });

      resultsContainer.appendChild(row);
    });

    if (searchSelectedIndex >= filteredBookmarks.length) {
      searchSelectedIndex = 0;
    }
    updateSearchSelection();
  };

  // Initial render
  renderResults('');

  // Search input events
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchSelectedIndex = 0;
      renderResults(searchInput.value);
    });
  }

  // Keyboard navigation
  keyHandler = (e: KeyboardEvent): void => {
    // If Action Chooser view is active
    if (currentView === 'actions') {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        e.stopPropagation();
        backToSearchView();
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedBookmark) executeAction(selectedBookmark, 'current');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedBookmark) executeAction(selectedBookmark, 'new-tab');
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedBookmark) executeAction(selectedBookmark, 'background-tab');
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        actionSelectedIndex = (actionSelectedIndex + 1) % ACTION_CHOICES.length;
        updateActionSelection();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        actionSelectedIndex =
          (actionSelectedIndex - 1 + ACTION_CHOICES.length) % ACTION_CHOICES.length;
        updateActionSelection();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (selectedBookmark) {
          const choice = ACTION_CHOICES[actionSelectedIndex];
          if (choice) {
            executeAction(selectedBookmark, choice.id);
          }
        }
        return;
      }
      return;
    }

    // If Search view is active
    if (currentView === 'search') {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closePalette();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredBookmarks.length > 0) {
          searchSelectedIndex = (searchSelectedIndex + 1) % filteredBookmarks.length;
          updateSearchSelection();
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredBookmarks.length > 0) {
          searchSelectedIndex =
            (searchSelectedIndex - 1 + filteredBookmarks.length) % filteredBookmarks.length;
          updateSearchSelection();
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const selected = filteredBookmarks[searchSelectedIndex];
        if (!selected) return;

        // Power shortcut: Ctrl+Enter -> New tab
        if (e.ctrlKey || e.metaKey) {
          executeAction(selected, 'new-tab');
          return;
        }

        // Power shortcut: Shift+Enter -> Background tab
        if (e.shiftKey) {
          executeAction(selected, 'background-tab');
          return;
        }

        // Regular Enter -> Opens Action Chooser with 3 choices
        selectBookmarkForAction(selected);
        return;
      }
    }
  };

  window.addEventListener('keydown', keyHandler, true);
}
