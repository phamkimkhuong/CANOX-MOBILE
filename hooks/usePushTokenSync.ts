import { registerPushToken, unregisterPushToken } from '@/services/api/pushTokenApi';
import { useIsAuthenticated } from '@/store/useAuthStore';
import { buildPushTokenPayload, collectDeviceInfo } from '@/utils/deviceInfo';
import { useCallback, useEffect, useRef } from 'react';
import { clearPushToken } from './usePushNotifications';

/**
 * Hook to sync push token with backend
 * 
 * This hook automatically:
 * - Sends push token to server when user logs in
 * - Updates token on server if it changes
 * - Removes token from server when user logs out
 * 
 * Usage: Call this in _layout.tsx after usePushNotifications
 */
export function usePushTokenSync(
    expoPushToken: string | null,
    tokenChanged: boolean
) {
    const isAuthenticated = useIsAuthenticated();
    const hasRegisteredRef = useRef(false);
    const lastTokenRef = useRef<string | null>(null);

    // Register token when user is authenticated and token is available
    const registerToken = useCallback(async () => {
        if (!expoPushToken) return;

        try {
            const payload = await buildPushTokenPayload(expoPushToken);
            await registerPushToken(payload);
            hasRegisteredRef.current = true;
            lastTokenRef.current = expoPushToken;
            console.log('[PushToken] Registered successfully');
        } catch (error) {
            console.error('[PushToken] Failed to register:', error);
        }
    }, [expoPushToken]);

    // Unregister token when user logs out
    const unregisterToken = useCallback(async () => {
        try {
            const deviceInfo = await collectDeviceInfo();
            await unregisterPushToken(deviceInfo.deviceId);
            hasRegisteredRef.current = false;
            lastTokenRef.current = null;
            clearPushToken(); // Clear local storage
            console.log('[PushToken] Unregistered successfully');
        } catch (error) {
            console.error('[PushToken] Failed to unregister:', error);
        }
    }, []);

    // Effect: Register token when authenticated
    useEffect(() => {
        if (isAuthenticated && expoPushToken) {
            // Only register if:
            // 1. Haven't registered yet, OR
            // 2. Token has changed
            const shouldRegister =
                !hasRegisteredRef.current ||
                tokenChanged ||
                lastTokenRef.current !== expoPushToken;

            if (shouldRegister) {
                registerToken();
            }
        }
    }, [isAuthenticated, expoPushToken, tokenChanged, registerToken]);

    // Effect: Cleanup when user logs out
    useEffect(() => {
        // If was authenticated and now not, unregister
        if (!isAuthenticated && hasRegisteredRef.current) {
            unregisterToken();
        }
    }, [isAuthenticated, unregisterToken]);

    return {
        registerToken,
        unregisterToken,
    };
}
