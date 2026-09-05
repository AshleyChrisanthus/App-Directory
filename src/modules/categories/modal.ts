import { CAT_COLORS_KEY } from '../../core/constants';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries } from '../../core/storage';
import { escapeHtml, showToast } from '../../utils/dom';
import { getUsedCategories } from './manager';

export function openCatModal(): void {
  const catModalBackdrop = document.getElementById('catModalBackdrop');
  const catModalSearchInput = document.getElementById('catModalSearchInput') as HTMLInputElement | null;
  const catModalSearchClearBtn = document.getElementById('catModalSearchClearBtn');

  if (catModalSearchInput) {
    catModalSearchInput.value = '';
  }
  if (catModalSearchClearBtn) {
    catModalSearchClearBtn.style.display = 'none';
  }
  renderCatList('');
  if (catModalBackdrop) {
    catModalBackdrop.classList.add('active');
  }
  document.body.style.overflow = 'hidden';
  if (catModalSearchInput) {
    setTimeout(() => catModalSearchInput.focus(), 60);
  }
}

export function closeCatModal(): void {
  const catModalBackdrop = document.getElementById('catModalBackdrop');
  if (catModalBackdrop) {
    catModalBackdrop.classList.remove('active');
  }
  document.body.style.overflow = '';
}

export function renameCategory(oldName: string, newName: string, onUpdate?: () => void): void {
  newName = newName.trim();
  if (!newName || newName === oldName) return;

  const diskList = getLatestStoredEntries();
  let updated = 0;
  diskList.forEach(entry => {
    const idx = (entry.categories || []).indexOf(oldName);
    if (idx !== -1) {
      if (entry.categories.includes(newName)) {
        entry.categories.splice(idx, 1);
      } else {
        entry.categories[idx] = newName;
      }
      (entry as any).dateModified = new Date().toISOString();
      updated++;
    }
  });

  if (updated > 0) {
    if (state.selectedFilterCategories.has(oldName)) {
      state.selectedFilterCategories.delete(oldName);
      state.selectedFilterCategories.add(newName);
    }
    if (state.categoryColors[oldName.toLowerCase()]) {
      state.categoryColors[newName.toLowerCase()] = state.categoryColors[oldName.toLowerCase()];
      delete state.categoryColors[oldName.toLowerCase()];
      localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
    }
    saveEntries(diskList);
    if (onUpdate) onUpdate();
    showToast(`Renamed "${oldName}" → "${newName}" (${updated} site${updated !== 1 ? 's' : ''} updated)`);
  }
}

export function deleteCategory(catName: string, onUpdate?: () => void): void {
  const diskList = getLatestStoredEntries();
  const count = diskList.filter(e => (e.categories || []).includes(catName)).length;
  if (!confirm(`Remove "${catName}" from ${count} site${count !== 1 ? 's' : ''}?`)) return;

  diskList.forEach(entry => {
    entry.categories = (entry.categories || []).filter(c => c !== catName);
    (entry as any).dateModified = new Date().toISOString();
  });

  if (state.categoryColors[catName.toLowerCase()]) {
    delete state.categoryColors[catName.toLowerCase()];
    localStorage.setItem(CAT_COLORS_KEY, JSON.stringify(state.categoryColors));
  }

  state.selectedFilterCategories.delete(catName);
  saveEntries(diskList);
  if (onUpdate) onUpdate();
  showToast(`Deleted category "${catName}"`);

  const catModalSearchInput = document.getElementById('catModalSearchInput') as HTMLInputElement | null;
  const q = catModalSearchInput ? catModalSearchInput.value : '';
  renderCatList(q, onUpdate);
}

export function renderCatList(query = '', onUpdate?: () => void): void {
  const catList = document.getElementById('catList');
  const catEmptyMsg = document.getElementById('catEmptyMsg');
  if (!catList) return;

  const allUsed = getUsedCategories();
  const cleanQuery = (typeof query === 'string' ? query : '').toLowerCase().trim();
  const filtered = cleanQuery ? allUsed.filter(([name]) => name.toLowerCase().includes(cleanQuery)) : allUsed;

  catList.innerHTML = '';

  if (allUsed.length === 0) {
    if (catEmptyMsg) {
      catEmptyMsg.textContent = 'No categories in use yet. Add categories to your bookmarks to manage them here.';
      catEmptyMsg.style.display = 'block';
    }
    return;
  }

  if (filtered.length === 0) {
    if (catEmptyMsg) {
      catEmptyMsg.textContent = `No categories match "${cleanQuery}"`;
      catEmptyMsg.style.display = 'block';
    }
    return;
  }

  if (catEmptyMsg) catEmptyMsg.style.display = 'none';

  filtered.forEach(([name, count]) => {
    const row = document.createElement('div');
    row.className = 'cat-manager-row';
    row.setAttribute('data-cat-name', name);
    if (row.dataset) row.dataset.catName = name;

    const isFiltered = state.selectedFilterCategories.has(name);
    const filterBtnTitle = isFiltered ? 'Currently active filter' : 'Filter by this category';

    row.innerHTML = `
      <div class="cat-manager-info">
        <span class="cat-manager-name">${escapeHtml(name)}</span>
        <span class="cat-manager-count">${count} site${count !== 1 ? 's' : ''}</span>
      </div>
      <div class="cat-manager-actions">
        <button type="button" class="btn btn-icon btn-sm cat-action-filter ${isFiltered ? 'active' : ''}" title="${filterBtnTitle}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        </button>
        <button type="button" class="btn btn-icon btn-sm cat-action-edit" title="Rename category">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button type="button" class="btn btn-icon btn-sm cat-action-delete" title="Delete category from all sites">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `;

    const filterBtn = row.querySelector('.cat-action-filter');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        if (state.selectedFilterCategories.has(name)) {
          state.selectedFilterCategories.delete(name);
        } else {
          state.selectedFilterCategories.add(name);
        }
        if (onUpdate) onUpdate();
        closeCatModal();
      });
    }

    const editBtn = row.querySelector('.cat-action-edit');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const newName = prompt(`Rename "${name}" to:`, name);
        if (newName && newName.trim() && newName.trim() !== name) {
          renameCategory(name, newName.trim(), onUpdate);
          renderCatList(query, onUpdate);
        }
      });
    }

    const deleteBtn = row.querySelector('.cat-action-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        deleteCategory(name, onUpdate);
      });
    }

    catList.appendChild(row);
  });
}
