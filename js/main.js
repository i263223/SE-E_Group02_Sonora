/**
 * SONORA — Live Concert Tickets
 * Shared Vanilla JS Utilities:
 *  1. Active navigation link highlighting
 *  2. Quick search redirect to events.html?search=
 *  3. localStorage session check updating Sign In / Sign Up buttons
 *  4. Ticket / cart badge counter updates
 */

(function () {
  "use strict";

  const STORAGE_KEYS = {
    USER: "sonora_user",
    TICKETS: "sonora_tickets",
    CART: "sonora_cart"
  };

  /**
   * Determines whether the current document is located inside the /pages/ directory.
   */
  function isInPagesDirectory() {
    return /\/pages(\/|$)/i.test(window.location.pathname);
  }

  /**
   * Builds a relative URL to a file inside /pages/ regardless of whether
   * the current page is at root or already inside /pages/.
   */
  function getPagePath(filename) {
    return isInPagesDirectory() ? filename : `pages/${filename}`;
  }

  /**
   * Highlights the matching navigation link based on the current page path.
   */
  function highlightActiveNavLink() {
    const currentFile = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll("[data-nav-link]");

    navLinks.forEach((link) => {
      const targetHref = link.getAttribute("href") || "";
      const targetFile = targetHref.split("?")[0].split("/").pop();

      const aliases = (link.dataset.navMatch || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const isMatch =
        targetFile === currentFile || aliases.includes(currentFile);

      if (isMatch) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  /**
   * Wires quick search forms (navbar drawer or any [data-sonora-search-form])
   * to redirect to events.html?search=<encodedQuery>.
   */
  function initQuickSearch() {
    const searchForms = document.querySelectorAll("[data-sonora-search-form]");

    searchForms.forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = form.querySelector('input[type="search"], input[name="search"]');
        const query = input ? input.value.trim() : "";
        const targetUrl = getPagePath("events.html");

        if (query) {
          window.location.href = `${targetUrl}?search=${encodeURIComponent(query)}`;
        } else {
          window.location.href = targetUrl;
        }
      });
    });

    // Auto-focus the search input when the navbar search drawer opens
    const searchCollapseEl = document.getElementById("sonoraSearchDrawer");
    if (searchCollapseEl) {
      searchCollapseEl.addEventListener("shown.bs.collapse", () => {
        const input = searchCollapseEl.querySelector('input[type="search"]');
        if (input) {
          input.focus();
        }
      });
    }
  }

  /**
   * Safely parses JSON from localStorage.
   */
  function readStorageJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  /**
   * Checks localStorage for an active user session and updates
   * the Sign In / Sign Up pill buttons in the navbar.
   */
  function syncAuthButtons() {
    const authContainer = document.getElementById("sonoraAuthActions");
    if (!authContainer) {
      return;
    }

    const storedUser = readStorageJson(STORAGE_KEYS.USER, null);
    const isValidUser =
      storedUser &&
      (typeof storedUser === "string" ||
        (typeof storedUser === "object" && (storedUser.name || storedUser.email)));

    if (!isValidUser) {
      const signInHref = getPagePath("signin.html");
      const signUpHref = getPagePath("signup.html");
      authContainer.innerHTML = `
        <a href="${signInHref}" class="btn btn-sonora-pill btn-sonora-outline">Sign In</a>
        <a href="${signUpHref}" class="btn btn-sonora-pill btn-sonora-primary">Sign Up</a>
      `;
      return;
    }

    const displayName =
      typeof storedUser === "string"
        ? storedUser
        : storedUser.name || storedUser.email.split("@")[0];

    const safeName = escapeHtml(displayName);
    const ticketsHref = getPagePath("my-tickets.html");

    authContainer.innerHTML = `
      <a href="${ticketsHref}" class="btn btn-sonora-pill btn-sonora-outline" title="Signed in as ${safeName}">
        Hi, ${safeName}
      </a>
      <button type="button" id="sonoraSignOutBtn" class="btn btn-sonora-pill btn-sonora-primary">
        Sign Out
      </button>
    `;

    const signOutBtn = document.getElementById("sonoraSignOutBtn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        window.localStorage.removeItem(STORAGE_KEYS.USER);
        syncAuthButtons();
        updateBadgeCounters();
      });
    }
  }

  /**
   * Counts total tickets/cart items stored in localStorage and updates
   * all [data-sonora-ticket-badge] elements.
   */
  function updateBadgeCounters() {
    const badges = document.querySelectorAll("[data-sonora-ticket-badge]");
    if (!badges.length) {
      return;
    }

    const tickets = readStorageJson(STORAGE_KEYS.TICKETS, []);
    const cart = readStorageJson(STORAGE_KEYS.CART, []);

    const sumQuantity = (list) => {
      if (!Array.isArray(list)) {
        return 0;
      }
      return list.reduce((total, item) => {
        const qty =
          item && typeof item.quantity === "number" && item.quantity > 0
            ? item.quantity
            : 1;
        return total + qty;
      }, 0);
    };

    const totalCount = sumQuantity(tickets) + sumQuantity(cart);

    badges.forEach((badge) => {
      badge.textContent = totalCount > 99 ? "99+" : String(totalCount);
      if (totalCount > 0) {
        badge.classList.remove("d-none");
        badge.setAttribute("aria-label", `${totalCount} tickets`);
      } else {
        badge.classList.add("d-none");
        badge.removeAttribute("aria-label");
      }
    });
  }

  /**
   * Escapes HTML special characters to safely render user-supplied strings.
   */
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Updates footer copyright year if an element with [data-sonora-year] exists.
   */
  function updateFooterYear() {
    const yearEl = document.querySelector("[data-sonora-year]");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initSonoraSharedUI() {
    highlightActiveNavLink();
    initQuickSearch();
    syncAuthButtons();
    updateBadgeCounters();
    updateFooterYear();
  }

  // Expose public helpers so subpages can refresh session or badge counts dynamically
  window.SONORA_UI = {
    refreshAuth: syncAuthButtons,
    refreshBadges: updateBadgeCounters,
    getPagePath: getPagePath,
    STORAGE_KEYS: STORAGE_KEYS
  };

  document.addEventListener("DOMContentLoaded", initSonoraSharedUI);

  // Sync UI if localStorage changes in another tab
  window.addEventListener("storage", (event) => {
    if (
      event.key === STORAGE_KEYS.USER ||
      event.key === STORAGE_KEYS.TICKETS ||
      event.key === STORAGE_KEYS.CART
    ) {
      syncAuthButtons();
      updateBadgeCounters();
    }
  });
})();
