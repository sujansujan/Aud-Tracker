import React, { useState } from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { HomeFilterBar } from './components/HomeFilterBar';
import { PullToRefresh } from './components/PullToRefresh';
import { StatusBar } from './components/StatusBar';
import { AddBookDialog } from './components/AddBookDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { HamburgerDrawer } from './components/HamburgerDrawer';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { AudiobookCard } from './components/AudiobookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { MarkAsReadModal } from './components/MarkAsReadModal';
import { FloatingBatchBar } from './components/FloatingBatchBar';
import { ToastContainer } from './components/ToastContainer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Audiobook } from './types/audiobook';
import { getDaysUntil } from './utils/notifications';
import { Headphones, Plus, Settings, Menu, Sun, Moon, Info } from 'lucide-react';

function TrackerMain() {
  const {
    books,
    searchQuery,
    selectedGenre,
    minRating,
    viewFilter,
    runScheduledScan,
    isScanning,
    theme,
    toggleTheme,
  } = useTracker();

  // Dialog visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Audiobook | null>(null);
  const [selectedBookForMarkRead, setSelectedBookForMarkRead] = useState<Audiobook | null>(null);

  // Multi-selection across all views
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const handleToggleSelectBook = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (filteredBooks.length > 0 && selectedIds.length >= filteredBooks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBooks.map((b) => b.id));
    }
  };

  return (
    <div
      style={{ backgroundColor: 'var(--md-sys-color-background)', color: 'var(--md-sys-color-on-surface)' }}
      className="min-h-screen flex flex-col font-sans select-none antialiased overflow-x-hidden transition-colors duration-250"
    >
      {/* Modern Material Design 3 Top App Bar */}
      <header
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="pt-safe pb-3 px-3.5 sm:px-6 flex items-center justify-between border-b shadow-sm shrink-0 z-20 transition-colors duration-200"
      >
        {/* Left Side: Material Navigation Drawer Button + Clean Brand Identity */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hamburger Menu (Large Material Touch Target with intuitive icon) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md-btn-icon shadow-xs"
            aria-label="Open navigation menu and watchlists"
            title="Open Menu: Tracked Authors, Series, Narrators & Tools"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl font-bold shadow-md transition-transform active:scale-95"
            >
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-base sm:text-lg font-extrabold tracking-tight truncate">
                Audible Tracker
              </h1>
              <p
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="text-[11px] font-medium hidden sm:block leading-none mt-0.5"
              >
                Audiobook Releases &amp; Series
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Actions: Theme Switcher, Large + Add Button, Settings */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Mode Switcher (Alucard Light / Dracula Dark) */}
          <button
            onClick={toggleTheme}
            className="md-btn-icon shadow-xs"
            title={theme === 'dark' ? 'Switch to Alucard Light Mode' : 'Switch to Dracula Dark Mode'}
            aria-label="Toggle light/dark theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-5 w-5 text-purple-600 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Large Material 3 Extended Floating Action Button (FAB Style) for + Add */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="md-btn-fab min-h-[46px] px-4 sm:px-6 text-xs sm:text-sm shadow-md"
            title="Add audiobook, series, author, or narrator"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
            <span>Add Item</span>
          </button>

          {/* Large Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="md-btn-icon shadow-xs"
            title="Settings, Watchlists & Backup"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" style={{ color: 'var(--md-sys-color-primary)' }} />
          </button>
        </div>
      </header>

      {/* Streamlined Material 3 Home Filter & Search Bar */}
      <HomeFilterBar
        totalFilteredCount={filteredBooks.length}
        selectedCount={selectedIds.length}
        onToggleSelectAll={handleToggleSelectAll}
        isAllSelected={filteredBooks.length > 0 && selectedIds.length >= filteredBooks.length}
      />

      {/* Main Workspace (Full Width, Compact Grid Only Mode with Pull-to-Refresh) */}
      <main className="flex-1 flex flex-col p-3 sm:p-5 overflow-hidden">
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex-1 flex flex-col min-w-0 overflow-hidden rounded-3xl border shadow-sm transition-colors duration-200"
        >
          {/* Navigation Helper Banner */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
            className="px-4 py-2 border-b text-xs flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-1.5 truncate">
              <Info className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--md-sys-color-primary)' }} />
              <span className="truncate">
                Compact Poster View · Tap any book to view synopsis, play audio sample, or schedule alarms.
              </span>
            </div>
            <span className="hidden md:inline font-semibold text-[11px] shrink-0 ml-2">
              Pull down to check for new releases
            </span>
          </div>

          <PullToRefresh
            onRefresh={handlePullRefresh}
            isRefreshing={isScanning}
            className="flex-1 h-full overflow-y-auto"
          >
            {filteredBooks.length === 0 ? (
              <div className="h-full min-h-[340px] flex flex-col items-center justify-center p-8 text-center">
                <div
                  style={{ backgroundColor: 'var(--md-sys-color-surface-container)' }}
                  className="h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-inner"
                >
                  <Headphones
                    className="h-8 w-8"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  />
                </div>
                <h3 className="text-base font-bold mb-1">No audiobooks match this filter</h3>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-xs max-w-sm mb-6 leading-relaxed"
                >
                  Try selecting "All Releases" above, or tap the <span style={{ color: 'var(--md-sys-color-primary)' }} className="font-bold">+ Add Item</span> button to add an author, series, or book.
                </p>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="md-btn-fab min-h-[46px] px-6 text-sm"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Add New Audiobook</span>
                </button>
              </div>
            ) : (
              /* High-Density, Navigation-Friendly Compact Poster Grid (Only View Mode) */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4">
                {filteredBooks.map((book) => (
                  <AudiobookCard
                    key={book.id}
                    book={book}
                    viewMode="compact_grid"
                    isSelected={selectedIds.includes(book.id)}
                    onToggleSelect={handleToggleSelectBook}
                    onSelect={(b) => setSelectedBookForDetail(b)}
                    onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
                  />
                ))}
              </div>
            )}
          </PullToRefresh>
        </div>
      </main>

      {/* Floating Batch Action Bar (Appears when any books are selected) */}
      <FloatingBatchBar
        selectedIds={selectedIds}
        totalFilteredCount={filteredBooks.length}
        onClearSelection={() => setSelectedIds([])}
        onSelectAll={() => setSelectedIds(filteredBooks.map((b) => b.id))}
      />

      {/* Status Bar */}
      <StatusBar
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenPreferences={() => setIsSettingsOpen(true)}
      />

      {/* Hamburger Navigation Drawer */}
      <HamburgerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
      />

      {/* Add Audiobook, Series, Author, or Narrator Dialog */}
      <AddBookDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Settings, Watchlists & Backup Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Full Book Details, Audio Narration Sample & Alarms Modal */}
      <BookDetailModal
        book={selectedBookForDetail}
        onClose={() => setSelectedBookForDetail(null)}
        onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
      />

      {/* Mark As Read / Listening Log Modal */}
      <MarkAsReadModal
        book={selectedBookForMarkRead}
        onClose={() => setSelectedBookForMarkRead(null)}
      />

      {/* Release Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      {/* In-app Toast Notifications */}
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
