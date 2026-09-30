import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Audiobook } from '../../types/audiobook';
import { getReleaseCountdown, getDaysUntil } from '../../utils/notifications';
import {
  X,
  ExternalLink,
  Calendar,
  Clock,
  Star,
  Check,
  Plus,
  Bell,
  AlertTriangle,
  BookOpen,
  Share2,
  DownloadCloud,
} from 'lucide-react';

export const AudiobookDetailModal: React.FC = () => {
  const {
    selectedBook,
    setSelectedBook,
    isBookFollowed,
    toggleFollowBook,
    isAuthorFollowed,
    toggleFollowAuthor,
    isSeriesFollowed,
    toggleFollowSeries,
    toggleReminder,
    toggleDownload,
    markAsRead,
    setSelectedAuthor,
    setSelectedSeries,
    authors,
    series,
  } = useTracker();

  if (!selectedBook) return null;

  const book = selectedBook;
  const countdown = getReleaseCountdown(book.releaseDate);
  const isFollowed = isBookFollowed(book.id);

  // Share functionality (native Android share sheet)
  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: book.title,
        text: `${book.title} by ${book.author} — Coming ${book.releaseDate} on Audible!`,
        url: book.audibleUrl || window.location.href,
      }).catch(() => {});
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setSelectedBook(null)}
    >
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border sm:border overflow-hidden select-none transition-colors duration-200 animate-in slide-in-from-bottom sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Top Header Bar */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="px-4 py-3 border-b flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Audible Release
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
              title="Share Audiobook"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              className="p-2 rounded-full hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Info Row */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative w-36 sm:w-44 aspect-square shrink-0 rounded-2xl overflow-hidden shadow-md bg-[var(--md-sys-color-surface-container)] mx-auto sm:mx-0">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[var(--md-sys-color-primary)] text-white shadow-xs">
                {countdown.badgeText}
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                  {book.genre}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]">
                  {book.format || 'Unabridged'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {book.title}
              </h2>
              {book.subtitle && (
                <p className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
                  {book.subtitle}
                </p>
              )}

              {/* Author & Series Links */}
              <div className="pt-1 text-sm space-y-0.5">
                <p>
                  By{' '}
                  <button
                    type="button"
                    onClick={() => {
                      const found = authors.find((a) => a.name.toLowerCase() === book.author.toLowerCase());
                      if (found) setSelectedAuthor(found);
                    }}
                    className="font-bold text-[var(--md-sys-color-primary)] hover:underline cursor-pointer"
                  >
                    {book.author}
                  </button>
                </p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  Narrated by <span className="font-semibold text-[var(--md-sys-color-on-surface)]">{book.narrator || book.narrators.join(', ')}</span>
                </p>
                {book.series && (
                  <p className="text-xs font-semibold text-[var(--md-sys-color-secondary)]">
                    Series:{' '}
                    <button
                      type="button"
                      onClick={() => {
                        const found = series.find((s) => s.name.toLowerCase() === book.series?.name.toLowerCase());
                        if (found) setSelectedSeries(found);
                      }}
                      className="hover:underline cursor-pointer"
                    >
                      {book.series.name} #{book.series.bookNumber}
                    </button>
                  </p>
                )}
              </div>

              {/* Rating & Runtime */}
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs">
                <div className="flex items-center gap-1 font-bold text-[var(--md-sys-color-accent-yellow)]">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{book.audibleRating}</span>
                  <span className="font-normal text-[var(--md-sys-color-on-surface-variant)]">
                    ({book.ratingCount.toLocaleString()} reviews)
                  </span>
                </div>
                {book.durationString && (
                  <div className="flex items-center gap-1 text-[var(--md-sys-color-on-surface-variant)] font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{book.durationString}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => toggleFollowBook(book.id)}
              className={`py-3 px-4 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition shadow-xs ${
                isFollowed
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]'
                  : 'bg-[var(--md-sys-color-primary)] text-white hover:opacity-90'
              }`}
            >
              {isFollowed ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" /> Following ✓
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Follow Audiobook
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleDownload(book.id)}
              className="py-3 px-4 rounded-2xl text-xs font-bold border border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface-container-high)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <DownloadCloud className="h-4 w-4 text-[var(--md-sys-color-primary)]" />
              {book.downloaded === 'Yes' ? 'Downloaded ✓' : 'Mark Downloaded'}
            </button>

            {book.audibleUrl ? (
              <a
                href={book.audibleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-2xl text-xs font-bold bg-[#f19e38] text-black hover:brightness-105 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Open in Audible</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <div />
            )}
          </div>

          {/* SECTION: RELEASE-DATE HISTORY (Differentiating Feature!) */}
          {book.releaseHistory && book.releaseHistory.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
              className="rounded-2xl border p-4 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-[var(--md-sys-color-accent-orange)]">
                <AlertTriangle className="h-4 w-4" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider">
                  Release-Date Change History
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {book.originalReleaseDate && (
                  <div className="flex items-center justify-between text-[var(--md-sys-color-on-surface-variant)]">
                    <span>Originally announced</span>
                    <span className="font-semibold">{book.originalReleaseDate}</span>
                  </div>
                )}
                {book.releaseHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between border-t pt-1.5">
                    <div>
                      <span className="font-bold text-[var(--md-sys-color-primary)]">
                        Rescheduled to {h.newDate}
                      </span>
                      {h.reason && <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{h.reason}</p>}
                    </div>
                    <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                      {new Date(h.changedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: REMINDERS CONFIGURATION */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="rounded-2xl border p-4 space-y-3"
          >
            <div className="flex items-center gap-2 text-[var(--md-sys-color-primary)]">
              <Bell className="h-4 w-4" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-on-surface)]">
                Notification Reminders
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'onReleaseDay', label: 'Release Day' },
                { key: 'oneDayBefore', label: '1 Day Before' },
                { key: 'threeDaysBefore', label: '3 Days Before' },
                { key: 'oneWeekBefore', label: '1 Week Before' },
              ].map((rem) => {
                const active = book.reminders[rem.key as keyof Audiobook['reminders']];
                return (
                  <button
                    key={rem.key}
                    type="button"
                    onClick={() => toggleReminder(book.id, rem.key as keyof Audiobook['reminders'])}
                    className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                      active
                        ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border-[var(--md-sys-color-primary)]'
                        : 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] border-[var(--md-sys-color-outline-variant)]'
                    }`}
                  >
                    {rem.label} {active ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Synopsis
            </h4>
            <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface)] leading-relaxed">
              {book.synopsis}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
