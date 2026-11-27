/**
 * SONORA — Live Concert Tickets
 * Page-specific Seat Selection Logic (pages/seats.html)
 */

(function () {
  "use strict";

  const MAX_TICKETS_PER_ORDER = 8;

  // Seat layouts: 2 rows in VIP (10 seats each), 3 rows in Regular (12 seats each)
  const VIP_ROWS = [
    { label: "V1", count: 10, occupied: [4, 5] },
    { label: "V2", count: 10, occupied: [2, 8, 9] }
  ];

  const REGULAR_ROWS = [
    { label: "R1", count: 12, occupied: [5, 6, 7] },
    { label: "R2", count: 12, occupied: [1, 10, 11] },
    { label: "R3", count: 12, occupied: [3, 4] }
  ];

  const state = {
    concert: null,
    selectedSeats: new Map(), // key: seatId -> { id, section, row, number, price }
    gaQuantity: 0
  };

  const elements = {
    concertHeading: document.getElementById("concertHeading"),
    concertGenreTag: document.getElementById("concertGenreTag"),
    concertAvailabilityTag: document.getElementById("concertAvailabilityTag"),
    concertMeta: document.getElementById("concertMeta"),
    concertDetailsLink: document.getElementById("concertDetailsLink"),
    concertSelector: document.getElementById("concertSelector"),
    vipPriceLabel: document.getElementById("vipPriceLabel"),
    regularPriceLabel: document.getElementById("regularPriceLabel"),
    gaPriceLabel: document.getElementById("gaPriceLabel"),
    vipSeatRows: document.getElementById("vipSeatRows"),
    regularSeatRows: document.getElementById("regularSeatRows"),
    gaDecreaseBtn: document.getElementById("gaDecreaseBtn"),
    gaIncreaseBtn: document.getElementById("gaIncreaseBtn"),
    gaCountDisplay: document.getElementById("gaCountDisplay"),
    selectionCountPill: document.getElementById("selectionCountPill"),
    selectionEmptyState: document.getElementById("selectionEmptyState"),
    selectionDetails: document.getElementById("selectionDetails"),
    selectedItemsChips: document.getElementById("selectedItemsChips"),
    subtotalValue: document.getElementById("subtotalValue"),
    totalValue: document.getElementById("totalValue"),
    selectionAlert: document.getElementById("selectionAlert"),
    addToCartBtn: document.getElementById("addToCartBtn")
  };

  function formatCurrency(amount) {
    return `$${Number(amount).toFixed(2)}`;
  }

  function formatEventDate(isoDate) {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      return isoDate;
    }
    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function getTierPrices(basePrice) {
    const regular = Number(basePrice) || 75;
    const vip = Math.round(regular * 1.65);
    const ga = Math.max(25, Math.round(regular * 0.7));
    return { vip, regular, ga };
  }

  function getTotalSelectedCount() {
    return state.selectedSeats.size + state.gaQuantity;
  }

  function showAlert(message, isSuccess) {
    if (!message) {
      elements.selectionAlert.classList.add("d-none");
      elements.selectionAlert.innerHTML = "";
      return;
    }
    elements.selectionAlert.classList.remove("d-none");
    elements.selectionAlert.style.borderColor = isSuccess
      ? "rgba(255, 255, 255, 0.25)"
      : "rgba(225, 29, 72, 0.45)";
    elements.selectionAlert.innerHTML = message;
  }

  function renderConcertHeader() {
    const concert = state.concert;
    const artist = SONORA_DATA.getArtistById(concert.artistId);
    const venue = SONORA_DATA.getVenueById(concert.venueId);
    const prices = getTierPrices(concert.price);

    elements.concertHeading.textContent = concert.title;
    elements.concertGenreTag.textContent = concert.genre;
    elements.concertAvailabilityTag.textContent = `${concert.seatsAvailable} tickets remaining`;

    const artistName = artist ? artist.name : "Featured Artist";
    const venueLabel = venue ? `${venue.name}, ${venue.city}` : concert.city;
    elements.concertMeta.textContent = `${artistName} \u2022 ${venueLabel} \u2022 ${formatEventDate(concert.date)}`;
    elements.concertDetailsLink.href = `event-details.html?id=${encodeURIComponent(concert.id)}`;

    elements.vipPriceLabel.textContent = formatCurrency(prices.vip);
    elements.regularPriceLabel.textContent = formatCurrency(prices.regular);
    elements.gaPriceLabel.textContent = formatCurrency(prices.ga);
    document.title = `Select Seats: ${concert.title} | SONORA — Live Concert Tickets`;
  }

  function createSeatButton(sectionName, rowLabel, seatNum, isOccupied, price, isVip) {
    const seatId = `${rowLabel}-${seatNum}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `sonora-seat${isVip ? " sonora-seat--vip" : ""}${isOccupied ? " is-occupied" : ""}`;
    button.textContent = String(seatNum);
    button.dataset.seatId = seatId;

    if (isOccupied) {
      button.disabled = true;
      button.setAttribute("aria-label", `${sectionName} Row ${rowLabel} Seat ${seatNum} — Reserved`);
    } else {
      button.setAttribute(
        "aria-label",
        `${sectionName} Row ${rowLabel} Seat ${seatNum} — ${formatCurrency(price)} — Available`
      );
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        toggleSeat({
          id: seatId,
          section: sectionName,
          row: rowLabel,
          number: seatNum,
          price: price
        }, button);
      });
    }

    return button;
  }

  function renderSeatSection(container, rowsConfig, sectionName, unitPrice, isVip) {
    container.innerHTML = "";

    rowsConfig.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "sonora-seat-row";

      const labelEl = document.createElement("span");
      labelEl.className = "sonora-row-label";
      labelEl.textContent = row.label;
      rowEl.appendChild(labelEl);

      const seatsWrap = document.createElement("div");
      seatsWrap.className = "sonora-row-seats";

      const midpoint = Math.floor(row.count / 2);
      for (let seatNum = 1; seatNum <= row.count; seatNum += 1) {
        if (seatNum === midpoint + 1) {
          const aisle = document.createElement("span");
          aisle.className = "sonora-aisle-gap";
          aisle.setAttribute("aria-hidden", "true");
          seatsWrap.appendChild(aisle);
        }

        const isOccupied = row.occupied.includes(seatNum);
        const seatBtn = createSeatButton(sectionName, row.label, seatNum, isOccupied, unitPrice, isVip);
        seatsWrap.appendChild(seatBtn);
      }

      rowEl.appendChild(seatsWrap);
      container.appendChild(rowEl);
    });
  }

  function toggleSeat(seatInfo, buttonEl) {
    showAlert("", false);

    if (state.selectedSeats.has(seatInfo.id)) {
      state.selectedSeats.delete(seatInfo.id);
      buttonEl.classList.remove("is-selected");
      buttonEl.setAttribute("aria-pressed", "false");
    } else {
      if (getTotalSelectedCount() >= MAX_TICKETS_PER_ORDER) {
        showAlert(`You can select up to ${MAX_TICKETS_PER_ORDER} tickets per order.`, false);
        return;
      }
      state.selectedSeats.set(seatInfo.id, seatInfo);
      buttonEl.classList.add("is-selected");
      buttonEl.setAttribute("aria-pressed", "true");
    }

    renderSummary();
  }

  function removeSeatById(seatId) {
    state.selectedSeats.delete(seatId);
    const btn = document.querySelector(`.sonora-seat[data-seat-id="${seatId}"]`);
    if (btn) {
      btn.classList.remove("is-selected");
      btn.setAttribute("aria-pressed", "false");
    }
    showAlert("", false);
    renderSummary();
  }

  function updateGaQuantity(delta) {
    showAlert("", false);
    const nextQty = state.gaQuantity + delta;

    if (nextQty < 0) {
      return;
    }
    if (delta > 0 && getTotalSelectedCount() >= MAX_TICKETS_PER_ORDER) {
      showAlert(`You can select up to ${MAX_TICKETS_PER_ORDER} tickets per order.`, false);
      return;
    }

    state.gaQuantity = nextQty;
    renderSummary();
  }

  function renderSummary() {
    const prices = getTierPrices(state.concert.price);
    const totalCount = getTotalSelectedCount();

    elements.gaCountDisplay.textContent = String(state.gaQuantity);
    elements.gaDecreaseBtn.disabled = state.gaQuantity === 0;
    elements.gaIncreaseBtn.disabled = totalCount >= MAX_TICKETS_PER_ORDER;

    elements.selectionCountPill.textContent = `${totalCount} ${totalCount === 1 ? "Ticket" : "Tickets"}`;

    const hasItems = totalCount > 0;
    elements.selectionEmptyState.classList.toggle("d-none", hasItems);
    elements.selectionDetails.classList.toggle("d-none", !hasItems);
    elements.addToCartBtn.disabled = !hasItems;

    elements.selectedItemsChips.innerHTML = "";
    let subtotal = 0;

    state.selectedSeats.forEach((seat) => {
      subtotal += seat.price;
      const chip = document.createElement("span");
      chip.className = "sonora-selected-chip";
      chip.textContent = `${seat.section} ${seat.id} (${formatCurrency(seat.price)}) `;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("aria-label", `Remove seat ${seat.id}`);
      removeBtn.textContent = "\u00d7";
      removeBtn.addEventListener("click", () => removeSeatById(seat.id));

      chip.appendChild(removeBtn);
      elements.selectedItemsChips.appendChild(chip);
    });

    if (state.gaQuantity > 0) {
      const gaSubtotal = state.gaQuantity * prices.ga;
      subtotal += gaSubtotal;

      const gaChip = document.createElement("span");
      gaChip.className = "sonora-selected-chip";
      gaChip.textContent = `General Admission \u00d7${state.gaQuantity} (${formatCurrency(gaSubtotal)}) `;

      const removeGaBtn = document.createElement("button");
      removeGaBtn.type = "button";
      removeGaBtn.setAttribute("aria-label", "Remove General Admission passes");
      removeGaBtn.textContent = "\u00d7";
      removeGaBtn.addEventListener("click", () => {
        state.gaQuantity = 0;
        showAlert("", false);
        renderSummary();
      });

      gaChip.appendChild(removeGaBtn);
      elements.selectedItemsChips.appendChild(gaChip);
    }

    const grandTotal = subtotal;

    elements.subtotalValue.textContent = formatCurrency(subtotal);
    elements.totalValue.textContent = formatCurrency(grandTotal);
  }

  function saveSelectionToCart() {
    const prices = getTierPrices(state.concert.price);
    const cartKey = (window.SONORA_UI && window.SONORA_UI.STORAGE_KEYS.CART) || "sonora_cart";
    let existingCart = [];

    try {
      const raw = window.localStorage.getItem(cartKey);
      existingCart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(existingCart)) {
        existingCart = [];
      }
    } catch (error) {
      existingCart = [];
    }

    const seatList = Array.from(state.selectedSeats.values()).map((seat) => ({
      seatId: seat.id,
      section: seat.section,
      price: seat.price
    }));

    const orderItem = {
      id: `${state.concert.id}-${Date.now()}`,
      concertId: state.concert.id,
      concertTitle: state.concert.title,
      date: state.concert.date,
      seats: seatList,
      gaQuantity: state.gaQuantity,
      gaUnitPrice: prices.ga,
      quantity: getTotalSelectedCount(),
      subtotal: seatList.reduce((sum, s) => sum + s.price, 0) + state.gaQuantity * prices.ga
    };

    existingCart.push(orderItem);
    window.localStorage.setItem(cartKey, JSON.stringify(existingCart));

    if (window.SONORA_UI && typeof window.SONORA_UI.refreshBadges === "function") {
      window.SONORA_UI.refreshBadges();
    }
  }

  function clearAllSelections() {
    state.selectedSeats.clear();
    state.gaQuantity = 0;
    document.querySelectorAll(".sonora-seat.is-selected").forEach((btn) => {
      btn.classList.remove("is-selected");
      btn.setAttribute("aria-pressed", "false");
    });
    showAlert("", false);
    renderSummary();
  }

  function loadConcert(concertId) {
    const matched = SONORA_DATA.getConcertById(concertId) || SONORA_DATA.CONCERTS[0];
    state.concert = matched;
    state.selectedSeats.clear();
    state.gaQuantity = 0;

    renderConcertHeader();
    const prices = getTierPrices(matched.price);
    renderSeatSection(elements.vipSeatRows, VIP_ROWS, "VIP", prices.vip, true);
    renderSeatSection(elements.regularSeatRows, REGULAR_ROWS, "Regular", prices.regular, false);
    showAlert("", false);
    renderSummary();
  }

  function populateConcertSelector(initialId) {
    SONORA_DATA.CONCERTS.forEach((concert) => {
      const artist = SONORA_DATA.getArtistById(concert.artistId);
      const option = document.createElement("option");
      option.value = concert.id;
      option.textContent = `${concert.title} — ${artist ? artist.name : concert.city} (${concert.city})`;
      if (concert.id === initialId) {
        option.selected = true;
      }
      elements.concertSelector.appendChild(option);
    });

    elements.concertSelector.addEventListener("change", (event) => {
      loadConcert(event.target.value);
    });
  }

  function initSeatsPage() {
    if (typeof SONORA_DATA === "undefined" || !Array.isArray(SONORA_DATA.CONCERTS) || !SONORA_DATA.CONCERTS.length) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id") || params.get("concert") || SONORA_DATA.CONCERTS[0].id;
    const initialConcert = SONORA_DATA.getConcertById(requestedId) || SONORA_DATA.CONCERTS[0];

    populateConcertSelector(initialConcert.id);
    loadConcert(initialConcert.id);

    elements.gaDecreaseBtn.addEventListener("click", () => updateGaQuantity(-1));
    elements.gaIncreaseBtn.addEventListener("click", () => updateGaQuantity(1));

    elements.addToCartBtn.addEventListener("click", () => {
      if (getTotalSelectedCount() === 0) {
        return;
      }
      saveSelectionToCart();
      clearAllSelections();
      window.location.href = "cart.html";
    });
  }

  document.addEventListener("DOMContentLoaded", initSeatsPage);
})();
