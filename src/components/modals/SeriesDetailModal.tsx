import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { getDaysUntil } from '../../utils/notifications';
import { X, Check, Plus, BookMarked, Sparkles } from 'lucide-react';

export const SeriesDetailModal: React.FC = () => {
  const {
    selectedSeries,
    setSelectedSeries,
    books,
    isSeriesFollowed,
    toggleFollowSeries,
    setSelectedBook,
  } = useTracker();

  if (!selectedSeries) return null;

  const series = selectedSeries;
  const isFollowed = isSeriesFollowed(series.name);

  // Books in series sorted by book number
  const seriesBooks = books
    .filter((b) => b.series && b.series.name.toLowerCase() === series.name.toLowerCase())
    .sort((a, b) => Number(a.series?.bookNumber || 0) - Number(b.series?.bookNumber || 0));

  // Find next upcoming installment
  const nextInstallment = seriesBooks.find((b) => getDaysUntil(b.releaseDate) >= 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setSelectedSeries(null)}
    >
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border sm:border overflow-hidden select-none animate-in slide-in-from-bottom sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
            Series Tracking
          </span>
          <button
            type="button"
            onClick={() => setSelectedSeries(null)}
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold">{series.name}</h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                By {series.author} · {seriesBooks.length} tracked books
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleFollowSeries(series.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isFollowed
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]'
                  : 'bg-[var(--md-sys-color-primary)] text-white hover:opacity-90'
              }`}
            >
              {isFollowed ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[3]" /> Following
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Follow Series
                </>
              )}
            </button>
          </div>

          {/* Series Installments Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Books in Series
            </h4>

            <div className="space-y-2">
              {seriesBooks.map((b) => {
                const days = getDaysUntil(b.releaseDate);
                const isReleased = days < 0;
                const isNext = nextInstallment?.id === b.id;

                return (
                  <div
                    key={b.id}
                    style={{
                      backgroundColor: isNext
                        ? 'var(--md-sys-color-primary-container)'
                        : 'var(--md-sys-color-surface-container-low)',
                      borderColor: isNext
                        ? 'var(--md-sys-color-primary)'
                        : 'var(--md-sys-color-outline-variant)',
                    }}
                    className={`rounded-2xl border p-3 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs ${
                      isNext ? 'ring-2 ring-[var(--md-sys-color-primary)]' : ''
                    }`}
                    onClick={() => {
                      setSelectedSeries(null);
                      setSelectedBook(b);
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="text-sm font-extrabold w-6 text-center text-[var(--md-sys-color-primary)]">
                        {isReleased ? '✓' : isNext ? '●' : '○'}
                      </div>
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[var(--md-sys-color-secondary)]">
                            Book {b.series?.bookNumber}
                          </span>
                          {isNext && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[var(--md-sys-color-primary)] text-white">
                              NEXT RELEASE
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold truncate">{b.title}</h5>
                        <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] truncate">
                          {isReleased ? `Released ${b.releaseDate}` : `Releases ${b.releaseDate}`}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
