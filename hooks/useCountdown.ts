import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseCountdownOptions {
    /** Duration in seconds */
    duration: number;
    /** Callback when countdown reaches 0 */
    onComplete?: () => void;
    /** Auto start on mount */
    autoStart?: boolean;
}

interface UseCountdownReturn {
    /** Remaining seconds */
    seconds: number;
    /** Is countdown active */
    isActive: boolean;
    /** Formatted time string (MM:SS) */
    formatted: string;
    /** Start/restart countdown */
    start: () => void;
    /** Stop countdown */
    stop: () => void;
    /** Reset to initial duration */
    reset: () => void;
}

/**
 * useCountdown - Hook đếm ngược với hỗ trợ background/foreground
 * 
 * Sử dụng timestamp thay vì chỉ trừ seconds để đảm bảo:
 * - User thoát app ra ngoài rồi vào lại -> thời gian vẫn trôi đúng
 * - Không bị drift (lệch) sau nhiều giây
 */
export const useCountdown = ({
    duration,
    onComplete,
    autoStart = false,
}: UseCountdownOptions): UseCountdownReturn => {
    const [seconds, setSeconds] = useState(duration);
    const [isActive, setIsActive] = useState(autoStart);
    
    // Store end timestamp to handle app backgrounding
    const endTimestampRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Calculate remaining time based on timestamp
    const calculateRemaining = useCallback(() => {
        if (!endTimestampRef.current) return duration;
        const remaining = Math.max(
            0,
            Math.ceil((endTimestampRef.current - Date.now()) / 1000)
        );
        return remaining;
    }, [duration]);

    // Start countdown
    const start = useCallback(() => {
        // Set end timestamp
        endTimestampRef.current = Date.now() + duration * 1000;
        setSeconds(duration);
        setIsActive(true);
    }, [duration]);

    // Stop countdown
    const stop = useCallback(() => {
        setIsActive(false);
        endTimestampRef.current = null;
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Reset to initial duration
    const reset = useCallback(() => {
        stop();
        setSeconds(duration);
    }, [duration, stop]);

    // Handle app state changes (background/foreground)
    useEffect(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState === 'active' && isActive && endTimestampRef.current) {
                // App came to foreground - recalculate remaining time
                const remaining = calculateRemaining();
                setSeconds(remaining);
                
                if (remaining <= 0) {
                    stop();
                    onComplete?.();
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [isActive, calculateRemaining, stop, onComplete]);

    // Main countdown interval
    useEffect(() => {
        if (!isActive) return;

        intervalRef.current = setInterval(() => {
            const remaining = calculateRemaining();
            setSeconds(remaining);

            if (remaining <= 0) {
                stop();
                onComplete?.();
            }
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isActive, calculateRemaining, stop, onComplete]);

    // Auto start on mount if enabled
    useEffect(() => {
        if (autoStart) {
            start();
        }
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Format seconds to MM:SS
    const formatted = `${Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

    return {
        seconds,
        isActive,
        formatted,
        start,
        stop,
        reset,
    };
};
