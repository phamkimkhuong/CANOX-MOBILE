/**
 * WebSocket Hooks
 *
 * Re-export hooks from WebSocketProvider for use in components.
 * This is the main entry point for using WebSocket in the app.
 *
 * @example
 * // Basic usage
 * const { connected, subscribeToNotifications } = useWebSocket();
 *
 * // Subscribe notifications
 * useNotificationSubscription((notification) => {
 *   console.log('New notification:', notification);
 * });
 */

import {
    useWebSocketContext,
    useWebSocketStatus
} from '@/components/WebSocketProvider';
import { MessageCallback } from '@/services/websocket';
import { logger } from '@/utils/logger';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

// ==================== RE-EXPORTS ====================

/**
 * Main hook to access WebSocket context
 * Provides full methods: connect, disconnect, subscribe, sendMessage
 */
export { useWebSocketContext as useWebSocket } from '@/components/WebSocketProvider';

/**
 * Simple hook to check connection status
 * @returns { connected, state, error }
 */
export { useWebSocketStatus } from '@/components/WebSocketProvider';

/**
 * Hook to subscribe notifications with auto-cleanup
 * @param onNotification - Callback when receiving notification
 * @param enabled - Enable/disable subscription
 */
export { useNotificationSocket } from '@/components/WebSocketProvider';

// ==================== SPECIALIZED HOOKS ====================

/**
 * Hook to subscribe notifications and automatically invalidate notification queries
 * Combine WebSocket with TanStack Query
 *
 * @param options - Options
 * @param options.onNotification - Callback when receiving new notification
 * @param options.showToast - Show toast when new notification arrives
 * @param options.enabled - Enable/disable subscription
 *
 * @example
 * useNotificationSubscription({
 *   onNotification: (data) => console.log('New:', data),
 *   showToast: true,
 * });
 */
export function useNotificationSubscription(options: {
    onNotification?: MessageCallback;
    showToast?: boolean;
    enabled?: boolean;
} = {}) {
    const { onNotification, showToast = false, enabled = true } = options;

    const queryClient = useQueryClient();
    const { connected, subscribeToNotifications } = useWebSocketContext();

    // Ref to avoid stale closure
    const onNotificationRef = useRef(onNotification);
    onNotificationRef.current = onNotification;

    const handleNotification = useCallback(
        (message: unknown) => {
            logger.ws.info(' New notification:', message);

            // Invalidate notification queries to refetch
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            // Can invalidate unread count if exists
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });

            // Show toast if enabled
            if (showToast) {
                // Toast will be implemented later
                // Toast.show({ text1: 'Bạn có thông báo mới!' });
            }

            // Custom callback
            if (onNotificationRef.current) {
                onNotificationRef.current(message);
            }
        },
        [queryClient, showToast]
    );

    useEffect(() => {
        if (!enabled || !connected) return;

        const unsubscribe = subscribeToNotifications(handleNotification);
        return unsubscribe;
    }, [enabled, connected, subscribeToNotifications, handleNotification]);

    return { connected };
}

/**
 * Hook to get realtime unread notification count
 * Combine with TanStack Query
 *
 * @example
 * const { unreadCount } = useUnreadNotificationCount();
 * // unreadCount sẽ tự động update khi có notification mới
 */
export function useUnreadNotificationCount() {
    const { connected } = useWebSocketStatus();

    // Can extend to track unread count from WebSocket
    // Currently only returns connection status
    return {
        connected,
        // unreadCount will be managed by TanStack Query
    };
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook to debug WebSocket connection
 * Only active in development mode
 */
export function useWebSocketDebug() {
    const { connected, state, error } = useWebSocketStatus();

    useEffect(() => {
        logger.ws.debug('Connection status:', {
            connected,
            state,
            error,
        });
    }, [connected, state, error]);

    return { connected, state, error };
}

/**
 * Hook for manual control of WebSocket connection
 * Useful for testing or special cases
 *
 * @example
 * const { connect, disconnect, reconnect, isConnected } = useWebSocketControl();
 *
 * // Manual connect after disabling autoConnect
 * await connect();
 */
export function useWebSocketControl() {
    const { connected, state, error, connect, disconnect, reconnect } =
        useWebSocketContext();

    return {
        isConnected: connected,
        connectionState: state,
        connectionError: error,
        connect,
        disconnect,
        reconnect,
    };
}
