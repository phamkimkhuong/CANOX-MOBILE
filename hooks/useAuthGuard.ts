import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

/**
 * Global auth gate:
 * 
 * Responsibilities:
 *  Hydrates auth state from SecureStore on app start
 *  Redirects authenticated users away from auth screens to /(tabs)
 */
export const useAuthGuard = (): void => {
    const segments = useSegments();
    const navigationState = useRootNavigationState();
    const didHydrateRef = useRef(false);
    const [mounted, setMounted] = useState(false);

    const hydrated = useAuthStore((state) => state.hydrated);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const hydrate = useAuthStore((state) => state.hydrate);

    // Track component mount status
    useEffect(() => {
        setMounted(true);
    }, []);

    // 1) Hydrate auth state from SecureStore once navigation and layout are fully mounted.
    useEffect(() => {
        if (!mounted) return;
        if (!navigationState?.key) return;
        if (didHydrateRef.current) return;
        didHydrateRef.current = true;

        void hydrate();
    }, [hydrate, navigationState?.key, mounted]);

    // 2) Redirect authenticated users away from auth screens.
    useEffect(() => {
        if (!mounted) return;
        if (!navigationState?.key) return;
        if (!hydrated) return;

        const firstSegment = segments[0];
        const inAuthGroup = firstSegment === '(auth)';

        // Wait for animations/interactions to complete before redirecting
        const timer = setTimeout(() => {
            // If user is logged in but on auth screen, redirect to home
            if (isAuthenticated && inAuthGroup) {
                router.replace(ROUTES.TABS.HOME);
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [hydrated, isAuthenticated, navigationState?.key, segments, mounted]);
};
