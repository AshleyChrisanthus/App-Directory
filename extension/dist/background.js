"use strict";
(() => {
  // src/extension/background.ts
  var STORAGE_KEYS = {
    CACHED_FOLDERS: "ad_cached_folders",
    CACHED_CATEGORIES: "ad_cached_categories",
    PENDING_BOOKMARKS: "ad_pending_bookmarks"
  };
  function isAppDirectoryTab(url, title) {
    if (!url) return false;
    const u = url.toLowerCase();
    const t = (title || "").toLowerCase();
    const isFile = u.startsWith("file://") && (u.includes("app%20directory") || u.includes("app-directory") || u.endsWith("index.html") || t.includes("app directory"));
    const isLocalhost = (u.includes("localhost:") || u.includes("127.0.0.1:")) && (t.includes("app directory") || u.includes("index.html"));
    const isHosted = u.includes("smooth-harbor-jsy6.here.now");
    return isFile || isLocalhost || isHosted;
  }
  function getOriginKey(url) {
    if (!url) return "unknown";
    if (url.startsWith("file://")) return "file://";
    try {
      return new URL(url).origin;
    } catch {
      return url;
    }
  }
  chrome.runtime.onInstalled.addListener(async () => {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (!tab.id || !tab.url) continue;
        const u = tab.url.toLowerCase();
        if (u.startsWith("chrome://") || u.startsWith("edge://") || u.startsWith("about:") || u.startsWith("chrome-extension://")) {
          continue;
        }
        const isAppDir = isAppDirectoryTab(tab.url, tab.title);
        const scriptFile = isAppDir ? "dist/bridge.js" : "dist/content.js";
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [scriptFile]
          });
        } catch (_) {
        }
      }
    } catch (_) {
    }
  });
  async function triggerModalOnActiveTab(tab) {
    let targetTab = tab;
    if (!targetTab || !targetTab.id) {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      targetTab = activeTab;
    }
    if (!targetTab || !targetTab.id || !targetTab.url) return;
    if (targetTab.url.startsWith("chrome://") || targetTab.url.startsWith("edge://") || targetTab.url.startsWith("chrome-extension://") || targetTab.url.startsWith("about:")) {
      return;
    }
    try {
      await chrome.tabs.sendMessage(targetTab.id, { type: "TOGGLE_INJECTED_MODAL" });
    } catch {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          files: ["dist/content.js"]
        });
        await chrome.tabs.sendMessage(targetTab.id, { type: "TOGGLE_INJECTED_MODAL" });
      } catch (err) {
        console.warn("[AppDirectory Extension] Failed to inject content script:", err);
      }
    }
  }
  chrome.action.onClicked.addListener((tab) => {
    triggerModalOnActiveTab(tab);
  });
  chrome.commands.onCommand.addListener((command) => {
    if (command === "add-to-app-directory") {
      triggerModalOnActiveTab();
    }
  });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") return;
    switch (message.type) {
      case "GET_APP_DIRECTORY_STATE": {
        chrome.storage.local.get([STORAGE_KEYS.CACHED_FOLDERS, STORAGE_KEYS.CACHED_CATEGORIES], (res) => {
          sendResponse({
            folders: res[STORAGE_KEYS.CACHED_FOLDERS] || [],
            categories: res[STORAGE_KEYS.CACHED_CATEGORIES] || []
          });
        });
        return true;
      }
      case "CACHE_APP_DIRECTORY_STATE": {
        chrome.storage.local.set({
          [STORAGE_KEYS.CACHED_FOLDERS]: message.folders || [],
          [STORAGE_KEYS.CACHED_CATEGORIES]: message.categories || []
        });
        sendResponse({ success: true });
        return false;
      }
      case "GET_PENDING_BOOKMARKS": {
        const origin = typeof message.origin === "string" ? message.origin : "";
        chrome.storage.local.get([STORAGE_KEYS.PENDING_BOOKMARKS], (res) => {
          const stored = res[STORAGE_KEYS.PENDING_BOOKMARKS];
          const rawQueue = Array.isArray(stored) ? stored : [];
          const now = Date.now();
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;
          const pendingEntries = [];
          for (const item of rawQueue) {
            if (!item) continue;
            const isStructured = item.entry && typeof item.timestamp === "number";
            const entryData = isStructured ? item.entry : item;
            const timestamp = isStructured ? item.timestamp : now;
            const ingestedByOrigins = isStructured && Array.isArray(item.ingestedByOrigins) ? item.ingestedByOrigins : [];
            if (now - timestamp > SEVEN_DAYS_MS) continue;
            if (!origin || !ingestedByOrigins.includes(origin)) {
              pendingEntries.push(entryData);
            }
          }
          sendResponse({ pendingEntries });
        });
        return true;
      }
      case "MARK_PENDING_INGESTED": {
        const origin = typeof message.origin === "string" ? message.origin : "";
        const entryIds = Array.isArray(message.entryIds) ? message.entryIds : [];
        chrome.storage.local.get([STORAGE_KEYS.PENDING_BOOKMARKS], (res) => {
          const stored = res[STORAGE_KEYS.PENDING_BOOKMARKS];
          const rawQueue = Array.isArray(stored) ? stored : [];
          const now = Date.now();
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1e3;
          const updatedQueue = [];
          for (const item of rawQueue) {
            if (!item) continue;
            const isStructured = item.entry && typeof item.timestamp === "number";
            const entryData = isStructured ? item.entry : item;
            const timestamp = isStructured ? item.timestamp : now;
            const ingestedByOrigins = isStructured && Array.isArray(item.ingestedByOrigins) ? [...item.ingestedByOrigins] : [];
            if (now - timestamp > SEVEN_DAYS_MS) continue;
            const isMatch = entryIds.length === 0 || entryIds.includes(entryData.id);
            if (isMatch && origin && !ingestedByOrigins.includes(origin)) {
              ingestedByOrigins.push(origin);
            }
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
        return true;
      }
      case "CLEAR_PENDING_BOOKMARKS": {
        chrome.storage.local.set({ [STORAGE_KEYS.PENDING_BOOKMARKS]: [] }, () => {
          sendResponse({ success: true });
        });
        return true;
      }
      case "SAVE_BOOKMARK": {
        (async () => {
          const entry = message.entry;
          if (!entry) {
            sendResponse({ success: false, error: "No entry provided" });
            return;
          }
          const tabs = await chrome.tabs.query({});
          const appDirTabs = tabs.filter((t) => isAppDirectoryTab(t.url, t.title));
          const deliveredOrigins = [];
          if (appDirTabs.length > 0) {
            const results = await Promise.allSettled(
              appDirTabs.map(async (tab) => {
                if (!tab.id) throw new Error("No tab id");
                const resp = await chrome.tabs.sendMessage(tab.id, {
                  type: "SAVE_BOOKMARK_DIRECT",
                  entry
                });
                if (resp && resp.success) {
                  return getOriginKey(tab.url);
                }
                throw new Error("Tab did not acknowledge save");
              })
            );
            for (const r of results) {
              if (r.status === "fulfilled" && r.value) {
                if (!deliveredOrigins.includes(r.value)) {
                  deliveredOrigins.push(r.value);
                }
              }
            }
          }
          const currentData = await chrome.storage.local.get([STORAGE_KEYS.PENDING_BOOKMARKS]);
          const queue = Array.isArray(currentData[STORAGE_KEYS.PENDING_BOOKMARKS]) ? [...currentData[STORAGE_KEYS.PENDING_BOOKMARKS]] : [];
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
        return true;
      }
      default:
        return false;
    }
  });
})();
//# sourceMappingURL=background.js.map
