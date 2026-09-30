import React, { useState } from 'react';
import { useSpecTracker } from '../../context/SpecTrackerContext';
import { Bell, BellOff, UserMinus, Search, Check } from 'lucide-react';
import { formatCountdown } from '../../utils/clock';

export const FollowingScreen: React.FC = () => {
  const {
    follows,
    authors,
    series,
    books,
    unfollowAuthor,
    unfollowSeries,
    unfollowBook,
    toggleAuthorNotify,
    toggleSeriesNotify,
    setSelectedBookId,
    setSelectedAuthorId,
    setSelectedSeriesId,
    setActiveTab,
    getBooksForAuthor,
    getBooksForSeries,
    clock,
  } = useSpecTracker();

  const [segment, setSegment] = useState<'authors' | 'series' | 'books'>('authors');

  const followedAuthors = follows
    .filter((f) => f.type === 'AUTHOR')
    .map((f) => ({ follow: f, author: authors.find((a) => a.id === f.targetId) }))
    .filter((item): item is { follow: typeof item.follow; author: NonNullable<typeof item.author> } => item.author !== undefined);

  const followedSeries = follows
    .filter((f) => f.type === 'SERIES')
    .map((f) => ({ follow: f, series: series.find((s) => s.id === f.targetId) }))
    .filter((item): item is { follow: typeof item.follow; series: NonNullable<typeof item.series> } => item.series !== undefined);

  const followedBooks = follows
    .filter((f) => f.type === 'BOOK' && !f.archived)
    .map((f) => ({ follow: f, book: books.find((b) => b.id === f.targetId) }))
    .filter((item): item is { follow: typeof item.follow; book: NonNullable<typeof item.book> } => item.book !== undefined);

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-3 space-y-4">
      <h1 className="text-xl font-medium tracking-tight text-[var(--md-sys-color-on-surface)] border-b pb-2.5">
        Following
      </h1>

      {/* Segmented Control */}
      <div className="flex rounded-xl bg-[var(--md-sys-color-surface-container)] p-1 border border-[var(--md-sys-color-outline)]">
        {(['authors', 'series', 'books'] as const).map((seg) => {
          const count =
            seg === 'authors'
              ? followedAuthors.length
              : seg === 'series'
              ? followedSeries.length
              : followedBooks.length;
          return (
            <button
              key={seg}
              type="button"
              onClick={() => setSegment(seg)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition cursor-pointer ${
                segment === seg
                  ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              {seg} ({count})
            </button>
          );
        })}
      </div>

      {/* SEGMENT: AUTHORS */}
      {segment === 'authors' && (
        <div className="space-y-3">
          {followedAuthors.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                You are not following any authors.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer inline-flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> Search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
              {followedAuthors.map(({ follow, author }) => {
                const authorBooks = getBooksForAuthor(author.id);
                const upcomingCount = authorBooks.filter((b) => b.status === 'UPCOMING').length;

                return (
                  <div
                    key={author.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--md-sys-color-surface-container-low)] px-1 cursor-pointer"
                    onClick={() => setSelectedAuthorId(author.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
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
                          {upcomingCount} {upcomingCount === 1 ? 'upcoming book' : 'upcoming books'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Per-item notification toggle */}
                      <button
                        type="button"
                        onClick={() => toggleAuthorNotify(author.id)}
                        className={`p-2 rounded-lg text-xs cursor-pointer ${
                          follow.notifyNewBooks
                            ? 'text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]'
                            : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
                        }`}
                        title={follow.notifyNewBooks ? 'Notifications enabled' : 'Notifications disabled'}
                        aria-label={follow.notifyNewBooks ? 'Disable new book notifications' : 'Enable new book notifications'}
                      >
                        {follow.notifyNewBooks ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      </button>

                      {/* Unfollow */}
                      <button
                        type="button"
                        onClick={() => unfollowAuthor(author.id)}
                        className="p-2 rounded-lg text-xs text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                        title="Unfollow"
                        aria-label="Unfollow author"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT: SERIES */}
      {segment === 'series' && (
        <div className="space-y-3">
          {followedSeries.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                You are not following any series.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer inline-flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> Search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
              {followedSeries.map(({ follow, series: ser }) => {
                const seriesBooks = getBooksForSeries(ser.id);
                const upcomingCount = seriesBooks.filter((b) => b.status === 'UPCOMING').length;

                return (
                  <div
                    key={ser.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--md-sys-color-surface-container-low)] px-1 cursor-pointer"
                    onClick={() => setSelectedSeriesId(ser.id)}
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                        {ser.name}
                      </h3>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        {upcomingCount} {upcomingCount === 1 ? 'upcoming book' : 'upcoming books'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleSeriesNotify(ser.id)}
                        className={`p-2 rounded-lg text-xs cursor-pointer ${
                          follow.notifyNewBooks
                            ? 'text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container)]'
                            : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)]'
                        }`}
                        title={follow.notifyNewBooks ? 'Notifications enabled' : 'Notifications disabled'}
                        aria-label={follow.notifyNewBooks ? 'Disable notifications' : 'Enable notifications'}
                      >
                        {follow.notifyNewBooks ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => unfollowSeries(ser.id)}
                        className="p-2 rounded-lg text-xs text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                        title="Unfollow"
                        aria-label="Unfollow series"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEGMENT: BOOKS */}
      {segment === 'books' && (
        <div className="space-y-3">
          {followedBooks.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                You are not following any books directly.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer inline-flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" /> Search
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
              {followedBooks.map(({ book }) => {
                const countdown = formatCountdown(book.releaseDate, book.dateConfidence, clock);
                return (
                  <div
                    key={book.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[var(--md-sys-color-surface-container-low)] px-1 cursor-pointer"
                    onClick={() => setSelectedBookId(book.id)}
                  >
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                        {book.releaseDate || 'Date to be announced'} · {countdown.text}
                      </p>
                    </div>

                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => unfollowBook(book.id)}
                        className="p-2 rounded-lg text-xs text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                        title="Unfollow"
                        aria-label="Unfollow book"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
