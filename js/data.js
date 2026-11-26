/**
 * SONORA — Live Concert Tickets
 * Shared Mock Dataset: ARTISTS, VENUES, CONCERTS
 * Note: Image paths are relative to the site root (e.g., "images/...").
 * Use SONORA_DATA or global constants directly in vanilla JS modules.
 */

const ARTISTS = [
  {
    id: "art-1",
    name: "Coldplay",
    genre: "pop rock",
    bio: "British rock band formed in London in 1997. They consist of vocalist and pianist Chris Martin, lead guitarist Jonny Buckland, bassist Guy Berryman and drummer Will Champion.",
    image: "images/coldplay.jpg"
  },
  {
    id: "art-2",
    name: "The Neighbourhood",
    genre: "alt/indie",
    bio: "American alternative rock band formed in Newbury Park, California, in 2011. The band consists of vocalist Jesse Rutherford, guitarists Jeremy Fredman and Zach Abels, bassist Mikey Margott and drummer Brandon Fried.",
    image: "images/nbhd.jpg"
  },
  {
    id: "art-3",
    name: "Atif Aslam",
    genre: "pop",
    bio: "Pakistani playback singer, songwriter, composer, and actor. Has recorded many songs in both Pakistani films and Indian films.",
    image: "images/atif.jpg"
  },
  {
    id: "art-4",
    name: "Asim Azhar",
    genre: "pop",
    bio: "Pakistani singer, songwriter, musician and an actor. He started his career as a singer on YouTube, covering contemporary Western songs before he became a prominent figure.",
    image: "images/asim.jpg"
  },
  {
    id: "art-5",
    name: "Drake",
    genre: "hip hop",
    bio: "Canadian rapper, singer and actor. He is considered as one of the greatest rappers of all time and is credited with popularizing R&B sensibilities in hip-hop.",
    image: "images/drake.jpg"
  },
  {
    id: "art-6",
    name: "Billie Eilish",
    genre: "alt pop",
    bio: "American singer-songwriter. Known for her distinctive musical sound and vocal style, she is a prominent figure in 2020s pop culture. Eilish's production style frequently uses harmony lines and vocal layering, an extension of double tracking.",
    image: "images/billie.jpg"
  },
  {
    id: "art-7",
    name: "Tame Impala",
    genre: "psychedelic rock",
    bio: "Tame Impala is the psychedelic music project of Australian singer and multi-instrumentalist Kevin Parker. In the recording studio, Parker writes, records, performs, and produces the project's music.",
    image: "images/impala.jpg"
  },
  {
    id: "art-8",
    name: "Gracie Abrams",
    genre: "indie pop",
    bio: "American singer and songwriter. Signed with Interscope Records in 2019 and gained recognition after releasing her debut extended play, Minor, and its follow-up, This Is What It Feels Like, alongside various singles",
    image: "images/gracie.jpg"
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
    id: "con-1",
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
    id: "con-2",
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
    id: "con-3",
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
    id: "con-4",
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
    id: "con-5",
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
    id: "con-6",
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
    id: "con-7",
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
    id: "con-8",
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
