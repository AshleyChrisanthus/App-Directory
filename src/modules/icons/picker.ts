import { ensureProtocol, getDomain, escapeHtml } from '../../utils/dom';

export interface IconCandidateSource {
  id: string;
  name: string;
  iconSrc: string;
  tag: string;
}

let selectedCandidateId = 'google';

export function getCandidateSources(url?: string | null, scrapedIconUrl = ''): IconCandidateSource[] {
  if (!url) return [];
  const targetUrl = ensureProtocol(url.trim());
  const domain = getDomain(targetUrl);
  if (!domain) return [];

  let origin = '';
  try {
    origin = new URL(targetUrl).origin;
  } catch {
    origin = `https://${domain}`;
  }

  return [
    {
      id: 'google',
      name: 'Google HD',
      iconSrc: `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(
        targetUrl
      )}&size=128`,
      tag: '🌐'
    },
    {
      id: 'apple',
      name: 'Touch Icon',
      iconSrc: scrapedIconUrl || `${origin}/apple-touch-icon.png`,
      tag: '🍎'
    },
    {
      id: 'ddg',
      name: 'DuckDuckGo',
      iconSrc: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      tag: '🦆'
    },
    {
      id: 'clearbit',
      name: 'Brand Logo',
      iconSrc: `https://logo.clearbit.com/${domain}`,
      tag: '🏢'
    }
  ];
}

export function renderIconCandidates(
  url?: string | null,
  scrapedIconUrl = '',
  forceSelectedId: string | null = null
): void {
  const iconCandidatesGrid = document.getElementById('iconCandidatesGrid');
  const iconCandidatesWrapper = document.getElementById('iconCandidatesWrapper');
  const entryIcon = document.getElementById('entryIcon') as HTMLInputElement | null;
  const entryIconPreview = document.getElementById('entryIconPreview');

  if (!iconCandidatesGrid || !iconCandidatesWrapper) return;
  if (!url || (!url.includes('.') && !url.startsWith('localhost'))) {
    iconCandidatesWrapper.style.display = 'none';
    return;
  }

  const candidates = getCandidateSources(url, scrapedIconUrl);
  if (candidates.length === 0) {
    iconCandidatesWrapper.style.display = 'none';
    return;
  }

  if (forceSelectedId) {
    selectedCandidateId = forceSelectedId;
  } else if (!selectedCandidateId) {
    selectedCandidateId = 'google';
  }

  iconCandidatesWrapper.style.display = 'flex';
  iconCandidatesGrid.innerHTML = '';

  candidates.forEach(cand => {
    const card = document.createElement('div');
    const isActive = cand.id === selectedCandidateId;
    card.className = `icon-candidate-card ${isActive ? 'is-active' : ''}`;
    card.setAttribute('data-candidate-id', cand.id);

    card.innerHTML = `
      ${isActive ? '<div class="candidate-check-badge">✓</div>' : ''}
      <div class="candidate-icon-box">
        <img src="${escapeHtml(cand.iconSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">
      </div>
      <span class="candidate-source-name" title="${cand.name}">${cand.tag} ${cand.name}</span>
    `;

    card.addEventListener('click', e => {
      e.preventDefault();
      selectedCandidateId = cand.id;
      if (entryIcon) entryIcon.value = cand.iconSrc;
      if (entryIconPreview) {
        entryIconPreview.innerHTML = `<img src="${escapeHtml(cand.iconSrc)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'icon-fallback\\'>🌐</span>'">`;
      }
      renderIconCandidates(url, scrapedIconUrl, cand.id);
    });

    iconCandidatesGrid.appendChild(card);
  });
}
