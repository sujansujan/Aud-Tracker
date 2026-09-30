import React, { useState } from 'react';
import { useSpecTracker } from '../../context/SpecTrackerContext';
import { formatCountdown } from '../../utils/clock';
import { ArrowLeft, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export const AuthorDetailScreen: React.FC = () => {
  const {
    selectedAuthorId,
    setSelectedAuthorId,
    setSelectedBookId,
    setSelectedSeriesId,
    getAuthorById,
    getBooksForAuthor,
    series,
    isAuthorFollowed,
    followAuthor,
    unfollowAuthor,
    clock,
  } = useSpecTracker();

  const [bioExpanded, setBioExpanded] = useState(false);
  const [releasedExpanded, setReleasedExpanded] = useState(false);

  if (!selectedAuthorId) return null;
  const author = getAuthorById(selectedAuthorId);
  if (!author) return null;

  const followed = isAuthorFollowed(author.id);
  const allBooks = getBooksForAuthor(author.id);

  const upcomingBooks = allBooks
    .filter((b) => b.status === 'UPCOMING')
    .sort((a, b) => {
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return a.releaseDate.localeCompare(b.releaseDate);
    });

  const releasedBooks = allBooks
    .filter((b) => b.status === 'RELEASED')
    .sort((a, b) => {
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return b.releaseDate.localeCompare(a.releaseDate); // newest first
    });

  const authorSeries = series.filter(
    (s) =>
      s.primaryAuthorName?.toLowerCase() === author.name.toLowerCase() ||
      allBooks.some((b) => b.seriesId === s.id)
  );

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] pb-24 max-w-2xl mx-auto px-4 pt-3 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center gap-3 border-b pb-2.5">
        <button
          type="button"
          onClick={() => setSelectedAuthorId(null)}
          className="p-1.5 rounded-md hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer text-[var(--md-sys-color-on-surface)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] truncate">
          Author
        </span>
      </div>

      {/* Author Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
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
            <h1 className="text-lg font-medium text-[var(--md-sys-color-on-surface)] truncate">
              {author.name}
            </h1>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              {upcomingBooks.length} upcoming · {releasedBooks.length} released
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
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
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              Following
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Follow
            </>
          )}
        </button>
      </div>

      {/* Bio (Expandable) */}
      {author.bio && (
        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          <p className={bioExpanded ? '' : 'line-clamp-2'}>{author.bio}</p>
          {author.bio.length > 100 && (
            <button
              type="button"
              onClick={() => setBioExpanded(!bioExpanded)}
              className="text-xs text-[var(--md-sys-color-primary)] hover:underline pt-0.5 cursor-pointer"
            >
              {bioExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* SECTION: UPCOMING */}
      <div className="space-y-2 border-t pt-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
          Upcoming ({upcomingBooks.length})
        </h2>

        {upcomingBooks.length === 0 ? (
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] py-2">
            No upcoming releases announced.
          </p>
        ) : (
          <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
            {upcomingBooks.map((book) => {
              const countdown = formatCountdown(book.releaseDate, book.dateConfidence, clock);
              return (
                <div
                  key={book.id}
                  className="py-3 flex gap-3.5 items-start hover:bg-[var(--md-sys-color-surface-container-low)] px-1 cursor-pointer"
                  onClick={() => setSelectedBookId(book.id)}
                >
                  <div className="w-14 h-21 shrink-0 rounded-[4px] overflow-hidden bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)]">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px]">Cover</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <div className="pt-1 flex flex-wrap items-baseline gap-x-2 text-xs">
                      <span className="font-medium text-[var(--md-sys-color-primary)] tabular-nums">
                        {book.releaseDate || 'Date to be announced'}
                      </span>
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                        · {countdown.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: RELEASED (Collapsed by default per spec) */}
      <div className="space-y-2 border-t pt-4">
        <button
          type="button"
          onClick={() => setReleasedExpanded(!releasedExpanded)}
          className="w-full flex items-center justify-between text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
        >
          <span>Released ({releasedBooks.length})</span>
          {releasedExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {releasedExpanded && (
          <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)] pt-1">
            {releasedBooks.map((book) => (
              <div
                key={book.id}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-[var(--md-sys-color-surface-container-low)] px-1 cursor-pointer"
                onClick={() => setSelectedBookId(book.id)}
              >
                <div className="min-w-0">
                  <h4 className="text-xs font-medium text-[var(--md-sys-color-on-surface)] truncate">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                    Released {book.releaseDate || 'previously'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION: SERIES */}
      {authorSeries.length > 0 && (
        <div className="space-y-2 border-t pt-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            Series ({authorSeries.length})
          </h2>
          <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
            {authorSeries.map((s) => (
              <div
                key={s.id}
                className="py-2.5 flex items-center justify-between hover:bg-[var(--md-sys-color-surface-container-low)] px-1 cursor-pointer"
                onClick={() => setSelectedSeriesId(s.id)}
              >
                <span className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
