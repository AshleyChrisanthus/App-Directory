import { CAT_COLORS_KEY } from '../../core/constants';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries } from '../../core/storage';
import { escapeHtml, showToast } from '../../utils/dom';
import { getCategoryTagStyle } from '../theme/theme';
import { getUsedCategories } from './manager';

let catModalUpdateCallback: (() => void) | null = null;

export function openCatModal(onUpdate?: () => void): void {
  if (typeof onUpdate === 'function') {
    catModalUpdateCallback = onUpdate;
  }
  const catModalBackdrop = document.getElementById('catModalBackdrop');
  const catModalSearchInput = document.getElementById('catModalSearchInput') as HTMLInputElement | null;
  const catModalSearchClearBtn = document.getElementById('catModalSearchClearBtn');

  if (catModalSearchInput) {
    catModalSearchInput.value = '';
  }
  if (catModalSearchClearBtn) {
    catModalSearchClearBtn.style.display = 'none';
  }
  renderCatList('', catModalUpdateCallback || undefined);
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
    const cb = onUpdate || catModalUpdateCallback;
    if (cb) cb();
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
  const cb = onUpdate || catModalUpdateCallback;
  if (cb) cb();
  showToast(`Deleted category "${catName}"`);

  const catModalSearchInput = document.getElementById('catModalSearchInput') as HTMLInputElement | null;
  const q = catModalSearchInput ? catModalSearchInput.value : '';
  renderCatList(q, cb || undefined);
}

export function renderCatList(query = '', onUpdate?: () => void): void {
  if (typeof onUpdate === 'function') {
    catModalUpdateCallback = onUpdate;
  }
  const effectiveCallback = onUpdate || catModalUpdateCallback;

  const catList = document.getElementById('catList');
  const catEmptyMsg = document.getElementById('catEmptyMsg');
  const catModalSearchInput = document.getElementById('catModalSearchInput') as HTMLInputElement | null;
  const catModalSearchClearBtn = document.getElementById('catModalSearchClearBtn');

  if (!catList) return;

  const allUsed = getUsedCategories();
  const cleanQuery = (typeof query === 'string' ? query : '').toLowerCase().trim();

  if (catModalSearchClearBtn) {
    catModalSearchClearBtn.style.display = cleanQuery ? 'inline-flex' : 'none';
  }

  const filtered = cleanQuery ? allUsed.filter(([name]) => name.toLowerCase().includes(cleanQuery)) : allUsed;

  catList.innerHTML = '';

  if (allUsed.length === 0) {
    if (catEmptyMsg) {
      catEmptyMsg.textContent = 'No categories in use yet.';
      catEmptyMsg.style.display = 'block';
    }
    return;
  }

  if (filtered.length === 0) {
    if (catEmptyMsg) {
      catEmptyMsg.textContent = `No categories match "${cleanQuery}".`;
      catEmptyMsg.style.display = 'block';
    }
    return;
  }

  if (catEmptyMsg) catEmptyMsg.style.display = 'none';

  filtered.forEach(([cat, count]) => {
    const row = document.createElement('div');
    row.className = 'cat-row';
    row.innerHTML = `
      <span class="cat-row-name" ${getCategoryTagStyle(cat)} style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:600;">${escapeHtml(cat)}</span>
      <span class="cat-row-count">${count} site${count !== 1 ? 's' : ''}</span>
      <div class="cat-row-actions">
        <button class="btn btn-ghost rename-btn" title="Rename">✏️</button>
        <button class="btn btn-danger delete-btn" title="Delete">🗑️</button>
      </div>
    `;

    // Inline Rename
    const renameBtn = row.querySelector('.rename-btn');
    if (renameBtn) {
      renameBtn.addEventListener('click', () => {
        const nameEl = row.querySelector('.cat-row-name');
        const actionsEl = row.querySelector('.cat-row-actions');
        if (!nameEl || !actionsEl) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cat-row-input';
        input.value = cat;
        nameEl.replaceWith(input);
        input.focus();
        input.select();

        actionsEl.innerHTML = `
          <button class="btn btn-primary btn-sm save-rename-btn">Save</button>
          <button class="btn btn-ghost btn-sm cancel-rename-btn">Cancel</button>
        `;

        const doSave = () => {
          const newVal = input.value.trim();
          if (newVal && newVal !== cat) {
            renameCategory(cat, newVal, effectiveCallback || undefined);
          }
          const q = catModalSearchInput ? catModalSearchInput.value : '';
          renderCatList(q, effectiveCallback || undefined);
        };

        const doCancel = () => {
          const q = catModalSearchInput ? catModalSearchInput.value : '';
          renderCatList(q, effectiveCallback || undefined);
        };

        const saveBtn = actionsEl.querySelector('.save-rename-btn');
        const cancelBtn = actionsEl.querySelector('.cancel-rename-btn');
        if (saveBtn) saveBtn.addEventListener('click', doSave);
        if (cancelBtn) cancelBtn.addEventListener('click', doCancel);

        input.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            doSave();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            doCancel();
          }
        });
      });
    }

    // Delete
    const deleteBtn = row.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        deleteCategory(cat, effectiveCallback || undefined);
      });
    }

    catList.appendChild(row);
  });
}
