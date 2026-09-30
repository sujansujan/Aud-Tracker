import React, { useState, useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { Audiobook } from '../../types/audiobook';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Filter,
  Download,
  BookOpen,
  Clock,
} from 'lucide-react';

export const CalendarScreen: React.FC = () => {
  const { books, setSelectedBook } = useTracker();
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 8, 1)); // September 2026
  const [selectedDayStr, setSelectedDayStr] = useState<string>('2026-09-27');
  const [filterFollowedOnly, setFilterFollowedOnly] = useState(false);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (filterFollowedOnly && !b.isFollowed) return false;
      return true;
    });
  }, [books, filterFollowedOnly]);

  // Group books by date (YYYY-MM-DD)
  const booksByDate = useMemo(() => {
    const map: Record<string, Audiobook[]> = {};
    for (const b of filteredBooks) {
      if (!map[b.releaseDate]) {
        map[b.releaseDate] = [];
      }
      map[b.releaseDate].push(b);
    }
    return map;
  }, [filteredBooks]);

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  // Generate calendar grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const calendarDays: Array<{ dayNumber: number; dateStr: string; releases: Audiobook[] } | null> = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    calendarDays.push({
      dayNumber: d,
      dateStr,
      releases: booksByDate[dateStr] || [],
    });
  }

  // Selected Day releases
  const selectedDayReleases = booksByDate[selectedDayStr] || [];

  // Agenda view grouped items
  const sortedDatesWithReleases = Object.keys(booksByDate)
    .sort()
    .filter((d) => booksByDate[d].length > 0);

  // Add to Calendar (.ics format download)
  const downloadIcs = (book: Audiobook) => {
    const cleanDate = book.releaseDate.replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Audible Release Tracker//EN',
      'BEGIN:VEVENT',
      `UID:audiobook-${book.id}@audibletracker.app`,
      `DTSTAMP:${cleanDate}T090000Z`,
      `DTSTART;VALUE=DATE:${cleanDate}`,
      `DTEND;VALUE=DATE:${cleanDate}`,
      `SUMMARY:🎧 ${book.title} (Audible Release)`,
      `DESCRIPTION:${book.title} by ${book.author}. Narrated by ${book.narrator || book.narrators.join(', ')}.\\n${book.audibleUrl || ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_release.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-5">
      {/* Top Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
            Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Release Calendar
          </h1>
        </div>

        {/* View Toggle (Month vs Agenda) */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="p-1 rounded-2xl border flex items-center gap-1"
        >
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'month'
                ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
                : 'text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <Grid className="h-3.5 w-3.5" /> Month
          </button>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-[var(--md-sys-color-primary)] text-white shadow-xs'
                : 'text-[var(--md-sys-color-on-surface-variant)]'
            }`}
          >
            <List className="h-3.5 w-3.5" /> Agenda
          </button>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold">
          <input
            type="checkbox"
            checked={filterFollowedOnly}
            onChange={(e) => setFilterFollowedOnly(e.target.checked)}
            className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)]"
          />
          Show Followed Only
        </label>
        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-medium">
          {filteredBooks.length} release dates tracked
        </span>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' ? (
        <div className="space-y-4">
          {/* Month Header */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="rounded-3xl border p-4 shadow-xs"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight">
                {monthName} {year}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 rounded-xl hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
                  aria-label="Next Month"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] mb-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((item, idx) => {
                if (!item) {
                  return <div key={`empty-${idx}`} className="h-12 sm:h-16 rounded-xl opacity-20" />;
                }
                const isSelected = selectedDayStr === item.dateStr;
                const hasReleases = item.releases.length > 0;

                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDayStr(item.dateStr)}
                    style={{
                      backgroundColor: isSelected
                        ? 'var(--md-sys-color-primary-container)'
                        : hasReleases
                        ? 'var(--md-sys-color-surface-container-low)'
                        : 'transparent',
                      borderColor: isSelected
                        ? 'var(--md-sys-color-primary)'
                        : 'transparent',
                    }}
                    className={`h-12 sm:h-16 rounded-2xl border p-1 flex flex-col items-center justify-between transition cursor-pointer relative ${
                      isSelected ? 'ring-2 ring-[var(--md-sys-color-primary)] font-bold' : ''
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        isSelected
                          ? 'text-[var(--md-sys-color-on-primary-container)] font-extrabold'
                          : 'text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      {item.dayNumber}
                    </span>

                    {hasReleases && (
                      <div className="flex items-center gap-0.5">
                        <span className="h-2 w-2 rounded-full bg-[var(--md-sys-color-primary)] shadow-xs" />
                        {item.releases.length > 1 && (
                          <span className="text-[9px] font-extrabold text-[var(--md-sys-color-primary)]">
                            {item.releases.length}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DAY DETAILS CARD */}
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface)',
              borderColor: 'var(--md-sys-color-outline-variant)',
            }}
            className="rounded-3xl border p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4.5 w-4.5 text-[var(--md-sys-color-primary)]" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider">
                  Releases on {selectedDayStr}
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                {selectedDayReleases.length} {selectedDayReleases.length === 1 ? 'Release' : 'Releases'}
              </span>
            </div>

            {selectedDayReleases.length === 0 ? (
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] py-4 text-center">
                No audiobooks releasing on this date.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDayReleases.map((book) => (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: 'var(--md-sys-color-surface-container-low)',
                      borderColor: 'var(--md-sys-color-outline-variant)',
                    }}
                    className="rounded-2xl border p-3 flex items-center justify-between gap-3 cursor-pointer transition hover:shadow-xs"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-[var(--md-sys-color-primary)] uppercase">
                          {book.genre}
                        </span>
                        <h4 className="text-sm font-bold truncate">{book.title}</h4>
                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                          By {book.author} · Narrated by {book.narrator || book.narrators.join(', ')}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadIcs(book);
                      }}
                      className="p-2 rounded-xl border hover:bg-[var(--md-sys-color-surface)] cursor-pointer shrink-0"
                      title="Add to Google / Device Calendar"
                    >
                      <Download className="h-4 w-4 text-[var(--md-sys-color-primary)]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* AGENDA / LIST VIEW */
        <div className="space-y-4">
          {sortedDatesWithReleases.map((dateStr) => {
            const list = booksByDate[dateStr];
            return (
              <div key={dateStr} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--md-sys-color-primary)]" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
                    {dateStr}
                  </span>
                </div>

                <div className="space-y-2 pl-4 border-l-2 border-[var(--md-sys-color-outline-variant)]">
                  {list.map((book) => (
                    <div
                      key={book.id}
                      style={{
                        backgroundColor: 'var(--md-sys-color-surface)',
                        borderColor: 'var(--md-sys-color-outline-variant)',
                      }}
                      className="rounded-2xl border p-3 flex items-center justify-between gap-3 cursor-pointer transition hover:shadow-xs"
                      onClick={() => setSelectedBook(book)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold truncate">{book.title}</h4>
                          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                            By {book.author}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadIcs(book);
                        }}
                        className="p-2 rounded-xl border hover:bg-[var(--md-sys-color-surface)] cursor-pointer shrink-0"
                        title="Add to Google / Device Calendar"
                      >
                        <Download className="h-4 w-4 text-[var(--md-sys-color-primary)]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
