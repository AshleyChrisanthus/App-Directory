"use strict";
(() => {
  // src/extension/taxonomy.ts
  var TAXONOMY_SYSTEM_PROMPT = `# AI Website Taxonomy Classifier

You are an expert taxonomy classification engine for "App Directory", a directory of web applications, AI tools, developer tools, and digital platforms.

## Core Purpose
Classify websites and products into a consistent taxonomy. A site can and should have multiple tags when each tag adds distinct, meaningful value.

## Fundamental Principles
1. PREFER EXISTING DIRECTORY TAGS: Always prioritize the user's existing taxonomy categories provided in the prompt.
2. SUBSTANTIAL CAPABILITY ONLY: A feature must be a core, first-class capability to warrant a tag. Do not tag broad business or creative platforms with every minor embedded AI feature.
3. SPECIFICITY OVER GENERALITY: Prefer the most specific category (e.g. \`Coding Agents\`) over broad generic labels (e.g. generic \`Developer Tools\` or redundant \`AI Coding\`).
4. NEW-TAG DISCIPLINE: Only propose a new tag if:
   - No existing directory tag accurately captures the product's primary category.
   - It represents a distinct, reusable category (not a one-off feature or trademark).
   - It is not a synonym or minor rephrasing of an existing tag.
   - If a new tag is proposed, limit to at most 1 high-confidence new tag.

## Critical Category Distinctions
- **Agents vs Multi-Agent Systems**:
  - \`Agents\`: Autonomous systems that take actions or use tools rather than just conversational chat.
  - \`Multi-Agent Systems\`: Systems where multiple agents actively collaborate or orchestrate as a core product feature (e.g., CrewAI, AutoGen). Do NOT tag just because an app has multiple different assistant bots.
- **AI Models Aggregator vs Coding Agents Aggregator**:
  - \`AI Models Aggregator\`: Discovery, routing, access, or benchmarking across multiple LLM models/providers (e.g., OpenRouter, Artificial Analysis, Poe).
  - \`Coding Agents Aggregator\`: Platforms that specifically aggregate/provide multiple coding-agent experiences (e.g., T3 Code, Kilo, Cline).
- **AI Agent Development vs Agents**:
  - \`AI Agent Development\`: Frameworks/SDKs/platforms for building and deploying agents (e.g., LangChain, LiveKit).
- **Voice AI vs AI Voice**:
  - \`Voice AI\`: Conversational, real-time voice agents and voice-to-voice interaction (e.g., Retell AI, Vapi).
  - \`AI Voice\`: Voice generation, voice cloning, or voiceover speech synthesis (e.g., ElevenLabs).
- **Local AI**:
  - Requires meaningful, first-class on-device or local model inference (e.g., Ollama, LM Studio, Jan, LocalAI), not merely an open-source codebase.
- **AI Computer Use**:
  - Agents that operate a computer GUI, browser, or desktop applications (click, type, navigate).
- **AI Code Review**:
  - AI specifically analyzing PRs/code for security, bugs, or standards (e.g., Greptile, CodeRabbit). Distinct from autonomous coding agents.
- **AI App Builder vs AI Website Builder**:
  - \`AI App Builder\`: Prompt-to-full-stack-application builders (e.g., Bolt.new, Lovable, v0).
  - \`AI Website Builder\`: Website generation platforms (e.g., Framer AI, Relume).
- **CI/CD**:
  - First-class continuous integration and delivery pipelines (e.g., GitHub Actions, Blacksmith, CircleCI). Do not tag merely because a platform has a deploy button.
- **Containerization**:
  - Container runtimes, images, and tooling (e.g., Docker). Not primarily CI/CD.
- **AI Model Evaluation**:
  - Benchmarks, leaderboards, model comparison, human eval (e.g., LMSYS Chatbot Arena, Artificial Analysis, BenchmarkList).
- **AI Tracking vs AI Timeline vs AI News**:
  - \`AI Tracking\`: Ongoing industry/model release monitoring.
  - \`AI Timeline\`: Chronological history/reference.
  - \`AI News\`: News publication / articles.
- **AI Tools Directory**:
  - Directories specifically for finding AI tools and software (e.g., There's An AI For That).
- **AI Workflow Automation**:
  - Node/pipeline based automation (e.g., n8n, Make, Flowise, Dify).

## Output Format
You MUST output strictly a valid JSON object matching this schema with no markdown code blocks outside:
{
  "recommendedTags": ["Tag 1", "Tag 2"],
  "newTags": ["Any tag from recommendedTags that is not in the Available Categories list"],
  "reasoning": "Brief 1-2 sentence explanation of why these tags apply."
}
`;
  function buildTaxonomyUserPrompt(context, availableCategories, searchSnippets) {
    const existingList = availableCategories.length > 0 ? availableCategories.join(", ") : "None yet";
    let prompt = `Classify this website based on the taxonomy guidelines.

`;
    prompt += `### Target Website Information:
`;
    prompt += `- URL: ${context.url}
`;
    prompt += `- Title: ${context.title}
`;
    if (context.description) {
      prompt += `- Meta Description: ${context.description}
`;
    }
    if (context.headings.length > 0) {
      prompt += `- Main Headings: ${context.headings.slice(0, 6).join(" | ")}
`;
    }
    if (context.schemaTypes.length > 0) {
      prompt += `- Schema.org Types: ${context.schemaTypes.join(", ")}
`;
    }
    if (context.heroText) {
      prompt += `- Hero Tagline/Text: ${context.heroText}
`;
    }
    if (context.bodySummary) {
      prompt += `- Page Content Snippet: ${context.bodySummary.slice(0, 1800)}
`;
    }
    if (searchSnippets && searchSnippets.length > 0) {
      prompt += `
### External Web Search Context (Brave Search Grounding):
`;
      searchSnippets.forEach((s, idx) => {
        prompt += `[Result ${idx + 1}] ${s}
`;
      });
    }
    prompt += `
### Available Categories in User's App Directory:
`;
    prompt += `[ ${existingList} ]

`;
    prompt += `### Instructions:
1. Select 1 to 5 of the most fitting tags. Prioritize the Available Categories list above whenever they fit.
2. If none of the available categories fit well, or if a crucial distinct category is missing, you MUST suggest 1-2 new appropriate tags (e.g., "Internet History", "Digital Archive", "AI History", etc.).
3. Put ALL recommended tags (both existing and newly created) inside "recommendedTags" so they are applied to the bookmark.
4. If any tags in "recommendedTags" are NOT in the Available Categories list, list them in "newTags".
5. In "reasoning", provide a concise 1-2 sentence rationale explaining your choices.
6. Respond ONLY with the requested JSON object.`;
    return prompt;
  }

  // src/extension/background.ts
  var STORAGE_KEYS = {
    CACHED_FOLDERS: "ad_cached_folders",
    CACHED_CATEGORIES: "ad_cached_categories",
    PENDING_BOOKMARKS: "ad_pending_bookmarks",
    SETTINGS_GEMINI_KEY: "ad_gemini_api_key",
    SETTINGS_GEMINI_MODEL: "ad_gemini_model",
    SETTINGS_GEMINI_FALLBACK_MODELS: "ad_gemini_fallback_models",
    SETTINGS_DISCOVERED_MODELS: "ad_discovered_models",
    SETTINGS_BRAVE_KEY: "ad_brave_api_key",
    SETTINGS_AUTO_CLASSIFY: "ad_auto_classify"
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
      case "GET_SETTINGS": {
        chrome.storage.local.get([
          STORAGE_KEYS.SETTINGS_GEMINI_KEY,
          STORAGE_KEYS.SETTINGS_GEMINI_MODEL,
          STORAGE_KEYS.SETTINGS_GEMINI_FALLBACK_MODELS,
          STORAGE_KEYS.SETTINGS_DISCOVERED_MODELS,
          STORAGE_KEYS.SETTINGS_BRAVE_KEY,
          STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY
        ], (res) => {
          sendResponse({
            geminiApiKey: res[STORAGE_KEYS.SETTINGS_GEMINI_KEY] || "",
            geminiModel: res[STORAGE_KEYS.SETTINGS_GEMINI_MODEL] || "gemini-2.5-flash",
            geminiFallbackModels: res[STORAGE_KEYS.SETTINGS_GEMINI_FALLBACK_MODELS] || ["gemini-2.5-flash-lite"],
            discoveredModels: res[STORAGE_KEYS.SETTINGS_DISCOVERED_MODELS] || [],
            braveApiKey: res[STORAGE_KEYS.SETTINGS_BRAVE_KEY] || "",
            autoClassify: res[STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY] !== false
          });
        });
        return true;
      }
      case "SAVE_SETTINGS": {
        const s = message.settings || {};
        const toSet = {
          [STORAGE_KEYS.SETTINGS_GEMINI_KEY]: s.geminiApiKey || "",
          [STORAGE_KEYS.SETTINGS_GEMINI_MODEL]: s.geminiModel || "gemini-2.5-flash",
          [STORAGE_KEYS.SETTINGS_BRAVE_KEY]: s.braveApiKey || "",
          [STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY]: s.autoClassify !== false
        };
        if (Array.isArray(s.geminiFallbackModels)) {
          toSet[STORAGE_KEYS.SETTINGS_GEMINI_FALLBACK_MODELS] = s.geminiFallbackModels;
        }
        if (Array.isArray(s.discoveredModels)) {
          toSet[STORAGE_KEYS.SETTINGS_DISCOVERED_MODELS] = s.discoveredModels;
        }
        chrome.storage.local.set(toSet, () => {
          sendResponse({ success: true });
        });
        return true;
      }
      case "CLASSIFY_WEBSITE": {
        const pageContext = message.pageContext;
        const availableCategories = Array.isArray(message.availableCategories) ? message.availableCategories : [];
        const forceSearch = !!message.forceSearch;
        executeClassificationWorkflow(pageContext, availableCategories, forceSearch).then((result) => sendResponse(result)).catch((err) => {
          sendResponse({ success: false, error: err?.message || "UNKNOWN_ERROR", recommendedTags: [] });
        });
        return true;
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
          if (Array.isArray(entry.categories) && entry.categories.length > 0) {
            chrome.storage.local.get([STORAGE_KEYS.CACHED_CATEGORIES], (catRes) => {
              const rawCats = catRes[STORAGE_KEYS.CACHED_CATEGORIES];
              const existingCats = Array.isArray(rawCats) ? [...rawCats] : [];
              let updated = false;
              for (const cat of entry.categories) {
                const trimmed = (cat || "").trim();
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
          const tabs = await chrome.tabs.query({});
          const appDirTabs = tabs.filter((t) => isAppDirectoryTab(t.url, t.title));
          const deliveredOrigins = [];
          if (appDirTabs.length > 0) {
            const results = await Promise.allSettled(
              appDirTabs.map(async (tab) => {
                if (!tab.id) throw new Error("No tab id");
                const resp = await Promise.race([
                  chrome.tabs.sendMessage(tab.id, {
                    type: "SAVE_BOOKMARK_DIRECT",
                    entry
                  }),
                  new Promise(
                    (_, reject) => setTimeout(() => reject(new Error("Tab message timeout")), 2e3)
                  )
                ]);
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
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "ad-classify") {
      port.onMessage.addListener(async (msg) => {
        if (!msg || msg.type !== "START_CLASSIFY") return;
        try {
          const result = await executeClassificationWorkflow(
            msg.pageContext,
            msg.availableCategories || [],
            !!msg.forceSearch,
            (progress) => {
              try {
                port.postMessage({ type: "PROGRESS", progress });
              } catch (_) {
              }
            }
          );
          try {
            port.postMessage({ type: "RESULT", result });
          } catch (_) {
          }
        } catch (err) {
          try {
            port.postMessage({
              type: "RESULT",
              result: {
                success: false,
                error: err?.message || "UNKNOWN_ERROR",
                recommendedTags: []
              }
            });
          } catch (_) {
          }
        }
      });
    }
  });
  async function executeClassificationWorkflow(pageContext, availableCategories, forceSearch, onProgress) {
    const res = await chrome.storage.local.get([
      STORAGE_KEYS.SETTINGS_GEMINI_KEY,
      STORAGE_KEYS.SETTINGS_GEMINI_MODEL,
      STORAGE_KEYS.SETTINGS_GEMINI_FALLBACK_MODELS,
      STORAGE_KEYS.SETTINGS_BRAVE_KEY
    ]);
    const geminiApiKey = String(res[STORAGE_KEYS.SETTINGS_GEMINI_KEY] || "").trim();
    const primaryModel = String(res[STORAGE_KEYS.SETTINGS_GEMINI_MODEL] || "gemini-2.5-flash").trim();
    const rawFallbacks = res[STORAGE_KEYS.SETTINGS_GEMINI_FALLBACK_MODELS];
    const fallbackModels = Array.isArray(rawFallbacks) ? rawFallbacks : ["gemini-2.5-flash-lite"];
    const braveApiKey = String(res[STORAGE_KEYS.SETTINGS_BRAVE_KEY] || "").trim();
    if (!geminiApiKey) {
      return {
        success: false,
        error: "NO_API_KEY",
        recommendedTags: []
      };
    }
    let searchSnippets = [];
    let method = "DOM_DIRECT";
    const shouldSearch = (pageContext?.isSparse || forceSearch) && !!braveApiKey;
    if (shouldSearch) {
      onProgress?.({
        stage: "BRAVE_SEARCH",
        message: "Grounding with Brave Search results..."
      });
      try {
        const query = `${pageContext.title} ${pageContext.hostname} what is it product summary`;
        const braveUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=4`;
        const braveResp = await fetch(braveUrl, {
          headers: {
            "Accept": "application/json",
            "X-Subscription-Token": braveApiKey
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
            method = "BRAVE_GROUNDED";
          }
        }
      } catch (bErr) {
        console.warn("[AppDirectory] Brave Search failed, falling back to DOM text:", bErr);
      }
    }
    const userPrompt = buildTaxonomyUserPrompt(
      pageContext,
      availableCategories,
      searchSnippets
    );
    const modelsToTry = [];
    if (primaryModel) modelsToTry.push(primaryModel);
    for (const fm of fallbackModels) {
      const trimmed = (fm || "").trim();
      if (trimmed && !modelsToTry.includes(trimmed)) {
        modelsToTry.push(trimmed);
      }
    }
    if (modelsToTry.length === 0) {
      modelsToTry.push("gemini-2.5-flash");
    }
    const auditChain = [];
    let lastError = "UNKNOWN_ERROR";
    for (let idx = 0; idx < modelsToTry.length; idx++) {
      const currentModel = modelsToTry[idx];
      const isPrimary = idx === 0;
      const cleanModelName = currentModel.replace(/^models\//, "");
      onProgress?.({
        stage: "ATTEMPTING",
        model: currentModel,
        attemptIndex: idx + 1,
        totalModels: modelsToTry.length,
        message: isPrimary ? `Querying ${cleanModelName}...` : `Cascading to fallback (${cleanModelName})...`
      });
      const startTime = Date.now();
      let response = null;
      let fetchError = null;
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModelName)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`;
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: TAXONOMY_SYSTEM_PROMPT }]
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }]
              }
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.15
            }
          })
        });
      } catch (err) {
        fetchError = err;
      }
      const latencyMs = Date.now() - startTime;
      if (fetchError || !response || !response.ok) {
        const status = response ? response.status : 0;
        let errorReason = "NETWORK_ERROR";
        if (status === 429) {
          errorReason = "RATE_LIMIT_EXCEEDED";
        } else if (status === 503) {
          errorReason = "SERVICE_OVERLOADED_503";
        } else if (status === 400 || status === 403) {
          errorReason = "INVALID_API_KEY";
        } else if (status > 0) {
          errorReason = `HTTP_${status}`;
        }
        auditChain.push({
          model: currentModel,
          status: "FAILED",
          error: errorReason,
          latencyMs
        });
        lastError = errorReason;
        if (errorReason === "INVALID_API_KEY") {
          onProgress?.({
            stage: "ERROR",
            model: currentModel,
            errorReason,
            message: "Invalid Gemini API Key."
          });
          return {
            success: false,
            error: "INVALID_API_KEY",
            recommendedTags: [],
            auditChain
          };
        }
        const hasNext = idx + 1 < modelsToTry.length;
        if (hasNext) {
          const nextModel = modelsToTry[idx + 1];
          const cleanNextName = nextModel.replace(/^models\//, "");
          const friendlyReason = status === 429 ? "Rate limited (429)" : status === 503 ? "Overloaded (503)" : `Unavailable (${errorReason})`;
          onProgress?.({
            stage: "FALLBACK_SWITCH",
            model: currentModel,
            targetModel: nextModel,
            errorReason,
            attemptIndex: idx + 1,
            totalModels: modelsToTry.length,
            message: `\u26A0\uFE0F ${cleanModelName} ${friendlyReason} \u2192 Trying ${cleanNextName}...`
          });
          continue;
        } else {
          onProgress?.({
            stage: "ERROR",
            model: currentModel,
            errorReason,
            message: `All models failed. Last error: ${errorReason}`
          });
          return {
            success: false,
            error: lastError,
            recommendedTags: [],
            auditChain
          };
        }
      }
      try {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          auditChain.push({
            model: currentModel,
            status: "FAILED",
            error: "NO_RESPONSE_TEXT",
            latencyMs
          });
          continue;
        }
        const parsed = JSON.parse(rawText);
        const recommendedTags = Array.isArray(parsed.recommendedTags) ? parsed.recommendedTags.map((t) => String(t).trim()).filter(Boolean) : [];
        const newTags = [];
        if (Array.isArray(parsed.newTags)) {
          for (const nt of parsed.newTags) {
            const trimmed = String(nt).trim();
            if (trimmed && !newTags.includes(trimmed)) newTags.push(trimmed);
          }
        }
        if (parsed.suggestedNewTag) {
          const snt = String(parsed.suggestedNewTag).trim();
          if (snt && snt.toLowerCase() !== "null" && snt.toLowerCase() !== "none" && !newTags.includes(snt)) {
            newTags.push(snt);
          }
        }
        for (const nt of newTags) {
          if (!recommendedTags.includes(nt)) {
            recommendedTags.push(nt);
          }
        }
        const reasoning = typeof parsed.reasoning === "string" ? parsed.reasoning.trim() : "";
        auditChain.push({
          model: currentModel,
          status: "SUCCESS",
          latencyMs
        });
        onProgress?.({
          stage: "SUCCESS",
          model: currentModel,
          message: `Classified via ${cleanModelName} (${latencyMs}ms)`
        });
        return {
          success: true,
          method,
          recommendedTags,
          newTags,
          reasoning,
          suggestedNewTag: newTags[0] || null,
          modelUsed: currentModel,
          auditChain
        };
      } catch (parseErr) {
        console.warn(`[AppDirectory] Parse error from ${currentModel}:`, parseErr);
        auditChain.push({
          model: currentModel,
          status: "FAILED",
          error: "PARSE_ERROR",
          latencyMs
        });
        continue;
      }
    }
    return {
      success: false,
      error: lastError,
      recommendedTags: [],
      auditChain
    };
  }
})();
//# sourceMappingURL=background.js.map
