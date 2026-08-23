/* ========================================
   App Directory — Main Application Logic
   ======================================== */

(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────
  const STORAGE_KEY = 'appDirectory_entries';
  const THEME_KEY = 'appDirectory_theme';
  const FAVICON_API = 'https://www.google.com/s2/favicons?sz=64&domain_url=';
  const DEFAULT_CATEGORIES = ['Development', 'Social', 'News', 'Entertainment', 'Productivity', 'Other'];

  // ── DOM Elements ───────────────────────────────────────
  const grid = document.getElementById('grid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortSelect = document.getElementById('sortSelect');
  const addBtn = document.getElementById('addBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');
  const entryForm = document.getElementById('entryForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const saveBtn = document.getElementById('saveBtn');
  const themeToggle = document.getElementById('themeToggle');
  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const statsText = document.getElementById('statsText');

  // Form fields
  const entryName = document.getElementById('entryName');
  const entryUrl = document.getElementById('entryUrl');
  const entryCategory = document.getElementById('entryCategory');
  const entryIcon = document.getElementById('entryIcon');
  const entryDescription = document.getElementById('entryDescription');
  const entryFavorite = document.getElementById('entryFavorite');

  // ── State ──────────────────────────────────────────────
  let entries = [];
  let editingId = null;
  let selectedCategories = []; // categories selected in the modal form

  // ── Utilities ──────────────────────────────────────────

  function generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : (
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      })
    );
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function formatDateFull(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(iso);
  }

  function ensureProtocol(url) {
    if (!url) return '';
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return url;
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function getFaviconUrl(url) {
    try {
      const u = new URL(ensureProtocol(url));
      return FAVICON_API + encodeURIComponent(u.origin);
    } catch {
      return '';
    }
  }

  // ── Storage ────────────────────────────────────────────

  function migrateEntry(entry) {
    // Migrate legacy 'category' (string) → 'categories' (array)
    if (!entry.categories) {
      if (entry.category && typeof entry.category === 'string') {
        entry.categories = [entry.category.trim()];
      } else {
        entry.categories = [];
      }
    }
    // Clean up legacy field
    delete entry.category;
    return entry;
  }

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      entries = raw ? JSON.parse(raw) : [];
      // Migrate any legacy entries
      let migrated = false;
      entries = entries.map(e => {
        if (!e.categories || typeof e.category === 'string') {
          migrated = true;
          return migrateEntry(e);
        }
        return e;
      });
      if (migrated) saveEntries();
    } catch {
      entries = [];
    }
  }

  function saveEntries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  // ── Categories ─────────────────────────────────────────

  function getAllCategories() {
    const custom = entries
      .flatMap(e => (e.categories || []))
      .map(c => c.trim())
      .filter(c => c && !DEFAULT_CATEGORIES.includes(c));
    const merged = [...DEFAULT_CATEGORIES, ...custom];
    // Deduplicate while preserving order
    return [...new Set(merged)];
  }

  function populateCategories() {
    const cats = getAllCategories();

    // Update filter dropdown (preserve current selection)
    const currentFilter = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categoryFilter.appendChild(opt);
    });
    categoryFilter.value = currentFilter;

    // Update datalist in the form
    const datalist = document.getElementById('categorySuggestions');
    datalist.innerHTML = '';
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      datalist.appendChild(opt);
    });
  }

  // ── Theme ──────────────────────────────────────────────

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
  }

  // ── Toast ──────────────────────────────────────────────

  function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ── Modal ──────────────────────────────────────────────

  function openModal(id = null) {
    editingId = id;

    if (id) {
      const entry = entries.find(e => e.id === id);
      if (!entry) return;
      modalTitle.textContent = 'Edit Website';
      saveBtn.textContent = 'Update';
      entryName.value = entry.name || '';
      entryUrl.value = entry.url || '';
      selectedCategories = [...(entry.categories || [])];
      entryIcon.value = entry.iconUrl || '';
      entryDescription.value = entry.description || '';
      entryFavorite.checked = entry.isFavorite || false;
    } else {
      modalTitle.textContent = 'Add Website';
      saveBtn.textContent = 'Save';
      entryForm.reset();
      selectedCategories = [];
    }

    entryCategory.value = '';
    renderCategoryChips();

    // Clear validation
    entryForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => entryName.focus(), 100);
  }

  function closeModal() {
    modalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    editingId = null;
  }

  // ── CRUD ───────────────────────────────────────────────

  function addEntry(data) {
    const now = new Date().toISOString();
    const entry = {
      id: generateId(),
      name: data.name,
      url: ensureProtocol(data.url),
      description: data.description || '',
      iconUrl: data.iconUrl || getFaviconUrl(data.url),
      categories: data.categories || [],
      dateAdded: now,
      dateModified: now,
      visitCount: 0,
      lastVisited: null,
      isFavorite: data.isFavorite || false
    };
    entries.push(entry);
    saveEntries();
    showToast(`"${entry.name}" added!`);
  }

  function updateEntry(id, data) {
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1) return;
    const entry = entries[idx];
    entry.name = data.name;
    entry.url = ensureProtocol(data.url);
    entry.description = data.description || '';
    entry.iconUrl = data.iconUrl || getFaviconUrl(data.url);
    entry.categories = data.categories || [];
    entry.isFavorite = data.isFavorite || false;
    entry.dateModified = new Date().toISOString();
    saveEntries();
    showToast(`"${entry.name}" updated!`);
  }

  function deleteEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    if (!confirm(`Delete "${entry.name}"?`)) return;
    entries = entries.filter(e => e.id !== id);
    saveEntries();
    showToast(`"${entry.name}" deleted.`);
    render();
  }

  function toggleFavorite(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    entry.isFavorite = !entry.isFavorite;
    entry.dateModified = new Date().toISOString();
    saveEntries();
    render();
  }

  function visitEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    entry.visitCount = (entry.visitCount || 0) + 1;
    entry.lastVisited = new Date().toISOString();
    saveEntries();
    window.open(entry.url, '_blank', 'noopener,noreferrer');
    render();
  }

  // ── Filtering & Sorting ────────────────────────────────

  function getFilteredEntries() {
    const query = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const [sortField, sortDir] = sortSelect.value.split('-');

    let filtered = [...entries];

    // Search
    if (query) {
      filtered = filtered.filter(e =>
        (e.name || '').toLowerCase().includes(query) ||
        (e.url || '').toLowerCase().includes(query) ||
        (e.description || '').toLowerCase().includes(query)
      );
    }

    // Category
    if (category) {
      filtered = filtered.filter(e => (e.categories || []).includes(category));
    }

    // Sort — favorites always first
    filtered.sort((a, b) => {
      // Favorites pinned to top
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      let valA, valB;

      if (sortField === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
        const cmp = valA.localeCompare(valB);
        return sortDir === 'asc' ? cmp : -cmp;
      }

      if (sortField === 'visitCount') {
        valA = a.visitCount || 0;
        valB = b.visitCount || 0;
        return sortDir === 'desc' ? valB - valA : valA - valB;
      }

      if (sortField === 'lastVisited') {
        valA = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
        valB = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
        return sortDir === 'desc' ? valB - valA : valA - valB;
      }

      // dateAdded (default)
      valA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
      valB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
      return sortDir === 'desc' ? valB - valA : valA - valB;
    });

    return filtered;
  }

  // ── Rendering ──────────────────────────────────────────

  function renderCard(entry) {
    const card = document.createElement('div');
    card.className = 'card';
    card.setAttribute('data-id', entry.id);

    const domain = getDomain(entry.url);

    card.innerHTML = `
      <button class="card-favorite ${entry.isFavorite ? 'active' : ''}" title="${entry.isFavorite ? 'Unpin from favorites' : 'Pin to favorites'}">
        ${entry.isFavorite ? '★' : '☆'}
      </button>
      <div class="card-top">
        <div class="card-icon">
          ${entry.iconUrl
            ? `<img src="${escapeHtml(entry.iconUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
            : '<span class="icon-fallback">🌐</span>'
          }
        </div>
        <div class="card-info">
          <div class="card-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
          <div class="card-url" title="${escapeHtml(entry.url)}">${escapeHtml(domain)}</div>
        </div>
      </div>
      ${entry.description ? `<div class="card-description">${escapeHtml(entry.description)}</div>` : ''}
      <div class="card-meta">
        ${(entry.categories || []).map(cat => `<span class="tag">${escapeHtml(cat)}</span>`).join('')}
        <span class="meta-item" title="Added: ${formatDateFull(entry.dateAdded)}">Added ${timeAgo(entry.dateAdded)}</span>
        ${entry.visitCount > 0 ? `
          <span class="meta-dot"></span>
          <span class="meta-item">${entry.visitCount} visit${entry.visitCount !== 1 ? 's' : ''}</span>
        ` : ''}
        <div class="card-actions">
          <button class="btn btn-ghost edit-btn" title="Edit">✏️</button>
          <button class="btn btn-danger delete-btn" title="Delete">🗑️</button>
        </div>
      </div>
    `;

    // Click card → visit
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-favorite') ||
          e.target.closest('.edit-btn') ||
          e.target.closest('.delete-btn')) return;
      visitEntry(entry.id);
    });

    // Favorite toggle
    card.querySelector('.card-favorite').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(entry.id);
    });

    // Edit
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(entry.id);
    });

    // Delete
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEntry(entry.id);
    });

    return card;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    populateCategories();
    const filtered = getFilteredEntries();

    // Update stats
    const total = entries.length;
    const showing = filtered.length;
    if (total === 0) {
      statsText.textContent = '0 sites';
    } else if (showing === total) {
      statsText.textContent = `${total} site${total !== 1 ? 's' : ''}`;
    } else {
      statsText.textContent = `Showing ${showing} of ${total} site${total !== 1 ? 's' : ''}`;
    }

    // Show/hide empty state
    if (total === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Render cards
    grid.innerHTML = '';
    filtered.forEach(entry => {
      grid.appendChild(renderCard(entry));
    });
  }

  // ── Import / Export ────────────────────────────────────

  function exportData() {
    if (entries.length === 0) {
      showToast('Nothing to export.');
      return;
    }
    const json = JSON.stringify(entries, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-directory-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported successfully!');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) throw new Error('Invalid format');

        // Validate entries
        const valid = data.filter(e => e.name && e.url);
        if (valid.length === 0) {
          showToast('No valid entries found in file.');
          return;
        }

        // Merge: skip duplicates by URL
        const existingUrls = new Set(entries.map(e => e.url.toLowerCase()));
        let imported = 0;

        valid.forEach(item => {
          const url = ensureProtocol(item.url).toLowerCase();
          if (!existingUrls.has(url)) {
            // Handle both legacy 'category' and new 'categories' format
            let cats = item.categories || [];
            if (!Array.isArray(cats) || cats.length === 0) {
              if (item.category && typeof item.category === 'string') {
                cats = [item.category.trim()];
              } else {
                cats = [];
              }
            }
            entries.push({
              id: item.id || generateId(),
              name: item.name,
              url: ensureProtocol(item.url),
              description: item.description || '',
              iconUrl: item.iconUrl || getFaviconUrl(item.url),
              categories: cats,
              dateAdded: item.dateAdded || new Date().toISOString(),
              dateModified: item.dateModified || new Date().toISOString(),
              visitCount: item.visitCount || 0,
              lastVisited: item.lastVisited || null,
              isFavorite: item.isFavorite || false
            });
            existingUrls.add(url);
            imported++;
          }
        });

        saveEntries();
        render();
        showToast(`Imported ${imported} new site${imported !== 1 ? 's' : ''} (${valid.length - imported} duplicate${valid.length - imported !== 1 ? 's' : ''} skipped).`);
      } catch {
        showToast('Error: Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }

  // ── Category Chip UI ────────────────────────────────────

  function renderCategoryChips() {
    const container = document.getElementById('categoryTags');
    container.innerHTML = '';
    selectedCategories.forEach(cat => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${escapeHtml(cat)}<button type="button" class="tag-chip-remove" title="Remove">&times;</button>`;
      chip.querySelector('.tag-chip-remove').addEventListener('click', () => {
        selectedCategories = selectedCategories.filter(c => c !== cat);
        renderCategoryChips();
      });
      container.appendChild(chip);
    });
  }

  function addCategoryFromInput() {
    const val = entryCategory.value.trim();
    if (val && !selectedCategories.includes(val)) {
      selectedCategories.push(val);
      renderCategoryChips();
    }
    entryCategory.value = '';
  }

  // ── Form Submission ────────────────────────────────────

  function handleSubmit(e) {
    e.preventDefault();

    // Validation
    let valid = true;
    entryForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    if (!entryName.value.trim()) {
      entryName.classList.add('error');
      valid = false;
    }

    if (!entryUrl.value.trim()) {
      entryUrl.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    // If user typed a category but didn't press Enter, include it
    const pendingCat = entryCategory.value.trim();
    if (pendingCat && !selectedCategories.includes(pendingCat)) {
      selectedCategories.push(pendingCat);
    }

    const data = {
      name: entryName.value.trim(),
      url: entryUrl.value.trim(),
      categories: [...selectedCategories],
      iconUrl: entryIcon.value.trim(),
      description: entryDescription.value.trim(),
      isFavorite: entryFavorite.checked
    };

    if (editingId) {
      updateEntry(editingId, data);
    } else {
      addEntry(data);
    }

    closeModal();
    render();
  }

  // ── Event Listeners ────────────────────────────────────

  // Add button
  addBtn.addEventListener('click', () => openModal());

  // Modal close
  modalClose.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Category tag input
  entryCategory.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategoryFromInput();
    }
  });
  document.getElementById('addCategoryBtn').addEventListener('click', addCategoryFromInput);

  // Form submit
  entryForm.addEventListener('submit', handleSubmit);

  // Search / filter / sort
  searchInput.addEventListener('input', render);
  categoryFilter.addEventListener('change', render);
  sortSelect.addEventListener('change', render);

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Import
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      importData(e.target.files[0]);
      e.target.value = '';
    }
  });

  // Export
  exportBtn.addEventListener('click', exportData);

  // Auto-fetch favicon when URL field loses focus
  entryUrl.addEventListener('blur', () => {
    const url = entryUrl.value.trim();
    if (url && !entryIcon.value.trim()) {
      // Preview the favicon in real-time (it will be set on save if still empty)
      entryIcon.setAttribute('placeholder', `Auto: ${getDomain(ensureProtocol(url))}`);
    }
  });

  // ── Initialize ─────────────────────────────────────────

  initTheme();
  loadEntries();
  render();

})();
