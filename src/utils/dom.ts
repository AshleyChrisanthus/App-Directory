import { KNOWN_APP_ICONS } from '../core/constants';

const shortDateFormatter =
  typeof Intl !== 'undefined'
    ? new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

const fullDateFormatter =
  typeof Intl !== 'undefined'
    ? new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

const shortDateCache = new Map<string, string>();
const fullDateCache = new Map<string, string>();
const domainCache = new Map<string, string>();

export function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showToast(message: string, duration = 3000): void {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

export function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const cached = shortDateCache.get(iso);
  if (cached) return cached;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '—';
  const formatted = shortDateFormatter
    ? shortDateFormatter.format(ts)
    : new Date(ts).toLocaleDateString();
  shortDateCache.set(iso, formatted);
  return formatted;
}

export function formatDateFull(iso?: string | null): string {
  if (!iso) return '—';
  const cached = fullDateCache.get(iso);
  if (cached) return cached;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '—';
  const formatted = fullDateFormatter
    ? fullDateFormatter.format(ts)
    : new Date(ts).toLocaleString();
  fullDateCache.set(iso, formatted);
  return formatted;
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function ensureProtocol(url?: string | null): string {
  if (!url) return '';
  let clean = url.trim();
  if (!/^https?:\/\//i.test(clean)) {
    clean = 'https://' + clean;
  }
  return clean;
}

export function getDomain(url?: string | null): string {
  if (!url) return '';
  const cached = domainCache.get(url);
  if (cached !== undefined) return cached;
  try {
    const host = new URL(ensureProtocol(url)).hostname;
    domainCache.set(url, host);
    return host;
  } catch {
    domainCache.set(url, url);
    return url;
  }
}

export function getFaviconUrl(url?: string | null): string {
  if (!url) return '';
  try {
    const full = ensureProtocol(url);

    // Check known web apps first (e.g. NotebookLM, Gemini, Docs, Drive, etc.)
    for (const entry of KNOWN_APP_ICONS) {
      if (entry.test(full)) {
        return entry.icon;
      }
    }

    // Use Google FaviconV2 high-resolution service with full URL
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
      full
    )}&size=128`;
  } catch {
    return '';
  }
}
