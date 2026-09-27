import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { Headphones, Square, Play, Volume2, X } from 'lucide-react';
import { audioPlayer } from '../utils/audioPreview';

export const FloatingAudioBar: React.FC = () => {
  const { activeAudio, books } = useTracker();

  if (!activeAudio.isPlaying || !activeAudio.bookId) {
    return null;
  }

  const book = books.find((b) => b.id === activeAudio.bookId);
  if (!book) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-3 duration-200">
      <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-md flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Headphones className="h-4 w-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Previewing Voice Sample
              </span>
              <p className="text-xs font-bold text-white truncate max-w-[210px]">
                {book.title}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {book.narrators.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => audioPlayer.stop()}
              aria-label="Stop playback"
              className="p-2 rounded-lg bg-slate-800 text-amber-400 hover:text-white transition cursor-pointer"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
            <button
              onClick={() => audioPlayer.stop()}
              aria-label="Close sample player"
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100"
            style={{ width: `${activeAudio.progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
