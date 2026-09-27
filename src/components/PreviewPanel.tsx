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
      <div className="w-full lg:w-72 shrink-0 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Headphones className="h-10 w-10 text-slate-700 mb-2" />
        <p className="text-xs font-semibold text-slate-400">No audiobook selected.</p>
        <p className="text-[11px] text-slate-600 mt-1">Select an item from the list to preview details and cover art.</p>
      </div>
    );
  }

  const days = getDaysUntil(book.releaseDate);
  let dateText = '';
  let dateColor = 'text-slate-400';

  if (days > 0) {
    dateText = `Releases in ${days} day(s)`;
    dateColor = 'text-amber-400 font-bold';
  } else if (days === 0) {
    dateText = 'Released Today!';
    dateColor = 'text-emerald-400 font-bold';
  } else {
    dateText = `Released on ${book.releaseDate}`;
    dateColor = 'text-slate-400';
  }

  const isPlaying = activeAudio.isPlaying && activeAudio.bookId === book.id;
  const seriesText = book.seriesName && book.seriesName !== '—' ? `Series: ${book.seriesName}` : 'Standalone Title';
  const narratorText = book.narrator || book.narrators.join(', ') || '—';

  return (
    <div className="w-full lg:w-72 shrink-0 p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
      
      {/* GroupBox Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Audiobook Preview
          </span>
          <span className="text-[10px] text-amber-400 font-semibold tabular-nums">
            {book.genre}
          </span>
        </div>

        {/* Square Cover Art with audio play button */}
        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
          <img
            src={book.coverUrl}
            alt={book.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />

          <button
            onClick={() => toggleAudioPreview(book.id)}
            title={isPlaying ? 'Stop sample' : 'Play voice sample'}
            className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/80 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer shadow-md"
          >
            {isPlaying ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
          </button>
        </div>

        {/* Title, Series, Author, Date */}
        <div className="mt-3 space-y-1">
          <h3 className="font-display text-sm font-bold text-white line-clamp-2" title={book.title}>
            {book.title}
          </h3>

          <p className="text-xs text-amber-400/90 font-medium truncate">
            {seriesText}
          </p>

          <p className="text-xs text-slate-300">
            By <strong className="text-white">{book.author}</strong>
          </p>

          <p className="text-xs text-slate-400 truncate">
            Voice: <span className="text-slate-200">{narratorText}</span>
          </p>

          <div className="pt-1.5 flex items-center justify-between text-xs">
            <span className={`tabular-nums ${dateColor}`}>{dateText}</span>
            <span className="flex items-center gap-0.5 text-amber-400 font-bold tabular-nums">
              <Star className="h-3 w-3 fill-amber-400" />
              {book.audibleRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Reminders Toggle Row (1w, 1d, Day) */}
        <div className="mt-3 p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px]">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Bell className="h-3 w-3 text-amber-400" /> Reminders:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleReminder(book.id, 'oneWeekBefore')}
              title="1 week before release"
              className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                book.reminders.oneWeekBefore ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              1W
            </button>
            <button
              onClick={() => toggleReminder(book.id, 'oneDayBefore')}
              title="1 day before release"
              className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                book.reminders.oneDayBefore ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              1D
            </button>
            <button
              onClick={() => toggleReminder(book.id, 'dayOfRelease')}
              title="Day of release"
              className={`px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                book.reminders.dayOfRelease ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              DAY
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => toggleField(book.id, 'downloaded')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
              book.downloaded === 'Yes'
                ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <DownloadCloud className="h-3.5 w-3.5" />
            <span>DL: {book.downloaded || 'No'}</span>
          </button>

          <button
            onClick={() => toggleField(book.id, 'listened')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer ${
              book.listened === 'Yes' || book.isRead
                ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Listened: {book.listened === 'Yes' || book.isRead ? 'Yes' : 'No'}</span>
          </button>
        </div>

        {book.url || book.audibleUrl ? (
          <a
            href={book.url || book.audibleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <span>Open on Audible</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>

    </div>
  );
};
