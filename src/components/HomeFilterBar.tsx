import React from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Search,
  X,
  LayoutGrid,
  Grid3X3,
  Table,
  List,
  Calendar,
  CheckCircle2,
  Clock,
  DownloadCloud,
  CheckSquare,
  Square,
} from 'lucide-react';

interface HomeFilterBarProps {
  viewMode: 'table' | 'grid' | 'compact_grid' | 'list';
  setViewMode: (mode: 'table' | 'grid' | 'compact_grid' | 'list') => void;
  totalFilteredCount: number;
  selectedCount?: number;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
}

export const HomeFilterBar: React.FC<HomeFilterBarProps> = ({
  viewMode,
  setViewMode,
  totalFilteredCount,
  selectedCount = 0,
  onToggleSelectAll,
  isAllSelected = false,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    viewFilter,
    setViewFilter,
  } = useTracker();

  const filterTabs: Array<{
    id: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
    label: string;
    icon?: React.ElementType;
  }> = [
    { id: 'all', label: 'All Releases' },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    { id: 'today', label: 'Releasing Today', icon: Calendar },
    { id: 'downloaded', label: 'Downloaded', icon: DownloadCloud },
    { id: 'listened', label: 'Listened', icon: CheckCircle2 },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-outline-variant)',
      }}
      className="border-b px-3 sm:px-5 py-3 space-y-3 transition-colors duration-200"
    >
      {/* Row 1: Material 3 Search Bar Pill + Select All FAB + Segmented View Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Material 3 Search Bar Pill */}
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          />
          <input
            type="text"
            placeholder="Search audiobooks, authors, series, or narrators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md-input w-full min-h-[46px] pl-11 pr-10 text-xs sm:text-sm font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full transition-transform active:scale-90 cursor-pointer"
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Master Multi-Select Button (Material Tonal / Active Pill) */}
        {onToggleSelectAll && (
          <button
            type="button"
            onClick={onToggleSelectAll}
            title={isAllSelected ? 'Deselect all audiobooks' : 'Select all audiobooks'}
            style={{
              backgroundColor: isAllSelected
                ? 'var(--md-sys-color-primary)'
                : selectedCount > 0
                ? 'var(--md-sys-color-primary-container)'
                : 'var(--md-sys-color-surface-container)',
              color: isAllSelected
                ? 'var(--md-sys-color-on-primary)'
                : selectedCount > 0
                ? 'var(--md-sys-color-on-primary-container)'
                : 'var(--md-sys-color-on-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="min-h-[46px] px-3.5 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0 active:scale-95"
          >
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4 stroke-[2.5]" />
            ) : (
              <Square className="h-4 w-4" style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
            )}
            <span className="hidden sm:inline">
              {isAllSelected ? 'All Selected' : selectedCount > 0 ? `${selectedCount} Selected` : 'Select All'}
            </span>
          </button>
        )}

        {/* Material 3 Segmented View Switcher */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center p-1 rounded-2xl border shrink-0 shadow-sm"
        >
          <button
            onClick={() => setViewMode('grid')}
            title="Standard Grid"
            style={{
              backgroundColor: viewMode === 'grid' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl transition-all cursor-pointer font-bold"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('compact_grid')}
            title="Compact Grid"
            style={{
              backgroundColor: viewMode === 'compact_grid' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: viewMode === 'compact_grid' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl transition-all cursor-pointer font-bold"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            title="Dense Table View"
            style={{
              backgroundColor: viewMode === 'table' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: viewMode === 'table' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl transition-all cursor-pointer font-bold"
          >
            <Table className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="Expanded List"
            style={{
              backgroundColor: viewMode === 'list' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: viewMode === 'list' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl transition-all cursor-pointer font-bold"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Row 2: Material 3 Filter Chips (Pill Shaped) + Count */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
        <div className="flex items-center gap-2 shrink-0">
          {filterTabs.map((tab) => {
            const isSelected = viewFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setViewFilter(tab.id)}
                className={`md-chip ${isSelected ? 'md-chip-active shadow-sm' : ''}`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          className="text-xs font-semibold shrink-0 hidden sm:block tabular-nums"
        >
          <span style={{ color: 'var(--md-sys-color-on-surface)' }} className="font-extrabold">{totalFilteredCount}</span> audiobooks
        </div>
      </div>
    </div>
  );
};
