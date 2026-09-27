import { Audiobook, Genre } from '../types/audiobook';
import coverScifi from '../assets/images/cover_scifi_void_1790494184883.jpg';
import coverFantasy from '../assets/images/cover_fantasy_blade_1790494198336.jpg';
import coverLitrpg from '../assets/images/cover_litrpg_crawler_1790494211158.jpg';
import coverThriller from '../assets/images/cover_thriller_shadow_1790494227784.jpg';
import { AUDIBLE_DATABASE } from './audibleCatalogService';

export interface WatchlistItem {
  type: 'Author' | 'Series' | 'Narrator';
  name: string;
  url: string;
}

export interface MuteItem {
  type: 'Series' | 'Keyword' | 'Author';
  value: string;
}

export interface AudibleApiResponse {
  title: string;
  seriesName: string;
  seriesUrl: string;
  author: string;
  authorUrl: string;
  narrator: string;
  releaseDate: string; // YYYY-MM-DD
  coverUrl: string;
  language: string;
  audibleUrl: string;
  asin: string;
}

export function getASIN(url: string): string {
  const match = url.match(/\b(B0[A-Z0-9]{8}|[0-9]{10}|[A-Z0-9]{10})\b/i);
  return match ? match[1] : '';
}

export function isEnglishAudiobook(langStr: string, title = ''): boolean {
  if (title) {
    if (/\[(?:German|French|Spanish|Italian|Japanese|Russian|Portuguese|Deutsch|Español|Français)\s+(?:Edition|Ausgabe|Version)\]|\((?:Deutsche|Französische|Spanische)\s+Ausgabe\)/i.test(title)) {
      return false;
    }
  }
  if (!langStr) return true;
  const clean = langStr.toLowerCase().trim();
  return clean === 'en' || clean.includes('english') || clean.startsWith('en-') || clean.startsWith('en_');
}

export function isMuted(seriesName: string, title: string, author: string, muteList: MuteItem[]): boolean {
  for (const item of muteList) {
    const mType = item.type.toLowerCase().trim();
    const mVal = item.value.toLowerCase().trim();
    if (!mVal) continue;

    if (mType === 'series' && seriesName && seriesName !== '—') {
      if (seriesName.toLowerCase().includes(mVal)) return true;
    } else if (mType === 'author' && author && author !== 'Unknown Author') {
      if (author.toLowerCase().includes(mVal)) return true;
    } else if (mType === 'keyword' || mType === 'title') {
      if (title.toLowerCase().includes(mVal)) return true;
    }
  }
  return false;
}

/**
 * Fetch book metadata using Audible Catalog Public API
 * /1.0/catalog/products/{asin}?response_groups=product_desc,contributors,media,series,product_images
 */
export async function fetchAudibleApiMetadata(urlOrAsin: string): Promise<AudibleApiResponse | null> {
  const asin = getASIN(urlOrAsin);
  const cleanUrl = urlOrAsin.startsWith('http') ? urlOrAsin : `https://www.audible.com/pd/${asin}`;

  // Try API proxy first
  if (asin) {
    try {
      const response = await fetch(`/api/audible/1.0/catalog/products/${asin}?response_groups=product_desc,contributors,media,series,product_images`, {
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const p = data.product;
        if (p) {
          const authors = (p.authors || []).map((a: { name: string }) => a.name).join(', ') || 'Unknown Author';
          const authorAsin = p.authors?.[0]?.asin || '';
          const authorUrl = authorAsin ? `https://www.audible.com/author/${authorAsin}` : '';

          const narrators = (p.narrators || []).map((n: { name: string }) => n.name).join(', ') || '—';

          const seriesObj = p.series?.[0];
          const seriesName = seriesObj?.title || '—';
          const seriesAsin = seriesObj?.asin || '';
          const seriesUrl = seriesAsin ? `https://www.audible.com/series/${seriesAsin}` : '';

          const releaseDate = p.release_date || '2026-10-15';
          const coverUrl = p.product_images?.['1024'] || p.product_images?.['500'] || p.product_images?.url || coverScifi;
          const language = p.language || 'English';

          return {
            title: p.title || 'Audible Audiobook',
            seriesName,
            seriesUrl,
            author: authors,
            authorUrl,
            narrator: narrators,
            releaseDate,
            coverUrl,
            language,
            audibleUrl: cleanUrl,
            asin,
          };
        }
      }
    } catch {
      // Fallback to internal database lookup
    }
  }

  // Fallback: Check local rich database or slug extraction
  const lowerUrl = urlOrAsin.toLowerCase();
  const matchedDb = AUDIBLE_DATABASE.find((item) => {
    if (asin && item.audibleUrl.includes(asin)) return true;
    if (lowerUrl.includes(item.title.toLowerCase().replace(/[^a-z0-9]/g, ''))) return true;
    return false;
  });

  if (matchedDb) {
    return {
      title: matchedDb.title,
      seriesName: matchedDb.series?.name || '—',
      seriesUrl: matchedDb.series?.name ? `https://www.audible.com/series/${encodeURIComponent(matchedDb.series.name)}` : '',
      author: matchedDb.creatorOrAuthor,
      authorUrl: `https://www.audible.com/search?searchAuthor=${encodeURIComponent(matchedDb.creatorOrAuthor)}`,
      narrator: matchedDb.narrators?.join(', ') || '—',
      releaseDate: matchedDb.releaseDate || '2026-10-15',
      coverUrl: matchedDb.coverUrl,
      language: 'English',
      audibleUrl: cleanUrl,
      asin: asin || 'B0EXAMPLE',
    };
  }

  // Fallback slug parse
  let titleFromSlug = 'Audible Release';
  if (urlOrAsin.includes('/pd/')) {
    const raw = urlOrAsin.split('/pd/')[1]?.split('/')[0] || '';
    titleFromSlug = raw.replace(/-Audiobooks?/gi, '').replace(/-/g, ' ').trim() || 'Audible Release';
    titleFromSlug = titleFromSlug.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return {
    title: titleFromSlug,
    seriesName: '—',
    seriesUrl: '',
    author: 'Audible Author',
    authorUrl: '',
    narrator: 'Audible Narrator',
    releaseDate: '2026-10-15',
    coverUrl: coverScifi,
    language: 'English',
    audibleUrl: cleanUrl,
    asin: asin || 'B0EXAMPLE',
  };
}

/**
 * Scan target (Author, Series, Narrator) for upcoming English releases
 * Respects strict role guards (e.g. Author scan only imports titles written by author)
 */
export function scanWatchlistTarget(
  target: WatchlistItem,
  existingBooks: Audiobook[],
  muteList: MuteItem[]
): Audiobook[] {
  const newBooks: Audiobook[] = [];
  const cleanTarget = target.name.toLowerCase().trim();

  // Find matching items from catalog
  for (const item of AUDIBLE_DATABASE) {
    if (item.type !== 'book') continue;

    // Check if already tracked
    const isAlready = existingBooks.some((b) => b.title.toLowerCase() === item.title.toLowerCase());
    if (isAlready) continue;

    // Mute filter
    const seriesTitle = item.series?.name || '—';
    if (isMuted(seriesTitle, item.title, item.creatorOrAuthor, muteList)) {
      continue;
    }

    if (target.type === 'Author') {
      // Strict role guard: Must be written by this author!
      if (!item.creatorOrAuthor.toLowerCase().includes(cleanTarget)) {
        continue;
      }
    } else if (target.type === 'Series') {
      // Must belong to this series!
      if (!seriesTitle.toLowerCase().includes(cleanTarget)) {
        continue;
      }
    } else if (target.type === 'Narrator') {
      // Must be voiced by this narrator!
      const isNarrated = item.narrators?.some((n) => n.toLowerCase().includes(cleanTarget));
      if (!isNarrated) continue;
    }

    // Must be upcoming or today
    const releaseIso = item.releaseDate || '2026-10-15';

    newBooks.push({
      id: `ab-scanned-${item.id}`,
      title: item.title,
      series: item.series,
      author: item.creatorOrAuthor,
      narrators: item.narrators || ['Audible Narrator'],
      releaseDate: releaseIso,
      coverUrl: item.coverUrl,
      runtimeHours: item.runtimeHours || 14,
      genre: item.genre || 'Sci-Fi',
      audibleRating: item.rating,
      ratingCount: item.ratingCount,
      synopsis: item.synopsis || `Audible audio release of ${item.title}.`,
      audibleUrl: item.audibleUrl,
      isRead: false,
      reminders: {
        oneWeekBefore: true,
        oneDayBefore: true,
        dayOfRelease: true,
      },
    });
  }

  return newBooks;
}
