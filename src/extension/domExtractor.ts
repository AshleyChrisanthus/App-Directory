import { ExtractedPageContext } from './types';

export function extractPageContext(): ExtractedPageContext {
  const url = window.location.href;
  const hostname = window.location.hostname;
  const title = (document.title || hostname).trim();

  // Meta description & open graph
  const metaDesc =
    document.querySelector<HTMLMetaElement>('meta[name="description" i]')?.content ||
    document.querySelector<HTMLMetaElement>('meta[property="og:description" i]')?.content ||
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description" i]')?.content ||
    '';

  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title" i]')?.content;
  const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description" i]')?.content;

  const keywordsMeta = document.querySelector<HTMLMetaElement>('meta[name="keywords" i]')?.content || '';
  const keywords = keywordsMeta
    ? keywordsMeta.split(',').map((k) => k.trim()).filter(Boolean).slice(0, 10)
    : [];

  // Schema.org JSON-LD
  const schemaTypes: string[] = [];
  const schemaSummaries: string[] = [];
  try {
    const jsonLdScripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')
    );
    for (const s of jsonLdScripts.slice(0, 4)) {
      if (!s.textContent) continue;
      try {
        const parsed = JSON.parse(s.textContent);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (!item) continue;
          if (item['@type']) {
            const types = Array.isArray(item['@type']) ? item['@type'] : [item['@type']];
            schemaTypes.push(...types);
          }
          if (item.name || item.description || item.applicationCategory) {
            schemaSummaries.push(
              `[${item['@type'] || 'Item'}] ${item.name || ''} - ${item.applicationCategory || ''} - ${item.description || ''}`
            );
          }
        }
      } catch (_) {}
    }
  } catch (_) {}

  // Headings
  const headings: string[] = [];
  const headingElements = Array.from(
    document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, [role="heading"]')
  );
  for (const h of headingElements) {
    const text = (h.textContent || '').replace(/\s+/g, ' ').trim();
    if (text && text.length > 2 && text.length < 120 && !headings.includes(text)) {
      headings.push(text);
      if (headings.length >= 8) break;
    }
  }

  // Hero section detection
  let heroText = '';
  const heroCandidates = document.querySelectorAll<HTMLElement>(
    '[class*="hero" i] p, [id*="hero" i] p, main p, header p'
  );
  for (const p of Array.from(heroCandidates)) {
    const text = (p.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length > 25 && text.length < 300) {
      heroText = text;
      break;
    }
  }

  // Meaningful Body Text Extraction
  // Prefer main if it has substantive content, otherwise use body
  const mainEl = document.querySelector('main');
  const targetEl = (mainEl && (mainEl.textContent || '').trim().length > 150) ? mainEl : document.body;
  const clone = targetEl.cloneNode(true) as HTMLElement;
  const noisy = clone.querySelectorAll(
    'script, style, noscript, svg, nav, footer, iframe'
  );
  noisy.forEach((el) => el.remove());

  const rawText = (clone.textContent || '').replace(/\s+/g, ' ').trim();
  const bodySummary = rawText.slice(0, 3000);

  // Check if page appears sparse or is an auth wall
  const wordCount = bodySummary.split(/\s+/).filter(Boolean).length;
  const isAuthTitle = /sign in|log in|login|welcome back|authentication/i.test(title);
  const isSparse = wordCount < 40 || (isAuthTitle && wordCount < 80);

  return {
    url,
    hostname,
    title,
    description: metaDesc.trim(),
    keywords,
    ogTitle,
    ogDescription,
    headings,
    heroText,
    bodySummary,
    schemaTypes: Array.from(new Set(schemaTypes)),
    schemaSummary: schemaSummaries.slice(0, 2).join(' | '),
    isSparse
  };
}
