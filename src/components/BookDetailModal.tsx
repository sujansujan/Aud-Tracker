import React from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { getReleaseCountdown, getScheduledAlertDates } from '../utils/notifications';
import {
  X,
  Star,
  Calendar,
  Clock,
  Bell,
  Headphones,
  Play,
  Square,
  ExternalLink,
  CheckCircle,
  Plus,
  Layers,
  User,
  Mic,
  BookOpen,
} from 'lucide-react';

interface BookDetailModalProps {
  book: Audiobook | null;
  onClose: () => void;
  onOpenMarkRead: (book: Audiobook) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onOpenMarkRead,
}) => {
  const { toggleReminder, activeAudio, toggleAudioPreview, addTrackedEntity, isEntityTracked } =
    useTracker();

  if (!book) return null;

  const countdown = getReleaseCountdown(book.releaseDate);
  const alertDates = getScheduledAlertDates(book.releaseDate);
  const isPlaying = activeAudio.isPlaying && activeAudio.bookId === book.id;

  const isAuthorFollowed = isEntityTracked('author', book.author);
  const isNarratorFollowed = book.narrators.some((n) => isEntityTracked('narrator', n));
  const isSeriesFollowed = book.series ? isEntityTracked('series', book.series.name) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border overflow-hidden select-none transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div
          style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }}
          className="w-12 h-1.5 rounded-full mx-auto my-2.5 sm:hidden shrink-0"
        />

        {/* Modal Header */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center justify-between px-5 py-3.5 border-b shrink-0"
        >
          <div className="flex items-center gap-2">
            <span
              style={{ color: 'var(--md-sys-color-primary)' }}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Audiobook Dossier
            </span>
            <span style={{ color: 'var(--md-sys-color-outline)' }}>·</span>
            <span
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              className="text-xs font-mono tabular-nums"
            >
              {book.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="md-btn-icon shadow-xs"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top section: Cover & Primary Details */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Cover art with sample preview button */}
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
              className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 mx-auto sm:mx-0 rounded-2xl overflow-hidden shadow-lg border group"
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => toggleAudioPreview(book.id)}
                style={{
                  backgroundColor: isPlaying
                    ? 'var(--md-sys-color-accent-pink)'
                    : 'rgba(40, 42, 54, 0.75)',
                  color: '#ffffff',
                }}
                className="absolute inset-0 flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer"
                title="Preview voice sample"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95">
                  {isPlaying ? (
                    <Square className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </div>
              </button>
            </div>

            {/* Info Column */}
            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              {book.series && (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span
                    style={{ color: 'var(--md-sys-color-secondary)' }}
                    className="text-xs font-bold flex items-center gap-1"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>
                      {book.series.name} {book.series.bookNumber ? `#${book.series.bookNumber}` : ''}
                    </span>
                  </span>
                  {!isSeriesFollowed && (
                    <button
                      type="button"
                      onClick={() =>
                        addTrackedEntity({
                          type: 'series',
                          name: book.series!.name,
                          notes: 'Followed series',
                        })
                      }
                      style={{ color: 'var(--md-sys-color-primary)' }}
                      className="text-[11px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Track Series
                    </button>
                  )}
                </div>
              )}

              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                {book.title}
              </h2>

              <div
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="space-y-1 text-sm"
              >
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span>
                    Author:{' '}
                    <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>
                      {book.author}
                    </strong>
                  </span>
                  {!isAuthorFollowed && (
                    <button
                      type="button"
                      onClick={() =>
                        addTrackedEntity({
                          type: 'author',
                          name: book.author,
                          notes: 'Followed author',
                        })
                      }
                      style={{ color: 'var(--md-sys-color-primary)' }}
                      className="text-[11px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Follow
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span>
                    Narrated by:{' '}
                    <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>
                      {book.narrators.join(', ')}
                    </strong>
                  </span>
                  {!isNarratorFollowed && book.narrators[0] && (
                    <button
                      type="button"
                      onClick={() =>
                        addTrackedEntity({
                          type: 'narrator',
                          name: book.narrators[0],
                          notes: 'Followed narrator',
                        })
                      }
                      style={{ color: 'var(--md-sys-color-primary)' }}
                      className="text-[11px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Follow Voice
                    </button>
                  )}
                </div>
              </div>

              {/* Unboxed Metadata */}
              <div
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs"
              >
                <span className="font-semibold">{book.genre}</span>
                <span aria-hidden="true" style={{ color: 'var(--md-sys-color-outline)' }}>
                  ·
                </span>
                <span
                  style={{ color: 'var(--md-sys-color-accent-yellow)' }}
                  className="flex items-center gap-1 font-bold tabular-nums"
                >
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {book.audibleRating.toFixed(1)}
                  <span
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    className="font-normal"
                  >
                    ({book.ratingCount.toLocaleString()} reviews)
                  </span>
                </span>
                {book.runtimeHours && (
                  <>
                    <span aria-hidden="true" style={{ color: 'var(--md-sys-color-outline)' }}>
                      ·
                    </span>
                    <span className="tabular-nums">Duration: ~{book.runtimeHours} hrs</span>
                  </>
                )}
              </div>

              {/* Release date banner */}
              <div className="pt-2">
                <span
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-bold tabular-nums"
                >
                  <Calendar
                    className="h-3.5 w-3.5"
                    style={{ color: 'var(--md-sys-color-primary)' }}
                  />
                  <span>
                    Release Date: {book.releaseDate} ({countdown.label})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Narration audio sample player preview bar */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="p-4 rounded-3xl border space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones
                  className="h-4 w-4"
                  style={{ color: 'var(--md-sys-color-primary)' }}
                />
                <span className="text-xs font-bold">Audio Narration Sample</span>
              </div>
              <button
                type="button"
                onClick={() => toggleAudioPreview(book.id)}
                style={{ color: 'var(--md-sys-color-primary)' }}
                className="flex items-center gap-1.5 text-xs font-bold hover:underline cursor-pointer"
              >
                {isPlaying ? (
                  <Square className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <Play className="h-3.5 w-3.5 fill-current" />
                )}
                <span>{isPlaying ? 'Pause Sample' : 'Play Sample'}</span>
              </button>
            </div>
            {/* Audio waveform / progress bar */}
            <div
              style={{ backgroundColor: 'var(--md-sys-color-surface-container-high)' }}
              className="relative h-2 w-full rounded-full overflow-hidden"
            >
              <div
                style={{
                  width: `${isPlaying ? activeAudio.progress * 100 : 0}%`,
                  backgroundColor: 'var(--md-sys-color-primary)',
                }}
                className="h-full transition-all duration-100"
              />
            </div>
            <p
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              className="text-[11px]"
            >
              Sample voice demo synthesized for {book.narrators.join(' & ')}
            </p>
          </div>

          {/* Synopsis */}
          <div>
            <h4
              style={{ color: 'var(--md-sys-color-primary)' }}
              className="text-xs font-bold uppercase tracking-wider mb-2"
            >
              Audiobook Synopsis
            </h4>
            <p
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              className="text-sm leading-relaxed"
            >
              {book.synopsis}
            </p>
          </div>

          {/* Release Reminders Configuration Box */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container-low)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="p-4 rounded-3xl border space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell
                  className="h-4 w-4"
                  style={{ color: 'var(--md-sys-color-primary)' }}
                />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Push Reminders Schedule
                </h4>
              </div>
              <span
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="text-[11px]"
              >
                Scheduled triggers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1 Week Before */}
              <div
                onClick={() => toggleReminder(book.id, 'oneWeekBefore')}
                style={{
                  backgroundColor: book.reminders.oneWeekBefore
                    ? 'var(--md-sys-color-primary-container)'
                    : 'var(--md-sys-color-surface)',
                  borderColor: book.reminders.oneWeekBefore
                    ? 'var(--md-sys-color-primary)'
                    : 'var(--md-sys-color-outline-variant)',
                  color: book.reminders.oneWeekBefore
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface)',
                }}
                className="p-3 rounded-2xl border transition cursor-pointer shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">1 Week Before</span>
                  <input
                    type="checkbox"
                    checked={book.reminders.oneWeekBefore}
                    readOnly
                    className="accent-[var(--md-sys-color-primary)]"
                  />
                </div>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px] tabular-nums"
                >
                  Alarm: {alertDates.oneWeekBefore}
                </p>
              </div>

              {/* 1 Day Before */}
              <div
                onClick={() => toggleReminder(book.id, 'oneDayBefore')}
                style={{
                  backgroundColor: book.reminders.oneDayBefore
                    ? 'var(--md-sys-color-primary-container)'
                    : 'var(--md-sys-color-surface)',
                  borderColor: book.reminders.oneDayBefore
                    ? 'var(--md-sys-color-primary)'
                    : 'var(--md-sys-color-outline-variant)',
                  color: book.reminders.oneDayBefore
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface)',
                }}
                className="p-3 rounded-2xl border transition cursor-pointer shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">1 Day Before</span>
                  <input
                    type="checkbox"
                    checked={book.reminders.oneDayBefore}
                    readOnly
                    className="accent-[var(--md-sys-color-primary)]"
                  />
                </div>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px] tabular-nums"
                >
                  Alarm: {alertDates.oneDayBefore}
                </p>
              </div>

              {/* Day of Release */}
              <div
                onClick={() => toggleReminder(book.id, 'dayOfRelease')}
                style={{
                  backgroundColor: book.reminders.dayOfRelease
                    ? 'var(--md-sys-color-primary-container)'
                    : 'var(--md-sys-color-surface)',
                  borderColor: book.reminders.dayOfRelease
                    ? 'var(--md-sys-color-primary)'
                    : 'var(--md-sys-color-outline-variant)',
                  color: book.reminders.dayOfRelease
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface)',
                }}
                className="p-3 rounded-2xl border transition cursor-pointer shadow-xs active:scale-98"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Day of Release</span>
                  <input
                    type="checkbox"
                    checked={book.reminders.dayOfRelease}
                    readOnly
                    className="accent-[var(--md-sys-color-primary)]"
                  />
                </div>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-[11px] tabular-nums"
                >
                  Alarm: {alertDates.dayOfRelease}
                </p>
              </div>
            </div>
          </div>

          {/* Reading Log Status */}
          {book.isRead && (
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-accent-green-container)',
                borderColor: 'var(--md-sys-color-accent-green)',
                color: 'var(--md-sys-color-on-surface)',
              }}
              className="p-4 rounded-3xl border space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{ color: 'var(--md-sys-color-accent-green)' }}
                  className="flex items-center gap-1.5 text-xs font-extrabold"
                >
                  <CheckCircle className="h-4 w-4" /> Finished &amp; Logged in Library
                </span>
                <span
                  style={{ color: 'var(--md-sys-color-accent-yellow)' }}
                  className="text-xs font-bold"
                >
                  {book.userPersonalRating ? `${book.userPersonalRating} / 5 Stars` : ''}
                </span>
              </div>
              {book.readCompletedAt && (
                <p className="text-xs tabular-nums opacity-85">
                  Completed on {new Date(book.readCompletedAt).toLocaleString()} · Logged duration:{' '}
                  {book.listeningDurationHours || book.runtimeHours} hrs
                </p>
              )}
              {book.userNotes && (
                <p
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="text-xs italic p-3 rounded-2xl border shadow-xs"
                >
                  &ldquo;{book.userNotes}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center justify-between gap-3 p-4 border-t shrink-0"
        >
          {book.audibleUrl ? (
            <a
              href={book.audibleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="md-btn-tonal min-h-[44px] px-4 text-xs font-bold gap-1.5"
            >
              <span>Audible Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMarkRead(book);
              }}
              className="md-btn-fab min-h-[44px] px-5 text-xs font-bold"
            >
              {book.isRead ? 'Edit Reading Log' : 'Tag as Read / Logged'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
