/**
 * useOTAUpdate
 *
 * Handles Expo EAS Over-The-Air updates silently in the background.
 * No UI prompt needed — updates are downloaded and applied on the next
 * app restart automatically.
 *
 * This hook:
 * 1. Checks for OTA updates on app launch
 * 2. Checks again when app returns from background
 * 3. Downloads updates silently
 * 4. Logs the update status for debugging
 *
 * Does NOT block or interrupt the user in any way.
 */

import { createLogger } from '@/utils/logger';
import * as Updates from 'expo-updates';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

const log = createLogger('OTAUpdate');

/**
 * Check for and download OTA updates silently.
 * Never throws — errors are logged and swallowed.
 */
async function checkAndDownloadUpdate(): Promise<void> {
    // Skip in dev mode — OTA updates only work in production/preview builds
    if (__DEV__) {
        log.info('Skipping OTA check in development mode');
        return;
    }

    try {
        const checkResult = await Updates.checkForUpdateAsync();

        if (!checkResult.isAvailable) {
            log.info('App is up-to-date (no OTA update available)');
            return;
        }

        log.info('OTA update available, downloading...');
        const fetchResult = await Updates.fetchUpdateAsync();

        if (fetchResult.isNew) {
            log.info('New OTA update downloaded. Will apply on next restart.');
            // NOTE: We do NOT call Updates.reloadAsync() here.
            // The update will automatically be applied the next time
            // the user closes and reopens the app.
            // Calling reloadAsync() would force-restart the app mid-use,
            // which is a terrible UX.
        }
    } catch (error) {
        // Never crash the app because of an OTA check failure
        log.warn('OTA update check failed (non-fatal):', error);
    }
}

export function useOTAUpdate(): void {
    const hasChecked = useRef(false);

    // Check on mount (app launch)
    useEffect(() => {
        if (!hasChecked.current) {
            hasChecked.current = true;
            checkAndDownloadUpdate();
        }
    }, []);

    // Re-check when app returns to foreground
    const handleAppStateChange = useCallback((nextState: AppStateStatus) => {
        if (nextState === 'active') {
            checkAndDownloadUpdate();
        }
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [handleAppStateChange]);
}
