(() => {
  "use strict";

  const MARK = "ordosyn-vote-layout-v1";
  if (window.__ordosynVoteLayoutV1) return;
  window.__ordosynVoteLayoutV1 = true;

  const css = document.createElement("style");
  css.textContent = `
    #app .grid > .card .ordosyn-vote-buttons.${MARK} {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: flex-start !important;
      flex-wrap: nowrap !important;
      gap: 12px !important;
      width: 100% !important;
    }

    #app .grid > .card .${MARK} .ordosyn-vote-down,
    #app .grid > .card .${MARK} .ordosyn-vote-up {
      margin: 0 !important;
      flex: 0 0 auto !important;
      opacity: 1 !important;
      filter: none !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    }

    #app .grid > .card .${MARK} .ordosyn-vote-down {
      color: #e9a2ad !important;
    }

    #app .grid > .card .${MARK} .ordosyn-vote-up {
      color: #75bda0 !important;
    }

    #app .grid > .card .${MARK} .ordosyn-vote-down *,
    #app .grid > .card .${MARK} .ordosyn-vote-up * {
      color: inherit !important;
      stroke: currentColor !important;
    }

    #app .grid > .card .${MARK} .ordosyn-vote-save {
      margin-left: auto !important;
      margin-right: 0 !important;
      flex: 0 0 auto !important;
    }

    .ordosyn-vote-login-overlay {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483640 !important;
      background: rgba(15,23,42,.28) !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      padding: 16px !important;
      box-sizing: border-box !important;
    }

    .ordosyn-vote-login-dialog {
      position: relative !important;
      width: min(390px,100%) !important;
      box-sizing: border-box !important;
      background: white !important;
      border: 2px solid #d1d5db !important;
      border-radius: 20px !important;
      box-shadow: 0 14px 45px rgba(15,23,42,.16) !important;
      padding: 46px 24px 24px !important;
    }

    .ordosyn-vote-login-copy {
      color: #6b7280 !important;
      font-size: 15px !important;
      line-height: 1.6 !important;
      text-align: center !important;
      margin: 0 0 22px !important;
    }

    .ordosyn-vote-login-continue {
      display: block !important;
      width: 100% !important;
      height: 40px !important;
      min-height: 40px !important;
      border: none !important;
      border-radius: 999px !important;
      background: #243653 !important;
      color: #fff !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
    }

    .ordosyn-vote-login-close {
      position: absolute !important;
      top: 10px !important;
      right: 12px !important;
      width: 32px !important;
      height: 32px !important;
      border: none !important;
      border-radius: 50% !important;
      background: transparent !important;
      color: #6b7280 !important;
      cursor: pointer !important;
      font-size: 23px !important;
    }

    .ordosyn-vote-login-close:hover {
      background: #f3f4f6 !important;
    }
  `;
  document.head.appendChild(css);

  function principal() {
    try {
      return typeof window.ordosynCurrentPrincipal === "function"
        ? window.ordosynCurrentPrincipal()
        : "";
    } catch {
      return "";
    }
  }

  const label = el =>
    (el.textContent || "").replace(/\s+/g, " ").trim();

  function findButton(card, word) {
    return Array.from(card.querySelectorAll("button")).find(b =>
      new RegExp("^" + word + "$", "i").test(label(b)) ||
      new RegExp(word, "i").test(b.getAttribute("aria-label") || "")
    );
  }

  function closePrompt() {
    document.querySelector(".ordosyn-vote-login-overlay")?.remove();
  }

  function showPrompt(message, loginRequired) {
    closePrompt();

    const overlay = document.createElement("div");
    overlay.className = "ordosyn-vote-login-overlay";

    const dialog = document.createElement("div");
    dialog.className = "ordosyn-vote-login-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Internet Identity");

    const close = document.createElement("button");
    close.type = "button";
    close.className = "ordosyn-vote-login-close";
    close.textContent = "\u00d7";
    close.setAttribute("aria-label", "Close dialog");
    close.addEventListener("click", closePrompt);

    const copy = document.createElement("p");
    copy.className = "ordosyn-vote-login-copy";
    copy.textContent = message;

    dialog.append(close, copy);

    if (loginRequired) {
      const proceed = document.createElement("button");
      proceed.type = "button";
      proceed.className = "ordosyn-vote-login-continue";
      proceed.textContent = "Continue with Internet Identity";
      proceed.addEventListener("click", () => {
        const login = document.querySelector('#auth [data-act="in"]');
        if (!login) {
          copy.textContent =
            "Please use the account button in the top right to sign in.";
          return;
        }
        closePrompt();
        login.click();
      });
      dialog.appendChild(proceed);
    }

    overlay.appendChild(dialog);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closePrompt();
    });
    document.body.appendChild(overlay);
    close.focus();
  }

  // ORDOSYN_NO_DOM_REORDER_LOOP_V1
  // Move controls only when their order is incorrect.
  function enhance(card) {
    const row = card.querySelector(".ordosyn-vote-buttons");
    if (!row) return;

    const down = findButton(card, "Downvote");
    const up = findButton(card, "Upvote");
    const save = findButton(card, "Save") ||
                 findButton(card, "Saved");

    if (!down || !up) return;

    row.classList.add(MARK);
    down.classList.add("ordosyn-vote-down");
    up.classList.add("ordosyn-vote-up");

    // Preserve the disabled-backend status before enabling clicks.
    // No vote is ever submitted by this script.
    for (const button of [down, up]) {
      if (button.disabled) {
        button.dataset.ordosynVoteBackendUnavailable = "1";
        button.disabled = false;
      }
    }

    if (row.firstElementChild !== down) {
      row.insertBefore(down, row.firstElementChild);
    }
    if (up.parentElement !== row ||
        up.previousElementSibling !== down) {
      row.insertBefore(up, down.nextSibling);
    }

    if (save) {
      save.classList.add("ordosyn-vote-save");
      if (save.parentElement !== row ||
          row.lastElementChild !== save) {
        row.appendChild(save);
      }
    }
  }

  // Capture before legacy vote handlers. Never send a fake vote.
  document.addEventListener("click", event => {
    const button = event.target.closest(
      ".ordosyn-vote-down, .ordosyn-vote-up"
    );
    if (!button || !button.closest("#app .grid > .card")) return;

    if (!principal()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showPrompt(
        "Please sign in with Internet Identity to vote.",
        true
      );
      return;
    }

    if (button.dataset.ordosynVoteBackendUnavailable === "1") {
      event.preventDefault();
      event.stopImmediatePropagation();
      showPrompt(
        "Community voting is not available yet. No vote was submitted.",
        false
      );
    }
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closePrompt();
  });

  function scan() {
    document.querySelectorAll("#app .grid > .card").forEach(enhance);
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  });

  function start() {
    scan();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();