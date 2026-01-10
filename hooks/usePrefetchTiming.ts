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
 * Minimum duration to display skeleton to avoid "flash" effect
 * Based on Nielsen Norman Group UX research:
 * "Skeleton under 300ms creates a jolt than no skeleton"
 */
export const MINIMUM_SKELETON_DURATION_MS = 350;

interface PrefetchTimingResult {
    /**
     * Call when user starts pressing (onPressIn)
     * Start timer and may trigger prefetch
     */
    startPrefetch: () => void;

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
 * Hook for prefetch timing
 * 
 * @example
 * ```tsx
 * const { startPrefetch, isInstantTap } = usePrefetchTiming();
 * 
 * const handlePressIn = () => {
 *     startPrefetch();
 *     prefetchData(id);
 * };
 * 
 * const handlePress = () => {
 *     Navigator.push(route, { 
 *         params: { instantNav: isInstantTap() ? 'true' : undefined } 
 *     });
 * };
 * ```
 */
export const usePrefetchTiming = (): PrefetchTimingResult => {
    const pressInTime = useRef<number>(0);

    const startPrefetch = useCallback(() => {
        pressInTime.current = Date.now();
    }, []);

    const getElapsedTime = useCallback(() => {
        if (pressInTime.current === 0) return 0;
        return Date.now() - pressInTime.current;
    }, []);

    const isInstantTap = useCallback(() => {
        const elapsed = getElapsedTime();
        return elapsed < PREFETCH_GRACE_PERIOD_MS;
    }, [getElapsedTime]);

    const reset = useCallback(() => {
        pressInTime.current = 0;
    }, []);

    return {
        startPrefetch,
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
