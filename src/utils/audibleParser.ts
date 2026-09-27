import { TrackedEntityType, Genre, Audiobook } from '../types/audiobook';
import coverScifi from '../assets/images/cover_scifi_void_1790494184883.jpg';
import coverFantasy from '../assets/images/cover_fantasy_blade_1790494198336.jpg';
import coverLitrpg from '../assets/images/cover_litrpg_crawler_1790494211158.jpg';
import coverThriller from '../assets/images/cover_thriller_shadow_1790494227784.jpg';

export interface ParsedAudibleUrlResult {
  rawUrl: string;
  type: 'book' | 'author' | 'narrator' | 'series' | 'search' | 'unknown';
  extractedName: string;
  asin?: string;
  suggestedBook?: Partial<Audiobook>;
  suggestedEntity?: {
    type: TrackedEntityType;
    name: string;
    notes?: string;
  };
  confidence: number;
}

/**
 * Clean slug string e.g. "Wind-and-Truth-Audiobook" -> "Wind and Truth"
 */
function cleanSlug(slug: string): string {
  return slug
    .replace(/-Audiobooks?/gi, '')
    .replace(/-/g, ' ')
    .replace(/\+/g, ' ')
    .replace(/%20/g, ' ')
    .trim();
}

/**
 * Capitalize title words cleanly
 */
function toTitleCase(str: string): string {
  const minorWords = new Set(['and', 'or', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'a', 'an']);
  return str
    .split(' ')
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i > 0 && minorWords.has(lower)) {
        return lower;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export function parseAudibleUrl(inputUrl: string): ParsedAudibleUrlResult {
  const trimmed = inputUrl.trim();

  // Basic validation
  if (!trimmed) {
    return {
      rawUrl: trimmed,
      type: 'unknown',
      extractedName: '',
      confidence: 0,
    };
  }

  try {
    // Check if it's a URL or bare string
    let urlObj: URL;
    try {
      urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    } catch {
      // If user typed e.g. "audible.com/pd/..."
      urlObj = new URL(`https://${trimmed}`);
    }

    const path = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // 1. Book / Product URL: /pd/Slug-Audiobook/B0XXXXX or /pd/B0XXXXX
    if (path.includes('/pd/')) {
      const parts = path.split('/pd/')[1].split('/').filter(Boolean);
      let slug = parts[0] || '';
      let asin = parts[1];

      // If parts[0] is just the ASIN (e.g. /pd/B0D5B7L9K3)
      if (/^[B0-9A-Z]{10}$/i.test(slug)) {
        asin = slug;
        slug = 'Audiobook Release ' + asin;
      }

      const cleanTitle = toTitleCase(cleanSlug(slug));

      return {
        rawUrl: trimmed,
        type: 'book',
        extractedName: cleanTitle,
        asin: asin || undefined,
        suggestedBook: {
          title: cleanTitle,
          author: 'Audible Author',
          narrators: ['Audible Narrator'],
          releaseDate: '2026-10-20',
          genre: 'Sci-Fi' as Genre,
          audibleRating: 4.8,
          ratingCount: 1540,
          coverUrl: coverScifi,
          audibleUrl: trimmed,
          synopsis: `Audible audio edition of "${cleanTitle}". Features full professional narration and audio engineering.`,
          reminders: {
            oneWeekBefore: true,
            oneDayBefore: true,
            dayOfRelease: true,
          },
        },
        confidence: 0.95,
      };
    }

    // 2. Author URL: /author/Author-Name/B0XXXXX or ?searchAuthor=Name
    if (path.includes('/author/') || searchParams.has('searchAuthor')) {
      let authorName = '';
      let asin: string | undefined;

      if (path.includes('/author/')) {
        const parts = path.split('/author/')[1].split('/').filter(Boolean);
        authorName = cleanSlug(parts[0] || '');
        asin = parts[1];
      } else if (searchParams.has('searchAuthor')) {
        authorName = searchParams.get('searchAuthor') || '';
      }

      const cleaned = toTitleCase(authorName);

      return {
        rawUrl: trimmed,
        type: 'author',
        extractedName: cleaned,
        asin,
        suggestedEntity: {
          type: 'author',
          name: cleaned,
          notes: `Imported from Audible Author profile (${asin || 'Audible'})`,
        },
        confidence: 0.95,
      };
    }

    // 3. Narrator URL: /narrator/Narrator-Name/B0XXXXX or ?searchNarrator=Name
    if (path.includes('/narrator/') || searchParams.has('searchNarrator')) {
      let narratorName = '';
      let asin: string | undefined;

      if (path.includes('/narrator/')) {
        const parts = path.split('/narrator/')[1].split('/').filter(Boolean);
        narratorName = cleanSlug(parts[0] || '');
        asin = parts[1];
      } else if (searchParams.has('searchNarrator')) {
        narratorName = searchParams.get('searchNarrator') || '';
      }

      const cleaned = toTitleCase(narratorName);

      return {
        rawUrl: trimmed,
        type: 'narrator',
        extractedName: cleaned,
        asin,
        suggestedEntity: {
          type: 'narrator',
          name: cleaned,
          notes: `Audible Master Narrator (${asin || 'Voice Artist'})`,
        },
        confidence: 0.95,
      };
    }

    // 4. Series URL: /series/Series-Name-Audiobooks/B0XXXXX
    if (path.includes('/series/')) {
      const parts = path.split('/series/')[1].split('/').filter(Boolean);
      const seriesSlug = cleanSlug(parts[0] || '');
      const asin = parts[1];
      const cleaned = toTitleCase(seriesSlug);

      return {
        rawUrl: trimmed,
        type: 'series',
        extractedName: cleaned,
        asin,
        suggestedEntity: {
          type: 'series',
          name: cleaned,
          notes: `Audible Audiobook Series (${asin || 'Series'})`,
        },
        confidence: 0.95,
      };
    }

    // 5. Search queries: ?keywords=... or /search?...
    if (path.includes('/search') && searchParams.has('keywords')) {
      const keywords = searchParams.get('keywords') || '';
      return {
        rawUrl: trimmed,
        type: 'search',
        extractedName: toTitleCase(cleanSlug(keywords)),
        confidence: 0.8,
      };
    }

    // Fallback: If URL has some domain
    return {
      rawUrl: trimmed,
      type: 'unknown',
      extractedName: cleanSlug(path.split('/').filter(Boolean).pop() || 'Unknown Item'),
      confidence: 0.3,
    };
  } catch {
    return {
      rawUrl: trimmed,
      type: 'unknown',
      extractedName: '',
      confidence: 0,
    };
  }
}
