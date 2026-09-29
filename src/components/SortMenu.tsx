import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { getDaysUntil } from '../utils/notifications';
import {
  ArrowUpDown,
  Calendar,
  Clock,
  Star,
  Check,
  ArrowUpAZ,
  ArrowDownZA,
  User,
  Hourglass,
  BookOpen,
  DownloadCloud,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react';

export type SortOption =
  | 'release_soonest'
  | 'release_newest'
  | 'release_oldest'
  | 'title_asc'
  | 'title_desc'
  | 'author_asc'
  | 'rating_desc'
  | 'duration_desc'
  | 'duration_asc';

interface SortMenuProps {
  currentSort: SortOption;
  onSelectSort: (option: SortOption) => void;
}

export const SortMenu: React.FC<SortMenuProps> = ({ currentSort, onSelectSort }) => {
  const { books, viewFilter, setViewFilter } = useTracker();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Dynamic live counts for filter options
  const counts = useMemo(() => {
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

  const filterOptions: Array<{
    id: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
    label: string;
    count: number;
    icon: React.ElementType;
  }> = [
    { id: 'all', label: 'All Releases', count: counts.all, icon: BookOpen },
    { id: 'upcoming', label: 'Upcoming Only', count: counts.upcoming, icon: Clock },
    { id: 'today', label: 'Releasing Today', count: counts.today, icon: Calendar },
    { id: 'downloaded', label: 'Downloaded', count: counts.downloaded, icon: DownloadCloud },
    { id: 'listened', label: 'Listened / Read', count: counts.listened, icon: CheckCircle2 },
  ];

  const sortOptions: Array<{
    id: SortOption;
    label: string;
    sublabel?: string;
    icon: React.ElementType;
  }> = [
    {
      id: 'release_soonest',
      label: 'Release: Soonest / Upcoming First',
      sublabel: 'Default Audible release schedule',
      icon: Clock,
    },
    {
      id: 'release_newest',
      label: 'Release: Newest First',
      sublabel: 'Latest release date to oldest',
      icon: Calendar,
    },
    {
      id: 'release_oldest',
      label: 'Release: Oldest First',
      sublabel: 'Earliest release date',
      icon: Calendar,
    },
    {
      id: 'title_asc',
      label: 'Title: A to Z',
      sublabel: 'Alphabetical ascending',
      icon: ArrowUpAZ,
    },
    {
      id: 'title_desc',
      label: 'Title: Z to A',
      sublabel: 'Alphabetical descending',
      icon: ArrowDownZA,
    },
    {
      id: 'author_asc',
      label: 'Author: A to Z',
      sublabel: 'Grouped by author name',
      icon: User,
    },
    {
      id: 'rating_desc',
      label: 'Audible Rating: Highest First',
      sublabel: 'Top rated books (★)',
      icon: Star,
    },
    {
      id: 'duration_desc',
      label: 'Duration: Longest First',
      sublabel: 'Longest runtime audiobooks',
      icon: Hourglass,
    },
    {
      id: 'duration_asc',
      label: 'Duration: Shortest First',
      sublabel: 'Quick listens & novellas',
      icon: Hourglass,
    },
  ];

  const isFiltered = viewFilter !== 'all';
  const isSortedNonDefault = currentSort !== 'release_soonest';
  const hasActiveModifiers = isFiltered || isSortedNonDefault;

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Top Header Sort & Filter Trigger Button (Next to Add Item button) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`md-btn-icon relative shadow-xs transition-colors ${
          isOpen || hasActiveModifiers
            ? 'ring-2 ring-[var(--md-sys-color-primary)]'
            : ''
        }`}
        title="Sort & Filter Audiobooks"
        aria-label="Sort and Filter audiobooks"
        aria-expanded={isOpen}
      >
        <ArrowUpDown
          className="h-5 w-5"
          style={{
            color: hasActiveModifiers || isOpen
              ? 'var(--md-sys-color-primary)'
              : undefined,
          }}
        />

        {/* Small badge dot if custom filter or sort is active */}
        {hasActiveModifiers && (
          <span
            style={{ backgroundColor: 'var(--md-sys-color-primary)' }}
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-[var(--md-sys-color-surface)]"
          />
        )}
      </button>

      {/* Responsive Native Android Modal Bottom Sheet on Mobile / Centered on Desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          {/* Sheet Container */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
              color: 'var(--md-sys-color-on-surface)',
              boxShadow: 'var(--md-elevation-3)',
            }}
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border sm:border flex flex-col max-h-[85vh] overflow-hidden select-none transition-colors duration-200 animate-in slide-in-from-bottom sm:zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Native Android Drag Handle for Touch Screens */}
            <div className="w-12 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

            {/* Header */}
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                borderColor: 'var(--md-sys-color-outline-variant)',
              }}
              className="px-4 py-3 border-b flex items-center justify-between shrink-0"
            >
              <div className="flex items-center gap-2">
                <Filter
                  className="h-4 w-4"
                  style={{ color: 'var(--md-sys-color-primary)' }}
                />
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                  Sort &amp; Filter
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveModifiers && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewFilter('all');
                      onSelectSort('release_soonest');
                    }}
                    style={{ color: 'var(--md-sys-color-primary)' }}
                    className="text-xs font-bold hover:underline cursor-pointer px-1 py-0.5"
                  >
                    Reset All
                  </button>
                )}
                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer sm:hidden"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Options */}
            <div className="overflow-y-auto p-3 sm:p-4 space-y-4 pb-safe">
              {/* SECTION 1: Status & View Filters */}
              <div className="space-y-1.5">
                <span
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider block px-1"
                >
                  Filter by Status
                </span>

                <div className="grid grid-cols-1 gap-1">
                  {filterOptions.map((filter) => {
                    const Icon = filter.icon;
                    const isSelected = viewFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => {
                          setViewFilter(filter.id);
                        }}
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--md-sys-color-primary-container)'
                            : 'transparent',
                          color: isSelected
                            ? 'var(--md-sys-color-on-primary-container)'
                            : 'var(--md-sys-color-on-surface)',
                        }}
                        className="w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-2xl text-left transition cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] active:scale-98"
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className="h-4.5 w-4.5 shrink-0"
                            style={{
                              color: isSelected
                                ? 'var(--md-sys-color-primary)'
                                : 'var(--md-sys-color-on-surface-variant)',
                            }}
                          />
                          <span className="text-xs sm:text-sm font-bold">{filter.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            style={{
                              backgroundColor: isSelected
                                ? 'var(--md-sys-color-primary)'
                                : 'var(--md-sys-color-surface-container-high)',
                              color: isSelected
                                ? 'var(--md-sys-color-on-primary)'
                                : 'var(--md-sys-color-on-surface-variant)',
                            }}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums"
                          >
                            {filter.count}
                          </span>
                          {isSelected && (
                            <Check
                              className="h-4.5 w-4.5 stroke-[3]"
                              style={{ color: 'var(--md-sys-color-primary)' }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div
                style={{ backgroundColor: 'var(--md-sys-color-outline-variant)' }}
                className="h-px w-full"
              />

              {/* SECTION 2: Sorting Options */}
              <div className="space-y-1.5">
                <span
                  style={{ color: 'var(--md-sys-color-primary)' }}
                  className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider block px-1"
                >
                  Sort Order
                </span>

                <div className="grid grid-cols-1 gap-1">
                  {sortOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = currentSort === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          onSelectSort(option.id);
                          setIsOpen(false);
                        }}
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--md-sys-color-primary-container)'
                            : 'transparent',
                          color: isSelected
                            ? 'var(--md-sys-color-on-primary-container)'
                            : 'var(--md-sys-color-on-surface)',
                        }}
                        className="w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-2xl text-left transition cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] active:scale-98"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <Icon
                            className="h-4.5 w-4.5 shrink-0"
                            style={{
                              color: isSelected
                                ? 'var(--md-sys-color-primary)'
                                : 'var(--md-sys-color-on-surface-variant)',
                            }}
                          />
                          <div className="min-w-0 truncate">
                            <div className="text-xs sm:text-sm font-bold truncate leading-tight">
                              {option.label}
                            </div>
                            {option.sublabel && (
                              <div
                                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                                className="text-[10px] sm:text-[11px] opacity-80 truncate leading-normal"
                              >
                                {option.sublabel}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <Check
                            className="h-4.5 w-4.5 shrink-0 stroke-[3]"
                            style={{ color: 'var(--md-sys-color-primary)' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
