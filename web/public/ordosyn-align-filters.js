(() => {
  'use strict';

  let pending = false;
  let current = null;
  let original = '';

  function getTarget() {
    const explore = document.querySelector(
      '#app .ordosyn-explore-sections > section:first-of-type .chips'
    );

    const filtered = document.querySelector(
      '#app #cats > .chips'
    );

    return {
      chips: explore || filtered,
      section: explore
        ? explore.closest('section')
        : filtered
          ? filtered.closest('#cats')
          : null
    };
  }

  function align() {
    pending = false;

    const search = document.getElementById('sf');
    const { chips, section } = getTarget();

    if (current && current !== section && current.isConnected) {
      current.style.marginTop = original;
    }

    if (
      !search ||
      !chips ||
      !section ||
      window.innerWidth < 1024 ||
      window.scrollY > 12
    ) {
      if (current && current.isConnected) {
        current.style.marginTop = original;
      }
      current = null;
      return;
    }

    if (current !== section) {
      current = section;
      original = section.style.marginTop;
    }

    // Measure the original layout before applying the offset.
    section.style.marginTop = original;

    const delta = Math.round(
      search.getBoundingClientRect().top -
      chips.getBoundingClientRect().top
    );

    if (Math.abs(delta) > 1) {
      const base = getComputedStyle(section).marginTop;
      section.style.setProperty(
        'margin-top',
        `calc(${base} + ${delta}px)`,
        'important'
      );
    }
  }

  function schedule() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(align);
    }
  }

  new MutationObserver(schedule).observe(
    document.documentElement,
    { childList: true, subtree: true }
  );

  window.addEventListener('load', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('resize', schedule);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(schedule);
  }

  schedule();
})();