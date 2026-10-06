// Content script that acts as a bridge between the local App Directory page and the extension background worker.

function isExtensionContextValid(): boolean {
  try {
    return typeof chrome !== 'undefined' &&
      typeof chrome.runtime !== 'undefined' &&
      !!chrome.runtime.id;
  } catch {
    return false;
  }
}

function onFocus(): void {
  checkAndIngestPending();
}

function onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    checkAndIngestPending();
  }
}

function cleanupListeners(): void {
  try {
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  } catch (_) {}
}

function getBridgeOrigin(): string {
  if (typeof window === 'undefined') return 'unknown';
  return window.location.protocol === 'file:' ? 'file://' : window.location.origin;
}

function checkAndIngestPending(): void {
  if (!isExtensionContextValid()) {
    cleanupListeners();
    return;
  }

  try {
    chrome.runtime.sendMessage({
      type: 'GET_PENDING_BOOKMARKS',
      origin: getBridgeOrigin()
    }, (response) => {
      try {
        if (!isExtensionContextValid()) return;
        if (chrome.runtime.lastError) return;
        if (response && Array.isArray(response.pendingEntries) && response.pendingEntries.length > 0) {
          window.postMessage({
            type: 'APP_DIRECTORY_INGEST_PENDING',
            entries: response.pendingEntries
          }, '*');
        }
      } catch (_) {
        // Context invalidated when extension is reloaded/updated
      }
    });
  } catch (_) {
    cleanupListeners();
  }
}

function pushSettingsToWebapp(): void {
  if (!isExtensionContextValid()) return;
  try {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
      if (!isExtensionContextValid() || chrome.runtime.lastError) return;
      if (response) {
        window.postMessage({
          type: 'APP_DIRECTORY_EXTENSION_SETTINGS',
          settings: response
        }, '*');
      }
    });
  } catch (_) {}
}

// Listen for messages from the App Directory web page
window.addEventListener('message', (event: MessageEvent) => {
  if (!isExtensionContextValid()) return;
  if (!event.data || typeof event.data !== 'object') return;

  const { type, folders, categories, entryIds, settings } = event.data;

  if (type === 'APP_DIRECTORY_SYNC_RESPONSE' || type === 'APP_DIRECTORY_READY') {
    // Cache latest folders and categories in extension storage
    try {
      chrome.runtime.sendMessage({
        type: 'CACHE_APP_DIRECTORY_STATE',
        folders: folders || [],
        categories: categories || []
      });
    } catch (_) {}

    // Check if there are any pending bookmarks queued while App Directory was closed or asleep
    checkAndIngestPending();
  } else if (type === 'APP_DIRECTORY_INGEST_SUCCESS') {
    // App Directory ingested pending bookmarks; record ingestion for this origin
    try {
      chrome.runtime.sendMessage({
        type: 'MARK_PENDING_INGESTED',
        origin: getBridgeOrigin(),
        entryIds: Array.isArray(entryIds) ? entryIds : []
      });
    } catch (_) {}
  } else if (type === 'APP_DIRECTORY_SAVE_SETTINGS') {
    try {
      chrome.runtime.sendMessage({
        type: 'SAVE_SETTINGS',
        settings: settings || {}
      });
    } catch (_) {}
  } else if (type === 'APP_DIRECTORY_REQUEST_SETTINGS') {
    pushSettingsToWebapp();
  }
});

// Listen for direct bookmark saves forwarded from the extension background worker
try {
  if (isExtensionContextValid() && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      try {
        if (!isExtensionContextValid()) return;
        if (message && message.type === 'SAVE_BOOKMARK_DIRECT' && message.entry) {
          window.postMessage({
            type: 'APP_DIRECTORY_NEW_BOOKMARK',
            entry: message.entry
          }, '*');
          sendResponse({ success: true });
        }
      } catch (_) {}
    });
  }
} catch (_) {}

// Auto-sync whenever user focuses or switches back to this tab
window.addEventListener('focus', onFocus);
document.addEventListener('visibilitychange', onVisibilityChange);

// 100% event-driven sync on storage change (zero timer wakeups / zero idle battery consumption)
try {
  if (isExtensionContextValid() && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      try {
        if (!isExtensionContextValid()) return;
        if (areaName === 'local') {
          if (changes.ad_pending_bookmarks) {
            const newPending = changes.ad_pending_bookmarks.newValue;
            if (Array.isArray(newPending) && newPending.length > 0) {
              checkAndIngestPending();
            }
          }
          if (
            changes.ad_gemini_api_key ||
            changes.ad_gemini_model ||
            changes.ad_gemini_fallback_models ||
            changes.ad_discovered_models ||
            changes.ad_brave_api_key ||
            changes.ad_auto_classify
          ) {
            pushSettingsToWebapp();
          }
        }
      } catch (_) {}
    });
  }
} catch (_) {}

// Initial ping to request App Directory state and push extension settings if already loaded
setTimeout(() => {
  if (isExtensionContextValid()) {
    window.postMessage({ type: 'APP_DIRECTORY_PING' }, '*');
    pushSettingsToWebapp();
  }
}, 300);
