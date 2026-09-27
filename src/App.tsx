import React, { useState } from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { ActionToolbar } from './components/ActionToolbar';
import { AudiobookListView } from './components/AudiobookListView';
import { PreviewPanel } from './components/PreviewPanel';
import { StatusBar } from './components/StatusBar';
import { AddBookDialog } from './components/AddBookDialog';
import { WatchlistDialog } from './components/WatchlistDialog';
import { MuteListDialog } from './components/MuteListDialog';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { AudiobookCard } from './components/AudiobookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { MarkAsReadModal } from './components/MarkAsReadModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Audiobook } from './types/audiobook';
import { getDaysUntil } from './utils/notifications';
import { Headphones, Eye, ListFilter } from 'lucide-react';

function TrackerMain() {
  const {
    books,
    selectedBook,
    searchQuery,
    selectedGenre,
    minRating,
    viewFilter,
  } = useTracker();

  // Dialog visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isMuteListOpen, setIsMuteListOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Audiobook | null>(null);
  const [selectedBookForMarkRead, setSelectedBookForMarkRead] = useState<Audiobook | null>(null);

  // Table selection & layout
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Filter & Sort (matching AHK SortBookList)
  const filteredBooks = books
    .filter((book) => {
      // 1. Status View Filter
      const days = getDaysUntil(book.releaseDate);
      if (viewFilter === 'upcoming' && days < 0) return false;
      if (viewFilter === 'today' && days !== 0) return false;
      if (viewFilter === 'downloaded' && book.downloaded !== 'Yes') return false;
      if (viewFilter === 'listened' && book.listened !== 'Yes' && !book.isRead) return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = book.title.toLowerCase().includes(q);
        const matchAuthor = book.author.toLowerCase().includes(q);
        const matchSeries = (book.seriesName || book.series?.name || '').toLowerCase().includes(q);
        const matchNarrator = (book.narrator || book.narrators.join(', ')).toLowerCase().includes(q);
        const matchGenre = book.genre.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchSeries && !matchNarrator && !matchGenre) {
          return false;
        }
      }

      // 3. Genre Filter
      if (selectedGenre !== 'All' && book.genre !== selectedGenre) return false;

      // 4. Rating Filter
      if (minRating > 0 && book.audibleRating < minRating) return false;

      return true;
    })
    .sort((a, b) => {
      const daysA = getDaysUntil(a.releaseDate);
      const daysB = getDaysUntil(b.releaseDate);
      const isUpA = daysA >= 0;
      const isUpB = daysB >= 0;

      // Upcoming releases first, sorted by soonest
      if (isUpA && !isUpB) return -1;
      if (!isUpA && isUpB) return 1;
      if (isUpA && isUpB) return daysA - daysB;
      // Past releases sorted newest first
      return daysB - daysA;
    });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased">
      
      {/* App Window Header */}
      <header className="h-10 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500 text-slate-950">
            <Headphones className="h-3 w-3" />
          </div>
          <h1 className="font-display text-xs font-bold text-white tracking-wide">
            Audible Auto-Tracker &amp; Watchlist Monitor
          </h1>
        </div>

        {/* Header Right actions */}
        <div className="flex items-center gap-1.5">
          <PWAInstallButton compact />

          <button
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className={`lg:hidden flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition ${
              showMobilePreview ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Preview</span>
          </button>
        </div>
      </header>

      {/* Action Toolbar (AHK Button Row + Filters) */}
      <ActionToolbar
        onOpenAddDialog={() => setIsAddOpen(true)}
        onOpenWatchlistDialog={() => setIsWatchlistOpen(true)}
        onOpenMuteListDialog={() => setIsMuteListOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedIds={selectedIds}
      />

      {/* Main Workspace (ListView + Audiobook Preview Panel) */}
      <main className="flex-1 flex flex-col lg:flex-row p-3 gap-3 overflow-hidden">
        
        {/* Left Side: Table View or Cover Card Grid */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {viewMode === 'table' ? (
            <AudiobookListView
              books={filteredBooks}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          ) : (
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 p-1">
              {filteredBooks.map((book) => (
                <AudiobookCard
                  key={book.id}
                  book={book}
                  viewMode="compact_grid"
                  onSelect={(b) => setSelectedBookForDetail(b)}
                  onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Audiobook Preview Panel */}
        <div className={`${showMobilePreview ? 'block' : 'hidden'} lg:block`}>
          <PreviewPanel
            book={selectedBook}
            onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
          />
        </div>

      </main>

      {/* Status Bar (matching AHK SB.SetText) */}
      <StatusBar onOpenNotifications={() => setIsNotifOpen(true)} />

      {/* Modals directly matching AHK GUI dialogs */}
      <AddBookDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <WatchlistDialog
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
      />

      <MuteListDialog
        isOpen={isMuteListOpen}
        onClose={() => setIsMuteListOpen(false)}
      />

      {/* Detail & History modal for quick editing */}
      <BookDetailModal
        book={selectedBookForDetail}
        onClose={() => setSelectedBookForDetail(null)}
        onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
      />

      <MarkAsReadModal
        book={selectedBookForMarkRead}
        onClose={() => setSelectedBookForMarkRead(null)}
      />

      <NotificationCenterModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <OfflineIndicator />

    </div>
  );
}

export default function App() {
  return (
    <TrackerProvider>
      <TrackerMain />
    </TrackerProvider>
  );
}
