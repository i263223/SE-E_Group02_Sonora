/* =========================================================
   Sonora - Organizer / Host Page Script (js/organizer.js)
   Handles:
     1. Mobile Hamburger Menu Toggle
     2. Live Payout & Fee Calculator (5% fee)
     3. Organizer FAQ Accordion ([+] / [-] toggle)
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initPayoutCalculator();
  initFaqAccordion();
});

/**
 * 1. Mobile Hamburger Menu
 * Toggles the navigation drawer on smaller screens.
 */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const primaryNav = document.getElementById("primary-nav");

  if (!hamburgerBtn || !primaryNav) {
    return;
  }

  hamburgerBtn.addEventListener("click", function () {
    const isOpen = primaryNav.classList.toggle("is-open");
    hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

/**
 * 2. Payout & Fee Calculator
 * Recalculates Gross, 5% Platform Fee, and Net Payout live on input.
 * Empty, zero, or negative values are safely treated as 0 (never NaN).
 */
function initPayoutCalculator() {
  const priceInput = document.getElementById("ticket-price");
  const attendeesInput = document.getElementById("expected-attendees");
  const grossDisplay = document.getElementById("gross-value");
  const feeDisplay = document.getElementById("fee-value");
  const netDisplay = document.getElementById("net-value");

  if (!priceInput || !attendeesInput || !grossDisplay || !feeDisplay || !netDisplay) {
    return;
  }

  const PLATFORM_FEE_RATE = 0.05; // 5% platform fee

  // Helper: parse input safely so empty, NaN, or negative values become 0
  function getSafeNumber(inputElement) {
    const value = Number(inputElement.value);
    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }
    return value;
  }

  // Helper: format a number as "PKR 1,000,000"
  function formatPKR(amount) {
    return "PKR " + amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  // Calculate and render updated totals
  function updateCalculation() {
    const ticketPrice = getSafeNumber(priceInput);
    const attendees = getSafeNumber(attendeesInput);

    const gross = Math.round(ticketPrice * attendees * 100) / 100;
    const fee = Math.round(gross * PLATFORM_FEE_RATE * 100) / 100;
    const netPayout = Math.round((gross - fee) * 100) / 100;

    grossDisplay.textContent = formatPKR(gross);
    feeDisplay.textContent = formatPKR(fee);
    netDisplay.textContent = formatPKR(netPayout);
  }

  // Listen for live changes as the user types or uses number arrows
  priceInput.addEventListener("input", updateCalculation);
  attendeesInput.addEventListener("input", updateCalculation);

  // Run once on load to match initial input values
  updateCalculation();
}

/**
 * 3. Organizer FAQ Accordion
 * Clicking a question toggles its answer panel and switches [+] <-> [-].
 */
function initFaqAccordion() {
  const faqButtons = document.querySelectorAll(".faq-question");

  faqButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const answerId = button.getAttribute("aria-controls");
      const answerPanel = document.getElementById(answerId);
      const toggleSymbol = button.querySelector(".faq-toggle");

      if (!answerPanel || !toggleSymbol) {
        return;
      }

      const isExpanded = button.getAttribute("aria-expanded") === "true";

      if (isExpanded) {
        button.setAttribute("aria-expanded", "false");
        answerPanel.hidden = true;
        toggleSymbol.textContent = "[+]";
      } else {
        button.setAttribute("aria-expanded", "true");
        answerPanel.hidden = false;
        toggleSymbol.textContent = "[-]";
      }
    });
  });
}
