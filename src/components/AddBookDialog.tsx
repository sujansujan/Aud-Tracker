import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { fetchAudibleApiMetadata, isEnglishAudiobook, isMuted, getASIN } from '../services/audibleApiService';
import { X, Plus, Sparkles, Loader2, ArrowRight, Layers, User, Mic, BookOpen } from 'lucide-react';
import { parseAudibleUrl } from '../utils/audibleParser';

interface AddBookDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_URLS = [
  { label: 'Wind and Truth (Book)', url: 'https://www.audible.com/pd/Wind-and-Truth-Audiobook/B0D5B7L9K3' },
  { label: 'Brandon Sanderson (Author)', url: 'https://www.audible.com/author/Brandon-Sanderson/B001IGFHW6' },
  { label: 'Dungeon Crawler Carl (Series)', url: 'https://www.audible.com/series/Dungeon-Crawler-Carl-Audiobooks/B08V81GY52' },
  { label: 'Jeff Hays (Narrator)', url: 'https://www.audible.com/narrator/Jeff-Hays/B00TGB8A1S' },
];

export const AddBookDialog: React.FC<AddBookDialogProps> = ({ isOpen, onClose }) => {
  const { addBook, books, muteList, addWatchlistTarget, preferences, scanSingleTarget } = useTracker();

  const [inputUrl, setInputUrl] = useState('');
  const [targetType, setTargetType] = useState<'Title' | 'Series' | 'Author' | 'Narrator'>(
    preferences?.defaultSearchMode || 'Title'
  );
  const [statusText, setStatusText] = useState("Paste link or enter search term, then click 'Fetch & Add'.");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFetchAndAdd = async () => {
    const raw = inputUrl.trim();
    if (!raw) {
      alert('Please enter an Audible URL or search query.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Explicit Series URL or Mode
      if (raw.includes('/series/') || targetType === 'Series') {
        setStatusText('Scanning series catalog and upcoming sequels...');
        const parsed = parseAudibleUrl(raw);
        const seriesName = parsed.extractedName || raw.replace(/https?:\/\/[^\s]+/g, '').trim() || raw;
        
        const newTarget = {
          id: `w-series-${Date.now()}`,
          type: 'Series' as const,
          name: seriesName,
          url: raw.startsWith('http') ? raw : `https://www.audible.com/search?keywords=${encodeURIComponent(seriesName)}`,
        };
        addWatchlistTarget(newTarget);
        const imported = await scanSingleTarget(newTarget);
        setStatusText(`Tracked Series "${seriesName}"! Imported ${imported} release(s).`);
        setTimeout(() => onClose(), 1500);
        return;
      }

      // 2. Explicit Author URL or Mode
      if (raw.includes('/author/') || targetType === 'Author') {
        setStatusText('Scanning author catalog for upcoming releases...');
        const parsed = parseAudibleUrl(raw);
        const authorName = parsed.extractedName || raw.replace(/https?:\/\/[^\s]+/g, '').trim() || raw;
        
        const newTarget = {
          id: `w-author-${Date.now()}`,
          type: 'Author' as const,
          name: authorName,
          url: raw.startsWith('http') ? raw : `https://www.audible.com/search?searchAuthor=${encodeURIComponent(authorName)}`,
        };
        addWatchlistTarget(newTarget);
        const imported = await scanSingleTarget(newTarget);
        setStatusText(`Tracked Author "${authorName}"! Imported ${imported} release(s).`);
        setTimeout(() => onClose(), 1500);
        return;
      }

      // 3. Explicit Narrator URL or Mode
      if (raw.includes('/narrator/') || raw.includes('searchNarrator=') || targetType === 'Narrator') {
        setStatusText('Scanning narrator catalog for upcoming releases...');
        const parsed = parseAudibleUrl(raw);
        const narratorName = parsed.extractedName || raw.replace(/https?:\/\/[^\s]+/g, '').trim() || raw;
        
        const newTarget = {
          id: `w-narrator-${Date.now()}`,
          type: 'Narrator' as const,
          name: narratorName,
          url: raw.startsWith('http') ? raw : `https://www.audible.com/search?searchNarrator=${encodeURIComponent(narratorName)}`,
        };
        addWatchlistTarget(newTarget);
        const imported = await scanSingleTarget(newTarget);
        setStatusText(`Tracked Narrator "${narratorName}"! Imported ${imported} release(s).`);
        setTimeout(() => onClose(), 1500);
        return;
      }

      // 4. Query Audible API for Book
      setStatusText('Querying Audible live API...');
      const metadata = await fetchAudibleApiMetadata(raw);

      if (!metadata) {
        setStatusText('Failed to extract details. Verify the URL or search term.');
        setIsLoading(false);
        return;
      }

      // Language check (from AHK)
      if (!isEnglishAudiobook(metadata.language, metadata.title)) {
        if (!window.confirm(`This audiobook appears to be in '${metadata.language}', not English.\n\nDo you still want to track it?`)) {
          setStatusText('Import cancelled (Non-English edition).');
          setIsLoading(false);
          return;
        }
      }

      // Mute check (from AHK)
      if (isMuted(metadata.seriesName, metadata.title, metadata.author, muteList)) {
        alert('This title matches an active rule in your Mute List and was ignored.');
        onClose();
        return;
      }

      const asin = getASIN(raw);
      const cleanUrl = asin ? `https://www.audible.com/pd/${asin}` : raw;

      addBook({
        id: `ab-api-${asin || Date.now()}`,
        title: metadata.title,
        seriesName: metadata.seriesName,
        seriesUrl: metadata.seriesUrl,
        series: metadata.seriesName !== '—' ? { name: metadata.seriesName, bookNumber: metadata.seriesSequence } : undefined,
        author: metadata.author,
        authorUrl: metadata.authorUrl,
        narrator: metadata.narrator,
        narrators: metadata.narrator.split(', ').filter(Boolean),
        releaseDate: metadata.releaseDate,
        coverUrl: metadata.coverUrl,
        genre: metadata.genre || 'Sci-Fi',
        runtimeHours: metadata.runtimeHours || 12,
        audibleRating: metadata.rating || 4.8,
        ratingCount: metadata.ratingCount || 1200,
        synopsis: metadata.synopsis || `Audible audio edition of "${metadata.title}" by ${metadata.author}.`,
        audibleUrl: cleanUrl,
        url: cleanUrl,
        downloaded: 'No',
        listened: 'No',
        isRead: false,
        reminders: {
          oneWeekBefore: true,
          oneDayBefore: true,
          dayOfRelease: true,
        },
      });

      setStatusText(`Added "${metadata.title}"!`);
      setTimeout(() => onClose(), 1000);
    } catch {
      setStatusText('Error connecting to Audible API. Please verify the URL.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-400 stroke-[2.5]" />
            <span>Add Audiobook, Series, or Author</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 block">
            Target Type (Auto-detected if URL is pasted):
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTargetType('Title')}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                targetType === 'Title'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3 w-3" />
              <span>Book</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType('Series')}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                targetType === 'Series'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>Series</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType('Author')}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                targetType === 'Author'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="h-3 w-3" />
              <span>Author</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetType('Narrator')}
              className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                targetType === 'Narrator'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="h-3 w-3" />
              <span>Narrator</span>
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            {targetType === 'Series'
              ? 'Enter Series Name or Audible Series Link:'
              : targetType === 'Author'
              ? 'Enter Author Name or Audible Author Link:'
              : targetType === 'Narrator'
              ? 'Enter Narrator Name or Audible Narrator Link:'
              : 'Enter Book Title, ASIN, or Audible Link:'}
          </label>
          <textarea
            rows={3}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={
              targetType === 'Series'
                ? 'e.g. Dungeon Crawler Carl, Bobiverse, or /series/... link'
                : targetType === 'Author'
                ? 'e.g. Brandon Sanderson, Matt Dinniman, or /author/... link'
                : targetType === 'Narrator'
                ? 'e.g. Jeff Hays, Ray Porter, or /narrator/... link'
                : 'e.g. Project Hail Mary, B0D5B7L9K3, or /pd/... link'
            }
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none font-mono"
            autoFocus
          />
        </div>

        {/* Live Status text */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2 text-xs">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          )}
          <span className={isLoading ? 'text-amber-300 font-semibold' : 'text-slate-400'}>
            {statusText}
          </span>
        </div>

        {/* 1-Click Samples */}
        <div className="space-y-1 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Or try these popular samples:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {SAMPLE_URLS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setInputUrl(s.url);
                  if (s.label.includes('Series')) setTargetType('Series');
                  else if (s.label.includes('Author')) setTargetType('Author');
                  else if (s.label.includes('Narrator')) setTargetType('Narrator');
                  else setTargetType('Title');
                }}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left text-[11px] text-slate-300 hover:text-white transition flex items-center justify-between"
              >
                <span className="truncate">{s.label}</span>
                <ArrowRight className="h-3 w-3 text-slate-500 shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFetchAndAdd}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 stroke-[2.5]" />}
            <span>Fetch &amp; Add</span>
          </button>
        </div>

      </div>
    </div>
  );
};
