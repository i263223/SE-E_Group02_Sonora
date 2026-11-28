/**
 * SONORA — Live Concert Tickets
 * Page-specific Checkout Logic (pages/checkout.html)
 */

(function () {
  "use strict";

  const PAYMENT_LABELS = {
    card: "Credit / Debit Card",
    wallet: "Digital Wallet",
    paypal: "PayPal"
  };

  const state = {
    items: [],
    paymentMethod: "card",
    orderCompleted: false
  };

  const elements = {
    progressList: document.getElementById("checkoutProgressList"),
    progressStatusLabel: document.getElementById("progressStatusLabel"),
    feedbackBanner: document.getElementById("checkoutFeedbackBanner"),
    checkoutForm: document.getElementById("checkoutForm"),
    successPanel: document.getElementById("checkoutSuccessPanel"),
    confirmCustomerName: document.getElementById("confirmCustomerName"),
    confirmCustomerEmail: document.getElementById("confirmCustomerEmail"),
    confirmOrderId: document.getElementById("confirmOrderId"),
    confirmPaymentMethod: document.getElementById("confirmPaymentMethod"),
    confirmAmountPaid: document.getElementById("confirmAmountPaid"),

    // Billing inputs
    fullName: document.getElementById("billingFullName"),
    email: document.getElementById("billingEmail"),
    phone: document.getElementById("billingPhone"),
    country: document.getElementById("billingCountry"),
    address: document.getElementById("billingAddress"),
    city: document.getElementById("billingCity"),
    stateField: document.getElementById("billingState"),
    zip: document.getElementById("billingZip"),

    // Payment method inputs & panels
    paymentRadios: document.querySelectorAll('input[name="paymentMethod"]'),
    paymentPanelCard: document.getElementById("paymentPanelCard"),
    paymentPanelWallet: document.getElementById("paymentPanelWallet"),
    paymentPanelPaypal: document.getElementById("paymentPanelPaypal"),
    cardHolderName: document.getElementById("cardHolderName"),
    cardNumber: document.getElementById("cardNumber"),
    cardExpiry: document.getElementById("cardExpiry"),
    cardCvv: document.getElementById("cardCvv"),
    walletProvider: document.getElementById("walletProvider"),
    walletHandle: document.getElementById("walletHandle"),
    paypalEmail: document.getElementById("paypalEmail"),

    // Right column: Your order box
    orderTicketsPill: document.getElementById("orderTicketsPill"),
    orderEmptyState: document.getElementById("orderEmptyState"),
    orderDetails: document.getElementById("orderDetails"),
    orderItemsList: document.getElementById("orderItemsList"),
    orderTicketCount: document.getElementById("orderTicketCount"),
    orderSubtotal: document.getElementById("orderSubtotal"),
    orderTotal: document.getElementById("orderTotal"),
    payNowBtn: document.getElementById("payNowBtn"),
    backToCartLink: document.getElementById("backToCartLink")
  };

  function getStorageKey(name, fallback) {
    return (
      (window.SONORA_UI &&
        window.SONORA_UI.STORAGE_KEYS &&
        window.SONORA_UI.STORAGE_KEYS[name]) ||
      fallback
    );
  }

  function readStorageArray(key) {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function formatCurrency(amount) {
    return `$${Number(amount || 0).toFixed(2)}`;
  }

  function formatEventDate(isoDate) {
    if (!isoDate) {
      return "Date TBA";
    }
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return String(isoDate);
    }
    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function getDefaultGaPrice(concert) {
    const regular = concert && Number(concert.price) ? Number(concert.price) : 75;
    return Math.max(25, Math.round(regular * 0.7));
  }

  function normalizeCartItem(rawItem, index) {
    if (!rawItem || typeof rawItem !== "object") {
      return null;
    }

    const hasData = typeof SONORA_DATA !== "undefined";
    const concert =
      hasData && rawItem.concertId
        ? SONORA_DATA.getConcertById(rawItem.concertId)
        : null;
    const artist =
      hasData && concert ? SONORA_DATA.getArtistById(concert.artistId) : null;
    const venue =
      hasData && concert ? SONORA_DATA.getVenueById(concert.venueId) : null;

    const seats = Array.isArray(rawItem.seats)
      ? rawItem.seats
          .filter((seat) => seat && seat.seatId)
          .map((seat) => ({
            seatId: String(seat.seatId),
            section: seat.section ? String(seat.section) : "Reserved",
            price: Number(seat.price) || (concert ? Number(concert.price) : 75)
          }))
      : [];

    let gaQuantity = Number(rawItem.gaQuantity) || 0;
    const gaUnitPrice =
      Number(rawItem.gaUnitPrice) ||
      Number(rawItem.price) ||
      getDefaultGaPrice(concert);

    if (seats.length === 0 && gaQuantity === 0) {
      const genericQty = Number(rawItem.quantity);
      if (genericQty > 0) {
        gaQuantity = genericQty;
      } else {
        return null;
      }
    }

    const quantity = seats.length + gaQuantity;
    const seatsSubtotal = seats.reduce((sum, s) => sum + s.price, 0);
    const subtotal = seatsSubtotal + gaQuantity * gaUnitPrice;

    return {
      index,
      id: rawItem.id || `${rawItem.concertId || "item"}-${index}`,
      concertId: rawItem.concertId || (concert ? concert.id : ""),
      concertTitle:
        rawItem.concertTitle ||
        rawItem.title ||
        (concert ? concert.title : "Concert Tickets"),
      artistName: artist ? artist.name : rawItem.artistName || "Featured Artist",
      venueLabel: venue
        ? `${venue.name}, ${venue.city}`
        : (concert && concert.city) || rawItem.venue || "Live Venue",
      date: rawItem.date || (concert ? concert.date : ""),
      seats,
      gaQuantity,
      gaUnitPrice,
      gaLabel: rawItem.section || "General Admission",
      quantity,
      subtotal
    };
  }

  function showFeedback(message) {
    if (!elements.feedbackBanner) {
      return;
    }
    if (!message) {
      elements.feedbackBanner.classList.add("d-none");
      elements.feedbackBanner.textContent = "";
      return;
    }
    elements.feedbackBanner.classList.remove("d-none");
    elements.feedbackBanner.textContent = message;
  }

  function renderOrderSummary(items) {
    const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const hasItems = items.length > 0;

    if (!state.orderCompleted) {
      elements.orderTicketsPill.textContent = `${totalTickets} ${totalTickets === 1 ? "Ticket" : "Tickets"}`;
      elements.orderEmptyState.classList.toggle("d-none", hasItems);
      elements.orderDetails.classList.toggle("d-none", !hasItems);
      elements.payNowBtn.disabled = !hasItems;
    }

    elements.orderItemsList.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "sonora-order-item";

      const topRow = document.createElement("div");
      topRow.className = "sonora-order-item-top";

      const titleWrap = document.createElement("div");
      const titleEl = document.createElement("div");
      titleEl.className = "sonora-order-item-title";
      titleEl.textContent = item.concertTitle;

      const metaEl = document.createElement("div");
      metaEl.className = "sonora-order-item-meta";
      metaEl.textContent = `${item.venueLabel} \u2022 ${formatEventDate(item.date)}`;

      titleWrap.appendChild(titleEl);
      titleWrap.appendChild(metaEl);

      const amountEl = document.createElement("span");
      amountEl.className = "fw-bold text-white small";
      amountEl.textContent = formatCurrency(item.subtotal);

      topRow.appendChild(titleWrap);
      topRow.appendChild(amountEl);
      li.appendChild(topRow);

      const parts = [];
      if (item.seats.length > 0) {
        parts.push(`Seats: ${item.seats.map((s) => s.seatId).join(", ")}`);
      }
      if (item.gaQuantity > 0) {
        parts.push(`${item.gaLabel} \u00d7${item.gaQuantity}`);
      }

      if (parts.length > 0) {
        const breakdownEl = document.createElement("div");
        breakdownEl.className = "sonora-order-item-breakdown";
        breakdownEl.textContent = parts.join(" \u2022 ");
        li.appendChild(breakdownEl);
      }

      elements.orderItemsList.appendChild(li);
    });

    elements.orderTicketCount.textContent = String(totalTickets);
    elements.orderSubtotal.textContent = formatCurrency(totalAmount);
    elements.orderTotal.textContent = formatCurrency(totalAmount);
  }

  function loadCartItems() {
    if (state.orderCompleted) {
      return;
    }
    const cartKey = getStorageKey("CART", "sonora_cart");
    const rawCart = readStorageArray(cartKey);
    state.items = rawCart
      .map((item, idx) => normalizeCartItem(item, idx))
      .filter(Boolean);

    renderOrderSummary(state.items);
  }

  function prefillFromUserSession() {
    const userKey = getStorageKey("USER", "sonora_user");
    try {
      const raw = window.localStorage.getItem(userKey);
      if (!raw) {
        return;
      }
      const user = JSON.parse(raw);
      if (typeof user === "string") {
        if (elements.fullName && !elements.fullName.value) {
          elements.fullName.value = user;
        }
        return;
      }
      if (user && typeof user === "object") {
        if (user.name && elements.fullName && !elements.fullName.value) {
          elements.fullName.value = user.name;
          if (elements.cardHolderName && !elements.cardHolderName.value) {
            elements.cardHolderName.value = user.name;
          }
        }
        if (user.email && elements.email && !elements.email.value) {
          elements.email.value = user.email;
        }
      }
    } catch (error) {
      // Ignore malformed stored user session
    }
  }

  function setPaymentMethod(method) {
    state.paymentMethod = method;

    elements.paymentRadios.forEach((radio) => {
      const label = radio.closest(".sonora-payment-option");
      const isSelected = radio.value === method;
      radio.checked = isSelected;
      if (label) {
        label.classList.toggle("is-selected", isSelected);
      }
    });

    const isCard = method === "card";
    const isWallet = method === "wallet";
    const isPaypal = method === "paypal";

    elements.paymentPanelCard.classList.toggle("d-none", !isCard);
    elements.paymentPanelWallet.classList.toggle("d-none", !isWallet);
    elements.paymentPanelPaypal.classList.toggle("d-none", !isPaypal);

    // Clear invalid indicators on hidden payment fields
    [
      elements.cardHolderName,
      elements.cardNumber,
      elements.cardExpiry,
      elements.cardCvv,
      elements.walletHandle,
      elements.paypalEmail
    ].forEach((field) => {
      if (field) {
        field.classList.remove("is-invalid");
      }
    });
  }

  function formatCardNumberInput() {
    const digits = elements.cardNumber.value.replace(/\D/g, "").slice(0, 19);
    elements.cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  function formatExpiryInput() {
    const digits = elements.cardExpiry.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      elements.cardExpiry.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      elements.cardExpiry.value = digits;
    }
  }

  function formatCvvInput() {
    elements.cardCvv.value = elements.cardCvv.value.replace(/\D/g, "").slice(0, 4);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function isValidPhone(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }

  function isValidExpiry(value) {
    const match = /^(\d{2})\/(\d{2})$/.exec(String(value || "").trim());
    if (!match) {
      return false;
    }
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    if (month < 1 || month > 12) {
      return false;
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return year > currentYear || (year === currentYear && month >= currentMonth);
  }

  function validateField(field, predicate) {
    if (!field) {
      return true;
    }
    const ok = Boolean(predicate(field.value));
    field.classList.toggle("is-invalid", !ok);
    return ok;
  }

  function validateCheckoutForm() {
    const checks = [
      validateField(elements.fullName, (v) => v.trim().length >= 2),
      validateField(elements.email, isValidEmail),
      validateField(elements.phone, isValidPhone),
      validateField(elements.country, (v) => v.trim().length > 0),
      validateField(elements.address, (v) => v.trim().length >= 4),
      validateField(elements.city, (v) => v.trim().length >= 2),
      validateField(elements.stateField, (v) => v.trim().length >= 2),
      validateField(elements.zip, (v) => v.trim().length >= 3)
    ];

    if (state.paymentMethod === "card") {
      checks.push(
        validateField(elements.cardHolderName, (v) => v.trim().length >= 2),
        validateField(elements.cardNumber, (v) => {
          const digits = v.replace(/\D/g, "");
          return digits.length >= 13 && digits.length <= 19;
        }),
        validateField(elements.cardExpiry, isValidExpiry),
        validateField(elements.cardCvv, (v) => /^\d{3,4}$/.test(v.trim()))
      );
    } else if (state.paymentMethod === "wallet") {
      checks.push(validateField(elements.walletHandle, isValidEmail));
    } else if (state.paymentMethod === "paypal") {
      checks.push(validateField(elements.paypalEmail, isValidEmail));
    }

    const allValid = checks.every(Boolean);
    if (!allValid) {
      const firstInvalid = elements.checkoutForm.querySelector(".is-invalid");
      if (firstInvalid) {
        firstInvalid.focus();
      }
    }
    return allValid;
  }

  function advanceProgressToConfirmation() {
    if (!elements.progressList) {
      return;
    }

    elements.progressList.dataset.currentStep = "4";
    const steps = elements.progressList.querySelectorAll(".sonora-progress-step");
    steps.forEach((stepEl) => {
      const stepNum = Number(stepEl.dataset.step);
      stepEl.classList.remove("is-active", "is-completed");
      stepEl.removeAttribute("aria-current");

      if (stepNum < 4) {
        stepEl.classList.add("is-completed");
        const dot = stepEl.querySelector(".sonora-step-dot");
        if (dot && stepNum === 3) {
          dot.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>';
        }
      } else if (stepNum === 4) {
        stepEl.classList.add("is-active");
        stepEl.setAttribute("aria-current", "step");
      }
    });

    if (elements.progressStatusLabel) {
      elements.progressStatusLabel.textContent = "Step 4 of 4 \u2022 Order Confirmed";
    }
  }

  function completeOrder() {
    const totalAmount = state.items.reduce((sum, item) => sum + item.subtotal, 0);
    const orderId = `SNR-${Date.now().toString(36).toUpperCase()}`;
    const purchasedAt = new Date().toISOString();

    let methodSummary = PAYMENT_LABELS[state.paymentMethod] || "Card";
    if (state.paymentMethod === "card") {
      const digits = elements.cardNumber.value.replace(/\D/g, "");
      const last4 = digits.slice(-4);
      methodSummary = `Card ending in ${last4}`;
    } else if (state.paymentMethod === "wallet" && elements.walletProvider) {
      methodSummary = elements.walletProvider.value;
    }

    const customerName = elements.fullName.value.trim();
    const customerEmail = elements.email.value.trim();

    const ticketsKey = getStorageKey("TICKETS", "sonora_tickets");
    const cartKey = getStorageKey("CART", "sonora_cart");
    const existingTickets = readStorageArray(ticketsKey);

    const newTickets = state.items.map((item, idx) => ({
      id: `${orderId}-${idx + 1}`,
      orderId,
      purchasedAt,
      concertId: item.concertId,
      concertTitle: item.concertTitle,
      artistName: item.artistName,
      venueLabel: item.venueLabel,
      date: item.date,
      seats: item.seats,
      gaQuantity: item.gaQuantity,
      gaUnitPrice: item.gaUnitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
      billingName: customerName,
      billingEmail: customerEmail,
      paymentMethod: methodSummary,
      status: "Confirmed"
    }));

    window.localStorage.setItem(
      ticketsKey,
      JSON.stringify(existingTickets.concat(newTickets))
    );
    window.localStorage.setItem(cartKey, JSON.stringify([]));

    if (window.SONORA_UI && typeof window.SONORA_UI.refreshBadges === "function") {
      window.SONORA_UI.refreshBadges();
    }

    state.orderCompleted = true;
    showFeedback("");
    advanceProgressToConfirmation();

    elements.confirmCustomerName.textContent = customerName;
    elements.confirmCustomerEmail.textContent = customerEmail;
    elements.confirmOrderId.textContent = orderId;
    elements.confirmPaymentMethod.textContent = methodSummary;
    elements.confirmAmountPaid.textContent = formatCurrency(totalAmount);

    elements.checkoutForm.classList.add("d-none");
    elements.successPanel.classList.remove("d-none");

    elements.orderTicketsPill.textContent = "Paid";
    elements.payNowBtn.disabled = true;
    elements.payNowBtn.textContent = "Order Paid";
    if (elements.backToCartLink) {
      elements.backToCartLink.classList.add("d-none");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function attachInputListeners() {
    elements.paymentRadios.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        setPaymentMethod(event.target.value);
      });
    });

    if (elements.cardNumber) {
      elements.cardNumber.addEventListener("input", formatCardNumberInput);
    }
    if (elements.cardExpiry) {
      elements.cardExpiry.addEventListener("input", formatExpiryInput);
    }
    if (elements.cardCvv) {
      elements.cardCvv.addEventListener("input", formatCvvInput);
    }

    // Clear invalid state when the user edits a field
    if (elements.checkoutForm) {
      elements.checkoutForm.addEventListener("input", (event) => {
        const target = event.target;
        if (target && target.classList && target.classList.contains("is-invalid")) {
          target.classList.remove("is-invalid");
        }
      });

      elements.checkoutForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (state.orderCompleted) {
          return;
        }

        if (state.items.length === 0) {
          showFeedback("Your cart is empty. Please add concert tickets before paying.");
          return;
        }

        if (!validateCheckoutForm()) {
          showFeedback("Please review the highlighted billing and payment fields.");
          return;
        }

        completeOrder();
      });
    }
  }

  function initCheckoutPage() {
    if (!elements.checkoutForm || !elements.orderItemsList) {
      return;
    }

    loadCartItems();
    prefillFromUserSession();
    setPaymentMethod("card");
    attachInputListeners();

    window.addEventListener("storage", (event) => {
      const cartKey = getStorageKey("CART", "sonora_cart");
      if (event.key === cartKey && !state.orderCompleted) {
        loadCartItems();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initCheckoutPage);
})();
