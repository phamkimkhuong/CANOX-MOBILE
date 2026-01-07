import { Href, router } from 'expo-router';

/**
 * Navigator - High Performance Navigation Utility
 * Optimized for React Native 0.81 Fabric Architecture
 */

let lastClickTimestamp = 0;
const CLICK_THRESHOLD = 1000; // 1s

export const Navigator = {
    push: (route: Href | string) => {
        const now = Date.now();
        console.log(`[NAV] Attempting to push: ${route} at ${now}. Last: ${lastClickTimestamp}`);

        // Block double tap if click too fast
        if (now - lastClickTimestamp < CLICK_THRESHOLD) {
            console.log('--- Double tap blocked ---');
            return;
        }

        lastClickTimestamp = now;
        router.push(route as Href);
    },

    replace: (route: Href | string) => {
        const now = Date.now();
        if (now - lastClickTimestamp < CLICK_THRESHOLD) return;
        lastClickTimestamp = now;
        router.replace(route as Href);
    },

    back: () => {
        const now = Date.now();
        if (now - lastClickTimestamp < CLICK_THRESHOLD) return;
        lastClickTimestamp = now;
        router.back();
    }
};
