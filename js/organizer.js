/* =========================================================
   Sonora - Organizer Pages Script (js/organizer.js)
   Handles:
     1. Legacy Mobile Hamburger Menu Toggle (no-op when Bootstrap navbar is used)
     2. Live Payout & Fee Calculator (5% fee) on pages/host.html
     3. Organizer FAQ Accordion ([+] / [-] toggle) on pages/host.html
     4. Create Event Live Preview & Form Handling on pages/create-event.html
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initPayoutCalculator();
  initFaqAccordion();
  initCreateEventPage();
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

/**
 * 4. Create Event Page (pages/create-event.html)
 * Handles live card preview updates, form validation, and saving
 * organizer events (Draft or Published) to localStorage.
 */
function initCreateEventPage() {
  const form = document.getElementById("create-event-form");
  if (!form) {
    return;
  }

  const ORGANIZER_EVENTS_KEY = "sonora_organizer_events";

  // Form inputs
  const titleInput = document.getElementById("concert-title");
  const artistInput = document.getElementById("headlining-artist");
  const cityInput = document.getElementById("concert-city");
  const venueInput = document.getElementById("concert-venue");
  const dateInput = document.getElementById("concert-date");
  const timeInput = document.getElementById("concert-time");
  const gaPriceInput = document.getElementById("ga-price");
  const gaCapacityInput = document.getElementById("ga-capacity");
  const vipPriceInput = document.getElementById("vip-price");
  const vipCapacityInput = document.getElementById("vip-capacity");
  const saveDraftBtn = document.getElementById("save-draft-btn");

  // Live preview elements
  const previewTitle = document.getElementById("preview-title");
  const previewArtist = document.getElementById("preview-artist");
  const previewLocation = document.getElementById("preview-location");
  const previewDatetime = document.getElementById("preview-datetime");
  const previewPriceBadge = document.getElementById("preview-price-badge");
  const previewCapacity = document.getElementById("preview-capacity");

  // Banners
  const confirmationBanner = document.getElementById("ce-confirmation-banner");
  const confirmationTitle = document.getElementById("ce-confirmation-title");
  const confirmationMessage = document.getElementById("ce-confirmation-message");
  const errorBanner = document.getElementById("ce-error-banner");
  const errorMessage = document.getElementById("ce-error-message");

  /**
   * Safely parses a number from an input value.
   * Returns 0 for empty, NaN, or negative values so calculations never produce NaN.
   */
  function parseSafeNumber(rawValue) {
    if (rawValue === "" || rawValue === null || rawValue === undefined) {
      return 0;
    }
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  }

  /**
   * Formats a date string (YYYY-MM-DD) into a readable label, e.g. "Dec 5, 2026".
   */
  function formatPreviewDate(dateStr) {
    if (!dateStr) {
      return "";
    }
    const parts = dateStr.split("-");
    if (parts.length !== 3) {
      return dateStr;
    }
    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    const parsedDate = new Date(year, month, day);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateStr;
    }
    return parsedDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  /**
   * Formats a 24-hour time string (HH:MM) into 12-hour format, e.g. "8:00 PM".
   */
  function formatPreviewTime(timeStr) {
    if (!timeStr) {
      return "";
    }
    const parts = timeStr.split(":");
    if (parts.length < 2) {
      return timeStr;
    }
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return timeStr;
    }
    const suffix = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    const paddedMinutes = String(minutes).padStart(2, "0");
    return hour12 + ":" + paddedMinutes + " " + suffix;
  }

  /**
   * Updates all fields inside the LIVE CARD PREVIEW panel.
   */
  function updateLivePreview() {
    const titleVal = titleInput.value.trim();
    const artistVal = artistInput.value.trim();
    const venueVal = venueInput.value.trim();
    const cityVal = cityInput.value.trim();
    const dateVal = dateInput.value;
    const timeVal = timeInput.value;

    previewTitle.textContent = titleVal || "Your Concert Title";
    previewArtist.textContent = artistVal || "Headlining Artist";

    // Location fallback
    if (venueVal && cityVal) {
      previewLocation.textContent = venueVal + ", " + cityVal;
    } else if (venueVal || cityVal) {
      previewLocation.textContent = venueVal || cityVal;
    } else {
      previewLocation.textContent = "Venue, City";
    }

    // Date & Time fallback
    const formattedDate = formatPreviewDate(dateVal);
    const formattedTime = formatPreviewTime(timeVal);
    if (formattedDate && formattedTime) {
      previewDatetime.textContent = formattedDate + " • " + formattedTime;
    } else if (formattedDate) {
      previewDatetime.textContent = formattedDate + " • Time TBD";
    } else if (formattedTime) {
      previewDatetime.textContent = "Date TBD • " + formattedTime;
    } else {
      previewDatetime.textContent = "Date & Time TBD";
    }

    // Price badge ("From PKR 0" until a valid positive ticket price is entered)
    const gaPrice = parseSafeNumber(gaPriceInput.value);
    const vipPrice = parseSafeNumber(vipPriceInput.value);
    const positivePrices = [gaPrice, vipPrice].filter(function (price) {
      return price > 0;
    });

    const lowestPrice = positivePrices.length > 0 ? Math.min.apply(null, positivePrices) : 0;
    previewPriceBadge.textContent = "From PKR " + lowestPrice.toLocaleString("en-US");

    // Capacity summary
    const gaCapacity = Math.floor(parseSafeNumber(gaCapacityInput.value));
    const vipCapacity = Math.floor(parseSafeNumber(vipCapacityInput.value));
    const totalCapacity = gaCapacity + vipCapacity;
    previewCapacity.textContent = totalCapacity.toLocaleString("en-US") + " total seats";
  }

  /**
   * Clears validation highlights and hides the error banner.
   */
  function clearValidationState() {
    const inputs = form.querySelectorAll(".ce-input");
    inputs.forEach(function (input) {
      input.classList.remove("is-invalid");
    });
    if (errorBanner) {
      errorBanner.hidden = true;
    }
  }

  /**
   * Validates all required fields and numeric inputs before saving.
   * Returns null if valid, or an error object { message, field } if invalid.
   */
  function validateEventForm() {
    const requiredTextFields = [
      { input: titleInput, label: "Concert Title" },
      { input: artistInput, label: "Headlining Artist" },
      { input: cityInput, label: "City" },
      { input: venueInput, label: "Venue" },
      { input: dateInput, label: "Date" },
      { input: timeInput, label: "Time" }
    ];

    for (let i = 0; i < requiredTextFields.length; i += 1) {
      const item = requiredTextFields[i];
      if (!item.input.value.trim()) {
        return {
          message: "Please enter a valid " + item.label + ".",
          field: item.input
        };
      }
    }

    // GA Price validation (required, non-negative number)
    const gaPriceRaw = gaPriceInput.value.trim();
    const gaPriceNum = Number(gaPriceRaw);
    if (gaPriceRaw === "" || !Number.isFinite(gaPriceNum) || gaPriceNum < 0) {
      return {
        message: "Please enter a valid GA Ticket Price in PKR (0 or greater).",
        field: gaPriceInput
      };
    }

    // GA Capacity validation (required, at least 1 seat)
    const gaCapRaw = gaCapacityInput.value.trim();
    const gaCapNum = Number(gaCapRaw);
    if (gaCapRaw === "" || !Number.isFinite(gaCapNum) || gaCapNum < 1) {
      return {
        message: "Please enter a GA Capacity of at least 1 ticket.",
        field: gaCapacityInput
      };
    }

    // Optional VIP Price & Capacity validation (if entered, must not be negative/NaN)
    const vipPriceRaw = vipPriceInput.value.trim();
    if (vipPriceRaw !== "") {
      const vipPriceNum = Number(vipPriceRaw);
      if (!Number.isFinite(vipPriceNum) || vipPriceNum < 0) {
        return {
          message: "VIP Ticket Price cannot be negative.",
          field: vipPriceInput
        };
      }
    }

    const vipCapRaw = vipCapacityInput.value.trim();
    if (vipCapRaw !== "") {
      const vipCapNum = Number(vipCapRaw);
      if (!Number.isFinite(vipCapNum) || vipCapNum < 0) {
        return {
          message: "VIP Capacity cannot be negative.",
          field: vipCapacityInput
        };
      }
    }

    return null;
  }

  /**
   * Reads the stored organizer events array safely from localStorage.
   */
  function readOrganizerEvents() {
    try {
      const raw = window.localStorage.getItem(ORGANIZER_EVENTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Validates, builds the event record, saves it to localStorage, and displays confirmation.
   */
  function handleSaveEvent(statusLabel) {
    clearValidationState();

    const validationError = validateEventForm();
    if (validationError) {
      validationError.field.classList.add("is-invalid");
      validationError.field.focus();
      if (errorMessage && errorBanner) {
        errorMessage.textContent = validationError.message;
        errorBanner.hidden = false;
      }
      if (confirmationBanner) {
        confirmationBanner.hidden = true;
      }
      return;
    }

    const gaPrice = parseSafeNumber(gaPriceInput.value);
    const gaCapacity = Math.floor(parseSafeNumber(gaCapacityInput.value));
    const vipPrice = parseSafeNumber(vipPriceInput.value);
    const vipCapacity = Math.floor(parseSafeNumber(vipCapacityInput.value));
    const totalCapacity = gaCapacity + vipCapacity;

    const positivePrices = [gaPrice, vipPrice].filter(function (price) {
      return price > 0;
    });
    const startingPrice = positivePrices.length > 0 ? Math.min.apply(null, positivePrices) : 0;

    const newEvent = {
      id: "org-" + Date.now(),
      title: titleInput.value.trim(),
      artist: artistInput.value.trim(),
      city: cityInput.value.trim(),
      venue: venueInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value,
      dateTime: dateInput.value + "T" + timeInput.value,
      gaPrice: gaPrice,
      gaCapacity: gaCapacity,
      vipPrice: vipPrice,
      vipCapacity: vipCapacity,
      startingPrice: startingPrice,
      totalCapacity: totalCapacity,
      ticketsSold: 0,
      status: statusLabel,
      createdAt: new Date().toISOString()
    };

    const existingEvents = readOrganizerEvents();
    existingEvents.push(newEvent);
    window.localStorage.setItem(ORGANIZER_EVENTS_KEY, JSON.stringify(existingEvents));

    // Show confirmation banner
    if (confirmationBanner && confirmationTitle && confirmationMessage) {
      confirmationTitle.textContent =
        statusLabel === "Published"
          ? "Concert published successfully!"
          : "Concert saved as draft!";
      confirmationMessage.textContent =
        '"' +
        newEvent.title +
        '" (' +
        newEvent.totalCapacity.toLocaleString("en-US") +
        " total capacity, status: " +
        newEvent.status +
        ") has been saved.";
      confirmationBanner.hidden = false;
      confirmationBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // Attach live input listeners to all form fields
  const allInputs = form.querySelectorAll(".ce-input");
  allInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      input.classList.remove("is-invalid");
      if (errorBanner && !errorBanner.hidden) {
        errorBanner.hidden = true;
      }
      updateLivePreview();
    });
    input.addEventListener("change", updateLivePreview);
  });

  // Save as Draft button
  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", function () {
      handleSaveEvent("Draft");
    });
  }

  // Publish Concert form submit
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    handleSaveEvent("Published");
  });

  // Initialize preview placeholders on load
  updateLivePreview();
}
