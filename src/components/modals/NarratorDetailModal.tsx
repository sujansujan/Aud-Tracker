import React from 'react';
import { useTracker } from '../../context/TrackerContext';
import { X, Check, Plus, Mic, Star } from 'lucide-react';

export const NarratorDetailModal: React.FC = () => {
  const {
    selectedNarrator,
    setSelectedNarrator,
    books,
    isNarratorFollowed,
    toggleFollowNarrator,
    setSelectedBook,
  } = useTracker();

  if (!selectedNarrator) return null;

  const narrator = selectedNarrator;
  const isFollowed = isNarratorFollowed(narrator.name);
  const narratorBooks = books.filter(
    (b) =>
      b.narrators.some((n) => n.toLowerCase().includes(narrator.name.toLowerCase())) ||
      (b.narrator && b.narrator.toLowerCase().includes(narrator.name.toLowerCase()))
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={() => setSelectedNarrator(null)}
    >
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface)',
          color: 'var(--md-sys-color-on-surface)',
          boxShadow: 'var(--md-elevation-3)',
        }}
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl border sm:border overflow-hidden select-none animate-in slide-in-from-bottom sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-secondary)]">
            Narrator Profile
          </span>
          <button
            type="button"
            onClick={() => setSelectedNarrator(null)}
            className="p-1.5 rounded-full hover:bg-[var(--md-sys-color-surface-container)] cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={narrator.imageUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250'}
              alt={narrator.name}
              className="w-16 h-16 rounded-full object-cover shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-extrabold truncate">{narrator.name}</h2>
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Voice actor &amp; Audie Award narrator
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleFollowNarrator(narrator.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isFollowed
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-primary)]'
                  : 'bg-[var(--md-sys-color-primary)] text-white hover:opacity-90'
              }`}
            >
              {isFollowed ? (
                <>
                  <Check className="h-3.5 w-3.5 stroke-[3]" /> Following
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" /> Follow Narrator
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--md-sys-color-primary)]">
              Narrated Audiobooks ({narratorBooks.length})
            </h4>

            <div className="space-y-2">
              {narratorBooks.map((b) => (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    borderColor: 'var(--md-sys-color-outline-variant)',
                  }}
                  className="rounded-2xl border p-2.5 flex items-center justify-between gap-3 cursor-pointer hover:shadow-xs"
                  onClick={() => {
                    setSelectedNarrator(null);
                    setSelectedBook(b);
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={b.coverUrl}
                      alt={b.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold truncate">{b.title}</h5>
                      <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                        By {b.author} · {b.releaseDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[var(--md-sys-color-accent-yellow)]">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{b.audibleRating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
