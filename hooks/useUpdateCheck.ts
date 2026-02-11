/**
 * useUpdateCheck Hook
 *
 * Runs once on app mount to check if a new version is available.
 * Updates the Zustand store with the result, which _layout.tsx
 * uses to render ForceUpdateScreen or SoftUpdateBanner.
 *
 * Pattern: Same as useAuthGuard / usePrivacyConsent — a startup guard.
 */

import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { checkForUpdate } from '@/services/updateChecker';
import { useAppStore } from '@/store/useAppStore';
import { createLogger } from '@/utils/logger';

const log = createLogger('useUpdateCheck');

/**
 * Hook to check for app updates on startup and when app returns to foreground.
 *
 * Behavior:
 * - Runs check once on mount (app launch)
 * - Re-checks when app comes back to foreground (background → active)
 * - updateChecker internally handles 2h MMKV caching, so this is safe to call often
 * - Never blocks the UI — errors are silently logged
 */
export function useUpdateCheck() {
    const setUpdateInfo = useAppStore((s) => s.setUpdateInfo);
    const hasCheckedRef = useRef(false);

    const performCheck = useCallback(async () => {
        try {
            const result = await checkForUpdate();

            setUpdateInfo({
                updateStatus: result.status,
                updateMessage: result.message,
                updateStoreUrl: result.storeUrl,
            });

            if (result.status !== 'none') {
                log.info(
                    `Update available: ${result.status} | v${result.currentVersion} → v${result.latestVersion}`,
                );
            }
        } catch (error) {
            // Never block user on check failure
            log.warn('Update check failed silently:', error);
        }
    }, [setUpdateInfo]);

    // ── Initial check on mount ──
    useEffect(() => {
        if (!hasCheckedRef.current) {
            hasCheckedRef.current = true;
            performCheck();
        }
    }, [performCheck]);

    // ── Re-check when app comes to foreground ──
    useEffect(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState === 'active') {
                performCheck();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [performCheck]);
}
