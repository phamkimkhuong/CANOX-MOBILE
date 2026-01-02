/**
 * WebSocket Hooks
 *
 * Re-export các hooks từ WebSocketProvider để sử dụng trong components.
 * Đây là entry point chính cho việc sử dụng WebSocket trong app.
 *
 * @example
 * // Sử dụng cơ bản
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
 * Hook chính để truy cập WebSocket context
 * Cung cấp đầy đủ các methods: connect, disconnect, subscribe, sendMessage
 */
export { useWebSocketContext as useWebSocket } from '@/components/WebSocketProvider';

/**
 * Hook đơn giản để check connection status
 * @returns { connected, state, error }
 */
export { useWebSocketStatus } from '@/components/WebSocketProvider';

/**
 * Hook để subscribe notifications với auto-cleanup
 * @param onNotification - Callback khi nhận notification
 * @param enabled - Enable/disable subscription
 */
export { useNotificationSocket } from '@/components/WebSocketProvider';

// ==================== SPECIALIZED HOOKS ====================

/**
 * Hook để subscribe notifications và tự động invalidate notification queries
 * Kết hợp WebSocket với TanStack Query
 *
 * @param options - Tùy chọn
 * @param options.onNotification - Callback khi nhận notification mới
 * @param options.showToast - Hiển thị toast khi có notification mới
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

    // Ref để tránh stale closure
    const onNotificationRef = useRef(onNotification);
    onNotificationRef.current = onNotification;

    const handleNotification = useCallback(
        (message: unknown) => {
            logger.ws.info(' New notification:', message);

            // Invalidate notification queries để refetch
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            // Có thể invalidate unread count nếu có
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });

            // Show toast nếu được enable
            if (showToast) {
                // Toast sẽ được implement sau
                // Toast.show({ text1: 'Bạn có thông báo mới!' });
            }

            // Callback tùy chỉnh
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
 * Hook để lấy số lượng notifications chưa đọc realtime
 * Kết hợp với TanStack Query
 *
 * @example
 * const { unreadCount } = useUnreadNotificationCount();
 * // unreadCount sẽ tự động update khi có notification mới
 */
export function useUnreadNotificationCount() {
    const { connected } = useWebSocketStatus();

    // Có thể mở rộng để track unread count từ WebSocket
    // Hiện tại chỉ return connection status
    return {
        connected,
        // unreadCount sẽ được quản lý bởi TanStack Query
    };
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook để debug WebSocket connection
 * Chỉ hoạt động trong development mode
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
 * Hook để manual control WebSocket connection
 * Useful cho testing hoặc các trường hợp đặc biệt
 *
 * @example
 * const { connect, disconnect, reconnect, isConnected } = useWebSocketControl();
 *
 * // Manual connect sau khi disable autoConnect
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
