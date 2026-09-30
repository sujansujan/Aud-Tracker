import React, { useState, useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Audiobook } from '../../types/audiobook';
import { getDaysUntil, getReleaseCountdown } from '../../utils/notifications';
import {
  Bookmark,
  Check,
  Clock,
  CheckCircle,
  BookMarked,
  User,
  Mic,
  ArrowUpDown,
  Trash2,
  Bell,
  Sparkles,
  Search,
} from 'lucide-react';

export const WatchlistScreen: React.FC = () => {
  const {
    books,
    authors,
    narrators,
    series,
    toggleFollowBook,
    toggleFollowAuthor,
    toggleFollowNarrator,
    toggleFollowSeries,
    setSelectedBook,
    setSelectedAuthor,
    setSelectedSeries,
    setSelectedNarrator,
    setActiveTab,
  } = useTracker();

  const [activeTabFilter, setActiveTabFilter] = useState<
    'all' | 'upcoming' | 'released' | 'series' | 'authors' | 'narrators'
  >('all');
  const [sortBy, setSortBy] = useState<'release_date' | 'title' | 'author'>('release_date');

  // Followed Collections
  const followedBooks = useMemo(() => books.filter((b) => b.isFollowed), [books]);
  const followedAuthors = useMemo(() => authors.filter((a) => a.isFollowed), [authors]);
  const followedNarrators = useMemo(() => narrators.filter((n) => n.isFollowed), [narrators]);
  const followedSeries = useMemo(() => series.filter((s) => s.isFollowed), [series]);

  // Tab Filter counts
  const counts = {
    all: followedBooks.length,
    upcoming: followedBooks.filter((b) => getDaysUntil(b.releaseDate) >= 0).length,
    released: followedBooks.filter((b) => getDaysUntil(b.releaseDate) < 0).length,
    series: followedSeries.length,
    authors: followedAuthors.length,
    narrators: followedNarrators.length,
  };

  // Filtered & Sorted books
  const displayedBooks = useMemo(() => {
    let list = [...followedBooks];
    if (activeTabFilter === 'upcoming') {
      list = list.filter((b) => getDaysUntil(b.releaseDate) >= 0);
    } else if (activeTabFilter === 'released') {
      list = list.filter((b) => getDaysUntil(b.releaseDate) < 0);
    }

    list.sort((a, b) => {
      if (sortBy === 'release_date') {
        return getDaysUntil(a.releaseDate) - getDaysUntil(b.releaseDate);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'author') {
        return a.author.localeCompare(b.author);
      }
      return 0;
    });

    return list;
  }, [followedBooks, activeTabFilter, sortBy]);

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
            My Library
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Watchlist
          </h1>
        </div>

        {/* Sort selector */}
        {['all', 'upcoming', 'released'].includes(activeTabFilter) && (
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-4 w-4 text-[var(--md-sys-color-primary)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-bold p-1.5 rounded-xl border bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
            >
              <option value="release_date">Release Date</option>
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTabFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeTabFilter === 'all'
              ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
          }`}
        >
          All ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabFilter('upcoming')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeTabFilter === 'upcoming'
              ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Upcoming ({counts.upcoming})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabFilter('released')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeTabFilter === 'released'
              ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
          }`}
        >
          <CheckCircle className="h-3.5 w-3.5" /> Released ({counts.released})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabFilter('series')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeTabFilter === 'series'
              ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
          }`}
        >
          <BookMarked className="h-3.5 w-3.5" /> Series ({counts.series})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabFilter('authors')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeTabFilter === 'authors'
              ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
          }`}
        >
          <User className="h-3.5 w-3.5" /> Authors ({counts.authors})
        </button>

        <button
          type="button"
          onClick={() => setActiveTabFilter('narrators')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
            activeTabFilter === 'narrators'
              ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
              : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
          }`}
        >
          <Mic className="h-3.5 w-3.5" /> Narrators ({counts.narrators})
        </button>
      </div>

      {/* CONTENT: AUDIOBOOKS */}
      {['all', 'upcoming', 'released'].includes(activeTabFilter) && (
        <>
          {displayedBooks.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-surface)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
              className="rounded-3xl border p-8 text-center space-y-3 shadow-xs"
            >
              <Bookmark className="h-12 w-12 mx-auto text-[var(--md-sys-color-primary)] opacity-60" />
              <h3 className="text-base font-bold">Your watchlist is empty</h3>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] max-w-sm mx-auto">
                Find upcoming audiobooks and follow them to track their release countdowns here.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('discover')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs"
              >
                Discover Audiobooks
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayedBooks.map((book) => {
                const countdown = getReleaseCountdown(book.releaseDate);
                return (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: 'var(--md-sys-color-surface)',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                    }}
                    className="rounded-2xl border p-3 flex gap-3 items-center cursor-pointer transition hover:shadow-xs"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[var(--md-sys-color-surface-container)]">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-[var(--md-sys-color-primary)] uppercase">
                          {book.genre}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                          {countdown.badgeText}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold truncate mt-0.5">{book.title}</h4>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                        By {book.author}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t text-[11px]">
                        <span className="font-semibold text-[var(--md-sys-color-on-surface-variant)]">
                          {book.releaseDate}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFollowBook(book.id);
                          }}
                          className="text-[11px] font-bold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                        >
                          Unfollow
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* CONTENT: FOLLOWED SERIES */}
      {activeTabFilter === 'series' && (
        <div className="space-y-3">
          {followedSeries.length === 0 ? (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center py-8">
              No followed series yet. Browse Discover to follow series.
            </p>
          ) : (
            followedSeries.map((ser) => (
              <div
                key={ser.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="rounded-2xl border p-4 flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => setSelectedSeries(ser)}
              >
                <div>
                  <h4 className="text-sm font-bold">{ser.name}</h4>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">By {ser.author}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollowSeries(ser.name);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                >
                  Following ✓
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTENT: FOLLOWED AUTHORS */}
      {activeTabFilter === 'authors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {followedAuthors.length === 0 ? (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center py-8 col-span-2">
              No followed authors yet. Follow authors from books or in Discover.
            </p>
          ) : (
            followedAuthors.map((auth) => (
              <div
                key={auth.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="rounded-2xl border p-3 flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => setSelectedAuthor(auth)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={auth.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=250'}
                    alt={auth.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="text-sm font-bold">{auth.name}</h4>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Author</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollowAuthor(auth.name);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                >
                  Following ✓
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* CONTENT: FOLLOWED NARRATORS */}
      {activeTabFilter === 'narrators' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {followedNarrators.length === 0 ? (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center py-8 col-span-2">
              No followed narrators yet.
            </p>
          ) : (
            followedNarrators.map((narr) => (
              <div
                key={narr.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="rounded-2xl border p-3 flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => setSelectedNarrator(narr)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={narr.imageUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250'}
                    alt={narr.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="text-sm font-bold">{narr.name}</h4>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Narrator</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFollowNarrator(narr.name);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                >
                  Following ✓
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
