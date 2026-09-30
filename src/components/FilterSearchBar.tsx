import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Search, X, LayoutGrid, Grid3X3, List, Star, Filter, Link, Sparkles } from 'lucide-react';
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

const RATING_OPTIONS = [
  { label: 'Any Rating', value: 0 },
  { label: '4.0+ ★', value: 4.0 },
  { label: '4.5+ ★', value: 4.5 },
  { label: '4.8+ ★ (Top Rated)', value: 4.8 },
];

const TIMEFRAME_OPTIONS: { id: 'all' | 'today' | 'week' | 'month' | 'tracked'; label: string }[] = [
  { id: 'all', label: 'All Releases' },
  { id: 'today', label: 'Out Today' },
  { id: 'week', label: 'Next 7 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'tracked', label: 'Followed Only' },
];

interface FilterSearchBarProps {
  onOpenAudibleSearch?: () => void;
  onOpenUrlImport?: () => void;
}

export const FilterSearchBar: React.FC<FilterSearchBarProps> = ({
  onOpenAudibleSearch,
  onOpenUrlImport,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    minRating,
    setMinRating,
    timeframeFilter,
    setTimeframeFilter,
    viewMode,
    setViewMode,
  } = useTracker();

  const isFiltering = searchQuery !== '' || selectedGenre !== 'All' || minRating > 0 || timeframeFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
    setMinRating(0);
    setTimeframeFilter('all');
  };

  return (
    <div className="space-y-3 pb-2">
      {/* Quick Audible Discovery & URL Import Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-slate-200 font-medium">
            Search live Audible catalog or track directly via book/series/author URL
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onOpenAudibleSearch && (
            <button
              onClick={onOpenAudibleSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Search Audible</span>
            </button>
          )}
          {onOpenUrlImport && (
            <button
              onClick={onOpenUrlImport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-semibold transition border border-slate-700 cursor-pointer"
            >
              <Link className="h-3.5 w-3.5 text-amber-400" />
              <span>Paste URL</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Search Input + Genre Dropdown + Rating Dropdown + View Mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        
        {/* Local Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter tracked releases by title, author, narrator..."
            className="w-full h-11 rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-9 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          
          {/* Genre Filter */}
          <div className="relative shrink-0">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value as any)}
              aria-label="Filter by genre"
              className="h-11 appearance-none rounded-xl bg-slate-900 border border-slate-800 pl-3.5 pr-8 text-xs font-semibold text-slate-200 hover:border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {GENRES.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-slate-200">
                  {g === 'All' ? 'All Genres' : g}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Rating Filter */}
          <div className="relative shrink-0">
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              aria-label="Filter by rating"
              className="h-11 appearance-none rounded-xl bg-slate-900 border border-slate-800 pl-3.5 pr-8 text-xs font-semibold text-slate-200 hover:border-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
            <Star className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          </div>

          {/* View Mode Segmented Switch */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Standard Grid"
              className={`p-2 rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('compact_grid')}
              aria-label="Compact Grid view"
              title="Compact Grid"
              className={`p-2 rounded-lg transition cursor-pointer ${
                viewMode === 'compact_grid'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="Detailed List"
              className={`p-2 rounded-lg transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Row 2: Timeframe Segmented Quick Filters */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80">
          {TIMEFRAME_OPTIONS.map((tf) => {
            const isActive = timeframeFilter === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setTimeframeFilter(tf.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        {isFiltering && (
          <button
            onClick={resetFilters}
            className="text-xs text-amber-400/90 hover:text-amber-300 font-medium whitespace-nowrap px-2 py-1 underline underline-offset-4 cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
