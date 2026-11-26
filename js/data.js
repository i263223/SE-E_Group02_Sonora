/**
 * SONORA — Live Concert Tickets
 * Shared Mock Dataset: ARTISTS, VENUES, CONCERTS
 * Note: Image paths are relative to the site root (e.g., "images/...").
 * Use SONORA_DATA or global constants directly in vanilla JS modules.
 */

const ARTISTS = [
  {
    id: "art-1",
    name: "Aria Vance",
    genre: "Synth-Pop",
    bio: "Known for neon-lit arena productions and analog synth arrangements, Aria Vance blends 80s pulse basslines with soaring contemporary vocals.",
    image: "images/artists/aria-vance.jpg"
  },
  {
    id: "art-2",
    name: "The Velvet Static",
    genre: "Indie Rock",
    bio: "A four-piece alternative rock band delivering driving guitar hooks, atmospheric reverb, and high-voltage live encores across packed theaters.",
    image: "images/artists/the-velvet-static.jpg"
  },
  {
    id: "art-3",
    name: "Kaelen Frost",
    genre: "Electronic",
    bio: "Berlin-trained live electronic producer and visual artist combining modular percussion rigs with synchronized 360-degree laser choreography.",
    image: "images/artists/kaelen-frost.jpg"
  },
  {
    id: "art-4",
    name: "Noor & The Horizon",
    genre: "Neo-Soul",
    bio: "A seven-piece collective uniting brass horns, warm Rhodes keys, and soulful storytelling for unforgettable intimate concert evenings.",
    image: "images/artists/noor-horizon.jpg"
  },
  {
    id: "art-5",
    name: "Crimson Meridian",
    genre: "Alternative Metal",
    bio: "Heavy cinematic riffs meet orchestral string breakdowns in Crimson Meridian's critically acclaimed stadium tour.",
    image: "images/artists/crimson-meridian.jpg"
  },
  {
    id: "art-6",
    name: "Solstice Quartet",
    genre: "Jazz Fusion",
    bio: "Modern jazz improvisers fusing upright bass grooves, saxophone solos, and crisp electronic textures.",
    image: "images/artists/solstice-quartet.jpg"
  }
];

const VENUES = [
  {
    id: "ven-1",
    name: "Obsidian Arena",
    city: "New York",
    capacity: 18500,
    image: "images/venues/obsidian-arena.jpg"
  },
  {
    id: "ven-2",
    name: "The Echo Foundry",
    city: "Chicago",
    capacity: 3200,
    image: "images/venues/echo-foundry.jpg"
  },
  {
    id: "ven-3",
    name: "Velvet Hall",
    city: "Los Angeles",
    capacity: 5400,
    image: "images/venues/velvet-hall.jpg"
  },
  {
    id: "ven-4",
    name: "Harbor Amphitheater",
    city: "Seattle",
    capacity: 12000,
    image: "images/venues/harbor-amphitheater.jpg"
  },
  {
    id: "ven-5",
    name: "Crescent Ballroom",
    city: "Austin",
    capacity: 1800,
    image: "images/venues/crescent-ballroom.jpg"
  }
];

const CONCERTS = [
  {
    id: "con-101",
    title: "Midnight Neon Tour",
    artistId: "art-1",
    venueId: "ven-1",
    date: "2026-12-05T20:00:00",
    city: "New York",
    genre: "Synth-Pop",
    price: 89.00,
    seatsAvailable: 142,
    image: "images/concerts/midnight-neon.jpg",
    description: "Aria Vance brings the Midnight Neon Tour to Obsidian Arena with a full analog synth ensemble and panoramic LED staging."
  },
  {
    id: "con-102",
    title: "Electric Afterglow Live",
    artistId: "art-2",
    venueId: "ven-2",
    date: "2026-12-11T20:30:00",
    city: "Chicago",
    genre: "Indie Rock",
    price: 64.50,
    seatsAvailable: 58,
    image: "images/concerts/electric-afterglow.jpg",
    description: "An up-close, high-energy theater performance by The Velvet Static featuring tracks from their latest chart-topping album."
  },
  {
    id: "con-103",
    title: "Subzero Frequency Experience",
    artistId: "art-3",
    venueId: "ven-3",
    date: "2026-12-18T21:30:00",
    city: "Los Angeles",
    genre: "Electronic",
    price: 95.00,
    seatsAvailable: 210,
    image: "images/concerts/subzero-frequency.jpg",
    description: "Kaelen Frost transforms Velvet Hall into an audiovisual sanctuary with custom spatial audio and live modular synthesis."
  },
  {
    id: "con-104",
    title: "Golden Hour Sessions",
    artistId: "art-4",
    venueId: "ven-5",
    date: "2027-01-09T19:30:00",
    city: "Austin",
    genre: "Neo-Soul",
    price: 55.00,
    seatsAvailable: 34,
    image: "images/concerts/golden-hour-sessions.jpg",
    description: "Join Noor & The Horizon for an intimate winter residency night filled with lush horn harmonies and acoustic soul."
  },
  {
    id: "con-105",
    title: "Monolith World Tour",
    artistId: "art-5",
    venueId: "ven-4",
    date: "2027-01-22T20:00:00",
    city: "Seattle",
    genre: "Alternative Metal",
    price: 110.00,
    seatsAvailable: 320,
    image: "images/concerts/monolith-tour.jpg",
    description: "Crimson Meridian headlines Harbor Amphitheater with pyrotechnics, guest string players, and a two-hour greatest hits set."
  },
  {
    id: "con-106",
    title: "Blue Note Convergence",
    artistId: "art-6",
    venueId: "ven-2",
    date: "2027-02-04T19:00:00",
    city: "Chicago",
    genre: "Jazz Fusion",
    price: 58.00,
    seatsAvailable: 92,
    image: "images/concerts/blue-note-convergence.jpg",
    description: "Solstice Quartet explores boundary-pushing jazz improvisation inside the historic acoustics of The Echo Foundry."
  },
  {
    id: "con-107",
    title: "Skyline Pulse Encore",
    artistId: "art-1",
    venueId: "ven-3",
    date: "2027-02-14T20:00:00",
    city: "Los Angeles",
    genre: "Synth-Pop",
    price: 92.00,
    seatsAvailable: 75,
    image: "images/concerts/skyline-pulse.jpg",
    description: "A special Valentine's night West Coast encore show featuring exclusive acoustic-synth arrangements and surprise guests."
  },
  {
    id: "con-108",
    title: "Static & Brass Double Bill",
    artistId: "art-2",
    venueId: "ven-4",
    date: "2027-02-27T19:30:00",
    city: "Seattle",
    genre: "Indie Rock",
    price: 72.00,
    seatsAvailable: 165,
    image: "images/concerts/static-brass.jpg",
    description: "The Velvet Static teams up with special indie openers for a waterfront concert under the Pacific Northwest night sky."
  }
];

/**
 * Convenience lookup helpers for subpages.
 */
const SONORA_DATA = {
  ARTISTS,
  VENUES,
  CONCERTS,
  getArtistById(id) {
    return ARTISTS.find((artist) => artist.id === id) || null;
  },
  getVenueById(id) {
    return VENUES.find((venue) => venue.id === id) || null;
  },
  getConcertById(id) {
    return CONCERTS.find((concert) => concert.id === id) || null;
  }
};
