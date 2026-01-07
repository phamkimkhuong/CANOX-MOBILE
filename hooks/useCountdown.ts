import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// ============================================
// TYPES
// ============================================

interface CountdownDuration {
    /** Hours remaining */
    hours: number;
    /** Minutes remaining */
    minutes: number;
    /** Seconds remaining */
    seconds: number;
    /** Total seconds remaining */
    totalSeconds: number;
}

interface UseCountdownOptions {
    /** 
     * Target date (ISO string) - countdown end time
     * Higher priority than duration if both provided
     */
    targetDate?: string;
    /** Duration in seconds (fallback if no targetDate) */
    duration?: number;
    /** Callback when countdown reaches 0 */
    onComplete?: () => void;
    /** Auto start on mount */
    autoStart?: boolean;
}

interface UseCountdownReturn {
    /** Duration object with hours, minutes, seconds */
    duration: CountdownDuration;
    /** Is active */
    isActive: boolean;
    /** Is expired */
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
 * Calculate duration from target date
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
 * Calculate duration from seconds
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
 * Format duration to HH:MM:SS string
 */
const formatDuration = (d: CountdownDuration): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.hours)}:${pad(d.minutes)}:${pad(d.seconds)}`;
};

// ============================================
// HOOK
// ============================================

/**
 * useCountdown - Countdown hook with background/foreground support
 * 
 * Single Source of Truth for countdown logic in entire app.
 * 
 * Features:
 * - Accepts targetDate (ISO string) or duration (seconds)
 * - Automatically handles AppState (background/foreground)
 * - Returns calculated hours, minutes, seconds
 * - No drift after many seconds
 */
export const useCountdown = ({
    targetDate,
    duration: initialDuration = 0,
    onComplete,
    autoStart = false,
}: UseCountdownOptions): UseCountdownReturn => {
    // Calculate initial duration
    const getInitialDuration = useCallback((): CountdownDuration => {
        if (targetDate) {
            return calculateDurationFromTarget(targetDate);
        }
        return calculateDurationFromSeconds(initialDuration);
    }, [targetDate, initialDuration]);

    const [duration, setDuration] = useState<CountdownDuration>(getInitialDuration);
    const [isActive, setIsActive] = useState(autoStart);

    // Refs to track state via closures
    const endTimestampRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const onCompleteRef = useRef(onComplete);

    // Update callback ref
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Calculate remaining time based on mode
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
            // TargetDate mode: no need to set endTimestamp, calc directly from targetDate
            setDuration(calculateDurationFromTarget(targetDate));
        } else {
            // Duration mode: set end timestamp
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

    // Re-sync when targetDate changes
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

