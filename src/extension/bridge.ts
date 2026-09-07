// Content script that acts as a bridge between the local App Directory page and the extension background worker.

// Listen for messages from the App Directory web page
window.addEventListener('message', (event: MessageEvent) => {
  if (!event.data || typeof event.data !== 'object') return;

  const { type, folders, categories } = event.data;

  if (type === 'APP_DIRECTORY_SYNC_RESPONSE' || type === 'APP_DIRECTORY_READY') {
    // Cache latest folders and categories in extension storage
    chrome.runtime.sendMessage({
      type: 'CACHE_APP_DIRECTORY_STATE',
      folders: folders || [],
      categories: categories || []
    });

    // Check if there are any pending bookmarks queued while App Directory was closed
    chrome.runtime.sendMessage({ type: 'GET_PENDING_BOOKMARKS' }, (response) => {
      if (response && Array.isArray(response.pendingEntries) && response.pendingEntries.length > 0) {
        window.postMessage({
          type: 'APP_DIRECTORY_INGEST_PENDING',
          entries: response.pendingEntries
        }, '*');
      }
    });
  } else if (type === 'APP_DIRECTORY_INGEST_SUCCESS') {
    // App Directory ingested all pending bookmarks; clear the extension queue
    chrome.runtime.sendMessage({ type: 'CLEAR_PENDING_BOOKMARKS' });
  }
});

// Listen for direct bookmark saves forwarded from the extension background worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === 'SAVE_BOOKMARK_DIRECT' && message.entry) {
    window.postMessage({
      type: 'APP_DIRECTORY_NEW_BOOKMARK',
      entry: message.entry
    }, '*');
    sendResponse({ success: true });
  }
});

// Initial ping to request App Directory state if already loaded
setTimeout(() => {
  window.postMessage({ type: 'APP_DIRECTORY_PING' }, '*');
}, 300);
