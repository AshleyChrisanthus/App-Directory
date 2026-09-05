import { DEFAULT_CATEGORIES, CAT_COLORS_KEY, FILTER_MODE_KEY } from '../../core/constants';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries } from '../../core/storage';
import { escapeHtml, showToast } from '../../utils/dom';
import { getCategoryTagStyle } from '../theme/theme';

export function getAllCategories(): string[] {
  const custom = state.entries
    .flatMap(e => e.categories || [])
    .map(c => c.trim())
    .filter(c => c && !DEFAULT_CATEGORIES.includes(c));
  const merged = [...DEFAULT_CATEGORIES, ...custom];
  return [...new Set(merged)];
}

export function updateModeToggleUI(): void {
  const modeUnionBtn = document.getElementById('modeUnionBtn');
  const modeIntersectBtn = document.getElementById('modeIntersectBtn');
  if (modeUnionBtn && modeIntersectBtn) {
    if (state.catFilterMode === 'intersect') {
      modeUnionBtn.classList.remove('active');
      modeIntersectBtn.classList.add('active');
    } else {
      modeUnionBtn.classList.add('active');
      modeIntersectBtn.classList.remove('active');
    }
  }
}

export function updateCatFilterLabel(): void {
  const catFilterLabel = document.getElementById('catFilterLabel');
  const catFilterBtn = document.getElementById('catFilterBtn');
  const catFilterBtnGroup = document.getElementById('catFilterBtnGroup');
  if (!catFilterLabel || !catFilterBtn) return;

  const allCats = getAllCategories();
  const count = state.selectedFilterCategories.size;

  if (count === 0 || (state.catFilterMode === 'union' && count === allCats.length)) {
    catFilterLabel.textContent = 'All Categories';
    catFilterBtn.classList.remove('has-filter');
    if (catFilterBtnGroup) catFilterBtnGroup.classList.remove('has-filter');
    return;
  }

  catFilterBtn.classList.add('has-filter');
  if (catFilterBtnGroup) catFilterBtnGroup.classList.add('has-filter');
  const list = Array.from(state.selectedFilterCategories);

  if (state.catFilterMode === 'intersect') {
    if (count === 1) {
      catFilterLabel.textContent = `${list[0]} (All)`;
    } else if (count === 2) {
      catFilterLabel.textContent = `${list.join(' & ')}`;
    } else {
      catFilterLabel.textContent = `${count} Categories (All)`;
    }
  } else {
    if (count === 1) {
      catFilterLabel.textContent = list[0];
    } else if (count === 2) {
      catFilterLabel.textContent = list.join(', ');
    } else {
      catFilterLabel.textContent = `${count} Categories (Any)`;
    }
  }
}

export function populateCategories(onFilterChanged?: () => void): void {
  const catFilterSearchInput = document.getElementById('catFilterSearchInput') as HTMLInputElement | null;
  const catFilterSearchClearBtn = document.getElementById('catFilterSearchClearBtn');
  const catFilterList = document.getElementById('catFilterList');

  const allCats = getAllCategories();

  const catSet = new Set(allCats);
  for (const selected of state.selectedFilterCategories) {
    if (!catSet.has(selected)) {
      state.selectedFilterCategories.delete(selected);
    }
  }

  const counts: Record<string, number> = {};
  state.entries.forEach(e => {
    (e.categories || []).forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
  });

  const query = catFilterSearchInput ? catFilterSearchInput.value.toLowerCase().trim() : '';
  if (catFilterSearchClearBtn) {
    catFilterSearchClearBtn.style.display = query ? 'inline-flex' : 'none';
  }

  const filteredCats = query ? allCats.filter(cat => cat.toLowerCase().includes(query)) : allCats;

  if (catFilterList) {
    catFilterList.innerHTML = '';
    if (filteredCats.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'dropdown-empty-search';
      empty.textContent = `No categories match "${query}"`;
      catFilterList.appendChild(empty);
    } else {
      filteredCats.forEach(cat => {
        const item = document.createElement('label');
        item.className = 'dropdown-item';
        const isChecked = state.selectedFilterCategories.has(cat);
        const count = counts[cat] || 0;
        item.innerHTML = `
          <input type="checkbox" value="${escapeHtml(cat)}" ${isChecked ? 'checked' : ''}>
          <span class="dropdown-item-name">${escapeHtml(cat)}</span>
          <span class="dropdown-item-count">${count}</span>
        `;
        const cb = item.querySelector('input');
        if (cb) {
          cb.addEventListener('change', () => {
            if (cb.checked) {
              state.selectedFilterCategories.add(cat);
            } else {
              state.selectedFilterCategories.delete(cat);
            }
            updateCatFilterLabel();
            if (onFilterChanged) onFilterChanged();
          });
        }
        catFilterList.appendChild(item);
      });
    }
  }

  updateCatFilterLabel();

  const datalist = document.getElementById('categorySuggestions');
  if (datalist) {
    datalist.innerHTML = '';
    allCats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      datalist.appendChild(opt);
    });
  }
}

export function renderCategoryChips(): void {
  const container = document.getElementById('categoryTags');
  if (!container) return;
  container.innerHTML = '';
  state.selectedCategories.forEach(cat => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip';
    const customStyle = getCategoryTagStyle(cat);
    if (customStyle) {
      const match = customStyle.match(/style="([^"]+)"/);
      if (match) chip.setAttribute('style', match[1]);
    }
    chip.innerHTML = `${escapeHtml(cat)}<button type="button" class="tag-chip-remove" title="Remove">&times;</button>`;
    const removeBtn = chip.querySelector('.tag-chip-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', e => {
        e.stopPropagation();
        state.selectedCategories = state.selectedCategories.filter(c => c !== cat);
        renderCategoryChips();
        renderCategorySuggestions();
      });
    }
    container.appendChild(chip);
  });
}

export let suggestionHighlightedIndex = -1;

export function renderCategorySuggestions(): void {
  const categorySuggestionsPopup = document.getElementById('categorySuggestionsPopup');
  const entryCategory = document.getElementById('entryCategory') as HTMLInputElement | null;
  if (!categorySuggestionsPopup || !entryCategory) return;

  const allCats = getAllCategories();
  const query = entryCategory.value.trim().toLowerCase();

  const available = allCats.filter(cat => !state.selectedCategories.includes(cat));
  const matches = query ? available.filter(cat => cat.toLowerCase().includes(query)) : available;

  const counts: Record<string, number> = {};
  state.entries.forEach(e => {
    (e.categories || []).forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
  });

  categorySuggestionsPopup.innerHTML = '';
  suggestionHighlightedIndex = -1;

  if (matches.length === 0) {
    categorySuggestionsPopup.style.display = 'none';
    return;
  }

  matches.forEach(cat => {
    const count = counts[cat] || 0;
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.innerHTML = `
      <span class="suggestion-name">${escapeHtml(cat)}</span>
      <span class="suggestion-count">${count} site${count !== 1 ? 's' : ''}</span>
    `;
    item.addEventListener('mousedown', e => {
      e.preventDefault();
      addTag(cat);
    });
    categorySuggestionsPopup.appendChild(item);
  });

  categorySuggestionsPopup.style.display = 'flex';
}

export function hideCategorySuggestions(): void {
  const categorySuggestionsPopup = document.getElementById('categorySuggestionsPopup');
  if (categorySuggestionsPopup) {
    categorySuggestionsPopup.style.display = 'none';
    suggestionHighlightedIndex = -1;
  }
}

export function setSuggestionHighlight(newIndex: number): void {
  const categorySuggestionsPopup = document.getElementById('categorySuggestionsPopup');
  if (!categorySuggestionsPopup) return;
  const items = categorySuggestionsPopup.querySelectorAll('.suggestion-item');
  items.forEach(el => el.classList.remove('is-focused'));
  if (items.length === 0) {
    suggestionHighlightedIndex = -1;
    return;
  }
  if (newIndex < 0) {
    suggestionHighlightedIndex = items.length - 1;
  } else if (newIndex >= items.length) {
    suggestionHighlightedIndex = 0;
  } else {
    suggestionHighlightedIndex = newIndex;
  }
  const target = items[suggestionHighlightedIndex] as HTMLElement | undefined;
  if (target) {
    target.classList.add('is-focused');
    target.scrollIntoView({ block: 'nearest' });
  }
}

export function addTag(val?: string | null): void {
  const clean = (val || '').trim();
  if (clean && !state.selectedCategories.includes(clean)) {
    state.selectedCategories.push(clean);
    renderCategoryChips();
  }
  const entryCategory = document.getElementById('entryCategory') as HTMLInputElement | null;
  if (entryCategory) {
    entryCategory.value = '';
  }
  hideCategorySuggestions();
}

export function getUsedCategories(): [string, number][] {
  const counts: Record<string, number> = {};
  state.entries.forEach(e => {
    (e.categories || []).forEach(cat => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
}
