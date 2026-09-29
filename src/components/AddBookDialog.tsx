import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { fetchAudibleApiMetadata, isEnglishAudiobook, isMuted, getASIN } from '../services/audibleApiService';
import {
  X,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
  BookOpen,
  Layers,
  User,
  Mic,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { parseAudibleUrl } from '../utils/audibleParser';
import { Genre, Audiobook } from '../types/audiobook';

interface AddBookDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_QUERIES = [
  'Wind and Truth',
  'Dungeon Crawler Carl',
  'Bobiverse',
  'Project Hail Mary',
  'Brandon Sanderson',
];

export const AddBookDialog: React.FC<AddBookDialogProps> = ({ isOpen, onClose }) => {
  const {
    addBook,
    books,
    muteList,
    addWatchlistTarget,
    scanSingleTarget,
    languageFilter,
    showToast,
  } = useTracker();

  // Mode: 'search' | 'manual'
  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');

  // Search tab state
  const [queryInput, setQueryInput] = useState('');
  const [searchTargetType, setSearchTargetType] = useState<'Book' | 'Series' | 'Author' | 'Narrator'>('Book');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);

  // Manual entry tab state
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthor, setManualAuthor] = useState('');
  const [manualSeries, setManualSeries] = useState('');
  const [manualBookNumber, setManualBookNumber] = useState('');
  const [manualNarrator, setManualNarrator] = useState('');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualGenre, setManualGenre] = useState<Genre>('Sci-Fi');
  const [manualCover, setManualCover] = useState('');

  if (!isOpen) return null;

  // Handle Search / Link fetch
  const handleSearchOrAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const raw = queryInput.trim();
    if (!raw) {
      showToast('Please enter a title, author, or link.', 'info');
      return;
    }

    setIsSearching(true);
    setSearchResult(null);
    setFallbackTriggered(false);

    try {
      // 1. If user chose Series
      if (searchTargetType === 'Series' || raw.includes('/series/')) {
        const parsed = parseAudibleUrl(raw);
        const seriesName = parsed.extractedName || raw.replace(/https?:\/\/[^\s]+/g, '').trim() || raw;
        const target = {
          id: `w-series-${Date.now()}`,
          type: 'Series' as const,
          name: seriesName,
          url: raw.startsWith('http') ? raw : `https://www.audible.com/search?keywords=${encodeURIComponent(seriesName)}`,
        };
        addWatchlistTarget(target);
        const imported = await scanSingleTarget(target);
        showToast(`Tracked series "${seriesName}" (${imported} releases found)`, 'success');
        onClose();
        return;
      }

      // 2. If user chose Author
      if (searchTargetType === 'Author' || raw.includes('/author/')) {
        const parsed = parseAudibleUrl(raw);
        const authorName = parsed.extractedName || raw.replace(/https?:\/\/[^\s]+/g, '').trim() || raw;
        const target = {
          id: `w-author-${Date.now()}`,
          type: 'Author' as const,
          name: authorName,
          url: raw.startsWith('http') ? raw : `https://www.audible.com/search?searchAuthor=${encodeURIComponent(authorName)}`,
        };
        addWatchlistTarget(target);
        const imported = await scanSingleTarget(target);
        showToast(`Tracked author "${authorName}" (${imported} releases found)`, 'success');
        onClose();
        return;
      }

      // 3. If user chose Narrator
      if (searchTargetType === 'Narrator' || raw.includes('/narrator/')) {
        const parsed = parseAudibleUrl(raw);
        const narratorName = parsed.extractedName || raw.replace(/https?:\/\/[^\s]+/g, '').trim() || raw;
        const target = {
          id: `w-narrator-${Date.now()}`,
          type: 'Narrator' as const,
          name: narratorName,
          url: raw.startsWith('http') ? raw : `https://www.audible.com/search?searchNarrator=${encodeURIComponent(narratorName)}`,
        };
        addWatchlistTarget(target);
        const imported = await scanSingleTarget(target);
        showToast(`Tracked narrator "${narratorName}" (${imported} releases found)`, 'success');
        onClose();
        return;
      }

      // 4. Book search via Audible API
      const metadata = await fetchAudibleApiMetadata(raw);
      if (metadata) {
        setSearchResult(metadata);
      } else {
        // If API returns no match, trigger graceful fallback so user can still add it immediately!
        setFallbackTriggered(true);
      }
    } catch {
      setFallbackTriggered(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Add the discovered book from API result
  const handleConfirmAddResult = () => {
    if (!searchResult) return;

    const asin = searchResult.asin || getASIN(queryInput) || `asin-${Date.now()}`;
    const newBook: Audiobook = {
      id: `ab-api-${asin}`,
      title: searchResult.title,
      author: searchResult.author,
      authorUrl: searchResult.authorUrl,
      seriesName: searchResult.seriesName,
      seriesUrl: searchResult.seriesUrl,
      series:
        searchResult.seriesName !== '—'
          ? { name: searchResult.seriesName, bookNumber: searchResult.seriesSequence }
          : undefined,
      narrator: searchResult.narrator,
      narrators: searchResult.narrator ? searchResult.narrator.split(', ').filter(Boolean) : ['Audible Narrator'],
      releaseDate: searchResult.releaseDate || new Date().toISOString().split('T')[0],
      coverUrl:
        searchResult.coverUrl ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      genre: (searchResult.genre as Genre) || 'Sci-Fi',
      runtimeHours: searchResult.runtimeHours || 12,
      audibleRating: searchResult.rating || 4.7,
      ratingCount: searchResult.ratingCount || 1000,
      synopsis: searchResult.synopsis || 'Added from Audible catalog search.',
      audibleUrl: searchResult.audibleUrl || (asin ? `https://www.audible.com/pd/${asin}` : ''),
      url: searchResult.audibleUrl || (asin ? `https://www.audible.com/pd/${asin}` : ''),
      isRead: false,
      downloaded: 'No',
      listened: 'No',
      reminders: { oneWeekBefore: true, oneDayBefore: true, dayOfRelease: true },
    };

    addBook(newBook);
    showToast(`Added "${newBook.title}" to library!`, 'success');
    onClose();
  };

  // Direct Add Fallback (Never fails!)
  const handleDirectAddFallback = () => {
    const raw = queryInput.trim();
    const newBook: Audiobook = {
      id: `ab-custom-${Date.now()}`,
      title: raw || 'Custom Audiobook',
      author: 'Tracked Author',
      seriesName: '—',
      narrator: 'Narrator',
      narrators: ['Narrator'],
      releaseDate: new Date().toISOString().split('T')[0],
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      genre: 'Sci-Fi',
      runtimeHours: 10,
      audibleRating: 4.8,
      ratingCount: 150,
      synopsis: `Custom tracked audiobook for "${raw}".`,
      isRead: false,
      downloaded: 'No',
      listened: 'No',
      reminders: { oneWeekBefore: true, oneDayBefore: true, dayOfRelease: true },
    };

    addBook(newBook);
    showToast(`Added "${newBook.title}" to your library!`, 'success');
    onClose();
  };

  // Manual Form Submission (100% Reliable)
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) {
      showToast('Please enter an audiobook title.', 'error');
      return;
    }

    const newBook: Audiobook = {
      id: `ab-manual-${Date.now()}`,
      title: manualTitle.trim(),
      author: manualAuthor.trim() || 'Unknown Author',
      seriesName: manualSeries.trim() || '—',
      series: manualSeries.trim()
        ? { name: manualSeries.trim(), bookNumber: manualBookNumber.trim() || undefined }
        : undefined,
      narrator: manualNarrator.trim() || 'Unspecified',
      narrators: manualNarrator.trim() ? [manualNarrator.trim()] : ['Unspecified'],
      releaseDate: manualDate || new Date().toISOString().split('T')[0],
      coverUrl:
        manualCover.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      genre: manualGenre,
      runtimeHours: 12,
      audibleRating: 4.8,
      ratingCount: 50,
      synopsis: `Manually added audiobook by ${manualAuthor.trim() || 'author'}.`,
      isRead: false,
      downloaded: 'No',
      listened: 'No',
      reminders: { oneWeekBefore: true, oneDayBefore: true, dayOfRelease: true },
    };

    addBook(newBook);
    showToast(`Added "${newBook.title}" to library!`, 'success');
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
        className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl border sm:border flex flex-col max-h-[92vh] overflow-hidden select-none transition-colors duration-200 animate-in slide-in-from-bottom sm:zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 rounded-full bg-[var(--md-sys-color-outline-variant)] mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex items-center justify-between p-4 sm:p-5 border-b shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--md-sys-color-primary)',
                color: 'var(--md-sys-color-on-primary)',
              }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl font-bold shadow-md"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-display text-base sm:text-lg font-extrabold tracking-wide">
                Add New Audiobook
              </h3>
              <p
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                className="text-xs"
              >
                Search Audible catalog or enter details manually
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md-btn-icon shadow-xs"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Material 3 Segmented Tab Switcher */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container)',
            borderColor: 'var(--md-sys-color-outline-variant)',
          }}
          className="flex p-2 border-b gap-2 shrink-0"
        >
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            style={{
              backgroundColor: activeTab === 'search' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: activeTab === 'search' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="flex-1 min-h-[44px] rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
          >
            <BookOpen className="h-4 w-4" />
            <span>Search &amp; Auto-Fill</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            style={{
              backgroundColor: activeTab === 'manual' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: activeTab === 'manual' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
            }}
            className="flex-1 min-h-[44px] rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Direct / Manual Entry</span>
          </button>
        </div>

        {/* Dialog Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: Search & Auto-Fill */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {/* Target Type Selector */}
              <div
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container)',
                  borderColor: 'var(--md-sys-color-outline-variant)',
                }}
                className="grid grid-cols-4 gap-1 p-1 rounded-2xl border"
              >
                {(['Book', 'Series', 'Author', 'Narrator'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSearchTargetType(type)}
                    style={{
                      backgroundColor: searchTargetType === type ? 'var(--md-sys-color-primary)' : 'transparent',
                      color: searchTargetType === type ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface-variant)',
                    }}
                    className="min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchOrAdd} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Enter ${searchTargetType} name or paste Audible link...`}
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    className="md-input flex-1 min-h-[48px] px-4 text-sm font-medium rounded-2xl"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={isSearching || !queryInput.trim()}
                    className="md-btn-fab min-h-[48px] px-6 text-sm"
                  >
                    {isSearching ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    className="shrink-0 font-bold"
                  >
                    Quick:
                  </span>
                  {SAMPLE_QUERIES.map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setQueryInput(sample);
                      }}
                      className="md-chip shrink-0 text-xs font-medium"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </form>

              {/* API Result Card */}
              {searchResult && (
                <div
                  style={{
                    backgroundColor: 'var(--md-sys-color-surface-container-low)',
                    borderColor: 'var(--md-sys-color-accent-green)',
                  }}
                  className="p-4 rounded-3xl border-2 shadow-md space-y-3 animate-in fade-in duration-200"
                >
                  <div className="flex gap-3.5">
                    <img
                      src={searchResult.coverUrl}
                      alt={searchResult.title}
                      className="h-20 w-20 rounded-2xl object-cover bg-slate-800 shrink-0 border border-[var(--md-sys-color-outline-variant)] shadow-sm"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div
                        style={{ color: 'var(--md-sys-color-accent-green)' }}
                        className="flex items-center gap-1.5 text-[11px] font-bold"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Audible Match Discovered</span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base truncate">{searchResult.title}</h4>
                      <p
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        className="text-xs"
                      >
                        By {searchResult.author}
                      </p>
                      <p
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        className="text-xs"
                      >
                        Release Date: <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>{searchResult.releaseDate}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmAddResult}
                    style={{
                      backgroundColor: 'var(--md-sys-color-accent-green)',
                      color: '#ffffff',
                    }}
                    className="w-full min-h-[48px] rounded-2xl font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Confirm &amp; Add to Library</span>
                  </button>
                </div>
              )}

              {/* Graceful Fallback if API returned no direct match */}
              {fallbackTriggered && (
                <div
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary-container)',
                    borderColor: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary-container)',
                  }}
                  className="p-4 rounded-3xl border text-xs space-y-3 animate-in fade-in duration-150 shadow-sm"
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Exact catalog entry not auto-matched</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    You can still track this audiobook right now with 1 tap. We will add it to your library immediately:
                  </p>
                  <button
                    type="button"
                    onClick={handleDirectAddFallback}
                    className="md-btn-fab w-full min-h-[46px] text-xs font-bold"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                    <span>Add "{queryInput}" Directly to Library</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Direct / Manual Entry Form (Always Works) */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-3.5 animate-in fade-in duration-150">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold">
                  Audiobook Title <span style={{ color: 'var(--md-sys-color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Way of Kings"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  required
                  className="md-input w-full min-h-[46px] px-4 text-sm font-medium rounded-2xl"
                />
              </div>

              {/* Author & Series */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Author Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Brandon Sanderson"
                    value={manualAuthor}
                    onChange={(e) => setManualAuthor(e.target.value)}
                    className="md-input w-full min-h-[46px] px-4 text-xs sm:text-sm font-medium rounded-2xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Series Name</label>
                  <input
                    type="text"
                    placeholder="e.g. The Stormlight Archive"
                    value={manualSeries}
                    onChange={(e) => setManualSeries(e.target.value)}
                    className="md-input w-full min-h-[46px] px-4 text-xs sm:text-sm font-medium rounded-2xl"
                  />
                </div>
              </div>

              {/* Narrator & Release Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Narrator</label>
                  <input
                    type="text"
                    placeholder="e.g. Michael Kramer, Kate Reading"
                    value={manualNarrator}
                    onChange={(e) => setManualNarrator(e.target.value)}
                    className="md-input w-full min-h-[46px] px-4 text-xs sm:text-sm font-medium rounded-2xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Release Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="md-input w-full min-h-[46px] px-4 text-xs sm:text-sm font-medium rounded-2xl"
                  />
                </div>
              </div>

              {/* Genre & Cover URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold">Genre</label>
                  <select
                    value={manualGenre}
                    onChange={(e) => setManualGenre(e.target.value as any)}
                    className="md-input w-full min-h-[46px] px-4 text-xs sm:text-sm font-medium rounded-2xl"
                  >
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="LitRPG">LitRPG</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Horror">Horror</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Romance">Romance</option>
                    <option value="Historical">Historical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold">Cover Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={manualCover}
                    onChange={(e) => setManualCover(e.target.value)}
                    className="md-input w-full min-h-[46px] px-4 text-xs sm:text-sm font-medium rounded-2xl"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="md-btn-fab w-full min-h-[48px] text-sm mt-3"
              >
                <Plus className="h-5 w-5 stroke-[2.5]" />
                <span>Add Audiobook to Library</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
