/**
 * usePrefetchTiming - Hook manage timing for prefetch pattern
 * 
 * Solve problem:
 * - Quick tap (~50-100ms): Prefetch not complete → Need skeleton with minimum duration
 * - Slow tap (>150ms): Prefetch complete → Navigate normally
 * 
 * Strategy:
 * - Track time from PressIn → Press
 * - If elapsed < THRESHOLD: Pass flag `instantNav=true` to screen to show skeleton
 * - If elapsed >= THRESHOLD: Navigate normally, only show skeleton if data not ready
 */

import { useCallback, useRef } from 'react';

/**
 * Time threshold to determine "quick" vs "slow" tap
 * - Below threshold: Consider as instant tap → Always show skeleton with minimum duration
 * - Above threshold: Prefetch has completed → Only show skeleton if needed
 */
export const PREFETCH_GRACE_PERIOD_MS = 200;

/**
 * Smart Delay to distinguish between a "Tap" and a "Scroll"
 * We wait for 80ms before starting prefetch.
 */
export const PREFETCH_SMART_DELAY_MS = 80;

/**
 * Minimum duration to display skeleton to avoid "flash" effect
 */
export const MINIMUM_SKELETON_DURATION_MS = 350;

interface PrefetchTimingResult {
    /**
     * Call when user starts pressing (onPressIn)
     * Starts a smart timer (80ms) before triggering the callback
     */
    startPrefetch: (callback?: () => void) => void;

    /**
     * Call when user releases early or scrolls (onPressOut / onScroll)
     * Cancels the pending prefetch to save resources
     */
    cancelPrefetch: () => void;

    /**
     * Call when user releases (onPress)
     * Return elapsed time to decide navigation strategy
     */
    getElapsedTime: () => number;

    /**
     * Check if it's an "instant tap"
     * true = Need to pass instantNav flag
     */
    isInstantTap: () => boolean;

    /**
     * Reset timer (cleanup)
     */
    reset: () => void;
}

/**
 * Hook for prefetch timing with Smart Delay logic
 */
export const usePrefetchTiming = (): PrefetchTimingResult => {
    const pressInTime = useRef<number>(0);
    const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const cancelPrefetch = useCallback(() => {
        if (prefetchTimeoutRef.current) {
            clearTimeout(prefetchTimeoutRef.current);
            prefetchTimeoutRef.current = null;
        }
    }, []);

    const startPrefetch = useCallback((callback?: () => void) => {
        cancelPrefetch(); // Clear any existing timer

        pressInTime.current = Date.now();

        // Smart delay: 80ms to distinguish from scroll
        prefetchTimeoutRef.current = setTimeout(() => {
            callback?.();
            prefetchTimeoutRef.current = null;
        }, PREFETCH_SMART_DELAY_MS);
    }, [cancelPrefetch]);

    const getElapsedTime = useCallback(() => {
        if (pressInTime.current === 0) return 0;
        return Date.now() - pressInTime.current;
    }, []);

    const isInstantTap = useCallback(() => {
        const elapsed = getElapsedTime();
        return elapsed < PREFETCH_GRACE_PERIOD_MS;
    }, [getElapsedTime]);

    const reset = useCallback(() => {
        cancelPrefetch();
        pressInTime.current = 0;
    }, [cancelPrefetch]);

    return {
        startPrefetch,
        cancelPrefetch,
        getElapsedTime,
        isInstantTap,
        reset,
    };
};

/**
 * Interface for navigation params with instant navigation flag
 */
export interface InstantNavParams {
    /** 
     * Flag marks navigation occurred too quickly (< PREFETCH_GRACE_PERIOD)
     * When true, target screen will display skeleton with minimum duration
     */
    instantNav?: 'true';
}
