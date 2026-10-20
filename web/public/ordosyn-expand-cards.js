(() => {
  'use strict';
  const css = document.createElement('style');
  css.textContent = `
    .grid:has(> .ordosyn-project-card) {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      align-items: stretch !important;
      gap: 16px;
    }
    .grid > .ordosyn-project-card {
      min-width: 0;
      width: 100%;
      height: 100% !important;
      min-height: 242px;
      align-self: stretch !important;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
      border-radius: 16px;
    }
    .grid > .ordosyn-project-card > p.ordosyn-description-clamped {
      display: -webkit-box !important;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      line-height: 1.55;
      height: 3.1em;
      min-height: 3.1em;
      max-height: 3.1em;
      margin: 0;
    }
    .grid > .ordosyn-project-card .acts {
      margin-top: auto !important;
      padding-top: 8px;
    }
    .ordosyn-card-more-slot { height: 21px; flex: 0 0 21px; }
    .ordosyn-card-toggle {
      display: inline-flex; align-items: center; gap: 4px;
      border: 0; padding: 0; background: transparent;
      color: #3269d7; font: 500 12px Inter,system-ui,sans-serif;
      cursor: pointer;
    }
    .ordosyn-card-toggle[hidden] { display: none !important; }
    .ordosyn-card-toggle:hover { text-decoration: underline; color: #1749ae; }
    .ordosyn-card-toggle:focus-visible { outline: 2px solid #3269d7; outline-offset: 3px; }
    .ordosyn-description-dialog {
      border: 1px solid #e1e5ed; border-radius: 16px;
      padding: 24px; width: min(540px, calc(100vw - 32px));
      max-height: min(75vh, 620px); overflow: auto;
      background: #fff; color: #18202e; box-shadow: 0 20px 70px #10182835;
    }
    .ordosyn-description-dialog::backdrop { background: #10182882; }
    .ordosyn-description-dialog h2 { margin: 0 40px 16px 0; font-size: 18px; }
    .ordosyn-description-dialog p { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.65; }
    .ordosyn-description-close { position: absolute; top: 14px; right: 16px;
      border: 0; border-radius: 8px; padding: 5px 9px; background: #f1f3f7;
      font-size: 18px; cursor: pointer; }
    @media (max-width: 1050px) {
      .grid:has(> .ordosyn-project-card) { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    }
    @media (max-width: 640px) {
      .grid:has(> .ordosyn-project-card) { grid-template-columns: minmax(0, 1fr) !important; }
    }
  `;
  document.head.appendChild(css);

  const dialog = document.createElement('dialog');
  dialog.className = 'ordosyn-description-dialog';
  dialog.innerHTML = '<button type="button" class="ordosyn-description-close" aria-label="Close description">×</button><h2></h2><p></p>';
  const close = dialog.querySelector('button');
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  const attachDialog = () => { if (!dialog.isConnected && document.body) document.body.appendChild(dialog); };

  function measure(card) {
    const desc = card.querySelector(':scope > p.ordosyn-description-clamped');
    const button = card.querySelector('.ordosyn-card-toggle');
    if (!desc || !button) return;
    // The clamped paragraph is always exactly two lines high.
    button.hidden = desc.scrollHeight <= desc.clientHeight + 2;
  }

  function enhance(card) {
    if (card.dataset.ordosynExpandable === '2') return;
    if (!card.querySelector(':scope > .acts')) return;
    const desc = card.querySelector(':scope > p.mute');
    if (!desc) return;
    card.dataset.ordosynExpandable = '2';
    card.classList.add('ordosyn-project-card');
    desc.classList.add('ordosyn-description-clamped');
    const slot = document.createElement('div');
    slot.className = 'ordosyn-card-more-slot';
    const button = document.createElement('button');
    button.className = 'ordosyn-card-toggle';
    button.type = 'button';
    button.textContent = 'Read more ⌄';
    button.hidden = true;
    const heading = card.querySelector('h3')?.textContent?.trim() || 'Project description';
    button.setAttribute('aria-label', `Read full description for ${heading}`);
    button.addEventListener('click', () => {
      attachDialog();
      dialog.querySelector('h2').textContent = heading;
      dialog.querySelector('p').textContent = desc.textContent || '';
      dialog.showModal();
    });
    slot.appendChild(button);
    desc.after(slot);
    requestAnimationFrame(() => measure(card));
  }

  function scan() {
    document.querySelectorAll('.grid > .card').forEach(enhance);
    document.querySelectorAll('.grid > .ordosyn-project-card').forEach(measure);
  }
  let pending = false;
  function queue() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; scan(); });
  }
  function start() {
    attachDialog();
    scan();
    new MutationObserver(queue).observe(document.body, {childList: true, subtree: true});
    window.addEventListener('resize', queue, {passive: true});
    document.fonts?.ready.then(queue).catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();