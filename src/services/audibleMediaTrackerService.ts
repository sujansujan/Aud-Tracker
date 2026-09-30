import { Book, Author, Series, DateConfidence, ReleaseStatus, Marketplace } from '../types/specModels';
import { defaultClock, getDaysBetween } from '../utils/clock';

/**
 * Audible Response Namespace matching bonukai/MediaTracker
 * (server/src/metadata/provider/audible.ts)
 */
export namespace AudibleResponse {
  export interface Author {
    asin: string;
    name: string;
  }
  export interface Narrator {
    name: string;
  }
  export interface ProductImages {
    500?: string;
    1000?: string;
    2400?: string;
  }
  export interface Series {
    asin?: string;
    sequence?: string;
    title: string;
    url?: string;
  }
  export interface Product {
    asin: string;
    authors?: Author[];
    title: string;
    subtitle?: string;
    merchandising_summary?: string;
    narrators?: Narrator[];
    product_images?: ProductImages;
    release_date?: string; // YYYY-MM-DD
    runtime_length_min?: number;
    series?: Series[];
    publication_name?: string;
    language?: string;
  }
  export interface SearchResult {
    products?: Product[];
    total_results?: number;
  }
}

export type AudibleCountryCode = 'au' | 'ca' | 'de' | 'fr' | 'in' | 'it' | 'es' | 'jp' | 'uk' | 'us';

/**
 * Audible Provider ported directly from bonukai/MediaTracker
 */
export class AudibleMediaTrackerProvider {
  readonly name = 'audible';
  readonly mediaType = 'audiobook';

  private readonly languages: Record<string, string> = {
    au: 'com.au',
    ca: 'ca',
    de: 'de',
    fr: 'fr',
    in: 'in',
    it: 'it',
    es: 'es',
    jp: 'co.jp',
    uk: 'co.uk',
    us: 'com',
  };

  public domain(countryCode: string): string {
    const code = countryCode.toLowerCase();
    if (code in this.languages) {
      return this.languages[code];
    }
    return 'com';
  }

  /**
   * Search audiobooks via Audible API (using server proxy with direct fallback)
   */
  async search(query: string, marketplace: Marketplace = 'US'): Promise<AudibleResponse.Product[]> {
    const q = query.trim();
    if (!q) return [];

    const countryCode = marketplace.toLowerCase();

    // 1. Try server-side proxy
    try {
      const res = await fetch(
        `/api/audible/search?query=${encodeURIComponent(q)}&country=${countryCode}&num_results=40`
      );
      if (res.ok) {
        const data: AudibleResponse.SearchResult = await res.json();
        if (data.products && Array.isArray(data.products)) {
          return data.products;
        }
      }
    } catch {
      // Proxy unavailable, fallback to direct Audible API call
    }

    // 2. Direct fallback (e.g. in native Android WebView or standalone environment)
    try {
      const domain = this.domain(countryCode);
      const url = `https://api.audible.${domain}/1.0/catalog/products?title=${encodeURIComponent(
        q
      )}&num_results=40&response_groups=contributors,rating,media,product_attrs&image_sizes=500,1000,2400`;

      const directRes = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (directRes.ok) {
        const data: AudibleResponse.SearchResult = await directRes.json();
        return data.products || [];
      }
    } catch (err) {
      console.warn('Direct Audible search failed:', err);
    }

    return [];
  }

  /**
   * Map Audible Product to App domain models (Book, Authors, Series)
   */
  mapToDomain(
    product: AudibleResponse.Product,
    marketplace: Marketplace = 'US',
    clock = defaultClock
  ): {
    book: Book;
    authors: Author[];
    series?: Series;
  } {
    const rawAuthors = product.authors || [];
    const domainAuthors: Author[] = rawAuthors.map((a, idx) => ({
      id: a.asin || `auth-audible-${a.name.toLowerCase().replace(/[^a-z0-9]/g, '-') || idx}`,
      name: a.name,
    }));

    let domainSeries: Series | undefined;
    let seriesPosition: string | undefined;

    if (product.series && product.series.length > 0) {
      const s = product.series[0];
      const seriesId = s.asin || `ser-audible-${s.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      domainSeries = {
        id: seriesId,
        name: s.title,
        primaryAuthorName: domainAuthors[0]?.name,
      };
      seriesPosition = s.sequence || undefined;
    }

    // Release Date and status determination
    const releaseDate = product.release_date || null;
    let status: ReleaseStatus = 'RELEASED';
    let dateConfidence: DateConfidence = 'CONFIRMED';

    if (!releaseDate) {
      status = 'UPCOMING';
      dateConfidence = 'TBA';
    } else {
      const days = getDaysBetween(releaseDate, clock);
      if (days >= 0) {
        status = 'UPCOMING';
      } else {
        status = 'RELEASED';
      }
    }

    // Cover Image Priority
    const coverUrl =
      product.product_images?.[500] ||
      product.product_images?.[1000] ||
      product.product_images?.[2400] ||
      undefined;

    // Clean description html tags if present
    const cleanDesc = product.merchandising_summary
      ? product.merchandising_summary.replace(/<[^>]*>?/gm, '').trim()
      : undefined;

    const book: Book = {
      id: product.asin,
      title: product.title,
      subtitle: product.subtitle,
      authorIds: domainAuthors.map((a) => a.id),
      seriesId: domainSeries?.id,
      seriesPosition,
      coverUrl,
      description: cleanDesc,
      durationMinutes: product.runtime_length_min,
      narrators: product.narrators?.map((n) => n.name) || [],
      marketplace,
      storeUrl: `https://www.audible.${this.domain(marketplace)}/pd/${product.asin}`,
      releaseDate,
      dateConfidence,
      status,
      firstSeenAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { book, authors: domainAuthors, series: domainSeries };
  }
}

export const audibleProvider = new AudibleMediaTrackerProvider();
