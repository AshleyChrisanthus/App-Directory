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
  const searchClearBtn = document.getElementById('searchClearBtn');
  const catFilterDropdown = document.getElementById('catFilterDropdown');
  const catFilterBtn = document.getElementById('catFilterBtn');
  const catFilterLabel = document.getElementById('catFilterLabel');
  const catFilterMenu = document.getElementById('catFilterMenu');
  const catFilterList = document.getElementById('catFilterList');
  const catFilterSearchInput = document.getElementById('catFilterSearchInput');
  const catFilterSearchClearBtn = document.getElementById('catFilterSearchClearBtn');
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
  const themeCustomizerBtn = document.getElementById('themeCustomizerBtn');
  const themeModalBackdrop = document.getElementById('themeModalBackdrop');
  const themeModalClose = document.getElementById('themeModalClose');
  const saveThemeModalBtn = document.getElementById('saveThemeModalBtn');
  const resetAllThemeBtn = document.getElementById('resetAllThemeBtn');
  const presetPalettesGrid = document.getElementById('presetPalettesGrid');
  const categoryColorsList = document.getElementById('categoryColorsList');
  const autoPaletteCatsBtn = document.getElementById('autoPaletteCatsBtn');
  const resetCatColorsBtn = document.getElementById('resetCatColorsBtn');
  const copyThemeJsonBtn = document.getElementById('copyThemeJsonBtn');
  const applyThemeJsonBtn = document.getElementById('applyThemeJsonBtn');
  const importThemeJsonInput = document.getElementById('importThemeJsonInput');
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
  const exportSplitGroup = document.getElementById('exportSplitGroup');
  const exportMenuBtn = document.getElementById('exportMenuBtn');
  const exportFolderBtn = document.getElementById('exportFolderBtn');
  const exportChangeFolderBtn = document.getElementById('exportChangeFolderBtn');
  const exportQuickBtn = document.getElementById('exportQuickBtn');
  const exportClipboardBtn = document.getElementById('exportClipboardBtn');
  const importFile = document.getElementById('importFile');
  const statsText = document.getElementById('statsText');

  // Form fields
  const entryName = document.getElementById('entryName');
  const entryUrl = document.getElementById('entryUrl');
  const tagInputWrapper = document.getElementById('tagInputWrapper');
  const entryCategory = document.getElementById('entryCategory');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const categorySuggestionsPopup = document.getElementById('categorySuggestionsPopup');
  const categoryTags = document.getElementById('categoryTags');
  const entryFolder = document.getElementById('entryFolder');
  const inlineNewFolderBtn = document.getElementById('inlineNewFolderBtn');
  const entryIcon = document.getElementById('entryIcon');
  const entryIconPreview = document.getElementById('entryIconPreview');
  const uploadIconBtn = document.getElementById('uploadIconBtn');
  const iconFileInput = document.getElementById('iconFileInput');
  const entryDescription = document.getElementById('entryDescription');
  const entryFavorite = document.getElementById('entryFavorite');

  // Sidebar & Folder elements
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const foldersSidebar = document.getElementById('foldersSidebar');
  const sidebarQuickViews = document.getElementById('sidebarQuickViews');
  const countAll = document.getElementById('countAll');
  const countFavorites = document.getElementById('countFavorites');
  const countUnorganized = document.getElementById('countUnorganized');
  const newFolderBtn = document.getElementById('newFolderBtn');
  const sidebarFoldersList = document.getElementById('sidebarFoldersList');
  const activeFolderBanner = document.getElementById('activeFolderBanner');
  const folderBannerIcon = document.getElementById('folderBannerIcon');
  const folderBannerTitle = document.getElementById('folderBannerTitle');
  const folderBannerCount = document.getElementById('folderBannerCount');
  const editFolderBtn = document.getElementById('editFolderBtn');
  const deleteFolderBtn = document.getElementById('deleteFolderBtn');

  // Folder modal elements
  const folderModalBackdrop = document.getElementById('folderModalBackdrop');
  const folderModalTitle = document.getElementById('folderModalTitle');
  const folderModalClose = document.getElementById('folderModalClose');
  const folderForm = document.getElementById('folderForm');
  const folderNameInput = document.getElementById('folderNameInput');
  const folderIconInput = document.getElementById('folderIconInput');
  const folderColorInput = document.getElementById('folderColorInput');
  const cancelFolderBtn = document.getElementById('cancelFolderBtn');
  const saveFolderBtn = document.getElementById('saveFolderBtn');

  // ── State ──────────────────────────────────────────────
  const STORAGE_FOLDERS_KEY = 'appDirectory_folders';
  const SIDEBAR_STATE_KEY = 'appDirectory_sidebarCollapsed';
  const FILTER_MODE_KEY = 'app_directory_cat_filter_mode';

  const DEFAULT_FOLDERS = [
    { id: 'f-work', name: 'Work', icon: '💼', color: '#0a84ff', dateAdded: '2026-01-01T00:00:00.000Z' },
    { id: 'f-personal', name: 'Personal', icon: '🏠', color: '#10b981', dateAdded: '2026-01-01T00:00:00.000Z' },
    { id: 'f-research', name: 'Research', icon: '🔬', color: '#88c0d0', dateAdded: '2026-01-01T00:00:00.000Z' }
  ];

  let entries = [];
  let folders = [];
  let activeFolderId = 'all'; // 'all', 'favorites', 'unorganized', or folder id
  let editingFolderId = null;
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
        renderCardsOnly();
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
    const allCats = getAllCategories();

    // Clean up any selected filter categories that no longer exist
    const catSet = new Set(allCats);
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

    // Check search query in dropdown
    const query = catFilterSearchInput ? catFilterSearchInput.value.toLowerCase().trim() : '';
    if (catFilterSearchClearBtn) {
      catFilterSearchClearBtn.style.display = query ? 'inline-flex' : 'none';
    }

    const filteredCats = query ? allCats.filter(cat => cat.toLowerCase().includes(query)) : allCats;

    // Populate multi-select category checkboxes
    if (catFilterList) {
      catFilterList.innerHTML = '';
      if (filteredCats.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'dropdown-empty-search';
        empty.textContent = `No categories match "${query}"`;
        catFilterList.appendChild(empty);
      } else {
        filteredCats.forEach(cat => {
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
    }

    updateCatFilterLabel();

    // Update datalist in the form
    const datalist = document.getElementById('categorySuggestions');
    if (datalist) {
      datalist.innerHTML = '';
      allCats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        datalist.appendChild(opt);
      });
    }
  }

  // ── Theme & Granular Color Customizer (Dual Dark/Light Modes) ────

  const ACTIVE_PRESET_KEY = 'appDirectory_activePreset';
  const CUSTOM_THEME_KEY = 'appDirectory_customTheme';
  const CAT_COLORS_KEY = 'appDirectory_categoryColors';

  let customThemeColors = {};
  let categoryColors = {};

  const THEME_PRESETS = [
    {
      id: 'default',
      name: 'Modern Apple',
      desc: 'Clean porcelain slate & sleek dark glassmorphism',
      dark: {
        '--bg-primary': '#0d0d0f',
        '--bg-secondary': '#1c1c1e',
        '--card-bg': '#1c1c1e',
        '--bg-hover': '#3a3a3c',
        '--text-primary': '#f5f5f7',
        '--text-secondary': '#a1a1a6',
        '--border-light': '#2c2c2e',
        '--accent': '#0a84ff',
        '--accent-hover': '#409cff',
        '--tag-bg': 'rgba(10,132,255,0.15)',
        '--tag-text': '#0a84ff'
      },
      light: {
        '--bg-primary': '#f5f5f7',
        '--bg-secondary': '#ffffff',
        '--card-bg': '#ffffff',
        '--bg-hover': '#e8e8ec',
        '--text-primary': '#1d1d1f',
        '--text-secondary': '#6e6e73',
        '--border-light': '#e5e5ea',
        '--accent': '#0071e3',
        '--accent-hover': '#0077ed',
        '--tag-bg': 'rgba(0,113,227,0.1)',
        '--tag-text': '#0071e3'
      },
      swatches: {
        dark: ['#0d0d0f', '#1c1c1e', '#0a84ff', '#f5f5f7'],
        light: ['#f5f5f7', '#ffffff', '#0071e3', '#1d1d1f']
      }
    },
    {
      id: 'midnight-sapphire',
      name: 'Ocean Sapphire',
      desc: 'Deep navy obsidian & crisp polar azure',
      dark: {
        '--bg-primary': '#0b1329',
        '--bg-secondary': '#111c44',
        '--card-bg': '#152259',
        '--bg-hover': '#1e2f75',
        '--text-primary': '#f0f9ff',
        '--text-secondary': '#94a3b8',
        '--border-light': '#1e293b',
        '--accent': '#38bdf8',
        '--accent-hover': '#7dd3fc',
        '--tag-bg': 'rgba(56,189,248,0.15)',
        '--tag-text': '#38bdf8'
      },
      light: {
        '--bg-primary': '#f0f7ff',
        '--bg-secondary': '#ffffff',
        '--card-bg': '#ffffff',
        '--bg-hover': '#e0f0fe',
        '--text-primary': '#0c2744',
        '--text-secondary': '#486581',
        '--border-light': '#d0e5f9',
        '--accent': '#0284c7',
        '--accent-hover': '#0369a1',
        '--tag-bg': 'rgba(2,132,199,0.12)',
        '--tag-text': '#0284c7'
      },
      swatches: {
        dark: ['#0b1329', '#152259', '#38bdf8', '#f0f9ff'],
        light: ['#f0f7ff', '#ffffff', '#0284c7', '#0c2744']
      }
    },
    {
      id: 'cyberpunk-neon',
      name: 'Cyberpunk Neon',
      desc: 'Onyx night & vivid fuchsia / magenta',
      dark: {
        '--bg-primary': '#09090b',
        '--bg-secondary': '#18181b',
        '--card-bg': '#18181b',
        '--bg-hover': '#27272a',
        '--text-primary': '#fafafa',
        '--text-secondary': '#a1a1aa',
        '--border-light': '#27272a',
        '--accent': '#ec4899',
        '--accent-hover': '#f472b6',
        '--tag-bg': 'rgba(236,72,153,0.18)',
        '--tag-text': '#f472b6'
      },
      light: {
        '--bg-primary': '#fdf4f8',
        '--bg-secondary': '#ffffff',
        '--card-bg': '#ffffff',
        '--bg-hover': '#fce7f3',
        '--text-primary': '#3f0c2c',
        '--text-secondary': '#831843',
        '--border-light': '#fbcfe8',
        '--accent': '#db2777',
        '--accent-hover': '#be185d',
        '--tag-bg': 'rgba(219,39,119,0.12)',
        '--tag-text': '#db2777'
      },
      swatches: {
        dark: ['#09090b', '#18181b', '#ec4899', '#fafafa'],
        light: ['#fdf4f8', '#ffffff', '#db2777', '#3f0c2c']
      }
    },
    {
      id: 'emerald-forest',
      name: 'Emerald Forest',
      desc: 'Deep pine woods & fresh botanical sage',
      dark: {
        '--bg-primary': '#041c14',
        '--bg-secondary': '#062c20',
        '--card-bg': '#0b3b2c',
        '--bg-hover': '#124e3c',
        '--text-primary': '#ecfdf5',
        '--text-secondary': '#a7f3d0',
        '--border-light': '#064e3b',
        '--accent': '#10b981',
        '--accent-hover': '#34d399',
        '--tag-bg': 'rgba(16,185,129,0.18)',
        '--tag-text': '#34d399'
      },
      light: {
        '--bg-primary': '#f0fdf4',
        '--bg-secondary': '#ffffff',
        '--card-bg': '#ffffff',
        '--bg-hover': '#dcfce7',
        '--text-primary': '#064e3b',
        '--text-secondary': '#047857',
        '--border-light': '#bbf7d0',
        '--accent': '#059669',
        '--accent-hover': '#047857',
        '--tag-bg': 'rgba(5,150,105,0.12)',
        '--tag-text': '#059669'
      },
      swatches: {
        dark: ['#041c14', '#0b3b2c', '#10b981', '#ecfdf5'],
        light: ['#f0fdf4', '#ffffff', '#059669', '#064e3b']
      }
    },
    {
      id: 'sunset-amber',
      name: 'Sunset Amber',
      desc: 'Volcanic charcoal & warm coral sand',
      dark: {
        '--bg-primary': '#1c1917',
        '--bg-secondary': '#292524',
        '--card-bg': '#292524',
        '--bg-hover': '#44403c',
        '--text-primary': '#fafaf9',
        '--text-secondary': '#a8a29e',
        '--border-light': '#44403c',
        '--accent': '#f97316',
        '--accent-hover': '#fb923c',
        '--tag-bg': 'rgba(249,115,22,0.18)',
        '--tag-text': '#fb923c'
      },
      light: {
        '--bg-primary': '#fff7ed',
        '--bg-secondary': '#ffffff',
        '--card-bg': '#ffffff',
        '--bg-hover': '#ffedd5',
        '--text-primary': '#431407',
        '--text-secondary': '#9a3412',
        '--border-light': '#fed7aa',
        '--accent': '#ea580c',
        '--accent-hover': '#c2410c',
        '--tag-bg': 'rgba(234,88,12,0.12)',
        '--tag-text': '#ea580c'
      },
      swatches: {
        dark: ['#1c1917', '#292524', '#f97316', '#fafaf9'],
        light: ['#fff7ed', '#ffffff', '#ea580c', '#431407']
      }
    },
    {
      id: 'rose-velvet',
      name: 'Rose Velvet',
      desc: 'Plum midnight & delicate blush rosé',
      dark: {
        '--bg-primary': '#1a101f',
        '--bg-secondary': '#291830',
        '--card-bg': '#291830',
        '--bg-hover': '#3d2348',
        '--text-primary': '#fff1f2',
        '--text-secondary': '#fda4af',
        '--border-light': '#4c1d35',
        '--accent': '#f43f5e',
        '--accent-hover': '#fb7185',
        '--tag-bg': 'rgba(244,63,94,0.18)',
        '--tag-text': '#fb7185'
      },
      light: {
        '--bg-primary': '#fff1f2',
        '--bg-secondary': '#ffffff',
        '--card-bg': '#ffffff',
        '--bg-hover': '#ffe4e6',
        '--text-primary': '#4c0519',
        '--text-secondary': '#9f1239',
        '--border-light': '#fecdd3',
        '--accent': '#e11d48',
        '--accent-hover': '#be123c',
        '--tag-bg': 'rgba(225,29,72,0.12)',
        '--tag-text': '#e11d48'
      },
      swatches: {
        dark: ['#1a101f', '#291830', '#f43f5e', '#fff1f2'],
        light: ['#fff1f2', '#ffffff', '#e11d48', '#4c0519']
      }
    },
    {
      id: 'nordic-frost',
      name: 'Nordic Frost',
      desc: 'Polar slate & icy Scandinavian breeze',
      dark: {
        '--bg-primary': '#242933',
        '--bg-secondary': '#2e3440',
        '--card-bg': '#2e3440',
        '--bg-hover': '#3b4252',
        '--text-primary': '#eceff4',
        '--text-secondary': '#d8dee9',
        '--border-light': '#3b4252',
        '--accent': '#88c0d0',
        '--accent-hover': '#81a1c1',
        '--tag-bg': 'rgba(136,192,208,0.18)',
        '--tag-text': '#88c0d0'
      },
      light: {
        '--bg-primary': '#f4f6f9',
        '--bg-secondary': '#ffffff',
        '--card-bg': '#ffffff',
        '--bg-hover': '#e5e9f0',
        '--text-primary': '#2e3440',
        '--text-secondary': '#4c566a',
        '--border-light': '#d8dee9',
        '--accent': '#5e81ac',
        '--accent-hover': '#81a1c1',
        '--tag-bg': 'rgba(94,129,172,0.12)',
        '--tag-text': '#5e81ac'
      },
      swatches: {
        dark: ['#242933', '#2e3440', '#88c0d0', '#eceff4'],
        light: ['#f4f6f9', '#ffffff', '#5e81ac', '#2e3440']
      }
    }
  ];

  function hexToRgb(hex) {
    if (!hex) return null;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length !== 6) return null;
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function getCategoryTagStyle(categoryName) {
    if (!categoryName) return '';
    const color = categoryColors[categoryName.toLowerCase()];
    if (!color) return '';
    const rgb = hexToRgb(color);
    if (!rgb) return `style="color: ${color};"`;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const bgAlpha = isDark ? 0.20 : 0.12;
    const borderAlpha = isDark ? 0.40 : 0.25;
    return `style="--tag-color: ${color}; color: ${color}; background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bgAlpha}); border: 1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderAlpha});"`;
  }

  function getActivePreset() {
    const id = localStorage.getItem(ACTIVE_PRESET_KEY) || 'default';
    return THEME_PRESETS.find(p => p.id === id) || THEME_PRESETS[0];
  }

  function applyPresetPaletteForMode(mode) {
    const preset = getActivePreset();
    const colors = preset[mode] || preset.dark;
    clearCustomThemeProperties();
    applyCustomThemeProperties(colors);
    customThemeColors = { ...colors };
    localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(customThemeColors));
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    // Apply active preset palette for current mode
    applyPresetPaletteForMode(theme);

    // Load custom category colors
    try {
      const catCols = localStorage.getItem(CAT_COLORS_KEY);
      if (catCols) {
        categoryColors = JSON.parse(catCols) || {};
      }
    } catch {
      categoryColors = {};
    }
  }

  function applyCustomThemeProperties(colorsObj) {
    const root = document.documentElement;
    Object.entries(colorsObj).forEach(([prop, val]) => {
      if (val) {
        root.style.setProperty(prop, val);
      }
    });
    if (colorsObj['--card-bg']) {
      root.style.setProperty('--modal-bg', colorsObj['--card-bg']);
    }
    if (colorsObj['--bg-primary']) {
      root.style.setProperty('--input-bg', colorsObj['--bg-primary']);
    }
    if (colorsObj['--border-light']) {
      root.style.setProperty('--input-border', colorsObj['--border-light']);
      root.style.setProperty('--card-border', colorsObj['--border-light']);
    }
  }

  function clearCustomThemeProperties() {
    const root = document.documentElement;
    [
      '--bg-primary', '--bg-secondary', '--bg-tertiary', '--card-bg',
      '--modal-bg', '--input-bg', '--input-border', '--card-border',
      '--bg-hover', '--text-primary', '--text-secondary', '--border-light',
      '--accent', '--accent-hover', '--tag-bg', '--tag-text'
    ].forEach(prop => root.style.removeProperty(prop));
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);

    applyPresetPaletteForMode(next);
    syncColorPickersFromDOM();
    renderPresetPalettes();
    notifyOtherTabs('SYNC_THEME');
    renderCardsOnly();
  }

  function openThemeModal() {
    renderPresetPalettes();
    syncColorPickersFromDOM();
    renderCategoryColorsList();
    themeModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeThemeModal() {
    themeModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderPresetPalettes() {
    if (!presetPalettesGrid) return;
    const currentMode = document.documentElement.getAttribute('data-theme') || 'dark';
    const activePreset = getActivePreset();
    presetPalettesGrid.innerHTML = '';

    THEME_PRESETS.forEach(preset => {
      const card = document.createElement('div');
      const isActive = preset.id === activePreset.id;
      card.className = `palette-card ${isActive ? 'active' : ''}`;
      const swatches = (preset.swatches && preset.swatches[currentMode]) || (preset.swatches && preset.swatches.dark) || [];

      card.innerHTML = `
        <div class="palette-preview-bar">
          ${swatches.map(c => `<div class="palette-swatch" style="background: ${c};"></div>`).join('')}
        </div>
        <div class="palette-name">${escapeHtml(preset.name)}</div>
        <div class="palette-desc">${escapeHtml(preset.desc)}</div>
      `;
      card.addEventListener('click', () => {
        applyPreset(preset);
      });
      presetPalettesGrid.appendChild(card);
    });
  }

  function applyPreset(preset) {
    localStorage.setItem(ACTIVE_PRESET_KEY, preset.id);
    const currentMode = document.documentElement.getAttribute('data-theme') || 'dark';
    applyPresetPaletteForMode(currentMode);
    syncColorPickersFromDOM();
    renderPresetPalettes();
    notifyOtherTabs('SYNC_THEME');
    renderCardsOnly();
    showToast(`Applied "${preset.name}" theme family!`);
  }

  function syncColorPickersFromDOM() {
    const computed = getComputedStyle(document.documentElement);
    const pickers = [
      { id: 'colorAccent', hexId: 'hexAccent', prop: '--accent' },
      { id: 'colorAccentHover', hexId: 'hexAccentHover', prop: '--accent-hover' },
      { id: 'colorBgPrimary', hexId: 'hexBgPrimary', prop: '--bg-primary' },
      { id: 'colorCardBg', hexId: 'hexCardBg', prop: '--card-bg' },
      { id: 'colorBgSecondary', hexId: 'hexBgSecondary', prop: '--bg-secondary' },
      { id: 'colorBgHover', hexId: 'hexBgHover', prop: '--bg-hover' },
      { id: 'colorTextPrimary', hexId: 'hexTextPrimary', prop: '--text-primary' },
      { id: 'colorTextSecondary', hexId: 'hexTextSecondary', prop: '--text-secondary' },
      { id: 'colorBorder', hexId: 'hexBorder', prop: '--border-light' },
      { id: 'colorTagText', hexId: 'hexTagText', prop: '--tag-text' },
      { id: 'colorTagBg', hexId: 'hexTagBg', prop: '--tag-bg' }
    ];

    pickers.forEach(({ id, hexId, prop }) => {
      const colorInput = document.getElementById(id);
      const hexInput = document.getElementById(hexId);
      if (!colorInput || !hexInput) return;

      let val = customThemeColors[prop] || computed.getPropertyValue(prop).trim();
      if (val.startsWith('#')) {
        colorInput.value = val;
        hexInput.value = val;
      } else if (val.startsWith('rgb')) {
        const match = val.match(/\d+/g);
        if (match && match.length >= 3) {
          const hex = rgbToHex(parseInt(match[0]), parseInt(match[1]), parseInt(match[2]));
          colorInput.value = hex;
          hexInput.value = val;
        }
      } else {
        hexInput.value = val;
      }
    });
  }

  function renderCategoryColorsList() {
    if (!categoryColorsList) return;
    const cats = getAllCategories();
    if (cats.length === 0) {
      categoryColorsList.innerHTML = '<p class="cat-modal-empty" style="grid-column: 1/-1;">No categories in use yet.</p>';
      return;
    }

    categoryColorsList.innerHTML = '';
    cats.forEach(cat => {
      const color = categoryColors[cat.toLowerCase()] || '#0a84ff';
      const hasCustom = !!categoryColors[cat.toLowerCase()];

      const row = document.createElement('div');
      row.className = 'cat-color-row';
      row.innerHTML = `
        <div class="cat-color-name-wrap">
          <span class="cat-color-name">${escapeHtml(cat)}</span>
          <span class="cat-color-preview-pill" ${getCategoryTagStyle(cat)}>Preview</span>
        </div>
        <div class="cat-color-picker-wrap">
          <input type="color" value="${color}" title="Choose color for ${escapeHtml(cat)}">
          ${hasCustom ? `<button type="button" class="cat-color-clear-btn" title="Reset to default">✕</button>` : ''}
        </div>
      `;

      const picker = row.querySelector('input[type="color"]');
      picker.addEventListener('input', (e) => {
        categoryColors[cat.toLowerCase()] = e.target.value;
        localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(categoryColors));
        const pill = row.querySelector('.cat-color-preview-pill');
        if (pill) {
          pill.outerHTML = `<span class="cat-color-preview-pill" ${getCategoryTagStyle(cat)}>Preview</span>`;
        }
        renderCardsOnly();
      });

      const clearBtn = row.querySelector('.cat-color-clear-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          delete categoryColors[cat.toLowerCase()];
          localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(categoryColors));
          renderCategoryColorsList();
          renderCardsOnly();
        });
      }

      categoryColorsList.appendChild(row);
    });
  }

  function autoColorizeAllCategories() {
    const cats = getAllCategories();
    if (cats.length === 0) {
      showToast('No categories to colorize.');
      return;
    }

    cats.forEach((cat, idx) => {
      const hue = Math.round((idx * 360) / cats.length);
      const hex = hslToHex(hue, 75, 55);
      categoryColors[cat.toLowerCase()] = hex;
    });

    localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(categoryColors));
    renderCategoryColorsList();
    renderCardsOnly();
    showToast(`Colorized ${cats.length} categories!`);
  }

  function resetAllThemeSettings() {
    localStorage.removeItem(ACTIVE_PRESET_KEY);
    localStorage.removeItem(CUSTOM_THEME_KEY);
    localStorage.removeItem(CAT_COLORS_KEY);
    categoryColors = {};
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem(THEME_KEY, 'dark');

    applyPresetPaletteForMode('dark');
    syncColorPickersFromDOM();
    renderPresetPalettes();
    renderCategoryColorsList();
    renderCardsOnly();
    notifyOtherTabs('SYNC_THEME');
    showToast('Reset all themes & colors to default!');
  }

  // ── Folders & Collections Hierarchy (Issue #6) ────────

  function loadFolders() {
    try {
      const raw = localStorage.getItem(STORAGE_FOLDERS_KEY);
      if (raw) {
        folders = JSON.parse(raw);
        if (!Array.isArray(folders)) folders = [...DEFAULT_FOLDERS];
      } else {
        folders = [...DEFAULT_FOLDERS];
        saveFolders(folders, false);
      }
    } catch {
      folders = [...DEFAULT_FOLDERS];
    }
  }

  function saveFolders(data = folders, notify = true) {
    folders = data;
    localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(folders));
    if (notify) notifyOtherTabs('SYNC_DATA');
  }

  function initSidebar() {
    const isCollapsed = localStorage.getItem(SIDEBAR_STATE_KEY) === 'true';
    if (foldersSidebar) {
      foldersSidebar.classList.toggle('collapsed', isCollapsed);
    }
  }

  function toggleSidebar() {
    if (!foldersSidebar) return;
    foldersSidebar.classList.toggle('collapsed');
    const isCollapsed = foldersSidebar.classList.contains('collapsed');
    localStorage.setItem(SIDEBAR_STATE_KEY, isCollapsed);
  }

  function renderFoldersSidebar() {
    if (!sidebarFoldersList) return;

    // Calculate item counts
    const diskList = entries;
    const allTotal = diskList.length;
    const favTotal = diskList.filter(e => e.isFavorite).length;
    const unorgTotal = diskList.filter(e => !e.folderId).length;

    if (countAll) countAll.textContent = allTotal;
    if (countFavorites) countFavorites.textContent = favTotal;
    if (countUnorganized) countUnorganized.textContent = unorgTotal;

    // Quick views active state & drop targets
    if (sidebarQuickViews) {
      sidebarQuickViews.querySelectorAll('.sidebar-nav-item').forEach(item => {
        const fid = item.getAttribute('data-folder-id');
        item.classList.toggle('active', fid === activeFolderId);
        setupFolderDropTarget(item, fid);
      });
    }

    // Render Custom Folders
    sidebarFoldersList.innerHTML = '';
    folders.forEach(folder => {
      const folderCount = diskList.filter(e => e.folderId === folder.id).length;
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `sidebar-nav-item ${activeFolderId === folder.id ? 'active' : ''}`;
      item.setAttribute('data-folder-id', folder.id);

      item.innerHTML = `
        <span class="sidebar-item-icon">${escapeHtml(folder.icon || '📁')}</span>
        <span class="sidebar-item-name">${escapeHtml(folder.name)}</span>
        <span class="sidebar-item-count">${folderCount}</span>
        <div class="sidebar-item-actions">
          <button type="button" class="sidebar-action-btn edit-folder-action" title="Edit folder">✏️</button>
          <button type="button" class="sidebar-action-btn delete-folder-action" title="Delete folder">🗑️</button>
        </div>
      `;

      // Select folder
      item.addEventListener('click', (e) => {
        if (e.target.closest('.edit-folder-action') || e.target.closest('.delete-folder-action')) return;
        setActiveFolder(folder.id);
      });

      // Edit folder
      const editBtn = item.querySelector('.edit-folder-action');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openFolderModal(folder.id);
        });
      }

      // Delete folder
      const delBtn = item.querySelector('.delete-folder-action');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteFolder(folder.id);
        });
      }

      // Drag & drop target
      setupFolderDropTarget(item, folder.id);

      sidebarFoldersList.appendChild(item);
    });

    updateActiveFolderBanner();
  }

  function setupFolderDropTarget(element, targetFolderId) {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      element.classList.add('drag-over');
    });

    element.addEventListener('dragleave', () => {
      element.classList.remove('drag-over');
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drag-over');
      const entryId = e.dataTransfer.getData('text/plain');
      if (!entryId) return;

      const diskList = getLatestStoredEntries();
      const entry = diskList.find(item => item.id === entryId);
      if (!entry) return;

      if (targetFolderId === 'favorites') {
        entry.isFavorite = true;
        entry.dateModified = new Date().toISOString();
        saveEntries(diskList);
        render();
        showToast(`Pinned "${entry.name}" to Favorites ⭐`);
      } else if (targetFolderId === 'unorganized') {
        entry.folderId = null;
        entry.dateModified = new Date().toISOString();
        saveEntries(diskList);
        render();
        showToast(`Moved "${entry.name}" to Unorganized`);
      } else if (targetFolderId === 'all') {
        // No folder change needed
      } else {
        const folder = folders.find(f => f.id === targetFolderId);
        entry.folderId = targetFolderId;
        entry.dateModified = new Date().toISOString();
        saveEntries(diskList);
        render();
        showToast(`Moved "${entry.name}" to ${folder ? folder.name : 'folder'} 📁`);
      }
    });
  }

  function setActiveFolder(folderId) {
    activeFolderId = folderId;
    renderFoldersSidebar();
    renderCardsOnly();
  }

  function updateActiveFolderBanner() {
    if (!activeFolderBanner) return;
    const bannerActions = document.getElementById('folderBannerActions');

    if (activeFolderId && activeFolderId.startsWith('f-')) {
      const folder = folders.find(f => f.id === activeFolderId);
      if (folder) {
        const folderCount = entries.filter(e => e.folderId === folder.id).length;
        if (folderBannerIcon) folderBannerIcon.textContent = folder.icon || '📁';
        if (folderBannerTitle) folderBannerTitle.textContent = folder.name;
        if (folderBannerCount) folderBannerCount.textContent = `${folderCount} site${folderCount !== 1 ? 's' : ''}`;
        if (bannerActions) bannerActions.style.display = 'flex';
        activeFolderBanner.style.display = 'flex';
        return;
      }
    } else if (activeFolderId === 'favorites') {
      const favCount = entries.filter(e => e.isFavorite).length;
      if (folderBannerIcon) folderBannerIcon.textContent = '⭐';
      if (folderBannerTitle) folderBannerTitle.textContent = 'Favorites';
      if (folderBannerCount) folderBannerCount.textContent = `${favCount} site${favCount !== 1 ? 's' : ''}`;
      if (bannerActions) bannerActions.style.display = 'none';
      activeFolderBanner.style.display = 'flex';
      return;
    } else if (activeFolderId === 'unorganized') {
      const unorgCount = entries.filter(e => !e.folderId).length;
      if (folderBannerIcon) folderBannerIcon.textContent = '📂';
      if (folderBannerTitle) folderBannerTitle.textContent = 'Unorganized';
      if (folderBannerCount) folderBannerCount.textContent = `${unorgCount} site${unorgCount !== 1 ? 's' : ''}`;
      if (bannerActions) bannerActions.style.display = 'none';
      activeFolderBanner.style.display = 'flex';
      return;
    }

    activeFolderBanner.style.display = 'none';
  }

  function populateFolderSelect(selectedId = '') {
    if (!entryFolder) return;
    entryFolder.innerHTML = '<option value="">📂 None (Unorganized)</option>';
    folders.forEach(folder => {
      const opt = document.createElement('option');
      opt.value = folder.id;
      opt.textContent = `${folder.icon || '📁'} ${folder.name}`;
      if (selectedId && folder.id === selectedId) {
        opt.selected = true;
      }
      entryFolder.appendChild(opt);
    });
  }

  let inlineFolderCallback = null;

  function openFolderModal(folderId = null, onCreatedCallback = null) {
    editingFolderId = folderId;
    inlineFolderCallback = typeof onCreatedCallback === 'function' ? onCreatedCallback : null;
    if (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        folderModalTitle.textContent = 'Edit Folder';
        folderNameInput.value = folder.name || '';
        folderIconInput.value = folder.icon || '📁';
        folderColorInput.value = folder.color || '#0a84ff';
      }
    } else {
      folderModalTitle.textContent = 'New Folder';
      folderNameInput.value = '';
      folderIconInput.value = '📁';
      folderColorInput.value = '#0a84ff';
    }
    folderModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => folderNameInput.focus(), 60);
  }

  function closeFolderModal() {
    folderModalBackdrop.classList.remove('active');
    const isMainModalActive = modalBackdrop && modalBackdrop.classList.contains('active');
    if (!isMainModalActive) {
      document.body.style.overflow = '';
    }
    inlineFolderCallback = null;
  }

  function saveFolderForm(e) {
    e.preventDefault();
    const name = folderNameInput.value.trim();
    if (!name) {
      folderNameInput.focus();
      return;
    }
    const icon = folderIconInput.value.trim() || '📁';
    const color = folderColorInput.value || '#0a84ff';

    let createdFolderId = null;

    if (editingFolderId) {
      const folder = folders.find(f => f.id === editingFolderId);
      if (folder) {
        folder.name = name;
        folder.icon = icon;
        folder.color = color;
        folder.dateModified = new Date().toISOString();
        showToast(`Updated folder "${name}"`);
      }
    } else {
      const newFolder = {
        id: `f-${Date.now()}`,
        name,
        icon,
        color,
        dateAdded: new Date().toISOString()
      };
      folders.push(newFolder);
      createdFolderId = newFolder.id;
      showToast(`Created folder "${name}" 📁`);
    }

    saveFolders();
    const cb = inlineFolderCallback;
    closeFolderModal();
    renderFoldersSidebar();
    renderCardsOnly();

    if (createdFolderId && typeof cb === 'function') {
      cb(createdFolderId);
    }
  }

  function deleteFolder(folderId) {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const diskList = getLatestStoredEntries();
    const count = diskList.filter(e => e.folderId === folderId).length;

    if (!confirm(`Delete folder "${folder.name}"? Contained websites (${count}) will be moved to Unorganized.`)) {
      return;
    }

    // Move sites to unorganized
    diskList.forEach(entry => {
      if (entry.folderId === folderId) {
        entry.folderId = null;
        entry.dateModified = new Date().toISOString();
      }
    });

    folders = folders.filter(f => f.id !== folderId);
    saveFolders();
    saveEntries(diskList);

    if (activeFolderId === folderId) {
      activeFolderId = 'all';
    }

    renderFoldersSidebar();
    render();
    showToast(`Deleted folder "${folder.name}"`);
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
      populateFolderSelect(entry.folderId || '');
      selectedCategories = [...(entry.categories || [])];
      entryIcon.value = entry.iconUrl || '';
      entryDescription.value = entry.description || '';
      entryFavorite.checked = entry.isFavorite || false;
    } else {
      modalTitle.textContent = 'Add Website';
      saveBtn.textContent = 'Save';
      entryForm.reset();
      const defaultFid = activeFolderId && activeFolderId.startsWith('f-') ? activeFolderId : '';
      populateFolderSelect(defaultFid);
      selectedCategories = [];
    }

    if (entryCategory) entryCategory.value = '';
    hideCategorySuggestions();
    renderCategoryChips();
    updateModalIconPreview();

    // Clear validation
    entryForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    modalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => entryName.focus(), 100);
  }

  function closeModal() {
    hideCategorySuggestions();
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
      folderId: data.folderId || null,
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
          // In-place DOM update (avoids full grid destroy & flash)
          const card = grid ? grid.querySelector(`.card[data-id="${entry.id}"]`) : null;
          if (card) {
            const iconDiv = card.querySelector('.card-icon:not(.new-icon-preview)');
            if (iconDiv) {
              iconDiv.innerHTML = `<img src="${escapeHtml(permanentDataUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
            }
          }
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
        folderId: data.folderId || null,
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
      target.folderId = data.folderId !== undefined ? data.folderId : (target.folderId || null);
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
          // In-place DOM update (avoids full grid destroy & flash)
          const card = grid ? grid.querySelector(`.card[data-id="${id}"]`) : null;
          if (card) {
            const iconDiv = card.querySelector('.card-icon:not(.new-icon-preview)');
            if (iconDiv) {
              iconDiv.innerHTML = `<img src="${escapeHtml(permanentDataUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
            }
          }
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

    // Active Folder / Collection Filter
    if (activeFolderId === 'favorites') {
      filtered = filtered.filter(e => e.isFavorite);
    } else if (activeFolderId === 'unorganized') {
      filtered = filtered.filter(e => !e.folderId);
    } else if (activeFolderId && activeFolderId !== 'all') {
      filtered = filtered.filter(e => e.folderId === activeFolderId);
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
    card.setAttribute('draggable', 'true');

    // Drag and Drop into Folders
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', entry.id);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('is-dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
    });

    const pendingIcon = pendingIcons.get(entry.id);
    if (pendingIcon) {
      card.classList.add('has-pending-icon');
    }

    const domain = getDomain(entry.url);
    const folder = entry.folderId ? folders.find(f => f.id === entry.folderId) : null;

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
        ${folder ? `<span class="tag folder-tag" style="background: rgba(10,132,255,0.12); color: var(--accent); border: 1px solid rgba(10,132,255,0.25);" title="Folder: ${escapeHtml(folder.name)}">${escapeHtml(folder.icon || '📁')} ${escapeHtml(folder.name)}</span>` : ''}
        ${(entry.categories || []).map(cat => `<span class="tag" ${getCategoryTagStyle(cat)}>${escapeHtml(cat)}</span>`).join('')}
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
    renderFoldersSidebar();
    populateCategories();
    renderCardsOnly();
  }

  // ── Import / Export & Direct Folder Save ──────────────

  const IDB_DB_NAME = 'app_directory_db';
  const IDB_STORE_NAME = 'handles';
  const IDB_KEY_EXPORTS = 'exports_dir_handle';

  function openHandlesDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getStoredExportsDirHandle() {
    try {
      const db = await openHandlesDB();
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE_NAME, 'readonly');
        const store = tx.objectStore(IDB_STORE_NAME);
        const req = store.get(IDB_KEY_EXPORTS);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async function saveExportsDirHandle(handle) {
    try {
      const db = await openHandlesDB();
      return new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
        const store = tx.objectStore(IDB_STORE_NAME);
        const req = store.put(handle, IDB_KEY_EXPORTS);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  function getBackupTimestampString(d = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    const secs = pad(d.getSeconds());
    return `${year}-${month}-${day}_${hours}-${mins}-${secs}`;
  }

  function getExportJson() {
    const list = getLatestStoredEntries();
    if (list.length === 0 && folders.length === 0) {
      showToast('Nothing to export.');
      return null;
    }
    const timestamp = getBackupTimestampString();
    const exportObject = {
      version: 2,
      folders: folders,
      entries: list
    };
    return {
      json: JSON.stringify(exportObject, null, 2),
      baseName: `app-directory-backup-${timestamp}`,
      filename: `app-directory-backup-${timestamp}.json`
    };
  }

  async function getUniqueFileHandleInDir(dirHandle, baseName, ext = '.json') {
    let candidateName = `${baseName}${ext}`;
    let counter = 1;

    while (true) {
      try {
        // Try getting existing file without creating it
        await dirHandle.getFileHandle(candidateName, { create: false });
        // If it exists, append incremented number
        candidateName = `${baseName} (${counter})${ext}`;
        counter++;
      } catch {
        // Filename is free! Create and return the handle
        return await dirHandle.getFileHandle(candidateName, { create: true });
      }
    }
  }

  async function exportToFolderDirect(changeFolder = false) {
    const data = getExportJson();
    if (!data) return;

    // Use modern File System Access Directory Picker if available
    if ('showDirectoryPicker' in window) {
      try {
        let dirHandle = changeFolder ? null : await getStoredExportsDirHandle();

        if (dirHandle) {
          let perm = await dirHandle.queryPermission({ mode: 'readwrite' });
          if (perm !== 'granted') {
            perm = await dirHandle.requestPermission({ mode: 'readwrite' });
          }
          if (perm !== 'granted') {
            dirHandle = null;
          }
        }

        if (!dirHandle) {
          showToast('Select your "exports" folder to save directly.');
          dirHandle = await window.showDirectoryPicker({
            id: 'app-directory-exports',
            mode: 'readwrite'
          });
          if (dirHandle) {
            await saveExportsDirHandle(dirHandle);
          }
        }

        if (dirHandle) {
          const fileHandle = await getUniqueFileHandleInDir(dirHandle, data.baseName, '.json');
          const writable = await fileHandle.createWritable();
          await writable.write(data.json);
          await writable.close();
          showToast(`Saved directly to ${dirHandle.name}/${fileHandle.name}!`);
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') return; // User cancelled
      }
    }

    // Fallback: File Save As or Download
    exportSaveAs();
  }

  function exportQuickDownload() {
    const data = getExportJson();
    if (!data) return;
    const blob = new Blob([data.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported backup to Downloads!');
  }

  async function exportSaveAs() {
    const data = getExportJson();
    if (!data) return;

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: data.filename,
          types: [{
            description: 'JSON Backup File',
            accept: { 'application/json': ['.json'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(data.json);
        await writable.close();
        showToast('Saved backup successfully!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    exportQuickDownload();
  }

  async function exportToClipboard() {
    const data = getExportJson();
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.json);
      showToast('Directory JSON copied to clipboard!');
    } catch {
      showToast('Failed to copy to clipboard.');
    }
  }

  function exportData() {
    exportToFolderDirect(false);
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        let importedEntries = [];
        let importedFolders = [];

        if (Array.isArray(parsed)) {
          // Legacy format (array of entries)
          importedEntries = parsed;
        } else if (parsed && typeof parsed === 'object') {
          // Modern format with folders and entries
          importedEntries = Array.isArray(parsed.entries) ? parsed.entries : [];
          importedFolders = Array.isArray(parsed.folders) ? parsed.folders : [];
        } else {
          throw new Error('Invalid format');
        }

        // Validate entries
        const valid = importedEntries.filter(item => item && item.name && item.url);
        if (valid.length === 0 && importedFolders.length === 0) {
          showToast('No valid entries or folders found in file.');
          return;
        }

        // Import / merge folders
        if (importedFolders.length > 0) {
          importedFolders.forEach(f => {
            if (f && f.id && f.name) {
              if (!folders.some(existing => existing.id === f.id)) {
                folders.push(f);
              }
            }
          });
          saveFolders(folders, false);
        }

        // Merge: skip duplicates by URL against fresh disk storage
        const diskList = getLatestStoredEntries();
        const existingUrls = new Set(diskList.map(item => item.url.toLowerCase()));
        let imported = 0;

        valid.forEach(item => {
          const url = ensureProtocol(item.url).toLowerCase();
          if (!existingUrls.has(url)) {
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
              folderId: item.folderId || null,
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
        renderFoldersSidebar();
        render();
        cacheExistingIconsOffline();
        showToast(`Imported ${imported} new site${imported !== 1 ? 's' : ''} (${valid.length - imported} duplicate${valid.length - imported !== 1 ? 's' : ''} skipped).`);
      } catch {
        showToast('Error: Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }

  // ── Category Chip UI & Modern Autocomplete Suggestions ──

  let suggestionHighlightedIndex = -1;

  function renderCategoryChips() {
    const container = document.getElementById('categoryTags');
    if (!container) return;
    container.innerHTML = '';
    selectedCategories.forEach(cat => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      const customStyle = getCategoryTagStyle(cat);
      if (customStyle) {
        const match = customStyle.match(/style="([^"]+)"/);
        if (match) chip.setAttribute('style', match[1]);
      }
      chip.innerHTML = `${escapeHtml(cat)}<button type="button" class="tag-chip-remove" title="Remove">&times;</button>`;
      chip.querySelector('.tag-chip-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        selectedCategories = selectedCategories.filter(c => c !== cat);
        renderCategoryChips();
        renderCategorySuggestions();
      });
      container.appendChild(chip);
    });
  }

  function renderCategorySuggestions() {
    if (!categorySuggestionsPopup || !entryCategory) return;

    const allCats = getAllCategories();
    const query = entryCategory.value.trim().toLowerCase();

    // Available categories not yet selected
    const available = allCats.filter(cat => !selectedCategories.includes(cat));

    const matches = query
      ? available.filter(cat => cat.toLowerCase().includes(query))
      : available;

    // Calculate usage counts
    const counts = {};
    entries.forEach(e => {
      (e.categories || []).forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });

    categorySuggestionsPopup.innerHTML = '';
    suggestionHighlightedIndex = -1;

    if (matches.length === 0) {
      categorySuggestionsPopup.style.display = 'none';
      return;
    }

    matches.forEach((cat) => {
      const count = counts[cat] || 0;
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `
        <span class="suggestion-name">${escapeHtml(cat)}</span>
        <span class="suggestion-count">${count} site${count !== 1 ? 's' : ''}</span>
      `;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent input blur before click
        addTag(cat);
      });
      categorySuggestionsPopup.appendChild(item);
    });

    categorySuggestionsPopup.style.display = 'flex';
  }

  function hideCategorySuggestions() {
    if (categorySuggestionsPopup) {
      categorySuggestionsPopup.style.display = 'none';
      suggestionHighlightedIndex = -1;
    }
  }

  function setSuggestionHighlight(newIndex) {
    if (!categorySuggestionsPopup) return;
    const items = categorySuggestionsPopup.querySelectorAll('.suggestion-item');
    items.forEach(el => el.classList.remove('is-focused'));
    if (items.length === 0) {
      suggestionHighlightedIndex = -1;
      return;
    }
    if (newIndex < 0) {
      suggestionHighlightedIndex = items.length - 1;
    } else if (newIndex >= items.length) {
      suggestionHighlightedIndex = 0;
    } else {
      suggestionHighlightedIndex = newIndex;
    }
    const target = items[suggestionHighlightedIndex];
    if (target) {
      target.classList.add('is-focused');
      target.scrollIntoView({ block: 'nearest' });
    }
  }

  function addTag(val) {
    val = (val || '').trim();
    if (val && !selectedCategories.includes(val)) {
      selectedCategories.push(val);
      renderCategoryChips();
    }
    if (entryCategory) {
      entryCategory.value = '';
    }
    hideCategorySuggestions();
  }

  // ── Category Management Modal ───────────────────────────

  const catModalBackdrop = document.getElementById('catModalBackdrop');
  const catModalClose = document.getElementById('catModalClose');
  const catModalSearchInput = document.getElementById('catModalSearchInput');
  const catModalSearchClearBtn = document.getElementById('catModalSearchClearBtn');
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
    if (catModalSearchInput) {
      catModalSearchInput.value = '';
    }
    if (catModalSearchClearBtn) {
      catModalSearchClearBtn.style.display = 'none';
    }
    renderCatList('');
    catModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (catModalSearchInput) {
      setTimeout(() => catModalSearchInput.focus(), 60);
    }
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
      if (categoryColors[oldName.toLowerCase()]) {
        categoryColors[newName.toLowerCase()] = categoryColors[oldName.toLowerCase()];
        delete categoryColors[oldName.toLowerCase()];
        localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(categoryColors));
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

    if (categoryColors[catName.toLowerCase()]) {
      delete categoryColors[catName.toLowerCase()];
      localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(categoryColors));
    }

    selectedFilterCategories.delete(catName);
    saveEntries(diskList);
    render();
    showToast(`Deleted category "${catName}"`);
    const q = catModalSearchInput ? catModalSearchInput.value : '';
    renderCatList(q);
  }

  function renderCatList(query = '') {
    const allUsed = getUsedCategories();
    const cleanQuery = (typeof query === 'string' ? query : '').toLowerCase().trim();

    if (catModalSearchClearBtn) {
      catModalSearchClearBtn.style.display = cleanQuery ? 'inline-flex' : 'none';
    }

    const filtered = cleanQuery
      ? allUsed.filter(([cat]) => cat.toLowerCase().includes(cleanQuery))
      : allUsed;

    catList.innerHTML = '';

    if (allUsed.length === 0) {
      catEmptyMsg.textContent = 'No categories in use yet.';
      catEmptyMsg.style.display = 'block';
      return;
    }

    if (filtered.length === 0) {
      catEmptyMsg.textContent = `No categories match "${cleanQuery}".`;
      catEmptyMsg.style.display = 'block';
      return;
    }

    catEmptyMsg.style.display = 'none';

    filtered.forEach(([cat, count]) => {
      const row = document.createElement('div');
      row.className = 'cat-row';
      row.innerHTML = `
        <span class="cat-row-name" ${getCategoryTagStyle(cat)} style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:600;">${escapeHtml(cat)}</span>
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
          const q = catModalSearchInput ? catModalSearchInput.value : '';
          renderCatList(q);
        };

        const doCancel = () => {
          const q = catModalSearchInput ? catModalSearchInput.value : '';
          renderCatList(q);
        };

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

  if (catModalSearchInput) {
    catModalSearchInput.addEventListener('input', () => {
      renderCatList(catModalSearchInput.value);
    });
    catModalSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        catModalSearchInput.value = '';
        renderCatList('');
      }
    });
  }

  if (catModalSearchClearBtn) {
    catModalSearchClearBtn.addEventListener('click', () => {
      if (catModalSearchInput) {
        catModalSearchInput.value = '';
        catModalSearchInput.focus();
      }
      renderCatList('');
    });
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

    // If user typed a category but didn't press Enter/Add, include it
    const pendingCat = entryCategory ? entryCategory.value.trim() : '';
    if (pendingCat && !selectedCategories.includes(pendingCat)) {
      selectedCategories.push(pendingCat);
    }

    const data = {
      name: entryName.value.trim(),
      url: entryUrl.value.trim(),
      folderId: entryFolder ? (entryFolder.value || null) : null,
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
      closeThemeModal();
      closeFolderModal();
      if (catFilterDropdown) catFilterDropdown.classList.remove('open');
      if (exportSplitGroup) exportSplitGroup.classList.remove('open');
    }
  });

  // Category tag input & autocomplete suggestions (Modal)
  if (entryCategory) {
    entryCategory.addEventListener('input', () => {
      renderCategorySuggestions();
    });

    entryCategory.addEventListener('focus', () => {
      renderCategorySuggestions();
    });

    entryCategory.addEventListener('keydown', (e) => {
      const isVisible = categorySuggestionsPopup && categorySuggestionsPopup.style.display !== 'none';
      const items = categorySuggestionsPopup ? categorySuggestionsPopup.querySelectorAll('.suggestion-item') : [];

      if (e.key === 'ArrowDown') {
        if (!isVisible) {
          renderCategorySuggestions();
        } else {
          e.preventDefault();
          setSuggestionHighlight(suggestionHighlightedIndex + 1);
        }
      } else if (e.key === 'ArrowUp') {
        if (isVisible) {
          e.preventDefault();
          setSuggestionHighlight(suggestionHighlightedIndex - 1);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (isVisible && suggestionHighlightedIndex >= 0 && items[suggestionHighlightedIndex]) {
          const name = items[suggestionHighlightedIndex].querySelector('.suggestion-name').textContent;
          addTag(name);
        } else if (entryCategory.value.trim()) {
          addTag(entryCategory.value);
        }
      } else if (e.key === 'Escape') {
        if (isVisible) {
          e.stopPropagation();
          hideCategorySuggestions();
        }
      }
    });
  }

  if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
      if (entryCategory && entryCategory.value.trim()) {
        addTag(entryCategory.value);
      }
    });
  }

  // Category Multi-Select Dropdown Controls
  let catFilterHighlightedIndex = -1;

  function getCatFilterNavigableItems() {
    if (!catFilterList) return [];
    return Array.from(catFilterList.querySelectorAll('.dropdown-item'));
  }

  function setCatFilterHighlight(newIndex) {
    const items = getCatFilterNavigableItems();
    items.forEach(el => el.classList.remove('is-focused'));
    if (items.length === 0) {
      catFilterHighlightedIndex = -1;
      return;
    }
    if (newIndex < 0) {
      catFilterHighlightedIndex = items.length - 1;
    } else if (newIndex >= items.length) {
      catFilterHighlightedIndex = 0;
    } else {
      catFilterHighlightedIndex = newIndex;
    }
    const target = items[catFilterHighlightedIndex];
    if (target) {
      target.classList.add('is-focused');
      target.scrollIntoView({ block: 'nearest' });
    }
  }

  if (catFilterBtn && catFilterDropdown) {
    catFilterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = catFilterDropdown.classList.toggle('open');
      if (isOpen && catFilterSearchInput) {
        catFilterHighlightedIndex = -1;
        setTimeout(() => catFilterSearchInput.focus(), 60);
      }
    });

    if (catFilterMenu) {
      catFilterMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (catFilterSearchInput) {
      catFilterSearchInput.addEventListener('input', () => {
        catFilterHighlightedIndex = -1;
        populateCategories();
      });
      catFilterSearchInput.addEventListener('keydown', (e) => {
        const items = getCatFilterNavigableItems();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setCatFilterHighlight(catFilterHighlightedIndex + 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setCatFilterHighlight(catFilterHighlightedIndex - 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const target = (catFilterHighlightedIndex >= 0 && items[catFilterHighlightedIndex])
            ? items[catFilterHighlightedIndex]
            : (items.length === 1 ? items[0] : null);
          if (target) {
            const cb = target.querySelector('input[type="checkbox"]');
            if (cb) {
              cb.checked = !cb.checked;
              cb.dispatchEvent(new Event('change'));
            }
          }
        } else if (e.key === 'Escape') {
          catFilterSearchInput.value = '';
          populateCategories();
          catFilterDropdown.classList.remove('open');
        }
      });
    }

    if (catFilterSearchClearBtn) {
      catFilterSearchClearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (catFilterSearchInput) {
          catFilterSearchInput.value = '';
          catFilterSearchInput.focus();
        }
        populateCategories();
      });
    }

    if (selectAllCatsBtn) {
      selectAllCatsBtn.addEventListener('click', () => {
        const allCats = getAllCategories();
        const query = catFilterSearchInput ? catFilterSearchInput.value.toLowerCase().trim() : '';
        const targetCats = query ? allCats.filter(cat => cat.toLowerCase().includes(query)) : allCats;

        targetCats.forEach(cat => selectedFilterCategories.add(cat));

        if (catFilterList) {
          catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        }
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }

    if (clearAllCatsBtn) {
      clearAllCatsBtn.addEventListener('click', () => {
        const query = catFilterSearchInput ? catFilterSearchInput.value.toLowerCase().trim() : '';
        if (query) {
          const allCats = getAllCategories();
          const targetCats = allCats.filter(cat => cat.toLowerCase().includes(query));
          targetCats.forEach(cat => selectedFilterCategories.delete(cat));
          if (catFilterList) {
            catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
          }
        } else {
          selectedFilterCategories.clear();
          if (catFilterList) {
            catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
          }
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

    // Close dropdowns & popups on click outside
    document.addEventListener('click', (e) => {
      if (catFilterDropdown && !catFilterDropdown.contains(e.target)) {
        catFilterDropdown.classList.remove('open');
      }
      if (tagInputWrapper && !tagInputWrapper.contains(e.target)) {
        hideCategorySuggestions();
      }
      if (exportSplitGroup && !exportSplitGroup.contains(e.target)) {
        exportSplitGroup.classList.remove('open');
      }
    });
  }

  // Form submit
  entryForm.addEventListener('submit', handleSubmit);

  // Search / sort
  searchInput.addEventListener('input', () => {
    if (searchClearBtn) {
      searchClearBtn.style.display = searchInput.value.trim() ? 'inline-flex' : 'none';
    }
    renderCardsOnly();
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchInput.value) {
      searchInput.value = '';
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      renderCardsOnly();
    }
  });

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      searchInput.focus();
      renderCardsOnly();
    });
  }

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

  // Export Split Button
  if (exportBtn) {
    exportBtn.addEventListener('click', exportData);
  }

  if (exportMenuBtn && exportSplitGroup) {
    exportMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportSplitGroup.classList.toggle('open');
    });
  }

  if (exportFolderBtn) {
    exportFolderBtn.addEventListener('click', () => {
      if (exportSplitGroup) exportSplitGroup.classList.remove('open');
      exportToFolderDirect(false);
    });
  }

  if (exportChangeFolderBtn) {
    exportChangeFolderBtn.addEventListener('click', () => {
      if (exportSplitGroup) exportSplitGroup.classList.remove('open');
      exportToFolderDirect(true);
    });
  }

  if (exportQuickBtn) {
    exportQuickBtn.addEventListener('click', () => {
      if (exportSplitGroup) exportSplitGroup.classList.remove('open');
      exportQuickDownload();
    });
  }

  if (exportClipboardBtn) {
    exportClipboardBtn.addEventListener('click', () => {
      if (exportSplitGroup) exportSplitGroup.classList.remove('open');
      exportToClipboard();
    });
  }

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

  // ── Theme Customizer Event Listeners ────────────────────

  if (themeCustomizerBtn) {
    themeCustomizerBtn.addEventListener('click', openThemeModal);
  }

  if (themeModalClose) {
    themeModalClose.addEventListener('click', closeThemeModal);
  }

  if (saveThemeModalBtn) {
    saveThemeModalBtn.addEventListener('click', closeThemeModal);
  }

  if (themeModalBackdrop) {
    themeModalBackdrop.addEventListener('click', (e) => {
      if (e.target === themeModalBackdrop) closeThemeModal();
    });
  }

  // Theme Customizer Tabs
  document.querySelectorAll('.theme-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.theme-tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Granular color pickers
  document.querySelectorAll('.color-picker-item input[type="color"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const prop = input.getAttribute('data-var');
      const hex = e.target.value;
      customThemeColors[prop] = hex;
      document.documentElement.style.setProperty(prop, hex);
      const hexInput = input.parentElement.querySelector('.color-hex-input');
      if (hexInput) hexInput.value = hex;
      localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(customThemeColors));
      notifyOtherTabs('SYNC_THEME');
      renderCardsOnly();
    });
  });

  document.querySelectorAll('.color-hex-input').forEach(input => {
    input.addEventListener('change', (e) => {
      let val = e.target.value.trim();
      if (!val.startsWith('#') && (val.length === 3 || val.length === 6)) val = '#' + val;
      const colorPicker = input.parentElement.querySelector('input[type="color"]');
      const prop = colorPicker ? colorPicker.getAttribute('data-var') : null;
      if (prop && (val.length === 4 || val.length === 7)) {
        customThemeColors[prop] = val;
        if (colorPicker) colorPicker.value = val;
        document.documentElement.style.setProperty(prop, val);
        localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(customThemeColors));
        notifyOtherTabs('SYNC_THEME');
        renderCardsOnly();
      }
    });
  });

  if (autoPaletteCatsBtn) {
    autoPaletteCatsBtn.addEventListener('click', autoColorizeAllCategories);
  }

  if (resetCatColorsBtn) {
    resetCatColorsBtn.addEventListener('click', () => {
      categoryColors = {};
      localStorage.removeItem(CAT_COLORS_KEY);
      renderCategoryColorsList();
      renderCardsOnly();
      showToast('Reset category tag colors!');
    });
  }

  if (resetAllThemeBtn) {
    resetAllThemeBtn.addEventListener('click', resetAllThemeSettings);
  }

  if (copyThemeJsonBtn) {
    copyThemeJsonBtn.addEventListener('click', async () => {
      const themeConfig = {
        theme: document.documentElement.getAttribute('data-theme') || 'dark',
        customColors: customThemeColors,
        categoryColors: categoryColors
      };
      try {
        await navigator.clipboard.writeText(JSON.stringify(themeConfig, null, 2));
        showToast('Theme JSON copied to clipboard!');
      } catch {
        showToast('Failed to copy theme to clipboard.');
      }
    });
  }

  if (applyThemeJsonBtn && importThemeJsonInput) {
    applyThemeJsonBtn.addEventListener('click', () => {
      const raw = importThemeJsonInput.value.trim();
      if (!raw) return;
      try {
        const config = JSON.parse(raw);
        if (config.theme) {
          document.documentElement.setAttribute('data-theme', config.theme);
          localStorage.setItem(THEME_KEY, config.theme);
        }
        if (config.customColors) {
          customThemeColors = config.customColors;
          clearCustomThemeProperties();
          applyCustomThemeProperties(customThemeColors);
          localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(customThemeColors));
        }
        if (config.categoryColors) {
          categoryColors = config.categoryColors;
          localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(categoryColors));
        }
        syncColorPickersFromDOM();
        renderCategoryColorsList();
        renderCardsOnly();
        notifyOtherTabs('SYNC_THEME');
        showToast('Custom theme imported successfully!');
      } catch {
        showToast('Error: Invalid theme JSON format.');
      }
    });
  }

  // ── Sidebar & Folder Event Listeners ────────────────────

  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener('click', toggleSidebar);
  }

  if (sidebarQuickViews) {
    sidebarQuickViews.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const fid = item.getAttribute('data-folder-id');
        if (fid) setActiveFolder(fid);
      });
    });
  }

  if (newFolderBtn) {
    newFolderBtn.addEventListener('click', () => openFolderModal());
  }

  if (inlineNewFolderBtn) {
    inlineNewFolderBtn.addEventListener('click', () => {
      openFolderModal(null, (newFolderId) => {
        populateFolderSelect(newFolderId);
      });
    });
  }

  if (editFolderBtn) {
    editFolderBtn.addEventListener('click', () => {
      if (activeFolderId && activeFolderId.startsWith('f-')) {
        openFolderModal(activeFolderId);
      }
    });
  }

  if (deleteFolderBtn) {
    deleteFolderBtn.addEventListener('click', () => {
      if (activeFolderId && activeFolderId.startsWith('f-')) {
        deleteFolder(activeFolderId);
      }
    });
  }

  if (folderForm) {
    folderForm.addEventListener('submit', saveFolderForm);
  }

  if (folderModalClose) {
    folderModalClose.addEventListener('click', closeFolderModal);
  }

  if (cancelFolderBtn) {
    cancelFolderBtn.addEventListener('click', closeFolderModal);
  }

  if (folderModalBackdrop) {
    folderModalBackdrop.addEventListener('click', (e) => {
      if (e.target === folderModalBackdrop) closeFolderModal();
    });
  }

  // Quick Emoji Presets
  const emojiBtns = document.querySelectorAll('.emoji-preset-btn');
  emojiBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (folderIconInput) {
        folderIconInput.value = btn.textContent.trim();
      }
    });
  });

  // ── Initialize ─────────────────────────────────────────

  initTheme();
  initSidebar();
  updateModeToggleUI();
  loadFolders();
  loadEntries();
  render();
  cacheExistingIconsOffline();

})();
