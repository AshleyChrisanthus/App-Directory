import { state } from './core/state';
import { initStorage, reloadFromStorage, onBroadcastMessage, notifyOtherTabs } from './core/storage';
import { PIN_FAVORITES_KEY, FILTER_MODE_KEY } from './core/constants';
import { showToast } from './utils/dom';

// Theme & Navigation
import {
  initTheme,
  toggleTheme,
  openThemeModal,
  closeThemeModal,
  syncColorPickersFromDOM,
  renderPresetPalettes,
  resetAllThemeToDefault,
  resetCategoryColors,
  autoColorizeCategories,
  exportThemeJson,
  importThemeJson
} from './modules/theme/theme';
import { initTopNavReveal } from './modules/navigation/top-nav';

// Bookmarks
import {
  render,
  renderCardsOnly,
  setViewMode,
  openModal,
  closeModal,
  addEntry,
  updateEntry,
  deleteEntry,
  visitEntry,
  updatePinFavoritesButtonState,
  updateModalIconPreview,
  autoFillUrlMetadata,
  suggestCategoriesWithAI
} from './modules/bookmarks';

// Categories
import {
  populateCategories,
  getAllCategories,
  updateCatFilterLabel,
  updateModeToggleUI,
  renderCategorySuggestions,
  hideCategorySuggestions,
  setSuggestionHighlight,
  addTag,
  suggestionHighlightedIndex
} from './modules/categories/manager';
import { openCatModal, closeCatModal, renderCatList } from './modules/categories/modal';

// Folders & Emoji
import {
  initSidebar,
  toggleSidebar,
  setActiveFolder,
  deleteFolder,
  populateFolderSelect
} from './modules/folders/sidebar';
import {
  openFolderModal,
  closeFolderModal,
  saveFolderForm,
  openAddBookmarksModal,
  closeAddBookmarksModal,
  confirmMoveBookmarksToFolder,
  renderAddBookmarksList,
  selectAllBookmarksToMove,
  deselectAllBookmarksToMove,
  setAddBmSourceFilter,
  setAddBmSearchQuery
} from './modules/folders/modal';
import {
  toggleEmojiPicker,
  closeEmojiPicker,
  renderEmojiGrid,
  activeEmojiCategoryId
} from './modules/folders/emoji-picker';

// Icons
import {
  refreshAllIcons,
  acceptAllPendingIcons,
  dismissAllPendingIcons,
  cacheExistingIconsOffline
} from './modules/icons/refresh';

// Health Checker
import {
  openHealthModal,
  closeHealthModal,
  startHealthScan,
  stopHealthScan,
  renderHealthModalList,
  setHealthSearchQuery,
  setHealthFilter
} from './modules/health/checker';

// Insights Dashboard
import { toggleInsightsDrawer, renderInsightsDashboard } from './modules/insights/dashboard';

// Spotlight Command Palette
import {
  initCommandPalette,
  openCommandPalette,
  closeCommandPalette,
  type CommandPaletteCallbacks
} from './modules/command-palette/palette';

// Import / Export
import {
  exportData,
  exportQuickDownload,
  exportToFolderDirect,
  exportToClipboard
} from './modules/io/export';

// Extension Sync Bridge
import { initExtensionSync } from './modules/extension/sync';
import { importData } from './modules/io/import';

// Security & Master Passcode
import {
  initPasscodeProtection,
  isPasscodeEnabled,
  isAppUnlocked,
  showLockScreen,
  hideLockScreen,
  openSecurityModal,
  closeSecurityModal,
  lockApp
} from './modules/security/passcode';

// Cloud Sync (E2EE)
import { syncManager, openSyncModal } from './modules/sync';

// Global Settings & AI
import {
  initSettingsModal,
  openSettingsModal,
  closeSettingsModal
} from './modules/settings/manager';

// ── DOM References ───────────────────────────────────────
const addBtn = document.getElementById('addBtn');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const entryForm = document.getElementById('entryForm') as HTMLFormElement | null;
const entryName = document.getElementById('entryName') as HTMLInputElement | null;
const entryUrl = document.getElementById('entryUrl') as HTMLInputElement | null;
const entryFolder = document.getElementById('entryFolder') as HTMLSelectElement | null;
const entryIcon = document.getElementById('entryIcon') as HTMLInputElement | null;
const entryDescription = document.getElementById('entryDescription') as HTMLTextAreaElement | null;
const entryFavorite = document.getElementById('entryFavorite') as HTMLInputElement | null;
const entryCategory = document.getElementById('entryCategory') as HTMLInputElement | null;
const addCategoryBtn = document.getElementById('addCategoryBtn');
const tagInputWrapper = document.getElementById('tagInputWrapper');
const categorySuggestionsPopup = document.getElementById('categorySuggestionsPopup');
const autoDetectBtn = document.getElementById('autoDetectBtn');
const uploadIconBtn = document.getElementById('uploadIconBtn');
const iconFileInput = document.getElementById('iconFileInput') as HTMLInputElement | null;
const entryIconPreview = document.getElementById('entryIconPreview');

const catFilterBtn = document.getElementById('catFilterBtn');
const catFilterDropdown = document.getElementById('catFilterDropdown');
const catFilterMenu = document.getElementById('catFilterMenu');
const catFilterSearchInput = document.getElementById('catFilterSearchInput') as HTMLInputElement | null;
const catFilterSearchClearBtn = document.getElementById('catFilterSearchClearBtn');
const catFilterList = document.getElementById('catFilterList');
const selectAllCatsBtn = document.getElementById('selectAllCatsBtn');
const clearAllCatsBtn = document.getElementById('clearAllCatsBtn');
const modeUnionBtn = document.getElementById('modeUnionBtn');
const modeIntersectBtn = document.getElementById('modeIntersectBtn');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const activeCatFilterBannerClear = document.getElementById('activeCatFilterBannerClear');

const catModalClose = document.getElementById('catModalClose');
const catModalBackdrop = document.getElementById('catModalBackdrop');
const catModalSearchInput = document.getElementById('catModalSearchInput') as HTMLInputElement | null;
const catModalSearchClearBtn = document.getElementById('catModalSearchClearBtn');

const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
const searchClearBtn = document.getElementById('searchClearBtn');
const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement | null;
const pinFavoritesBtn = document.getElementById('pinFavoritesBtn');

const viewCardsBtn = document.getElementById('viewCardsBtn');
const viewTableBtn = document.getElementById('viewTableBtn');
const viewIconsBtn = document.getElementById('viewIconsBtn');

const insightsToggleBtn = document.getElementById('insightsToggleBtn');
const insightsCloseBtn = document.getElementById('insightsCloseBtn');

const themeToggle = document.getElementById('themeToggle');
const themeCustomizerBtn = document.getElementById('themeCustomizerBtn');
const themeModalClose = document.getElementById('themeModalClose');
const saveThemeModalBtn = document.getElementById('saveThemeModalBtn');
const themeModalBackdrop = document.getElementById('themeModalBackdrop');

const refreshAllBtn = document.getElementById('refreshAllBtn');
const acceptAllIconsBtn = document.getElementById('acceptAllIconsBtn');
const dismissAllIconsBtn = document.getElementById('dismissAllIconsBtn');
const floatingAcceptAllBtn = document.getElementById('floatingAcceptAllBtn');
const floatingDismissAllBtn = document.getElementById('floatingDismissAllBtn');

const exportSplitGroup = document.getElementById('exportSplitGroup');
const exportBtn = document.getElementById('exportBtn');
const exportMenuBtn = document.getElementById('exportMenuBtn') || document.getElementById('exportToggleBtn');
const exportFolderBtn = document.getElementById('exportFolderBtn');
const exportChangeFolderBtn = document.getElementById('exportChangeFolderBtn');
const exportQuickBtn = document.getElementById('exportQuickBtn');
const exportClipboardBtn = document.getElementById('exportClipboardBtn');
const importBtn = document.getElementById('importBtn');
const importFile = (document.getElementById('importFile') || document.getElementById('importInput')) as HTMLInputElement | null;

const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarQuickViews = document.getElementById('sidebarQuickViews');
const newFolderBtn = document.getElementById('newFolderBtn');
const inlineNewFolderBtn = document.getElementById('inlineNewFolderBtn');
const editFolderBtn = document.getElementById('editFolderBtn');
const deleteFolderBtn = document.getElementById('deleteFolderBtn');
const folderForm = document.getElementById('folderForm');
const folderModalClose = document.getElementById('folderModalClose');
const cancelFolderBtn = document.getElementById('cancelFolderBtn');
const folderModalBackdrop = document.getElementById('folderModalBackdrop');

const folderIconTriggerBtn = document.getElementById('folderIconTriggerBtn');
const folderIconInput = document.getElementById('folderIconInput') as HTMLInputElement | null;
const folderIconDisplay = document.getElementById('folderIconDisplay');
const emojiSearchInput = document.getElementById('emojiSearchInput') as HTMLInputElement | null;
const emojiSearchClear = document.getElementById('emojiSearchClear');
const osKeyboardHint = document.getElementById('osKeyboardHint');
const emojiPickerPopover = document.getElementById('emojiPickerPopover');

const addBookmarksToFolderBtn = document.getElementById('addBookmarksToFolderBtn');
const addBookmarksModalClose = document.getElementById('addBookmarksModalClose');
const cancelAddBmBtn = document.getElementById('cancelAddBmBtn');
const addBookmarksModalBackdrop = document.getElementById('addBookmarksModalBackdrop');
const addBmSearchInput = document.getElementById('addBmSearchInput') as HTMLInputElement | null;
const addBmSearchClear = document.getElementById('addBmSearchClear');
const addBmFilterPills = document.getElementById('addBmFilterPills');
const addBmSelectAllBtn = document.getElementById('addBmSelectAllBtn');
const addBmDeselectAllBtn = document.getElementById('addBmDeselectAllBtn');
const confirmAddBmBtn = document.getElementById('confirmAddBmBtn');

const healthCheckBtn = document.getElementById('healthCheckBtn');
const healthModalClose = document.getElementById('healthModalClose');
const healthModalBackdrop = document.getElementById('healthModalBackdrop');
const healthStopBtn = document.getElementById('healthStopBtn');
const healthScanAllBtn = document.getElementById('healthScanAllBtn');
const healthScanBrokenBtn = document.getElementById('healthScanBrokenBtn');
const healthSearchInput = document.getElementById('healthSearchInput') as HTMLInputElement | null;
const healthSearchClear = document.getElementById('healthSearchClear');
const healthFilterPills = document.getElementById('healthFilterPills');

const headerLogo = document.querySelector('.logo');
const cmdPaletteTrigger = document.getElementById('cmdPaletteTrigger');

function handleToggleInsights(openState?: boolean): void {
  toggleInsightsDrawer(
    openState,
    (id: string) => visitEntry(id, render),
    (id: string) => deleteEntry(id, render),
    render
  );
}

function handleOpenHealthModal(): void {
  openHealthModal(
    (id: string) => openModal(id),
    (id: string) => deleteEntry(id, render),
    render
  );
}

// Command Palette Callbacks
const paletteCallbacks: CommandPaletteCallbacks = {
  openAddModal: () => openModal(),
  toggleTheme: () => toggleTheme(render),
  openThemeModal: () => openThemeModal(),
  refreshAllIcons: () => refreshAllIcons(render),
  openHealthModal: () => handleOpenHealthModal(),
  exportData: () => exportToFolderDirect(false),
  triggerImport: () => {
    if (importFile) importFile.click();
  },
  openCatModal: () => openCatModal(render),
  setViewMode: (mode: 'cards' | 'table' | 'icons') => setViewMode(mode),
  toggleInsightsDrawer: () => handleToggleInsights(),
  setActiveFolder: (folderId: string) => setActiveFolder(folderId as any, render),
  visitEntry: (id: string) => visitEntry(id, render),
  updateCardsOnly: () => renderCardsOnly(),
  lockApp: () => {
    if (isPasscodeEnabled()) {
      lockApp();
      showLockScreen();
      showToast('App Directory locked');
    } else {
      openSecurityModal();
      showToast('Set a master passcode first to lock');
    }
  },
  openSecurityModal: () => openSecurityModal(),
  openSyncModal: () => openSyncModal(),
  openSettingsModal: (tab?: string) => openSettingsModal(tab)
};

// ── Form Submission ──────────────────────────────────────
function handleSubmit(e: Event): void {
  e.preventDefault();
  if (!entryForm || !entryName || !entryUrl) return;

  let valid = true;
  entryForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  if (!entryName.value.trim()) {
    entryName.classList.add('error');
    valid = false;
  }
  if (!entryUrl.value.trim()) {
    entryUrl.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  const pendingCat = entryCategory ? entryCategory.value.trim() : '';
  if (pendingCat && !state.selectedCategories.includes(pendingCat)) {
    state.selectedCategories.push(pendingCat);
  }

  const data = {
    name: entryName.value.trim(),
    url: entryUrl.value.trim(),
    folderId: entryFolder ? (entryFolder.value || null) : null,
    categories: [...state.selectedCategories],
    iconUrl: entryIcon ? entryIcon.value.trim() : '',
    description: entryDescription ? entryDescription.value.trim() : '',
    isFavorite: entryFavorite ? entryFavorite.checked : false
  };

  if (state.editingId) {
    updateEntry(state.editingId, data, render);
  } else {
    addEntry(data, render);
  }

  closeModal();
  render();
}

// ── Event Listeners ──────────────────────────────────────

// Modal Add & Close
if (addBtn) addBtn.addEventListener('click', () => openModal());
if (modalClose) modalClose.addEventListener('click', closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e: MouseEvent) => {
    if (e.target === modalBackdrop) closeModal();
  });
}
if (entryForm) entryForm.addEventListener('submit', handleSubmit);

// Escape key
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeModal();
    closeCatModal();
    closeThemeModal();
    closeFolderModal();
    closeCommandPalette();
    closeSettingsModal();
    if (catFilterDropdown) catFilterDropdown.classList.remove('open');
    if (exportSplitGroup) exportSplitGroup.classList.remove('open');
  }
});

// Category tag input inside Modal
if (entryCategory) {
  entryCategory.addEventListener('input', () => renderCategorySuggestions());
  entryCategory.addEventListener('focus', () => renderCategorySuggestions());
  entryCategory.addEventListener('keydown', (e: KeyboardEvent) => {
    const isVisible = categorySuggestionsPopup && categorySuggestionsPopup.style.display !== 'none';
    const items = categorySuggestionsPopup ? categorySuggestionsPopup.querySelectorAll('.suggestion-item') : [];

    if (e.key === 'ArrowDown') {
      if (!isVisible) {
        renderCategorySuggestions();
      } else {
        e.preventDefault();
        setSuggestionHighlight(suggestionHighlightedIndex + 1);
      }
    } else if (e.key === 'ArrowUp') {
      if (isVisible) {
        e.preventDefault();
        setSuggestionHighlight(suggestionHighlightedIndex - 1);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isVisible && suggestionHighlightedIndex >= 0 && items[suggestionHighlightedIndex]) {
        const nameEl = items[suggestionHighlightedIndex].querySelector('.suggestion-name');
        if (nameEl && nameEl.textContent) addTag(nameEl.textContent);
      } else if (entryCategory.value.trim()) {
        addTag(entryCategory.value);
      }
    } else if (e.key === 'Escape') {
      if (isVisible) {
        e.stopPropagation();
        hideCategorySuggestions();
      }
    }
  });
}

if (addCategoryBtn) {
  addCategoryBtn.addEventListener('click', () => {
    if (entryCategory && entryCategory.value.trim()) {
      addTag(entryCategory.value);
    }
  });
}

const aiSuggestCategoriesBtn = document.getElementById('aiSuggestCategoriesBtn');
if (aiSuggestCategoriesBtn) {
  aiSuggestCategoriesBtn.addEventListener('click', () => {
    suggestCategoriesWithAI(true);
  });
}

// Category Multi-Select Dropdown Controls
let catFilterHighlightedIndex = -1;

function getCatFilterNavigableItems(): HTMLElement[] {
  if (!catFilterList) return [];
  return Array.from(catFilterList.querySelectorAll('.dropdown-item')) as HTMLElement[];
}

function setCatFilterHighlight(newIndex: number): void {
  const items = getCatFilterNavigableItems();
  items.forEach(el => el.classList.remove('is-focused'));
  if (items.length === 0) {
    catFilterHighlightedIndex = -1;
    return;
  }
  if (newIndex < 0) {
    catFilterHighlightedIndex = items.length - 1;
  } else if (newIndex >= items.length) {
    catFilterHighlightedIndex = 0;
  } else {
    catFilterHighlightedIndex = newIndex;
  }
  const target = items[catFilterHighlightedIndex];
  if (target) {
    target.classList.add('is-focused');
    target.scrollIntoView({ block: 'nearest' });
  }
}

if (catFilterBtn && catFilterDropdown) {
  catFilterBtn.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    const isOpen = catFilterDropdown.classList.toggle('open');
    if (isOpen && catFilterSearchInput) {
      catFilterHighlightedIndex = -1;
      setTimeout(() => catFilterSearchInput.focus(), 60);
    }
  });

  if (catFilterMenu) {
    catFilterMenu.addEventListener('click', (e: MouseEvent) => e.stopPropagation());
  }

  if (catFilterSearchInput) {
    catFilterSearchInput.addEventListener('input', () => {
      catFilterHighlightedIndex = -1;
      populateCategories(renderCardsOnly);
    });
    catFilterSearchInput.addEventListener('keydown', (e: KeyboardEvent) => {
      const items = getCatFilterNavigableItems();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCatFilterHighlight(catFilterHighlightedIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCatFilterHighlight(catFilterHighlightedIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const target = (catFilterHighlightedIndex >= 0 && items[catFilterHighlightedIndex])
          ? items[catFilterHighlightedIndex]
          : (items.length === 1 ? items[0] : null);
        if (target) {
          const cb = target.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
          if (cb) {
            cb.checked = !cb.checked;
            cb.dispatchEvent(new Event('change'));
          }
        }
      } else if (e.key === 'Escape') {
        catFilterSearchInput.value = '';
        populateCategories(renderCardsOnly);
        catFilterDropdown.classList.remove('open');
      }
    });
  }

  if (catFilterSearchClearBtn) {
    catFilterSearchClearBtn.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      if (catFilterSearchInput) {
        catFilterSearchInput.value = '';
        catFilterSearchInput.focus();
      }
      populateCategories(renderCardsOnly);
    });
  }

  if (selectAllCatsBtn) {
    selectAllCatsBtn.addEventListener('click', () => {
      const allCats = getAllCategories();
      const query = catFilterSearchInput ? catFilterSearchInput.value.toLowerCase().trim() : '';
      const targetCats = query ? allCats.filter(cat => cat.toLowerCase().includes(query)) : allCats;

      targetCats.forEach(cat => state.selectedFilterCategories.add(cat));
      if (catFilterList) {
        catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => ((cb as HTMLInputElement).checked = true));
      }
      updateCatFilterLabel();
      renderCardsOnly();
    });
  }

  if (clearAllCatsBtn) {
    clearAllCatsBtn.addEventListener('click', () => {
      const query = catFilterSearchInput ? catFilterSearchInput.value.toLowerCase().trim() : '';
      if (query) {
        const allCats = getAllCategories();
        const targetCats = allCats.filter(cat => cat.toLowerCase().includes(query));
        targetCats.forEach(cat => state.selectedFilterCategories.delete(cat));
      } else {
        state.selectedFilterCategories.clear();
      }
      if (catFilterList) {
        catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => ((cb as HTMLInputElement).checked = false));
      }
      updateCatFilterLabel();
      renderCardsOnly();
    });
  }

  if (modeUnionBtn) {
    modeUnionBtn.addEventListener('click', () => {
      state.catFilterMode = 'union';
      localStorage.setItem(FILTER_MODE_KEY, 'union');
      updateModeToggleUI();
      updateCatFilterLabel();
      renderCardsOnly();
    });
  }

  if (modeIntersectBtn) {
    modeIntersectBtn.addEventListener('click', () => {
      state.catFilterMode = 'intersect';
      localStorage.setItem(FILTER_MODE_KEY, 'intersect');
      updateModeToggleUI();
      updateCatFilterLabel();
      renderCardsOnly();
    });
  }

  // Manage Categories Modal
  if (manageCategoriesBtn) {
    manageCategoriesBtn.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      catFilterDropdown.classList.remove('open');
      openCatModal(render);
    });
  }
}

if (catModalClose) catModalClose.addEventListener('click', closeCatModal);
if (catModalBackdrop) {
  catModalBackdrop.addEventListener('click', (e: MouseEvent) => {
    if (e.target === catModalBackdrop) closeCatModal();
  });
}

if (catModalSearchInput) {
  catModalSearchInput.addEventListener('input', () => {
    renderCatList(catModalSearchInput.value, render);
  });
  catModalSearchInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      catModalSearchInput.value = '';
      renderCatList('', render);
    }
  });
}

if (catModalSearchClearBtn) {
  catModalSearchClearBtn.addEventListener('click', () => {
    if (catModalSearchInput) {
      catModalSearchInput.value = '';
      catModalSearchInput.focus();
    }
    renderCatList('', render);
  });
}

// Active Category Filter Banner Clear Button
if (activeCatFilterBannerClear) {
  activeCatFilterBannerClear.addEventListener('click', () => {
    state.selectedFilterCategories.clear();
    if (catFilterList) {
      catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => ((cb as HTMLInputElement).checked = false));
    }
    updateCatFilterLabel();
    renderCardsOnly();
    if (state.isInsightsOpen) renderInsightsDashboard(render);
    showToast('Cleared category filter');
  });
}

// Global outside click handler
document.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (catFilterDropdown && !catFilterDropdown.contains(target)) {
    catFilterDropdown.classList.remove('open');
  }
  if (tagInputWrapper && !tagInputWrapper.contains(target)) {
    hideCategorySuggestions();
  }
  if (exportSplitGroup && !exportSplitGroup.contains(target)) {
    exportSplitGroup.classList.remove('open');
  }
});

// Search & Sorting
if (searchInput) {
  searchInput.addEventListener('input', () => {
    if (searchClearBtn) {
      searchClearBtn.style.display = searchInput.value.trim() ? 'inline-flex' : 'none';
    }
    renderCardsOnly();
  });

  searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && searchInput.value) {
      searchInput.value = '';
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      renderCardsOnly();
    }
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    searchClearBtn.style.display = 'none';
    renderCardsOnly();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', () => renderCardsOnly());
}

if (pinFavoritesBtn) {
  updatePinFavoritesButtonState();
  pinFavoritesBtn.addEventListener('click', () => {
    state.pinFavorites = !state.pinFavorites;
    localStorage.setItem(PIN_FAVORITES_KEY, String(state.pinFavorites));
    updatePinFavoritesButtonState();
    renderCardsOnly();
    showToast(state.pinFavorites ? 'Favorites pinned to top ⭐' : 'Natural sort order restored');
  });
}

// View Mode Switcher
if (viewCardsBtn) viewCardsBtn.addEventListener('click', () => setViewMode('cards'));
if (viewTableBtn) viewTableBtn.addEventListener('click', () => setViewMode('table'));
if (viewIconsBtn) viewIconsBtn.addEventListener('click', () => setViewMode('icons'));

// Insights Drawer
if (insightsToggleBtn) {
  insightsToggleBtn.addEventListener('click', () => handleToggleInsights());
}
if (insightsCloseBtn) {
  insightsCloseBtn.addEventListener('click', () => handleToggleInsights(false));
}

// Theme & Settings
if (themeToggle) themeToggle.addEventListener('click', () => toggleTheme(render));
if (themeCustomizerBtn) themeCustomizerBtn.addEventListener('click', openThemeModal);
const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) settingsBtn.addEventListener('click', () => openSettingsModal('ai'));
if (themeModalClose) themeModalClose.addEventListener('click', closeThemeModal);
if (saveThemeModalBtn) saveThemeModalBtn.addEventListener('click', closeThemeModal);
if (themeModalBackdrop) {
  themeModalBackdrop.addEventListener('click', (e: MouseEvent) => {
    if (e.target === themeModalBackdrop) closeThemeModal();
  });
}

// Theme Modal Action Buttons
const resetAllThemeBtn = document.getElementById('resetAllThemeBtn');
if (resetAllThemeBtn) resetAllThemeBtn.addEventListener('click', () => resetAllThemeToDefault(render));

const resetCatColorsBtn = document.getElementById('resetCatColorsBtn');
if (resetCatColorsBtn) resetCatColorsBtn.addEventListener('click', () => resetCategoryColors(render));

const autoPaletteCatsBtn = document.getElementById('autoPaletteCatsBtn');
if (autoPaletteCatsBtn) autoPaletteCatsBtn.addEventListener('click', () => autoColorizeCategories(render));

const copyThemeJsonBtn = document.getElementById('copyThemeJsonBtn');
if (copyThemeJsonBtn) copyThemeJsonBtn.addEventListener('click', exportThemeJson);

const applyThemeJsonBtn = document.getElementById('applyThemeJsonBtn');
if (applyThemeJsonBtn) applyThemeJsonBtn.addEventListener('click', () => importThemeJson(render));


// Theme Customizer Tabs
document.querySelectorAll('.theme-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.theme-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.theme-tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    if (tabId) {
      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');
    }
  });
});

// Granular color pickers
document.querySelectorAll('.color-picker-item input[type="color"]').forEach(input => {
  input.addEventListener('input', (e: Event) => {
    const prop = input.getAttribute('data-var');
    const hex = (e.target as HTMLInputElement).value;
    if (prop) {
      state.customThemeColors[prop] = hex;
      document.documentElement.style.setProperty(prop, hex);
      const hexInput = input.parentElement?.querySelector('.color-hex-input') as HTMLInputElement | null;
      if (hexInput) hexInput.value = hex;
      localStorage.setItem('appDirectory_customTheme', JSON.stringify(state.customThemeColors));
      notifyOtherTabs('SYNC_THEME');
      renderCardsOnly();
    }
  });
});

document.querySelectorAll('.color-hex-input').forEach(input => {
  const handler = (e: Event) => {
    let val = ((e.target as HTMLInputElement)?.value || '').trim();
    if (!val.startsWith('#') && (val.length === 3 || val.length === 6)) val = '#' + val;
    const colorPicker = input.parentElement?.querySelector('input[type="color"]') as HTMLInputElement | null;
    const prop = colorPicker ? colorPicker.getAttribute('data-var') : null;
    if (prop && (val.length === 4 || val.length === 7)) {
      state.customThemeColors[prop] = val;
      if (colorPicker) colorPicker.value = val;
      document.documentElement.style.setProperty(prop, val);
      localStorage.setItem('appDirectory_customTheme', JSON.stringify(state.customThemeColors));
      notifyOtherTabs('SYNC_THEME');
      renderCardsOnly();
    }
  };
  input.addEventListener('change', handler);
  input.addEventListener('input', handler);
});

// Icon Actions
if (refreshAllBtn) refreshAllBtn.addEventListener('click', () => refreshAllIcons(render));
if (acceptAllIconsBtn) acceptAllIconsBtn.addEventListener('click', () => acceptAllPendingIcons(render));
if (dismissAllIconsBtn) dismissAllIconsBtn.addEventListener('click', () => dismissAllPendingIcons(render));
if (floatingAcceptAllBtn) floatingAcceptAllBtn.addEventListener('click', () => acceptAllPendingIcons(render));
if (floatingDismissAllBtn) floatingDismissAllBtn.addEventListener('click', () => dismissAllPendingIcons(render));

// Import / Export
if (exportBtn) {
  exportBtn.addEventListener('click', () => exportData());
}
if (exportMenuBtn && exportSplitGroup) {
  exportMenuBtn.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    exportSplitGroup.classList.toggle('open');
  });
}
if (exportFolderBtn) {
  exportFolderBtn.addEventListener('click', () => {
    if (exportSplitGroup) exportSplitGroup.classList.remove('open');
    exportToFolderDirect(false);
  });
}
if (exportChangeFolderBtn) {
  exportChangeFolderBtn.addEventListener('click', () => {
    if (exportSplitGroup) exportSplitGroup.classList.remove('open');
    exportToFolderDirect(true);
  });
}
if (exportQuickBtn) {
  exportQuickBtn.addEventListener('click', () => {
    if (exportSplitGroup) exportSplitGroup.classList.remove('open');
    exportQuickDownload();
  });
}
if (exportClipboardBtn) {
  exportClipboardBtn.addEventListener('click', () => {
    if (exportSplitGroup) exportSplitGroup.classList.remove('open');
    exportToClipboard();
  });
}
if (importBtn && importFile) {
  importBtn.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      importData(target.files[0], render);
      target.value = '';
    }
  });
}

// Modal Icon Preview & Auto-fill
let urlAutofillDebounceTimer: ReturnType<typeof setTimeout> | null = null;

if (entryUrl) {
  entryUrl.addEventListener('input', () => {
    if (entryIcon && !entryIcon.value.trim()) {
      updateModalIconPreview();
    }
    if (urlAutofillDebounceTimer) clearTimeout(urlAutofillDebounceTimer);
    urlAutofillDebounceTimer = setTimeout(() => {
      const val = entryUrl.value.trim();
      if (val.length > 5 && (val.includes('.') || val.startsWith('localhost'))) {
        autoFillUrlMetadata(false);
      }
    }, 650);
  });

  entryUrl.addEventListener('paste', () => {
    if (urlAutofillDebounceTimer) clearTimeout(urlAutofillDebounceTimer);
    setTimeout(() => autoFillUrlMetadata(false), 50);
  });

  entryUrl.addEventListener('blur', () => {
    const url = entryUrl.value.trim();
    if (url && entryIcon && !entryIcon.value.trim()) {
      updateModalIconPreview();
    }
    if (url && ((entryName && !entryName.value.trim()) || (entryDescription && !entryDescription.value.trim()))) {
      autoFillUrlMetadata(false);
    }
  });
}

if (autoDetectBtn) {
  autoDetectBtn.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    autoFillUrlMetadata(true, true);
  });
}

if (entryIcon) {
  entryIcon.addEventListener('input', updateModalIconPreview);
}

// Upload custom icon from file
if (uploadIconBtn && iconFileInput) {
  uploadIconBtn.addEventListener('click', () => iconFileInput.click());
  if (entryIconPreview) {
    entryIconPreview.style.cursor = 'pointer';
    entryIconPreview.addEventListener('click', () => iconFileInput.click());
  }
  iconFileInput.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const file = target.files[0];
      const reader = new FileReader();
      reader.onload = (evt: ProgressEvent<FileReader>) => {
        if (entryIcon && evt.target?.result) {
          entryIcon.value = evt.target.result as string;
          updateModalIconPreview();
          showToast('Custom icon loaded!');
        }
      };
      reader.readAsDataURL(file);
      target.value = '';
    }
  });
}

// Paste image directly from clipboard
document.addEventListener('paste', (e: ClipboardEvent) => {
  if (!modalBackdrop || !modalBackdrop.classList.contains('active')) return;
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type && items[i].type.startsWith('image/')) {
      const blob = items[i].getAsFile();
      if (blob) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = (evt: ProgressEvent<FileReader>) => {
          if (entryIcon && evt.target?.result) {
            entryIcon.value = evt.target.result as string;
            updateModalIconPreview();
            showToast('Pasted image set as icon!');
          }
        };
        reader.readAsDataURL(blob);
        return;
      }
    }
  }
});

// Drag and Drop image file onto icon preview box
if (entryIconPreview) {
  entryIconPreview.addEventListener('dragover', (e: DragEvent) => {
    e.preventDefault();
    entryIconPreview.style.borderColor = 'var(--accent)';
  });
  entryIconPreview.addEventListener('dragleave', () => {
    entryIconPreview.style.borderColor = '';
  });
  entryIconPreview.addEventListener('drop', (e: DragEvent) => {
    e.preventDefault();
    entryIconPreview.style.borderColor = '';
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt: ProgressEvent<FileReader>) => {
          if (entryIcon && evt.target?.result) {
            entryIcon.value = evt.target.result as string;
            updateModalIconPreview();
            showToast('Dropped image set as icon!');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  });
}

// Sidebar & Folder Modals
if (sidebarToggleBtn) {
  sidebarToggleBtn.addEventListener('click', toggleSidebar);
}

if (sidebarQuickViews) {
  sidebarQuickViews.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const fid = item.getAttribute('data-folder-id');
      if (fid) setActiveFolder(fid as any, render);
    });
  });
}

if (newFolderBtn) {
  newFolderBtn.addEventListener('click', () => openFolderModal());
}

if (inlineNewFolderBtn) {
  inlineNewFolderBtn.addEventListener('click', () => {
    openFolderModal(null, (newFolderId: string) => {
      populateFolderSelect(newFolderId);
    });
  });
}

if (editFolderBtn) {
  editFolderBtn.addEventListener('click', () => {
    if (state.activeFolderId && state.activeFolderId.startsWith('f-')) {
      openFolderModal(state.activeFolderId);
    }
  });
}

if (deleteFolderBtn) {
  deleteFolderBtn.addEventListener('click', () => {
    if (state.activeFolderId && state.activeFolderId.startsWith('f-')) {
      deleteFolder(state.activeFolderId, render);
    }
  });
}

if (folderForm) {
  folderForm.addEventListener('submit', (e: Event) => saveFolderForm(e, render));
}

if (folderModalClose) folderModalClose.addEventListener('click', closeFolderModal);
if (cancelFolderBtn) cancelFolderBtn.addEventListener('click', closeFolderModal);
if (folderModalBackdrop) {
  folderModalBackdrop.addEventListener('click', (e: MouseEvent) => {
    if (e.target === folderModalBackdrop) closeFolderModal();
  });
}

// Folder Emoji Picker
if (folderIconTriggerBtn) {
  folderIconTriggerBtn.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation();
    toggleEmojiPicker();
  });
}

if (folderIconInput) {
  folderIconInput.addEventListener('input', () => {
    const val = folderIconInput.value.trim();
    if (folderIconDisplay) {
      folderIconDisplay.textContent = val || '📁';
    }
  });
}

if (emojiSearchInput) {
  emojiSearchInput.addEventListener('input', () => {
    const q = emojiSearchInput.value;
    if (emojiSearchClear) {
      emojiSearchClear.style.display = q ? 'inline-flex' : 'none';
    }
    renderEmojiGrid(activeEmojiCategoryId, q);
  });

  emojiSearchInput.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeEmojiPicker();
    }
  });
}

if (emojiSearchClear) {
  emojiSearchClear.addEventListener('click', () => {
    if (emojiSearchInput) emojiSearchInput.value = '';
    emojiSearchClear.style.display = 'none';
    renderEmojiGrid(activeEmojiCategoryId, '');
    if (emojiSearchInput) emojiSearchInput.focus();
  });
}

if (osKeyboardHint) {
  osKeyboardHint.addEventListener('click', () => {
    closeEmojiPicker();
    if (folderIconInput) {
      folderIconInput.focus();
      folderIconInput.select();
    }
  });
}

if (emojiPickerPopover) {
  emojiPickerPopover.addEventListener('click', (e: MouseEvent) => e.stopPropagation());
}

document.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (emojiPickerPopover && emojiPickerPopover.style.display !== 'none') {
    if (!emojiPickerPopover.contains(target) &&
        !folderIconTriggerBtn?.contains(target) &&
        !target?.closest('.emoji-more-btn')) {
      closeEmojiPicker();
    }
  }
});

// Add Bookmarks to Folder Modal
if (addBookmarksToFolderBtn) {
  addBookmarksToFolderBtn.addEventListener('click', () => openAddBookmarksModal(render));
}
if (addBookmarksModalClose) addBookmarksModalClose.addEventListener('click', closeAddBookmarksModal);
if (cancelAddBmBtn) cancelAddBmBtn.addEventListener('click', closeAddBookmarksModal);
if (addBookmarksModalBackdrop) {
  addBookmarksModalBackdrop.addEventListener('click', (e: MouseEvent) => {
    if (e.target === addBookmarksModalBackdrop) closeAddBookmarksModal();
  });
}

if (addBmSearchInput) {
  addBmSearchInput.addEventListener('input', () => {
    const q = addBmSearchInput.value.trim();
    setAddBmSearchQuery(q);
    if (addBmSearchClear) addBmSearchClear.style.display = q ? 'block' : 'none';
    renderAddBookmarksList();
  });
}

if (addBmSearchClear) {
  addBmSearchClear.addEventListener('click', () => {
    if (addBmSearchInput) addBmSearchInput.value = '';
    setAddBmSearchQuery('');
    addBmSearchClear.style.display = 'none';
    renderAddBookmarksList();
    if (addBmSearchInput) addBmSearchInput.focus();
  });
}

if (addBmFilterPills) {
  addBmFilterPills.querySelectorAll('.pill-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addBmFilterPills.querySelectorAll('.pill-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const source = btn.getAttribute('data-source') || 'all';
      setAddBmSourceFilter(source);
      renderAddBookmarksList();
    });
  });
}

if (addBmSelectAllBtn) {
  addBmSelectAllBtn.addEventListener('click', () => {
    selectAllBookmarksToMove();
  });
}

if (addBmDeselectAllBtn) {
  addBmDeselectAllBtn.addEventListener('click', () => {
    deselectAllBookmarksToMove();
  });
}

if (confirmAddBmBtn) {
  confirmAddBmBtn.addEventListener('click', () => confirmMoveBookmarksToFolder(render));
}

// Health Checker
if (healthCheckBtn) healthCheckBtn.addEventListener('click', () => handleOpenHealthModal());
if (healthModalClose) healthModalClose.addEventListener('click', closeHealthModal);
if (healthModalBackdrop) {
  healthModalBackdrop.addEventListener('click', (e: MouseEvent) => {
    if (e.target === healthModalBackdrop) closeHealthModal();
  });
}
if (healthStopBtn) healthStopBtn.addEventListener('click', stopHealthScan);
if (healthScanAllBtn) healthScanAllBtn.addEventListener('click', () => startHealthScan(false, render));
if (healthScanBrokenBtn) healthScanBrokenBtn.addEventListener('click', () => startHealthScan(true, render));

if (healthSearchInput) {
  healthSearchInput.addEventListener('input', () => {
    const q = healthSearchInput.value.trim();
    setHealthSearchQuery(q);
    if (healthSearchClear) healthSearchClear.style.display = q ? 'block' : 'none';
    renderHealthModalList();
  });
}

if (healthSearchClear) {
  healthSearchClear.addEventListener('click', () => {
    if (healthSearchInput) healthSearchInput.value = '';
    setHealthSearchQuery('');
    healthSearchClear.style.display = 'none';
    renderHealthModalList();
    if (healthSearchInput) healthSearchInput.focus();
  });
}

if (healthFilterPills) {
  healthFilterPills.querySelectorAll('.pill-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      healthFilterPills.querySelectorAll('.pill-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const health = btn.getAttribute('data-health') || 'all';
      setHealthFilter(health);
      renderHealthModalList();
    });
  });
}

// Header Logo Reset
function resetToAllBookmarks(): void {
  if (searchInput) searchInput.value = '';
  if (searchClearBtn) searchClearBtn.style.display = 'none';
  state.selectedFilterCategories.clear();
  const catCheckboxes = document.querySelectorAll('.cat-filter-checkbox');
  catCheckboxes.forEach(cb => { (cb as HTMLInputElement).checked = false; });
  const catSearch = document.getElementById('catFilterSearchInput') as HTMLInputElement | null;
  if (catSearch) catSearch.value = '';
  updateCatFilterLabel();
  setActiveFolder('all', render);
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (headerLogo) {
  headerLogo.addEventListener('click', (e: Event) => {
    e.preventDefault();
    resetToAllBookmarks();
  });
}

// Command palette trigger button in header
if (cmdPaletteTrigger) {
  cmdPaletteTrigger.addEventListener('click', () => openCommandPalette(paletteCallbacks));
}

// ── Initialize App ───────────────────────────────────────
async function init(): Promise<void> {
  initTheme();
  initSidebar();
  updateModeToggleUI();
  setViewMode(state.currentViewMode);
  handleToggleInsights(state.isInsightsOpen);
  await initStorage();
  initTopNavReveal();
  initCommandPalette(paletteCallbacks);
  initSettingsModal();

  registerServiceWorker();

  await initPasscodeProtection({
    onUnlocked: () => {
      render();
      cacheExistingIconsOffline(render);
      initExtensionSync(render);
      handleIncomingWebShare();
    },
    onLocked: () => {
      // Handled by lock overlay
    }
  });

  if (isAppUnlocked()) {
    render();
    cacheExistingIconsOffline(render);
    initExtensionSync(render);
    handleIncomingWebShare();
  }

  let isSyncingTheme = false;
  const syncThemeFromExternal = () => {
    if (isSyncingTheme) return;
    isSyncingTheme = true;
    try {
      initTheme();
      updateModeToggleUI();
      syncColorPickersFromDOM();
      renderPresetPalettes();
      renderCardsOnly();
    } finally {
      setTimeout(() => {
        isSyncingTheme = false;
      }, 100);
    }
  };

  onBroadcastMessage(async (data) => {
    if (data.type === 'SYNC_DATA') {
      await reloadFromStorage();
      render();
    } else if (data.type === 'SYNC_THEME') {
      syncThemeFromExternal();
    }
  });

  window.addEventListener('storage', (e) => {
    if (
      e.key === 'appDirectory_theme' ||
      e.key === 'appDirectory_activePreset' ||
      e.key === 'appDirectory_customTheme' ||
      e.key === 'appDirectory_categoryColors'
    ) {
      syncThemeFromExternal();
    }
  });

  // ── Cloud Sync (E2EE) Initialization ────────────────────
  (window as any).__APP_SYNC_MANAGER__ = syncManager;
  (window as any).refreshAppDirectoryViews = () => {
    render();
    initSidebar();
    populateCategories();
    populateFolderSelect();
  };

  const cloudSyncBtn = document.getElementById('cloudSyncBtn');
  const syncDotIndicator = document.getElementById('syncDotIndicator');
  if (cloudSyncBtn) {
    cloudSyncBtn.addEventListener('click', openSyncModal);
  }

  syncManager.onStatusChange((status) => {
    if (syncDotIndicator) {
      syncDotIndicator.className = `sync-dot-indicator ${status.state}`;
    }
  });

  // Check URL hash for pairing link on launch
  syncManager.checkUrlHashForPairing();

  // If configured, trigger background sync
  if (syncManager.isConfigured()) {
    syncManager.syncNow().catch((err) => {
      console.warn('[Sync] Launch sync failed:', err);
    });
  }
}

function registerServiceWorker(): void {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    const register = () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err);
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }
  }
}

function handleIncomingWebShare(): void {
  if (typeof window === 'undefined') return;

  const search = window.location.search;
  if (!search) return;

  const params = new URLSearchParams(search);
  const rawUrl = params.get('share_url') || params.get('url') || '';
  const rawTitle = params.get('share_title') || params.get('title') || '';
  const rawText = params.get('share_text') || params.get('text') || '';

  if (!rawUrl && !rawText && !rawTitle) return;

  // Extract clean URL from url or text
  let finalUrl = rawUrl.trim();
  let finalTitle = rawTitle.trim();
  let finalDescription = '';

  if (!finalUrl && rawText) {
    const urlMatch = rawText.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      finalUrl = urlMatch[0];
      const remainder = rawText.replace(finalUrl, '').trim();
      if (!finalTitle && remainder) {
        finalTitle = remainder;
      } else if (remainder) {
        finalDescription = remainder;
      }
    } else {
      finalDescription = rawText;
    }
  } else if (rawText && rawText !== finalUrl) {
    finalDescription = rawText;
  }

  // Clear query params from address bar so refreshing doesn't re-trigger modal
  try {
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl || '/');
  } catch (_) {}

  if (finalUrl || finalTitle) {
    setTimeout(() => {
      openModal(null, {
        url: finalUrl,
        name: finalTitle,
        description: finalDescription
      });
    }, 150);
  }
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { init(); });
} else {
  init();
}
