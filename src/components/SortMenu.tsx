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

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
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

      {/* Material 3 Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface)',
            borderColor: 'var(--md-sys-color-outline-variant)',
            boxShadow: 'var(--md-elevation-3)',
          }}
          className="absolute right-0 top-full mt-2 w-80 sm:w-88 rounded-3xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none max-h-[85vh] flex flex-col"
        >
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
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Sort &amp; Filter
              </span>
            </div>
            {hasActiveModifiers && (
              <button
                type="button"
                onClick={() => {
                  setViewFilter('all');
                  onSelectSort('release_soonest');
                }}
                style={{ color: 'var(--md-sys-color-primary)' }}
                className="text-[11px] font-bold hover:underline cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Scrollable Options */}
          <div className="overflow-y-auto p-3 space-y-4">
            {/* SECTION 1: Status & View Filters (Incorporated from the filter bar!) */}
            <div className="space-y-1.5">
              <span
                style={{ color: 'var(--md-sys-color-primary)' }}
                className="text-[10px] font-extrabold uppercase tracking-wider block px-1"
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
                      onClick={() => setViewFilter(filter.id)}
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--md-sys-color-primary-container)'
                          : 'transparent',
                        color: isSelected
                          ? 'var(--md-sys-color-on-primary-container)'
                          : 'var(--md-sys-color-on-surface)',
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-2xl text-left transition cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] active:scale-98"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={{
                            color: isSelected
                              ? 'var(--md-sys-color-primary)'
                              : 'var(--md-sys-color-on-surface-variant)',
                          }}
                        />
                        <span className="text-xs font-bold">{filter.label}</span>
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
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
                        >
                          {filter.count}
                        </span>
                        {isSelected && (
                          <Check
                            className="h-4 w-4 stroke-[3]"
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
                className="text-[10px] font-extrabold uppercase tracking-wider block px-1"
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
                      className="w-full flex items-center justify-between p-2 rounded-2xl text-left transition cursor-pointer hover:bg-[var(--md-sys-color-surface-container)] active:scale-98"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <Icon
                          className="h-4 w-4 shrink-0"
                          style={{
                            color: isSelected
                              ? 'var(--md-sys-color-primary)'
                              : 'var(--md-sys-color-on-surface-variant)',
                          }}
                        />
                        <div className="min-w-0 truncate">
                          <div className="text-xs font-bold truncate leading-tight">
                            {option.label}
                          </div>
                          {option.sublabel && (
                            <div
                              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                              className="text-[10px] opacity-80 truncate leading-normal"
                            >
                              {option.sublabel}
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <Check
                          className="h-4 w-4 shrink-0 stroke-[3]"
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
      )}
    </div>
  );
};
