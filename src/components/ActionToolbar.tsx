import React from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Plus,
  ClipboardList,
  VolumeX,
  Rocket,
  RefreshCw,
  DownloadCloud,
  CheckCircle,
  Trash2,
  ExternalLink,
  Search,
  X,
  Filter,
  Star,
  LayoutGrid,
  List,
  Grid3X3,
  Settings,
} from 'lucide-react';
import { Genre } from '../types/audiobook';

const GENRES: ('All' | Genre)[] = [
  'All',
  'Sci-Fi',
  'Fantasy',
  'LitRPG',
  'Thriller',
  'Mystery',
  'Non-Fiction',
  'Horror',
  'Romance',
];

interface ActionToolbarProps {
  onOpenAddDialog: () => void;
  onOpenWatchlistDialog: () => void;
  onOpenMuteListDialog: () => void;
  onOpenPreferences: () => void;
  viewMode: 'table' | 'grid' | 'compact_grid' | 'list';
  setViewMode: (vm: 'table' | 'grid' | 'compact_grid' | 'list') => void;
  selectedIds: string[];
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onOpenAddDialog,
  onOpenWatchlistDialog,
  onOpenMuteListDialog,
  onOpenPreferences,
  viewMode,
  setViewMode,
  selectedIds,
}) => {
  const {
    books,
    selectedBookId,
    selectedBook,
    toggleField,
    refetchBookMetadata,
    deleteMultipleBooks,
    runScheduledScan,
    isScanning,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    minRating,
    setMinRating,
    viewFilter,
    setViewFilter,
  } = useTracker();

  const targetId = selectedIds.length === 1 ? selectedIds[0] : selectedBookId;
  const currentBook = books.find((b) => b.id === targetId) || selectedBook;

  const handleToggleDL = () => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => toggleField(id, 'downloaded'));
    } else if (targetId) {
      toggleField(targetId, 'downloaded');
    } else {
      alert('Please select an audiobook from the list first.');
    }
  };

  const handleToggleListened = () => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => toggleField(id, 'listened'));
    } else if (targetId) {
      toggleField(targetId, 'listened');
    } else {
      alert('Please select an audiobook from the list first.');
    }
  };

  const handleRefetch = async () => {
    if (!targetId) {
      alert('Please select an audiobook from the list first.');
      return;
    }
    await refetchBookMetadata(targetId);
  };

  const handleDelete = () => {
    const toDelete = selectedIds.length > 0 ? selectedIds : targetId ? [targetId] : [];
    if (toDelete.length === 0) {
      alert('Please select one or more books to delete.');
      return;
    }
    const bookTitle = books.find((b) => b.id === toDelete[0])?.title || 'selected book';
    const msg = toDelete.length === 1 ? `Are you sure you want to remove:\n\n${bookTitle}` : `Are you sure you want to delete all ${toDelete.length} selected books?`;
    if (window.confirm(msg)) {
      deleteMultipleBooks(toDelete);
    }
  };

  const handleOpenUrl = () => {
    if (!currentBook || (!currentBook.url && !currentBook.audibleUrl)) {
      alert('Please select a book with a valid web link.');
      return;
    }
    const link = currentBook.url || currentBook.audibleUrl;
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-2.5 bg-slate-900/90 border-b border-slate-800 p-3 sm:px-4">
      {/* Top Action Bar (AHK Button Row) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenAddDialog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
          title="Add an Audible Book, Series, Author, or Narrator"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Add Book</span>
        </button>

        <button
          onClick={onOpenWatchlistDialog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          title="Manage Authors, Series, and Narrators watchlists"
        >
          <ClipboardList className="h-3.5 w-3.5 text-amber-400" />
          <span>Watchlist</span>
        </button>

        <button
          onClick={onOpenMuteListDialog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          title="Manage Mute List (Ignore series & spin-offs)"
        >
          <VolumeX className="h-3.5 w-3.5 text-slate-400" />
          <span>Mute List</span>
        </button>

        <button
          onClick={() => runScheduledScan(false)}
          disabled={isScanning}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            isScanning
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
          }`}
          title="Scan all watched series, authors, and narrators for new releases"
        >
          <Rocket className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan All'}</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-0.5 hidden sm:block" />

        <button
          onClick={handleRefetch}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
          title="Re-query Audible API for selected book metadata"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Re-fetch</span>
        </button>

        <button
          onClick={handleToggleDL}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
          title="Toggle Downloaded status (Yes/No)"
        >
          <DownloadCloud className="h-3.5 w-3.5" />
          <span>Toggle DL</span>
        </button>

        <button
          onClick={handleToggleListened}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
          title="Toggle Listened status (Yes/No)"
        >
          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span>Toggle Listened</span>
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-medium border border-rose-800/40 transition cursor-pointer"
          title="Delete selected book(s)"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>

        <button
          onClick={handleOpenUrl}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
          title="Open selected book on Audible"
        >
          <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
          <span>Open</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, authors, narrators, series..."
            className="w-full h-8.5 rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-7 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters and View Toggles */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {/* Quick status tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'today', label: 'Today' },
                { id: 'downloaded', label: 'DL' },
                { id: 'listened', label: 'Listened' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewFilter(tab.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                  viewFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Genre select */}
          <div className="relative shrink-0">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="h-8 rounded-lg bg-slate-950 border border-slate-800 px-2.5 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {GENRES.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-slate-200">
                  {g === 'All' ? 'All Genres' : g}
                </option>
              ))}
            </select>
          </div>

          {/* Rating select */}
          <div className="relative shrink-0">
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="h-8 rounded-lg bg-slate-950 border border-slate-800 px-2.5 text-[11px] font-semibold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="0">Any Rating</option>
              <option value="4.0">4.0+ ★</option>
              <option value="4.5">4.5+ ★</option>
              <option value="4.8">4.8+ ★</option>
            </select>
          </div>

          {/* View Mode Switcher (Table / Grid / Compact / List) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              title="ListView Table (AHK standard)"
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'table' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Standard Grid"
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('compact_grid')}
              title="Compact Mobile Grid"
              className={`p-1.5 rounded transition cursor-pointer ${
                viewMode === 'compact_grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Preferences Button */}
          <button
            onClick={onOpenPreferences}
            title="Configure Default Search & View Preferences"
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 transition cursor-pointer shrink-0"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
