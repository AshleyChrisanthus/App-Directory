"use strict";
(() => {
  // src/extension/bridge.ts
  window.addEventListener("message", (event) => {
    if (!event.data || typeof event.data !== "object") return;
    const { type, folders, categories } = event.data;
    if (type === "APP_DIRECTORY_SYNC_RESPONSE" || type === "APP_DIRECTORY_READY") {
      chrome.runtime.sendMessage({
        type: "CACHE_APP_DIRECTORY_STATE",
        folders: folders || [],
        categories: categories || []
      });
      chrome.runtime.sendMessage({ type: "GET_PENDING_BOOKMARKS" }, (response) => {
        if (response && Array.isArray(response.pendingEntries) && response.pendingEntries.length > 0) {
          window.postMessage({
            type: "APP_DIRECTORY_INGEST_PENDING",
            entries: response.pendingEntries
          }, "*");
        }
      });
    } else if (type === "APP_DIRECTORY_INGEST_SUCCESS") {
      chrome.runtime.sendMessage({ type: "CLEAR_PENDING_BOOKMARKS" });
    }
  });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message && message.type === "SAVE_BOOKMARK_DIRECT" && message.entry) {
      window.postMessage({
        type: "APP_DIRECTORY_NEW_BOOKMARK",
        entry: message.entry
      }, "*");
      sendResponse({ success: true });
    }
  });
  setTimeout(() => {
    window.postMessage({ type: "APP_DIRECTORY_PING" }, "*");
  }, 300);
})();
//# sourceMappingURL=bridge.js.map
