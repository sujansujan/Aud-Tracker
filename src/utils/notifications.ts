import { Audiobook, NotificationLogItem } from '../types/audiobook';

// Local reference date matching current runtime
export const CURRENT_DATE_STR = '2026-09-27';

/**
 * Play a gentle Audible notification chime via Web Audio API
 */
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Pleasant dual chime (F#5 to A5)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(739.99, now); // F#5
    osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

    osc2.frequency.setValueAtTime(369.99, now); // F#4
    osc2.frequency.exponentialRampToValueAtTime(440.00, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn('Audio chime unavailable', err);
  }
}

/**
 * Request real Web Notification API permission
 */
export async function requestPushPermission(): Promise<'granted' | 'denied' | 'default'> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return 'denied';
  }
}

/**
 * Send native push notification if permission is granted
 */
export function sendNativePushNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        ...options,
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}

/**
 * Calculate difference in days between two YYYY-MM-DD dates
 */
export function getDaysUntil(targetDateStr: string, fromDateStr = CURRENT_DATE_STR): number {
  const target = new Date(targetDateStr + 'T00:00:00');
  const from = new Date(fromDateStr + 'T00:00:00');
  const diffMs = target.getTime() - from.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format date string into user-friendly format (e.g., Oct 14, 2026)
 */
export function formatReleaseDateFriendly(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {}
  return dateStr;
}

/**
 * Format relative countdown label & badge details
 */
export function getReleaseCountdown(releaseDateStr: string): {
  label: string;
  urgency: 'today' | 'tomorrow' | 'week' | 'soon' | 'future' | 'released';
  isToday: boolean;
  daysUntil: number;
  badgeText: string;
} {
  const days = getDaysUntil(releaseDateStr);
  const isToday = days === 0;

  if (days < 0) {
    return {
      label: `Released ${Math.abs(days)}d ago`,
      urgency: 'released',
      isToday: false,
      daysUntil: days,
      badgeText: 'Released',
    };
  }
  if (days === 0) {
    return {
      label: 'Out Today!',
      urgency: 'today',
      isToday: true,
      daysUntil: 0,
      badgeText: 'Releasing Today',
    };
  }
  if (days === 1) {
    return {
      label: 'Releases Tomorrow',
      urgency: 'tomorrow',
      isToday: false,
      daysUntil: 1,
      badgeText: 'Tomorrow',
    };
  }
  if (days <= 7) {
    return {
      label: `In ${days} days (1 wk)`,
      urgency: 'week',
      isToday: false,
      daysUntil: days,
      badgeText: `In ${days} Days`,
    };
  }
  if (days <= 30) {
    return {
      label: `In ${days} days`,
      urgency: 'soon',
      isToday: false,
      daysUntil: days,
      badgeText: `In ${days} Days`,
    };
  }
  const weeks = Math.round(days / 7);
  return {
    label: `In ${weeks} weeks`,
    urgency: 'future',
    isToday: false,
    daysUntil: days,
    badgeText: `In ${weeks} Wks`,
  };
}

/**
 * Generate scheduled reminder trigger dates for an audiobook
 */
export function getScheduledAlertDates(releaseDateStr: string) {
  const release = new Date(releaseDateStr + 'T00:00:00');

  const oneWeek = new Date(release);
  oneWeek.setDate(release.getDate() - 7);

  const oneDay = new Date(release);
  oneDay.setDate(release.getDate() - 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  return {
    oneWeekBefore: formatDate(oneWeek),
    oneDayBefore: formatDate(oneDay),
    dayOfRelease: releaseDateStr,
  };
}

/**
 * Check which reminders are triggered today (2026-09-27)
 */
export function evaluateTriggeredReminders(books: Audiobook[]): NotificationLogItem[] {
  const triggered: NotificationLogItem[] = [];

  for (const book of books) {
    if (book.isRead) continue;

    const days = getDaysUntil(book.releaseDate);
    const narratorStr = book.narrators.join(', ');

    // 1 Week Before reminder (days === 7)
    if (days === 7 && book.reminders.oneWeekBefore) {
      triggered.push({
        id: `notif-1w-${book.id}-${CURRENT_DATE_STR}`,
        bookId: book.id,
        bookTitle: book.title,
        type: '1_week_before',
        title: `1 Week Until Release: "${book.title}"`,
        message: `Coming in 7 days! Narrated by ${narratorStr}. Check your Audible pre-order or credits.`,
        triggerDate: CURRENT_DATE_STR,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    // 1 Day Before reminder (days === 1)
    if (days === 1 && book.reminders.oneDayBefore) {
      triggered.push({
        id: `notif-1d-${book.id}-${CURRENT_DATE_STR}`,
        bookId: book.id,
        bookTitle: book.title,
        type: '1_day_before',
        title: `Tomorrow: "${book.title}" Drops on Audible!`,
        message: `Get your headphones ready. "${book.title}" by ${book.author} releases tomorrow.`,
        triggerDate: CURRENT_DATE_STR,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    // Day of Release reminder (days === 0)
    if (days === 0 && book.reminders.dayOfRelease) {
      triggered.push({
        id: `notif-0d-${book.id}-${CURRENT_DATE_STR}`,
        bookId: book.id,
        bookTitle: book.title,
        type: 'day_of_release',
        title: `Release Day: "${book.title}" is Available Now!`,
        message: `Now live on Audible! Listen to ${narratorStr} bring ${book.author}'s story to life.`,
        triggerDate: CURRENT_DATE_STR,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }

  return triggered;
}
