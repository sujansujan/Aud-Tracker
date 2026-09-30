export type Genre =
  | 'Sci-Fi'
  | 'Fantasy'
  | 'LitRPG'
  | 'Thriller'
  | 'Mystery'
  | 'Non-Fiction'
  | 'Horror'
  | 'Romance'
  | 'Historical'
  | 'Biography'
  | 'Self-Help'
  | 'Business'
  | 'Fiction';

export interface ReleaseHistoryItem {
  oldDate: string;
  newDate: string;
  changedAt: string; // ISO date
  reason?: string;
}

export interface AudiobookReminders {
  onReleaseDay?: boolean;
  dayOfRelease?: boolean;
  oneDayBefore: boolean;
  threeDaysBefore?: boolean;
  oneWeekBefore: boolean;
}

export interface Audiobook {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  authorId?: string;
  authorUrl?: string;
  narrators: string[];
  narrator?: string;
  series?: {
    name: string;
    bookNumber?: number | string;
  };
  seriesName?: string;
  seriesUrl?: string;
  releaseDate: string; // YYYY-MM-DD
  originalReleaseDate?: string;
  releaseHistory?: ReleaseHistoryItem[];
  coverUrl: string;
  runtimeHours?: number;
  durationString?: string;
  genre: Genre;
  audibleRating: number;
  ratingCount: number;
  synopsis: string;
  publisher?: string;
  language?: string;
  format?: 'Unabridged' | 'Abridged';
  audibleUrl?: string;
  url?: string;
  marketplace?: string; // 'US' | 'UK' | 'CA' | 'AU' | 'DE' | 'FR' | 'JP'
  isFollowed?: boolean;
  isRead: boolean;
  downloaded?: 'Yes' | 'No';
  listened?: 'Yes' | 'No';
  readCompletedAt?: string;
  listeningDurationHours?: number;
  userPersonalRating?: number;
  userNotes?: string;
  reminders: AudiobookReminders;
  isCustom?: boolean;
}

export interface Author {
  id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
  isFollowed: boolean;
}

export interface Narrator {
  id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
  isFollowed: boolean;
}

export interface Series {
  id: string;
  name: string;
  author: string;
  isFollowed: boolean;
  bookCount: number;
}

export interface LocalSyncConfig {
  folderName: string;
  lastSyncedAt: string | null;
  autoSyncEnabled: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  errorMessage?: string;
}

export interface WatchlistItem {
  id: string;
  type: 'Author' | 'Series' | 'Narrator';
  name: string;
  url: string;
}

export interface MuteItem {
  id: string;
  type: 'Series' | 'Keyword' | 'Author';
  value: string;
}

export type TrackedEntityType = 'author' | 'narrator' | 'series' | 'book';

export interface TrackedEntity {
  id: string;
  type: TrackedEntityType;
  name: string;
  notes?: string;
  color?: string;
  addedAt: string;
}

export interface NotificationLogItem {
  id: string;
  bookId: string;
  bookTitle: string;
  type: '1_week_before' | '3_days_before' | '1_day_before' | 'day_of_release' | 'date_changed' | 'new_series' | 'new_author' | 'new_narrator' | 'announcement';
  title: string;
  message: string;
  triggerDate: string; // YYYY-MM-DD
  timestamp: string; // ISO
  read: boolean;
  oldDate?: string;
  newDate?: string;
}

export interface PushNotificationSettings {
  pushEnabled: boolean;
  notifyDayOf: boolean;
  notifyOneDay: boolean;
  notifyThreeDays: boolean;
  notifyOneWeek: boolean;
  notifyDateChanged: boolean;
  notifyNewSeries: boolean;
  notifyNewAuthor: boolean;
  notifyNewNarrator: boolean;
  soundEnabled: boolean;
}

export type AppTab = 'home' | 'discover' | 'calendar' | 'watchlist' | 'settings';
