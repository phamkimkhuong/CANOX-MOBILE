import { FlashSaleSlot } from '@/types/home';

/**
 * Calculate next Flash Sale slot (Simulate 3-hour block)
 * Example: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
 */
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
 */
export const formatTimeLeft = (targetDate: string) => {
    const total = Date.parse(targetDate) - Date.now();
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
 */
export const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
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
 */
export const isWithinTimeThreshold = (
    date1: string | Date | undefined,
    date2: string | Date | undefined,
    thresholdMinutes: number = 5
): boolean => {
    if (!date1 || !date2) return false;

    const t1 = new Date(date1).getTime();
    const t2 = new Date(date2).getTime();
    const diff = Math.abs(t2 - t1);

    return diff < thresholdMinutes * 60 * 1000;
};

/**
 * Format time for display (HH:mm)
 */
export const formatMessageTime = (date: string | Date): string => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Format date for display in separators
 * Returns: "Hôm nay", "Hôm qua", "DD/MM" or "DD/MM/YYYY"
 */
export const formatDateLabel = (date: string | Date): string => {
    const d = new Date(date);
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