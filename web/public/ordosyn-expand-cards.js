(() => {
  "use strict";

  const style = document.createElement("style");
  style.textContent = `
    /* Compact independently sized cards */
    .grid {
      align-items: start !important;
    }

    .grid > .card {
      height: auto !important;
      min-height: 216px;
      align-self: start !important;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 16px;
      border-radius: 16px;
    }

    .grid > .card .acts {
      margin-top: auto;
      padding-top: 6px;
    }

    /* Three-line preview */
    .ordosyn-description-clamped {
      display: -webkit-box !important;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      overflow: hidden;
    }

    .ordosyn-description-clamped.is-expanded {
      display: block !important;
      overflow: visible;
      -webkit-line-clamp: unset;
    }

    .ordosyn-card-toggle {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 5px;
      border: 0;
      background: none;
      padding: 2px 0;
      color: #3269d7;
      font: 500 12px Inter, system-ui, sans-serif;
      cursor: pointer;
    }

    .ordosyn-card-toggle:hover {
      color: #1749ae;
      text-decoration: underline;
    }

    .ordosyn-card-toggle:focus-visible {
      outline: 2px solid #3269d7;
      outline-offset: 3px;
    }

    .ordosyn-card-toggle .chevron {
      display: inline-block;
      transition: transform .18s ease;
    }

    .ordosyn-card-toggle[aria-expanded="true"] .chevron {
      transform: rotate(180deg);
    }

    @media (max-width: 640px) {
      .grid > .card {
        min-height: 0;
      }
    }
  `;
  document.head.appendChild(style);

  function enhance(card) {
    if (card.dataset.ordosynExpandable === "1") return;

    // Only the direct description paragraph, not category or metadata.
    const description = card.querySelector(":scope > p.mute");
    if (!description) return;

    card.dataset.ordosynExpandable = "1";
    description.classList.add("ordosyn-description-clamped");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "ordosyn-card-toggle";
    button.setAttribute("aria-expanded", "false");
    button.hidden = true;

    button.innerHTML =
      '<span>Read more</span><span class="chevron" aria-hidden="true">⌄</span>';

    description.insertAdjacentElement("afterend", button);

    const label = button.querySelector("span");

    button.addEventListener("click", () => {
      const expanded =
        description.classList.toggle("is-expanded");

      button.setAttribute("aria-expanded", String(expanded));
      label.textContent = expanded ? "Show less" : "Read more";
    });

    requestAnimationFrame(() => {
      // Button is only visible when description exceeds 3 lines.
      const overflowing =
        description.scrollHeight > description.clientHeight + 2;

      button.hidden = !overflowing;
    });
  }

  function scan() {
    document.querySelectorAll(".grid > .card").forEach(enhance);
  }

  let scheduled = false;

  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }).observe(document.body, {
    childList: true,
    subtree: true
  });

  scan();
})();