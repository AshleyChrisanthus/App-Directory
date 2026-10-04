// Manifest V3 Background Service Worker for App Directory Companion Extension

import { TAXONOMY_SYSTEM_PROMPT, buildTaxonomyUserPrompt } from './taxonomy';
import { ExtractedPageContext, ExtensionSettings } from './types';

const STORAGE_KEYS = {
  CACHED_FOLDERS: 'ad_cached_folders',
  CACHED_CATEGORIES: 'ad_cached_categories',
  PENDING_BOOKMARKS: 'ad_pending_bookmarks',
  SETTINGS_GEMINI_KEY: 'ad_gemini_api_key',
  SETTINGS_GEMINI_MODEL: 'ad_gemini_model',
  SETTINGS_BRAVE_KEY: 'ad_brave_api_key',
  SETTINGS_AUTO_CLASSIFY: 'ad_auto_classify'
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
  const isHosted = u.includes('smooth-harbor-jsy6.here.now');
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

// Keyboard shortcut (Alt+A / Alt+D)
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

    case 'GET_SETTINGS': {
      chrome.storage.local.get([
        STORAGE_KEYS.SETTINGS_GEMINI_KEY,
        STORAGE_KEYS.SETTINGS_GEMINI_MODEL,
        STORAGE_KEYS.SETTINGS_BRAVE_KEY,
        STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY
      ], (res) => {
        sendResponse({
          geminiApiKey: res[STORAGE_KEYS.SETTINGS_GEMINI_KEY] || '',
          geminiModel: res[STORAGE_KEYS.SETTINGS_GEMINI_MODEL] || 'gemini-2.5-flash',
          braveApiKey: res[STORAGE_KEYS.SETTINGS_BRAVE_KEY] || '',
          autoClassify: res[STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY] !== false
        });
      });
      return true;
    }

    case 'SAVE_SETTINGS': {
      const s = message.settings || {};
      chrome.storage.local.set({
        [STORAGE_KEYS.SETTINGS_GEMINI_KEY]: s.geminiApiKey || '',
        [STORAGE_KEYS.SETTINGS_GEMINI_MODEL]: s.geminiModel || 'gemini-2.5-flash',
        [STORAGE_KEYS.SETTINGS_BRAVE_KEY]: s.braveApiKey || '',
        [STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY]: s.autoClassify !== false
      }, () => {
        sendResponse({ success: true });
      });
      return true;
    }

    case 'CLASSIFY_WEBSITE': {
      (async () => {
        try {
          const pageContext: ExtractedPageContext = message.pageContext;
          const availableCategories: string[] = Array.isArray(message.availableCategories)
            ? message.availableCategories
            : [];
          const forceSearch: boolean = !!message.forceSearch;

          const res = await chrome.storage.local.get([
            STORAGE_KEYS.SETTINGS_GEMINI_KEY,
            STORAGE_KEYS.SETTINGS_GEMINI_MODEL,
            STORAGE_KEYS.SETTINGS_BRAVE_KEY
          ]);

          const geminiApiKey = String(res[STORAGE_KEYS.SETTINGS_GEMINI_KEY] || '').trim();
          const geminiModel = String(res[STORAGE_KEYS.SETTINGS_GEMINI_MODEL] || 'gemini-2.5-flash').trim();
          const braveApiKey = String(res[STORAGE_KEYS.SETTINGS_BRAVE_KEY] || '').trim();

          if (!geminiApiKey) {
            sendResponse({ success: false, error: 'NO_API_KEY' });
            return;
          }

          let searchSnippets: string[] = [];
          let method: 'DOM_DIRECT' | 'BRAVE_GROUNDED' = 'DOM_DIRECT';

          // Determine if Brave Search should be queried
          const shouldSearch = (pageContext?.isSparse || forceSearch) && !!braveApiKey;
          if (shouldSearch) {
            try {
              const query = `${pageContext.title} ${pageContext.hostname} what is it product summary`;
              const braveUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=4`;
              const braveResp = await fetch(braveUrl, {
                headers: {
                  'Accept': 'application/json',
                  'X-Subscription-Token': braveApiKey
                }
              });
              if (braveResp.ok) {
                const braveData = await braveResp.json();
                const results = braveData.web?.results || [];
                for (const r of results) {
                  if (r.title && r.description) {
                    searchSnippets.push(`${r.title}: ${r.description}`);
                  }
                }
                if (searchSnippets.length > 0) {
                  method = 'BRAVE_GROUNDED';
                }
              }
            } catch (bErr) {
              console.warn('[AppDirectory] Brave Search failed, falling back to DOM text:', bErr);
            }
          }

          // Build prompt
          const userPrompt = buildTaxonomyUserPrompt(
            pageContext,
            availableCategories,
            searchSnippets
          );

          // Query Gemini API
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
          const payload = {
            system_instruction: {
              parts: [{ text: TAXONOMY_SYSTEM_PROMPT }]
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }]
              }
            ],
            generationConfig: {
              response_mime_type: 'application/json',
              temperature: 0.15
            }
          };

          let response = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          let effectiveModel = geminiModel;

          // Auto-fallback from gemini-3.8-flash to gemini-2.5-flash on 503 Service Unavailable or 500
          if (!response.ok && (response.status === 503 || response.status === 500) && geminiModel !== 'gemini-2.5-flash') {
            console.warn(`[AppDirectory] ${geminiModel} returned HTTP ${response.status}. Automatically retrying with gemini-2.5-flash...`);
            const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
            try {
              const fallbackResp = await fetch(fallbackEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              if (fallbackResp.ok) {
                response = fallbackResp;
                effectiveModel = 'gemini-2.5-flash';
              }
            } catch (fErr) {
              console.warn('[AppDirectory] Fallback to gemini-2.5-flash failed:', fErr);
            }
          }

          if (!response.ok) {
            const errBody = await response.text();
            console.error('[AppDirectory] Gemini API error:', response.status, errBody);
            if (response.status === 429) {
              sendResponse({ success: false, error: 'RATE_LIMIT_EXCEEDED' });
            } else if (response.status === 400 || response.status === 403) {
              sendResponse({ success: false, error: 'INVALID_API_KEY' });
            } else if (response.status === 503) {
              sendResponse({ success: false, error: 'SERVICE_OVERLOADED_503' });
            } else {
              sendResponse({ success: false, error: `API_ERROR_${response.status}` });
            }
            return;
          }

          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) {
            sendResponse({ success: false, error: 'NO_RESPONSE_TEXT' });
            return;
          }

          let parsed: any;
          try {
            parsed = JSON.parse(rawText);
          } catch (pErr) {
            console.error('[AppDirectory] Failed to parse JSON from Gemini:', rawText);
            sendResponse({ success: false, error: 'PARSE_ERROR' });
            return;
          }

          const recommendedTags: string[] = Array.isArray(parsed.recommendedTags)
            ? parsed.recommendedTags.map((t: any) => String(t).trim()).filter(Boolean)
            : [];

          const newTags: string[] = [];
          if (Array.isArray(parsed.newTags)) {
            for (const nt of parsed.newTags) {
              const trimmed = String(nt).trim();
              if (trimmed && !newTags.includes(trimmed)) newTags.push(trimmed);
            }
          }
          if (parsed.suggestedNewTag) {
            const snt = String(parsed.suggestedNewTag).trim();
            if (snt && snt.toLowerCase() !== 'null' && snt.toLowerCase() !== 'none' && !newTags.includes(snt)) {
              newTags.push(snt);
            }
          }

          // Ensure any suggested new tag is ALSO inside recommendedTags so it is never dropped
          for (const nt of newTags) {
            if (!recommendedTags.includes(nt)) {
              recommendedTags.push(nt);
            }
          }

          const reasoning = typeof parsed.reasoning === 'string' ? parsed.reasoning.trim() : '';

          sendResponse({
            success: true,
            method,
            recommendedTags,
            newTags,
            reasoning,
            suggestedNewTag: newTags[0] || null,
            modelUsed: effectiveModel
          });
        } catch (err: any) {
          console.error('[AppDirectory] Classification exception:', err);
          sendResponse({ success: false, error: err?.message || 'UNKNOWN_ERROR' });
        }
      })();
      return true; // Async response
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

        // Synchronize newly added categories to CACHED_CATEGORIES immediately
        if (Array.isArray(entry.categories) && entry.categories.length > 0) {
          chrome.storage.local.get([STORAGE_KEYS.CACHED_CATEGORIES], (catRes) => {
            const rawCats = catRes[STORAGE_KEYS.CACHED_CATEGORIES];
            const existingCats: string[] = Array.isArray(rawCats)
              ? [...(rawCats as string[])]
              : [];
            let updated = false;
            for (const cat of entry.categories) {
              const trimmed = (cat || '').trim();
              if (trimmed && !existingCats.includes(trimmed)) {
                existingCats.push(trimmed);
                updated = true;
              }
            }
            if (updated) {
              existingCats.sort((a, b) => a.localeCompare(b));
              chrome.storage.local.set({ [STORAGE_KEYS.CACHED_CATEGORIES]: existingCats });
            }
          });
        }

        // Broadcast to all currently open App Directory tabs (local, localhost, hosted)
        const tabs = await chrome.tabs.query({});
        const appDirTabs = tabs.filter((t) => isAppDirectoryTab(t.url, t.title));

        const deliveredOrigins: string[] = [];
        if (appDirTabs.length > 0) {
          const results = await Promise.allSettled(
            appDirTabs.map(async (tab) => {
              if (!tab.id) throw new Error('No tab id');
              const resp = await Promise.race([
                chrome.tabs.sendMessage(tab.id, {
                  type: 'SAVE_BOOKMARK_DIRECT',
                  entry
                }),
                new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error('Tab message timeout')), 2000)
                )
              ]);
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
