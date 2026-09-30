import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Audiobook,
  Author,
  Narrator,
  Series,
  WatchlistItem,
  MuteItem,
  NotificationLogItem,
  PushNotificationSettings,
  LocalSyncConfig,
  AppTab,
  Genre,
  TrackedEntity,
  TrackedEntityType,
} from '../types/audiobook';
import {
  INITIAL_AUDIOBOOKS,
  INITIAL_AUTHORS,
  INITIAL_NARRATORS,
  INITIAL_SERIES,
  DEFAULT_PUSH_SETTINGS,
} from '../data/initialCatalog';
import {
  sendNativePushNotification,
  requestPushPermission,
} from '../utils/notifications';
import {
  getInitialSyncConfig,
  saveSyncConfig,
  selectLocalFolder,
  syncToLocalFolder,
  restoreFromLocalFolder,
  LocalSyncPayload,
} from '../services/localFolderSync';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface AppPreferences {
  defaultViewMode: 'compact_grid' | 'grid' | 'table' | 'list';
  defaultSearchMode: 'Title' | 'Series' | 'Author' | 'Narrator';
  defaultCalendarView: 'month' | 'agenda';
  defaultViewFilter?: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
  defaultMarketplace: string;
  comfortTextMode: boolean;
  theme: 'light' | 'dark';
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  defaultViewMode: 'compact_grid',
  defaultSearchMode: 'Title',
  defaultCalendarView: 'month',
  defaultViewFilter: 'all',
  defaultMarketplace: 'US',
  comfortTextMode: false,
  theme: 'light',
};

interface TrackerContextType {
  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Data Collections
  books: Audiobook[];
  authors: Author[];
  narrators: Narrator[];
  series: Series[];
  watchlists: WatchlistItem[];
  muteList: MuteItem[];
  notifications: NotificationLogItem[];
  pushSettings: PushNotificationSettings;
  preferences: AppPreferences;
  syncConfig: LocalSyncConfig;

  // Filter / View State
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGenre: Genre | 'All';
  setSelectedGenre: (g: Genre | 'All') => void;
  minRating: number;
  setMinRating: (r: number) => void;
  viewFilter: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened';
  setViewFilter: (f: 'all' | 'upcoming' | 'today' | 'downloaded' | 'listened') => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  toggleTheme: () => void;
  unreadNotifCount: number;
  isScanning: boolean;
  lastCheckedTime: string | null;
  scanStatusText: string;
  timeframeFilter: string;
  setTimeframeFilter: (t: string) => void;
  viewMode: 'compact_grid' | 'grid' | 'table' | 'list';
  setViewMode: (v: 'compact_grid' | 'grid' | 'table' | 'list') => void;
  languageFilter: 'english_only' | 'all_languages';
  setLanguageFilter: (f: 'english_only' | 'all_languages') => void;

  // Modal / Detail Selections
  selectedBook: Audiobook | null;
  setSelectedBook: (b: Audiobook | null) => void;
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  selectedAuthor: Author | null;
  setSelectedAuthor: (a: Author | null) => void;
  selectedSeries: Series | null;
  setSelectedSeries: (s: Series | null) => void;
  selectedNarrator: Narrator | null;
  setSelectedNarrator: (n: Narrator | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Follow / Unfollow Actions
  toggleFollowBook: (bookId: string) => void;
  toggleFollowAuthor: (authorName: string) => void;
  toggleFollowNarrator: (narratorName: string) => void;
  toggleFollowSeries: (seriesName: string) => void;
  isBookFollowed: (bookId: string) => boolean;
  isAuthorFollowed: (authorName: string) => boolean;
  isNarratorFollowed: (narratorName: string) => boolean;
  isSeriesFollowed: (seriesName: string) => boolean;
  isEntityTracked: (type: 'author' | 'narrator' | 'series', name: string) => boolean;
  addTrackedEntity: (entity: { type: TrackedEntityType; name: string; notes?: string; url?: string }) => void;
  removeTrackedEntity: (id: string) => void;
  trackedEntities: TrackedEntity[];
  quickMuteSeries: (seriesName: string) => void;
  quickAddWatchlist: (type: 'Author' | 'Series' | 'Narrator', name: string, url?: string) => void;
  refetchBookMetadata: (bookId: string) => Promise<boolean>;
  runScheduledScan: (silent?: boolean) => Promise<{ newCount: number }>;
  exportBackup: (...args: any[]) => void;
  importBackup: (...args: any[]) => void;
  resetToDefaults: () => void;

  // Book CRUD & Modifications
  addBook: (book: Audiobook) => void;
  updateBook: (id: string, updates: Partial<Audiobook>) => void;
  deleteBook: (id: string) => void;
  deleteMultipleBooks: (ids: string[]) => void;
  updateReleaseDate: (bookId: string, newDate: string, reason?: string) => void;
  toggleDownload: (bookId: string) => void;
  toggleField: (bookId: string, field: 'downloaded' | 'listened') => void;
  markAsRead: (bookId: string, details?: { completedAt?: string; durationHours?: number; rating?: number; notes?: string }) => void;
  markAsUnread: (bookId: string) => void;
  toggleReminder: (bookId: string, type: keyof Audiobook['reminders']) => void;

  // Watchlist & Mute Rules
  addWatchlistTarget: (target: Omit<WatchlistItem, 'id'>) => void;
  removeWatchlistTarget: (id: string) => void;
  scanSingleTarget: (target: WatchlistItem) => Promise<number>;
  addMuteRule: (rule: Omit<MuteItem, 'id'>) => void;
  removeMuteRule: (id: string) => void;

  // Local Folder Sync (No Accounts!)
  connectLocalFolder: () => Promise<void>;
  performLocalSync: () => Promise<void>;
  performLocalRestore: () => Promise<void>;
  toggleAutoSync: (enabled: boolean) => void;

  // Notifications & Settings
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  triggerTestNotification: () => void;
  requestSystemNotificationPermission: () => Promise<void>;
  updatePushSettings: (settings: Partial<PushNotificationSettings>) => void;
  updatePreferences: (partial: Partial<AppPreferences>) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  const [books, setBooks] = useState<Audiobook[]>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_books_v3');
      return saved ? JSON.parse(saved) : INITIAL_AUDIOBOOKS;
    } catch {
      return INITIAL_AUDIOBOOKS;
    }
  });

  const [authors, setAuthors] = useState<Author[]>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_authors_v3');
      return saved ? JSON.parse(saved) : INITIAL_AUTHORS;
    } catch {
      return INITIAL_AUTHORS;
    }
  });

  const [narrators, setNarrators] = useState<Narrator[]>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_narrators_v3');
      return saved ? JSON.parse(saved) : INITIAL_NARRATORS;
    } catch {
      return INITIAL_NARRATORS;
    }
  });

  const [series, setSeries] = useState<Series[]>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_series_v3');
      return saved ? JSON.parse(saved) : INITIAL_SERIES;
    } catch {
      return INITIAL_SERIES;
    }
  });

  const [muteList, setMuteList] = useState<MuteItem[]>([
    { id: 'm-1', type: 'Series', value: 'Spanish Edition' },
  ]);

  const [notifications, setNotifications] = useState<NotificationLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_notifications_v3');
      return saved ? JSON.parse(saved) : [
        {
          id: 'notif-1',
          bookId: 'ab-2',
          bookTitle: 'This Inevitable Ruin',
          type: 'date_changed',
          title: 'Release Date Changed',
          message: 'Dungeon Crawler Carl Book 7 moved from Sep 30 to Oct 15 for full-cast audio.',
          triggerDate: '2026-09-10',
          timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
          read: false,
          oldDate: '2026-09-30',
          newDate: '2026-10-15',
        },
      ];
    } catch {
      return [];
    }
  });

  const [pushSettings, setPushSettings] = useState<PushNotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_push_settings_v3');
      return saved ? JSON.parse(saved) : DEFAULT_PUSH_SETTINGS;
    } catch {
      return DEFAULT_PUSH_SETTINGS;
    }
  });

  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    try {
      const saved = localStorage.getItem('audible_tracker_prefs_v3');
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [syncConfig, setSyncConfig] = useState<LocalSyncConfig>(getInitialSyncConfig);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'All'>('All');
  const [minRating, setMinRating] = useState(0);
  const [viewFilter, setViewFilter] = useState<'all' | 'upcoming' | 'today' | 'downloaded' | 'listened'>('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'compact_grid' | 'grid' | 'table' | 'list'>('compact_grid');
  const [languageFilter, setLanguageFilter] = useState<'english_only' | 'all_languages'>('english_only');
  const [isScanning, setIsScanning] = useState(false);

  const [selectedBook, setSelectedBook] = useState<Audiobook | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedNarrator, setSelectedNarrator] = useState<Narrator | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('audible_tracker_books_v3', JSON.stringify(books));
    } catch {}
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_tracker_authors_v3', JSON.stringify(authors));
    } catch {}
  }, [authors]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_tracker_narrators_v3', JSON.stringify(narrators));
    } catch {}
  }, [narrators]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_tracker_series_v3', JSON.stringify(series));
    } catch {}
  }, [series]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_tracker_notifications_v3', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_tracker_push_settings_v3', JSON.stringify(pushSettings));
    } catch {}
  }, [pushSettings]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_tracker_prefs_v3', JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dracula');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'alucard');
    }
  }, [preferences.theme]);

  const toggleTheme = () => {
    const next = preferences.theme === 'light' ? 'dark' : 'light';
    setPreferences((prev) => ({ ...prev, theme: next }));
  };

  const setTheme = (t: 'light' | 'dark') => {
    setPreferences((prev) => ({ ...prev, theme: t }));
  };

  // Follow Checkers
  const isBookFollowed = useCallback((bookId: string) => {
    return books.find((b) => b.id === bookId)?.isFollowed ?? false;
  }, [books]);

  const isAuthorFollowed = useCallback((name: string) => {
    return authors.find((a) => a.name.toLowerCase() === name.toLowerCase())?.isFollowed ?? false;
  }, [authors]);

  const isNarratorFollowed = useCallback((name: string) => {
    return narrators.find((n) => n.name.toLowerCase() === name.toLowerCase())?.isFollowed ?? false;
  }, [narrators]);

  const isSeriesFollowed = useCallback((name: string) => {
    return series.find((s) => s.name.toLowerCase() === name.toLowerCase())?.isFollowed ?? false;
  }, [series]);

  const isEntityTracked = useCallback((type: 'author' | 'narrator' | 'series', name: string) => {
    if (type === 'author') return isAuthorFollowed(name);
    if (type === 'narrator') return isNarratorFollowed(name);
    if (type === 'series') return isSeriesFollowed(name);
    return false;
  }, [isAuthorFollowed, isNarratorFollowed, isSeriesFollowed]);

  // Follow Toggles
  const toggleFollowBook = useCallback((bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const nextState = !b.isFollowed;
          showToast(nextState ? `Following ${b.title}` : `Unfollowed ${b.title}`, 'success');
          return { ...b, isFollowed: nextState };
        }
        return b;
      })
    );
  }, [showToast]);

  const toggleFollowAuthor = useCallback((authorName: string) => {
    setAuthors((prev) => {
      const existing = prev.find((a) => a.name.toLowerCase() === authorName.toLowerCase());
      if (existing) {
        const next = !existing.isFollowed;
        showToast(next ? `Following author ${authorName}` : `Unfollowed author ${authorName}`, 'success');
        return prev.map((a) => (a.id === existing.id ? { ...a, isFollowed: next } : a));
      } else {
        showToast(`Following author ${authorName}`, 'success');
        return [...prev, { id: 'auth-' + Date.now(), name: authorName, isFollowed: true }];
      }
    });
  }, [showToast]);

  const toggleFollowNarrator = useCallback((narratorName: string) => {
    setNarrators((prev) => {
      const existing = prev.find((n) => n.name.toLowerCase() === narratorName.toLowerCase());
      if (existing) {
        const next = !existing.isFollowed;
        showToast(next ? `Following narrator ${narratorName}` : `Unfollowed narrator ${narratorName}`, 'success');
        return prev.map((n) => (n.id === existing.id ? { ...n, isFollowed: next } : n));
      } else {
        showToast(`Following narrator ${narratorName}`, 'success');
        return [...prev, { id: 'narr-' + Date.now(), name: narratorName, isFollowed: true }];
      }
    });
  }, [showToast]);

  const toggleFollowSeries = useCallback((seriesName: string) => {
    setSeries((prev) => {
      const existing = prev.find((s) => s.name.toLowerCase() === seriesName.toLowerCase());
      if (existing) {
        const next = !existing.isFollowed;
        showToast(next ? `Following series ${seriesName}` : `Unfollowed series ${seriesName}`, 'success');
        return prev.map((s) => (s.id === existing.id ? { ...s, isFollowed: next } : s));
      } else {
        showToast(`Following series ${seriesName}`, 'success');
        return [...prev, { id: 'ser-' + Date.now(), name: seriesName, author: 'Multiple Authors', isFollowed: true, bookCount: 1 }];
      }
    });
  }, [showToast]);

  // Book CRUD
  const addBook = (book: Audiobook) => {
    setBooks((prev) => [book, ...prev]);
    showToast(`Added "${book.title}" to library`, 'success');
  };

  const updateBook = (id: string, updates: Partial<Audiobook>) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    showToast('Updated audiobook details', 'success');
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    showToast('Audiobook removed', 'info');
  };

  const deleteMultipleBooks = (ids: string[]) => {
    setBooks((prev) => prev.filter((b) => !ids.includes(b.id)));
    showToast(`Removed ${ids.length} audiobooks`, 'info');
  };

  const updateReleaseDate = (bookId: string, newDate: string, reason?: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          if (b.releaseDate === newDate) return b;
          const oldDate = b.releaseDate;
          const historyEntry = {
            oldDate,
            newDate,
            changedAt: new Date().toISOString(),
            reason: reason || 'Audible release schedule revised',
          };
          const nextHistory = [...(b.releaseHistory || []), historyEntry];

          if (pushSettings.notifyDateChanged) {
            const notif: NotificationLogItem = {
              id: 'notif-change-' + Date.now(),
              bookId: b.id,
              bookTitle: b.title,
              type: 'date_changed',
              title: '📅 Release Date Changed',
              message: `${b.title} changed from ${oldDate} to ${newDate}.${reason ? ' ' + reason : ''}`,
              triggerDate: new Date().toISOString().split('T')[0],
              timestamp: new Date().toISOString(),
              read: false,
              oldDate,
              newDate,
            };
            setNotifications((n) => [notif, ...n]);
            sendNativePushNotification(notif.title, { body: notif.message });
          }

          showToast(`Release date updated for ${b.title}`, 'info');
          return {
            ...b,
            releaseDate: newDate,
            originalReleaseDate: b.originalReleaseDate || oldDate,
            releaseHistory: nextHistory,
          };
        }
        return b;
      })
    );
  };

  const toggleDownload = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const next = b.downloaded === 'Yes' ? 'No' : 'Yes';
          showToast(next === 'Yes' ? 'Marked as Downloaded' : 'Removed download flag', 'info');
          return { ...b, downloaded: next };
        }
        return b;
      })
    );
  };

  const toggleField = (bookId: string, field: 'downloaded' | 'listened') => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const next = b[field] === 'Yes' ? 'No' : 'Yes';
          return { ...b, [field]: next };
        }
        return b;
      })
    );
  };

  const markAsRead = (bookId: string, details?: { completedAt?: string; durationHours?: number; rating?: number; notes?: string }) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          return {
            ...b,
            isRead: true,
            listened: 'Yes',
            readCompletedAt: details?.completedAt || new Date().toISOString(),
            listeningDurationHours: details?.durationHours || b.runtimeHours,
            userPersonalRating: details?.rating ?? b.userPersonalRating ?? 5,
            userNotes: details?.notes ?? b.userNotes,
          };
        }
        return b;
      })
    );
    showToast('Marked as listened! Logged to history', 'success');
  };

  const markAsUnread = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, isRead: false, listened: 'No' } : b))
    );
    showToast('Reset listened status', 'info');
  };

  const toggleReminder = (bookId: string, type: keyof Audiobook['reminders']) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const nextVal = !b.reminders[type];
          return {
            ...b,
            reminders: { ...b.reminders, [type]: nextVal },
          };
        }
        return b;
      })
    );
  };

  const addWatchlistTarget = (target: Omit<WatchlistItem, 'id'>) => {
    if (target.type === 'Author') toggleFollowAuthor(target.name);
    else if (target.type === 'Narrator') toggleFollowNarrator(target.name);
    else if (target.type === 'Series') toggleFollowSeries(target.name);
  };

  const removeWatchlistTarget = (id: string) => {};
  const scanSingleTarget = async (target: WatchlistItem) => 0;

  const addMuteRule = (rule: Omit<MuteItem, 'id'>) => {
    setMuteList((prev) => [...prev, { ...rule, id: 'm-' + Date.now() }]);
    showToast('Mute rule added', 'info');
  };

  const removeMuteRule = (id: string) => {
    setMuteList((prev) => prev.filter((m) => m.id !== id));
  };

  // Local Folder Sync
  const connectLocalFolder = async () => {
    try {
      const folder = await selectLocalFolder();
      const updatedConfig: LocalSyncConfig = {
        ...syncConfig,
        folderName: folder,
        syncStatus: 'idle',
      };
      setSyncConfig(updatedConfig);
      saveSyncConfig(updatedConfig);
      showToast(`Connected local folder: ${folder}`, 'success');
    } catch (err: any) {
      if (err.message !== 'Selection cancelled') {
        showToast('Could not select folder', 'error');
      }
    }
  };

  const performLocalSync = async () => {
    try {
      setSyncConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));
      const payload: LocalSyncPayload = {
        version: '2.5.0',
        exportedAt: new Date().toISOString(),
        audiobooks: books,
        authors,
        narrators,
        series,
        watchlists: [],
        notifications,
        pushSettings,
        marketplace: preferences.defaultMarketplace,
      };

      const result = await syncToLocalFolder(payload, syncConfig.folderName);
      const updatedConfig: LocalSyncConfig = {
        ...syncConfig,
        lastSyncedAt: result.syncedAt,
        syncStatus: 'synced',
      };
      setSyncConfig(updatedConfig);
      saveSyncConfig(updatedConfig);
      showToast(`Synchronized to ${syncConfig.folderName}`, 'success');
    } catch (err: any) {
      setSyncConfig((prev) => ({ ...prev, syncStatus: 'error', errorMessage: err.message }));
      showToast('Sync failed: ' + err.message, 'error');
    }
  };

  const performLocalRestore = async () => {
    try {
      const data = await restoreFromLocalFolder();
      if (!data) return;
      if (data.audiobooks && Array.isArray(data.audiobooks)) {
        setBooks(data.audiobooks);
      }
      if (data.authors && Array.isArray(data.authors)) {
        setAuthors(data.authors);
      }
      if (data.narrators && Array.isArray(data.narrators)) {
        setNarrators(data.narrators);
      }
      if (data.series && Array.isArray(data.series)) {
        setSeries(data.series);
      }
      showToast(`Restored ${data.audiobooks?.length || 0} audiobooks`, 'success');
    } catch (err: any) {
      showToast('Restore error: ' + err.message, 'error');
    }
  };

  const toggleAutoSync = (enabled: boolean) => {
    const updated = { ...syncConfig, autoSyncEnabled: enabled };
    setSyncConfig(updated);
    saveSyncConfig(updated);
    showToast(enabled ? 'Auto-sync enabled' : 'Auto-sync paused', 'info');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked read', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const triggerTestNotification = () => {
    sendNativePushNotification('🎉 Test Alert', { body: 'Native release notifications are active and ready!' });
    showToast('Sent test notification', 'success');
  };

  const requestSystemNotificationPermission = async () => {
    await requestPushPermission();
  };

  const updatePushSettings = (updates: Partial<PushNotificationSettings>) => {
    setPushSettings((prev) => ({ ...prev, ...updates }));
    showToast('Alert preferences saved', 'success');
  };

  const updatePreferences = (partial: Partial<AppPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...partial }));
    showToast('Preferences updated', 'success');
  };

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <TrackerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        books,
        authors,
        narrators,
        series,
        watchlists: [],
        muteList,
        notifications,
        pushSettings,
        preferences,
        syncConfig,
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
        languageFilter,
        setLanguageFilter,
        theme: preferences.theme,
        setTheme,
        toggleTheme,
        unreadNotifCount,
        isScanning,
        lastCheckedTime: syncConfig.lastSyncedAt,
        scanStatusText: 'Ready',

        selectedBook,
        setSelectedBook,
        selectedBookId: selectedBook ? selectedBook.id : null,
        setSelectedBookId: (id: string | null) => {
          setSelectedBook(books.find((b) => b.id === id) || null);
        },
        selectedAuthor,
        setSelectedAuthor,
        selectedSeries,
        setSelectedSeries,
        selectedNarrator,
        setSelectedNarrator,
        isSearchOpen,
        setIsSearchOpen,

        toggleFollowBook,
        toggleFollowAuthor,
        toggleFollowNarrator,
        toggleFollowSeries,
        isBookFollowed,
        isAuthorFollowed,
        isNarratorFollowed,
        isSeriesFollowed,
        isEntityTracked,
        addTrackedEntity: (entity: any) => {
          if (entity.type === 'author') toggleFollowAuthor(entity.name);
          else if (entity.type === 'narrator') toggleFollowNarrator(entity.name);
          else if (entity.type === 'series') toggleFollowSeries(entity.name);
        },
        removeTrackedEntity: (id: string) => {},
        trackedEntities: [],
        quickMuteSeries: (seriesName: string) => {
          addMuteRule({ type: 'Series', value: seriesName });
        },
        quickAddWatchlist: (type: 'Author' | 'Series' | 'Narrator', name: string) => {
          if (type === 'Author') toggleFollowAuthor(name);
          else if (type === 'Narrator') toggleFollowNarrator(name);
          else if (type === 'Series') toggleFollowSeries(name);
        },
        refetchBookMetadata: async () => true,
        runScheduledScan: async () => ({ newCount: 0 }),
        exportBackup: () => {
          performLocalSync();
        },
        importBackup: () => {
          performLocalRestore();
        },
        resetToDefaults: () => {
          setBooks(INITIAL_AUDIOBOOKS);
          showToast('Library reset to initial catalog', 'info');
        },

        addBook,
        updateBook,
        deleteBook,
        deleteMultipleBooks,
        updateReleaseDate,
        toggleDownload,
        toggleField,
        markAsRead,
        markAsUnread,
        toggleReminder,

        addWatchlistTarget,
        removeWatchlistTarget,
        scanSingleTarget,
        addMuteRule,
        removeMuteRule,

        connectLocalFolder,
        performLocalSync,
        performLocalRestore,
        toggleAutoSync,

        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        triggerTestNotification,
        requestSystemNotificationPermission,
        updatePushSettings,
        updatePreferences,

        toasts,
        showToast,
        removeToast,
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
