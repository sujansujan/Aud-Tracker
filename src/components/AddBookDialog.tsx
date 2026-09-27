import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { fetchAudibleApiMetadata, isEnglishAudiobook, isMuted, getASIN, scanWatchlistTarget } from '../services/audibleApiService';
import { convertAudibleResultToAudiobook, searchAudible } from '../services/audibleCatalogService';
import { X, Plus, Sparkles, Loader2, Link, ArrowRight } from 'lucide-react';
import { parseAudibleUrl } from '../utils/audibleParser';

interface AddBookDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_URLS = [
  { label: 'Wind and Truth (Book)', url: 'https://www.audible.com/pd/Wind-and-Truth-Audiobook/B0D5B7L9K3' },
  { label: 'Brandon Sanderson (Author)', url: 'https://www.audible.com/author/Brandon-Sanderson/B001IGFHW6' },
  { label: 'Jeff Hays (Narrator)', url: 'https://www.audible.com/narrator/Jeff-Hays/B00TGB8A1S' },
  { label: 'Dungeon Crawler Carl (Series)', url: 'https://www.audible.com/series/Dungeon-Crawler-Carl-Audiobooks/B08V81GY52' },
];

export const AddBookDialog: React.FC<AddBookDialogProps> = ({ isOpen, onClose }) => {
  const { addBook, books, muteList, addWatchlistTarget } = useTracker();

  const [inputUrl, setInputUrl] = useState('');
  const [statusText, setStatusText] = useState("Paste link or search title, then click 'Fetch & Add'.");
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
      // 1. Author URL scan
      if (raw.includes('/author/')) {
        setStatusText('Scanning author catalog for upcoming releases...');
        const parsed = parseAudibleUrl(raw);
        addWatchlistTarget({
          type: 'Author',
          name: parsed.extractedName,
          url: raw,
        });
        setStatusText(`Added ${parsed.extractedName} to Author Watchlist and queued releases.`);
        setTimeout(() => onClose(), 1200);
        return;
      }

      // 2. Series URL scan
      if (raw.includes('/series/')) {
        setStatusText('Scanning series catalog for upcoming releases...');
        const parsed = parseAudibleUrl(raw);
        addWatchlistTarget({
          type: 'Series',
          name: parsed.extractedName,
          url: raw,
        });
        setStatusText(`Added ${parsed.extractedName} to Series Watchlist and queued releases.`);
        setTimeout(() => onClose(), 1200);
        return;
      }

      // 3. Narrator URL scan
      if (raw.includes('/narrator/') || raw.includes('searchNarrator=')) {
        setStatusText('Scanning narrator catalog for upcoming releases...');
        const parsed = parseAudibleUrl(raw);
        addWatchlistTarget({
          type: 'Narrator',
          name: parsed.extractedName,
          url: raw,
        });
        setStatusText(`Added ${parsed.extractedName} to Narrator Watchlist and queued releases.`);
        setTimeout(() => onClose(), 1200);
        return;
      }

      // 4. Query Audible API for Book
      setStatusText('Querying Audible API...');
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
        series: metadata.seriesName !== '—' ? { name: metadata.seriesName } : undefined,
        author: metadata.author,
        authorUrl: metadata.authorUrl,
        narrator: metadata.narrator,
        narrators: metadata.narrator.split(', ').filter(Boolean),
        releaseDate: metadata.releaseDate,
        coverUrl: metadata.coverUrl,
        genre: 'Sci-Fi',
        audibleRating: 4.8,
        ratingCount: 1540,
        synopsis: `Audible audio edition of "${metadata.title}" by ${metadata.author}.`,
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
            <span>Auto-Import Title, Author, or Series</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">
            Paste an Audible Book, Series, Author, or Narrator URL:
          </label>
          <textarea
            rows={3}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="e.g. https://www.audible.com/pd/Wind-and-Truth-Audiobook/B0D5B7L9K3&#10;or /author/... or /series/...&#10;or simply search: Project Hail Mary"
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none font-mono"
            autoFocus
          />
        </div>

        {/* Live Status text (matching AHK txtStatus) */}
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
            Or try these sample Audible targets:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {SAMPLE_URLS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setInputUrl(s.url)}
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
            <span>Fetch & Add</span>
          </button>
        </div>

      </div>
    </div>
  );
};
