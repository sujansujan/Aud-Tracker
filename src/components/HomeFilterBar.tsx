import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { getDaysUntil } from '../utils/notifications';
import {
  Search,
  X,
  Calendar,
  CheckCircle2,
  Clock,
  DownloadCloud,
  CheckSquare,
  Square,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface HomeFilterBarProps {
  totalFilteredCount: number;
  selectedCount?: number;
  onToggleSelectAll?: () => void;
  isAllSelected?: boolean;
}

export const HomeFilterBar: React.FC<HomeFilterBarProps> = ({
  totalFilteredCount,
  selectedCount = 0,
  onToggleSelectAll,
  isAllSelected = false,
}) => {
  const {
    books,
    searchQuery,
    setSearchQuery,
    viewFilter,
    setViewFilter,
  } = useTracker();

  // Tab counts for ultra-intuitive navigation
  const counts = React.useMemo(() => {
    let upcoming = 0;
    let today = 0;
    let downloaded = 0;
    let listened = 0;

    for (const b of books) {
      const days = getDaysUntil(b.releaseDate);
      if (days >= 0) upcoming++;
      if (days === 0) today++;
      if (b.downloaded === 'Yes') downloaded++;
      if (b.listened === 'Yes' || b.isRead) listened++;
    }

    return {
      all: books.length,
      upcoming,
      today,
      downloaded,
      listened,
    };
  }, [books]);

  const filterTabs: Array<{
    id: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
    label: string;
    count: number;
    icon?: React.ElementType;
  }> = [
    { id: 'all', label: 'All Releases', count: counts.all, icon: BookOpen },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming, icon: Clock },
    { id: 'today', label: 'Releasing Today', count: counts.today, icon: Calendar },
    { id: 'downloaded', label: 'Downloaded', count: counts.downloaded, icon: DownloadCloud },
    { id: 'listened', label: 'Listened', count: counts.listened, icon: CheckCircle2 },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--md-sys-color-surface)',
        borderColor: 'var(--md-sys-color-outline-variant)',
      }}
      className="border-b px-3 sm:px-5 py-3 space-y-3 transition-colors duration-200"
    >
      {/* Row 1: Material 3 Search Bar Pill + Select All FAB */}
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
              title="Clear search"
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
            title={isAllSelected ? 'Deselect all audiobooks' : 'Select all audiobooks for batch action'}
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
      </div>

      {/* Row 2: Material 3 Filter Chips (Pill Shaped with Live Counts) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 scrollbar-none">
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
                <span
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--md-sys-color-primary)'
                      : 'var(--md-sys-color-surface-container-high)',
                    color: isSelected
                      ? 'var(--md-sys-color-on-primary)'
                      : 'var(--md-sys-color-on-surface-variant)',
                  }}
                  className="px-1.5 py-0.2 rounded-full text-[10px] font-bold tabular-nums ml-0.5"
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
          className="text-xs font-semibold shrink-0 hidden md:block tabular-nums"
        >
          Showing <span style={{ color: 'var(--md-sys-color-on-surface)' }} className="font-extrabold">{totalFilteredCount}</span> in Compact View
        </div>
      </div>
    </div>
  );
};
