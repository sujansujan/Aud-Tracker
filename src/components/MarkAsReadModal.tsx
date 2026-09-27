import React, { useState } from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { X, Star, Calendar, Clock, Check, RotateCcw } from 'lucide-react';

interface MarkAsReadModalProps {
  book: Audiobook | null;
  onClose: () => void;
}

export const MarkAsReadModal: React.FC<MarkAsReadModalProps> = ({ book, onClose }) => {
  const { markAsRead, markAsUnread } = useTracker();

  if (!book) return null;

  // Initialize with current local time (or existing recorded time)
  const defaultIso = book.readCompletedAt
    ? book.readCompletedAt.slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  const [completedDateTime, setCompletedDateTime] = useState(defaultIso);
  const [durationHours, setDurationHours] = useState(book.listeningDurationHours || book.runtimeHours || 12);
  const [rating, setRating] = useState<number>(book.userPersonalRating || 5);
  const [notes, setNotes] = useState(book.userNotes || '');

  const handleSave = () => {
    markAsRead(book.id, {
      completedAt: completedDateTime ? new Date(completedDateTime).toISOString() : new Date().toISOString(),
      durationHours: Number(durationHours) || 0,
      rating: Number(rating) || 5,
      notes: notes.trim(),
    });
    onClose();
  };

  const handleUnread = () => {
    markAsUnread(book.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Log Listening Completion</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">{book.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Date and Exact Time Read Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Date & Time You Finished Listening:</span>
          </label>
          <input
            type="datetime-local"
            value={completedDateTime}
            onChange={(e) => setCompletedDateTime(e.target.value)}
            className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 tabular-nums cursor-pointer"
          />
        </div>

        {/* Listening Hours / Runtime */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Listening Duration Logged (Hours):</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="150"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              className="w-32 h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500 tabular-nums"
            />
            <span className="text-xs text-slate-400">
              Total runtime: ~{book.runtimeHours || 12} hrs
            </span>
          </div>
        </div>

        {/* Personal Star Rating */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Your Personal Audio Rating:
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 text-slate-600 hover:text-amber-400 transition cursor-pointer"
              >
                <Star
                  className={`h-7 w-7 ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-amber-400 ml-2">
              {rating} of 5 Stars
            </span>
          </div>
        </div>

        {/* Listening Notes & Thoughts */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Listening Notes & Narrator Review (Optional):
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How was the narration? Favorite character voices? Audio pacing?"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
          {book.isRead ? (
            <button
              onClick={handleUnread}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Mark Unread</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Save to History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
