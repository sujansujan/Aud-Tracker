import React, { useState } from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { HomeFilterBar } from './components/HomeFilterBar';
import { PullToRefresh } from './components/PullToRefresh';
import { AudiobookListView } from './components/AudiobookListView';
import { PreviewPanel } from './components/PreviewPanel';
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
import { PWAInstallButton } from './components/PWAInstallButton';
import { Audiobook } from './types/audiobook';
import { getDaysUntil } from './utils/notifications';
import { Headphones, Plus, Settings, Eye, Menu, Sun, Moon } from 'lucide-react';

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
    languageFilter,
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
      {/* Modern Material Design Top App Bar */}
      <header
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="pt-safe pb-3 px-3 sm:px-5 flex items-center justify-between border-b shadow-sm shrink-0 z-20 transition-colors duration-200"
      >
        {/* Left Side: Material Navigation Drawer Button + Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Hamburger Menu (Large 44px Material Touch Target) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md-btn-icon shadow-sm"
            aria-label="Open navigation menu and watchlists"
            title="Open Menu (Tracked Authors, Series, Narrators & Settings)"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="flex h-9 w-9 items-center justify-center rounded-2xl font-bold shadow-md transition-transform active:scale-95"
            >
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-sm sm:text-base font-extrabold tracking-wide truncate">
                  Audible Tracker
                </h1>
                <span
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    color: 'var(--md-sys-color-on-primary-container)',
                    borderColor: 'var(--md-sys-color-primary)',
                  }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border hidden sm:inline-flex items-center"
                >
                  {theme === 'dark' ? '🧛 Dracula' : '☀️ Alucard'}
                </span>
              </div>
              {languageFilter === 'all_languages' && (
                <span
                  style={{ color: 'var(--md-sys-color-accent-orange)' }}
                  className="text-[10px] font-bold hidden sm:inline block"
                >
                  • Multilingual Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Actions: Material Theme Toggle, Large + Add Button, Settings, Preview */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Material Theme Mode Switcher (Alucard Light / Dracula Dark) */}
          <button
            onClick={toggleTheme}
            className="md-btn-icon shadow-sm"
            title={theme === 'dark' ? 'Switch to Alucard Light Mode' : 'Switch to Dracula Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-5 w-5 text-purple-600 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          <PWAInstallButton compact />

          {/* Material 3 Floating Action Button (FAB Style) for + Add */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="md-btn-fab min-h-[44px] px-4 sm:px-5 text-xs sm:text-sm"
            title="Add audiobook, series, author, or narrator"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
            <span>Add</span>
          </button>

          {/* Generously Sized Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="md-btn-icon shadow-sm"
            title="Settings & Backup"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" style={{ color: 'var(--md-sys-color-primary)' }} />
          </button>

          {/* Preview toggle on mobile */}
          <button
            onClick={() => setShowMobilePreview(!showMobilePreview)}
            className={`lg:hidden md-btn-icon ${
              showMobilePreview ? 'ring-2 ring-[var(--md-sys-color-primary)]' : ''
            }`}
            title="Toggle preview panel"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Streamlined Material 3 Home Filter & Search Bar */}
      <HomeFilterBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalFilteredCount={filteredBooks.length}
        selectedCount={selectedIds.length}
        onToggleSelectAll={handleToggleSelectAll}
        isAllSelected={filteredBooks.length > 0 && selectedIds.length >= filteredBooks.length}
      />

      {/* Main Workspace with Pull-to-Refresh */}
      <main className="flex-1 flex flex-col lg:flex-row p-2.5 sm:p-4 gap-3.5 overflow-hidden">
        {/* Book View (wrapped with smooth pull-to-refresh) */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex-1 flex flex-col min-w-0 overflow-hidden rounded-3xl border shadow-sm transition-colors duration-200"
        >
          <PullToRefresh
            onRefresh={handlePullRefresh}
            isRefreshing={isScanning}
            className="flex-1 h-full"
          >
            {filteredBooks.length === 0 ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center">
                <div
                  style={{ backgroundColor: 'var(--md-sys-color-surface-container)' }}
                  className="h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-inner"
                >
                  <Headphones
                    className="h-8 w-8"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  />
                </div>
                <h3 className="text-base font-bold mb-1">No audiobooks found</h3>
                <p
                  style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  className="text-xs max-w-sm mb-6 leading-relaxed"
                >
                  Try adjusting your search or filters, or tap the primary <span style={{ color: 'var(--md-sys-color-primary)' }} className="font-bold">+ Add</span> button to discover or add books.
                </p>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="md-btn-fab min-h-[46px] px-6 text-sm"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Add New Audiobook</span>
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <AudiobookListView
                books={filteredBooks}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-3 sm:p-4">
                {filteredBooks.map((book) => (
                  <AudiobookCard
                    key={book.id}
                    book={book}
                    viewMode="grid"
                    isSelected={selectedIds.includes(book.id)}
                    onToggleSelect={handleToggleSelectBook}
                    onSelect={(b) => setSelectedBookForDetail(b)}
                    onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
                  />
                ))}
              </div>
            ) : viewMode === 'compact_grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 p-3">
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
            ) : (
              <div className="space-y-3 p-3 sm:p-4">
                {filteredBooks.map((book) => (
                  <AudiobookCard
                    key={book.id}
                    book={book}
                    viewMode="list"
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

        {/* Right Side: Material Audiobook Preview Panel */}
        <div className={`${showMobilePreview ? 'block' : 'hidden'} lg:block shrink-0`}>
          <PreviewPanel
            book={selectedBook}
            onOpenMarkRead={(b) => setSelectedBookForMarkRead(b)}
          />
        </div>
      </main>

      {/* Floating Batch Action Bar (Material Action Pill) */}
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

      {/* Hamburger Drawer Menu */}
      <HamburgerDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
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
