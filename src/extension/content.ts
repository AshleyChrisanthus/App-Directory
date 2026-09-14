import modalCss from './modal.css';

// Clean up any stale modal or listeners from previous injections
if (typeof (window as any).__APP_DIRECTORY_CLEANUP__ === 'function') {
  try {
    (window as any).__APP_DIRECTORY_CLEANUP__();
  } catch (_) {}
}

interface CachedFolder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

interface AppDirectoryState {
  folders: CachedFolder[];
  categories: string[];
}

function detectFavicon(): string {
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel*="icon"]'));
  const appleIcon = links.find(l => l.rel.includes('apple-touch-icon'));
  if (appleIcon && appleIcon.href) return appleIcon.href;

  for (const link of links) {
    if (link.href && !link.href.startsWith('data:')) {
      return link.href;
    }
  }

  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
    window.location.origin
  )}&size=128`;
}

function detectDescription(): string {
  const metaDesc =
    document.querySelector<HTMLMetaElement>('meta[name="description" i]')?.content ||
    document.querySelector<HTMLMetaElement>('meta[property="og:description" i]')?.content ||
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description" i]')?.content;
  return (metaDesc || '').trim();
}

function isExtensionContextValid(): boolean {
  try {
    return typeof chrome !== 'undefined' &&
      typeof chrome.runtime !== 'undefined' &&
      !!chrome.runtime.id;
  } catch {
    return false;
  }
}

function toggleModal(): void {
  if (!isExtensionContextValid()) {
    console.warn('[App Directory Companion] Extension was reloaded. Please refresh this page.');
    return;
  }

  const existingHost = document.getElementById('app-directory-modal-host');
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

  // Fetch folders and categories from extension background
  try {
    chrome.runtime.sendMessage({ type: 'GET_APP_DIRECTORY_STATE' }, (response: AppDirectoryState) => {
      try {
        if (!isExtensionContextValid()) return;
        if (chrome.runtime.lastError) return;
        const folders: CachedFolder[] = (response && response.folders) || [];
        const categories: string[] = (response && response.categories) || [];
        renderModal(folders, categories);
      } catch (_) {}
    });
  } catch (_) {}
}

function renderModal(availableFolders: CachedFolder[], availableCategories: string[]): void {
  const host = document.createElement('div');
  host.id = 'app-directory-modal-host';
  const shadow = host.attachShadow({ mode: 'open' });

  // Scoped CSS
  const styleEl = document.createElement('style');
  styleEl.textContent = modalCss;
  shadow.appendChild(styleEl);

  const initialTitle = document.title.trim() || window.location.hostname;
  const initialUrl = window.location.href;
  const initialIcon = detectFavicon();
  const initialDesc = detectDescription();

  const selectedCategories: string[] = [];
  let isFavorite = false;
  let suggestionHighlightedIndex = -1;

  const backdrop = document.createElement('div');
  backdrop.className = 'ad-modal-backdrop';

  backdrop.innerHTML = `
    <div class="ad-modal-card">
      <div class="ad-modal-header">
        <div class="ad-modal-title-group">
          <div class="ad-app-icon">📁</div>
          <span class="ad-modal-title">Add to App Directory</span>
          <span class="ad-badge-local">Local DB</span>
        </div>
        <button type="button" class="ad-close-btn" title="Close (Esc)">✕</button>
      </div>

      <div class="ad-modal-body">
        <div class="ad-field-row">
          <div class="ad-icon-preview-box" title="Website Icon">
            <img class="ad-icon-img" src="${escapeHtml(initialIcon)}" alt="" onerror="this.src='https://icons.duckduckgo.com/ip3/${window.location.hostname}.ico'">
          </div>
          <div class="ad-form-group">
            <label class="ad-form-label" for="ad-name-input">Website Name</label>
            <input type="text" id="ad-name-input" class="ad-input" value="${escapeHtml(initialTitle)}" spellcheck="false">
          </div>
        </div>

        <div class="ad-form-group">
          <label class="ad-form-label" for="ad-url-input">Website URL</label>
          <input type="url" id="ad-url-input" class="ad-input" value="${escapeHtml(initialUrl)}" spellcheck="false">
        </div>

        <div class="ad-two-col">
          <div class="ad-form-group">
            <label class="ad-form-label" for="ad-folder-select">Folder</label>
            <select id="ad-folder-select" class="ad-select">
              <option value="">(None / Root)</option>
              ${availableFolders.map(f => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.icon || '📁')} ${escapeHtml(f.name)}</option>`).join('')}
            </select>
          </div>

          <div class="ad-form-group" style="justify-content: flex-end;">
            <label class="ad-form-label">Pin to Favorites</label>
            <div class="ad-fav-toggle" id="ad-fav-toggle">
              <span class="ad-fav-star">☆</span>
              <span>Favorite</span>
            </div>
          </div>
        </div>

        <div class="ad-form-group ad-categories-field">
          <label class="ad-form-label">Categories</label>
          <div class="ad-tags-wrapper" id="ad-tags-wrapper">
            <input type="text" class="ad-tag-input" id="ad-tag-input" placeholder="Type category and press Enter..." autocomplete="off">
          </div>
          <div class="ad-suggestions-popup" id="ad-suggestions-popup"></div>
        </div>

        <div class="ad-form-group">
          <label class="ad-form-label" for="ad-desc-input">Description / Notes <span style="font-size:10px;text-transform:none;opacity:0.7;">(Auto-detected)</span></label>
          <textarea id="ad-desc-input" class="ad-textarea" placeholder="Add optional notes...">${escapeHtml(initialDesc)}</textarea>
        </div>
      </div>

      <div class="ad-modal-footer">
        <span class="ad-shortcut-hint"><kbd>Alt+A</kbd> / <kbd>Alt+S</kbd> to open &bull; <kbd>Ctrl+Enter</kbd> to save</span>
        <div class="ad-btn-group">
          <button type="button" class="ad-btn ad-btn-secondary" id="ad-cancel-btn">Cancel</button>
          <button type="button" class="ad-btn ad-btn-primary" id="ad-save-btn">✓ Save to App</button>
        </div>
      </div>

      <div class="ad-success-overlay" id="ad-success-overlay">
        <div class="ad-success-icon">✓</div>
        <div class="ad-success-text">Saved to App Directory!</div>
        <div class="ad-success-sub" id="ad-success-sub">Synced to your local database</div>
      </div>
    </div>
  `;

  shadow.appendChild(backdrop);
  document.body.appendChild(host);

  // Trigger animation
  requestAnimationFrame(() => {
    backdrop.classList.add('ad-visible');
    const nameInput = shadow.getElementById('ad-name-input') as HTMLInputElement | null;
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  });

  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let keyHandler: ((e: KeyboardEvent) => void) | null = null;

  // Close logic
  const closeModal = (): void => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (keyHandler) {
      window.removeEventListener('keydown', keyHandler, true);
    }
    backdrop.classList.remove('ad-visible');
    setTimeout(() => host.remove(), 200);
  };

  const closeBtn = shadow.querySelector('.ad-close-btn');
  const cancelBtn = shadow.getElementById('ad-cancel-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Favorite toggle
  const favToggle = shadow.getElementById('ad-fav-toggle');
  if (favToggle) {
    favToggle.addEventListener('click', () => {
      isFavorite = !isFavorite;
      favToggle.classList.toggle('active', isFavorite);
      const star = favToggle.querySelector('.ad-fav-star');
      if (star) star.textContent = isFavorite ? '★' : '☆';
    });
  }

  // Tag manager & Suggestions
  const tagsWrapper = shadow.getElementById('ad-tags-wrapper');
  const tagInput = shadow.getElementById('ad-tag-input') as HTMLInputElement | null;
  const suggestionsPopup = shadow.getElementById('ad-suggestions-popup');

  const addCategoryChip = (catName: string): void => {
    const trimmed = catName.trim();
    if (!trimmed || selectedCategories.includes(trimmed)) return;
    selectedCategories.push(trimmed);

    const chip = document.createElement('span');
    chip.className = 'ad-tag-chip';
    chip.setAttribute('data-tag', trimmed);
    chip.innerHTML = `${escapeHtml(trimmed)} <span class="ad-remove-tag" title="Remove">✕</span>`;

    chip.querySelector('.ad-remove-tag')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = selectedCategories.indexOf(trimmed);
      if (idx !== -1) selectedCategories.splice(idx, 1);
      chip.remove();
      renderSuggestions();
    });

    if (tagInput && tagsWrapper) {
      tagsWrapper.insertBefore(chip, tagInput);
      tagInput.value = '';
    }
  };

  const renderSuggestions = (): void => {
    if (!suggestionsPopup || !tagInput) return;

    const query = tagInput.value.trim().toLowerCase();
    const unselected = availableCategories.filter(cat => !selectedCategories.includes(cat));
    const matches = query ? unselected.filter(cat => cat.toLowerCase().includes(query)) : unselected;

    suggestionsPopup.innerHTML = '';
    suggestionHighlightedIndex = -1;

    if (matches.length === 0) {
      suggestionsPopup.classList.remove('ad-show');
      return;
    }

    matches.slice(0, 8).forEach((cat) => {
      const item = document.createElement('div');
      item.className = 'ad-suggestion-item';
      item.innerHTML = `
        <span class="ad-suggest-tag-name">${escapeHtml(cat)}</span>
        <span class="ad-suggest-tag-hint">Press Enter</span>
      `;

      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        addCategoryChip(cat);
        tagInput.value = '';
        renderSuggestions();
        tagInput.focus();
      });

      suggestionsPopup.appendChild(item);
    });

    suggestionsPopup.classList.add('ad-show');
  };

  const updateSuggestionHighlight = (items: HTMLElement[]): void => {
    items.forEach((el, idx) => {
      el.classList.toggle('is-focused', idx === suggestionHighlightedIndex);
    });
    if (suggestionHighlightedIndex >= 0 && items[suggestionHighlightedIndex]) {
      items[suggestionHighlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  };

  if (tagInput) {
    tagInput.addEventListener('keydown', (e: KeyboardEvent) => {
      const items = suggestionsPopup
        ? Array.from(suggestionsPopup.querySelectorAll<HTMLElement>('.ad-suggestion-item'))
        : [];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length > 0) {
          suggestionHighlightedIndex = (suggestionHighlightedIndex + 1) % items.length;
          updateSuggestionHighlight(items);
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length > 0) {
          suggestionHighlightedIndex = (suggestionHighlightedIndex - 1 + items.length) % items.length;
          updateSuggestionHighlight(items);
        }
        return;
      }

      // Allow Ctrl+Enter to save immediately even from within tag input
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter')) {
        e.preventDefault();
        e.stopPropagation();
        doSave();
        return;
      }

      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        if (suggestionHighlightedIndex >= 0 && items[suggestionHighlightedIndex]) {
          const selectedName = items[suggestionHighlightedIndex].querySelector('.ad-suggest-tag-name')?.textContent;
          if (selectedName) {
            addCategoryChip(selectedName);
          }
        } else if (tagInput.value.trim()) {
          addCategoryChip(tagInput.value.trim());
        }
        tagInput.value = '';
        renderSuggestions();
        return;
      }

      if (e.key === 'Escape' && suggestionsPopup?.classList.contains('ad-show')) {
        e.stopPropagation();
        suggestionsPopup.classList.remove('ad-show');
        return;
      }

      if (e.key === 'Backspace' && tagInput.value === '' && selectedCategories.length > 0) {
        selectedCategories.pop();
        const chips = tagsWrapper?.querySelectorAll('.ad-tag-chip');
        if (chips && chips.length > 0) {
          chips[chips.length - 1].remove();
        }
        renderSuggestions();
      }
    });

    tagInput.addEventListener('input', () => {
      renderSuggestions();
    });

    tagInput.addEventListener('focus', () => {
      renderSuggestions();
    });

    tagInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (suggestionsPopup) suggestionsPopup.classList.remove('ad-show');
      }, 150);
    });
  }

  // Save handler
  const saveBtn = shadow.getElementById('ad-save-btn');
  let isSaving = false;

  const doSave = (): void => {
    if (isSaving) return;

    try {
      if (!isExtensionContextValid()) {
        alert('The extension was reloaded. Please refresh this page to save bookmarks.');
        return;
      }
    } catch (_) {
      return;
    }

    const nameInput = shadow.getElementById('ad-name-input') as HTMLInputElement | null;
    const urlInput = shadow.getElementById('ad-url-input') as HTMLInputElement | null;
    const folderSelect = shadow.getElementById('ad-folder-select') as HTMLSelectElement | null;
    const descInput = shadow.getElementById('ad-desc-input') as HTMLTextAreaElement | null;

    if (tagInput && tagInput.value.trim()) {
      addCategoryChip(tagInput.value.trim());
    }

    const name = nameInput?.value.trim() || initialTitle;
    const url = urlInput?.value.trim() || initialUrl;
    const folderId = folderSelect?.value || null;
    const description = descInput?.value.trim() || '';

    const newBookmark = {
      id: 'entry_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9),
      name,
      url,
      iconUrl: initialIcon,
      folderId: folderId || undefined,
      categories: selectedCategories,
      description,
      isFavorite,
      dateAdded: new Date().toISOString(),
      visitCount: 0
    };

    isSaving = true;

    const successOverlay = shadow.getElementById('ad-success-overlay');
    const successSub = shadow.getElementById('ad-success-sub');

    // Optimistic UI: Immediately show the checkmark overlay with zero latency
    if (successOverlay) {
      successOverlay.classList.add('ad-show');
    }

    // Schedule modal close after the user sees the confirmation tick
    closeTimer = setTimeout(() => {
      closeModal();
    }, 750);

    try {
      chrome.runtime.sendMessage({ type: 'SAVE_BOOKMARK', entry: newBookmark }, (res) => {
        try {
          if (!isExtensionContextValid()) return;

          // In case of unexpected failure, cancel the close timer and display error
          if (chrome.runtime.lastError || (res && res.success === false)) {
            if (closeTimer) {
              clearTimeout(closeTimer);
              closeTimer = null;
            }
            if (successOverlay) successOverlay.classList.remove('ad-show');
            isSaving = false;
            const errorMsg = chrome.runtime.lastError?.message || res?.error || 'Failed to save bookmark';
            alert(`App Directory: ${errorMsg}`);
            return;
          }

          // Update subtitle dynamically if still open
          if (successSub && res) {
            if (res.direct) {
              successSub.textContent = 'Saved directly to your open App Directory tab!';
            } else if (res.queued) {
              successSub.textContent = `Queued (${res.pendingCount || 1} pending) — will sync when App Directory opens.`;
            }
          }
        } catch (_) {}
      });
    } catch (err: any) {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      if (successOverlay) successOverlay.classList.remove('ad-show');
      isSaving = false;
      alert(`App Directory: ${err?.message || 'Failed to send save request'}`);
    }
  };

  if (saveBtn) saveBtn.addEventListener('click', doSave);

  // Global keys within modal - captured at window level for reliable Ctrl+Enter & Escape
  keyHandler = (e: KeyboardEvent): void => {
    const isCtrlEnter =
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'Enter' || e.code === 'Enter' || e.code === 'NumpadEnter');

    if (isCtrlEnter) {
      e.preventDefault();
      e.stopPropagation();
      doSave();
      return;
    }

    if (e.key === 'Escape' || e.code === 'Escape') {
      const popup = shadow.getElementById('ad-suggestions-popup');
      if (popup && popup.classList.contains('ad-show')) {
        e.preventDefault();
        e.stopPropagation();
        popup.classList.remove('ad-show');
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    }
  };

  window.addEventListener('keydown', keyHandler, true);
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Register global cleanup handler
(window as any).__APP_DIRECTORY_CLEANUP__ = () => {
  try {
    window.removeEventListener('keydown', handlePageShortcut, true);
    document.removeEventListener('keydown', handlePageShortcut, true);
    const host = document.getElementById('app-directory-modal-host');
    if (host) host.remove();
  } catch (_) {}
};

// Page-level keyboard shortcut listeners for Alt+A (Add), Alt+S (Save), Alt+B (Bookmark), or Alt+D
function handlePageShortcut(e: KeyboardEvent): void {
  if (!isExtensionContextValid()) {
    if (typeof (window as any).__APP_DIRECTORY_CLEANUP__ === 'function') {
      (window as any).__APP_DIRECTORY_CLEANUP__();
    }
    return;
  }

  if (!e.altKey || e.ctrlKey) return;

  const isA = e.code === 'KeyA' || e.key === 'a' || e.key === 'A';
  const isS = e.code === 'KeyS' || e.key === 's' || e.key === 'S';
  const isB = e.code === 'KeyB' || e.key === 'b' || e.key === 'B';
  const isD = e.code === 'KeyD' || e.key === 'd' || e.key === 'D';

  if (isA || isS || isB || isD) {
    const existingHost = document.getElementById('app-directory-modal-host');
    if (!existingHost) {
      e.preventDefault();
      e.stopPropagation();
      toggleModal();
    }
  }
}

window.addEventListener('keydown', handlePageShortcut, true);
document.addEventListener('keydown', handlePageShortcut, true);

// Listen for messages from background script
try {
  if (isExtensionContextValid() && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      try {
        if (!isExtensionContextValid()) return;
        if (message && message.type === 'TOGGLE_INJECTED_MODAL') {
          toggleModal();
          sendResponse({ success: true });
        }
      } catch (_) {}
    });
  }
} catch (_) {}
