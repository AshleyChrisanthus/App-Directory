import { getDomain } from './dom';

export interface WebsiteMetadata {
  title: string;
  description: string;
  iconUrl: string;
  url: string;
}

export function cleanPageTitle(rawTitle?: string | null, domain = ''): string {
  if (!rawTitle) return '';
  let title = rawTitle.trim();
  if (typeof document !== 'undefined') {
    try {
      const txt = document.createElement('textarea');
      txt.innerHTML = title;
      if (txt.value) {
        title = txt.value;
      }
    } catch {}
  }

  if (domain) {
    const cleanDom = domain.replace(/^www\./i, '').split('.')[0];
    const regexes = [
      new RegExp(`\\s*[-|–—•·]\\s*${cleanDom}.*$`, 'i'),
      new RegExp(`^${cleanDom}\\s*[-|–—•·]\\s*`, 'i')
    ];
    for (const r of regexes) {
      if (title.length > 20 && r.test(title)) {
        title = title.replace(r, '').trim();
      }
    }
  }
  return title.replace(/\s+/g, ' ').trim();
}

export function fallbackTitleFromUrl(url: string): string {
  try {
    const domain = getDomain(url);
    if (!domain) return '';
    const parts = domain.replace(/^www\./i, '').split('.');
    const main = parts[0] || '';
    return main.charAt(0).toUpperCase() + main.slice(1);
  } catch {
    return '';
  }
}

export function cleanDescription(rawDesc?: string | null): string {
  if (!rawDesc) return '';
  let desc = rawDesc.trim();
  if (typeof document !== 'undefined') {
    try {
      const txt = document.createElement('textarea');
      txt.innerHTML = desc;
      if (txt.value) desc = txt.value;
    } catch {}
  }
  return desc.replace(/\s+/g, ' ').trim();
}

export async function fetchWebsiteMetadata(url: string): Promise<WebsiteMetadata | null> {
  if (!url) return null;
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  const domain = getDomain(targetUrl);

  // 1. Primary Engine: Microlink API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const mUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(mUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.status === 'success' && json.data) {
        const rawTitle = json.data.title || '';
        const cleanedTitle = cleanPageTitle(rawTitle, domain) || fallbackTitleFromUrl(targetUrl);
        const rawDesc = json.data.description || '';
        const description = cleanDescription(rawDesc);
        const scrapedIcon = json.data.logo?.url || json.data.icon?.url || '';

        if (cleanedTitle || description) {
          return {
            title: cleanedTitle,
            description,
            iconUrl: scrapedIcon,
            url: targetUrl
          };
        }
      }
    }
  } catch {}

  // 2. Secondary Engine: Codetabs HTML CORS Proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      let html = '';
      if (typeof res.text === 'function') {
        try { html = await res.text(); } catch {}
      }
      if (!html && typeof res.json === 'function') {
        try {
          const j = await res.json();
          if (j && typeof j.contents === 'string') html = j.contents;
        } catch {}
      }
      if (html && html.length > 50) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const twTitle = doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
        const docTitle = doc.querySelector('title')?.textContent;
        const rawTitle = ogTitle || twTitle || docTitle || '';
        const cleanedTitle = cleanPageTitle(rawTitle, domain) || fallbackTitleFromUrl(targetUrl);

        const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
        const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
        const twDesc = doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
        const description = cleanDescription(ogDesc || metaDesc || twDesc || '');

        const iconLink =
          doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href') ||
          doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
          doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href');
        let resolvedIcon = '';
        if (iconLink) {
          try {
            resolvedIcon = new URL(iconLink, targetUrl).href;
          } catch {}
        }

        if (cleanedTitle || description) {
          return {
            title: cleanedTitle,
            description,
            iconUrl: resolvedIcon,
            url: targetUrl
          };
        }
      }
    }
  } catch {}

  // 3. Fallback: Local domain title formatting
  const fallbackTitle = fallbackTitleFromUrl(targetUrl);
  return {
    title: fallbackTitle,
    description: '',
    iconUrl: '',
    url: targetUrl
  };
}
