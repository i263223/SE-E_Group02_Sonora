/**
 * SONORA — Live Concert Tickets
 * Page-specific Cart Logic (pages/cart.html)
 */

(function () {
  "use strict";

  const MAX_TICKETS_PER_ORDER = 8;

  const elements = {
    cartItemCountPill: document.getElementById("cartItemCountPill"),
    clearCartBtn: document.getElementById("clearCartBtn"),
    cartFeedbackBanner: document.getElementById("cartFeedbackBanner"),
    cartEmptyState: document.getElementById("cartEmptyState"),
    cartItemsList: document.getElementById("cartItemsList"),
    summaryTicketsPill: document.getElementById("summaryTicketsPill"),
    summaryEmptyState: document.getElementById("summaryEmptyState"),
    summaryDetails: document.getElementById("summaryDetails"),
    summaryLineItems: document.getElementById("summaryLineItems"),
    summaryTicketCount: document.getElementById("summaryTicketCount"),
    summarySubtotal: document.getElementById("summarySubtotal"),
    summaryTotal: document.getElementById("summaryTotal"),
    proceedCheckoutBtn: document.getElementById("proceedCheckoutBtn")
  };

  function getCartStorageKey() {
    return (
      (window.SONORA_UI &&
        window.SONORA_UI.STORAGE_KEYS &&
        window.SONORA_UI.STORAGE_KEYS.CART) ||
      "sonora_cart"
    );
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

  function readCart() {
    try {
      const raw = window.localStorage.getItem(getCartStorageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeCart(items) {
    window.localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
    if (window.SONORA_UI && typeof window.SONORA_UI.refreshBadges === "function") {
      window.SONORA_UI.refreshBadges();
    }
  }

  function showFeedback(message) {
    if (!elements.cartFeedbackBanner) {
      return;
    }
    if (!message) {
      elements.cartFeedbackBanner.classList.add("d-none");
      elements.cartFeedbackBanner.textContent = "";
      return;
    }
    elements.cartFeedbackBanner.classList.remove("d-none");
    elements.cartFeedbackBanner.textContent = message;
  }

  /**
   * Normalizes cart items from seats.js or generic concert items so
   * quantities and subtotals are always consistent.
   */
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
    let gaUnitPrice =
      Number(rawItem.gaUnitPrice) ||
      Number(rawItem.price) ||
      getDefaultGaPrice(concert);

    // Support generic non-seat cart items if added without seats/gaQuantity fields
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
      genre: (concert && concert.genre) || rawItem.genre || "Live Concert",
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

  function persistMutatedItem(rawCart, index, updatedSeats, updatedGaQty, itemMeta) {
    const nextCart = rawCart.slice();
    const nextQty = updatedSeats.length + updatedGaQty;

    if (nextQty <= 0) {
      nextCart.splice(index, 1);
    } else {
      const seatsSubtotal = updatedSeats.reduce((sum, s) => sum + s.price, 0);
      const nextSubtotal = seatsSubtotal + updatedGaQty * itemMeta.gaUnitPrice;

      nextCart[index] = Object.assign({}, nextCart[index], {
        seats: updatedSeats,
        gaQuantity: updatedGaQty,
        gaUnitPrice: itemMeta.gaUnitPrice,
        quantity: nextQty,
        subtotal: nextSubtotal
      });
    }

    writeCart(nextCart);
    renderCart();
  }

  function removeSeatFromItem(itemIndex, seatId) {
    const rawCart = readCart();
    const item = normalizeCartItem(rawCart[itemIndex], itemIndex);
    if (!item) {
      return;
    }

    const updatedSeats = item.seats.filter((seat) => seat.seatId !== seatId);
    persistMutatedItem(rawCart, itemIndex, updatedSeats, item.gaQuantity, item);
    showFeedback(`Removed seat ${seatId} from ${item.concertTitle}.`);
  }

  function updateGaQuantity(itemIndex, delta) {
    const rawCart = readCart();
    const item = normalizeCartItem(rawCart[itemIndex], itemIndex);
    if (!item) {
      return;
    }

    const nextGaQty = item.gaQuantity + delta;
    if (nextGaQty < 0) {
      return;
    }
    if (delta > 0 && item.seats.length + nextGaQty > MAX_TICKETS_PER_ORDER) {
      showFeedback(`Maximum ${MAX_TICKETS_PER_ORDER} tickets allowed per concert order.`);
      return;
    }

    persistMutatedItem(rawCart, itemIndex, item.seats, nextGaQty, item);
    showFeedback("");
  }

  function removeCartItem(itemIndex) {
    const rawCart = readCart();
    const target = normalizeCartItem(rawCart[itemIndex], itemIndex);
    rawCart.splice(itemIndex, 1);
    writeCart(rawCart);
    renderCart();
    if (target) {
      showFeedback(`Removed "${target.concertTitle}" from your cart.`);
    }
  }

  function createCartItemCard(item) {
    const article = document.createElement("article");
    article.className = "sonora-cart-item";

    // Header: Concert info + item subtotal + remove item
    const header = document.createElement("div");
    header.className = "sonora-cart-item-header";

    const infoCol = document.createElement("div");

    const badgesWrap = document.createElement("div");
    badgesWrap.className = "d-flex flex-wrap align-items-center gap-2 mb-2";

    const genreTag = document.createElement("span");
    genreTag.className = "sonora-tag";
    genreTag.textContent = item.genre;
    badgesWrap.appendChild(genreTag);

    const qtyBadge = document.createElement("span");
    qtyBadge.className = "small text-muted-sonora";
    qtyBadge.textContent = `${item.quantity} ${item.quantity === 1 ? "ticket" : "tickets"}`;
    badgesWrap.appendChild(qtyBadge);

    infoCol.appendChild(badgesWrap);

    const titleEl = document.createElement("h2");
    titleEl.className = "h5 mb-1";
    const titleLink = document.createElement("a");
    titleLink.className = "sonora-cart-title-link";
    titleLink.href = item.concertId
      ? `seats.html?id=${encodeURIComponent(item.concertId)}`
      : "seats.html";
    titleLink.textContent = item.concertTitle;
    titleEl.appendChild(titleLink);
    infoCol.appendChild(titleEl);

    const metaEl = document.createElement("p");
    metaEl.className = "small text-muted-sonora mb-0";
    metaEl.textContent = `${item.artistName} \u2022 ${item.venueLabel} \u2022 ${formatEventDate(item.date)}`;
    infoCol.appendChild(metaEl);

    const priceCol = document.createElement("div");
    priceCol.className = "sonora-cart-item-price d-flex flex-column align-items-sm-end gap-2";

    const subtotalText = document.createElement("span");
    subtotalText.className = "fs-5 fw-bold text-white";
    subtotalText.textContent = formatCurrency(item.subtotal);
    priceCol.appendChild(subtotalText);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "sonora-cart-remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.setAttribute("aria-label", `Remove ${item.concertTitle} from cart`);
    removeBtn.addEventListener("click", () => removeCartItem(item.index));
    priceCol.appendChild(removeBtn);

    header.appendChild(infoCol);
    header.appendChild(priceCol);
    article.appendChild(header);

    // Body: Reserved Seats chips + General Admission quantity control
    const body = document.createElement("div");
    body.className = "d-flex flex-column gap-3";

    if (item.seats.length > 0) {
      const seatsWrap = document.createElement("div");

      const seatsHeading = document.createElement("p");
      seatsHeading.className = "small text-muted-sonora mb-2";
      seatsHeading.textContent = "Reserved Seats";
      seatsWrap.appendChild(seatsHeading);

      const chipList = document.createElement("div");
      chipList.className = "d-flex flex-wrap gap-2";

      item.seats.forEach((seat) => {
        const chip = document.createElement("span");
        chip.className = "sonora-seat-chip";
        chip.textContent = `${seat.section} ${seat.seatId} (${formatCurrency(seat.price)}) `;

        const chipRemoveBtn = document.createElement("button");
        chipRemoveBtn.type = "button";
        chipRemoveBtn.setAttribute("aria-label", `Remove seat ${seat.seatId}`);
        chipRemoveBtn.textContent = "\u00d7";
        chipRemoveBtn.addEventListener("click", () => removeSeatFromItem(item.index, seat.seatId));

        chip.appendChild(chipRemoveBtn);
        chipList.appendChild(chip);
      });

      seatsWrap.appendChild(chipList);
      body.appendChild(seatsWrap);
    }

    if (item.gaQuantity > 0) {
      const gaRow = document.createElement("div");
      gaRow.className = "sonora-ga-row d-flex flex-wrap align-items-center justify-content-between gap-2";

      const gaInfo = document.createElement("div");
      const gaTitle = document.createElement("div");
      gaTitle.className = "fw-semibold text-white small";
      gaTitle.textContent = item.gaLabel;

      const gaPriceNote = document.createElement("div");
      gaPriceNote.className = "small text-muted-sonora";
      gaPriceNote.textContent = `${formatCurrency(item.gaUnitPrice)} each`;

      gaInfo.appendChild(gaTitle);
      gaInfo.appendChild(gaPriceNote);

      const gaActions = document.createElement("div");
      gaActions.className = "d-flex align-items-center gap-3";

      const qtyControl = document.createElement("div");
      qtyControl.className = "sonora-qty-control";
      qtyControl.setAttribute("role", "group");
      qtyControl.setAttribute("aria-label", `${item.gaLabel} quantity for ${item.concertTitle}`);

      const decBtn = document.createElement("button");
      decBtn.type = "button";
      decBtn.className = "sonora-qty-btn";
      decBtn.textContent = "\u2212";
      decBtn.setAttribute("aria-label", `Decrease ${item.gaLabel} quantity`);
      decBtn.addEventListener("click", () => updateGaQuantity(item.index, -1));

      const qtyDisplay = document.createElement("span");
      qtyDisplay.className = "fw-bold text-white px-1 small";
      qtyDisplay.textContent = String(item.gaQuantity);

      const incBtn = document.createElement("button");
      incBtn.type = "button";
      incBtn.className = "sonora-qty-btn";
      incBtn.textContent = "+";
      incBtn.disabled = item.quantity >= MAX_TICKETS_PER_ORDER;
      incBtn.setAttribute("aria-label", `Increase ${item.gaLabel} quantity`);
      incBtn.addEventListener("click", () => updateGaQuantity(item.index, 1));

      qtyControl.appendChild(decBtn);
      qtyControl.appendChild(qtyDisplay);
      qtyControl.appendChild(incBtn);

      const gaTotalEl = document.createElement("span");
      gaTotalEl.className = "fw-semibold text-white small";
      gaTotalEl.textContent = formatCurrency(item.gaQuantity * item.gaUnitPrice);

      gaActions.appendChild(qtyControl);
      gaActions.appendChild(gaTotalEl);

      gaRow.appendChild(gaInfo);
      gaRow.appendChild(gaActions);
      body.appendChild(gaRow);
    }

    article.appendChild(body);
    return article;
  }

  function renderOrderSummary(items) {
    const totalTickets = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const hasItems = items.length > 0;

    const ticketLabel = `${totalTickets} ${totalTickets === 1 ? "Ticket" : "Tickets"}`;
    elements.cartItemCountPill.textContent = ticketLabel;
    elements.summaryTicketsPill.textContent = ticketLabel;

    elements.clearCartBtn.classList.toggle("d-none", !hasItems);
    elements.cartEmptyState.classList.toggle("d-none", hasItems);
    elements.cartItemsList.classList.toggle("d-none", !hasItems);

    elements.summaryEmptyState.classList.toggle("d-none", hasItems);
    elements.summaryDetails.classList.toggle("d-none", !hasItems);

    elements.summaryLineItems.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "sonora-summary-line";

      const labelWrap = document.createElement("div");
      const titleSpan = document.createElement("div");
      titleSpan.className = "text-white fw-semibold";
      titleSpan.textContent = item.concertTitle;

      const countSpan = document.createElement("div");
      countSpan.className = "text-muted-sonora small";
      countSpan.textContent = `${item.quantity} ${item.quantity === 1 ? "ticket" : "tickets"}`;

      labelWrap.appendChild(titleSpan);
      labelWrap.appendChild(countSpan);

      const amountSpan = document.createElement("span");
      amountSpan.className = "text-white fw-semibold";
      amountSpan.textContent = formatCurrency(item.subtotal);

      li.appendChild(labelWrap);
      li.appendChild(amountSpan);
      elements.summaryLineItems.appendChild(li);
    });

    elements.summaryTicketCount.textContent = String(totalTickets);
    elements.summarySubtotal.textContent = formatCurrency(totalAmount);
    elements.summaryTotal.textContent = formatCurrency(totalAmount);

    if (hasItems) {
      const singleConcertId = items.length === 1 && items[0].concertId ? items[0].concertId : "";
      elements.proceedCheckoutBtn.href = singleConcertId
        ? `checkout.html?id=${encodeURIComponent(singleConcertId)}`
        : "checkout.html";
      elements.proceedCheckoutBtn.classList.remove("disabled");
      elements.proceedCheckoutBtn.setAttribute("aria-disabled", "false");
      elements.proceedCheckoutBtn.removeAttribute("tabindex");
    } else {
      elements.proceedCheckoutBtn.href = "checkout.html";
      elements.proceedCheckoutBtn.classList.add("disabled");
      elements.proceedCheckoutBtn.setAttribute("aria-disabled", "true");
      elements.proceedCheckoutBtn.setAttribute("tabindex", "-1");
    }
  }

  function renderCart() {
    const rawCart = readCart();
    const normalizedItems = rawCart
      .map((item, idx) => normalizeCartItem(item, idx))
      .filter(Boolean);

    elements.cartItemsList.innerHTML = "";
    normalizedItems.forEach((item) => {
      elements.cartItemsList.appendChild(createCartItemCard(item));
    });

    renderOrderSummary(normalizedItems);
  }

  function initCartPage() {
    if (!elements.cartItemsList) {
      return;
    }

    renderCart();

    if (elements.clearCartBtn) {
      elements.clearCartBtn.addEventListener("click", () => {
        writeCart([]);
        renderCart();
        showFeedback("Your cart has been cleared.");
      });
    }

    window.addEventListener("storage", (event) => {
      if (event.key === getCartStorageKey()) {
        renderCart();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initCartPage);
})();
