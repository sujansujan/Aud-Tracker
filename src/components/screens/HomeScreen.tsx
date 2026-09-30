import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Audiobook } from '../../types/audiobook';
import { getDaysUntil, getReleaseCountdown } from '../../utils/notifications';
import {
  Search,
  Bell,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Flame,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    books,
    authors,
    series,
    narrators,
    isAuthorFollowed,
    isSeriesFollowed,
    setSelectedBook,
    setIsSearchOpen,
    setActiveTab,
    unreadNotifCount,
  } = useTracker();

  // Dynamic Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // 1. Next Release (closest upcoming followed book)
  const followedBooks = books.filter((b) => b.isFollowed);
  const upcomingFollowed = followedBooks
    .filter((b) => getDaysUntil(b.releaseDate) >= 0)
    .sort((a, b) => getDaysUntil(a.releaseDate) - getDaysUntil(b.releaseDate));

  const nextRelease = upcomingFollowed[0] || books.filter((b) => getDaysUntil(b.releaseDate) >= 0)[0];

  // 2. Upcoming For You (Followed books upcoming)
  const upcomingForYou = upcomingFollowed.slice(0, 6);

  // 3. Releasing This Week (0 <= days <= 7)
  const releasingThisWeek = books.filter((b) => {
    const d = getDaysUntil(b.releaseDate);
    return d >= 0 && d <= 7;
  });

  // 4. New From Followed Authors
  const newFromAuthors = books.filter((b) => isAuthorFollowed(b.author) && getDaysUntil(b.releaseDate) >= 0);

  // 5. New In Followed Series
  const newInSeries = books.filter((b) => b.series && isSeriesFollowed(b.series.name) && getDaysUntil(b.releaseDate) >= 0);

  // 6. Recently Changed (Release Date Changed!)
  const recentlyChanged = books.filter((b) => b.releaseHistory && b.releaseHistory.length > 0);

  // 7. Recently Released (released in past 60 days)
  const recentlyReleased = books.filter((b) => {
    const d = getDaysUntil(b.releaseDate);
    return d < 0 && d >= -60;
  });

  // 8. Recommended (Highly rated or discover)
  const recommended = books.filter((b) => b.audibleRating >= 4.85).slice(0, 6);

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      {/* Top Greeting & Search Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
            Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="md-btn-icon relative"
          title="Alerts & Notifications"
          aria-label="Alerts"
        >
          <Bell className="h-5 w-5" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[var(--md-sys-color-primary)] ring-2 ring-[var(--md-sys-color-surface)]" />
          )}
        </button>
      </div>

      {/* Fast Search Bar Trigger */}
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
          <span className="text-sm font-medium">Search audiobooks, authors, narrators...</span>
        </div>
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded-md border bg-[var(--md-sys-color-surface)]">
          Tap
        </kbd>
      </button>

      {/* SECTION: NEXT RELEASE HERO SPOTLIGHT */}
      {nextRelease && (
        <section aria-labelledby="next-release-heading">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[var(--md-sys-color-primary)]" />
              <h2 id="next-release-heading" className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                Next Release Spotlight
              </h2>
            </div>
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)]">
              {getReleaseCountdown(nextRelease.releaseDate).badgeText}
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              boxShadow: 'var(--md-elevation-2)',
            }}
            className="rounded-3xl border p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center transition-all hover:shadow-md cursor-pointer"
            onClick={() => setSelectedBook(nextRelease)}
          >
            <div className="relative w-28 sm:w-36 aspect-square shrink-0 rounded-2xl overflow-hidden shadow-sm bg-[var(--md-sys-color-surface-container)]">
              <img
                src={nextRelease.coverUrl}
                alt={nextRelease.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-sm">
                Next
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                  {nextRelease.genre}
                </span>
                {nextRelease.series && (
                  <span className="text-[var(--md-sys-color-secondary)] font-semibold truncate">
                    {nextRelease.series.name} #{nextRelease.series.bookNumber}
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">
                {nextRelease.title}
              </h3>

              <p className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] truncate">
                By <span className="text-[var(--md-sys-color-on-surface)] font-bold">{nextRelease.author}</span>
              </p>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                Narrated by {nextRelease.narrator || nextRelease.narrators.join(', ')}
              </p>

              <div className="pt-2 flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--md-sys-color-primary)]">
                  <Calendar className="h-4 w-4" />
                  <span>{nextRelease.releaseDate}</span>
                </div>

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs hover:opacity-90"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION: RECENTLY CHANGED (Differentiating Feature: Release Date Changed) */}
      {recentlyChanged.length > 0 && (
        <section aria-labelledby="recently-changed-heading">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[var(--md-sys-color-accent-orange)]">
              <AlertTriangle className="h-4.5 w-4.5 stroke-[2.5]" />
              <h2 id="recently-changed-heading" className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                Release Date Changed ({recentlyChanged.length})
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentlyChanged.map((book) => {
              const latestChange = book.releaseHistory?.[book.releaseHistory.length - 1];
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
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--md-sys-color-accent-orange)] text-white">
                      Date Updated
                    </span>
                    <h4 className="text-sm font-bold truncate mt-1">{book.title}</h4>
                    <div className="text-xs flex items-center gap-2 mt-1">
                      <span className="line-through text-[var(--md-sys-color-on-surface-variant)] opacity-70">
                        {latestChange?.oldDate || book.originalReleaseDate}
                      </span>
                      <span className="font-extrabold text-[var(--md-sys-color-primary)]">
                        ➔ {book.releaseDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION: RELEASING THIS WEEK */}
      {releasingThisWeek.length > 0 && (
        <section aria-labelledby="this-week-heading">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4.5 w-4.5 text-[var(--md-sys-color-accent-orange)]" />
              <h2 id="this-week-heading" className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                Releasing This Week
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className="text-xs font-bold text-[var(--md-sys-color-primary)] flex items-center gap-1 hover:underline cursor-pointer"
            >
              Calendar <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {releasingThisWeek.map((book) => {
              const countdown = getReleaseCountdown(book.releaseDate);
              return (
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
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--md-sys-color-accent-green)] text-white shadow-xs">
                      {countdown.badgeText}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold truncate leading-tight">{book.title}</h4>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">{book.author}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION: UPCOMING FOR YOU (FOLLOWED BOOKS) */}
      <section aria-labelledby="upcoming-for-you-heading">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-[var(--md-sys-color-primary)]" />
            <h2 id="upcoming-for-you-heading" className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              Upcoming For You ({upcomingForYou.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className="text-xs font-bold text-[var(--md-sys-color-primary)] flex items-center gap-1 hover:underline cursor-pointer"
          >
            All Watchlist <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {upcomingForYou.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="rounded-2xl border p-6 text-center space-y-2"
          >
            <p className="text-sm font-semibold">No upcoming followed books yet</p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Follow books or authors in Discover to track release dates here!
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('discover')}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
            >
              Browse Upcoming Books
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {upcomingForYou.map((book) => {
              const countdown = getReleaseCountdown(book.releaseDate);
              return (
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
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs">
                      {countdown.badgeText}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold truncate leading-tight">{book.title}</h4>
                    <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">{book.author}</p>
                    <div className="text-[10px] font-semibold text-[var(--md-sys-color-primary)] mt-1">
                      {book.releaseDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION: NEW FROM FOLLOWED AUTHORS / SERIES */}
      {(newFromAuthors.length > 0 || newInSeries.length > 0) && (
        <section aria-labelledby="followed-creators-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="followed-creators-heading" className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
              From Followed Creators &amp; Series
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...newFromAuthors, ...newInSeries].slice(0, 4).map((book) => (
              <div
                key={book.id}
                style={{
                  backgroundColor: 'var(--md-sys-color-surface)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="rounded-2xl border p-3 flex gap-3 items-center cursor-pointer transition hover:shadow-xs"
                onClick={() => setSelectedBook(book)}
              >
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-[var(--md-sys-color-primary)]">
                    {book.series ? `Series: ${book.series.name}` : `Author: ${book.author}`}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold truncate mt-0.5">{book.title}</h4>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Releases {book.releaseDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION: RECENTLY RELEASED */}
      {recentlyReleased.length > 0 && (
        <section aria-labelledby="recently-released-heading">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4.5 w-4.5 text-[var(--md-sys-color-accent-green)]" />
              <h2 id="recently-released-heading" className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                Recently Available on Audible
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {recentlyReleased.map((book) => (
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
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--md-sys-color-accent-green)] text-white">
                    Available Now
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold truncate leading-tight">{book.title}</h4>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
