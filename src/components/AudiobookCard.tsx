import React, { useRef } from 'react';
import { Audiobook } from '../types/audiobook';
import { getReleaseCountdown, formatReleaseDateFriendly } from '../utils/notifications';
import {
  Star,
  Calendar,
  Layers,
  DownloadCloud,
  CheckCircle,
} from 'lucide-react';

interface AudiobookCardProps {
  book: Audiobook;
  isSelected?: boolean;
  isSelectionActive?: boolean;
  onToggleSelect?: (id: string) => void;
  onSelect: (book: Audiobook) => void;
  onOpenMarkRead?: (book: Audiobook) => void;
  viewMode?: 'compact_grid' | 'grid' | 'table' | 'list';
}

export const AudiobookCard: React.FC<AudiobookCardProps> = ({
  book,
  isSelected = false,
  isSelectionActive = false,
  onToggleSelect,
  onSelect,
}) => {
  const countdown = getReleaseCountdown(book.releaseDate);

  // Native Android Long-Press Gesture state
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressFiredRef = useRef(false);

  const startPress = (e: React.PointerEvent) => {
    // Only primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    longPressFiredRef.current = false;

    timerRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(45);
        } catch {}
      }
      onToggleSelect?.(book.id);
    }, 420); // 420ms Android standard long-press duration
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If this click resulted from long-press release, do not trigger normal tap
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }

    // In native Android multi-select mode: tap toggles item selection
    if (isSelectionActive) {
      onToggleSelect?.(book.id);
    } else {
      onSelect(book);
    }
  };

  // Release status badge style
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

  return (
    <div
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClick={handleClick}
      onContextMenu={(e) => {
        // Prevent default browser right-click / callout menu to allow smooth long-press on mobile
        e.preventDefault();
      }}
      style={{
        backgroundColor: isSelected
          ? 'var(--md-sys-color-primary-container)'
          : 'var(--md-sys-color-surface)',
        borderColor: isSelected
          ? 'var(--md-sys-color-primary)'
          : 'var(--md-sys-color-outline-variant)',
      }}
      className={`group relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-150 select-none cursor-pointer ${
        isSelected
          ? 'ring-3 ring-[var(--md-sys-color-primary)] shadow-md scale-[0.98]'
          : 'hover:shadow-md active:scale-[0.99]'
      }`}
    >
      {/* Cover Image Container */}
      <div className="relative w-full aspect-square overflow-hidden bg-[var(--md-sys-color-surface-container)]">
        <img
          src={book.coverUrl}
          alt={book.title}
          className={`h-full w-full object-cover transition-transform duration-200 group-hover:scale-105 pointer-events-none ${
            isSelected ? 'opacity-90 brightness-95' : ''
          }`}
          loading="lazy"
          decoding="async"
        />

        {/* Selected Overlay Indicator (Native Android tint without tick button) */}
        {isSelected && (
          <div
            style={{ backgroundColor: 'rgba(123, 63, 228, 0.25)' }}
            className="absolute inset-0 pointer-events-none backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-100"
          >
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="px-3 py-1 rounded-full text-[11px] font-extrabold shadow-lg uppercase tracking-wider"
            >
              Selected
            </div>
          </div>
        )}

        {/* Urgency Countdown Pill */}
        <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
          <span
            style={{
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.text,
              borderColor: badgeStyle.border,
            }}
            className="px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold shadow-md backdrop-blur-md tabular-nums"
          >
            {countdown.badgeText}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 p-3 flex flex-col justify-between space-y-1.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span
              style={{ color: 'var(--md-sys-color-primary)' }}
              className="font-bold uppercase tracking-wider truncate"
            >
              {book.genre}
            </span>
            <div
              className="flex items-center gap-1 font-bold"
              style={{ color: 'var(--md-sys-color-accent-yellow)' }}
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{book.audibleRating.toFixed(1)}</span>
            </div>
          </div>

          <h4 className="font-display font-bold text-xs sm:text-sm leading-snug line-clamp-2">
            {book.title}
          </h4>

          <p
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-[11px] font-semibold truncate"
          >
            {book.author}
          </p>

          {(book.seriesName || book.series?.name) && (
            <p
              style={{ color: 'var(--md-sys-color-secondary)' }}
              className="text-[10px] font-bold truncate flex items-center gap-1"
            >
              <Layers className="h-3 w-3 shrink-0" />
              <span>
                {book.seriesName || book.series?.name}{' '}
                {book.series?.bookNumber ? `#${book.series.bookNumber}` : ''}
              </span>
            </p>
          )}
        </div>

        {/* Card Footer: Release Date & Downloaded/Listened Indicators */}
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
                className="px-1.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-0.5"
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
                className="px-1.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-0.5"
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
