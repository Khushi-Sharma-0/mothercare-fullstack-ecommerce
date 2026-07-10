/* navbar.js
 * Injects a single consistent toolbar (search, wishlist, cart, login/account)
 * at the very top of <body> on every page. Include AFTER mc-core.js.
 */
(function () {
  function init() {
    const bar = document.createElement("div");
    bar.id = "mc-toolbar";
    bar.innerHTML = `
      <div class="mc-toolbar-inner">
        <a class="mc-brand" href="Home_Page_New.html">🍼 MotherCare</a>
        <form class="mc-search-form" id="mc-search-form" role="search">
          <input type="text" id="mc-search-input" placeholder="Search for toys, clothes, feeding bottles..." autocomplete="off" />
          <button type="submit" aria-label="Search">🔍</button>
        </form>
        <div class="mc-toolbar-actions">
          <a href="wishlist.html" class="mc-action">🤍 Wishlist<span class="mc-badge" id="mc-wishlist-count">0</span></a>
          <a href="cart.html" class="mc-action">🛒 Cart<span class="mc-badge" id="mc-cart-count">0</span></a>
          <span id="mc-auth-area"></span>
        </div>
      </div>`;
    document.body.insertBefore(bar, document.body.firstChild);

    const form = document.getElementById("mc-search-form");
    const input = document.getElementById("mc-search-input");

    const params = new URLSearchParams(window.location.search);
    if (params.get("q") && window.location.pathname.toLowerCase().includes("search")) {
      input.value = params.get("q");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = input.value.trim();
      window.location.href = "search.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });

    renderAuthArea();
    if (window.MC) window.MC.updateBadgeCounts();
  }

  function renderAuthArea() {
    const area = document.getElementById("mc-auth-area");
    const user = window.MC ? window.MC.currentUser() : null;
    if (user) {
      area.innerHTML =
        '<span class="mc-action mc-hello">👋 ' +
        escapeHtml(user.name.split(" ")[0]) +
        '</span><a href="#" id="mc-logout-link" class="mc-action">Logout</a>';
      document.getElementById("mc-logout-link").addEventListener("click", function (e) {
        e.preventDefault();
        window.MC.logout();
        window.location.href = "Home_Page_New.html";
      });
    } else {
      area.innerHTML =
        '<a href="login.html" class="mc-action">Login</a><a href="register.html" class="mc-action mc-action-primary">Register</a>';
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
