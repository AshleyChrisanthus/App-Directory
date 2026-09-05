import type { ThemePreset, ThemeMode } from '../../types';
import {
  THEME_KEY,
  ACTIVE_PRESET_KEY,
  CUSTOM_THEME_KEY,
  CAT_COLORS_KEY
} from '../../core/constants';
import { state } from '../../core/state';
import { notifyOtherTabs } from '../../core/storage';
import { escapeHtml, showToast } from '../../utils/dom';
import { THEME_PRESETS } from './presets';

export function hexToRgb(hex?: string | null): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getCategoryTagStyle(categoryName?: string | null): string {
  if (!categoryName) return '';
  const color = state.categoryColors[categoryName.toLowerCase()];
  if (!color) return '';
  const rgb = hexToRgb(color);
  if (!rgb) return `style="color: ${color};"`;
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const bgAlpha = isDark ? 0.2 : 0.12;
  const borderAlpha = isDark ? 0.4 : 0.25;
  return `style="--tag-color: ${color}; color: ${color}; background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bgAlpha}); border: 1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${borderAlpha});"`;
}

export function getActivePreset(): ThemePreset {
  const id = localStorage.getItem(ACTIVE_PRESET_KEY) || 'default';
  return THEME_PRESETS.find(p => p.id === id) || THEME_PRESETS[0];
}

export function applyCustomThemeProperties(colorsObj: Record<string, string>): void {
  const root = document.documentElement;
  Object.entries(colorsObj).forEach(([prop, val]) => {
    if (val) {
      root.style.setProperty(prop, val);
    }
  });
  if (colorsObj['--card-bg']) {
    root.style.setProperty('--modal-bg', colorsObj['--card-bg']);
  }
  if (colorsObj['--bg-primary']) {
    root.style.setProperty('--input-bg', colorsObj['--bg-primary']);
  }
  if (colorsObj['--border-light']) {
    root.style.setProperty('--input-border', colorsObj['--border-light']);
    root.style.setProperty('--card-border', colorsObj['--border-light']);
  }
}

export function clearCustomThemeProperties(): void {
  const root = document.documentElement;
  [
    '--bg-primary',
    '--bg-secondary',
    '--bg-tertiary',
    '--card-bg',
    '--modal-bg',
    '--input-bg',
    '--input-border',
    '--card-border',
    '--bg-hover',
    '--text-primary',
    '--text-secondary',
    '--border-light',
    '--accent',
    '--accent-hover',
    '--tag-bg',
    '--tag-text'
  ].forEach(prop => root.style.removeProperty(prop));
}

export function applyPresetPaletteForMode(mode: 'dark' | 'light'): void {
  const preset = getActivePreset();
  const colors = preset[mode] || preset.dark;
  clearCustomThemeProperties();
  applyCustomThemeProperties(colors);

  // Apply custom user overrides if present
  try {
    const raw = localStorage.getItem(CUSTOM_THEME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const overrides = parsed[mode] || parsed;
        if (overrides && typeof overrides === 'object') {
          applyCustomThemeProperties(overrides);
        }
      }
    }
  } catch (_) {}
}

export function initTheme(onThemeChanged?: () => void): void {
  const saved = localStorage.getItem(THEME_KEY);
  const theme = (saved as 'dark' | 'light') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  applyPresetPaletteForMode(theme);

  try {
    const catCols = localStorage.getItem(CAT_COLORS_KEY);
    if (catCols) {
      state.categoryColors = JSON.parse(catCols) || {};
    }
  } catch {
    state.categoryColors = {};
  }

  if (onThemeChanged) onThemeChanged();
}

export function toggleTheme(onThemeChanged?: () => void): void {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);

  applyPresetPaletteForMode(next);
  syncColorPickersFromDOM();
  renderPresetPalettes();
  notifyOtherTabs('SYNC_THEME');
  if (onThemeChanged) onThemeChanged();
}

export function renderPresetPalettes(): void {
  const presetPalettesGrid = document.getElementById('presetPalettesGrid');
  if (!presetPalettesGrid) return;
  const currentMode = (document.documentElement.getAttribute('data-theme') || 'dark') as 'dark' | 'light';
  const activePreset = getActivePreset();
  presetPalettesGrid.innerHTML = '';

  THEME_PRESETS.forEach(preset => {
    const card = document.createElement('div');
    const isActive = preset.id === activePreset.id;
    card.className = `palette-card ${isActive ? 'active' : ''}`;
    const swatches = (preset.swatches && preset.swatches[currentMode]) || (preset.swatches && preset.swatches.dark) || [];

    card.innerHTML = `
      <div class="palette-preview-bar">
        ${swatches.map(c => `<div class="palette-swatch" style="background: ${c};"></div>`).join('')}
      </div>
      <div class="palette-name">${escapeHtml(preset.name)}</div>
      <div class="palette-desc">${escapeHtml(preset.desc)}</div>
    `;
    card.addEventListener('click', () => {
      applyPreset(preset);
    });
    presetPalettesGrid.appendChild(card);
  });
}

export function applyPreset(preset: ThemePreset, onThemeChanged?: () => void): void {
  localStorage.setItem(ACTIVE_PRESET_KEY, preset.id);
  const currentMode = (document.documentElement.getAttribute('data-theme') || 'dark') as 'dark' | 'light';
  applyPresetPaletteForMode(currentMode);
  syncColorPickersFromDOM();
  renderPresetPalettes();
  notifyOtherTabs('SYNC_THEME');
  if (onThemeChanged) onThemeChanged();
  showToast(`Applied "${preset.name}" theme family!`);
}

export function syncColorPickersFromDOM(): void {
  const computed = getComputedStyle(document.documentElement);
  const pickers = [
    { id: 'colorAccent', hexId: 'hexAccent', prop: '--accent' },
    { id: 'colorAccentHover', hexId: 'hexAccentHover', prop: '--accent-hover' },
    { id: 'colorBgPrimary', hexId: 'hexBgPrimary', prop: '--bg-primary' },
    { id: 'colorCardBg', hexId: 'hexCardBg', prop: '--card-bg' },
    { id: 'colorBgSecondary', hexId: 'hexBgSecondary', prop: '--bg-secondary' },
    { id: 'colorBgHover', hexId: 'hexBgHover', prop: '--bg-hover' },
    { id: 'colorTextPrimary', hexId: 'hexTextPrimary', prop: '--text-primary' },
    { id: 'colorTextSecondary', hexId: 'hexTextSecondary', prop: '--text-secondary' },
    { id: 'colorBorder', hexId: 'hexBorder', prop: '--border-light' },
    { id: 'colorTagText', hexId: 'hexTagText', prop: '--tag-text' }
  ];

  pickers.forEach(({ id, hexId, prop }) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    const hexInput = document.getElementById(hexId) as HTMLInputElement | null;
    const val = computed.getPropertyValue(prop).trim();
    if (!val) return;
    let hex = val;
    if (val.startsWith('rgb')) {
      const parts = val.match(/\d+/g);
      if (parts && parts.length >= 3) {
        hex = rgbToHex(Number(parts[0]), Number(parts[1]), Number(parts[2]));
      }
    }
    if (input && hex.startsWith('#') && hex.length === 7) {
      input.value = hex;
    }
    if (hexInput) {
      hexInput.value = hex;
    }
  });
}

export function renderCategoryColorsList(onUpdate?: () => void): void {
  const list = document.getElementById('categoryColorList');
  if (!list) return;

  const allCats = new Set<string>();
  state.entries.forEach(e => (e.categories || []).forEach(c => allCats.add(c)));
  Object.keys(state.categoryColors).forEach(c => allCats.add(c));

  const sorted = Array.from(allCats).sort((a, b) => a.localeCompare(b));
  list.innerHTML = '';

  if (sorted.length === 0) {
    list.innerHTML = '<div class="empty-state-text">No categories created yet.</div>';
    return;
  }

  sorted.forEach(cat => {
    const key = cat.toLowerCase();
    const currentColor = state.categoryColors[key] || '#0a84ff';
    const row = document.createElement('div');
    row.className = 'cat-color-row';
    row.innerHTML = `
      <span class="cat-color-name">${escapeHtml(cat)}</span>
      <div class="color-picker-wrapper">
        <input type="color" class="cat-color-input" data-cat="${escapeHtml(key)}" value="${currentColor}">
        <input type="text" class="color-hex-input cat-hex-input" data-cat="${escapeHtml(key)}" value="${currentColor}" maxlength="7">
        <button type="button" class="btn btn-icon btn-sm reset-cat-color-btn" data-cat="${escapeHtml(key)}" title="Reset category color">✕</button>
      </div>
    `;

    const colorInput = row.querySelector('.cat-color-input') as HTMLInputElement | null;
    const hexInput = row.querySelector('.cat-hex-input') as HTMLInputElement | null;
    const resetBtn = row.querySelector('.reset-cat-color-btn') as HTMLButtonElement | null;

    if (colorInput && hexInput) {
      colorInput.addEventListener('input', (e: Event) => {
        const hex = (e.target as HTMLInputElement).value;
        state.categoryColors[key] = hex;
        hexInput.value = hex;
        localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
        notifyOtherTabs('SYNC_THEME');
        if (onUpdate) onUpdate();
      });

      const hexHandler = (e: Event) => {
        let val = (e.target as HTMLInputElement).value.trim();
        if (!val.startsWith('#') && (val.length === 3 || val.length === 6)) val = '#' + val;
        if (val.length === 4 || val.length === 7) {
          state.categoryColors[key] = val;
          colorInput.value = val;
          localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
          notifyOtherTabs('SYNC_THEME');
          if (onUpdate) onUpdate();
        }
      };
      hexInput.addEventListener('input', hexHandler);
      hexInput.addEventListener('change', hexHandler);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        delete state.categoryColors[key];
        localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
        notifyOtherTabs('SYNC_THEME');
        renderCategoryColorsList(onUpdate);
        if (onUpdate) onUpdate();
        showToast(`Reset color for "${cat}".`);
      });
    }

    list.appendChild(row);
  });
}

export function resetAllThemeToDefault(onThemeChanged?: () => void): void {
  localStorage.removeItem(ACTIVE_PRESET_KEY);
  localStorage.removeItem(CUSTOM_THEME_KEY);
  localStorage.removeItem(CAT_COLORS_KEY);
  state.activeThemePreset = 'default';
  state.customThemeColors = {};
  state.categoryColors = {};
  clearCustomThemeProperties();

  const currentMode = (document.documentElement.getAttribute('data-theme') || 'dark') as 'dark' | 'light';
  applyPresetPaletteForMode(currentMode);
  syncColorPickersFromDOM();
  renderPresetPalettes();
  renderCategoryColorsList(onThemeChanged);
  notifyOtherTabs('SYNC_THEME');
  if (onThemeChanged) onThemeChanged();
  showToast('Theme and colors reset to default.');
}

export function resetCategoryColors(onThemeChanged?: () => void): void {
  state.categoryColors = {};
  localStorage.removeItem(CAT_COLORS_KEY);
  renderCategoryColorsList(onThemeChanged);
  notifyOtherTabs('SYNC_THEME');
  if (onThemeChanged) onThemeChanged();
  showToast('Category colors reset to default.');
}

export function autoColorizeCategories(onThemeChanged?: () => void): void {
  const allCats = new Set<string>();
  state.entries.forEach(e => (e.categories || []).forEach(c => allCats.add(c)));
  const sorted = Array.from(allCats).sort((a, b) => a.localeCompare(b));
  if (sorted.length === 0) {
    showToast('No categories to colorize.');
    return;
  }
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const lightness = isDark ? 65 : 45;
  const saturation = isDark ? 80 : 70;
  const step = 360 / sorted.length;

  sorted.forEach((cat, idx) => {
    const hue = Math.round((idx * step + 200) % 360);
    state.categoryColors[cat.toLowerCase()] = hslToHex(hue, saturation, lightness);
  });

  localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
  renderCategoryColorsList(onThemeChanged);
  notifyOtherTabs('SYNC_THEME');
  if (onThemeChanged) onThemeChanged();
  showToast(`Auto-colorized ${sorted.length} categories!`);
}

export function exportThemeJson(): void {
  const config = {
    theme: document.documentElement.getAttribute('data-theme') || 'dark',
    activePreset: localStorage.getItem(ACTIVE_PRESET_KEY) || 'default',
    customColors: state.customThemeColors,
    categoryColors: state.categoryColors
  };
  navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    .then(() => showToast('Theme configuration copied to clipboard!'))
    .catch(() => showToast('Failed to copy theme to clipboard.'));
}

export function importThemeJson(onThemeChanged?: () => void): void {
  const textarea = document.getElementById('importThemeJsonInput') as HTMLTextAreaElement | null;
  if (!textarea || !textarea.value.trim()) {
    showToast('Please paste a theme JSON configuration.');
    return;
  }
  try {
    const config = JSON.parse(textarea.value.trim());
    if (config.theme && (config.theme === 'dark' || config.theme === 'light')) {
      document.documentElement.setAttribute('data-theme', config.theme);
      localStorage.setItem(THEME_KEY, config.theme);
    }
    if (config.activePreset && typeof config.activePreset === 'string') {
      localStorage.setItem(ACTIVE_PRESET_KEY, config.activePreset);
      state.activeThemePreset = config.activePreset;
    }
    if (config.customColors && typeof config.customColors === 'object') {
      state.customThemeColors = config.customColors;
      localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(state.customThemeColors));
    }
    if (config.categoryColors && typeof config.categoryColors === 'object') {
      state.categoryColors = config.categoryColors;
      localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
    }
    const currentMode = (document.documentElement.getAttribute('data-theme') || 'dark') as 'dark' | 'light';
    applyPresetPaletteForMode(currentMode);
    if (state.customThemeColors && state.customThemeColors[currentMode]) {
      applyCustomThemeProperties(state.customThemeColors[currentMode]);
    }
    syncColorPickersFromDOM();
    renderPresetPalettes();
    renderCategoryColorsList(onThemeChanged);
    notifyOtherTabs('SYNC_THEME');
    if (onThemeChanged) onThemeChanged();
    textarea.value = '';
    showToast('Theme configuration imported successfully!');
  } catch (err) {
    showToast('Invalid theme JSON format.');
  }
}

export function openThemeModal(): void {
  renderPresetPalettes();
  syncColorPickersFromDOM();
  renderCategoryColorsList();
  const themeModalBackdrop = document.getElementById('themeModalBackdrop');
  if (themeModalBackdrop) themeModalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeThemeModal(): void {
  const themeModalBackdrop = document.getElementById('themeModalBackdrop');
  if (themeModalBackdrop) themeModalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

