import React, { useState } from 'react';
import { Audiobook } from '../types/audiobook';
import { useTracker } from '../context/TrackerContext';
import { X, Star, Calendar, Clock, Check, RotateCcw } from 'lucide-react';

interface MarkAsReadModalProps {
  book: Audiobook | null;
  onClose: () => void;
}

export const MarkAsReadModal: React.FC<MarkAsReadModalProps> = ({ book, onClose }) => {
  const { markAsRead, markAsUnread, showToast } = useTracker();

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
    showToast(`Marked "${book.title}" as Read! ⭐`, 'success');
    onClose();
  };

  const handleUnread = () => {
    markAsUnread(book.id);
    showToast(`Reset read status for "${book.title}"`, 'info');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          borderColor: 'var(--md-sys-color-outline-variant)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border sm:border p-5 sm:p-6 space-y-5 select-none transition-colors duration-200 animate-in slide-in-from-bottom sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mb-2 sm:hidden shrink-0" />
        {/* Header */}
        <div
          style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
          className="flex items-center justify-between pb-3 border-b"
        >
          <div>
            <h3 className="font-display text-lg font-bold">Log Listening Completion</h3>
            <p
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              className="text-xs mt-0.5 truncate max-w-[260px]"
            >
              {book.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="md-btn-icon shadow-xs"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Date and Exact Time Read Picker */}
        <div className="space-y-1.5">
          <label
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--md-sys-color-primary)' }} />
            <span>Date &amp; Time Completed:</span>
          </label>
          <input
            type="datetime-local"
            value={completedDateTime}
            onChange={(e) => setCompletedDateTime(e.target.value)}
            className="md-input w-full min-h-[44px] px-3.5 text-xs sm:text-sm font-medium rounded-2xl tabular-nums cursor-pointer"
          />
        </div>

        {/* Listening Hours / Runtime */}
        <div className="space-y-1.5">
          <label
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider"
          >
            <Clock className="h-3.5 w-3.5" style={{ color: 'var(--md-sys-color-secondary)' }} />
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
              className="md-input w-32 min-h-[44px] px-3 text-xs sm:text-sm font-bold rounded-2xl tabular-nums"
            />
            <span
              style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              className="text-xs"
            >
              Catalog runtime: ~{book.runtimeHours || 12} hrs
            </span>
          </div>
        </div>

        {/* Personal Star Rating */}
        <div className="space-y-1.5">
          <label
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs font-bold uppercase tracking-wider block"
          >
            Your Personal Audio Rating:
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((starVal) => (
              <button
                key={starVal}
                type="button"
                onClick={() => setRating(starVal)}
                className="p-1 transition-transform active:scale-90 cursor-pointer"
                title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    starVal <= rating
                      ? 'fill-current'
                      : 'stroke-current fill-transparent opacity-30'
                  }`}
                  style={{
                    color: starVal <= rating ? 'var(--md-sys-color-accent-yellow)' : 'var(--md-sys-color-outline)',
                  }}
                />
              </button>
            ))}
            <span
              style={{ color: 'var(--md-sys-color-accent-yellow)' }}
              className="text-xs font-extrabold ml-2"
            >
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Personal Notes / Review */}
        <div className="space-y-1.5">
          <label
            style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            className="text-xs font-bold uppercase tracking-wider block"
          >
            Private Notes &amp; Thoughts:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you think of the narration, pacing, or cliffhangers?"
            className="md-input w-full p-3 text-xs sm:text-sm rounded-2xl resize-none"
          />
        </div>

        {/* Actions */}
        <div
          style={{ borderColor: 'var(--md-sys-color-outline-variant)' }}
          className="flex items-center justify-between pt-3 border-t gap-2"
        >
          {book.isRead ? (
            <button
              type="button"
              onClick={handleUnread}
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container)',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
              className="min-h-[44px] px-3.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Mark Unread</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="md-btn-tonal min-h-[44px] px-4 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="md-btn-fab min-h-[44px] px-5 text-xs font-bold"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Save Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
