import React, { useState, useMemo, useEffect } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Search, X, History, User, Mic, BookMarked, BookOpen } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    books,
    authors,
    narrators,
    series,
    setSelectedBook,
    setSelectedAuthor,
    setSelectedSeries,
    setSelectedNarrator,
  } = useTracker();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'books' | 'authors' | 'narrators' | 'series'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_recent_searches');
      return saved ? JSON.parse(saved) : ['Brandon Sanderson', 'Dungeon Crawler Carl', 'Ray Porter', 'Sci-Fi'];
    } catch {
      return [];
    }
  });

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    setRecentSearches((prev) => {
      const updated = [clean, ...prev.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem('audible_tracker_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('audible_tracker_recent_searches');
    } catch {}
  };

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  // Search Results
  const matchedBooks = useMemo(() => {
    if (!q) return [];
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.series && b.series.name.toLowerCase().includes(q)) ||
        b.narrators.some((n) => n.toLowerCase().includes(q))
    );
  }, [books, q]);

  const matchedAuthors = useMemo(() => {
    if (!q) return [];
    return authors.filter((a) => a.name.toLowerCase().includes(q));
  }, [authors, q]);

  const matchedSeries = useMemo(() => {
    if (!q) return [];
    return series.filter((s) => s.name.toLowerCase().includes(q) || s.author.toLowerCase().includes(q));
  }, [series, q]);

  const matchedNarrators = useMemo(() => {
    if (!q) return [];
    return narrators.filter((n) => n.name.toLowerCase().includes(q));
  }, [narrators, q]);

  const hasAnyResults =
    matchedBooks.length > 0 ||
    matchedAuthors.length > 0 ||
    matchedSeries.length > 0 ||
    matchedNarrators.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 pt-4 sm:pt-12 animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border overflow-hidden select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b flex items-center gap-3">
          <Search className="h-5 w-5 text-[var(--md-sys-color-primary)] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveSearchTerm(query);
            }}
            placeholder="Search books, authors, narrators, series..."
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base font-semibold outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-xs font-bold text-[var(--md-sys-color-primary)] px-2 py-1 hover:underline cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Filter categories */}
        {query && (
          <div className="flex gap-1.5 p-2.5 border-b overflow-x-auto scrollbar-none bg-[var(--md-sys-color-surface-container-low)]">
            {(['all', 'books', 'authors', 'narrators', 'series'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition cursor-pointer shrink-0 ${
                  category === cat
                    ? 'bg-[var(--md-sys-color-primary)] text-white'
                    : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query ? (
            /* Recent Searches */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                <span className="flex items-center gap-1.5">
                  <History className="h-4 w-4" /> Recent Searches
                </span>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-[11px] font-bold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)] cursor-pointer transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasAnyResults ? (
            /* Empty State */
            <div className="text-center py-12 space-y-2">
              <Search className="h-10 w-10 mx-auto text-[var(--md-sys-color-primary)] opacity-50" />
              <h4 className="text-sm font-bold">No results found for "{query}"</h4>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-xs mx-auto">
                Try searching by title, author name, narrator, or series title.
              </p>
            </div>
          ) : (
            /* Matched Results */
            <div className="space-y-4">
              {/* Books */}
              {['all', 'books'].includes(category) && matchedBooks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                    Audiobooks ({matchedBooks.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedBooks.map((b) => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer hover:bg-[var(--md-sys-color-surface-container-low)] transition"
                        onClick={() => {
                          saveSearchTerm(query);
                          setIsSearchOpen(false);
                          setSelectedBook(b);
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold truncate">{b.title}</h5>
                            <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                              By {b.author} · {b.releaseDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Authors */}
              {['all', 'authors'].includes(category) && matchedAuthors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                    Authors ({matchedAuthors.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedAuthors.map((a) => (
                      <div
                        key={a.id}
                        className="p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-[var(--md-sys-color-surface-container-low)] transition"
                        onClick={() => {
                          saveSearchTerm(query);
                          setIsSearchOpen(false);
                          setSelectedAuthor(a);
                        }}
                      >
                        <User className="h-5 w-5 text-[var(--md-sys-color-primary)]" />
                        <span className="text-xs font-bold">{a.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Series */}
              {['all', 'series'].includes(category) && matchedSeries.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                    Series ({matchedSeries.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedSeries.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-[var(--md-sys-color-surface-container-low)] transition"
                        onClick={() => {
                          saveSearchTerm(query);
                          setIsSearchOpen(false);
                          setSelectedSeries(s);
                        }}
                      >
                        <BookMarked className="h-5 w-5 text-[var(--md-sys-color-secondary)]" />
                        <span className="text-xs font-bold">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Narrators */}
              {['all', 'narrators'].includes(category) && matchedNarrators.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                    Narrators ({matchedNarrators.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchedNarrators.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-[var(--md-sys-color-surface-container-low)] transition"
                        onClick={() => {
                          saveSearchTerm(query);
                          setIsSearchOpen(false);
                          setSelectedNarrator(n);
                        }}
                      >
                        <Mic className="h-5 w-5 text-[var(--md-sys-color-secondary)]" />
                        <span className="text-xs font-bold">{n.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
