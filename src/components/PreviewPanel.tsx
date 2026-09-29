import React from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { getDaysUntil } from '../utils/notifications';
import { Headphones, ExternalLink, DownloadCloud, CheckCircle, Star } from 'lucide-react';

interface PreviewPanelProps {
  book: Audiobook | null;
  onOpenMarkRead?: (book: Audiobook) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ book, onOpenMarkRead }) => {
  const { toggleField } = useTracker();

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
          Select any audiobook from the catalog to view details and controls.
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
            Audiobook Details
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

        {/* Artwork */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-md mb-3.5 bg-[var(--md-sys-color-surface-container)]">
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-display text-sm font-bold leading-snug line-clamp-2">
            {book.title}
          </h3>
          <p
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs font-semibold"
          >
            By {book.author}
          </p>
          <p
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-[11px] truncate opacity-85"
          >
            Voice: {narratorText}
          </p>
          <p
            style={{ color: 'var(--md-sys-color-primary)' }}
            className="text-[11px] font-medium truncate"
          >
            {seriesText}
          </p>
        </div>

        {/* Rating and Release Date */}
        <div className="pt-2.5 border-t border-[var(--md-sys-color-outline-variant)] mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 font-bold" style={{ color: 'var(--md-sys-color-accent-yellow)' }}>
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{book.audibleRating.toFixed(1)}</span>
            <span
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              className="text-[10px] font-normal"
            >
              ({book.ratingCount.toLocaleString()})
            </span>
          </div>
          <span style={{ color: dateColor }} className="font-bold text-[11px]">
            {dateText}
          </span>
        </div>
      </div>

      {/* Quick Status Actions */}
      <div className="space-y-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => toggleField(book.id, 'downloaded')}
            style={{
              backgroundColor: book.downloaded === 'Yes'
                ? 'var(--md-sys-color-accent-green-container)'
                : 'var(--md-sys-color-surface-container)',
              color: book.downloaded === 'Yes'
                ? 'var(--md-sys-color-accent-green)'
                : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="p-2 rounded-xl border border-[var(--md-sys-color-outline-variant)] font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <DownloadCloud className="h-3.5 w-3.5" />
            <span>{book.downloaded === 'Yes' ? 'Downloaded' : 'Download'}</span>
          </button>

          <button
            onClick={() => toggleField(book.id, 'listened')}
            style={{
              backgroundColor: book.listened === 'Yes'
                ? 'var(--md-sys-color-primary-container)'
                : 'var(--md-sys-color-surface-container)',
              color: book.listened === 'Yes'
                ? 'var(--md-sys-color-on-primary-container)'
                : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="p-2 rounded-xl border border-[var(--md-sys-color-outline-variant)] font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{book.listened === 'Yes' ? 'Listened' : 'Mark Read'}</span>
          </button>
        </div>

        {book.audibleUrl && (
          <a
            href={book.audibleUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--md-sys-color-primary)' }}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-bold p-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View on Audible.com</span>
          </a>
        )}
      </div>
    </div>
  );
};
