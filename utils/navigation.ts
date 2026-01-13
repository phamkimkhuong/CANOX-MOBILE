import { Href, router } from 'expo-router';

/**
 * Navigator - High Performance Navigation Utility
 * Optimized for React Native 0.81 Fabric Architecture
 */

let lastClickTimestamp = 0;
const CLICK_THRESHOLD = 1000; // 1s

// DEV-only logging that doesn't block navigation
const logNav = __DEV__
    ? (msg: string) => setTimeout(() => console.log(msg), 0)
    : () => { };

export const Navigator = {
    push: (route: Href | string) => {
        const now = Date.now();

        // Block double tap if click too fast
        if (now - lastClickTimestamp < CLICK_THRESHOLD) {
            logNav(`[NAV] Blocked: ${now - lastClickTimestamp}ms since last`);
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
    },

    navigate: (route: Href | string) => {
        const now = Date.now();
        if (now - lastClickTimestamp < CLICK_THRESHOLD) return;
        lastClickTimestamp = now;
        router.navigate(route as Href);
    }
};

