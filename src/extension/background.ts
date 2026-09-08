// Manifest V3 Background Service Worker for App Directory Companion Extension

const STORAGE_KEYS = {
  CACHED_FOLDERS: 'ad_cached_folders',
  CACHED_CATEGORIES: 'ad_cached_categories',
  PENDING_BOOKMARKS: 'ad_pending_bookmarks'
};

// ── Tab Identification Helpers ────────────────────────────
function isAppDirectoryTab(url?: string, title?: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  const t = (title || '').toLowerCase();
  const isFile =
    u.startsWith('file://') &&
    (u.includes('app%20directory') || u.includes('app-directory') || u.endsWith('index.html') || t.includes('app directory'));
  const isLocalhost =
    (u.includes('localhost:') || u.includes('127.0.0.1:')) &&
    (t.includes('app directory') || u.includes('index.html'));
  const isHosted = u.includes('.here.now');
  return isFile || isLocalhost || isHosted;
}

function getOriginKey(url?: string): string {
  if (!url) return 'unknown';
  if (url.startsWith('file://')) return 'file://';
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

// ── Auto-Upgrade Open Tabs on Install/Reload ──────────────
chrome.runtime.onInstalled.addListener(async () => {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id || !tab.url) continue;
      const u = tab.url.toLowerCase();
      if (
        u.startsWith('chrome://') ||
        u.startsWith('edge://') ||
        u.startsWith('about:') ||
        u.startsWith('chrome-extension://')
      ) {
        continue;
      }

      const isAppDir = isAppDirectoryTab(tab.url, tab.title);
      const scriptFile = isAppDir ? 'dist/bridge.js' : 'dist/content.js';

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: [scriptFile]
        });
      } catch (_) {}
    }
  } catch (_) {}
});

// ── Trigger In-Page Injected Modal ───────────────────────
async function triggerModalOnActiveTab(tab?: chrome.tabs.Tab): Promise<void> {
  let targetTab = tab;
  if (!targetTab || !targetTab.id) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTab = activeTab;
  }
  if (!targetTab || !targetTab.id || !targetTab.url) return;

  // Cannot inject scripts on browser internal pages
  if (
    targetTab.url.startsWith('chrome://') ||
    targetTab.url.startsWith('edge://') ||
    targetTab.url.startsWith('chrome-extension://') ||
    targetTab.url.startsWith('about:')
  ) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(targetTab.id, { type: 'TOGGLE_INJECTED_MODAL' });
  } catch {
    // If content script is not yet injected into this tab, inject dynamically
    try {
      await chrome.scripting.executeScript({
        target: { tabId: targetTab.id },
        files: ['dist/content.js']
      });
      await chrome.tabs.sendMessage(targetTab.id, { type: 'TOGGLE_INJECTED_MODAL' });
    } catch (err) {
      console.warn('[AppDirectory Extension] Failed to inject content script:', err);
    }
  }
}

// Extension icon click
chrome.action.onClicked.addListener((tab) => {
  triggerModalOnActiveTab(tab);
});

// Keyboard shortcut (Alt+D)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'add-to-app-directory') {
    triggerModalOnActiveTab();
  }
});

// ── Message Router ───────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== 'object') return;

  switch (message.type) {
    case 'GET_APP_DIRECTORY_STATE': {
      chrome.storage.local.get([STORAGE_KEYS.CACHED_FOLDERS, STORAGE_KEYS.CACHED_CATEGORIES], (res) => {
        sendResponse({
          folders: res[STORAGE_KEYS.CACHED_FOLDERS] || [],
          categories: res[STORAGE_KEYS.CACHED_CATEGORIES] || []
        });
      });
      return true; // Async response
    }

    case 'CACHE_APP_DIRECTORY_STATE': {
      chrome.storage.local.set({
        [STORAGE_KEYS.CACHED_FOLDERS]: message.folders || [],
        [STORAGE_KEYS.CACHED_CATEGORIES]: message.categories || []
      });
      sendResponse({ success: true });
      return false;
    }

    case 'GET_PENDING_BOOKMARKS': {
      const origin = typeof message.origin === 'string' ? message.origin : '';
      chrome.storage.local.get([STORAGE_KEYS.PENDING_BOOKMARKS], (res) => {
        const stored = res[STORAGE_KEYS.PENDING_BOOKMARKS];
        const rawQueue: any[] = Array.isArray(stored) ? (stored as any[]) : [];
        const now = Date.now();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const pendingEntries: any[] = [];

        for (const item of rawQueue) {
          if (!item) continue;
          const isStructured = item.entry && typeof item.timestamp === 'number';
          const entryData = isStructured ? item.entry : item;
          const timestamp = isStructured ? item.timestamp : now;
          const ingestedByOrigins: string[] =
            isStructured && Array.isArray(item.ingestedByOrigins) ? item.ingestedByOrigins : [];

          if (now - timestamp > SEVEN_DAYS_MS) continue;

          // If no origin specified or this origin has not ingested yet, include it
          if (!origin || !ingestedByOrigins.includes(origin)) {
            pendingEntries.push(entryData);
          }
        }

        sendResponse({ pendingEntries });
      });
      return true; // Async response
    }

    case 'MARK_PENDING_INGESTED': {
      const origin = typeof message.origin === 'string' ? message.origin : '';
      const entryIds: string[] = Array.isArray(message.entryIds) ? message.entryIds : [];

      chrome.storage.local.get([STORAGE_KEYS.PENDING_BOOKMARKS], (res) => {
        const stored = res[STORAGE_KEYS.PENDING_BOOKMARKS];
        const rawQueue: any[] = Array.isArray(stored) ? (stored as any[]) : [];
        const now = Date.now();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const updatedQueue: any[] = [];

        for (const item of rawQueue) {
          if (!item) continue;
          const isStructured = item.entry && typeof item.timestamp === 'number';
          const entryData = isStructured ? item.entry : item;
          const timestamp = isStructured ? item.timestamp : now;
          const ingestedByOrigins: string[] =
            isStructured && Array.isArray(item.ingestedByOrigins) ? [...item.ingestedByOrigins] : [];

          if (now - timestamp > SEVEN_DAYS_MS) continue;

          const isMatch = entryIds.length === 0 || entryIds.includes(entryData.id);
          if (isMatch && origin && !ingestedByOrigins.includes(origin)) {
            ingestedByOrigins.push(origin);
          }

          // Retain if fewer than 2 distinct origins ingested it (e.g. local vs hosted)
          if (ingestedByOrigins.length < 2) {
            updatedQueue.push({
              entry: entryData,
              timestamp,
              ingestedByOrigins
            });
          }
        }

        chrome.storage.local.set({ [STORAGE_KEYS.PENDING_BOOKMARKS]: updatedQueue }, () => {
          sendResponse({ success: true, remaining: updatedQueue.length });
        });
      });
      return true; // Async response
    }

    case 'CLEAR_PENDING_BOOKMARKS': {
      chrome.storage.local.set({ [STORAGE_KEYS.PENDING_BOOKMARKS]: [] }, () => {
        sendResponse({ success: true });
      });
      return true;
    }

    case 'SAVE_BOOKMARK': {
      (async () => {
        const entry = message.entry;
        if (!entry) {
          sendResponse({ success: false, error: 'No entry provided' });
          return;
        }

        // Broadcast to all currently open App Directory tabs (local, localhost, hosted)
        const tabs = await chrome.tabs.query({});
        const appDirTabs = tabs.filter((t) => isAppDirectoryTab(t.url, t.title));

        const deliveredOrigins: string[] = [];
        if (appDirTabs.length > 0) {
          const results = await Promise.allSettled(
            appDirTabs.map(async (tab) => {
              if (!tab.id) throw new Error('No tab id');
              const resp = await chrome.tabs.sendMessage(tab.id, {
                type: 'SAVE_BOOKMARK_DIRECT',
                entry
              });
              if (resp && resp.success) {
                return getOriginKey(tab.url);
              }
              throw new Error('Tab did not acknowledge save');
            })
          );

          for (const r of results) {
            if (r.status === 'fulfilled' && r.value) {
              if (!deliveredOrigins.includes(r.value)) {
                deliveredOrigins.push(r.value);
              }
            }
          }
        }

        // If fewer than 2 distinct targets received the direct save (e.g. only local was open, or none),
        // queue it so the other target (e.g. hosted) will ingest it when opened later.
        const currentData = await chrome.storage.local.get([STORAGE_KEYS.PENDING_BOOKMARKS]);
        const queue: any[] = Array.isArray(currentData[STORAGE_KEYS.PENDING_BOOKMARKS])
          ? [...(currentData[STORAGE_KEYS.PENDING_BOOKMARKS] as any[])]
          : [];

        if (deliveredOrigins.length < 2) {
          queue.push({
            entry,
            timestamp: Date.now(),
            ingestedByOrigins: deliveredOrigins
          });
          if (queue.length > 100) {
            queue.splice(0, queue.length - 100);
          }
          await chrome.storage.local.set({ [STORAGE_KEYS.PENDING_BOOKMARKS]: queue });
        }

        if (deliveredOrigins.length > 0) {
          sendResponse({
            success: true,
            direct: true,
            tabCount: deliveredOrigins.length,
            deliveredOrigins
          });
        } else {
          sendResponse({
            success: true,
            queued: true,
            pendingCount: queue.length
          });
        }
      })();
      return true; // Async response
    }

    default:
      return false;
  }
});
