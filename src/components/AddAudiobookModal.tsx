import React, { useState, useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { Audiobook, Genre, TrackedEntityType } from '../types/audiobook';
import { searchAudible, convertAudibleResultToAudiobook, AudibleSearchResultItem } from '../services/audibleCatalogService';
import { parseAudibleUrl, ParsedAudibleUrlResult } from '../utils/audibleParser';
import {
  X,
  Plus,
  BookPlus,
  Search,
  Link,
  Edit3,
  Check,
  Star,
  ExternalLink,
  Mic2,
  Library,
  UserCheck,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import coverScifi from '../assets/images/cover_scifi_void_1790494184883.jpg';
import coverFantasy from '../assets/images/cover_fantasy_blade_1790494198336.jpg';
import coverLitrpg from '../assets/images/cover_litrpg_crawler_1790494211158.jpg';
import coverThriller from '../assets/images/cover_thriller_shadow_1790494227784.jpg';

interface AddAudiobookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'search' | 'url' | 'manual';
}

const PRESET_COVERS = [
  { label: 'Sci-Fi Anomaly', url: coverScifi },
  { label: 'Fantasy Relic', url: coverFantasy },
  { label: 'LitRPG Dungeon', url: coverLitrpg },
  { label: 'Noir Espionage', url: coverThriller },
];

const EXAMPLE_URLS = [
  {
    label: 'Wind and Truth (Audiobook)',
    type: 'Book',
    url: 'https://www.audible.com/pd/Wind-and-Truth-Audiobook/B0D5B7L9K3',
  },
  {
    label: 'Brandon Sanderson (Author)',
    type: 'Author',
    url: 'https://www.audible.com/author/Brandon-Sanderson/B001IGFHW6',
  },
  {
    label: 'Jeff Hays (Narrator)',
    type: 'Narrator',
    url: 'https://www.audible.com/narrator/Jeff-Hays/B00TGB8A1S',
  },
  {
    label: 'Bobiverse (Series)',
    type: 'Series',
    url: 'https://www.audible.com/series/Bobiverse-Audiobooks/B0180TL5R4',
  },
];

export const AddAudiobookModal: React.FC<AddAudiobookModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'search',
}) => {
  const { addBook, books, addTrackedEntity, trackedEntities, isEntityTracked } = useTracker();

  // Active top tab in the modal: Search Audible vs Paste URL vs Manual
  const [activeTab, setActiveTab] = useState<'search' | 'url' | 'manual'>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // --- TAB 1: SEARCH AUDIBLE STATE ---
  const [audibleQuery, setAudibleQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'all' | 'audiobooks' | 'authors' | 'narrators' | 'series'>('all');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    return searchAudible(audibleQuery, searchCategory);
  }, [audibleQuery, searchCategory]);

  // --- TAB 2: PASTE URL STATE ---
  const [inputUrl, setInputUrl] = useState('');
  const [urlImportSuccess, setUrlImportSuccess] = useState<string | null>(null);

  const parsedUrlResult: ParsedAudibleUrlResult = useMemo(() => {
    return parseAudibleUrl(inputUrl);
  }, [inputUrl]);

  // --- TAB 3: MANUAL FORM STATE ---
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [narrators, setNarrators] = useState('');
  const [seriesName, setSeriesName] = useState('');
  const [bookNumber, setBookNumber] = useState('');
  const [releaseDate, setReleaseDate] = useState('2026-10-15');
  const [genre, setGenre] = useState<Genre>('Sci-Fi');
  const [audibleRating, setAudibleRating] = useState('4.8');
  const [runtimeHours, setRuntimeHours] = useState('14');
  const [coverUrl, setCoverUrl] = useState(coverScifi);
  const [synopsis, setSynopsis] = useState('');
  const [audibleUrl, setAudibleUrl] = useState('');
  const [oneWeek, setOneWeek] = useState(true);
  const [oneDay, setOneDay] = useState(true);
  const [dayOf, setDayOf] = useState(true);

  if (!isOpen) return null;

  // Handler to add a search result from Audible
  const handleAddSearchResult = (item: AudibleSearchResultItem) => {
    if (item.type === 'book') {
      const bookToAdd = convertAudibleResultToAudiobook(item);
      addBook(bookToAdd);
    } else {
      // It's an author, narrator, or series
      addTrackedEntity({
        type: item.type as TrackedEntityType,
        name: item.title,
        notes: item.subtitle || `Followed via Audible search`,
      });

      // Also queue any upcoming releases by this creator if present
      const matchingBooks = searchAudible(item.title, 'audiobooks').filter((b) => b.type === 'book');
      matchingBooks.forEach((mb) => {
        const alreadyInList = books.some((existing) => existing.title.toLowerCase() === mb.title.toLowerCase());
        if (!alreadyInList) {
          addBook(convertAudibleResultToAudiobook(mb));
        }
      });
    }

    setRecentlyAddedId(item.id);
    setTimeout(() => setRecentlyAddedId(null), 2500);
  };

  // Handler to import from Audible URL
  const handleImportFromUrl = () => {
    if (!parsedUrlResult.extractedName) return;

    if (parsedUrlResult.type === 'book') {
      // Find if we have matching database book
      const matched = searchAudible(parsedUrlResult.extractedName, 'audiobooks').find(
        (b) => b.type === 'book' && b.title.toLowerCase().includes(parsedUrlResult.extractedName.toLowerCase())
      );

      const bookToSave: Audiobook = matched
        ? convertAudibleResultToAudiobook(matched)
        : {
            id: `ab-url-${Date.now()}`,
            title: parsedUrlResult.extractedName,
            author: parsedUrlResult.suggestedBook?.author || 'Audible Author',
            narrators: parsedUrlResult.suggestedBook?.narrators || ['Audible Narrator'],
            releaseDate: parsedUrlResult.suggestedBook?.releaseDate || '2026-10-20',
            coverUrl: coverScifi,
            genre: 'Sci-Fi',
            audibleRating: 4.8,
            ratingCount: 1420,
            synopsis: `Audiobook tracked from URL: ${inputUrl}`,
            audibleUrl: inputUrl,
            isRead: false,
            reminders: {
              oneWeekBefore: true,
              oneDayBefore: true,
              dayOfRelease: true,
            },
            isCustom: true,
          };

      addBook(bookToSave);
      setUrlImportSuccess(`Added "${bookToSave.title}" to upcoming releases with 1w, 1d, and day-of reminders!`);
    } else if (
      parsedUrlResult.type === 'author' ||
      parsedUrlResult.type === 'narrator' ||
      parsedUrlResult.type === 'series'
    ) {
      addTrackedEntity({
        type: parsedUrlResult.type as TrackedEntityType,
        name: parsedUrlResult.extractedName,
        notes: `Imported from Audible URL (${inputUrl})`,
      });

      // Also queue any upcoming releases matching this creator
      const related = searchAudible(parsedUrlResult.extractedName, 'audiobooks');
      related.forEach((rb) => {
        if (rb.type === 'book' && !books.some((b) => b.title.toLowerCase() === rb.title.toLowerCase())) {
          addBook(convertAudibleResultToAudiobook(rb));
        }
      });

      setUrlImportSuccess(
        `Now tracking ${parsedUrlResult.type} "${parsedUrlResult.extractedName}"! Auto-queued upcoming releases.`
      );
    } else {
      // Generic search / fallback URL
      addTrackedEntity({
        type: 'author',
        name: parsedUrlResult.extractedName,
        notes: `Imported from URL: ${inputUrl}`,
      });
      setUrlImportSuccess(`Tracked "${parsedUrlResult.extractedName}".`);
    }

    setInputUrl('');
    setTimeout(() => {
      setUrlImportSuccess(null);
      onClose();
    }, 2000);
  };

  // Handler for manual custom form submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const newBook: Audiobook = {
      id: `ab-custom-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      narrators: narrators
        ? narrators.split(',').map((n) => n.trim()).filter(Boolean)
        : ['Narrator TBA'],
      series: seriesName.trim()
        ? {
            name: seriesName.trim(),
            bookNumber: bookNumber.trim() ? Number(bookNumber) || bookNumber.trim() : undefined,
          }
        : undefined,
      releaseDate: releaseDate || '2026-10-15',
      coverUrl: coverUrl.trim() || coverScifi,
      runtimeHours: Number(runtimeHours) || 12,
      genre,
      audibleRating: Number(audibleRating) || 4.8,
      ratingCount: 1200,
      synopsis: synopsis.trim() || `Newly announced Audible release by ${author.trim()}. Full audio production details to follow.`,
      audibleUrl: audibleUrl.trim() || undefined,
      isRead: false,
      reminders: {
        oneWeekBefore: oneWeek,
        oneDayBefore: oneDay,
        dayOfRelease: dayOf,
      },
      isCustom: true,
    };

    addBook(newBook);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <BookPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">Add Audible Releases & Creators</h3>
              <p className="text-xs text-slate-400">Search the catalog, paste an Audible URL, or enter manually</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation Segmented Control */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search Audible</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link className="h-3.5 w-3.5" />
              <span>Paste Audible URL</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Custom Entry</span>
            </button>
          </div>
        </div>

        {/* TAB 1: SEARCH AUDIBLE */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={audibleQuery}
                onChange={(e) => setAudibleQuery(e.target.value)}
                placeholder="Search Audible for title, author, narrator, or series..."
                className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-9 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                autoFocus
              />
              {audibleQuery && (
                <button
                  onClick={() => setAudibleQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(
                [
                  { id: 'all', label: 'All Results' },
                  { id: 'audiobooks', label: 'Audiobooks' },
                  { id: 'authors', label: 'Authors' },
                  { id: 'narrators', label: 'Narrators' },
                  { id: 'series', label: 'Series' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer ${
                    searchCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Live Search Results List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Audible Results ({searchResults.length})</span>
                <span className="text-[11px] text-slate-500">Tap to track with push reminders</span>
              </div>

              {searchResults.map((item) => {
                const isAlreadyBookTracked = books.some((b) => b.title.toLowerCase() === item.title.toLowerCase());
                const isAlreadyEntityTracked =
                  item.type !== 'book' && isEntityTracked(item.type as 'author' | 'narrator' | 'series', item.title);
                const isAdded = recentlyAddedId === item.id || isAlreadyBookTracked || isAlreadyEntityTracked;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover bg-slate-800 shadow"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                            {item.type}
                          </span>
                          {item.releaseDate && (
                            <span className="text-[10px] text-slate-400 tabular-nums">
                              Releases: {item.releaseDate}
                            </span>
                          )}
                        </div>

                        <h4 className="font-display text-sm font-bold text-white truncate max-w-sm">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-300 truncate mt-0.5">
                          {item.creatorOrAuthor}
                          {item.narrators && item.narrators.length > 0 && (
                            <span className="text-slate-400"> · Voice: {item.narrators.join(', ')}</span>
                          )}
                        </p>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-0.5 text-amber-400 font-semibold tabular-nums">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {item.rating.toFixed(1)}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span>{item.ratingCount.toLocaleString()} reviews</span>
                          {item.genre && (
                            <>
                              <span className="text-slate-600">·</span>
                              <span>{item.genre}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAdded ? (
                        <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
                          <Check className="h-3.5 w-3.5" />
                          <span>Tracked</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddSearchResult(item)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition shadow-md shadow-amber-500/10 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Track</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PASTE AUDIBLE URL */}
        {activeTab === 'url' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Paste any Audible URL (Book, Author, Narrator, or Series):
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://www.audible.com/pd/... or /author/... or /narrator/..."
                    className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-3.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>
                {inputUrl && (
                  <button
                    onClick={() => setInputUrl('')}
                    className="px-3 h-11 rounded-xl bg-slate-800 text-xs text-slate-300 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Success message banner */}
            {urlImportSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{urlImportSuccess}</span>
              </div>
            )}

            {/* Real-time Parser Live Preview Box */}
            {inputUrl && parsedUrlResult.extractedName && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Audible URL Detected: {parsedUrlResult.type.toUpperCase()}</span>
                  </span>
                  <span className="text-xs text-slate-400">95% Confidence match</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-display text-sm font-bold text-white truncate">
                      {parsedUrlResult.extractedName}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Type: <strong className="text-slate-200 capitalize">{parsedUrlResult.type}</strong>
                      {parsedUrlResult.asin && ` · ASIN: ${parsedUrlResult.asin}`}
                    </p>
                    <p className="text-[11px] text-amber-400/90 mt-1">
                      ✓ Reminders: 1 week before, 1 day before, and day of release will be auto-set.
                    </p>
                  </div>

                  <button
                    onClick={handleImportFromUrl}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition shadow-md shadow-amber-500/20 cursor-pointer shrink-0"
                  >
                    <span>Import & Track</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Test Click Examples */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 block">
                Or try these sample Audible URLs with 1-click:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLE_URLS.map((eg) => (
                  <button
                    key={eg.label}
                    type="button"
                    onClick={() => setInputUrl(eg.url)}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 text-left transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block">
                        {eg.type} URL
                      </span>
                      <p className="text-xs font-bold text-white truncate">{eg.label}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-200">Supported URLs:</strong> Any link from Audible.com (or international Audible domains) for audiobooks (<code className="text-amber-400">/pd/</code>), authors (<code className="text-amber-400">/author/</code>), narrators (<code className="text-amber-400">/narrator/</code>), or series (<code className="text-amber-400">/series/</code>).
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM ENTRY FORM */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Audiobook Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Wind and Truth"
                className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Author & Narrators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Author *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Brandon Sanderson"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Narrator(s) (comma separated)
                </label>
                <input
                  type="text"
                  value={narrators}
                  onChange={(e) => setNarrators(e.target.value)}
                  placeholder="e.g. Michael Kramer, Kate Reading"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Series & Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Series Name (Optional)
                </label>
                <input
                  type="text"
                  value={seriesName}
                  onChange={(e) => setSeriesName(e.target.value)}
                  placeholder="e.g. The Stormlight Archive"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Book #
                </label>
                <input
                  type="text"
                  value={bookNumber}
                  onChange={(e) => setBookNumber(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Release Date & Genre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Release Date *
                </label>
                <input
                  type="date"
                  required
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Genre
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value as Genre)}
                  className="w-full h-11 rounded-xl bg-slate-950 border border-slate-800 px-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="LitRPG">LitRPG</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Horror">Horror</option>
                  <option value="Romance">Romance</option>
                </select>
              </div>
            </div>

            {/* Preset Covers */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Cover Art:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_COVERS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCoverUrl(preset.url)}
                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                      coverUrl === preset.url
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="text-xs text-slate-300 pr-1">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reminders selection */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white block">
                Push Reminders Schedule:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={oneWeek}
                    onChange={(e) => setOneWeek(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>1 Week</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={oneDay}
                    onChange={(e) => setOneDay(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>1 Day</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dayOf}
                    onChange={(e) => setDayOf(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Day Of</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Save to Release Tracker</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
