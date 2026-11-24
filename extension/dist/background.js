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
  function buildTaxonomyUserPrompt(context, availableCategories, searchSnippets, decisionHintTags) {
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
    if (decisionHintTags && decisionHintTags.length > 0) {
      prompt += `### Pre-matched Existing Tags (from fast classifier):
`;
      prompt += `[ ${decisionHintTags.join(", ")} ]
`;
      prompt += `Keep any of these that fit, and focus on whether a genuinely distinct new tag is needed.

`;
    }
    prompt += `### Instructions:
1. Select 1 to 5 of the most fitting tags. Prioritize the Available Categories list above whenever they fit.
2. If none of the available categories fit well, or if a crucial distinct category is missing, you MUST suggest 1-2 new appropriate tags (e.g., "Internet History", "Digital Archive", "AI History", etc.).
3. Put ALL recommended tags (both existing and newly created) inside "recommendedTags" so they are applied to the bookmark.
4. If any tags in "recommendedTags" are NOT in the Available Categories list, list them in "newTags".
5. In "reasoning", provide a concise 1-2 sentence rationale explaining your choices.
6. Respond ONLY with the requested JSON object.`;
    return prompt;
  }

  // src/extension/decisions.ts
  var GEMINI_DECISION_MODEL = "gemini-decision-1";
  var DECISIONS_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/decisions";
  var MAX_DECISION_QUESTIONS = 1e3;
  var MAX_RECOMMENDED_TAGS = 5;
  var DEFAULT_CONFIDENCE_THRESHOLD = 0.75;
  var NEW_TAG_ROUTE_THRESHOLD = 0.5;
  function buildDecisionInputText(context, searchSnippets) {
    const lines = [
      `URL: ${context.url}`,
      `Title: ${context.title}`
    ];
    if (context.description) {
      lines.push(`Meta Description: ${context.description}`);
    }
    if (context.headings.length > 0) {
      lines.push(`Main Headings: ${context.headings.slice(0, 6).join(" | ")}`);
    }
    if (context.schemaTypes.length > 0) {
      lines.push(`Schema.org Types: ${context.schemaTypes.join(", ")}`);
    }
    if (context.heroText) {
      lines.push(`Hero Text: ${context.heroText}`);
    }
    if (context.bodySummary) {
      lines.push(`Page Content Snippet: ${context.bodySummary.slice(0, 1800)}`);
    }
    if (searchSnippets && searchSnippets.length > 0) {
      lines.push("External Web Search Context:");
      searchSnippets.forEach((snippet, idx) => {
        lines.push(`[Result ${idx + 1}] ${snippet}`);
      });
    }
    return lines.join("\n");
  }
  function readNoulProbability(answer) {
    if (!answer || typeof answer !== "object") return 0;
    if (typeof answer.noul === "number") return answer.noul;
    if (typeof answer.value === "number") return answer.value;
    return 0;
  }
  async function classifyWithDecisionsApi(geminiApiKey, context, availableCategories, searchSnippets = [], confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD, onProgress, auditChain) {
    if (!availableCategories || availableCategories.length === 0) {
      return {
        matchedTags: [],
        needsNewTag: true,
        needsNewTagScore: 1,
        tagScores: {},
        shouldRouteToGenerative: true,
        latencyMs: 0
      };
    }
    onProgress?.({
      stage: "ATTEMPTING",
      model: GEMINI_DECISION_MODEL,
      message: `Scoring ${availableCategories.length} existing tags via ${GEMINI_DECISION_MODEL}...`
    });
    const categoriesToCheck = availableCategories.slice(0, MAX_DECISION_QUESTIONS - 1);
    const questions = {};
    const keyToCategory = /* @__PURE__ */ new Map();
    categoriesToCheck.forEach((category, idx) => {
      const key = `tag_${idx}`;
      keyToCategory.set(key, category);
      questions[key] = {
        type: "noul",
        instructions: `Does this website's core product or primary purpose belong in the "${category}" category? Answer yes only if "${category}" is a substantial, first-class capability of the site rather than a minor feature.`
      };
    });
    questions["needs_new_tag"] = {
      type: "noul",
      instructions: `Is this website's primary product or category missing from all of the existing categories (${categoriesToCheck.join(", ")}), such that a brand-new reusable taxonomy tag is genuinely needed?`
    };
    const input = buildDecisionInputText(context, searchSnippets);
    const startTime = Date.now();
    let response = null;
    let fetchError = null;
    try {
      response = await fetch(DECISIONS_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey
        },
        body: JSON.stringify({
          model: GEMINI_DECISION_MODEL,
          input,
          questions
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
      auditChain?.push({
        model: GEMINI_DECISION_MODEL,
        status: "FAILED",
        error: errorReason,
        latencyMs
      });
      return {
        matchedTags: [],
        needsNewTag: true,
        needsNewTagScore: 1,
        tagScores: {},
        shouldRouteToGenerative: true,
        latencyMs,
        error: errorReason
      };
    }
    try {
      const data = await response.json();
      const answers = data?.answers || {};
      const tagScores = {};
      const scoredMatches = [];
      for (const [key, category] of keyToCategory.entries()) {
        const score = readNoulProbability(answers[key]);
        tagScores[category] = score;
        if (score >= confidenceThreshold) {
          scoredMatches.push({ category, score });
        }
      }
      scoredMatches.sort((a, b) => b.score - a.score);
      const matchedTags = scoredMatches.slice(0, MAX_RECOMMENDED_TAGS).map((item) => item.category);
      const needsNewTagScore = readNoulProbability(answers["needs_new_tag"]);
      const needsNewTag = needsNewTagScore >= NEW_TAG_ROUTE_THRESHOLD;
      const shouldRouteToGenerative = matchedTags.length === 0 || needsNewTag;
      auditChain?.push({
        model: GEMINI_DECISION_MODEL,
        status: "SUCCESS",
        latencyMs
      });
      if (!shouldRouteToGenerative) {
        onProgress?.({
          stage: "SUCCESS",
          model: GEMINI_DECISION_MODEL,
          message: `Matched ${matchedTags.length} tag(s) via ${GEMINI_DECISION_MODEL} (${latencyMs}ms)`
        });
      } else {
        const reasonText = matchedTags.length === 0 ? "No existing tag cleared threshold" : "New tag may be needed";
        onProgress?.({
          stage: "FALLBACK_SWITCH",
          model: GEMINI_DECISION_MODEL,
          message: `${GEMINI_DECISION_MODEL} (${latencyMs}ms): ${reasonText} \u2192 Routing to generative model...`
        });
      }
      return {
        matchedTags,
        needsNewTag,
        needsNewTagScore,
        tagScores,
        shouldRouteToGenerative,
        latencyMs
      };
    } catch {
      auditChain?.push({
        model: GEMINI_DECISION_MODEL,
        status: "FAILED",
        error: "PARSE_ERROR",
        latencyMs
      });
      return {
        matchedTags: [],
        needsNewTag: true,
        needsNewTagScore: 1,
        tagScores: {},
        shouldRouteToGenerative: true,
        latencyMs,
        error: "PARSE_ERROR"
      };
    }
  }

  // src/extension/background.ts
  var STORAGE_KEYS = {
    CACHED_FOLDERS: "ad_cached_folders",
    CACHED_CATEGORIES: "ad_cached_categories",
    CACHED_ENTRIES: "ad_cached_entries",
    PENDING_BOOKMARKS: "ad_pending_bookmarks",
    SETTINGS_GEMINI_KEY: "ad_gemini_api_key",
    SETTINGS_GEMINI_MODEL: "ad_gemini_model",
    SETTINGS_GEMINI_FALLBACK_MODELS: "ad_gemini_fallback_models",
    SETTINGS_DISCOVERED_MODELS: "ad_discovered_models",
    SETTINGS_BRAVE_KEY: "ad_brave_api_key",
    SETTINGS_AUTO_CLASSIFY: "ad_auto_classify",
    SETTINGS_USE_DECISION_FAST_PATH: "ad_use_decision_fast_path",
    SETTINGS_DECISION_THRESHOLD: "ad_decision_threshold"
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
  async function triggerPaletteOnActiveTab(tab) {
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
      await chrome.tabs.sendMessage(targetTab.id, { type: "TOGGLE_PALETTE_MODAL" });
    } catch {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          files: ["dist/content.js"]
        });
        await chrome.tabs.sendMessage(targetTab.id, { type: "TOGGLE_PALETTE_MODAL" });
      } catch (err) {
        console.warn("[AppDirectory Extension] Failed to inject content script:", err);
      }
    }
  }
  var lastActionClickTime = 0;
  chrome.action.onClicked.addListener((tab) => {
    const now = Date.now();
    if (now - lastActionClickTime < 400) return;
    lastActionClickTime = now;
    triggerModalOnActiveTab(tab);
  });
  var lastCommandTriggerTime = 0;
  chrome.commands.onCommand.addListener((command) => {
    if (command === "add-to-app-directory") {
      const now = Date.now();
      if (now - lastCommandTriggerTime < 400) return;
      lastCommandTriggerTime = now;
      triggerModalOnActiveTab();
    } else if (command === "open-command-palette") {
      const now = Date.now();
      if (now - lastCommandTriggerTime < 400) return;
      lastCommandTriggerTime = now;
      triggerPaletteOnActiveTab();
    }
  });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") return;
    switch (message.type) {
      case "GET_APP_DIRECTORY_STATE": {
        chrome.storage.local.get([
          STORAGE_KEYS.CACHED_FOLDERS,
          STORAGE_KEYS.CACHED_CATEGORIES,
          STORAGE_KEYS.CACHED_ENTRIES
        ], (res) => {
          sendResponse({
            folders: res[STORAGE_KEYS.CACHED_FOLDERS] || [],
            categories: res[STORAGE_KEYS.CACHED_CATEGORIES] || [],
            entries: res[STORAGE_KEYS.CACHED_ENTRIES] || []
          });
        });
        return true;
      }
      case "CACHE_APP_DIRECTORY_STATE": {
        const toSet = {
          [STORAGE_KEYS.CACHED_FOLDERS]: message.folders || [],
          [STORAGE_KEYS.CACHED_CATEGORIES]: message.categories || []
        };
        if (Array.isArray(message.entries)) {
          toSet[STORAGE_KEYS.CACHED_ENTRIES] = message.entries;
        }
        chrome.storage.local.set(toSet);
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
          STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY,
          STORAGE_KEYS.SETTINGS_USE_DECISION_FAST_PATH,
          STORAGE_KEYS.SETTINGS_DECISION_THRESHOLD
        ], (res) => {
          sendResponse({
            geminiApiKey: res[STORAGE_KEYS.SETTINGS_GEMINI_KEY] || "",
            geminiModel: res[STORAGE_KEYS.SETTINGS_GEMINI_MODEL] || "gemini-2.5-flash",
            geminiFallbackModels: res[STORAGE_KEYS.SETTINGS_GEMINI_FALLBACK_MODELS] || ["gemini-2.5-flash-lite"],
            discoveredModels: res[STORAGE_KEYS.SETTINGS_DISCOVERED_MODELS] || [],
            braveApiKey: res[STORAGE_KEYS.SETTINGS_BRAVE_KEY] || "",
            autoClassify: res[STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY] !== false,
            useDecisionFastPath: res[STORAGE_KEYS.SETTINGS_USE_DECISION_FAST_PATH] !== false,
            decisionConfidenceThreshold: typeof res[STORAGE_KEYS.SETTINGS_DECISION_THRESHOLD] === "number" ? res[STORAGE_KEYS.SETTINGS_DECISION_THRESHOLD] : 0.75
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
          [STORAGE_KEYS.SETTINGS_AUTO_CLASSIFY]: s.autoClassify !== false,
          [STORAGE_KEYS.SETTINGS_USE_DECISION_FAST_PATH]: s.useDecisionFastPath !== false
        };
        if (typeof s.decisionConfidenceThreshold === "number") {
          toSet[STORAGE_KEYS.SETTINGS_DECISION_THRESHOLD] = s.decisionConfidenceThreshold;
        }
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
          chrome.storage.local.get([STORAGE_KEYS.CACHED_ENTRIES], (entRes) => {
            const rawEntries = entRes[STORAGE_KEYS.CACHED_ENTRIES];
            const entriesList = Array.isArray(rawEntries) ? [...rawEntries] : [];
            const existingIdx = entriesList.findIndex((e) => e.id === entry.id || e.url === entry.url);
            const cachedItem = {
              id: entry.id,
              name: entry.name,
              url: entry.url,
              icon: entry.icon || null,
              iconUrl: entry.iconUrl || null,
              categories: entry.categories || [],
              folderId: entry.folderId || null,
              dateAdded: entry.dateAdded,
              description: entry.description || "",
              visitCount: entry.visitCount || 0,
              isFavorite: !!entry.isFavorite
            };
            if (existingIdx !== -1) {
              entriesList[existingIdx] = cachedItem;
            } else {
              entriesList.unshift(cachedItem);
            }
            chrome.storage.local.set({ [STORAGE_KEYS.CACHED_ENTRIES]: entriesList });
          });
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
      case "OPEN_BOOKMARK_URL": {
        const url = typeof message.url === "string" ? message.url : "";
        const mode = message.mode;
        const id = typeof message.id === "string" ? message.id : "";
        if (!url) {
          sendResponse({ success: false, error: "No URL provided" });
          return false;
        }
        chrome.storage.local.get([STORAGE_KEYS.CACHED_ENTRIES], (entRes) => {
          const rawEntries = entRes[STORAGE_KEYS.CACHED_ENTRIES];
          const entriesList = Array.isArray(rawEntries) ? [...rawEntries] : [];
          const existingIdx = entriesList.findIndex((e) => id && e.id === id || e.url === url);
          if (existingIdx !== -1) {
            entriesList[existingIdx] = {
              ...entriesList[existingIdx],
              visitCount: (entriesList[existingIdx].visitCount || 0) + 1
            };
            chrome.storage.local.set({ [STORAGE_KEYS.CACHED_ENTRIES]: entriesList });
          }
        });
        (async () => {
          try {
            const tabs = await chrome.tabs.query({});
            const appDirTabs = tabs.filter((t) => isAppDirectoryTab(t.url, t.title));
            for (const tab of appDirTabs) {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                  type: "RECORD_BOOKMARK_VISIT",
                  id,
                  url
                }).catch(() => {
                });
              }
            }
          } catch (_) {
          }
        })();
        const senderTab = _sender.tab;
        if (mode === "current") {
          if (senderTab && typeof senderTab.id === "number") {
            chrome.tabs.update(senderTab.id, { url });
          } else {
            chrome.tabs.create({ url, active: true });
          }
        } else if (mode === "new-tab") {
          chrome.tabs.create({
            url,
            active: true,
            index: senderTab ? senderTab.index + 1 : void 0
          });
        } else if (mode === "background-tab") {
          chrome.tabs.create({
            url,
            active: false,
            index: senderTab ? senderTab.index + 1 : void 0
          });
        }
        sendResponse({ success: true });
        return false;
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
      STORAGE_KEYS.SETTINGS_BRAVE_KEY,
      STORAGE_KEYS.SETTINGS_USE_DECISION_FAST_PATH,
      STORAGE_KEYS.SETTINGS_DECISION_THRESHOLD
    ]);
    const geminiApiKey = String(res[STORAGE_KEYS.SETTINGS_GEMINI_KEY] || "").trim();
    const primaryModel = String(res[STORAGE_KEYS.SETTINGS_GEMINI_MODEL] || "gemini-2.5-flash").trim();
    const rawFallbacks = res[STORAGE_KEYS.SETTINGS_GEMINI_FALLBACK_MODELS];
    const fallbackModels = Array.isArray(rawFallbacks) ? rawFallbacks : ["gemini-2.5-flash-lite"];
    const braveApiKey = String(res[STORAGE_KEYS.SETTINGS_BRAVE_KEY] || "").trim();
    const useDecisionFastPath = res[STORAGE_KEYS.SETTINGS_USE_DECISION_FAST_PATH] !== false;
    const rawThreshold = res[STORAGE_KEYS.SETTINGS_DECISION_THRESHOLD];
    const decisionThreshold = typeof rawThreshold === "number" ? rawThreshold : 0.75;
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
    const auditChain = [];
    let decisionHintTags;
    if (useDecisionFastPath && availableCategories.length > 0) {
      const decisionResult = await classifyWithDecisionsApi(
        geminiApiKey,
        pageContext,
        availableCategories,
        searchSnippets,
        decisionThreshold,
        onProgress,
        auditChain
      );
      if (decisionResult.error === "INVALID_API_KEY") {
        onProgress?.({
          stage: "ERROR",
          model: GEMINI_DECISION_MODEL,
          errorReason: "INVALID_API_KEY",
          message: "Invalid Gemini API Key."
        });
        return {
          success: false,
          error: "INVALID_API_KEY",
          recommendedTags: [],
          auditChain
        };
      }
      if (!decisionResult.shouldRouteToGenerative && decisionResult.matchedTags.length > 0) {
        return {
          success: true,
          method,
          recommendedTags: decisionResult.matchedTags,
          newTags: [],
          reasoning: `Matched existing taxonomy via ${GEMINI_DECISION_MODEL} (new-tag score: ${decisionResult.needsNewTagScore.toFixed(2)}).`,
          suggestedNewTag: null,
          modelUsed: GEMINI_DECISION_MODEL,
          auditChain
        };
      }
      if (decisionResult.matchedTags.length > 0) {
        decisionHintTags = decisionResult.matchedTags;
      }
    }
    const userPrompt = buildTaxonomyUserPrompt(
      pageContext,
      availableCategories,
      searchSnippets,
      decisionHintTags
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
