import { logger } from '@/utils/logger';
import { Href, router } from 'expo-router';

/**
 * Navigator - High Performance Navigation Utility
 * Optimized for React Native 0.81 Fabric Architecture
 */
const NAV_LOCK_DURATION = 2000;

// ============================================
// GLOBAL STATE INITIALIZATION
// ============================================

/**
 * Initialize global navigation lock state
 * Using undefined check to prevent reset on HMR
 */
if (global.__NAV_LOCKED__ === undefined) {
    global.__NAV_LOCKED__ = false;
    global.__NAV_LOCK_TIMEOUT__ = null;
}

// ============================================
// INTERNAL UTILITIES
// ============================================

/**
 * DEV-only logging with structured format
 */
const logNav = (msg: string, isBlocked: boolean = false) => {
    if (isBlocked) {
        logger.nav.warn(msg);
    } else {
        logger.nav.info(msg);
    }
};

/**
 * Lock navigation for the configured duration
 * Any navigation attempts during lock will be blocked
 */
const lockNavigation = () => {
    global.__NAV_LOCKED__ = true;

    // Clear existing timeout to reset timer
    if (global.__NAV_LOCK_TIMEOUT__) {
        clearTimeout(global.__NAV_LOCK_TIMEOUT__);
    }

    // Auto-unlock after duration
    global.__NAV_LOCK_TIMEOUT__ = setTimeout(() => {
        global.__NAV_LOCKED__ = false;
        global.__NAV_LOCK_TIMEOUT__ = null;
        if (__DEV__) {
            logger.nav.info('[NAV] Navigation auto-unlocked after', NAV_LOCK_DURATION, 'ms');
        }
    }, NAV_LOCK_DURATION);
};

/**
 * Check if navigation is currently locked
 */
const isNavigationLocked = (): boolean => {
    return global.__NAV_LOCKED__ === true;
};

// ============================================
// EXPORTED NAVIGATOR OBJECT
// ============================================

export const Navigator = {
    /**
     * Push a new screen onto the navigation stack
     * Protected by navigation lock to prevent double-tap issues
     */
    push: (route: Href | string) => {
        if (isNavigationLocked()) {
            logNav(`[NAV] Blocked Push (locked): ${typeof route === 'string' ? route : 'complex route'}`, true);
            return;
        }

        lockNavigation();
        const routePath = typeof route === 'string' ? route : (route as { pathname?: string }).pathname || 'complex route';
        logNav(`[NAV] Pushing: ${routePath}`);
        router.push(route as Href);
    },

    /**
     * Replace current screen with a new one
     * Protected by navigation lock
     */
    replace: (route: Href | string) => {
        if (isNavigationLocked()) {
            logNav(`[NAV] Blocked Replace (locked): ${route}`, true);
            return;
        }
        lockNavigation();
        logNav(`[NAV] Replacing: ${route}`);
        router.replace(route as Href);
    },

    /**
     * Go back to previous screen
     * NOT protected by lock - user may need to go back multiple times quickly
     */
    back: () => {
        logNav('[NAV] Going back');
        router.back();
    },

    /**
     * Navigate to a screen (smart push/replace based on history)
     * Protected by navigation lock
     */
    navigate: (route: Href | string) => {
        if (isNavigationLocked()) {
            logNav(`[NAV] Blocked Navigate (locked): ${route}`, true);
            return;
        }
        lockNavigation();
        logNav(`[NAV] Navigating: ${route}`);
        router.navigate(route as Href);
    },

    /**
     * Manually unlock navigation
     * Call this when you know navigation has completed
     * Use cases:
     * - After screen focus event
     * - After animation complete callback
     * - In error recovery scenarios
     */
    unlock: () => {
        global.__NAV_LOCKED__ = false;
        if (global.__NAV_LOCK_TIMEOUT__) {
            clearTimeout(global.__NAV_LOCK_TIMEOUT__);
            global.__NAV_LOCK_TIMEOUT__ = null;
        }
        if (__DEV__) {
            logger.nav.info('[NAV] Navigation manually unlocked');
        }
    },

    /**
     * Check if navigation is currently locked
     * Useful for UI feedback (e.g., disable buttons while navigating)
     */
    isLocked: isNavigationLocked,

    /**
     * Get lock duration constant
     * Useful for testing or dynamic adjustments
     */
    getLockDuration: () => NAV_LOCK_DURATION,
};
