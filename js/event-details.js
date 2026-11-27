/**
 * SONORA — Live Concert Tickets
 * Event Details Page Controller (pages/event-details.html)
 * Reads ?id= from URL (defaults to first concert in CONCERTS when omitted),
 * renders concert banner, title, Date · Time · Venue subtitle, artist lineup cards,
 * seat selection booking action, and savedEvents localStorage toggle.
 */

(function () {
  "use strict";

  const SAVED_EVENTS_KEY = "savedEvents";
  const SELECTED_EVENT_KEY = "sonora_selected_event";
  const DEFAULT_BANNER_FALLBACK = "images/coachella.jpg";
  const SECONDARY_BANNER_FALLBACK = "images/coldplay.jpg";

  /**
   * Resolves a root-relative asset path (e.g., "images/...") for use inside /pages/.
   */
  function resolveAssetPath(assetPath) {
    if (!assetPath) {
      return "";
    }
    if (/^(https?:)?\/\//i.test(assetPath) || assetPath.startsWith("../") || assetPath.startsWith("/")) {
      return assetPath;
    }
    return `../${assetPath}`;
  }

  /**
   * Generates up to 2 uppercase initials from a name for fallback visuals.
   */
  function getInitials(name) {
    const words = String(name || "")
      .trim()
      .split(/\s+/)
      .filter((word) => /[A-Za-z0-9]/.test(word));

    if (!words.length) {
      return "SN";
    }
    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  /**
   * Normalizes a string into a URL-safe slug.
   */
  function toSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Returns concerts array from SONORA_DATA or global CONCERTS.
   */
  function getConcertsList() {
    if (typeof SONORA_DATA !== "undefined") {
      if (Array.isArray(SONORA_DATA.CONCERTS)) {
        return SONORA_DATA.CONCERTS;
      }
      if (Array.isArray(SONORA_DATA.concerts)) {
        return SONORA_DATA.concerts;
      }
    }
    return typeof CONCERTS !== "undefined" && Array.isArray(CONCERTS) ? CONCERTS : [];
  }

  /**
   * Returns artists array from SONORA_DATA or global ARTISTS.
   */
  function getArtistsList() {
    if (typeof SONORA_DATA !== "undefined") {
      if (Array.isArray(SONORA_DATA.ARTISTS)) {
        return SONORA_DATA.ARTISTS;
      }
      if (Array.isArray(SONORA_DATA.artists)) {
        return SONORA_DATA.artists;
      }
    }
    return typeof ARTISTS !== "undefined" && Array.isArray(ARTISTS) ? ARTISTS : [];
  }

  /**
   * Looks up a venue by ID from SONORA_DATA or global VENUES.
   */
  function findVenueById(venueId) {
    if (typeof SONORA_DATA !== "undefined" && typeof SONORA_DATA.getVenueById === "function") {
      const found = SONORA_DATA.getVenueById(venueId);
      if (found) {
        return found;
      }
    }
    const venues =
      typeof SONORA_DATA !== "undefined"
        ? SONORA_DATA.VENUES || SONORA_DATA.venues || []
        : typeof VENUES !== "undefined"
          ? VENUES
          : [];
    const target = String(venueId || "").toLowerCase();
    return venues.find((venue) => String(venue.id).toLowerCase() === target) || null;
  }

  /**
   * Looks up an artist by ID from SONORA_DATA or global ARTISTS.
   */
  function findArtistById(artistId) {
    if (typeof SONORA_DATA !== "undefined" && typeof SONORA_DATA.getArtistById === "function") {
      const found = SONORA_DATA.getArtistById(artistId);
      if (found) {
        return found;
      }
    }
    const target = String(artistId || "").toLowerCase();
    return getArtistsList().find((artist) => String(artist.id).toLowerCase() === target) || null;
  }

  /**
   * Resolves performing artist objects for a concert using lineup array with artistId fallback.
   */
  function resolveConcertLineup(concert) {
    if (typeof SONORA_DATA !== "undefined" && typeof SONORA_DATA.getConcertLineup === "function") {
      const resolved = SONORA_DATA.getConcertLineup(concert);
      if (resolved.length) {
        return resolved;
      }
    }
    const ids =
      Array.isArray(concert.lineup) && concert.lineup.length
        ? concert.lineup
        : concert.artistId
          ? [concert.artistId]
          : [];
    const seen = new Set();
    return ids
      .filter((id) => {
        const key = String(id || "").toLowerCase();
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .map((id) => findArtistById(id))
      .filter(Boolean);
  }

  /**
   * Finds a concert by ?id= query param (defaults to first concert when omitted/empty).
   */
  function resolveConcert(rawId) {
    const concerts = getConcertsList();
    if (!concerts.length) {
      return null;
    }

    if (rawId === null || rawId === undefined || !String(rawId).trim()) {
      return concerts[0] || null;
    }

    const query = String(rawId).trim();
    const normalized = query.toLowerCase();
    const querySlug = toSlug(query);

    const exactMatch = concerts.find((concert) => String(concert.id) === query);
    if (exactMatch) {
      return exactMatch;
    }

    const caseInsensitiveId = concerts.find(
      (concert) => String(concert.id || "").toLowerCase() === normalized
    );
    if (caseInsensitiveId) {
      return caseInsensitiveId;
    }

    return (
      concerts.find((concert) => {
        const titleLower = String(concert.title || "").toLowerCase();
        return titleLower === normalized || (querySlug && toSlug(concert.title) === querySlug);
      }) || null
    );
  }

  /**
   * Formats an ISO date string into readable date and time parts.
   */
  function formatEventDateTime(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return {
        dateLabel: "Date TBA",
        timeLabel: "Time TBA"
      };
    }

    return {
      dateLabel: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      timeLabel: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
    };
  }

  /**
   * Renders the concert banner with image -> bannerFallback -> monogram visual fallback chain.
   */
  function renderEventBanner(bannerEl, concert, lineup) {
    bannerEl.textContent = "";

    const renderGraphicFallback = () => {
      bannerEl.textContent = "";
      const fallback = document.createElement("div");
      fallback.className = "sonora-event-banner-fallback";

      const monogram = document.createElement("span");
      monogram.className = "sonora-event-banner-monogram";
      monogram.textContent = getInitials(concert.title);

      const label = document.createElement("span");
      label.className = "sonora-tag";
      label.textContent = concert.genre || "Live Concert";

      fallback.appendChild(monogram);
      fallback.appendChild(label);
      bannerEl.appendChild(fallback);
    };

    const headliner = lineup[0] || findArtistById(concert.artistId);
    const isMultiArtistFestival = Boolean(concert.isFestival || lineup.length > 1);
    const primaryRaw =
      concert.banner || (isMultiArtistFestival ? DEFAULT_BANNER_FALLBACK : concert.image);

    const candidates = [];
    const seenCandidates = new Set();
    [
      primaryRaw,
      concert.bannerFallback,
      !isMultiArtistFestival && headliner && headliner.image ? headliner.image : "",
      DEFAULT_BANNER_FALLBACK,
      SECONDARY_BANNER_FALLBACK
    ].forEach((rawPath) => {
      const resolved = resolveAssetPath(rawPath);
      if (resolved && !seenCandidates.has(resolved)) {
        seenCandidates.add(resolved);
        candidates.push(resolved);
      }
    });

    if (!candidates.length) {
      renderGraphicFallback();
      return;
    }

    const img = document.createElement("img");
    img.className = "event-banner-img";
    img.alt = `${concert.title} concert banner`;

    let candidateIndex = 0;
    const tryNextSource = () => {
      if (candidateIndex >= candidates.length) {
        renderGraphicFallback();
        return;
      }
      const nextSrc = candidates[candidateIndex];
      candidateIndex += 1;
      img.src = nextSrc;
    };

    img.addEventListener("error", () => {
      tryNextSource();
    });

    bannerEl.appendChild(img);
    tryNextSource();
  }

  /**
   * Renders the subtitle line: Date · Time · Venue (with Venue clickable to venues.html).
   */
  function renderEventSubtitle(subtitleEl, dateParts, venue, concert) {
    subtitleEl.textContent = "";

    const dateSpan = document.createElement("span");
    dateSpan.textContent = dateParts.dateLabel;

    const dotOne = document.createElement("span");
    dotOne.className = "sonora-event-dot";
    dotOne.setAttribute("aria-hidden", "true");
    dotOne.textContent = "·";

    const timeSpan = document.createElement("span");
    timeSpan.textContent = concert.time || dateParts.timeLabel;

    const dotTwo = document.createElement("span");
    dotTwo.className = "sonora-event-dot";
    dotTwo.setAttribute("aria-hidden", "true");
    dotTwo.textContent = "·";

    const venueLink = document.createElement("a");
    venueLink.className = "sonora-venue-link";
    venueLink.href = venue && venue.id ? `venues.html?id=${encodeURIComponent(venue.id)}` : "venues.html";
    const venueName = venue ? venue.name : concert.city || "Venue TBA";
    const venueCity = venue && venue.city ? `, ${venue.city}` : "";
    venueLink.textContent = `${venueName}${venueCity}`;

    subtitleEl.appendChild(dateSpan);
    subtitleEl.appendChild(dotOne);
    subtitleEl.appendChild(timeSpan);
    subtitleEl.appendChild(dotTwo);
    subtitleEl.appendChild(venueLink);
  }

  /**
   * Renders compact metadata pills (genre, starting price, seats available).
   */
  function renderMetaStrip(metaEl, concert) {
    metaEl.textContent = "";

    if (concert.genre) {
      const genreTag = document.createElement("span");
      genreTag.className = "sonora-tag";
      genreTag.textContent = concert.genre;
      metaEl.appendChild(genreTag);
    }

    if (typeof concert.price === "number") {
      const pricePill = document.createElement("span");
      pricePill.className = "sonora-meta-pill";
      pricePill.textContent = `From $${concert.price.toFixed(2)}`;
      metaEl.appendChild(pricePill);
    }

    if (typeof concert.seatsAvailable === "number") {
      const seatsPill = document.createElement("span");
      seatsPill.className = "sonora-meta-pill";
      seatsPill.textContent = `${concert.seatsAvailable} seats left`;
      metaEl.appendChild(seatsPill);
    }
  }

  /**
   * Builds a clickable artist lineup card linking to artist.html?id=<artistId>.
   */
  function createLineupCard(artist, isHeadliner, isSolo) {
    const card = document.createElement("a");
    card.className = "sonora-lineup-card";
    card.href = `artist.html?id=${encodeURIComponent(artist.id)}`;
    card.setAttribute("aria-label", `View ${artist.name} artist profile`);

    const avatar = document.createElement("div");
    avatar.className = "sonora-lineup-avatar";

    const renderInitials = () => {
      avatar.textContent = "";
      const initials = document.createElement("span");
      initials.className = "sonora-lineup-avatar-initials";
      initials.textContent = getInitials(artist.name);
      avatar.appendChild(initials);
    };

    if (artist.image) {
      const img = document.createElement("img");
      img.src = resolveAssetPath(artist.image);
      img.alt = `${artist.name} portrait`;
      img.addEventListener("error", renderInitials, { once: true });
      avatar.appendChild(img);
    } else {
      renderInitials();
    }

    const info = document.createElement("div");
    info.className = "sonora-lineup-info";

    const nameEl = document.createElement("div");
    nameEl.className = "sonora-lineup-name";
    nameEl.textContent = artist.name;

    const metaEl = document.createElement("div");
    metaEl.className = "sonora-lineup-meta";
    const roleLabel = isSolo ? "Featured Artist" : isHeadliner ? "Headliner" : "Special Guest";
    metaEl.textContent = artist.genre ? `${roleLabel} · ${artist.genre}` : roleLabel;

    info.appendChild(nameEl);
    info.appendChild(metaEl);

    const chevron = document.createElement("span");
    chevron.className = "sonora-lineup-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>';

    card.appendChild(avatar);
    card.appendChild(info);
    card.appendChild(chevron);

    return card;
  }

  /**
   * Reads saved event IDs array from localStorage under "savedEvents".
   */
  function readSavedEvents() {
    try {
      const raw = window.localStorage.getItem(SAVED_EVENTS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Persists saved event IDs array to localStorage under "savedEvents".
   */
  function writeSavedEvents(eventIds) {
    try {
      window.localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(eventIds));
    } catch (error) {
      // Ignore storage quota or private browsing errors gracefully
    }
  }

  /**
   * Updates the Save Event button text, active class, and ARIA state.
   */
  function syncSaveButtonState(saveBtn, eventId) {
    const savedIds = readSavedEvents();
    const isSaved = savedIds.includes(eventId);

    saveBtn.classList.toggle("is-saved", isSaved);
    saveBtn.setAttribute("aria-pressed", isSaved ? "true" : "false");
    saveBtn.textContent = isSaved ? "♥ Saved" : "♡ Save Event";
  }

  /**
   * Stores the active concert selection in localStorage and opens the booking modal.
   */
  function wireSelectSeatAction(selectBtn, concert, venue, dateParts) {
    const seatUrl = `seat-selection.html?id=${encodeURIComponent(concert.id)}`;
    const modalEl = document.getElementById("bookingConfirmModal");
    const modalEventName = document.getElementById("modalEventName");
    const modalEventMeta = document.getElementById("modalEventMeta");
    const modalEventPrice = document.getElementById("modalEventPrice");
    const proceedLink = document.getElementById("proceedSeatSelectionLink");

    if (proceedLink) {
      proceedLink.href = seatUrl;
    }

    selectBtn.addEventListener("click", () => {
      const venueName = venue ? venue.name : concert.city || "Venue TBA";
      const selectedPayload = {
        id: concert.id,
        title: concert.title,
        date: concert.date,
        venueId: concert.venueId,
        venueName,
        city: concert.city,
        price: concert.price,
        image: concert.image,
        selectedAt: new Date().toISOString()
      };

      try {
        window.localStorage.setItem(SELECTED_EVENT_KEY, JSON.stringify(selectedPayload));
      } catch (error) {
        // Ignore storage restrictions
      }

      if (modalEventName) {
        modalEventName.textContent = concert.title;
      }
      if (modalEventMeta) {
        modalEventMeta.textContent = `${dateParts.dateLabel} · ${concert.time || dateParts.timeLabel} · ${venueName}`;
      }
      if (modalEventPrice) {
        modalEventPrice.textContent =
          typeof concert.price === "number"
            ? `Tickets starting at $${concert.price.toFixed(2)} (${concert.seatsAvailable} seats available)`
            : "Tickets available";
      }

      if (modalEl && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
      } else {
        window.location.href = seatUrl;
      }
    });
  }

  /**
   * Shows the Event Not Found state when an invalid ?id= is passed.
   */
  function showNotFound(requestedId) {
    const detailsSection = document.getElementById("eventDetailsSection");
    const notFoundSection = document.getElementById("eventNotFoundSection");
    const notFoundMessage = document.getElementById("eventNotFoundMessage");

    if (detailsSection) {
      detailsSection.classList.add("d-none");
    }
    if (notFoundSection) {
      notFoundSection.classList.remove("d-none");
    }
    if (notFoundMessage && requestedId) {
      notFoundMessage.textContent = `No concert matching "${requestedId}" was found in our live schedule.`;
    }

    document.title = "Event Not Found | SONORA — Live Concert Tickets";
  }

  /**
   * Initializes the Event Details page on DOMContentLoaded.
   */
  function initEventDetailsPage() {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");
    const concert = resolveConcert(requestedId);

    if (!concert) {
      showNotFound(requestedId ? requestedId.trim() : "");
      return;
    }

    document.title = `${concert.title} | SONORA — Live Concert Tickets`;

    const detailsSection = document.getElementById("eventDetailsSection");
    const notFoundSection = document.getElementById("eventNotFoundSection");
    const bannerFrame = document.getElementById("eventBannerFrame");
    const titleEl = document.getElementById("eventTitle");
    const subtitleEl = document.getElementById("eventSubtitle");
    const metaStripEl = document.getElementById("eventMetaStrip");
    const descriptionEl = document.getElementById("eventDescription");
    const lineupListEl = document.getElementById("eventLineupList");
    const selectSeatBtn = document.getElementById("selectSeatBtn");
    const saveEventBtn = document.getElementById("saveEventBtn");

    if (detailsSection) {
      detailsSection.classList.remove("d-none");
    }
    if (notFoundSection) {
      notFoundSection.classList.add("d-none");
    }

    const venue = findVenueById(concert.venueId);
    const lineup = resolveConcertLineup(concert);
    const dateParts = formatEventDateTime(concert.date);

    if (bannerFrame) {
      renderEventBanner(bannerFrame, concert, lineup);
    }
    if (titleEl) {
      titleEl.textContent = concert.title;
    }
    if (subtitleEl) {
      renderEventSubtitle(subtitleEl, dateParts, venue, concert);
    }
    if (metaStripEl) {
      renderMetaStrip(metaStripEl, concert);
    }
    if (descriptionEl) {
      descriptionEl.textContent = concert.description || "";
    }

    const lineupHeadingEl = document.getElementById("eventLineupHeading");
    if (lineupHeadingEl) {
      lineupHeadingEl.textContent =
        lineup.length === 1
          ? "Performing Artist"
          : concert.isFestival
            ? "Festival Lineup"
            : "Performing Artists";
    }

    if (lineupListEl) {
      const isSolo = lineup.length === 1;
      lineupListEl.textContent = "";
      lineupListEl.dataset.lineupCount = String(lineup.length);
      lineupListEl.classList.toggle("is-solo", isSolo);
      lineupListEl.classList.toggle("is-multi", !isSolo);

      const fragment = document.createDocumentFragment();
      lineup.forEach((artist, index) => {
        const isHeadliner =
          String(artist.id).toLowerCase() === String(concert.artistId || "").toLowerCase() ||
          index === 0;
        fragment.appendChild(createLineupCard(artist, isHeadliner, isSolo));
      });
      lineupListEl.appendChild(fragment);
    }

    if (selectSeatBtn) {
      wireSelectSeatAction(selectSeatBtn, concert, venue, dateParts);
    }

    if (saveEventBtn) {
      syncSaveButtonState(saveEventBtn, concert.id);

      saveEventBtn.addEventListener("click", () => {
        const currentSaved = readSavedEvents();
        const nextSaved = currentSaved.includes(concert.id)
          ? currentSaved.filter((id) => id !== concert.id)
          : [...currentSaved, concert.id];
        writeSavedEvents(nextSaved);
        syncSaveButtonState(saveEventBtn, concert.id);
      });

      window.addEventListener("storage", (event) => {
        if (event.key === SAVED_EVENTS_KEY) {
          syncSaveButtonState(saveEventBtn, concert.id);
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initEventDetailsPage);
})();
