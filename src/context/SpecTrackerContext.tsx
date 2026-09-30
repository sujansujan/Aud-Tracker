import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Book,
  Author,
  Series,
  BookAuthor,
  Follow,
  DismissedBook,
  ReleaseHistory,
  SearchHistory,
  NotificationLog,
  UserSettings,
  MainNavTab,
  Marketplace,
  FollowType,
} from '../types/specModels';
import {
  INITIAL_AUTHORS_SPEC,
  INITIAL_SERIES_SPEC,
  INITIAL_BOOKS_SPEC,
  INITIAL_RELEASE_HISTORIES_SPEC,
  LATER_SYNC_NEW_ANNOUNCEMENT_BOOK,
} from '../data/fakeRemoteSource';
import { Clock, defaultClock, getDaysBetween, isRecentDateChange, formatCountdown } from '../utils/clock';
import { sendNativePushNotification, requestPushPermission } from '../utils/notifications';

export interface ComputedBookItem {
  book: Book;
  primaryAuthor: Author;
  series?: Series;
  sourceCaption: string; // "Followed", "By {author}", or "In {series}"
  isDirectFollow: boolean;
  isArchived: boolean;
  dateChangedRecent: boolean;
  previousDate?: string | null;
}

export interface SnackbarState {
  id: string;
  message: string;
  onUndo: () => void;
}

interface SpecTrackerContextType {
  // Navigation
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;
  selectedBookId: string | null;
  setSelectedBookId: (id: string | null) => void;
  selectedAuthorId: string | null;
  setSelectedAuthorId: (id: string | null) => void;
  selectedSeriesId: string | null;
  setSelectedSeriesId: (id: string | null) => void;

  // Data
  books: Book[];
  authors: Author[];
  series: Series[];
  bookAuthors: BookAuthor[];
  follows: Follow[];
  dismissed: DismissedBook[];
  releaseHistories: ReleaseHistory[];
  searchHistories: SearchHistory[];
  notifications: NotificationLog[];
  settings: UserSettings;

  // Clock
  clock: Clock;

  // Computed upcoming items
  getComputedBooks: (
    filter: 'UPCOMING' | 'RELEASED' | 'ARCHIVED',
    sortBy: 'release_date' | 'recently_added' | 'title'
  ) => ComputedBookItem[];

  // Entity queries
  getBookById: (id: string) => Book | undefined;
  getAuthorById: (id: string) => Author | undefined;
  getSeriesById: (id: string) => Series | undefined;
  getAuthorsForBook: (bookId: string) => Author[];
  getBooksForAuthor: (authorId: string) => Book[];
  getBooksForSeries: (seriesId: string) => Book[];
  getReleaseHistoryForBook: (bookId: string) => ReleaseHistory[];

  // Follow states
  isBookFollowed: (bookId: string) => boolean;
  isAuthorFollowed: (authorId: string) => boolean;
  isSeriesFollowed: (seriesId: string) => boolean;
  getBookFollow: (bookId: string) => Follow | undefined;
  getAuthorFollow: (authorId: string) => Follow | undefined;
  getSeriesFollow: (seriesId: string) => Follow | undefined;

  // Actions
  followBook: (
    bookId: string,
    reminderOffsets?: number[],
    alsoFollowAuthorId?: string,
    alsoFollowSeriesId?: string
  ) => void;
  unfollowBook: (bookId: string) => void;
  archiveBook: (bookId: string) => void;
  unarchiveBook: (bookId: string) => void;
  dismissBook: (bookId: string) => void;
  undismissBook: (bookId: string) => void;
  updateBookReminders: (bookId: string, offsets: number[]) => void;

  followAuthor: (authorId: string) => void;
  unfollowAuthor: (authorId: string) => void;
  toggleAuthorNotify: (authorId: string) => void;

  followSeries: (seriesId: string) => void;
  unfollowSeries: (seriesId: string) => void;
  toggleSeriesNotify: (seriesId: string) => void;

  // Search History
  addSearchQuery: (query: string) => void;
  removeSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;

  // Background Sync & Demo Trigger
  syncNow: () => Promise<void>;
  isSyncing: boolean;
  triggerDemoNewAnnouncement: () => Promise<void>;
  hasTriggeredDemoAnnouncement: boolean;

  // Settings
  updateSettings: (updates: Partial<UserSettings>) => void;
  clearCache: () => void;

  // Ingestion from Audible Search (bonukai/MediaTracker provider)
  ingestAudibleItem: (book: Book, authorsList: Author[], seriesItem?: Series) => void;

  // Undo Snackbar
  snackbar: SnackbarState | null;
  dismissSnackbar: () => void;
}

const SpecTrackerContext = createContext<SpecTrackerContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  notificationsMaster: true,
  notifyReleaseDay: true,
  notifyOneDay: true,
  notifyThreeDays: false,
  notifyOneWeek: false,
  notifyDateChanged: true,
  notifyNowAvailable: true,
  notifyNewAuthorBook: true,
  notifyNewSeriesInstallment: true,
  deliveryTime: '09:00',
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  marketplace: 'US',
  theme: 'system',
  lastSyncedAt: '2026-09-27T08:00:00Z',
};

// Initial Seed Follows: Follow Sanderson (auth-1), DCC series (ser-2), and Bobiverse 5 (B0D1122334)
const INITIAL_FOLLOWS_SPEC: Follow[] = [
  {
    type: 'AUTHOR',
    targetId: 'auth-1', // Brandon Sanderson
    followedAt: '2026-08-01T10:00:00Z',
    archived: false,
    baselineSyncedAt: '2026-08-01T10:00:00Z',
    notifyNewBooks: true,
  },
  {
    type: 'SERIES',
    targetId: 'ser-2', // Dungeon Crawler Carl
    followedAt: '2026-08-05T10:00:00Z',
    archived: false,
    baselineSyncedAt: '2026-08-05T10:00:00Z',
    notifyNewBooks: true,
  },
  {
    type: 'BOOK',
    targetId: 'B0D1122334', // Not Till We Are Lost (Bobiverse 5)
    followedAt: '2026-08-10T10:00:00Z',
    reminderOffsets: [0, 1],
    archived: false,
    baselineSyncedAt: '2026-08-10T10:00:00Z',
  },
];

export const SpecTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const clock = defaultClock;

  // Navigation
  const [activeTab, setActiveTab] = useState<MainNavTab>('upcoming');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  // Entities
  const [authors, setAuthors] = useState<Author[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_authors_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_AUTHORS_SPEC;
  });

  const [series, setSeries] = useState<Series[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_series_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SERIES_SPEC;
  });

  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_books_v1');
      if (saved) {
        const parsed: Book[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_BOOKS_SPEC;
  });

  const [bookAuthors, setBookAuthors] = useState<BookAuthor[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_book_authors_v1');
      if (saved) {
        const parsed: BookAuthor[] = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
    } catch {}
    const list: BookAuthor[] = [];
    for (const b of INITIAL_BOOKS_SPEC) {
      b.authorIds.forEach((aId, index) => {
        list.push({ bookId: b.id, authorId: aId, position: index });
      });
    }
    return list;
  });

  const [follows, setFollows] = useState<Follow[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_follows_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FOLLOWS_SPEC;
  });

  const [dismissed, setDismissed] = useState<DismissedBook[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_dismissed_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [releaseHistories, setReleaseHistories] = useState<ReleaseHistory[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_release_histories_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_RELEASE_HISTORIES_SPEC;
  });

  const [searchHistories, setSearchHistories] = useState<SearchHistory[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_search_histories_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { query: 'Brandon Sanderson', searchedAt: '2026-09-26T14:00:00Z' },
      { query: 'Dungeon Crawler Carl', searchedAt: '2026-09-25T11:00:00Z' },
      { query: 'Pierce Brown', searchedAt: '2026-09-24T09:00:00Z' },
    ];
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_notifications_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('audible_spec_settings_v1');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [hasTriggeredDemoAnnouncement, setHasTriggeredDemoAnnouncement] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_authors_v1', JSON.stringify(authors));
    } catch {}
  }, [authors]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_series_v1', JSON.stringify(series));
    } catch {}
  }, [series]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_books_v1', JSON.stringify(books));
    } catch {}
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_book_authors_v1', JSON.stringify(bookAuthors));
    } catch {}
  }, [bookAuthors]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_follows_v1', JSON.stringify(follows));
    } catch {}
  }, [follows]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_dismissed_v1', JSON.stringify(dismissed));
    } catch {}
  }, [dismissed]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_release_histories_v1', JSON.stringify(releaseHistories));
    } catch {}
  }, [releaseHistories]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_search_histories_v1', JSON.stringify(searchHistories));
    } catch {}
  }, [searchHistories]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_notifications_v1', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('audible_spec_settings_v1', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [settings.theme]);

  // Query Helpers
  const getBookById = useCallback((id: string) => books.find((b) => b.id === id), [books]);
  const getAuthorById = useCallback((id: string) => authors.find((a) => a.id === id), [authors]);
  const getSeriesById = useCallback((id: string) => series.find((s) => s.id === id), [series]);

  const getAuthorsForBook = useCallback(
    (bookId: string): Author[] => {
      const relations = bookAuthors
        .filter((ba) => ba.bookId === bookId)
        .sort((a, b) => a.position - b.position);
      if (relations.length > 0) {
        return relations
          .map((r) => authors.find((a) => a.id === r.authorId))
          .filter((a): a is Author => a !== undefined);
      }
      const b = books.find((x) => x.id === bookId);
      if (b?.authorIds && b.authorIds.length > 0) {
        return b.authorIds
          .map((aId) => authors.find((a) => a.id === aId))
          .filter((a): a is Author => a !== undefined);
      }
      return [];
    },
    [bookAuthors, authors, books]
  );

  const getBooksForAuthor = useCallback(
    (authorId: string): Book[] => {
      const bookIds = new Set(bookAuthors.filter((ba) => ba.authorId === authorId).map((ba) => ba.bookId));
      return books.filter((b) => bookIds.has(b.id) || (b.authorIds && b.authorIds.includes(authorId)));
    },
    [bookAuthors, books]
  );

  const getBooksForSeries = useCallback(
    (seriesId: string): Book[] => {
      return books
        .filter((b) => b.seriesId === seriesId)
        .sort((a, b) => {
          const posA = parseFloat(a.seriesPosition || '0');
          const posB = parseFloat(b.seriesPosition || '0');
          return posA - posB;
        });
    },
    [books]
  );

  const getReleaseHistoryForBook = useCallback(
    (bookId: string): ReleaseHistory[] => {
      return releaseHistories
        .filter((rh) => rh.bookId === bookId)
        .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    },
    [releaseHistories]
  );

  // Follow State Checkers
  const isBookFollowed = useCallback(
    (bookId: string) => follows.some((f) => f.type === 'BOOK' && f.targetId === bookId && !f.archived),
    [follows]
  );

  const isAuthorFollowed = useCallback(
    (authorId: string) => follows.some((f) => f.type === 'AUTHOR' && f.targetId === authorId),
    [follows]
  );

  const isSeriesFollowed = useCallback(
    (seriesId: string) => follows.some((f) => f.type === 'SERIES' && f.targetId === seriesId),
    [follows]
  );

  const getBookFollow = useCallback(
    (bookId: string) => follows.find((f) => f.type === 'BOOK' && f.targetId === bookId),
    [follows]
  );

  const getAuthorFollow = useCallback(
    (authorId: string) => follows.find((f) => f.type === 'AUTHOR' && f.targetId === authorId),
    [follows]
  );

  const getSeriesFollow = useCallback(
    (seriesId: string) => follows.find((f) => f.type === 'SERIES' && f.targetId === seriesId),
    [follows]
  );

  /**
   * SECTION 4 & 6.1: Compute Upcoming List
   *
   * Following an author or series never creates book follows.
   * The Upcoming list is computed:
   * directly followed books, plus upcoming books by followed authors, plus upcoming books in followed series,
   * minus dismissed books, de-duplicated by book id.
   *
   * Caption priority:
   * 1. "Followed"
   * 2. "By {author}"
   * 3. "In {series}"
   */
  const getComputedBooks = useCallback(
    (
      filter: 'UPCOMING' | 'RELEASED' | 'ARCHIVED',
      sortBy: 'release_date' | 'recently_added' | 'title'
    ): ComputedBookItem[] => {
      const dismissedIds = new Set(dismissed.map((d) => d.bookId));

      const bookFollowMap = new Map<string, Follow>();
      for (const f of follows) {
        if (f.type === 'BOOK') bookFollowMap.set(f.targetId, f);
      }

      const followedAuthorIds = new Set(
        follows.filter((f) => f.type === 'AUTHOR').map((f) => f.targetId)
      );
      const followedSeriesIds = new Set(
        follows.filter((f) => f.type === 'SERIES').map((f) => f.targetId)
      );

      const items: ComputedBookItem[] = [];
      const seenBookIds = new Set<string>();

      for (const book of books) {
        if (dismissedIds.has(book.id)) continue;

        const bookFollow = bookFollowMap.get(book.id);
        const isDirect = !!bookFollow;
        const isArchived = bookFollow?.archived || false;

        const bookAuthorsList = getAuthorsForBook(book.id);
        const primaryAuthor = bookAuthorsList[0] || { id: 'unknown', name: 'Unknown Author' };

        const matchesAuthor = bookAuthorsList.some((a) => followedAuthorIds.has(a.id));
        const matchesSeries = book.seriesId ? followedSeriesIds.has(book.seriesId) : false;

        // Is it eligible to be shown?
        if (!isDirect && !matchesAuthor && !matchesSeries) continue;

        // Apply tab filter:
        if (filter === 'ARCHIVED') {
          if (!isArchived) continue;
        } else {
          if (isArchived) continue;
          if (filter === 'UPCOMING' && book.status !== 'UPCOMING') continue;
          if (filter === 'RELEASED' && book.status !== 'RELEASED') continue;
        }

        // Determine source caption (First applicable in order: Followed -> By {author} -> In {series})
        let sourceCaption = 'Followed';
        if (isDirect) {
          sourceCaption = 'Followed';
        } else if (matchesAuthor) {
          const matchedAuth = bookAuthorsList.find((a) => followedAuthorIds.has(a.id));
          sourceCaption = `By ${matchedAuth?.name || primaryAuthor.name}`;
        } else if (matchesSeries) {
          const ser = series.find((s) => s.id === book.seriesId);
          sourceCaption = `In ${ser?.name || 'series'}`;
        }

        // Check for recent date change (last 14 days)
        const histories = getReleaseHistoryForBook(book.id);
        const latestHistory = histories[0];
        const dateChangedRecent = latestHistory ? isRecentDateChange(latestHistory.changedAt, clock) : false;

        seenBookIds.add(book.id);
        items.push({
          book,
          primaryAuthor,
          series: series.find((s) => s.id === book.seriesId),
          sourceCaption,
          isDirectFollow: isDirect,
          isArchived,
          dateChangedRecent,
          previousDate: latestHistory?.oldDate,
        });
      }

      // Sorting
      items.sort((a, b) => {
        if (sortBy === 'title') {
          return a.book.title.localeCompare(b.book.title);
        }
        if (sortBy === 'recently_added') {
          return new Date(b.book.firstSeenAt).getTime() - new Date(a.book.firstSeenAt).getTime();
        }
        // Default: release_date ascending (null/TBA at the end)
        if (!a.book.releaseDate && !b.book.releaseDate) return 0;
        if (!a.book.releaseDate) return 1;
        if (!b.book.releaseDate) return -1;
        return getDaysBetween(a.book.releaseDate, clock) - getDaysBetween(b.book.releaseDate, clock);
      });

      return items;
    },
    [books, follows, dismissed, getAuthorsForBook, series, getReleaseHistoryForBook, clock]
  );

  // Show Undo Snackbar
  const showUndoSnackbar = (message: string, onUndo: () => void) => {
    const id = Date.now().toString();
    setSnackbar({ id, message, onUndo });
  };

  const dismissSnackbar = () => {
    setSnackbar(null);
  };

  // Follow Book Action
  const followBook = (
    bookId: string,
    reminderOffsets: number[] = [0, 1],
    alsoFollowAuthorId?: string,
    alsoFollowSeriesId?: string
  ) => {
    requestPushPermission();
    setFollows((prev) => {
      const filtered = prev.filter((f) => !(f.type === 'BOOK' && f.targetId === bookId));
      const nextFollow: Follow = {
        type: 'BOOK',
        targetId: bookId,
        followedAt: clock.now().toISOString(),
        reminderOffsets,
        archived: false,
        baselineSyncedAt: clock.now().toISOString(),
      };
      return [...filtered, nextFollow];
    });

    if (alsoFollowAuthorId) {
      followAuthor(alsoFollowAuthorId);
    }
    if (alsoFollowSeriesId) {
      followSeries(alsoFollowSeriesId);
    }
  };

  const unfollowBook = (bookId: string) => {
    const existing = follows.find((f) => f.type === 'BOOK' && f.targetId === bookId);
    setFollows((prev) => prev.filter((f) => !(f.type === 'BOOK' && f.targetId === bookId)));

    if (existing) {
      showUndoSnackbar('Unfollowed book', () => {
        setFollows((prev) => [...prev, existing]);
      });
    }
  };

  const archiveBook = (bookId: string) => {
    setFollows((prev) =>
      prev.map((f) => (f.type === 'BOOK' && f.targetId === bookId ? { ...f, archived: true } : f))
    );
    showUndoSnackbar('Book archived', () => {
      setFollows((prev) =>
        prev.map((f) => (f.type === 'BOOK' && f.targetId === bookId ? { ...f, archived: false } : f))
      );
    });
  };

  const unarchiveBook = (bookId: string) => {
    setFollows((prev) =>
      prev.map((f) => (f.type === 'BOOK' && f.targetId === bookId ? { ...f, archived: false } : f))
    );
  };

  const dismissBook = (bookId: string) => {
    const newDismiss: DismissedBook = { bookId, dismissedAt: clock.now().toISOString() };
    setDismissed((prev) => [...prev, newDismiss]);
    showUndoSnackbar('Book dismissed from list', () => {
      setDismissed((prev) => prev.filter((d) => d.bookId !== bookId));
    });
  };

  const undismissBook = (bookId: string) => {
    setDismissed((prev) => prev.filter((d) => d.bookId !== bookId));
  };

  const updateBookReminders = (bookId: string, offsets: number[]) => {
    setFollows((prev) =>
      prev.map((f) => (f.type === 'BOOK' && f.targetId === bookId ? { ...f, reminderOffsets: offsets } : f))
    );
  };

  // Follow Author (Strict Baseline Rule: store baselineSyncedAt so existing books do NOT trigger notifications)
  const followAuthor = (authorId: string) => {
    requestPushPermission();
    setFollows((prev) => {
      if (prev.some((f) => f.type === 'AUTHOR' && f.targetId === authorId)) return prev;
      const nextFollow: Follow = {
        type: 'AUTHOR',
        targetId: authorId,
        followedAt: clock.now().toISOString(),
        archived: false,
        baselineSyncedAt: clock.now().toISOString(), // Baseline recorded!
        notifyNewBooks: true,
      };
      return [...prev, nextFollow];
    });
  };

  const unfollowAuthor = (authorId: string) => {
    const existing = follows.find((f) => f.type === 'AUTHOR' && f.targetId === authorId);
    setFollows((prev) => prev.filter((f) => !(f.type === 'AUTHOR' && f.targetId === authorId)));
    if (existing) {
      showUndoSnackbar(`Unfollowed ${getAuthorById(authorId)?.name || 'author'}`, () => {
        setFollows((prev) => [...prev, existing]);
      });
    }
  };

  const toggleAuthorNotify = (authorId: string) => {
    setFollows((prev) =>
      prev.map((f) =>
        f.type === 'AUTHOR' && f.targetId === authorId ? { ...f, notifyNewBooks: !f.notifyNewBooks } : f
      )
    );
  };

  // Follow Series (Strict Baseline Rule: store baselineSyncedAt)
  const followSeries = (seriesId: string) => {
    requestPushPermission();
    setFollows((prev) => {
      if (prev.some((f) => f.type === 'SERIES' && f.targetId === seriesId)) return prev;
      const nextFollow: Follow = {
        type: 'SERIES',
        targetId: seriesId,
        followedAt: clock.now().toISOString(),
        archived: false,
        baselineSyncedAt: clock.now().toISOString(),
        notifyNewBooks: true,
      };
      return [...prev, nextFollow];
    });
  };

  const unfollowSeries = (seriesId: string) => {
    const existing = follows.find((f) => f.type === 'SERIES' && f.targetId === seriesId);
    setFollows((prev) => prev.filter((f) => !(f.type === 'SERIES' && f.targetId === seriesId)));
    if (existing) {
      showUndoSnackbar(`Unfollowed ${getSeriesById(seriesId)?.name || 'series'}`, () => {
        setFollows((prev) => [...prev, existing]);
      });
    }
  };

  const toggleSeriesNotify = (seriesId: string) => {
    setFollows((prev) =>
      prev.map((f) =>
        f.type === 'SERIES' && f.targetId === seriesId ? { ...f, notifyNewBooks: !f.notifyNewBooks } : f
      )
    );
  };

  // Search History (Cap at 10)
  const addSearchQuery = useCallback((query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setSearchHistories((prev) => {
      const filtered = prev.filter((h) => h.query.toLowerCase() !== clean.toLowerCase());
      return [{ query: clean, searchedAt: clock.now().toISOString() }, ...filtered].slice(0, 10);
    });
  }, [clock]);

  const removeSearchQuery = useCallback((query: string) => {
    setSearchHistories((prev) => prev.filter((h) => h.query !== query));
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistories([]);
  }, []);

  // Background Sync Simulation
  const syncNow = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 600));

    // Update lastSyncedAt
    const nowIso = clock.now().toISOString();
    setSettings((prev) => ({ ...prev, lastSyncedAt: nowIso }));

    // Deliver reminders for today if enabled
    const upcomingItems = getComputedBooks('UPCOMING', 'release_date');
    for (const item of upcomingItems) {
      if (item.book.releaseDate === clock.todayString()) {
        const notifId = `now_avail_${item.book.id}`;
        if (!notifications.some((n) => n.id === notifId)) {
          const plainCopy = `${item.book.title} is now available.`;
          sendNativePushNotification(plainCopy);
          setNotifications((prev) => [
            ...prev,
            {
              id: notifId,
              bookId: item.book.id,
              type: 'now_available',
              scheduledFor: nowIso,
              deliveredAt: nowIso,
            },
          ]);
        }
      }
    }

    setIsSyncing(false);
  };

  // Demo Trigger: Simulate later sync introducing a new announcement
  const triggerDemoNewAnnouncement = async () => {
    if (hasTriggeredDemoAnnouncement) return;
    setHasTriggeredDemoAnnouncement(true);

    const newBook = LATER_SYNC_NEW_ANNOUNCEMENT_BOOK;
    const author = authors.find((a) => a.id === newBook.authorIds[0]);

    // Add new book to catalog
    setBooks((prev) => (prev.some((b) => b.id === newBook.id) ? prev : [newBook, ...prev]));
    setBookAuthors((prev) => [
      ...prev,
      { bookId: newBook.id, authorId: newBook.authorIds[0], position: 0 },
    ]);

    // Check if author or series was followed prior to this announcement
    const authorFollow = follows.find((f) => f.type === 'AUTHOR' && f.targetId === newBook.authorIds[0]);
    const seriesFollow = newBook.seriesId
      ? follows.find((f) => f.type === 'SERIES' && f.targetId === newBook.seriesId)
      : null;

    if (authorFollow?.notifyNewBooks || seriesFollow?.notifyNewBooks) {
      const copy = `New audiobook announced: ${newBook.title} by ${author?.name || 'Author'}.`;
      sendNativePushNotification(copy);
      setNotifications((prev) => [
        ...prev,
        {
          id: `new_announce_${newBook.id}`,
          bookId: newBook.id,
          type: 'new_book',
          scheduledFor: clock.now().toISOString(),
          deliveredAt: clock.now().toISOString(),
        },
      ]);
    }
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const ingestAudibleItem = useCallback((book: Book, authorsList: Author[], seriesItem?: Series) => {
    // 1. Ingest Authors if not known
    if (authorsList.length > 0) {
      setAuthors((prev) => {
        const existingIds = new Set(prev.map((a) => a.id));
        const existingNames = new Set(prev.map((a) => a.name.toLowerCase()));
        const toAdd = authorsList.filter(
          (a) => !existingIds.has(a.id) && !existingNames.has(a.name.toLowerCase())
        );
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
      });
    }

    // 2. Ingest Series if not known
    if (seriesItem) {
      setSeries((prev) => {
        const exists = prev.some(
          (s) => s.id === seriesItem.id || s.name.toLowerCase() === seriesItem.name.toLowerCase()
        );
        return exists ? prev : [...prev, seriesItem];
      });
    }

    // 3. Ingest Book
    setBooks((prev) => {
      const idx = prev.findIndex((b) => b.id === book.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...book };
        return updated;
      }
      return [book, ...prev];
    });

    // 4. Ingest BookAuthor links
    if (authorsList.length > 0) {
      setBookAuthors((prev) => {
        const filtered = prev.filter((ba) => ba.bookId !== book.id);
        const newLinks = authorsList.map((a, i) => ({
          bookId: book.id,
          authorId: a.id,
          position: i,
        }));
        return [...filtered, ...newLinks];
      });
    }
  }, []);

  const clearCache = () => {
    localStorage.removeItem('audible_spec_books_v1');
    localStorage.removeItem('audible_spec_authors_v1');
    localStorage.removeItem('audible_spec_series_v1');
    localStorage.removeItem('audible_spec_follows_v1');
    localStorage.removeItem('audible_spec_dismissed_v1');
    setFollows(INITIAL_FOLLOWS_SPEC);
    setDismissed([]);
    setAuthors(INITIAL_AUTHORS_SPEC);
    setSeries(INITIAL_SERIES_SPEC);
    setBooks(INITIAL_BOOKS_SPEC.map(({ authorIds, ...rest }) => rest));
  };

  return (
    <SpecTrackerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedBookId,
        setSelectedBookId,
        selectedAuthorId,
        setSelectedAuthorId,
        selectedSeriesId,
        setSelectedSeriesId,

        books,
        authors,
        series,
        bookAuthors,
        follows,
        dismissed,
        releaseHistories,
        searchHistories,
        notifications,
        settings,

        clock,
        getComputedBooks,

        getBookById,
        getAuthorById,
        getSeriesById,
        getAuthorsForBook,
        getBooksForAuthor,
        getBooksForSeries,
        getReleaseHistoryForBook,

        isBookFollowed,
        isAuthorFollowed,
        isSeriesFollowed,
        getBookFollow,
        getAuthorFollow,
        getSeriesFollow,

        followBook,
        unfollowBook,
        archiveBook,
        unarchiveBook,
        dismissBook,
        undismissBook,
        updateBookReminders,

        followAuthor,
        unfollowAuthor,
        toggleAuthorNotify,

        followSeries,
        unfollowSeries,
        toggleSeriesNotify,

        addSearchQuery,
        removeSearchQuery,
        clearSearchHistory,

        syncNow,
        isSyncing,
        triggerDemoNewAnnouncement,
        hasTriggeredDemoAnnouncement,

        updateSettings,
        clearCache,
        ingestAudibleItem,

        snackbar,
        dismissSnackbar,
      }}
    >
      {children}
    </SpecTrackerContext.Provider>
  );
};

export const useSpecTracker = () => {
  const context = useContext(SpecTrackerContext);
  if (!context) {
    throw new Error('useSpecTracker must be used within SpecTrackerProvider');
  }
  return context;
};
