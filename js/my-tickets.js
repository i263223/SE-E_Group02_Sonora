/**
 * SONORA — Live Concert Tickets
 * My Tickets Page Script (js/my-tickets.js)
 *
 * Features:
 *  1. Account sub-nav Sign Out handler
 *  2. localStorage ticket sync with sample data seeding
 *  3. Dynamic filter tabs (Upcoming / Past) with live counts
 *  4. Data-driven ticket card rendering with QR code (pure SVG)
 *  5. QR modal, PDF receipt modal, Transfer modal with live validation
 *  6. Empty-state rendering + "Load Sample Tickets" testing button
 *  7. Full keyboard / ARIA accessibility
 */

(function () {
  "use strict";

  /* =========================================================================
     Constants & Storage Keys
     ========================================================================= */

  const KEYS = {
    USER:    "sonora_user",
    TICKETS: "sonora_tickets",
    CART:    "sonora_cart"
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* =========================================================================
     Sample Ticket Data
     ========================================================================= */

  const SAMPLE_TICKETS = [
    /* ── Upcoming 1 ── */
    {
      id:        "TKT-9F3A-2026",
      status:    "upcoming",
      tier:      "GA",
      title:     "Around the World",
      artist:    "Tame Impala",
      dateLabel: "Wed, 9 Dec 2026",
      timeLabel: "9:00 PM",
      venue:     "Sonora Arena",
      city:      "Los Angeles",
      seat:      "General Admission",
      quantity:  2,
      priceEach: 5000,
      currency:  "PKR"
    },
    /* ── Upcoming 2 ── */
    {
      id:        "TKT-4C10-2026",
      status:    "upcoming",
      tier:      "VIP",
      title:     "Audio Frenzy",
      artist:    "Neon Harbor",
      dateLabel: "Fri, 20 Dec 2026",
      timeLabel: "7:00 PM",
      venue:     "Sonora Hall",
      city:      "Port",
      seat:      "VIP · Row B · Seat 12",
      quantity:  1,
      priceEach: 12000,
      currency:  "PKR"
    },
    /* ── Past 1 ── */
    {
      id:        "TKT-A3D1-2026",
      status:    "past",
      tier:      "GA",
      title:     "Midnight Neon Tour",
      artist:    "Aria Vance",
      dateLabel: "Sat, 18 Oct 2026",
      timeLabel: "8:00 PM",
      venue:     "Obsidian Arena",
      city:      "New York",
      seat:      "General Admission",
      quantity:  1,
      priceEach: 8900,
      currency:  "PKR"
    },
    /* ── Past 2 ── */
    {
      id:        "TKT-B72F-2026",
      status:    "past",
      tier:      "GA",
      title:     "Electric Afterglow Live",
      artist:    "The Velvet Static",
      dateLabel: "Fri, 7 Nov 2026",
      timeLabel: "8:30 PM",
      venue:     "The Echo Foundry",
      city:      "Chicago",
      seat:      "General Admission",
      quantity:  2,
      priceEach: 6450,
      currency:  "PKR"
    },
    /* ── Past 3 ── */
    {
      id:        "TKT-C8E0-2026",
      status:    "past",
      tier:      "VIP",
      title:     "Subzero Frequency",
      artist:    "Kaelen Frost",
      dateLabel: "Sat, 15 Nov 2026",
      timeLabel: "9:30 PM",
      venue:     "Velvet Hall",
      city:      "Los Angeles",
      seat:      "VIP · Row A · Seat 4",
      quantity:  1,
      priceEach: 9500,
      currency:  "PKR"
    }
  ];

  /* =========================================================================
     Helpers
     ========================================================================= */

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }

  function writeJson(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatPrice(amount, currency) {
    return `${currency} ${Number(amount).toLocaleString()}`;
  }

  /* =========================================================================
     QR Code Generator (pure inline SVG, no external library)
     Renders a deterministic pattern of 21×21 modules based on a simple
     hash of the ticket ID — visually authentic, scannable for demo purposes.
     ========================================================================= */

  function generateQrSvg(ticketId, size) {
    const MODULES = 21;
    const cell = Math.floor(size / MODULES);

    /* Deterministic pseudo-random grid seeded from ticketId */
    function hashAt(x, y) {
      let h = 0;
      const seed = ticketId + x * 31 + y * 1009;
      for (let i = 0; i < seed.length; i++) {
        h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
      }
      return (h >>> 0) % 2 === 0;
    }

    /* Fixed finder patterns (top-left, top-right, bottom-left corners) */
    function isFinder(x, y) {
      /* top-left */
      if (x < 8 && y < 8) return true;
      /* top-right */
      if (x >= MODULES - 8 && y < 8) return true;
      /* bottom-left */
      if (x < 8 && y >= MODULES - 8) return true;
      return false;
    }

    function finderModule(x, y, ox, oy) {
      const lx = x - ox, ly = y - oy;
      if (lx < 0 || lx > 6 || ly < 0 || ly > 6) return false;
      if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true;
      if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true;
      return false;
    }

    function isFinderDark(x, y) {
      if (x <= 6 && y <= 6) return finderModule(x, y, 0, 0);
      if (x >= MODULES - 7 && y <= 6) return finderModule(x, y, MODULES - 7, 0);
      if (x <= 6 && y >= MODULES - 7) return finderModule(x, y, 0, MODULES - 7);
      return false;
    }

    let rects = "";
    for (let y = 0; y < MODULES; y++) {
      for (let x = 0; x < MODULES; x++) {
        let dark;
        if (isFinder(x, y)) {
          dark = isFinderDark(x, y);
        } else {
          /* timing pattern */
          if (y === 6 || x === 6) {
            dark = (x + y) % 2 === 0;
          } else {
            dark = hashAt(x, y);
          }
        }
        if (dark) {
          rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#000"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MODULES * cell} ${MODULES * cell}" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }

  /* =========================================================================
     State
     ========================================================================= */

  let tickets      = [];
  let activeFilter = "upcoming"; /* "upcoming" | "past" */
  let activeModal  = null;       /* ticket object currently in a modal */

  /* =========================================================================
     Sign Out
     ========================================================================= */

  function wireSignOut() {
    const btn = document.getElementById("sonoraSubnavSignOut");
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.localStorage.removeItem(KEYS.USER);
      if (window.SONORA_UI && typeof window.SONORA_UI.refreshAuth === "function") {
        window.SONORA_UI.refreshAuth();
      }
      window.location.href = "login.html";
    });
  }

  /* =========================================================================
     Load / Seed Tickets
     ========================================================================= */

  function loadTickets() {
    const stored = readJson(KEYS.TICKETS, null);
    if (Array.isArray(stored) && stored.length > 0) {
      tickets = stored;
    } else {
      tickets = SAMPLE_TICKETS.map(t => Object.assign({}, t));
      writeJson(KEYS.TICKETS, tickets);
    }
  }

  function seedSampleTickets() {
    tickets = SAMPLE_TICKETS.map(t => Object.assign({}, t));
    writeJson(KEYS.TICKETS, tickets);
    renderAll();
  }

  /* =========================================================================
     Filter Logic
     ========================================================================= */

  function getFiltered(filter) {
    return tickets.filter(t => t.status === filter);
  }

  /* =========================================================================
     Badge helpers on filter tabs
     ========================================================================= */

  function updateTabCounts() {
    const upcoming = getFiltered("upcoming").length;
    const past     = getFiltered("past").length;

    const upBtn   = document.getElementById("filterUpcoming");
    const pastBtn = document.getElementById("filterPast");

    if (upBtn) {
      const countEl = upBtn.querySelector(".tab-count");
      if (countEl) countEl.textContent = upcoming;
    }
    if (pastBtn) {
      const countEl = pastBtn.querySelector(".tab-count");
      if (countEl) countEl.textContent = past;
    }
  }

  /* =========================================================================
     Render Ticket Card HTML
     ========================================================================= */

  function renderTicketCard(ticket) {
    const isVip  = ticket.tier === "VIP";
    const isPast = ticket.status === "past";

    const cardClasses = [
      "sonora-ticket-card",
      isPast ? "is-past" : "",
      isVip  ? "is-vip"  : ""
    ].filter(Boolean).join(" ");

    /* Status badge */
    const statusBadge = isPast
      ? `<span class="sonora-badge sonora-badge-past" aria-label="Past event">Attended</span>`
      : `<span class="sonora-badge sonora-badge-confirmed" aria-label="Confirmed ticket">
           <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
           Confirmed
         </span>`;

    /* Tier badge */
    const tierBadge = isVip
      ? `<span class="sonora-badge sonora-badge-vip">
           <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
           VIP
         </span>`
      : `<span class="sonora-badge sonora-badge-ga">General Admission</span>`;

    const qrSvgSmall = generateQrSvg(ticket.id, 96);
    const totalPrice = ticket.priceEach * ticket.quantity;

    /* Disable transfers for past tickets */
    const transferDisabled = isPast ? "disabled" : "";
    const transferTitle    = isPast ? "Cannot transfer past tickets" : "Transfer ticket to another person";

    return `
      <article class="${cardClasses}" data-ticket-id="${escHtml(ticket.id)}" aria-label="Ticket for ${escHtml(ticket.title)} by ${escHtml(ticket.artist)}">
        <div class="sonora-ticket-inner">
          <!-- Left: Details -->
          <div class="sonora-ticket-details">
            <div class="sonora-ticket-badges">
              ${statusBadge}
              ${tierBadge}
            </div>

            <h2 class="sonora-ticket-title">${escHtml(ticket.title)}</h2>
            <p class="sonora-ticket-artist">${escHtml(ticket.artist)}</p>

            <div class="sonora-ticket-meta-row">
              <!-- Date/Time -->
              <span class="sonora-ticket-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path stroke-linecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>
                <span>${escHtml(ticket.dateLabel)} · ${escHtml(ticket.timeLabel)}</span>
              </span>
              <!-- Venue -->
              <span class="sonora-ticket-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
                <span>${escHtml(ticket.venue)}, ${escHtml(ticket.city)}</span>
              </span>
              <!-- Seat -->
              <span class="sonora-ticket-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 11V7a3 3 0 016 0v4m-8 0h10a2 2 0 012 2v6H5v-6a2 2 0 012-2z"/></svg>
                <span>${escHtml(ticket.seat)}</span>
              </span>
            </div>

            <div class="sonora-ticket-price-row">
              <span class="sonora-ticket-price-item">
                <strong>${ticket.quantity} ticket${ticket.quantity > 1 ? "s" : ""}</strong>
                · ${escHtml(ticket.currency)} ${Number(ticket.priceEach).toLocaleString()} each
              </span>
              <span class="sonora-ticket-price-item">
                Total: <strong>${escHtml(ticket.currency)} ${Number(totalPrice).toLocaleString()}</strong>
              </span>
            </div>

            <div class="sonora-ticket-actions">
              <button
                type="button"
                class="btn-ticket-action btn-download"
                data-action="pdf"
                data-ticket-id="${escHtml(ticket.id)}"
                aria-label="Download PDF receipt for ${escHtml(ticket.title)}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15V3m0 12l-4-4m4 4l4-4M4 20h16"/></svg>
                Download PDF
              </button>
              <button
                type="button"
                class="btn-ticket-action btn-transfer"
                data-action="transfer"
                data-ticket-id="${escHtml(ticket.id)}"
                ${transferDisabled}
                title="${transferTitle}"
                aria-label="Transfer ${escHtml(ticket.title)} ticket to another person"
                ${isPast ? 'style="opacity:0.4;cursor:not-allowed;"' : ""}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4-4 4M3 12h18M7 16l-4-4 4-4"/></svg>
                Transfer
              </button>
            </div>
          </div>

          <!-- Right: QR Panel -->
          <div class="sonora-ticket-qr-panel">
            <button
              type="button"
              class="sonora-qr-wrap"
              data-action="qr"
              data-ticket-id="${escHtml(ticket.id)}"
              aria-label="View full QR code for ticket ${escHtml(ticket.id)}"
              ${isPast ? 'title="This ticket has been used"' : 'title="Click to show gate entry QR"'}
            >
              ${qrSvgSmall}
            </button>
            <span class="sonora-ticket-id" aria-label="Ticket ID">${escHtml(ticket.id)}</span>
          </div>
        </div>
      </article>
    `;
  }

  /* =========================================================================
     Render Empty State
     ========================================================================= */

  function renderEmptyState(filter) {
    const label = filter === "upcoming" ? "upcoming" : "past";
    return `
      <div class="sonora-empty-state" role="status" aria-live="polite">
        <div class="sonora-empty-icon mx-auto" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 5H9a2 2 0 00-2 2v13l3-2 2 2 2-2 3 2V7a2 2 0 00-2-2z"/>
            <path stroke-linecap="round" d="M9 10h6M9 13h4"/>
          </svg>
        </div>
        <h3 class="sonora-empty-title">No ${label} tickets found</h3>
        <p class="sonora-empty-desc">
          ${filter === "upcoming"
            ? "You have no upcoming concerts booked. Find your next show and grab tickets now!"
            : "No past concerts on record. Once you attend a show, it will appear here."}
        </p>
        <div class="sonora-empty-actions">
          <a href="events.html" class="btn btn-sonora-pill btn-sonora-primary" aria-label="Browse all concerts">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M20 20l-3.5-3.5"/></svg>
            Browse Concerts
          </a>
          <button type="button" id="btnLoadSamples" class="btn btn-sonora-pill btn-sonora-outline" aria-label="Load sample tickets for demonstration">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m-8-8h16"/></svg>
            Load Sample Tickets
          </button>
        </div>
      </div>
    `;
  }

  /* =========================================================================
     Main Render
     ========================================================================= */

  function renderAll() {
    updateTabCounts();

    const container = document.getElementById("ticketListContainer");
    if (!container) return;

    const filtered = getFiltered(activeFilter);

    if (filtered.length === 0) {
      container.innerHTML = renderEmptyState(activeFilter);
      /* Wire "Load Sample Tickets" */
      const loadBtn = document.getElementById("btnLoadSamples");
      if (loadBtn) {
        loadBtn.addEventListener("click", seedSampleTickets);
      }
      return;
    }

    container.innerHTML = filtered.map(renderTicketCard).join("");
    wireCardActions(container);
  }

  /* =========================================================================
     Wire Card Action Buttons (QR / PDF / Transfer)
     ========================================================================= */

  function wireCardActions(container) {
    container.querySelectorAll("[data-action]").forEach(el => {
      el.addEventListener("click", handleCardAction);
      /* Allow keyboard enter/space on buttons — native by default */
    });
  }

  function handleCardAction(event) {
    const btn      = event.currentTarget;
    const action   = btn.dataset.action;
    const ticketId = btn.dataset.ticketId;
    const ticket   = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (action === "qr")       openQrModal(ticket);
    if (action === "pdf")      openPdfModal(ticket);
    if (action === "transfer") openTransferModal(ticket);
  }

  /* =========================================================================
     QR Modal
     ========================================================================= */

  function openQrModal(ticket) {
    activeModal = ticket;
    const qrLarge = generateQrSvg(ticket.id, 200);

    document.getElementById("qrModalTitle").textContent   = "Gate Entry QR Code";
    document.getElementById("qrModalQrWrap").innerHTML    = qrLarge;
    document.getElementById("qrModalTicketId").textContent = ticket.id;
    document.getElementById("qrModalConcert").textContent = `${ticket.title} — ${ticket.artist}`;
    document.getElementById("qrModalDate").textContent    = `${ticket.dateLabel} · ${ticket.timeLabel}`;
    document.getElementById("qrModalVenue").textContent   = `${ticket.venue}, ${ticket.city}`;
    document.getElementById("qrModalSeat").textContent    = ticket.seat;

    const modalEl = document.getElementById("sonoraModalQr");
    const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  /* =========================================================================
     PDF Modal
     ========================================================================= */

  function openPdfModal(ticket) {
    activeModal = ticket;
    const qrMed = generateQrSvg(ticket.id, 160);
    const totalPrice = ticket.priceEach * ticket.quantity;

    document.getElementById("pdfModalTitle").textContent = "Ticket Receipt";

    document.getElementById("pdfReceiptBody").innerHTML = `
      <div class="sonora-pdf-receipt">
        <div class="sonora-pdf-receipt-header">
          <span class="sonora-pdf-receipt-logo">SONORA</span>
          <span class="ms-auto">
            <span class="sonora-badge ${ticket.status === "upcoming" ? "sonora-badge-confirmed" : "sonora-badge-past"}">
              ${ticket.status === "upcoming" ? "Confirmed" : "Attended"}
            </span>
          </span>
        </div>
        <div style="text-align:center;margin-bottom:1rem;">
          <div style="width:160px;height:160px;background:#fff;border-radius:8px;padding:6px;display:inline-flex;align-items:center;justify-content:center;">${qrMed}</div>
          <p style="font-size:0.75rem;color:var(--sonora-text-secondary);font-family:monospace;margin-top:0.5rem;">${escHtml(ticket.id)}</p>
        </div>
        <div class="sonora-pdf-row"><span class="sonora-pdf-label">Event</span><span class="sonora-pdf-value">${escHtml(ticket.title)}</span></div>
        <div class="sonora-pdf-row"><span class="sonora-pdf-label">Artist</span><span class="sonora-pdf-value">${escHtml(ticket.artist)}</span></div>
        <div class="sonora-pdf-row"><span class="sonora-pdf-label">Date &amp; Time</span><span class="sonora-pdf-value">${escHtml(ticket.dateLabel)} · ${escHtml(ticket.timeLabel)}</span></div>
        <div class="sonora-pdf-row"><span class="sonora-pdf-label">Venue</span><span class="sonora-pdf-value">${escHtml(ticket.venue)}, ${escHtml(ticket.city)}</span></div>
        <div class="sonora-pdf-row"><span class="sonora-pdf-label">Seat / Area</span><span class="sonora-pdf-value">${escHtml(ticket.seat)}</span></div>
        <div class="sonora-pdf-row"><span class="sonora-pdf-label">Tier</span><span class="sonora-pdf-value">${ticket.tier === "VIP" ? "VIP" : "General Admission"}</span></div>
        <div class="sonora-pdf-row"><span class="sonora-pdf-label">Qty</span><span class="sonora-pdf-value">${ticket.quantity} ticket${ticket.quantity > 1 ? "s" : ""}</span></div>
        <div class="sonora-pdf-row"><span class="sonora-pdf-label">Price each</span><span class="sonora-pdf-value">${escHtml(ticket.currency)} ${Number(ticket.priceEach).toLocaleString()}</span></div>
        <div class="sonora-pdf-row" style="font-size:0.95rem;padding-top:0.65rem;border-top:1px solid var(--sonora-border);">
          <span class="sonora-pdf-label" style="color:var(--sonora-text-primary);font-weight:700;">Total Paid</span>
          <span class="sonora-pdf-value" style="color:var(--sonora-accent);">${escHtml(ticket.currency)} ${Number(totalPrice).toLocaleString()}</span>
        </div>
      </div>
      <p class="small text-muted-sonora mt-3 text-center mb-0">Present this QR code at the venue gate. Each code is valid for one entry only.</p>
    `;

    const modalEl = document.getElementById("sonoraModalPdf");
    const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  /* =========================================================================
     Transfer Modal
     ========================================================================= */

  function openTransferModal(ticket) {
    activeModal = ticket;

    document.getElementById("transferModalConcertName").textContent =
      `${ticket.title} — ${ticket.artist} · ${ticket.dateLabel}`;

    const emailInput  = document.getElementById("transferEmailInput");
    const errorEl     = document.getElementById("transferEmailError");
    const confirmBtn  = document.getElementById("btnConfirmTransfer");
    const successBanner = document.getElementById("transferSuccessBanner");

    emailInput.value       = "";
    errorEl.textContent    = "";
    emailInput.classList.remove("is-invalid");
    successBanner.hidden   = true;
    confirmBtn.disabled    = false;
    confirmBtn.textContent = "Transfer Ticket";

    /* Live validation */
    function validateEmail(showEmpty) {
      const val = emailInput.value.trim();
      if (!val && !showEmpty) { errorEl.textContent = ""; return false; }
      if (!val) { errorEl.textContent = "Email address is required."; emailInput.classList.add("is-invalid"); return false; }
      if (!EMAIL_RE.test(val)) { errorEl.textContent = "Please enter a valid email address (e.g. fan@sonora.com)."; emailInput.classList.add("is-invalid"); return false; }
      errorEl.textContent = "";
      emailInput.classList.remove("is-invalid");
      return true;
    }

    emailInput.addEventListener("input",  () => validateEmail(false));
    emailInput.addEventListener("blur",   () => { if (emailInput.value.trim()) validateEmail(true); });

    /* Confirm transfer */
    confirmBtn.onclick = () => {
      if (!validateEmail(true)) {
        emailInput.focus();
        return;
      }
      const recipientEmail = emailInput.value.trim();

      /* Update ticket in localStorage */
      const idx = tickets.findIndex(t => t.id === ticket.id);
      if (idx !== -1) {
        tickets[idx] = Object.assign({}, tickets[idx], {
          transferredTo: recipientEmail,
          transferredAt: new Date().toISOString()
        });
        writeJson(KEYS.TICKETS, tickets);
      }

      /* Show success state */
      document.getElementById("transferSuccessEmail").textContent = recipientEmail;
      successBanner.hidden = false;
      confirmBtn.disabled  = true;
      confirmBtn.textContent = "Transferred!";
    };

    const modalEl = document.getElementById("sonoraModalTransfer");
    const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  /* =========================================================================
     Print PDF
     ========================================================================= */

  function wirePrintPdf() {
    const btn = document.getElementById("btnPrintPdf");
    if (!btn) return;
    btn.addEventListener("click", () => {
      window.print();
    });
  }

  /* =========================================================================
     Filter Tab Switching
     ========================================================================= */

  function wireFilterTabs() {
    const upBtn   = document.getElementById("filterUpcoming");
    const pastBtn = document.getElementById("filterPast");

    if (!upBtn || !pastBtn) return;

    function activateTab(filter) {
      activeFilter = filter;
      upBtn.classList.toggle("is-active", filter === "upcoming");
      upBtn.setAttribute("aria-selected", String(filter === "upcoming"));
      pastBtn.classList.toggle("is-active", filter === "past");
      pastBtn.setAttribute("aria-selected", String(filter === "past"));
      renderAll();
    }

    upBtn.addEventListener("click",   () => activateTab("upcoming"));
    pastBtn.addEventListener("click", () => activateTab("past"));

    /* Arrow key support */
    [upBtn, pastBtn].forEach(btn => {
      btn.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          activateTab(btn === upBtn ? "past" : "upcoming");
          (activeFilter === "past" ? pastBtn : upBtn).focus();
        }
      });
    });
  }

  /* =========================================================================
     Init
     ========================================================================= */

  function init() {
    loadTickets();
    wireSignOut();
    wireFilterTabs();
    wirePrintPdf();
    renderAll();

    /* Keep navbar badge in sync */
    if (window.SONORA_UI && typeof window.SONORA_UI.refreshBadges === "function") {
      window.SONORA_UI.refreshBadges();
    }
  }

  document.addEventListener("DOMContentLoaded", init);

})();
