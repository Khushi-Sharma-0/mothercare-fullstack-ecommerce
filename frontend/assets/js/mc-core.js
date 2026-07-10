/* mc-core.js
 * Shared client for the MotherCare backend API.
 * Handles auth session storage, and cart / wishlist / order calls.
 * Include this on every page BEFORE navbar.js and any page-specific script.
 */
(function (global) {
  function resolveApiBase() {
    if (global.MC_API_BASE) return global.MC_API_BASE;
    // If the site is being served BY the backend itself (npm start in
    // backend/, which also serves ../frontend), port will be 4000 and
    // relative /api works. Otherwise (e.g. a separate static server,
    // or opening files directly) fall back to localhost:4000.
    if (window.location.port === "4000") return "/api";
    return window.location.protocol + "//" + window.location.hostname + ":4000/api";
  }

  const API_BASE = resolveApiBase();
  const TOKEN_KEY = "mc_token";
  const USER_KEY = "mc_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }
  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  function currentUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
  function isLoggedIn() {
    return !!getToken();
  }

  async function api(path, options = {}) {
    const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    let res;
    try {
      res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
    } catch (networkErr) {
      throw new Error(
        "Could not reach the MotherCare server at " + API_BASE + ". Is the backend running?"
      );
    }

    let data = null;
    try {
      data = await res.json();
    } catch (e) {
      /* no JSON body */
    }

    if (!res.ok) {
      const err = new Error((data && data.error) || "Something went wrong. Please try again.");
      err.status = res.status;
      throw err;
    }
    return data;
  }

  async function register(name, email, password) {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setSession(data.token, data.user);
    return data.user;
  }

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSession(data.token, data.user);
    return data.user;
  }

  function logout() {
    clearSession();
  }

  function requireLogin(redirectTo) {
    if (!isLoggedIn()) {
      window.location.href = "login.html" + (redirectTo ? "?next=" + encodeURIComponent(redirectTo) : "");
      return false;
    }
    return true;
  }

  async function getProducts(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return api("/products" + (qs ? "?" + qs : ""));
  }

  async function getProduct(id) {
    return api("/products/" + encodeURIComponent(id));
  }

  async function getCart() {
    if (!isLoggedIn()) return [];
    return api("/cart");
  }

  async function addToCart(productId, quantity = 1) {
    if (!isLoggedIn()) {
      alert("Please log in to add items to your cart.");
      window.location.href = "login.html";
      return null;
    }
    const cart = await api("/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) });
    updateBadgeCounts();
    return cart;
  }

  async function updateCartQty(productId, quantity) {
    const cart = await api("/cart/" + encodeURIComponent(productId), {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
    updateBadgeCounts();
    return cart;
  }

  async function removeFromCart(productId) {
    const cart = await api("/cart/" + encodeURIComponent(productId), { method: "DELETE" });
    updateBadgeCounts();
    return cart;
  }

  async function getWishlist() {
    if (!isLoggedIn()) return [];
    return api("/wishlist");
  }

  async function addToWishlist(productId) {
    if (!isLoggedIn()) {
      alert("Please log in to use your wishlist.");
      window.location.href = "login.html";
      return null;
    }
    const list = await api("/wishlist", { method: "POST", body: JSON.stringify({ productId }) });
    updateBadgeCounts();
    return list;
  }

  async function removeFromWishlist(productId) {
    const list = await api("/wishlist/" + encodeURIComponent(productId), { method: "DELETE" });
    updateBadgeCounts();
    return list;
  }

  async function checkout(shipping, paymentMethod) {
    const result = await api("/orders/checkout", {
      method: "POST",
      body: JSON.stringify({ shipping, paymentMethod }),
    });
    updateBadgeCounts();
    return result;
  }

  async function getOrders() {
    return api("/orders");
  }

  async function updateBadgeCounts() {
    try {
      const cartEl = document.getElementById("mc-cart-count");
      const wishEl = document.getElementById("mc-wishlist-count");
      if (!isLoggedIn()) {
        if (cartEl) cartEl.textContent = "0";
        if (wishEl) wishEl.textContent = "0";
        return;
      }
      const [cart, wish] = await Promise.all([getCart(), getWishlist()]);
      const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      if (cartEl) cartEl.textContent = String(cartCount);
      if (wishEl) wishEl.textContent = String(wish.length);
    } catch (e) {
      /* backend may not be running yet — fail quietly */
    }
  }

  global.MC = {
    API_BASE,
    isLoggedIn,
    currentUser,
    requireLogin,
    register,
    login,
    logout,
    getProducts,
    getProduct,
    getCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkout,
    getOrders,
    updateBadgeCounts,
  };
})(window);
