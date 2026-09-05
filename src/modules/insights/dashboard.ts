import { INSIGHTS_STATE_KEY } from '../../core/constants';
import { state } from '../../core/state';
import { escapeHtml, timeAgo, getDomain, showToast } from '../../utils/dom';
import { getAllCategories, updateCatFilterLabel } from '../categories/manager';

let savedOnVisit: ((id: string) => void) | null = null;
let savedOnDelete: ((id: string) => void) | null = null;
let savedOnFilterChanged: (() => void) | null = null;

export function toggleInsightsDrawer(
  openState?: boolean,
  onVisit?: (id: string) => void,
  onDelete?: (id: string) => void,
  onFilterChanged?: () => void
): void {
  if (typeof onVisit === 'function') savedOnVisit = onVisit;
  if (typeof onDelete === 'function') savedOnDelete = onDelete;
  if (typeof onFilterChanged === 'function') savedOnFilterChanged = onFilterChanged;

  const insightsToggleBtn = document.getElementById('insightsToggleBtn');
  const insightsDrawer = document.getElementById('insightsDrawer');

  if (typeof openState === 'boolean') {
    state.isInsightsOpen = openState;
  } else {
    state.isInsightsOpen = !state.isInsightsOpen;
  }

  localStorage.setItem(INSIGHTS_STATE_KEY, String(state.isInsightsOpen));

  if (insightsToggleBtn) {
    insightsToggleBtn.classList.toggle('active', state.isInsightsOpen);
    insightsToggleBtn.setAttribute('aria-expanded', String(state.isInsightsOpen));
  }

  if (insightsDrawer) {
    insightsDrawer.style.display = state.isInsightsOpen ? 'block' : 'none';
  }

  if (state.isInsightsOpen) {
    renderInsightsDashboard(savedOnVisit || undefined, savedOnDelete || undefined, savedOnFilterChanged || undefined);
  }
}

export function renderInsightsDashboard(
  onVisit?: (id: string) => void,
  onDelete?: (id: string) => void,
  onFilterChanged?: () => void
): void {
  if (typeof onVisit === 'function') savedOnVisit = onVisit;
  if (typeof onDelete === 'function') savedOnDelete = onDelete;
  if (typeof onFilterChanged === 'function') savedOnFilterChanged = onFilterChanged;

  const effectiveOnVisit = onVisit || savedOnVisit;
  const effectiveOnDelete = onDelete || savedOnDelete;
  const effectiveOnFilterChanged = onFilterChanged || savedOnFilterChanged;

  const insightsDrawer = document.getElementById('insightsDrawer');
  const insightsHeaderStats = document.getElementById('insightsHeaderStats');
  const insightsBody = document.getElementById('insightsBody');
  const catFilterList = document.getElementById('catFilterList');
  const grid = document.getElementById('grid');
  const activeCatFilterBanner = document.getElementById('activeCatFilterBanner');

  if (!insightsDrawer || !state.isInsightsOpen) return;

  const totalSites = state.entries.length;
  let totalLaunches = 0;
  state.entries.forEach(e => {
    totalLaunches += e.visitCount || 0;
  });

  const allCats = getAllCategories();
  const totalFolders = state.folders.length;

  if (insightsHeaderStats) {
    insightsHeaderStats.innerHTML = `
      <div class="insights-stat-pill" title="Total saved bookmarks">
        <span>Sites:</span>
        <span class="insights-stat-num">${totalSites}</span>
      </div>
      <div class="insights-stat-pill" title="Total launches / clicks">
        <span>Launches:</span>
        <span class="insights-stat-num">${totalLaunches}</span>
      </div>
      <div class="insights-stat-pill" title="Unique categories">
        <span>Categories:</span>
        <span class="insights-stat-num">${allCats.length}</span>
      </div>
      <div class="insights-stat-pill" title="Folders created">
        <span>Folders:</span>
        <span class="insights-stat-num">${totalFolders}</span>
      </div>
    `;
  }

  if (!insightsBody) return;

  const visitedSites = [...state.entries]
    .filter(e => (e.visitCount || 0) > 0)
    .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
    .slice(0, 6);

  const recentlyAdded = [...state.entries]
    .sort((a, b) => new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime())
    .slice(0, 5);

  const catCounts: Record<string, number> = {};
  let totalCatAssignments = 0;
  state.entries.forEach(e => {
    (e.categories || []).forEach(c => {
      catCounts[c] = (catCounts[c] || 0) + 1;
      totalCatAssignments++;
    });
  });

  const sortedCats = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);

  const now = Date.now();
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
  const dormantEntries = state.entries
    .filter(e => {
      if (e.lastVisited) {
        return now - new Date(e.lastVisited).getTime() > NINETY_DAYS_MS;
      }
      if (e.dateAdded) {
        return now - new Date(e.dateAdded).getTime() > NINETY_DAYS_MS && (!e.visitCount || e.visitCount === 0);
      }
      return false;
    })
    .slice(0, 5);

  let html = `<div class="insights-grid">`;

  // Widget 1: Speed Dial
  html += `
    <div class="insight-widget">
      <div class="insight-widget-header">
        <div class="insight-widget-title">
          <span>⚡</span>
          <span>Speed Dial (Top Visited)</span>
        </div>
        <span class="insight-widget-badge">${visitedSites.length} site${visitedSites.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="speed-dial-grid">
  `;

  if (visitedSites.length === 0) {
    html += `
      <div style="grid-column: 1/-1; padding: 16px 8px; text-align: center; color: var(--text-tertiary); font-size: 0.8rem;">
        No visits recorded yet. Launch websites from your directory to populate your Speed Dial!
      </div>
    `;
  } else {
    visitedSites.forEach(site => {
      const siteIcon = site.iconUrl || site.icon;
      html += `
        <div class="speed-dial-card" data-id="${escapeHtml(site.id)}" title="Launch ${escapeHtml(
        site.name
      )} (${site.visitCount} visits)">
          <div class="speed-dial-icon">
            ${
              siteIcon
                ? `<img src="${escapeHtml(siteIcon)}" alt="" onerror="this.parentElement.innerHTML='🌐'">`
                : '🌐'
            }
          </div>
          <div class="speed-dial-info">
            <span class="speed-dial-name">${escapeHtml(site.name)}</span>
            <span class="speed-dial-visits">🚀 ${site.visitCount} visit${site.visitCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>
  `;

  // Widget 2: Recently Added
  html += `
    <div class="insight-widget">
      <div class="insight-widget-header">
        <div class="insight-widget-title">
          <span>🕒</span>
          <span>Recently Added</span>
        </div>
        <span class="insight-widget-badge">Latest ${recentlyAdded.length}</span>
      </div>
      <div class="recent-list">
  `;

  if (recentlyAdded.length === 0) {
    html += `
      <div style="padding: 16px 8px; text-align: center; color: var(--text-tertiary); font-size: 0.8rem;">
        No websites saved yet.
      </div>
    `;
  } else {
    recentlyAdded.forEach(site => {
      const domain = getDomain(site.url);
      const siteIcon = site.iconUrl || site.icon;
      html += `
        <div class="recent-item" data-id="${escapeHtml(site.id)}" title="Open ${escapeHtml(site.name)}">
          <div class="recent-left">
            <div class="recent-icon">
              ${
                siteIcon
                  ? `<img src="${escapeHtml(siteIcon)}" alt="" onerror="this.parentElement.innerHTML='🌐'">`
                  : '🌐'
              }
            </div>
            <div>
              <div class="recent-name">${escapeHtml(site.name)}</div>
              <div class="recent-domain">${escapeHtml(domain)}</div>
            </div>
          </div>
          <span class="recent-date">${timeAgo(site.dateAdded)}</span>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>
  `;

  // Widget 3: Category Distribution
  const hasCategoryFilter =
    state.selectedFilterCategories.size > 0 && state.selectedFilterCategories.size < allCats.length;

  html += `
    <div class="insight-widget">
      <div class="insight-widget-header">
        <div class="insight-widget-title">
          <span>🏷️</span>
          <span>Category Distribution</span>
          ${
            hasCategoryFilter
              ? `<button type="button" class="category-dist-clear-btn" id="catDistClearBtn" title="Reset filter to show all categories">✕ Clear</button>`
              : ''
          }
        </div>
        <span class="insight-widget-badge">${sortedCats.length} active</span>
      </div>
      <div>
  `;

  if (sortedCats.length === 0) {
    html += `
      <div style="padding: 16px 8px; text-align: center; color: var(--text-tertiary); font-size: 0.8rem;">
        No categories assigned to bookmarks yet.
      </div>
    `;
  } else {
    html += `<div class="category-dist-bar" title="Category distribution share">`;
    sortedCats.forEach(cat => {
      const count = catCounts[cat];
      const pct = totalCatAssignments > 0 ? ((count / totalCatAssignments) * 100).toFixed(1) : '0';
      const color = (state.categoryColors && state.categoryColors[cat.toLowerCase()]) || 'var(--accent)';
      const isSelected = state.selectedFilterCategories.has(cat);
      const segmentClasses = ['category-dist-segment'];
      if (hasCategoryFilter) {
        if (isSelected) segmentClasses.push('is-active');
        else segmentClasses.push('is-dimmed');
      }
      html += `
        <div class="${segmentClasses.join(' ')}" data-cat="${escapeHtml(cat)}" style="width: ${pct}%; background-color: ${escapeHtml(
        color
      )};" title="${escapeHtml(cat)}: ${count} (${pct}%) ${
        isSelected ? '• Currently filtered (Click to clear)' : '• Click to filter'
      }"></div>
      `;
    });
    html += `</div>`;

    html += `<div class="category-chips-list">`;
    sortedCats.forEach(cat => {
      const count = catCounts[cat];
      const pct = totalCatAssignments > 0 ? Math.round((count / totalCatAssignments) * 100) : 0;
      const color = (state.categoryColors && state.categoryColors[cat.toLowerCase()]) || 'var(--accent)';
      const isSelected = state.selectedFilterCategories.has(cat);
      const chipClasses = ['category-chip-item'];
      if (hasCategoryFilter) {
        if (isSelected) chipClasses.push('is-active');
        else chipClasses.push('is-dimmed');
      }
      html += `
        <div class="${chipClasses.join(' ')}" data-cat="${escapeHtml(cat)}" style="--cat-accent: ${escapeHtml(
        color
      )};" title="${isSelected ? 'Active filter (Click to reset)' : 'Filter by ' + escapeHtml(cat)}">
          <span class="category-chip-dot" style="background-color: ${escapeHtml(color)};"></span>
          ${isSelected ? '<span class="category-chip-check">✓</span>' : ''}
          <span class="category-chip-name">${escapeHtml(cat)}</span>
          <span class="category-chip-count">(${count})</span>
          <span class="category-chip-pct">${pct}%</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `
      </div>
    </div>
  `;

  // Widget 4: Dormant Bookmarks
  html += `
    <div class="insight-widget">
      <div class="insight-widget-header">
        <div class="insight-widget-title">
          <span>💤</span>
          <span>Dormant Links (90+ Days)</span>
        </div>
        <span class="insight-widget-badge">${dormantEntries.length} found</span>
      </div>
      <div class="dormant-list">
  `;

  if (dormantEntries.length === 0) {
    html += `
      <div class="dormant-empty-badge">
        <span>✨</span>
        <span>All clear! No dormant bookmarks unvisited for 90+ days.</span>
      </div>
    `;
  } else {
    dormantEntries.forEach(entry => {
      const days = entry.lastVisited
        ? Math.floor((now - new Date(entry.lastVisited).getTime()) / (24 * 60 * 60 * 1000))
        : Math.floor((now - new Date(entry.dateAdded).getTime()) / (24 * 60 * 60 * 1000));
      const reason = entry.lastVisited ? `Not visited in ${days}d` : `Never visited (${days}d old)`;

      html += `
        <div class="dormant-item" data-id="${escapeHtml(entry.id)}">
          <div class="dormant-left">
            <span style="font-size: 1rem;">💤</span>
            <div>
              <div class="dormant-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
              <div class="dormant-reason">${escapeHtml(reason)}</div>
            </div>
          </div>
          <div class="dormant-actions">
            <button type="button" class="btn btn-secondary dormant-action-btn dormant-visit-btn" data-id="${escapeHtml(
              entry.id
            )}" title="Launch website">Visit</button>
            <button type="button" class="btn btn-danger dormant-action-btn dormant-delete-btn" data-id="${escapeHtml(
              entry.id
            )}" title="Delete bookmark">Delete</button>
          </div>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>
  `;

  html += `</div>`; // Close .insights-grid

  insightsBody.innerHTML = html;

  // Event handlers
  insightsBody.querySelectorAll('.speed-dial-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      if (id && effectiveOnVisit) effectiveOnVisit(id);
    });
  });

  insightsBody.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      if (id && effectiveOnVisit) effectiveOnVisit(id);
    });
  });

  const handleCatFilterClick = (cat: string | null) => {
    if (!cat) return;
    if (state.selectedFilterCategories.has(cat) && state.selectedFilterCategories.size === 1) {
      state.selectedFilterCategories.clear();
      if (catFilterList) {
        catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => ((cb as HTMLInputElement).checked = false));
      }
      updateCatFilterLabel();
      if (effectiveOnFilterChanged) effectiveOnFilterChanged();
      renderInsightsDashboard(effectiveOnVisit || undefined, effectiveOnDelete || undefined, effectiveOnFilterChanged || undefined);
      showToast('Cleared category filter');
      return;
    }

    state.selectedFilterCategories.clear();
    state.selectedFilterCategories.add(cat);
    if (catFilterList) {
      catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        const input = cb as HTMLInputElement;
        input.checked = input.value === cat;
      });
    }
    updateCatFilterLabel();
    if (effectiveOnFilterChanged) effectiveOnFilterChanged();
    renderInsightsDashboard(effectiveOnVisit || undefined, effectiveOnDelete || undefined, effectiveOnFilterChanged || undefined);
    showToast(`Filtered by category: ${cat}`);

    setTimeout(() => {
      const firstItem = grid ? grid.querySelector('.card, .table-row, .icon-card') : null;
      if (firstItem) {
        firstItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (activeCatFilterBanner) {
        activeCatFilterBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  insightsBody.querySelectorAll('.category-dist-segment').forEach(seg => {
    seg.addEventListener('click', () => {
      handleCatFilterClick(seg.getAttribute('data-cat'));
    });
  });

  insightsBody.querySelectorAll('.category-chip-item').forEach(chip => {
    chip.addEventListener('click', () => {
      handleCatFilterClick(chip.getAttribute('data-cat'));
    });
  });

  const catDistClearBtn = insightsBody.querySelector('#catDistClearBtn');
  if (catDistClearBtn) {
    catDistClearBtn.addEventListener('click', e => {
      e.stopPropagation();
      state.selectedFilterCategories.clear();
      if (catFilterList) {
        catFilterList.querySelectorAll('input[type="checkbox"]').forEach(cb => ((cb as HTMLInputElement).checked = false));
      }
      updateCatFilterLabel();
      if (effectiveOnFilterChanged) effectiveOnFilterChanged();
      renderInsightsDashboard(effectiveOnVisit || undefined, effectiveOnDelete || undefined, effectiveOnFilterChanged || undefined);
      showToast('Cleared category filter');
    });
  }

  insightsBody.querySelectorAll('.dormant-visit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (id && effectiveOnVisit) effectiveOnVisit(id);
    });
  });

  insightsBody.querySelectorAll('.dormant-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (id && effectiveOnDelete) effectiveOnDelete(id);
    });
  });
}
