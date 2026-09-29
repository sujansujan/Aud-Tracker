import React, { useState, useEffect } from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
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
import { SortMenu, SortOption } from './components/SortMenu';
import { Audiobook } from './types/audiobook';
import { getDaysUntil, initNativeAndroidChannel } from './utils/notifications';
import {
  Menu,
  Sun,
  Moon,
  Settings,
  Search,
  CheckSquare,
  Square,
  Plus,
  Headphones,
  Info,
  X,
} from 'lucide-react';

function TrackerMain() {
  const {
    books,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    minRating,
    viewFilter,
    setViewFilter,
    runScheduledScan,
    isScanning,
    theme,
    toggleTheme,
  } = useTracker();

  // Search toggle state (default on or off based on user preference)
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Top Bar Sort State (Next to Add button)
  const [sortBy, setSortBy] = useState<SortOption>('release_soonest');

  // Dialog visibility
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Audiobook | null>(null);
  const [selectedBookForMarkRead, setSelectedBookForMarkRead] = useState<Audiobook | null>(null);

  // Multi-selection across compact grid (Native Android long-press driven)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Initialize native Android notification channel
  useEffect(() => {
    initNativeAndroidChannel();
  }, []);

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
      if (sortBy === 'release_newest') {
        return b.releaseDate.localeCompare(a.releaseDate);
      }
      if (sortBy === 'release_oldest') {
        return a.releaseDate.localeCompare(b.releaseDate);
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'title_desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === 'author_asc') {
        return a.author.localeCompare(b.author);
      }
      if (sortBy === 'rating_desc') {
        return b.audibleRating - a.audibleRating;
      }
      if (sortBy === 'duration_desc') {
        return (b.runtimeHours || 0) - (a.runtimeHours || 0);
      }
      if (sortBy === 'duration_asc') {
        return (a.runtimeHours || 0) - (b.runtimeHours || 0);
      }

      // Default: release_soonest (upcoming soonest first, then past releases newest first)
      const daysA = getDaysUntil(a.releaseDate);
      const daysB = getDaysUntil(b.releaseDate);
      const isUpA = daysA >= 0;
      const isUpB = daysB >= 0;

      if (isUpA && !isUpB) return -1;
      if (!isUpA && isUpB) return 1;
      if (isUpA && isUpB) return daysA - daysB;
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

  const activeFilterLabel =
    viewFilter === 'upcoming'
      ? 'Upcoming Only'
      : viewFilter === 'today'
      ? 'Releasing Today'
      : viewFilter === 'downloaded'
      ? 'Downloaded'
      : viewFilter === 'listened'
      ? 'Listened'
      : null;

  return (
    <div
      style={{ backgroundColor: 'var(--md-sys-color-background)', color: 'var(--md-sys-color-on-surface)' }}
      className="min-h-screen flex flex-col font-sans select-none antialiased overflow-x-hidden transition-colors duration-250"
    >
      {/* Modern Material Design 3 Minimal Top Bar (No app name, clean tools) */}
      <header
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
        }}
        className="pt-safe pb-2.5 px-3 sm:px-5 flex items-center justify-between border-b shadow-sm shrink-0 z-20 transition-colors duration-200"
      >
        {/* Left Side: Hamburger Menu Button Only */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md-btn-icon shadow-xs"
            aria-label="Open navigation menu and watchlists"
            title="Menu: Tracked Authors, Series, Narrators & Tools"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right Side: Search Toggle, Sort & Filter (Next to Add), + Add, Select All (Near Settings), Theme Switcher, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Option to toggle search bar on or off */}
          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`md-btn-icon shadow-xs transition-colors ${
              isSearchOpen ? 'ring-2 ring-[var(--md-sys-color-primary)]' : ''
            }`}
            title={isSearchOpen ? 'Hide Search Bar' : 'Toggle Search Bar'}
            aria-label="Toggle search bar on or off"
          >
            <Search
              className="h-5 w-5"
              style={{ color: isSearchOpen ? 'var(--md-sys-color-primary)' : undefined }}
            />
          </button>

          {/* Sort & Filter Option at Top of the App Next to Add Button (Contains All Releases, Upcoming, Downloaded, etc.) */}
          <SortMenu
            currentSort={sortBy}
            onSelectSort={setSortBy}
          />

          {/* Primary + Add Button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="md-btn-fab min-h-[44px] px-3.5 sm:px-4 text-xs font-bold shadow-sm"
            title="Add audiobook, author, series, or narrator"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Add</span>
          </button>

          {/* Select All Button (Located near settings button as requested) */}
          <button
            onClick={handleToggleSelectAll}
            className="md-btn-icon shadow-xs transition-all"
            title={
              filteredBooks.length > 0 && selectedIds.length >= filteredBooks.length
                ? 'Deselect All Audiobooks'
                : 'Select All Audiobooks'
            }
            aria-label="Select all audiobooks"
            style={{
              backgroundColor:
                selectedIds.length > 0 ? 'var(--md-sys-color-primary-container)' : undefined,
              color:
                selectedIds.length > 0 ? 'var(--md-sys-color-on-primary-container)' : undefined,
              borderColor:
                selectedIds.length > 0 ? 'var(--md-sys-color-primary)' : undefined,
            }}
          >
            {filteredBooks.length > 0 && selectedIds.length >= filteredBooks.length ? (
              <CheckSquare className="h-5 w-5" style={{ color: 'var(--md-sys-color-primary)' }} />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>

          {/* Theme Mode Switcher (Alucard Light / Dracula Dark) */}
          <button
            onClick={toggleTheme}
            className="md-btn-icon shadow-xs"
            title={theme === 'dark' ? 'Switch to Alucard Light Mode' : 'Switch to Dracula Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="h-5 w-5 text-purple-600 transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="md-btn-icon shadow-xs"
            title="Settings & Tools"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" style={{ color: 'var(--md-sys-color-primary)' }} />
          </button>
        </div>
      </header>

      {/* Sleek Expandable Search Bar (When toggled on via Search icon) */}
      {isSearchOpen && (
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="border-b px-3.5 sm:px-6 py-2.5 animate-in fade-in slide-in-from-top-1 duration-150 shrink-0"
        >
          <div className="relative w-full max-w-2xl mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            />
            <input
              type="text"
              placeholder="Search audiobooks, authors, series, or narrators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md-input w-full min-h-[44px] pl-11 pr-10 text-xs sm:text-sm font-medium rounded-full"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-transform active:scale-90 cursor-pointer"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace (Full Width, Compact Poster Grid Only with Pull-to-Refresh) */}
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
            <div className="flex items-center gap-2 truncate">
              <Info className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--md-sys-color-primary)' }} />
              <span className="truncate">
                Showing {filteredBooks.length} audiobooks
                {activeFilterLabel && (
                  <span className="ml-1.5 font-bold" style={{ color: 'var(--md-sys-color-primary)' }}>
                    ({activeFilterLabel})
                  </span>
                )}
                {' '}· Long-press to select · Tap for details
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeFilterLabel && (
                <button
                  type="button"
                  onClick={() => setViewFilter('all')}
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="font-bold text-[11px] hover:underline cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
              <span className="hidden md:inline font-semibold text-[11px]">
                Pull down to refresh
              </span>
            </div>
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
                  {activeFilterLabel
                    ? `Currently filtered by "${activeFilterLabel}". Try resetting the filter from the Sort & Filter button at the top.`
                    : 'Tap the + Add button at the top to add an author, series, or book.'}
                </p>
                <div className="flex items-center gap-2">
                  {activeFilterLabel && (
                    <button
                      onClick={() => setViewFilter('all')}
                      className="md-btn-outlined min-h-[44px] px-4 text-xs font-bold"
                    >
                      Show All Releases
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddOpen(true)}
                    className="md-btn-fab min-h-[44px] px-5 text-xs font-bold"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>Add New Item</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Native Android Long-Press Enabled Compact Poster Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 p-3 sm:p-4">
                {filteredBooks.map((book) => (
                  <AudiobookCard
                    key={book.id}
                    book={book}
                    viewMode="compact_grid"
                    isSelected={selectedIds.includes(book.id)}
                    isSelectionActive={selectedIds.length > 0}
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

      {/* Settings, Watchlists & Backup Dialog (Vertical Navigation) */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Full Book Details Modal (No audio preview, no triggers schedule) */}
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
