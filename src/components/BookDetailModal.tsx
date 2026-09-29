import React from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { getReleaseCountdown } from '../utils/notifications';
import {
  X,
  Star,
  Calendar,
  ExternalLink,
  CheckCircle,
  Plus,
  Layers,
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
  const { addTrackedEntity, isEntityTracked } = useTracker();

  if (!book) return null;

  const countdown = getReleaseCountdown(book.releaseDate);

  const isAuthorFollowed = isEntityTracked('author', book.author);
  const isNarratorFollowed = book.narrators.some((n) => isEntityTracked('narrator', n));
  const isSeriesFollowed = book.series ? isEntityTracked('series', book.series.name) : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
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
            backgroundColor: 'var(--md-sys-color-surface)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        >
          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: 'var(--md-sys-color-primary-container)',
                color: 'var(--md-sys-color-on-primary-container)',
              }}
              className="px-2.5 py-0.5 rounded-full text-xs font-bold"
            >
              Audible Release
            </span>
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

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Main Info Row (Cover + Primary Metadata) */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
            <div
              style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
              className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shrink-0 border shadow-md bg-[var(--md-sys-color-surface-container)]"
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-2.5 min-w-0">
              {/* Series Tracker Badge */}
              {book.series && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                  <span
                    style={{
                      backgroundColor: 'var(--md-sys-color-primary-container)',
                      color: 'var(--md-sys-color-on-primary-container)',
                      borderColor: 'var(--md-sys-color-primary)',
                    }}
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>
                      {book.series.name}{' '}
                      {book.series.bookNumber ? `#${book.series.bookNumber}` : ''}
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

              {/* Metadata row */}
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
              className="text-sm leading-relaxed whitespace-pre-line"
            >
              {book.synopsis}
            </p>
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

        {/* Bottom Actions Footer */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="p-3.5 sm:p-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0"
        >
          <div className="flex items-center gap-2">
            {book.audibleUrl && (
              <a
                href={book.audibleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="md-btn-outlined min-h-[42px] px-3.5 text-xs font-bold"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Audible Page</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenMarkRead(book)}
            className="md-btn-fab min-h-[42px] px-5 text-xs font-bold"
          >
            <BookOpen className="h-4 w-4" />
            <span>{book.isRead ? 'Edit Reading Log' : 'Mark as Listened'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
