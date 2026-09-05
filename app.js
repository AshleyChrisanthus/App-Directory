"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/core/constants.ts
  var STORAGE_KEY = "appDirectory_entries";
  var THEME_KEY = "appDirectory_theme";
  var STORAGE_FOLDERS_KEY = "appDirectory_folders";
  var SIDEBAR_STATE_KEY = "appDirectory_sidebarCollapsed";
  var FILTER_MODE_KEY = "app_directory_cat_filter_mode";
  var PIN_FAVORITES_KEY = "appDirectory_pinFavorites";
  var INSIGHTS_STATE_KEY = "app_directory_insights_open";
  var ACTIVE_PRESET_KEY = "appDirectory_activePreset";
  var CUSTOM_THEME_KEY = "appDirectory_customTheme";
  var CAT_COLORS_KEY = "appDirectory_categoryColors";
  var VIEW_LAYOUT_KEY = "app_directory_view_layout";
  var DEFAULT_CATEGORIES = [
    "Development",
    "Social",
    "News",
    "Entertainment",
    "Productivity",
    "Other"
  ];
  var DEFAULT_FOLDERS = [
    { id: "f-work", name: "Work", icon: "\u{1F4BC}", color: "#0a84ff", dateAdded: "2026-01-01T00:00:00.000Z" },
    { id: "f-personal", name: "Personal", icon: "\u{1F3E0}", color: "#10b981", dateAdded: "2026-01-01T00:00:00.000Z" },
    { id: "f-research", name: "Research", icon: "\u{1F52C}", color: "#88c0d0", dateAdded: "2026-01-01T00:00:00.000Z" }
  ];
  var KNOWN_APP_ICONS = [
    {
      test: (url) => /notebook(lm)?\.google\.com|google\.com\/notebooklm/i.test(url),
      icon: "https://notebooklm.google.com/_/static/branding/v4/dark_mode/favicon/apple-touch-icon.png"
    },
    {
      test: (url) => /gemini\.google\.com|bard\.google\.com/i.test(url),
      icon: "https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg"
    },
    {
      test: (url) => /drive\.google\.com/i.test(url),
      icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png"
    },
    {
      test: (url) => /docs\.google\.com\/(document|d\/)/i.test(url),
      icon: "https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico"
    },
    {
      test: (url) => /sheets\.google\.com|docs\.google\.com\/spreadsheets/i.test(url),
      icon: "https://ssl.gstatic.com/docs/spreadsheets/images/favicon_table_auto_sized.ico"
    },
    {
      test: (url) => /slides\.google\.com|docs\.google\.com\/presentation/i.test(url),
      icon: "https://ssl.gstatic.com/docs/presentations/images/favicon_show_auto_sized.ico"
    },
    {
      test: (url) => /keep\.google\.com/i.test(url),
      icon: "https://ssl.gstatic.com/keep/keep_2020q4v2.ico"
    },
    {
      test: (url) => /colab\.research\.google\.com/i.test(url),
      icon: "https://colab.research.google.com/img/favicon.ico"
    },
    {
      test: (url) => /meet\.google\.com/i.test(url),
      icon: "https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png"
    },
    {
      test: (url) => /mail\.google\.com/i.test(url),
      icon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
    },
    {
      test: (url) => /calendar\.google\.com/i.test(url),
      icon: "https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31.ico"
    },
    {
      test: (url) => /music\.youtube\.com/i.test(url),
      icon: "https://music.youtube.com/img/favicon_144.png"
    },
    {
      test: (url) => /photos\.google\.com/i.test(url),
      icon: "https://ssl.gstatic.com/social/photosui/images/logo/1x/photos_96dp.png"
    },
    {
      test: (url) => /maps\.google\.com/i.test(url),
      icon: "https://maps.gstatic.com/mapfiles/maps_lite/pwa/icons/pwa_icon_192.png"
    },
    {
      test: (url) => /chatgpt\.com|chat\.openai\.com/i.test(url),
      icon: "https://chatgpt.com/favicon.ico"
    },
    {
      test: (url) => /claude\.ai/i.test(url),
      icon: "https://claude.ai/favicon.ico"
    },
    {
      test: (url) => /github\.com/i.test(url),
      icon: "https://github.githubassets.com/favicons/favicon.svg"
    }
  ];

  // src/core/state.ts
  var AppState = class {
    constructor() {
      __publicField(this, "entries", []);
      __publicField(this, "folders", [...DEFAULT_FOLDERS]);
      __publicField(this, "activeFolderId", "all");
      __publicField(this, "editingFolderId", null);
      __publicField(this, "editingId", null);
      __publicField(this, "selectedCategories", []);
      __publicField(this, "selectedFilterCategories", /* @__PURE__ */ new Set());
      __publicField(this, "catFilterMode", localStorage.getItem(FILTER_MODE_KEY) || "union");
      __publicField(this, "pinFavorites", localStorage.getItem(PIN_FAVORITES_KEY) === "true");
      __publicField(this, "isInsightsOpen", localStorage.getItem(INSIGHTS_STATE_KEY) === "true");
      __publicField(this, "pendingIcons", /* @__PURE__ */ new Map());
      __publicField(this, "currentViewMode", localStorage.getItem(VIEW_LAYOUT_KEY) || "cards");
      __publicField(this, "customThemeColors", {});
      __publicField(this, "categoryColors", {});
      __publicField(this, "activeThemePreset", localStorage.getItem(ACTIVE_PRESET_KEY) || "default");
    }
  };
  var state = new AppState();

  // src/core/idb.ts
  var IDB_DB_NAME = "app_directory_db";
  var IDB_VERSION = 2;
  var STORE_ENTRIES = "entries";
  var STORE_FOLDERS = "folders";
  var STORE_HANDLES = "handles";
  var dbInstance = null;
  var dbOpeningPromise = null;
  function openAppDB() {
    if (dbInstance) {
      return Promise.resolve(dbInstance);
    }
    if (dbOpeningPromise) {
      return dbOpeningPromise;
    }
    dbOpeningPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        return reject(new Error("IndexedDB is not supported in this environment"));
      }
      const req = indexedDB.open(IDB_DB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_HANDLES)) {
          db.createObjectStore(STORE_HANDLES);
        }
        if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
          db.createObjectStore(STORE_ENTRIES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
          db.createObjectStore(STORE_FOLDERS, { keyPath: "id" });
        }
      };
      req.onsuccess = () => {
        dbInstance = req.result;
        dbOpeningPromise = null;
        dbInstance.onversionchange = () => {
          dbInstance?.close();
          dbInstance = null;
        };
        resolve(dbInstance);
      };
      req.onerror = () => {
        dbOpeningPromise = null;
        reject(req.error);
      };
      req.onblocked = () => {
        console.warn("[IndexedDB] Database upgrade blocked by another tab");
      };
    });
    return dbOpeningPromise;
  }
  async function idbGetAllEntries() {
    const db = await openAppDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, "readonly");
      const store = tx.objectStore(STORE_ENTRIES);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbSetAllEntries(entries) {
    const db = await openAppDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ENTRIES, "readwrite");
      const store = tx.objectStore(STORE_ENTRIES);
      store.clear();
      for (const entry of entries) {
        if (entry) {
          if (!entry.id) {
            entry.id = "entry_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
          }
          store.put(entry);
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  async function idbGetAllFolders() {
    const db = await openAppDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FOLDERS, "readonly");
      const store = tx.objectStore(STORE_FOLDERS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbSetAllFolders(folders) {
    const db = await openAppDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FOLDERS, "readwrite");
      const store = tx.objectStore(STORE_FOLDERS);
      store.clear();
      for (const folder of folders) {
        if (folder) {
          if (!folder.id) {
            folder.id = "folder_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
          }
          store.put(folder);
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  async function idbGetHandle(key) {
    try {
      const db = await openAppDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_HANDLES, "readonly");
        const store = tx.objectStore(STORE_HANDLES);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }
  async function idbSaveHandle(key, handle) {
    try {
      const db = await openAppDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_HANDLES, "readwrite");
        const store = tx.objectStore(STORE_HANDLES);
        const req = store.put(handle, key);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }

  // src/core/storage.ts
  var MIGRATED_FLAG_KEY = "appDirectory_idb_migrated";
  var broadcastChannel = null;
  try {
    if (typeof BroadcastChannel !== "undefined") {
      broadcastChannel = new BroadcastChannel("app_directory_sync_v1");
    }
  } catch (_) {
  }
  function notifyOtherTabs(type = "SYNC_DATA") {
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ type });
      } catch (_) {
      }
    }
  }
  function onBroadcastMessage(handler) {
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data) {
          handler(event.data);
        }
      };
    }
  }
  function migrateEntry(entry) {
    if (!entry) return null;
    if (!entry.id) {
      entry.id = "entry_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
    }
    if (!entry.categories) {
      if (entry.category && typeof entry.category === "string") {
        entry.categories = [entry.category.trim()];
      } else {
        entry.categories = [];
      }
    }
    delete entry.category;
    if (entry.iconUrl || entry.icon) {
      entry.iconUrl = entry.iconUrl || entry.icon;
      if (entry.icon && (entry.icon === entry.iconUrl || !entry.customIcon)) {
        delete entry.icon;
      }
    }
    return entry;
  }
  function getLatestStoredEntries() {
    if (state.entries && state.entries.length > 0) {
      return [...state.entries];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          return list.map(migrateEntry).filter(Boolean);
        }
      }
    } catch (_) {
    }
    return [...state.entries || []];
  }
  async function initStorage() {
    try {
      await openAppDB();
      let entries = await idbGetAllEntries();
      let folders = await idbGetAllFolders();
      const alreadyMigrated = localStorage.getItem(MIGRATED_FLAG_KEY) === "true";
      if (entries.length === 0 && !alreadyMigrated) {
        try {
          const rawEntries = localStorage.getItem(STORAGE_KEY);
          if (rawEntries) {
            const parsed = JSON.parse(rawEntries);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const migrated = parsed.map(migrateEntry).filter(Boolean);
              if (migrated.length > 0) {
                await idbSetAllEntries(migrated);
                entries = migrated;
                console.log(`[Storage] Auto-migrated ${entries.length} entries from localStorage to IndexedDB.`);
              }
            }
          }
        } catch (err) {
          console.warn("[Storage] Error reading localStorage during entries migration:", err);
        }
      }
      if (folders.length === 0) {
        try {
          const rawFolders = localStorage.getItem(STORAGE_FOLDERS_KEY);
          if (rawFolders) {
            const parsed = JSON.parse(rawFolders);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await idbSetAllFolders(parsed);
              folders = parsed;
              console.log(`[Storage] Auto-migrated ${folders.length} folders from localStorage to IndexedDB.`);
            }
          }
        } catch (err) {
          console.warn("[Storage] Error reading localStorage during folders migration:", err);
        }
        if (folders.length === 0) {
          folders = [...DEFAULT_FOLDERS];
          await idbSetAllFolders(folders);
        }
      }
      if (!alreadyMigrated && (entries.length > 0 || folders.length > 0)) {
        try {
          localStorage.setItem(MIGRATED_FLAG_KEY, "true");
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_FOLDERS_KEY);
        } catch (_) {
        }
      }
      state.entries = entries;
      state.folders = folders;
    } catch (err) {
      console.error("[Storage] IndexedDB initialization failed, falling back to localStorage:", err);
      loadFallbackFromLocalStorage();
    }
  }
  function loadFallbackFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      state.entries = Array.isArray(list) ? list.map(migrateEntry).filter(Boolean) : [];
    } catch {
      state.entries = [];
    }
    try {
      const rawF = localStorage.getItem(STORAGE_FOLDERS_KEY);
      const fList = rawF ? JSON.parse(rawF) : null;
      state.folders = Array.isArray(fList) && fList.length > 0 ? fList : [...DEFAULT_FOLDERS];
    } catch {
      state.folders = [...DEFAULT_FOLDERS];
    }
  }
  async function reloadFromStorage() {
    try {
      const [entries, folders] = await Promise.all([idbGetAllEntries(), idbGetAllFolders()]);
      state.entries = entries;
      if (folders && folders.length > 0) {
        state.folders = folders;
      }
    } catch (err) {
      console.warn("[Storage] Failed to reload from IndexedDB:", err);
    }
  }
  function saveEntries(targetList = null) {
    if (targetList) {
      state.entries = targetList;
    } else if (!state.entries) {
      state.entries = [];
    }
    return idbSetAllEntries(state.entries).then(() => {
      notifyOtherTabs("SYNC_DATA");
    }).catch((err) => {
      console.error("[Storage] Failed to save entries to IndexedDB:", err);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
      } catch (_) {
      }
    });
  }
  function saveFolders(data = state.folders, notify = true) {
    state.folders = data;
    return idbSetAllFolders(state.folders).then(() => {
      if (notify) notifyOtherTabs("SYNC_DATA");
    }).catch((err) => {
      console.error("[Storage] Failed to save folders to IndexedDB:", err);
      try {
        localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(state.folders));
      } catch (_) {
      }
    });
  }

  // src/utils/dom.ts
  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function showToast(message, duration = 3e3) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }
  function generateId() {
    return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : r & 3 | 8).toString(16);
    });
  }
  function formatDate(iso) {
    if (!iso) return "\u2014";
    const d = new Date(iso);
    return d.toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  function formatDateFull(iso) {
    if (!iso) return "\u2014";
    const d = new Date(iso);
    return d.toLocaleDateString(void 0, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 6e4);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(iso);
  }
  function ensureProtocol(url) {
    if (!url) return "";
    let clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = "https://" + clean;
    }
    return clean;
  }
  function getDomain(url) {
    if (!url) return "";
    try {
      return new URL(ensureProtocol(url)).hostname;
    } catch {
      return url;
    }
  }
  function getFaviconUrl(url) {
    if (!url) return "";
    try {
      const full = ensureProtocol(url);
      for (const entry of KNOWN_APP_ICONS) {
        if (entry.test(full)) {
          return entry.icon;
        }
      }
      return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
        full
      )}&size=128`;
    } catch {
      return "";
    }
  }

  // src/modules/theme/presets.ts
  var THEME_PRESETS = [
    {
      id: "default",
      name: "Modern Apple",
      desc: "Clean porcelain slate & sleek dark glassmorphism",
      dark: {
        "--bg-primary": "#0d0d0f",
        "--bg-secondary": "#1c1c1e",
        "--card-bg": "#1c1c1e",
        "--bg-hover": "#3a3a3c",
        "--text-primary": "#f5f5f7",
        "--text-secondary": "#a1a1a6",
        "--border-light": "#2c2c2e",
        "--accent": "#0a84ff",
        "--accent-hover": "#409cff",
        "--tag-bg": "rgba(10,132,255,0.15)",
        "--tag-text": "#0a84ff"
      },
      light: {
        "--bg-primary": "#f5f5f7",
        "--bg-secondary": "#ffffff",
        "--card-bg": "#ffffff",
        "--bg-hover": "#e8e8ec",
        "--text-primary": "#1d1d1f",
        "--text-secondary": "#6e6e73",
        "--border-light": "#e5e5ea",
        "--accent": "#0071e3",
        "--accent-hover": "#0077ed",
        "--tag-bg": "rgba(0,113,227,0.1)",
        "--tag-text": "#0071e3"
      },
      swatches: {
        dark: ["#0d0d0f", "#1c1c1e", "#0a84ff", "#f5f5f7"],
        light: ["#f5f5f7", "#ffffff", "#0071e3", "#1d1d1f"]
      }
    },
    {
      id: "midnight-sapphire",
      name: "Ocean Sapphire",
      desc: "Deep navy obsidian & crisp polar azure",
      dark: {
        "--bg-primary": "#0b1329",
        "--bg-secondary": "#111c44",
        "--card-bg": "#152259",
        "--bg-hover": "#1e2f75",
        "--text-primary": "#f0f9ff",
        "--text-secondary": "#94a3b8",
        "--border-light": "#1e293b",
        "--accent": "#38bdf8",
        "--accent-hover": "#7dd3fc",
        "--tag-bg": "rgba(56,189,248,0.15)",
        "--tag-text": "#38bdf8"
      },
      light: {
        "--bg-primary": "#f0f7ff",
        "--bg-secondary": "#ffffff",
        "--card-bg": "#ffffff",
        "--bg-hover": "#e0f0fe",
        "--text-primary": "#0c2744",
        "--text-secondary": "#486581",
        "--border-light": "#d0e5f9",
        "--accent": "#0284c7",
        "--accent-hover": "#0369a1",
        "--tag-bg": "rgba(2,132,199,0.12)",
        "--tag-text": "#0284c7"
      },
      swatches: {
        dark: ["#0b1329", "#152259", "#38bdf8", "#f0f9ff"],
        light: ["#f0f7ff", "#ffffff", "#0284c7", "#0c2744"]
      }
    },
    {
      id: "cyberpunk-neon",
      name: "Cyberpunk Neon",
      desc: "Onyx night & vivid fuchsia / magenta",
      dark: {
        "--bg-primary": "#09090b",
        "--bg-secondary": "#18181b",
        "--card-bg": "#18181b",
        "--bg-hover": "#27272a",
        "--text-primary": "#fafafa",
        "--text-secondary": "#a1a1aa",
        "--border-light": "#27272a",
        "--accent": "#ec4899",
        "--accent-hover": "#f472b6",
        "--tag-bg": "rgba(236,72,153,0.18)",
        "--tag-text": "#f472b6"
      },
      light: {
        "--bg-primary": "#fdf4f8",
        "--bg-secondary": "#ffffff",
        "--card-bg": "#ffffff",
        "--bg-hover": "#fce7f3",
        "--text-primary": "#3f0c2c",
        "--text-secondary": "#831843",
        "--border-light": "#fbcfe8",
        "--accent": "#db2777",
        "--accent-hover": "#be185d",
        "--tag-bg": "rgba(219,39,119,0.12)",
        "--tag-text": "#db2777"
      },
      swatches: {
        dark: ["#09090b", "#18181b", "#ec4899", "#fafafa"],
        light: ["#fdf4f8", "#ffffff", "#db2777", "#3f0c2c"]
      }
    },
    {
      id: "emerald-forest",
      name: "Emerald Forest",
      desc: "Deep pine woods & fresh botanical sage",
      dark: {
        "--bg-primary": "#041c14",
        "--bg-secondary": "#062c20",
        "--card-bg": "#0b3b2c",
        "--bg-hover": "#124e3c",
        "--text-primary": "#ecfdf5",
        "--text-secondary": "#a7f3d0",
        "--border-light": "#064e3b",
        "--accent": "#10b981",
        "--accent-hover": "#34d399",
        "--tag-bg": "rgba(16,185,129,0.18)",
        "--tag-text": "#34d399"
      },
      light: {
        "--bg-primary": "#f0fdf4",
        "--bg-secondary": "#ffffff",
        "--card-bg": "#ffffff",
        "--bg-hover": "#dcfce7",
        "--text-primary": "#064e3b",
        "--text-secondary": "#047857",
        "--border-light": "#bbf7d0",
        "--accent": "#059669",
        "--accent-hover": "#047857",
        "--tag-bg": "rgba(5,150,105,0.12)",
        "--tag-text": "#059669"
      },
      swatches: {
        dark: ["#041c14", "#0b3b2c", "#10b981", "#ecfdf5"],
        light: ["#f0fdf4", "#ffffff", "#059669", "#064e3b"]
      }
    },
    {
      id: "sunset-amber",
      name: "Sunset Amber",
      desc: "Volcanic charcoal & warm coral sand",
      dark: {
        "--bg-primary": "#1c1917",
        "--bg-secondary": "#292524",
        "--card-bg": "#292524",
        "--bg-hover": "#44403c",
        "--text-primary": "#fafaf9",
        "--text-secondary": "#a8a29e",
        "--border-light": "#44403c",
        "--accent": "#f97316",
        "--accent-hover": "#fb923c",
        "--tag-bg": "rgba(249,115,22,0.18)",
        "--tag-text": "#fb923c"
      },
      light: {
        "--bg-primary": "#fff7ed",
        "--bg-secondary": "#ffffff",
        "--card-bg": "#ffffff",
        "--bg-hover": "#ffedd5",
        "--text-primary": "#431407",
        "--text-secondary": "#9a3412",
        "--border-light": "#fed7aa",
        "--accent": "#ea580c",
        "--accent-hover": "#c2410c",
        "--tag-bg": "rgba(234,88,12,0.12)",
        "--tag-text": "#ea580c"
      },
      swatches: {
        dark: ["#1c1917", "#292524", "#f97316", "#fafaf9"],
        light: ["#fff7ed", "#ffffff", "#ea580c", "#431407"]
      }
    },
    {
      id: "rose-velvet",
      name: "Rose Velvet",
      desc: "Plum midnight & delicate blush ros\xE9",
      dark: {
        "--bg-primary": "#1a101f",
        "--bg-secondary": "#291830",
        "--card-bg": "#291830",
        "--bg-hover": "#3d2348",
        "--text-primary": "#fff1f2",
        "--text-secondary": "#fda4af",
        "--border-light": "#4c1d35",
        "--accent": "#f43f5e",
        "--accent-hover": "#fb7185",
        "--tag-bg": "rgba(244,63,94,0.18)",
        "--tag-text": "#fb7185"
      },
      light: {
        "--bg-primary": "#fff1f2",
        "--bg-secondary": "#ffffff",
        "--card-bg": "#ffffff",
        "--bg-hover": "#ffe4e6",
        "--text-primary": "#4c0519",
        "--text-secondary": "#9f1239",
        "--border-light": "#fecdd3",
        "--accent": "#e11d48",
        "--accent-hover": "#be123c",
        "--tag-bg": "rgba(225,29,72,0.12)",
        "--tag-text": "#e11d48"
      },
      swatches: {
        dark: ["#1a101f", "#291830", "#f43f5e", "#fff1f2"],
        light: ["#fff1f2", "#ffffff", "#e11d48", "#4c0519"]
      }
    },
    {
      id: "nordic-frost",
      name: "Nordic Frost",
      desc: "Polar slate & icy Scandinavian breeze",
      dark: {
        "--bg-primary": "#242933",
        "--bg-secondary": "#2e3440",
        "--card-bg": "#2e3440",
        "--bg-hover": "#3b4252",
        "--text-primary": "#eceff4",
        "--text-secondary": "#d8dee9",
        "--border-light": "#3b4252",
        "--accent": "#88c0d0",
        "--accent-hover": "#81a1c1",
        "--tag-bg": "rgba(136,192,208,0.18)",
        "--tag-text": "#88c0d0"
      },
      light: {
        "--bg-primary": "#f4f6f9",
        "--bg-secondary": "#ffffff",
        "--card-bg": "#ffffff",
        "--bg-hover": "#e5e9f0",
        "--text-primary": "#2e3440",
        "--text-secondary": "#4c566a",
        "--border-light": "#d8dee9",
        "--accent": "#5e81ac",
        "--accent-hover": "#81a1c1",
        "--tag-bg": "rgba(94,129,172,0.12)",
        "--tag-text": "#5e81ac"
      },
      swatches: {
        dark: ["#242933", "#2e3440", "#88c0d0", "#eceff4"],
        light: ["#f4f6f9", "#ffffff", "#5e81ac", "#2e3440"]
      }
    }
  ];

  // src/modules/theme/theme.ts
  function hexToRgb(hex) {
    if (!hex) return null;
    let clean = hex.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    if (clean.length !== 6) return null;
    const num = parseInt(clean, 16);
    return {
      r: num >> 16 & 255,
      g: num >> 8 & 255,
      b: num & 255
    };
  }
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
  function getCategoryTagStyle(categoryName) {
    if (!categoryName) return "";
    const color = state.categoryColors[categoryName.toLowerCase()];
    if (!color) return "";
    const rgb = hexToRgb(color);
    if (!rgb) return `style="color: ${color};"`;
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const bgAlpha = isDark ? 0.2 : 0.12;
    const borderAlpha = isDark ? 0.4 : 0.25;
    return `style="--tag-color: ${color}; color: ${color}; background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bgAlpha}); border: 1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderAlpha});"`;
  }
  function getActivePreset() {
    const id = localStorage.getItem(ACTIVE_PRESET_KEY) || "default";
    return THEME_PRESETS.find((p) => p.id === id) || THEME_PRESETS[0];
  }
  function applyCustomThemeProperties(colorsObj) {
    const root = document.documentElement;
    Object.entries(colorsObj).forEach(([prop, val]) => {
      if (val) {
        root.style.setProperty(prop, val);
      }
    });
    if (colorsObj["--card-bg"]) {
      root.style.setProperty("--modal-bg", colorsObj["--card-bg"]);
    }
    if (colorsObj["--bg-primary"]) {
      root.style.setProperty("--input-bg", colorsObj["--bg-primary"]);
    }
    if (colorsObj["--border-light"]) {
      root.style.setProperty("--input-border", colorsObj["--border-light"]);
      root.style.setProperty("--card-border", colorsObj["--border-light"]);
    }
  }
  function clearCustomThemeProperties() {
    const root = document.documentElement;
    [
      "--bg-primary",
      "--bg-secondary",
      "--bg-tertiary",
      "--card-bg",
      "--modal-bg",
      "--input-bg",
      "--input-border",
      "--card-border",
      "--bg-hover",
      "--text-primary",
      "--text-secondary",
      "--border-light",
      "--accent",
      "--accent-hover",
      "--tag-bg",
      "--tag-text"
    ].forEach((prop) => root.style.removeProperty(prop));
  }
  function applyPresetPaletteForMode(mode) {
    const preset = getActivePreset();
    const colors = preset[mode] || preset.dark;
    clearCustomThemeProperties();
    applyCustomThemeProperties(colors);
    try {
      const raw = localStorage.getItem(CUSTOM_THEME_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const overrides = parsed[mode] || parsed;
          if (overrides && typeof overrides === "object") {
            applyCustomThemeProperties(overrides);
          }
        }
      }
    } catch (_) {
    }
  }
  function initTheme(onThemeChanged) {
    const saved = localStorage.getItem(THEME_KEY);
    const theme = saved || "dark";
    document.documentElement.setAttribute("data-theme", theme);
    applyPresetPaletteForMode(theme);
    try {
      const catCols = localStorage.getItem(CAT_COLORS_KEY);
      if (catCols) {
        state.categoryColors = JSON.parse(catCols) || {};
      }
    } catch {
      state.categoryColors = {};
    }
    if (onThemeChanged) onThemeChanged();
  }
  function toggleTheme(onThemeChanged) {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_KEY, next);
    applyPresetPaletteForMode(next);
    syncColorPickersFromDOM();
    renderPresetPalettes();
    notifyOtherTabs("SYNC_THEME");
    if (onThemeChanged) onThemeChanged();
  }
  function renderPresetPalettes() {
    const presetPalettesGrid = document.getElementById("presetPalettesGrid");
    if (!presetPalettesGrid) return;
    const currentMode = document.documentElement.getAttribute("data-theme") || "dark";
    const activePreset = getActivePreset();
    presetPalettesGrid.innerHTML = "";
    THEME_PRESETS.forEach((preset) => {
      const card = document.createElement("div");
      const isActive = preset.id === activePreset.id;
      card.className = `palette-card ${isActive ? "active" : ""}`;
      const swatches = preset.swatches && preset.swatches[currentMode] || preset.swatches && preset.swatches.dark || [];
      card.innerHTML = `
      <div class="palette-preview-bar">
        ${swatches.map((c) => `<div class="palette-swatch" style="background: ${c};"></div>`).join("")}
      </div>
      <div class="palette-name">${escapeHtml(preset.name)}</div>
      <div class="palette-desc">${escapeHtml(preset.desc)}</div>
    `;
      card.addEventListener("click", () => {
        applyPreset(preset);
      });
      presetPalettesGrid.appendChild(card);
    });
  }
  function applyPreset(preset, onThemeChanged) {
    localStorage.setItem(ACTIVE_PRESET_KEY, preset.id);
    const currentMode = document.documentElement.getAttribute("data-theme") || "dark";
    applyPresetPaletteForMode(currentMode);
    syncColorPickersFromDOM();
    renderPresetPalettes();
    notifyOtherTabs("SYNC_THEME");
    if (onThemeChanged) onThemeChanged();
    showToast(`Applied "${preset.name}" theme family!`);
  }
  function syncColorPickersFromDOM() {
    const computed = getComputedStyle(document.documentElement);
    const pickers = [
      { id: "colorAccent", hexId: "hexAccent", prop: "--accent" },
      { id: "colorAccentHover", hexId: "hexAccentHover", prop: "--accent-hover" },
      { id: "colorBgPrimary", hexId: "hexBgPrimary", prop: "--bg-primary" },
      { id: "colorCardBg", hexId: "hexCardBg", prop: "--card-bg" },
      { id: "colorBgSecondary", hexId: "hexBgSecondary", prop: "--bg-secondary" },
      { id: "colorBgHover", hexId: "hexBgHover", prop: "--bg-hover" },
      { id: "colorTextPrimary", hexId: "hexTextPrimary", prop: "--text-primary" },
      { id: "colorTextSecondary", hexId: "hexTextSecondary", prop: "--text-secondary" },
      { id: "colorBorder", hexId: "hexBorder", prop: "--border-light" },
      { id: "colorTagText", hexId: "hexTagText", prop: "--tag-text" },
      { id: "colorTagBg", hexId: "hexTagBg", prop: "--tag-bg" }
    ];
    pickers.forEach(({ id, hexId, prop }) => {
      const input = document.getElementById(id);
      const hexInput = document.getElementById(hexId);
      const val = computed.getPropertyValue(prop).trim();
      if (!val) return;
      let hex = val;
      if (val.startsWith("rgb")) {
        const parts = val.match(/\d+/g);
        if (parts && parts.length >= 3) {
          hex = rgbToHex(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        }
      }
      if (input && hex.startsWith("#") && hex.length === 7) {
        input.value = hex;
      }
      if (hexInput) {
        hexInput.value = hex;
      }
    });
  }
  function renderCategoryColorsList(onUpdate) {
    const list = document.getElementById("categoryColorsList");
    if (!list) return;
    const allCats = /* @__PURE__ */ new Set();
    state.entries.forEach((e) => (e.categories || []).forEach((c) => allCats.add(c)));
    Object.keys(state.categoryColors).forEach((c) => allCats.add(c));
    const sorted = Array.from(allCats).sort((a, b) => a.localeCompare(b));
    list.innerHTML = "";
    if (sorted.length === 0) {
      list.innerHTML = '<p class="cat-modal-empty" style="grid-column: 1/-1;">No categories in use yet.</p>';
      return;
    }
    sorted.forEach((cat) => {
      const key = cat.toLowerCase();
      const currentColor = state.categoryColors[key] || "#0a84ff";
      const hasCustom = !!state.categoryColors[key];
      const row = document.createElement("div");
      row.className = "cat-color-row";
      row.innerHTML = `
      <div class="cat-color-name-wrap">
        <span class="cat-color-name">${escapeHtml(cat)}</span>
        <span class="cat-color-preview-pill" ${getCategoryTagStyle(cat)}>Preview</span>
      </div>
      <div class="cat-color-picker-wrap">
        <input type="color" value="${currentColor}" title="Choose color for ${escapeHtml(cat)}">
        ${hasCustom ? `<button type="button" class="cat-color-clear-btn" title="Reset to default">\u2715</button>` : ""}
      </div>
    `;
      const picker = row.querySelector('input[type="color"]');
      if (picker) {
        picker.addEventListener("input", (e) => {
          const val = e.target.value;
          state.categoryColors[key] = val;
          localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
          const pill = row.querySelector(".cat-color-preview-pill");
          if (pill) {
            pill.outerHTML = `<span class="cat-color-preview-pill" ${getCategoryTagStyle(cat)}>Preview</span>`;
          }
          notifyOtherTabs("SYNC_THEME");
          if (onUpdate) onUpdate();
        });
      }
      const clearBtn = row.querySelector(".cat-color-clear-btn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          delete state.categoryColors[key];
          localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
          notifyOtherTabs("SYNC_THEME");
          renderCategoryColorsList(onUpdate);
          if (onUpdate) onUpdate();
        });
      }
      list.appendChild(row);
    });
  }
  function resetAllThemeToDefault(onThemeChanged) {
    localStorage.removeItem(ACTIVE_PRESET_KEY);
    localStorage.removeItem(CUSTOM_THEME_KEY);
    localStorage.removeItem(CAT_COLORS_KEY);
    state.activeThemePreset = "default";
    state.customThemeColors = {};
    state.categoryColors = {};
    clearCustomThemeProperties();
    const currentMode = document.documentElement.getAttribute("data-theme") || "dark";
    applyPresetPaletteForMode(currentMode);
    syncColorPickersFromDOM();
    renderPresetPalettes();
    renderCategoryColorsList(onThemeChanged);
    notifyOtherTabs("SYNC_THEME");
    if (onThemeChanged) onThemeChanged();
    showToast("Theme and colors reset to default.");
  }
  function resetCategoryColors(onThemeChanged) {
    state.categoryColors = {};
    localStorage.removeItem(CAT_COLORS_KEY);
    renderCategoryColorsList(onThemeChanged);
    notifyOtherTabs("SYNC_THEME");
    if (onThemeChanged) onThemeChanged();
    showToast("Category colors reset to default.");
  }
  function autoColorizeCategories(onThemeChanged) {
    const allCats = /* @__PURE__ */ new Set();
    state.entries.forEach((e) => (e.categories || []).forEach((c) => allCats.add(c)));
    const sorted = Array.from(allCats).sort((a, b) => a.localeCompare(b));
    if (sorted.length === 0) {
      showToast("No categories to colorize.");
      return;
    }
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    const lightness = isDark ? 65 : 45;
    const saturation = isDark ? 80 : 70;
    const step = 360 / sorted.length;
    sorted.forEach((cat, idx) => {
      const hue = Math.round((idx * step + 200) % 360);
      state.categoryColors[cat.toLowerCase()] = hslToHex(hue, saturation, lightness);
    });
    localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
    renderCategoryColorsList(onThemeChanged);
    notifyOtherTabs("SYNC_THEME");
    if (onThemeChanged) onThemeChanged();
    showToast(`Auto-colorized ${sorted.length} categories!`);
  }
  function exportThemeJson() {
    const config = {
      theme: document.documentElement.getAttribute("data-theme") || "dark",
      activePreset: localStorage.getItem(ACTIVE_PRESET_KEY) || "default",
      customColors: state.customThemeColors,
      categoryColors: state.categoryColors
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => showToast("Theme configuration copied to clipboard!")).catch(() => showToast("Failed to copy theme to clipboard."));
  }
  function importThemeJson(onThemeChanged) {
    const textarea = document.getElementById("importThemeJsonInput");
    if (!textarea || !textarea.value.trim()) {
      showToast("Please paste a theme JSON configuration.");
      return;
    }
    try {
      const config = JSON.parse(textarea.value.trim());
      if (config.theme && (config.theme === "dark" || config.theme === "light")) {
        document.documentElement.setAttribute("data-theme", config.theme);
        localStorage.setItem(THEME_KEY, config.theme);
      }
      if (config.activePreset && typeof config.activePreset === "string") {
        localStorage.setItem(ACTIVE_PRESET_KEY, config.activePreset);
        state.activeThemePreset = config.activePreset;
      }
      if (config.customColors && typeof config.customColors === "object") {
        state.customThemeColors = config.customColors;
        localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(state.customThemeColors));
      }
      if (config.categoryColors && typeof config.categoryColors === "object") {
        state.categoryColors = config.categoryColors;
        localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
      }
      const currentMode = document.documentElement.getAttribute("data-theme") || "dark";
      applyPresetPaletteForMode(currentMode);
      if (state.customThemeColors && state.customThemeColors[currentMode]) {
        applyCustomThemeProperties(state.customThemeColors[currentMode]);
      }
      syncColorPickersFromDOM();
      renderPresetPalettes();
      renderCategoryColorsList(onThemeChanged);
      notifyOtherTabs("SYNC_THEME");
      if (onThemeChanged) onThemeChanged();
      textarea.value = "";
      showToast("Theme configuration imported successfully!");
    } catch (err) {
      showToast("Invalid theme JSON format.");
    }
  }
  function openThemeModal() {
    renderPresetPalettes();
    syncColorPickersFromDOM();
    renderCategoryColorsList();
    const themeModalBackdrop2 = document.getElementById("themeModalBackdrop");
    if (themeModalBackdrop2) themeModalBackdrop2.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closeThemeModal() {
    const themeModalBackdrop2 = document.getElementById("themeModalBackdrop");
    if (themeModalBackdrop2) themeModalBackdrop2.classList.remove("active");
    document.body.style.overflow = "";
  }

  // src/modules/navigation/top-nav.ts
  function initTopNavReveal() {
    const topNavWrapper = document.getElementById("topNavWrapper");
    const topNavPlaceholder = document.getElementById("topNavPlaceholder");
    const catFilterDropdown2 = document.getElementById("catFilterDropdown");
    const searchInput2 = document.getElementById("searchInput");
    if (!topNavWrapper) return;
    let lastScrollY = window.scrollY;
    let isMouseNearTop = false;
    let scrollDeltaAccumulator = 0;
    let isScrollingDown = false;
    let scrollTimeout = null;
    let hideAnimationTimer = null;
    let staticNavHeight = 135;
    function updateTopNavReveal() {
      if (!topNavWrapper) return;
      const scrollY = window.scrollY;
      if (!topNavWrapper.classList.contains("is-scrolled")) {
        staticNavHeight = topNavWrapper.offsetHeight || staticNavHeight;
      }
      const scrollThreshold = staticNavHeight + 20;
      const isScrolled = scrollY > scrollThreshold;
      const delta = scrollY - lastScrollY;
      if (delta > 0) {
        isScrollingDown = true;
        scrollDeltaAccumulator = 0;
      } else if (delta < 0) {
        scrollDeltaAccumulator += Math.abs(delta);
        if (scrollDeltaAccumulator > 15) {
          isScrollingDown = false;
        }
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrollingDown = false;
        scrollDeltaAccumulator = 0;
      }, 150);
      if (isScrolled) {
        if (topNavPlaceholder) {
          topNavPlaceholder.style.height = `${staticNavHeight}px`;
          topNavPlaceholder.style.display = "block";
        }
        topNavWrapper.classList.add("is-scrolled");
        const isDropdownOpen = catFilterDropdown2 && catFilterDropdown2.classList.contains("open");
        const isSearchFocused = searchInput2 && document.activeElement === searchInput2;
        const shouldReveal = isDropdownOpen || isSearchFocused || !isScrollingDown && isMouseNearTop || !isScrollingDown && scrollDeltaAccumulator > 15;
        if (shouldReveal) {
          clearTimeout(hideAnimationTimer);
          topNavWrapper.classList.add("is-animating");
          topNavWrapper.classList.add("is-revealed");
        } else {
          topNavWrapper.classList.remove("is-revealed");
          clearTimeout(hideAnimationTimer);
          hideAnimationTimer = setTimeout(() => {
            if (!topNavWrapper.classList.contains("is-revealed")) {
              topNavWrapper.classList.remove("is-animating");
            }
          }, 280);
        }
      } else {
        clearTimeout(hideAnimationTimer);
        topNavWrapper.classList.remove("is-animating", "is-revealed", "is-scrolled");
        if (topNavPlaceholder) {
          topNavPlaceholder.style.display = "none";
        }
      }
      lastScrollY = scrollY;
    }
    window.addEventListener("scroll", updateTopNavReveal, { passive: true });
    document.addEventListener("mousemove", (e) => {
      if (!topNavWrapper) return;
      const isRevealed = topNavWrapper.classList.contains("is-revealed");
      const currentHeight = topNavWrapper.offsetHeight || staticNavHeight;
      const threshold = isRevealed ? currentHeight + 25 : 50;
      const wasNear = isMouseNearTop;
      isMouseNearTop = e.clientY <= threshold;
      if (wasNear !== isMouseNearTop && window.scrollY > staticNavHeight + 20 && !isScrollingDown) {
        updateTopNavReveal();
      }
    });
    topNavWrapper.addEventListener("mouseenter", () => {
      isMouseNearTop = true;
      if (window.scrollY > staticNavHeight + 20 && !isScrollingDown) updateTopNavReveal();
    });
    topNavWrapper.addEventListener("mouseleave", (e) => {
      const currentHeight = topNavWrapper.offsetHeight || staticNavHeight;
      if (e.clientY > currentHeight) {
        isMouseNearTop = false;
        if (window.scrollY > staticNavHeight + 20) updateTopNavReveal();
      }
    });
    window.addEventListener("resize", () => {
      if (topNavWrapper && !topNavWrapper.classList.contains("is-scrolled")) {
        staticNavHeight = topNavWrapper.offsetHeight || staticNavHeight;
      }
    });
  }

  // src/utils/icon-converter.ts
  async function urlToDataUrl(imageUrl) {
    if (!imageUrl || imageUrl.startsWith("data:")) {
      return imageUrl || "";
    }
    const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const imageToDataUrl = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const maxDim = 128;
          let w = img.naturalWidth || img.width || 64;
          let h = img.naturalHeight || img.height || 64;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round(h * maxDim / w);
              w = maxDim;
            } else {
              w = Math.round(w * maxDim / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w || 64;
          canvas.height = h || 64;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context not available"));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png"));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = src;
    });
    try {
      const resp = await fetch(imageUrl, { mode: "cors" });
      if (resp.ok) {
        const blob = await resp.blob();
        if (blob && blob.size > 0) {
          const dataUrl = await blobToDataUrl(blob);
          if (dataUrl && dataUrl.startsWith("data:image")) return dataUrl;
        }
      }
    } catch (_) {
    }
    try {
      const dataUrl = await imageToDataUrl(imageUrl);
      if (dataUrl && dataUrl.startsWith("data:image")) {
        return dataUrl;
      }
    } catch (_) {
    }
    try {
      const cleanUrl = imageUrl.replace(/^https?:\/\//i, "");
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=128&output=png`;
      const resp = await fetch(proxyUrl, { mode: "cors" });
      if (resp.ok) {
        const blob = await resp.blob();
        if (blob && blob.size > 0) {
          const dataUrl = await blobToDataUrl(blob);
          if (dataUrl && dataUrl.startsWith("data:image")) return dataUrl;
        }
      }
    } catch (_) {
    }
    return imageUrl;
  }

  // src/utils/auto-fill.ts
  function cleanPageTitle(rawTitle, domain = "") {
    if (!rawTitle) return "";
    let title = rawTitle.trim();
    if (typeof document !== "undefined") {
      try {
        const txt = document.createElement("textarea");
        txt.innerHTML = title;
        if (txt.value) {
          title = txt.value;
        }
      } catch {
      }
    }
    if (domain) {
      const cleanDom = domain.replace(/^www\./i, "").split(".")[0];
      const regexes = [
        new RegExp(`\\s*[-|\u2013\u2014\u2022\xB7]\\s*${cleanDom}.*$`, "i"),
        new RegExp(`^${cleanDom}\\s*[-|\u2013\u2014\u2022\xB7]\\s*`, "i")
      ];
      for (const r of regexes) {
        if (title.length > 20 && r.test(title)) {
          title = title.replace(r, "").trim();
        }
      }
    }
    return title.replace(/\s+/g, " ").trim();
  }
  function fallbackTitleFromUrl(url) {
    try {
      const domain = getDomain(url);
      if (!domain) return "";
      const parts = domain.replace(/^www\./i, "").split(".");
      const main = parts[0] || "";
      return main.charAt(0).toUpperCase() + main.slice(1);
    } catch {
      return "";
    }
  }
  function cleanDescription(rawDesc) {
    if (!rawDesc) return "";
    let desc = rawDesc.trim();
    if (typeof document !== "undefined") {
      try {
        const txt = document.createElement("textarea");
        txt.innerHTML = desc;
        if (txt.value) desc = txt.value;
      } catch {
      }
    }
    return desc.replace(/\s+/g, " ").trim();
  }
  async function fetchWebsiteMetadata(url) {
    if (!url) return null;
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    const domain = getDomain(targetUrl);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const mUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(mUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json && json.status === "success" && json.data) {
          const rawTitle = json.data.title || "";
          const cleanedTitle = cleanPageTitle(rawTitle, domain) || fallbackTitleFromUrl(targetUrl);
          const rawDesc = json.data.description || "";
          const description = cleanDescription(rawDesc);
          const scrapedIcon = json.data.logo?.url || json.data.icon?.url || "";
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
    } catch {
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4e3);
      const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        let html = "";
        if (typeof res.text === "function") {
          try {
            html = await res.text();
          } catch {
          }
        }
        if (!html && typeof res.json === "function") {
          try {
            const j = await res.json();
            if (j && typeof j.contents === "string") html = j.contents;
          } catch {
          }
        }
        if (html && html.length > 50) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
          const twTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute("content");
          const docTitle = doc.querySelector("title")?.textContent;
          const rawTitle = ogTitle || twTitle || docTitle || "";
          const cleanedTitle = cleanPageTitle(rawTitle, domain) || fallbackTitleFromUrl(targetUrl);
          const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content");
          const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content");
          const twDesc = doc.querySelector('meta[name="twitter:description"]')?.getAttribute("content");
          const description = cleanDescription(ogDesc || metaDesc || twDesc || "");
          const iconLink = doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") || doc.querySelector('link[rel="icon"]')?.getAttribute("href") || doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href");
          let resolvedIcon = "";
          if (iconLink) {
            try {
              resolvedIcon = new URL(iconLink, targetUrl).href;
            } catch {
            }
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
    } catch {
    }
    const fallbackTitle = fallbackTitleFromUrl(targetUrl);
    return {
      title: fallbackTitle,
      description: "",
      iconUrl: "",
      url: targetUrl
    };
  }

  // src/modules/icons/picker.ts
  var selectedCandidateId = "google";
  function getCandidateSources(url, scrapedIconUrl = "") {
    if (!url) return [];
    const targetUrl = ensureProtocol(url.trim());
    const domain = getDomain(targetUrl);
    if (!domain) return [];
    let origin = "";
    try {
      origin = new URL(targetUrl).origin;
    } catch {
      origin = `https://${domain}`;
    }
    return [
      {
        id: "google",
        name: "Google HD",
        iconSrc: `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
          targetUrl
        )}&size=128`,
        tag: "\u{1F310}"
      },
      {
        id: "apple",
        name: "Touch Icon",
        iconSrc: scrapedIconUrl || `${origin}/apple-touch-icon.png`,
        tag: "\u{1F34E}"
      },
      {
        id: "ddg",
        name: "DuckDuckGo",
        iconSrc: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        tag: "\u{1F986}"
      },
      {
        id: "clearbit",
        name: "Brand Logo",
        iconSrc: `https://logo.clearbit.com/${domain}`,
        tag: "\u{1F3E2}"
      }
    ];
  }
  function renderIconCandidates(url, scrapedIconUrl = "", forceSelectedId = null) {
    const iconCandidatesGrid = document.getElementById("iconCandidatesGrid");
    const iconCandidatesWrapper = document.getElementById("iconCandidatesWrapper");
    const entryIcon2 = document.getElementById("entryIcon");
    const entryIconPreview2 = document.getElementById("entryIconPreview");
    if (!iconCandidatesGrid || !iconCandidatesWrapper) return;
    if (!url || !url.includes(".") && !url.startsWith("localhost")) {
      iconCandidatesWrapper.style.display = "none";
      return;
    }
    const candidates = getCandidateSources(url, scrapedIconUrl);
    if (candidates.length === 0) {
      iconCandidatesWrapper.style.display = "none";
      return;
    }
    if (forceSelectedId) {
      selectedCandidateId = forceSelectedId;
    } else if (!selectedCandidateId) {
      selectedCandidateId = "google";
    }
    iconCandidatesWrapper.style.display = "flex";
    iconCandidatesGrid.innerHTML = "";
    candidates.forEach((cand) => {
      const card = document.createElement("div");
      const isActive = cand.id === selectedCandidateId;
      card.className = `icon-candidate-card ${isActive ? "is-active" : ""}`;
      card.setAttribute("data-candidate-id", cand.id);
      card.innerHTML = `
      ${isActive ? '<div class="candidate-check-badge">\u2713</div>' : ""}
      <div class="candidate-icon-box">
        <img src="${escapeHtml(cand.iconSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">
      </div>
      <span class="candidate-source-name" title="${cand.name}">${cand.tag} ${cand.name}</span>
    `;
      card.addEventListener("click", (e) => {
        e.preventDefault();
        selectedCandidateId = cand.id;
        if (entryIcon2) entryIcon2.value = cand.iconSrc;
        if (entryIconPreview2) {
          entryIconPreview2.innerHTML = `<img src="${escapeHtml(cand.iconSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">`;
        }
        renderIconCandidates(url, scrapedIconUrl, cand.id);
      });
      iconCandidatesGrid.appendChild(card);
    });
  }

  // src/core/queue.ts
  var DomainCircuitBreaker = class {
    constructor(failureThreshold = 2) {
      __publicField(this, "failureThreshold");
      __publicField(this, "failures");
      __publicField(this, "tripped");
      this.failureThreshold = failureThreshold;
      this.failures = /* @__PURE__ */ new Map();
      this.tripped = /* @__PURE__ */ new Set();
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
  };
  async function fetchWithBackoff(taskFn, options = {}) {
    const maxRetries = options.maxRetries ?? 2;
    const baseDelay = options.baseDelay ?? 400;
    const isTripped = options.isTripped || (() => false);
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (isTripped()) {
        throw new Error("Circuit tripped for domain");
      }
      try {
        return await taskFn();
      } catch (err) {
        if (attempt === maxRetries || isTripped()) {
          throw err;
        }
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 150;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error("Retries exceeded");
  }
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
        const domain = item.url ? getDomain(ensureProtocol(item.url)) : "";
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

  // src/modules/icons/refresh.ts
  function updatePendingIconsUI() {
    const count = state.pendingIcons.size;
    const pendingIconsCount = document.getElementById("pendingIconsCount");
    const acceptAllIconsBtn2 = document.getElementById("acceptAllIconsBtn");
    const dismissAllIconsBtn2 = document.getElementById("dismissAllIconsBtn");
    const floatingReviewBar = document.getElementById("floatingReviewBar");
    const floatingReviewCount = document.getElementById("floatingReviewCount");
    const floatingReviewPlural = document.getElementById("floatingReviewPlural");
    if (count > 0) {
      if (pendingIconsCount) pendingIconsCount.textContent = String(count);
      if (acceptAllIconsBtn2) acceptAllIconsBtn2.style.display = "inline-flex";
      if (dismissAllIconsBtn2) dismissAllIconsBtn2.style.display = "inline-flex";
      if (floatingReviewBar) {
        if (floatingReviewCount) floatingReviewCount.textContent = String(count);
        if (floatingReviewPlural) floatingReviewPlural.textContent = count !== 1 ? "s" : "";
        floatingReviewBar.style.display = "block";
      }
    } else {
      if (acceptAllIconsBtn2) acceptAllIconsBtn2.style.display = "none";
      if (dismissAllIconsBtn2) dismissAllIconsBtn2.style.display = "none";
      if (floatingReviewBar) floatingReviewBar.style.display = "none";
    }
  }
  function updateCardPendingState(id, onUpdate) {
    const grid = document.getElementById("grid");
    if (!grid) return;
    const card = grid.querySelector(`.card[data-id="${id}"]`);
    if (!card) return;
    const pendingIcon = state.pendingIcons.get(id);
    const cardTop = card.querySelector(".card-top");
    let pendingBox = card.querySelector(".card-pending-icon-box");
    if (pendingIcon) {
      card.classList.add("has-pending-icon");
      if (!pendingBox && cardTop) {
        pendingBox = document.createElement("div");
        pendingBox.className = "card-pending-icon-box";
        pendingBox.title = "New icon proposed";
        pendingBox.innerHTML = `
        <span class="pending-badge">New Icon</span>
        <div class="pending-preview-row">
          <div class="card-icon new-icon-preview" title="New icon preview">
            <img src="${escapeHtml(pendingIcon)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">
          </div>
          <button type="button" class="btn-accept accept-icon-btn" title="Accept new icon">\u2713 Accept</button>
          <button type="button" class="btn btn-ghost dismiss-icon-btn" title="Dismiss new icon">\u2715</button>
        </div>
      `;
        const acceptBtn = pendingBox.querySelector(".accept-icon-btn");
        if (acceptBtn) {
          acceptBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            acceptPendingIcon(id, onUpdate);
          });
        }
        const dismissBtn = pendingBox.querySelector(".dismiss-icon-btn");
        if (dismissBtn) {
          dismissBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dismissPendingIcon(id, onUpdate);
          });
        }
        cardTop.appendChild(pendingBox);
      }
    } else {
      card.classList.remove("has-pending-icon");
      if (pendingBox) {
        pendingBox.remove();
      }
      const entry = state.entries.find((e) => e.id === id);
      if (entry) {
        const iconDiv = card.querySelector(".card-icon:not(.new-icon-preview)");
        if (iconDiv) {
          const iconSrc = entry.icon || entry.iconUrl;
          iconDiv.innerHTML = iconSrc ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">` : '<span class="icon-fallback">\u{1F310}</span>';
        }
      }
    }
  }
  async function fetchMultiSourceBestIcon(url) {
    if (!url) return null;
    const targetUrl = ensureProtocol(url.trim());
    const domain = getDomain(targetUrl);
    if (!domain) return null;
    let origin = "";
    try {
      origin = new URL(targetUrl).origin;
    } catch {
      origin = `https://${domain}`;
    }
    const sources = [
      `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
        targetUrl
      )}&size=128`,
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
      } catch {
      }
    }
    return null;
  }
  async function refreshEntryIcon(id, btnElement = null, onUpdate) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find((e) => e.id === id);
    if (!entry) return;
    if (btnElement) btnElement.classList.add("is-spinning");
    showToast(`Checking for updated icon for "${entry.name}" across multiple sources...`);
    try {
      const candidateDataUrl = await fetchMultiSourceBestIcon(entry.url);
      const currentIcon = entry.icon || entry.iconUrl;
      if (candidateDataUrl && candidateDataUrl !== currentIcon) {
        state.pendingIcons.set(id, candidateDataUrl);
        updatePendingIconsUI();
        updateCardPendingState(id, onUpdate);
        showToast(`New HD icon found for "${entry.name}"! Click "\u2713 Accept" to apply.`);
      } else {
        showToast(`Icon for "${entry.name}" is already up to date.`);
      }
    } finally {
      if (btnElement) btnElement.classList.remove("is-spinning");
    }
  }
  async function refreshAllIcons(onUpdate) {
    const diskList = getLatestStoredEntries();
    if (diskList.length === 0) {
      showToast("No sites to refresh.");
      return;
    }
    const refreshAllBtn2 = document.getElementById("refreshAllBtn");
    const refreshProgressBar = document.getElementById("refreshProgressBar");
    const refreshProgressFill = document.getElementById("refreshProgressFill");
    const refreshProgressLabel = document.getElementById("refreshProgressLabel");
    const refreshProgressCount = document.getElementById("refreshProgressCount");
    const refreshBtnLabel = refreshAllBtn2 ? refreshAllBtn2.querySelector(".btn-label") : null;
    const originalBtnText = refreshBtnLabel ? refreshBtnLabel.textContent : "Refresh Icons";
    if (refreshAllBtn2) {
      refreshAllBtn2.classList.add("is-loading");
      refreshAllBtn2.disabled = true;
    }
    if (refreshProgressBar) {
      refreshProgressBar.style.display = "block";
      if (refreshProgressFill) refreshProgressFill.style.width = "0%";
      if (refreshProgressCount) refreshProgressCount.textContent = `0 / ${diskList.length}`;
      if (refreshProgressLabel)
        refreshProgressLabel.textContent = "Checking for updated icons in parallel across multiple sources...";
    }
    let foundCount = 0;
    const concurrency = 4;
    const circuitBreaker = new DomainCircuitBreaker(2);
    await runWorkerQueue(
      diskList,
      concurrency,
      async (entry) => {
        const domain = getDomain(ensureProtocol(entry.url));
        const candidateDataUrl = await fetchWithBackoff(
          async () => {
            return await fetchMultiSourceBestIcon(entry.url);
          },
          {
            maxRetries: 1,
            baseDelay: 400,
            isTripped: () => circuitBreaker.isTripped(domain)
          }
        );
        const currentIcon = entry.icon || entry.iconUrl;
        if (candidateDataUrl && candidateDataUrl !== currentIcon) {
          state.pendingIcons.set(entry.id, candidateDataUrl);
          foundCount++;
          updatePendingIconsUI();
          updateCardPendingState(entry.id, onUpdate);
        }
      },
      (completed, total) => {
        const pct = Math.round(completed / total * 100);
        if (refreshProgressFill) refreshProgressFill.style.width = `${pct}%`;
        if (refreshProgressCount) refreshProgressCount.textContent = `${completed} / ${total} (${pct}%)`;
        if (refreshBtnLabel) refreshBtnLabel.textContent = `Checking (${pct}%)...`;
      },
      circuitBreaker
    );
    if (refreshProgressLabel) {
      refreshProgressLabel.textContent = foundCount > 0 ? `Done! Found ${foundCount} new icon update${foundCount !== 1 ? "s" : ""}.` : "Done! All icons are already up to date.";
    }
    setTimeout(() => {
      if (refreshProgressBar) refreshProgressBar.style.display = "none";
      if (refreshAllBtn2) {
        refreshAllBtn2.classList.remove("is-loading");
        refreshAllBtn2.disabled = false;
        if (refreshBtnLabel) refreshBtnLabel.textContent = originalBtnText;
      }
    }, 1200);
    updatePendingIconsUI();
    if (foundCount > 0) {
      showToast(`Found ${foundCount} new icon update${foundCount !== 1 ? "s" : ""}! Review or click "Accept All".`);
    } else {
      showToast("All icons are already up to date!");
    }
  }
  function acceptPendingIcon(id, onUpdate) {
    const newIcon = state.pendingIcons.get(id);
    if (!newIcon) return;
    const diskList = getLatestStoredEntries();
    const entry = diskList.find((e) => e.id === id);
    if (entry) {
      entry.iconUrl = newIcon;
      delete entry.icon;
      entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
      saveEntries(diskList);
      state.pendingIcons.delete(id);
      updatePendingIconsUI();
      updateCardPendingState(id, onUpdate);
      if (onUpdate) onUpdate();
      showToast(`Icon updated for "${entry.name}"!`);
    }
  }
  function dismissPendingIcon(id, onUpdate) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find((e) => e.id === id);
    state.pendingIcons.delete(id);
    updatePendingIconsUI();
    updateCardPendingState(id, onUpdate);
    if (entry) {
      showToast(`Dismissed icon update for "${entry.name}".`);
    }
  }
  function acceptAllPendingIcons(onUpdate) {
    if (state.pendingIcons.size === 0) return;
    const diskList = getLatestStoredEntries();
    let count = 0;
    const acceptedIds = Array.from(state.pendingIcons.keys());
    for (const [id, newIcon] of state.pendingIcons.entries()) {
      const entry = diskList.find((e) => e.id === id);
      if (entry) {
        entry.iconUrl = newIcon;
        delete entry.icon;
        entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
        count++;
      }
    }
    saveEntries(diskList);
    state.pendingIcons.clear();
    updatePendingIconsUI();
    acceptedIds.forEach((id) => updateCardPendingState(id, onUpdate));
    if (onUpdate) onUpdate();
    showToast(`Accepted and updated ${count} icon${count !== 1 ? "s" : ""}!`);
  }
  function dismissAllPendingIcons(onUpdate) {
    const dismissedIds = Array.from(state.pendingIcons.keys());
    state.pendingIcons.clear();
    updatePendingIconsUI();
    dismissedIds.forEach((id) => updateCardPendingState(id, onUpdate));
    showToast("All proposed icon updates dismissed.");
  }
  async function cacheExistingIconsOffline(onUpdate) {
    const unCached = state.entries.filter((e) => {
      const icon = e.icon || e.iconUrl;
      return icon && !icon.startsWith("data:");
    });
    if (unCached.length === 0) return;
    let changed = false;
    await runWorkerQueue(unCached, 8, async (entry) => {
      try {
        const currentIcon = entry.iconUrl || entry.icon;
        const dataUrl = await urlToDataUrl(currentIcon);
        if (dataUrl && dataUrl.startsWith("data:image")) {
          entry.iconUrl = dataUrl;
          delete entry.icon;
          changed = true;
        }
      } catch (_) {
      }
    });
    if (changed) {
      saveEntries(state.entries);
      if (onUpdate) onUpdate();
    }
  }

  // src/modules/categories/manager.ts
  function getAllCategories() {
    const custom = state.entries.flatMap((e) => e.categories || []).map((c) => c.trim()).filter((c) => c && !DEFAULT_CATEGORIES.includes(c));
    const merged = [...DEFAULT_CATEGORIES, ...custom];
    return [...new Set(merged)];
  }
  function updateModeToggleUI() {
    const modeUnionBtn2 = document.getElementById("modeUnionBtn");
    const modeIntersectBtn2 = document.getElementById("modeIntersectBtn");
    if (modeUnionBtn2 && modeIntersectBtn2) {
      if (state.catFilterMode === "intersect") {
        modeUnionBtn2.classList.remove("active");
        modeIntersectBtn2.classList.add("active");
      } else {
        modeUnionBtn2.classList.add("active");
        modeIntersectBtn2.classList.remove("active");
      }
    }
  }
  function updateCatFilterLabel() {
    const catFilterLabel = document.getElementById("catFilterLabel");
    const catFilterBtn2 = document.getElementById("catFilterBtn");
    const catFilterBtnGroup = document.getElementById("catFilterBtnGroup");
    if (!catFilterLabel || !catFilterBtn2) return;
    const allCats = getAllCategories();
    const count = state.selectedFilterCategories.size;
    if (count === 0 || state.catFilterMode === "union" && count === allCats.length) {
      catFilterLabel.textContent = "All Categories";
      catFilterBtn2.classList.remove("has-filter");
      if (catFilterBtnGroup) catFilterBtnGroup.classList.remove("has-filter");
      return;
    }
    catFilterBtn2.classList.add("has-filter");
    if (catFilterBtnGroup) catFilterBtnGroup.classList.add("has-filter");
    const list = Array.from(state.selectedFilterCategories);
    if (state.catFilterMode === "intersect") {
      if (count === 1) {
        catFilterLabel.textContent = `${list[0]} (All)`;
      } else if (count === 2) {
        catFilterLabel.textContent = `${list.join(" & ")}`;
      } else {
        catFilterLabel.textContent = `${count} Categories (All)`;
      }
    } else {
      if (count === 1) {
        catFilterLabel.textContent = list[0];
      } else if (count === 2) {
        catFilterLabel.textContent = list.join(", ");
      } else {
        catFilterLabel.textContent = `${count} Categories (Any)`;
      }
    }
  }
  function populateCategories(onFilterChanged) {
    const catFilterSearchInput2 = document.getElementById("catFilterSearchInput");
    const catFilterSearchClearBtn2 = document.getElementById("catFilterSearchClearBtn");
    const catFilterList2 = document.getElementById("catFilterList");
    const allCats = getAllCategories();
    const catSet = new Set(allCats);
    for (const selected of state.selectedFilterCategories) {
      if (!catSet.has(selected)) {
        state.selectedFilterCategories.delete(selected);
      }
    }
    const counts = {};
    state.entries.forEach((e) => {
      (e.categories || []).forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    const query = catFilterSearchInput2 ? catFilterSearchInput2.value.toLowerCase().trim() : "";
    if (catFilterSearchClearBtn2) {
      catFilterSearchClearBtn2.style.display = query ? "inline-flex" : "none";
    }
    const filteredCats = query ? allCats.filter((cat) => cat.toLowerCase().includes(query)) : allCats;
    if (catFilterList2) {
      catFilterList2.innerHTML = "";
      if (filteredCats.length === 0) {
        const empty = document.createElement("div");
        empty.className = "dropdown-empty-search";
        empty.textContent = `No categories match "${query}"`;
        catFilterList2.appendChild(empty);
      } else {
        filteredCats.forEach((cat) => {
          const item = document.createElement("label");
          item.className = "dropdown-item";
          const isChecked = state.selectedFilterCategories.has(cat);
          const count = counts[cat] || 0;
          item.innerHTML = `
          <input type="checkbox" value="${escapeHtml(cat)}" ${isChecked ? "checked" : ""}>
          <span class="dropdown-item-name">${escapeHtml(cat)}</span>
          <span class="dropdown-item-count">${count}</span>
        `;
          const cb = item.querySelector("input");
          if (cb) {
            cb.addEventListener("change", () => {
              if (cb.checked) {
                state.selectedFilterCategories.add(cat);
              } else {
                state.selectedFilterCategories.delete(cat);
              }
              updateCatFilterLabel();
              if (onFilterChanged) onFilterChanged();
            });
          }
          catFilterList2.appendChild(item);
        });
      }
    }
    updateCatFilterLabel();
    const datalist = document.getElementById("categorySuggestions");
    if (datalist) {
      datalist.innerHTML = "";
      allCats.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        datalist.appendChild(opt);
      });
    }
  }
  function renderCategoryChips() {
    const container = document.getElementById("categoryTags");
    if (!container) return;
    container.innerHTML = "";
    state.selectedCategories.forEach((cat) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      const customStyle = getCategoryTagStyle(cat);
      if (customStyle) {
        const match = customStyle.match(/style="([^"]+)"/);
        if (match) chip.setAttribute("style", match[1]);
      }
      chip.innerHTML = `${escapeHtml(cat)}<button type="button" class="tag-chip-remove" title="Remove">&times;</button>`;
      const removeBtn = chip.querySelector(".tag-chip-remove");
      if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          state.selectedCategories = state.selectedCategories.filter((c) => c !== cat);
          renderCategoryChips();
          renderCategorySuggestions();
        });
      }
      container.appendChild(chip);
    });
  }
  var suggestionHighlightedIndex = -1;
  function renderCategorySuggestions() {
    const categorySuggestionsPopup2 = document.getElementById("categorySuggestionsPopup");
    const entryCategory2 = document.getElementById("entryCategory");
    if (!categorySuggestionsPopup2 || !entryCategory2) return;
    const allCats = getAllCategories();
    const query = entryCategory2.value.trim().toLowerCase();
    const available = allCats.filter((cat) => !state.selectedCategories.includes(cat));
    const matches = query ? available.filter((cat) => cat.toLowerCase().includes(query)) : available;
    const counts = {};
    state.entries.forEach((e) => {
      (e.categories || []).forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    categorySuggestionsPopup2.innerHTML = "";
    suggestionHighlightedIndex = -1;
    if (matches.length === 0) {
      categorySuggestionsPopup2.style.display = "none";
      return;
    }
    matches.forEach((cat) => {
      const count = counts[cat] || 0;
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.innerHTML = `
      <span class="suggestion-name">${escapeHtml(cat)}</span>
      <span class="suggestion-count">${count} site${count !== 1 ? "s" : ""}</span>
    `;
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        addTag(cat);
      });
      categorySuggestionsPopup2.appendChild(item);
    });
    categorySuggestionsPopup2.style.display = "flex";
  }
  function hideCategorySuggestions() {
    const categorySuggestionsPopup2 = document.getElementById("categorySuggestionsPopup");
    if (categorySuggestionsPopup2) {
      categorySuggestionsPopup2.style.display = "none";
      suggestionHighlightedIndex = -1;
    }
  }
  function setSuggestionHighlight(newIndex) {
    const categorySuggestionsPopup2 = document.getElementById("categorySuggestionsPopup");
    if (!categorySuggestionsPopup2) return;
    const items = categorySuggestionsPopup2.querySelectorAll(".suggestion-item");
    items.forEach((el) => el.classList.remove("is-focused"));
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
      target.classList.add("is-focused");
      target.scrollIntoView({ block: "nearest" });
    }
  }
  function addTag(val) {
    const clean = (val || "").trim();
    if (clean && !state.selectedCategories.includes(clean)) {
      state.selectedCategories.push(clean);
      renderCategoryChips();
    }
    const entryCategory2 = document.getElementById("entryCategory");
    if (entryCategory2) {
      entryCategory2.value = "";
    }
    hideCategorySuggestions();
  }
  function getUsedCategories() {
    const counts = {};
    state.entries.forEach((e) => {
      (e.categories || []).forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }

  // src/modules/folders/sidebar.ts
  function initSidebar() {
    const foldersSidebar = document.getElementById("foldersSidebar");
    const isCollapsed = localStorage.getItem(SIDEBAR_STATE_KEY) === "true";
    if (foldersSidebar) {
      foldersSidebar.classList.toggle("collapsed", isCollapsed);
    }
  }
  function toggleSidebar() {
    const foldersSidebar = document.getElementById("foldersSidebar");
    if (!foldersSidebar) return;
    foldersSidebar.classList.toggle("collapsed");
    const isCollapsed = foldersSidebar.classList.contains("collapsed");
    localStorage.setItem(SIDEBAR_STATE_KEY, String(isCollapsed));
  }
  function setActiveFolder(folderId, onFolderChanged) {
    state.activeFolderId = folderId;
    renderFoldersSidebar(onFolderChanged);
    if (onFolderChanged) onFolderChanged();
  }
  function updateActiveFolderBanner(onFolderChanged) {
    const activeFolderBanner = document.getElementById("activeFolderBanner");
    const folderBannerIcon = document.getElementById("folderBannerIcon");
    const folderBannerTitle = document.getElementById("folderBannerTitle");
    const folderBannerCount = document.getElementById("folderBannerCount");
    const bannerActions = document.getElementById("folderBannerActions");
    if (!activeFolderBanner) return;
    if (activeFolderBanner.style && typeof activeFolderBanner.style.removeProperty === "function") {
      activeFolderBanner.style.removeProperty("--folder-color");
    }
    if (state.activeFolderId && state.activeFolderId.startsWith("f-")) {
      const folder = state.folders.find((f) => f.id === state.activeFolderId);
      if (folder) {
        const folderCount = state.entries.filter((e) => e.folderId === folder.id).length;
        if (activeFolderBanner.style && typeof activeFolderBanner.style.setProperty === "function") {
          activeFolderBanner.style.setProperty("--folder-color", folder.color || "#0a84ff");
        }
        if (folderBannerIcon) folderBannerIcon.textContent = folder.icon || "\u{1F4C1}";
        if (folderBannerTitle) folderBannerTitle.textContent = folder.name;
        if (folderBannerCount) folderBannerCount.textContent = `${folderCount} site${folderCount !== 1 ? "s" : ""}`;
        if (bannerActions) bannerActions.style.display = "flex";
        activeFolderBanner.style.display = "flex";
        return;
      }
    } else if (state.activeFolderId === "favorites") {
      const favCount = state.entries.filter((e) => e.isFavorite).length;
      if (folderBannerIcon) folderBannerIcon.textContent = "\u2B50";
      if (folderBannerTitle) folderBannerTitle.textContent = "Favorites";
      if (folderBannerCount) folderBannerCount.textContent = `${favCount} site${favCount !== 1 ? "s" : ""}`;
      if (bannerActions) bannerActions.style.display = "none";
      activeFolderBanner.style.display = "flex";
      return;
    } else if (state.activeFolderId === "unorganized") {
      const unorgCount = state.entries.filter((e) => !e.folderId).length;
      if (folderBannerIcon) folderBannerIcon.textContent = "\u{1F4C2}";
      if (folderBannerTitle) folderBannerTitle.textContent = "Unorganized";
      if (folderBannerCount) folderBannerCount.textContent = `${unorgCount} site${unorgCount !== 1 ? "s" : ""}`;
      if (bannerActions) bannerActions.style.display = "none";
      activeFolderBanner.style.display = "flex";
      return;
    } else if (state.activeFolderId === "broken") {
      const brokenCount = state.entries.filter((e) => e.health && e.health.status === "broken").length;
      if (folderBannerIcon) folderBannerIcon.textContent = "\u26A0\uFE0F";
      if (folderBannerTitle) folderBannerTitle.textContent = "Broken / Offline Links";
      if (folderBannerCount) folderBannerCount.textContent = `${brokenCount} site${brokenCount !== 1 ? "s" : ""}`;
      if (bannerActions) bannerActions.style.display = "none";
      activeFolderBanner.style.display = "flex";
      return;
    }
    activeFolderBanner.style.display = "none";
  }
  function setupFolderDropTarget(element, targetFolderId, onDropSuccess) {
    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
      element.classList.add("drag-over");
    });
    element.addEventListener("dragleave", () => {
      element.classList.remove("drag-over");
    });
    element.addEventListener("drop", (e) => {
      e.preventDefault();
      element.classList.remove("drag-over");
      if (!e.dataTransfer) return;
      const entryId = e.dataTransfer.getData("text/plain");
      if (!entryId) return;
      const diskList = getLatestStoredEntries();
      const entry = diskList.find((item) => item.id === entryId);
      if (!entry) return;
      if (targetFolderId === "favorites") {
        entry.isFavorite = true;
        entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
        saveEntries(diskList);
        if (onDropSuccess) onDropSuccess();
        showToast(`Pinned "${entry.name}" to Favorites \u2B50`);
      } else if (targetFolderId === "unorganized") {
        entry.folderId = null;
        entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
        saveEntries(diskList);
        if (onDropSuccess) onDropSuccess();
        showToast(`Moved "${entry.name}" to Unorganized`);
      } else if (targetFolderId === "all" || targetFolderId === "broken") {
      } else {
        const folder = state.folders.find((f) => f.id === targetFolderId);
        entry.folderId = targetFolderId;
        entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
        saveEntries(diskList);
        if (onDropSuccess) onDropSuccess();
        showToast(`Moved "${entry.name}" to ${folder ? folder.name : "folder"} \u{1F4C1}`);
      }
    });
  }
  function deleteFolder(folderId, onFolderDeleted) {
    const folder = state.folders.find((f) => f.id === folderId);
    if (!folder) return;
    if (!confirm(`Delete folder "${folder.name}"? Bookmarks inside will become unorganized.`)) return;
    state.folders = state.folders.filter((f) => f.id !== folderId);
    saveFolders(state.folders);
    const diskList = getLatestStoredEntries();
    diskList.forEach((e) => {
      if (e.folderId === folderId) {
        e.folderId = null;
        e.dateModified = (/* @__PURE__ */ new Date()).toISOString();
      }
    });
    saveEntries(diskList);
    if (state.activeFolderId === folderId) {
      state.activeFolderId = "all";
    }
    renderFoldersSidebar(onFolderDeleted);
    if (onFolderDeleted) onFolderDeleted();
    showToast(`Deleted folder "${folder.name}"`);
  }
  function renderFoldersSidebar(onFolderChanged, onEditFolder) {
    const sidebarFoldersList = document.getElementById("sidebarFoldersList");
    const sidebarQuickViews2 = document.getElementById("sidebarQuickViews");
    const countAll = document.getElementById("countAll");
    const countFavorites = document.getElementById("countFavorites");
    const countUnorganized = document.getElementById("countUnorganized");
    const countBroken = document.getElementById("countBroken");
    const sidebarBrokenView = document.getElementById("sidebarBrokenView");
    if (!sidebarFoldersList) return;
    const diskList = state.entries;
    const allTotal = diskList.length;
    const favTotal = diskList.filter((e) => e.isFavorite).length;
    const unorgTotal = diskList.filter((e) => !e.folderId).length;
    const brokenTotal = diskList.filter((e) => e.health && e.health.status === "broken").length;
    if (countAll) countAll.textContent = String(allTotal);
    if (countFavorites) countFavorites.textContent = String(favTotal);
    if (countUnorganized) countUnorganized.textContent = String(unorgTotal);
    if (countBroken) countBroken.textContent = String(brokenTotal);
    if (sidebarBrokenView) {
      sidebarBrokenView.style.display = brokenTotal > 0 ? "flex" : "none";
    }
    if (sidebarQuickViews2) {
      sidebarQuickViews2.querySelectorAll(".sidebar-nav-item").forEach((item) => {
        const el = item;
        const fid = el.getAttribute("data-folder-id") || "all";
        el.classList.toggle("active", fid === state.activeFolderId);
        setupFolderDropTarget(el, fid, onFolderChanged);
      });
    }
    sidebarFoldersList.innerHTML = "";
    state.folders.forEach((folder) => {
      const folderCount = diskList.filter((e) => e.folderId === folder.id).length;
      const item = document.createElement("button");
      item.type = "button";
      item.className = `sidebar-nav-item ${state.activeFolderId === folder.id ? "active" : ""}`;
      item.setAttribute("data-folder-id", folder.id);
      if (folder.color && item.style && typeof item.style.setProperty === "function") {
        item.style.setProperty("--folder-color", folder.color);
      }
      item.innerHTML = `
      <span class="sidebar-item-icon">${escapeHtml(folder.icon || "\u{1F4C1}")}</span>
      <span class="sidebar-item-name">${escapeHtml(folder.name)}</span>
      <span class="sidebar-item-count">${folderCount}</span>
      <div class="sidebar-item-actions">
        <button type="button" class="sidebar-action-btn edit-folder-action" title="Edit folder">\u270F\uFE0F</button>
        <button type="button" class="sidebar-action-btn delete-folder-action" title="Delete folder">\u{1F5D1}\uFE0F</button>
      </div>
    `;
      item.addEventListener("click", (e) => {
        const target = e.target;
        if (target.closest(".edit-folder-action") || target.closest(".delete-folder-action")) return;
        setActiveFolder(folder.id, onFolderChanged);
      });
      const editBtn = item.querySelector(".edit-folder-action");
      if (editBtn) {
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (onEditFolder) onEditFolder(folder.id);
        });
      }
      const delBtn = item.querySelector(".delete-folder-action");
      if (delBtn) {
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteFolder(folder.id, onFolderChanged);
        });
      }
      setupFolderDropTarget(item, folder.id, onFolderChanged);
      sidebarFoldersList.appendChild(item);
    });
    updateActiveFolderBanner(onFolderChanged);
  }
  function populateFolderSelect(selectedId = "") {
    const entryFolder2 = document.getElementById("entryFolder");
    if (!entryFolder2) return;
    entryFolder2.innerHTML = '<option value="">\u{1F4C2} None (Unorganized)</option>';
    state.folders.forEach((folder) => {
      const opt = document.createElement("option");
      opt.value = folder.id;
      opt.textContent = `${folder.icon || "\u{1F4C1}"} ${folder.name}`;
      if (selectedId && folder.id === selectedId) {
        opt.selected = true;
      }
      entryFolder2.appendChild(opt);
    });
  }

  // src/modules/bookmarks/crud.ts
  var lastAutoDetectedUrl = "";
  var isAutoDetecting = false;
  async function autoFillUrlMetadata(force = false) {
    const entryUrl2 = document.getElementById("entryUrl");
    const entryName2 = document.getElementById("entryName");
    const entryIcon2 = document.getElementById("entryIcon");
    const entryDescription2 = document.getElementById("entryDescription");
    const entryIconPreview2 = document.getElementById("entryIconPreview");
    const iconCandidatesWrapper = document.getElementById("iconCandidatesWrapper");
    const urlAutofillStatus = document.getElementById("urlAutofillStatus");
    const autoDetectBtn2 = document.getElementById("autoDetectBtn");
    if (!entryUrl2) return;
    const rawUrl = entryUrl2.value.trim();
    if (!rawUrl || !rawUrl.includes(".") && !rawUrl.startsWith("localhost")) {
      if (iconCandidatesWrapper) iconCandidatesWrapper.style.display = "none";
      return;
    }
    renderIconCandidates(rawUrl, "", "google");
    if (!force && rawUrl === lastAutoDetectedUrl) {
      return;
    }
    if (isAutoDetecting) return;
    isAutoDetecting = true;
    lastAutoDetectedUrl = rawUrl;
    if (urlAutofillStatus) {
      urlAutofillStatus.className = "url-autofill-status loading";
      urlAutofillStatus.textContent = "\u{1FA84} Detecting info\u2026";
      urlAutofillStatus.style.display = "inline-flex";
    }
    if (autoDetectBtn2) autoDetectBtn2.disabled = true;
    try {
      const meta = await fetchWebsiteMetadata(rawUrl);
      if (meta) {
        const currentName = entryName2 ? entryName2.value.trim() : "";
        if (meta.title && (force || !currentName)) {
          if (entryName2) entryName2.value = meta.title;
        }
        const currentDesc = entryDescription2 ? entryDescription2.value.trim() : "";
        if (meta.description && (force || !currentDesc)) {
          if (entryDescription2) entryDescription2.value = meta.description;
        }
        renderIconCandidates(rawUrl, meta.iconUrl, "google");
        const currentIcon = entryIcon2 ? entryIcon2.value.trim() : "";
        if (force || !currentIcon) {
          const googleCand = getCandidateSources(rawUrl, meta.iconUrl).find((c) => c.id === "google");
          const defaultSrc = googleCand ? googleCand.iconSrc : meta.iconUrl;
          if (entryIcon2) entryIcon2.value = defaultSrc;
          if (entryIconPreview2) {
            entryIconPreview2.innerHTML = `<img src="${escapeHtml(defaultSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">`;
          }
        }
        if (urlAutofillStatus) {
          urlAutofillStatus.className = "url-autofill-status success";
          urlAutofillStatus.textContent = `\u2713 ${meta.title ? meta.title.slice(0, 24) + (meta.title.length > 24 ? "\u2026" : "") : "Detected"}`;
          setTimeout(() => {
            if (urlAutofillStatus.className.includes("success")) {
              urlAutofillStatus.style.display = "none";
            }
          }, 3500);
        }
      }
    } catch {
      if (urlAutofillStatus) {
        urlAutofillStatus.style.display = "none";
      }
    } finally {
      isAutoDetecting = false;
      if (autoDetectBtn2) autoDetectBtn2.disabled = false;
    }
  }
  function updateModalIconPreview() {
    const entryIconPreview2 = document.getElementById("entryIconPreview");
    const entryIcon2 = document.getElementById("entryIcon");
    const entryUrl2 = document.getElementById("entryUrl");
    if (!entryIconPreview2) return;
    const custom = entryIcon2?.value.trim() || "";
    const url = entryUrl2?.value.trim() || "";
    const resolved = custom || (url ? getFaviconUrl(url) : "");
    if (resolved) {
      entryIconPreview2.innerHTML = `<img src="${escapeHtml(resolved)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">`;
    } else {
      entryIconPreview2.innerHTML = '<span class="icon-fallback">\u{1F310}</span>';
    }
  }
  function openModal(id = null) {
    state.editingId = id;
    lastAutoDetectedUrl = "";
    const urlAutofillStatus = document.getElementById("urlAutofillStatus");
    const modalTitle = document.getElementById("modalTitle");
    const saveBtn = document.getElementById("saveBtn");
    const entryName2 = document.getElementById("entryName");
    const entryUrl2 = document.getElementById("entryUrl");
    const entryIcon2 = document.getElementById("entryIcon");
    const entryDescription2 = document.getElementById("entryDescription");
    const entryFavorite2 = document.getElementById("entryFavorite");
    const entryForm2 = document.getElementById("entryForm");
    const iconCandidatesWrapper = document.getElementById("iconCandidatesWrapper");
    const entryCategory2 = document.getElementById("entryCategory");
    const modalBackdrop2 = document.getElementById("modalBackdrop");
    if (urlAutofillStatus) urlAutofillStatus.style.display = "none";
    if (id) {
      const entry = state.entries.find((e) => e.id === id);
      if (!entry) return;
      if (modalTitle) modalTitle.textContent = "Edit Website";
      if (saveBtn) saveBtn.textContent = "Update";
      if (entryName2) entryName2.value = entry.name || "";
      if (entryUrl2) entryUrl2.value = entry.url || "";
      populateFolderSelect(entry.folderId || "");
      state.selectedCategories = [...entry.categories || []];
      const icon = entry.icon || entry.iconUrl || "";
      if (entryIcon2) entryIcon2.value = icon;
      if (entryDescription2) entryDescription2.value = entry.description || "";
      if (entryFavorite2) entryFavorite2.checked = entry.isFavorite || false;
      renderIconCandidates(entry.url, icon, "google");
    } else {
      if (modalTitle) modalTitle.textContent = "Add Website";
      if (saveBtn) saveBtn.textContent = "Save";
      if (entryForm2) entryForm2.reset();
      const defaultFid = state.activeFolderId && state.activeFolderId.startsWith("f-") ? state.activeFolderId : "";
      populateFolderSelect(defaultFid);
      state.selectedCategories = [];
      if (iconCandidatesWrapper) iconCandidatesWrapper.style.display = "none";
    }
    if (entryCategory2) entryCategory2.value = "";
    hideCategorySuggestions();
    renderCategoryChips();
    updateModalIconPreview();
    if (entryForm2) {
      entryForm2.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
    }
    if (modalBackdrop2) modalBackdrop2.classList.add("active");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      if (entryUrl2) {
        entryUrl2.focus();
        if (entryUrl2.select) entryUrl2.select();
      }
    }, 100);
  }
  function closeModal() {
    hideCategorySuggestions();
    const modalBackdrop2 = document.getElementById("modalBackdrop");
    if (modalBackdrop2) modalBackdrop2.classList.remove("active");
    document.body.style.overflow = "";
    state.editingId = null;
  }
  async function addEntry(data, onUpdate) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const rawIcon = data.icon || data.iconUrl || getFaviconUrl(data.url);
    const entry = {
      id: generateId(),
      name: data.name,
      url: ensureProtocol(data.url),
      description: data.description || "",
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
    state.entries = diskList;
    saveEntries(diskList);
    if (onUpdate) onUpdate();
    showToast(`"${entry.name}" added!`);
    const targetIcon = entry.iconUrl || entry.icon;
    if (targetIcon && !targetIcon.startsWith("data:")) {
      const permanentDataUrl = await urlToDataUrl(targetIcon);
      if (permanentDataUrl && permanentDataUrl.startsWith("data:")) {
        const latest = getLatestStoredEntries();
        const target = latest.find((e) => e.id === entry.id);
        if (target) {
          target.iconUrl = permanentDataUrl;
          delete target.icon;
          saveEntries(latest);
          const grid = document.getElementById("grid");
          const card = grid ? grid.querySelector(`.card[data-id="${entry.id}"]`) : null;
          if (card) {
            const iconDiv = card.querySelector(".card-icon:not(.new-icon-preview)");
            if (iconDiv) {
              iconDiv.innerHTML = `<img src="${escapeHtml(permanentDataUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">`;
            }
          }
        }
      }
    }
  }
  async function updateEntry(id, data, onUpdate) {
    const diskList = getLatestStoredEntries();
    const rawIcon = data.icon || data.iconUrl || getFaviconUrl(data.url);
    let target = diskList.find((e) => e.id === id);
    if (!target) {
      target = {
        id,
        name: data.name,
        url: ensureProtocol(data.url),
        description: data.description || "",
        iconUrl: rawIcon,
        folderId: data.folderId || null,
        categories: data.categories || [],
        dateAdded: (/* @__PURE__ */ new Date()).toISOString(),
        dateModified: (/* @__PURE__ */ new Date()).toISOString(),
        visitCount: 0,
        lastVisited: null,
        isFavorite: data.isFavorite || false
      };
      diskList.push(target);
    } else {
      target.name = data.name;
      target.url = ensureProtocol(data.url);
      target.description = data.description || "";
      target.iconUrl = rawIcon;
      delete target.icon;
      target.folderId = data.folderId !== void 0 ? data.folderId : target.folderId || null;
      target.categories = data.categories || [];
      target.isFavorite = data.isFavorite || false;
      target.dateModified = (/* @__PURE__ */ new Date()).toISOString();
    }
    const finalTarget = target;
    state.entries = diskList;
    saveEntries(diskList);
    if (onUpdate) onUpdate();
    showToast(`"${finalTarget.name}" updated!`);
    if (state.pendingIcons.has(id)) {
      state.pendingIcons.delete(id);
      updatePendingIconsUI();
    }
    const targetIcon = finalTarget.iconUrl || finalTarget.icon;
    if (targetIcon && !targetIcon.startsWith("data:")) {
      const permanentDataUrl = await urlToDataUrl(targetIcon);
      if (permanentDataUrl && permanentDataUrl.startsWith("data:")) {
        const latest = getLatestStoredEntries();
        const item = latest.find((e) => e.id === id);
        if (item) {
          item.iconUrl = permanentDataUrl;
          delete item.icon;
          saveEntries(latest);
          const grid = document.getElementById("grid");
          const card = grid ? grid.querySelector(`.card[data-id="${id}"]`) : null;
          if (card) {
            const iconDiv = card.querySelector(".card-icon:not(.new-icon-preview)");
            if (iconDiv) {
              iconDiv.innerHTML = `<img src="${escapeHtml(permanentDataUrl)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">`;
            }
          }
        }
      }
    }
  }
  function deleteEntry(id, onUpdate) {
    const entry = state.entries.find((e) => e.id === id);
    if (!entry) return;
    if (!confirm(`Delete "${entry.name}"?`)) return;
    if (state.pendingIcons.has(id)) {
      state.pendingIcons.delete(id);
      updatePendingIconsUI();
    }
    const diskList = getLatestStoredEntries();
    const filtered = diskList.filter((e) => e.id !== id);
    saveEntries(filtered);
    showToast(`"${entry.name}" deleted.`);
    if (onUpdate) onUpdate();
  }
  function toggleFavorite(id, onUpdate) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find((e) => e.id === id);
    if (!entry) return;
    entry.isFavorite = !entry.isFavorite;
    entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
    saveEntries(diskList);
    if (onUpdate) onUpdate();
  }
  function visitEntry(id, onUpdate) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find((e) => e.id === id);
    if (!entry) return;
    entry.visitCount = (entry.visitCount || 0) + 1;
    entry.lastVisited = (/* @__PURE__ */ new Date()).toISOString();
    entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
    saveEntries(diskList);
    window.open(entry.url, "_blank", "noopener,noreferrer");
    if (onUpdate) onUpdate();
  }

  // src/modules/bookmarks/filter-sort.ts
  function getFilteredEntries() {
    const searchInput2 = document.getElementById("searchInput");
    const sortSelect2 = document.getElementById("sortSelect");
    const query = (searchInput2?.value || "").toLowerCase().trim();
    const sortVal = sortSelect2?.value || "dateAdded-desc";
    const [sortField, sortDir] = sortVal.split("-");
    let filtered = [...state.entries];
    if (query) {
      filtered = filtered.filter(
        (e) => (e.name || "").toLowerCase().includes(query) || (e.url || "").toLowerCase().includes(query) || (e.description || "").toLowerCase().includes(query)
      );
    }
    const allCats = getAllCategories();
    if (state.selectedFilterCategories.size > 0) {
      if (state.catFilterMode === "intersect") {
        const required = Array.from(state.selectedFilterCategories);
        filtered = filtered.filter((e) => {
          const entryCats = e.categories || [];
          return required.every((reqCat) => entryCats.includes(reqCat));
        });
      } else {
        if (state.selectedFilterCategories.size < allCats.length) {
          filtered = filtered.filter(
            (e) => (e.categories || []).some((cat) => state.selectedFilterCategories.has(cat))
          );
        }
      }
    }
    if (state.activeFolderId === "favorites") {
      filtered = filtered.filter((e) => e.isFavorite);
    } else if (state.activeFolderId === "unorganized") {
      filtered = filtered.filter((e) => !e.folderId);
    } else if (state.activeFolderId === "broken") {
      filtered = filtered.filter((e) => e.health && e.health.status === "broken");
    } else if (state.activeFolderId && state.activeFolderId !== "all") {
      filtered = filtered.filter((e) => e.folderId === state.activeFolderId);
    }
    filtered.sort((a, b) => {
      if (state.pinFavorites) {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
      }
      let valA, valB;
      if (sortField === "name") {
        valA = (a.name || "").toLowerCase();
        valB = (b.name || "").toLowerCase();
        const cmp = valA.localeCompare(valB);
        return sortDir === "asc" ? cmp : -cmp;
      }
      if (sortField === "visitCount") {
        valA = a.visitCount || 0;
        valB = b.visitCount || 0;
        return sortDir === "desc" ? valB - valA : valA - valB;
      }
      if (sortField === "lastVisited") {
        valA = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
        valB = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
        return sortDir === "desc" ? valB - valA : valA - valB;
      }
      valA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
      valB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
      return sortDir === "desc" ? valB - valA : valA - valB;
    });
    return filtered;
  }
  function updatePinFavoritesButtonState() {
    const pinFavoritesBtn2 = document.getElementById("pinFavoritesBtn");
    if (!pinFavoritesBtn2) return;
    pinFavoritesBtn2.classList.toggle("active", state.pinFavorites);
    pinFavoritesBtn2.setAttribute("aria-pressed", String(state.pinFavorites));
    pinFavoritesBtn2.title = state.pinFavorites ? "Favorites pinned to top (Click to restore natural sort)" : "Pin favorites to the top of the list";
  }

  // src/modules/insights/dashboard.ts
  var savedOnVisit = null;
  var savedOnDelete = null;
  var savedOnFilterChanged = null;
  function toggleInsightsDrawer(openState, onVisit, onDelete, onFilterChanged) {
    if (typeof onVisit === "function") savedOnVisit = onVisit;
    if (typeof onDelete === "function") savedOnDelete = onDelete;
    if (typeof onFilterChanged === "function") savedOnFilterChanged = onFilterChanged;
    const insightsToggleBtn2 = document.getElementById("insightsToggleBtn");
    const insightsDrawer = document.getElementById("insightsDrawer");
    if (typeof openState === "boolean") {
      state.isInsightsOpen = openState;
    } else {
      state.isInsightsOpen = !state.isInsightsOpen;
    }
    localStorage.setItem(INSIGHTS_STATE_KEY, String(state.isInsightsOpen));
    if (insightsToggleBtn2) {
      insightsToggleBtn2.classList.toggle("active", state.isInsightsOpen);
      insightsToggleBtn2.setAttribute("aria-expanded", String(state.isInsightsOpen));
    }
    if (insightsDrawer) {
      insightsDrawer.style.display = state.isInsightsOpen ? "block" : "none";
    }
    if (state.isInsightsOpen) {
      renderInsightsDashboard(savedOnVisit || void 0, savedOnDelete || void 0, savedOnFilterChanged || void 0);
    }
  }
  function renderInsightsDashboard(onVisit, onDelete, onFilterChanged) {
    if (typeof onVisit === "function") savedOnVisit = onVisit;
    if (typeof onDelete === "function") savedOnDelete = onDelete;
    if (typeof onFilterChanged === "function") savedOnFilterChanged = onFilterChanged;
    const effectiveOnVisit = onVisit || savedOnVisit;
    const effectiveOnDelete = onDelete || savedOnDelete;
    const effectiveOnFilterChanged = onFilterChanged || savedOnFilterChanged;
    const insightsDrawer = document.getElementById("insightsDrawer");
    const insightsHeaderStats = document.getElementById("insightsHeaderStats");
    const insightsBody = document.getElementById("insightsBody");
    const catFilterList2 = document.getElementById("catFilterList");
    const grid = document.getElementById("grid");
    const activeCatFilterBanner = document.getElementById("activeCatFilterBanner");
    if (!insightsDrawer || !state.isInsightsOpen) return;
    const totalSites = state.entries.length;
    let totalLaunches = 0;
    state.entries.forEach((e) => {
      totalLaunches += e.visitCount || 0;
    });
    const allCats = getAllCategories();
    const totalFolders = state.folders.length;
    if (insightsHeaderStats) {
      insightsHeaderStats.innerHTML = `
      <div class="insights-stat-pill" title="Total saved bookmarks">
        <span>Sites:</span>
        <span class="insights-stat-num">${totalSites}</span>
      </div>
      <div class="insights-stat-pill" title="Total launches / clicks">
        <span>Launches:</span>
        <span class="insights-stat-num">${totalLaunches}</span>
      </div>
      <div class="insights-stat-pill" title="Unique categories">
        <span>Categories:</span>
        <span class="insights-stat-num">${allCats.length}</span>
      </div>
      <div class="insights-stat-pill" title="Folders created">
        <span>Folders:</span>
        <span class="insights-stat-num">${totalFolders}</span>
      </div>
    `;
    }
    if (!insightsBody) return;
    const visitedSites = [...state.entries].filter((e) => (e.visitCount || 0) > 0).sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0)).slice(0, 6);
    const recentlyAdded = [...state.entries].sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime()).slice(0, 5);
    const catCounts = {};
    let totalCatAssignments = 0;
    state.entries.forEach((e) => {
      (e.categories || []).forEach((c) => {
        catCounts[c] = (catCounts[c] || 0) + 1;
        totalCatAssignments++;
      });
    });
    const sortedCats = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);
    const now = Date.now();
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1e3;
    const dormantEntries = state.entries.filter((e) => {
      if (e.lastVisited) {
        return now - new Date(e.lastVisited).getTime() > NINETY_DAYS_MS;
      }
      if (e.dateAdded) {
        return now - new Date(e.dateAdded).getTime() > NINETY_DAYS_MS && (!e.visitCount || e.visitCount === 0);
      }
      return false;
    }).slice(0, 5);
    let html = `<div class="insights-grid">`;
    html += `
    <div class="insight-widget">
      <div class="insight-widget-header">
        <div class="insight-widget-title">
          <span>\u26A1</span>
          <span>Speed Dial (Top Visited)</span>
        </div>
        <span class="insight-widget-badge">${visitedSites.length} site${visitedSites.length !== 1 ? "s" : ""}</span>
      </div>
      <div class="speed-dial-grid">
  `;
    if (visitedSites.length === 0) {
      html += `
      <div style="grid-column: 1/-1; padding: 16px 8px; text-align: center; color: var(--text-tertiary); font-size: 0.8rem;">
        No visits recorded yet. Launch websites from your directory to populate your Speed Dial!
      </div>
    `;
    } else {
      visitedSites.forEach((site) => {
        const siteIcon = site.iconUrl || site.icon;
        html += `
        <div class="speed-dial-card" data-id="${escapeHtml(site.id)}" title="Launch ${escapeHtml(
          site.name
        )} (${site.visitCount} visits)">
          <div class="speed-dial-icon">
            ${siteIcon ? `<img src="${escapeHtml(siteIcon)}" alt="" onerror="this.parentElement.innerHTML='\u{1F310}'">` : "\u{1F310}"}
          </div>
          <div class="speed-dial-info">
            <span class="speed-dial-name">${escapeHtml(site.name)}</span>
            <span class="speed-dial-visits">\u{1F680} ${site.visitCount} visit${site.visitCount !== 1 ? "s" : ""}</span>
          </div>
        </div>
      `;
      });
    }
    html += `
      </div>
    </div>
  `;
    html += `
    <div class="insight-widget">
      <div class="insight-widget-header">
        <div class="insight-widget-title">
          <span>\u{1F552}</span>
          <span>Recently Added</span>
        </div>
        <span class="insight-widget-badge">Latest ${recentlyAdded.length}</span>
      </div>
      <div class="recent-list">
  `;
    if (recentlyAdded.length === 0) {
      html += `
      <div style="padding: 16px 8px; text-align: center; color: var(--text-tertiary); font-size: 0.8rem;">
        No websites saved yet.
      </div>
    `;
    } else {
      recentlyAdded.forEach((site) => {
        const domain = getDomain(site.url);
        const siteIcon = site.iconUrl || site.icon;
        html += `
        <div class="recent-item" data-id="${escapeHtml(site.id)}" title="Open ${escapeHtml(site.name)}">
          <div class="recent-left">
            <div class="recent-icon">
              ${siteIcon ? `<img src="${escapeHtml(siteIcon)}" alt="" onerror="this.parentElement.innerHTML='\u{1F310}'">` : "\u{1F310}"}
            </div>
            <div>
              <div class="recent-name">${escapeHtml(site.name)}</div>
              <div class="recent-domain">${escapeHtml(domain)}</div>
            </div>
          </div>
          <span class="recent-date">${timeAgo(site.dateAdded)}</span>
        </div>
      `;
      });
    }
    html += `
      </div>
    </div>
  `;
    const hasCategoryFilter = state.selectedFilterCategories.size > 0 && state.selectedFilterCategories.size < allCats.length;
    html += `
    <div class="insight-widget">
      <div class="insight-widget-header">
        <div class="insight-widget-title">
          <span>\u{1F3F7}\uFE0F</span>
          <span>Category Distribution</span>
          ${hasCategoryFilter ? `<button type="button" class="category-dist-clear-btn" id="catDistClearBtn" title="Reset filter to show all categories">\u2715 Clear</button>` : ""}
        </div>
        <span class="insight-widget-badge">${sortedCats.length} active</span>
      </div>
      <div>
  `;
    if (sortedCats.length === 0) {
      html += `
      <div style="padding: 16px 8px; text-align: center; color: var(--text-tertiary); font-size: 0.8rem;">
        No categories assigned to bookmarks yet.
      </div>
    `;
    } else {
      html += `<div class="category-dist-bar" title="Category distribution share">`;
      sortedCats.forEach((cat) => {
        const count = catCounts[cat];
        const pct = totalCatAssignments > 0 ? (count / totalCatAssignments * 100).toFixed(1) : "0";
        const color = state.categoryColors && state.categoryColors[cat.toLowerCase()] || "var(--accent)";
        const isSelected = state.selectedFilterCategories.has(cat);
        const segmentClasses = ["category-dist-segment"];
        if (hasCategoryFilter) {
          if (isSelected) segmentClasses.push("is-active");
          else segmentClasses.push("is-dimmed");
        }
        html += `
        <div class="${segmentClasses.join(" ")}" data-cat="${escapeHtml(cat)}" style="width: ${pct}%; background-color: ${escapeHtml(
          color
        )};" title="${escapeHtml(cat)}: ${count} (${pct}%) ${isSelected ? "\u2022 Currently filtered (Click to clear)" : "\u2022 Click to filter"}"></div>
      `;
      });
      html += `</div>`;
      html += `<div class="category-chips-list">`;
      sortedCats.forEach((cat) => {
        const count = catCounts[cat];
        const pct = totalCatAssignments > 0 ? Math.round(count / totalCatAssignments * 100) : 0;
        const color = state.categoryColors && state.categoryColors[cat.toLowerCase()] || "var(--accent)";
        const isSelected = state.selectedFilterCategories.has(cat);
        const chipClasses = ["category-chip-item"];
        if (hasCategoryFilter) {
          if (isSelected) chipClasses.push("is-active");
          else chipClasses.push("is-dimmed");
        }
        html += `
        <div class="${chipClasses.join(" ")}" data-cat="${escapeHtml(cat)}" style="--cat-accent: ${escapeHtml(
          color
        )};" title="${isSelected ? "Active filter (Click to reset)" : "Filter by " + escapeHtml(cat)}">
          <span class="category-chip-dot" style="background-color: ${escapeHtml(color)};"></span>
          ${isSelected ? '<span class="category-chip-check">\u2713</span>' : ""}
          <span class="category-chip-name">${escapeHtml(cat)}</span>
          <span class="category-chip-count">(${count})</span>
          <span class="category-chip-pct">${pct}%</span>
        </div>
      `;
      });
      html += `</div>`;
    }
    html += `
      </div>
    </div>
  `;
    html += `
    <div class="insight-widget">
      <div class="insight-widget-header">
        <div class="insight-widget-title">
          <span>\u{1F4A4}</span>
          <span>Dormant Links (90+ Days)</span>
        </div>
        <span class="insight-widget-badge">${dormantEntries.length} found</span>
      </div>
      <div class="dormant-list">
  `;
    if (dormantEntries.length === 0) {
      html += `
      <div class="dormant-empty-badge">
        <span>\u2728</span>
        <span>All clear! No dormant bookmarks unvisited for 90+ days.</span>
      </div>
    `;
    } else {
      dormantEntries.forEach((entry) => {
        const days = entry.lastVisited ? Math.floor((now - new Date(entry.lastVisited).getTime()) / (24 * 60 * 60 * 1e3)) : Math.floor((now - new Date(entry.dateAdded).getTime()) / (24 * 60 * 60 * 1e3));
        const reason = entry.lastVisited ? `Not visited in ${days}d` : `Never visited (${days}d old)`;
        html += `
        <div class="dormant-item" data-id="${escapeHtml(entry.id)}">
          <div class="dormant-left">
            <span style="font-size: 1rem;">\u{1F4A4}</span>
            <div>
              <div class="dormant-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
              <div class="dormant-reason">${escapeHtml(reason)}</div>
            </div>
          </div>
          <div class="dormant-actions">
            <button type="button" class="btn btn-secondary dormant-action-btn dormant-visit-btn" data-id="${escapeHtml(
          entry.id
        )}" title="Launch website">Visit</button>
            <button type="button" class="btn btn-danger dormant-action-btn dormant-delete-btn" data-id="${escapeHtml(
          entry.id
        )}" title="Delete bookmark">Delete</button>
          </div>
        </div>
      `;
      });
    }
    html += `
      </div>
    </div>
  `;
    html += `</div>`;
    insightsBody.innerHTML = html;
    insightsBody.querySelectorAll(".speed-dial-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        if (id && effectiveOnVisit) effectiveOnVisit(id);
      });
    });
    insightsBody.querySelectorAll(".recent-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-id");
        if (id && effectiveOnVisit) effectiveOnVisit(id);
      });
    });
    const handleCatFilterClick = (cat) => {
      if (!cat) return;
      if (state.selectedFilterCategories.has(cat) && state.selectedFilterCategories.size === 1) {
        state.selectedFilterCategories.clear();
        if (catFilterList2) {
          catFilterList2.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = false);
        }
        updateCatFilterLabel();
        if (effectiveOnFilterChanged) effectiveOnFilterChanged();
        renderInsightsDashboard(effectiveOnVisit || void 0, effectiveOnDelete || void 0, effectiveOnFilterChanged || void 0);
        showToast("Cleared category filter");
        return;
      }
      state.selectedFilterCategories.clear();
      state.selectedFilterCategories.add(cat);
      if (catFilterList2) {
        catFilterList2.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          const input = cb;
          input.checked = input.value === cat;
        });
      }
      updateCatFilterLabel();
      if (effectiveOnFilterChanged) effectiveOnFilterChanged();
      renderInsightsDashboard(effectiveOnVisit || void 0, effectiveOnDelete || void 0, effectiveOnFilterChanged || void 0);
      showToast(`Filtered by category: ${cat}`);
      setTimeout(() => {
        const firstItem = grid ? grid.querySelector(".card, .table-row, .icon-card") : null;
        if (firstItem) {
          firstItem.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (activeCatFilterBanner) {
          activeCatFilterBanner.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (grid) {
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    };
    insightsBody.querySelectorAll(".category-dist-segment").forEach((seg) => {
      seg.addEventListener("click", () => {
        handleCatFilterClick(seg.getAttribute("data-cat"));
      });
    });
    insightsBody.querySelectorAll(".category-chip-item").forEach((chip) => {
      chip.addEventListener("click", () => {
        handleCatFilterClick(chip.getAttribute("data-cat"));
      });
    });
    const catDistClearBtn = insightsBody.querySelector("#catDistClearBtn");
    if (catDistClearBtn) {
      catDistClearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        state.selectedFilterCategories.clear();
        if (catFilterList2) {
          catFilterList2.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = false);
        }
        updateCatFilterLabel();
        if (effectiveOnFilterChanged) effectiveOnFilterChanged();
        renderInsightsDashboard(effectiveOnVisit || void 0, effectiveOnDelete || void 0, effectiveOnFilterChanged || void 0);
        showToast("Cleared category filter");
      });
    }
    insightsBody.querySelectorAll(".dormant-visit-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (id && effectiveOnVisit) effectiveOnVisit(id);
      });
    });
    insightsBody.querySelectorAll(".dormant-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        if (id && effectiveOnDelete) effectiveOnDelete(id);
      });
    });
  }

  // src/modules/bookmarks/render.ts
  function setViewMode(mode) {
    if (!["cards", "table", "icons"].includes(mode)) mode = "cards";
    state.currentViewMode = mode;
    localStorage.setItem(VIEW_LAYOUT_KEY, mode);
    const viewCardsBtn2 = document.getElementById("viewCardsBtn");
    const viewTableBtn2 = document.getElementById("viewTableBtn");
    const viewIconsBtn2 = document.getElementById("viewIconsBtn");
    if (viewCardsBtn2) viewCardsBtn2.classList.toggle("is-active", mode === "cards");
    if (viewTableBtn2) viewTableBtn2.classList.toggle("is-active", mode === "table");
    if (viewIconsBtn2) viewIconsBtn2.classList.toggle("is-active", mode === "icons");
    renderCardsOnly();
  }
  function renderCard(entry) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-id", entry.id);
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", entry.id);
        e.dataTransfer.effectAllowed = "move";
      }
      card.classList.add("is-dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
    });
    const pendingIcon = state.pendingIcons.get(entry.id);
    if (pendingIcon) {
      card.classList.add("has-pending-icon");
    }
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
    const domain = getDomain(entry.url);
    const folder = entry.folderId ? state.folders.find((f) => f.id === entry.folderId) : null;
    const iconSrc = entry.icon || entry.iconUrl || "";
    card.innerHTML = `
    <button class="card-favorite ${entry.isFavorite ? "active" : ""}" title="${entry.isFavorite ? "Unpin from favorites" : "Pin to favorites"}">
      ${entry.isFavorite ? "\u2605" : "\u2606"}
    </button>
    <div class="card-top">
      <div class="card-icon" title="Current icon">
        ${iconSrc ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">` : '<span class="icon-fallback">\u{1F310}</span>'}
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
              <img src="${escapeHtml(pendingIcon)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">
            </div>
            <button type="button" class="btn-accept accept-icon-btn" title="Accept new icon">\u2713 Accept</button>
            <button type="button" class="btn btn-ghost dismiss-icon-btn" title="Dismiss new icon">\u2715</button>
          </div>
        </div>
      ` : ""}
    </div>
    ${entry.description ? `<div class="card-description">${escapeHtml(entry.description)}</div>` : ""}
    ${entry.health && entry.health.status === "broken" ? `
      <div class="card-health-pill broken" title="${escapeHtml(entry.health.error || "Website unreachable or dead link")}">
        \u26A0\uFE0F Offline / Dead
      </div>
    ` : ""}
    <div class="card-meta">
      ${folder ? `<span class="tag folder-tag" data-folder-id="${escapeHtml(folder.id)}" style="--folder-color: ${escapeHtml(folder.color || "#0a84ff")}; background: color-mix(in srgb, var(--folder-color) 14%, transparent); color: var(--folder-color); border: 1px solid color-mix(in srgb, var(--folder-color) 32%, transparent);" title="Folder: ${escapeHtml(folder.name)} (Click to view folder)"><span>${escapeHtml(folder.icon || "\u{1F4C1}")}</span> ${escapeHtml(folder.name)}</span>` : ""}
      ${(entry.categories || []).map((cat) => `<span class="tag" ${getCategoryTagStyle(cat)}>${escapeHtml(cat)}</span>`).join("")}
      <span class="meta-item" title="Added: ${formatDateFull(entry.dateAdded)}">Added ${timeAgo(entry.dateAdded)}</span>
      ${(entry.visitCount || 0) > 0 ? `
        <span class="meta-dot"></span>
        <span class="meta-item">${entry.visitCount} visit${entry.visitCount !== 1 ? "s" : ""}</span>
      ` : ""}
      <div class="card-actions">
        <button class="btn btn-ghost refresh-btn" title="Check for updated icon">\u{1F504}</button>
        <button class="btn btn-ghost edit-btn" title="Edit">\u270F\uFE0F</button>
        <button class="btn btn-danger delete-btn" title="Delete">\u{1F5D1}\uFE0F</button>
      </div>
    </div>
  `;
    card.addEventListener("click", (e) => {
      const target = e.target;
      if (target?.closest(".folder-tag")) {
        e.stopPropagation();
        if (folder) setActiveFolder(folder.id, render);
        return;
      }
      if (target?.closest(".card-favorite") || target?.closest(".refresh-btn") || target?.closest(".edit-btn") || target?.closest(".delete-btn") || target?.closest(".card-pending-icon-box")) return;
      visitEntry(entry.id, render);
    });
    const favBtn = card.querySelector(".card-favorite");
    if (favBtn) {
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(entry.id, render);
      });
    }
    const refreshBtn = card.querySelector(".refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        refreshEntryIcon(entry.id, refreshBtn, render);
      });
    }
    if (pendingIcon) {
      const acceptBtn = card.querySelector(".accept-icon-btn");
      if (acceptBtn) {
        acceptBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          acceptPendingIcon(entry.id, render);
        });
      }
      const dismissBtn = card.querySelector(".dismiss-icon-btn");
      if (dismissBtn) {
        dismissBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          dismissPendingIcon(entry.id, render);
        });
      }
    }
    const editBtn = card.querySelector(".edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(entry.id);
      });
    }
    const deleteBtn = card.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteEntry(entry.id, render);
      });
    }
    return card;
  }
  function renderTableRow(entry) {
    const row = document.createElement("div");
    row.className = "table-row";
    row.setAttribute("data-id", entry.id);
    row.setAttribute("draggable", "true");
    row.addEventListener("dragstart", (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", entry.id);
        e.dataTransfer.effectAllowed = "move";
      }
      row.classList.add("is-dragging");
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("is-dragging");
    });
    const domain = getDomain(entry.url);
    const folder = entry.folderId ? state.folders.find((f) => f.id === entry.folderId) : null;
    const iconSrc = entry.icon || entry.iconUrl || "";
    row.innerHTML = `
    <div class="table-cell-fav">
      <button class="table-fav-btn ${entry.isFavorite ? "active" : ""}" title="${entry.isFavorite ? "Unpin from favorites" : "Pin to favorites"}">
        ${entry.isFavorite ? "\u2605" : "\u2606"}
      </button>
    </div>
    <div class="table-cell-icon">
      <div class="table-icon-frame" title="${escapeHtml(entry.name)}">
        ${iconSrc ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span style=\\'font-size:12px;\\'>\u{1F310}</span>'">` : '<span style="font-size:12px;">\u{1F310}</span>'}
      </div>
    </div>
    <div class="table-cell-main">
      <div class="table-title-row">
        <span class="table-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</span>
        ${entry.health && entry.health.status === "broken" ? '<span class="table-broken-badge">\u26A0\uFE0F Offline</span>' : ""}
      </div>
      <span class="table-domain" title="${escapeHtml(entry.url)}">
        ${escapeHtml(domain)}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
      </span>
    </div>
    <div class="table-cell-tags">
      ${folder ? `<span class="tag folder-tag" data-folder-id="${escapeHtml(folder.id)}" style="--folder-color: ${escapeHtml(folder.color || "#0a84ff")}; background: color-mix(in srgb, var(--folder-color) 14%, transparent); color: var(--folder-color); border: 1px solid color-mix(in srgb, var(--folder-color) 32%, transparent);" title="Folder: ${escapeHtml(folder.name)}">${escapeHtml(folder.icon || "\u{1F4C1}")} ${escapeHtml(folder.name)}</span>` : ""}
      ${(entry.categories || []).map((cat) => `<span class="tag" ${getCategoryTagStyle(cat)}>${escapeHtml(cat)}</span>`).join("")}
    </div>
    <div class="table-cell-visits">
      ${(entry.visitCount || 0) > 0 ? `${entry.visitCount} visit${entry.visitCount !== 1 ? "s" : ""}` : "\u2014"}
    </div>
    <div class="table-cell-date" title="Added: ${formatDateFull(entry.dateAdded)}">
      ${timeAgo(entry.dateAdded)}
    </div>
    <div class="table-cell-actions">
      <button class="table-action-btn refresh-btn" title="Refresh icon">\u{1F504}</button>
      <button class="table-action-btn edit-btn" title="Edit">\u270F\uFE0F</button>
      <button class="table-action-btn delete-btn" title="Delete">\u{1F5D1}\uFE0F</button>
    </div>
  `;
    row.addEventListener("click", (e) => {
      const target = e.target;
      if (target?.closest(".folder-tag")) {
        e.stopPropagation();
        if (folder) setActiveFolder(folder.id, render);
        return;
      }
      if (target?.closest(".table-fav-btn") || target?.closest(".refresh-btn") || target?.closest(".edit-btn") || target?.closest(".delete-btn")) return;
      visitEntry(entry.id, render);
    });
    const favBtn = row.querySelector(".table-fav-btn");
    if (favBtn) {
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(entry.id, render);
      });
    }
    const refreshBtn = row.querySelector(".refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        refreshEntryIcon(entry.id, refreshBtn, render);
      });
    }
    const editBtn = row.querySelector(".edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(entry.id);
      });
    }
    const deleteBtn = row.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteEntry(entry.id, render);
      });
    }
    return row;
  }
  function renderIconCard(entry) {
    const card = document.createElement("div");
    card.className = "icon-card";
    card.setAttribute("data-id", entry.id);
    card.setAttribute("draggable", "true");
    card.addEventListener("dragstart", (e) => {
      if (e.dataTransfer) {
        e.dataTransfer.setData("text/plain", entry.id);
        e.dataTransfer.effectAllowed = "move";
      }
      card.classList.add("is-dragging");
    });
    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
    });
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
    const folder = entry.folderId ? state.folders.find((f) => f.id === entry.folderId) : null;
    const iconSrc = entry.icon || entry.iconUrl || "";
    card.innerHTML = `
    <div class="icon-card-header">
      <div class="icon-card-actions">
        <button class="icon-card-action-btn edit-btn" title="Edit">\u270F\uFE0F</button>
        <button class="icon-card-action-btn delete-btn" title="Delete">\u{1F5D1}\uFE0F</button>
      </div>
      <button class="icon-card-fav ${entry.isFavorite ? "active" : ""}" title="${entry.isFavorite ? "Unpin from favorites" : "Pin to favorites"}">
        ${entry.isFavorite ? "\u2605" : "\u2606"}
      </button>
    </div>
    <div class="icon-card-frame">
      ${iconSrc ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span style=\\'font-size:20px;\\'>\u{1F310}</span>'">` : '<span style="font-size:20px;">\u{1F310}</span>'}
    </div>
    <div class="icon-card-name" title="${escapeHtml(entry.name)}">
      ${folder ? `<span class="icon-card-folder-dot" style="background: ${escapeHtml(folder.color || "var(--accent)")};" title="Folder: ${escapeHtml(folder.name)}"></span>` : ""}
      <span>${escapeHtml(entry.name)}</span>
    </div>
  `;
    card.addEventListener("click", (e) => {
      const target = e.target;
      if (target?.closest(".icon-card-fav") || target?.closest(".edit-btn") || target?.closest(".delete-btn")) return;
      visitEntry(entry.id, render);
    });
    const favBtn = card.querySelector(".icon-card-fav");
    if (favBtn) {
      favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(entry.id, render);
      });
    }
    const editBtn = card.querySelector(".edit-btn");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(entry.id);
      });
    }
    const deleteBtn = card.querySelector(".delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteEntry(entry.id, render);
      });
    }
    return card;
  }
  function renderCardsOnly() {
    const filtered = getFilteredEntries();
    const statsText = document.getElementById("statsText");
    const activeCatFilterBanner = document.getElementById("activeCatFilterBanner");
    const activeCatFilterBannerLeft = document.getElementById("activeCatFilterBannerLeft");
    const grid = document.getElementById("grid");
    const emptyState = document.getElementById("emptyState");
    const total = state.entries.length;
    const showing = filtered.length;
    const activeCats = Array.from(state.selectedFilterCategories);
    if (statsText) {
      if (total === 0) {
        statsText.textContent = "0 sites";
      } else if (showing === total) {
        statsText.textContent = `${total} site${total !== 1 ? "s" : ""}`;
      } else {
        statsText.textContent = `Showing ${showing} of ${total} site${total !== 1 ? "s" : ""}`;
      }
    }
    if (activeCatFilterBanner) {
      if (activeCats.length > 0 && activeCats.length < getAllCategories().length) {
        activeCatFilterBanner.style.display = "flex";
        if (activeCatFilterBannerLeft) {
          activeCatFilterBannerLeft.innerHTML = `
          <span>Filtering by category:</span>
          ${activeCats.map((cat) => {
            const color = state.categoryColors && state.categoryColors[cat.toLowerCase()] || "var(--accent)";
            return `<span class="active-cat-filter-tag" style="background: color-mix(in srgb, ${color} 18%, transparent); color: ${color}; border: 1px solid color-mix(in srgb, ${color} 40%, transparent);">${escapeHtml(cat)}</span>`;
          }).join(" ")}
          <span style="color: var(--text-secondary); font-size: 0.78rem;">(${showing} website${showing !== 1 ? "s" : ""})</span>
        `;
        }
      } else {
        activeCatFilterBanner.style.display = "none";
      }
    }
    if (!grid || !emptyState) return;
    if (total === 0) {
      grid.style.display = "none";
      emptyState.style.display = "block";
      return;
    }
    grid.style.display = state.currentViewMode === "table" ? "flex" : "grid";
    grid.className = "grid view-" + state.currentViewMode;
    emptyState.style.display = "none";
    grid.innerHTML = "";
    if (state.currentViewMode === "table") {
      const headerRow = document.createElement("div");
      headerRow.className = "table-header-row";
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
      filtered.forEach((entry) => {
        grid.appendChild(renderTableRow(entry));
      });
    } else if (state.currentViewMode === "icons") {
      filtered.forEach((entry) => {
        grid.appendChild(renderIconCard(entry));
      });
    } else {
      filtered.forEach((entry) => {
        grid.appendChild(renderCard(entry));
      });
    }
  }
  function render() {
    renderFoldersSidebar(render);
    populateCategories(renderCardsOnly);
    renderCardsOnly();
    if (state.isInsightsOpen) {
      renderInsightsDashboard(render);
    }
  }

  // src/modules/categories/modal.ts
  var catModalUpdateCallback = null;
  function openCatModal(onUpdate) {
    if (typeof onUpdate === "function") {
      catModalUpdateCallback = onUpdate;
    }
    const catModalBackdrop2 = document.getElementById("catModalBackdrop");
    const catModalSearchInput2 = document.getElementById("catModalSearchInput");
    const catModalSearchClearBtn2 = document.getElementById("catModalSearchClearBtn");
    if (catModalSearchInput2) {
      catModalSearchInput2.value = "";
    }
    if (catModalSearchClearBtn2) {
      catModalSearchClearBtn2.style.display = "none";
    }
    renderCatList("", catModalUpdateCallback || void 0);
    if (catModalBackdrop2) {
      catModalBackdrop2.classList.add("active");
    }
    document.body.style.overflow = "hidden";
    if (catModalSearchInput2) {
      setTimeout(() => catModalSearchInput2.focus(), 60);
    }
  }
  function closeCatModal() {
    const catModalBackdrop2 = document.getElementById("catModalBackdrop");
    if (catModalBackdrop2) {
      catModalBackdrop2.classList.remove("active");
    }
    document.body.style.overflow = "";
  }
  function renameCategory(oldName, newName, onUpdate) {
    newName = newName.trim();
    if (!newName || newName === oldName) return;
    const diskList = getLatestStoredEntries();
    let updated = 0;
    diskList.forEach((entry) => {
      const idx = (entry.categories || []).indexOf(oldName);
      if (idx !== -1) {
        if (entry.categories.includes(newName)) {
          entry.categories.splice(idx, 1);
        } else {
          entry.categories[idx] = newName;
        }
        entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
        updated++;
      }
    });
    if (updated > 0) {
      if (state.selectedFilterCategories.has(oldName)) {
        state.selectedFilterCategories.delete(oldName);
        state.selectedFilterCategories.add(newName);
      }
      if (state.categoryColors[oldName.toLowerCase()]) {
        state.categoryColors[newName.toLowerCase()] = state.categoryColors[oldName.toLowerCase()];
        delete state.categoryColors[oldName.toLowerCase()];
        localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
      }
      saveEntries(diskList);
      const cb = onUpdate || catModalUpdateCallback;
      if (cb) cb();
      showToast(`Renamed "${oldName}" \u2192 "${newName}" (${updated} site${updated !== 1 ? "s" : ""} updated)`);
    }
  }
  function deleteCategory(catName, onUpdate) {
    const diskList = getLatestStoredEntries();
    const count = diskList.filter((e) => (e.categories || []).includes(catName)).length;
    if (!confirm(`Remove "${catName}" from ${count} site${count !== 1 ? "s" : ""}?`)) return;
    diskList.forEach((entry) => {
      entry.categories = (entry.categories || []).filter((c) => c !== catName);
      entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
    });
    if (state.categoryColors[catName.toLowerCase()]) {
      delete state.categoryColors[catName.toLowerCase()];
      localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
    }
    state.selectedFilterCategories.delete(catName);
    saveEntries(diskList);
    const cb = onUpdate || catModalUpdateCallback;
    if (cb) cb();
    showToast(`Deleted category "${catName}"`);
    const catModalSearchInput2 = document.getElementById("catModalSearchInput");
    const q = catModalSearchInput2 ? catModalSearchInput2.value : "";
    renderCatList(q, cb || void 0);
  }
  function renderCatList(query = "", onUpdate) {
    if (typeof onUpdate === "function") {
      catModalUpdateCallback = onUpdate;
    }
    const effectiveCallback = onUpdate || catModalUpdateCallback;
    const catList = document.getElementById("catList");
    const catEmptyMsg = document.getElementById("catEmptyMsg");
    const catModalSearchInput2 = document.getElementById("catModalSearchInput");
    const catModalSearchClearBtn2 = document.getElementById("catModalSearchClearBtn");
    if (!catList) return;
    const allUsed = getUsedCategories();
    const cleanQuery = (typeof query === "string" ? query : "").toLowerCase().trim();
    if (catModalSearchClearBtn2) {
      catModalSearchClearBtn2.style.display = cleanQuery ? "inline-flex" : "none";
    }
    const filtered = cleanQuery ? allUsed.filter(([name]) => name.toLowerCase().includes(cleanQuery)) : allUsed;
    catList.innerHTML = "";
    if (allUsed.length === 0) {
      if (catEmptyMsg) {
        catEmptyMsg.textContent = "No categories in use yet.";
        catEmptyMsg.style.display = "block";
      }
      return;
    }
    if (filtered.length === 0) {
      if (catEmptyMsg) {
        catEmptyMsg.textContent = `No categories match "${cleanQuery}".`;
        catEmptyMsg.style.display = "block";
      }
      return;
    }
    if (catEmptyMsg) catEmptyMsg.style.display = "none";
    filtered.forEach(([cat, count]) => {
      const row = document.createElement("div");
      row.className = "cat-row";
      row.innerHTML = `
      <span class="cat-row-name" ${getCategoryTagStyle(cat)} style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:600;">${escapeHtml(cat)}</span>
      <span class="cat-row-count">${count} site${count !== 1 ? "s" : ""}</span>
      <div class="cat-row-actions">
        <button class="btn btn-ghost rename-btn" title="Rename">\u270F\uFE0F</button>
        <button class="btn btn-danger delete-btn" title="Delete">\u{1F5D1}\uFE0F</button>
      </div>
    `;
      const renameBtn = row.querySelector(".rename-btn");
      if (renameBtn) {
        renameBtn.addEventListener("click", () => {
          const nameEl = row.querySelector(".cat-row-name");
          const actionsEl = row.querySelector(".cat-row-actions");
          if (!nameEl || !actionsEl) return;
          const input = document.createElement("input");
          input.type = "text";
          input.className = "cat-row-input";
          input.value = cat;
          nameEl.replaceWith(input);
          input.focus();
          input.select();
          actionsEl.innerHTML = `
          <button class="btn btn-primary btn-sm save-rename-btn">Save</button>
          <button class="btn btn-ghost btn-sm cancel-rename-btn">Cancel</button>
        `;
          const doSave = () => {
            const newVal = input.value.trim();
            if (newVal && newVal !== cat) {
              renameCategory(cat, newVal, effectiveCallback || void 0);
            }
            const q = catModalSearchInput2 ? catModalSearchInput2.value : "";
            renderCatList(q, effectiveCallback || void 0);
          };
          const doCancel = () => {
            const q = catModalSearchInput2 ? catModalSearchInput2.value : "";
            renderCatList(q, effectiveCallback || void 0);
          };
          const saveBtn = actionsEl.querySelector(".save-rename-btn");
          const cancelBtn2 = actionsEl.querySelector(".cancel-rename-btn");
          if (saveBtn) saveBtn.addEventListener("click", doSave);
          if (cancelBtn2) cancelBtn2.addEventListener("click", doCancel);
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              doSave();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              doCancel();
            }
          });
        });
      }
      const deleteBtn = row.querySelector(".delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          deleteCategory(cat, effectiveCallback || void 0);
        });
      }
      catList.appendChild(row);
    });
  }

  // src/utils/emoji-library.ts
  var EMOJI_CATEGORIES = [
    {
      id: "smileys",
      name: "Smileys & People",
      icon: "\u{1F600}",
      emojis: [
        { e: "\u{1F600}", k: "grinning happy smile face" },
        { e: "\u{1F603}", k: "smiley happy joy" },
        { e: "\u{1F604}", k: "smile laugh happy" },
        { e: "\u{1F601}", k: "beam grin smile" },
        { e: "\u{1F606}", k: "laughing lol haha" },
        { e: "\u{1F605}", k: "sweat smile relief" },
        { e: "\u{1F602}", k: "joy laugh cry tears lol" },
        { e: "\u{1F923}", k: "rofl rolling laugh lol" },
        { e: "\u{1F60A}", k: "blush smile warm happy" },
        { e: "\u{1F607}", k: "angel innocent halo" },
        { e: "\u{1F642}", k: "slight smile happy" },
        { e: "\u{1F643}", k: "upside down silly" },
        { e: "\u{1F609}", k: "wink flirt" },
        { e: "\u{1F60C}", k: "relieved calm peace" },
        { e: "\u{1F60D}", k: "heart eyes love crush" },
        { e: "\u{1F970}", k: "smiling hearts love affection" },
        { e: "\u{1F618}", k: "kiss blow love" },
        { e: "\u{1F60B}", k: "yum delicious food tasty" },
        { e: "\u{1F61B}", k: "tongue silly joke" },
        { e: "\u{1F61C}", k: "wink tongue crazy" },
        { e: "\u{1F92A}", k: "zany goofy wild" },
        { e: "\u{1F60E}", k: "sunglasses cool boss" },
        { e: "\u{1F913}", k: "nerd glasses smart tech geek" },
        { e: "\u{1F9D0}", k: "monocle inspect curious examine" },
        { e: "\u{1F973}", k: "party celebrate hat horn" },
        { e: "\u{1F60F}", k: "smirk sly" },
        { e: "\u{1F916}", k: "robot ai bot tech machine" },
        { e: "\u{1F47B}", k: "ghost spooky halloween boo" },
        { e: "\u{1F480}", k: "skull dead death rip" },
        { e: "\u{1F47D}", k: "alien ufo space extraterrestrial" },
        { e: "\u{1F920}", k: "cowboy hat western" },
        { e: "\u{1F91D}", k: "handshake deal partner agree business" },
        { e: "\u{1F44D}", k: "thumbs up like approve good yes" },
        { e: "\u{1F64C}", k: "hands raised celebrate praise yay" },
        { e: "\u{1F44F}", k: "clap applause bravo congrats" },
        { e: "\u{1F525}", k: "fire hot lit trending popular" },
        { e: "\u2728", k: "sparkles clean magic shine star" },
        { e: "\u2B50", k: "star favorite rating bookmark" },
        { e: "\u{1F4A1}", k: "lightbulb idea smart think innovation" },
        { e: "\u{1F9E0}", k: "brain mind think knowledge smart learn" },
        { e: "\u2764\uFE0F", k: "heart love like red" },
        { e: "\u{1F496}", k: "sparkle heart love pink" },
        { e: "\u{1F4AF}", k: "100 hundred perfect score grade" }
      ]
    },
    {
      id: "nature",
      name: "Animals & Nature",
      icon: "\u{1F332}",
      emojis: [
        { e: "\u{1F436}", k: "dog puppy pet canine" },
        { e: "\u{1F431}", k: "cat kitten feline pet" },
        { e: "\u{1F42D}", k: "mouse rodent" },
        { e: "\u{1F439}", k: "hamster pet" },
        { e: "\u{1F430}", k: "rabbit bunny pet" },
        { e: "\u{1F98A}", k: "fox animal wild" },
        { e: "\u{1F43B}", k: "bear animal" },
        { e: "\u{1F43C}", k: "panda animal cute" },
        { e: "\u{1F428}", k: "koala australia animal" },
        { e: "\u{1F42F}", k: "tiger animal wild cat" },
        { e: "\u{1F981}", k: "lion king beast animal" },
        { e: "\u{1F42E}", k: "cow cattle farm" },
        { e: "\u{1F437}", k: "pig pork farm" },
        { e: "\u{1F438}", k: "frog toad nature" },
        { e: "\u{1F435}", k: "monkey ape animal" },
        { e: "\u{1F414}", k: "chicken hen farm bird" },
        { e: "\u{1F427}", k: "penguin bird arctic linux" },
        { e: "\u{1F426}", k: "bird tweet twitter fly" },
        { e: "\u{1F986}", k: "duck bird quack" },
        { e: "\u{1F985}", k: "eagle bird raptor prey" },
        { e: "\u{1F989}", k: "owl bird night wisdom" },
        { e: "\u{1F987}", k: "bat night vampire" },
        { e: "\u{1F43A}", k: "wolf animal pack" },
        { e: "\u{1F984}", k: "unicorn magic startup fantasy" },
        { e: "\u{1F41D}", k: "bee honey insect bug buzz" },
        { e: "\u{1F41B}", k: "bug caterpillar debug code insect" },
        { e: "\u{1F98B}", k: "butterfly insect pretty wings" },
        { e: "\u{1F577}\uFE0F", k: "spider web insect crawl" },
        { e: "\u{1F422}", k: "turtle tortoise slow reptile" },
        { e: "\u{1F40D}", k: "snake python code reptile" },
        { e: "\u{1F419}", k: "octopus tentacle sea github" },
        { e: "\u{1F42C}", k: "dolphin sea marine ocean" },
        { e: "\u{1F433}", k: "whale ocean docker container" },
        { e: "\u{1F988}", k: "shark fish ocean danger" },
        { e: "\u{1F332}", k: "evergreen tree forest nature pine" },
        { e: "\u{1F333}", k: "tree nature forest green" },
        { e: "\u{1F334}", k: "palm tree beach tropical vacation" },
        { e: "\u{1F331}", k: "seedling sprout plant grow spring" },
        { e: "\u{1F33F}", k: "herb plant leaf nature organic" },
        { e: "\u{1F340}", k: "four leaf clover luck lucky irish" },
        { e: "\u{1F338}", k: "cherry blossom flower sakura spring" },
        { e: "\u{1F33B}", k: "sunflower flower bright sun" },
        { e: "\u{1F33A}", k: "hibiscus flower tropical" },
        { e: "\u{1F341}", k: "maple leaf autumn fall canada" },
        { e: "\u{1F344}", k: "mushroom fungus mario nature" }
      ]
    },
    {
      id: "food",
      name: "Food & Drink",
      icon: "\u2615",
      emojis: [
        { e: "\u{1F34F}", k: "green apple fruit food" },
        { e: "\u{1F34E}", k: "red apple fruit tech food" },
        { e: "\u{1F34C}", k: "banana fruit monkey yellow" },
        { e: "\u{1F349}", k: "watermelon fruit summer sweet" },
        { e: "\u{1F347}", k: "grapes fruit wine purple" },
        { e: "\u{1F353}", k: "strawberry berry fruit red" },
        { e: "\u{1F352}", k: "cherries fruit cherry" },
        { e: "\u{1F351}", k: "peach fruit" },
        { e: "\u{1F34D}", k: "pineapple fruit tropical" },
        { e: "\u{1F951}", k: "avocado vegetable food healthy" },
        { e: "\u{1F336}\uFE0F", k: "hot pepper chili spicy" },
        { e: "\u{1F33D}", k: "corn maize vegetable" },
        { e: "\u{1F950}", k: "croissant bread bakery french breakfast" },
        { e: "\u{1F35E}", k: "bread loaf bakery" },
        { e: "\u{1F9C0}", k: "cheese cheddar food swiss" },
        { e: "\u{1F373}", k: "cooking egg breakfast fry pan" },
        { e: "\u{1F953}", k: "bacon meat breakfast food" },
        { e: "\u{1F969}", k: "meat steak cut beef" },
        { e: "\u{1F357}", k: "poultry leg chicken drumstick food" },
        { e: "\u{1F354}", k: "hamburger burger fast food" },
        { e: "\u{1F35F}", k: "french fries chips fast food" },
        { e: "\u{1F355}", k: "pizza slice cheese italian food" },
        { e: "\u{1F96A}", k: "sandwich sub lunch food" },
        { e: "\u{1F32E}", k: "taco mexican food" },
        { e: "\u{1F957}", k: "salad green healthy diet" },
        { e: "\u{1F35D}", k: "spaghetti pasta noodle italian" },
        { e: "\u{1F35C}", k: "ramen noodle bowl soup" },
        { e: "\u{1F363}", k: "sushi japanese fish food" },
        { e: "\u{1F366}", k: "ice cream soft serve dessert sweet" },
        { e: "\u{1F369}", k: "doughnut donut sweet pastry" },
        { e: "\u{1F36A}", k: "cookie biscuit sweet chocolate chip" },
        { e: "\u{1F382}", k: "birthday cake celebration party dessert" },
        { e: "\u{1F36B}", k: "chocolate bar sweet candy" },
        { e: "\u{1F37F}", k: "popcorn movie cinema snack" },
        { e: "\u2615", k: "coffee cafe espresso hot drink tea caffeine" },
        { e: "\u{1F375}", k: "tea green matcha hot drink" },
        { e: "\u{1F9CB}", k: "boba bubble tea milk drink" },
        { e: "\u{1F37A}", k: "beer drink alcohol pub pint" },
        { e: "\u{1F37B}", k: "cheers beers pub drink toast" },
        { e: "\u{1F377}", k: "wine glass red alcohol drink" },
        { e: "\u{1F378}", k: "cocktail martini drink bar" }
      ]
    },
    {
      id: "activities",
      name: "Activities & Sports",
      icon: "\u{1F3AE}",
      emojis: [
        { e: "\u26BD", k: "soccer ball football sport" },
        { e: "\u{1F3C0}", k: "basketball ball sport nba" },
        { e: "\u{1F3C8}", k: "american football nfl sport" },
        { e: "\u26BE", k: "baseball ball sport mlb" },
        { e: "\u{1F3BE}", k: "tennis ball sport court" },
        { e: "\u{1F3D0}", k: "volleyball ball sport beach" },
        { e: "\u{1F3D3}", k: "ping pong table tennis paddle" },
        { e: "\u{1F3F8}", k: "badminton racket shuttlecock sport" },
        { e: "\u{1F94A}", k: "boxing glove fight punch sport" },
        { e: "\u{1F3AF}", k: "bullseye target goal direct hit accurate" },
        { e: "\u{1F3AE}", k: "video game controller gaming play playstation xbox" },
        { e: "\u{1F579}\uFE0F", k: "joystick arcade retro game controller" },
        { e: "\u{1F3B2}", k: "dice game board roll chance" },
        { e: "\u{1F9E9}", k: "jigsaw puzzle piece problem solve fit" },
        { e: "\u{1F3A8}", k: "artist palette design art painting draw color creative" },
        { e: "\u{1F3AD}", k: "theater masks drama acting stage" },
        { e: "\u{1F3AA}", k: "circus tent event show" },
        { e: "\u{1F39F}\uFE0F", k: "ticket admission event entry" },
        { e: "\u{1F3C6}", k: "trophy champion win prize award first" },
        { e: "\u{1F947}", k: "first place medal gold winner" },
        { e: "\u{1F948}", k: "second place medal silver winner" },
        { e: "\u{1F949}", k: "third place medal bronze winner" },
        { e: "\u{1F3C5}", k: "sports medal military award" }
      ]
    },
    {
      id: "travel",
      name: "Travel & Places",
      icon: "\u{1F680}",
      emojis: [
        { e: "\u{1F697}", k: "car automobile vehicle drive auto" },
        { e: "\u{1F3CE}\uFE0F", k: "racing car race speed f1 fast" },
        { e: "\u{1F693}", k: "police car law patrol cop" },
        { e: "\u{1F691}", k: "ambulance emergency medical hospital" },
        { e: "\u{1F692}", k: "fire engine truck emergency rescue" },
        { e: "\u{1F6F5}", k: "scooter motorcycle moped vespa" },
        { e: "\u{1F6B2}", k: "bicycle bike cycle pedal ride" },
        { e: "\u2708\uFE0F", k: "airplane flight airport travel fly" },
        { e: "\u{1F6EB}", k: "airplane departure takeoff flight" },
        { e: "\u{1F6EC}", k: "airplane landing arrival flight" },
        { e: "\u{1F680}", k: "rocket launch startup space ship speed fast blast" },
        { e: "\u{1F6F8}", k: "ufo flying saucer alien space sci-fi" },
        { e: "\u{1F681}", k: "helicopter chopper fly travel" },
        { e: "\u26F5", k: "sailboat boat yacht water ocean" },
        { e: "\u{1F6A2}", k: "ship boat cruise ocean vessel" },
        { e: "\u2693", k: "anchor boat marine sea navy" },
        { e: "\u{1F3E0}", k: "house home building residence living personal" },
        { e: "\u{1F3E1}", k: "house garden home building" },
        { e: "\u{1F3E2}", k: "office building company business work agency" },
        { e: "\u{1F3E5}", k: "hospital medical doctor clinic health" },
        { e: "\u{1F3E6}", k: "bank finance building money credit" },
        { e: "\u{1F3E8}", k: "hotel building stay travel vacation" },
        { e: "\u{1F3EB}", k: "school building education study student" },
        { e: "\u{1F3F0}", k: "castle palace fairy tale fantasy royal" },
        { e: "\u{1F5FA}\uFE0F", k: "world map geography travel atlas explore" },
        { e: "\u{1F9ED}", k: "compass navigate direction explore discover" },
        { e: "\u26F0\uFE0F", k: "mountain nature climb peak hike" },
        { e: "\u{1F30B}", k: "volcano mountain lava erupt" },
        { e: "\u{1F3D6}\uFE0F", k: "beach umbrella sand ocean vacation sea" }
      ]
    },
    {
      id: "objects",
      name: "Objects & Tech",
      icon: "\u{1F4BB}",
      emojis: [
        { e: "\u{1F4C1}", k: "file folder directory organize files archive collection" },
        { e: "\u{1F4C2}", k: "open folder files docs directory" },
        { e: "\u{1F5C2}\uFE0F", k: "card index dividers organize directory" },
        { e: "\u{1F4BC}", k: "briefcase work job business portfolio career bag" },
        { e: "\u{1F4BB}", k: "laptop computer code tech developer macbook pc" },
        { e: "\u{1F5A5}\uFE0F", k: "desktop computer monitor display pc workstation" },
        { e: "\u2328\uFE0F", k: "keyboard type code key input" },
        { e: "\u{1F5B1}\uFE0F", k: "computer mouse click pointer tech" },
        { e: "\u{1F4F1}", k: "mobile phone smartphone iphone android app" },
        { e: "\u260E\uFE0F", k: "telephone phone call contact support" },
        { e: "\u{1F50B}", k: "battery charge power energy level" },
        { e: "\u{1F50C}", k: "electric plug power connect socket adapter" },
        { e: "\u{1F4A1}", k: "lightbulb idea smart think innovation creative" },
        { e: "\u{1F4DA}", k: "books reading education library study school docs documentation" },
        { e: "\u{1F4D6}", k: "open book reading literature novel" },
        { e: "\u{1F516}", k: "bookmark favorite tag mark save" },
        { e: "\u{1F3F7}\uFE0F", k: "label price tag category mark" },
        { e: "\u{1F4B0}", k: "money bag dollar rich cash wealth investment bank" },
        { e: "\u{1FA99}", k: "coin currency money gold cash crypto" },
        { e: "\u{1F4B5}", k: "dollar bill cash money green currency" },
        { e: "\u{1F4B3}", k: "credit card payment purchase visa mastercard buy pay" },
        { e: "\u{1F48E}", k: "gem stone diamond crystal jewel valuable" },
        { e: "\u2696\uFE0F", k: "balance scale law justice legal court" },
        { e: "\u{1F9F0}", k: "toolbox tools toolkit repair fix utilities maintenance" },
        { e: "\u{1F6E0}\uFE0F", k: "hammer wrench tools repair settings build dev devops" },
        { e: "\u{1F527}", k: "wrench tool spanner fix configure" },
        { e: "\u{1F528}", k: "hammer tool build construction strike" },
        { e: "\u2699\uFE0F", k: "gear settings options configuration preferences system" },
        { e: "\u{1F6E1}\uFE0F", k: "shield protect defense security antivirus guard safe" },
        { e: "\u{1F512}", k: "lock closed private secure password secret encrypted" },
        { e: "\u{1F513}", k: "unlock open access public released" },
        { e: "\u{1F511}", k: "key password access secret auth api unlock login" },
        { e: "\u{1F5DD}\uFE0F", k: "old key secret antique access unlock" },
        { e: "\u{1F52C}", k: "microscope science research lab study biology chemistry analyze" },
        { e: "\u{1F52D}", k: "telescope astronomy space star look explore view" },
        { e: "\u{1F9EA}", k: "test tube chemistry science experiment flask lab" },
        { e: "\u{1F48A}", k: "pill medicine pharmacy drug prescription health" },
        { e: "\u{1F4E6}", k: "package box delivery shipping parcel amazon storage" },
        { e: "\u{1F4C5}", k: "calendar date schedule event appointment" },
        { e: "\u{1F4CA}", k: "bar chart graph stats metrics analytics insights dashboard" },
        { e: "\u{1F4C8}", k: "chart increasing trend growth metrics stock up" },
        { e: "\u{1F4C9}", k: "chart decreasing loss down drop decline" },
        { e: "\u{1F4CB}", k: "clipboard copy paste task list checklist notes plan" },
        { e: "\u{1F4CC}", k: "pushpin pin map location sticky note notice" },
        { e: "\u{1F4CE}", k: "paperclip attach attachment file link" },
        { e: "\u2702\uFE0F", k: "scissors cut snip tool craft edit" },
        { e: "\u{1F5D1}\uFE0F", k: "wastebasket trash bin delete remove recycle" }
      ]
    },
    {
      id: "symbols",
      name: "Symbols & Flags",
      icon: "\u26A1",
      emojis: [
        { e: "\u26A1", k: "high voltage lightning bolt power fast energy flash zap speed" },
        { e: "\u2728", k: "sparkles clean magic shine star ai new" },
        { e: "\u2B50", k: "star favorite rating bookmark yellow" },
        { e: "\u{1F31F}", k: "glowing star shine bright sparkle special" },
        { e: "\u{1F4A5}", k: "boom collision explosion bang blast" },
        { e: "\u{1F4AB}", k: "dizzy star trail spark" },
        { e: "\u2764\uFE0F", k: "red heart love like romance favorite" },
        { e: "\u{1F499}", k: "blue heart love like" },
        { e: "\u{1F49A}", k: "green heart nature love" },
        { e: "\u{1F49C}", k: "purple heart love" },
        { e: "\u{1F5A4}", k: "black heart dark love" },
        { e: "\u{1F90D}", k: "white heart pure love" },
        { e: "\u{1F494}", k: "broken heart sad breakup sorrow" },
        { e: "\u2705", k: "check mark green verified done complete ok pass task" },
        { e: "\u274C", k: "cross mark red cancel no wrong fail error bad" },
        { e: "\u26A0\uFE0F", k: "warning alert caution hazard attention broken" },
        { e: "\u{1F6AB}", k: "no entry forbidden banned stop proscribed" },
        { e: "\u{1F6D1}", k: "stop sign red octagonal halt pause" },
        { e: "\u{1F4AF}", k: "100 hundred perfect score rank full" },
        { e: "\u{1F514}", k: "bell notification alert alarm sound ring" },
        { e: "\u{1F515}", k: "bell with slash mute silent quiet no notifications" },
        { e: "\u{1F3B5}", k: "musical note song sound audio melody tune" },
        { e: "\u{1F3B6}", k: "musical notes audio soundtrack music playlist" },
        { e: "\u{1F310}", k: "globe with meridians world internet web online network domain" },
        { e: "\u267B\uFE0F", k: "recycling symbol green environment sustainable reuse" },
        { e: "\u{1F6A9}", k: "triangular flag post mark goal priority milestone" },
        { e: "\u{1F3C1}", k: "chequered flag finish race complete win" }
      ]
    }
  ];

  // src/modules/folders/emoji-picker.ts
  var DEFAULT_RECENT_EMOJIS = ["\u{1F4C1}", "\u{1F4BC}", "\u{1F3E0}", "\u{1F52C}", "\u{1F6E0}\uFE0F", "\u{1F3A8}", "\u26A1", "\u{1F4DA}"];
  var activeEmojiCategoryId = "all";
  function getRecentEmojis() {
    try {
      const stored = localStorage.getItem("appDirectory_recentEmojis");
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      }
    } catch {
    }
    return DEFAULT_RECENT_EMOJIS;
  }
  function saveRecentEmoji(emoji) {
    if (!emoji) return;
    let list = getRecentEmojis();
    list = [emoji, ...list.filter((e) => e !== emoji)].slice(0, 16);
    try {
      localStorage.setItem("appDirectory_recentEmojis", JSON.stringify(list));
    } catch {
    }
    renderFolderEmojiQuickRow();
  }
  function selectFolderEmoji(emoji) {
    if (!emoji) return;
    const folderIconInput2 = document.getElementById("folderIconInput");
    const folderIconDisplay2 = document.getElementById("folderIconDisplay");
    if (folderIconInput2) folderIconInput2.value = emoji;
    if (folderIconDisplay2) folderIconDisplay2.textContent = emoji;
    saveRecentEmoji(emoji);
    closeEmojiPicker();
  }
  function renderFolderEmojiQuickRow() {
    const folderEmojiQuickRow = document.getElementById("folderEmojiQuickRow");
    if (!folderEmojiQuickRow) return;
    folderEmojiQuickRow.innerHTML = "";
    const recents = getRecentEmojis().slice(0, 6);
    recents.forEach((em) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "emoji-quick-chip";
      btn.textContent = em;
      btn.title = `Select ${em}`;
      btn.addEventListener("click", () => selectFolderEmoji(em));
      folderEmojiQuickRow.appendChild(btn);
    });
    const moreBtn = document.createElement("button");
    moreBtn.type = "button";
    moreBtn.className = "emoji-more-btn";
    moreBtn.innerHTML = "<span>\u{1F600} More</span>";
    moreBtn.title = "Browse all categorized emojis";
    moreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleEmojiPicker();
    });
    folderEmojiQuickRow.appendChild(moreBtn);
  }
  function updateActiveCategoryTab() {
    const emojiCategoryTabs = document.getElementById("emojiCategoryTabs");
    if (!emojiCategoryTabs) return;
    const tabs = emojiCategoryTabs.querySelectorAll(".emoji-category-tab");
    tabs.forEach((t) => {
      if (t.getAttribute("data-cat") === activeEmojiCategoryId) {
        t.classList.add("is-active");
      } else {
        t.classList.remove("is-active");
      }
    });
  }
  function renderEmojiCategoryTabs() {
    const emojiCategoryTabs = document.getElementById("emojiCategoryTabs");
    const emojiSearchInput2 = document.getElementById("emojiSearchInput");
    if (!emojiCategoryTabs) return;
    if (emojiCategoryTabs.children.length === 0) {
      const allTab = document.createElement("button");
      allTab.type = "button";
      allTab.className = "emoji-category-tab is-active";
      allTab.setAttribute("data-cat", "all");
      allTab.textContent = "\u{1F31F}";
      allTab.title = "All Emojis";
      allTab.addEventListener("click", (e) => {
        e.stopPropagation();
        activeEmojiCategoryId = "all";
        updateActiveCategoryTab();
        renderEmojiGrid("all", emojiSearchInput2 ? emojiSearchInput2.value : "");
      });
      emojiCategoryTabs.appendChild(allTab);
      const recentTab = document.createElement("button");
      recentTab.type = "button";
      recentTab.className = "emoji-category-tab";
      recentTab.setAttribute("data-cat", "recent");
      recentTab.textContent = "\u{1F552}";
      recentTab.title = "Recent Emojis";
      recentTab.addEventListener("click", (e) => {
        e.stopPropagation();
        activeEmojiCategoryId = "recent";
        updateActiveCategoryTab();
        renderEmojiGrid("recent", emojiSearchInput2 ? emojiSearchInput2.value : "");
      });
      emojiCategoryTabs.appendChild(recentTab);
      EMOJI_CATEGORIES.forEach((cat) => {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "emoji-category-tab";
        tab.setAttribute("data-cat", cat.id);
        tab.textContent = cat.icon;
        tab.title = cat.name;
        tab.addEventListener("click", (e) => {
          e.stopPropagation();
          activeEmojiCategoryId = cat.id;
          updateActiveCategoryTab();
          renderEmojiGrid(cat.id, emojiSearchInput2 ? emojiSearchInput2.value : "");
        });
        emojiCategoryTabs.appendChild(tab);
      });
    }
    updateActiveCategoryTab();
  }
  function renderEmojiGrid(categoryId = "all", searchQuery = "") {
    const emojiGridContainer = document.getElementById("emojiGridContainer");
    if (!emojiGridContainer) return;
    emojiGridContainer.innerHTML = "";
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const matches = [];
      const seen = /* @__PURE__ */ new Set();
      EMOJI_CATEGORIES.forEach((cat) => {
        cat.emojis.forEach((item) => {
          if (!seen.has(item.e) && (item.e.includes(q) || item.k.toLowerCase().includes(q))) {
            seen.add(item.e);
            matches.push(item);
          }
        });
      });
      if (matches.length === 0) {
        emojiGridContainer.innerHTML = `<div class="emoji-no-results">No emojis found matching "<strong>${escapeHtml(
          searchQuery
        )}</strong>"</div>`;
        return;
      }
      const sec = document.createElement("div");
      sec.className = "emoji-category-section";
      sec.innerHTML = `<div class="emoji-category-title">Search Results (${matches.length})</div>`;
      const grid = document.createElement("div");
      grid.className = "emoji-grid";
      matches.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "emoji-item-btn";
        btn.textContent = item.e;
        btn.title = item.k;
        btn.addEventListener("click", () => selectFolderEmoji(item.e));
        grid.appendChild(btn);
      });
      sec.appendChild(grid);
      emojiGridContainer.appendChild(sec);
      return;
    }
    if (categoryId === "recent") {
      const recents = getRecentEmojis();
      const sec = document.createElement("div");
      sec.className = "emoji-category-section";
      sec.innerHTML = `<div class="emoji-category-title">\u{1F552} Recently Used</div>`;
      const grid = document.createElement("div");
      grid.className = "emoji-grid";
      recents.forEach((em) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "emoji-item-btn";
        btn.textContent = em;
        btn.addEventListener("click", () => selectFolderEmoji(em));
        grid.appendChild(btn);
      });
      sec.appendChild(grid);
      emojiGridContainer.appendChild(sec);
      return;
    }
    const categoriesToRender = categoryId === "all" ? EMOJI_CATEGORIES : EMOJI_CATEGORIES.filter((c) => c.id === categoryId);
    if (categoryId === "all") {
      const recents = getRecentEmojis();
      if (recents.length > 0) {
        const recSec = document.createElement("div");
        recSec.className = "emoji-category-section";
        recSec.innerHTML = `<div class="emoji-category-title">\u{1F552} Recent</div>`;
        const recGrid = document.createElement("div");
        recGrid.className = "emoji-grid";
        recents.slice(0, 16).forEach((em) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "emoji-item-btn";
          btn.textContent = em;
          btn.addEventListener("click", () => selectFolderEmoji(em));
          recGrid.appendChild(btn);
        });
        recSec.appendChild(recGrid);
        emojiGridContainer.appendChild(recSec);
      }
    }
    categoriesToRender.forEach((cat) => {
      const sec = document.createElement("div");
      sec.className = "emoji-category-section";
      sec.innerHTML = `<div class="emoji-category-title">${cat.icon} ${cat.name}</div>`;
      const grid = document.createElement("div");
      grid.className = "emoji-grid";
      cat.emojis.forEach((item) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "emoji-item-btn";
        btn.textContent = item.e;
        btn.title = item.k;
        btn.addEventListener("click", () => selectFolderEmoji(item.e));
        grid.appendChild(btn);
      });
      sec.appendChild(grid);
      emojiGridContainer.appendChild(sec);
    });
  }
  function openEmojiPicker() {
    const emojiPickerPopover2 = document.getElementById("emojiPickerPopover");
    const emojiSearchInput2 = document.getElementById("emojiSearchInput");
    const emojiSearchClear2 = document.getElementById("emojiSearchClear");
    const osShortcutKey = document.getElementById("osShortcutKey");
    if (!emojiPickerPopover2) return;
    activeEmojiCategoryId = "all";
    if (emojiSearchInput2) emojiSearchInput2.value = "";
    if (emojiSearchClear2) emojiSearchClear2.style.display = "none";
    renderEmojiCategoryTabs();
    renderEmojiGrid("all", "");
    emojiPickerPopover2.style.display = "flex";
    if (osShortcutKey) {
      const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform || "");
      osShortcutKey.textContent = isMac ? "Cmd + Ctrl + Space" : "Win + .";
    }
    setTimeout(() => {
      if (emojiSearchInput2) emojiSearchInput2.focus();
    }, 60);
  }
  function closeEmojiPicker() {
    const emojiPickerPopover2 = document.getElementById("emojiPickerPopover");
    if (emojiPickerPopover2) {
      emojiPickerPopover2.style.display = "none";
    }
  }
  function toggleEmojiPicker() {
    const emojiPickerPopover2 = document.getElementById("emojiPickerPopover");
    if (!emojiPickerPopover2) return;
    if (emojiPickerPopover2.style.display === "none" || !emojiPickerPopover2.style.display) {
      openEmojiPicker();
    } else {
      closeEmojiPicker();
    }
  }

  // src/modules/folders/modal.ts
  var inlineFolderCallback = null;
  function openFolderModal(folderId = null, onCreatedCallback = null) {
    state.editingFolderId = folderId;
    inlineFolderCallback = typeof onCreatedCallback === "function" ? onCreatedCallback : null;
    closeEmojiPicker();
    const folderModalTitle = document.getElementById("folderModalTitle");
    const folderNameInput = document.getElementById("folderNameInput");
    const folderIconInput2 = document.getElementById("folderIconInput");
    const folderColorInput = document.getElementById("folderColorInput");
    const folderIconDisplay2 = document.getElementById("folderIconDisplay");
    const folderModalBackdrop2 = document.getElementById("folderModalBackdrop");
    if (folderId) {
      const folder = state.folders.find((f) => f.id === folderId);
      if (folder) {
        if (folderModalTitle) folderModalTitle.textContent = "Edit Folder";
        if (folderNameInput) folderNameInput.value = folder.name || "";
        if (folderIconInput2) folderIconInput2.value = folder.icon || "\u{1F4C1}";
        if (folderColorInput) folderColorInput.value = folder.color || "#0a84ff";
        if (folderIconDisplay2) folderIconDisplay2.textContent = folder.icon || "\u{1F4C1}";
      }
    } else {
      if (folderModalTitle) folderModalTitle.textContent = "New Folder";
      if (folderNameInput) folderNameInput.value = "";
      if (folderIconInput2) folderIconInput2.value = "\u{1F4C1}";
      if (folderColorInput) folderColorInput.value = "#0a84ff";
      if (folderIconDisplay2) folderIconDisplay2.textContent = "\u{1F4C1}";
    }
    renderFolderEmojiQuickRow();
    if (folderModalBackdrop2) {
      folderModalBackdrop2.classList.add("active");
    }
    document.body.style.overflow = "hidden";
    if (folderNameInput) {
      setTimeout(() => folderNameInput.focus(), 60);
    }
  }
  function closeFolderModal() {
    closeEmojiPicker();
    const folderModalBackdrop2 = document.getElementById("folderModalBackdrop");
    if (folderModalBackdrop2) {
      folderModalBackdrop2.classList.remove("active");
    }
    const modalBackdrop2 = document.getElementById("modalBackdrop");
    const isMainModalActive = modalBackdrop2 && modalBackdrop2.classList.contains("active");
    if (!isMainModalActive) {
      document.body.style.overflow = "";
    }
    inlineFolderCallback = null;
  }
  function saveFolderForm(e, onFolderUpdated) {
    e.preventDefault();
    const folderNameInput = document.getElementById("folderNameInput");
    const folderIconInput2 = document.getElementById("folderIconInput");
    const folderColorInput = document.getElementById("folderColorInput");
    if (!folderNameInput) return;
    const name = folderNameInput.value.trim();
    if (!name) {
      folderNameInput.focus();
      return;
    }
    const icon = folderIconInput2 && folderIconInput2.value.trim() || "\u{1F4C1}";
    const color = folderColorInput && folderColorInput.value || "#0a84ff";
    let createdFolderId = null;
    if (state.editingFolderId) {
      const folder = state.folders.find((f) => f.id === state.editingFolderId);
      if (folder) {
        folder.name = name;
        folder.icon = icon;
        folder.color = color;
        folder.dateModified = (/* @__PURE__ */ new Date()).toISOString();
        showToast(`Updated folder "${name}"`);
      }
    } else {
      const newFolder = {
        id: `f-${Date.now()}`,
        name,
        icon,
        color,
        dateAdded: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.folders.push(newFolder);
      createdFolderId = newFolder.id;
      showToast(`Created folder "${name}" \u{1F4C1}`);
    }
    saveFolders();
    const cb = inlineFolderCallback;
    closeFolderModal();
    renderFoldersSidebar(onFolderUpdated);
    if (onFolderUpdated) onFolderUpdated();
    if (createdFolderId && typeof cb === "function") {
      cb(createdFolderId);
    }
  }
  var selectedBookmarksToMove = /* @__PURE__ */ new Set();
  var addBmSearchQuery = "";
  var addBmSourceFilter = "all";
  function openAddBookmarksModal(onSuccess) {
    let folder = state.folders.find((f) => f.id === state.activeFolderId);
    if (!folder) {
      if (state.folders.length > 0) {
        setActiveFolder(state.folders[0].id, onSuccess);
        folder = state.folders.find((f) => f.id === state.activeFolderId);
      } else {
        openFolderModal(null, (newFolderId) => {
          setActiveFolder(newFolderId, onSuccess);
          openAddBookmarksModal(onSuccess);
        });
        return;
      }
    }
    if (!folder) return;
    selectedBookmarksToMove.clear();
    addBmSearchQuery = "";
    addBmSourceFilter = "all";
    const addBmSearchInput2 = document.getElementById("addBmSearchInput");
    const addBmSearchClear2 = document.getElementById("addBmSearchClear");
    const addBookmarksModalIcon = document.getElementById("addBookmarksModalIcon");
    const addBookmarksModalTitle = document.getElementById("addBookmarksModalTitle");
    const addBmFilterPills2 = document.getElementById("addBmFilterPills");
    const addBookmarksModalBackdrop2 = document.getElementById("addBookmarksModalBackdrop");
    if (addBmSearchInput2) addBmSearchInput2.value = "";
    if (addBmSearchClear2) addBmSearchClear2.style.display = "none";
    if (addBookmarksModalIcon) addBookmarksModalIcon.textContent = folder.icon || "\u{1F4C1}";
    if (addBookmarksModalTitle) addBookmarksModalTitle.textContent = `Add Bookmarks to "${folder.name}"`;
    if (addBmFilterPills2) {
      addBmFilterPills2.querySelectorAll(".pill-filter-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-source") === "all");
      });
    }
    renderAddBookmarksList();
    if (addBookmarksModalBackdrop2) {
      addBookmarksModalBackdrop2.classList.add("active");
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (addBmSearchInput2) addBmSearchInput2.focus();
      }, 60);
    }
  }
  function closeAddBookmarksModal() {
    const addBookmarksModalBackdrop2 = document.getElementById("addBookmarksModalBackdrop");
    if (addBookmarksModalBackdrop2) {
      addBookmarksModalBackdrop2.classList.remove("active");
    }
    document.body.style.overflow = "";
  }
  function renderAddBookmarksList() {
    const addBmListContainer = document.getElementById("addBmListContainer");
    const addBmSubmitBtn = document.getElementById("addBmSubmitBtn");
    if (!addBmListContainer) return;
    const currentFolder = state.folders.find((f) => f.id === state.activeFolderId);
    if (!currentFolder) return;
    let candidates = state.entries.filter((e) => e.folderId !== currentFolder.id);
    if (addBmSourceFilter === "unorganized") {
      candidates = candidates.filter((e) => !e.folderId);
    } else if (addBmSourceFilter === "other") {
      candidates = candidates.filter((e) => !!e.folderId);
    }
    const q = addBmSearchQuery.trim().toLowerCase();
    if (q) {
      candidates = candidates.filter(
        (e) => e.name.toLowerCase().includes(q) || e.url.toLowerCase().includes(q) || e.description && e.description.toLowerCase().includes(q)
      );
    }
    candidates.sort((a, b) => a.name.localeCompare(b.name));
    addBmListContainer.innerHTML = "";
    if (candidates.length === 0) {
      addBmListContainer.innerHTML = `<div class="add-bm-empty">No available bookmarks found.</div>`;
      updateAddBmSubmitBtn(0);
      return;
    }
    candidates.forEach((entry) => {
      const isSelected = selectedBookmarksToMove.has(entry.id);
      const item = document.createElement("div");
      item.className = `add-bm-item ${isSelected ? "selected" : ""}`;
      item.setAttribute("data-id", entry.id);
      const iconUrl = entry.iconUrl || entry.icon || getFaviconUrl(entry.url);
      const existingFolder = state.folders.find((f) => f.id === entry.folderId);
      const folderBadge = existingFolder ? `<span class="add-bm-folder-badge">${existingFolder.icon || "\u{1F4C1}"} ${escapeHtml(existingFolder.name)}</span>` : `<span class="add-bm-folder-badge unorg">Unorganized</span>`;
      item.innerHTML = `
      <input type="checkbox" class="add-bm-checkbox" ${isSelected ? "checked" : ""}>
      <img class="add-bm-icon" src="${escapeHtml(iconUrl)}" alt="" onerror="this.src='https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(entry.url)}&size=64'">
      <div class="add-bm-info">
        <div class="add-bm-name">${escapeHtml(entry.name)}</div>
        <div class="add-bm-url">${escapeHtml(entry.url)}</div>
      </div>
      ${folderBadge}
    `;
      item.addEventListener("click", (e) => {
        const cb = item.querySelector(".add-bm-checkbox");
        if (e.target !== cb && cb) {
          cb.checked = !cb.checked;
        }
        if (cb && cb.checked) {
          selectedBookmarksToMove.add(entry.id);
          item.classList.add("selected");
        } else {
          selectedBookmarksToMove.delete(entry.id);
          item.classList.remove("selected");
        }
        updateAddBmSubmitBtn();
      });
      addBmListContainer.appendChild(item);
    });
    updateAddBmSubmitBtn(candidates.length);
  }
  function updateAddBmSubmitBtn(totalAvailable = -1) {
    const addBmSubmitBtn = document.getElementById("addBmSubmitBtn");
    const addBmSelectedCount = document.getElementById("addBmSelectedCount");
    const addBmTotalCount = document.getElementById("addBmTotalCount");
    const count = selectedBookmarksToMove.size;
    if (addBmSelectedCount) addBmSelectedCount.textContent = String(count);
    if (addBmTotalCount && totalAvailable >= 0) addBmTotalCount.textContent = String(totalAvailable);
    if (!addBmSubmitBtn) return;
    addBmSubmitBtn.disabled = count === 0;
    addBmSubmitBtn.textContent = `Add Selected (${count})`;
  }
  function commitAddBookmarksToFolder(onSuccess) {
    const folder = state.folders.find((f) => f.id === state.activeFolderId);
    if (!folder) return;
    const count = selectedBookmarksToMove.size;
    if (count === 0) return;
    const diskList = getLatestStoredEntries();
    diskList.forEach((entry) => {
      if (selectedBookmarksToMove.has(entry.id)) {
        entry.folderId = folder.id;
        entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
      }
    });
    saveEntries(diskList);
    closeAddBookmarksModal();
    renderFoldersSidebar(onSuccess);
    if (onSuccess) onSuccess();
    showToast(`Added ${count} bookmark${count !== 1 ? "s" : ""} to "${folder.name}" \u{1F4C1}`);
  }
  var confirmMoveBookmarksToFolder = commitAddBookmarksToFolder;
  function setAddBmSearchQuery(q) {
    addBmSearchQuery = q;
  }
  function setAddBmSourceFilter(source) {
    addBmSourceFilter = source;
  }
  function getFilteredBookmarksToMove() {
    const currentFolder = state.folders.find((f) => f.id === state.activeFolderId);
    if (!currentFolder) return [];
    let candidates = state.entries.filter((e) => e.folderId !== currentFolder.id);
    if (addBmSourceFilter === "unorganized") {
      candidates = candidates.filter((e) => !e.folderId);
    } else if (addBmSourceFilter === "other") {
      candidates = candidates.filter((e) => !!e.folderId);
    }
    const q = addBmSearchQuery.trim().toLowerCase();
    if (q) {
      candidates = candidates.filter(
        (e) => e.name.toLowerCase().includes(q) || e.url.toLowerCase().includes(q) || e.description && e.description.toLowerCase().includes(q)
      );
    }
    return candidates;
  }
  function selectAllBookmarksToMove() {
    const available = getFilteredBookmarksToMove();
    available.forEach((e) => selectedBookmarksToMove.add(e.id));
    renderAddBookmarksList();
  }
  function deselectAllBookmarksToMove() {
    selectedBookmarksToMove.clear();
    renderAddBookmarksList();
  }

  // src/modules/health/checker.ts
  var isHealthScanning = false;
  var healthAbortRequested = false;
  var healthFilter = "all";
  var healthSearchQuery = "";
  var currentlyCheckingIds = /* @__PURE__ */ new Set();
  async function checkUrlHealth(url) {
    if (!url) {
      return {
        status: "broken",
        error: "Empty URL",
        code: null,
        lastChecked: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6e3);
    try {
      await fetch(targetUrl, {
        method: "GET",
        mode: "no-cors",
        signal: controller.signal,
        cache: "no-cache"
      });
      clearTimeout(timeoutId);
      return {
        status: "healthy",
        code: 200,
        error: null,
        lastChecked: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (err) {
      clearTimeout(timeoutId);
      try {
        const domain = getDomain(targetUrl);
        if (domain) {
          const imgAlive = await new Promise((resolve) => {
            const img = new Image();
            const timer = setTimeout(() => resolve(false), 2500);
            img.onload = () => {
              clearTimeout(timer);
              resolve(true);
            };
            img.onerror = () => {
              clearTimeout(timer);
              resolve(false);
            };
            img.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
              targetUrl
            )}&size=32`;
          });
          if (imgAlive) {
            return {
              status: "healthy",
              code: 200,
              error: null,
              lastChecked: (/* @__PURE__ */ new Date()).toISOString()
            };
          }
        }
      } catch {
      }
      const isAborted = err.name === "AbortError";
      return {
        status: "broken",
        code: isAborted ? 408 : 0,
        error: isAborted ? "Connection timed out (6s)" : "DNS error or host unreachable",
        lastChecked: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  var savedHealthEditCallback = null;
  var savedHealthDeleteCallback = null;
  var savedHealthUpdateCallback = null;
  function openHealthModal(onEditRequested, onDeleteRequested, onUpdate) {
    if (typeof onEditRequested === "function") savedHealthEditCallback = onEditRequested;
    if (typeof onDeleteRequested === "function") savedHealthDeleteCallback = onDeleteRequested;
    if (typeof onUpdate === "function") savedHealthUpdateCallback = onUpdate;
    healthSearchQuery = "";
    healthFilter = "all";
    const healthSearchInput2 = document.getElementById("healthSearchInput");
    const healthSearchClear2 = document.getElementById("healthSearchClear");
    const healthFilterPills2 = document.getElementById("healthFilterPills");
    const healthModalBackdrop2 = document.getElementById("healthModalBackdrop");
    if (healthSearchInput2) healthSearchInput2.value = "";
    if (healthSearchClear2) healthSearchClear2.style.display = "none";
    if (healthFilterPills2) {
      healthFilterPills2.querySelectorAll(".pill-filter-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-health") === "all");
      });
    }
    updateHealthSummaryCards();
    renderHealthModalList(savedHealthEditCallback || void 0, savedHealthDeleteCallback || void 0, savedHealthUpdateCallback || void 0);
    if (healthModalBackdrop2) {
      healthModalBackdrop2.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }
  function closeHealthModal() {
    if (isHealthScanning) {
      stopHealthScan();
    }
    const healthModalBackdrop2 = document.getElementById("healthModalBackdrop");
    if (healthModalBackdrop2) {
      healthModalBackdrop2.classList.remove("active");
    }
    document.body.style.overflow = "";
  }
  function updateHealthSummaryCards() {
    const list = getLatestStoredEntries();
    const total = list.length;
    const healthy = list.filter((e) => e.health && e.health.status === "healthy").length;
    const broken = list.filter((e) => e.health && e.health.status === "broken").length;
    const untested = list.filter((e) => !e.health || e.health.status === "untested").length;
    const healthStatTotal = document.getElementById("healthStatTotal");
    const healthStatHealthy = document.getElementById("healthStatHealthy");
    const healthStatBroken = document.getElementById("healthStatBroken");
    const healthStatUntested = document.getElementById("healthStatUntested");
    if (healthStatTotal) healthStatTotal.textContent = String(total);
    if (healthStatHealthy) healthStatHealthy.textContent = String(healthy);
    if (healthStatBroken) healthStatBroken.textContent = String(broken);
    if (healthStatUntested) healthStatUntested.textContent = String(untested);
  }
  function getFilteredHealthEntries() {
    const list = getLatestStoredEntries();
    let res = [...list];
    if (healthFilter === "broken") {
      res = res.filter((e) => e.health && e.health.status === "broken");
    } else if (healthFilter === "healthy") {
      res = res.filter((e) => e.health && e.health.status === "healthy");
    } else if (healthFilter === "untested") {
      res = res.filter((e) => !e.health || e.health.status === "untested");
    }
    if (healthSearchQuery) {
      const q = healthSearchQuery.toLowerCase();
      res = res.filter(
        (e) => (e.name || "").toLowerCase().includes(q) || (e.url || "").toLowerCase().includes(q)
      );
    }
    return res;
  }
  function renderHealthModalList(onEditRequested, onDeleteRequested, onUpdate) {
    if (typeof onEditRequested === "function") savedHealthEditCallback = onEditRequested;
    if (typeof onDeleteRequested === "function") savedHealthDeleteCallback = onDeleteRequested;
    if (typeof onUpdate === "function") savedHealthUpdateCallback = onUpdate;
    const effectiveOnEdit = onEditRequested || savedHealthEditCallback;
    const effectiveOnDelete = onDeleteRequested || savedHealthDeleteCallback;
    const effectiveOnUpdate = onUpdate || savedHealthUpdateCallback;
    const healthList = document.getElementById("healthList");
    const healthEmpty = document.getElementById("healthEmpty");
    if (!healthList) return;
    const filtered = getFilteredHealthEntries();
    updateHealthSummaryCards();
    if (filtered.length === 0) {
      healthList.innerHTML = "";
      if (healthEmpty) healthEmpty.style.display = "block";
      return;
    }
    if (healthEmpty) healthEmpty.style.display = "none";
    healthList.innerHTML = "";
    filtered.forEach((entry) => {
      const row = document.createElement("div");
      const isChecking = currentlyCheckingIds.has(entry.id);
      const isBroken = !isChecking && entry.health && entry.health.status === "broken";
      const isHealthy = !isChecking && entry.health && entry.health.status === "healthy";
      row.className = `health-item-row ${isBroken ? "is-broken" : ""}`;
      let statusBadgeHtml = '<span class="health-status-badge untested">\u26AA Untested</span>';
      if (isChecking) {
        statusBadgeHtml = '<span class="health-status-badge checking">\u26A1 Testing\u2026</span>';
      } else if (isHealthy) {
        statusBadgeHtml = `<span class="health-status-badge healthy" title="Tested ${entry.health?.lastChecked ? timeAgo(entry.health.lastChecked) : ""}">\u{1F7E2} Healthy</span>`;
      } else if (isBroken) {
        statusBadgeHtml = `<span class="health-status-badge broken" title="${escapeHtml(
          entry.health?.error || "Dead link"
        )}">\u26A0\uFE0F ${escapeHtml(entry.health?.error || "Broken")}</span>`;
      }
      const domain = getDomain(entry.url);
      const iconSrc = entry.iconUrl || entry.icon || "";
      const iconHtml = iconSrc ? `<img src="${escapeHtml(
        iconSrc
      )}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>\u{1F310}</span>'">` : '<span class="icon-fallback">\u{1F310}</span>';
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
          <button type="button" class="health-action-btn health-retest-btn" title="Re-test this link">\u{1F504}</button>
          <button type="button" class="health-action-btn health-edit-btn" title="Edit website URL">\u270F\uFE0F</button>
          <button type="button" class="health-action-btn health-visit-btn" title="Open website in new tab">\u2197\uFE0F</button>
          <button type="button" class="health-action-btn btn-delete health-delete-btn" title="Delete bookmark">\u{1F5D1}\uFE0F</button>
        </div>
      </div>
    `;
      const retestBtn = row.querySelector(".health-retest-btn");
      if (retestBtn) {
        retestBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          testSingleBookmarkHealth(entry.id, effectiveOnUpdate || void 0);
        });
      }
      const editBtn = row.querySelector(".health-edit-btn");
      if (editBtn) {
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          closeHealthModal();
          if (effectiveOnEdit) effectiveOnEdit(entry.id);
        });
      }
      const visitBtn = row.querySelector(".health-visit-btn");
      if (visitBtn) {
        visitBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          window.open(entry.url, "_blank", "noopener,noreferrer");
        });
      }
      const deleteBtn = row.querySelector(".health-delete-btn");
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm(`Delete bookmark "${entry.name}"?`)) {
            if (effectiveOnDelete) effectiveOnDelete(entry.id);
            renderHealthModalList(effectiveOnEdit || void 0, effectiveOnDelete || void 0, effectiveOnUpdate || void 0);
          }
        });
      }
      healthList.appendChild(row);
    });
  }
  async function testSingleBookmarkHealth(entryId, onUpdate) {
    const diskList = getLatestStoredEntries();
    const entry = diskList.find((e) => e.id === entryId);
    if (!entry) return;
    currentlyCheckingIds.add(entryId);
    renderHealthModalList();
    const result = await checkUrlHealth(entry.url);
    entry.health = result;
    entry.dateModified = (/* @__PURE__ */ new Date()).toISOString();
    currentlyCheckingIds.delete(entryId);
    saveEntries(diskList);
    renderHealthModalList(savedHealthEditCallback || void 0, savedHealthDeleteCallback || void 0, onUpdate || savedHealthUpdateCallback || void 0);
    const cb = onUpdate || savedHealthUpdateCallback;
    if (cb) cb();
    showToast(`"${entry.name}": ${result.status === "healthy" ? "\u{1F7E2} Healthy" : "\u26A0\uFE0F " + result.error}`);
  }
  async function startHealthScan(onlyBroken = false, onUpdate) {
    if (isHealthScanning) return;
    const diskList = getLatestStoredEntries();
    let targets = diskList;
    if (onlyBroken) {
      targets = diskList.filter((e) => e.health && e.health.status === "broken");
    }
    if (targets.length === 0) {
      showToast("No links match the scan criteria.");
      return;
    }
    isHealthScanning = true;
    healthAbortRequested = false;
    const healthProgressWrap = document.getElementById("healthProgressWrap");
    const healthStopBtn2 = document.getElementById("healthStopBtn");
    const healthScanAllBtn2 = document.getElementById("healthScanAllBtn");
    const healthScanBrokenBtn2 = document.getElementById("healthScanBrokenBtn");
    const healthProgressFill = document.getElementById("healthProgressFill");
    const healthProgressPercent = document.getElementById("healthProgressPercent");
    const healthProgressStatusText = document.getElementById("healthProgressStatusText");
    if (healthProgressWrap) healthProgressWrap.style.display = "flex";
    if (healthStopBtn2) healthStopBtn2.style.display = "inline-flex";
    if (healthScanAllBtn2) healthScanAllBtn2.disabled = true;
    if (healthScanBrokenBtn2) healthScanBrokenBtn2.disabled = true;
    const total = targets.length;
    let completed = 0;
    const queue = [...targets];
    const workerCount = Math.min(4, queue.length);
    const circuitBreaker = new DomainCircuitBreaker(2);
    async function worker() {
      while (queue.length > 0 && !healthAbortRequested) {
        const item = queue.shift();
        if (!item) break;
        const domain = getDomain(item.url);
        currentlyCheckingIds.add(item.id);
        renderHealthModalList();
        let healthRes;
        if (domain && circuitBreaker.isTripped(domain)) {
          healthRes = {
            status: "broken",
            code: 0,
            error: "Host circuit breaker tripped (consecutive failures)",
            lastChecked: (/* @__PURE__ */ new Date()).toISOString()
          };
        } else {
          healthRes = await checkUrlHealth(item.url);
          if (healthRes.status === "healthy" && domain) {
            circuitBreaker.recordSuccess(domain);
          } else if (healthRes.status === "broken" && domain) {
            circuitBreaker.recordFailure(domain);
          }
        }
        item.health = healthRes;
        item.dateModified = (/* @__PURE__ */ new Date()).toISOString();
        currentlyCheckingIds.delete(item.id);
        completed++;
        const pct = Math.round(completed / total * 100);
        if (healthProgressFill) healthProgressFill.style.width = `${pct}%`;
        if (healthProgressPercent) healthProgressPercent.textContent = `${pct}%`;
        if (healthProgressStatusText) {
          healthProgressStatusText.textContent = `Testing (${completed}/${total}): ${item.name}\u2026`;
        }
        renderHealthModalList();
      }
    }
    const workers = Array.from({ length: workerCount }, () => worker());
    await Promise.all(workers);
    saveEntries(diskList);
    isHealthScanning = false;
    if (healthProgressWrap) healthProgressWrap.style.display = "none";
    if (healthStopBtn2) healthStopBtn2.style.display = "none";
    if (healthScanAllBtn2) healthScanAllBtn2.disabled = false;
    if (healthScanBrokenBtn2) healthScanBrokenBtn2.disabled = false;
    currentlyCheckingIds.clear();
    renderHealthModalList(savedHealthEditCallback || void 0, savedHealthDeleteCallback || void 0, onUpdate || savedHealthUpdateCallback || void 0);
    const finishCb = onUpdate || savedHealthUpdateCallback;
    if (finishCb) finishCb();
    const brokenCount = diskList.filter((e) => e.health && e.health.status === "broken").length;
    if (healthAbortRequested) {
      showToast(`Health scan cancelled. Tested ${completed}/${total} links.`);
    } else {
      showToast(`Health check complete! ${brokenCount} broken link${brokenCount !== 1 ? "s" : ""} identified.`);
    }
  }
  function stopHealthScan() {
    healthAbortRequested = true;
  }
  function setHealthSearchQuery(q) {
    healthSearchQuery = q;
  }
  function setHealthFilter(filter) {
    healthFilter = filter;
  }

  // src/modules/command-palette/palette.ts
  var isCommandPaletteOpen = false;
  var paletteSelectedIndex = 0;
  var paletteFlatItems = [];
  function openCommandPalette(callbacks) {
    const commandPaletteBackdrop = document.getElementById("commandPaletteBackdrop");
    const commandPaletteInput = document.getElementById("commandPaletteInput");
    const commandPaletteClearBtn = document.getElementById("commandPaletteClearBtn");
    if (!commandPaletteBackdrop || !commandPaletteInput) return;
    isCommandPaletteOpen = true;
    commandPaletteBackdrop.style.display = "flex";
    commandPaletteInput.value = "";
    if (commandPaletteClearBtn) commandPaletteClearBtn.style.display = "none";
    paletteSelectedIndex = 0;
    renderCommandPaletteResults("", callbacks);
    setTimeout(() => {
      commandPaletteInput.focus();
    }, 40);
  }
  function closeCommandPalette() {
    const commandPaletteBackdrop = document.getElementById("commandPaletteBackdrop");
    if (!commandPaletteBackdrop) return;
    isCommandPaletteOpen = false;
    commandPaletteBackdrop.style.display = "none";
  }
  function toggleCommandPalette(callbacks) {
    if (isCommandPaletteOpen) {
      closeCommandPalette();
    } else {
      openCommandPalette(callbacks);
    }
  }
  function updatePaletteSelection() {
    const commandPaletteResults = document.getElementById("commandPaletteResults");
    if (!commandPaletteResults) return;
    const items = commandPaletteResults.querySelectorAll(".palette-item");
    items.forEach((el, idx) => {
      const isSelected = idx === paletteSelectedIndex;
      el.classList.toggle("is-selected", isSelected);
      if (isSelected) {
        el.scrollIntoView({ block: "nearest" });
      }
    });
  }
  function getCommandPaletteActions(callbacks) {
    const isDark = document.documentElement.getAttribute("data-theme") !== "light";
    return [
      {
        id: "action-add",
        type: "action",
        title: "Add Website",
        subtitle: "Save a new bookmark with title, URL, tags & icon",
        icon: "\u2795",
        badge: "Action",
        keywords: ["add", "new", "create", "bookmark", "website", "url"],
        run: () => callbacks.openAddModal()
      },
      {
        id: "action-theme-toggle",
        type: "action",
        title: isDark ? "Switch to Light Mode" : "Switch to Dark Mode",
        subtitle: isDark ? "Toggle light appearance" : "Toggle dark appearance",
        icon: isDark ? "\u2600\uFE0F" : "\u{1F319}",
        badge: "Theme",
        keywords: ["theme", "dark", "light", "mode", "color", "appearance"],
        run: () => callbacks.toggleTheme()
      },
      {
        id: "action-theme-customizer",
        type: "action",
        title: "Customize Theme & Colors",
        subtitle: "Edit palettes, accent colors, modal surfaces & tag styles",
        icon: "\u{1F3A8}",
        badge: "Theme",
        keywords: ["theme", "customizer", "palette", "colors", "accent", "personalize"],
        run: () => callbacks.openThemeModal()
      },
      {
        id: "action-refresh-icons",
        type: "action",
        title: "Refresh All Icons",
        subtitle: "Batch update website favicons using multi-source HD resolver",
        icon: "\u{1F504}",
        badge: "Action",
        keywords: ["refresh", "icon", "favicon", "logo", "update"],
        run: () => callbacks.refreshAllIcons()
      },
      {
        id: "action-health-check",
        type: "action",
        title: "Check Website Health & Broken Links",
        subtitle: "Probe all saved bookmarks for 404s, timeouts, or dead links",
        icon: "\u{1F3E5}",
        badge: "Health",
        keywords: ["health", "broken", "dead", "links", "check", "status", "404"],
        run: () => callbacks.openHealthModal()
      },
      {
        id: "action-export-backup",
        type: "action",
        title: "Export JSON Backup",
        subtitle: "Save directory backup directly to your exports folder",
        icon: "\u{1F4BE}",
        badge: "Backup",
        keywords: ["export", "backup", "save", "json", "download"],
        run: () => callbacks.exportData()
      },
      {
        id: "action-import-backup",
        type: "action",
        title: "Import Bookmarks",
        subtitle: "Import from JSON backup or browser bookmarks.html (Chrome, Firefox, Safari, Edge)",
        icon: "\u{1F4E5}",
        badge: "Import",
        keywords: ["import", "restore", "load", "json", "html", "browser", "chrome", "firefox", "safari", "edge", "bookmarks"],
        run: () => callbacks.triggerImport()
      },
      {
        id: "action-manage-categories",
        type: "action",
        title: "Manage Categories & Colors",
        subtitle: "Rename, recolor, delete, or organize your categories",
        icon: "\u{1F3F7}\uFE0F",
        badge: "Categories",
        keywords: ["category", "categories", "tags", "colors", "manage"],
        run: () => callbacks.openCatModal()
      },
      {
        id: "action-pin-favorites",
        type: "action",
        title: state.pinFavorites ? "Unpin Favorites from Top" : "Pin Favorites to Top",
        subtitle: state.pinFavorites ? "Restore natural chronological order" : "Bring all starred favorites to the top",
        icon: "\u2B50",
        badge: "Sort",
        keywords: ["favorite", "favorites", "pin", "star", "top", "sort"],
        run: () => {
          state.pinFavorites = !state.pinFavorites;
          localStorage.setItem(PIN_FAVORITES_KEY, String(state.pinFavorites));
          callbacks.updateCardsOnly();
          showToast(state.pinFavorites ? "Favorites pinned to top \u2B50" : "Natural sort order restored");
        }
      },
      {
        id: "action-view-cards",
        type: "action",
        title: "Switch to Bento Cards View",
        subtitle: "Rich cards with descriptions, tags, and spotlight hover glow",
        icon: "\u{1F3B4}",
        badge: "Layout",
        keywords: ["view", "layout", "cards", "bento", "grid"],
        run: () => callbacks.setViewMode("cards")
      },
      {
        id: "action-view-table",
        type: "action",
        title: "Switch to Compact Table View",
        subtitle: "High-density tabular rows for fast scanning and power users",
        icon: "\u{1F4CB}",
        badge: "Layout",
        keywords: ["view", "layout", "table", "list", "compact", "rows"],
        run: () => callbacks.setViewMode("table")
      },
      {
        id: "action-view-icons",
        type: "action",
        title: "Switch to Minimal Icon Grid",
        subtitle: "Speed Dial / app launcher style with large squircle icons",
        icon: "\u{1F4F1}",
        badge: "Layout",
        keywords: ["view", "layout", "icons", "speed dial", "minimal", "launcher"],
        run: () => callbacks.setViewMode("icons")
      },
      {
        id: "action-toggle-insights",
        type: "action",
        title: state.isInsightsOpen ? "Collapse Insights Dashboard" : "Open Insights & Usage Dashboard",
        subtitle: "Speed Dial, site launch analytics, category distribution & dormant links",
        icon: "\u{1F4CA}",
        badge: "Dashboard",
        keywords: ["insights", "analytics", "speed dial", "stats", "dashboard", "usage", "dormant", "visits"],
        run: () => callbacks.toggleInsightsDrawer()
      }
    ];
  }
  function getCommandPaletteFolders(callbacks) {
    const list = [
      {
        id: "folder-all",
        type: "folder",
        title: "All Bookmarks",
        subtitle: `View all ${state.entries.length} saved bookmarks`,
        icon: "\u{1F4C1}",
        badge: "View",
        keywords: ["all", "bookmarks", "library"],
        run: () => callbacks.setActiveFolder("all")
      },
      {
        id: "folder-favorites",
        type: "folder",
        title: "Favorites",
        subtitle: `View your starred favorites (${state.entries.filter((e) => e.isFavorite).length})`,
        icon: "\u2B50",
        badge: "View",
        keywords: ["favorite", "favorites", "starred"],
        run: () => callbacks.setActiveFolder("favorites")
      },
      {
        id: "folder-unorganized",
        type: "folder",
        title: "Unorganized",
        subtitle: `Bookmarks not in any collection (${state.entries.filter((e) => !e.folderId).length})`,
        icon: "\u{1F4C2}",
        badge: "View",
        keywords: ["unorganized", "inbox", "unsorted"],
        run: () => callbacks.setActiveFolder("unorganized")
      }
    ];
    const brokenCount = state.entries.filter((e) => e.health && e.health.status === "broken").length;
    if (brokenCount > 0) {
      list.push({
        id: "folder-broken",
        type: "folder",
        title: "Broken Links",
        subtitle: `${brokenCount} unreachable or dead links found`,
        icon: "\u26A0\uFE0F",
        badge: "Health",
        keywords: ["broken", "dead", "offline", "error"],
        run: () => callbacks.setActiveFolder("broken")
      });
    }
    state.folders.forEach((f) => {
      const count = state.entries.filter((e) => e.folderId === f.id).length;
      list.push({
        id: `folder-${f.id}`,
        type: "folder",
        title: f.name,
        subtitle: `Collection \u2022 ${count} site${count !== 1 ? "s" : ""}`,
        icon: f.icon || "\u{1F4C1}",
        badge: "Collection",
        color: f.color,
        keywords: ["folder", "collection", f.name.toLowerCase()],
        run: () => callbacks.setActiveFolder(f.id)
      });
    });
    return list;
  }
  function getCommandPaletteBookmarks(query, callbacks) {
    if (!query) {
      return state.entries.slice().sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0) || new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 6).map((entry) => createBookmarkPaletteItem(entry, "Frequent", callbacks));
    }
    const q = query.toLowerCase().trim();
    const matched = [];
    for (const entry of state.entries) {
      const nameMatch = entry.name.toLowerCase().includes(q);
      const urlMatch = entry.url.toLowerCase().includes(q);
      const descMatch = (entry.description || "").toLowerCase().includes(q);
      const catMatch = (entry.categories || []).some((c) => c.toLowerCase().includes(q));
      if (nameMatch || urlMatch || descMatch || catMatch) {
        matched.push(createBookmarkPaletteItem(entry, "Bookmark", callbacks));
      }
    }
    return matched;
  }
  function createBookmarkPaletteItem(entry, badgeLabel, callbacks) {
    const domain = getDomain(entry.url);
    const folder = entry.folderId ? state.folders.find((f) => f.id === entry.folderId) : null;
    return {
      id: `bookmark-${entry.id}`,
      type: "bookmark",
      title: entry.name,
      subtitle: `${domain}${entry.description ? ` \u2022 ${entry.description}` : ""}`,
      iconUrl: entry.iconUrl || entry.icon,
      badge: folder ? folder.name : badgeLabel,
      color: folder ? folder.color : null,
      run: () => callbacks.visitEntry(entry.id)
    };
  }
  function renderCommandPaletteResults(rawQuery, callbacks) {
    const commandPaletteResults = document.getElementById("commandPaletteResults");
    const paletteMatchCount = document.getElementById("paletteMatchCount");
    if (!commandPaletteResults) return;
    const query = (rawQuery || "").trim().toLowerCase();
    paletteFlatItems = [];
    const allActions = getCommandPaletteActions(callbacks);
    const allFolders = getCommandPaletteFolders(callbacks);
    const bookmarks = getCommandPaletteBookmarks(query, callbacks);
    let filteredActions = [];
    let filteredFolders = [];
    if (!query) {
      filteredActions = allActions;
      filteredFolders = allFolders;
    } else {
      filteredActions = allActions.filter(
        (a) => a.title.toLowerCase().includes(query) || a.subtitle.toLowerCase().includes(query) || a.keywords && a.keywords.some((k) => k.includes(query))
      );
      filteredFolders = allFolders.filter(
        (f) => f.title.toLowerCase().includes(query) || f.subtitle.toLowerCase().includes(query) || f.keywords && f.keywords.some((k) => k.includes(query))
      );
    }
    commandPaletteResults.innerHTML = "";
    const sections = [];
    if (filteredActions.length > 0) {
      sections.push({ title: "Quick Actions", items: filteredActions });
    }
    if (filteredFolders.length > 0) {
      sections.push({ title: "Collections & Views", items: filteredFolders });
    }
    if (bookmarks.length > 0) {
      sections.push({ title: query ? "Bookmarks" : "Frequently Visited", items: bookmarks });
    }
    if (sections.length === 0) {
      commandPaletteResults.innerHTML = `
      <div class="palette-empty">
        No matches found for "<strong>${escapeHtml(rawQuery)}</strong>"
      </div>
    `;
      if (paletteMatchCount) paletteMatchCount.textContent = "0 items";
      return;
    }
    let totalItems = 0;
    sections.forEach((sec) => {
      const secEl = document.createElement("div");
      secEl.className = "palette-section";
      const titleEl = document.createElement("div");
      titleEl.className = "palette-section-title";
      titleEl.textContent = sec.title;
      secEl.appendChild(titleEl);
      sec.items.forEach((item) => {
        const itemIdx = paletteFlatItems.length;
        paletteFlatItems.push(item);
        totalItems++;
        const row = document.createElement("div");
        row.className = `palette-item ${itemIdx === paletteSelectedIndex ? "is-selected" : ""}`;
        row.setAttribute("data-index", String(itemIdx));
        const iconHtml = item.iconUrl ? `<div class="palette-item-icon"><img src="${escapeHtml(item.iconUrl)}" alt="" onerror="this.parentElement.textContent='\u{1F310}'"></div>` : `<div class="palette-item-icon" ${item.color ? `style="border-color: ${escapeHtml(item.color)};"` : ""}>${escapeHtml(
          item.icon || "\u26A1"
        )}</div>`;
        const badgeHtml = item.badge ? `<span class="palette-item-badge" ${item.color ? `style="background: ${escapeHtml(item.color)}18; color: ${escapeHtml(item.color)};"` : ""}>${escapeHtml(
          item.badge
        )}</span>` : "";
        row.innerHTML = `
        ${iconHtml}
        <div class="palette-item-info">
          <div class="palette-item-title">${escapeHtml(item.title)}</div>
          <div class="palette-item-subtitle">${escapeHtml(item.subtitle)}</div>
        </div>
        ${badgeHtml}
      `;
        row.addEventListener("click", () => {
          closeCommandPalette();
          item.run();
        });
        row.addEventListener("mouseenter", () => {
          paletteSelectedIndex = itemIdx;
          updatePaletteSelection();
        });
        secEl.appendChild(row);
      });
      commandPaletteResults.appendChild(secEl);
    });
    if (paletteMatchCount) {
      paletteMatchCount.textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`;
    }
    if (paletteSelectedIndex >= totalItems) {
      paletteSelectedIndex = 0;
    }
    updatePaletteSelection();
  }
  function initCommandPalette(callbacks) {
    const cmdPaletteTrigger2 = document.getElementById("cmdPaletteTrigger");
    const commandPaletteBackdrop = document.getElementById("commandPaletteBackdrop");
    const commandPaletteInput = document.getElementById("commandPaletteInput");
    const commandPaletteClearBtn = document.getElementById("commandPaletteClearBtn");
    const commandPaletteEscBadge = document.getElementById("commandPaletteEscBadge");
    const cmdPaletteKbdLabel = document.getElementById("cmdPaletteKbdLabel");
    if (cmdPaletteKbdLabel) {
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      cmdPaletteKbdLabel.textContent = isMac ? "\u2318K" : "Ctrl+K";
    }
    if (cmdPaletteTrigger2) {
      cmdPaletteTrigger2.addEventListener("click", () => {
        openCommandPalette(callbacks);
      });
    }
    if (commandPaletteBackdrop) {
      commandPaletteBackdrop.addEventListener("click", (e) => {
        if (e.target === commandPaletteBackdrop) {
          closeCommandPalette();
        }
      });
    }
    if (commandPaletteEscBadge) {
      commandPaletteEscBadge.addEventListener("click", () => {
        closeCommandPalette();
      });
    }
    if (commandPaletteInput) {
      commandPaletteInput.addEventListener("input", () => {
        const q = commandPaletteInput.value;
        if (commandPaletteClearBtn) {
          commandPaletteClearBtn.style.display = q ? "inline-flex" : "none";
        }
        paletteSelectedIndex = 0;
        renderCommandPaletteResults(q, callbacks);
      });
      commandPaletteInput.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (paletteFlatItems.length > 0) {
            paletteSelectedIndex = (paletteSelectedIndex + 1) % paletteFlatItems.length;
            updatePaletteSelection();
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (paletteFlatItems.length > 0) {
            paletteSelectedIndex = (paletteSelectedIndex - 1 + paletteFlatItems.length) % paletteFlatItems.length;
            updatePaletteSelection();
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
          const selected = paletteFlatItems[paletteSelectedIndex];
          if (selected) {
            closeCommandPalette();
            selected.run();
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeCommandPalette();
        }
      });
    }
    if (commandPaletteClearBtn && commandPaletteInput) {
      commandPaletteClearBtn.addEventListener("click", () => {
        commandPaletteInput.value = "";
        commandPaletteClearBtn.style.display = "none";
        paletteSelectedIndex = 0;
        renderCommandPaletteResults("", callbacks);
        commandPaletteInput.focus();
      });
    }
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        const target = e.target;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA") && target !== commandPaletteInput) {
          return;
        }
        e.preventDefault();
        toggleCommandPalette(callbacks);
        return;
      }
      if (isCommandPaletteOpen && e.key === "Escape") {
        e.preventDefault();
        closeCommandPalette();
        return;
      }
      if (e.key === "/" && !isCommandPaletteOpen) {
        const tag = document.activeElement ? document.activeElement.tagName : "";
        if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
          e.preventDefault();
          openCommandPalette(callbacks);
          return;
        }
      }
    });
  }

  // src/modules/io/export.ts
  var IDB_KEY_EXPORTS = "exports_dir_handle";
  async function getStoredExportsDirHandle() {
    return await idbGetHandle(IDB_KEY_EXPORTS);
  }
  async function saveExportsDirHandle(handle) {
    return await idbSaveHandle(IDB_KEY_EXPORTS, handle);
  }
  function getBackupTimestampString(d = /* @__PURE__ */ new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const mins = pad(d.getMinutes());
    const secs = pad(d.getSeconds());
    return `${year}-${month}-${day}_${hours}-${mins}-${secs}`;
  }
  function getExportJson() {
    const rawList = getLatestStoredEntries();
    if (rawList.length === 0 && state.folders.length === 0) {
      showToast("Nothing to export.");
      return null;
    }
    const cleanList = rawList.map((e) => {
      const copy = { ...e };
      if (copy.iconUrl || copy.icon) {
        copy.iconUrl = copy.iconUrl || copy.icon;
        if (copy.icon && (copy.icon === copy.iconUrl || !copy.customIcon)) {
          delete copy.icon;
        }
      }
      return copy;
    });
    const timestamp = getBackupTimestampString();
    const exportObject = {
      version: 2,
      folders: state.folders,
      entries: cleanList
    };
    return {
      json: JSON.stringify(exportObject, null, 2),
      baseName: `app-directory-backup-${timestamp}`,
      filename: `app-directory-backup-${timestamp}.json`
    };
  }
  async function getUniqueFileHandleInDir(dirHandle, baseName, ext = ".json") {
    let candidateName = `${baseName}${ext}`;
    let counter = 1;
    while (true) {
      try {
        await dirHandle.getFileHandle(candidateName, { create: false });
        candidateName = `${baseName} (${counter})${ext}`;
        counter++;
      } catch {
        return await dirHandle.getFileHandle(candidateName, { create: true });
      }
    }
  }
  async function exportToFolderDirect(changeFolder = false) {
    const data = getExportJson();
    if (!data) return;
    if ("showDirectoryPicker" in window) {
      try {
        let dirHandle = changeFolder ? null : await getStoredExportsDirHandle();
        if (dirHandle) {
          let perm = await dirHandle.queryPermission({ mode: "readwrite" });
          if (perm !== "granted") {
            perm = await dirHandle.requestPermission({ mode: "readwrite" });
          }
          if (perm !== "granted") {
            dirHandle = null;
          }
        }
        if (!dirHandle) {
          showToast('Select your "exports" folder to save directly.');
          dirHandle = await window.showDirectoryPicker({
            id: "app-directory-exports",
            mode: "readwrite"
          });
          if (dirHandle) {
            await saveExportsDirHandle(dirHandle);
          }
        }
        if (dirHandle) {
          const fileHandle = await getUniqueFileHandleInDir(dirHandle, data.baseName, ".json");
          const writable = await fileHandle.createWritable();
          await writable.write(data.json);
          await writable.close();
          showToast(`Saved directly to ${dirHandle.name}/${fileHandle.name}!`);
          return;
        }
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
    exportSaveAs();
  }
  function exportQuickDownload() {
    const data = getExportJson();
    if (!data) return;
    const blob = new Blob([data.json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported backup to Downloads!");
  }
  async function exportSaveAs() {
    const data = getExportJson();
    if (!data) return;
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: data.filename,
          types: [
            {
              description: "JSON Backup File",
              accept: { "application/json": [".json"] }
            }
          ]
        });
        const writable = await handle.createWritable();
        await writable.write(data.json);
        await writable.close();
        showToast("Saved backup successfully!");
        return;
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    }
    exportQuickDownload();
  }
  async function exportToClipboard() {
    const data = getExportJson();
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.json);
      showToast("Directory JSON copied to clipboard!");
    } catch {
      showToast("Failed to copy to clipboard.");
    }
  }
  function exportData() {
    exportToFolderDirect(false);
  }

  // src/modules/io/browser-importer.ts
  function decodeHtmlEntities(str) {
    if (!str || typeof str !== "string") return "";
    return str.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&#([0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 10))).replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  }
  function normalizeUrlForDuplicateCheck(rawUrl) {
    if (!rawUrl || typeof rawUrl !== "string") return "";
    const clean = ensureProtocol(rawUrl.trim());
    try {
      const parsed = new URL(clean);
      let path = parsed.pathname;
      if (path.length > 1 && path.endsWith("/")) {
        path = path.slice(0, -1);
      }
      return `${parsed.protocol}//${parsed.host.toLowerCase()}${path}${parsed.search}${parsed.hash}`;
    } catch {
      return clean.toLowerCase().replace(/\/+$/, "");
    }
  }
  function parseNetscapeBookmarks(htmlContent, existingFolders = []) {
    const importedEntries = [];
    const newFolders = [];
    const folderStack = [];
    let pendingFolderName = null;
    const systemFolders = /* @__PURE__ */ new Set([
      "bookmarks bar",
      "bookmarksbar",
      "bookmarks toolbar",
      "bookmarkstoolbar",
      "bookmarks menu",
      "bookmarksmenu",
      "favorites bar",
      "favoritesbar",
      "other bookmarks",
      "otherbookmarks",
      "other favorites",
      "otherfavorites",
      "mobile bookmarks",
      "mobilebookmarks",
      "imported",
      "bookmarks"
    ]);
    const tagRegex = /<(\/?(?:H3|A|DL|DD))([^>]*)>([^<]*)/gi;
    let match;
    let lastEntry = null;
    while ((match = tagRegex.exec(htmlContent)) !== null) {
      const rawTag = match[1].toUpperCase();
      const attrs = match[2];
      const text = decodeHtmlEntities(match[3].trim());
      if (rawTag === "H3") {
        pendingFolderName = text || "Untitled Folder";
        if (pendingFolderName && !systemFolders.has(pendingFolderName.toLowerCase())) {
          const existsInApp = existingFolders.some((f) => f.name.toLowerCase() === pendingFolderName.toLowerCase());
          const existsInNew = newFolders.some((f) => f.name.toLowerCase() === pendingFolderName.toLowerCase());
          if (!existsInApp && !existsInNew) {
            newFolders.push({
              id: generateId(),
              name: pendingFolderName,
              icon: "\u{1F4C1}",
              color: "#0a84ff",
              dateAdded: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
        }
        lastEntry = null;
      } else if (rawTag === "DL") {
        if (pendingFolderName) {
          folderStack.push(pendingFolderName);
          pendingFolderName = null;
        } else {
          folderStack.push(null);
        }
        lastEntry = null;
      } else if (rawTag === "/DL") {
        if (folderStack.length > 0) {
          folderStack.pop();
        }
        lastEntry = null;
      } else if (rawTag === "A") {
        const hrefMatch = attrs.match(/HREF=["']([^"']+)["']/i);
        if (!hrefMatch) continue;
        const rawUrl = decodeHtmlEntities(hrefMatch[1].trim());
        if (!rawUrl || rawUrl.toLowerCase().startsWith("javascript:") || rawUrl.toLowerCase().startsWith("place:")) continue;
        const title = text || rawUrl;
        const iconMatch = attrs.match(/ICON(?:_URI)?=["']([^"']+)["']/i);
        let iconUrl = null;
        if (iconMatch) {
          iconUrl = iconMatch[1].trim();
        }
        const dateMatch = attrs.match(/ADD_DATE=["']([0-9]+)["']/i);
        let dateAdded = (/* @__PURE__ */ new Date()).toISOString();
        if (dateMatch) {
          const sec = parseInt(dateMatch[1], 10);
          if (!isNaN(sec) && sec > 0) {
            dateAdded = new Date(sec * 1e3).toISOString();
          }
        }
        const activeFolderNames = folderStack.filter((f) => !!f && !systemFolders.has(f.toLowerCase()));
        const categories = [...activeFolderNames];
        const tagsMatch = attrs.match(/TAGS=["']([^"']+)["']/i);
        if (tagsMatch) {
          const ffTags = decodeHtmlEntities(tagsMatch[1]).split(",").map((t) => t.trim()).filter(Boolean);
          ffTags.forEach((tag) => {
            if (!categories.some((c) => c.toLowerCase() === tag.toLowerCase())) {
              categories.push(tag);
            }
          });
        }
        const immediateFolderName = [...activeFolderNames].reverse()[0] || null;
        let matchedFolderId = null;
        if (immediateFolderName) {
          const inApp = existingFolders.find((f) => f.name.toLowerCase() === immediateFolderName.toLowerCase());
          if (inApp) {
            matchedFolderId = inApp.id;
          } else {
            const inNew = newFolders.find((f) => f.name.toLowerCase() === immediateFolderName.toLowerCase());
            if (inNew) matchedFolderId = inNew.id;
          }
        }
        const resolvedIcon = iconUrl || getFaviconUrl(rawUrl);
        const entry = {
          id: generateId(),
          name: title,
          url: ensureProtocol(rawUrl),
          description: "",
          icon: resolvedIcon,
          iconUrl: resolvedIcon,
          folderId: matchedFolderId,
          categories,
          dateAdded,
          visitCount: 0,
          lastVisited: null,
          isFavorite: false
        };
        importedEntries.push(entry);
        lastEntry = entry;
      } else if (rawTag === "DD" && lastEntry) {
        lastEntry.description = text;
      }
    }
    return { importedEntries, newFolders };
  }

  // src/modules/io/import.ts
  function importData(file, onImportSuccess) {
    const reader = new FileReader();
    reader.onerror = (err) => {
      console.error("[Import] FileReader error:", err);
      showToast("Error: Failed to read file from disk.");
    };
    reader.onload = (e) => {
      const content = e.target?.result;
      if (!content) return;
      const trimmed = content.trim();
      const isExplicitJson = file.name && file.name.toLowerCase().endsWith(".json");
      const looksLikeJson = trimmed.startsWith("{") || trimmed.startsWith("[");
      const isExplicitHtml = file.name && (file.name.toLowerCase().endsWith(".html") || file.name.toLowerCase().endsWith(".htm"));
      const looksLikeHtml = /<!doctype\s+netscape|<title>bookmarks|<h1[^>]*>bookmarks|<dl/i.test(content);
      const isHtml = isExplicitHtml || !isExplicitJson && !looksLikeJson && looksLikeHtml;
      if (isHtml) {
        try {
          const { importedEntries, newFolders } = parseNetscapeBookmarks(content, state.folders);
          if (importedEntries.length === 0 && newFolders.length === 0) {
            showToast("No valid bookmarks found in browser export.");
            return;
          }
          let addedFoldersCount = 0;
          if (newFolders.length > 0) {
            newFolders.forEach((nf) => {
              if (!state.folders.some((existing) => existing.name.toLowerCase() === nf.name.toLowerCase())) {
                state.folders.push(nf);
                addedFoldersCount++;
              }
            });
            if (addedFoldersCount > 0) {
              saveFolders(state.folders, false);
            }
          }
          const diskList = getLatestStoredEntries();
          const existingNormalizedUrls = new Set(diskList.map((item) => normalizeUrlForDuplicateCheck(item.url)));
          let importedCount = 0;
          importedEntries.forEach((item) => {
            const norm = normalizeUrlForDuplicateCheck(item.url);
            if (!existingNormalizedUrls.has(norm)) {
              diskList.push(item);
              existingNormalizedUrls.add(norm);
              importedCount++;
            }
          });
          saveEntries(diskList);
          if (onImportSuccess) onImportSuccess();
          const skippedCount = importedEntries.length - importedCount;
          const folderPart = addedFoldersCount > 0 ? ` and ${addedFoldersCount} folder${addedFoldersCount !== 1 ? "s" : ""}` : "";
          showToast(
            `Imported ${importedCount} site${importedCount !== 1 ? "s" : ""}${folderPart} from browser bookmarks (${skippedCount} duplicate${skippedCount !== 1 ? "s" : ""} skipped).`
          );
        } catch (err) {
          console.error("[Import] HTML Parse Error:", err);
          showToast(`Error: ${err?.message || "Failed to parse browser bookmarks file."}`);
        }
        return;
      }
      try {
        const parsed = JSON.parse(content);
        let importedEntries = [];
        let importedFolders = [];
        if (Array.isArray(parsed)) {
          importedEntries = parsed;
        } else if (parsed && typeof parsed === "object") {
          importedEntries = Array.isArray(parsed.entries) ? parsed.entries : [];
          importedFolders = Array.isArray(parsed.folders) ? parsed.folders : [];
        } else {
          throw new Error("Invalid format: File does not contain bookmark entries or folders.");
        }
        const valid = importedEntries.filter((item) => item && item.name && item.url);
        if (valid.length === 0 && importedFolders.length === 0) {
          showToast("No valid entries or folders found in file.");
          return;
        }
        if (importedFolders.length > 0) {
          importedFolders.forEach((f) => {
            if (f && f.id && f.name) {
              if (!state.folders.some((existing) => existing.id === f.id)) {
                state.folders.push(f);
              }
            }
          });
          saveFolders(state.folders, false);
        }
        const diskList = getLatestStoredEntries();
        const existingNormalizedUrls = new Set(diskList.map((item) => normalizeUrlForDuplicateCheck(item.url)));
        let imported = 0;
        valid.forEach((item) => {
          const norm = normalizeUrlForDuplicateCheck(item.url);
          if (!existingNormalizedUrls.has(norm)) {
            let cats = item.categories || [];
            if (!Array.isArray(cats) || cats.length === 0) {
              if (item.category && typeof item.category === "string") {
                cats = [item.category.trim()];
              } else {
                cats = [];
              }
            }
            const resolvedIcon = item.iconUrl || item.icon || getFaviconUrl(item.url);
            diskList.push({
              id: item.id || generateId(),
              name: item.name,
              url: ensureProtocol(item.url),
              description: item.description || "",
              iconUrl: resolvedIcon,
              folderId: item.folderId || null,
              categories: cats,
              dateAdded: item.dateAdded || (/* @__PURE__ */ new Date()).toISOString(),
              dateModified: item.dateModified || item.dateAdded || (/* @__PURE__ */ new Date()).toISOString(),
              visitCount: item.visitCount || 0,
              lastVisited: item.lastVisited || null,
              isFavorite: item.isFavorite || false,
              health: item.health
            });
            existingNormalizedUrls.add(norm);
            imported++;
          }
        });
        saveEntries(diskList);
        if (onImportSuccess) onImportSuccess();
        showToast(
          `Imported ${imported} new site${imported !== 1 ? "s" : ""} (${valid.length - imported} duplicate${valid.length - imported !== 1 ? "s" : ""} skipped).`
        );
      } catch (err) {
        console.error("[Import] Error parsing or saving backup file:", err);
        if (err && (err.name === "QuotaExceededError" || typeof err.message === "string" && err.message.toLowerCase().includes("quota"))) {
          showToast("Error: Browser storage limit reached. Backup is too large.");
        } else {
          showToast(`Error: ${err?.message || "Invalid JSON or bookmarks file."}`);
        }
      }
    };
    reader.readAsText(file);
  }

  // src/main.ts
  var addBtn = document.getElementById("addBtn");
  var modalClose = document.getElementById("modalClose");
  var cancelBtn = document.getElementById("cancelBtn");
  var modalBackdrop = document.getElementById("modalBackdrop");
  var entryForm = document.getElementById("entryForm");
  var entryName = document.getElementById("entryName");
  var entryUrl = document.getElementById("entryUrl");
  var entryFolder = document.getElementById("entryFolder");
  var entryIcon = document.getElementById("entryIcon");
  var entryDescription = document.getElementById("entryDescription");
  var entryFavorite = document.getElementById("entryFavorite");
  var entryCategory = document.getElementById("entryCategory");
  var addCategoryBtn = document.getElementById("addCategoryBtn");
  var tagInputWrapper = document.getElementById("tagInputWrapper");
  var categorySuggestionsPopup = document.getElementById("categorySuggestionsPopup");
  var autoDetectBtn = document.getElementById("autoDetectBtn");
  var uploadIconBtn = document.getElementById("uploadIconBtn");
  var iconFileInput = document.getElementById("iconFileInput");
  var entryIconPreview = document.getElementById("entryIconPreview");
  var catFilterBtn = document.getElementById("catFilterBtn");
  var catFilterDropdown = document.getElementById("catFilterDropdown");
  var catFilterMenu = document.getElementById("catFilterMenu");
  var catFilterSearchInput = document.getElementById("catFilterSearchInput");
  var catFilterSearchClearBtn = document.getElementById("catFilterSearchClearBtn");
  var catFilterList = document.getElementById("catFilterList");
  var selectAllCatsBtn = document.getElementById("selectAllCatsBtn");
  var clearAllCatsBtn = document.getElementById("clearAllCatsBtn");
  var modeUnionBtn = document.getElementById("modeUnionBtn");
  var modeIntersectBtn = document.getElementById("modeIntersectBtn");
  var manageCategoriesBtn = document.getElementById("manageCategoriesBtn");
  var activeCatFilterBannerClear = document.getElementById("activeCatFilterBannerClear");
  var catModalClose = document.getElementById("catModalClose");
  var catModalBackdrop = document.getElementById("catModalBackdrop");
  var catModalSearchInput = document.getElementById("catModalSearchInput");
  var catModalSearchClearBtn = document.getElementById("catModalSearchClearBtn");
  var searchInput = document.getElementById("searchInput");
  var searchClearBtn = document.getElementById("searchClearBtn");
  var sortSelect = document.getElementById("sortSelect");
  var pinFavoritesBtn = document.getElementById("pinFavoritesBtn");
  var viewCardsBtn = document.getElementById("viewCardsBtn");
  var viewTableBtn = document.getElementById("viewTableBtn");
  var viewIconsBtn = document.getElementById("viewIconsBtn");
  var insightsToggleBtn = document.getElementById("insightsToggleBtn");
  var insightsCloseBtn = document.getElementById("insightsCloseBtn");
  var themeToggle = document.getElementById("themeToggle");
  var themeCustomizerBtn = document.getElementById("themeCustomizerBtn");
  var themeModalClose = document.getElementById("themeModalClose");
  var saveThemeModalBtn = document.getElementById("saveThemeModalBtn");
  var themeModalBackdrop = document.getElementById("themeModalBackdrop");
  var refreshAllBtn = document.getElementById("refreshAllBtn");
  var acceptAllIconsBtn = document.getElementById("acceptAllIconsBtn");
  var dismissAllIconsBtn = document.getElementById("dismissAllIconsBtn");
  var floatingAcceptAllBtn = document.getElementById("floatingAcceptAllBtn");
  var floatingDismissAllBtn = document.getElementById("floatingDismissAllBtn");
  var exportSplitGroup = document.getElementById("exportSplitGroup");
  var exportBtn = document.getElementById("exportBtn");
  var exportMenuBtn = document.getElementById("exportMenuBtn") || document.getElementById("exportToggleBtn");
  var exportFolderBtn = document.getElementById("exportFolderBtn");
  var exportChangeFolderBtn = document.getElementById("exportChangeFolderBtn");
  var exportQuickBtn = document.getElementById("exportQuickBtn");
  var exportClipboardBtn = document.getElementById("exportClipboardBtn");
  var importBtn = document.getElementById("importBtn");
  var importFile = document.getElementById("importFile") || document.getElementById("importInput");
  var sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  var sidebarQuickViews = document.getElementById("sidebarQuickViews");
  var newFolderBtn = document.getElementById("newFolderBtn");
  var inlineNewFolderBtn = document.getElementById("inlineNewFolderBtn");
  var editFolderBtn = document.getElementById("editFolderBtn");
  var deleteFolderBtn = document.getElementById("deleteFolderBtn");
  var folderForm = document.getElementById("folderForm");
  var folderModalClose = document.getElementById("folderModalClose");
  var cancelFolderBtn = document.getElementById("cancelFolderBtn");
  var folderModalBackdrop = document.getElementById("folderModalBackdrop");
  var folderIconTriggerBtn = document.getElementById("folderIconTriggerBtn");
  var folderIconInput = document.getElementById("folderIconInput");
  var folderIconDisplay = document.getElementById("folderIconDisplay");
  var emojiSearchInput = document.getElementById("emojiSearchInput");
  var emojiSearchClear = document.getElementById("emojiSearchClear");
  var osKeyboardHint = document.getElementById("osKeyboardHint");
  var emojiPickerPopover = document.getElementById("emojiPickerPopover");
  var addBookmarksToFolderBtn = document.getElementById("addBookmarksToFolderBtn");
  var addBookmarksModalClose = document.getElementById("addBookmarksModalClose");
  var cancelAddBmBtn = document.getElementById("cancelAddBmBtn");
  var addBookmarksModalBackdrop = document.getElementById("addBookmarksModalBackdrop");
  var addBmSearchInput = document.getElementById("addBmSearchInput");
  var addBmSearchClear = document.getElementById("addBmSearchClear");
  var addBmFilterPills = document.getElementById("addBmFilterPills");
  var addBmSelectAllBtn = document.getElementById("addBmSelectAllBtn");
  var addBmDeselectAllBtn = document.getElementById("addBmDeselectAllBtn");
  var confirmAddBmBtn = document.getElementById("confirmAddBmBtn");
  var healthCheckBtn = document.getElementById("healthCheckBtn");
  var healthModalClose = document.getElementById("healthModalClose");
  var healthModalBackdrop = document.getElementById("healthModalBackdrop");
  var healthStopBtn = document.getElementById("healthStopBtn");
  var healthScanAllBtn = document.getElementById("healthScanAllBtn");
  var healthScanBrokenBtn = document.getElementById("healthScanBrokenBtn");
  var healthSearchInput = document.getElementById("healthSearchInput");
  var healthSearchClear = document.getElementById("healthSearchClear");
  var healthFilterPills = document.getElementById("healthFilterPills");
  var headerLogo = document.querySelector(".logo");
  var cmdPaletteTrigger = document.getElementById("cmdPaletteTrigger");
  function handleToggleInsights(openState) {
    toggleInsightsDrawer(
      openState,
      (id) => visitEntry(id, render),
      (id) => deleteEntry(id, render),
      render
    );
  }
  function handleOpenHealthModal() {
    openHealthModal(
      (id) => openModal(id),
      (id) => deleteEntry(id, render),
      render
    );
  }
  var paletteCallbacks = {
    openAddModal: () => openModal(),
    toggleTheme: () => toggleTheme(render),
    openThemeModal: () => openThemeModal(),
    refreshAllIcons: () => refreshAllIcons(render),
    openHealthModal: () => handleOpenHealthModal(),
    exportData: () => exportToFolderDirect(false),
    triggerImport: () => {
      if (importFile) importFile.click();
    },
    openCatModal: () => openCatModal(render),
    setViewMode: (mode) => setViewMode(mode),
    toggleInsightsDrawer: () => handleToggleInsights(),
    setActiveFolder: (folderId) => setActiveFolder(folderId, render),
    visitEntry: (id) => visitEntry(id, render),
    updateCardsOnly: () => renderCardsOnly()
  };
  function handleSubmit(e) {
    e.preventDefault();
    if (!entryForm || !entryName || !entryUrl) return;
    let valid = true;
    entryForm.querySelectorAll(".error").forEach((el) => el.classList.remove("error"));
    if (!entryName.value.trim()) {
      entryName.classList.add("error");
      valid = false;
    }
    if (!entryUrl.value.trim()) {
      entryUrl.classList.add("error");
      valid = false;
    }
    if (!valid) return;
    const pendingCat = entryCategory ? entryCategory.value.trim() : "";
    if (pendingCat && !state.selectedCategories.includes(pendingCat)) {
      state.selectedCategories.push(pendingCat);
    }
    const data = {
      name: entryName.value.trim(),
      url: entryUrl.value.trim(),
      folderId: entryFolder ? entryFolder.value || null : null,
      categories: [...state.selectedCategories],
      iconUrl: entryIcon ? entryIcon.value.trim() : "",
      description: entryDescription ? entryDescription.value.trim() : "",
      isFavorite: entryFavorite ? entryFavorite.checked : false
    };
    if (state.editingId) {
      updateEntry(state.editingId, data, render);
    } else {
      addEntry(data, render);
    }
    closeModal();
    render();
  }
  if (addBtn) addBtn.addEventListener("click", () => openModal());
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }
  if (entryForm) entryForm.addEventListener("submit", handleSubmit);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
      closeCatModal();
      closeThemeModal();
      closeFolderModal();
      closeCommandPalette();
      if (catFilterDropdown) catFilterDropdown.classList.remove("open");
      if (exportSplitGroup) exportSplitGroup.classList.remove("open");
    }
  });
  if (entryCategory) {
    entryCategory.addEventListener("input", () => renderCategorySuggestions());
    entryCategory.addEventListener("focus", () => renderCategorySuggestions());
    entryCategory.addEventListener("keydown", (e) => {
      const isVisible = categorySuggestionsPopup && categorySuggestionsPopup.style.display !== "none";
      const items = categorySuggestionsPopup ? categorySuggestionsPopup.querySelectorAll(".suggestion-item") : [];
      if (e.key === "ArrowDown") {
        if (!isVisible) {
          renderCategorySuggestions();
        } else {
          e.preventDefault();
          setSuggestionHighlight(suggestionHighlightedIndex + 1);
        }
      } else if (e.key === "ArrowUp") {
        if (isVisible) {
          e.preventDefault();
          setSuggestionHighlight(suggestionHighlightedIndex - 1);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (isVisible && suggestionHighlightedIndex >= 0 && items[suggestionHighlightedIndex]) {
          const nameEl = items[suggestionHighlightedIndex].querySelector(".suggestion-name");
          if (nameEl && nameEl.textContent) addTag(nameEl.textContent);
        } else if (entryCategory.value.trim()) {
          addTag(entryCategory.value);
        }
      } else if (e.key === "Escape") {
        if (isVisible) {
          e.stopPropagation();
          hideCategorySuggestions();
        }
      }
    });
  }
  if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
      if (entryCategory && entryCategory.value.trim()) {
        addTag(entryCategory.value);
      }
    });
  }
  var catFilterHighlightedIndex = -1;
  function getCatFilterNavigableItems() {
    if (!catFilterList) return [];
    return Array.from(catFilterList.querySelectorAll(".dropdown-item"));
  }
  function setCatFilterHighlight(newIndex) {
    const items = getCatFilterNavigableItems();
    items.forEach((el) => el.classList.remove("is-focused"));
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
      target.classList.add("is-focused");
      target.scrollIntoView({ block: "nearest" });
    }
  }
  if (catFilterBtn && catFilterDropdown) {
    catFilterBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = catFilterDropdown.classList.toggle("open");
      if (isOpen && catFilterSearchInput) {
        catFilterHighlightedIndex = -1;
        setTimeout(() => catFilterSearchInput.focus(), 60);
      }
    });
    if (catFilterMenu) {
      catFilterMenu.addEventListener("click", (e) => e.stopPropagation());
    }
    if (catFilterSearchInput) {
      catFilterSearchInput.addEventListener("input", () => {
        catFilterHighlightedIndex = -1;
        populateCategories(renderCardsOnly);
      });
      catFilterSearchInput.addEventListener("keydown", (e) => {
        const items = getCatFilterNavigableItems();
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCatFilterHighlight(catFilterHighlightedIndex + 1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setCatFilterHighlight(catFilterHighlightedIndex - 1);
        } else if (e.key === "Enter") {
          e.preventDefault();
          const target = catFilterHighlightedIndex >= 0 && items[catFilterHighlightedIndex] ? items[catFilterHighlightedIndex] : items.length === 1 ? items[0] : null;
          if (target) {
            const cb = target.querySelector('input[type="checkbox"]');
            if (cb) {
              cb.checked = !cb.checked;
              cb.dispatchEvent(new Event("change"));
            }
          }
        } else if (e.key === "Escape") {
          catFilterSearchInput.value = "";
          populateCategories(renderCardsOnly);
          catFilterDropdown.classList.remove("open");
        }
      });
    }
    if (catFilterSearchClearBtn) {
      catFilterSearchClearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (catFilterSearchInput) {
          catFilterSearchInput.value = "";
          catFilterSearchInput.focus();
        }
        populateCategories(renderCardsOnly);
      });
    }
    if (selectAllCatsBtn) {
      selectAllCatsBtn.addEventListener("click", () => {
        const allCats = getAllCategories();
        const query = catFilterSearchInput ? catFilterSearchInput.value.toLowerCase().trim() : "";
        const targetCats = query ? allCats.filter((cat) => cat.toLowerCase().includes(query)) : allCats;
        targetCats.forEach((cat) => state.selectedFilterCategories.add(cat));
        if (catFilterList) {
          catFilterList.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = true);
        }
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }
    if (clearAllCatsBtn) {
      clearAllCatsBtn.addEventListener("click", () => {
        const query = catFilterSearchInput ? catFilterSearchInput.value.toLowerCase().trim() : "";
        if (query) {
          const allCats = getAllCategories();
          const targetCats = allCats.filter((cat) => cat.toLowerCase().includes(query));
          targetCats.forEach((cat) => state.selectedFilterCategories.delete(cat));
        } else {
          state.selectedFilterCategories.clear();
        }
        if (catFilterList) {
          catFilterList.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = false);
        }
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }
    if (modeUnionBtn) {
      modeUnionBtn.addEventListener("click", () => {
        state.catFilterMode = "union";
        localStorage.setItem(FILTER_MODE_KEY, "union");
        updateModeToggleUI();
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }
    if (modeIntersectBtn) {
      modeIntersectBtn.addEventListener("click", () => {
        state.catFilterMode = "intersect";
        localStorage.setItem(FILTER_MODE_KEY, "intersect");
        updateModeToggleUI();
        updateCatFilterLabel();
        renderCardsOnly();
      });
    }
    if (manageCategoriesBtn) {
      manageCategoriesBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        catFilterDropdown.classList.remove("open");
        openCatModal(render);
      });
    }
  }
  if (catModalClose) catModalClose.addEventListener("click", closeCatModal);
  if (catModalBackdrop) {
    catModalBackdrop.addEventListener("click", (e) => {
      if (e.target === catModalBackdrop) closeCatModal();
    });
  }
  if (catModalSearchInput) {
    catModalSearchInput.addEventListener("input", () => {
      renderCatList(catModalSearchInput.value, render);
    });
    catModalSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        catModalSearchInput.value = "";
        renderCatList("", render);
      }
    });
  }
  if (catModalSearchClearBtn) {
    catModalSearchClearBtn.addEventListener("click", () => {
      if (catModalSearchInput) {
        catModalSearchInput.value = "";
        catModalSearchInput.focus();
      }
      renderCatList("", render);
    });
  }
  if (activeCatFilterBannerClear) {
    activeCatFilterBannerClear.addEventListener("click", () => {
      state.selectedFilterCategories.clear();
      if (catFilterList) {
        catFilterList.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = false);
      }
      updateCatFilterLabel();
      renderCardsOnly();
      if (state.isInsightsOpen) renderInsightsDashboard(render);
      showToast("Cleared category filter");
    });
  }
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (catFilterDropdown && !catFilterDropdown.contains(target)) {
      catFilterDropdown.classList.remove("open");
    }
    if (tagInputWrapper && !tagInputWrapper.contains(target)) {
      hideCategorySuggestions();
    }
    if (exportSplitGroup && !exportSplitGroup.contains(target)) {
      exportSplitGroup.classList.remove("open");
    }
  });
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (searchClearBtn) {
        searchClearBtn.style.display = searchInput.value.trim() ? "inline-flex" : "none";
      }
      renderCardsOnly();
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchInput.value) {
        searchInput.value = "";
        if (searchClearBtn) searchClearBtn.style.display = "none";
        renderCardsOnly();
      }
    });
  }
  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
      }
      searchClearBtn.style.display = "none";
      renderCardsOnly();
    });
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", () => renderCardsOnly());
  }
  if (pinFavoritesBtn) {
    updatePinFavoritesButtonState();
    pinFavoritesBtn.addEventListener("click", () => {
      state.pinFavorites = !state.pinFavorites;
      localStorage.setItem(PIN_FAVORITES_KEY, String(state.pinFavorites));
      updatePinFavoritesButtonState();
      renderCardsOnly();
      showToast(state.pinFavorites ? "Favorites pinned to top \u2B50" : "Natural sort order restored");
    });
  }
  if (viewCardsBtn) viewCardsBtn.addEventListener("click", () => setViewMode("cards"));
  if (viewTableBtn) viewTableBtn.addEventListener("click", () => setViewMode("table"));
  if (viewIconsBtn) viewIconsBtn.addEventListener("click", () => setViewMode("icons"));
  if (insightsToggleBtn) {
    insightsToggleBtn.addEventListener("click", () => handleToggleInsights());
  }
  if (insightsCloseBtn) {
    insightsCloseBtn.addEventListener("click", () => handleToggleInsights(false));
  }
  if (themeToggle) themeToggle.addEventListener("click", () => toggleTheme(render));
  if (themeCustomizerBtn) themeCustomizerBtn.addEventListener("click", openThemeModal);
  if (themeModalClose) themeModalClose.addEventListener("click", closeThemeModal);
  if (saveThemeModalBtn) saveThemeModalBtn.addEventListener("click", closeThemeModal);
  if (themeModalBackdrop) {
    themeModalBackdrop.addEventListener("click", (e) => {
      if (e.target === themeModalBackdrop) closeThemeModal();
    });
  }
  var resetAllThemeBtn = document.getElementById("resetAllThemeBtn");
  if (resetAllThemeBtn) resetAllThemeBtn.addEventListener("click", () => resetAllThemeToDefault(render));
  var resetCatColorsBtn = document.getElementById("resetCatColorsBtn");
  if (resetCatColorsBtn) resetCatColorsBtn.addEventListener("click", () => resetCategoryColors(render));
  var autoPaletteCatsBtn = document.getElementById("autoPaletteCatsBtn");
  if (autoPaletteCatsBtn) autoPaletteCatsBtn.addEventListener("click", () => autoColorizeCategories(render));
  var copyThemeJsonBtn = document.getElementById("copyThemeJsonBtn");
  if (copyThemeJsonBtn) copyThemeJsonBtn.addEventListener("click", exportThemeJson);
  var applyThemeJsonBtn = document.getElementById("applyThemeJsonBtn");
  if (applyThemeJsonBtn) applyThemeJsonBtn.addEventListener("click", () => importThemeJson(render));
  document.querySelectorAll(".theme-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".theme-tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".theme-tab-pane").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      if (tabId) {
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add("active");
      }
    });
  });
  document.querySelectorAll('.color-picker-item input[type="color"]').forEach((input) => {
    input.addEventListener("input", (e) => {
      const prop = input.getAttribute("data-var");
      const hex = e.target.value;
      if (prop) {
        state.customThemeColors[prop] = hex;
        document.documentElement.style.setProperty(prop, hex);
        const hexInput = input.parentElement?.querySelector(".color-hex-input");
        if (hexInput) hexInput.value = hex;
        localStorage.setItem("appDirectory_customTheme", JSON.stringify(state.customThemeColors));
        notifyOtherTabs("SYNC_THEME");
        renderCardsOnly();
      }
    });
  });
  document.querySelectorAll(".color-hex-input").forEach((input) => {
    const handler = (e) => {
      let val = (e.target?.value || "").trim();
      if (!val.startsWith("#") && (val.length === 3 || val.length === 6)) val = "#" + val;
      const colorPicker = input.parentElement?.querySelector('input[type="color"]');
      const prop = colorPicker ? colorPicker.getAttribute("data-var") : null;
      if (prop && (val.length === 4 || val.length === 7)) {
        state.customThemeColors[prop] = val;
        if (colorPicker) colorPicker.value = val;
        document.documentElement.style.setProperty(prop, val);
        localStorage.setItem("appDirectory_customTheme", JSON.stringify(state.customThemeColors));
        notifyOtherTabs("SYNC_THEME");
        renderCardsOnly();
      }
    };
    input.addEventListener("change", handler);
    input.addEventListener("input", handler);
  });
  if (refreshAllBtn) refreshAllBtn.addEventListener("click", () => refreshAllIcons(render));
  if (acceptAllIconsBtn) acceptAllIconsBtn.addEventListener("click", () => acceptAllPendingIcons(render));
  if (dismissAllIconsBtn) dismissAllIconsBtn.addEventListener("click", () => dismissAllPendingIcons(render));
  if (floatingAcceptAllBtn) floatingAcceptAllBtn.addEventListener("click", () => acceptAllPendingIcons(render));
  if (floatingDismissAllBtn) floatingDismissAllBtn.addEventListener("click", () => dismissAllPendingIcons(render));
  if (exportBtn) {
    exportBtn.addEventListener("click", () => exportData());
  }
  if (exportMenuBtn && exportSplitGroup) {
    exportMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      exportSplitGroup.classList.toggle("open");
    });
  }
  if (exportFolderBtn) {
    exportFolderBtn.addEventListener("click", () => {
      if (exportSplitGroup) exportSplitGroup.classList.remove("open");
      exportToFolderDirect(false);
    });
  }
  if (exportChangeFolderBtn) {
    exportChangeFolderBtn.addEventListener("click", () => {
      if (exportSplitGroup) exportSplitGroup.classList.remove("open");
      exportToFolderDirect(true);
    });
  }
  if (exportQuickBtn) {
    exportQuickBtn.addEventListener("click", () => {
      if (exportSplitGroup) exportSplitGroup.classList.remove("open");
      exportQuickDownload();
    });
  }
  if (exportClipboardBtn) {
    exportClipboardBtn.addEventListener("click", () => {
      if (exportSplitGroup) exportSplitGroup.classList.remove("open");
      exportToClipboard();
    });
  }
  if (importBtn && importFile) {
    importBtn.addEventListener("click", () => importFile.click());
    importFile.addEventListener("change", (e) => {
      const target = e.target;
      if (target.files && target.files[0]) {
        importData(target.files[0], render);
        target.value = "";
      }
    });
  }
  var urlAutofillDebounceTimer = null;
  if (entryUrl) {
    entryUrl.addEventListener("input", () => {
      if (entryIcon && !entryIcon.value.trim()) {
        updateModalIconPreview();
      }
      if (urlAutofillDebounceTimer) clearTimeout(urlAutofillDebounceTimer);
      urlAutofillDebounceTimer = setTimeout(() => {
        const val = entryUrl.value.trim();
        if (val.length > 5 && (val.includes(".") || val.startsWith("localhost"))) {
          autoFillUrlMetadata(false);
        }
      }, 650);
    });
    entryUrl.addEventListener("paste", () => {
      if (urlAutofillDebounceTimer) clearTimeout(urlAutofillDebounceTimer);
      setTimeout(() => autoFillUrlMetadata(false), 50);
    });
    entryUrl.addEventListener("blur", () => {
      const url = entryUrl.value.trim();
      if (url && entryIcon && !entryIcon.value.trim()) {
        updateModalIconPreview();
      }
      if (url && (entryName && !entryName.value.trim() || entryDescription && !entryDescription.value.trim())) {
        autoFillUrlMetadata(false);
      }
    });
  }
  if (autoDetectBtn) {
    autoDetectBtn.addEventListener("click", (e) => {
      e.preventDefault();
      autoFillUrlMetadata(true);
    });
  }
  if (entryIcon) {
    entryIcon.addEventListener("input", updateModalIconPreview);
  }
  if (uploadIconBtn && iconFileInput) {
    uploadIconBtn.addEventListener("click", () => iconFileInput.click());
    if (entryIconPreview) {
      entryIconPreview.style.cursor = "pointer";
      entryIconPreview.addEventListener("click", () => iconFileInput.click());
    }
    iconFileInput.addEventListener("change", (e) => {
      const target = e.target;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (entryIcon && evt.target?.result) {
            entryIcon.value = evt.target.result;
            updateModalIconPreview();
            showToast("Custom icon loaded!");
          }
        };
        reader.readAsDataURL(file);
        target.value = "";
      }
    });
  }
  document.addEventListener("paste", (e) => {
    if (!modalBackdrop || !modalBackdrop.classList.contains("active")) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (entryIcon && evt.target?.result) {
              entryIcon.value = evt.target.result;
              updateModalIconPreview();
              showToast("Pasted image set as icon!");
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    }
  });
  if (entryIconPreview) {
    entryIconPreview.addEventListener("dragover", (e) => {
      e.preventDefault();
      entryIconPreview.style.borderColor = "var(--accent)";
    });
    entryIconPreview.addEventListener("dragleave", () => {
      entryIconPreview.style.borderColor = "";
    });
    entryIconPreview.addEventListener("drop", (e) => {
      e.preventDefault();
      entryIconPreview.style.borderColor = "";
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            if (entryIcon && evt.target?.result) {
              entryIcon.value = evt.target.result;
              updateModalIconPreview();
              showToast("Dropped image set as icon!");
            }
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", toggleSidebar);
  }
  if (sidebarQuickViews) {
    sidebarQuickViews.querySelectorAll(".sidebar-nav-item").forEach((item) => {
      item.addEventListener("click", () => {
        const fid = item.getAttribute("data-folder-id");
        if (fid) setActiveFolder(fid, render);
      });
    });
  }
  if (newFolderBtn) {
    newFolderBtn.addEventListener("click", () => openFolderModal());
  }
  if (inlineNewFolderBtn) {
    inlineNewFolderBtn.addEventListener("click", () => {
      openFolderModal(null, (newFolderId) => {
        populateFolderSelect(newFolderId);
      });
    });
  }
  if (editFolderBtn) {
    editFolderBtn.addEventListener("click", () => {
      if (state.activeFolderId && state.activeFolderId.startsWith("f-")) {
        openFolderModal(state.activeFolderId);
      }
    });
  }
  if (deleteFolderBtn) {
    deleteFolderBtn.addEventListener("click", () => {
      if (state.activeFolderId && state.activeFolderId.startsWith("f-")) {
        deleteFolder(state.activeFolderId, render);
      }
    });
  }
  if (folderForm) {
    folderForm.addEventListener("submit", (e) => saveFolderForm(e, render));
  }
  if (folderModalClose) folderModalClose.addEventListener("click", closeFolderModal);
  if (cancelFolderBtn) cancelFolderBtn.addEventListener("click", closeFolderModal);
  if (folderModalBackdrop) {
    folderModalBackdrop.addEventListener("click", (e) => {
      if (e.target === folderModalBackdrop) closeFolderModal();
    });
  }
  if (folderIconTriggerBtn) {
    folderIconTriggerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleEmojiPicker();
    });
  }
  if (folderIconInput) {
    folderIconInput.addEventListener("input", () => {
      const val = folderIconInput.value.trim();
      if (folderIconDisplay) {
        folderIconDisplay.textContent = val || "\u{1F4C1}";
      }
    });
  }
  if (emojiSearchInput) {
    emojiSearchInput.addEventListener("input", () => {
      const q = emojiSearchInput.value;
      if (emojiSearchClear) {
        emojiSearchClear.style.display = q ? "inline-flex" : "none";
      }
      renderEmojiGrid(activeEmojiCategoryId, q);
    });
    emojiSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeEmojiPicker();
      }
    });
  }
  if (emojiSearchClear) {
    emojiSearchClear.addEventListener("click", () => {
      if (emojiSearchInput) emojiSearchInput.value = "";
      emojiSearchClear.style.display = "none";
      renderEmojiGrid(activeEmojiCategoryId, "");
      if (emojiSearchInput) emojiSearchInput.focus();
    });
  }
  if (osKeyboardHint) {
    osKeyboardHint.addEventListener("click", () => {
      closeEmojiPicker();
      if (folderIconInput) {
        folderIconInput.focus();
        folderIconInput.select();
      }
    });
  }
  if (emojiPickerPopover) {
    emojiPickerPopover.addEventListener("click", (e) => e.stopPropagation());
  }
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (emojiPickerPopover && emojiPickerPopover.style.display !== "none") {
      if (!emojiPickerPopover.contains(target) && !folderIconTriggerBtn?.contains(target) && !target?.closest(".emoji-more-btn")) {
        closeEmojiPicker();
      }
    }
  });
  if (addBookmarksToFolderBtn) {
    addBookmarksToFolderBtn.addEventListener("click", () => openAddBookmarksModal(render));
  }
  if (addBookmarksModalClose) addBookmarksModalClose.addEventListener("click", closeAddBookmarksModal);
  if (cancelAddBmBtn) cancelAddBmBtn.addEventListener("click", closeAddBookmarksModal);
  if (addBookmarksModalBackdrop) {
    addBookmarksModalBackdrop.addEventListener("click", (e) => {
      if (e.target === addBookmarksModalBackdrop) closeAddBookmarksModal();
    });
  }
  if (addBmSearchInput) {
    addBmSearchInput.addEventListener("input", () => {
      const q = addBmSearchInput.value.trim();
      setAddBmSearchQuery(q);
      if (addBmSearchClear) addBmSearchClear.style.display = q ? "block" : "none";
      renderAddBookmarksList();
    });
  }
  if (addBmSearchClear) {
    addBmSearchClear.addEventListener("click", () => {
      if (addBmSearchInput) addBmSearchInput.value = "";
      setAddBmSearchQuery("");
      addBmSearchClear.style.display = "none";
      renderAddBookmarksList();
      if (addBmSearchInput) addBmSearchInput.focus();
    });
  }
  if (addBmFilterPills) {
    addBmFilterPills.querySelectorAll(".pill-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        addBmFilterPills.querySelectorAll(".pill-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const source = btn.getAttribute("data-source") || "all";
        setAddBmSourceFilter(source);
        renderAddBookmarksList();
      });
    });
  }
  if (addBmSelectAllBtn) {
    addBmSelectAllBtn.addEventListener("click", () => {
      selectAllBookmarksToMove();
    });
  }
  if (addBmDeselectAllBtn) {
    addBmDeselectAllBtn.addEventListener("click", () => {
      deselectAllBookmarksToMove();
    });
  }
  if (confirmAddBmBtn) {
    confirmAddBmBtn.addEventListener("click", () => confirmMoveBookmarksToFolder(render));
  }
  if (healthCheckBtn) healthCheckBtn.addEventListener("click", () => handleOpenHealthModal());
  if (healthModalClose) healthModalClose.addEventListener("click", closeHealthModal);
  if (healthModalBackdrop) {
    healthModalBackdrop.addEventListener("click", (e) => {
      if (e.target === healthModalBackdrop) closeHealthModal();
    });
  }
  if (healthStopBtn) healthStopBtn.addEventListener("click", stopHealthScan);
  if (healthScanAllBtn) healthScanAllBtn.addEventListener("click", () => startHealthScan(false, render));
  if (healthScanBrokenBtn) healthScanBrokenBtn.addEventListener("click", () => startHealthScan(true, render));
  if (healthSearchInput) {
    healthSearchInput.addEventListener("input", () => {
      const q = healthSearchInput.value.trim();
      setHealthSearchQuery(q);
      if (healthSearchClear) healthSearchClear.style.display = q ? "block" : "none";
      renderHealthModalList();
    });
  }
  if (healthSearchClear) {
    healthSearchClear.addEventListener("click", () => {
      if (healthSearchInput) healthSearchInput.value = "";
      setHealthSearchQuery("");
      healthSearchClear.style.display = "none";
      renderHealthModalList();
      if (healthSearchInput) healthSearchInput.focus();
    });
  }
  if (healthFilterPills) {
    healthFilterPills.querySelectorAll(".pill-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        healthFilterPills.querySelectorAll(".pill-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const health = btn.getAttribute("data-health") || "all";
        setHealthFilter(health);
        renderHealthModalList();
      });
    });
  }
  function resetToAllBookmarks() {
    if (searchInput) searchInput.value = "";
    if (searchClearBtn) searchClearBtn.style.display = "none";
    state.selectedFilterCategories.clear();
    const catCheckboxes = document.querySelectorAll(".cat-filter-checkbox");
    catCheckboxes.forEach((cb) => {
      cb.checked = false;
    });
    const catSearch = document.getElementById("catFilterSearchInput");
    if (catSearch) catSearch.value = "";
    updateCatFilterLabel();
    setActiveFolder("all", render);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (headerLogo) {
    headerLogo.addEventListener("click", (e) => {
      e.preventDefault();
      resetToAllBookmarks();
    });
  }
  if (cmdPaletteTrigger) {
    cmdPaletteTrigger.addEventListener("click", () => openCommandPalette(paletteCallbacks));
  }
  async function init() {
    initTheme();
    initSidebar();
    updateModeToggleUI();
    setViewMode(state.currentViewMode);
    handleToggleInsights(state.isInsightsOpen);
    await initStorage();
    initTopNavReveal();
    initCommandPalette(paletteCallbacks);
    render();
    cacheExistingIconsOffline(render);
    let isSyncingTheme = false;
    const syncThemeFromExternal = () => {
      if (isSyncingTheme) return;
      isSyncingTheme = true;
      try {
        initTheme();
        updateModeToggleUI();
        syncColorPickersFromDOM();
        renderPresetPalettes();
        renderCardsOnly();
      } finally {
        setTimeout(() => {
          isSyncingTheme = false;
        }, 100);
      }
    };
    onBroadcastMessage(async (data) => {
      if (data.type === "SYNC_DATA") {
        await reloadFromStorage();
        render();
      } else if (data.type === "SYNC_THEME") {
        syncThemeFromExternal();
      }
    });
    window.addEventListener("storage", (e) => {
      if (e.key === "appDirectory_theme" || e.key === "appDirectory_activePreset" || e.key === "appDirectory_customTheme" || e.key === "appDirectory_categoryColors") {
        syncThemeFromExternal();
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      init();
    });
  } else {
    init();
  }
})();
//# sourceMappingURL=app.js.map
