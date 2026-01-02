/**
 * WebSocketProvider - Context Provider for WebSocket connection
 *
 * Cung cấp WebSocket connection state và methods cho toàn bộ app.
 * Auto-connect khi user authenticated, auto-disconnect khi logout.
 *
 * @example
 * // Wrap app trong _layout.tsx
 * <WebSocketProvider>
 *   <App />
 * </WebSocketProvider>
 *
 * // Sử dụng trong component
 * const { connected, subscribeToNotifications } = useWebSocket();
 */

import {
    getWebSocketService,
    MessageCallback,
    WebSocketService,
    WebSocketState,
} from '@/services/websocket';
import { useAuthStore } from '@/store/useAuthStore';
import { logger } from '@/utils/logger';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

// ==================== TYPES ====================

interface WebSocketContextType {
    /** Trạng thái kết nối */
    connected: boolean;
    /** Trạng thái chi tiết */
    state: WebSocketState;
    /** Lỗi kết nối (nếu có) */
    error: string | null;
    /** Kết nối WebSocket */
    connect: () => Promise<void>;
    /** Ngắt kết nối */
    disconnect: () => void;
    /** Subscribe to topic */
    subscribe: (topic: string, callback: MessageCallback) => () => void;
    /** Gửi message */
    sendMessage: (destination: string, data: unknown) => void;
    /** Force reconnect */
    reconnect: () => Promise<void>;
    /** Subscribe to notifications (convenience) */
    subscribeToNotifications: (callback: MessageCallback) => () => void;
}

// ==================== CONTEXT ====================

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// ==================== PROVIDER PROPS ====================

interface WebSocketProviderProps {
    children: ReactNode;
    /** Tự động kết nối khi user authenticated */
    autoConnect?: boolean;
}

// ==================== PROVIDER COMPONENT ====================

export function WebSocketProvider({
    children,
    autoConnect = true,
}: WebSocketProviderProps) {
    // State
    const [connected, setConnected] = useState(false);
    const [state, setState] = useState<WebSocketState>(WebSocketState.DISCONNECTED);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const wsServiceRef = useRef<WebSocketService | null>(null);
    const hasInitializedRef = useRef(false);

    // Auth state from Zustand store
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const token = useAuthStore((s) => s.token);

    // ==================== INITIALIZE SERVICE ====================

    useEffect(() => {
        if (!hasInitializedRef.current) {
            wsServiceRef.current = getWebSocketService();
            hasInitializedRef.current = true;

            // Setup listeners
            wsServiceRef.current.onConnected(() => {
                setConnected(true);
                setState(WebSocketState.CONNECTED);
                setError(null);
            });

            wsServiceRef.current.onDisconnected(() => {
                setConnected(false);
                setState(WebSocketState.DISCONNECTED);
            });

            wsServiceRef.current.onError((err) => {
                setError(err);
                setState(WebSocketState.ERROR);
            });
        }
    }, []);

    // ==================== AUTO CONNECT/DISCONNECT ====================

    useEffect(() => {
        if (!autoConnect || !wsServiceRef.current) return;

        if (isAuthenticated && token && !connected) {
            // User logged in → Connect
            wsServiceRef.current.connect(token).catch((err) => {
                logger.ws.error('Auto-connect failed:', err);
            });
        } else if (!isAuthenticated && connected) {
            // User logged out → Disconnect
            wsServiceRef.current.disconnect();
        }
    }, [isAuthenticated, token, autoConnect, connected]);

    // ==================== CLEANUP ON UNMOUNT ====================

    useEffect(() => {
        return () => {
            if (wsServiceRef.current) {
                wsServiceRef.current.disconnect();
            }
        };
    }, []);

    // ==================== METHODS ====================

    const connect = useCallback(async (): Promise<void> => {
        if (!wsServiceRef.current) {
            throw new Error('WebSocket service not initialized');
        }
        setError(null);
        return wsServiceRef.current.connect(token || undefined);
    }, [token]);

    const disconnect = useCallback((): void => {
        if (wsServiceRef.current) {
            wsServiceRef.current.disconnect();
        }
    }, []);

    const subscribe = useCallback(
        (topic: string, callback: MessageCallback): (() => void) => {
            if (!wsServiceRef.current) {
                logger.ws.warn('Service not initialized');
                return () => { };
            }
            return wsServiceRef.current.subscribe(topic, callback);
        },
        []
    );

    const sendMessage = useCallback(
        (destination: string, data: unknown): void => {
            if (!wsServiceRef.current) {
                logger.ws.warn('Service not initialized');
                return;
            }
            wsServiceRef.current.send(destination, data);
        },
        []
    );

    const reconnect = useCallback(async (): Promise<void> => {
        if (!wsServiceRef.current) {
            throw new Error('WebSocket service not initialized');
        }
        return wsServiceRef.current.forceReconnect();
    }, []);

    const subscribeToNotifications = useCallback(
        (callback: MessageCallback): (() => void) => {
            if (!wsServiceRef.current) {
                logger.ws.warn('Service not initialized');
                return () => { };
            }
            return wsServiceRef.current.subscribeToNotifications(callback);
        },
        []
    );

    // ==================== CONTEXT VALUE ====================

    const contextValue: WebSocketContextType = {
        connected,
        state,
        error,
        connect,
        disconnect,
        subscribe,
        sendMessage,
        reconnect,
        subscribeToNotifications,
    };
    return (
        <WebSocketContext.Provider value={contextValue}>
            {children}
        </WebSocketContext.Provider>
    );
}

// ==================== HOOK ====================

/**
 * Hook để sử dụng WebSocket context
 * @throws Error nếu sử dụng ngoài WebSocketProvider
 */
export function useWebSocketContext(): WebSocketContextType {
    const context = React.useContext(WebSocketContext);
    if (!context) {
        throw new Error(
            'useWebSocketContext must be used within a WebSocketProvider'
        );
    }
    return context;
}

// ==================== CONVENIENCE HOOKS ====================

/**
 * Hook đơn giản để check connection status
 */
export function useWebSocketStatus() {
    const { connected, state, error } = useWebSocketContext();
    return { connected, state, error };
}

/**
 * Hook để subscribe notifications với auto-cleanup
 */
export function useNotificationSocket(
    onNotification: MessageCallback,
    enabled = true
) {
    const { connected, subscribeToNotifications } = useWebSocketContext();

    useEffect(() => {
        if (!enabled || !connected) return;

        const unsubscribe = subscribeToNotifications(onNotification);
        return unsubscribe;
    }, [enabled, connected, subscribeToNotifications, onNotification]);
}
