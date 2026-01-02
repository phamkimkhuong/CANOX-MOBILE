/**
 * useTokenRefresh - Hook for token refresh on app state changes
 * 
 * Layer 1 of 3-Layer Token Refresh Strategy:
 * - Checks token health when app comes to foreground
 * - Triggers refresh if token has used > 50% of lifetime
 * 
 * Usage: Call this hook once at app root level
 */

import { checkTokenOnAppLaunch } from '@/services/auth/tokenManager';
import { useAuthStore } from '@/store/useAuthStore';
import { logger } from '@/utils/logger';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Hook to handle token refresh on app foreground
 * Should be called once at the root of the app
 */
export const useTokenRefreshOnForeground = (): void => {
    const appState = useRef(AppState.currentState);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        // Only listen if user is authenticated
        if (!isAuthenticated) return;

        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            // App coming to foreground from background
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                logger.auth.info('App returned to foreground - checking token health');
                checkTokenOnAppLaunch();
            }

            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [isAuthenticated]);
};

export default useTokenRefreshOnForeground;
