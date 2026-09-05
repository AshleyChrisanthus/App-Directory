export function initTopNavReveal(): void {
  const topNavWrapper = document.getElementById('topNavWrapper');
  const topNavPlaceholder = document.getElementById('topNavPlaceholder');
  const catFilterDropdown = document.getElementById('catFilterDropdown');
  const searchInput = document.getElementById('searchInput');

  if (!topNavWrapper) return;

  let lastScrollY = window.scrollY;
  let isMouseNearTop = false;
  let scrollDeltaAccumulator = 0;
  let isScrollingDown = false;
  let scrollTimeout: any = null;
  let hideAnimationTimer: any = null;
  let staticNavHeight = 135;

  function updateTopNavReveal(): void {
    if (!topNavWrapper) return;
    const scrollY = window.scrollY;

    // Cache un-scrolled height to prevent content jumps
    if (!topNavWrapper.classList.contains('is-scrolled')) {
      staticNavHeight = topNavWrapper.offsetHeight || staticNavHeight;
    }

    const scrollThreshold = staticNavHeight + 20;
    const isScrolled = scrollY > scrollThreshold;

    const delta = scrollY - lastScrollY;
    if (delta > 0) {
      isScrollingDown = true;
      scrollDeltaAccumulator = 0;
    } else if (delta < 0) {
      scrollDeltaAccumulator += Math.abs(delta);
      if (scrollDeltaAccumulator > 15) {
        isScrollingDown = false;
      }
    }

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrollingDown = false;
      scrollDeltaAccumulator = 0;
    }, 150);

    if (isScrolled) {
      if (topNavPlaceholder) {
        topNavPlaceholder.style.height = `${staticNavHeight}px`;
        topNavPlaceholder.style.display = 'block';
      }
      topNavWrapper.classList.add('is-scrolled');

      const isDropdownOpen = catFilterDropdown && catFilterDropdown.classList.contains('open');
      const isSearchFocused = searchInput && document.activeElement === searchInput;

      const shouldReveal =
        isDropdownOpen ||
        isSearchFocused ||
        (!isScrollingDown && isMouseNearTop) ||
        (!isScrollingDown && scrollDeltaAccumulator > 15);

      if (shouldReveal) {
        clearTimeout(hideAnimationTimer);
        topNavWrapper.classList.add('is-animating');
        topNavWrapper.classList.add('is-revealed');
      } else {
        topNavWrapper.classList.remove('is-revealed');
        clearTimeout(hideAnimationTimer);
        hideAnimationTimer = setTimeout(() => {
          if (!topNavWrapper.classList.contains('is-revealed')) {
            topNavWrapper.classList.remove('is-animating');
          }
        }, 280);
      }
    } else {
      clearTimeout(hideAnimationTimer);
      topNavWrapper.classList.remove('is-animating', 'is-revealed', 'is-scrolled');
      if (topNavPlaceholder) {
        topNavPlaceholder.style.display = 'none';
      }
    }
    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', updateTopNavReveal, { passive: true });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!topNavWrapper) return;
    const isRevealed = topNavWrapper.classList.contains('is-revealed');
    const currentHeight = topNavWrapper.offsetHeight || staticNavHeight;
    const threshold = isRevealed ? currentHeight + 25 : 50;

    const wasNear = isMouseNearTop;
    isMouseNearTop = e.clientY <= threshold;

    if (wasNear !== isMouseNearTop && window.scrollY > staticNavHeight + 20 && !isScrollingDown) {
      updateTopNavReveal();
    }
  });

  topNavWrapper.addEventListener('mouseenter', () => {
    isMouseNearTop = true;
    if (window.scrollY > staticNavHeight + 20 && !isScrollingDown) updateTopNavReveal();
  });

  topNavWrapper.addEventListener('mouseleave', (e: MouseEvent) => {
    const currentHeight = topNavWrapper.offsetHeight || staticNavHeight;
    if (e.clientY > currentHeight) {
      isMouseNearTop = false;
      if (window.scrollY > staticNavHeight + 20) updateTopNavReveal();
    }
  });

  window.addEventListener('resize', () => {
    if (topNavWrapper && !topNavWrapper.classList.contains('is-scrolled')) {
      staticNavHeight = topNavWrapper.offsetHeight || staticNavHeight;
    }
  });
}
