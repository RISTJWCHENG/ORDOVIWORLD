(() => {
  const STYLE_ID = 'ordosyn-favorites-login-dialog-style';

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .ordosyn-fav-login-dialog {
        position: relative !important;
        width: min(440px, calc(100vw - 32px)) !important;
        border-radius: 20px !important;
        background: #ffffff !important;
        border: 1px solid #0f1f3d !important;
        box-shadow: 0 18px 60px rgba(15, 23, 42, 0.18) !important;
        padding: 28px 24px 24px !important;
        box-sizing: border-box !important;
      }

      .ordosyn-fav-login-close {
        position: absolute !important;
        top: 12px !important;
        right: 12px !important;
        width: 34px !important;
        height: 34px !important;
        border: 0 !important;
        background: transparent !important;
        color: #6b7280 !important;
        font-size: 24px !important;
        line-height: 1 !important;
        cursor: pointer !important;
        border-radius: 999px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: background-color 160ms ease, color 160ms ease !important;
      }

      .ordosyn-fav-login-close:hover {
        background: #f3f4f6 !important;
        color: #111827 !important;
      }

      .ordosyn-fav-login-copy {
        margin: 8px 0 0 0 !important;
        text-align: center !important;
        color: #6b7280 !important;
        font-size: 16px !important;
        line-height: 1.65 !important;
      }

      .ordosyn-fav-login-actions {
        display: flex !important;
        justify-content: center !important;
        margin-top: 22px !important;
      }

      .ordosyn-fav-login-actions button {
        min-width: 300px !important;
        height: 40px !important;
        min-height: 40px !important;
        border-radius: 999px !important;
        border: 1px solid #0f1f3d !important;
        background: #0f1f3d !important;
        color: #ffffff !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: opacity 160ms ease, transform 160ms ease !important;
      }

      .ordosyn-fav-login-actions button:hover {
        opacity: 0.92 !important;
        transform: translateY(-1px) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function textOf(el) {
    return (el?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findCandidateDialogs() {
    const nodes = Array.from(
      document.querySelectorAll('[role="dialog"], dialog, .modal, .popup, .sheet')
    );

    return nodes.filter(node => {
      const t = textOf(node).toLowerCase();
      return (
        t.includes('internet identity') &&
        (t.includes('my favorites') || t.includes('save this app'))
      );
    });
  }

  function closeDialog(dialog) {
    const closeLike = Array.from(dialog.querySelectorAll('button')).find(btn => {
      const txt = textOf(btn);
      const label = btn.getAttribute('aria-label') || '';
      return /cancel|close|×|✕/i.test(txt) || /close/i.test(label);
    });

    if (closeLike && !closeLike.classList.contains('ordosyn-fav-login-close')) {
      closeLike.click();
      return;
    }

    const overlay = dialog.parentElement;
    if (overlay && overlay !== document.body) {
      overlay.remove();
      return;
    }

    dialog.remove();
  }

  function patchDialog(dialog) {
    if (!dialog || dialog.dataset.ordosynFavLoginPatched === '1') return;

    injectStyle();

    const allButtons = Array.from(dialog.querySelectorAll('button'));
    const continueBtn = allButtons.find(btn =>
      /internet identity|continue/i.test(textOf(btn))
    );

    if (!continueBtn) return;

    dialog.dataset.ordosynFavLoginPatched = '1';
    dialog.classList.add('ordosyn-fav-login-dialog');

    const cancelBtn = allButtons.find(btn => /^cancel$/i.test(textOf(btn)));
    if (cancelBtn) cancelBtn.remove();

    const oldHeading = Array.from(dialog.querySelectorAll('h1,h2,h3,h4,strong')).find(el =>
      /sign in|save|favorites/i.test(textOf(el))
    );
    if (oldHeading) oldHeading.remove();

    let copyEl = Array.from(dialog.querySelectorAll('p,div,span')).find(el =>
      /please sign in with internet identity to save this app to my favorites/i.test(textOf(el))
    );

    if (!copyEl) {
      copyEl = document.createElement('p');
      copyEl.textContent =
        'Please sign in with Internet Identity to save it.';
      dialog.insertBefore(copyEl, continueBtn);
    } else {
      copyEl.textContent =
        'Please sign in with Internet Identity to save it.';
    }

    copyEl.className = 'ordosyn-fav-login-copy';

    let closeBtn = dialog.querySelector('.ordosyn-fav-login-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'ordosyn-fav-login-close';
      closeBtn.setAttribute('aria-label', 'Close dialog');
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => closeDialog(dialog));
      dialog.appendChild(closeBtn);
    }

    let actionWrap = continueBtn.closest('.ordosyn-fav-login-actions');
    if (!actionWrap) {
      actionWrap = document.createElement('div');
      actionWrap.className = 'ordosyn-fav-login-actions';
      continueBtn.parentNode.insertBefore(actionWrap, continueBtn);
      actionWrap.appendChild(continueBtn);
    }

    continueBtn.textContent = 'Continue with Internet Identity';
  }

  function scan() {
    findCandidateDialogs().forEach(patchDialog);
  }

  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan, { once: true });
  } else {
    scan();
  }

  window.addEventListener('load', scan, { once: true });
})();