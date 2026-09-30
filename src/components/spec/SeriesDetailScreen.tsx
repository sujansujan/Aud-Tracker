import React from 'react';
import { useSpecTracker } from '../../context/SpecTrackerContext';
import { formatCountdown } from '../../utils/clock';
import { ArrowLeft, Check, Plus } from 'lucide-react';

export const SeriesDetailScreen: React.FC = () => {
  const {
    selectedSeriesId,
    setSelectedSeriesId,
    setSelectedBookId,
    getSeriesById,
    getBooksForSeries,
    isSeriesFollowed,
    followSeries,
    unfollowSeries,
    clock,
  } = useSpecTracker();

  if (!selectedSeriesId) return null;
  const series = getSeriesById(selectedSeriesId);
  if (!series) return null;

  const followed = isSeriesFollowed(series.id);
  const seriesBooks = getBooksForSeries(series.id);

  // Find the next upcoming installment (first upcoming in position order)
  const nextUpcomingIndex = seriesBooks.findIndex((b) => b.status === 'UPCOMING');

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] pb-24 max-w-2xl mx-auto px-4 pt-3 space-y-5">
      {/* Top Bar */}
      <div className="flex items-center gap-3 border-b pb-2.5">
        <button
          type="button"
          onClick={() => setSelectedSeriesId(null)}
          className="p-1.5 rounded-md hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer text-[var(--md-sys-color-on-surface)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] truncate">
          Series
        </span>
      </div>

      {/* Series Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-medium text-[var(--md-sys-color-on-surface)] leading-snug">
            {series.name}
          </h1>
          {series.primaryAuthorName && (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              By {series.primaryAuthorName} · {seriesBooks.length} books
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (followed) unfollowSeries(series.id);
            else followSeries(series.id);
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

      {/* Ordered List of Books by Series Position */}
      <div className="space-y-2 border-t pt-4">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
          Installments ({seriesBooks.length})
        </h2>

        <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
          {seriesBooks.map((book, idx) => {
            const isReleased = book.status === 'RELEASED';
            const isNextUpcoming = idx === nextUpcomingIndex;
            const countdown = formatCountdown(book.releaseDate, book.dateConfidence, clock);

            return (
              <div
                key={book.id}
                className={`py-3 flex gap-3.5 items-start hover:bg-[var(--md-sys-color-surface-container-low)] transition px-1 cursor-pointer ${
                  isNextUpcoming ? 'bg-[var(--md-sys-color-primary-container)]/30 rounded-lg' : ''
                }`}
                onClick={() => setSelectedBookId(book.id)}
              >
                {/* Cover */}
                <div className="w-14 h-21 shrink-0 rounded-[4px] overflow-hidden bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] relative">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px]">Cover</div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-[var(--md-sys-color-secondary)]">
                      Book {book.seriesPosition || `${idx + 1}`}
                    </span>

                    {/* Highlight next upcoming installment */}
                    {isNextUpcoming && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]">
                        Next release
                      </span>
                    )}

                    {/* Released checkmark */}
                    {isReleased && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                        <Check className="h-3 w-3 stroke-[2.5]" /> Released
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] leading-snug line-clamp-2">
                    {book.title}
                  </h3>

                  <div className="pt-0.5 text-xs text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                    {isReleased
                      ? `Released ${book.releaseDate || 'previously'}`
                      : `${book.releaseDate || 'Date to be announced'} · ${countdown.text}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
