import { Audiobook, Genre, TrackedEntity, TrackedEntityType } from '../types/audiobook';
import coverScifi from '../assets/images/cover_scifi_void_1790494184883.jpg';
import coverFantasy from '../assets/images/cover_fantasy_blade_1790494198336.jpg';
import coverLitrpg from '../assets/images/cover_litrpg_crawler_1790494211158.jpg';
import coverThriller from '../assets/images/cover_thriller_shadow_1790494227784.jpg';

export interface AudibleSearchResultItem {
  id: string;
  type: 'book' | 'author' | 'narrator' | 'series';
  title: string;
  subtitle: string;
  creatorOrAuthor: string;
  narrators?: string[];
  releaseDate?: string;
  rating: number;
  ratingCount: number;
  genre?: Genre;
  coverUrl: string;
  audibleUrl: string;
  series?: { name: string; bookNumber?: number | string };
  synopsis?: string;
  runtimeHours?: number;
  upcomingCount?: number;
}

// Master index of searchable Audible catalog entries
export const AUDIBLE_DATABASE: AudibleSearchResultItem[] = [
  // --- FLAGSHIP RELEASES ---
  {
    id: 'audible-db-1',
    type: 'book',
    title: 'Wind and Truth',
    subtitle: 'The Stormlight Archive, Book 5',
    creatorOrAuthor: 'Brandon Sanderson',
    narrators: ['Michael Kramer', 'Kate Reading'],
    releaseDate: '2026-12-06',
    rating: 4.9,
    ratingCount: 38920,
    genre: 'Fantasy',
    coverUrl: coverFantasy,
    audibleUrl: 'https://www.audible.com/pd/Wind-and-Truth-Audiobook/B0D5B7L9K3',
    series: { name: 'The Stormlight Archive', bookNumber: 5 },
    synopsis: 'Dalinar Kholin challenges the champion of Odium in a contest of champions spanning ten days. The explosive finale to the first arc of The Stormlight Archive narrated by the legendary Michael Kramer and Kate Reading.',
    runtimeHours: 49.5,
  },
  {
    id: 'audible-db-2',
    type: 'book',
    title: 'Protocol Omega',
    subtitle: 'Dungeon Crawler Carl Universe, Book 8',
    creatorOrAuthor: 'Matt Dinniman',
    narrators: ['Jeff Hays', 'Soundbooth Theater Cast'],
    releaseDate: '2026-09-27',
    rating: 4.9,
    ratingCount: 34210,
    genre: 'LitRPG',
    coverUrl: coverLitrpg,
    audibleUrl: 'https://www.audible.com/pd/Protocol-Omega-Audiobook/B0EXAMPLE1',
    series: { name: 'Dungeon Crawler Universe', bookNumber: 8 },
    synopsis: 'The dungeon crawl reaches fever pitch on the deeper floors. Carl and Princess Donut face corporate syndicate overlords in a desperate sprint to save surviving crawlers.',
    runtimeHours: 23.5,
  },
  {
    id: 'audible-db-3',
    type: 'book',
    title: 'The Sunken Crown',
    subtitle: 'The Cosmere Shardworlds, Book 1',
    creatorOrAuthor: 'Brandon Sanderson',
    narrators: ['Michael Kramer', 'Kate Reading'],
    releaseDate: '2026-09-28',
    rating: 4.9,
    ratingCount: 28400,
    genre: 'Fantasy',
    coverUrl: coverFantasy,
    audibleUrl: 'https://www.audible.com/pd/The-Sunken-Crown-Audiobook/B0EXAMPLE2',
    series: { name: 'The Cosmere Shardworlds', bookNumber: 1 },
    synopsis: 'On an oceanic world where islands drift across living tides, an ancient investiture emerges from the abyss.',
    runtimeHours: 41.2,
  },
  {
    id: 'audible-db-4',
    type: 'book',
    title: 'Echoes of the Void',
    subtitle: 'The Kepler Continuum, Book 3',
    creatorOrAuthor: 'Adrian Tchaikovsky',
    narrators: ['Ray Porter'],
    releaseDate: '2026-10-04',
    rating: 4.8,
    ratingCount: 14200,
    genre: 'Sci-Fi',
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/pd/Echoes-of-the-Void-Audiobook/B0EXAMPLE3',
    series: { name: 'The Kepler Continuum', bookNumber: 3 },
    synopsis: 'Humanity makes contact with a megastructure older than the stars. Ray Porter delivers a tour-de-force narration exploring cosmic isolation.',
    runtimeHours: 19.8,
  },
  {
    id: 'audible-db-5',
    type: 'book',
    title: 'Zero Protocol',
    subtitle: 'A Neural Cyber-Espionage Thriller',
    creatorOrAuthor: 'Blake Crouch',
    narrators: ['Tim Gerard Reynolds'],
    releaseDate: '2026-10-18',
    rating: 4.7,
    ratingCount: 8940,
    genre: 'Thriller',
    coverUrl: coverThriller,
    audibleUrl: 'https://www.audible.com/pd/Zero-Protocol-Audiobook/B0EXAMPLE4',
    series: { name: 'Standalone Espionage' },
    synopsis: 'An encrypted neural implant begins transmitting memory fragments belonging to an operative who died seventy years prior.',
    runtimeHours: 11.4,
  },
  {
    id: 'audible-db-6',
    type: 'book',
    title: 'The Machine Mind Odyssey',
    subtitle: 'Bobiverse, Book 6',
    creatorOrAuthor: 'Dennis E. Taylor',
    narrators: ['Ray Porter'],
    releaseDate: '2026-11-12',
    rating: 4.9,
    ratingCount: 22100,
    genre: 'Sci-Fi',
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/pd/The-Machine-Mind-Odyssey-Audiobook/B0EXAMPLE5',
    series: { name: 'Bobiverse', bookNumber: 6 },
    synopsis: 'Bob and the clones stumble onto a cluster of dormant Dyson swarms and accidentally trigger an automated galactic reclamation routine.',
    runtimeHours: 14.2,
  },
  {
    id: 'audible-db-7',
    type: 'book',
    title: "Warlock's Gambit",
    subtitle: 'Legends & Lattes Universe, Book 3',
    creatorOrAuthor: 'Travis Baldree',
    narrators: ['Travis Baldree'],
    releaseDate: '2026-10-25',
    rating: 4.8,
    ratingCount: 16500,
    genre: 'Fantasy',
    coverUrl: coverFantasy,
    audibleUrl: 'https://www.audible.com/pd/Warlocks-Gambit-Audiobook/B0EXAMPLE6',
    series: { name: 'Legends & Lattes Universe', bookNumber: 3 },
    synopsis: 'Cozy fantasy: an exhausted retired battle-mage opens a peaceful antiquarian clock shop in a coastal sanctuary.',
    runtimeHours: 9.6,
  },
  {
    id: 'audible-db-8',
    type: 'book',
    title: 'The Deepest Trench',
    subtitle: 'The Murderbot Diaries, Book 8',
    creatorOrAuthor: 'Martha Wells',
    narrators: ['Kevin R. Free'],
    releaseDate: '2026-10-01',
    rating: 4.9,
    ratingCount: 19400,
    genre: 'Sci-Fi',
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/pd/The-Deepest-Trench-Audiobook/B0EXAMPLE7',
    series: { name: 'The Murderbot Diaries', bookNumber: 8 },
    synopsis: 'Murderbot wants nothing more than to watch soap operas in solitude, but when an underwater research station loses contact, Dr. Mensah persuades it into an aquatic salvage operation.',
    runtimeHours: 8.5,
  },
  {
    id: 'audible-db-9',
    type: 'book',
    title: 'Red God',
    subtitle: 'Red Rising Saga, Book 7',
    creatorOrAuthor: 'Pierce Brown',
    narrators: ['Tim Gerard Reynolds'],
    releaseDate: '2026-11-24',
    rating: 4.9,
    ratingCount: 42100,
    genre: 'Sci-Fi',
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/pd/Red-God-Audiobook/B0EXAMPLE99',
    series: { name: 'Red Rising Saga', bookNumber: 7 },
    synopsis: 'The climactic solar-system finale. Darrow of Lykos wages one final battle across Luna, Earth, and Mars to bring the Society down for good. Tim Gerard Reynolds returns in his crowning vocal performance.',
    runtimeHours: 32.0,
  },
  {
    id: 'audible-db-10',
    type: 'book',
    title: 'Cold Reckoning',
    subtitle: 'First Law World Saga',
    creatorOrAuthor: 'Joe Abercrombie',
    narrators: ['Steven Pacey'],
    releaseDate: '2026-12-08',
    rating: 4.9,
    ratingCount: 31200,
    genre: 'Fantasy',
    coverUrl: coverFantasy,
    audibleUrl: 'https://www.audible.com/pd/Cold-Reckoning-Audiobook/B0EXAMPLE8',
    series: { name: 'First Law World' },
    synopsis: 'Grimdark mastery returns. Steven Pacey lends his legendary vocal range to muddy sieges, broken loyalties, and black powder.',
    runtimeHours: 25.1,
  },
  {
    id: 'audible-db-11',
    type: 'book',
    title: 'Onyx Storm',
    subtitle: 'The Empyrean, Book 3',
    creatorOrAuthor: 'Rebecca Yarros',
    narrators: ['Rebecca Soler', 'Teddy Hamilton'],
    releaseDate: '2026-10-10',
    rating: 4.8,
    ratingCount: 54200,
    genre: 'Romance',
    coverUrl: coverFantasy,
    audibleUrl: 'https://www.audible.com/pd/Onyx-Storm-Audiobook/B0EXAMPLE33',
    series: { name: 'The Empyrean', bookNumber: 3 },
    synopsis: 'Violet Sorrengail must survive a brutal third year at Basgiath War College as dark venin forces converge beyond the wards. Dual narration by Rebecca Soler and Teddy Hamilton.',
    runtimeHours: 27.5,
  },
  {
    id: 'audible-db-12',
    type: 'book',
    title: 'Project Proxima: The Arrival',
    subtitle: 'From the creator of Project Hail Mary',
    creatorOrAuthor: 'Andy Weir',
    narrators: ['Ray Porter'],
    releaseDate: '2026-11-30',
    rating: 4.9,
    ratingCount: 48900,
    genre: 'Sci-Fi',
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/pd/Project-Proxima-Audiobook/B0EXAMPLE77',
    series: { name: 'Proxima Continuum' },
    synopsis: 'A lone astrophysicist stranded on an automated science station orbiting Proxima b uncovers a synthetic beacon counting down to zero. Narrated with unmatched humor and tension by Ray Porter.',
    runtimeHours: 16.8,
  },

  // --- POPULAR AUDIBLE AUTHORS ---
  {
    id: 'audible-author-1',
    type: 'author',
    title: 'Brandon Sanderson',
    subtitle: '#1 New York Times Bestselling Author',
    creatorOrAuthor: 'Brandon Sanderson',
    rating: 4.9,
    ratingCount: 185000,
    coverUrl: coverFantasy,
    audibleUrl: 'https://www.audible.com/author/Brandon-Sanderson/B001IGFHW6',
    synopsis: 'Author of Mistborn, The Stormlight Archive, and the sprawling Cosmere universe. Frequent collaborator with narrators Michael Kramer and Kate Reading.',
    upcomingCount: 2,
  },
  {
    id: 'audible-author-2',
    type: 'author',
    title: 'Dennis E. Taylor',
    subtitle: 'Audible Hall of Fame Author',
    creatorOrAuthor: 'Dennis E. Taylor',
    rating: 4.8,
    ratingCount: 94000,
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/author/Dennis-E-Taylor/B0107Z19OQ',
    synopsis: 'Creator of the beloved Bobiverse series (We Are Legion, All These Worlds). Renowned for hard science fiction with heartwarming existential wit.',
    upcomingCount: 1,
  },
  {
    id: 'audible-author-3',
    type: 'author',
    title: 'Matt Dinniman',
    subtitle: 'Audible Phenom & LitRPG Pioneer',
    creatorOrAuthor: 'Matt Dinniman',
    rating: 4.9,
    ratingCount: 112000,
    coverUrl: coverLitrpg,
    audibleUrl: 'https://www.audible.com/author/Matt-Dinniman/B0034Q8A44',
    synopsis: 'Author of Dungeon Crawler Carl, Kaiju: Battlefield Surgeon, and Dominion of Blades. Master of darkly comedic survival fiction.',
    upcomingCount: 1,
  },
  {
    id: 'audible-author-4',
    type: 'author',
    title: 'Pierce Brown',
    subtitle: 'Bestselling Creator of Red Rising',
    creatorOrAuthor: 'Pierce Brown',
    rating: 4.9,
    ratingCount: 140000,
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/author/Pierce-Brown/B00EYG8L0U',
    synopsis: 'Creator of the epic space-opera saga Red Rising, Golden Son, Morning Star, Iron Gold, Dark Age, and Light Bringer.',
    upcomingCount: 1,
  },
  {
    id: 'audible-author-5',
    type: 'author',
    title: 'Adrian Tchaikovsky',
    subtitle: 'Arthur C. Clarke Award Winner',
    creatorOrAuthor: 'Adrian Tchaikovsky',
    rating: 4.8,
    ratingCount: 78000,
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/author/Adrian-Tchaikovsky/B002A509HQ',
    synopsis: 'Acclaimed author of Children of Time, Shards of Earth, Cage of Souls, and Alien Clay.',
    upcomingCount: 1,
  },

  // --- POPULAR AUDIBLE NARRATORS ---
  {
    id: 'audible-narrator-1',
    type: 'narrator',
    title: 'Jeff Hays',
    subtitle: 'Audible AudioFile Earphones Award Winner',
    creatorOrAuthor: 'Jeff Hays',
    rating: 4.9,
    ratingCount: 160000,
    coverUrl: coverLitrpg,
    audibleUrl: 'https://www.audible.com/narrator/Jeff-Hays/B00TGB8A1S',
    synopsis: 'Founder of Soundbooth Theater and legendary voice behind Dungeon Crawler Carl (Princess Donut, Carl, Borant, Odus). Unrivaled vocal dexterity.',
    upcomingCount: 1,
  },
  {
    id: 'audible-narrator-2',
    type: 'narrator',
    title: 'Ray Porter',
    subtitle: 'Audible Narrator of the Year',
    creatorOrAuthor: 'Ray Porter',
    rating: 4.9,
    ratingCount: 220000,
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/narrator/Ray-Porter/B00732A15K',
    synopsis: 'Legendary voice of Project Hail Mary, the entire Bobiverse saga, Peter Clines books, and Don Winslow thrillers.',
    upcomingCount: 2,
  },
  {
    id: 'audible-narrator-3',
    type: 'narrator',
    title: 'Steven Pacey',
    subtitle: 'Master Voice of Dark Fantasy',
    creatorOrAuthor: 'Steven Pacey',
    rating: 4.9,
    ratingCount: 98000,
    coverUrl: coverFantasy,
    audibleUrl: 'https://www.audible.com/narrator/Steven-Pacey/B001H05Z10',
    synopsis: 'Celebrated by critics as one of the greatest audiobook narrators in history. Voice of Joe Abercrombie’s First Law books (Glokta, Logen Ninefingers).',
    upcomingCount: 1,
  },
  {
    id: 'audible-narrator-4',
    type: 'narrator',
    title: 'Tim Gerard Reynolds',
    subtitle: 'Multi-Audie Award Winning Narrator',
    creatorOrAuthor: 'Tim Gerard Reynolds',
    rating: 4.8,
    ratingCount: 145000,
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/narrator/Tim-Gerard-Reynolds/B005L7J7B0',
    synopsis: 'Beloved voice of Darrow in Red Rising, Michael J. Sullivan’s Riyria series, and Mark Lawrence fantasy sagas.',
    upcomingCount: 2,
  },

  // --- POPULAR AUDIBLE SERIES ---
  {
    id: 'audible-series-1',
    type: 'series',
    title: 'Dungeon Crawler Carl',
    subtitle: '8 Audiobooks · LitRPG Survival Comedy',
    creatorOrAuthor: 'Matt Dinniman',
    rating: 4.9,
    ratingCount: 125000,
    coverUrl: coverLitrpg,
    audibleUrl: 'https://www.audible.com/series/Dungeon-Crawler-Carl-Audiobooks/B08V81GY52',
    synopsis: 'The apocalypse will be televised. Earth is flattened into an eighteen-level subterranean death arena run by aliens. Carl and Princess Donut must survive.',
    upcomingCount: 1,
  },
  {
    id: 'audible-series-2',
    type: 'series',
    title: 'The Stormlight Archive',
    subtitle: '5 Audiobooks · Epic Fantasy Mega-Series',
    creatorOrAuthor: 'Brandon Sanderson',
    rating: 4.9,
    ratingCount: 240000,
    coverUrl: coverFantasy,
    audibleUrl: 'https://www.audible.com/series/The-Stormlight-Archive-Audiobooks/B006K1RP8U',
    synopsis: 'The sweeping epic on Roshar. Kaladin, Shallan, and Dalinar battle ancient Spren and the Desolation with Radiant Shardblades.',
    upcomingCount: 1,
  },
  {
    id: 'audible-series-3',
    type: 'series',
    title: 'Bobiverse',
    subtitle: '6 Audiobooks · Space Exploration Sci-Fi',
    creatorOrAuthor: 'Dennis E. Taylor',
    rating: 4.9,
    ratingCount: 110000,
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/series/Bobiverse-Audiobooks/B0180TL5R4',
    synopsis: 'Bob Johansson wakes up as an uploaded mind controlling an interstellar von Neumann probe sent to seek out new habitable worlds.',
    upcomingCount: 1,
  },
  {
    id: 'audible-series-4',
    type: 'series',
    title: 'Red Rising Saga',
    subtitle: '7 Audiobooks · Dystopian Space Revolution',
    creatorOrAuthor: 'Pierce Brown',
    rating: 4.9,
    ratingCount: 175000,
    coverUrl: coverScifi,
    audibleUrl: 'https://www.audible.com/series/Red-Rising-Audiobooks/B00U135VAM',
    synopsis: 'Darrow of Lykos infiltrates the ruling Gold caste to tear down the oppressive Society from the inside.',
    upcomingCount: 1,
  },
];

/**
 * Search Audible catalog with fuzzy matching and on-the-fly synthesis for custom queries
 */
export function searchAudible(
  query: string,
  category: 'all' | 'audiobooks' | 'authors' | 'narrators' | 'series' = 'all'
): AudibleSearchResultItem[] {
  const cleanQ = query.trim().toLowerCase();

  // If query is empty, return a curated highlight selection
  if (!cleanQ) {
    return AUDIBLE_DATABASE.filter((item) => {
      if (category === 'audiobooks') return item.type === 'book';
      if (category === 'authors') return item.type === 'author';
      if (category === 'narrators') return item.type === 'narrator';
      if (category === 'series') return item.type === 'series';
      return true;
    }).slice(0, 10);
  }

  // 1. Filter existing catalog
  const directMatches = AUDIBLE_DATABASE.filter((item) => {
    if (category === 'audiobooks' && item.type !== 'book') return false;
    if (category === 'authors' && item.type !== 'author') return false;
    if (category === 'narrators' && item.type !== 'narrator') return false;
    if (category === 'series' && item.type !== 'series') return false;

    const matchTitle = item.title.toLowerCase().includes(cleanQ);
    const matchCreator = item.creatorOrAuthor.toLowerCase().includes(cleanQ);
    const matchSubtitle = item.subtitle.toLowerCase().includes(cleanQ);
    const matchNarrators = item.narrators?.some((n) => n.toLowerCase().includes(cleanQ)) || false;
    const matchGenre = item.genre?.toLowerCase().includes(cleanQ) || false;
    const matchSeries = item.series?.name.toLowerCase().includes(cleanQ) || false;

    return matchTitle || matchCreator || matchSubtitle || matchNarrators || matchGenre || matchSeries;
  });

  // 2. If user searched for a custom title/author that didn't match existing, synthesize dynamic Audible match!
  if (directMatches.length === 0 && cleanQ.length >= 2) {
    const formattedTitle = query
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    const synthesizedBook: AudibleSearchResultItem = {
      id: `audible-synth-${Date.now()}`,
      type: 'book',
      title: formattedTitle,
      subtitle: 'Audible Audio Edition',
      creatorOrAuthor: 'Audible Selected Author',
      narrators: ['Audible Ensemble Narrator'],
      releaseDate: '2026-10-28',
      rating: 4.8,
      ratingCount: 3410,
      genre: 'Sci-Fi',
      coverUrl: coverScifi,
      audibleUrl: `https://www.audible.com/search?keywords=${encodeURIComponent(query)}`,
      synopsis: `Audible audio edition of "${formattedTitle}". Includes unabridged voice performance with professional audio mastering.`,
      runtimeHours: 13.5,
    };

    const synthesizedCreator: AudibleSearchResultItem = {
      id: `audible-synth-author-${Date.now()}`,
      type: 'author',
      title: formattedTitle,
      subtitle: 'Audible Creator / Author Profile',
      creatorOrAuthor: formattedTitle,
      rating: 4.8,
      ratingCount: 8900,
      coverUrl: coverFantasy,
      audibleUrl: `https://www.audible.com/search?searchAuthor=${encodeURIComponent(query)}`,
      synopsis: `Follow ${formattedTitle} on Audible to automatically receive alerts on all upcoming audio releases.`,
      upcomingCount: 1,
    };

    return [synthesizedBook, synthesizedCreator];
  }

  return directMatches;
}

/**
 * Convert an AudibleSearchResultItem into a local tracked Audiobook
 */
export function convertAudibleResultToAudiobook(result: AudibleSearchResultItem): Audiobook {
  return {
    id: `ab-${result.id}`,
    title: result.title,
    author: result.creatorOrAuthor,
    narrators: result.narrators || ['Audible Narrator'],
    series: result.series,
    releaseDate: result.releaseDate || '2026-10-30',
    coverUrl: result.coverUrl,
    runtimeHours: result.runtimeHours || 12,
    genre: result.genre || 'Sci-Fi',
    audibleRating: result.rating || 4.8,
    ratingCount: result.ratingCount || 1000,
    synopsis: result.synopsis || `Audible audio release of ${result.title}.`,
    audibleUrl: result.audibleUrl,
    isRead: false,
    reminders: {
      oneWeekBefore: true,
      oneDayBefore: true,
      dayOfRelease: true,
    },
    isCustom: true,
  };
}
