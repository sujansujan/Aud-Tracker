export type Genre =
  | 'Sci-Fi'
  | 'Fantasy'
  | 'LitRPG'
  | 'Thriller'
  | 'Mystery'
  | 'Non-Fiction'
  | 'Horror'
  | 'Romance'
  | 'Historical';

export interface AudiobookReminders {
  oneWeekBefore: boolean; // 7 days prior
  oneDayBefore: boolean;  // 24 hours prior
  dayOfRelease: boolean;  // Day of release
}

export interface Audiobook {
  id: string;
  title: string;
  series?: {
    name: string;
    bookNumber?: number | string;
  };
  seriesName?: string;
  seriesUrl?: string;
  author: string;
  authorUrl?: string;
  narrators: string[];
  narrator?: string;
  releaseDate: string; // YYYY-MM-DD
  coverUrl: string;
  runtimeHours?: number;
  genre: Genre;
  audibleRating: number; // e.g. 4.8
  ratingCount: number;   // e.g. 12500
  synopsis: string;
  audibleUrl?: string;
  url?: string;
  isRead: boolean;
  downloaded?: 'Yes' | 'No';
  listened?: 'Yes' | 'No';
  readCompletedAt?: string; // ISO string e.g. 2026-09-25T14:30:00
  listeningDurationHours?: number;
  userPersonalRating?: number; // 1-5
  userNotes?: string;
  reminders: AudiobookReminders;
  isCustom?: boolean;
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
  type: '1_week_before' | '1_day_before' | 'day_of_release' | 'announcement';
  title: string;
  message: string;
  triggerDate: string; // YYYY-MM-DD
  timestamp: string; // ISO
  read: boolean;
}

export interface PushNotificationSettings {
  pushEnabled: boolean;
  notifyOneWeek: boolean;
  notifyOneDay: boolean;
  notifyDayOf: boolean;
  soundEnabled: boolean;
}
