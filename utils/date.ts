import i18n from '@/constants/i18n';
import { getCalendars, getLocales } from 'expo-localization';

type AppLanguage = 'vi' | 'en';
type DateDisplayFormat = 'DD/MM/YYYY' | 'DD/MM';

const FALLBACK_LOCALE_BY_LANGUAGE: Record<AppLanguage, string> = {
    vi: 'vi-VN',
    en: 'en-US',
};

const DATE_COPY = {
    vi: {
        today: 'Hôm nay',
        yesterday: 'Hôm qua',
        justNow: 'Vừa xong',
        minutesAgo: (count: number) => `${count} phút trước`,
        hoursAgo: (count: number) => `${count} giờ trước`,
        daysAgo: (count: number) => `${count} ngày trước`,
        weeksAgo: (count: number) => `${count} tuần trước`,
        monthsAgo: (count: number) => `${count} tháng trước`,
        expired: 'Đã hết hạn',
        expiresInMinutes: (count: number) => `Hết hạn sau ${count} phút`,
        expiresInHours: (hours: number, minutes: number) =>
            `Hết hạn sau ${hours} giờ${minutes > 0 ? ` ${minutes} phút` : ''}`,
        daysLeft: (count: number) => (count === 1 ? 'Còn 1 ngày' : `Còn ${count} ngày`),
        expiresInDays: (count: number) =>
            count === 1 ? 'Hết hạn sau 1 ngày' : `Hết hạn sau ${count} ngày`,
    },
    en: {
        today: 'Today',
        yesterday: 'Yesterday',
        justNow: 'Just now',
        minutesAgo: (count: number) => (count === 1 ? '1 minute ago' : `${count} minutes ago`),
        hoursAgo: (count: number) => (count === 1 ? '1 hour ago' : `${count} hours ago`),
        daysAgo: (count: number) => (count === 1 ? '1 day ago' : `${count} days ago`),
        weeksAgo: (count: number) => (count === 1 ? '1 week ago' : `${count} weeks ago`),
        monthsAgo: (count: number) => (count === 1 ? '1 month ago' : `${count} months ago`),
        expired: 'Expired',
        expiresInMinutes: (count: number) =>
            count === 1 ? 'Expires in 1 minute' : `Expires in ${count} minutes`,
        expiresInHours: (hours: number, minutes: number) =>
            minutes > 0 ? `Expires in ${hours}h ${minutes}m` : `Expires in ${hours}h`,
        daysLeft: (count: number) => (count === 1 ? '1 day left' : `${count} days left`),
        expiresInDays: (count: number) =>
            count === 1 ? 'Expires in 1 day' : `Expires in ${count} days`,
    },
} as const;

const getCurrentAppLanguage = (): AppLanguage => {
    const language = (i18n.resolvedLanguage || i18n.language || '').toLowerCase();
    return language.startsWith('vi') ? 'vi' : 'en';
};

const getDeviceCalendar = () => {
    try {
        return getCalendars()[0] ?? null;
    } catch {
        return null;
    }
};

export const getDeviceLocale = (): string => {
    try {
        return getLocales()[0]?.languageTag ?? 'en-US';
    } catch {
        return 'en-US';
    }
};

const getPreferredLocale = (): string => {
    const appLanguage = getCurrentAppLanguage();
    const deviceLocale = getDeviceLocale();
    return deviceLocale.toLowerCase().startsWith(appLanguage)
        ? deviceLocale
        : FALLBACK_LOCALE_BY_LANGUAGE[appLanguage];
};

export const getDeviceTimeZone = (): string => {
    const calendarTimeZone = getDeviceCalendar()?.timeZone;
    if (calendarTimeZone) return calendarTimeZone;

    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
};

const getUses24HourClock = (): boolean | undefined => {
    const uses24hourClock = getDeviceCalendar()?.uses24hourClock;
    return typeof uses24hourClock === 'boolean' ? uses24hourClock : undefined;
};

const resolveDate = (date: string | Date | null | undefined): Date | null => {
    if (!date) return null;
    if (date instanceof Date) {
        return isNaN(date.getTime()) ? null : date;
    }
    return safeParseDate(date);
};

const createFormatter = (options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat => {
    const locale = getPreferredLocale();
    const timeZone = getDeviceTimeZone();
    const uses24HourClock = getUses24HourClock();
    const resolvedOptions: Intl.DateTimeFormatOptions = {
        ...options,
        ...(uses24HourClock !== undefined && options.hour ? { hour12: !uses24HourClock } : {}),
    };

    try {
        return new Intl.DateTimeFormat(locale, {
            ...resolvedOptions,
            timeZone,
        });
    } catch {
        return new Intl.DateTimeFormat(locale, resolvedOptions);
    }
};

const getDateParts = (date: string | Date | null | undefined) => {
    const resolvedDate = resolveDate(date);
    if (!resolvedDate) return null;

    const formatter = createFormatter({
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const parts = formatter.formatToParts(resolvedDate);
    const pick = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((part) => part.type === type)?.value ?? '';

    return {
        date: resolvedDate,
        day: pick('day'),
        month: pick('month'),
        year: pick('year'),
        hour: pick('hour'),
        minute: pick('minute'),
    };
};

const getDateCopy = () => DATE_COPY[getCurrentAppLanguage()];

const isSameLocalDay = (first: Date, second: Date): boolean =>
    first.toDateString() === second.toDateString();

const addLocalDays = (date: Date, days: number): Date => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
};

/**
 * Safe Date Parse - Cross-platform compatible
 * Problem: new Date("2025-11-26 05:37:55") crashes on iOS Safari/JSC
 * Solution: Normalize to ISO 8601 format before parsing
 *
 * Handles:
 * - "2025-11-26T05:37:55.123456"    -> OK
 * - "2025-11-26T05:37:55"           -> OK
 * - "2025-11-26 05:37:55"           -> Normalize to T
 * - "2025-11-26"                    -> OK
 * - null/undefined                  -> returns null
 */
export const safeParseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
        const normalized = dateString.replace(' ', 'T');
        const timestamp = Date.parse(normalized);
        if (isNaN(timestamp)) return null;
        return new Date(timestamp);
    } catch {
        return null;
    }
};

/**
 * Format date to "MM/YYYY" (for join date, etc.)
 * Safe wrapper using safeParseDate
 *
 * @param dateString - Raw date string from API
 * @returns Formatted string "MM/YYYY" or empty string on failure
 */
export const formatMonthYear = (dateString: string | Date | null | undefined): string => {
    const parts = getDateParts(dateString);
    if (!parts) return '';
    return `${parts.month}/${parts.year}`;
};

/**
 * Format a date into a stable local calendar key (YYYY-MM-DD).
 * This is used for grouping and "today" checks that must follow the device timezone.
 */
export const formatLocalDateKey = (
    date: string | Date | null | undefined
): string => {
    const resolvedDate = resolveDate(date);
    if (!resolvedDate) return '';

    const year = resolvedDate.getFullYear();
    const month = String(resolvedDate.getMonth() + 1).padStart(2, '0');
    const day = String(resolvedDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// ============================================
// FLASH SALE UTILITIES
// ============================================

/**
 * Format date to relative string (e.g., "2 ngày trước", "1 week ago")
 * Uses safeParseDate for cross-platform safety
 */
export const formatRelativeDate = (dateString: string | null | undefined): string => {
    const date = safeParseDate(dateString);
    if (!date) return '';

    const copy = getDateCopy();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMinutes < 1) return copy.justNow;
    if (diffMinutes < 60) return copy.minutesAgo(diffMinutes);
    if (diffHours < 24) return copy.hoursAgo(diffHours);

    const yesterday = addLocalDays(now, -1);
    if (isSameLocalDay(date, yesterday)) return copy.yesterday;

    if (diffDays < 7) return copy.daysAgo(diffDays);
    if (diffWeeks < 4) return copy.weeksAgo(diffWeeks);
    if (diffMonths < 12) return copy.monthsAgo(diffMonths);

    return formatDate(date);
};

/**
 * Calculate a stable target timestamp synchronized with the Backend's relative seconds.
 * This bypasses user system clock skew/timezone issues.
 */
export const getSynchronizedTargetTimestamp = (
    absoluteTime: string | null | undefined,
    secondsUntil?: number
): number => {
    if (secondsUntil !== undefined && secondsUntil > 0) {
        return Date.now() + secondsUntil * 1000;
    }
    return safeParseDate(absoluteTime)?.getTime() || 0;
};

/**
 * Format remaining time based on a synchronized target timestamp.
 */
export const formatSynchronizedTimeLeft = (targetTimestamp: number) => {
    const total = targetTimestamp - Date.now();

    if (total <= 0) {
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
        total,
        days,
        hours,
        minutes,
        seconds,
    };
};

/**
 * Format remaining time (ms) -> { hours, minutes, seconds }
 * Uses safeParseDate for cross-platform safety
 */
export const formatTimeLeft = (targetDate: string) => {
    const parsed = safeParseDate(targetDate);
    if (!parsed) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

    const total = parsed.getTime() - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return {
        total,
        days: Math.max(0, days),
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds),
    };
};

/**
 * Format time for device locale/timezone while respecting device 12/24h preference.
 */
export const formatClockTime = (timestamp: string | Date | null | undefined): string => {
    const date = resolveDate(timestamp);
    if (!date) return '';

    return createFormatter({
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

/**
 * Format timestamp to readable string for list surfaces
 * (e.g., "14:30", "Yesterday, 14:30", "25/03 14:30")
 */
export const formatTime = (timestamp: string): string => {
    const date = safeParseDate(timestamp);
    if (!date) return '';

    const copy = getDateCopy();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
        return diffMinutes <= 1 ? copy.justNow : copy.minutesAgo(diffMinutes);
    }

    if (diffHours < 24) {
        return formatClockTime(date);
    }

    const yesterday = addLocalDays(now, -1);
    if (isSameLocalDay(date, yesterday)) {
        return `${copy.yesterday}, ${formatClockTime(date)}`;
    }

    return `${formatDate(date, 'DD/MM')} ${formatClockTime(date)}`.trim();
};

/**
 * Check if two dates are within a time threshold (default 5 mins)
 * Uses safeParseDate for cross-platform safety
 */
export const isWithinTimeThreshold = (
    date1: string | Date | undefined,
    date2: string | Date | undefined,
    thresholdMinutes: number = 5
): boolean => {
    if (!date1 || !date2) return false;

    const t1 = resolveDate(date1)?.getTime();
    const t2 = resolveDate(date2)?.getTime();

    if (!t1 || !t2) return false;

    const diff = Math.abs(t2 - t1);
    return diff < thresholdMinutes * 60 * 1000;
};

/**
 * Format time for compact display (chat bubbles, timestamps).
 */
export const formatMessageTime = (date: string | Date): string => {
    return formatClockTime(date);
};

/**
 * Format date for display
 * Returns: "DD/MM/YYYY" or "DD/MM" based on format
 * Uses device timezone to avoid day shifts.
 */
export const formatDate = (
    date: string | Date,
    format: DateDisplayFormat = 'DD/MM/YYYY'
): string => {
    const parts = getDateParts(date);
    if (!parts) return '';

    if (format === 'DD/MM') return `${parts.day}/${parts.month}`;
    return `${parts.day}/${parts.month}/${parts.year}`;
};

/**
 * Format date + time using device locale/timezone and 12/24h preference.
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
    const resolvedDate = resolveDate(date);
    if (!resolvedDate) return '';

    return createFormatter({
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(resolvedDate);
};

/**
 * Format date for display in separators
 * Returns: "Today", "Yesterday", "DD/MM" or "DD/MM/YYYY"
 */
export const formatDateLabel = (date: string | Date): string => {
    const resolvedDate = resolveDate(date);
    if (!resolvedDate) return '';

    const copy = getDateCopy();
    const today = new Date();
    const yesterday = addLocalDays(today, -1);

    if (isSameLocalDay(resolvedDate, today)) return copy.today;
    if (isSameLocalDay(resolvedDate, yesterday)) return copy.yesterday;

    if (resolvedDate.getFullYear() === today.getFullYear()) {
        return formatDate(resolvedDate, 'DD/MM');
    }

    return formatDate(resolvedDate);
};

/**
 * Format expiry countdown text for vouchers and similar surfaces.
 */
export const formatExpiryCountdown = (
    endDate: string | Date | null | undefined,
    prefix?: string
): string => {
    const expiry = resolveDate(endDate);
    if (!expiry) return '';

    const copy = getDateCopy();
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffMs < 0) {
        return copy.expired;
    }

    if (diffMinutes < 60) {
        return copy.expiresInMinutes(Math.max(1, diffMinutes));
    }

    if (diffHours < 24) {
        const hours = Math.floor(diffHours);
        const minutes = Math.floor((diffHours - hours) * 60);
        return copy.expiresInHours(hours, minutes);
    }

    if (diffDays < 7) {
        return copy.daysLeft(Math.max(1, Math.floor(diffDays)));
    }

    return prefix ? `${prefix}: ${formatDate(expiry)}` : formatDate(expiry);
};

/**
 * Format a fixed day-based expiry message from a precomputed day count.
 */
export const formatExpiryInDays = (daysUntilExpiry: number): string => {
    const copy = getDateCopy();
    if (daysUntilExpiry <= 0) return copy.expired;
    return copy.expiresInDays(daysUntilExpiry);
};
