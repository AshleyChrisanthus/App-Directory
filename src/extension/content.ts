import modalCss from './modal.css';

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
  // Prefer apple-touch-icon or largest icon
  const appleIcon = links.find(l => l.rel.includes('apple-touch-icon'));
  if (appleIcon && appleIcon.href) return appleIcon.href;

  for (const link of links) {
    if (link.href && !link.href.startsWith('data:')) {
      return link.href;
    }
  }

  // Fallback to Google Favicon Service
  const domain = window.location.hostname;
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
    window.location.origin
  )}&size=128`;
}

function toggleModal(): void {
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
  chrome.runtime.sendMessage({ type: 'GET_APP_DIRECTORY_STATE' }, (response: AppDirectoryState) => {
    const folders: CachedFolder[] = (response && response.folders) || [];
    const categories: string[] = (response && response.categories) || [];
    renderModal(folders, categories);
  });
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

  const selectedCategories: string[] = [];
  let isFavorite = false;

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

        <div class="ad-form-group">
          <label class="ad-form-label">Categories</label>
          <div class="ad-tags-wrapper" id="ad-tags-wrapper">
            <input type="text" class="ad-tag-input" id="ad-tag-input" placeholder="Type category and press Enter...">
          </div>
          ${availableCategories.length > 0 ? `
            <div class="ad-suggestions" id="ad-suggestions">
              ${availableCategories.slice(0, 10).map(cat => `
                <span class="ad-suggest-pill" data-cat="${escapeHtml(cat)}">+ ${escapeHtml(cat)}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="ad-form-group">
          <label class="ad-form-label" for="ad-desc-input">Description / Notes <span style="font-size:10px;text-transform:none;opacity:0.7;">(Optional)</span></label>
          <textarea id="ad-desc-input" class="ad-textarea" placeholder="Add optional notes..."></textarea>
        </div>
      </div>

      <div class="ad-modal-footer">
        <span class="ad-shortcut-hint"><kbd>Alt+D</kbd> or <kbd>Ctrl+Enter</kbd> to save</span>
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

  // Close logic
  const closeModal = (): void => {
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

  // Tag manager
  const tagsWrapper = shadow.getElementById('ad-tags-wrapper');
  const tagInput = shadow.getElementById('ad-tag-input') as HTMLInputElement | null;
  const suggestionsBox = shadow.getElementById('ad-suggestions');

  const addCategoryChip = (catName: string): void => {
    const trimmed = catName.trim();
    if (!trimmed || selectedCategories.includes(trimmed)) return;
    selectedCategories.push(trimmed);

    const chip = document.createElement('span');
    chip.className = 'ad-tag-chip';
    chip.setAttribute('data-tag', trimmed);
    chip.innerHTML = `${escapeHtml(trimmed)} <span class="ad-remove-tag" title="Remove">✕</span>`;

    chip.querySelector('.ad-remove-tag')?.addEventListener('click', () => {
      const idx = selectedCategories.indexOf(trimmed);
      if (idx !== -1) selectedCategories.splice(idx, 1);
      chip.remove();
    });

    if (tagInput && tagsWrapper) {
      tagsWrapper.insertBefore(chip, tagInput);
      tagInput.value = '';
    }
  };

  if (tagInput) {
    tagInput.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addCategoryChip(tagInput.value);
      } else if (e.key === 'Backspace' && tagInput.value === '' && selectedCategories.length > 0) {
        const last = selectedCategories.pop();
        const chips = tagsWrapper?.querySelectorAll('.ad-tag-chip');
        if (chips && chips.length > 0) {
          chips[chips.length - 1].remove();
        }
      }
    });
  }

  if (suggestionsBox) {
    suggestionsBox.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.ad-suggest-pill') as HTMLElement | null;
      if (target && target.dataset.cat) {
        addCategoryChip(target.dataset.cat);
      }
    });
  }

  // Save handler
  const saveBtn = shadow.getElementById('ad-save-btn');
  const doSave = (): void => {
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

    chrome.runtime.sendMessage({ type: 'SAVE_BOOKMARK', entry: newBookmark }, (res) => {
      const successOverlay = shadow.getElementById('ad-success-overlay');
      const successSub = shadow.getElementById('ad-success-sub');
      if (successSub && res) {
        if (res.direct) {
          successSub.textContent = 'Saved directly to your open App Directory tab!';
        } else if (res.queued) {
          successSub.textContent = `Queued (${res.pendingCount || 1} pending) — will sync when App Directory opens.`;
        }
      }

      if (successOverlay) successOverlay.classList.add('ad-show');
      setTimeout(() => {
        closeModal();
      }, 700);
    });
  };

  if (saveBtn) saveBtn.addEventListener('click', doSave);

  // Global keys within host
  const keyHandler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      doSave();
    }
  };

  host.addEventListener('keydown', keyHandler);
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'TOGGLE_INJECTED_MODAL') {
    toggleModal();
    sendResponse({ success: true });
  }
});
