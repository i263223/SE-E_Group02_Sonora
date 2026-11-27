/**
 * SONORA — Live Concert Tickets
 * Artist Details Page Controller (pages/artist.html)
 * Reads ?id= from URL (defaults to the first artist in ARTISTS when omitted),
 * renders the artist profile card and chronological tour date rows.
 */

(function () {
  "use strict";

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
   * Generates up to 2 uppercase initials from an artist name for fallback display.
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
   * Normalizes a string into a URL-safe slug (e.g. "The Neighbourhood" -> "the-neighbourhood").
   */
  function toSlug(value, expandAmpersand = true) {
    let text = String(value || "").trim().toLowerCase();
    if (expandAmpersand) {
      text = text.replace(/&/g, " and ");
    }
    return text.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /**
   * Returns the artists array from SONORA_DATA (supporting .artists or .ARTISTS) or global ARTISTS.
   */
  function getArtistsList() {
    if (typeof SONORA_DATA !== "undefined") {
      if (Array.isArray(SONORA_DATA.artists)) {
        return SONORA_DATA.artists;
      }
      if (Array.isArray(SONORA_DATA.ARTISTS)) {
        return SONORA_DATA.ARTISTS;
      }
    }
    return typeof ARTISTS !== "undefined" && Array.isArray(ARTISTS) ? ARTISTS : [];
  }

  /**
   * Returns the concerts array from SONORA_DATA (supporting .concerts or .CONCERTS) or global CONCERTS.
   */
  function getConcertsList() {
    if (typeof SONORA_DATA !== "undefined") {
      if (Array.isArray(SONORA_DATA.concerts)) {
        return SONORA_DATA.concerts;
      }
      if (Array.isArray(SONORA_DATA.CONCERTS)) {
        return SONORA_DATA.CONCERTS;
      }
    }
    return typeof CONCERTS !== "undefined" && Array.isArray(CONCERTS) ? CONCERTS : [];
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
        ? SONORA_DATA.venues || SONORA_DATA.VENUES || []
        : typeof VENUES !== "undefined"
          ? VENUES
          : [];
    const target = String(venueId || "").toLowerCase();
    return venues.find((venue) => String(venue.id).toLowerCase() === target) || null;
  }

  /**
   * Finds an artist by ?id= query param (exact ID, case-insensitive ID/name, or slug),
   * or returns the default first artist when ?id= is omitted or empty.
   */
  function resolveArtist(rawId) {
    const artists = getArtistsList();
    if (!artists.length) {
      return null;
    }

    if (rawId === null || rawId === undefined || !String(rawId).trim()) {
      return artists[0] || null;
    }

    const query = String(rawId).trim();
    const normalized = query.toLowerCase();
    const querySlug = toSlug(query, true);
    const queryCompactSlug = toSlug(query, false);

    // 1. Exact ID match
    const exactIdMatch = artists.find((artist) => String(artist.id) === query);
    if (exactIdMatch) {
      return exactIdMatch;
    }

    // 2. Case-insensitive ID or explicit slug property match
    const idOrSlugMatch = artists.find((artist) => {
      const idLower = String(artist.id || "").toLowerCase();
      const explicitSlug = artist.slug ? String(artist.slug).toLowerCase() : "";
      return (
        idLower === normalized ||
        (explicitSlug && (explicitSlug === normalized || explicitSlug === querySlug))
      );
    });
    if (idOrSlugMatch) {
      return idOrSlugMatch;
    }

    // 3. Case-insensitive name or generated name/ID slug match
    return (
      artists.find((artist) => {
        const nameLower = String(artist.name || "").toLowerCase();
        const nameSlug = toSlug(artist.name, true);
        const nameCompactSlug = toSlug(artist.name, false);
        const idSlug = toSlug(artist.id, false);
        return (
          nameLower === normalized ||
          (querySlug && nameSlug === querySlug) ||
          (queryCompactSlug && (nameCompactSlug === queryCompactSlug || idSlug === queryCompactSlug))
        );
      }) || null
    );
  }

  /**
   * Formats an ISO date string into compact date-box and metadata parts.
   */
  function formatConcertDate(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return {
        month: "TBA",
        dayNumber: "--",
        weekday: "Date TBA",
        time: ""
      };
    }

    return {
      month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      dayNumber: String(date.getDate()),
      weekday: date.toLocaleString("en-US", { weekday: "short" }),
      time: date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
    };
  }

  /**
   * Renders the framed artist image with a clean monogram fallback if the file is missing.
   */
  function renderArtistImage(frameEl, artist) {
    frameEl.textContent = "";

    const renderFallback = () => {
      frameEl.textContent = "";
      const fallback = document.createElement("div");
      fallback.className = "sonora-artist-image-fallback";

      const initials = document.createElement("span");
      initials.className = "sonora-artist-image-initials";
      initials.textContent = getInitials(artist.name);

      const label = document.createElement("span");
      label.className = "small text-uppercase";
      label.textContent = artist.genre;

      fallback.appendChild(initials);
      fallback.appendChild(label);
      frameEl.appendChild(fallback);
    };

    if (!artist.image) {
      renderFallback();
      return;
    }

    const img = document.createElement("img");
    img.src = resolveAssetPath(artist.image);
    img.alt = `${artist.name} promotional portrait`;
    img.addEventListener("error", renderFallback, { once: true });
    frameEl.appendChild(img);
  }

  /**
   * Builds a single clickable tour date row linking to event-details.html?id=<concertId>.
   */
  function createTourRow(concert) {
    const venue = findVenueById(concert.venueId);
    const venueName = venue ? venue.name : "Venue TBA";
    const dateParts = formatConcertDate(concert.date);

    const row = document.createElement("a");
    row.className = "sonora-tour-row";
    row.href = `event-details.html?id=${encodeURIComponent(concert.id)}`;
    row.setAttribute(
      "aria-label",
      `${concert.city} on ${dateParts.month} ${dateParts.dayNumber} at ${venueName}`
    );

    // Left: compact square date box
    const dateBox = document.createElement("time");
    dateBox.className = "sonora-tour-date-box";
    dateBox.dateTime = concert.date;

    const monthEl = document.createElement("span");
    monthEl.className = "sonora-tour-month";
    monthEl.textContent = dateParts.month;

    const dayEl = document.createElement("span");
    dayEl.className = "sonora-tour-day";
    dayEl.textContent = dateParts.dayNumber;

    dateBox.appendChild(monthEl);
    dateBox.appendChild(dayEl);

    // Middle: city on line 1, "Day Time · Venue Name" on line 2
    const infoEl = document.createElement("div");
    infoEl.className = "sonora-tour-info";

    const cityEl = document.createElement("div");
    cityEl.className = "sonora-tour-city";
    cityEl.textContent = concert.city;

    const metaEl = document.createElement("div");
    metaEl.className = "sonora-tour-meta";
    const timeSegment = dateParts.time ? ` ${dateParts.time}` : "";
    metaEl.textContent = `${dateParts.weekday}${timeSegment} · ${venueName}`;

    infoEl.appendChild(cityEl);
    infoEl.appendChild(metaEl);

    // Right: ">" chevron
    const chevronWrap = document.createElement("span");
    chevronWrap.className = "sonora-tour-chevron";
    chevronWrap.setAttribute("aria-hidden", "true");
    chevronWrap.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>';

    row.appendChild(dateBox);
    row.appendChild(infoEl);
    row.appendChild(chevronWrap);

    return row;
  }

  /**
   * Displays the fallback state when an artist ID does not exist.
   */
  function showNotFound(requestedId) {
    const detailsSection = document.getElementById("artistDetailsSection");
    const notFoundSection = document.getElementById("artistNotFoundSection");
    const notFoundMessage = document.getElementById("artistNotFoundMessage");

    if (detailsSection) {
      detailsSection.classList.add("d-none");
    }
    if (notFoundSection) {
      notFoundSection.classList.remove("d-none");
    }
    if (notFoundMessage && requestedId) {
      notFoundMessage.textContent = `No artist matching "${requestedId}" was found in our touring roster.`;
    }

    document.title = "Artist Not Found | SONORA — Live Concert Tickets";
  }

  /**
   * Initializes the Artist Details page on DOMContentLoaded.
   */
  function initArtistPage() {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id");
    const artist = resolveArtist(requestedId);

    if (!artist) {
      showNotFound(requestedId ? requestedId.trim() : "");
      return;
    }

    document.title = `${artist.name} | SONORA — Live Concert Tickets`;

    const detailsSection = document.getElementById("artistDetailsSection");
    const notFoundSection = document.getElementById("artistNotFoundSection");
    const imageFrame = document.getElementById("artistImageFrame");
    const nameEl = document.getElementById("artistName");
    const genreEl = document.getElementById("artistGenre");
    const bioEl = document.getElementById("artistBio");
    const tourListEl = document.getElementById("artistTourList");
    const tourCountEl = document.getElementById("artistTourCount");
    const noToursEl = document.getElementById("artistNoTours");

    if (detailsSection) {
      detailsSection.classList.remove("d-none");
    }
    if (notFoundSection) {
      notFoundSection.classList.add("d-none");
    }
    if (imageFrame) {
      renderArtistImage(imageFrame, artist);
    }
    if (nameEl) {
      nameEl.textContent = artist.name;
    }
    if (genreEl) {
      genreEl.textContent = artist.genre;
    }
    if (bioEl) {
      bioEl.textContent = artist.bio;
    }

    const artistIdLower = String(artist.id).toLowerCase();
    const concerts = getConcertsList()
      .filter(
      (concert) =>
        String(concert.artistId || "").toLowerCase() === artistIdLower ||
        (Array.isArray(concert.lineup) &&
          concert.lineup.some((id) => String(id || "").toLowerCase() === artistIdLower))
    )
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (tourCountEl) {
      const showLabel = concerts.length === 1 ? "1 upcoming show" : `${concerts.length} upcoming shows`;
      tourCountEl.textContent = showLabel;
    }

    if (tourListEl) {
      tourListEl.textContent = "";
      if (concerts.length === 0) {
        if (noToursEl) {
          noToursEl.classList.remove("d-none");
        }
      } else {
        if (noToursEl) {
          noToursEl.classList.add("d-none");
        }
        const fragment = document.createDocumentFragment();
        concerts.forEach((concert) => {
          fragment.appendChild(createTourRow(concert));
        });
        tourListEl.appendChild(fragment);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", initArtistPage);
})();
