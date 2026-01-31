import { registerPushToken, unregisterPushToken } from '@/services/api/pushTokenApi';
import { useIsAuthenticated } from '@/store/useAuthStore';
import { buildPushTokenPayload } from '@/utils/deviceInfo';
import { logger } from '@/utils/logger';
import { useCallback, useEffect, useRef } from 'react';
import { clearPushToken } from './usePushNotifications';

/**
 * Feature flag to enable/disable push token sync
 * Set to true when Backend has implemented /api/v1/push-tokens endpoint
 */
const ENABLE_PUSH_TOKEN_SYNC = true;

/**
 * Hook to sync push token with backend
 * 
 * This hook automatically:
 * - Sends push token to server when user logs in
 * - Updates token on server if it changes
 * - Removes token from server when user logs out
 * Usage: Call this in _layout.tsx after usePushNotifications
 */
export function usePushTokenSync(
    fcmToken: string | null,
    tokenChanged: boolean
) {
    const isAuthenticated = useIsAuthenticated();
    const hasRegisteredRef = useRef(false);
    const lastTokenRef = useRef<string | null>(null);

    // Register token when user is authenticated and token is available
    const registerToken = useCallback(async () => {
        if (!fcmToken) return;

        if (!ENABLE_PUSH_TOKEN_SYNC) {
            logger.push.info('[PushToken] Sync disabled - Backend not ready');
            return;
        }

        try {
            const payload = await buildPushTokenPayload(fcmToken);
            logger.push.info('[PushToken] Registering token', payload);
            await registerPushToken(payload);
            hasRegisteredRef.current = true;
            lastTokenRef.current = fcmToken;
            logger.push.info('[PushToken] Registered successfully');
        } catch (error) {
            logger.push.error('[PushToken] Failed to register:', error);
        }
    }, [fcmToken]);

    // Unregister token when user logs out
    const unregisterToken = useCallback(async () => {
        const tokenToUnregister = fcmToken || lastTokenRef.current;

        // Always clear local storage
        clearPushToken();
        hasRegisteredRef.current = false;
        lastTokenRef.current = null;

        if (!ENABLE_PUSH_TOKEN_SYNC || !tokenToUnregister) {
            return;
        }

        try {
            await unregisterPushToken(tokenToUnregister);
            logger.push.info('[PushToken] Unregistered successfully');
        } catch (error) {
            logger.push.error('[PushToken] Failed to unregister:', error);
        }
    }, [fcmToken]);

    // Effect: Register token when authenticated
    useEffect(() => {
        if (isAuthenticated && fcmToken) {
            const shouldRegister =
                !hasRegisteredRef.current ||
                tokenChanged ||
                lastTokenRef.current !== fcmToken;

            if (shouldRegister) {
                registerToken();
            }
        }
    }, [isAuthenticated, fcmToken, tokenChanged, registerToken]);

    // Effect: Cleanup when user logs out
    useEffect(() => {
        if (!isAuthenticated && hasRegisteredRef.current) {
            unregisterToken();
        }
    }, [isAuthenticated, unregisterToken]);

    return {
        registerToken,
        unregisterToken,
    };
}
