import React from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { getReleaseCountdown, getScheduledAlertDates } from '../utils/notifications';
import { X, Star, Calendar, Clock, Bell, Headphones, Play, Square, ExternalLink, CheckCircle, Plus } from 'lucide-react';

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
  const { toggleReminder, activeAudio, toggleAudioPreview, addTrackedEntity, isEntityTracked } = useTracker();

  if (!book) return null;

  const countdown = getReleaseCountdown(book.releaseDate);
  const alertDates = getScheduledAlertDates(book.releaseDate);
  const isPlaying = activeAudio.isPlaying && activeAudio.bookId === book.id;

  const isAuthorFollowed = isEntityTracked('author', book.author);
  const isNarratorFollowed = book.narrators.some((n) => isEntityTracked('narrator', n));
  const isSeriesFollowed = book.series ? isEntityTracked('series', book.series.name) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400">Audiobook Release Dossier</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 tabular-nums">ID: {book.id}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Top section: Cover & Primary Details */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            
            {/* Cover art with sample preview button */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 mx-auto sm:mx-0 rounded-2xl overflow-hidden bg-slate-800 shadow-xl border border-slate-700/60">
              <img
                src={book.coverUrl}
                alt={book.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => toggleAudioPreview(book.id)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 text-white transition group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg group-hover:scale-110 transition">
                  {isPlaying ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                </div>
              </button>
            </div>

            {/* Info Column */}
            <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
              {book.series && (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-semibold text-amber-400">
                    {book.series.name} {book.series.bookNumber ? `#${book.series.bookNumber}` : ''}
                  </span>
                  {!isSeriesFollowed && (
                    <button
                      onClick={() => addTrackedEntity({ type: 'series', name: book.series!.name, notes: 'Followed series' })}
                      className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Track Series
                    </button>
                  )}
                </div>
              )}

              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                {book.title}
              </h2>

              <div className="space-y-1 text-sm text-slate-300">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span>Author: <strong className="text-white">{book.author}</strong></span>
                  {!isAuthorFollowed && (
                    <button
                      onClick={() => addTrackedEntity({ type: 'author', name: book.author, notes: 'Followed author' })}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Follow
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span>Narrated by: <strong className="text-slate-100">{book.narrators.join(', ')}</strong></span>
                  {!isNarratorFollowed && (
                    <button
                      onClick={() => addTrackedEntity({ type: 'narrator', name: book.narrators[0], notes: 'Followed narrator' })}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Follow Voice
                    </button>
                  )}
                </div>
              </div>

              {/* Unboxed metadata */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs text-slate-400">
                <span>{book.genre}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {book.audibleRating.toFixed(1)}
                  <span className="text-slate-500 font-normal">({book.ratingCount.toLocaleString()} reviews)</span>
                </span>
                {book.runtimeHours && (
                  <>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="tabular-nums">Duration: ~{book.runtimeHours} hrs</span>
                  </>
                )}
              </div>

              {/* Release date countdown banner */}
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 tabular-nums">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  Release Date: {book.releaseDate} ({countdown.label})
                </span>
              </div>
            </div>

          </div>

          {/* Narration audio sample player preview bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Audio Narration Sample</span>
              </div>
              <button
                onClick={() => toggleAudioPreview(book.id)}
                className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                {isPlaying ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                <span>{isPlaying ? 'Pause Sample' : 'Play Sample'}</span>
              </button>
            </div>
            {/* Audio waveform / progress bar */}
            <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100"
                style={{ width: `${isPlaying ? activeAudio.progress * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Sample voice demo synthesized for {book.narrators.join(' & ')}
            </p>
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Audiobook Synopsis
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {book.synopsis}
            </p>
          </div>

          {/* Release Reminders Configuration Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Push Reminders Schedule
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">Scheduled triggers</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* 1 Week Before */}
              <div
                onClick={() => toggleReminder(book.id, 'oneWeekBefore')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  book.reminders.oneWeekBefore
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">1 Week Before</span>
                  <input
                    type="checkbox"
                    checked={book.reminders.oneWeekBefore}
                    readOnly
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 tabular-nums">
                  Alarm: {alertDates.oneWeekBefore}
                </p>
              </div>

              {/* 1 Day Before */}
              <div
                onClick={() => toggleReminder(book.id, 'oneDayBefore')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  book.reminders.oneDayBefore
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">1 Day Before</span>
                  <input
                    type="checkbox"
                    checked={book.reminders.oneDayBefore}
                    readOnly
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 tabular-nums">
                  Alarm: {alertDates.oneDayBefore}
                </p>
              </div>

              {/* Day of Release */}
              <div
                onClick={() => toggleReminder(book.id, 'dayOfRelease')}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  book.reminders.dayOfRelease
                    ? 'bg-amber-500/10 border-amber-500/40 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">Day of Release</span>
                  <input
                    type="checkbox"
                    checked={book.reminders.dayOfRelease}
                    readOnly
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 tabular-nums">
                  Alarm: {alertDates.dayOfRelease}
                </p>
              </div>

            </div>
          </div>

          {/* Reading Log Status */}
          {book.isRead && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <CheckCircle className="h-4 w-4" /> Finished & Logged in Library
                </span>
                <span className="text-xs text-amber-400 font-bold">
                  {book.userPersonalRating ? `${book.userPersonalRating} / 5 Stars` : ''}
                </span>
              </div>
              {book.readCompletedAt && (
                <p className="text-xs text-slate-400 tabular-nums">
                  Completed on {new Date(book.readCompletedAt).toLocaleString()} · Logged duration: {book.listeningDurationHours || book.runtimeHours} hrs
                </p>
              )}
              {book.userNotes && (
                <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  "{book.userNotes}"
                </p>
              )}
            </div>
          )}

        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-slate-800 bg-slate-950/90 shrink-0">
          {book.audibleUrl ? (
            <a
              href={book.audibleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition"
            >
              <span>Audible Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenMarkRead(book);
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition"
            >
              {book.isRead ? 'Edit Reading Log' : 'Tag as Read / Logged'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
