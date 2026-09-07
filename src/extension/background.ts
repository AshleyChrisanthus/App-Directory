// Manifest V3 Background Service Worker for App Directory Companion Extension

const STORAGE_KEYS = {
  CACHED_FOLDERS: 'ad_cached_folders',
  CACHED_CATEGORIES: 'ad_cached_categories',
  PENDING_BOOKMARKS: 'ad_pending_bookmarks'
};

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
      chrome.storage.local.get([STORAGE_KEYS.PENDING_BOOKMARKS], (res) => {
        sendResponse({
          pendingEntries: res[STORAGE_KEYS.PENDING_BOOKMARKS] || []
        });
      });
      return true;
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

        // Check for any currently open App Directory tabs
        const tabs = await chrome.tabs.query({});
        const appDirTab = tabs.find((t) => {
          if (!t.url) return false;
          const u = t.url.toLowerCase();
          const title = (t.title || '').toLowerCase();
          const isFile = u.startsWith('file://') && (u.includes('app%20directory') || u.includes('app-directory') || u.endsWith('index.html') || title.includes('app directory'));
          const isLocalhost = (u.includes('localhost:') || u.includes('127.0.0.1:')) && (title.includes('app directory') || u.includes('index.html'));
          const isHosted = u.includes('smooth-harbor-jsy6.here.now');
          return isFile || isLocalhost || isHosted;
        });

        if (appDirTab && appDirTab.id) {
          try {
            const resp = await chrome.tabs.sendMessage(appDirTab.id, {
              type: 'SAVE_BOOKMARK_DIRECT',
              entry
            });
            if (resp && resp.success) {
              sendResponse({ success: true, direct: true });
              return;
            }
          } catch {
            // Tab was closed or not responding; fall through to queuing
          }
        }

        // If no open tab or direct message failed, queue in storage
        const currentData = await chrome.storage.local.get([STORAGE_KEYS.PENDING_BOOKMARKS]);
        const queue: any[] = Array.isArray(currentData[STORAGE_KEYS.PENDING_BOOKMARKS])
          ? [...(currentData[STORAGE_KEYS.PENDING_BOOKMARKS] as any[])]
          : [];
        queue.push(entry);
        await chrome.storage.local.set({ [STORAGE_KEYS.PENDING_BOOKMARKS]: queue });

        sendResponse({
          success: true,
          queued: true,
          pendingCount: queue.length
        });
      })();
      return true; // Async response
    }

    default:
      return false;
  }
});
