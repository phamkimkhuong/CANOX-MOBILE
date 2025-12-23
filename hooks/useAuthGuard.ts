import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';

// Routes that require authentication
const PROTECTED_TABS = new Set(['cart']);

/**
 * Global auth gate:
 * - Hydrates auth state from SecureStore on app start
 * - Redirects unauthenticated users to /(auth)/login when accessing protected routes
 * - Redirects authenticated users away from auth screens to /(tabs)
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

    // 2) Enforce route access based on auth + current route group.
    useEffect(() => {
        if (!navigationState?.key) return;
        if (!hydrated) return;

        const firstSegment = segments[0];
        const secondSegment = segments[1];
        const inAuthGroup = firstSegment === '(auth)';
        const isProtectedRoute =
            firstSegment === '(tabs)' &&
            secondSegment != null &&
            PROTECTED_TABS.has(secondSegment);

        // Wait for animations/interactions to complete before redirecting
        // This prevents Android "child already has a parent" crash
        const task = InteractionManager.runAfterInteractions(() => {
            if (!isAuthenticated && isProtectedRoute) {
                router.replace(ROUTES.AUTH.LOGIN);
                return;
            }

            if (isAuthenticated && inAuthGroup) {
                router.replace(ROUTES.TABS.HOME);
            }
        });

        return () => task.cancel();
    }, [hydrated, isAuthenticated, navigationState?.key, segments]);
};

