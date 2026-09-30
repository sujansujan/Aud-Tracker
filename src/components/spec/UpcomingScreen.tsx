import React, { useState } from 'react';
import { useSpecTracker, ComputedBookItem } from '../../context/SpecTrackerContext';
import { formatCountdown, getDaysBetween } from '../../utils/clock';
import { RefreshCw, Archive, UserMinus, EyeOff, ArrowUpDown, Search } from 'lucide-react';

export const UpcomingScreen: React.FC = () => {
  const {
    getComputedBooks,
    setSelectedBookId,
    setActiveTab,
    unfollowBook,
    archiveBook,
    unarchiveBook,
    dismissBook,
    clock,
    syncNow,
    isSyncing,
    settings,
  } = useSpecTracker();

  const [filter, setFilter] = useState<'UPCOMING' | 'RELEASED' | 'ARCHIVED'>('UPCOMING');
  const [sortBy, setSortBy] = useState<'release_date' | 'recently_added' | 'title'>('release_date');

  const items = getComputedBooks(filter, sortBy);

  // Group into sections by time for 'UPCOMING'
  const sections = React.useMemo(() => {
    if (filter !== 'UPCOMING') {
      return [{ title: filter === 'RELEASED' ? 'Released' : 'Archived', items }];
    }

    const thisWeek: ComputedBookItem[] = [];
    const thisMonth: ComputedBookItem[] = [];
    const later: ComputedBookItem[] = [];
    const tba: ComputedBookItem[] = [];

    for (const item of items) {
      if (!item.book.releaseDate || item.book.dateConfidence === 'TBA') {
        tba.push(item);
        continue;
      }

      const days = getDaysBetween(item.book.releaseDate, clock);
      if (days <= 7) {
        thisWeek.push(item);
      } else if (days <= 30) {
        thisMonth.push(item);
      } else {
        later.push(item);
      }
    }

    const result = [];
    if (thisWeek.length > 0) result.push({ title: 'This week', items: thisWeek });
    if (thisMonth.length > 0) result.push({ title: 'This month', items: thisMonth });
    if (later.length > 0) result.push({ title: 'Later', items: later });
    if (tba.length > 0) result.push({ title: 'Date to be announced', items: tba });

    return result;
  }, [items, filter, clock]);

  return (
    <div className="pb-24 max-w-2xl mx-auto px-4 pt-3 space-y-4">
      {/* Top App Bar (Strict: No greeting, no welcome text, no name) */}
      <div className="flex items-center justify-between border-b pb-2.5">
        <h1 className="text-xl font-medium tracking-tight text-[var(--md-sys-color-on-surface)]">
          Upcoming
        </h1>

        <div className="flex items-center gap-2">
          {/* Subtle Last Updated & Pull-to-refresh */}
          {settings.lastSyncedAt && (
            <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] hidden sm:inline">
              Updated {new Date(settings.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <button
            type="button"
            onClick={() => syncNow()}
            disabled={isSyncing}
            className="p-1.5 rounded-md hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer text-[var(--md-sys-color-on-surface-variant)] disabled:opacity-50"
            title="Refresh"
            aria-label="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Chips & Sort Controls */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 shrink-0">
          {(['UPCOMING', 'RELEASED', 'ARCHIVED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                filter === tab
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]'
                  : 'bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              {tab === 'UPCOMING' ? 'Upcoming' : tab === 'RELEASED' ? 'Released' : 'Archived'}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1 shrink-0">
          <ArrowUpDown className="h-3.5 w-3.5 text-[var(--md-sys-color-on-surface-variant)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-transparent border-0 text-[var(--md-sys-color-on-surface-variant)] cursor-pointer outline-none"
            aria-label="Sort by"
          >
            <option value="release_date">Release date</option>
            <option value="recently_added">Recently added</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Book List / Empty State */}
      {items.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)]">Nothing to show yet.</p>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] cursor-pointer hover:opacity-90 inline-flex items-center gap-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            Search audiobooks
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="space-y-1">
              {filter === 'UPCOMING' && (
                <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] px-1 py-1">
                  {section.title}
                </h2>
              )}

              {/* Flat list with hairline dividers */}
              <div className="divide-y divide-[var(--md-sys-color-outline)] border-t border-b border-[var(--md-sys-color-outline)]">
                {section.items.map((item) => {
                  const countdown = formatCountdown(item.book.releaseDate, item.book.dateConfidence, clock);

                  return (
                    <div
                      key={item.book.id}
                      className="py-3 flex gap-3.5 items-start hover:bg-[var(--md-sys-color-surface-container-low)] transition px-1 cursor-pointer group"
                      onClick={() => setSelectedBookId(item.book.id)}
                    >
                      {/* Cover Thumbnail: 56x84 dp with 4 dp radius */}
                      <div className="w-14 h-21 shrink-0 rounded-[4px] overflow-hidden bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline)] relative">
                        {item.book.coverUrl ? (
                          <img
                            src={item.book.coverUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                            Cover
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        {/* Title */}
                        <h3 className="text-sm font-medium text-[var(--md-sys-color-on-surface)] leading-snug line-clamp-2">
                          {item.book.title}
                        </h3>

                        {/* Author */}
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                          {item.primaryAuthor.name}
                        </p>

                        {/* Series & Position */}
                        {item.series && (
                          <p className="text-[11px] text-[var(--md-sys-color-secondary)] truncate">
                            {item.series.name} {item.book.seriesPosition ? `#${item.book.seriesPosition}` : ''}
                          </p>
                        )}

                        {/* Date & Countdown (Most prominent metadata) */}
                        <div className="pt-1 flex flex-wrap items-baseline gap-x-2 text-xs">
                          <span className="font-medium text-[var(--md-sys-color-primary)] tabular-nums">
                            {item.book.releaseDate || 'Date to be announced'}
                          </span>
                          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
                            · {countdown.text}
                          </span>
                        </div>

                        {/* Date Changed Badge (Exclusive amber accent, previous date shown) */}
                        {item.dateChangedRecent && (
                          <div className="pt-0.5 flex items-center gap-1 text-[11px] text-[var(--md-sys-color-accent-amber)] font-medium">
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[var(--md-sys-color-accent-amber-container)] text-[var(--md-sys-color-on-accent-amber)]">
                              Date changed
                            </span>
                            {item.previousDate && (
                              <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)]">
                                Was {item.previousDate}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Source Caption: "Followed", "By {author}", or "In {series}" */}
                        <div className="pt-0.5 text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                          {item.sourceCaption}
                        </div>
                      </div>

                      {/* Row Actions: Archive/Unfollow (direct) or Dismiss (indirect) */}
                      <div className="shrink-0 flex items-center gap-1 self-center" onClick={(e) => e.stopPropagation()}>
                        {item.isDirectFollow ? (
                          <>
                            {item.isArchived ? (
                              <button
                                type="button"
                                onClick={() => unarchiveBook(item.book.id)}
                                className="p-1.5 rounded text-xs text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                                title="Unarchive"
                              >
                                Unarchive
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => archiveBook(item.book.id)}
                                className="p-1.5 rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                                title="Archive"
                                aria-label="Archive book"
                              >
                                <Archive className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => unfollowBook(item.book.id)}
                              className="p-1.5 rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                              title="Unfollow"
                              aria-label="Unfollow book"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => dismissBook(item.book.id)}
                            className="p-1.5 rounded text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                            title="Dismiss from list"
                            aria-label="Dismiss book from list"
                          >
                            <EyeOff className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
