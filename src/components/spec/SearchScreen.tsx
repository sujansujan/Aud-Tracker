import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSpecTracker } from '../../context/SpecTrackerContext';
import { Search as SearchIcon, X, Plus, Check, History, RefreshCw, Radio } from 'lucide-react';
import { formatCountdown } from '../../utils/clock';
import { audibleProvider, AudibleResponse } from '../../services/audibleMediaTrackerService';
import { Book, Author, Series } from '../../types/specModels';

export const SearchScreen: React.FC = () => {
  const {
    books,
    authors,
    series,
    searchHistories,
    addSearchQuery,
    removeSearchQuery,
    clearSearchHistory,
    isBookFollowed,
    followBook,
    unfollowBook,
    isAuthorFollowed,
    followAuthor,
    unfollowAuthor,
    isSeriesFollowed,
    followSeries,
    unfollowSeries,
    setSelectedBookId,
    setSelectedAuthorId,
    setSelectedSeriesId,
    getAuthorsForBook,
    getBooksForAuthor,
    getBooksForSeries,
    ingestAudibleItem,
    settings,
    clock,
  } = useSpecTracker();

  const [inputVal, setInputVal] = useState('');
  const [segment, setSegment] = useState<'books' | 'authors' | 'series'>('books');
  const [isAudibleSearching, setIsAudibleSearching] = useState(false);
  const [audibleProducts, setAudibleProducts] = useState<AudibleResponse.Product[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);

  // Debounced search query history save & Audible live search via bonukai/MediaTracker provider
  const debounceTimerRef = useRef<any>(null);
  const audibleAbortRef = useRef<number>(0);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const clean = inputVal.trim();
    if (!clean) {
      setAudibleProducts([]);
      setIsAudibleSearching(false);
      return;
    }

    // Trigger Audible live search after 300 ms debounce (MediaTracker Audible provider)
    debounceTimerRef.current = setTimeout(async () => {
      addSearchQuery(clean);
      const reqId = ++audibleAbortRef.current;
      setIsAudibleSearching(true);

      try {
        const results = await audibleProvider.search(clean, settings.marketplace);
        if (reqId === audibleAbortRef.current) {
          setAudibleProducts(results);
        }
      } catch (err) {
        console.error('Audible search failed:', err);
      } finally {
        if (reqId === audibleAbortRef.current) {
          setIsAudibleSearching(false);
        }
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputVal, addSearchQuery, settings.marketplace]);

  const cleanQuery = inputVal.trim().toLowerCase();
  const queryTerms = useMemo(() => cleanQuery.split(/\s+/).filter(Boolean), [cleanQuery]);

  // Series lookup map
  const seriesMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of series) {
      map.set(s.id, s.name);
    }
    return map;
  }, [series]);

  // Transform Audible Live Products using bonukai/MediaTracker mapping
  const mappedAudibleItems = useMemo(() => {
    if (audibleProducts.length === 0) return [];
    return audibleProducts.map((p) =>
      audibleProvider.mapToDomain(p, settings.marketplace, clock)
    );
  }, [audibleProducts, settings.marketplace, clock]);

  // 1. Matched Books (Combining Local Catalog + MediaTracker Audible Live Results, de-duplicated by ASIN)
  const matchedBooks = useMemo(() => {
    if (queryTerms.length === 0) return [];

    const existingBookIds = new Set<string>();
    const list: Array<{ book: Book; source: 'local' | 'audible'; audibleData?: any }> = [];

    // Filter local books
    for (const b of books) {
      const bookAuthorsList = getAuthorsForBook(b.id);
      const authorNames = bookAuthorsList.map((a) => a.name.toLowerCase()).join(' ');
      const seriesName = b.seriesId ? (seriesMap.get(b.seriesId) || '').toLowerCase() : '';
      const narrators = b.narrators.map((n) => n.toLowerCase()).join(' ');
      const searchableString = [
        b.title.toLowerCase(),
        b.subtitle?.toLowerCase() || '',
        b.description?.toLowerCase() || '',
        authorNames,
        seriesName,
        b.seriesPosition ? `book ${b.seriesPosition}` : '',
        narrators,
        b.id.toLowerCase(),
      ].join(' ');

      if (queryTerms.every((term) => searchableString.includes(term))) {
        existingBookIds.add(b.id);
        list.push({ book: b, source: 'local' });
      }
    }

    // Append unique Audible search results
    for (const item of mappedAudibleItems) {
      if (!existingBookIds.has(item.book.id)) {
        existingBookIds.add(item.book.id);
        list.push({ book: item.book, source: 'audible', audibleData: item });
      }
    }

    return list;
  }, [books, queryTerms, getAuthorsForBook, seriesMap, mappedAudibleItems]);

  // 2. Matched Authors (Combining Local Authors + Authors from Audible search results)
  const matchedAuthors = useMemo(() => {
    if (queryTerms.length === 0) return [];

    const authorMap = new Map<string, { author: Author; source: 'local' | 'audible' }>();

    for (const a of authors) {
      const authorBooks = getBooksForAuthor(a.id);
      const bookTitles = authorBooks.map((b) => b.title.toLowerCase()).join(' ');
      const authorSeries = series
        .filter((s) => s.primaryAuthorName?.toLowerCase() === a.name.toLowerCase())
        .map((s) => s.name.toLowerCase())
        .join(' ');

      const searchableString = [
        a.name.toLowerCase(),
        a.bio?.toLowerCase() || '',
        bookTitles,
        authorSeries,
      ].join(' ');

      if (queryTerms.every((term) => searchableString.includes(term))) {
        authorMap.set(a.name.toLowerCase(), { author: a, source: 'local' });
      }
    }

    // Add authors from Audible search
    for (const item of mappedAudibleItems) {
      for (const a of item.authors) {
        const key = a.name.toLowerCase();
        if (!authorMap.has(key)) {
          if (queryTerms.some((term) => key.includes(term))) {
            authorMap.set(key, { author: a, source: 'audible' });
          }
        }
      }
    }

    return Array.from(authorMap.values());
  }, [authors, queryTerms, getBooksForAuthor, series, mappedAudibleItems]);

  // 3. Matched Series (Combining Local Series + Series from Audible search results)
  const matchedSeries = useMemo(() => {
    if (queryTerms.length === 0) return [];

    const sMap = new Map<string, { series: Series; source: 'local' | 'audible' }>();

    for (const s of series) {
      const seriesBooks = getBooksForSeries(s.id);
      const bookTitles = seriesBooks.map((b) => b.title.toLowerCase()).join(' ');

      const searchableString = [
        s.name.toLowerCase(),
        s.primaryAuthorName?.toLowerCase() || '',
        bookTitles,
      ].join(' ');

      if (queryTerms.every((term) => searchableString.includes(term))) {
        sMap.set(s.name.toLowerCase(), { series: s, source: 'local' });
      }
    }

    // Add series from Audible search
    for (const item of mappedAudibleItems) {
      if (item.series) {
        const key = item.series.name.toLowerCase();
        if (!sMap.has(key)) {
          if (queryTerms.some((term) => key.includes(term))) {
            sMap.set(key, { series: item.series, source: 'audible' });
          }
        }
      }
    }

    return Array.from(sMap.values());
  }, [series, queryTerms, getBooksForSeries, mappedAudibleItems]);

  const hasAnyResults =
    matchedBooks.length > 0 || matchedAuthors.length > 0 || matchedSeries.length > 0;

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      if (inputVal.trim()) {
        audibleProvider.search(inputVal.trim(), settings.marketplace).then(setAudibleProducts);
      }
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const clean = inputVal.trim();
      if (clean) {
        addSearchQuery(clean);
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  const handleSelectBook = (book: Book, audibleData?: any) => {
    addSearchQuery(inputVal);
    if (audibleData) {
      ingestAudibleItem(audibleData.book, audibleData.authors, audibleData.series);
    }
    setSelectedBookId(book.id);
  };

  const handleSelectAuthor = (author: Author, audibleItem?: any) => {
    addSearchQuery(inputVal);
    if (audibleItem) {
      ingestAudibleItem(audibleItem.book, audibleItem.authors, audibleItem.series);
    }
    setSelectedAuthorId(author.id);
  };

  const handleSelectSeries = (s: Series, audibleItem?: any) => {
    addSearchQuery(inputVal);
    if (audibleItem) {
      ingestAudibleItem(audibleItem.book, audibleItem.authors, audibleItem.series);
    }
    setSelectedSeriesId(s.id);
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-3 space-y-4">
      {/* Top Title & Marketplace Indicator */}
      <div className="flex items-center justify-between border-b pb-2.5">
        <h1 className="text-xl font-medium tracking-tight text-[var(--md-sys-color-on-surface)]">
          Search
        </h1>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
          <Radio className="h-3 w-3 text-[var(--md-sys-color-primary)]" />
          <span>Audible ({settings.marketplace})</span>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3.5 h-4 w-4 text-[var(--md-sys-color-on-surface-variant)] pointer-events-none" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search books, authors, series on Audible"
          autoFocus
          className="w-full h-11 pl-10 pr-9 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-sm text-[var(--md-sys-color-on-surface)] placeholder-[var(--md-sys-color-on-surface-variant)] outline-none focus:border-[var(--md-sys-color-primary)] transition"
        />
        {inputVal && (
          <button
            type="button"
            onClick={() => {
              setInputVal('');
              setAudibleProducts([]);
            }}
            className="absolute right-2.5 p-1 rounded hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
            aria-label="Clear search input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Segmented Control: Books | Authors | Series with match count */}
      <div className="flex rounded-xl bg-[var(--md-sys-color-surface-container)] p-1 border border-[var(--md-sys-color-outline)]">
        {(['books', 'authors', 'series'] as const).map((seg) => {
          const count =
            seg === 'books'
              ? matchedBooks.length
              : seg === 'authors'
              ? matchedAuthors.length
              : matchedSeries.length;

          return (
            <button
              key={seg}
              type="button"
              onClick={() => setSegment(seg)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition cursor-pointer flex items-center justify-center gap-1.5 ${
                segment === seg
                  ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-xs font-medium'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <span>{seg}</span>
              {cleanQuery && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    segment === seg
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                      : 'bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Subtle Live Search Status Bar */}
      {isAudibleSearching && (
        <div className="flex items-center gap-2 text-[11px] text-[var(--md-sys-color-on-surface-variant)] px-1">
          <RefreshCw className="h-3 w-3 animate-spin text-[var(--md-sys-color-primary)]" />
          <span>Searching Audible catalog...</span>
        </div>
      )}

      {/* Content: Recent Searches when query is empty */}
      {!cleanQuery ? (
        <div className="space-y-3 pt-2">
          {searchHistories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)] font-medium">
                <span className="flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  Recent searches
                </span>
                <button
                  type="button"
                  onClick={clearSearchHistory}
                  className="hover:underline cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
                {searchHistories.map((h) => (
                  <div
                    key={h.query}
                    className="py-2.5 flex items-center justify-between hover:bg-[var(--md-sys-color-surface-container-low)] px-1 cursor-pointer"
                    onClick={() => {
                      setInputVal(h.query);
                      addSearchQuery(h.query);
                    }}
                  >
                    <span className="text-xs text-[var(--md-sys-color-on-surface)]">{h.query}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchQuery(h.query);
                      }}
                      className="p-1 rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                      aria-label={`Remove ${h.query} from history`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-3">
          {/* Quick Cross-Category Switch Hint */}
          {segment === 'books' && matchedBooks.length === 0 && hasAnyResults && (
            <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-between">
              <span>No books found for "{inputVal}".</span>
              <div className="flex gap-2">
                {matchedAuthors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSegment('authors')}
                    className="font-medium text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                  >
                    View {matchedAuthors.length} {matchedAuthors.length === 1 ? 'Author' : 'Authors'}
                  </button>
                )}
                {matchedSeries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSegment('series')}
                    className="font-medium text-[var(--md-sys-color-secondary)] hover:underline cursor-pointer"
                  >
                    View {matchedSeries.length} Series
                  </button>
                )}
              </div>
            </div>
          )}

          {segment === 'authors' && matchedAuthors.length === 0 && hasAnyResults && (
            <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-between">
              <span>No authors found for "{inputVal}".</span>
              <div className="flex gap-2">
                {matchedBooks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSegment('books')}
                    className="font-medium text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                  >
                    View {matchedBooks.length} {matchedBooks.length === 1 ? 'Book' : 'Books'}
                  </button>
                )}
                {matchedSeries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSegment('series')}
                    className="font-medium text-[var(--md-sys-color-secondary)] hover:underline cursor-pointer"
                  >
                    View {matchedSeries.length} Series
                  </button>
                )}
              </div>
            </div>
          )}

          {segment === 'series' && matchedSeries.length === 0 && hasAnyResults && (
            <div className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-between">
              <span>No series found for "{inputVal}".</span>
              <div className="flex gap-2">
                {matchedBooks.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSegment('books')}
                    className="font-medium text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                  >
                    View {matchedBooks.length} {matchedBooks.length === 1 ? 'Book' : 'Books'}
                  </button>
                )}
                {matchedAuthors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSegment('authors')}
                    className="font-medium text-[var(--md-sys-color-secondary)] hover:underline cursor-pointer"
                  >
                    View {matchedAuthors.length} {matchedAuthors.length === 1 ? 'Author' : 'Authors'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BOOKS RESULTS */}
          {segment === 'books' && (
            <>
              {matchedBooks.length === 0 && !isAudibleSearching ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">No results</p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Try a title, author, or series.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
                  {matchedBooks.map(({ book, source, audibleData }) => {
                    const followed = isBookFollowed(book.id);
                    const auths = getAuthorsForBook(book.id);
                    const primaryAuthor =
                      auths[0]?.name ||
                      (audibleData?.authors?.[0]?.name ?? 'Unknown Author');
                    const seriesName =
                      (book.seriesId ? seriesMap.get(book.seriesId) : undefined) ||
                      audibleData?.series?.name;
                    const countdown = formatCountdown(book.releaseDate, book.dateConfidence, clock);

                    return (
                      <div
                        key={book.id}
                        className="py-3 flex gap-3.5 items-start hover:bg-[var(--md-sys-color-surface-container-low)] transition px-1 cursor-pointer"
                        onClick={() => handleSelectBook(book, audibleData)}
                      >
                        <div className="w-14 h-21 shrink-0 rounded-[4px] overflow-hidden bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] relative">
                          {book.coverUrl ? (
                            <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px]">
                              Cover
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] leading-snug line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                            {primaryAuthor}
                          </p>
                          {seriesName && (
                            <p className="text-[11px] text-[var(--md-sys-color-secondary)] truncate">
                              {seriesName} {book.seriesPosition ? `#${book.seriesPosition}` : ''}
                            </p>
                          )}
                          <div className="pt-1 flex flex-wrap items-baseline gap-x-2 text-xs">
                            <span className="font-medium text-[var(--md-sys-color-primary)] tabular-nums">
                              {book.releaseDate || 'Date to be announced'}
                            </span>
                            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                              · {countdown.text}
                            </span>
                          </div>
                        </div>

                        {/* Follow Toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (audibleData) {
                              ingestAudibleItem(audibleData.book, audibleData.authors, audibleData.series);
                            }
                            if (followed) unfollowBook(book.id);
                            else followBook(book.id);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer self-center shrink-0 flex items-center gap-1 ${
                            followed
                              ? 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline)]'
                              : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                          }`}
                        >
                          {followed ? (
                            <>
                              <Check className="h-3 w-3 stroke-[2.5]" />
                              Following
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Follow
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* AUTHORS RESULTS */}
          {segment === 'authors' && (
            <>
              {matchedAuthors.length === 0 && !isAudibleSearching ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">No results</p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Try a title, author, or series.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
                  {matchedAuthors.map(({ author }) => {
                    const followed = isAuthorFollowed(author.id);
                    const authorBooks = getBooksForAuthor(author.id);
                    const upcomingCount = authorBooks.filter((b) => b.status === 'UPCOMING').length;

                    return (
                      <div
                        key={author.id}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--md-sys-color-surface-container-low)] transition px-1 cursor-pointer"
                        onClick={() => handleSelectAuthor(author)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* 48 dp circle image */}
                          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center border border-[var(--md-sys-color-outline)]">
                            {author.imageUrl ? (
                              <img src={author.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]">
                                {author.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                              {author.name}
                            </h3>
                            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                              {upcomingCount > 0
                                ? `${upcomingCount} ${upcomingCount === 1 ? 'upcoming book' : 'upcoming books'}`
                                : 'Audible author'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (followed) unfollowAuthor(author.id);
                            else followAuthor(author.id);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1 ${
                            followed
                              ? 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline)]'
                              : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                          }`}
                        >
                          {followed ? (
                            <>
                              <Check className="h-3 w-3 stroke-[2.5]" />
                              Following
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Follow
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* SERIES RESULTS */}
          {segment === 'series' && (
            <>
              {matchedSeries.length === 0 && !isAudibleSearching ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">No results</p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Try a title, author, or series.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
                    Retry
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
                  {matchedSeries.map(({ series: s }) => {
                    const followed = isSeriesFollowed(s.id);
                    const seriesBooks = getBooksForSeries(s.id);
                    const upcomingCount = seriesBooks.filter((b) => b.status === 'UPCOMING').length;

                    return (
                      <div
                        key={s.id}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--md-sys-color-surface-container-low)] transition px-1 cursor-pointer"
                        onClick={() => handleSelectSeries(s)}
                      >
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                            {s.name}
                          </h3>
                          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                            {s.primaryAuthorName ? `By ${s.primaryAuthorName} · ` : ''}
                            {upcomingCount > 0
                              ? `${upcomingCount} ${upcomingCount === 1 ? 'upcoming book' : 'upcoming books'}`
                              : 'Audible series'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (followed) unfollowSeries(s.id);
                            else followSeries(s.id);
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 flex items-center gap-1 ${
                            followed
                              ? 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline)]'
                              : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                          }`}
                        >
                          {followed ? (
                            <>
                              <Check className="h-3 w-3 stroke-[2.5]" />
                              Following
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" />
                              Follow
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
