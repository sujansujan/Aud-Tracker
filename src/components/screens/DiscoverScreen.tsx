import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Genre, Audiobook } from '../../types/audiobook';
import { getDaysUntil, getReleaseCountdown } from '../../utils/notifications';
import {
  Compass,
  Search,
  Star,
  User,
  Mic,
  BookMarked,
  Sparkles,
  TrendingUp,
  Flame,
  Check,
  Plus,
} from 'lucide-react';

const GENRES: Genre[] = [
  'Sci-Fi',
  'Fantasy',
  'LitRPG',
  'Thriller',
  'Mystery',
  'Non-Fiction',
  'Horror',
  'Romance',
  'Historical',
  'Biography',
  'Self-Help',
  'Business',
  'Fiction',
];

export const DiscoverScreen: React.FC = () => {
  const {
    books,
    authors,
    narrators,
    series,
    isAuthorFollowed,
    toggleFollowAuthor,
    isNarratorFollowed,
    toggleFollowNarrator,
    isSeriesFollowed,
    toggleFollowSeries,
    setSelectedBook,
    setSelectedAuthor,
    setSelectedSeries,
    setSelectedNarrator,
    setIsSearchOpen,
  } = useTracker();

  const [activeGenreFilter, setActiveGenreFilter] = useState<Genre | 'All'>('All');

  // Categories
  const popularUpcoming = books.filter((b) => getDaysUntil(b.releaseDate) > 0).slice(0, 6);
  const thisWeek = books.filter((b) => {
    const d = getDaysUntil(b.releaseDate);
    return d >= 0 && d <= 7;
  });
  const thisMonth = books.filter((b) => {
    const d = getDaysUntil(b.releaseDate);
    return d > 7 && d <= 30;
  });
  const highlyRated = [...books].sort((a, b) => b.audibleRating - a.audibleRating).slice(0, 6);
  const seriesInstallments = books.filter((b) => b.series && Number(b.series.bookNumber) > 1);

  const displayedByGenre =
    activeGenreFilter === 'All' ? books : books.filter((b) => b.genre === activeGenreFilter);

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
            Explore &amp; Follow
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discover
          </h1>
        </div>
      </div>

      {/* Search Input Bar Trigger */}
      <button
        type="button"
        onClick={() => setIsSearchOpen(true)}
        className="w-full h-12 px-4 rounded-2xl flex items-center justify-between border cursor-pointer transition-all shadow-xs text-left"
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderColor: 'var(--md-sys-color-outline-variant)',
          color: 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-[var(--md-sys-color-primary)]" />
          <span className="text-sm font-medium">Search by title, author, narrator, series...</span>
        </div>
      </button>

      {/* POPULAR UPCOMING (Horizontal Scroll) */}
      <section aria-labelledby="popular-upcoming-heading">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4.5 w-4.5 text-[var(--md-sys-color-primary)]" />
          <h2 id="popular-upcoming-heading" className="text-sm font-extrabold uppercase tracking-wider">
            Popular Upcoming
          </h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {popularUpcoming.map((book) => {
            const countdown = getReleaseCountdown(book.releaseDate);
            return (
              <div
                key={book.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="w-40 shrink-0 rounded-2xl border p-2.5 flex flex-col justify-between cursor-pointer transition hover:shadow-md snap-start"
                onClick={() => setSelectedBook(book)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--md-sys-color-primary)] text-white shadow-xs">
                    {countdown.badgeText}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold truncate leading-tight">{book.title}</h4>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">{book.author}</p>
                  <div className="flex items-center gap-1 mt-1 text-[11px] font-bold text-[var(--md-sys-color-accent-yellow)]">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{book.audibleRating}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPULAR AUTHORS (With 1-Tap Follow) */}
      <section aria-labelledby="popular-authors-heading">
        <div className="flex items-center gap-2 mb-3">
          <User className="h-4.5 w-4.5 text-[var(--md-sys-color-primary)]" />
          <h2 id="popular-authors-heading" className="text-sm font-extrabold uppercase tracking-wider">
            Popular Authors
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {authors.map((auth) => {
            const isFollowed = isAuthorFollowed(auth.name);
            return (
              <div
                key={auth.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="rounded-2xl border p-3 flex items-center justify-between gap-3 transition hover:shadow-xs"
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  onClick={() => setSelectedAuthor(auth)}
                >
                  <img
                    src={auth.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=250'}
                    alt={auth.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">{auth.name}</h4>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                      {books.filter((b) => b.author === auth.name).length} books tracked
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFollowAuthor(auth.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    isFollowed
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary)] hover:text-white'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" /> Following
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> Follow
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPULAR NARRATORS */}
      <section aria-labelledby="popular-narrators-heading">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="h-4.5 w-4.5 text-[var(--md-sys-color-secondary)]" />
          <h2 id="popular-narrators-heading" className="text-sm font-extrabold uppercase tracking-wider">
            Popular Narrators
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {narrators.map((narr) => {
            const isFollowed = isNarratorFollowed(narr.name);
            return (
              <div
                key={narr.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="rounded-2xl border p-3 flex items-center justify-between gap-3 transition hover:shadow-xs"
              >
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  onClick={() => setSelectedNarrator(narr)}
                >
                  <img
                    src={narr.imageUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250'}
                    alt={narr.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate">{narr.name}</h4>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                      Audie Award Narrator
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFollowNarrator(narr.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    isFollowed
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary)] hover:text-white'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" /> Following
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> Follow
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPULAR SERIES */}
      <section aria-labelledby="popular-series-heading">
        <div className="flex items-center gap-2 mb-3">
          <BookMarked className="h-4.5 w-4.5 text-[var(--md-sys-color-primary)]" />
          <h2 id="popular-series-heading" className="text-sm font-extrabold uppercase tracking-wider">
            Popular Series
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {series.map((ser) => {
            const isFollowed = isSeriesFollowed(ser.name);
            return (
              <div
                key={ser.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="rounded-2xl border p-3.5 flex items-center justify-between gap-3 transition hover:shadow-xs"
              >
                <div
                  className="min-w-0 cursor-pointer flex-1"
                  onClick={() => setSelectedSeries(ser)}
                >
                  <h4 className="text-sm font-bold truncate">{ser.name}</h4>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                    By {ser.author} · {ser.bookCount} installments
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFollowSeries(ser.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    isFollowed
                      ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]'
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary)] hover:text-white'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <Check className="h-3.5 w-3.5 stroke-[3]" /> Following
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> Follow
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* BROWSE GENRES */}
      <section aria-labelledby="browse-genres-heading">
        <h2 id="browse-genres-heading" className="text-sm font-extrabold uppercase tracking-wider mb-3">
          Browse by Genre
        </h2>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveGenreFilter('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
              activeGenreFilter === 'All'
                ? 'bg-[var(--md-sys-color-primary)] text-white'
                : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
            }`}
          >
            All Genres ({books.length})
          </button>
          {GENRES.map((g) => {
            const count = books.filter((b) => b.genre === g).length;
            if (count === 0) return null;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setActiveGenreFilter(g)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer ${
                  activeGenreFilter === g
                    ? 'bg-[var(--md-sys-color-primary)] text-white'
                    : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
                }`}
              >
                {g} ({count})
              </button>
            );
          })}
        </div>

        {/* Display filtered books */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {displayedByGenre.map((book) => (
            <div
              key={book.id}
              style={{
                backgroundColor: 'var(--md-sys-color-surface)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
              className="rounded-2xl border p-2.5 flex flex-col justify-between cursor-pointer transition hover:shadow-sm"
              onClick={() => setSelectedBook(book)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold truncate leading-tight">{book.title}</h4>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">{book.author}</p>
                <span className="text-[10px] font-semibold text-[var(--md-sys-color-primary)] mt-1 block">
                  {book.releaseDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
