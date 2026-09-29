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
    <div
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-outline-variant)',
      }}
      className="relative flex-1 overflow-x-auto overflow-y-auto border rounded-2xl shadow-sm transition-colors duration-200"
    >
      <table className="w-full text-left text-xs border-collapse select-none">
        <thead
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderColor: 'var(--md-sys-color-outline-variant)',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
          className="sticky top-0 z-10 border-b text-[11px] font-extrabold uppercase tracking-wider"
        >
          <tr>
            <th className="p-3 w-10 text-center">
              <input
                type="checkbox"
                checked={books.length > 0 && selectedIds.length === books.length}
                onChange={handleSelectAll}
                className="rounded cursor-pointer accent-[var(--md-sys-color-primary)] h-4 w-4"
              />
            </th>
            <th className="p-3 min-w-[200px]">Title</th>
            <th className="p-3 min-w-[130px]">Series</th>
            <th className="p-3 min-w-[110px]">Author</th>
            <th className="p-3 min-w-[120px]">Narrator</th>
            <th className="p-3 min-w-[100px] tabular-nums">Release Date</th>
            <th className="p-3 min-w-[110px]">Status</th>
            <th className="p-3 min-w-[65px] text-center">DL</th>
            <th className="p-3 min-w-[70px] text-center">Listened</th>
            <th className="p-3 min-w-[50px] text-center">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
          {books.map((book) => {
            const isSelected = selectedIds.includes(book.id) || selectedBookId === book.id;
            const days = getDaysUntil(book.releaseDate);

            let statusLabel = '';
            let statusColor = 'var(--md-sys-color-on-surface-variant)';
            if (days < 0) {
              statusLabel = '🟢 Released';
              statusColor = 'var(--md-sys-color-on-surface-variant)';
            } else if (days === 0) {
              statusLabel = '🔥 Released Today!';
              statusColor = 'var(--md-sys-color-accent-green)';
            } else {
              statusLabel = `⏳ In ${days} day(s)`;
              statusColor = 'var(--md-sys-color-accent-orange)';
            }

            const seriesText = book.seriesName || book.series?.name || '—';
            const narratorText = book.narrator || book.narrators.join(', ') || '—';

            return (
              <tr
                key={book.id}
                onClick={(e) => handleRowClick(book.id, e)}
                onDoubleClick={() => handleRowDoubleClick(book)}
                onContextMenu={(e) => handleContextMenu(e, book)}
                style={{
                  backgroundColor: isSelected
                    ? 'var(--md-sys-color-primary-container)'
                    : undefined,
                  color: isSelected
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface)',
                }}
                className={`transition-colors cursor-pointer hover:bg-[var(--md-sys-color-surface-container-high)] ${
                  isSelected ? 'font-medium border-l-4 border-l-[var(--md-sys-color-primary)]' : ''
                }`}
              >
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(book.id)}
                    onChange={() => {
                      setSelectedIds((prev) =>
                        prev.includes(book.id) ? prev.filter((id) => id !== book.id) : [...prev, book.id]
                      );
                    }}
                    className="rounded cursor-pointer accent-[var(--md-sys-color-primary)] h-4 w-4"
                  />
                </td>

                {/* Title */}
                <td className="p-3 font-bold max-w-xs truncate" title={book.title}>
                  {book.title}
                </td>

                {/* Series */}
                <td
                  style={{ color: 'var(--md-sys-color-secondary)' }}
                  className="p-3 font-semibold max-w-[140px] truncate"
                  title={seriesText}
                >
                  {seriesText}
                </td>

                {/* Author */}
                <td className="p-3 font-medium max-w-[120px] truncate" title={book.author}>
                  {book.author}
                </td>

                {/* Narrator */}
                <td
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="p-3 max-w-[130px] truncate"
                  title={narratorText}
                >
                  {narratorText}
                </td>

                {/* Release Date */}
                <td
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="p-3 tabular-nums whitespace-nowrap"
                >
                  {book.releaseDate}
                </td>

                {/* Status */}
                <td className="p-3 whitespace-nowrap font-bold" style={{ color: statusColor }}>
                  {statusLabel}
                </td>

                {/* Downloaded Toggle */}
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
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
                          : 'var(--md-sys-color-on-surface-variant)',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                    }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer shadow-xs active:scale-95"
                  >
                    {book.downloaded || 'No'}
                  </button>
                </td>

                {/* Listened Toggle */}
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
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
                          : 'var(--md-sys-color-on-surface-variant)',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                    }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer shadow-xs active:scale-95"
                  >
                    {book.listened === 'Yes' || book.isRead ? 'Yes' : 'No'}
                  </button>
                </td>

                {/* Link */}
                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                  {book.url || book.audibleUrl ? (
                    <a
                      href={book.url || book.audibleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on Audible"
                      style={{ color: 'var(--md-sys-color-primary)' }}
                      className="inline-flex p-1.5 rounded-lg hover:bg-[var(--md-sys-color-surface-container-high)] transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <span style={{ color: 'var(--md-sys-color-outline)' }}>—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Context Menu (Right Click) */}
      {contextMenu && (
        <div
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: 'var(--md-sys-color-surface)',
            borderColor: 'var(--md-sys-color-outline)',
            color: 'var(--md-sys-color-on-surface)',
          }}
          className="fixed z-50 w-56 rounded-2xl border shadow-xl p-1.5 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
            className="px-3 py-2 border-b mb-1"
          >
            <p className="font-bold truncate">{contextMenu.book.title}</p>
            <p style={{ color: 'var(--md-sys-color-on-surface-variant)' }} className="text-[10px] truncate">
              {contextMenu.book.author}
            </p>
          </div>

          <button
            onClick={() => {
              toggleField(contextMenu.book.id, 'downloaded');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer"
          >
            Toggle Downloaded ({contextMenu.book.downloaded || 'No'})
          </button>

          <button
            onClick={() => {
              toggleField(contextMenu.book.id, 'listened');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer"
          >
            Toggle Listened ({contextMenu.book.listened || 'No'})
          </button>

          {contextMenu.book.seriesName && contextMenu.book.seriesName !== '—' && (
            <button
              onClick={() => {
                quickMuteSeries(contextMenu.book.seriesName!);
                setContextMenu(null);
              }}
              style={{ color: 'var(--md-sys-color-error)' }}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer"
            >
              Mute Series: {contextMenu.book.seriesName}
            </button>
          )}

          <button
            onClick={() => {
              quickAddWatchlist('Author', contextMenu.book.author);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] transition cursor-pointer"
          >
            Watch Author: {contextMenu.book.author}
          </button>

          <div
            style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }}
            className="h-px my-1"
          />

          <button
            onClick={() => {
              if (window.confirm(`Delete "${contextMenu.book.title}"?`)) {
                deleteBook(contextMenu.book.id);
                setContextMenu(null);
              }
            }}
            style={{ color: 'var(--md-sys-color-error)' }}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--md-sys-color-error-container)] transition cursor-pointer font-bold"
          >
            Delete from Library
          </button>
        </div>
      )}
    </div>
  );
};
