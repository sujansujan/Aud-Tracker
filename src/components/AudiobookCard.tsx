import React from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { getReleaseCountdown } from '../utils/notifications';
import { Star, Bell, BellRing, Play, Square, Check, Headphones, ExternalLink } from 'lucide-react';

interface AudiobookCardProps {
  book: Audiobook;
  viewMode: 'grid' | 'compact_grid' | 'list';
  onSelect: (book: Audiobook) => void;
  onOpenMarkRead: (book: Audiobook) => void;
}

export const AudiobookCard: React.FC<AudiobookCardProps> = ({
  book,
  viewMode,
  onSelect,
  onOpenMarkRead,
}) => {
  const { toggleReminder, activeAudio, toggleAudioPreview, isEntityTracked } = useTracker();
  const countdown = getReleaseCountdown(book.releaseDate);

  const isPlayingThis = activeAudio.isPlaying && activeAudio.bookId === book.id;

  // Check if book matches any followed author, narrator, or series
  const matchesTrackedAuthor = isEntityTracked('author', book.author);
  const matchesTrackedNarrator = book.narrators.some((n) => isEntityTracked('narrator', n));
  const matchesTrackedSeries = book.series ? isEntityTracked('series', book.series.name) : false;
  const isFollowed = matchesTrackedAuthor || matchesTrackedNarrator || matchesTrackedSeries;

  // Countdown urgency badge styling
  const urgencyStyles = {
    today: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse',
    tomorrow: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    week: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    soon: 'bg-slate-800 text-slate-300 border-slate-700',
    future: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
    released: 'bg-slate-800 text-slate-400 border-slate-700/40',
  }[countdown.urgency];

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all duration-200">
        {/* Cover Thumbnail */}
        <div
          onClick={() => onSelect(book)}
          className="relative h-28 w-28 sm:h-24 sm:w-24 shrink-0 rounded-xl overflow-hidden bg-slate-800 cursor-pointer shadow-md"
        >
          <img
            src={book.coverUrl}
            alt={book.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Zero-Broken-Image fallback container
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Audio preview overlay icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleAudioPreview(book.id);
            }}
            aria-label={isPlayingThis ? 'Stop sample' : 'Play sample'}
            className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/75 text-amber-400 backdrop-blur-sm hover:bg-amber-500 hover:text-slate-950 transition"
          >
            {isPlayingThis ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Content & Metadata */}
        <div className="flex-1 min-w-0" onClick={() => onSelect(book)}>
          <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
            <span className={`px-2 py-0.5 rounded-md border text-[11px] font-semibold tabular-nums ${urgencyStyles}`}>
              {countdown.label}
            </span>
            {isFollowed && (
              <span className="text-[11px] text-amber-400 font-medium">
                ★ Tracked Creator
              </span>
            )}
            {book.isRead && (
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <Check className="h-3 w-3" /> Listened
              </span>
            )}
          </div>

          <h3 className="font-display text-base font-bold text-white truncate hover:text-amber-400 transition-colors cursor-pointer">
            {book.title}
          </h3>

          {book.series && (
            <p className="text-xs text-amber-400/90 font-medium truncate mt-0.5">
              {book.series.name} {book.series.bookNumber ? `#${book.series.bookNumber}` : ''}
            </p>
          )}

          <div className="mt-1 text-xs text-slate-300 truncate">
            <span>By <strong className="text-white">{book.author}</strong></span>
            <span className="text-slate-500 mx-1.5">·</span>
            <span>Narrated by <strong className="text-slate-200">{book.narrators.join(', ')}</strong></span>
          </div>

          {/* Unboxed metadata with typographic separators */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-slate-400">
            <span>{book.genre}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold tabular-nums">
              <Star className="h-3 w-3 fill-amber-400" />
              {book.audibleRating.toFixed(1)}
              <span className="text-slate-500 font-normal">({book.ratingCount.toLocaleString()})</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="tabular-nums">Releases {book.releaseDate}</span>
            {book.runtimeHours && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="tabular-nums">~{book.runtimeHours} hrs</span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls & Reminders */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          {/* Reminder Schedule Toggles (1 Week, 1 Day, Day Of) */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 px-1 font-medium">Alerts:</span>
            <button
              onClick={() => toggleReminder(book.id, 'oneWeekBefore')}
              title="Reminder 1 week before release"
              aria-label="Toggle 1-week reminder"
              className={`px-1.5 py-1 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                book.reminders.oneWeekBefore
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              1W
            </button>
            <button
              onClick={() => toggleReminder(book.id, 'oneDayBefore')}
              title="Reminder 1 day before release"
              aria-label="Toggle 1-day reminder"
              className={`px-1.5 py-1 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                book.reminders.oneDayBefore
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              1D
            </button>
            <button
              onClick={() => toggleReminder(book.id, 'dayOfRelease')}
              title="Reminder on release day"
              aria-label="Toggle release day reminder"
              className={`px-1.5 py-1 text-[10px] font-semibold rounded-md transition cursor-pointer ${
                book.reminders.dayOfRelease
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              DAY
            </button>
          </div>

          {/* Quick Mark as Read / Detail */}
          <div className="flex items-center gap-2">
            {!book.isRead ? (
              <button
                onClick={() => onOpenMarkRead(book)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition cursor-pointer"
              >
                Mark Read
              </button>
            ) : (
              <button
                onClick={() => onOpenMarkRead(book)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 transition cursor-pointer"
              >
                {book.userPersonalRating ? `${book.userPersonalRating}★ Logged` : 'Logged'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid and Compact Grid
  const isCompact = viewMode === 'compact_grid';

  return (
    <div className="group relative flex flex-col rounded-2xl bg-slate-900/80 border border-slate-800/90 overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-200">
      
      {/* Cover Image Container */}
      <div
        onClick={() => onSelect(book)}
        className="relative aspect-square w-full bg-slate-800 overflow-hidden cursor-pointer"
      >
        <img
          src={book.coverUrl}
          alt={book.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Fallback pattern in case image fails */}
        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-center">
          <Headphones className="h-10 w-10 text-amber-500/40 mb-2" />
          <span className="text-xs font-bold text-slate-300 line-clamp-2">{book.title}</span>
        </div>

        {/* Floating Urgency Countdown Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-md backdrop-blur-md tabular-nums ${urgencyStyles}`}>
            {countdown.label}
          </span>
        </div>

        {/* Audio Sample Play Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAudioPreview(book.id);
          }}
          aria-label={isPlayingThis ? 'Stop sample' : 'Play audio sample'}
          title={isPlayingThis ? 'Stop sample' : 'Preview voice sample'}
          className={`absolute bottom-2.5 right-2.5 z-10 flex h-9 w-9 items-center justify-center rounded-xl backdrop-blur-md transition shadow-lg cursor-pointer ${
            isPlayingThis
              ? 'bg-amber-500 text-slate-950 scale-105'
              : 'bg-black/75 text-amber-400 hover:bg-amber-500 hover:text-slate-950'
          }`}
        >
          {isPlayingThis ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
        </button>

        {/* Tracked Creator Star Tag */}
        {isFollowed && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/75 text-amber-400 backdrop-blur-sm border border-amber-500/30 text-xs shadow-md" title="From a tracked author, narrator, or series">
              ★
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-3.5">
        
        {/* Series label if exists */}
        {book.series ? (
          <p className="text-[11px] font-semibold text-amber-400/90 truncate mb-1">
            {book.series.name} {book.series.bookNumber ? `#${book.series.bookNumber}` : ''}
          </p>
        ) : (
          <p className="text-[11px] font-medium text-slate-500 truncate mb-1">
            Standalone Release
          </p>
        )}

        {/* Book Title */}
        <h3
          onClick={() => onSelect(book)}
          className="font-display text-sm font-bold text-white line-clamp-1 hover:text-amber-400 transition-colors cursor-pointer"
          title={book.title}
        >
          {book.title}
        </h3>

        {/* Author & Narrators */}
        <div className="mt-1 text-xs text-slate-300">
          <p className="truncate">
            By <span className="font-semibold text-white">{book.author}</span>
          </p>
          <p className="truncate text-slate-400 text-[11px] mt-0.5">
            Voice: <span className="text-slate-300">{book.narrators.join(', ')}</span>
          </p>
        </div>

        {/* Unboxed Metadata (Zero-pill discipline) */}
        {!isCompact && (
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-400">
            <span>{book.genre}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-0.5 text-amber-400 font-semibold tabular-nums">
              <Star className="h-3 w-3 fill-amber-400" />
              {book.audibleRating.toFixed(1)}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="tabular-nums">{book.releaseDate.slice(5)}</span>
          </div>
        )}

        {/* Card Footer: Reminders & Read Status */}
        <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
          {/* Reminders Toggle Bar (1w, 1d, Day) */}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleReminder(book.id, 'oneWeekBefore');
              }}
              title="Remind 1 week before"
              aria-label="Toggle 1-week notification"
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition cursor-pointer ${
                book.reminders.oneWeekBefore
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              1W
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleReminder(book.id, 'oneDayBefore');
              }}
              title="Remind 1 day before"
              aria-label="Toggle 1-day notification"
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition cursor-pointer ${
                book.reminders.oneDayBefore
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              1D
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleReminder(book.id, 'dayOfRelease');
              }}
              title="Remind day of release"
              aria-label="Toggle release day notification"
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition cursor-pointer ${
                book.reminders.dayOfRelease
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              DAY
            </button>
          </div>

          {/* Read Status Button */}
          {book.isRead ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenMarkRead(book);
              }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900 cursor-pointer"
            >
              <Check className="h-3 w-3" />
              <span>Read</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenMarkRead(book);
              }}
              className="px-2 py-1 text-[10px] font-medium rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              + Log Read
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
