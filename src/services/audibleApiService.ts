import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { Audiobook, Genre } from '../types/audiobook';
import coverScifi from '../assets/images/cover_scifi_void_1790494184883.jpg';
import coverFantasy from '../assets/images/cover_fantasy_blade_1790494198336.jpg';
import coverLitrpg from '../assets/images/cover_litrpg_crawler_1790494211158.jpg';
import coverThriller from '../assets/images/cover_thriller_shadow_1790494227784.jpg';
import { AUDIBLE_DATABASE } from './audibleCatalogService';

export interface WatchlistItem {
  id?: string;
  type: 'Author' | 'Series' | 'Narrator';
  name: string;
  url: string;
}

export interface MuteItem {
  id?: string;
  type: 'Series' | 'Keyword' | 'Author';
  value: string;
}

export interface AudibleApiResponse {
  title: string;
  subtitle?: string;
  seriesName: string;
  seriesUrl: string;
  seriesSequence?: string;
  author: string;
  authorUrl: string;
  narrator: string;
  releaseDate: string; // YYYY-MM-DD
  coverUrl: string;
  language: string;
  audibleUrl: string;
  asin: string;
  runtimeHours?: number;
  rating?: number;
  ratingCount?: number;
  synopsis?: string;
  genre?: Genre;
}

/**
 * Extract 10-character Audible ASIN (e.g. B0D5B7L9K3)
 */
export function getASIN(urlOrAsin: string): string {
  if (!urlOrAsin) return '';
  const match = urlOrAsin.match(/\b(B0[A-Z0-9]{8}|[0-9]{10}|[A-Z0-9]{10})\b/i);
  return match ? match[1].toUpperCase() : '';
}

/**
 * Strict English filter matching AutoHotkey v2 script:
 * Rejects German, French, Spanish, Italian, Russian, etc. translations and edition tags.
 */
export function isEnglishAudiobook(langStr = '', title = ''): boolean {
  if (title) {
    if (
      /\[(?:German|French|Spanish|Italian|Japanese|Russian|Portuguese|Deutsch|Español|Français)\s+(?:Edition|Ausgabe|Version)\]|\((?:Deutsche|Französische|Spanische)\s+Ausgabe\)/i.test(
        title
      )
    ) {
      return false;
    }
  }
  if (!langStr) return true;
  const clean = langStr.toLowerCase().trim();
  if (
    clean === 'german' ||
    clean === 'deutsch' ||
    clean === 'spanish' ||
    clean === 'español' ||
    clean === 'french' ||
    clean === 'français' ||
    clean === 'italian' ||
    clean === 'italiano' ||
    clean === 'japanese' ||
    clean === 'russian' ||
    clean === 'portuguese'
  ) {
    return false;
  }
  return clean === 'en' || clean.includes('english') || clean.startsWith('en-') || clean.startsWith('en_') || clean === '';
}

/**
 * Filter against active Mute List rules
 */
export function isMuted(seriesName: string, title: string, author: string, muteList: MuteItem[]): boolean {
  if (!muteList || muteList.length === 0) return false;

  for (const item of muteList) {
    const mType = (item.type || '').toLowerCase().trim();
    const mVal = (item.value || '').toLowerCase().trim();
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
 * Strict Role Guard: Ensure target is a primary author, not merely an introducer or translator
 */
export function isPrimaryAuthor(authors: Array<{ name: string; role?: string }>, authorName: string): boolean {
  const cleanTarget = authorName.toLowerCase().trim();
  return authors.some((a) => {
    const aName = (a.name || '').toLowerCase();
    // Exclude introductions, translations, forewords if indicated
    if (aName.includes('introduction by') || aName.includes('übersetzer') || aName.includes('foreword')) {
      return false;
    }
    return aName.includes(cleanTarget);
  });
}

/**
 * Strict Role Guard for Narrators
 */
export function isMatchingNarrator(narrators: Array<{ name: string }>, narratorName: string): boolean {
  const cleanTarget = narratorName.toLowerCase().trim();
  return narrators.some((n) => (n.name || '').toLowerCase().includes(cleanTarget));
}

/**
 * Strict Role Guard for Series:
 * Checks series array, publication_name (Audible's series field), subtitle, and title
 */
export function isMatchingSeries(rawProductOrSeries: any, seriesName: string): boolean {
  const normalize = (s: string) =>
    (s || '')
      .toLowerCase()
      .replace(/audiobooks?/gi, '')
      .replace(/universe/gi, '')
      .replace(/[-_:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const cleanTarget = normalize(seriesName);
  if (!cleanTarget) return false;

  // If passed an array of series
  const seriesList = Array.isArray(rawProductOrSeries)
    ? rawProductOrSeries
    : rawProductOrSeries?.series || [];

  for (const s of seriesList) {
    const sTitle = normalize(typeof s === 'string' ? s : s?.title);
    if (sTitle && (sTitle.includes(cleanTarget) || cleanTarget.includes(sTitle))) {
      return true;
    }
  }

  // Check publication_name (Audible API returns the series name here!)
  if (rawProductOrSeries?.publication_name) {
    const pubName = normalize(rawProductOrSeries.publication_name);
    if (pubName && (pubName.includes(cleanTarget) || cleanTarget.includes(pubName))) {
      return true;
    }
  }

  // Check subtitle
  if (rawProductOrSeries?.subtitle) {
    const sub = normalize(rawProductOrSeries.subtitle);
    if (sub && (sub.includes(cleanTarget) || cleanTarget.includes(sub))) {
      return true;
    }
  }

  // Check title
  if (rawProductOrSeries?.title) {
    const tit = normalize(rawProductOrSeries.title);
    if (tit && (tit.includes(cleanTarget) || cleanTarget.includes(tit))) {
      return true;
    }
  }

  return false;
}

/**
 * Multi-Platform Universal HTTP Fetcher:
 * - On Native Android (Capacitor): Calls native Android Java networking (Zero CORS restrictions, custom headers, identical to WinHttp in AHK!)
 * - On Web Dev Server: Routes via Vite proxy (/api/audible)
 * - On Web Preview / PWA: Uses direct fetch or high-speed CORS proxies
 */
export async function universalFetch<T = any>(
  url: string,
  options: {
    headers?: Record<string, string>;
    responseType?: 'json' | 'text';
  } = {}
): Promise<{ data: T; status: number } | null> {
  const { headers = {}, responseType = 'json' } = options;

  // 1. Android Native execution via CapacitorHttp (Bypasses all browser CORS restrictions)
  if (Capacitor.isNativePlatform()) {
    try {
      const response = await CapacitorHttp.get({
        url,
        headers: {
          Accept: responseType === 'json' ? 'application/json' : 'text/html,application/xhtml+xml',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          ...headers,
        },
        responseType: responseType === 'json' ? 'json' : 'text',
      });
      if (response.status >= 200 && response.status < 300) {
        return { data: response.data as T, status: response.status };
      }
    } catch (nativeErr) {
      console.warn('CapacitorHttp native fetch failed, trying fallbacks:', nativeErr);
    }
  }

  // 2. Web Dev Server Proxy: If in dev server and requesting api.audible.com, use Vite proxy
  if (url.includes('api.audible.com')) {
    const proxyPath = url.replace('https://api.audible.com', '/api/audible');
    try {
      const res = await fetch(proxyPath, {
        headers: { Accept: responseType === 'json' ? 'application/json' : 'text/html', ...headers },
      });
      if (res.ok) {
        const data = responseType === 'json' ? await res.json() : await res.text();
        return { data: data as T, status: res.status };
      }
    } catch {
      // Continue to direct / CORS proxy
    }
  }

  // 3. Direct browser fetch
  try {
    const res = await fetch(url, {
      headers: { Accept: responseType === 'json' ? 'application/json' : 'text/html', ...headers },
    });
    if (res.ok) {
      const data = responseType === 'json' ? await res.json() : await res.text();
      return { data: data as T, status: res.status };
    }
  } catch {
    // Continue to CORS proxy
  }

  // 4. CORS Proxy Fallback for Web Previews
  const corsProxies = [
    `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  ];

  for (const proxyUrl of corsProxies) {
    try {
      const res = await fetch(proxyUrl, {
        headers: { Accept: responseType === 'json' ? 'application/json' : 'text/html' },
      });
      if (res.ok) {
        const text = await res.text();
        if (responseType === 'json') {
          try {
            return { data: JSON.parse(text) as T, status: res.status };
          } catch {
            continue;
          }
        }
        return { data: text as unknown as T, status: res.status };
      }
    } catch {
      // try next proxy
    }
  }

  return null;
}

/**
 * Map raw Audible product from API response into clean structured AudibleApiResponse
 */
export function mapAudibleProduct(p: any): AudibleApiResponse {
  const asin = p.asin || '';
  const title = p.title || 'Untitled Audiobook';
  const subtitle = p.subtitle || '';

  const authors = (p.authors || []).map((a: any) => a.name).join(', ') || 'Unknown Author';
  const authorAsin = p.authors?.[0]?.asin || '';
  const authorUrl = authorAsin ? `https://www.audible.com/author/${authorAsin}` : '';

  const narrators = (p.narrators || []).map((n: any) => n.name).join(', ') || '—';

  const seriesObj = p.series?.[0];
  const seriesName = seriesObj?.title || '—';
  const seriesSequence = seriesObj?.sequence || undefined;
  const seriesAsin = seriesObj?.asin || '';
  const seriesUrl = seriesAsin ? `https://www.audible.com/series/${seriesAsin}` : '';

  const releaseDate = p.release_date || (p.publication_datetime ? p.publication_datetime.split('T')[0] : '2026-10-15');
  const coverUrl =
    p.product_images?.['1024'] ||
    p.product_images?.['500'] ||
    p.product_images?.url ||
    p.image_url ||
    coverScifi;

  const language = p.language || 'english';
  const audibleUrl = asin ? `https://www.audible.com/pd/${asin}` : `https://www.audible.com/search?keywords=${encodeURIComponent(title)}`;

  const runtimeMinutes = p.runtime_length_min || 0;
  const runtimeHours = runtimeMinutes > 0 ? parseFloat((runtimeMinutes / 60).toFixed(1)) : 12;

  const displayRating = parseFloat(p.rating?.overall_distribution?.display_average_rating || '4.8');
  const ratingCount = p.rating?.overall_distribution?.num_ratings || 0;

  const synopsisRaw = p.merchandising_summary || p.publisher_summary || p.thesaurus_subject_keywords?.join(', ') || '';
  const synopsis = synopsisRaw.replace(/<[^>]*>/g, '').trim() || `Audible audio edition of "${title}" by ${authors}.`;

  return {
    title,
    subtitle,
    seriesName,
    seriesUrl,
    seriesSequence,
    author: authors,
    authorUrl,
    narrator: narrators,
    releaseDate,
    coverUrl,
    language,
    audibleUrl,
    asin,
    runtimeHours,
    rating: displayRating,
    ratingCount,
    synopsis,
    genre: (p.thesaurus_subject_keywords?.[0]?.includes('fantasy') ? 'Fantasy' : 'Sci-Fi') as Genre,
  };
}

/**
 * Fetch a single Audible audiobook by ASIN or URL via live Audible Catalog API
 */
export async function fetchAudibleApiMetadata(urlOrAsin: string): Promise<AudibleApiResponse | null> {
  const asin = getASIN(urlOrAsin);

  // 1. If ASIN found, query live catalog API
  if (asin) {
    const apiUrl = `https://api.audible.com/1.0/catalog/products/${asin}?response_groups=product_desc,contributors,media,series,product_attrs,rating`;
    const res = await universalFetch<any>(apiUrl, { responseType: 'json' });

    if (res?.data?.product) {
      return mapAudibleProduct(res.data.product);
    }
  }

  // 2. If it's a search term or title query, search catalog API
  const cleanTerm = urlOrAsin.replace(/https?:\/\/[^\s]+/g, '').trim() || urlOrAsin;
  if (cleanTerm.length > 2) {
    const searchUrl = `https://api.audible.com/1.0/catalog/products?keywords=${encodeURIComponent(
      cleanTerm
    )}&num_results=3&products_sort_by=-ReleaseDate&response_groups=product_desc,contributors,media,series,product_attrs,rating`;

    const res = await universalFetch<any>(searchUrl, { responseType: 'json' });
    if (res?.data?.products && res.data.products.length > 0) {
      const match = res.data.products[0];
      return mapAudibleProduct(match);
    }
  }

  // 3. Fallback to rich built-in catalog if offline
  const lower = urlOrAsin.toLowerCase();
  const matchedDb = AUDIBLE_DATABASE.find((item) => {
    if (asin && item.audibleUrl.includes(asin)) return true;
    if (lower.includes(item.title.toLowerCase().replace(/[^a-z0-9]/g, ''))) return true;
    return false;
  });

  if (matchedDb) {
    return {
      title: matchedDb.title,
      subtitle: matchedDb.subtitle,
      seriesName: matchedDb.series?.name || '—',
      seriesUrl: matchedDb.series?.name ? `https://www.audible.com/series/${encodeURIComponent(matchedDb.series.name)}` : '',
      author: matchedDb.creatorOrAuthor,
      authorUrl: `https://www.audible.com/search?searchAuthor=${encodeURIComponent(matchedDb.creatorOrAuthor)}`,
      narrator: matchedDb.narrators?.join(', ') || '—',
      releaseDate: matchedDb.releaseDate || '2026-10-15',
      coverUrl: matchedDb.coverUrl,
      language: 'English',
      audibleUrl: matchedDb.audibleUrl,
      asin: asin || 'B0EXAMPLE',
      runtimeHours: matchedDb.runtimeHours,
      rating: matchedDb.rating,
      ratingCount: matchedDb.ratingCount,
      synopsis: matchedDb.synopsis,
      genre: matchedDb.genre,
    };
  }

  return null;
}

/**
 * Scan target (Author, Series, Narrator) for upcoming English releases.
 * REWRITTEN TO LIVE-FETCH FROM AUDIBLE PUBLIC CATALOG API:
 * - Queries Audible API directly (with native Android CapacitorHttp support)
 * - Strictly enforces AutoHotkey v2 role guards (author must be primary writer, series must match, narrator must match)
 * - Strictly enforces English language filter
 * - Strictly enforces active Mute rules
 * - Avoids duplicates already tracked in user's library
 */
export async function scanWatchlistTargetLive(
  target: WatchlistItem,
  existingBooks: Audiobook[],
  muteList: MuteItem[],
  languageFilter: 'english_only' | 'all_languages' = 'english_only'
): Promise<Audiobook[]> {
  const newBooks: Audiobook[] = [];
  const cleanTarget = target.name.trim();
  const targetAsin = getASIN(target.url);

  let products: any[] = [];

  if (target.type === 'Series') {
    // Audible does not support `series=`. Search by title and keywords to get all series titles
    const titleUrl = `https://api.audible.com/1.0/catalog/products?title=${encodeURIComponent(
      cleanTarget
    )}&num_results=30&response_groups=product_desc,contributors,media,series,product_attrs,rating`;
    const keywordUrl = `https://api.audible.com/1.0/catalog/products?keywords=${encodeURIComponent(
      cleanTarget
    )}&num_results=30&response_groups=product_desc,contributors,media,series,product_attrs,rating`;

    try {
      const [resTitle, resKeywords] = await Promise.allSettled([
        universalFetch<any>(titleUrl, { responseType: 'json' }),
        universalFetch<any>(keywordUrl, { responseType: 'json' }),
      ]);

      const seenAsins = new Set<string>();
      if (resTitle.status === 'fulfilled' && resTitle.value?.data?.products) {
        for (const prod of resTitle.value.data.products) {
          if (prod.asin && !seenAsins.has(prod.asin)) {
            seenAsins.add(prod.asin);
            products.push(prod);
          }
        }
      }
      if (resKeywords.status === 'fulfilled' && resKeywords.value?.data?.products) {
        for (const prod of resKeywords.value.data.products) {
          if (prod.asin && !seenAsins.has(prod.asin)) {
            seenAsins.add(prod.asin);
            products.push(prod);
          }
        }
      }
    } catch (err) {
      console.warn(`Series live query failed for ${target.name}`, err);
    }
  } else {
    // Author or Narrator
    let queryParam = '';
    if (target.type === 'Author') {
      queryParam = targetAsin ? `author=${targetAsin}` : `author=${encodeURIComponent(cleanTarget)}`;
    } else if (target.type === 'Narrator') {
      queryParam = targetAsin ? `narrator=${targetAsin}` : `narrator=${encodeURIComponent(cleanTarget)}`;
    }

    const catalogApiUrl = `https://api.audible.com/1.0/catalog/products?${queryParam}&num_results=25&products_sort_by=-ReleaseDate&response_groups=product_desc,contributors,media,series,product_attrs,rating`;

    try {
      const res = await universalFetch<any>(catalogApiUrl, { responseType: 'json' });
      if (res?.data?.products && Array.isArray(res.data.products)) {
        products = res.data.products;
      }
    } catch (err) {
      console.warn(`Live query failed for ${target.type}: ${target.name}`, err);
    }

    // If query by parameter returned 0 results, retry with keyword search
    if (products.length === 0) {
      const keywordUrl = `https://api.audible.com/1.0/catalog/products?keywords=${encodeURIComponent(
        cleanTarget
      )}&num_results=20&products_sort_by=-ReleaseDate&response_groups=product_desc,contributors,media,series,product_attrs,rating`;
      try {
        const res = await universalFetch<any>(keywordUrl, { responseType: 'json' });
        if (res?.data?.products && Array.isArray(res.data.products)) {
          products = res.data.products;
        }
      } catch {}
    }
  }

  // If API was unavailable or returned nothing, supplement with internal database
  if (products.length === 0) {
    for (const item of AUDIBLE_DATABASE) {
      if (item.type !== 'book') continue;
      const seriesTitle = item.series?.name || '—';

      if (target.type === 'Author' && !item.creatorOrAuthor.toLowerCase().includes(cleanTarget.toLowerCase())) continue;
      if (target.type === 'Series' && !seriesTitle.toLowerCase().includes(cleanTarget.toLowerCase())) continue;
      if (target.type === 'Narrator' && !item.narrators?.some((n) => n.toLowerCase().includes(cleanTarget.toLowerCase())))
        continue;

      // Add as candidate product format
      products.push({
        asin: getASIN(item.audibleUrl) || item.id,
        title: item.title,
        subtitle: item.subtitle,
        authors: [{ name: item.creatorOrAuthor }],
        narrators: (item.narrators || []).map((n) => ({ name: n })),
        series: item.series ? [{ title: item.series.name, sequence: item.series.bookNumber?.toString() }] : [],
        release_date: item.releaseDate,
        language: 'english',
        runtime_length_min: (item.runtimeHours || 12) * 60,
        rating: { overall_distribution: { display_average_rating: item.rating.toString(), num_ratings: item.ratingCount } },
        product_images: { 500: item.coverUrl },
        merchandising_summary: item.synopsis,
      });
    }
  }

  // Filter products using strict AutoHotkey v2 rules
  for (const rawProduct of products) {
    const p = mapAudibleProduct(rawProduct);

    // 1. Duplicate check: Already in user's library?
    const alreadyExists = existingBooks.some(
      (b) =>
        (b.id && b.id.includes(p.asin)) ||
        (b.audibleUrl && p.asin && b.audibleUrl.includes(p.asin)) ||
        b.title.toLowerCase().trim() === p.title.toLowerCase().trim()
    );
    if (alreadyExists) continue;

    // 2. Strict Role Guards (Matching AutoHotkey v2)
    if (target.type === 'Author') {
      const rawAuthors = rawProduct.authors || [{ name: p.author }];
      if (!isPrimaryAuthor(rawAuthors, cleanTarget)) {
        continue; // Discard: Target was only an introducer or contributor
      }
    } else if (target.type === 'Series') {
      if (!isMatchingSeries(rawProduct, cleanTarget)) {
        continue; // Discard: Not part of this series
      }
    } else if (target.type === 'Narrator') {
      const rawNarrators = rawProduct.narrators || [{ name: p.narrator }];
      if (!isMatchingNarrator(rawNarrators, cleanTarget)) {
        continue; // Discard: Not narrated by this person
      }
    }

    // 3. Language Guard (Filter non-English only if languageFilter is 'english_only')
    if (languageFilter === 'english_only' && !isEnglishAudiobook(p.language, p.title)) {
      continue;
    }

    // 4. Mute List Filter
    if (isMuted(p.seriesName, p.title, p.author, muteList)) {
      continue;
    }

    // Book passed all criteria! Add to newly discovered releases
    newBooks.push({
      id: `ab-live-${p.asin || Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: p.title,
      author: p.author,
      authorUrl: p.authorUrl,
      seriesName: p.seriesName,
      seriesUrl: p.seriesUrl,
      series: p.seriesName !== '—' ? { name: p.seriesName, bookNumber: p.seriesSequence } : undefined,
      narrator: p.narrator,
      narrators: p.narrator.split(', ').filter(Boolean),
      releaseDate: p.releaseDate,
      coverUrl: p.coverUrl,
      genre: p.genre || 'Sci-Fi',
      runtimeHours: p.runtimeHours || 14,
      audibleRating: p.rating || 4.8,
      ratingCount: p.ratingCount || 1200,
      synopsis: p.synopsis || `Audible audio release of ${p.title} by ${p.author}.`,
      audibleUrl: p.audibleUrl,
      url: p.audibleUrl,
      downloaded: 'No',
      listened: 'No',
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

/**
 * Backward compatibility alias for sync callers
 */
export const scanWatchlistTarget = scanWatchlistTargetLive;
