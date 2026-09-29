import React from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Search,
  X,
  LayoutGrid,
  Grid3X3,
  Table,
  List,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  DownloadCloud,
} from 'lucide-react';

interface HomeFilterBarProps {
  viewMode: 'table' | 'grid' | 'compact_grid' | 'list';
  setViewMode: (mode: 'table' | 'grid' | 'compact_grid' | 'list') => void;
  totalFilteredCount: number;
}

export const HomeFilterBar: React.FC<HomeFilterBarProps> = ({
  viewMode,
  setViewMode,
  totalFilteredCount,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    viewFilter,
    setViewFilter,
    selectedGenre,
    setSelectedGenre,
  } = useTracker();

  const filterTabs: Array<{
    id: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
    label: string;
    icon?: React.ElementType;
  }> = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'downloaded', label: 'Downloaded', icon: DownloadCloud },
    { id: 'listened', label: 'Listened', icon: CheckCircle2 },
  ];

  return (
    <div className="bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-4 py-2.5 space-y-2">
      {/* Row 1: Search Input & View Switcher */}
      <div className="flex items-center gap-2">
        {/* Streamlined Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search titles, authors, series, narrators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 focus:outline-none text-xs text-slate-200 placeholder-slate-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* View Switcher: Table / Grid / Compact Grid / List */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            title="Standard Grid"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('compact_grid')}
            title="Compact Mobile Grid"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'compact_grid'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            title="Dense Table View"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Expanded List"
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Row 2: Status Filter Tabs & Results count */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
        <div className="flex items-center gap-1.5 shrink-0">
          {filterTabs.map((tab) => {
            const isSelected = viewFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setViewFilter(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {Icon && <Icon className={`h-3 w-3 ${isSelected ? 'text-slate-950' : 'text-slate-500'}`} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 font-medium shrink-0 hidden sm:block">
          Showing <span className="text-slate-300 font-bold">{totalFilteredCount}</span> audiobooks
        </div>
      </div>
    </div>
  );
};
