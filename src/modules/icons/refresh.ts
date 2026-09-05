import type { BookmarkEntry } from '../../types';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries } from '../../core/storage';
import { DomainCircuitBreaker, runWorkerQueue, fetchWithBackoff } from '../../core/queue';
import { urlToDataUrl } from '../../utils/icon-converter';
import { ensureProtocol, getDomain, escapeHtml, showToast } from '../../utils/dom';

export function updatePendingIconsUI(): void {
  const count = state.pendingIcons.size;
  const pendingIconsCount = document.getElementById('pendingIconsCount');
  const acceptAllIconsBtn = document.getElementById('acceptAllIconsBtn');
  const dismissAllIconsBtn = document.getElementById('dismissAllIconsBtn');
  const floatingReviewBar = document.getElementById('floatingReviewBar');
  const floatingReviewCount = document.getElementById('floatingReviewCount');
  const floatingReviewPlural = document.getElementById('floatingReviewPlural');

  if (count > 0) {
    if (pendingIconsCount) pendingIconsCount.textContent = String(count);
    if (acceptAllIconsBtn) acceptAllIconsBtn.style.display = 'inline-flex';
    if (dismissAllIconsBtn) dismissAllIconsBtn.style.display = 'inline-flex';

    if (floatingReviewBar) {
      if (floatingReviewCount) floatingReviewCount.textContent = String(count);
      if (floatingReviewPlural) floatingReviewPlural.textContent = count !== 1 ? 's' : '';
      floatingReviewBar.style.display = 'block';
    }
  } else {
    if (acceptAllIconsBtn) acceptAllIconsBtn.style.display = 'none';
    if (dismissAllIconsBtn) dismissAllIconsBtn.style.display = 'none';
    if (floatingReviewBar) floatingReviewBar.style.display = 'none';
  }
}

export function updateCardPendingState(id: string, onUpdate?: () => void): void {
  const grid = document.getElementById('grid');
  if (!grid) return;
  const card = grid.querySelector(`.card[data-id="${id}"]`);
  if (!card) return;

  const pendingIcon = state.pendingIcons.get(id);
  const cardTop = card.querySelector('.card-top');
  let pendingBox = card.querySelector('.card-pending-icon-box') as HTMLElement | null;

  if (pendingIcon) {
    card.classList.add('has-pending-icon');
    if (!pendingBox && cardTop) {
      pendingBox = document.createElement('div');
      pendingBox.className = 'card-pending-icon-box';
      pendingBox.title = 'New icon proposed';
      pendingBox.innerHTML = `
        <span class="pending-badge">New Icon</span>
        <div class="pending-preview-row">
          <div class="card-icon new-icon-preview" title="New icon preview">
            <img src="${escapeHtml(pendingIcon)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">
          </div>
          <button type="button" class="btn-accept accept-icon-btn" title="Accept new icon">✓ Accept</button>
          <button type="button" class="btn btn-ghost dismiss-icon-btn" title="Dismiss new icon">✕</button>
        </div>
      `;
      const acceptBtn = pendingBox.querySelector('.accept-icon-btn');
      if (acceptBtn) {
        acceptBtn.addEventListener('click', e => {
          e.stopPropagation();
          acceptPendingIcon(id, onUpdate);
        });
      }
      const dismissBtn = pendingBox.querySelector('.dismiss-icon-btn');
      if (dismissBtn) {
        dismissBtn.addEventListener('click', e => {
          e.stopPropagation();
          dismissPendingIcon(id, onUpdate);
        });
      }
      cardTop.appendChild(pendingBox);
    }
  } else {
    card.classList.remove('has-pending-icon');
    if (pendingBox) {
      pendingBox.remove();
    }
    const entry = state.entries.find(e => e.id === id);
    if (entry) {
      const iconDiv = card.querySelector('.card-icon:not(.new-icon-preview)');
      if (iconDiv) {
        const iconSrc = entry.icon || (entry as any).iconUrl;
        iconDiv.innerHTML = iconSrc
          ? `<img src="${escapeHtml(iconSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
          : '<span class="icon-fallback">🌐</span>';
      }
    }
  }
}

export async function fetchMultiSourceBestIcon(url: string): Promise<string | null> {
  if (!url) return null;
  const targetUrl = ensureProtocol(url.trim());
  const domain = getDomain(targetUrl);
  if (!domain) return null;

  let origin = '';
  try {
    origin = new URL(targetUrl).origin;
  } catch {
    origin = `https://${domain}`;
  }

  const sources = [
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
      targetUrl
    )}&size=128`,
    `${origin}/apple-touch-icon.png`,
    `https://logo.clearbit.com/${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`
  ];

  for (const src of sources) {
    try {
      const dataUrl = await urlToDataUrl(src);
      if (dataUrl && dataUrl.length > 250) {
        return dataUrl;
      }
    } catch {}
  }

  return null;
}

export async function refreshEntryIcon(id: string, btnElement: HTMLElement | null = null, onUpdate?: () => void): Promise<void> {
  const diskList = getLatestStoredEntries();
  const entry = diskList.find(e => e.id === id);
  if (!entry) return;

  if (btnElement) btnElement.classList.add('is-spinning');
  showToast(`Checking for updated icon for "${entry.name}" across multiple sources...`);

  try {
    const candidateDataUrl = await fetchMultiSourceBestIcon(entry.url);
    const currentIcon = entry.icon || (entry as any).iconUrl;

    if (candidateDataUrl && candidateDataUrl !== currentIcon) {
      state.pendingIcons.set(id, candidateDataUrl);
      updatePendingIconsUI();
      updateCardPendingState(id, onUpdate);
      showToast(`New HD icon found for "${entry.name}"! Click "✓ Accept" to apply.`);
    } else {
      showToast(`Icon for "${entry.name}" is already up to date.`);
    }
  } finally {
    if (btnElement) btnElement.classList.remove('is-spinning');
  }
}

export async function refreshAllIcons(onUpdate?: () => void): Promise<void> {
  const diskList = getLatestStoredEntries();
  if (diskList.length === 0) {
    showToast('No sites to refresh.');
    return;
  }

  const refreshAllBtn = document.getElementById('refreshAllBtn') as HTMLButtonElement | null;
  const refreshProgressBar = document.getElementById('refreshProgressBar');
  const refreshProgressFill = document.getElementById('refreshProgressFill');
  const refreshProgressLabel = document.getElementById('refreshProgressLabel');
  const refreshProgressCount = document.getElementById('refreshProgressCount');
  const refreshBtnLabel = refreshAllBtn ? refreshAllBtn.querySelector('.btn-label') : null;
  const originalBtnText = refreshBtnLabel ? refreshBtnLabel.textContent : 'Refresh Icons';

  if (refreshAllBtn) {
    refreshAllBtn.classList.add('is-loading');
    refreshAllBtn.disabled = true;
  }
  if (refreshProgressBar) {
    refreshProgressBar.style.display = 'block';
    if (refreshProgressFill) refreshProgressFill.style.width = '0%';
    if (refreshProgressCount) refreshProgressCount.textContent = `0 / ${diskList.length}`;
    if (refreshProgressLabel)
      refreshProgressLabel.textContent = 'Checking for updated icons in parallel across multiple sources...';
  }

  let foundCount = 0;
  const concurrency = 4;
  const circuitBreaker = new DomainCircuitBreaker(2);

  await runWorkerQueue(
    diskList,
    concurrency,
    async entry => {
      const domain = getDomain(ensureProtocol(entry.url));
      const candidateDataUrl = await fetchWithBackoff(
        async () => {
          return await fetchMultiSourceBestIcon(entry.url);
        },
        {
          maxRetries: 1,
          baseDelay: 400,
          isTripped: () => circuitBreaker.isTripped(domain)
        }
      );

      const currentIcon = entry.icon || (entry as any).iconUrl;
      if (candidateDataUrl && candidateDataUrl !== currentIcon) {
        state.pendingIcons.set(entry.id, candidateDataUrl);
        foundCount++;
        updatePendingIconsUI();
        updateCardPendingState(entry.id, onUpdate);
      }
    },
    (completed, total) => {
      const pct = Math.round((completed / total) * 100);
      if (refreshProgressFill) refreshProgressFill.style.width = `${pct}%`;
      if (refreshProgressCount) refreshProgressCount.textContent = `${completed} / ${total} (${pct}%)`;
      if (refreshBtnLabel) refreshBtnLabel.textContent = `Checking (${pct}%)...`;
    },
    circuitBreaker
  );

  if (refreshProgressLabel) {
    refreshProgressLabel.textContent =
      foundCount > 0
        ? `Done! Found ${foundCount} new icon update${foundCount !== 1 ? 's' : ''}.`
        : 'Done! All icons are already up to date.';
  }

  setTimeout(() => {
    if (refreshProgressBar) refreshProgressBar.style.display = 'none';
    if (refreshAllBtn) {
      refreshAllBtn.classList.remove('is-loading');
      refreshAllBtn.disabled = false;
      if (refreshBtnLabel) refreshBtnLabel.textContent = originalBtnText;
    }
  }, 1200);

  updatePendingIconsUI();

  if (foundCount > 0) {
    showToast(`Found ${foundCount} new icon update${foundCount !== 1 ? 's' : ''}! Review or click "Accept All".`);
  } else {
    showToast('All icons are already up to date!');
  }
}

export function acceptPendingIcon(id: string, onUpdate?: () => void): void {
  const newIcon = state.pendingIcons.get(id);
  if (!newIcon) return;

  const diskList = getLatestStoredEntries();
  const entry = diskList.find(e => e.id === id);
  if (entry) {
    entry.iconUrl = newIcon;
    delete entry.icon;
    entry.dateModified = new Date().toISOString();
    saveEntries(diskList);
    state.pendingIcons.delete(id);
    updatePendingIconsUI();
    updateCardPendingState(id, onUpdate);
    if (onUpdate) onUpdate();
    showToast(`Icon updated for "${entry.name}"!`);
  }
}

export function dismissPendingIcon(id: string, onUpdate?: () => void): void {
  const diskList = getLatestStoredEntries();
  const entry = diskList.find(e => e.id === id);
  state.pendingIcons.delete(id);
  updatePendingIconsUI();
  updateCardPendingState(id, onUpdate);
  if (entry) {
    showToast(`Dismissed icon update for "${entry.name}".`);
  }
}

export function acceptAllPendingIcons(onUpdate?: () => void): void {
  if (state.pendingIcons.size === 0) return;

  const diskList = getLatestStoredEntries();
  let count = 0;
  const acceptedIds = Array.from(state.pendingIcons.keys());

  for (const [id, newIcon] of state.pendingIcons.entries()) {
    const entry = diskList.find(e => e.id === id);
    if (entry) {
      entry.iconUrl = newIcon;
      delete entry.icon;
      entry.dateModified = new Date().toISOString();
      count++;
    }
  }

  saveEntries(diskList);
  state.pendingIcons.clear();
  updatePendingIconsUI();
  acceptedIds.forEach(id => updateCardPendingState(id, onUpdate));
  if (onUpdate) onUpdate();
  showToast(`Accepted and updated ${count} icon${count !== 1 ? 's' : ''}!`);
}

export function dismissAllPendingIcons(onUpdate?: () => void): void {
  const dismissedIds = Array.from(state.pendingIcons.keys());
  state.pendingIcons.clear();
  updatePendingIconsUI();
  dismissedIds.forEach(id => updateCardPendingState(id, onUpdate));
  showToast('All proposed icon updates dismissed.');
}

export async function cacheExistingIconsOffline(onUpdate?: () => void): Promise<void> {
  const unCached = state.entries.filter(e => {
    const icon = e.icon || (e as any).iconUrl;
    return icon && !icon.startsWith('data:');
  });
  if (unCached.length === 0) return;

  let changed = false;
  await runWorkerQueue(unCached, 8, async (entry) => {
    try {
      const currentIcon = entry.iconUrl || entry.icon;
      const dataUrl = await urlToDataUrl(currentIcon);
      if (dataUrl && dataUrl.startsWith('data:image')) {
        entry.iconUrl = dataUrl;
        delete entry.icon;
        changed = true;
      }
    } catch (_) {}
  });

  if (changed) {
    saveEntries(state.entries);
    if (onUpdate) onUpdate();
  }
}
