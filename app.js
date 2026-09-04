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
  const headerLogo = document.getElementById('headerLogo');
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
  const pinFavoritesBtn = document.getElementById('pinFavoritesBtn');
  const viewModeSwitcher = document.getElementById('viewModeSwitcher');
  const viewCardsBtn = document.getElementById('viewCardsBtn');
  const viewTableBtn = document.getElementById('viewTableBtn');
  const viewIconsBtn = document.getElementById('viewIconsBtn');
  let currentViewMode = localStorage.getItem('app_directory_view_layout') || 'cards';
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
  const healthCheckBtn = document.getElementById('healthCheckBtn');
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
  const urlAutofillStatus = document.getElementById('urlAutofillStatus');
  const autoDetectBtn = document.getElementById('autoDetectBtn');
  const tagInputWrapper = document.getElementById('tagInputWrapper');
  const entryCategory = document.getElementById('entryCategory');
  const addCategoryBtn = document.getElementById('addCategoryBtn');
  const categorySuggestionsPopup = document.getElementById('categorySuggestionsPopup');
  const categoryTags = document.getElementById('categoryTags');
  const entryFolder = document.getElementById('entryFolder');
  const inlineNewFolderBtn = document.getElementById('inlineNewFolderBtn');
  const entryIcon = document.getElementById('entryIcon');
  const entryIconPreview = document.getElementById('entryIconPreview');
  const iconCandidatesWrapper = document.getElementById('iconCandidatesWrapper');
  const iconCandidatesGrid = document.getElementById('iconCandidatesGrid');
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
  const sidebarBrokenView = document.getElementById('sidebarBrokenView');
  const countBroken = document.getElementById('countBroken');
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

  // Emoji Picker elements (Issue #27)
  const folderIconPickerWrap = document.getElementById('folderIconPickerWrap');
  const folderIconTriggerBtn = document.getElementById('folderIconTriggerBtn');
  const folderIconDisplay = document.getElementById('folderIconDisplay');
  const folderEmojiQuickRow = document.getElementById('folderEmojiQuickRow');
  const emojiPickerPopover = document.getElementById('emojiPickerPopover');
  const emojiSearchInput = document.getElementById('emojiSearchInput');
  const emojiSearchClear = document.getElementById('emojiSearchClear');
  const emojiCategoryTabs = document.getElementById('emojiCategoryTabs');
  const emojiGridContainer = document.getElementById('emojiGridContainer');
  const osKeyboardHint = document.getElementById('osKeyboardHint');
  const osShortcutKey = document.getElementById('osShortcutKey');

  // Add Bookmarks to Folder Modal elements
  const addBookmarksToFolderBtn = document.getElementById('addBookmarksToFolderBtn');
  const addBookmarksModalBackdrop = document.getElementById('addBookmarksModalBackdrop');
  const addBookmarksModal = document.getElementById('addBookmarksModal');
  const addBookmarksModalIcon = document.getElementById('addBookmarksModalIcon');
  const addBookmarksModalTitle = document.getElementById('addBookmarksModalTitle');
  const addBookmarksModalClose = document.getElementById('addBookmarksModalClose');
  const addBmSearchInput = document.getElementById('addBmSearchInput');
  const addBmSearchClear = document.getElementById('addBmSearchClear');
  const addBmFilterPills = document.getElementById('addBmFilterPills');
  const addBmSelectedCount = document.getElementById('addBmSelectedCount');
  const addBmTotalCount = document.getElementById('addBmTotalCount');
  const addBmSelectAllBtn = document.getElementById('addBmSelectAllBtn');
  const addBmDeselectAllBtn = document.getElementById('addBmDeselectAllBtn');
  const addBmList = document.getElementById('addBmList');
  const addBmEmpty = document.getElementById('addBmEmpty');
  const cancelAddBmBtn = document.getElementById('cancelAddBmBtn');
  const confirmAddBmBtn = document.getElementById('confirmAddBmBtn');

  // Health Modal elements
  const healthModalBackdrop = document.getElementById('healthModalBackdrop');
  const healthModalClose = document.getElementById('healthModalClose');
  const healthStatTotal = document.getElementById('healthStatTotal');
  const healthStatHealthy = document.getElementById('healthStatHealthy');
  const healthStatBroken = document.getElementById('healthStatBroken');
  const healthStatUntested = document.getElementById('healthStatUntested');
  const healthProgressWrap = document.getElementById('healthProgressWrap');
  const healthProgressStatusText = document.getElementById('healthProgressStatusText');
  const healthProgressPercent = document.getElementById('healthProgressPercent');
  const healthProgressFill = document.getElementById('healthProgressFill');
  const healthSearchInput = document.getElementById('healthSearchInput');
  const healthSearchClear = document.getElementById('healthSearchClear');
  const healthFilterPills = document.getElementById('healthFilterPills');
  const healthList = document.getElementById('healthList');
  const healthEmpty = document.getElementById('healthEmpty');
  const healthStopBtn = document.getElementById('healthStopBtn');
  const healthScanBrokenBtn = document.getElementById('healthScanBrokenBtn');
  const healthScanAllBtn = document.getElementById('healthScanAllBtn');

  // ── State ──────────────────────────────────────────────
  const STORAGE_FOLDERS_KEY = 'appDirectory_folders';
  const SIDEBAR_STATE_KEY = 'appDirectory_sidebarCollapsed';
  const FILTER_MODE_KEY = 'app_directory_cat_filter_mode';
  const PIN_FAVORITES_KEY = 'appDirectory_pinFavorites';

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
  let pinFavorites = localStorage.getItem(PIN_FAVORITES_KEY) === 'true'; // default: false
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

  // ── Resilient Async Worker Queue & Circuit Breaker ──────

  class DomainCircuitBreaker {
    constructor(failureThreshold = 2) {
      this.failureThreshold = failureThreshold;
      this.failures = new Map(); // domain -> consecutive failure count
      this.tripped = new Set();  // Set of tripped domain names
    }

    isTripped(domain) {
      if (!domain) return false;
      return this.tripped.has(domain.toLowerCase());
    }

    recordSuccess(domain) {
      if (!domain) return;
      const key = domain.toLowerCase();
      this.failures.delete(key);
    }

    recordFailure(domain) {
      if (!domain) return;
      const key = domain.toLowerCase();
      const count = (this.failures.get(key) || 0) + 1;
      this.failures.set(key, count);
      if (count >= this.failureThreshold) {
        this.tripped.add(key);
      }
    }

    reset() {
      this.failures.clear();
      this.tripped.clear();
    }
  }

  async function fetchWithBackoff(taskFn, options = {}) {
    const maxRetries = options.maxRetries ?? 2;
    const baseDelay = options.baseDelay ?? 400;
    const isTripped = options.isTripped || (() => false);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (isTripped()) {
        throw new Error('Circuit tripped for domain');
      }

      try {
        return await taskFn();
      } catch (err) {
        if (attempt === maxRetries || isTripped()) {
          throw err;
        }
        // Exponential delay with jitter: 400ms -> 800ms + random 0-150ms
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 150;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Concurrency-controlled async worker queue with circuit-breaker integration
  async function runWorkerQueue(items, concurrency, taskFn, onProgress, circuitBreaker = null) {
    let index = 0;
    let completed = 0;
    const total = items.length;
    if (total === 0) return;

    const workerCount = Math.min(concurrency || 4, total);
    const workers = Array.from({ length: workerCount }, async () => {
      while (index < total) {
        const i = index++;
        const item = items[i];
        const domain = item.url ? getDomain(ensureProtocol(item.url)) : '';

        // Fast-fail if domain circuit breaker is already tripped
        if (circuitBreaker && domain && circuitBreaker.isTripped(domain)) {
          completed++;
          if (onProgress) onProgress(completed, total, item, true);
          continue;
        }

        try {
          await taskFn(item, i);
          if (circuitBreaker && domain) circuitBreaker.recordSuccess(domain);
        } catch (err) {
          if (circuitBreaker && domain) circuitBreaker.recordFailure(domain);
        }

        completed++;
        if (onProgress) onProgress(completed, total, item, false);
      }
    });

    await Promise.all(workers);
  }

  // Legacy runPool wrapper
  async function runPool(items, concurrency, taskFn, onProgress) {
    return runWorkerQueue(items, concurrency, taskFn, onProgress);
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
    const catFilterBtnGroup = document.getElementById('catFilterBtnGroup');
    const allCats = getAllCategories();
    const count = selectedFilterCategories.size;

    if (count === 0 || (catFilterMode === 'union' && count === allCats.length)) {
      catFilterLabel.textContent = 'All Categories';
      catFilterBtn.classList.remove('has-filter');
      if (catFilterBtnGroup) catFilterBtnGroup.classList.remove('has-filter');
      return;
    }

    catFilterBtn.classList.add('has-filter');
    if (catFilterBtnGroup) catFilterBtnGroup.classList.add('has-filter');
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
    const brokenTotal = diskList.filter(e => e.health && e.health.status === 'broken').length;

    if (countAll) countAll.textContent = allTotal;
    if (countFavorites) countFavorites.textContent = favTotal;
    if (countUnorganized) countUnorganized.textContent = unorgTotal;
    if (countBroken) countBroken.textContent = brokenTotal;
    if (sidebarBrokenView) {
      sidebarBrokenView.style.display = brokenTotal > 0 ? 'flex' : 'none';
    }

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
      if (folder.color) {
        item.style.setProperty('--folder-color', folder.color);
      }

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
      } else if (targetFolderId === 'all' || targetFolderId === 'broken') {
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
    activeFolderBanner.style.removeProperty('--folder-color');

    if (activeFolderId && activeFolderId.startsWith('f-')) {
      const folder = folders.find(f => f.id === activeFolderId);
      if (folder) {
        const folderCount = entries.filter(e => e.folderId === folder.id).length;
        activeFolderBanner.style.setProperty('--folder-color', folder.color || '#0a84ff');
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
    } else if (activeFolderId === 'broken') {
      const brokenCount = entries.filter(e => e.health && e.health.status === 'broken').length;
      if (folderBannerIcon) folderBannerIcon.textContent = '⚠️';
      if (folderBannerTitle) folderBannerTitle.textContent = 'Broken / Offline Links';
      if (folderBannerCount) folderBannerCount.textContent = `${brokenCount} site${brokenCount !== 1 ? 's' : ''}`;
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

  // ── Full Categorized Emoji Library (Issue #27) ──────────

  const EMOJI_CATEGORIES = [
    {
      id: 'smileys',
      name: 'Smileys & People',
      icon: '😀',
      emojis: [
        { e: '😀', k: 'grinning happy smile face' },
        { e: '😃', k: 'smiley happy joy' },
        { e: '😄', k: 'smile laugh happy' },
        { e: '😁', k: 'beam grin smile' },
        { e: '😆', k: 'laughing lol haha' },
        { e: '😅', k: 'sweat smile relief' },
        { e: '😂', k: 'joy laugh cry tears lol' },
        { e: '🤣', k: 'rofl rolling laugh lol' },
        { e: '😊', k: 'blush smile warm happy' },
        { e: '😇', k: 'angel innocent halo' },
        { e: '🙂', k: 'slight smile happy' },
        { e: '🙃', k: 'upside down silly' },
        { e: '😉', k: 'wink flirt' },
        { e: '😌', k: 'relieved calm peace' },
        { e: '😍', k: 'heart eyes love crush' },
        { e: '🥰', k: 'smiling hearts love affection' },
        { e: '😘', k: 'kiss blow love' },
        { e: '😋', k: 'yum delicious food tasty' },
        { e: '😛', k: 'tongue silly joke' },
        { e: '😜', k: 'wink tongue crazy' },
        { e: '🤪', k: 'zany goofy wild' },
        { e: '😎', k: 'sunglasses cool boss' },
        { e: '🤓', k: 'nerd glasses smart tech geek' },
        { e: '🧐', k: 'monocle inspect curious examine' },
        { e: '🥳', k: 'party celebrate hat horn' },
        { e: '😏', k: 'smirk sly' },
        { e: '🤖', k: 'robot ai bot tech machine' },
        { e: '👻', k: 'ghost spooky halloween boo' },
        { e: '💀', k: 'skull dead death rip' },
        { e: '👽', k: 'alien ufo space extraterrestrial' },
        { e: '🤠', k: 'cowboy hat western' },
        { e: '🤝', k: 'handshake deal partner agree business' },
        { e: '👍', k: 'thumbs up like approve good yes' },
        { e: '🙌', k: 'hands raised celebrate praise yay' },
        { e: '👏', k: 'clap applause bravo congrats' },
        { e: '🔥', k: 'fire hot lit trending popular' },
        { e: '✨', k: 'sparkles clean magic shine star' },
        { e: '⭐', k: 'star favorite rating bookmark' },
        { e: '💡', k: 'lightbulb idea smart think innovation' },
        { e: '🧠', k: 'brain mind think knowledge smart learn' },
        { e: '❤️', k: 'heart love like red' },
        { e: '💖', k: 'sparkle heart love pink' },
        { e: '💯', k: '100 hundred perfect score grade' }
      ]
    },
    {
      id: 'nature',
      name: 'Animals & Nature',
      icon: '🌲',
      emojis: [
        { e: '🐶', k: 'dog puppy pet canine' },
        { e: '🐱', k: 'cat kitten feline pet' },
        { e: '🐭', k: 'mouse rodent' },
        { e: '🐹', k: 'hamster pet' },
        { e: '🐰', k: 'rabbit bunny pet' },
        { e: '🦊', k: 'fox animal wild' },
        { e: '🐻', k: 'bear animal' },
        { e: '🐼', k: 'panda animal cute' },
        { e: '🐨', k: 'koala australia animal' },
        { e: '🐯', k: 'tiger animal wild cat' },
        { e: '🦁', k: 'lion king beast animal' },
        { e: '🐮', k: 'cow cattle farm' },
        { e: '🐷', k: 'pig pork farm' },
        { e: '🐸', k: 'frog toad nature' },
        { e: '🐵', k: 'monkey ape animal' },
        { e: '🐔', k: 'chicken hen farm bird' },
        { e: '🐧', k: 'penguin bird arctic linux' },
        { e: '🐦', k: 'bird tweet twitter fly' },
        { e: '🦆', k: 'duck bird quack' },
        { e: '🦅', k: 'eagle bird raptor prey' },
        { e: '🦉', k: 'owl bird night wisdom' },
        { e: '🦇', k: 'bat night vampire' },
        { e: '🐺', k: 'wolf animal pack' },
        { e: '🦄', k: 'unicorn magic startup fantasy' },
        { e: '🐝', k: 'bee honey insect bug buzz' },
        { e: '🐛', k: 'bug caterpillar debug code insect' },
        { e: '🦋', k: 'butterfly insect pretty wings' },
        { e: '🕷️', k: 'spider web insect crawl' },
        { e: '🐢', k: 'turtle tortoise slow reptile' },
        { e: '🐍', k: 'snake python code reptile' },
        { e: '🐙', k: 'octopus tentacle sea github' },
        { e: '🐬', k: 'dolphin sea marine ocean' },
        { e: '🐳', k: 'whale ocean docker container' },
        { e: '🦈', k: 'shark fish ocean danger' },
        { e: '🌲', k: 'evergreen tree forest nature pine' },
        { e: '🌳', k: 'tree nature forest green' },
        { e: '🌴', k: 'palm tree beach tropical vacation' },
        { e: '🌱', k: 'seedling sprout plant grow spring' },
        { e: '🌿', k: 'herb plant leaf nature organic' },
        { e: '🍀', k: 'four leaf clover luck lucky irish' },
        { e: '🌸', k: 'cherry blossom flower sakura spring' },
        { e: '🌻', k: 'sunflower flower bright sun' },
        { e: '🌺', k: 'hibiscus flower tropical' },
        { e: '🍁', k: 'maple leaf autumn fall canada' },
        { e: '🍄', k: 'mushroom fungus mario nature' }
      ]
    },
    {
      id: 'food',
      name: 'Food & Drink',
      icon: '☕',
      emojis: [
        { e: '🍏', k: 'green apple fruit food' },
        { e: '🍎', k: 'red apple fruit tech food' },
        { e: '🍌', k: 'banana fruit monkey yellow' },
        { e: '🍉', k: 'watermelon fruit summer sweet' },
        { e: '🍇', k: 'grapes fruit wine purple' },
        { e: '🍓', k: 'strawberry berry fruit red' },
        { e: '🍒', k: 'cherries fruit cherry' },
        { e: '🍑', k: 'peach fruit' },
        { e: '🍍', k: 'pineapple fruit tropical' },
        { e: '🥑', k: 'avocado vegetable food healthy' },
        { e: '🌶️', k: 'hot pepper chili spicy' },
        { e: '🌽', k: 'corn maize vegetable' },
        { e: '🥐', k: 'croissant bread bakery french breakfast' },
        { e: '🍞', k: 'bread loaf bakery' },
        { e: '🧀', k: 'cheese cheddar food swiss' },
        { e: '🍳', k: 'cooking egg breakfast fry pan' },
        { e: '🥓', k: 'bacon meat breakfast food' },
        { e: '🥩', k: 'meat steak cut beef' },
        { e: '🍗', k: 'poultry leg chicken drumstick food' },
        { e: '🍔', k: 'hamburger burger fast food' },
        { e: '🍟', k: 'french fries chips fast food' },
        { e: '🍕', k: 'pizza slice cheese italian food' },
        { e: '🥪', k: 'sandwich sub lunch food' },
        { e: '🌮', k: 'taco mexican food' },
        { e: '🥗', k: 'salad green healthy diet' },
        { e: '🍝', k: 'spaghetti pasta noodle italian' },
        { e: '🍜', k: 'ramen noodle bowl soup' },
        { e: '🍣', k: 'sushi japanese fish food' },
        { e: '🍦', k: 'ice cream soft serve dessert sweet' },
        { e: '🍩', k: 'doughnut donut sweet pastry' },
        { e: '🍪', k: 'cookie biscuit sweet chocolate chip' },
        { e: '🎂', k: 'birthday cake celebration party dessert' },
        { e: '🍫', k: 'chocolate bar sweet candy' },
        { e: '🍿', k: 'popcorn movie cinema snack' },
        { e: '☕', k: 'coffee cafe espresso hot drink tea caffeine' },
        { e: '🍵', k: 'tea green matcha hot drink' },
        { e: '🧋', k: 'boba bubble tea milk drink' },
        { e: '🍺', k: 'beer drink alcohol pub pint' },
        { e: '🍻', k: 'cheers beers pub drink toast' },
        { e: '🍷', k: 'wine glass red alcohol drink' },
        { e: '🍸', k: 'cocktail martini drink bar' }
      ]
    },
    {
      id: 'activities',
      name: 'Activities & Sports',
      icon: '🎮',
      emojis: [
        { e: '⚽', k: 'soccer ball football sport' },
        { e: '🏀', k: 'basketball ball sport nba' },
        { e: '🏈', k: 'american football nfl sport' },
        { e: '⚾', k: 'baseball ball sport mlb' },
        { e: '🎾', k: 'tennis ball sport court' },
        { e: '🏐', k: 'volleyball ball sport beach' },
        { e: '🏓', k: 'ping pong table tennis paddle' },
        { e: '🏸', k: 'badminton racket shuttlecock sport' },
        { e: '🥊', k: 'boxing glove fight punch sport' },
        { e: '🎯', k: 'bullseye target goal direct hit accurate' },
        { e: '🎮', k: 'video game controller gaming play playstation xbox' },
        { e: '🕹️', k: 'joystick arcade retro game controller' },
        { e: '🎲', k: 'dice game board roll chance' },
        { e: '🧩', k: 'jigsaw puzzle piece problem solve fit' },
        { e: '🎨', k: 'artist palette design art painting draw color creative' },
        { e: '🎭', k: 'theater masks drama acting stage' },
        { e: '🎪', k: 'circus tent event show' },
        { e: '🎟️', k: 'ticket admission event entry' },
        { e: '🏆', k: 'trophy champion win prize award first' },
        { e: '🥇', k: 'first place medal gold winner' },
        { e: '🥈', k: 'second place medal silver winner' },
        { e: '🥉', k: 'third place medal bronze winner' },
        { e: '🏅', k: 'sports medal military award' }
      ]
    },
    {
      id: 'travel',
      name: 'Travel & Places',
      icon: '🚀',
      emojis: [
        { e: '🚗', k: 'car automobile vehicle drive auto' },
        { e: '🏎️', k: 'racing car race speed f1 fast' },
        { e: '🚓', k: 'police car law patrol cop' },
        { e: '🚑', k: 'ambulance emergency medical hospital' },
        { e: '🚒', k: 'fire engine truck emergency rescue' },
        { e: '🛵', k: 'scooter motorcycle moped vespa' },
        { e: '🚲', k: 'bicycle bike cycle pedal ride' },
        { e: '✈️', k: 'airplane flight airport travel fly' },
        { e: '🛫', k: 'airplane departure takeoff flight' },
        { e: '🛬', k: 'airplane landing arrival flight' },
        { e: '🚀', k: 'rocket launch startup space ship speed fast blast' },
        { e: '🛸', k: 'ufo flying saucer alien space sci-fi' },
        { e: '🚁', k: 'helicopter chopper fly travel' },
        { e: '⛵', k: 'sailboat boat yacht water ocean' },
        { e: '🚢', k: 'ship boat cruise ocean vessel' },
        { e: '⚓', k: 'anchor boat marine sea navy' },
        { e: '🏠', k: 'house home building residence living personal' },
        { e: '🏡', k: 'house garden home building' },
        { e: '🏢', k: 'office building company business work agency' },
        { e: '🏥', k: 'hospital medical doctor clinic health' },
        { e: '🏦', k: 'bank finance building money credit' },
        { e: '🏨', k: 'hotel building stay travel vacation' },
        { e: '🏫', k: 'school building education study student' },
        { e: '🏰', k: 'castle palace fairy tale fantasy royal' },
        { e: '🗺️', k: 'world map geography travel atlas explore' },
        { e: '🧭', k: 'compass navigate direction explore discover' },
        { e: '⛰️', k: 'mountain nature climb peak hike' },
        { e: '🌋', k: 'volcano mountain lava erupt' },
        { e: '🏖️', k: 'beach umbrella sand ocean vacation sea' }
      ]
    },
    {
      id: 'objects',
      name: 'Objects & Tech',
      icon: '💻',
      emojis: [
        { e: '📁', k: 'file folder directory organize files archive collection' },
        { e: '📂', k: 'open folder files docs directory' },
        { e: '🗂️', k: 'card index dividers organize directory' },
        { e: '💼', k: 'briefcase work job business portfolio career bag' },
        { e: '💻', k: 'laptop computer code tech developer macbook pc' },
        { e: '🖥️', k: 'desktop computer monitor display pc workstation' },
        { e: '⌨️', k: 'keyboard type code key input' },
        { e: '🖱️', k: 'computer mouse click pointer tech' },
        { e: '📱', k: 'mobile phone smartphone iphone android app' },
        { e: '☎️', k: 'telephone phone call contact support' },
        { e: '🔋', k: 'battery charge power energy level' },
        { e: '🔌', k: 'electric plug power connect socket adapter' },
        { e: '💡', k: 'lightbulb idea smart think innovation creative' },
        { e: '📚', k: 'books reading education library study school docs documentation' },
        { e: '📖', k: 'open book reading literature novel' },
        { e: '🔖', k: 'bookmark favorite tag mark save' },
        { e: '🏷️', k: 'label price tag category mark' },
        { e: '💰', k: 'money bag dollar rich cash wealth investment bank' },
        { e: '🪙', k: 'coin currency money gold cash crypto' },
        { e: '💵', k: 'dollar bill cash money green currency' },
        { e: '💳', k: 'credit card payment purchase visa mastercard buy pay' },
        { e: '💎', k: 'gem stone diamond crystal jewel valuable' },
        { e: '⚖️', k: 'balance scale law justice legal court' },
        { e: '🧰', k: 'toolbox tools toolkit repair fix utilities maintenance' },
        { e: '🛠️', k: 'hammer wrench tools repair settings build dev devops' },
        { e: '🔧', k: 'wrench tool spanner fix configure' },
        { e: '🔨', k: 'hammer tool build construction strike' },
        { e: '⚙️', k: 'gear settings options configuration preferences system' },
        { e: '🛡️', k: 'shield protect defense security antivirus guard safe' },
        { e: '🔒', k: 'lock closed private secure password secret encrypted' },
        { e: '🔓', k: 'unlock open access public released' },
        { e: '🔑', k: 'key password access secret auth api unlock login' },
        { e: '🗝️', k: 'old key secret antique access unlock' },
        { e: '🔬', k: 'microscope science research lab study biology chemistry analyze' },
        { e: '🔭', k: 'telescope astronomy space star look explore view' },
        { e: '🧪', k: 'test tube chemistry science experiment flask lab' },
        { e: '💊', k: 'pill medicine pharmacy drug prescription health' },
        { e: '📦', k: 'package box delivery shipping parcel amazon storage' },
        { e: '📅', k: 'calendar date schedule event appointment' },
        { e: '📊', k: 'bar chart graph stats metrics analytics insights dashboard' },
        { e: '📈', k: 'chart increasing trend growth metrics stock up' },
        { e: '📉', k: 'chart decreasing loss down drop decline' },
        { e: '📋', k: 'clipboard copy paste task list checklist notes plan' },
        { e: '📌', k: 'pushpin pin map location sticky note notice' },
        { e: '📎', k: 'paperclip attach attachment file link' },
        { e: '✂️', k: 'scissors cut snip tool craft edit' },
        { e: '🗑️', k: 'wastebasket trash bin delete remove recycle' }
      ]
    },
    {
      id: 'symbols',
      name: 'Symbols & Flags',
      icon: '⚡',
      emojis: [
        { e: '⚡', k: 'high voltage lightning bolt power fast energy flash zap speed' },
        { e: '✨', k: 'sparkles clean magic shine star ai new' },
        { e: '⭐', k: 'star favorite rating bookmark yellow' },
        { e: '🌟', k: 'glowing star shine bright sparkle special' },
        { e: '💥', k: 'boom collision explosion bang blast' },
        { e: '💫', k: 'dizzy star trail spark' },
        { e: '❤️', k: 'red heart love like romance favorite' },
        { e: '💙', k: 'blue heart love like' },
        { e: '💚', k: 'green heart nature love' },
        { e: '💜', k: 'purple heart love' },
        { e: '🖤', k: 'black heart dark love' },
        { e: '🤍', k: 'white heart pure love' },
        { e: '💔', k: 'broken heart sad breakup sorrow' },
        { e: '✅', k: 'check mark green verified done complete ok pass task' },
        { e: '❌', k: 'cross mark red cancel no wrong fail error bad' },
        { e: '⚠️', k: 'warning alert caution hazard attention broken' },
        { e: '🚫', k: 'no entry forbidden banned stop proscribed' },
        { e: '🛑', k: 'stop sign red octagonal halt pause' },
        { e: '💯', k: '100 hundred perfect score rank full' },
        { e: '🔔', k: 'bell notification alert alarm sound ring' },
        { e: '🔕', k: 'bell with slash mute silent quiet no notifications' },
        { e: '🎵', k: 'musical note song sound audio melody tune' },
        { e: '🎶', k: 'musical notes audio soundtrack music playlist' },
        { e: '🌐', k: 'globe with meridians world internet web online network domain' },
        { e: '♻️', k: 'recycling symbol green environment sustainable reuse' },
        { e: '🚩', k: 'triangular flag post mark goal priority milestone' },
        { e: '🏁', k: 'chequered flag finish race complete win' }
      ]
    }
  ];

  const DEFAULT_RECENT_EMOJIS = ['📁', '💼', '🏠', '🔬', '🛠️', '🎨', '⚡', '📚'];
  let activeEmojiCategoryId = 'all';

  function getRecentEmojis() {
    try {
      const stored = localStorage.getItem('appDirectory_recentEmojis');
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
    } catch {}
    return DEFAULT_RECENT_EMOJIS;
  }

  function saveRecentEmoji(emoji) {
    if (!emoji) return;
    let list = getRecentEmojis();
    list = [emoji, ...list.filter(e => e !== emoji)].slice(0, 16);
    try {
      localStorage.setItem('appDirectory_recentEmojis', JSON.stringify(list));
    } catch {}
    renderFolderEmojiQuickRow();
  }

  function renderFolderEmojiQuickRow() {
    if (!folderEmojiQuickRow) return;
    folderEmojiQuickRow.innerHTML = '';
    const recents = getRecentEmojis().slice(0, 6);

    recents.forEach(em => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-quick-chip';
      btn.textContent = em;
      btn.title = `Select ${em}`;
      btn.addEventListener('click', () => selectFolderEmoji(em));
      folderEmojiQuickRow.appendChild(btn);
    });

    const moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.className = 'emoji-more-btn';
    moreBtn.innerHTML = '<span>😀 More</span>';
    moreBtn.title = 'Browse all categorized emojis';
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEmojiPicker();
    });
    folderEmojiQuickRow.appendChild(moreBtn);
  }

  function selectFolderEmoji(emoji) {
    if (!emoji) return;
    if (folderIconInput) folderIconInput.value = emoji;
    if (folderIconDisplay) folderIconDisplay.textContent = emoji;
    saveRecentEmoji(emoji);
    closeEmojiPicker();
  }

  function renderEmojiCategoryTabs() {
    if (!emojiCategoryTabs) return;

    // Build tabs if empty
    if (emojiCategoryTabs.children.length === 0) {
      // "All" tab
      const allTab = document.createElement('button');
      allTab.type = 'button';
      allTab.className = 'emoji-category-tab is-active';
      allTab.setAttribute('data-cat', 'all');
      allTab.textContent = '🌟';
      allTab.title = 'All Emojis';
      allTab.addEventListener('click', (e) => {
        e.stopPropagation();
        activeEmojiCategoryId = 'all';
        updateActiveCategoryTab();
        renderEmojiGrid('all', emojiSearchInput ? emojiSearchInput.value : '');
      });
      emojiCategoryTabs.appendChild(allTab);

      // "Recent" tab
      const recentTab = document.createElement('button');
      recentTab.type = 'button';
      recentTab.className = 'emoji-category-tab';
      recentTab.setAttribute('data-cat', 'recent');
      recentTab.textContent = '🕒';
      recentTab.title = 'Recent Emojis';
      recentTab.addEventListener('click', (e) => {
        e.stopPropagation();
        activeEmojiCategoryId = 'recent';
        updateActiveCategoryTab();
        renderEmojiGrid('recent', emojiSearchInput ? emojiSearchInput.value : '');
      });
      emojiCategoryTabs.appendChild(recentTab);

      // Standard category tabs
      EMOJI_CATEGORIES.forEach(cat => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'emoji-category-tab';
        tab.setAttribute('data-cat', cat.id);
        tab.textContent = cat.icon;
        tab.title = cat.name;
        tab.addEventListener('click', (e) => {
          e.stopPropagation();
          activeEmojiCategoryId = cat.id;
          updateActiveCategoryTab();
          renderEmojiGrid(cat.id, emojiSearchInput ? emojiSearchInput.value : '');
        });
        emojiCategoryTabs.appendChild(tab);
      });
    }

    updateActiveCategoryTab();
  }

  function updateActiveCategoryTab() {
    if (!emojiCategoryTabs) return;
    const tabs = emojiCategoryTabs.querySelectorAll('.emoji-category-tab');
    tabs.forEach(t => {
      if (t.getAttribute('data-cat') === activeEmojiCategoryId) {
        t.classList.add('is-active');
      } else {
        t.classList.remove('is-active');
      }
    });
  }

  function renderEmojiGrid(categoryId = 'all', searchQuery = '') {
    if (!emojiGridContainer) return;
    emojiGridContainer.innerHTML = '';
    const q = searchQuery.trim().toLowerCase();

    // 1. If searching, filter across all emojis by keywords/characters
    if (q) {
      const matches = [];
      const seen = new Set();

      EMOJI_CATEGORIES.forEach(cat => {
        cat.emojis.forEach(item => {
          if (!seen.has(item.e) && (item.e.includes(q) || item.k.toLowerCase().includes(q))) {
            seen.add(item.e);
            matches.push(item);
          }
        });
      });

      if (matches.length === 0) {
        emojiGridContainer.innerHTML = `<div class="emoji-no-results">No emojis found matching "<strong>${escapeHtml(searchQuery)}</strong>"</div>`;
        return;
      }

      const sec = document.createElement('div');
      sec.className = 'emoji-category-section';
      sec.innerHTML = `<div class="emoji-category-title">Search Results (${matches.length})</div>`;
      const grid = document.createElement('div');
      grid.className = 'emoji-grid';

      matches.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-item-btn';
        btn.textContent = item.e;
        btn.title = item.k;
        btn.addEventListener('click', () => selectFolderEmoji(item.e));
        grid.appendChild(btn);
      });

      sec.appendChild(grid);
      emojiGridContainer.appendChild(sec);
      return;
    }

    // 2. Recent Only tab
    if (categoryId === 'recent') {
      const recents = getRecentEmojis();
      const sec = document.createElement('div');
      sec.className = 'emoji-category-section';
      sec.innerHTML = `<div class="emoji-category-title">🕒 Recently Used</div>`;
      const grid = document.createElement('div');
      grid.className = 'emoji-grid';

      recents.forEach(em => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-item-btn';
        btn.textContent = em;
        btn.addEventListener('click', () => selectFolderEmoji(em));
        grid.appendChild(btn);
      });

      sec.appendChild(grid);
      emojiGridContainer.appendChild(sec);
      return;
    }

    // 3. Specific Category Tab
    const categoriesToRender = categoryId === 'all'
      ? EMOJI_CATEGORIES
      : EMOJI_CATEGORIES.filter(c => c.id === categoryId);

    // If "All", prepend Recent row
    if (categoryId === 'all') {
      const recents = getRecentEmojis();
      if (recents.length > 0) {
        const recSec = document.createElement('div');
        recSec.className = 'emoji-category-section';
        recSec.innerHTML = `<div class="emoji-category-title">🕒 Recent</div>`;
        const recGrid = document.createElement('div');
        recGrid.className = 'emoji-grid';
        recents.slice(0, 16).forEach(em => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'emoji-item-btn';
          btn.textContent = em;
          btn.addEventListener('click', () => selectFolderEmoji(em));
          recGrid.appendChild(btn);
        });
        recSec.appendChild(recGrid);
        emojiGridContainer.appendChild(recSec);
      }
    }

    categoriesToRender.forEach(cat => {
      const sec = document.createElement('div');
      sec.className = 'emoji-category-section';
      sec.innerHTML = `<div class="emoji-category-title">${cat.icon} ${cat.name}</div>`;
      const grid = document.createElement('div');
      grid.className = 'emoji-grid';

      cat.emojis.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-item-btn';
        btn.textContent = item.e;
        btn.title = item.k;
        btn.addEventListener('click', () => selectFolderEmoji(item.e));
        grid.appendChild(btn);
      });

      sec.appendChild(grid);
      emojiGridContainer.appendChild(sec);
    });
  }

  function openEmojiPicker() {
    if (!emojiPickerPopover) return;
    activeEmojiCategoryId = 'all';
    if (emojiSearchInput) emojiSearchInput.value = '';
    if (emojiSearchClear) emojiSearchClear.style.display = 'none';

    renderEmojiCategoryTabs();
    renderEmojiGrid('all', '');
    emojiPickerPopover.style.display = 'flex';

    if (osShortcutKey) {
      const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform || '');
      osShortcutKey.textContent = isMac ? 'Cmd + Ctrl + Space' : 'Win + .';
    }

    setTimeout(() => {
      if (emojiSearchInput) emojiSearchInput.focus();
    }, 60);
  }

  function closeEmojiPicker() {
    if (emojiPickerPopover) {
      emojiPickerPopover.style.display = 'none';
    }
  }

  function toggleEmojiPicker() {
    if (!emojiPickerPopover) return;
    if (emojiPickerPopover.style.display === 'none' || !emojiPickerPopover.style.display) {
      openEmojiPicker();
    } else {
      closeEmojiPicker();
    }
  }

  let inlineFolderCallback = null;

  function openFolderModal(folderId = null, onCreatedCallback = null) {
    editingFolderId = folderId;
    inlineFolderCallback = typeof onCreatedCallback === 'function' ? onCreatedCallback : null;
    closeEmojiPicker();

    if (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        folderModalTitle.textContent = 'Edit Folder';
        folderNameInput.value = folder.name || '';
        folderIconInput.value = folder.icon || '📁';
        folderColorInput.value = folder.color || '#0a84ff';
        if (folderIconDisplay) folderIconDisplay.textContent = folder.icon || '📁';
      }
    } else {
      folderModalTitle.textContent = 'New Folder';
      folderNameInput.value = '';
      folderIconInput.value = '📁';
      folderColorInput.value = '#0a84ff';
      if (folderIconDisplay) folderIconDisplay.textContent = '📁';
    }

    renderFolderEmojiQuickRow();
    folderModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => folderNameInput.focus(), 60);
  }

  function closeFolderModal() {
    closeEmojiPicker();
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

  // ── Add Bookmarks to Folder Modal ───────────────────────

  let selectedBookmarksToMove = new Set();
  let addBmSearchQuery = '';
  let addBmSourceFilter = 'all';

  function openAddBookmarksModal() {
    let folder = folders.find(f => f.id === activeFolderId);
    if (!folder) {
      if (folders.length > 0) {
        setActiveFolder(folders[0].id);
        folder = folders.find(f => f.id === activeFolderId);
      } else {
        openFolderModal(null, (newFolderId) => {
          setActiveFolder(newFolderId);
          openAddBookmarksModal();
        });
        return;
      }
    }
    if (!folder) return;

    selectedBookmarksToMove.clear();
    addBmSearchQuery = '';
    addBmSourceFilter = 'all';

    if (addBmSearchInput) addBmSearchInput.value = '';
    if (addBmSearchClear) addBmSearchClear.style.display = 'none';

    if (addBookmarksModalIcon) addBookmarksModalIcon.textContent = folder.icon || '📁';
    if (addBookmarksModalTitle) addBookmarksModalTitle.textContent = `Add Bookmarks to "${folder.name}"`;

    if (addBmFilterPills) {
      addBmFilterPills.querySelectorAll('.pill-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-source') === 'all');
      });
    }

    renderAddBookmarksList();

    if (addBookmarksModalBackdrop) {
      addBookmarksModalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => { if (addBmSearchInput) addBmSearchInput.focus(); }, 60);
    }
  }

  function closeAddBookmarksModal() {
    if (addBookmarksModalBackdrop) {
      addBookmarksModalBackdrop.classList.remove('active');
    }
    document.body.style.overflow = '';
    selectedBookmarksToMove.clear();
  }

  function getAvailableBookmarksForFolder() {
    const diskList = getLatestStoredEntries();
    return diskList.filter(e => e.folderId !== activeFolderId);
  }

  function getFilteredBookmarksToMove() {
    let list = getAvailableBookmarksForFolder();

    if (addBmSourceFilter === 'unorganized') {
      list = list.filter(e => !e.folderId);
    } else if (addBmSourceFilter === 'folders') {
      list = list.filter(e => !!e.folderId);
    }

    if (addBmSearchQuery) {
      const q = addBmSearchQuery.toLowerCase();
      list = list.filter(e => (e.name || '').toLowerCase().includes(q) || (e.url || '').toLowerCase().includes(q));
    }

    return list;
  }

  function renderAddBookmarksList() {
    if (!addBmList) return;
    const available = getFilteredBookmarksToMove();

    if (addBmTotalCount) addBmTotalCount.textContent = available.length;
    if (addBmSelectedCount) addBmSelectedCount.textContent = selectedBookmarksToMove.size;

    if (confirmAddBmBtn) {
      const count = selectedBookmarksToMove.size;
      confirmAddBmBtn.disabled = count === 0;
      confirmAddBmBtn.textContent = `Move Selected (${count}) Bookmark${count !== 1 ? 's' : ''}`;
    }

    if (available.length === 0) {
      addBmList.innerHTML = '';
      if (addBmEmpty) addBmEmpty.style.display = 'block';
      return;
    }

    if (addBmEmpty) addBmEmpty.style.display = 'none';
    addBmList.innerHTML = '';

    available.forEach(entry => {
      const isSelected = selectedBookmarksToMove.has(entry.id);
      const row = document.createElement('div');
      row.className = `add-bm-item-row ${isSelected ? 'is-selected' : ''}`;

      let folderName = '📂 Unorganized';
      if (entry.folderId) {
        const f = folders.find(fld => fld.id === entry.folderId);
        if (f) folderName = `${f.icon || '📁'} ${f.name}`;
      }

      const domain = getDomain(entry.url);

      const iconSrc = entry.iconUrl || entry.icon || '';
      const iconHtml = iconSrc
        ? `<img src="${escapeHtml(iconSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
        : '<span class="icon-fallback">🌐</span>';

      row.innerHTML = `
        <div class="add-bm-item-left">
          <input type="checkbox" class="add-bm-checkbox" ${isSelected ? 'checked' : ''}>
          <div class="add-bm-item-icon">
            ${iconHtml}
          </div>
          <div class="add-bm-item-info">
            <div class="add-bm-item-name">${escapeHtml(entry.name)}</div>
            <div class="add-bm-item-url">${escapeHtml(domain || entry.url)}</div>
          </div>
        </div>
        <span class="add-bm-folder-badge">${escapeHtml(folderName)}</span>
      `;

      row.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-bm-checkbox')) {
          if (e.target.checked) {
            selectedBookmarksToMove.add(entry.id);
          } else {
            selectedBookmarksToMove.delete(entry.id);
          }
        } else {
          if (selectedBookmarksToMove.has(entry.id)) {
            selectedBookmarksToMove.delete(entry.id);
          } else {
            selectedBookmarksToMove.add(entry.id);
          }
        }
        renderAddBookmarksList();
      });

      addBmList.appendChild(row);
    });
  }

  function confirmMoveBookmarksToFolder() {
    const folder = folders.find(f => f.id === activeFolderId);
    if (selectedBookmarksToMove.size === 0 || !folder) return;
    const diskList = getLatestStoredEntries();
    let movedCount = 0;

    diskList.forEach(entry => {
      if (selectedBookmarksToMove.has(entry.id)) {
        entry.folderId = activeFolderId;
        entry.dateModified = new Date().toISOString();
        movedCount++;
      }
    });

    saveEntries(diskList);
    closeAddBookmarksModal();
    render();
    renderFoldersSidebar();
    showToast(`Moved ${movedCount} bookmark${movedCount !== 1 ? 's' : ''} to "${folder ? folder.name : 'folder'}" 📁`);
  }

  // ── Website Health & Broken Link Checker ────────────────

  let isHealthScanning = false;
  let healthAbortRequested = false;
  let healthFilter = 'all'; // 'all', 'broken', 'healthy', 'untested'
  let healthSearchQuery = '';
  let currentlyCheckingIds = new Set();

  async function checkUrlHealth(url) {
    if (!url) return { status: 'broken', error: 'Empty URL', statusCode: null, lastChecked: new Date().toISOString() };
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      // Direct reachability test (no-cors mode)
      await fetch(targetUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-cache'
      });
      clearTimeout(timeoutId);
      return { status: 'healthy', statusCode: 200, error: null, lastChecked: new Date().toISOString() };
    } catch (err) {
      clearTimeout(timeoutId);

      // Secondary image/favicon probe before concluding broken
      try {
        const domain = getDomain(targetUrl);
        if (domain) {
          const imgAlive = await new Promise((resolve) => {
            const img = new Image();
            const timer = setTimeout(() => resolve(false), 2500);
            img.onload = () => { clearTimeout(timer); resolve(true); };
            img.onerror = () => { clearTimeout(timer); resolve(false); };
            img.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(targetUrl)}&size=32`;
          });
          if (imgAlive) {
            return { status: 'healthy', statusCode: 200, error: null, lastChecked: new Date().toISOString() };
          }
        }
      } catch {
        // Ignore fallback error
      }

      const isAborted = err.name === 'AbortError';
      return {
        status: 'broken',
        statusCode: isAborted ? 408 : 0,
        error: isAborted ? 'Connection timed out (6s)' : 'DNS error or host unreachable',
        lastChecked: new Date().toISOString()
      };
    }
  }

  function openHealthModal() {
    healthSearchQuery = '';
    healthFilter = 'all';
    if (healthSearchInput) healthSearchInput.value = '';
    if (healthSearchClear) healthSearchClear.style.display = 'none';

    if (healthFilterPills) {
      healthFilterPills.querySelectorAll('.pill-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-health') === 'all');
      });
    }

    updateHealthSummaryCards();
    renderHealthModalList();

    if (healthModalBackdrop) {
      healthModalBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeHealthModal() {
    if (isHealthScanning) {
      stopHealthScan();
    }
    if (healthModalBackdrop) {
      healthModalBackdrop.classList.remove('active');
    }
    document.body.style.overflow = '';
  }

  function updateHealthSummaryCards() {
    const list = getLatestStoredEntries();
    const total = list.length;
    const healthy = list.filter(e => e.health && e.health.status === 'healthy').length;
    const broken = list.filter(e => e.health && e.health.status === 'broken').length;
    const untested = list.filter(e => !e.health || e.health.status === 'untested').length;

    if (healthStatTotal) healthStatTotal.textContent = total;
    if (healthStatHealthy) healthStatHealthy.textContent = healthy;
    if (healthStatBroken) healthStatBroken.textContent = broken;
    if (healthStatUntested) healthStatUntested.textContent = untested;
  }

  function getFilteredHealthEntries() {
    const list = getLatestStoredEntries();
    let res = [...list];

    if (healthFilter === 'broken') {
      res = res.filter(e => e.health && e.health.status === 'broken');
    } else if (healthFilter === 'healthy') {
      res = res.filter(e => e.health && e.health.status === 'healthy');
    } else if (healthFilter === 'untested') {
      res = res.filter(e => !e.health || e.health.status === 'untested');
    }

    if (healthSearchQuery) {
      const q = healthSearchQuery.toLowerCase();
      res = res.filter(e =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.url || '').toLowerCase().includes(q)
      );
    }

    return res;
  }

  function renderHealthModalList() {
    if (!healthList) return;
    const filtered = getFilteredHealthEntries();
    updateHealthSummaryCards();

    if (filtered.length === 0) {
      healthList.innerHTML = '';
      if (healthEmpty) healthEmpty.style.display = 'block';
      return;
    }

    if (healthEmpty) healthEmpty.style.display = 'none';
    healthList.innerHTML = '';

    filtered.forEach(entry => {
      const row = document.createElement('div');
      const isChecking = currentlyCheckingIds.has(entry.id);
      const isBroken = !isChecking && entry.health && entry.health.status === 'broken';
      const isHealthy = !isChecking && entry.health && entry.health.status === 'healthy';

      row.className = `health-item-row ${isBroken ? 'is-broken' : ''}`;

      let statusBadgeHtml = '<span class="health-status-badge untested">⚪ Untested</span>';
      if (isChecking) {
        statusBadgeHtml = '<span class="health-status-badge checking">⚡ Testing…</span>';
      } else if (isHealthy) {
        statusBadgeHtml = '<span class="health-status-badge healthy" title="Tested ' + (entry.health.lastChecked ? timeAgo(entry.health.lastChecked) : '') + '">🟢 Healthy</span>';
      } else if (isBroken) {
        statusBadgeHtml = '<span class="health-status-badge broken" title="' + escapeHtml(entry.health.error || 'Dead link') + '">⚠️ ' + escapeHtml(entry.health.error || 'Broken') + '</span>';
      }

      const domain = getDomain(entry.url);
      const iconSrc = entry.iconUrl || entry.icon || '';
      const iconHtml = iconSrc
        ? `<img src="${escapeHtml(iconSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
        : '<span class="icon-fallback">🌐</span>';

      row.innerHTML = `
        <div class="health-item-left">
          <div class="health-item-icon">
            ${iconHtml}
          </div>
          <div class="health-item-info">
            <div class="health-item-name">${escapeHtml(entry.name)}</div>
            <div class="health-item-url">${escapeHtml(domain || entry.url)}</div>
          </div>
        </div>
        <div class="health-item-right">
          ${statusBadgeHtml}
          <div class="health-actions-cell">
            <button type="button" class="health-action-btn health-retest-btn" title="Re-test this link">🔄</button>
            <button type="button" class="health-action-btn health-edit-btn" title="Edit website URL">✏️</button>
            <button type="button" class="health-action-btn health-visit-btn" title="Open website in new tab">↗️</button>
            <button type="button" class="health-action-btn btn-delete health-delete-btn" title="Delete bookmark">🗑️</button>
          </div>
        </div>
      `;

      // Retest
      const retestBtn = row.querySelector('.health-retest-btn');
      if (retestBtn) {
        retestBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          testSingleBookmarkHealth(entry.id);
        });
      }

      // Edit
      const editBtn = row.querySelector('.health-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeHealthModal();
          openModal(entry.id);
        });
      }

      // Visit
      const visitBtn = row.querySelector('.health-visit-btn');
      if (visitBtn) {
        visitBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.open(entry.url, '_blank', 'noopener,noreferrer');
        });
      }

      // Delete
      const deleteBtn = row.querySelector('.health-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Delete bookmark "${entry.name}"?`)) {
            deleteEntry(entry.id);
            renderHealthModalList();
          }
        });
      }

      healthList.appendChild(row);
    });
  }

  async function testSingleBookmarkHealth(entryId) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find(e => e.id === entryId);
    if (!entry) return;

    currentlyCheckingIds.add(entryId);
    renderHealthModalList();

    const result = await checkUrlHealth(entry.url);
    entry.health = result;
    entry.dateModified = new Date().toISOString();

    currentlyCheckingIds.delete(entryId);
    saveEntries(diskList);
    renderHealthModalList();
    renderCardsOnly();
    renderFoldersSidebar();
    showToast(`"${entry.name}": ${result.status === 'healthy' ? '🟢 Healthy' : '⚠️ ' + result.error}`);
  }

  async function startHealthScan(onlyBroken = false) {
    if (isHealthScanning) return;
    const diskList = getLatestStoredEntries();
    let targets = diskList;
    if (onlyBroken) {
      targets = diskList.filter(e => e.health && e.health.status === 'broken');
    }

    if (targets.length === 0) {
      showToast('No links match the scan criteria.');
      return;
    }

    isHealthScanning = true;
    healthAbortRequested = false;

    if (healthProgressWrap) healthProgressWrap.style.display = 'flex';
    if (healthStopBtn) healthStopBtn.style.display = 'inline-flex';
    if (healthScanAllBtn) healthScanAllBtn.disabled = true;
    if (healthScanBrokenBtn) healthScanBrokenBtn.disabled = true;

    const total = targets.length;
    let completed = 0;

    // Batch worker pool (concurrency 4 with domain circuit-breaker)
    const queue = [...targets];
    const workerCount = Math.min(4, queue.length);
    const circuitBreaker = new DomainCircuitBreaker(2);

    async function worker() {
      while (queue.length > 0 && !healthAbortRequested) {
        const item = queue.shift();
        if (!item) break;

        const domain = item.url ? getDomain(ensureProtocol(item.url)) : '';
        currentlyCheckingIds.add(item.id);
        if (healthProgressStatusText) {
          healthProgressStatusText.textContent = `Checking ${item.name || item.url} (${completed + 1}/${total})…`;
        }

        let healthRes;
        if (circuitBreaker.isTripped(domain)) {
          // Fast-fail: skip network timeout if domain circuit is already tripped
          healthRes = {
            status: 'broken',
            statusCode: 0,
            error: 'Host unreachable (circuit tripped)',
            lastChecked: new Date().toISOString()
          };
        } else {
          healthRes = await checkUrlHealth(item.url);
          if (healthRes.status === 'healthy') {
            circuitBreaker.recordSuccess(domain);
          } else {
            circuitBreaker.recordFailure(domain);
          }
        }

        item.health = healthRes;
        item.dateModified = new Date().toISOString();

        currentlyCheckingIds.delete(item.id);
        completed++;

        const pct = Math.round((completed / total) * 100);
        if (healthProgressPercent) healthProgressPercent.textContent = `${pct}%`;
        if (healthProgressFill) healthProgressFill.style.width = `${pct}%`;

        saveEntries(diskList);
        renderHealthModalList();
        renderCardsOnly();
        renderFoldersSidebar();
      }
    }

    const workers = [];
    for (let i = 0; i < workerCount; i++) {
      workers.push(worker());
    }

    await Promise.all(workers);

    isHealthScanning = false;
    currentlyCheckingIds.clear();

    if (healthProgressWrap) healthProgressWrap.style.display = 'none';
    if (healthStopBtn) healthStopBtn.style.display = 'none';
    if (healthScanAllBtn) healthScanAllBtn.disabled = false;
    if (healthScanBrokenBtn) healthScanBrokenBtn.disabled = false;

    updateHealthSummaryCards();
    renderHealthModalList();
    render();

    const brokenCount = diskList.filter(e => e.health && e.health.status === 'broken').length;
    if (healthAbortRequested) {
      showToast('Link scan paused.');
    } else {
      showToast(`Scan complete! ${brokenCount > 0 ? `⚠️ Found ${brokenCount} broken link${brokenCount !== 1 ? 's' : ''}` : '🟢 All tested links are healthy!'}`);
    }
  }

  function stopHealthScan() {
    healthAbortRequested = true;
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

  // ── Smart URL Auto-Fill ─────────────────────────────────

  let lastAutoDetectedUrl = '';
  let isAutoDetecting = false;

  function cleanPageTitle(rawTitle, domain = '') {
    if (!rawTitle) return '';
    let title = rawTitle.trim();
    if (typeof document !== 'undefined') {
      try {
        const txt = document.createElement('textarea');
        txt.innerHTML = title;
        if (txt.value) {
          title = txt.value;
        }
      } catch {}
    }

    if (domain) {
      const cleanDom = domain.replace(/^www\./i, '').split('.')[0];
      const regexes = [
        new RegExp(`\\s*[-|–—•·]\\s*${cleanDom}.*$`, 'i'),
        new RegExp(`^${cleanDom}\\s*[-|–—•·]\\s*`, 'i')
      ];
      for (const r of regexes) {
        if (title.length > 20 && r.test(title)) {
          title = title.replace(r, '').trim();
        }
      }
    }
    return title.replace(/\s+/g, ' ').trim();
  }

  function fallbackTitleFromUrl(url) {
    try {
      const domain = getDomain(url);
      if (!domain) return '';
      const parts = domain.replace(/^www\./i, '').split('.');
      const main = parts[0] || '';
      return main.charAt(0).toUpperCase() + main.slice(1);
    } catch {
      return '';
    }
  }

  function cleanDescription(rawDesc) {
    if (!rawDesc) return '';
    let desc = rawDesc.trim();
    if (typeof document !== 'undefined') {
      try {
        const txt = document.createElement('textarea');
        txt.innerHTML = desc;
        if (txt.value) desc = txt.value;
      } catch {}
    }
    return desc.replace(/\s+/g, ' ').trim();
  }

  async function fetchWebsiteMetadata(url) {
    if (!url) return null;
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const domain = getDomain(targetUrl);

    // 1. Primary Engine: Microlink API (Structured Rich Link Metadata & Descriptions)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const mUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(mUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && json.data) {
          const rawTitle = json.data.title || '';
          const cleanedTitle = cleanPageTitle(rawTitle, domain) || fallbackTitleFromUrl(targetUrl);
          const rawDesc = json.data.description || '';
          const description = cleanDescription(rawDesc);
          const scrapedIcon = json.data.logo?.url || json.data.icon?.url || '';

          if (cleanedTitle || description) {
            return {
              title: cleanedTitle,
              description,
              iconUrl: scrapedIcon,
              url: targetUrl
            };
          }
        }
      }
    } catch {}

    // 2. Secondary Engine: Codetabs HTML CORS Proxy
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();
        if (html && html.length > 50) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
          const twTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
          const docTitle = doc.querySelector('title')?.textContent;
          const rawTitle = ogTitle || twTitle || docTitle || '';
          const cleanedTitle = cleanPageTitle(rawTitle, domain) || fallbackTitleFromUrl(targetUrl);

          const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
          const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
          const twDesc = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
          const description = cleanDescription(ogDesc || metaDesc || twDesc || '');

          const iconLink = doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') ||
                           doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                           doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href');
          let resolvedIcon = '';
          if (iconLink) {
            try {
              resolvedIcon = new URL(iconLink, targetUrl).href;
            } catch {}
          }

          if (cleanedTitle || description) {
            return {
              title: cleanedTitle,
              description,
              iconUrl: resolvedIcon,
              url: targetUrl
            };
          }
        }
      }
    } catch {}

    // 3. Fallback: Local domain title formatting
    const fallbackTitle = fallbackTitleFromUrl(targetUrl);
    return {
      title: fallbackTitle,
      description: '',
      iconUrl: '',
      url: targetUrl
    };
  }

  // ── Multi-Source Icon Candidate Picker ──────────────────

  let selectedCandidateId = 'google';

  function getCandidateSources(url, scrapedIconUrl = '') {
    if (!url) return [];
    const targetUrl = ensureProtocol(url.trim());
    const domain = getDomain(targetUrl);
    if (!domain) return [];

    let origin = '';
    try {
      origin = new URL(targetUrl).origin;
    } catch {
      origin = `https://${domain}`;
    }

    return [
      {
        id: 'google',
        name: 'Google HD',
        iconSrc: `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(targetUrl)}&size=128`,
        tag: '🌐'
      },
      {
        id: 'apple',
        name: 'Touch Icon',
        iconSrc: scrapedIconUrl || `${origin}/apple-touch-icon.png`,
        tag: '🍎'
      },
      {
        id: 'ddg',
        name: 'DuckDuckGo',
        iconSrc: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        tag: '🦆'
      },
      {
        id: 'clearbit',
        name: 'Brand Logo',
        iconSrc: `https://logo.clearbit.com/${domain}`,
        tag: '🏢'
      }
    ];
  }

  function renderIconCandidates(url, scrapedIconUrl = '', forceSelectedId = null) {
    if (!iconCandidatesGrid || !iconCandidatesWrapper) return;
    if (!url || (!url.includes('.') && !url.startsWith('localhost'))) {
      iconCandidatesWrapper.style.display = 'none';
      return;
    }

    const candidates = getCandidateSources(url, scrapedIconUrl);
    if (candidates.length === 0) {
      iconCandidatesWrapper.style.display = 'none';
      return;
    }

    if (forceSelectedId) {
      selectedCandidateId = forceSelectedId;
    } else if (!selectedCandidateId) {
      selectedCandidateId = 'google';
    }

    iconCandidatesWrapper.style.display = 'flex';
    iconCandidatesGrid.innerHTML = '';

    candidates.forEach(cand => {
      const card = document.createElement('div');
      const isActive = cand.id === selectedCandidateId;
      card.className = `icon-candidate-card ${isActive ? 'is-active' : ''}`;
      card.setAttribute('data-candidate-id', cand.id);

      card.innerHTML = `
        ${isActive ? '<div class="candidate-check-badge">✓</div>' : ''}
        <div class="candidate-icon-box">
          <img src="${escapeHtml(cand.iconSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">
        </div>
        <span class="candidate-source-name" title="${cand.name}">${cand.tag} ${cand.name}</span>
      `;

      card.addEventListener('click', (e) => {
        e.preventDefault();
        selectedCandidateId = cand.id;
        if (entryIcon) entryIcon.value = cand.iconSrc;
        if (entryIconPreview) {
          entryIconPreview.innerHTML = `<img src="${escapeHtml(cand.iconSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
        }
        renderIconCandidates(url, scrapedIconUrl, cand.id);
      });

      iconCandidatesGrid.appendChild(card);
    });
  }

  async function autoFillUrlMetadata(force = false) {
    if (!entryUrl) return;
    const rawUrl = entryUrl.value.trim();
    if (!rawUrl || (!rawUrl.includes('.') && !rawUrl.startsWith('localhost'))) {
      if (iconCandidatesWrapper) iconCandidatesWrapper.style.display = 'none';
      return;
    }

    // Immediately render candidate options with Google HD selected by default in position 1
    renderIconCandidates(rawUrl, '', selectedCandidateId || 'google');

    if (!force && rawUrl === lastAutoDetectedUrl) {
      return;
    }

    if (isAutoDetecting) return;
    isAutoDetecting = true;
    lastAutoDetectedUrl = rawUrl;

    if (urlAutofillStatus) {
      urlAutofillStatus.className = 'url-autofill-status loading';
      urlAutofillStatus.textContent = '🪄 Detecting info…';
      urlAutofillStatus.style.display = 'inline-flex';
    }

    if (autoDetectBtn) autoDetectBtn.disabled = true;

    try {
      const meta = await fetchWebsiteMetadata(rawUrl);
      if (meta) {
        const currentName = entryName ? entryName.value.trim() : '';
        if (meta.title && (force || !currentName)) {
          if (entryName) entryName.value = meta.title;
        }

        const currentDesc = entryDescription ? entryDescription.value.trim() : '';
        if (meta.description && (force || !currentDesc)) {
          if (entryDescription) entryDescription.value = meta.description;
        }

        // Re-render candidates with any scraped high-res icon
        renderIconCandidates(rawUrl, meta.iconUrl, selectedCandidateId || 'google');

        const currentIcon = entryIcon ? entryIcon.value.trim() : '';
        if (force || !currentIcon) {
          // Google HD is default candidate in position 1
          const googleCand = getCandidateSources(rawUrl, meta.iconUrl).find(c => c.id === 'google');
          const defaultSrc = googleCand ? googleCand.iconSrc : meta.iconUrl;
          if (entryIcon) entryIcon.value = defaultSrc;
          if (entryIconPreview) {
            entryIconPreview.innerHTML = `<img src="${escapeHtml(defaultSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
          }
        }

        if (urlAutofillStatus) {
          urlAutofillStatus.className = 'url-autofill-status success';
          urlAutofillStatus.textContent = `✓ ${meta.title ? meta.title.slice(0, 24) + (meta.title.length > 24 ? '…' : '') : 'Detected'}`;
          setTimeout(() => {
            if (urlAutofillStatus.className.includes('success')) {
              urlAutofillStatus.style.display = 'none';
            }
          }, 3500);
        }
      }
    } catch {
      if (urlAutofillStatus) {
        urlAutofillStatus.style.display = 'none';
      }
    } finally {
      isAutoDetecting = false;
      if (autoDetectBtn) autoDetectBtn.disabled = false;
    }
  }

  // ── Modal ──────────────────────────────────────────────

  function openModal(id = null) {
    editingId = id;
    lastAutoDetectedUrl = '';
    selectedCandidateId = 'google';
    if (urlAutofillStatus) urlAutofillStatus.style.display = 'none';

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
      renderIconCandidates(entry.url, entry.iconUrl, 'google');
    } else {
      modalTitle.textContent = 'Add Website';
      saveBtn.textContent = 'Save';
      entryForm.reset();
      const defaultFid = activeFolderId && activeFolderId.startsWith('f-') ? activeFolderId : '';
      populateFolderSelect(defaultFid);
      selectedCategories = [];
      if (iconCandidatesWrapper) iconCandidatesWrapper.style.display = 'none';
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

  async function fetchMultiSourceBestIcon(url) {
    if (!url) return null;
    const targetUrl = ensureProtocol(url.trim());
    const domain = getDomain(targetUrl);
    if (!domain) return null;

    let origin = '';
    try {
      origin = new URL(targetUrl).origin;
    } catch {
      origin = `https://${domain}`;
    }

    const sources = [
      `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(targetUrl)}&size=128`,
      `${origin}/apple-touch-icon.png`,
      `https://logo.clearbit.com/${domain}`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`
    ];

    for (const src of sources) {
      try {
        const dataUrl = await urlToDataUrl(src);
        if (dataUrl && dataUrl.length > 250) {
          return dataUrl;
        }
      } catch {}
    }

    return null;
  }

  async function refreshEntryIcon(id, btnElement = null) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find(e => e.id === id);
    if (!entry) return;

    if (btnElement) btnElement.classList.add('is-spinning');
    showToast(`Checking for updated icon for "${entry.name}" across multiple sources...`);

    try {
      const candidateDataUrl = await fetchMultiSourceBestIcon(entry.url);

      if (candidateDataUrl && candidateDataUrl !== entry.iconUrl) {
        pendingIcons.set(id, candidateDataUrl);
        updatePendingIconsUI();
        updateCardPendingState(id);
        showToast(`New HD icon found for "${entry.name}"! Click "✓ Accept" to apply.`);
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
      if (refreshProgressLabel) refreshProgressLabel.textContent = 'Checking for updated icons in parallel across multiple sources...';
    }

    let foundCount = 0;
    const concurrency = 4; // Controlled concurrency (3-4 workers) to prevent thundering herd
    const circuitBreaker = new DomainCircuitBreaker(2);

    await runWorkerQueue(diskList, concurrency, async (entry) => {
      const domain = getDomain(ensureProtocol(entry.url));
      const candidateDataUrl = await fetchWithBackoff(async () => {
        return await fetchMultiSourceBestIcon(entry.url);
      }, {
        maxRetries: 1,
        baseDelay: 400,
        isTripped: () => circuitBreaker.isTripped(domain)
      });

      if (candidateDataUrl && candidateDataUrl !== entry.iconUrl) {
        pendingIcons.set(entry.id, candidateDataUrl);
        foundCount++;
        updatePendingIconsUI();
        updateCardPendingState(entry.id); // In-place DOM update (zero flashing!)
      }
    }, (completed, total, item, wasFastFailed) => {
      const pct = Math.round((completed / total) * 100);
      if (refreshProgressFill) refreshProgressFill.style.width = `${pct}%`;
      if (refreshProgressCount) refreshProgressCount.textContent = `${completed} / ${total} (${pct}%)`;
      if (refreshBtnLabel) refreshBtnLabel.textContent = `Checking (${pct}%)...`;
    }, circuitBreaker);

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
    } else if (activeFolderId === 'broken') {
      filtered = filtered.filter(e => e.health && e.health.status === 'broken');
    } else if (activeFolderId && activeFolderId !== 'all') {
      filtered = filtered.filter(e => e.folderId === activeFolderId);
    }

    // Sort
    filtered.sort((a, b) => {
      // Favorites pinned to top only if pinFavorites is enabled
      if (pinFavorites) {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
      }

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

  function updatePinFavoritesButtonState() {
    if (!pinFavoritesBtn) return;
    pinFavoritesBtn.classList.toggle('active', pinFavorites);
    pinFavoritesBtn.setAttribute('aria-pressed', String(pinFavorites));
    pinFavoritesBtn.title = pinFavorites
      ? 'Favorites pinned to top (Click to restore natural sort)'
      : 'Pin favorites to the top of the list';
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

    // Bento Ambient Spotlight Glow cursor tracker
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });

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
      if (e.target.closest('.folder-tag')) {
        e.stopPropagation();
        if (folder) setActiveFolder(folder.id);
        return;
      }
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

  function renderTableRow(entry) {
    const row = document.createElement('div');
    row.className = 'table-row';
    row.setAttribute('data-id', entry.id);
    row.setAttribute('draggable', 'true');

    // Drag and drop into folders
    row.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', entry.id);
      e.dataTransfer.effectAllowed = 'move';
      row.classList.add('is-dragging');
    });
    row.addEventListener('dragend', () => {
      row.classList.remove('is-dragging');
    });

    const domain = getDomain(entry.url);
    const folder = entry.folderId ? folders.find(f => f.id === entry.folderId) : null;

    row.innerHTML = `
      <div class="table-cell-fav">
        <button class="table-fav-btn ${entry.isFavorite ? 'active' : ''}" title="${entry.isFavorite ? 'Unpin from favorites' : 'Pin to favorites'}">
          ${entry.isFavorite ? '★' : '☆'}
        </button>
      </div>
      <div class="table-cell-icon">
        <div class="table-icon-frame" title="${escapeHtml(entry.name)}">
          ${entry.iconUrl
            ? `<img src="${escapeHtml(entry.iconUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span style=\\'font-size:12px;\\'>🌐</span>'">`
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
        ${entry.visitCount > 0 ? `${entry.visitCount} visit${entry.visitCount !== 1 ? 's' : ''}` : '—'}
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
    row.addEventListener('click', (e) => {
      if (e.target.closest('.folder-tag')) {
        e.stopPropagation();
        if (folder) setActiveFolder(folder.id);
        return;
      }
      if (e.target.closest('.table-fav-btn') ||
          e.target.closest('.refresh-btn') ||
          e.target.closest('.edit-btn') ||
          e.target.closest('.delete-btn')) return;
      visitEntry(entry.id);
    });

    // Favorite toggle
    row.querySelector('.table-fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(entry.id);
    });

    // Refresh icon
    const refreshBtn = row.querySelector('.refresh-btn');
    refreshBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      refreshEntryIcon(entry.id, refreshBtn);
    });

    // Edit
    row.querySelector('.edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(entry.id);
    });

    // Delete
    row.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEntry(entry.id);
    });

    return row;
  }

  function renderIconCard(entry) {
    const card = document.createElement('div');
    card.className = 'icon-card';
    card.setAttribute('data-id', entry.id);
    card.setAttribute('draggable', 'true');

    // Drag and drop into folders
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', entry.id);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('is-dragging');
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('is-dragging');
    });

    // Ambient Spotlight cursor tracker
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });

    const folder = entry.folderId ? folders.find(f => f.id === entry.folderId) : null;

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
        ${entry.iconUrl
          ? `<img src="${escapeHtml(entry.iconUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span style=\\'font-size:20px;\\'>🌐</span>'">`
          : '<span style="font-size:20px;">🌐</span>'
        }
      </div>
      <div class="icon-card-name" title="${escapeHtml(entry.name)}">
        ${folder ? `<span class="icon-card-folder-dot" style="background: ${escapeHtml(folder.color || 'var(--accent)')};" title="Folder: ${escapeHtml(folder.name)}"></span>` : ''}
        <span>${escapeHtml(entry.name)}</span>
      </div>
    `;

    // Click card → visit
    card.addEventListener('click', (e) => {
      if (e.target.closest('.icon-card-fav') ||
          e.target.closest('.edit-btn') ||
          e.target.closest('.delete-btn')) return;
      visitEntry(entry.id);
    });

    // Favorite toggle
    card.querySelector('.icon-card-fav').addEventListener('click', (e) => {
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

  function setViewMode(mode) {
    if (!['cards', 'table', 'icons'].includes(mode)) mode = 'cards';
    currentViewMode = mode;
    localStorage.setItem('app_directory_view_layout', mode);

    if (viewCardsBtn) viewCardsBtn.classList.toggle('is-active', mode === 'cards');
    if (viewTableBtn) viewTableBtn.classList.toggle('is-active', mode === 'table');
    if (viewIconsBtn) viewIconsBtn.classList.toggle('is-active', mode === 'icons');

    renderCardsOnly();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

    grid.style.display = currentViewMode === 'table' ? 'flex' : 'grid';
    grid.className = 'grid view-' + currentViewMode;
    emptyState.style.display = 'none';

    // Render items according to current view mode
    grid.innerHTML = '';

    if (currentViewMode === 'table') {
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
    } else if (currentViewMode === 'icons') {
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

  // ── Universal Browser Bookmarks Importer (Issue #15) ─────

  function decodeHtmlEntities(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#([0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }

  function normalizeUrlForDuplicateCheck(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const clean = ensureProtocol(rawUrl.trim());
    try {
      const parsed = new URL(clean);
      let path = parsed.pathname;
      if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      return `${parsed.protocol}//${parsed.host.toLowerCase()}${path}${parsed.search}${parsed.hash}`;
    } catch {
      return clean.toLowerCase().replace(/\/+$/, '');
    }
  }

  function parseNetscapeBookmarks(htmlContent, existingFolders = []) {
    const importedEntries = [];
    const newFolders = [];
    const folderStack = [];
    let pendingFolderName = null;

    // Standard root container folders across Chrome, Safari, Firefox, Edge to filter from categories
    const systemFolders = new Set([
      'bookmarks bar',
      'bookmarksbar',
      'bookmarks toolbar',
      'bookmarkstoolbar',
      'bookmarks menu',
      'bookmarksmenu',
      'favorites bar',
      'favoritesbar',
      'other bookmarks',
      'otherbookmarks',
      'other favorites',
      'otherfavorites',
      'mobile bookmarks',
      'mobilebookmarks',
      'imported',
      'bookmarks'
    ]);

    // Match tags: <H3>, <DL>, </DL>, <A>, <DD>
    const tagRegex = /<(\/?(?:H3|A|DL|DD))([^>]*)>([^<]*)/gi;
    let match;
    let lastEntry = null;

    while ((match = tagRegex.exec(htmlContent)) !== null) {
      const rawTag = match[1].toUpperCase();
      const attrs = match[2];
      const text = decodeHtmlEntities(match[3].trim());

      if (rawTag === 'H3') {
        pendingFolderName = text || 'Untitled Folder';
        // Pre-register user folder if not a root system container
        if (pendingFolderName && !systemFolders.has(pendingFolderName.toLowerCase())) {
          const existsInApp = existingFolders.some(f => f.name.toLowerCase() === pendingFolderName.toLowerCase());
          const existsInNew = newFolders.some(f => f.name.toLowerCase() === pendingFolderName.toLowerCase());
          if (!existsInApp && !existsInNew) {
            newFolders.push({
              id: generateId(),
              name: pendingFolderName,
              icon: '📁',
              color: null
            });
          }
        }
        lastEntry = null;
      } else if (rawTag === 'DL') {
        if (pendingFolderName) {
          folderStack.push(pendingFolderName);
          pendingFolderName = null;
        } else {
          folderStack.push(null);
        }
        lastEntry = null;
      } else if (rawTag === '/DL') {
        if (folderStack.length > 0) {
          folderStack.pop();
        }
        lastEntry = null;
      } else if (rawTag === 'A') {
        const hrefMatch = attrs.match(/HREF=["']([^"']+)["']/i);
        if (!hrefMatch) continue;
        const rawUrl = decodeHtmlEntities(hrefMatch[1].trim());
        if (!rawUrl || rawUrl.toLowerCase().startsWith('javascript:') || rawUrl.toLowerCase().startsWith('place:')) continue;

        const title = text || rawUrl;

        // Extract embedded Base64 ICON or external icon URI
        const iconMatch = attrs.match(/ICON(?:_URI)?=["']([^"']+)["']/i);
        let iconUrl = null;
        if (iconMatch) {
          iconUrl = iconMatch[1].trim();
        }

        // Extract ADD_DATE timestamp (seconds)
        const dateMatch = attrs.match(/ADD_DATE=["']([0-9]+)["']/i);
        let dateAdded = new Date().toISOString();
        if (dateMatch) {
          const sec = parseInt(dateMatch[1], 10);
          if (!isNaN(sec) && sec > 0) {
            dateAdded = new Date(sec * 1000).toISOString();
          }
        }

        // Extract categories from active non-system folders in hierarchy
        const activeFolderNames = folderStack.filter(f => f && !systemFolders.has(f.toLowerCase()));
        const categories = [...activeFolderNames];

        // Extract Firefox TAGS attribute (e.g. TAGS="dev,tools")
        const tagsMatch = attrs.match(/TAGS=["']([^"']+)["']/i);
        if (tagsMatch) {
          const ffTags = decodeHtmlEntities(tagsMatch[1]).split(',').map(t => t.trim()).filter(Boolean);
          ffTags.forEach(tag => {
            if (!categories.some(c => c.toLowerCase() === tag.toLowerCase())) {
              categories.push(tag);
            }
          });
        }

        // Map to immediate parent folder ID
        const immediateFolderName = [...activeFolderNames].reverse()[0] || null;
        let matchedFolderId = null;
        if (immediateFolderName) {
          const inApp = existingFolders.find(f => f.name.toLowerCase() === immediateFolderName.toLowerCase());
          if (inApp) {
            matchedFolderId = inApp.id;
          } else {
            const inNew = newFolders.find(f => f.name.toLowerCase() === immediateFolderName.toLowerCase());
            if (inNew) matchedFolderId = inNew.id;
          }
        }

        const entry = {
          id: generateId(),
          name: title,
          url: ensureProtocol(rawUrl),
          description: '',
          iconUrl: iconUrl || getFaviconUrl(rawUrl),
          folderId: matchedFolderId,
          categories: categories,
          dateAdded: dateAdded,
          dateModified: dateAdded,
          visitCount: 0,
          lastVisited: null,
          isFavorite: false
        };

        importedEntries.push(entry);
        lastEntry = entry;
      } else if (rawTag === 'DD' && lastEntry) {
        lastEntry.description = text;
      }
    }

    return { importedEntries, newFolders };
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const isHtml = (file.name && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) ||
        /<!doctype\s+netscape|<title>bookmarks|<h1[^>]*>bookmarks|<dl/i.test(content);

      if (isHtml) {
        // Universal Netscape Bookmarks HTML parser
        try {
          const { importedEntries, newFolders } = parseNetscapeBookmarks(content, folders);

          if (importedEntries.length === 0 && newFolders.length === 0) {
            showToast('No valid bookmarks found in browser export.');
            return;
          }

          // Merge new folders
          let addedFoldersCount = 0;
          if (newFolders.length > 0) {
            newFolders.forEach(nf => {
              if (!folders.some(existing => existing.name.toLowerCase() === nf.name.toLowerCase())) {
                folders.push(nf);
                addedFoldersCount++;
              }
            });
            if (addedFoldersCount > 0) {
              saveFolders(folders, false);
            }
          }

          // Merge entries: skip duplicates by normalized URL against disk storage
          const diskList = getLatestStoredEntries();
          const existingNormalizedUrls = new Set(diskList.map(item => normalizeUrlForDuplicateCheck(item.url)));
          let importedCount = 0;

          importedEntries.forEach(item => {
            const norm = normalizeUrlForDuplicateCheck(item.url);
            if (!existingNormalizedUrls.has(norm)) {
              diskList.push(item);
              existingNormalizedUrls.add(norm);
              importedCount++;
            }
          });

          saveEntries(diskList);
          renderFoldersSidebar();
          render();
          cacheExistingIconsOffline();

          const skippedCount = importedEntries.length - importedCount;
          const folderPart = addedFoldersCount > 0 ? ` and ${addedFoldersCount} folder${addedFoldersCount !== 1 ? 's' : ''}` : '';
          showToast(`Imported ${importedCount} site${importedCount !== 1 ? 's' : ''}${folderPart} from browser bookmarks (${skippedCount} duplicate${skippedCount !== 1 ? 's' : ''} skipped).`);
        } catch (err) {
          console.error('[Import] HTML Parse Error:', err);
          showToast('Error: Failed to parse browser bookmarks file.');
        }
        return;
      }

      // Standard JSON parser
      try {
        const parsed = JSON.parse(content);
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

        // Merge: skip duplicates by normalized URL against fresh disk storage
        const diskList = getLatestStoredEntries();
        const existingNormalizedUrls = new Set(diskList.map(item => normalizeUrlForDuplicateCheck(item.url)));
        let imported = 0;

        valid.forEach(item => {
          const norm = normalizeUrlForDuplicateCheck(item.url);
          if (!existingNormalizedUrls.has(norm)) {
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
            existingNormalizedUrls.add(norm);
            imported++;
          }
        });

        saveEntries(diskList);
        renderFoldersSidebar();
        render();
        cacheExistingIconsOffline();
        showToast(`Imported ${imported} new site${imported !== 1 ? 's' : ''} (${valid.length - imported} duplicate${valid.length - imported !== 1 ? 's' : ''} skipped).`);
      } catch {
        showToast('Error: Invalid JSON or bookmarks file.');
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
  const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
  if (manageCategoriesBtn) {
    manageCategoriesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (catFilterDropdown) catFilterDropdown.classList.remove('open');
      openCatModal();
    });
  }
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

  if (sortSelect) {
    sortSelect.addEventListener('change', renderCardsOnly);
  }

  if (pinFavoritesBtn) {
    updatePinFavoritesButtonState();
    pinFavoritesBtn.addEventListener('click', () => {
      pinFavorites = !pinFavorites;
      localStorage.setItem(PIN_FAVORITES_KEY, String(pinFavorites));
      updatePinFavoritesButtonState();
      renderCardsOnly();
      showToast(pinFavorites ? 'Favorites pinned to top ⭐' : 'Natural sort order restored');
    });
  }

  // View Mode Switcher (Issue #16)
  if (viewCardsBtn) {
    viewCardsBtn.addEventListener('click', () => setViewMode('cards'));
  }
  if (viewTableBtn) {
    viewTableBtn.addEventListener('click', () => setViewMode('table'));
  }
  if (viewIconsBtn) {
    viewIconsBtn.addEventListener('click', () => setViewMode('icons'));
  }

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

  // Real-time icon preview and Smart URL Auto-Fill
  let urlAutofillDebounceTimer = null;

  if (entryUrl) {
    entryUrl.addEventListener('input', () => {
      if (!entryIcon.value.trim()) {
        updateModalIconPreview();
      }
      clearTimeout(urlAutofillDebounceTimer);
      urlAutofillDebounceTimer = setTimeout(() => {
        const val = entryUrl.value.trim();
        if (val.length > 5 && (val.includes('.') || val.startsWith('localhost'))) {
          autoFillUrlMetadata(false);
        }
      }, 650);
    });

    entryUrl.addEventListener('paste', () => {
      clearTimeout(urlAutofillDebounceTimer);
      setTimeout(() => {
        autoFillUrlMetadata(false);
      }, 50);
    });

    entryUrl.addEventListener('blur', () => {
      const url = entryUrl.value.trim();
      if (url && !entryIcon.value.trim()) {
        entryIcon.setAttribute('placeholder', `Auto: ${getDomain(ensureProtocol(url))}`);
        updateModalIconPreview();
      }
      if (url && (!entryName.value.trim() || !entryDescription.value.trim())) {
        autoFillUrlMetadata(false);
      }
    });
  }

  if (autoDetectBtn) {
    autoDetectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      autoFillUrlMetadata(true);
    });
  }

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

  // ── Emoji Picker Event Listeners (Issue #27) ────────────

  if (folderIconTriggerBtn) {
    folderIconTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEmojiPicker();
    });
  }

  if (folderIconInput) {
    folderIconInput.addEventListener('input', () => {
      const val = folderIconInput.value.trim();
      if (folderIconDisplay) {
        folderIconDisplay.textContent = val || '📁';
      }
    });
  }

  if (emojiSearchInput) {
    emojiSearchInput.addEventListener('input', () => {
      const q = emojiSearchInput.value;
      if (emojiSearchClear) {
        emojiSearchClear.style.display = q ? 'inline-flex' : 'none';
      }
      renderEmojiGrid(activeEmojiCategoryId, q);
    });

    emojiSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeEmojiPicker();
      }
    });
  }

  if (emojiSearchClear) {
    emojiSearchClear.addEventListener('click', () => {
      if (emojiSearchInput) emojiSearchInput.value = '';
      emojiSearchClear.style.display = 'none';
      renderEmojiGrid(activeEmojiCategoryId, '');
      if (emojiSearchInput) emojiSearchInput.focus();
    });
  }

  if (osKeyboardHint) {
    osKeyboardHint.addEventListener('click', () => {
      closeEmojiPicker();
      if (folderIconInput) {
        folderIconInput.focus();
        folderIconInput.select();
      }
    });
  }

  if (emojiPickerPopover) {
    emojiPickerPopover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Close emoji popover when clicking outside
  document.addEventListener('click', (e) => {
    if (emojiPickerPopover && emojiPickerPopover.style.display !== 'none') {
      if (!emojiPickerPopover.contains(e.target) &&
          !folderIconTriggerBtn?.contains(e.target) &&
          !e.target.closest('.emoji-more-btn')) {
        closeEmojiPicker();
      }
    }
  });

  // ── Add Bookmarks to Folder Event Listeners ─────────────

  if (addBookmarksToFolderBtn) {
    addBookmarksToFolderBtn.addEventListener('click', openAddBookmarksModal);
  }

  if (addBookmarksModalClose) {
    addBookmarksModalClose.addEventListener('click', closeAddBookmarksModal);
  }

  if (cancelAddBmBtn) {
    cancelAddBmBtn.addEventListener('click', closeAddBookmarksModal);
  }

  if (addBookmarksModalBackdrop) {
    addBookmarksModalBackdrop.addEventListener('click', (e) => {
      if (e.target === addBookmarksModalBackdrop) closeAddBookmarksModal();
    });
  }

  if (addBmSearchInput) {
    addBmSearchInput.addEventListener('input', () => {
      addBmSearchQuery = addBmSearchInput.value.trim();
      if (addBmSearchClear) addBmSearchClear.style.display = addBmSearchQuery ? 'block' : 'none';
      renderAddBookmarksList();
    });
  }

  if (addBmSearchClear) {
    addBmSearchClear.addEventListener('click', () => {
      addBmSearchInput.value = '';
      addBmSearchQuery = '';
      addBmSearchClear.style.display = 'none';
      renderAddBookmarksList();
      addBmSearchInput.focus();
    });
  }

  if (addBmFilterPills) {
    addBmFilterPills.querySelectorAll('.pill-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addBmFilterPills.querySelectorAll('.pill-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        addBmSourceFilter = btn.getAttribute('data-source') || 'all';
        renderAddBookmarksList();
      });
    });
  }

  if (addBmSelectAllBtn) {
    addBmSelectAllBtn.addEventListener('click', () => {
      const available = getFilteredBookmarksToMove();
      available.forEach(e => selectedBookmarksToMove.add(e.id));
      renderAddBookmarksList();
    });
  }

  if (addBmDeselectAllBtn) {
    addBmDeselectAllBtn.addEventListener('click', () => {
      selectedBookmarksToMove.clear();
      renderAddBookmarksList();
    });
  }

  if (confirmAddBmBtn) {
    confirmAddBmBtn.addEventListener('click', confirmMoveBookmarksToFolder);
  }

  // ── Health Checker Event Listeners ──────────────────────

  if (healthCheckBtn) {
    healthCheckBtn.addEventListener('click', openHealthModal);
  }

  if (healthModalClose) {
    healthModalClose.addEventListener('click', closeHealthModal);
  }

  if (healthModalBackdrop) {
    healthModalBackdrop.addEventListener('click', (e) => {
      if (e.target === healthModalBackdrop) closeHealthModal();
    });
  }

  if (healthStopBtn) {
    healthStopBtn.addEventListener('click', stopHealthScan);
  }

  if (healthScanAllBtn) {
    healthScanAllBtn.addEventListener('click', () => startHealthScan(false));
  }

  if (healthScanBrokenBtn) {
    healthScanBrokenBtn.addEventListener('click', () => startHealthScan(true));
  }

  if (healthSearchInput) {
    healthSearchInput.addEventListener('input', () => {
      healthSearchQuery = healthSearchInput.value.trim();
      if (healthSearchClear) healthSearchClear.style.display = healthSearchQuery ? 'block' : 'none';
      renderHealthModalList();
    });
  }

  if (healthSearchClear) {
    healthSearchClear.addEventListener('click', () => {
      healthSearchInput.value = '';
      healthSearchQuery = '';
      healthSearchClear.style.display = 'none';
      renderHealthModalList();
      healthSearchInput.focus();
    });
  }

  if (healthFilterPills) {
    healthFilterPills.querySelectorAll('.pill-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        healthFilterPills.querySelectorAll('.pill-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        healthFilter = btn.getAttribute('data-health') || 'all';
        renderHealthModalList();
      });
    });
  }

  // ── Header Logo Reset ──────────────────────────────────
  function resetToAllBookmarks() {
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';
    selectedFilterCategories.clear();
    const catCheckboxes = document.querySelectorAll('.cat-filter-checkbox');
    catCheckboxes.forEach(cb => { cb.checked = false; });
    const catSearch = document.getElementById('catFilterSearchInput');
    if (catSearch) catSearch.value = '';
    updateCatFilterLabel();
    setActiveFolder('all');
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (headerLogo) {
    headerLogo.addEventListener('click', (e) => {
      e.preventDefault();
      resetToAllBookmarks();
    });
  }

  // ── Spotlight Command Palette (Ctrl+K / Cmd+K) ─────────

  const commandPaletteBackdrop = document.getElementById('commandPaletteBackdrop');
  const commandPaletteModal = document.getElementById('commandPaletteModal');
  const commandPaletteInput = document.getElementById('commandPaletteInput');
  const commandPaletteClearBtn = document.getElementById('commandPaletteClearBtn');
  const commandPaletteEscBadge = document.getElementById('commandPaletteEscBadge');
  const commandPaletteResults = document.getElementById('commandPaletteResults');
  const paletteMatchCount = document.getElementById('paletteMatchCount');
  const cmdPaletteTrigger = document.getElementById('cmdPaletteTrigger');
  const cmdPaletteKbdLabel = document.getElementById('cmdPaletteKbdLabel');

  let isCommandPaletteOpen = false;
  let paletteSelectedIndex = 0;
  let paletteFlatItems = [];

  // Detect OS for shortcut label (⌘K on Mac, Ctrl+K on Windows/Linux)
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');
  if (cmdPaletteKbdLabel) {
    cmdPaletteKbdLabel.textContent = isMac ? '⌘K' : 'Ctrl+K';
  }

  function getCommandPaletteActions() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    return [
      {
        id: 'action-add',
        type: 'action',
        title: 'Add Website',
        subtitle: 'Save a new bookmark with title, URL, tags & icon',
        icon: '➕',
        badge: 'Action',
        keywords: ['add', 'new', 'create', 'bookmark', 'website', 'url'],
        run: () => openModal()
      },
      {
        id: 'action-theme-toggle',
        type: 'action',
        title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        subtitle: isDark ? 'Toggle light appearance' : 'Toggle dark appearance',
        icon: isDark ? '☀️' : '🌙',
        badge: 'Theme',
        keywords: ['theme', 'dark', 'light', 'mode', 'color', 'appearance'],
        run: () => toggleTheme()
      },
      {
        id: 'action-theme-customizer',
        type: 'action',
        title: 'Customize Theme & Colors',
        subtitle: 'Edit palettes, accent colors, modal surfaces & tag styles',
        icon: '🎨',
        badge: 'Theme',
        keywords: ['theme', 'customizer', 'palette', 'colors', 'accent', 'personalize'],
        run: () => openThemeModal()
      },
      {
        id: 'action-refresh-icons',
        type: 'action',
        title: 'Refresh All Icons',
        subtitle: 'Batch update website favicons using multi-source HD resolver',
        icon: '🔄',
        badge: 'Action',
        keywords: ['refresh', 'icon', 'favicon', 'logo', 'update'],
        run: () => refreshAllIcons()
      },
      {
        id: 'action-health-check',
        type: 'action',
        title: 'Check Website Health & Broken Links',
        subtitle: 'Probe all saved bookmarks for 404s, timeouts, or dead links',
        icon: '🏥',
        badge: 'Health',
        keywords: ['health', 'broken', 'dead', 'links', 'check', 'status', '404'],
        run: () => openHealthModal()
      },
      {
        id: 'action-export-backup',
        type: 'action',
        title: 'Export JSON Backup',
        subtitle: 'Save directory backup directly to your exports folder',
        icon: '💾',
        badge: 'Backup',
        keywords: ['export', 'backup', 'save', 'json', 'download'],
        run: () => exportData()
      },
      {
        id: 'action-import-backup',
        type: 'action',
        title: 'Import Bookmarks',
        subtitle: 'Import from JSON backup or browser bookmarks.html (Chrome, Firefox, Safari, Edge)',
        icon: '📥',
        badge: 'Import',
        keywords: ['import', 'restore', 'load', 'json', 'html', 'browser', 'chrome', 'firefox', 'safari', 'edge', 'bookmarks'],
        run: () => importFile && importFile.click()
      },
      {
        id: 'action-manage-categories',
        type: 'action',
        title: 'Manage Categories & Colors',
        subtitle: 'Rename, recolor, delete, or organize your categories',
        icon: '🏷️',
        badge: 'Categories',
        keywords: ['category', 'categories', 'tags', 'colors', 'manage'],
        run: () => openCatModal()
      },
      {
        id: 'action-pin-favorites',
        type: 'action',
        title: pinFavorites ? 'Unpin Favorites from Top' : 'Pin Favorites to Top',
        subtitle: pinFavorites ? 'Restore natural chronological order' : 'Bring all starred favorites to the top',
        icon: '⭐',
        badge: 'Sort',
        keywords: ['favorite', 'favorites', 'pin', 'star', 'top', 'sort'],
        run: () => {
          pinFavorites = !pinFavorites;
          localStorage.setItem(PIN_FAVORITES_KEY, String(pinFavorites));
          updatePinFavoritesButtonState();
          renderCardsOnly();
          showToast(pinFavorites ? 'Favorites pinned to top ⭐' : 'Natural sort order restored');
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
        run: () => setViewMode('cards')
      },
      {
        id: 'action-view-table',
        type: 'action',
        title: 'Switch to Compact Table View',
        subtitle: 'High-density tabular rows for fast scanning and power users',
        icon: '📋',
        badge: 'Layout',
        keywords: ['view', 'layout', 'table', 'list', 'compact', 'rows'],
        run: () => setViewMode('table')
      },
      {
        id: 'action-view-icons',
        type: 'action',
        title: 'Switch to Minimal Icon Grid',
        subtitle: 'Speed Dial / app launcher style with large squircle icons',
        icon: '📱',
        badge: 'Layout',
        keywords: ['view', 'layout', 'icons', 'speed dial', 'minimal', 'launcher'],
        run: () => setViewMode('icons')
      }
    ];
  }

  function getCommandPaletteFolders() {
    const list = [
      {
        id: 'folder-all',
        type: 'folder',
        title: 'All Bookmarks',
        subtitle: `View all ${entries.length} saved bookmarks`,
        icon: '📁',
        badge: 'View',
        keywords: ['all', 'bookmarks', 'library'],
        run: () => setActiveFolder('all')
      },
      {
        id: 'folder-favorites',
        type: 'folder',
        title: 'Favorites',
        subtitle: `View your starred favorites (${entries.filter(e => e.isFavorite).length})`,
        icon: '⭐',
        badge: 'View',
        keywords: ['favorite', 'favorites', 'starred'],
        run: () => setActiveFolder('favorites')
      },
      {
        id: 'folder-unorganized',
        type: 'folder',
        title: 'Unorganized',
        subtitle: `Bookmarks not in any collection (${entries.filter(e => !e.folderId).length})`,
        icon: '📂',
        badge: 'View',
        keywords: ['unorganized', 'inbox', 'unsorted'],
        run: () => setActiveFolder('unorganized')
      }
    ];

    const brokenCount = entries.filter(e => e.health && e.health.status === 'broken').length;
    if (brokenCount > 0) {
      list.push({
        id: 'folder-broken',
        type: 'folder',
        title: 'Broken Links',
        subtitle: `${brokenCount} unreachable or dead links found`,
        icon: '⚠️',
        badge: 'Health',
        keywords: ['broken', 'dead', 'offline', 'error'],
        run: () => setActiveFolder('broken')
      });
    }

    folders.forEach(f => {
      const count = entries.filter(e => e.folderId === f.id).length;
      list.push({
        id: `folder-${f.id}`,
        type: 'folder',
        title: f.name,
        subtitle: `Collection • ${count} site${count !== 1 ? 's' : ''}`,
        icon: f.icon || '📁',
        badge: 'Collection',
        color: f.color,
        keywords: ['folder', 'collection', f.name.toLowerCase()],
        run: () => setActiveFolder(f.id)
      });
    });

    return list;
  }

  function getCommandPaletteBookmarks(query) {
    if (!query) {
      return entries
        .slice()
        .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0) || new Date(b.dateAdded) - new Date(a.dateAdded))
        .slice(0, 6)
        .map(entry => createBookmarkPaletteItem(entry, 'Frequent'));
    }

    const q = query.toLowerCase().trim();
    const matched = [];

    for (const entry of entries) {
      const nameMatch = entry.name.toLowerCase().includes(q);
      const urlMatch = entry.url.toLowerCase().includes(q);
      const descMatch = (entry.description || '').toLowerCase().includes(q);
      const catMatch = (entry.categories || []).some(c => c.toLowerCase().includes(q));

      if (nameMatch || urlMatch || descMatch || catMatch) {
        matched.push(createBookmarkPaletteItem(entry, 'Bookmark'));
      }
    }

    return matched;
  }

  function createBookmarkPaletteItem(entry, badgeLabel) {
    const domain = getDomain(entry.url);
    const folder = entry.folderId ? folders.find(f => f.id === entry.folderId) : null;
    return {
      id: `bookmark-${entry.id}`,
      type: 'bookmark',
      title: entry.name,
      subtitle: `${domain}${entry.description ? ` • ${entry.description}` : ''}`,
      iconUrl: entry.iconUrl,
      badge: folder ? folder.name : badgeLabel,
      color: folder ? folder.color : null,
      run: () => visitEntry(entry.id)
    };
  }

  function openCommandPalette() {
    if (!commandPaletteBackdrop || !commandPaletteInput) return;
    isCommandPaletteOpen = true;
    commandPaletteBackdrop.style.display = 'flex';
    commandPaletteInput.value = '';
    if (commandPaletteClearBtn) commandPaletteClearBtn.style.display = 'none';
    paletteSelectedIndex = 0;
    renderCommandPaletteResults('');
    setTimeout(() => {
      commandPaletteInput.focus();
    }, 40);
  }

  function closeCommandPalette() {
    if (!commandPaletteBackdrop) return;
    isCommandPaletteOpen = false;
    commandPaletteBackdrop.style.display = 'none';
  }

  function toggleCommandPalette() {
    if (isCommandPaletteOpen) {
      closeCommandPalette();
    } else {
      openCommandPalette();
    }
  }

  function updatePaletteSelection() {
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

  function renderCommandPaletteResults(rawQuery) {
    if (!commandPaletteResults) return;
    const query = (rawQuery || '').trim().toLowerCase();
    paletteFlatItems = [];

    const allActions = getCommandPaletteActions();
    const allFolders = getCommandPaletteFolders();
    const bookmarks = getCommandPaletteBookmarks(query);

    let filteredActions = [];
    let filteredFolders = [];

    if (!query) {
      filteredActions = allActions;
      filteredFolders = allFolders;
    } else {
      filteredActions = allActions.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.subtitle.toLowerCase().includes(query) ||
        (a.keywords && a.keywords.some(k => k.includes(query)))
      );
      filteredFolders = allFolders.filter(f =>
        f.title.toLowerCase().includes(query) ||
        f.subtitle.toLowerCase().includes(query) ||
        (f.keywords && f.keywords.some(k => k.includes(query)))
      );
    }

    commandPaletteResults.innerHTML = '';

    const sections = [];
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
          : `<div class="palette-item-icon" ${item.color ? `style="border-color: ${escapeHtml(item.color)};"` : ''}>${escapeHtml(item.icon || '⚡')}</div>`;

        row.innerHTML = `
          ${iconHtml}
          <div class="palette-item-content">
            <div class="palette-item-title-row">
              <span class="palette-item-title">${escapeHtml(item.title)}</span>
            </div>
            <span class="palette-item-subtitle">${escapeHtml(item.subtitle)}</span>
          </div>
          <div class="palette-item-meta">
            ${item.badge ? `<span class="palette-item-badge" ${item.color ? `style="color: ${escapeHtml(item.color)}; border-color: color-mix(in srgb, ${escapeHtml(item.color)} 35%, transparent);"` : ''}>${escapeHtml(item.badge)}</span>` : ''}
            <span class="palette-item-action-hint">${item.type === 'bookmark' ? 'Open ↵' : 'Select ↵'}</span>
          </div>
        `;

        row.addEventListener('mouseenter', () => {
          paletteSelectedIndex = itemIdx;
          updatePaletteSelection();
        });

        row.addEventListener('click', () => {
          closeCommandPalette();
          if (item.run) item.run();
        });

        secEl.appendChild(row);
      });

      commandPaletteResults.appendChild(secEl);
    });

    if (paletteMatchCount) {
      paletteMatchCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }

    if (paletteSelectedIndex >= paletteFlatItems.length) {
      paletteSelectedIndex = 0;
    }
    updatePaletteSelection();
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl+K / Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      toggleCommandPalette();
      return;
    }

    // '/' when not in input
    if (e.key === '/' && !isCommandPaletteOpen) {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        openCommandPalette();
        return;
      }
    }

    // Inside Command Palette
    if (isCommandPaletteOpen) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCommandPalette();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (paletteFlatItems.length > 0) {
          paletteSelectedIndex = (paletteSelectedIndex + 1) % paletteFlatItems.length;
          updatePaletteSelection();
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (paletteFlatItems.length > 0) {
          paletteSelectedIndex = (paletteSelectedIndex - 1 + paletteFlatItems.length) % paletteFlatItems.length;
          updatePaletteSelection();
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (paletteFlatItems.length > 0 && paletteFlatItems[paletteSelectedIndex]) {
          const item = paletteFlatItems[paletteSelectedIndex];
          closeCommandPalette();
          if (item.run) item.run();
        }
        return;
      }
    }
  });

  if (commandPaletteInput) {
    commandPaletteInput.addEventListener('input', () => {
      if (commandPaletteClearBtn) {
        commandPaletteClearBtn.style.display = commandPaletteInput.value.trim() ? 'flex' : 'none';
      }
      paletteSelectedIndex = 0;
      renderCommandPaletteResults(commandPaletteInput.value);
    });
  }

  if (commandPaletteClearBtn) {
    commandPaletteClearBtn.addEventListener('click', () => {
      commandPaletteInput.value = '';
      commandPaletteClearBtn.style.display = 'none';
      paletteSelectedIndex = 0;
      renderCommandPaletteResults('');
      commandPaletteInput.focus();
    });
  }

  if (commandPaletteEscBadge) {
    commandPaletteEscBadge.addEventListener('click', closeCommandPalette);
  }

  if (commandPaletteBackdrop) {
    commandPaletteBackdrop.addEventListener('click', (e) => {
      if (e.target === commandPaletteBackdrop) closeCommandPalette();
    });
  }

  if (cmdPaletteTrigger) {
    cmdPaletteTrigger.addEventListener('click', openCommandPalette);
  }

  // ── Initialize ─────────────────────────────────────────

  initTheme();
  initSidebar();
  updateModeToggleUI();
  setViewMode(currentViewMode);
  loadFolders();
  loadEntries();
  render();
  cacheExistingIconsOffline();

})();
