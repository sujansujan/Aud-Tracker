import { Audiobook, WatchlistItem, MuteItem, PushNotificationSettings } from '../types/audiobook';
import { AppPreferences } from '../context/TrackerContext';

export interface TrackerBackup {
  version: string;
  exportedAt: string;
  appName: string;
  books: Audiobook[];
  watchlists?: WatchlistItem[];
  muteList?: MuteItem[];
  preferences?: AppPreferences;
  pushSettings?: PushNotificationSettings;
}

/**
 * Downloads a string as a file to the user's device
 */
export function triggerFileDownload(content: string, fileName: string, contentType: string = 'application/json') {
  const blob = new Blob([content], { type: `${contentType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a JSON backup string of the application state
 */
export function createBackupJson(
  books: Audiobook[],
  watchlists: WatchlistItem[],
  muteList: MuteItem[],
  preferences?: AppPreferences,
  pushSettings?: PushNotificationSettings
): string {
  const backup: TrackerBackup = {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    appName: 'Audible Auto-Tracker & Watchlist Monitor',
    books,
    watchlists,
    muteList,
    preferences,
    pushSettings,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Exports books to CSV format for spreadsheets
 */
export function exportToCsv(books: Audiobook[]) {
  const headers = [
    'Title',
    'Series',
    'Book Number',
    'Author',
    'Narrators',
    'Release Date',
    'Genre',
    'Audible Rating',
    'Rating Count',
    'Downloaded',
    'Listened',
    'Audible ASIN/URL',
  ];

  const escapeField = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = books.map((b) => [
    escapeField(b.title),
    escapeField(b.seriesName || b.series?.name || ''),
    escapeField(b.series?.bookNumber || ''),
    escapeField(b.author),
    escapeField(b.narrator || b.narrators?.join(', ') || ''),
    escapeField(b.releaseDate),
    escapeField(b.genre),
    escapeField(b.audibleRating),
    escapeField(b.ratingCount),
    escapeField(b.downloaded || 'No'),
    escapeField(b.listened || (b.isRead ? 'Yes' : 'No')),
    escapeField(b.url || b.audibleUrl || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  triggerFileDownload(csvContent, `audible_books_${dateStr}.csv`, 'text/csv');
}

/**
 * Validates and inspects an imported JSON string
 */
export function validateImportJson(raw: string): {
  valid: boolean;
  data?: TrackerBackup;
  summary?: {
    booksCount: number;
    watchlistsCount: number;
    muteRulesCount: number;
  };
  error?: string;
} {
  try {
    const parsed = JSON.parse(raw);

    // Support both direct array of books and full TrackerBackup object
    let books: Audiobook[] = [];
    let watchlists: WatchlistItem[] = [];
    let muteList: MuteItem[] = [];

    if (Array.isArray(parsed)) {
      books = parsed;
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray(parsed.books)) {
        books = parsed.books;
      }
      if (Array.isArray(parsed.watchlists)) {
        watchlists = parsed.watchlists;
      }
      if (Array.isArray(parsed.muteList)) {
        muteList = parsed.muteList;
      }
    } else {
      return { valid: false, error: 'Unrecognized file format. Expected a JSON object or array.' };
    }

    // Basic book shape check
    const validBooks = books.filter(
      (b) => b && typeof b === 'object' && typeof b.title === 'string' && typeof b.author === 'string'
    );

    if (validBooks.length === 0 && watchlists.length === 0 && muteList.length === 0) {
      return { valid: false, error: 'No valid audiobook records, watchlists, or mute rules were found in this file.' };
    }

    return {
      valid: true,
      data: {
        version: parsed.version || '1.0',
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        appName: parsed.appName || 'Audible Auto-Tracker',
        books: validBooks,
        watchlists,
        muteList,
        preferences: parsed.preferences,
        pushSettings: parsed.pushSettings,
      },
      summary: {
        booksCount: validBooks.length,
        watchlistsCount: watchlists.length,
        muteRulesCount: muteList.length,
      },
    };
  } catch (err: any) {
    return { valid: false, error: `Invalid JSON syntax: ${err.message}` };
  }
}
