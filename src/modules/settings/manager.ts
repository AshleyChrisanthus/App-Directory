import { AppGlobalSettings, DEFAULT_GLOBAL_SETTINGS, DEFAULT_KNOWN_MODELS, DiscoveredModel } from './types';
import { fetchAvailableModels } from './discovery';
import { showToast } from '../../utils/dom';

const SETTINGS_STORAGE_KEY = 'appDirectory_global_settings';

let currentSettings: AppGlobalSettings = loadStoredSettings();

function loadStoredSettings(): AppGlobalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_GLOBAL_SETTINGS };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_GLOBAL_SETTINGS,
      ...parsed,
      geminiFallbackModels: Array.isArray(parsed.geminiFallbackModels)
        ? parsed.geminiFallbackModels
        : [...DEFAULT_GLOBAL_SETTINGS.geminiFallbackModels],
      discoveredModels: Array.isArray(parsed.discoveredModels) && parsed.discoveredModels.length > 0
        ? parsed.discoveredModels
        : [...DEFAULT_KNOWN_MODELS]
    };
  } catch (err) {
    console.warn('[Settings] Failed to parse stored settings:', err);
    return { ...DEFAULT_GLOBAL_SETTINGS };
  }
}

export function getSettings(): AppGlobalSettings {
  return { ...currentSettings };
}

export function updateSettings(partial: Partial<AppGlobalSettings>): AppGlobalSettings {
  currentSettings = {
    ...currentSettings,
    ...partial
  };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (err) {
    console.error('[Settings] Failed to save settings to localStorage:', err);
  }

  // Broadcast to companion extension via bridge
  broadcastSettingsToExtension(currentSettings);

  return { ...currentSettings };
}

export function broadcastSettingsToExtension(settings: AppGlobalSettings): void {
  if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
    window.postMessage({
      type: 'APP_DIRECTORY_SAVE_SETTINGS',
      settings: {
        geminiApiKey: settings.geminiApiKey,
        geminiModel: settings.geminiModel,
        geminiFallbackModels: settings.geminiFallbackModels,
        discoveredModels: settings.discoveredModels,
        braveApiKey: settings.braveApiKey,
        autoClassify: settings.autoClassify
      }
    }, '*');
  }
}

export function requestExtensionSettings(): void {
  if (typeof window !== 'undefined' && typeof window.postMessage === 'function') {
    window.postMessage({
      type: 'APP_DIRECTORY_REQUEST_SETTINGS'
    }, '*');
  }
}

export function syncSettingsFromExtension(extSettings: Partial<AppGlobalSettings>): void {
  if (!extSettings || typeof extSettings !== 'object') return;
  let changed = false;

  const next: Partial<AppGlobalSettings> = {};
  if (extSettings.geminiApiKey !== undefined && extSettings.geminiApiKey !== currentSettings.geminiApiKey) {
    next.geminiApiKey = extSettings.geminiApiKey;
    changed = true;
  }
  if (extSettings.geminiModel && extSettings.geminiModel !== currentSettings.geminiModel) {
    next.geminiModel = extSettings.geminiModel;
    changed = true;
  }
  if (Array.isArray(extSettings.geminiFallbackModels)) {
    next.geminiFallbackModels = extSettings.geminiFallbackModels;
    changed = true;
  }
  if (Array.isArray(extSettings.discoveredModels) && extSettings.discoveredModels.length > 0) {
    next.discoveredModels = extSettings.discoveredModels;
    changed = true;
  }
  if (extSettings.braveApiKey !== undefined && extSettings.braveApiKey !== currentSettings.braveApiKey) {
    next.braveApiKey = extSettings.braveApiKey;
    changed = true;
  }
  if (extSettings.autoClassify !== undefined && extSettings.autoClassify !== currentSettings.autoClassify) {
    next.autoClassify = extSettings.autoClassify;
    changed = true;
  }

  if (changed) {
    currentSettings = { ...currentSettings, ...next };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (_) {}
    populateSettingsForm();
  }
}

export async function testGeminiConnection(apiKey: string, model: string): Promise<{ success: boolean; message: string }> {
  const key = apiKey.trim();
  if (!key) {
    return { success: false, message: 'Please enter a Gemini API key first.' };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model || 'gemini-2.5-flash')}:generateContent?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping test. Reply with OK.' }] }]
      })
    });

    if (res.ok) {
      return { success: true, message: `Connected to ${model} successfully!` };
    }

    if (res.status === 400 || res.status === 403) {
      return { success: false, message: `Invalid API key (HTTP ${res.status}). Check your Google AI Studio key.` };
    } else if (res.status === 429) {
      return { success: false, message: 'Rate limit reached (HTTP 429). Please wait a moment.' };
    } else if (res.status === 503) {
      return { success: false, message: `${model} is temporarily overloaded (HTTP 503). You can switch to gemini-2.5-flash.` };
    } else {
      return { success: false, message: `API Error (HTTP ${res.status}).` };
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Network error connecting to Gemini API.' };
  }
}

export function openSettingsModal(defaultTab: string = 'ai'): void {
  const backdrop = document.getElementById('settingsModalBackdrop');
  if (!backdrop) return;

  populateSettingsForm();
  switchSettingsTab(defaultTab);

  backdrop.classList.add('active');
  backdrop.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Clear any previous test status
  const testStatus = document.getElementById('settingsTestAiStatus');
  if (testStatus) {
    testStatus.style.display = 'none';
    testStatus.textContent = '';
  }
}

export function closeSettingsModal(): void {
  const backdrop = document.getElementById('settingsModalBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('active');
  backdrop.style.display = '';
  document.body.style.overflow = '';
}

export function switchSettingsTab(tabName: string): void {
  const tabsNav = document.getElementById('settingsTabsNav');
  if (!tabsNav) return;

  const buttons = tabsNav.querySelectorAll<HTMLButtonElement>('.settings-tab-btn');
  buttons.forEach(btn => {
    const target = btn.getAttribute('data-tab');
    btn.classList.toggle('active', target === tabName);
  });

  const panes = document.querySelectorAll<HTMLElement>('.settings-tab-pane');
  panes.forEach(pane => {
    const id = pane.id;
    pane.classList.toggle('active', id === `settingsTabPane_${tabName}` || id === `${tabName}Tab`);
  });
}

// ── Model Dropdowns & Fallback Chain Rendering ────────────

function getAvailableModelsList(): DiscoveredModel[] {
  if (Array.isArray(currentSettings.discoveredModels) && currentSettings.discoveredModels.length > 0) {
    return currentSettings.discoveredModels;
  }
  return [...DEFAULT_KNOWN_MODELS];
}

function renderModelSelectOptions(selectEl: HTMLSelectElement, selectedValue: string): void {
  const models = getAvailableModelsList();
  selectEl.innerHTML = '';

  const groups: Record<string, DiscoveredModel[]> = {
    'flash': [],
    'flash-lite': [],
    'preview': [],
    'pro': [],
    'other': []
  };

  for (const m of models) {
    const fam = m.family || 'other';
    if (groups[fam]) groups[fam].push(m);
    else groups.other.push(m);
  }

  const groupLabels: Record<string, string> = {
    'flash': '⚡ Flash Models (Fast, High Quality)',
    'flash-lite': '🪶 Flash-Lite Models (Ultra Fast, High Quota)',
    'preview': '🧪 Preview & Experimental Models',
    'pro': '🧠 Pro Models (Deep Reasoning)',
    'other': '📦 Other Gemini Models'
  };

  for (const [key, list] of Object.entries(groups)) {
    if (list.length === 0) continue;
    const optGroup = document.createElement('optgroup');
    optGroup.label = groupLabels[key] || key;

    for (const m of list) {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = `${m.displayName} (${m.name})`;
      if (m.name === selectedValue) {
        opt.selected = true;
      }
      optGroup.appendChild(opt);
    }
    selectEl.appendChild(optGroup);
  }

  // Ensure selected value is present even if not in standard list
  if (selectedValue && !models.some(m => m.name === selectedValue)) {
    const customOpt = document.createElement('option');
    customOpt.value = selectedValue;
    customOpt.textContent = `${selectedValue} (Custom)`;
    customOpt.selected = true;
    selectEl.appendChild(customOpt);
  }
}

function renderFallbackChainList(): void {
  const container = document.getElementById('settingsFallbackChainList');
  if (!container) return;

  container.innerHTML = '';
  const fallbackList = Array.isArray(currentSettings.geminiFallbackModels)
    ? currentSettings.geminiFallbackModels
    : [];

  if (fallbackList.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'fallback-empty-hint';
    emptyMsg.textContent = 'No fallback models configured. Add one below to automatically recover if primary hits 429/503.';
    container.appendChild(emptyMsg);
    return;
  }

  fallbackList.forEach((fbModel, idx) => {
    const row = document.createElement('div');
    row.className = 'settings-fallback-row';
    row.dataset.index = String(idx);

    const badge = document.createElement('span');
    badge.className = 'fallback-badge-pill';
    badge.textContent = `Fallback ${idx + 1}`;

    const select = document.createElement('select');
    select.className = 'form-select settings-fallback-item-select';
    renderModelSelectOptions(select, fbModel);

    select.addEventListener('change', () => {
      fallbackList[idx] = select.value;
      currentSettings.geminiFallbackModels = [...fallbackList];
    });

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-ghost btn-xs remove-fallback-btn';
    removeBtn.title = 'Remove this fallback model';
    removeBtn.innerHTML = '✕';
    removeBtn.addEventListener('click', () => {
      fallbackList.splice(idx, 1);
      currentSettings.geminiFallbackModels = [...fallbackList];
      renderFallbackChainList();
    });

    row.appendChild(badge);
    row.appendChild(select);
    row.appendChild(removeBtn);
    container.appendChild(row);
  });
}

function populateSettingsForm(): void {
  const geminiKeyInput = document.getElementById('settingsGeminiKey') as HTMLInputElement | null;
  const geminiModelSelect = document.getElementById('settingsGeminiModel') as HTMLSelectElement | null;
  const braveKeyInput = document.getElementById('settingsBraveKey') as HTMLInputElement | null;
  const autoClassifyCheckbox = document.getElementById('settingsAutoClassify') as HTMLInputElement | null;
  const openInNewTabCheckbox = document.getElementById('settingsOpenInNewTab') as HTMLInputElement | null;
  const defaultSortSelect = document.getElementById('settingsDefaultSort') as HTMLSelectElement | null;

  if (geminiKeyInput) geminiKeyInput.value = currentSettings.geminiApiKey || '';
  if (geminiModelSelect) {
    renderModelSelectOptions(geminiModelSelect, currentSettings.geminiModel || 'gemini-2.5-flash');
  }
  renderFallbackChainList();

  if (braveKeyInput) braveKeyInput.value = currentSettings.braveApiKey || '';
  if (autoClassifyCheckbox) autoClassifyCheckbox.checked = currentSettings.autoClassify !== false;
  if (openInNewTabCheckbox) openInNewTabCheckbox.checked = currentSettings.openInNewTab !== false;
  if (defaultSortSelect) defaultSortSelect.value = currentSettings.defaultSort || 'dateAdded-desc';
}

function readFormSettings(): AppGlobalSettings {
  const geminiKeyInput = document.getElementById('settingsGeminiKey') as HTMLInputElement | null;
  const geminiModelSelect = document.getElementById('settingsGeminiModel') as HTMLSelectElement | null;
  const braveKeyInput = document.getElementById('settingsBraveKey') as HTMLInputElement | null;
  const autoClassifyCheckbox = document.getElementById('settingsAutoClassify') as HTMLInputElement | null;
  const openInNewTabCheckbox = document.getElementById('settingsOpenInNewTab') as HTMLInputElement | null;
  const defaultSortSelect = document.getElementById('settingsDefaultSort') as HTMLSelectElement | null;

  // Gather fallback models from DOM
  const fallbackSelects = document.querySelectorAll<HTMLSelectElement>('.settings-fallback-item-select');
  const fallbackModels: string[] = [];
  fallbackSelects.forEach(sel => {
    const val = sel.value.trim();
    if (val && !fallbackModels.includes(val)) {
      fallbackModels.push(val);
    }
  });

  return {
    geminiApiKey: geminiKeyInput ? geminiKeyInput.value.trim() : currentSettings.geminiApiKey,
    geminiModel: geminiModelSelect ? geminiModelSelect.value : currentSettings.geminiModel,
    geminiFallbackModels: fallbackModels.length > 0 ? fallbackModels : currentSettings.geminiFallbackModels,
    discoveredModels: currentSettings.discoveredModels || [...DEFAULT_KNOWN_MODELS],
    braveApiKey: braveKeyInput ? braveKeyInput.value.trim() : currentSettings.braveApiKey,
    autoClassify: autoClassifyCheckbox ? autoClassifyCheckbox.checked : currentSettings.autoClassify,
    openInNewTab: openInNewTabCheckbox ? openInNewTabCheckbox.checked : currentSettings.openInNewTab,
    defaultSort: defaultSortSelect ? defaultSortSelect.value : currentSettings.defaultSort
  };
}

let isSettingsModalInitialized = false;

export function initSettingsModal(): void {
  if (isSettingsModalInitialized) return;
  isSettingsModalInitialized = true;

  const settingsBtn = document.getElementById('settingsBtn');
  const backdrop = document.getElementById('settingsModalBackdrop');
  const closeBtn = document.getElementById('settingsModalCloseBtn');
  const cancelBtn = document.getElementById('settingsModalCancelBtn');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const resetBtn = document.getElementById('resetSettingsBtn');
  const testAiBtn = document.getElementById('settingsTestAiBtn');
  const testStatus = document.getElementById('settingsTestAiStatus');

  const discoverBtn = document.getElementById('settingsDiscoverModelsBtn');
  const discoverStatus = document.getElementById('settingsDiscoverStatus');
  const addFallbackBtn = document.getElementById('settingsAddFallbackBtn');

  const geminiToggle = document.getElementById('settingsGeminiKeyToggle');
  const braveToggle = document.getElementById('settingsBraveKeyToggle');
  const geminiKeyInput = document.getElementById('settingsGeminiKey') as HTMLInputElement | null;
  const braveKeyInput = document.getElementById('settingsBraveKey') as HTMLInputElement | null;

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => openSettingsModal('ai'));
  }

  if (closeBtn) closeBtn.addEventListener('click', closeSettingsModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeSettingsModal);

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeSettingsModal();
    });
  }

  // Tabs navigation
  const tabsNav = document.getElementById('settingsTabsNav');
  if (tabsNav) {
    tabsNav.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.settings-tab-btn');
      if (btn) {
        const tab = btn.getAttribute('data-tab');
        if (tab) switchSettingsTab(tab);
      }
    });
  }

  // Password visibility toggles
  if (geminiToggle && geminiKeyInput) {
    geminiToggle.addEventListener('click', () => {
      const isPassword = geminiKeyInput.type === 'password';
      geminiKeyInput.type = isPassword ? 'text' : 'password';
      geminiToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  if (braveToggle && braveKeyInput) {
    braveToggle.addEventListener('click', () => {
      const isPassword = braveKeyInput.type === 'password';
      braveKeyInput.type = isPassword ? 'text' : 'password';
      braveToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Discover Models Button
  if (discoverBtn) {
    discoverBtn.addEventListener('click', async () => {
      const key = geminiKeyInput ? geminiKeyInput.value.trim() : currentSettings.geminiApiKey;
      if (!key) {
        if (discoverStatus) {
          discoverStatus.style.display = 'inline-flex';
          discoverStatus.className = 'settings-status-badge error';
          discoverStatus.textContent = 'Please enter a Gemini API key first.';
        }
        return;
      }

      if (discoverStatus) {
        discoverStatus.style.display = 'inline-flex';
        discoverStatus.className = 'settings-status-badge loading';
        discoverStatus.textContent = 'Fetching models from Gemini API…';
      }
      discoverBtn.setAttribute('disabled', 'true');

      const result = await fetchAvailableModels(key);
      discoverBtn.removeAttribute('disabled');

      if (result.success && result.models.length > 0) {
        currentSettings.discoveredModels = result.models;
        updateSettings({ discoveredModels: result.models });

        const modelSelect = document.getElementById('settingsGeminiModel') as HTMLSelectElement | null;
        if (modelSelect) {
          renderModelSelectOptions(modelSelect, currentSettings.geminiModel);
        }
        renderFallbackChainList();

        if (discoverStatus) {
          discoverStatus.style.display = 'inline-flex';
          discoverStatus.className = 'settings-status-badge success';
          discoverStatus.textContent = `✓ Discovered ${result.models.length} models for your key`;
        }
      } else {
        if (discoverStatus) {
          discoverStatus.style.display = 'inline-flex';
          discoverStatus.className = 'settings-status-badge error';
          discoverStatus.textContent = result.error || 'Failed to fetch models.';
        }
      }
    });
  }

  // Add Fallback Model Button
  if (addFallbackBtn) {
    addFallbackBtn.addEventListener('click', () => {
      const available = getAvailableModelsList();
      const currentList = Array.isArray(currentSettings.geminiFallbackModels)
        ? [...currentSettings.geminiFallbackModels]
        : [];
      const primary = currentSettings.geminiModel || 'gemini-2.5-flash';

      // Pick next model not yet in chain
      const nextCandidate = available.find(m => m.name !== primary && !currentList.includes(m.name));
      const chosen = nextCandidate ? nextCandidate.name : 'gemini-2.0-flash';

      currentList.push(chosen);
      currentSettings.geminiFallbackModels = currentList;
      renderFallbackChainList();
    });
  }

  // Test AI Connection button
  if (testAiBtn) {
    testAiBtn.addEventListener('click', async () => {
      const geminiKey = geminiKeyInput ? geminiKeyInput.value.trim() : '';
      const geminiModelSelect = document.getElementById('settingsGeminiModel') as HTMLSelectElement | null;
      const model = geminiModelSelect ? geminiModelSelect.value : 'gemini-2.5-flash';

      if (!geminiKey) {
        if (testStatus) {
          testStatus.style.display = 'inline-flex';
          testStatus.className = 'settings-status-badge error';
          testStatus.textContent = 'Please enter a Gemini API key.';
        }
        return;
      }

      if (testStatus) {
        testStatus.style.display = 'inline-flex';
        testStatus.className = 'settings-status-badge loading';
        testStatus.textContent = 'Testing connection…';
      }

      testAiBtn.setAttribute('disabled', 'true');
      const result = await testGeminiConnection(geminiKey, model);
      testAiBtn.removeAttribute('disabled');

      if (testStatus) {
        testStatus.style.display = 'inline-flex';
        testStatus.className = `settings-status-badge ${result.success ? 'success' : 'error'}`;
        testStatus.textContent = result.message;
      }
    });
  }

  // Save Settings button
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const updated = readFormSettings();
      updateSettings(updated);
      closeSettingsModal();
      showToast('Settings saved successfully');
    });
  }

  // Reset Settings button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all settings to default values?')) {
        updateSettings(DEFAULT_GLOBAL_SETTINGS);
        populateSettingsForm();
        showToast('Settings reset to defaults');
      }
    });
  }

  // Initial request to extension bridge to hydrate settings if companion extension is present
  setTimeout(requestExtensionSettings, 300);
}
