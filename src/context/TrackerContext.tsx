import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audiobook, WatchlistItem, MuteItem, NotificationLogItem, PushNotificationSettings, TrackedEntity, TrackedEntityType } from '../types/audiobook';
import { INITIAL_AUDIOBOOKS, DEFAULT_PUSH_SETTINGS } from '../data/initialCatalog';
import { audioPlayer } from '../utils/audioPreview';
import { playNotificationSound, sendNativePushNotification, requestPushPermission, CURRENT_DATE_STR, evaluateTriggeredReminders } from '../utils/notifications';
import { fetchAudibleApiMetadata, scanWatchlistTargetLive, isMuted, isEnglishAudiobook, getASIN } from '../services/audibleApiService';
import { createBackupJson, triggerFileDownload, exportToCsv, TrackerBackup } from '../utils/exportImport';

const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { id: 'w-1', type: 'Author', name: 'Brandon Sanderson', url: 'https://www.audible.com/author/Brandon-Sanderson/B001IGFHW6' },
  { id: 'w-2', type: 'Author', name: 'Matt Dinniman', url: 'https://www.audible.com/author/Matt-Dinniman/B0034Q8A44' },
  { id: 'w-3', type: 'Author', name: 'Dennis E. Taylor', url: 'https://www.audible.com/author/Dennis-E-Taylor/B0107Z19OQ' },
  { id: 'w-4', type: 'Series', name: 'Dungeon Crawler Universe', url: 'https://www.audible.com/series/Dungeon-Crawler-Carl-Audiobooks/B08V81GY52' },
  { id: 'w-5', type: 'Series', name: 'Bobiverse', url: 'https://www.audible.com/series/Bobiverse-Audiobooks/B0180TL5R4' },
  { id: 'w-6', type: 'Narrator', name: 'Jeff Hays', url: 'https://www.audible.com/narrator/Jeff-Hays/B00TGB8A1S' },
  { id: 'w-7', type: 'Narrator', name: 'Ray Porter', url: 'https://www.audible.com/narrator/Ray-Porter/B00732A15K' },
];

const DEFAULT_MUTELIST: MuteItem[] = [
  { id: 'm-1', type: 'Series', value: 'Spanish Edition' },
  { id: 'm-2', type: 'Keyword', value: 'Dramatized Adaptation' },
];

export interface AppPreferences {
  defaultViewMode: 'table' | 'grid' | 'compact_grid' | 'list';
  defaultSearchMode: 'Title' | 'Series' | 'Author' | 'Narrator';
  defaultViewFilter: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
  languageFilter: 'english_only' | 'all_languages';
  theme: 'light' | 'dark';
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  defaultViewMode: 'compact_grid',
  defaultSearchMode: 'Title',
  defaultViewFilter: 'all',
  languageFilter: 'english_only',
  theme: 'light', // Alucard Light Mode is the default
};

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface TrackerContextType {
  books: Audiobook[];
  watchlists: WatchlistItem[];
  muteList: MuteItem[];
  notifications: NotificationLogItem[];
  pushSettings: PushNotificationSettings;
  preferences: AppPreferences;
  updatePreferences: (partial: Partial<AppPreferences>) => void;
  languageFilter: 'english_only' | 'all_languages';
  setLanguageFilter: (f: 'english_only' | 'all_languages') => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  unreadNotifCount: number;
  lastCheckedTime: string | null;
  isScanning: boolean;
  scanStatusText: string;

  // Selected item in table
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  selectedBook: Audiobook | null;

  // Audio preview
  activeAudio: { isPlaying: boolean; bookId: string | null; progress: number };
  toggleAudioPreview: (bookId: string) => void;

  // Book actions
  addBook: (book: Audiobook) => void;
  updateBook: (id: string, updates: Partial<Audiobook>) => void;
  deleteBook: (id: string) => void;
  deleteMultipleBooks: (ids: string[]) => void;
  toggleField: (bookId: string, field: 'downloaded' | 'listened') => void;
  toggleReminder: (bookId: string, type: 'oneWeekBefore' | 'oneDayBefore' | 'dayOfRelease') => void;
  markAsRead: (bookId: string, details?: { completedAt?: string; durationHours?: number; rating?: number; notes?: string }) => void;
  markAsUnread: (bookId: string) => void;
  refetchBookMetadata: (bookId: string) => Promise<boolean>;

  // Scanning & Watchlist actions
  runScheduledScan: (silent?: boolean) => Promise<{ newCount: number }>;
  scanSingleTarget: (target: WatchlistItem) => Promise<number>;
  addWatchlistTarget: (target: Omit<WatchlistItem, 'id'>) => void;
  removeWatchlistTarget: (id: string) => void;
  addMuteRule: (rule: Omit<MuteItem, 'id'>) => void;
  removeMuteRule: (id: string) => void;
  quickMuteSeries: (seriesName: string) => void;
  quickAddWatchlist: (type: 'Author' | 'Series' | 'Narrator', name: string, url?: string) => void;

  // Compatibility aliases
  trackedEntities: WatchlistItem[];
  addTrackedEntity: (entity: { type: TrackedEntityType; name: string; notes?: string; url?: string }) => void;
  removeTrackedEntity: (id: string) => void;
  isEntityTracked: (type: 'author' | 'narrator' | 'series', name: string) => boolean;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  triggerTestNotification: () => void;
  updatePushSettings: (settings: Partial<PushNotificationSettings>) => void;
  requestSystemNotificationPermission: () => Promise<void>;

  // Export & Import
  exportBackup: (format?: 'json' | 'csv') => void;
  importBackup: (backup: TrackerBackup, mode: 'merge' | 'replace') => { success: boolean; booksCount: number; watchlistsCount: number };

  // In-app Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGenre: string;
  setSelectedGenre: (g: string) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  viewFilter: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
  setViewFilter: (f: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened') => void;
  timeframeFilter: 'all' | 'today' | 'week' | 'month' | 'tracked';
  setTimeframeFilter: (tf: 'all' | 'today' | 'week' | 'month' | 'tracked') => void;
  viewMode: 'grid' | 'compact_grid' | 'list' | 'table';
  setViewMode: (vm: any) => void;

  resetToDefaults: () => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'audible_tracker_books_ahk_v2',
  WATCHLIST: 'audible_tracker_watchlist_ahk_v2',
  MUTELIST: 'audible_tracker_mutelist_ahk_v2',
  LAST_CHECK: 'audible_tracker_last_check_ahk_v2',
  SETTINGS: 'audible_tracker_settings_ahk_v2',
  PREFERENCES: 'audible_tracker_preferences_ahk_v2',
};

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_PREFERENCES;
  });

  const [books, setBooks] = useState<Audiobook[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AUDIOBOOKS.map((b) => ({
      ...b,
      downloaded: (b.downloaded || 'No') as 'Yes' | 'No',
      listened: (b.isRead ? 'Yes' : 'No') as 'Yes' | 'No',
      seriesName: b.series?.name || '—',
      narrator: b.narrators.join(', '),
      url: b.audibleUrl || '',
    }));
  });

  const [watchlists, setWatchlists] = useState<WatchlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WATCHLIST;
  });

  const [muteList, setMuteList] = useState<MuteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MUTELIST);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MUTELIST;
  });

  const [lastCheckedTime, setLastCheckedTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_CHECK) || 'Today 00:00';
  });

  const [pushSettings, setPushSettings] = useState<PushNotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PUSH_SETTINGS;
  });

  const [notifications, setNotifications] = useState<NotificationLogItem[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(() => books[0]?.id || null);

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatusText, setScanStatusText] = useState('Ready.');

  // Filters (respecting user default preferences)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [viewFilter, setViewFilter] = useState<'all' | 'upcoming' | 'today' | 'downloaded' | 'listened'>(
    preferences.defaultViewFilter || 'all'
  );
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'tracked'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'compact_grid' | 'list' | 'table'>(
    preferences.defaultViewMode || 'compact_grid'
  );

  const [languageFilter, setLanguageFilterState] = useState<'english_only' | 'all_languages'>(
    preferences.languageFilter || 'english_only'
  );

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (preferences.theme === 'dark' || preferences.theme === 'light') return preferences.theme;
    } catch {}
    return 'light'; // Alucard Light is default
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dracula' : 'alucard');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#282a36' : '#f8f8f2');
    }
    try {
      localStorage.setItem('audible_tracker_theme', theme);
    } catch {}
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    updatePreferences({ theme: newTheme });
    showToast(
      newTheme === 'dark' ? 'Switched to Dracula Dark Mode 🧛' : 'Switched to Alucard Light Mode ☀️',
      'info'
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setLanguageFilter = (lang: 'english_only' | 'all_languages') => {
    setLanguageFilterState(lang);
    updatePreferences({ languageFilter: lang });
    showToast(
      lang === 'english_only' ? 'Filtered to English releases only' : 'Tracking all languages (German, Spanish, French, etc.)',
      'info'
    );
  };

  const updatePreferences = (partial: Partial<AppPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(next));
      } catch {}
      if (partial.defaultViewMode) setViewMode(partial.defaultViewMode);
      if (partial.defaultViewFilter) setViewFilter(partial.defaultViewFilter);
      if (partial.languageFilter) setLanguageFilterState(partial.languageFilter);
      if (partial.theme) setThemeState(partial.theme);
      return next;
    });
  };

  // Audio preview state
  const [activeAudio, setActiveAudio] = useState<{ isPlaying: boolean; bookId: string | null; progress: number }>({
    isPlaying: false,
    bookId: null,
    progress: 0,
  });

  useEffect(() => {
    audioPlayer.subscribe((isPlaying, bookId, progress) => {
      setActiveAudio({ isPlaying, bookId, progress });
    });
    return () => {
      audioPlayer.stop();
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch {}
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlists));
    } catch {}
  }, [watchlists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MUTELIST, JSON.stringify(muteList));
    } catch {}
  }, [muteList]);

  useEffect(() => {
    if (lastCheckedTime) {
      localStorage.setItem(STORAGE_KEYS.LAST_CHECK, lastCheckedTime);
    }
  }, [lastCheckedTime]);

  const selectedBook = books.find((b) => b.id === selectedBookId) || books[0] || null;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const toggleAudioPreview = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    audioPlayer.togglePlay(bookId, book.title, book.narrators.join(', '));
  };

  const addBook = (newBook: Audiobook) => {
    // Check if muted
    if (isMuted(newBook.seriesName || newBook.series?.name || '—', newBook.title, newBook.author, muteList)) {
      alert(`"${newBook.title}" matches your Mute List and was ignored.`);
      return;
    }

    setBooks((prev) => {
      const exists = prev.some((b) => b.title.toLowerCase() === newBook.title.toLowerCase());
      if (exists) return prev;
      return [newBook, ...prev];
    });

    setSelectedBookId(newBook.id);
    if (pushSettings.soundEnabled) playNotificationSound();
    sendNativePushNotification(`Audiobook Added: ${newBook.title}`, {
      body: `By ${newBook.author} · Narrated by ${newBook.narrators.join(', ')}`,
    });
  };

  const updateBook = (id: string, updates: Partial<Audiobook>) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBookId === id) {
      setSelectedBookId(null);
    }
  };

  const deleteMultipleBooks = (ids: string[]) => {
    const idSet = new Set(ids);
    setBooks((prev) => prev.filter((b) => !idSet.has(b.id)));
    if (selectedBookId && idSet.has(selectedBookId)) {
      setSelectedBookId(null);
    }
  };

  const toggleField = (bookId: string, field: 'downloaded' | 'listened') => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const currentVal = b[field] || 'No';
          const newVal = currentVal === 'Yes' ? 'No' : 'Yes';
          return {
            ...b,
            [field]: newVal,
            isRead: field === 'listened' ? newVal === 'Yes' : b.isRead,
            readCompletedAt: field === 'listened' && newVal === 'Yes' ? new Date().toISOString() : b.readCompletedAt,
          };
        }
        return b;
      })
    );
  };

  const toggleReminder = (bookId: string, type: 'oneWeekBefore' | 'oneDayBefore' | 'dayOfRelease') => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            reminders: {
              ...b.reminders,
              [type]: !b.reminders[type],
            },
          };
        }
        return b;
      })
    );
  };

  const markAsRead = (
    bookId: string,
    details?: { completedAt?: string; durationHours?: number; rating?: number; notes?: string }
  ) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            isRead: true,
            listened: 'Yes',
            readCompletedAt: details?.completedAt || new Date().toISOString(),
            listeningDurationHours: details?.durationHours || b.runtimeHours || 12,
            userPersonalRating: details?.rating ?? (b.userPersonalRating || 5),
            userNotes: details?.notes ?? b.userNotes ?? '',
          };
        }
        return b;
      })
    );
  };

  const markAsUnread = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            isRead: false,
            listened: 'No',
            readCompletedAt: undefined,
          };
        }
        return b;
      })
    );
  };

  const refetchBookMetadata = async (bookId: string): Promise<boolean> => {
    const book = books.find((b) => b.id === bookId);
    if (!book || (!book.audibleUrl && !book.url)) return false;

    const targetUrl = book.url || book.audibleUrl || '';
    setScanStatusText(`Querying Audible API for: ${book.title}...`);
    try {
      const data = await fetchAudibleApiMetadata(targetUrl);
      if (data) {
        updateBook(bookId, {
          title: data.title,
          seriesName: data.seriesName,
          seriesUrl: data.seriesUrl,
          author: data.author,
          authorUrl: data.authorUrl,
          narrators: data.narrator.split(', ').filter(Boolean),
          narrator: data.narrator,
          releaseDate: data.releaseDate,
          coverUrl: data.coverUrl || book.coverUrl,
        });
        setScanStatusText(`Refreshed: ${data.title}`);
        if (pushSettings.soundEnabled) playNotificationSound();
        return true;
      }
    } catch {
      setScanStatusText(`Failed to re-fetch metadata for: ${book.title}`);
    }
    return false;
  };

  const runScheduledScan = async (silent = false): Promise<{ newCount: number }> => {
    if (isScanning) return { newCount: 0 };
    setIsScanning(true);
    let totalNew = 0;

    try {
      const seriesList = watchlists.filter((w) => w.type === 'Series');
      for (let i = 0; i < seriesList.length; i++) {
        const item = seriesList[i];
        setScanStatusText(`Scanning series (${i + 1}/${seriesList.length}): ${item.name}...`);
        const found = await scanWatchlistTargetLive(item, books, muteList, languageFilter);
        if (found.length > 0) {
          found.forEach((nb) => addBook(nb));
          totalNew += found.length;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      const authorList = watchlists.filter((w) => w.type === 'Author');
      for (let i = 0; i < authorList.length; i++) {
        const item = authorList[i];
        setScanStatusText(`Scanning author (${i + 1}/${authorList.length}): ${item.name}...`);
        const found = await scanWatchlistTargetLive(item, books, muteList, languageFilter);
        if (found.length > 0) {
          found.forEach((nb) => addBook(nb));
          totalNew += found.length;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      const narratorList = watchlists.filter((w) => w.type === 'Narrator');
      for (let i = 0; i < narratorList.length; i++) {
        const item = narratorList[i];
        setScanStatusText(`Scanning narrator (${i + 1}/${narratorList.length}): ${item.name}...`);
        const found = await scanWatchlistTargetLive(item, books, muteList, languageFilter);
        if (found.length > 0) {
          found.forEach((nb) => addBook(nb));
          totalNew += found.length;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      const nowStr = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      setLastCheckedTime(nowStr);
      setScanStatusText(`Scan complete. ${totalNew > 0 ? `Found ${totalNew} new release(s)!` : 'All watchlists up to date.'}`);

      if (totalNew > 0) {
        if (pushSettings.soundEnabled) playNotificationSound();
        sendNativePushNotification('New Releases Discovered!', {
          body: `Found ${totalNew} new upcoming English release(s) across your watchlists.`,
        });
      }
    } finally {
      setIsScanning(false);
    }

    return { newCount: totalNew };
  };

  const scanSingleTarget = async (target: WatchlistItem): Promise<number> => {
    setScanStatusText(`Scanning ${target.type.toLowerCase()}: ${target.name}...`);
    setIsScanning(true);
    let count = 0;
    try {
      const found = await scanWatchlistTargetLive(target, books, muteList, languageFilter);
      found.forEach((b) => addBook(b));
      count = found.length;
      setScanStatusText(`Scan complete for ${target.name}. Found ${count} new release(s).`);
      if (count > 0 && pushSettings.soundEnabled) {
        playNotificationSound();
      }
    } finally {
      setIsScanning(false);
    }
    return count;
  };

  const addWatchlistTarget = (target: Omit<WatchlistItem, 'id'>) => {
    let url = target.url.trim();
    if (!url) {
      const enc = encodeURIComponent(target.name);
      if (target.type === 'Narrator') url = `https://www.audible.com/search?searchNarrator=${enc}`;
      else if (target.type === 'Author') url = `https://www.audible.com/search?searchAuthor=${enc}`;
      else url = `https://www.audible.com/search?keywords=${enc}`;
    }

    const newItem: WatchlistItem = {
      ...target,
      url,
      id: `w-${Date.now()}`,
    };

    setWatchlists((prev) => [...prev, newItem]);
    scanSingleTarget(newItem);
  };

  const removeWatchlistTarget = (id: string) => {
    setWatchlists((prev) => prev.filter((w) => w.id !== id));
  };

  const addMuteRule = (rule: Omit<MuteItem, 'id'>) => {
    const newItem: MuteItem = {
      ...rule,
      id: `m-${Date.now()}`,
    };
    setMuteList((prev) => [...prev, newItem]);
  };

  const removeMuteRule = (id: string) => {
    setMuteList((prev) => prev.filter((m) => m.id !== id));
  };

  const quickMuteSeries = (seriesName: string) => {
    if (!seriesName || seriesName === '—') return;
    if (window.confirm(`Mute the series '${seriesName}'?\n\nUpcoming books and spin-offs from this series will be ignored.`)) {
      addMuteRule({ type: 'Series', value: seriesName });
    }
  };

  const quickAddWatchlist = (type: 'Author' | 'Series' | 'Narrator', name: string, url = '') => {
    const already = watchlists.some((w) => w.type === type && w.name.toLowerCase() === name.toLowerCase());
    if (already) {
      alert(`This ${type} is already on your Watchlist.`);
      return;
    }
    addWatchlistTarget({ type, name, url });
  };

  // Watchlist compatibility bridge
  const addTrackedEntity = (entity: { type: TrackedEntityType; name: string; notes?: string; url?: string }) => {
    const mappedType: 'Author' | 'Series' | 'Narrator' =
      entity.type === 'author' ? 'Author' : entity.type === 'series' ? 'Series' : 'Narrator';
    addWatchlistTarget({
      type: mappedType,
      name: entity.name,
      url: entity.url || '',
    });
  };

  const removeTrackedEntity = (id: string) => removeWatchlistTarget(id);

  const isEntityTracked = (type: 'author' | 'narrator' | 'series', name: string): boolean => {
    const cleanName = name.toLowerCase().trim();
    const mappedType = type === 'author' ? 'Author' : type === 'series' ? 'Series' : 'Narrator';
    return watchlists.some((w) => w.type === mappedType && w.name.toLowerCase().trim() === cleanName);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const triggerTestNotification = () => {
    playNotificationSound();
    sendNativePushNotification('Audible Release Alert', {
      body: 'Reminder: "Protocol Omega" releases today on Audible!',
    });
  };

  const updatePushSettings = (settings: Partial<PushNotificationSettings>) => {
    setPushSettings((prev) => ({ ...prev, ...settings }));
  };

  const requestSystemNotificationPermission = async () => {
    const perm = await requestPushPermission();
    if (perm === 'granted') {
      setPushSettings((prev) => ({ ...prev, pushEnabled: true }));
      playNotificationSound();
    }
  };

  // Toast notification management
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Export backup data
  const exportBackup = (format: 'json' | 'csv' = 'json') => {
    try {
      if (format === 'csv') {
        exportToCsv(books);
        showToast(`Exported ${books.length} audiobooks to CSV`, 'success');
      } else {
        const jsonStr = createBackupJson(books, watchlists, muteList, preferences, pushSettings);
        const dateStr = new Date().toISOString().split('T')[0];
        triggerFileDownload(jsonStr, `audible_tracker_backup_${dateStr}.json`, 'application/json');
        showToast(`Backup exported (${books.length} books, ${watchlists.length} watchlist targets)`, 'success');
      }
    } catch (err: any) {
      showToast(`Export failed: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // Import backup data (Merge or Replace)
  const importBackup = (
    backup: TrackerBackup,
    mode: 'merge' | 'replace'
  ): { success: boolean; booksCount: number; watchlistsCount: number } => {
    try {
      const incomingBooks = backup.books || [];
      const incomingWatchlists = backup.watchlists || [];
      const incomingMuteList = backup.muteList || [];

      if (mode === 'replace') {
        setBooks(incomingBooks);
        if (incomingWatchlists.length > 0) setWatchlists(incomingWatchlists);
        if (incomingMuteList.length > 0) setMuteList(incomingMuteList);
        if (backup.preferences) updatePreferences(backup.preferences);
        showToast(`Restored ${incomingBooks.length} books and ${incomingWatchlists.length} watchlist targets!`, 'success');
        return { success: true, booksCount: incomingBooks.length, watchlistsCount: incomingWatchlists.length };
      } else {
        // Merge mode
        let addedBooks = 0;
        setBooks((prev) => {
          const merged = [...prev];
          for (const inBook of incomingBooks) {
            const inAsin = getASIN(inBook.url || inBook.audibleUrl || '');
            const inTitle = inBook.title.toLowerCase().trim();

            const matchIdx = merged.findIndex((b) => {
              if (inAsin && getASIN(b.url || b.audibleUrl || '') === inAsin) return true;
              if (b.id === inBook.id) return true;
              return b.title.toLowerCase().trim() === inTitle;
            });

            if (matchIdx >= 0) {
              merged[matchIdx] = {
                ...inBook,
                downloaded: merged[matchIdx].downloaded || inBook.downloaded,
                listened: merged[matchIdx].listened || inBook.listened,
                isRead: merged[matchIdx].isRead || inBook.isRead,
              };
            } else {
              merged.push(inBook);
              addedBooks++;
            }
          }
          return merged;
        });

        let addedWatchlists = 0;
        setWatchlists((prev) => {
          const merged = [...prev];
          for (const w of incomingWatchlists) {
            if (!merged.some((existing) => existing.type === w.type && existing.name.toLowerCase() === w.name.toLowerCase())) {
              merged.push({ ...w, id: w.id || `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
              addedWatchlists++;
            }
          }
          return merged;
        });

        setMuteList((prev) => {
          const merged = [...prev];
          for (const m of incomingMuteList) {
            if (!merged.some((existing) => existing.type === m.type && existing.value.toLowerCase() === m.value.toLowerCase())) {
              merged.push({ ...m, id: m.id || `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
            }
          }
          return merged;
        });

        if (backup.preferences) {
          updatePreferences(backup.preferences);
        }

        showToast(`Merged ${addedBooks} new books & ${addedWatchlists} watchlists!`, 'success');
        return { success: true, booksCount: incomingBooks.length, watchlistsCount: incomingWatchlists.length };
      }
    } catch (err: any) {
      showToast(`Import error: ${err.message || 'Failed to process import'}`, 'error');
      return { success: false, booksCount: 0, watchlistsCount: 0 };
    }
  };

  const resetToDefaults = () => {
    setBooks(INITIAL_AUDIOBOOKS);
    setWatchlists(DEFAULT_WATCHLIST);
    setMuteList(DEFAULT_MUTELIST);
  };

  return (
    <TrackerContext.Provider
      value={{
        books,
        watchlists,
        muteList,
        notifications,
        pushSettings,
        preferences,
        updatePreferences,
        languageFilter,
        setLanguageFilter,
        theme,
        setTheme,
        toggleTheme,
        unreadNotifCount,
        lastCheckedTime,
        isScanning,
        scanStatusText,
        selectedBookId,
        setSelectedBookId,
        selectedBook,
        activeAudio,
        toggleAudioPreview,
        addBook,
        updateBook,
        deleteBook,
        deleteMultipleBooks,
        toggleField,
        toggleReminder,
        markAsRead,
        markAsUnread,
        refetchBookMetadata,
        runScheduledScan,
        scanSingleTarget,
        addWatchlistTarget,
        removeWatchlistTarget,
        addMuteRule,
        removeMuteRule,
        quickMuteSeries,
        quickAddWatchlist,
        trackedEntities: watchlists,
        addTrackedEntity,
        removeTrackedEntity,
        isEntityTracked,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        triggerTestNotification,
        updatePushSettings,
        requestSystemNotificationPermission,
        exportBackup,
        importBackup,
        toasts,
        showToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        selectedGenre,
        setSelectedGenre,
        minRating,
        setMinRating,
        viewFilter,
        setViewFilter,
        timeframeFilter,
        setTimeframeFilter,
        viewMode,
        setViewMode,
        resetToDefaults,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};
