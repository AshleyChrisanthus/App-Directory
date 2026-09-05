import type { BookmarkEntry } from '../../types';
import { state } from '../../core/state';
import { getAllCategories } from '../categories/manager';

export function getFilteredEntries(): BookmarkEntry[] {
  const searchInput = document.getElementById('searchInput') as HTMLInputElement | null;
  const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement | null;
  const query = (searchInput?.value || '').toLowerCase().trim();
  const sortVal = sortSelect?.value || 'dateAdded-desc';
  const [sortField, sortDir] = sortVal.split('-');

  let filtered = [...state.entries];

  // Search
  if (query) {
    filtered = filtered.filter(e =>
      (e.name || '').toLowerCase().includes(query) ||
      (e.url || '').toLowerCase().includes(query) ||
      (e.description || '').toLowerCase().includes(query)
    );
  }

  // Multi-Category Filter (Union vs Intersection)
  const allCats = getAllCategories();
  if (state.selectedFilterCategories.size > 0) {
    if (state.catFilterMode === 'intersect') {
      const required = Array.from(state.selectedFilterCategories);
      filtered = filtered.filter(e => {
        const entryCats = e.categories || [];
        return required.every(reqCat => entryCats.includes(reqCat));
      });
    } else {
      // Union: match ANY selected category
      if (state.selectedFilterCategories.size < allCats.length) {
        filtered = filtered.filter(e =>
          (e.categories || []).some(cat => state.selectedFilterCategories.has(cat))
        );
      }
    }
  }

  // Active Folder / Collection Filter
  if (state.activeFolderId === 'favorites') {
    filtered = filtered.filter(e => e.isFavorite);
  } else if (state.activeFolderId === 'unorganized') {
    filtered = filtered.filter(e => !e.folderId);
  } else if (state.activeFolderId === 'broken') {
    filtered = filtered.filter(e => e.health && e.health.status === 'broken');
  } else if (state.activeFolderId && state.activeFolderId !== 'all') {
    filtered = filtered.filter(e => e.folderId === state.activeFolderId);
  }

  // Sort
  filtered.sort((a, b) => {
    // Favorites pinned to top only if pinFavorites is enabled
    if (state.pinFavorites) {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
    }

    let valA: string | number, valB: string | number;

    if (sortField === 'name') {
      valA = (a.name || '').toLowerCase();
      valB = (b.name || '').toLowerCase();
      const cmp = valA.localeCompare(valB);
      return sortDir === 'asc' ? cmp : -cmp;
    }

    if (sortField === 'visitCount') {
      valA = a.visitCount || 0;
      valB = b.visitCount || 0;
      return sortDir === 'desc' ? valB - valA : valA - valB;
    }

    if (sortField === 'lastVisited') {
      valA = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
      valB = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
      return sortDir === 'desc' ? valB - valA : valA - valB;
    }

    // dateAdded (default)
    valA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
    valB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
    return sortDir === 'desc' ? valB - valA : valA - valB;
  });

  return filtered;
}

export function updatePinFavoritesButtonState(): void {
  const pinFavoritesBtn = document.getElementById('pinFavoritesBtn');
  if (!pinFavoritesBtn) return;
  pinFavoritesBtn.classList.toggle('active', state.pinFavorites);
  pinFavoritesBtn.setAttribute('aria-pressed', String(state.pinFavorites));
  pinFavoritesBtn.title = state.pinFavorites
    ? 'Favorites pinned to top (Click to restore natural sort)'
    : 'Pin favorites to the top of the list';
}
