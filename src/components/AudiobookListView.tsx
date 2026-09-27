import React, { useState } from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { getDaysUntil } from '../utils/notifications';
import { ExternalLink, Star, Check, MoreVertical } from 'lucide-react';

interface AudiobookListViewProps {
  books: Audiobook[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AudiobookListView: React.FC<AudiobookListViewProps> = ({
  books,
  selectedIds,
  setSelectedIds,
}) => {
  const {
    selectedBookId,
    setSelectedBookId,
    toggleField,
    quickMuteSeries,
    quickAddWatchlist,
    deleteBook,
  } = useTracker();

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    book: Audiobook;
  } | null>(null);

  const handleRowClick = (bookId: string, e: React.MouseEvent) => {
    setSelectedBookId(bookId);
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) =>
        prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
      );
    } else {
      setSelectedIds([bookId]);
    }
  };

  const handleRowDoubleClick = (book: Audiobook) => {
    const url = book.url || book.audibleUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, book: Audiobook) => {
    e.preventDefault();
    setSelectedBookId(book.id);
    setSelectedIds([book.id]);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      book,
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(books.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Close context menu on global click
  React.useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  return (
    <div className="relative flex-1 overflow-x-auto overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl">
      <table className="w-full text-left text-xs text-slate-300 border-collapse select-none">
        <thead className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="p-2.5 w-8 text-center">
              <input
                type="checkbox"
                checked={books.length > 0 && selectedIds.length === books.length}
                onChange={handleSelectAll}
                className="accent-amber-500 rounded cursor-pointer"
              />
            </th>
            <th className="p-2.5 min-w-[200px]">Title</th>
            <th className="p-2.5 min-w-[130px]">Series</th>
            <th className="p-2.5 min-w-[110px]">Author</th>
            <th className="p-2.5 min-w-[120px]">Narrator</th>
            <th className="p-2.5 min-w-[90px] tabular-nums">Release Date</th>
            <th className="p-2.5 min-w-[110px]">Status</th>
            <th className="p-2.5 min-w-[55px] text-center">DL</th>
            <th className="p-2.5 min-w-[65px] text-center">Listened</th>
            <th className="p-2.5 min-w-[50px] text-center">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-sans">
          {books.map((book) => {
            const isSelected = selectedIds.includes(book.id) || selectedBookId === book.id;
            const days = getDaysUntil(book.releaseDate);

            let statusLabel = '';
            let statusColor = '';
            if (days < 0) {
              statusLabel = '🟢 Released';
              statusColor = 'text-slate-400';
            } else if (days === 0) {
              statusLabel = '🔥 Released Today!';
              statusColor = 'text-emerald-400 font-bold';
            } else {
              statusLabel = `⏳ In ${days} day(s)`;
              statusColor = 'text-amber-400 font-semibold';
            }

            const seriesText = book.seriesName || book.series?.name || '—';
            const narratorText = book.narrator || book.narrators.join(', ') || '—';

            return (
              <tr
                key={book.id}
                onClick={(e) => handleRowClick(book.id, e)}
                onDoubleClick={() => handleRowDoubleClick(book)}
                onContextMenu={(e) => handleContextMenu(e, book)}
                className={`transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 text-white font-medium border-l-2 border-l-amber-500'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(book.id)}
                    onChange={() => {
                      setSelectedIds((prev) =>
                        prev.includes(book.id) ? prev.filter((id) => id !== book.id) : [...prev, book.id]
                      );
                    }}
                    className="accent-amber-500 rounded cursor-pointer"
                  />
                </td>

                {/* Title */}
                <td className="p-2.5 font-semibold text-slate-100 max-w-xs truncate" title={book.title}>
                  {book.title}
                </td>

                {/* Series */}
                <td className="p-2.5 text-amber-400/90 max-w-[140px] truncate" title={seriesText}>
                  {seriesText}
                </td>

                {/* Author */}
                <td className="p-2.5 text-slate-200 max-w-[120px] truncate" title={book.author}>
                  {book.author}
                </td>

                {/* Narrator */}
                <td className="p-2.5 text-slate-300 max-w-[130px] truncate" title={narratorText}>
                  {narratorText}
                </td>

                {/* Release Date */}
                <td className="p-2.5 tabular-nums text-slate-400 whitespace-nowrap">
                  {book.releaseDate}
                </td>

                {/* Status */}
                <td className={`p-2.5 whitespace-nowrap ${statusColor}`}>
                  {statusLabel}
                </td>

                {/* Downloaded Toggle */}
                <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleField(book.id, 'downloaded')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      book.downloaded === 'Yes'
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                        : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                    }`}
                  >
                    {book.downloaded || 'No'}
                  </button>
                </td>

                {/* Listened Toggle */}
                <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleField(book.id, 'listened')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      book.listened === 'Yes' || book.isRead
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                        : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                    }`}
                  >
                    {book.listened === 'Yes' || book.isRead ? 'Yes' : 'No'}
                  </button>
                </td>

                {/* Link */}
                <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                  {book.url || book.audibleUrl ? (
                    <a
                      href={book.url || book.audibleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on Audible"
                      className="inline-flex p-1 text-slate-400 hover:text-amber-400 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {books.length === 0 && (
        <div className="p-12 text-center text-xs text-slate-500">
          No audiobooks match current filters. Use "➕ Add Book" or "📋 Watchlist" to import releases.
        </div>
      )}

      {/* AHK Right-Click Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 text-xs text-slate-200 min-w-[240px] space-y-0.5 animate-in fade-in duration-100"
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 200), left: Math.min(contextMenu.x, window.innerWidth - 250) }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.book.seriesName && contextMenu.book.seriesName !== '—' && (
            <button
              onClick={() => {
                quickMuteSeries(contextMenu.book.seriesName!);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            >
              🔇 Mute this Series ('{contextMenu.book.seriesName}')
            </button>
          )}

          {contextMenu.book.author && contextMenu.book.author !== 'Unknown Author' && (
            <button
              onClick={() => {
                quickAddWatchlist('Author', contextMenu.book.author, contextMenu.book.authorUrl);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            >
              ➕ Add Author to Watchlist ('{contextMenu.book.author}')
            </button>
          )}

          {contextMenu.book.seriesName && contextMenu.book.seriesName !== '—' && (
            <button
              onClick={() => {
                quickAddWatchlist('Series', contextMenu.book.seriesName!, contextMenu.book.seriesUrl);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            >
              ➕ Add Series to Watchlist ('{contextMenu.book.seriesName}')
            </button>
          )}

          {contextMenu.book.narrator && contextMenu.book.narrator !== '—' && (
            <button
              onClick={() => {
                quickAddWatchlist('Narrator', contextMenu.book.narrator!.split(',')[0].trim());
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition cursor-pointer"
            >
              ➕ Add Narrator to Watchlist ('{contextMenu.book.narrator.split(',')[0].trim()}')
            </button>
          )}

          <div className="h-px bg-slate-800 my-1" />

          <button
            onClick={() => {
              const url = contextMenu.book.url || contextMenu.book.audibleUrl;
              if (url) window.open(url, '_blank', 'noopener,noreferrer');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 text-slate-200 transition cursor-pointer"
          >
            🌐 Open in Browser
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Delete "${contextMenu.book.title}"?`)) {
                deleteBook(contextMenu.book.id);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-rose-950/60 text-rose-300 transition cursor-pointer"
          >
            ❌ Delete Book
          </button>
        </div>
      )}
    </div>
  );
};
