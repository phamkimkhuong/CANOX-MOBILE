import { Href, router } from 'expo-router';

/**
 * Navigation Utility to prevent double taps and race conditions
 */

let isNavigating = false;
let lastPushTime = 0;
const PUSH_TIMEOUT = 800; // Reduced from 800ms for faster navigation

export const Navigator = {
    /**
     * Safe navigation, prevents double taps
     */
    push: (route: Href | string) => {
        const now = Date.now();

        // If navigating or tapped too fast (< 800ms)
        if (isNavigating || (now - lastPushTime < PUSH_TIMEOUT)) {
            return;
        }

        isNavigating = true;
        lastPushTime = now;

        router.push(route as Href);

        // Reset lock after a duration
        setTimeout(() => {
            isNavigating = false;
        }, PUSH_TIMEOUT);
    },

    /**
     * Use navigate instead of push for singleton/tab screens
     * Navigate is smarter in handling stack
     */
    navigate: (route: Href | string) => {
        router.navigate(route as Href);
    },

    /**
     * Go back to previous screen
     */
    back: () => {
        router.back();
    }
};
