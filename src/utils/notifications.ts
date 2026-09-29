import { Audiobook, NotificationLogItem } from '../types/audiobook';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Local reference date matching current runtime
export const CURRENT_DATE_STR = '2026-09-27';

/**
 * Initialize native Android notification channel
 */
export async function initNativeAndroidChannel() {
  if (Capacitor.isNativePlatform() || typeof (LocalNotifications as any).createChannel === 'function') {
    try {
      await LocalNotifications.createChannel({
        id: 'audible_release_alerts',
        name: 'Audible Release Alerts',
        description: 'Native notifications for upcoming audiobook releases and milestones',
        importance: 5, // High importance (Heads-up alert banner on Android)
        visibility: 1, // Public on lockscreen
        vibration: true,
        lights: true,
        lightColor: '#bd93f9', // Dracula purple LED light
      });
    } catch (e) {
      console.warn('Android channel init warning:', e);
    }
  }
}

/**
 * Request real Native Android (or Web fallback) Notification API permission
 */
export async function requestPushPermission(): Promise<'granted' | 'denied' | 'default'> {
  // 1. Native Android environment via Capacitor LocalNotifications
  if (Capacitor.isNativePlatform() || typeof (LocalNotifications as any).requestPermissions === 'function') {
    try {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        await initNativeAndroidChannel();
        return 'granted';
      }
      return result.display === 'denied' ? 'denied' : 'default';
    } catch (err) {
      console.warn('Capacitor native notification request failed, trying fallback:', err);
    }
  }

  // 2. Web browser fallback
  if ('Notification' in window) {
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch {
      return 'denied';
    }
  }

  return 'denied';
}

/**
 * Check current notification permission status
 */
export async function checkNotificationPermissionStatus(): Promise<boolean> {
  if (Capacitor.isNativePlatform() || typeof (LocalNotifications as any).checkPermissions === 'function') {
    try {
      const res = await LocalNotifications.checkPermissions();
      return res.display === 'granted';
    } catch {}
  }
  if ('Notification' in window) {
    return Notification.permission === 'granted';
  }
  return false;
}

/**
 * Send native Android notification via Capacitor or Web Notification API
 */
export async function sendNativePushNotification(
  title: string,
  options?: { body?: string; id?: number }
) {
  const notifId = options?.id || Math.floor(Math.random() * 899999 + 100000);
  const bodyText = options?.body || 'Audible release notification';

  // 1. Native Android Notification
  if (Capacitor.isNativePlatform() || typeof (LocalNotifications as any).schedule === 'function') {
    try {
      await initNativeAndroidChannel();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: notifId,
            title,
            body: bodyText,
            channelId: 'audible_release_alerts',
            smallIcon: 'ic_launcher',
            schedule: { at: new Date(Date.now() + 250) },
          },
        ],
      });
      return;
    } catch (err) {
      console.warn('Native notification schedule error:', err);
    }
  }

  // 2. Web browser fallback
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: bodyText,
        icon: '/icon.svg',
      });
    } catch (e) {
      console.warn('Web notification failed:', e);
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
