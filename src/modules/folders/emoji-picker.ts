import { EMOJI_CATEGORIES } from '../../utils/emoji-library';
import { escapeHtml } from '../../utils/dom';

const DEFAULT_RECENT_EMOJIS = ['📁', '💼', '🏠', '🔬', '🛠️', '🎨', '⚡', '📚'];
export let activeEmojiCategoryId = 'all';

export function getRecentEmojis(): string[] {
  try {
    const stored = localStorage.getItem('appDirectory_recentEmojis');
    if (stored) {
      const arr = JSON.parse(stored);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch {}
  return DEFAULT_RECENT_EMOJIS;
}

export function saveRecentEmoji(emoji: string): void {
  if (!emoji) return;
  let list = getRecentEmojis();
  list = [emoji, ...list.filter(e => e !== emoji)].slice(0, 16);
  try {
    localStorage.setItem('appDirectory_recentEmojis', JSON.stringify(list));
  } catch {}
  renderFolderEmojiQuickRow();
}

export function selectFolderEmoji(emoji: string): void {
  if (!emoji) return;
  const folderIconInput = document.getElementById('folderIconInput') as HTMLInputElement | null;
  const folderIconDisplay = document.getElementById('folderIconDisplay');
  if (folderIconInput) folderIconInput.value = emoji;
  if (folderIconDisplay) folderIconDisplay.textContent = emoji;
  saveRecentEmoji(emoji);
  closeEmojiPicker();
}

export function renderFolderEmojiQuickRow(): void {
  const folderEmojiQuickRow = document.getElementById('folderEmojiQuickRow');
  if (!folderEmojiQuickRow) return;
  folderEmojiQuickRow.innerHTML = '';
  const recents = getRecentEmojis().slice(0, 6);

  recents.forEach(em => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-quick-chip';
    btn.textContent = em;
    btn.title = `Select ${em}`;
    btn.addEventListener('click', () => selectFolderEmoji(em));
    folderEmojiQuickRow.appendChild(btn);
  });

  const moreBtn = document.createElement('button');
  moreBtn.type = 'button';
  moreBtn.className = 'emoji-more-btn';
  moreBtn.innerHTML = '<span>😀 More</span>';
  moreBtn.title = 'Browse all categorized emojis';
  moreBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleEmojiPicker();
  });
  folderEmojiQuickRow.appendChild(moreBtn);
}

export function updateActiveCategoryTab(): void {
  const emojiCategoryTabs = document.getElementById('emojiCategoryTabs');
  if (!emojiCategoryTabs) return;
  const tabs = emojiCategoryTabs.querySelectorAll('.emoji-category-tab');
  tabs.forEach(t => {
    if (t.getAttribute('data-cat') === activeEmojiCategoryId) {
      t.classList.add('is-active');
    } else {
      t.classList.remove('is-active');
    }
  });
}

export function renderEmojiCategoryTabs(): void {
  const emojiCategoryTabs = document.getElementById('emojiCategoryTabs');
  const emojiSearchInput = document.getElementById('emojiSearchInput') as HTMLInputElement | null;
  if (!emojiCategoryTabs) return;

  if (emojiCategoryTabs.children.length === 0) {
    const allTab = document.createElement('button');
    allTab.type = 'button';
    allTab.className = 'emoji-category-tab is-active';
    allTab.setAttribute('data-cat', 'all');
    allTab.textContent = '🌟';
    allTab.title = 'All Emojis';
    allTab.addEventListener('click', e => {
      e.stopPropagation();
      activeEmojiCategoryId = 'all';
      updateActiveCategoryTab();
      renderEmojiGrid('all', emojiSearchInput ? emojiSearchInput.value : '');
    });
    emojiCategoryTabs.appendChild(allTab);

    const recentTab = document.createElement('button');
    recentTab.type = 'button';
    recentTab.className = 'emoji-category-tab';
    recentTab.setAttribute('data-cat', 'recent');
    recentTab.textContent = '🕒';
    recentTab.title = 'Recent Emojis';
    recentTab.addEventListener('click', e => {
      e.stopPropagation();
      activeEmojiCategoryId = 'recent';
      updateActiveCategoryTab();
      renderEmojiGrid('recent', emojiSearchInput ? emojiSearchInput.value : '');
    });
    emojiCategoryTabs.appendChild(recentTab);

    EMOJI_CATEGORIES.forEach(cat => {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'emoji-category-tab';
      tab.setAttribute('data-cat', cat.id);
      tab.textContent = cat.icon;
      tab.title = cat.name;
      tab.addEventListener('click', e => {
        e.stopPropagation();
        activeEmojiCategoryId = cat.id;
        updateActiveCategoryTab();
        renderEmojiGrid(cat.id, emojiSearchInput ? emojiSearchInput.value : '');
      });
      emojiCategoryTabs.appendChild(tab);
    });
  }

  updateActiveCategoryTab();
}

export function renderEmojiGrid(categoryId = 'all', searchQuery = '') {
  const emojiGridContainer = document.getElementById('emojiGridContainer');
  if (!emojiGridContainer) return;
  emojiGridContainer.innerHTML = '';
  const q = searchQuery.trim().toLowerCase();

  if (q) {
    const matches: { e: string; k: string }[] = [];
    const seen = new Set<string>();

    EMOJI_CATEGORIES.forEach(cat => {
      cat.emojis.forEach(item => {
        if (!seen.has(item.e) && (item.e.includes(q) || item.k.toLowerCase().includes(q))) {
          seen.add(item.e);
          matches.push(item);
        }
      });
    });

    if (matches.length === 0) {
      emojiGridContainer.innerHTML = `<div class="emoji-no-results">No emojis found matching "<strong>${escapeHtml(
        searchQuery
      )}</strong>"</div>`;
      return;
    }

    const sec = document.createElement('div');
    sec.className = 'emoji-category-section';
    sec.innerHTML = `<div class="emoji-category-title">Search Results (${matches.length})</div>`;
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';

    matches.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-item-btn';
      btn.textContent = item.e;
      btn.title = item.k;
      btn.addEventListener('click', () => selectFolderEmoji(item.e));
      grid.appendChild(btn);
    });

    sec.appendChild(grid);
    emojiGridContainer.appendChild(sec);
    return;
  }

  if (categoryId === 'recent') {
    const recents = getRecentEmojis();
    const sec = document.createElement('div');
    sec.className = 'emoji-category-section';
    sec.innerHTML = `<div class="emoji-category-title">🕒 Recently Used</div>`;
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';

    recents.forEach(em => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-item-btn';
      btn.textContent = em;
      btn.addEventListener('click', () => selectFolderEmoji(em));
      grid.appendChild(btn);
    });

    sec.appendChild(grid);
    emojiGridContainer.appendChild(sec);
    return;
  }

  const categoriesToRender =
    categoryId === 'all' ? EMOJI_CATEGORIES : EMOJI_CATEGORIES.filter(c => c.id === categoryId);

  if (categoryId === 'all') {
    const recents = getRecentEmojis();
    if (recents.length > 0) {
      const recSec = document.createElement('div');
      recSec.className = 'emoji-category-section';
      recSec.innerHTML = `<div class="emoji-category-title">🕒 Recent</div>`;
      const recGrid = document.createElement('div');
      recGrid.className = 'emoji-grid';
      recents.slice(0, 16).forEach(em => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-item-btn';
        btn.textContent = em;
        btn.addEventListener('click', () => selectFolderEmoji(em));
        recGrid.appendChild(btn);
      });
      recSec.appendChild(recGrid);
      emojiGridContainer.appendChild(recSec);
    }
  }

  categoriesToRender.forEach(cat => {
    const sec = document.createElement('div');
    sec.className = 'emoji-category-section';
    sec.innerHTML = `<div class="emoji-category-title">${cat.icon} ${cat.name}</div>`;
    const grid = document.createElement('div');
    grid.className = 'emoji-grid';

    cat.emojis.forEach(item => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'emoji-item-btn';
      btn.textContent = item.e;
      btn.title = item.k;
      btn.addEventListener('click', () => selectFolderEmoji(item.e));
      grid.appendChild(btn);
    });

    sec.appendChild(grid);
    emojiGridContainer.appendChild(sec);
  });
}

export function openEmojiPicker(): void {
  const emojiPickerPopover = document.getElementById('emojiPickerPopover');
  const emojiSearchInput = document.getElementById('emojiSearchInput') as HTMLInputElement | null;
  const emojiSearchClear = document.getElementById('emojiSearchClear');
  const osShortcutKey = document.getElementById('osShortcutKey');

  if (!emojiPickerPopover) return;
  activeEmojiCategoryId = 'all';
  if (emojiSearchInput) emojiSearchInput.value = '';
  if (emojiSearchClear) emojiSearchClear.style.display = 'none';

  renderEmojiCategoryTabs();
  renderEmojiGrid('all', '');
  emojiPickerPopover.style.display = 'flex';

  if (osShortcutKey) {
    const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform || '');
    osShortcutKey.textContent = isMac ? 'Cmd + Ctrl + Space' : 'Win + .';
  }

  setTimeout(() => {
    if (emojiSearchInput) emojiSearchInput.focus();
  }, 60);
}

export function closeEmojiPicker(): void {
  const emojiPickerPopover = document.getElementById('emojiPickerPopover');
  if (emojiPickerPopover) {
    emojiPickerPopover.style.display = 'none';
  }
}

export function toggleEmojiPicker(): void {
  const emojiPickerPopover = document.getElementById('emojiPickerPopover');
  if (!emojiPickerPopover) return;
  if (emojiPickerPopover.style.display === 'none' || !emojiPickerPopover.style.display) {
    openEmojiPicker();
  } else {
    closeEmojiPicker();
  }
}
