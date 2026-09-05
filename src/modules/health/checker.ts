import type { BookmarkHealth } from '../../types';
import { state } from '../../core/state';
import { getLatestStoredEntries, saveEntries } from '../../core/storage';
import { DomainCircuitBreaker } from '../../core/queue';
import { getDomain, escapeHtml, showToast, timeAgo } from '../../utils/dom';

let isHealthScanning = false;
let healthAbortRequested = false;
let healthFilter = 'all'; // 'all', 'broken', 'healthy', 'untested'
let healthSearchQuery = '';
let currentlyCheckingIds = new Set<string>();

export async function checkUrlHealth(url?: string | null): Promise<BookmarkHealth> {
  if (!url) {
    return {
      status: 'broken',
      error: 'Empty URL',
      code: null,
      lastChecked: new Date().toISOString()
    };
  }

  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    await fetch(targetUrl, {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-cache'
    });
    clearTimeout(timeoutId);
    return {
      status: 'healthy',
      code: 200,
      error: null,
      lastChecked: new Date().toISOString()
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    try {
      const domain = getDomain(targetUrl);
      if (domain) {
        const imgAlive = await new Promise<boolean>(resolve => {
          const img = new Image();
          const timer = setTimeout(() => resolve(false), 2500);
          img.onload = () => {
            clearTimeout(timer);
            resolve(true);
          };
          img.onerror = () => {
            clearTimeout(timer);
            resolve(false);
          };
          img.src = `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
            targetUrl
          )}&size=32`;
        });
        if (imgAlive) {
          return {
            status: 'healthy',
            code: 200,
            error: null,
            lastChecked: new Date().toISOString()
          };
        }
      }
    } catch {}

    const isAborted = err.name === 'AbortError';
    return {
      status: 'broken',
      code: isAborted ? 408 : 0,
      error: isAborted ? 'Connection timed out (6s)' : 'DNS error or host unreachable',
      lastChecked: new Date().toISOString()
    };
  }
}

export function openHealthModal(onEditRequested?: (id: string) => void): void {
  healthSearchQuery = '';
  healthFilter = 'all';

  const healthSearchInput = document.getElementById('healthSearchInput') as HTMLInputElement | null;
  const healthSearchClear = document.getElementById('healthSearchClear');
  const healthFilterPills = document.getElementById('healthFilterPills');
  const healthModalBackdrop = document.getElementById('healthModalBackdrop');

  if (healthSearchInput) healthSearchInput.value = '';
  if (healthSearchClear) healthSearchClear.style.display = 'none';

  if (healthFilterPills) {
    healthFilterPills.querySelectorAll('.pill-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-health') === 'all');
    });
  }

  updateHealthSummaryCards();
  renderHealthModalList(onEditRequested);

  if (healthModalBackdrop) {
    healthModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeHealthModal(): void {
  if (isHealthScanning) {
    stopHealthScan();
  }
  const healthModalBackdrop = document.getElementById('healthModalBackdrop');
  if (healthModalBackdrop) {
    healthModalBackdrop.classList.remove('active');
  }
  document.body.style.overflow = '';
}

export function updateHealthSummaryCards(): void {
  const list = getLatestStoredEntries();
  const total = list.length;
  const healthy = list.filter(e => e.health && e.health.status === 'healthy').length;
  const broken = list.filter(e => e.health && e.health.status === 'broken').length;
  const untested = list.filter(e => !e.health || e.health.status === 'untested').length;

  const healthStatTotal = document.getElementById('healthStatTotal');
  const healthStatHealthy = document.getElementById('healthStatHealthy');
  const healthStatBroken = document.getElementById('healthStatBroken');
  const healthStatUntested = document.getElementById('healthStatUntested');

  if (healthStatTotal) healthStatTotal.textContent = String(total);
  if (healthStatHealthy) healthStatHealthy.textContent = String(healthy);
  if (healthStatBroken) healthStatBroken.textContent = String(broken);
  if (healthStatUntested) healthStatUntested.textContent = String(untested);
}

export function getFilteredHealthEntries() {
  const list = getLatestStoredEntries();
  let res = [...list];

  if (healthFilter === 'broken') {
    res = res.filter(e => e.health && e.health.status === 'broken');
  } else if (healthFilter === 'healthy') {
    res = res.filter(e => e.health && e.health.status === 'healthy');
  } else if (healthFilter === 'untested') {
    res = res.filter(e => !e.health || e.health.status === 'untested');
  }

  if (healthSearchQuery) {
    const q = healthSearchQuery.toLowerCase();
    res = res.filter(
      e => (e.name || '').toLowerCase().includes(q) || (e.url || '').toLowerCase().includes(q)
    );
  }

  return res;
}

export function renderHealthModalList(
  onEditRequested?: (id: string) => void,
  onDeleteRequested?: (id: string) => void,
  onUpdate?: () => void
): void {
  const healthList = document.getElementById('healthList');
  const healthEmpty = document.getElementById('healthEmpty');
  if (!healthList) return;

  const filtered = getFilteredHealthEntries();
  updateHealthSummaryCards();

  if (filtered.length === 0) {
    healthList.innerHTML = '';
    if (healthEmpty) healthEmpty.style.display = 'block';
    return;
  }

  if (healthEmpty) healthEmpty.style.display = 'none';
  healthList.innerHTML = '';

  filtered.forEach(entry => {
    const row = document.createElement('div');
    const isChecking = currentlyCheckingIds.has(entry.id);
    const isBroken = !isChecking && entry.health && entry.health.status === 'broken';
    const isHealthy = !isChecking && entry.health && entry.health.status === 'healthy';

    row.className = `health-item-row ${isBroken ? 'is-broken' : ''}`;

    let statusBadgeHtml = '<span class="health-status-badge untested">⚪ Untested</span>';
    if (isChecking) {
      statusBadgeHtml = '<span class="health-status-badge checking">⚡ Testing…</span>';
    } else if (isHealthy) {
      statusBadgeHtml = `<span class="health-status-badge healthy" title="Tested ${
        entry.health?.lastChecked ? timeAgo(entry.health.lastChecked) : ''
      }">🟢 Healthy</span>`;
    } else if (isBroken) {
      statusBadgeHtml = `<span class="health-status-badge broken" title="${escapeHtml(
        entry.health?.error || 'Dead link'
      )}">⚠️ ${escapeHtml(entry.health?.error || 'Broken')}</span>`;
    }

    const domain = getDomain(entry.url);
    const iconSrc = entry.icon || '';
    const iconHtml = iconSrc
      ? `<img src="${escapeHtml(
          iconSrc
        )}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`
      : '<span class="icon-fallback">🌐</span>';

    row.innerHTML = `
      <div class="health-item-left">
        <div class="health-item-icon">
          ${iconHtml}
        </div>
        <div class="health-item-info">
          <div class="health-item-name">${escapeHtml(entry.name)}</div>
          <div class="health-item-url">${escapeHtml(domain || entry.url)}</div>
        </div>
      </div>
      <div class="health-item-right">
        ${statusBadgeHtml}
        <div class="health-actions-cell">
          <button type="button" class="health-action-btn health-retest-btn" title="Re-test this link">🔄</button>
          <button type="button" class="health-action-btn health-edit-btn" title="Edit website URL">✏️</button>
          <button type="button" class="health-action-btn health-visit-btn" title="Open website in new tab">↗️</button>
          <button type="button" class="health-action-btn btn-delete health-delete-btn" title="Delete bookmark">🗑️</button>
        </div>
      </div>
    `;

    const retestBtn = row.querySelector('.health-retest-btn');
    if (retestBtn) {
      retestBtn.addEventListener('click', e => {
        e.stopPropagation();
        testSingleBookmarkHealth(entry.id, onUpdate);
      });
    }

    const editBtn = row.querySelector('.health-edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', e => {
        e.stopPropagation();
        closeHealthModal();
        if (onEditRequested) onEditRequested(entry.id);
      });
    }

    const visitBtn = row.querySelector('.health-visit-btn');
    if (visitBtn) {
      visitBtn.addEventListener('click', e => {
        e.stopPropagation();
        window.open(entry.url, '_blank', 'noopener,noreferrer');
      });
    }

    const deleteBtn = row.querySelector('.health-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm(`Delete bookmark "${entry.name}"?`)) {
          if (onDeleteRequested) onDeleteRequested(entry.id);
          renderHealthModalList(onEditRequested, onDeleteRequested, onUpdate);
        }
      });
    }

    healthList.appendChild(row);
  });
}

export async function testSingleBookmarkHealth(entryId: string, onUpdate?: () => void): Promise<void> {
  const diskList = getLatestStoredEntries();
  const entry = diskList.find(e => e.id === entryId);
  if (!entry) return;

  currentlyCheckingIds.add(entryId);
  renderHealthModalList();

  const result = await checkUrlHealth(entry.url);
  entry.health = result;
  (entry as any).dateModified = new Date().toISOString();

  currentlyCheckingIds.delete(entryId);
  saveEntries(diskList);
  renderHealthModalList(undefined, undefined, onUpdate);
  if (onUpdate) onUpdate();
  showToast(`"${entry.name}": ${result.status === 'healthy' ? '🟢 Healthy' : '⚠️ ' + result.error}`);
}

export async function startHealthScan(onlyBroken = false, onUpdate?: () => void): Promise<void> {
  if (isHealthScanning) return;
  const diskList = getLatestStoredEntries();
  let targets = diskList;
  if (onlyBroken) {
    targets = diskList.filter(e => e.health && e.health.status === 'broken');
  }

  if (targets.length === 0) {
    showToast('No links match the scan criteria.');
    return;
  }

  isHealthScanning = true;
  healthAbortRequested = false;

  const healthProgressWrap = document.getElementById('healthProgressWrap');
  const healthStopBtn = document.getElementById('healthStopBtn');
  const healthScanAllBtn = document.getElementById('healthScanAllBtn') as HTMLButtonElement | null;
  const healthScanBrokenBtn = document.getElementById('healthScanBrokenBtn') as HTMLButtonElement | null;
  const healthProgressFill = document.getElementById('healthProgressFill');
  const healthProgressPercent = document.getElementById('healthProgressPercent');
  const healthProgressStatusText = document.getElementById('healthProgressStatusText');

  if (healthProgressWrap) healthProgressWrap.style.display = 'flex';
  if (healthStopBtn) healthStopBtn.style.display = 'inline-flex';
  if (healthScanAllBtn) healthScanAllBtn.disabled = true;
  if (healthScanBrokenBtn) healthScanBrokenBtn.disabled = true;

  const total = targets.length;
  let completed = 0;

  const queue = [...targets];
  const workerCount = Math.min(4, queue.length);
  const circuitBreaker = new DomainCircuitBreaker(2);

  async function worker(): Promise<void> {
    while (queue.length > 0 && !healthAbortRequested) {
      const item = queue.shift();
      if (!item) break;

      const domain = getDomain(item.url);
      currentlyCheckingIds.add(item.id);
      renderHealthModalList();

      let healthRes: BookmarkHealth;
      if (domain && circuitBreaker.isTripped(domain)) {
        healthRes = {
          status: 'broken',
          code: 0,
          error: 'Host circuit breaker tripped (consecutive failures)',
          lastChecked: new Date().toISOString()
        };
      } else {
        healthRes = await checkUrlHealth(item.url);
        if (healthRes.status === 'healthy' && domain) {
          circuitBreaker.recordSuccess(domain);
        } else if (healthRes.status === 'broken' && domain) {
          circuitBreaker.recordFailure(domain);
        }
      }

      item.health = healthRes;
      (item as any).dateModified = new Date().toISOString();
      currentlyCheckingIds.delete(item.id);
      completed++;

      const pct = Math.round((completed / total) * 100);
      if (healthProgressFill) healthProgressFill.style.width = `${pct}%`;
      if (healthProgressPercent) healthProgressPercent.textContent = `${pct}%`;
      if (healthProgressStatusText) {
        healthProgressStatusText.textContent = `Testing (${completed}/${total}): ${item.name}…`;
      }

      renderHealthModalList();
    }
  }

  const workers = Array.from({ length: workerCount }, () => worker());
  await Promise.all(workers);

  saveEntries(diskList);
  isHealthScanning = false;

  if (healthProgressWrap) healthProgressWrap.style.display = 'none';
  if (healthStopBtn) healthStopBtn.style.display = 'none';
  if (healthScanAllBtn) healthScanAllBtn.disabled = false;
  if (healthScanBrokenBtn) healthScanBrokenBtn.disabled = false;

  currentlyCheckingIds.clear();
  renderHealthModalList(undefined, undefined, onUpdate);
  if (onUpdate) onUpdate();

  const brokenCount = diskList.filter(e => e.health && e.health.status === 'broken').length;
  if (healthAbortRequested) {
    showToast(`Health scan cancelled. Tested ${completed}/${total} links.`);
  } else {
    showToast(`Health check complete! ${brokenCount} broken link${brokenCount !== 1 ? 's' : ''} identified.`);
  }
}

export function stopHealthScan(): void {
  healthAbortRequested = true;
}

export function setHealthSearchQuery(q: string): void {
  healthSearchQuery = q;
}

export function setHealthFilter(filter: string): void {
  healthFilter = filter;
}

