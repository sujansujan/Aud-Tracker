import React from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { getDaysUntil } from '../utils/notifications';
import { Headphones, Play, Square, ExternalLink, DownloadCloud, CheckCircle, Bell, Star } from 'lucide-react';

interface PreviewPanelProps {
  book: Audiobook | null;
  onOpenMarkRead?: (book: Audiobook) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ book, onOpenMarkRead }) => {
  const { toggleField, toggleAudioPreview, activeAudio, toggleReminder } = useTracker();

  if (!book) {
    return (
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="w-full lg:w-76 shrink-0 p-5 rounded-3xl border text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm transition-colors duration-200"
      >
        <div
          style={{ backgroundColor: 'var(--md-sys-color-surface-container)' }}
          className="h-12 w-12 rounded-full flex items-center justify-center mb-3 shadow-inner"
        >
          <Headphones className="h-6 w-6" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
        </div>
        <p className="text-xs font-bold">No audiobook selected</p>
        <p
          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          className="text-[11px] mt-1 max-w-[200px]"
        >
          Select any audiobook from the catalog to view high-res artwork, sample player, and quick controls.
        </p>
      </div>
    );
  }

  const days = getDaysUntil(book.releaseDate);
  let dateText = '';
  let dateColor = 'var(--md-sys-color-on-surface-variant)';

  if (days > 0) {
    dateText = `Releases in ${days} day(s)`;
    dateColor = 'var(--md-sys-color-accent-orange)';
  } else if (days === 0) {
    dateText = 'Released Today!';
    dateColor = 'var(--md-sys-color-accent-green)';
  } else {
    dateText = `Released on ${book.releaseDate}`;
    dateColor = 'var(--md-sys-color-on-surface-variant)';
  }

  const isPlaying = activeAudio.isPlaying && activeAudio.bookId === book.id;
  const seriesText = book.seriesName && book.seriesName !== '—' ? `Series: ${book.seriesName}` : 'Standalone Title';
  const narratorText = book.narrator || book.narrators.join(', ') || '—';

  return (
    <div
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-outline-variant)',
      }}
      className="w-full lg:w-76 shrink-0 p-4 sm:p-5 rounded-3xl border flex flex-col justify-between space-y-4 shadow-sm transition-colors duration-200"
    >
      <div>
        {/* Header */}
        <div
          style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
          className="flex items-center justify-between pb-3 border-b mb-3.5"
        >
          <span
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-[11px] font-extrabold uppercase tracking-wider"
          >
            Audiobook Preview
          </span>
          <span
            style={{
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
            }}
            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
          >
            {book.genre}
          </span>
        </div>

        {/* Square Cover Art with audio play button */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-md group">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          <button
            onClick={() => toggleAudioPreview(book.id)}
            title={isPlaying ? 'Stop sample' : 'Play voice sample'}
            style={{
              backgroundColor: isPlaying ? 'var(--md-sys-color-accent-pink)' : 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
            }}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-2xl shadow-lg transition-transform active:scale-90 cursor-pointer"
          >
            {isPlaying ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Title, Series, Author, Date */}
        <div className="mt-3.5 space-y-1.5">
          <h3 className="font-display text-base font-bold line-clamp-2" title={book.title}>
            {book.title}
          </h3>

          <p
            style={{ color: 'var(--md-sys-color-secondary)' }}
            className="text-xs font-semibold truncate"
          >
            {seriesText}
          </p>

          <p
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs"
          >
            By <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>{book.author}</strong>
          </p>

          <p
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs truncate"
          >
            Voice: <span>{narratorText}</span>
          </p>

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="tabular-nums font-bold" style={{ color: dateColor }}>
              {dateText}
            </span>
            <span
              style={{ color: 'var(--md-sys-color-accent-yellow)' }}
              className="flex items-center gap-1 font-bold tabular-nums"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{book.audibleRating.toFixed(1)}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
        <div className="grid grid-cols-2 gap-2">
          {/* Downloaded Toggle */}
          <button
            onClick={() => toggleField(book.id, 'downloaded')}
            style={{
              backgroundColor:
                book.downloaded === 'Yes'
                  ? 'var(--md-sys-color-accent-green-container)'
                  : 'var(--md-sys-color-surface-container)',
              color:
                book.downloaded === 'Yes'
                  ? 'var(--md-sys-color-accent-green)'
                  : 'var(--md-sys-color-on-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="min-h-[42px] px-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
          >
            <DownloadCloud className="h-4 w-4" />
            <span>{book.downloaded === 'Yes' ? 'DL: Yes' : 'DL: No'}</span>
          </button>

          {/* Listened Toggle */}
          <button
            onClick={() => toggleField(book.id, 'listened')}
            style={{
              backgroundColor:
                book.listened === 'Yes' || book.isRead
                  ? 'var(--md-sys-color-primary-container)'
                  : 'var(--md-sys-color-surface-container)',
              color:
                book.listened === 'Yes' || book.isRead
                  ? 'var(--md-sys-color-on-primary-container)'
                  : 'var(--md-sys-color-on-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="min-h-[42px] px-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95 shadow-xs"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{book.listened === 'Yes' || book.isRead ? 'Listened' : 'Unread'}</span>
          </button>
        </div>

        {/* Audible Link Button */}
        {(book.url || book.audibleUrl) && (
          <a
            href={book.url || book.audibleUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-primary)',
            }}
            className="w-full min-h-[42px] rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[var(--md-sys-color-surface-container-high)] transition shadow-xs"
          >
            <ExternalLink className="h-4 w-4" />
            <span>View on Audible Store</span>
          </a>
        )}
      </div>
    </div>
  );
};
