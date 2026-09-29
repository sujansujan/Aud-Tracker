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
  BookOpen,
} from 'lucide-react';

interface HomeFilterBarProps {
  totalFilteredCount: number;
  isSearchOpen: boolean;
}

export const HomeFilterBar: React.FC<HomeFilterBarProps> = ({
  totalFilteredCount,
  isSearchOpen,
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
      className="border-b px-3 sm:px-5 py-2.5 space-y-2.5 transition-colors duration-200 shrink-0"
    >
      {/* Search Bar (Toggleable on/off as requested) */}
      {isSearchOpen && (
        <div className="relative w-full animate-in fade-in slide-in-from-top-1 duration-150">
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
      )}

      {/* Filter Chips (Pill Shaped with Live Counters) */}
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
          <span style={{ color: 'var(--md-sys-color-on-surface)' }} className="font-extrabold">{totalFilteredCount}</span> audiobooks
        </div>
      </div>
    </div>
  );
};
