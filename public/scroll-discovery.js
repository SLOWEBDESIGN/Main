/* One invitation per page load. Native scrolling remains completely untouched. */
(() => {
  const initialized = new WeakSet();
  function initializeScrollDiscovery() {
    document.querySelectorAll('[data-scroll-discovery]').forEach(root => {
      if (initialized.has(root)) return;
      initialized.add(root);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const requestedDelay = Number(root.dataset.scrollDelay);
      const delay = Number.isFinite(requestedDelay) && requestedDelay > 0 ? requestedDelay : 5000;
      let timer = 0;
      let endTimer = 0;
      let done = false;
      let animations = [];
      const abort = new AbortController();
      const setState = state => { root.dataset.scrollDiscovery = state; };
      const finish = state => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        clearTimeout(endTimer);
        animations.forEach(animation => animation.cancel());
        animations = [];
        setState(state);
        abort.abort();
        reduced.removeEventListener('change', preference);
      };
      const preference = () => { if (reduced.matches) finish('reduced'); };
      const atStart = () => scrollY <= 8 && (!location.hash || location.hash === '#top');
      const cancel = event => {
        // A cue stays clickable until its native link has started navigating.
        if (event.type === 'pointerdown' && event.target instanceof Element &&
            event.target.closest('[data-scroll-cue]')) return;
        finish('cancelled');
      };
      const run = () => {
        timer = 0;
        if (!root.isConnected || !atStart()) { finish('skipped'); return; }
        if (reduced.matches || root.classList.contains('atelier-motion-paused')) {
          finish('reduced'); return;
        }
        if (document.hidden) return;
        const mobile = matchMedia('(max-width: 700px)').matches;
        if (!mobile) {
          setState('desktop');
          endTimer = setTimeout(() => finish('complete'), 3600);
          return;
        }
        const target = root.matches('[data-scroll-peek]') ? root : root.querySelector('[data-scroll-peek]');
        if (!target || !target.animate) { finish('skipped'); return; }
        setState('mobile');
        const distance = Math.round(Math.min(104, Math.max(64, innerHeight * .11)));
        // Individual translate composes with the site's existing transforms.
        animations.push(target.animate([
          { translate: '0 0', offset: 0, easing: 'cubic-bezier(.22,1,.36,1)' },
          { translate: '0 -' + distance + 'px', offset: .38, easing: 'linear' },
          { translate: '0 -' + distance + 'px', offset: .59, easing: 'cubic-bezier(.65,0,.35,1)' },
          { translate: '0 0', offset: 1 }
        ], { duration: 1700, fill: 'none' }));
        endTimer = setTimeout(() => finish('complete'), 1700);
      };
      const arm = () => {
        clearTimeout(timer);
        if (!done && !document.hidden) timer = setTimeout(run, delay);
      };
      const visibility = () => {
        if (document.hidden) {
          clearTimeout(timer);
          if (root.dataset.scrollDiscovery !== 'waiting') finish('cancelled');
        } else arm();
      };
      if (reduced.matches) { finish('reduced'); return; }
      if (!atStart()) { finish('skipped'); return; }
      ['wheel', 'touchstart', 'pointerdown', 'keydown', 'scroll', 'resize', 'hashchange', 'pagehide']
        .forEach(type => window.addEventListener(type, cancel, { passive: true, signal: abort.signal }));
      document.addEventListener('visibilitychange', visibility, { signal: abort.signal });
      reduced.addEventListener('change', preference);
      arm();
    });
  }
  window.initializeScrollDiscovery = initializeScrollDiscovery;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScrollDiscovery, { once: true });
  } else initializeScrollDiscovery();
})();
