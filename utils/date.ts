import { FlashSaleSlot } from '@/types/home';

// ============================================
// SAFE DATE PARSING - Cross-Platform Compatible
// ============================================

/**
 * Safe Date Parse - Cross-platform compatible
 * Problem: new Date("2025-11-26 05:37:55") crashes on iOS Safari/JSC
 * Solution: Normalize to ISO 8601 format before parsing
 * 
 * Handles:
 * - "2025-11-26T05:37:55.123456"    → OK
 * - "2025-11-26T05:37:55"           → OK  
 * - "2025-11-26 05:37:55"           → Normalize to T
 * - "2025-11-26"                    → OK
 * - null/undefined                  → returns null
 */
export const safeParseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    try {
        let normalized = dateString.replace(' ', 'T');
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
export const formatMonthYear = (dateString: string | null | undefined): string => {
    const date = safeParseDate(dateString);
    if (!date) return '';

    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
};

// ============================================
// FLASH SALE UTILITIES
// ============================================
export const getNextFlashSaleSlot = (): FlashSaleSlot => {
    const now = new Date();
    const hours = now.getHours();

    // Find next slot divisible by 3
    const slotStartHour = Math.floor(hours / 3) * 3;
    const slotEndHour = slotStartHour + 3;

    const startTime = new Date(now);
    startTime.setHours(slotStartHour, 0, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(slotEndHour, 0, 0, 0);

    // Format display label (e.g. "09:00")
    const label = `${slotStartHour.toString().padStart(2, '0')}:00`;

    return {
        id: `slot-${slotStartHour}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        label,
    };
};

/**
 * Format remaining time (ms) -> { hours, minutes, seconds }
 * Uses safeParseDate for cross-platform safety
 */
export const formatTimeLeft = (targetDate: string) => {
    const parsed = safeParseDate(targetDate);
    if (!parsed) return { total: 0, hours: 0, minutes: 0, seconds: 0 };

    const total = parsed.getTime() - Date.now();
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

    return {
        total,
        hours: Math.max(0, hours),
        minutes: Math.max(0, minutes),
        seconds: Math.max(0, seconds),
    };
};

/**
 * Format timestamp to readable string (e.g., "14:30", "Yesterday", "Mon")
 * Uses safeParseDate for cross-platform safety
 */
export const formatTime = (timestamp: string): string => {
    const date = safeParseDate(timestamp);
    if (!date) return '';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'Vừa xong' : `${diffMinutes} phút trước`;
    }

    if (diffHours < 24) {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `Hôm qua, ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
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

    // Handle both Date objects and strings
    const t1 = date1 instanceof Date
        ? date1.getTime()
        : safeParseDate(date1)?.getTime();
    const t2 = date2 instanceof Date
        ? date2.getTime()
        : safeParseDate(date2)?.getTime();

    if (!t1 || !t2) return false;

    const diff = Math.abs(t2 - t1);
    return diff < thresholdMinutes * 60 * 1000;
};

/**
 * Format time for display (HH:mm)
 * Uses safeParseDate for cross-platform safety
 */
export const formatMessageTime = (date: string | Date): string => {
    const d = date instanceof Date ? date : safeParseDate(date);
    if (!d) return '';

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Format date for display
 * Returns: "DD/MM/YYYY" or "DD/MM" based on format
 * Uses safeParseDate for cross-platform safety
 */
export const formatDate = (date: string | Date, format: string = 'DD/MM/YYYY'): string => {
    const d = date instanceof Date ? date : safeParseDate(date);
    if (!d) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (format === 'DD/MM') return `${day}/${month}`;
    return `${day}/${month}/${year}`;
};

/**
 * Format date for display in separators
 * Returns: "Hôm nay", "Hôm qua", "DD/MM" or "DD/MM/YYYY"
 * Uses safeParseDate for cross-platform safety
 */
export const formatDateLabel = (date: string | Date): string => {
    const d = date instanceof Date ? date : safeParseDate(date);
    if (!d) return '';

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'Hôm nay';
    if (isYesterday) return 'Hôm qua';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (year === today.getFullYear()) {
        return `${day}/${month}`;
    }

    return `${day}/${month}/${year}`;
};