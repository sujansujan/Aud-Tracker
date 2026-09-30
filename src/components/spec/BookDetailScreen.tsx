import React, { useState } from 'react';
import { useSpecTracker } from '../../context/SpecTrackerContext';
import { formatCountdown } from '../../utils/clock';
import {
  ArrowLeft,
  Check,
  Plus,
  ExternalLink,
  Bell,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const BookDetailScreen: React.FC = () => {
  const {
    selectedBookId,
    setSelectedBookId,
    setSelectedAuthorId,
    setSelectedSeriesId,
    getBookById,
    getSeriesById,
    getAuthorsForBook,
    getReleaseHistoryForBook,
    isBookFollowed,
    followBook,
    unfollowBook,
    getBookFollow,
    updateBookReminders,
    isAuthorFollowed,
    isSeriesFollowed,
    clock,
  } = useSpecTracker();

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showAlsoFollowModal, setShowAlsoFollowModal] = useState(false);
  const [alsoFollowAuthorChecked, setAlsoFollowAuthorChecked] = useState(false);
  const [alsoFollowSeriesChecked, setAlsoFollowSeriesChecked] = useState(false);

  if (!selectedBookId) return null;
  const book = getBookById(selectedBookId);
  if (!book) return null;

  const authors = getAuthorsForBook(book.id);
  const primaryAuthor = authors[0];
  const series = book.seriesId ? getSeriesById(book.seriesId) : undefined;
  const follow = getBookFollow(book.id);
  const isFollowed = isBookFollowed(book.id);
  const releaseHistories = getReleaseHistoryForBook(book.id);
  const countdown = formatCountdown(book.releaseDate, book.dateConfidence, clock);

  const confidenceLabel =
    book.dateConfidence === 'CONFIRMED'
      ? 'Confirmed'
      : book.dateConfidence === 'MONTH_ONLY'
      ? countdown.text
      : 'To be announced';

  const handleFollowClick = () => {
    if (isFollowed) {
      unfollowBook(book.id);
    } else {
      // Check if author or series is not yet followed, to offer optional checkboxes
      const authorNotFollowed = primaryAuthor && !isAuthorFollowed(primaryAuthor.id);
      const seriesNotFollowed = series && !isSeriesFollowed(series.id);

      if (authorNotFollowed || seriesNotFollowed) {
        setAlsoFollowAuthorChecked(false);
        setAlsoFollowSeriesChecked(false);
        setShowAlsoFollowModal(true);
      } else {
        followBook(book.id, [0, 1]);
      }
    }
  };

  const confirmFollowWithChoices = () => {
    followBook(
      book.id,
      [0, 1],
      alsoFollowAuthorChecked && primaryAuthor ? primaryAuthor.id : undefined,
      alsoFollowSeriesChecked && series ? series.id : undefined
    );
    setShowAlsoFollowModal(false);
  };

  const currentOffsets = follow?.reminderOffsets || [0, 1];
  const toggleReminder = (offset: number) => {
    let next: number[];
    if (currentOffsets.includes(offset)) {
      next = currentOffsets.filter((o) => o !== offset);
    } else {
      next = [...currentOffsets, offset];
    }
    updateBookReminders(book.id, next);
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] pb-24 max-w-2xl mx-auto px-4 pt-3 space-y-5">
      {/* Top Bar with Back Navigation */}
      <div className="flex items-center gap-3 border-b pb-2.5">
        <button
          type="button"
          onClick={() => setSelectedBookId(null)}
          className="p-1.5 rounded-md hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer text-[var(--md-sys-color-on-surface)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] truncate">
          Audiobook
        </span>
      </div>

      {/* Main Book Card */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Large Cover */}
        <div className="w-36 sm:w-44 aspect-[2/3] shrink-0 rounded-[4px] overflow-hidden bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] shadow-xs mx-auto sm:mx-0">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Cover
            </div>
          )}
        </div>

        {/* Header Metadata */}
        <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-[var(--md-sys-color-on-surface)] leading-snug">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{book.subtitle}</p>
          )}

          {/* Authors (Tappable to Author Detail) */}
          <div className="pt-1 text-xs">
            <span className="text-[var(--md-sys-color-on-surface-variant)]">By </span>
            {authors.map((auth, index) => (
              <span key={auth.id}>
                <button
                  type="button"
                  onClick={() => setSelectedAuthorId(auth.id)}
                  className="font-medium text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                >
                  {auth.name}
                </button>
                {index < authors.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>

          {/* Series & Position (Tappable to Series Detail) */}
          {series && (
            <div className="text-xs">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Series: </span>
              <button
                type="button"
                onClick={() => setSelectedSeriesId(series.id)}
                className="font-medium text-[var(--md-sys-color-secondary)] hover:underline cursor-pointer"
              >
                {series.name} {book.seriesPosition ? `#${book.seriesPosition}` : ''}
              </button>
            </div>
          )}

          {/* Narrators (Display only, not followable per spec) */}
          {book.narrators.length > 0 && (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Narrated by {book.narrators.join(', ')}
            </p>
          )}

          {/* Duration */}
          {book.durationMinutes && (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center sm:justify-start gap-1 pt-1">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {Math.floor(book.durationMinutes / 60)}h {book.durationMinutes % 60}m
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Release Block */}
      <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] space-y-1">
        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider font-medium">
          Release date
        </div>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-medium text-[var(--md-sys-color-primary)] tabular-nums">
            {book.releaseDate || 'Date to be announced'}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface-variant)]">
            {confidenceLabel}
          </span>
        </div>
        <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
          {countdown.text}
        </div>
      </div>

      {/* Primary Actions: Follow / Following, Open in Audible */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={handleFollowClick}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
            isFollowed
              ? 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline)]'
              : 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:opacity-90'
          }`}
        >
          {isFollowed ? (
            <>
              <Check className="h-4 w-4 stroke-[2.5]" />
              Following
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Follow
            </>
          )}
        </button>

        {book.storeUrl && (
          <a
            href={book.storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl text-xs font-medium border border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container)] transition flex items-center justify-center gap-1.5"
          >
            <span>Open in Audible</span>
            <ExternalLink className="h-3.5 w-3.5 text-[var(--md-sys-color-on-surface-variant)]" />
          </a>
        )}
      </div>

      {/* Reminders Block (Available when followed) */}
      {isFollowed && (
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface)]">
            <Bell className="h-3.5 w-3.5 text-[var(--md-sys-color-primary)]" />
            <span>Reminders</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { offset: 0, label: 'Release day' },
              { offset: 1, label: '1 day before' },
              { offset: 3, label: '3 days before' },
              { offset: 7, label: '1 week before' },
            ].map((item) => {
              const active = currentOffsets.includes(item.offset);
              return (
                <button
                  key={item.offset}
                  type="button"
                  onClick={() => toggleReminder(item.offset)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition cursor-pointer text-center ${
                    active
                      ? 'bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)]'
                      : 'bg-transparent border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {item.label} {active ? '✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Release History Timeline (Hidden if only 1 initial entry per spec) */}
      {releaseHistories.length > 1 && (
        <div className="p-4 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] space-y-2">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            Release history
          </div>
          <div className="divide-y divide-[var(--md-sys-color-outline)] text-xs">
            {releaseHistories.map((rh, idx) => (
              <div key={rh.id || idx} className="py-2 flex items-center justify-between">
                <div>
                  <span className="font-medium text-[var(--md-sys-color-on-surface)]">
                    {rh.newDate || 'Date to be announced'}
                  </span>
                  {rh.oldDate && (
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">
                      {' '}
                      (was {rh.oldDate})
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  {new Date(rh.changedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description (Expandable) */}
      {book.description && (
        <div className="space-y-1.5 border-t pt-4">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
            Description
          </h2>
          <p
            className={`text-xs text-[var(--md-sys-color-on-surface)] leading-relaxed ${
              descriptionExpanded ? '' : 'line-clamp-4'
            }`}
          >
            {book.description}
          </p>
          <button
            type="button"
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            className="text-xs font-medium text-[var(--md-sys-color-primary)] hover:underline cursor-pointer flex items-center gap-0.5 pt-0.5"
          >
            {descriptionExpanded ? (
              <>
                Show less <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Read more <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Also Follow Modal Dialog (Prompted on Follow when applicable) */}
      {showAlsoFollowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline)] p-5 space-y-4 shadow-lg">
            <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
              Follow book
            </h3>

            <div className="space-y-2 text-xs">
              {primaryAuthor && !isAuthorFollowed(primaryAuthor.id) && (
                <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--md-sys-color-on-surface)]">
                  <input
                    type="checkbox"
                    checked={alsoFollowAuthorChecked}
                    onChange={(e) => setAlsoFollowAuthorChecked(e.target.checked)}
                    className="rounded border-[var(--md-sys-color-outline)]"
                  />
                  <span>Also follow {primaryAuthor.name}</span>
                </label>
              )}

              {series && !isSeriesFollowed(series.id) && (
                <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--md-sys-color-on-surface)]">
                  <input
                    type="checkbox"
                    checked={alsoFollowSeriesChecked}
                    onChange={(e) => setAlsoFollowSeriesChecked(e.target.checked)}
                    className="rounded border-[var(--md-sys-color-outline)]"
                  />
                  <span>Also follow {series.name}</span>
                </label>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  followBook(book.id, [0, 1]);
                  setShowAlsoFollowModal(false);
                }}
                className="px-3 py-1.5 text-xs text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={confirmFollowWithChoices}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
