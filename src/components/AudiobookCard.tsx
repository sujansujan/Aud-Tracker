import React from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import {
  Calendar,
  Clock,
  DownloadCloud,
  CheckCircle,
  ExternalLink,
  Volume2,
  Sparkles,
  BookOpen,
  User,
  Layers,
  Star,
  Mic,
  Check,
} from 'lucide-react';
import { getReleaseCountdown, formatReleaseDateFriendly } from '../utils/notifications';

interface AudiobookCardProps {
  book: Audiobook;
  viewMode: 'grid' | 'compact_grid' | 'list';
  onSelect: (book: Audiobook) => void;
  onOpenMarkRead: (book: Audiobook) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export const AudiobookCard: React.FC<AudiobookCardProps> = ({
  book,
  viewMode,
  onSelect,
  onOpenMarkRead,
  isSelected = false,
  onToggleSelect,
}) => {
  const { toggleReminder, activeAudio, toggleAudioPreview, isEntityTracked } = useTracker();
  const countdown = getReleaseCountdown(book.releaseDate);

  const isAuthorTracked = isEntityTracked('author', book.author);
  const isSeriesTracked = book.series ? isEntityTracked('series', book.series.name) : false;

  const isPlayingCurrent = activeAudio.isPlaying && activeAudio.bookId === book.id;

  // Release status badge style (Material 3 pill)
  const getBadgeStyle = () => {
    if (countdown.isToday) {
      return {
        bg: 'var(--md-sys-color-accent-green)',
        text: '#ffffff',
        border: 'transparent',
      };
    }
    if (countdown.daysUntil <= 7 && countdown.daysUntil > 0) {
      return {
        bg: 'var(--md-sys-color-accent-orange)',
        text: '#ffffff',
        border: 'transparent',
      };
    }
    if (countdown.daysUntil > 0) {
      return {
        bg: 'var(--md-sys-color-primary-container)',
        text: 'var(--md-sys-color-on-primary-container)',
        border: 'var(--md-sys-color-primary)',
      };
    }
    return {
      bg: 'var(--md-sys-color-surface-container)',
      text: 'var(--md-sys-color-on-surface-variant)',
      border: 'var(--md-sys-color-outline-variant)',
    };
  };

  const badgeStyle = getBadgeStyle();

  // -------------------------------------------------------------
  // LIST VIEW (Expanded Card Row)
  // -------------------------------------------------------------
  if (viewMode === 'list') {
    return (
      <div
        style={{
          backgroundColor: isSelected
            ? 'var(--md-sys-color-primary-container)'
            : 'var(--md-sys-color-surface)',
          borderColor: isSelected
            ? 'var(--md-sys-color-primary)'
            : 'var(--md-sys-color-outline-variant)',
        }}
        className={`group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md ${
          isSelected ? 'ring-2 ring-[var(--md-sys-color-primary)]' : ''
        }`}
      >
        {/* Selection Checkbox */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(book.id);
            }}
            style={{
              backgroundColor: isSelected
                ? 'var(--md-sys-color-primary)'
                : 'var(--md-sys-color-surface-container)',
              borderColor: isSelected
                ? 'var(--md-sys-color-primary)'
                : 'var(--md-sys-color-outline-variant)',
              color: isSelected
                ? 'var(--md-sys-color-on-primary)'
                : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl border transition-transform active:scale-95 cursor-pointer shrink-0 shadow-sm"
            aria-label={isSelected ? 'Deselect book' : 'Select book'}
          >
            <Check className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}

        {/* Cover Thumbnail with Audio Sample Play Button */}
        <div
          onClick={() => onSelect(book)}
          className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden shrink-0 cursor-pointer shadow-md group/cover"
        >
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
            loading="lazy"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAudioPreview(book.id);
            }}
            style={{
              backgroundColor: isPlayingCurrent ? 'var(--md-sys-color-accent-pink)' : 'rgba(40, 42, 54, 0.75)',
              color: '#ffffff',
            }}
            className="absolute inset-0 m-auto h-11 w-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all group-hover/cover:scale-110 active:scale-95 cursor-pointer"
            title="Preview Audio Sample"
          >
            <Volume2 className={`h-5 w-5 ${isPlayingCurrent ? 'animate-bounce' : ''}`} />
          </button>
        </div>

        {/* Details Column */}
        <div className="flex-1 min-w-0 space-y-1.5 cursor-pointer" onClick={() => onSelect(book)}>
          <div className="flex flex-wrap items-center gap-2">
            <span
              style={{
                backgroundColor: badgeStyle.bg,
                color: badgeStyle.text,
                borderColor: badgeStyle.border,
              }}
              className="px-3 py-1 rounded-full text-xs font-bold border shadow-xs"
            >
              {countdown.badgeText}
            </span>
            <span
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            >
              {book.genre}
            </span>
          </div>

          <h3 className="font-display font-bold text-base sm:text-lg tracking-tight truncate">
            {book.title}
          </h3>

          <div
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
          >
            <span className="flex items-center gap-1 font-semibold">
              <User className="h-3.5 w-3.5" style={{ color: 'var(--md-sys-color-primary)' }} />
              <span>{book.author}</span>
            </span>
            {(book.seriesName || book.series?.name) && (
              <span className="flex items-center gap-1 font-medium">
                <Layers className="h-3.5 w-3.5" style={{ color: 'var(--md-sys-color-secondary)' }} />
                <span>
                  {book.seriesName || book.series?.name}{' '}
                  {book.series?.bookNumber ? `#${book.series.bookNumber}` : ''}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Mic className="h-3.5 w-3.5 opacity-70" />
              <span>{book.narrator || book.narrators.join(', ')}</span>
            </span>
          </div>

          <p
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs line-clamp-2 leading-relaxed opacity-90"
          >
            {book.synopsis}
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--md-sys-color-outline-variant)]">
          <div className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--md-sys-color-accent-yellow)' }}>
            <Star className="h-4 w-4 fill-current" />
            <span>{book.audibleRating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {book.downloaded === 'Yes' && (
              <span
                style={{
                  backgroundColor: 'var(--md-sys-color-accent-green-container)',
                  color: 'var(--md-sys-color-accent-green)',
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
              >
                <DownloadCloud className="h-3.5 w-3.5" />
                <span>Downloaded</span>
              </span>
            )}
            {book.listened === 'Yes' && (
              <span
                style={{
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Listened</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GRID & COMPACT GRID VIEW (Material 3 Elevated Card)
  // -------------------------------------------------------------
  const isCompact = viewMode === 'compact_grid';

  return (
    <div
      style={{
        backgroundColor: isSelected
          ? 'var(--md-sys-color-primary-container)'
          : 'var(--md-sys-color-surface)',
        borderColor: isSelected
          ? 'var(--md-sys-color-primary)'
          : 'var(--md-sys-color-outline-variant)',
      }}
      className={`group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md ${
        isSelected ? 'ring-2 ring-[var(--md-sys-color-primary)]' : ''
      }`}
    >
      {/* Cover Image Container */}
      <div
        onClick={() => onSelect(book)}
        className={`relative w-full ${isCompact ? 'aspect-[3/4]' : 'aspect-square'} overflow-hidden cursor-pointer bg-[var(--md-sys-color-surface-container)]`}
      >
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Selection Checkbox */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(book.id);
            }}
            style={{
              backgroundColor: isSelected
                ? 'var(--md-sys-color-primary)'
                : 'rgba(33, 34, 44, 0.75)',
              borderColor: isSelected
                ? 'var(--md-sys-color-primary)'
                : 'rgba(255, 255, 255, 0.3)',
              color: isSelected
                ? 'var(--md-sys-color-on-primary)'
                : '#ffffff',
            }}
            className="absolute top-3 right-3 z-20 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-2xl border shadow-lg backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
            aria-label={isSelected ? 'Deselect book' : 'Select book'}
          >
            <Check className="h-5 w-5 stroke-[2.5]" />
          </button>
        )}

        {/* Urgency Countdown Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span
            style={{
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.text,
              borderColor: badgeStyle.border,
            }}
            className="px-3 py-1 rounded-full border text-xs font-extrabold shadow-md backdrop-blur-md tabular-nums"
          >
            {countdown.badgeText}
          </span>
        </div>

        {/* Play Audio Sample Preview Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleAudioPreview(book.id);
          }}
          style={{
            backgroundColor: isPlayingCurrent ? 'var(--md-sys-color-accent-pink)' : 'rgba(33, 34, 44, 0.8)',
            color: '#ffffff',
          }}
          className="absolute bottom-3 right-3 z-10 h-10 w-10 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all group-hover:scale-110 active:scale-95 cursor-pointer"
          title="Play audio preview"
        >
          <Volume2 className={`h-4 w-4 ${isPlayingCurrent ? 'animate-bounce' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div
        className={`flex-1 p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer space-y-2`}
        onClick={() => onSelect(book)}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span
              style={{ color: 'var(--md-sys-color-primary)' }}
              className="font-bold uppercase tracking-wider truncate"
            >
              {book.genre}
            </span>
            <div className="flex items-center gap-1 font-bold" style={{ color: 'var(--md-sys-color-accent-yellow)' }}>
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{book.audibleRating.toFixed(1)}</span>
            </div>
          </div>

          <h4 className="font-display font-bold text-sm sm:text-base leading-snug line-clamp-2">
            {book.title}
          </h4>

          <p
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs font-semibold truncate"
          >
            {book.author}
          </p>

          {(book.seriesName || book.series?.name) && !isCompact && (
            <p
              style={{ color: 'var(--md-sys-color-secondary)' }}
              className="text-[11px] font-medium truncate flex items-center gap-1"
            >
              <Layers className="h-3 w-3 shrink-0" />
              <span>
                {book.seriesName || book.series?.name}{' '}
                {book.series?.bookNumber ? `#${book.series.bookNumber}` : ''}
              </span>
            </p>
          )}
        </div>

        {/* Card Footer: Status Badges */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)] text-[11px]">
          <span
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="truncate flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" />
            <span>{formatReleaseDateFriendly(book.releaseDate)}</span>
          </span>

          <div className="flex items-center gap-1 shrink-0">
            {book.downloaded === 'Yes' && (
              <span
                style={{
                  backgroundColor: 'var(--md-sys-color-accent-green-container)',
                  color: 'var(--md-sys-color-accent-green)',
                }}
                className="px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-0.5"
                title="Downloaded"
              >
                <DownloadCloud className="h-3 w-3" />
              </span>
            )}
            {book.listened === 'Yes' && (
              <span
                style={{
                  backgroundColor: 'var(--md-sys-color-primary-container)',
                  color: 'var(--md-sys-color-on-primary-container)',
                }}
                className="px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-0.5"
                title="Listened"
              >
                <CheckCircle className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
