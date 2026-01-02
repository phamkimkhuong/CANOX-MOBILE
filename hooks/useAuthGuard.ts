import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';

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

    const hydrated = useAuthStore((state) => state.hydrated);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const hydrate = useAuthStore((state) => state.hydrate);

    // 1) Hydrate auth state from SecureStore once navigation is ready.
    useEffect(() => {
        if (!navigationState?.key) return;
        if (didHydrateRef.current) return;
        didHydrateRef.current = true;

        void hydrate();
    }, [hydrate, navigationState?.key]);

    // 2) Redirect authenticated users away from auth screens.
    useEffect(() => {
        if (!navigationState?.key) return;
        if (!hydrated) return;

        const firstSegment = segments[0];
        const inAuthGroup = firstSegment === '(auth)';

        // Wait for animations/interactions to complete before redirecting
        const task = InteractionManager.runAfterInteractions(() => {
            // If user is logged in but on auth screen, redirect to home
            if (isAuthenticated && inAuthGroup) {
                router.replace(ROUTES.TABS.HOME);
            }
        });

        return () => task.cancel();
    }, [hydrated, isAuthenticated, navigationState?.key, segments]);
};
