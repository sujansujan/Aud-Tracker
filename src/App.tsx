import React, { useState } from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { HomeFilterBar } from './components/HomeFilterBar';
import { PullToRefresh } from './components/PullToRefresh';
import { AudiobookListView } from './components/AudiobookListView';
import { PreviewPanel } from './components/PreviewPanel';
import { StatusBar } from './components/StatusBar';
import { AddBookDialog } from './components/AddBookDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { AudiobookCard } from './components/AudiobookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { MarkAsReadModal } from './components/MarkAsReadModal';
import { FloatingBatchBar } from './components/FloatingBatchBar';
import { ToastContainer } from './components/ToastContainer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { Audiobook } from './types/audiobook';
import { getDaysUntil } from './utils/notifications';
import { Headphones, Plus, Settings, Eye } from 'lucide-react';

function TrackerMain() {
  const {
    books,
    selectedBook,
    searchQuery,
    selectedGenre,
    minRating,
    viewFilter,
    viewMode,
    setViewMode,
    runScheduledScan,
    isScanning,
  } = useTracker();

  // Dialog visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Audiobook | null>(null);
  const [selectedBookForMarkRead, setSelectedBookForMarkRead] = useState<Audiobook | null>(null);

  // Table selection & layout
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Filter & Sort
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

  const handlePullRefresh = async () => {
    await runScheduledScan(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none antialiased overflow-x-hidden">
      {/* Clean App Header (Home Screen) */}
      <header className="pt-safe pb-2.5 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md">
            <Headphones className="h-4 w-4" />
          </div>
          <div>
            <h1 className="font-display text-xs sm:text-sm font-bold text-white tracking-wide truncate">
              Audible Tracker
            </h1>
          </div>
        </div>

        {/* Home Screen Actions: Plus button & Settings button */}
        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton compact />

          {/* Plus Button to add new items */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            title="Add audiobook, series, author, or narrator"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition cursor-pointer"
            title="Settings & Backup (Export / Import)"
          >
            <Settings className="h-4 w-4 text-amber-400" />
          </button>

          {/* Preview toggle on mobile */}
          <button
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className={`lg:hidden flex items-center gap-1 p-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              showMobilePreview
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 border border-slate-700/80'
            }`}
            title="Toggle preview panel"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Streamlined Home Filter & View Bar */}
      <HomeFilterBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalFilteredCount={filteredBooks.length}
      />

      {/* Main Workspace with Pull-to-Refresh */}
      <main className="flex-1 flex flex-col lg:flex-row p-2.5 sm:p-3 gap-3 overflow-hidden">
        {/* Book View (wrapped with smooth pull-to-refresh) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30">
          <PullToRefresh
            onRefresh={handlePullRefresh}
            isRefreshing={isScanning}
            className="flex-1 h-full"
          >
            {filteredBooks.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <Headphones className="h-10 w-10 text-slate-700 mb-3" />
                <h3 className="text-sm font-bold text-slate-400 mb-1">No audiobooks match your filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Try adjusting your search query, or tap the <span className="text-amber-400 font-semibold">+ Add</span> button above to track new titles, authors, or series.
                </p>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Item</span>
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <AudiobookListView
                books={filteredBooks}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 p-3">
                {filteredBooks.map((book) => (
                  <AudiobookCard
                    key={book.id}
                    book={book}
                    viewMode="grid"
                    onSelect={(b) => setSelectedBookForDetail(b)}
                    onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
                  />
                ))}
              </div>
            ) : viewMode === 'compact_grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 p-2.5">
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
            ) : (
              <div className="space-y-2 p-3">
                {filteredBooks.map((book) => (
                  <AudiobookCard
                    key={book.id}
                    book={book}
                    viewMode="list"
                    onSelect={(b) => setSelectedBookForDetail(b)}
                    onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
                  />
                ))}
              </div>
            )}
          </PullToRefresh>
        </div>

        {/* Right Side: Audiobook Preview Panel */}
        <div className={`${showMobilePreview ? 'block' : 'hidden'} lg:block shrink-0`}>
          <PreviewPanel
            book={selectedBook}
            onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
          />
        </div>
      </main>

      {/* Floating Batch Action Bar (appears only when items are selected) */}
      <FloatingBatchBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      {/* Status Bar */}
      <StatusBar
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenPreferences={() => setIsSettingsOpen(true)}
      />

      {/* Modals & Dialogs */}
      <AddBookDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

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

      {/* In-app Toast Container */}
      <ToastContainer />

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
