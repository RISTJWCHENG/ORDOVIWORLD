(() => {
  "use strict";

  function enhance(card) {
    if (card.querySelector(".ordosyn-heart-pill")) return;
    if (!card.querySelector(".acts")) return;

    const link = card.querySelector('a[href*="#/app/"]');
    const key = link?.getAttribute("href") ||
                card.querySelector("h3")?.textContent?.trim();

    if (!key) return;

    const storeKey = "ordosyn-liked:" + key;
    const button = document.createElement("button");

    button.type = "button";
    button.className = "ordosyn-heart-pill";
    button.setAttribute("aria-label", "Like project");
    button.title = "Personal favorite - saved on this device";

    let liked = false;
    try {
      liked = localStorage.getItem(storeKey) === "1";
    } catch {}

    function render() {
      button.textContent = liked ? "\u2665" : "\u2661";
      button.setAttribute("aria-pressed", String(liked));
      button.setAttribute(
        "aria-label",
        liked ? "Remove from favorites" : "Add to favorites"
      );
    }

    button.addEventListener("click", () => {
      liked = !liked;
      try {
        localStorage.setItem(storeKey, liked ? "1" : "0");
      } catch {}
      render();
    });

    render();
    card.appendChild(button);
  }

  function scan() {
    document.querySelectorAll(".grid > .card").forEach(enhance);
  }

  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
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