import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Audiobook } from '../types/audiobook';
import { BookOpenCheck, Clock, Star, Calendar, Edit3, Trash2, Headphones, Sparkles } from 'lucide-react';

interface ReadingHistoryViewProps {
  onSelectBook: (book: Audiobook) => void;
  onEditLog: (book: Audiobook) => void;
}

export const ReadingHistoryView: React.FC<ReadingHistoryViewProps> = ({
  onSelectBook,
  onEditLog,
}) => {
  const { books, markAsUnread } = useTracker();
  const readBooks = books.filter((b) => b.isRead);

  // Calculate statistics
  const totalHours = readBooks.reduce((acc, b) => acc + (b.listeningDurationHours || b.runtimeHours || 0), 0);
  const ratedBooks = readBooks.filter((b) => b.userPersonalRating);
  const avgRating = ratedBooks.length
    ? (ratedBooks.reduce((acc, b) => acc + (b.userPersonalRating || 0), 0) / ratedBooks.length).toFixed(1)
    : '5.0';

  // Find top narrator
  const narratorCounts: Record<string, number> = {};
  readBooks.forEach((b) => {
    b.narrators.forEach((n) => {
      narratorCounts[n] = (narratorCounts[n] || 0) + 1;
    });
  });
  let topNarrator = 'Jeff Hays';
  let topCount = 0;
  Object.entries(narratorCounts).forEach(([name, count]) => {
    if (count > topCount) {
      topCount = count;
      topNarrator = name;
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Listening Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Audiobooks Finished
          </span>
          <span className="font-display text-2xl font-bold text-amber-400 mt-1 block tabular-nums">
            {readBooks.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Logged in library</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Hours Listened
          </span>
          <span className="font-display text-2xl font-bold text-amber-400 mt-1 block tabular-nums">
            {totalHours.toFixed(1)}h
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Total narration time</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Average Rating
          </span>
          <span className="font-display text-2xl font-bold text-amber-400 mt-1 block tabular-nums flex items-center gap-1">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            {avgRating}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Your personal average</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Top Voice Narrator
          </span>
          <span className="font-display text-base font-bold text-white mt-1 block truncate">
            {readBooks.length > 0 ? topNarrator : '—'}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Most listened voice</span>
        </div>
      </div>

      {/* Finished List Table / Rows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5 text-emerald-400" />
            <span>Listening Log & Finished Audiobooks</span>
          </h3>
          <span className="text-xs text-slate-400 tabular-nums">
            {readBooks.length} titles recorded
          </span>
        </div>

        {readBooks.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <Headphones className="h-10 w-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Audiobooks Finished Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Whenever you complete an audiobook, click "Mark Read" on any upcoming release or backlog book to record the exact completion date and time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {readBooks.map((book) => {
              const formattedDate = book.readCompletedAt
                ? new Date(book.readCompletedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              const formattedTime = book.readCompletedAt
                ? new Date(book.readCompletedAt).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={book.id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 shrink-0 rounded-xl object-cover bg-slate-800 shadow"
                    />
                    <div className="min-w-0">
                      <h4
                        onClick={() => onSelectBook(book)}
                        className="font-display text-sm font-bold text-white hover:text-amber-400 cursor-pointer truncate"
                      >
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        By {book.author} · Narrated by {book.narrators.join(', ')}
                      </p>
                      
                      {/* Log Timestamp (Date & Time finished) */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold tabular-nums">
                          <Calendar className="h-3 w-3" /> Finished: {formattedDate} {formattedTime && `at ${formattedTime}`}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 tabular-nums text-slate-300">
                          <Clock className="h-3 w-3 text-amber-400" />
                          {book.listeningDurationHours || book.runtimeHours} hrs logged
                        </span>
                        {book.userPersonalRating && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="flex items-center gap-0.5 text-amber-400 font-bold tabular-nums">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {book.userPersonalRating}/5
                            </span>
                          </>
                        )}
                      </div>

                      {book.userNotes && (
                        <p className="text-xs text-slate-300 italic mt-2 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                          "{book.userNotes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onEditLog(book)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit Log</span>
                    </button>
                    <button
                      onClick={() => markAsUnread(book.id)}
                      title="Move back to release tracker"
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    >
                      Mark Unread
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
