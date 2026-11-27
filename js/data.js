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
    image: "images/coldplay.jpg",
    banner: "images/coldplay-banner.jpg",
    tourName: "Music of the Spheres World Tour"
  },
  {
    id: "art-2",
    name: "The Neighbourhood",
    genre: "alt/indie",
    bio: "American alternative rock band formed in Newbury Park, California, in 2011. The band consists of vocalist Jesse Rutherford, guitarists Jeremy Fredman and Zach Abels, bassist Mikey Margott and drummer Brandon Fried.",
    image: "images/nbhd.jpg",
    banner: "images/nbhd-banner.jpg",
    tourName: "The Wourld Tour II"
  },
  {
    id: "art-3",
    name: "Joji",
    genre: "alt R&B",
    bio: "Japanese-Australian singer, songwriter, rapper, comedian, and former internet personality. His music has been described as a mix between R&B, lo-fi, and trip-hop.",
    image: "images/joji.jpg",
    banner: "images/joji-banner.jpg",
    tourName: "SOLARIS TOUR"
  },
  {
    id: "art-4",
    name: "The Weeknd",
    genre: "R&B",
    bio: "Abel Tesfaye, known by his stage name the Weeknd, is a Canadian singer, songwriter, record producer, and actor.",
    image: "images/weeknd.jpg",
    banner: "images/weeknd-banner.jpg",
    tourName: "After Hours til Dawn Tour"
  },
  {
    id: "art-5",
    name: "Drake",
    genre: "hip hop",
    bio: "Canadian rapper, singer and actor. He is considered as one of the greatest rappers of all time and is credited with popularizing R&B sensibilities in hip-hop.",
    image: "images/drake.jpg",
    banner: "images/drake-banner.jpg",
    tourName: "Away from Home Tour"
  },
  {
    id: "art-6",
    name: "Billie Eilish",
    genre: "alt pop",
    bio: "American singer-songwriter. Known for her distinctive musical sound and vocal style, she is a prominent figure in 2020s pop culture. Eilish's production style frequently uses harmony lines and vocal layering, an extension of double tracking.",
    image: "images/billie.jpg",
    banner: "images/billie-banner.jpg",
    tourName: "Hit Me Hard and Soft: The Tour"
  },
  {
    id: "art-7",
    name: "Tame Impala",
    genre: "psychedelic rock",
    bio: "Tame Impala is the psychedelic music project of Australian singer and multi-instrumentalist Kevin Parker. In the recording studio, Parker writes, records, performs, and produces the project's music.",
    image: "images/impala.jpg",
    banner: "images/impala-banner.jpg",
    tourName: "Deadbeat Tour"
  },
  {
    id: "art-8",
    name: "Gracie Abrams",
    genre: "indie pop",
    bio: "American singer and songwriter. Signed with Interscope Records in 2019 and gained recognition after releasing her debut extended play, Minor, and its follow-up, This Is What It Feels Like, alongside various singles.",
    image: "images/gracie.jpg",
    banner: "images/gracie-banner.jpg",
    tourName: "The Look at My Life Tour"
  },
  {
    id: "art-9",
    name: "Taylor Swift",
    genre: "pop",
    bio: "American singer-songwriter and video director. An influential figure in popular culture, Swift is known for her autobiographical songwriting and artistic reinventions.",
    image: "images/taylor.jpg",
    banner: "images/taylor-banner.jpg",
    tourName: "The Eras Tour"
  },
  {
    id: "art-10",
    name: "A$AP Rocky",
    genre: "hip hop",
    bio: "American rapper, record producer, actor, fashion designer, and model. Born and raised in Harlem, he embarked on his musical career as a member of the hip-hop collective ASAP Mob, from which he adopted his stage name.",
    image: "images/asap.jpg",
    banner: "images/asap-banner.jpg",
    tourName: "Don't Be Dumb World Tour"
  },
  {
    id: "art-11",
    name: "The 1975",
    genre: "alt/indie",
    bio: "English pop rock band formed in Wilmslow, Cheshire in 2002. The band consists of Matty Healy, Adam Hann, Ross MacDonald and George Daniel. The band's name was inspired by a page of scribblings found in Healy's preowned copy of On the Road by Jack Kerouac.",
    image: "images/1975.jpg",
    banner: "images/1975-banner.jpg",
    tourName: "The 1975 Tour"
  },
  {
    id: "art-12",
    name: "The Strokes",
    genre: "alt/indie",
    bio: "American rock band from New York City that formed in 1998. It has maintained the same lineup since inception: lead vocalist and primary songwriter Julian Casablancas; guitarists Nick Valensi and Albert Hammond Jr.; bassist Nikolai Fraiture; and drummer Fabrizio Moretti.",
    image: "images/strokes.jpg",
    banner: "images/strokes-banner.jpg",
    tourName: "Reality Awaits: The World 2026"

  }
];

const VENUES = [
  {
    id: "ven-1",
    name: "Madison Square Garden",
    city: "New York",
    country: "United States",
    capacity: 20789,
    parking: "Garages at Penn Station & West 33rd St; direct subway and NJ Transit rail access.",
    image: "images/venues/madison-square-garden.jpg"
  },
  {
    id: "ven-2",
    name: "The O2 Arena",
    city: "London",
    country: "United Kingdom",
    capacity: 20000,
    parking: "On-site Car Parks 1-4 at Peninsula Square; Jubilee Line to North Greenwich.",
    image: "images/venues/the-o2-arena.jpg"
  },
  {
    id: "ven-3",
    name: "Accor Arena",
    city: "Paris",
    country: "France",
    capacity: 20300,
    parking: "Bercy Arena Underground Parking (850 spaces); Metro Lines 6 & 14 at Bercy.",
    image: "images/venues/accor-arena.jpg"
  },
  {
    id: "ven-4",
    name: "Tokyo Dome",
    city: "Tokyo",
    country: "Japan",
    capacity: 55000,
    parking: "Tokyo Dome City Parking (670 spaces); JR Suidobashi & Korakuen Stations.",
    image: "images/venues/tokyo-dome.jpg"
  },
  {
    id: "ven-5",
    name: "Mercedes-Benz Arena",
    city: "Berlin",
    country: "Germany",
    capacity: 17000,
    parking: "Arena Multi-Storey Car Park on Mildred-Harnack-Strasse; S/U Warschauer Strasse.",
    image: "images/venues/mercedes-benz-arena.jpg"
  },
  {
    id: "ven-6",
    name: "Rod Laver Arena",
    city: "Melbourne",
    country: "Australia",
    capacity: 14820,
    parking: "Melbourne Park Eastern Plaza Garage; Tram 70 and Richmond Rail Station.",
    image: "images/venues/rod-laver-arena.jpg"
  },
  {
    id: "ven-7",
    name: "Qudos Bank Arena",
    city: "Sydney",
    country: "Australia",
    capacity: 21032,
    parking: "Sydney Olympic Park P1 Car Park; direct Olympic Park Rail Station link.",
    image: "images/venues/qudos-bank-arena.jpg"
  },
  {
    id: "ven-8",
    name: "Spark Arena",
    city: "Auckland",
    country: "New Zealand",
    capacity: 12000,
    parking: "Arena & Downtown Car Parks on Mahuhu Crescent; 5-minute walk from Britomart.",
    image: "images/venues/spark-arena.jpg"
  },
  {
    id: "ven-9",
    name: "Scotiabank Arena",
    city: "Toronto",
    country: "Canada",
    capacity: 19800,
    parking: "Underground Garage at 40 Bay St; direct Union Station PATH walkway.",
    image: "images/venues/scotiabank-arena.jpg"
  },
  {
    id: "ven-10",
    name: "Ziggo Dome",
    city: "Amsterdam",
    country: "Netherlands",
    capacity: 17000,
    parking: "P-Dome & P1-P6 Arena Boulevard garages; Amsterdam Bijlmer ArenA Station.",
    image: "images/venues/ziggo-dome.jpg"
  }
];

/**
 * Deterministic Mulberry32 seeded PRNG so generated concert IDs, venues,
 * dates, and prices remain identical across reloads and teammate pages.
 */
function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function seededPick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

function seededShuffle(rng, list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

function formatShowTime(hour24, minute) {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const paddedMin = String(minute).padStart(2, "0");
  return `${hour12}:${paddedMin} ${suffix}`;
}

function formatGenreTitle(genre) {
  return String(genre || "Live Music")
    .split(/(\s+|\/)/)
    .map((part) => (/^[a-z]/i.test(part) ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("");
}

function buildIsoTimestamp(year, month, day, hour24, minute) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const hh = String(hour24).padStart(2, "0");
  const min = String(minute).padStart(2, "0");
  return `${year}-${mm}-${dd}T${hh}:${min}:00`;
}

/**
 * Generates a deterministic international catalog of solo concerts (4-5 per artist)
 * and 3 multi-artist international festival events.
 */
function generateConcertsCatalog(artistsList, venuesList) {
  const rng = createSeededRandom(20261127);
  const DEFAULT_EVENT_BANNER = "images/coachella.jpg";
  const SECONDARY_EVENT_BANNER_FALLBACK = "images/coldplay.jpg";
  const showTimes = [
    [19, 0],
    [19, 30],
    [20, 0],
    [20, 30],
    [21, 0]
  ];
  const dateSlots = [
    { year: 2026, month: 12, day: 4 },
    { year: 2026, month: 12, day: 11 },
    { year: 2026, month: 12, day: 18 },
    { year: 2026, month: 12, day: 27 },
    { year: 2027, month: 1, day: 9 },
    { year: 2027, month: 1, day: 23 },
    { year: 2027, month: 2, day: 6 },
    { year: 2027, month: 2, day: 19 },
    { year: 2027, month: 3, day: 7 },
    { year: 2027, month: 3, day: 21 },
    { year: 2027, month: 4, day: 10 },
    { year: 2027, month: 4, day: 24 },
    { year: 2027, month: 5, day: 8 },
    { year: 2027, month: 5, day: 22 },
    { year: 2027, month: 6, day: 5 },
    { year: 2027, month: 6, day: 19 },
    { year: 2027, month: 7, day: 10 },
    { year: 2027, month: 7, day: 24 },
    { year: 2027, month: 8, day: 7 },
    { year: 2027, month: 8, day: 21 },
    { year: 2027, month: 9, day: 11 },
    { year: 2027, month: 9, day: 25 },
    { year: 2027, month: 10, day: 9 },
    { year: 2027, month: 10, day: 23 }
  ];

  const draftConcerts = [];

  artistsList.forEach((artist, artistIndex) => {
    const showsForArtist = seededInt(rng, 4, 5);
    const tourVenues = seededShuffle(rng, venuesList).slice(0, showsForArtist);
    const chosenSlots = seededShuffle(rng, dateSlots)
      .slice(0, showsForArtist)
      .sort((a, b) => (a.year - b.year) || (a.month - b.month) || (a.day - b.day));

    const titleBuilders = [
    (name, venue, year) => `${name}: World Tour ${year}`,
    (name, venue) => `${name} Live in ${venue.city}`,
    (name, venue, year) => `${name}: Live Arena Tour ${year}`,
    (name, venue) => `${name} — ${venue.name} Night`,
    (name, venue) => `${name}: Echoes Across ${venue.city}`
  ];
    const rotatedBuilders = titleBuilders.map(
      (_, idx) => titleBuilders[(idx + artistIndex) % titleBuilders.length]
    );

    for (let i = 0; i < showsForArtist; i += 1) {
      const venue = tourVenues[i];
      const slot = chosenSlots[i];
      const dayOffset = seededInt(rng, 0, 2);
      const day = Math.min(28, slot.day + dayOffset);
      const [hour24, minute] = seededPick(rng, showTimes);
      const isoDate = buildIsoTimestamp(slot.year, slot.month, day, hour24, minute);
      const timeLabel = formatShowTime(hour24, minute);
      const title = artist.tourName
  ? `${artist.name}: ${artist.tourName}`
  : rotatedBuilders[i](artist.name, venue, slot.year);
      const price = Number((seededInt(rng, 13, 37) * 5 + (rng() > 0.5 ? 0 : 0.5)).toFixed(2));
      const seatsAvailable = seededInt(rng, 36, 420);
      const genreLabel = formatGenreTitle(artist.genre);
      const soloBanner = artist.banner || artist.image;

      draftConcerts.push({
        title,
        artistId: artist.id,
        lineup: [artist.id],
        venueId: venue.id,
        city: venue.city,
        country: venue.country,
        date: isoDate,
        time: timeLabel,
        genre: genreLabel,
        price,
        seatsAvailable,
        image: artist.image,
        banner: soloBanner,
        bannerFallback:
          artist.image && artist.image !== soloBanner
            ? artist.image
            : soloBanner === DEFAULT_EVENT_BANNER
              ? SECONDARY_EVENT_BANNER_FALLBACK
              : DEFAULT_EVENT_BANNER,
        isFestival: false,
        description: `${artist.name} brings a full-production ${genreLabel.toLowerCase()} arena show to ${venue.name} in ${venue.city}, ${venue.country}.`
      });
    }
  });

  const festivalConfigs = [
    {
      title: "Global Fest 2026",
      venueId: "ven-2",
      date: "2026-12-19T18:30:00",
      time: "6:30 PM",
      genre: "Multi-Genre Festival",
      lineup: ["art-1", "art-6", "art-7"],
      price: 195.0,
      seatsAvailable: 480,
      banner: DEFAULT_EVENT_BANNER,
      bannerFallback: SECONDARY_EVENT_BANNER_FALLBACK,
      description: "Three headline acts unite at London's The O2 Arena for Global Fest 2026, featuring Coldplay, Billie Eilish, and Tame Impala on one stage."
    },
    {
      title: "Coachella",
      venueId: "ven-1",
      date: "2027-04-17T17:30:00",
      time: "5:30 PM",
      genre: "Pop & Hip-Hop Festival",
      lineup: ["art-5", "art-9", "art-2", "art-8"],
      price: 249.0,
      seatsAvailable: 540,
      banner: DEFAULT_EVENT_BANNER,
      bannerFallback: SECONDARY_EVENT_BANNER_FALLBACK,
      description: "A special arena edition of Coachella bringing Drake, Taylor Swift, The Neighbourhood, and Gracie Abrams together for an unforgettable night."
    },
    {
      title: "Montreal International Jazz Festival",
      venueId: "ven-9",
      date: "2027-07-03T19:00:00",
      time: "7:00 PM",
      genre: "International Live Showcase",
      lineup: ["art-3", "art-4", "art-1"],
      price: 175.0,
      seatsAvailable: 310,
      banner: DEFAULT_EVENT_BANNER,
      bannerFallback: SECONDARY_EVENT_BANNER_FALLBACK,
      description: "An international crossover showcase curated with Montreal International Jazz Festival, uniting Atif Aslam, Asim Azhar, and Coldplay."
    }
  ];

  festivalConfigs.forEach((fest) => {
    const venue = venuesList.find((item) => item.id === fest.venueId) || venuesList[0];
    const validLineup = fest.lineup.filter((id) =>
      artistsList.some((artist) => artist.id === id)
    );
    const headliner = artistsList.find((artist) => artist.id === validLineup[0]) || artistsList[0];
    const festivalBanner = fest.banner || DEFAULT_EVENT_BANNER;

    draftConcerts.push({
      title: fest.title,
      artistId: headliner.id,
      lineup: validLineup,
      venueId: venue.id,
      city: venue.city,
      country: venue.country,
      date: fest.date,
      time: fest.time,
      genre: fest.genre,
      price: fest.price,
      seatsAvailable: fest.seatsAvailable,
      image: festivalBanner,
      banner: festivalBanner,
      bannerFallback: fest.bannerFallback || SECONDARY_EVENT_BANNER_FALLBACK,
      isFestival: true,
      description: fest.description
    });
  });

  draftConcerts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return draftConcerts.map((concert, index) => ({
    id: `evt-${index + 1}`,
    ...concert
  }));
}

const CONCERTS = generateConcertsCatalog(ARTISTS, VENUES);

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
  },
  getConcertLineup(concertOrId) {
    const concert =
      typeof concertOrId === "string"
        ? this.getConcertById(concertOrId)
        : concertOrId;
    if (!concert) {
      return [];
    }
    const rawIds =
      Array.isArray(concert.lineup) && concert.lineup.length > 0
        ? concert.lineup
        : concert.artistId
          ? [concert.artistId]
          : [];
    const seen = new Set();
    return rawIds
      .filter((id) => {
        if (!id || seen.has(id)) {
          return false;
        }
        seen.add(id);
        return true;
      })
      .map((id) => this.getArtistById(id))
      .filter(Boolean);
  },
  getConcertBannerFallback(concertOrId) {
    const concert =
      typeof concertOrId === "string"
        ? this.getConcertById(concertOrId)
        : concertOrId;
    if (!concert) {
      return "images/coachella.jpg";
    }
    if (concert.bannerFallback) {
      return concert.bannerFallback;
    }
    const headliner = this.getArtistById(concert.artistId);
    return headliner && headliner.image ? headliner.image : "images/coachella.jpg";
  }
};
