"use strict";
(() => {
  // src/extension/bridge.ts
  function isExtensionContextValid() {
    try {
      return typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined" && !!chrome.runtime.id;
    } catch {
      return false;
    }
  }
  function onFocus() {
    checkAndIngestPending();
  }
  function onVisibilityChange() {
    if (document.visibilityState === "visible") {
      checkAndIngestPending();
    }
  }
  function cleanupListeners() {
    try {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    } catch (_) {
    }
  }
  function getBridgeOrigin() {
    if (typeof window === "undefined") return "unknown";
    return window.location.protocol === "file:" ? "file://" : window.location.origin;
  }
  function checkAndIngestPending() {
    if (!isExtensionContextValid()) {
      cleanupListeners();
      return;
    }
    try {
      chrome.runtime.sendMessage({
        type: "GET_PENDING_BOOKMARKS",
        origin: getBridgeOrigin()
      }, (response) => {
        try {
          if (!isExtensionContextValid()) return;
          if (chrome.runtime.lastError) return;
          if (response && Array.isArray(response.pendingEntries) && response.pendingEntries.length > 0) {
            window.postMessage({
              type: "APP_DIRECTORY_INGEST_PENDING",
              entries: response.pendingEntries
            }, "*");
          }
        } catch (_) {
        }
      });
    } catch (_) {
      cleanupListeners();
    }
  }
  function pushSettingsToWebapp() {
    if (!isExtensionContextValid()) return;
    try {
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
        if (!isExtensionContextValid() || chrome.runtime.lastError) return;
        if (response) {
          window.postMessage({
            type: "APP_DIRECTORY_EXTENSION_SETTINGS",
            settings: response
          }, "*");
        }
      });
    } catch (_) {
    }
  }
  window.addEventListener("message", (event) => {
    if (!isExtensionContextValid()) return;
    if (!event.data || typeof event.data !== "object") return;
    const { type, folders, categories, entryIds, settings } = event.data;
    if (type === "APP_DIRECTORY_SYNC_RESPONSE" || type === "APP_DIRECTORY_READY") {
      try {
        chrome.runtime.sendMessage({
          type: "CACHE_APP_DIRECTORY_STATE",
          folders: folders || [],
          categories: categories || []
        });
      } catch (_) {
      }
      checkAndIngestPending();
    } else if (type === "APP_DIRECTORY_INGEST_SUCCESS") {
      try {
        chrome.runtime.sendMessage({
          type: "MARK_PENDING_INGESTED",
          origin: getBridgeOrigin(),
          entryIds: Array.isArray(entryIds) ? entryIds : []
        });
      } catch (_) {
      }
    } else if (type === "APP_DIRECTORY_SAVE_SETTINGS") {
      try {
        chrome.runtime.sendMessage({
          type: "SAVE_SETTINGS",
          settings: settings || {}
        });
      } catch (_) {
      }
    } else if (type === "APP_DIRECTORY_REQUEST_SETTINGS") {
      pushSettingsToWebapp();
    }
  });
  try {
    if (isExtensionContextValid() && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        try {
          if (!isExtensionContextValid()) return;
          if (message && message.type === "SAVE_BOOKMARK_DIRECT" && message.entry) {
            window.postMessage({
              type: "APP_DIRECTORY_NEW_BOOKMARK",
              entry: message.entry
            }, "*");
            sendResponse({ success: true });
          }
        } catch (_) {
        }
      });
    }
  } catch (_) {
  }
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibilityChange);
  try {
    if (isExtensionContextValid() && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener((changes, areaName) => {
        try {
          if (!isExtensionContextValid()) return;
          if (areaName === "local") {
            if (changes.ad_pending_bookmarks) {
              const newPending = changes.ad_pending_bookmarks.newValue;
              if (Array.isArray(newPending) && newPending.length > 0) {
                checkAndIngestPending();
              }
            }
            if (changes.ad_gemini_api_key || changes.ad_gemini_model || changes.ad_gemini_fallback_models || changes.ad_discovered_models || changes.ad_brave_api_key || changes.ad_auto_classify) {
              pushSettingsToWebapp();
            }
          }
        } catch (_) {
        }
      });
    }
  } catch (_) {
  }
  setTimeout(() => {
    if (isExtensionContextValid()) {
      window.postMessage({ type: "APP_DIRECTORY_PING" }, "*");
      pushSettingsToWebapp();
    }
  }, 300);
})();
//# sourceMappingURL=bridge.js.map
