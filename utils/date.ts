import { FlashSaleSlot } from '@/types/home';

/**
 * Tính toán khung giờ Flash Sale tiếp theo (Mô phỏng theo block 3 tiếng)
 * Ví dụ: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
 */
export const getNextFlashSaleSlot = (): FlashSaleSlot => {
    const now = new Date();
    const hours = now.getHours();

    // Tìm khung giờ kế tiếp chia hết cho 3
    const slotStartHour = Math.floor(hours / 3) * 3;
    const slotEndHour = slotStartHour + 3;

    const startTime = new Date(now);
    startTime.setHours(slotStartHour, 0, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(slotEndHour, 0, 0, 0);

    // Định dạng label hiển thị (e.g. "09:00")
    const label = `${slotStartHour.toString().padStart(2, '0')}:00`;

    return {
        id: `slot-${slotStartHour}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        label,
    };
};

/**
 * Format thời gian còn lại (ms) -> { hours, minutes, seconds }
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
 * Format timestamp to readable string (e.g., "14:30", "Hôm qua", "T2")
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