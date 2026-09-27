import React, { createContext, useContext, useState, useEffect } from 'react';
import { Audiobook, WatchlistItem, MuteItem, NotificationLogItem, PushNotificationSettings, TrackedEntity, TrackedEntityType } from '../types/audiobook';
import { INITIAL_AUDIOBOOKS, DEFAULT_PUSH_SETTINGS } from '../data/initialCatalog';
import { audioPlayer } from '../utils/audioPreview';
import { playNotificationSound, sendNativePushNotification, requestPushPermission, CURRENT_DATE_STR, evaluateTriggeredReminders } from '../utils/notifications';
import { fetchAudibleApiMetadata, scanWatchlistTarget, isMuted, isEnglishAudiobook, getASIN } from '../services/audibleApiService';

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

interface TrackerContextType {
  books: Audiobook[];
  watchlists: WatchlistItem[];
  muteList: MuteItem[];
  notifications: NotificationLogItem[];
  pushSettings: PushNotificationSettings;
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
};

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [viewFilter, setViewFilter] = useState<'all' | 'upcoming' | 'today' | 'downloaded' | 'listened'>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'tracked'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'compact_grid' | 'list' | 'table'>('table');

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
        const found = scanWatchlistTarget(item, books, muteList);
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
        const found = scanWatchlistTarget(item, books, muteList);
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
        const found = scanWatchlistTarget(item, books, muteList);
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
      const found = scanWatchlistTarget(target, books, muteList);
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
