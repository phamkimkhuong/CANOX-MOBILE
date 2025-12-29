import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ============================================
// TYPES
// ============================================

interface CountdownDuration {
    /** Số giờ còn lại */
    hours: number;
    /** Số phút còn lại */
    minutes: number;
    /** Số giây còn lại */
    seconds: number;
    /** Tổng số giây còn lại */
    totalSeconds: number;
}

interface UseCountdownOptions {
    /** 
     * Target date (ISO string) - thời điểm kết thúc countdown
     * Ưu tiên cao hơn duration nếu cả 2 được cung cấp
     */
    targetDate?: string;
    /** Duration in seconds (fallback nếu không có targetDate) */
    duration?: number;
    /** Callback when countdown reaches 0 */
    onComplete?: () => void;
    /** Auto start on mount */
    autoStart?: boolean;
}

interface UseCountdownReturn {
    /** Duration object với hours, minutes, seconds */
    duration: CountdownDuration;
    /** Còn đang chạy không */
    isActive: boolean;
    /** Đã hết thời gian chưa */
    isExpired: boolean;
    /** Formatted time string (HH:MM:SS) */
    formatted: string;
    /** Start countdown */
    start: () => void;
    /** Stop countdown */
    stop: () => void;
    /** Reset to initial duration */
    reset: () => void;
}

// ============================================
// HELPERS
// ============================================

/**
 * Tính duration từ target date
 */
const calculateDurationFromTarget = (targetDate: string): CountdownDuration => {
    const diff = new Date(targetDate).getTime() - Date.now();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));

    return {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        totalSeconds,
    };
};

/**
 * Tính duration từ seconds
 */
const calculateDurationFromSeconds = (totalSeconds: number): CountdownDuration => {
    const safeSeconds = Math.max(0, totalSeconds);

    return {
        hours: Math.floor(safeSeconds / 3600),
        minutes: Math.floor((safeSeconds % 3600) / 60),
        seconds: safeSeconds % 60,
        totalSeconds: safeSeconds,
    };
};

/**
 * Format duration thành string HH:MM:SS
 */
const formatDuration = (d: CountdownDuration): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.hours)}:${pad(d.minutes)}:${pad(d.seconds)}`;
};

// ============================================
// HOOK
// ============================================

/**
 * useCountdown - Hook đếm ngược với hỗ trợ background/foreground
 * 
 * Single Source of Truth cho countdown logic trong toàn app.
 * 
 * Features:
 * - Nhận targetDate (ISO string) hoặc duration (seconds)
 * - Tự động xử lý AppState (background/foreground)
 * - Trả về hours, minutes, seconds đã tính toán
 * - Không bị drift sau nhiều giây
 * 
 * @example
 * ```tsx
 * // Sử dụng với targetDate (Flash Sale)
 * const { duration, isExpired } = useCountdown({
 *   targetDate: '2025-12-30T00:00:00Z',
 *   autoStart: true,
 *   onComplete: () => console.log('Flash Sale ended!'),
 * });
 * 
 * // Render
 * <CountdownDigits duration={duration} />
 * ```
 */
export const useCountdown = ({
    targetDate,
    duration: initialDuration = 0,
    onComplete,
    autoStart = false,
}: UseCountdownOptions): UseCountdownReturn => {
    // Tính initial duration
    const getInitialDuration = useCallback((): CountdownDuration => {
        if (targetDate) {
            return calculateDurationFromTarget(targetDate);
        }
        return calculateDurationFromSeconds(initialDuration);
    }, [targetDate, initialDuration]);

    const [duration, setDuration] = useState<CountdownDuration>(getInitialDuration);
    const [isActive, setIsActive] = useState(autoStart);

    // Refs để track state qua closures
    const endTimestampRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onCompleteRef = useRef(onComplete);

    // Update callback ref
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Tính remaining time dựa trên mode
    const calculateRemaining = useCallback((): CountdownDuration => {
        if (targetDate) {
            return calculateDurationFromTarget(targetDate);
        }

        if (!endTimestampRef.current) {
            return calculateDurationFromSeconds(initialDuration);
        }

        const remaining = Math.ceil((endTimestampRef.current - Date.now()) / 1000);
        return calculateDurationFromSeconds(remaining);
    }, [targetDate, initialDuration]);

    // Start countdown
    const start = useCallback(() => {
        if (targetDate) {
            // Mode targetDate: không cần set endTimestamp, tính trực tiếp từ targetDate
            setDuration(calculateDurationFromTarget(targetDate));
        } else {
            // Mode duration: set end timestamp
            endTimestampRef.current = Date.now() + initialDuration * 1000;
            setDuration(calculateDurationFromSeconds(initialDuration));
        }
        setIsActive(true);
    }, [targetDate, initialDuration]);

    // Stop countdown
    const stop = useCallback(() => {
        setIsActive(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Reset to initial duration
    const reset = useCallback(() => {
        stop();
        endTimestampRef.current = null;
        setDuration(getInitialDuration());
    }, [stop, getInitialDuration]);

    // Handle app state changes (background/foreground)
    useEffect(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState === 'active' && isActive) {
                // App came to foreground - recalculate remaining time
                const remaining = calculateRemaining();
                setDuration(remaining);

                if (remaining.totalSeconds <= 0) {
                    stop();
                    onCompleteRef.current?.();
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isActive, calculateRemaining, stop]);

    // Main countdown interval
    useEffect(() => {
        if (!isActive) return;

        intervalRef.current = setInterval(() => {
            const remaining = calculateRemaining();
            setDuration(remaining);

            if (remaining.totalSeconds <= 0) {
                stop();
                onCompleteRef.current?.();
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, calculateRemaining, stop]);

    // Auto start on mount if enabled
    useEffect(() => {
        if (autoStart) {
            start();
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Re-sync khi targetDate thay đổi
    useEffect(() => {
        if (targetDate && isActive) {
            setDuration(calculateDurationFromTarget(targetDate));
        }
    }, [targetDate, isActive]);

    return {
        duration,
        isActive,
        isExpired: duration.totalSeconds <= 0,
        formatted: formatDuration(duration),
        start,
        stop,
        reset,
    };
};

// Export types for consumers
export type { CountdownDuration, UseCountdownOptions, UseCountdownReturn };
