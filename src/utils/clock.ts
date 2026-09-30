import { DateConfidence } from '../types/specModels';

export interface Clock {
  now(): Date;
  todayString(): string; // YYYY-MM-DD
}

export class SystemClock implements Clock {
  // Configured default local reference date: 2026-09-27
  constructor(private readonly fixedDate?: Date) {}

  now(): Date {
    return this.fixedDate || new Date('2026-09-27T09:00:00Z');
  }

  todayString(): string {
    const d = this.now();
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export const defaultClock = new SystemClock();

/**
 * Calculates day difference between target date string and clock today.
 */
export function getDaysBetween(dateString: string, clock: Clock = defaultClock): number {
  const [tYear, tMonth, tDay] = dateString.split('-').map(Number);
  const targetUtc = Date.UTC(tYear, tMonth - 1, tDay);

  const [cYear, cMonth, cDay] = clock.todayString().split('-').map(Number);
  const clockUtc = Date.UTC(cYear, cMonth - 1, cDay);

  const diffMs = targetUtc - clockUtc;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export interface CountdownInfo {
  text: string;
  isPast: boolean;
  days: number;
}

export function formatCountdown(
  dateString: string | null,
  confidence: DateConfidence,
  clock: Clock = defaultClock
): CountdownInfo {
  if (!dateString || confidence === 'TBA') {
    return { text: 'Date to be announced', isPast: false, days: 9999 };
  }

  if (confidence === 'MONTH_ONLY') {
    const [year, month] = dateString.split('-').map(Number);
    const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
      month: 'long',
      timeZone: 'UTC',
    });
    return { text: `Expected in ${monthName}`, isPast: false, days: 999 };
  }

  const days = getDaysBetween(dateString, clock);

  if (days < 0) {
    const absDays = Math.abs(days);
    return { text: `Released ${absDays} ${absDays === 1 ? 'day' : 'days'} ago`, isPast: true, days };
  }

  if (days === 0) {
    return { text: 'Releases today', isPast: false, days: 0 };
  }

  if (days === 1) {
    return { text: 'Releases tomorrow', isPast: false, days: 1 };
  }

  if (days >= 14) {
    const weeks = Math.floor(days / 7);
    return { text: `In ${weeks} weeks`, isPast: false, days };
  }

  return { text: `In ${days} days`, isPast: false, days };
}

/**
 * Checks if a release history change occurred within the last 14 days.
 */
export function isRecentDateChange(changedAt: string, clock: Clock = defaultClock): boolean {
  const changeDate = new Date(changedAt).getTime();
  const now = clock.now().getTime();
  const diffDays = (now - changeDate) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 14;
}
