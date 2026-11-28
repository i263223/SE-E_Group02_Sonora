/* =========================================================
   Sonora - Organizer Pages Script (js/organizer.js)
   Handles:
     1. Legacy Mobile Hamburger Menu Toggle (no-op when Bootstrap navbar is used)
     2. Live Payout & Fee Calculator (5% fee) on pages/host.html
     3. Organizer FAQ Accordion ([+] / [-] toggle) on pages/host.html
     4. Create Event Live Preview & Form Handling on pages/create-event.html
     5. Organizer Dashboard (KPIs, Filters, Status Toggle & Delete) on pages/organizer-dashboard.html
   ========================================================= */

const ORGANIZER_EVENTS_KEY = "sonora_organizer_events";

/**
 * Returns the 3 default sample organizer concerts for initial seeding.
 */
function getDefaultOrganizerEvents() {
  return [
    {
      id: "seed-our-neighbourhood",
      title: "Our Neighbourhood",
      artist: "The Neighbourhood",
      city: "Chicago",
      venue: "United Center",
      date: "2026-12-05",
      time: "20:00",
      dateTime: "2026-12-05T20:00",
      gaPrice: 4000,
      gaCapacity: 400,
      vipPrice: 0,
      vipCapacity: 0,
      startingPrice: 4000,
      totalCapacity: 400,
      ticketsSold: 320,
      revenue: 1280000,
      status: "Published",
      createdAt: "2026-11-01T10:00:00.000Z"
    },
    {
      id: "seed-young-stunners-night",
      title: "Young Stunners Night",
      artist: "Young Stunners",
      city: "Karachi",
      venue: "Beach Park Clifton",
      date: "2026-12-12",
      time: "20:30",
      dateTime: "2026-12-12T20:30",
      gaPrice: 3900,
      gaCapacity: 400,
      vipPrice: 0,
      vipCapacity: 0,
      startingPrice: 3900,
      totalCapacity: 400,
      ticketsSold: 300,
      revenue: 1170000,
      status: "Published",
      createdAt: "2026-11-02T10:00:00.000Z"
    },
    {
      id: "seed-acoustic-evening",
      title: "Acoustic Evening",
      artist: "Camille Laurent",
      city: "Paris",
      venue: "Le Trianon",
      date: "2026-12-20",
      time: "19:30",
      dateTime: "2026-12-20T19:30",
      gaPrice: 3500,
      gaCapacity: 150,
      vipPrice: 0,
      vipCapacity: 0,
      startingPrice: 3500,
      totalCapacity: 150,
      ticketsSold: 0,
      revenue: 0,
      status: "Draft",
      createdAt: "2026-11-03T10:00:00.000Z"
    }
  ];
}

/**
 * Reads organizer events from localStorage, seeding the 3 sample concerts if empty.
 */
function loadOrSeedOrganizerEvents() {
  try {
    const raw = window.localStorage.getItem(ORGANIZER_EVENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    // Fall through to seeding defaults when storage is unreadable or malformed
  }

  const seeded = getDefaultOrganizerEvents();
  saveOrganizerEvents(seeded);
  return seeded;
}

/**
 * Persists the organizer events array to localStorage.
 */
function saveOrganizerEvents(events) {
  try {
    window.localStorage.setItem(ORGANIZER_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    // Ignore storage quota errors gracefully
  }
}

/**
 * Formats a non-negative amount as "PKR 1,280,000".
 */
function formatOrganizerPKR(amount) {
  const safeAmount = Number.isFinite(Number(amount)) && Number(amount) > 0 ? Number(amount) : 0;
  return "PKR " + safeAmount.toLocaleString("en-US");
}

document.addEventListener("DOMContentLoaded", function () {
  initMobileMenu();
  initPayoutCalculator();
  initFaqAccordion();
  initCreateEventPage();
  initOrganizerDashboard();
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
      revenue: 0,
      status: statusLabel,
      createdAt: new Date().toISOString()
    };

    const existingEvents = loadOrSeedOrganizerEvents();
    existingEvents.push(newEvent);
    saveOrganizerEvents(existingEvents);

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

/**
 * 5. Organizer Dashboard (pages/organizer-dashboard.html)
 * Loads/seeds sonora_organizer_events, calculates KPIs, filters by city & search,
 * and handles Draft/Published status toggles and event deletions.
 */
function initOrganizerDashboard() {
  const tbody = document.getElementById("dash-events-tbody");
  if (!tbody) {
    return;
  }

  const cityFilter = document.getElementById("dash-city-filter");
  const searchInput = document.getElementById("dash-search-input");
  const kpiTotalRevenue = document.getElementById("kpi-total-revenue");
  const kpiTicketsSold = document.getElementById("kpi-tickets-sold");
  const kpiActiveConcerts = document.getElementById("kpi-active-concerts");
  const kpiAvgTicket = document.getElementById("kpi-avg-ticket");
  const eventCountEl = document.getElementById("dash-event-count");
  const tableWrap = document.querySelector(".dash-table-wrap");
  const emptyStateEl = document.getElementById("dash-empty-state");
  const emptyMessageEl = document.getElementById("dash-empty-message");
  const resetFiltersBtn = document.getElementById("dash-reset-filters-btn");

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let events = loadOrSeedOrganizerEvents();

  function getTicketsSold(ev) {
    const sold = Number(ev.ticketsSold);
    return Number.isFinite(sold) && sold >= 0 ? Math.floor(sold) : 0;
  }

  function getTotalCapacity(ev) {
    const explicitCap = Number(ev.totalCapacity);
    if (Number.isFinite(explicitCap) && explicitCap > 0) {
      return Math.floor(explicitCap);
    }
    const gaCap = Number(ev.gaCapacity);
    const vipCap = Number(ev.vipCapacity);
    const combined = (Number.isFinite(gaCap) && gaCap > 0 ? gaCap : 0) +
      (Number.isFinite(vipCap) && vipCap > 0 ? vipCap : 0);
    return Math.floor(combined);
  }

  function getEventRevenue(ev) {
    if (typeof ev.revenue === "number" && Number.isFinite(ev.revenue) && ev.revenue >= 0) {
      return Math.round(ev.revenue);
    }
    const sold = getTicketsSold(ev);
    const unitPrice = Number(ev.startingPrice || ev.gaPrice || 0);
    if (sold > 0 && Number.isFinite(unitPrice) && unitPrice > 0) {
      return Math.round(sold * unitPrice);
    }
    return 0;
  }

  function formatDashboardDate(dateStr) {
    if (!dateStr) {
      return "Date TBD";
    }
    const parts = String(dateStr).split("-");
    if (parts.length === 3) {
      const monthIndex = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      if (monthIndex >= 0 && monthIndex < 12 && Number.isFinite(day) && day > 0) {
        return String(day).padStart(2, "0") + " " + MONTH_NAMES[monthIndex];
      }
    }
    return String(dateStr);
  }

  function getNormalizedStatus(ev) {
    return ev.status === "Published" ? "Published" : "Draft";
  }

  function populateCityFilter() {
    if (!cityFilter) {
      return;
    }
    const previousValue = cityFilter.value || "all";
    const cityMap = new Map();

    events.forEach(function (ev) {
      const city = (ev.city || "").trim();
      if (city) {
        const key = city.toLowerCase();
        if (!cityMap.has(key)) {
          cityMap.set(key, city);
        }
      }
    });

    const sortedCities = Array.from(cityMap.values()).sort(function (a, b) {
      return a.localeCompare(b);
    });

    cityFilter.innerHTML = "";
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Cities";
    cityFilter.appendChild(allOption);

    sortedCities.forEach(function (city) {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      cityFilter.appendChild(option);
    });

    const hasPrevious = sortedCities.some(function (city) {
      return city.toLowerCase() === previousValue.toLowerCase();
    });
    cityFilter.value = hasPrevious ? previousValue : "all";
  }

  function getFilteredEvents() {
    const selectedCity = cityFilter ? cityFilter.value.trim().toLowerCase() : "all";
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    return events.filter(function (ev) {
      const evCity = (ev.city || "").trim();
      if (selectedCity !== "all" && evCity.toLowerCase() !== selectedCity) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        ev.title || "",
        ev.artist || "",
        evCity,
        ev.venue || "",
        getNormalizedStatus(ev),
        formatDashboardDate(ev.date)
      ]
        .join(" ")
        .toLowerCase();

      return haystack.indexOf(query) !== -1;
    });
  }

  function renderKPIs(filteredEvents) {
    let totalRevenue = 0;
    let totalSold = 0;
    let totalCapacity = 0;
    let activeConcerts = 0;

    filteredEvents.forEach(function (ev) {
      totalRevenue += getEventRevenue(ev);
      totalSold += getTicketsSold(ev);
      totalCapacity += getTotalCapacity(ev);
      if (getNormalizedStatus(ev) === "Published") {
        activeConcerts += 1;
      }
    });

    const avgTicket = totalSold > 0 ? Math.round(totalRevenue / totalSold) : 0;

    if (kpiTotalRevenue) {
      kpiTotalRevenue.textContent = formatOrganizerPKR(totalRevenue);
    }
    if (kpiTicketsSold) {
      kpiTicketsSold.textContent =
        totalSold.toLocaleString("en-US") + " / " + totalCapacity.toLocaleString("en-US");
    }
    if (kpiActiveConcerts) {
      kpiActiveConcerts.textContent = activeConcerts.toLocaleString("en-US");
    }
    if (kpiAvgTicket) {
      kpiAvgTicket.textContent = formatOrganizerPKR(avgTicket);
    }
  }

  function createEventRow(ev) {
    const tr = document.createElement("tr");
    const status = getNormalizedStatus(ev);
    const sold = getTicketsSold(ev);
    const capacity = getTotalCapacity(ev);
    const revenue = getEventRevenue(ev);
    const fillPercent = capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : 0;

    // 1. Event Name (+ Artist / Venue subtitle)
    const tdName = document.createElement("td");
    const titleDiv = document.createElement("div");
    titleDiv.className = "dash-event-name";
    titleDiv.textContent = ev.title || "Untitled Concert";
    tdName.appendChild(titleDiv);

    const metaParts = [ev.artist, ev.venue].filter(Boolean);
    if (metaParts.length > 0) {
      const metaDiv = document.createElement("div");
      metaDiv.className = "dash-event-meta";
      metaDiv.textContent = metaParts.join(" • ");
      tdName.appendChild(metaDiv);
    }
    tr.appendChild(tdName);

    // 2. Date & City
    const tdDateCity = document.createElement("td");
    tdDateCity.className = "dash-date-city";
    const dateLabel = formatDashboardDate(ev.date);
    const cityLabel = (ev.city || "").trim();
    tdDateCity.textContent = cityLabel ? dateLabel + ", " + cityLabel : dateLabel;
    tr.appendChild(tdDateCity);

    // 3. Tickets Sold
    const tdTickets = document.createElement("td");
    const ticketsCell = document.createElement("div");
    ticketsCell.className = "dash-tickets-cell";

    const ticketsText = document.createElement("span");
    ticketsText.className = "dash-tickets-text";
    ticketsText.textContent = sold.toLocaleString("en-US") + " / " + capacity.toLocaleString("en-US");
    ticketsCell.appendChild(ticketsText);

    const progressTrack = document.createElement("div");
    progressTrack.className = "dash-progress-track";
    const progressFill = document.createElement("div");
    progressFill.className = "dash-progress-fill";
    progressFill.style.width = fillPercent + "%";
    progressTrack.appendChild(progressFill);
    ticketsCell.appendChild(progressTrack);

    tdTickets.appendChild(ticketsCell);
    tr.appendChild(tdTickets);

    // 4. Revenue
    const tdRevenue = document.createElement("td");
    tdRevenue.className = "dash-revenue-text";
    tdRevenue.textContent = formatOrganizerPKR(revenue);
    tr.appendChild(tdRevenue);

    // 5. Status Badge
    const tdStatus = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className =
      "dash-status-badge " +
      (status === "Published" ? "dash-status-published" : "dash-status-draft");
    statusBadge.textContent = status;
    tdStatus.appendChild(statusBadge);
    tr.appendChild(tdStatus);

    // 6. Actions
    const tdActions = document.createElement("td");
    tdActions.className = "text-end";
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "dash-row-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className =
      "dash-action-btn " + (status === "Draft" ? "dash-action-publish" : "dash-action-draft");
    toggleBtn.dataset.action = "toggle-status";
    toggleBtn.dataset.eventId = String(ev.id);
    toggleBtn.textContent = status === "Published" ? "Set Draft" : "Publish";
    toggleBtn.setAttribute(
      "aria-label",
      (status === "Published" ? "Set Draft for " : "Publish ") + (ev.title || "event")
    );
    actionsWrap.appendChild(toggleBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "dash-action-btn dash-action-delete";
    deleteBtn.dataset.action = "delete";
    deleteBtn.dataset.eventId = String(ev.id);
    deleteBtn.textContent = "Delete";
    deleteBtn.setAttribute("aria-label", "Delete " + (ev.title || "event"));
    actionsWrap.appendChild(deleteBtn);

    tdActions.appendChild(actionsWrap);
    tr.appendChild(tdActions);

    return tr;
  }

  function renderDashboard() {
    const filteredEvents = getFilteredEvents();
    const isFiltered =
      (cityFilter && cityFilter.value !== "all") ||
      (searchInput && searchInput.value.trim() !== "");

    renderKPIs(filteredEvents);

    if (eventCountEl) {
      if (isFiltered && events.length > 0) {
        eventCountEl.textContent =
          filteredEvents.length + " of " + events.length + (events.length === 1 ? " event" : " events");
      } else {
        eventCountEl.textContent =
          filteredEvents.length + (filteredEvents.length === 1 ? " event" : " events");
      }
    }

    tbody.innerHTML = "";

    if (filteredEvents.length === 0) {
      if (tableWrap) {
        tableWrap.hidden = true;
      }
      if (emptyStateEl) {
        emptyStateEl.hidden = false;
      }
      if (emptyMessageEl) {
        emptyMessageEl.textContent =
          events.length === 0
            ? "You have no organizer concerts yet. Create your first event to start tracking sales."
            : "No concerts match your current filter.";
      }
      if (resetFiltersBtn) {
        resetFiltersBtn.hidden = !isFiltered;
      }
      return;
    }

    if (tableWrap) {
      tableWrap.hidden = false;
    }
    if (emptyStateEl) {
      emptyStateEl.hidden = true;
    }

    const fragment = document.createDocumentFragment();
    filteredEvents.forEach(function (ev) {
      fragment.appendChild(createEventRow(ev));
    });
    tbody.appendChild(fragment);
  }

  // Filter & search listeners
  if (cityFilter) {
    cityFilter.addEventListener("change", renderDashboard);
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderDashboard);
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", function () {
      if (cityFilter) {
        cityFilter.value = "all";
      }
      if (searchInput) {
        searchInput.value = "";
      }
      renderDashboard();
    });
  }

  // Delegated status toggle and delete handlers
  tbody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const eventId = button.dataset.eventId;
    if (!eventId) {
      return;
    }

    if (action === "toggle-status") {
      events = events.map(function (ev) {
        if (String(ev.id) === eventId) {
          const nextStatus = getNormalizedStatus(ev) === "Published" ? "Draft" : "Published";
          return Object.assign({}, ev, { status: nextStatus });
        }
        return ev;
      });
      saveOrganizerEvents(events);
      renderDashboard();
    } else if (action === "delete") {
      events = events.filter(function (ev) {
        return String(ev.id) !== eventId;
      });
      saveOrganizerEvents(events);
      populateCityFilter();
      renderDashboard();
    }
  });

  populateCityFilter();
  renderDashboard();
}
