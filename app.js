/* ========================================
   App Directory — Main Application Logic
   ======================================== */

(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────
  const STORAGE_KEY = 'appDirectory_entries';
  const THEME_KEY = 'appDirectory_theme';
  const DEFAULT_CATEGORIES = ['Development', 'Social', 'News', 'Entertainment', 'Productivity', 'Other'];

  const KNOWN_APP_ICONS = [
    {
      test: (url) => /notebook(lm)?\.google\.com|google\.com\/notebooklm/i.test(url),
      icon: 'https://notebooklm.google.com/_/static/branding/v4/dark_mode/favicon/apple-touch-icon.png'
    },
    {
      test: (url) => /gemini\.google\.com|bard\.google\.com/i.test(url),
      icon: 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg'
    },
    {
      test: (url) => /drive\.google\.com/i.test(url),
      icon: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png'
    },
    {
      test: (url) => /docs\.google\.com\/(document|d\/)/i.test(url),
      icon: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico'
    },
    {
      test: (url) => /sheets\.google\.com|docs\.google\.com\/spreadsheets/i.test(url),
      icon: 'https://ssl.gstatic.com/docs/spreadsheets/images/favicon_table_auto_sized.ico'
    },
    {
      test: (url) => /slides\.google\.com|docs\.google\.com\/presentation/i.test(url),
      icon: 'https://ssl.gstatic.com/docs/presentations/images/favicon_show_auto_sized.ico'
    },
    {
      test: (url) => /keep\.google\.com/i.test(url),
      icon: 'https://ssl.gstatic.com/keep/keep_2020q4v2.ico'
    },
    {
      test: (url) => /colab\.research\.google\.com/i.test(url),
      icon: 'https://colab.research.google.com/img/favicon.ico'
    },
    {
      test: (url) => /meet\.google\.com/i.test(url),
      icon: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png'
    },
    {
      test: (url) => /mail\.google\.com/i.test(url),
      icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico'
    },
    {
      test: (url) => /calendar\.google\.com/i.test(url),
      icon: 'https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31.ico'
    },
    {
      test: (url) => /music\.youtube\.com/i.test(url),
      icon: 'https://music.youtube.com/img/favicon_144.png'
    },
    {
      test: (url) => /photos\.google\.com/i.test(url),
      icon: 'https://ssl.gstatic.com/social/photosui/images/logo/1x/photos_96dp.png'
    },
    {
      test: (url) => /maps\.google\.com/i.test(url),
      icon: 'https://maps.gstatic.com/mapfiles/maps_lite/pwa/icons/pwa_icon_192.png'
    },
    {
      test: (url) => /chatgpt\.com|chat\.openai\.com/i.test(url),
      icon: 'https://chatgpt.com/favicon.ico'
    },
    {
      test: (url) => /claude\.ai/i.test(url),
      icon: 'https://claude.ai/favicon.ico'
    },
    {
      test: (url) => /github\.com/i.test(url),
      icon: 'https://github.githubassets.com/favicons/favicon.svg'
    }
  ];

  // ── DOM Elements ───────────────────────────────────────
  const grid = document.getElementById('grid');
  const emptyState = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const catFilterDropdown = document.getElementById('catFilterDropdown');
  const catFilterBtn = document.getElementById('catFilterBtn');
  const catFilterLabel = document.getElementById('catFilterLabel');
  const catFilterMenu = document.getElementById('catFilterMenu');
  const catFilterList = document.getElementById('catFilterList');
  const selectAllCatsBtn = document.getElementById('selectAllCatsBtn');
  const clearAllCatsBtn = document.getElementById('clearAllCatsBtn');
  const modeUnionBtn = document.getElementById('modeUnionBtn');
  const modeIntersectBtn = document.getElementById('modeIntersectBtn');
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
  const refreshAllBtn = document.getElementById('refreshAllBtn');
  const acceptAllIconsBtn = document.getElementById('acceptAllIconsBtn');
  const pendingIconsCount = document.getElementById('pendingIconsCount');
  const dismissAllIconsBtn = document.getElementById('dismissAllIconsBtn');
  const floatingReviewBar = document.getElementById('floatingReviewBar');
  const floatingReviewCount = document.getElementById('floatingReviewCount');
  const floatingReviewPlural = document.getElementById('floatingReviewPlural');
  const floatingAcceptAllBtn = document.getElementById('floatingAcceptAllBtn');
  const floatingDismissAllBtn = document.getElementById('floatingDismissAllBtn');
  const topNavWrapper = document.getElementById('topNavWrapper');
  const importBtn = document.getElementById('importBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const statsText = document.getElementById('statsText');

  // Form fields
  const entryName = document.getElementById('entryName');
  const entryUrl = document.getElementById('entryUrl');
  const entryCategory = document.getElementById('entryCategory');
  const entryIcon = document.getElementById('entryIcon');
  const entryIconPreview = document.getElementById('entryIconPreview');
  const uploadIconBtn = document.getElementById('uploadIconBtn');
  const iconFileInput = document.getElementById('iconFileInput');
  const entryDescription = document.getElementById('entryDescription');
  const entryFavorite = document.getElementById('entryFavorite');

  // ── State ──────────────────────────────────────────────
  const FILTER_MODE_KEY = 'app_directory_cat_filter_mode';
  let entries = [];
  let editingId = null;
  let selectedCategories = []; // categories selected in the modal form
  let selectedFilterCategories = new Set(); // categories checked in the filter dropdown
  let catFilterMode = localStorage.getItem(FILTER_MODE_KEY) || 'union'; // 'union' or 'intersect'
  let pendingIcons = new Map(); // entryId => newCandidateDataUrl (icons awaiting user acceptance)

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
    if (!url) return '';
    try {
      const full = ensureProtocol(url);

      // Check known web apps first (e.g. NotebookLM, Gemini, Docs, Drive, etc.)
      for (const entry of KNOWN_APP_ICONS) {
        if (entry.test(full)) {
          return entry.icon;
        }
      }

      // Use Google FaviconV2 high-resolution service with full URL
      return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(full)}&size=128`;
    } catch {
      return '';
    }
  }

  // ── Icon to Data URL Converter (Offline Persistence) ──────

  async function urlToDataUrl(imageUrl) {
    if (!imageUrl || imageUrl.startsWith('data:')) {
      return imageUrl || '';
    }

    const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const imageToDataUrl = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const maxDim = 128;
          let w = img.naturalWidth || img.width || 64;
          let h = img.naturalHeight || img.height || 64;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w || 64;
          canvas.height = h || 64;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = src;
    });

    // Strategy 1: Direct fetch with CORS
    try {
      const resp = await fetch(imageUrl, { mode: 'cors' });
      if (resp.ok) {
        const blob = await resp.blob();
        if (blob && blob.size > 0) {
          const dataUrl = await blobToDataUrl(blob);
          if (dataUrl && dataUrl.startsWith('data:image')) return dataUrl;
        }
      }
    } catch (_) {}

    // Strategy 2: Image element with crossOrigin drawing to canvas
    try {
      const dataUrl = await imageToDataUrl(imageUrl);
      if (dataUrl && dataUrl.startsWith('data:image')) {
        return dataUrl;
      }
    } catch (_) {}

    // Strategy 3: Open CORS image proxy (images.weserv.nl)
    try {
      const cleanUrl = imageUrl.replace(/^https?:\/\//i, '');
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=128&output=png`;
      const resp = await fetch(proxyUrl, { mode: 'cors' });
      if (resp.ok) {
        const blob = await resp.blob();
        if (blob && blob.size > 0) {
          const dataUrl = await blobToDataUrl(blob);
          if (dataUrl && dataUrl.startsWith('data:image')) return dataUrl;
        }
      }
    } catch (_) {}

    // Strategy 4: Fallback to original URL
    return imageUrl;
  }

  // Helper for parallel worker pool execution
  async function runPool(items, concurrency, taskFn, onProgress) {
    let index = 0;
    let completed = 0;
    const total = items.length;
    if (total === 0) return;

    const workerCount = Math.min(concurrency, total);
    const workers = Array.from({ length: workerCount }, async () => {
      while (index < total) {
        const i = index++;
        const item = items[i];
        try {
          await taskFn(item, i);
        } catch (_) {}
        completed++;
        if (onProgress) onProgress(completed, total);
      }
    });

    await Promise.all(workers);
  }

  async function cacheExistingIconsOffline() {
    const unCached = entries.filter(e => e.iconUrl && !e.iconUrl.startsWith('data:'));
    if (unCached.length === 0) return;

    let changed = false;
    await runPool(unCached, 8, async (entry) => {
      try {
        const dataUrl = await urlToDataUrl(entry.iconUrl);
        if (dataUrl && dataUrl.startsWith('data:image')) {
          entry.iconUrl = dataUrl;
          changed = true;
        }
      } catch (_) {}
    });

    if (changed) {
      saveEntries();
      render();
    }
  }

  // ── Storage & Multi-Tab Synchronization ─────────────────

  let broadcastChannel;
  try {
    broadcastChannel = new BroadcastChannel('app_directory_sync_v1');
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'SYNC_DATA') {
        syncFromStorage();
      } else if (event.data && event.data.type === 'SYNC_THEME') {
        initTheme();
      }
    };
  } catch (_) {}

  function notifyOtherTabs(type = 'SYNC_DATA') {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type });
      } catch (_) {}
    }
  }

  function migrateEntry(entry) {
    if (!entry) return null;
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

  function getLatestStoredEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.map(migrateEntry).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function mergeEntries(localList, diskList) {
    const map = new Map();

    // 1. Index all disk entries
    for (const item of diskList) {
      if (item && item.id) {
        map.set(item.id, item);
      }
    }

    // 2. Merge local entries
    for (const item of localList) {
      if (!item || !item.id) continue;
      if (!map.has(item.id)) {
        map.set(item.id, item);
      } else {
        const diskItem = map.get(item.id);
        const localMod = new Date(item.dateModified || item.dateAdded || 0).getTime();
        const diskMod = new Date(diskItem.dateModified || diskItem.dateAdded || 0).getTime();
        // Take whichever version was modified more recently
        if (localMod >= diskMod) {
          map.set(item.id, item);
        }
      }
    }

    return Array.from(map.values());
  }

  function loadEntries() {
    entries = getLatestStoredEntries();
  }

  function saveEntries(targetList = null) {
    const diskList = getLatestStoredEntries();
    const sourceList = targetList || entries;
    const merged = mergeEntries(sourceList, diskList);
    entries = merged;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    notifyOtherTabs('SYNC_DATA');
  }

  function syncFromStorage() {
    const diskList = getLatestStoredEntries();
    // Merge latest disk state with in-memory state
    entries = mergeEntries(entries, diskList);
    render();
    if (typeof renderCatList === 'function' && catModalBackdrop && catModalBackdrop.classList.contains('active')) {
      renderCatList();
    }
  }

  // Native storage listener for other tabs/windows
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      syncFromStorage();
    } else if (e.key === THEME_KEY) {
      initTheme();
    }
  });

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

  function updateModeToggleUI() {
    if (modeUnionBtn && modeIntersectBtn) {
      if (catFilterMode === 'intersect') {
        modeUnionBtn.classList.remove('active');
        modeIntersectBtn.classList.add('active');
      } else {
        modeUnionBtn.classList.add('active');
        modeIntersectBtn.classList.remove('active');
      }
    }
  }

  function updateCatFilterLabel() {
    if (!catFilterLabel || !catFilterBtn) return;
    const allCats = getAllCategories();
    const count = selectedFilterCategories.size;

    if (count === 0 || (catFilterMode === 'union' && count === allCats.length)) {
      catFilterLabel.textContent = 'All Categories';
      catFilterBtn.classList.remove('has-filter');
      return;
    }

    catFilterBtn.classList.add('has-filter');
    const list = Array.from(selectedFilterCategories);

    if (catFilterMode === 'intersect') {
      if (count === 1) {
        catFilterLabel.textContent = `${list[0]} (All)`;
      } else if (count === 2) {
        catFilterLabel.textContent = `${list.join(' & ')}`;
      } else {
        catFilterLabel.textContent = `${count} Categories (All)`;
      }
    } else {
      // Union mode
      if (count === 1) {
        catFilterLabel.textContent = list[0];
      } else if (count === 2) {
        catFilterLabel.textContent = list.join(', ');
      } else {
        catFilterLabel.textContent = `${count} Categories (Any)`;
      }
    }
  }

  function populateCategories() {
    const cats = getAllCategories();

    // Clean up any selected filter categories that no longer exist
    const catSet = new Set(cats);
    for (const selected of selectedFilterCategories) {
      if (!catSet.has(selected)) {
        selectedFilterCategories.delete(selected);
      }
    }

    // Category counts from entries
    const counts = {};
    entries.forEach(e => {
      (e.categories || []).forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });

    // Populate multi-select category checkboxes
    if (catFilterList) {
      catFilterList.innerHTML = '';
      cats.forEach(cat => {
        const item = document.createElement('label');
        item.className = 'dropdown-item';
        const isChecked = selectedFilterCategories.has(cat);
        const count = counts[cat] || 0;
        item.innerHTML = `
          <input type="checkbox" value="${escapeHtml(cat)}" ${isChecked ? 'checked' : ''}>
          <span class="dropdown-item-name">${escapeHtml(cat)}</span>
          <span class="dropdown-item-count">${count}</span>
        `;
        const cb = item.querySelector('input');
        cb.addEventListener('change', () => {
          if (cb.checked) {
            selectedFilterCategories.add(cat);
          } else {
            selectedFilterCategories.delete(cat);
          }
          updateCatFilterLabel();
          renderCardsOnly();
        });
        catFilterList.appendChild(item);
      });
    }

    updateCatFilterLabel();

    // Update datalist in the form
    const datalist = document.getElementById('categorySuggestions');
    if (datalist) {
      datalist.innerHTML = '';
      cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        datalist.appendChild(opt);
      });
    }
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
    notifyOtherTabs('SYNC_THEME');
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
    updateModalIconPreview();

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

  async function addEntry(data) {
    const now = new Date().toISOString();
    const rawIcon = data.iconUrl || getFaviconUrl(data.url);
    const entry = {
      id: generateId(),
      name: data.name,
      url: ensureProtocol(data.url),
      description: data.description || '',
      iconUrl: rawIcon,
      categories: data.categories || [],
      dateAdded: now,
      dateModified: now,
      visitCount: 0,
      lastVisited: null,
      isFavorite: data.isFavorite || false
    };

    const diskList = getLatestStoredEntries();
    diskList.push(entry);
    saveEntries(diskList);
    render();
    showToast(`"${entry.name}" added!`);

    // Asynchronously convert and cache icon offline as Data URL
    if (entry.iconUrl && !entry.iconUrl.startsWith('data:')) {
      const permanentDataUrl = await urlToDataUrl(entry.iconUrl);
      if (permanentDataUrl && permanentDataUrl.startsWith('data:')) {
        const latest = getLatestStoredEntries();
        const target = latest.find(e => e.id === entry.id);
        if (target) {
          target.iconUrl = permanentDataUrl;
          saveEntries(latest);
          render();
        }
      }
    }
  }

  async function updateEntry(id, data) {
    const diskList = getLatestStoredEntries();
    let target = diskList.find(e => e.id === id);
    const rawIcon = data.iconUrl || getFaviconUrl(data.url);

    if (!target) {
      target = {
        id,
        name: data.name,
        url: ensureProtocol(data.url),
        description: data.description || '',
        iconUrl: rawIcon,
        categories: data.categories || [],
        dateAdded: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        visitCount: 0,
        lastVisited: null,
        isFavorite: data.isFavorite || false
      };
      diskList.push(target);
    } else {
      target.name = data.name;
      target.url = ensureProtocol(data.url);
      target.description = data.description || '';
      target.iconUrl = rawIcon;
      target.categories = data.categories || [];
      target.isFavorite = data.isFavorite || false;
      target.dateModified = new Date().toISOString();
    }

    saveEntries(diskList);
    render();
    showToast(`"${target.name}" updated!`);

    // Clean up any pending icon for this entry
    if (pendingIcons.has(id)) {
      pendingIcons.delete(id);
      updatePendingIconsUI();
    }

    // Asynchronously convert and cache icon offline as Data URL
    if (target.iconUrl && !target.iconUrl.startsWith('data:')) {
      const permanentDataUrl = await urlToDataUrl(target.iconUrl);
      if (permanentDataUrl && permanentDataUrl.startsWith('data:')) {
        const latest = getLatestStoredEntries();
        const item = latest.find(e => e.id === id);
        if (item) {
          item.iconUrl = permanentDataUrl;
          saveEntries(latest);
          render();
        }
      }
    }
  }

  function deleteEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    if (!confirm(`Delete "${entry.name}"?`)) return;

    if (pendingIcons.has(id)) {
      pendingIcons.delete(id);
      updatePendingIconsUI();
    }

    const diskList = getLatestStoredEntries();
    const filtered = diskList.filter(e => e.id !== id);
    entries = filtered;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    notifyOtherTabs('SYNC_DATA');
    showToast(`"${entry.name}" deleted.`);
    render();
  }

  function toggleFavorite(id) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find(e => e.id === id);
    if (!entry) return;
    entry.isFavorite = !entry.isFavorite;
    entry.dateModified = new Date().toISOString();
    saveEntries(diskList);
    render();
  }

  function visitEntry(id) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find(e => e.id === id);
    if (!entry) return;
    entry.visitCount = (entry.visitCount || 0) + 1;
    entry.lastVisited = new Date().toISOString();
    entry.dateModified = new Date().toISOString();
    saveEntries(diskList);
    window.open(entry.url, '_blank', 'noopener,noreferrer');
    render();
  }

  // ── Icon Refresh & Review Workflow ─────────────────────

  function updatePendingIconsUI() {
    const count = pendingIcons.size;
    if (count > 0) {
      if (pendingIconsCount) pendingIconsCount.textContent = count;
      if (acceptAllIconsBtn) acceptAllIconsBtn.style.display = 'inline-flex';
      if (dismissAllIconsBtn) dismissAllIconsBtn.style.display = 'inline-flex';

      if (floatingReviewBar) {
        if (floatingReviewCount) floatingReviewCount.textContent = count;
        if (floatingReviewPlural) floatingReviewPlural.textContent = count !== 1 ? 's' : '';
        floatingReviewBar.style.display = 'block';
      }
    } else {
      if (acceptAllIconsBtn) acceptAllIconsBtn.style.display = 'none';
      if (dismissAllIconsBtn) dismissAllIconsBtn.style.display = 'none';
      if (floatingReviewBar) floatingReviewBar.style.display = 'none';
    }
  }

  // Targeted in-place DOM update for individual card pending state (zero flashing)
  function updateCardPendingState(id) {
    if (!grid) return;
    const card = grid.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;

    const pendingIcon = pendingIcons.get(id);
    const cardTop = card.querySelector('.card-top');
    let pendingBox = card.querySelector('.card-pending-icon-box');

    if (pendingIcon) {
      card.classList.add('has-pending-icon');
      if (!pendingBox && cardTop) {
        pendingBox = document.createElement('div');
        pendingBox.className = 'card-pending-icon-box';
        pendingBox.title = 'New icon proposed';
        pendingBox.innerHTML = `
          <span class="pending-badge">New Icon</span>
          <div class="pending-preview-row">
            <div class="card-icon new-icon-preview" title="New icon preview">
              <img src="${escapeHtml(pendingIcon)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">
            </div>
            <button type="button" class="btn-accept accept-icon-btn" title="Accept new icon">✓ Accept</button>
            <button type="button" class="btn btn-ghost dismiss-icon-btn" title="Dismiss new icon">✕</button>
          </div>
        `;
        pendingBox.querySelector('.accept-icon-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          acceptPendingIcon(id);
        });
        pendingBox.querySelector('.dismiss-icon-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          dismissPendingIcon(id);
        });
        cardTop.appendChild(pendingBox);
      }
    } else {
      card.classList.remove('has-pending-icon');
      if (pendingBox) {
        pendingBox.remove();
      }
      // Update the primary icon thumbnail in place if entry icon changed
      const entry = entries.find(e => e.id === id);
      if (entry) {
        const iconDiv = card.querySelector('.card-icon:not(.new-icon-preview)');
        if (iconDiv) {
          iconDiv.innerHTML = entry.iconUrl
            ? `<img src="${escapeHtml(entry.iconUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
            : '<span class="icon-fallback">🌐</span>';
        }
      }
    }
  }

  async function refreshEntryIcon(id, btnElement = null) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find(e => e.id === id);
    if (!entry) return;

    if (btnElement) btnElement.classList.add('is-spinning');
    showToast(`Checking for updated icon for "${entry.name}"...`);

    try {
      const freshUrl = getFaviconUrl(entry.url);
      const candidateDataUrl = await urlToDataUrl(freshUrl);

      if (candidateDataUrl && candidateDataUrl !== entry.iconUrl) {
        pendingIcons.set(id, candidateDataUrl);
        updatePendingIconsUI();
        updateCardPendingState(id);
        showToast(`New icon found for "${entry.name}"! Click "✓ Accept" to apply.`);
      } else {
        showToast(`Icon for "${entry.name}" is already up to date.`);
      }
    } finally {
      if (btnElement) btnElement.classList.remove('is-spinning');
    }
  }

  async function refreshAllIcons() {
    const diskList = getLatestStoredEntries();
    if (diskList.length === 0) {
      showToast('No sites to refresh.');
      return;
    }

    const refreshProgressBar = document.getElementById('refreshProgressBar');
    const refreshProgressFill = document.getElementById('refreshProgressFill');
    const refreshProgressLabel = document.getElementById('refreshProgressLabel');
    const refreshProgressCount = document.getElementById('refreshProgressCount');
    const refreshBtnLabel = refreshAllBtn ? refreshAllBtn.querySelector('.btn-label') : null;
    const originalBtnText = refreshBtnLabel ? refreshBtnLabel.textContent : 'Refresh Icons';

    // Show loading state and progress bar
    if (refreshAllBtn) {
      refreshAllBtn.classList.add('is-loading');
      refreshAllBtn.disabled = true;
    }
    if (refreshProgressBar) {
      refreshProgressBar.style.display = 'block';
      if (refreshProgressFill) refreshProgressFill.style.width = '0%';
      if (refreshProgressCount) refreshProgressCount.textContent = `0 / ${diskList.length}`;
      if (refreshProgressLabel) refreshProgressLabel.textContent = 'Checking for updated icons in parallel...';
    }

    let foundCount = 0;
    const concurrency = 12; // Process 12 sites concurrently in parallel

    await runPool(diskList, concurrency, async (entry) => {
      try {
        const freshUrl = getFaviconUrl(entry.url);
        const candidateDataUrl = await urlToDataUrl(freshUrl);
        if (candidateDataUrl && candidateDataUrl !== entry.iconUrl) {
          pendingIcons.set(entry.id, candidateDataUrl);
          foundCount++;
          updatePendingIconsUI();
          updateCardPendingState(entry.id); // In-place DOM update (zero flashing!)
        }
      } catch (_) {}
    }, (completed, total) => {
      const pct = Math.round((completed / total) * 100);
      if (refreshProgressFill) refreshProgressFill.style.width = `${pct}%`;
      if (refreshProgressCount) refreshProgressCount.textContent = `${completed} / ${total} (${pct}%)`;
      if (refreshBtnLabel) refreshBtnLabel.textContent = `Checking (${pct}%)...`;
    });

    // Brief completion status on progress bar
    if (refreshProgressLabel) {
      refreshProgressLabel.textContent = foundCount > 0
        ? `Done! Found ${foundCount} new icon update${foundCount !== 1 ? 's' : ''}.`
        : 'Done! All icons are already up to date.';
    }

    setTimeout(() => {
      if (refreshProgressBar) refreshProgressBar.style.display = 'none';
      if (refreshAllBtn) {
        refreshAllBtn.classList.remove('is-loading');
        refreshAllBtn.disabled = false;
        if (refreshBtnLabel) refreshBtnLabel.textContent = originalBtnText;
      }
    }, 1200);

    updatePendingIconsUI();

    if (foundCount > 0) {
      showToast(`Found ${foundCount} new icon update${foundCount !== 1 ? 's' : ''}! Review or click "Accept All".`);
    } else {
      showToast('All icons are already up to date!');
    }
  }

  function acceptPendingIcon(id) {
    const newIcon = pendingIcons.get(id);
    if (!newIcon) return;

    const diskList = getLatestStoredEntries();
    const entry = diskList.find(e => e.id === id);
    if (entry) {
      entry.iconUrl = newIcon;
      entry.dateModified = new Date().toISOString();
      saveEntries(diskList);
      pendingIcons.delete(id);
      updatePendingIconsUI();
      updateCardPendingState(id);
      showToast(`Icon updated for "${entry.name}"!`);
    }
  }

  function dismissPendingIcon(id) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find(e => e.id === id);
    pendingIcons.delete(id);
    updatePendingIconsUI();
    updateCardPendingState(id);
    if (entry) {
      showToast(`Dismissed icon update for "${entry.name}".`);
    }
  }

  function acceptAllPendingIcons() {
    if (pendingIcons.size === 0) return;

    const diskList = getLatestStoredEntries();
    let count = 0;
    const acceptedIds = Array.from(pendingIcons.keys());

    for (const [id, newIcon] of pendingIcons.entries()) {
      const entry = diskList.find(e => e.id === id);
      if (entry) {
        entry.iconUrl = newIcon;
        entry.dateModified = new Date().toISOString();
        count++;
      }
    }

    saveEntries(diskList);
    pendingIcons.clear();
    updatePendingIconsUI();
    acceptedIds.forEach(id => updateCardPendingState(id));
    showToast(`Accepted and updated ${count} icon${count !== 1 ? 's' : ''}!`);
  }

  function dismissAllPendingIcons() {
    const dismissedIds = Array.from(pendingIcons.keys());
    pendingIcons.clear();
    updatePendingIconsUI();
    dismissedIds.forEach(id => updateCardPendingState(id));
    showToast('All proposed icon updates dismissed.');
  }

  // ── Filtering & Sorting ────────────────────────────────

  function getFilteredEntries() {
    const query = searchInput.value.toLowerCase().trim();
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

    // Multi-Category Filter (Union vs Intersection)
    const allCats = getAllCategories();
    if (selectedFilterCategories.size > 0) {
      if (catFilterMode === 'intersect') {
        const required = Array.from(selectedFilterCategories);
        filtered = filtered.filter(e => {
          const entryCats = e.categories || [];
          return required.every(reqCat => entryCats.includes(reqCat));
        });
      } else {
        // Union: match ANY selected category
        if (selectedFilterCategories.size < allCats.length) {
          filtered = filtered.filter(e =>
            (e.categories || []).some(cat => selectedFilterCategories.has(cat))
          );
        }
      }
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

    const pendingIcon = pendingIcons.get(entry.id);
    if (pendingIcon) {
      card.classList.add('has-pending-icon');
    }

    const domain = getDomain(entry.url);

    card.innerHTML = `
      <button class="card-favorite ${entry.isFavorite ? 'active' : ''}" title="${entry.isFavorite ? 'Unpin from favorites' : 'Pin to favorites'}">
        ${entry.isFavorite ? '★' : '☆'}
      </button>
      <div class="card-top">
        <div class="card-icon" title="Current icon">
          ${entry.iconUrl
            ? `<img src="${escapeHtml(entry.iconUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
            : '<span class="icon-fallback">🌐</span>'
          }
        </div>
        <div class="card-info">
          <div class="card-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
          <div class="card-url" title="${escapeHtml(entry.url)}">${escapeHtml(domain)}</div>
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
      <div class="card-meta">
        ${(entry.categories || []).map(cat => `<span class="tag">${escapeHtml(cat)}</span>`).join('')}
        <span class="meta-item" title="Added: ${formatDateFull(entry.dateAdded)}">Added ${timeAgo(entry.dateAdded)}</span>
        ${entry.visitCount > 0 ? `
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
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-favorite') ||
          e.target.closest('.refresh-btn') ||
          e.target.closest('.edit-btn') ||
          e.target.closest('.delete-btn') ||
          e.target.closest('.card-pending-icon-box')) return;
      visitEntry(entry.id);
    });

    // Favorite toggle
    card.querySelector('.card-favorite').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(entry.id);
    });

    // Refresh icon
    const refreshBtn = card.querySelector('.refresh-btn');
    refreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      refreshEntryIcon(entry.id, refreshBtn);
    });

    // Accept / Dismiss pending icon
    if (pendingIcon) {
      const acceptBtn = card.querySelector('.accept-icon-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          acceptPendingIcon(entry.id);
        });
      }
      const dismissBtn = card.querySelector('.dismiss-icon-btn');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          dismissPendingIcon(entry.id);
        });
      }
    }

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

  function renderCardsOnly() {
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

  function render() {
    populateCategories();
    renderCardsOnly();
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

        // Merge: skip duplicates by URL against fresh disk storage
        const diskList = getLatestStoredEntries();
        const existingUrls = new Set(diskList.map(e => e.url.toLowerCase()));
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
            diskList.push({
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

        saveEntries(diskList);
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
  // ── Category Management Modal ───────────────────────────

  const catModalBackdrop = document.getElementById('catModalBackdrop');
  const catModalClose = document.getElementById('catModalClose');
  const catList = document.getElementById('catList');
  const catEmptyMsg = document.getElementById('catEmptyMsg');

  function getUsedCategories() {
    // Return categories that are actually used by at least one entry, with counts
    const counts = {};
    entries.forEach(e => {
      (e.categories || []).forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    // Sort alphabetically
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }

  function openCatModal() {
    renderCatList();
    catModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCatModal() {
    catModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renameCategory(oldName, newName) {
    newName = newName.trim();
    if (!newName || newName === oldName) return;

    const diskList = getLatestStoredEntries();
    let updated = 0;
    diskList.forEach(entry => {
      const idx = (entry.categories || []).indexOf(oldName);
      if (idx !== -1) {
        // If newName already exists in this entry's categories, just remove the old one
        if (entry.categories.includes(newName)) {
          entry.categories.splice(idx, 1);
        } else {
          entry.categories[idx] = newName;
        }
        entry.dateModified = new Date().toISOString();
        updated++;
      }
    });

    if (updated > 0) {
      if (selectedFilterCategories.has(oldName)) {
        selectedFilterCategories.delete(oldName);
        selectedFilterCategories.add(newName);
      }
      saveEntries(diskList);
      render();
      showToast(`Renamed "${oldName}" → "${newName}" (${updated} site${updated !== 1 ? 's' : ''} updated)`);
    }
  }

  function deleteCategory(catName) {
    const diskList = getLatestStoredEntries();
    const count = diskList.filter(e => (e.categories || []).includes(catName)).length;
    if (!confirm(`Remove "${catName}" from ${count} site${count !== 1 ? 's' : ''}?`)) return;

    diskList.forEach(entry => {
      entry.categories = (entry.categories || []).filter(c => c !== catName);
      entry.dateModified = new Date().toISOString();
    });

    selectedFilterCategories.delete(catName);
    saveEntries(diskList);
    render();
    showToast(`Deleted category "${catName}"`);
    renderCatList();
  }

  function renderCatList() {
    const used = getUsedCategories();
    catList.innerHTML = '';

    if (used.length === 0) {
      catEmptyMsg.style.display = 'block';
      return;
    }

    catEmptyMsg.style.display = 'none';

    used.forEach(([cat, count]) => {
      const row = document.createElement('div');
      row.className = 'cat-row';
      row.innerHTML = `
        <span class="cat-row-name">${escapeHtml(cat)}</span>
        <span class="cat-row-count">${count} site${count !== 1 ? 's' : ''}</span>
        <div class="cat-row-actions">
          <button class="btn btn-ghost rename-btn" title="Rename">✏️</button>
          <button class="btn btn-danger delete-btn" title="Delete">🗑️</button>
        </div>
      `;

      // Rename
      row.querySelector('.rename-btn').addEventListener('click', () => {
        const nameEl = row.querySelector('.cat-row-name');
        const actionsEl = row.querySelector('.cat-row-actions');

        // Replace name with input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cat-row-input';
        input.value = cat;
        nameEl.replaceWith(input);
        input.focus();
        input.select();

        // Replace actions with save/cancel
        actionsEl.innerHTML = `
          <button class="btn btn-primary btn-sm save-rename-btn">Save</button>
          <button class="btn btn-ghost btn-sm cancel-rename-btn">Cancel</button>
        `;

        const doSave = () => {
          const newVal = input.value.trim();
          if (newVal && newVal !== cat) {
            renameCategory(cat, newVal);
          }
          renderCatList();
        };

        const doCancel = () => renderCatList();

        actionsEl.querySelector('.save-rename-btn').addEventListener('click', doSave);
        actionsEl.querySelector('.cancel-rename-btn').addEventListener('click', doCancel);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); doSave(); }
          if (e.key === 'Escape') doCancel();
        });
      });

      // Delete
      row.querySelector('.delete-btn').addEventListener('click', () => deleteCategory(cat));

      catList.appendChild(row);
    });
  }

  // Category management modal events
  document.getElementById('manageCategoriesBtn').addEventListener('click', openCatModal);
  catModalClose.addEventListener('click', closeCatModal);
  catModalBackdrop.addEventListener('click', (e) => {
    if (e.target === catModalBackdrop) closeCatModal();
  });

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
    if (e.key === 'Escape') {
      closeModal();
      closeCatModal();
      if (catFilterDropdown) catFilterDropdown.classList.remove('open');
    }
  });

  // Category tag input in Modal
  entryCategory.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategoryFromInput();
    }
  });
  document.getElementById('addCategoryBtn').addEventListener('click', addCategoryFromInput);

  // Category Multi-Select Dropdown Controls
  if (catFilterBtn && catFilterDropdown) {
    catFilterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      catFilterDropdown.classList.toggle('open');
    });

    if (catFilterMenu) {
      catFilterMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (selectAllCatsBtn) {
      selectAllCatsBtn.addEventListener('click', () => {
        const allCats = getAllCategories();
        selectedFilterCategories = new Set(allCats);
        if (catFilterList) {
          catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        }
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }

    if (clearAllCatsBtn) {
      clearAllCatsBtn.addEventListener('click', () => {
        selectedFilterCategories.clear();
        if (catFilterList) {
          catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        }
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }

    if (modeUnionBtn) {
      modeUnionBtn.addEventListener('click', () => {
        catFilterMode = 'union';
        localStorage.setItem(FILTER_MODE_KEY, 'union');
        updateModeToggleUI();
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }

    if (modeIntersectBtn) {
      modeIntersectBtn.addEventListener('click', () => {
        catFilterMode = 'intersect';
        localStorage.setItem(FILTER_MODE_KEY, 'intersect');
        updateModeToggleUI();
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!catFilterDropdown.contains(e.target)) {
        catFilterDropdown.classList.remove('open');
      }
    });
  }

  // Form submit
  entryForm.addEventListener('submit', handleSubmit);

  // Search / sort
  searchInput.addEventListener('input', renderCardsOnly);
  sortSelect.addEventListener('change', renderCardsOnly);

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Refresh all icons
  if (refreshAllBtn) {
    refreshAllBtn.addEventListener('click', refreshAllIcons);
  }

  // Accept / Dismiss all pending icons (Header buttons)
  if (acceptAllIconsBtn) {
    acceptAllIconsBtn.addEventListener('click', acceptAllPendingIcons);
  }
  if (dismissAllIconsBtn) {
    dismissAllIconsBtn.addEventListener('click', dismissAllPendingIcons);
  }

  // Accept / Dismiss all pending icons (Floating Bottom Bar)
  if (floatingAcceptAllBtn) {
    floatingAcceptAllBtn.addEventListener('click', acceptAllPendingIcons);
  }
  if (floatingDismissAllBtn) {
    floatingDismissAllBtn.addEventListener('click', dismissAllPendingIcons);
  }

  // ── Smart Top Navigation Reveal on Hover / Scroll ────────
  let lastScrollY = window.scrollY;
  let isMouseNearTop = false;

  function updateTopNavReveal() {
    if (!topNavWrapper) return;
    const scrollY = window.scrollY;
    const isScrolled = scrollY > 100;

    if (isScrolled) {
      topNavWrapper.classList.add('is-scrolled');
      const isDropdownOpen = catFilterDropdown && catFilterDropdown.classList.contains('open');
      const isSearchFocused = searchInput && document.activeElement === searchInput;

      if (isMouseNearTop || isDropdownOpen || isSearchFocused || scrollY < lastScrollY) {
        topNavWrapper.classList.add('is-revealed');
      } else {
        topNavWrapper.classList.remove('is-revealed');
      }
    } else {
      topNavWrapper.classList.remove('is-scrolled');
      topNavWrapper.classList.remove('is-revealed');
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', updateTopNavReveal, { passive: true });

  document.addEventListener('mousemove', (e) => {
    if (!topNavWrapper) return;
    const isRevealed = topNavWrapper.classList.contains('is-revealed');
    const navHeight = topNavWrapper.offsetHeight || 130;
    const threshold = isRevealed ? navHeight + 25 : 50;

    const wasNear = isMouseNearTop;
    isMouseNearTop = e.clientY <= threshold;

    if (wasNear !== isMouseNearTop && window.scrollY > 100) {
      updateTopNavReveal();
    }
  });

  if (topNavWrapper) {
    topNavWrapper.addEventListener('mouseenter', () => {
      isMouseNearTop = true;
      if (window.scrollY > 100) updateTopNavReveal();
    });
    topNavWrapper.addEventListener('mouseleave', (e) => {
      if (e.clientY > (topNavWrapper.offsetHeight || 130)) {
        isMouseNearTop = false;
        if (window.scrollY > 100) updateTopNavReveal();
      }
    });
  }

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

  // Icon Preview in Modal
  function updateModalIconPreview() {
    if (!entryIconPreview) return;
    const custom = entryIcon.value.trim();
    const url = entryUrl.value.trim();
    const resolved = custom || (url ? getFaviconUrl(url) : '');

    if (resolved) {
      entryIconPreview.innerHTML = `<img src="${escapeHtml(resolved)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
    } else {
      entryIconPreview.innerHTML = '<span class="icon-fallback">🌐</span>';
    }
  }

  // Real-time icon preview updates as user types
  entryUrl.addEventListener('input', () => {
    if (!entryIcon.value.trim()) {
      updateModalIconPreview();
    }
  });

  entryUrl.addEventListener('blur', () => {
    const url = entryUrl.value.trim();
    if (url && !entryIcon.value.trim()) {
      entryIcon.setAttribute('placeholder', `Auto: ${getDomain(ensureProtocol(url))}`);
      updateModalIconPreview();
    }
  });

  entryIcon.addEventListener('input', updateModalIconPreview);

  // Upload custom icon from file
  if (uploadIconBtn && iconFileInput) {
    uploadIconBtn.addEventListener('click', () => iconFileInput.click());
    if (entryIconPreview) {
      entryIconPreview.style.cursor = 'pointer';
      entryIconPreview.addEventListener('click', () => iconFileInput.click());
    }
    iconFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
          entryIcon.value = evt.target.result; // Data URL for offline preservation
          updateModalIconPreview();
          showToast('Custom icon loaded!');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      }
    });
  }

  // Paste image directly from clipboard (Ctrl+V anywhere in modal or in icon input)
  document.addEventListener('paste', (e) => {
    if (!modalBackdrop.classList.contains('active')) return;
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith('image/')) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (evt) => {
            entryIcon.value = evt.target.result; // Data URL
            updateModalIconPreview();
            showToast('Pasted image set as icon!');
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    }
  });

  // Drag and Drop image file onto icon preview box
  if (entryIconPreview) {
    entryIconPreview.addEventListener('dragover', (e) => {
      e.preventDefault();
      entryIconPreview.style.borderColor = 'var(--accent)';
    });
    entryIconPreview.addEventListener('dragleave', () => {
      entryIconPreview.style.borderColor = '';
    });
    entryIconPreview.addEventListener('drop', (e) => {
      e.preventDefault();
      entryIconPreview.style.borderColor = '';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            entryIcon.value = evt.target.result;
            updateModalIconPreview();
            showToast('Dropped image set as icon!');
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }

  // ── Initialize ─────────────────────────────────────────

  initTheme();
  updateModeToggleUI();
  loadEntries();
  render();
  cacheExistingIconsOffline();

})();
