export type Marketplace = 'US' | 'UK' | 'CA' | 'AU' | 'DE' | 'FR' | 'JP' | 'IN';

export type DateConfidence = 'CONFIRMED' | 'MONTH_ONLY' | 'TBA';

export type ReleaseStatus = 'UPCOMING' | 'RELEASED';

export type FollowType = 'BOOK' | 'AUTHOR' | 'SERIES';

export interface Book {
  id: string; // ASIN
  title: string;
  subtitle?: string;
  authorIds?: string[];
  seriesId?: string;
  seriesPosition?: string; // e.g. "1", "1.5", "5"
  coverUrl?: string;
  description?: string;
  durationMinutes?: number;
  narrators: string[]; // Display names only
  marketplace: Marketplace;
  storeUrl: string;
  releaseDate: string | null; // ISO YYYY-MM-DD, or null if TBA
  dateConfidence: DateConfidence;
  status: ReleaseStatus;
  firstSeenAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface Author {
  id: string;
  name: string;
  imageUrl?: string;
  bio?: string;
}

export interface Series {
  id: string;
  name: string;
  primaryAuthorName?: string;
  imageUrl?: string;
}

export interface BookAuthor {
  bookId: string;
  authorId: string;
  position: number; // 0 for primary author
}

export interface Follow {
  type: FollowType;
  targetId: string;
  followedAt: string;
  reminderOffsets?: number[] | null; // e.g. [0, 1, 3, 7]
  archived: boolean;
  baselineSyncedAt: string;
  notifyNewBooks?: boolean; // For author/series follows
}

export interface DismissedBook {
  bookId: string;
  dismissedAt: string;
}

export interface ReleaseHistory {
  id: string;
  bookId: string;
  oldDate?: string | null;
  newDate?: string | null;
  oldConfidence?: DateConfidence;
  newConfidence?: DateConfidence;
  changedAt: string;
}

export interface SearchHistory {
  query: string;
  searchedAt: string;
}

export interface NotificationLog {
  id: string;
  bookId: string;
  type: 'reminder' | 'date_changed' | 'new_book' | 'now_available';
  scheduledFor: string;
  deliveredAt?: string | null;
}

export interface UserSettings {
  notificationsMaster: boolean;
  notifyReleaseDay: boolean;
  notifyOneDay: boolean;
  notifyThreeDays: boolean;
  notifyOneWeek: boolean;
  notifyDateChanged: boolean;
  notifyNowAvailable: boolean;
  notifyNewAuthorBook: boolean;
  notifyNewSeriesInstallment: boolean;
  deliveryTime: string; // "09:00"
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "07:00"
  marketplace: Marketplace;
  theme: 'system' | 'light' | 'dark';
  lastSyncedAt: string | null;
}

export type MainNavTab = 'upcoming' | 'search' | 'following' | 'settings';
