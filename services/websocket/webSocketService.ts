/**
 * WebSocket Service for React Native
 * Use @stomp/stompjs to connect with Spring Boot STOMP WebSocket
 * 
 * Features:
 * - Singleton pattern
 * - Auto reconnect
 * - STOMP protocol support
 * - Error handling
 */

import { WEBSOCKET_CONFIG } from '@/constants/webSocket.config';
import { logger } from '@/utils/logger';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import * as SecureStore from 'expo-secure-store';

// Token key in SecureStore
const AUTH_TOKEN_KEY = 'auth_token';

// Connection state enum
export enum WebSocketState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    RECONNECTING = 'RECONNECTING',
    ERROR = 'ERROR',
}

// Callback type
export type MessageCallback = (message: unknown) => void;

// Interface for parsed message
export interface WebSocketEventData<T = unknown> {
    type: string;
    data: T;
    timestamp?: string;
    conversationId?: string;
    userId?: string;
}

/**
 * WebSocket Service Class
 * Singleton pattern to ensure only 1 connection
 */
export class WebSocketService {
    // Singleton instance
    private static instance: WebSocketService;

    // STOMP Client
    private stompClient: Client | null = null;

    // Connection state
    private state: WebSocketState = WebSocketState.DISCONNECTED;
    private connected = false;

    // Subscriptions management
    private subscriptions: Map<string, StompSubscription> = new Map();

    // Reconnection
    private reconnectAttempts = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    // Callbacks for state changes
    private onConnectedCallbacks: Set<() => void> = new Set();
    private onDisconnectedCallbacks: Set<() => void> = new Set();
    private onErrorCallbacks: Set<(error: string) => void> = new Set();

    /**
     * Private constructor to enforce singleton
     */
    private constructor() {
        logger.ws.info('Instance created');
    }

    /**
     * Get singleton instance
     */
    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    /**
     * Connect WebSocket
     * @param token - JWT token for authentication (optional, will get from SecureStore if not provided)
     */
    async connect(token?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const connectLogic = async () => {
                try {
                    // Prevent duplicate connections
                    if (this.state === WebSocketState.CONNECTED && this.connected) {
                        logger.ws.info('Already connected, skipping');
                        resolve();
                        return;
                    }

                    if (this.state === WebSocketState.CONNECTING) {
                        logger.ws.info('Connection in progress, skipping');
                        resolve();
                        return;
                    }

                    this.state = WebSocketState.CONNECTING;
                    logger.ws.info('Connecting...');

                    // Get token from SecureStore if not provided
                    let authToken = token;
                    if (!authToken) {
                        authToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY) || undefined;
                    }

                    // Create WebSocket URL with token (if any)
                    const wsUrl = authToken
                        ? `${WEBSOCKET_CONFIG.endpoint}?token=${encodeURIComponent(authToken)}`
                        : WEBSOCKET_CONFIG.endpoint;

                    // Tạo STOMP Client
                    this.stompClient = new Client({
                        brokerURL: wsUrl,

                        // Debug (only enable in development)
                        debug: __DEV__ ? (str) => logger.ws.debug(str) : () => { },

                        // Heartbeat settings
                        heartbeatIncoming: WEBSOCKET_CONFIG.connection.heartbeatIncoming,
                        heartbeatOutgoing: WEBSOCKET_CONFIG.connection.heartbeatOutgoing,

                        // Reconnect settings
                        reconnectDelay: WEBSOCKET_CONFIG.connection.reconnectDelay,

                        // Connection headers (backup authentication via STOMP headers)
                        connectHeaders: authToken
                            ? { Authorization: `Bearer ${authToken}` }
                            : {},

                        // Callbacks
                        onConnect: (frame) => {
                            logger.ws.info('Connected!', frame);
                            this.connected = true;
                            this.state = WebSocketState.CONNECTED;
                            this.reconnectAttempts = 0;

                            // Clear reconnect timer
                            if (this.reconnectTimer) {
                                clearTimeout(this.reconnectTimer);
                                this.reconnectTimer = null;
                            }

                            // Notify callbacks
                            this.onConnectedCallbacks.forEach((cb) => cb());

                            resolve();
                        },

                        onDisconnect: (frame) => {
                            logger.ws.info('Disconnected', frame);
                            this.connected = false;
                            this.state = WebSocketState.DISCONNECTED;

                            // Notify callbacks
                            this.onDisconnectedCallbacks.forEach((cb) => cb());
                        },

                        onStompError: (frame) => {
                            const errorMessage = frame.headers['message'] || 'Unknown STOMP error';
                            logger.ws.error('STOMP Error:', errorMessage);
                            this.state = WebSocketState.ERROR;

                            // Notify error callbacks
                            this.onErrorCallbacks.forEach((cb) => cb(errorMessage));

                            // Handle specific errors
                            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                                reject(new Error('Authentication failed'));
                                return;
                            }

                            // Attempt reconnection for other errors
                            this.handleReconnection();
                        },

                        onWebSocketError: (event) => {
                            logger.ws.error('WebSocket Error:', event);
                            this.state = WebSocketState.ERROR;
                            this.onErrorCallbacks.forEach((cb) => cb('WebSocket connection error'));
                        },

                        onWebSocketClose: (event) => {
                            logger.ws.info('WebSocket Closed:', event);
                            this.connected = false;

                            // Auto reconnect if not intentional disconnect
                            if (this.state !== WebSocketState.DISCONNECTED) {
                                this.handleReconnection();
                            }
                        },
                    });

                    // Connection timeout
                    const connectTimeout = setTimeout(() => {
                        if (this.state === WebSocketState.CONNECTING) {
                            logger.ws.error('Connection timeout');
                            this.state = WebSocketState.ERROR;
                            reject(new Error('Connection timeout'));
                        }
                    }, WEBSOCKET_CONFIG.connection.connectTimeout);

                    // Activate connection
                    this.stompClient.activate();

                    // Clear timeout on success (handled in onConnect)
                    this.stompClient.onConnect = (frame) => {
                        clearTimeout(connectTimeout);
                        this.connected = true;
                        this.state = WebSocketState.CONNECTED;
                        this.reconnectAttempts = 0;
                        this.onConnectedCallbacks.forEach((cb) => cb());
                        resolve();
                    };

                } catch (error) {
                    logger.ws.error('Connect error:', error);
                    this.state = WebSocketState.ERROR;
                    reject(error);
                }
            };

            connectLogic();
        });
    }

    /**
     * Handle reconnection logic
     */
    private handleReconnection(): void {
        if (this.reconnectAttempts >= WEBSOCKET_CONFIG.connection.maxReconnectAttempts) {
            logger.ws.error('Max reconnect attempts reached');
            this.state = WebSocketState.ERROR;
            return;
        }

        this.reconnectAttempts++;
        this.state = WebSocketState.RECONNECTING;

        logger.ws.info(
            `Reconnecting... (${this.reconnectAttempts}/${WEBSOCKET_CONFIG.connection.maxReconnectAttempts})`
        );

        this.reconnectTimer = setTimeout(() => {
            this.connect().catch((error) => {
                logger.ws.error('Reconnection failed:', error);
            });
        }, WEBSOCKET_CONFIG.connection.reconnectDelay);
    }

    /**
     * Disconnect WebSocket
     */
    disconnect(): void {
        logger.ws.info('Disconnecting...');

        // Clear reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Unsubscribe all
        this.subscriptions.forEach((subscription, topic) => {
            try {
                subscription.unsubscribe();
                logger.ws.debug(`Unsubscribed from ${topic}`);
            } catch (error) {
                logger.ws.error(`Error unsubscribing from ${topic}:`, error);
            }
        });
        this.subscriptions.clear();

        // Deactivate STOMP client
        if (this.stompClient) {
            try {
                this.stompClient.deactivate();
            } catch (error) {
                logger.ws.error('Error deactivating client:', error);
            }
        }

        this.connected = false;
        this.state = WebSocketState.DISCONNECTED;
        this.reconnectAttempts = 0;

        logger.ws.info('Disconnected');
    }

    /**
     * Subscribe to a topic
     * @param topic - STOMP topic (e.g., /user/queue/notifications)
     * @param callback - Callback function when receiving message
     * @returns Unsubscribe function
     */
    subscribe(topic: string, callback: MessageCallback): () => void {
        if (!this.connected || !this.stompClient) {
            logger.ws.warn('Not connected, cannot subscribe to', topic);
            return () => { };
        }

        // Check if already subscribed
        if (this.subscriptions.has(topic)) {
            logger.ws.warn('Already subscribed to', topic);
            // Return unsubscribe for existing subscription
            return () => this.unsubscribe(topic);
        }

        try {
            const subscription = this.stompClient.subscribe(topic, (message: IMessage) => {
                try {
                    // Parse message body
                    const parsedData = this.parseMessage(message);
                    if (parsedData) {
                        callback(parsedData);
                    }
                } catch (error) {
                    logger.ws.error('Error parsing message:', error);
                }
            });

            this.subscriptions.set(topic, subscription);
            logger.ws.info(`Subscribed to ${topic}`);

            // Return unsubscribe function
            return () => this.unsubscribe(topic);

        } catch (error) {
            logger.ws.error(`Failed to subscribe to ${topic}:`, error);
            return () => { };
        }
    }

    /**
     * Unsubscribe from a topic
     */
    private unsubscribe(topic: string): void {
        const subscription = this.subscriptions.get(topic);
        if (subscription) {
            try {
                subscription.unsubscribe();
                this.subscriptions.delete(topic);
                logger.ws.debug(`Unsubscribed from ${topic}`);
            } catch (error) {
                logger.ws.error(`Error unsubscribing from ${topic}:`, error);
            }
        }
    }

    /**
     * Send message to a destination
     * @param destination - STOMP destination (e.g., /app/chat/send)
     * @param data - Message data (will be JSON stringified)
     */
    send(destination: string, data: unknown): void {
        if (!this.connected || !this.stompClient) {
            logger.ws.warn('Not connected, cannot send to', destination);
            return;
        }

        try {
            const body = typeof data === 'string' ? data : JSON.stringify(data);
            this.stompClient.publish({
                destination,
                body,
            });

            logger.ws.debug(`Sent to ${destination}:`, data);
        } catch (error) {
            logger.ws.error(`Failed to send to ${destination}:`, error);
        }
    }

    /**
     * Parse incoming STOMP message
     */
    private parseMessage(message: IMessage): WebSocketEventData | null {
        try {
            if (message.body) {
                return JSON.parse(message.body);
            }
            return null;
        } catch (error) {
            logger.ws.error('Failed to parse message:', error, message.body);
            return null;
        }
    }

    // ==================== CONVENIENCE METHODS ====================

    /**
     * Subscribe to notifications topic
     */
    subscribeToNotifications(callback: MessageCallback): () => void {
        return this.subscribe(WEBSOCKET_CONFIG.topics.notifications, callback);
    }

    // ==================== STATE GETTERS ====================

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connected && this.state === WebSocketState.CONNECTED;
    }

    /**
     * Get current state
     */
    getState(): WebSocketState {
        return this.state;
    }

    /**
     * Get reconnect attempts count
     */
    getReconnectAttempts(): number {
        return this.reconnectAttempts;
    }

    /**
     * Get active subscriptions count
     */
    getSubscriptionsCount(): number {
        return this.subscriptions.size;
    }

    /**
     * Get all active subscription topics
     */
    getActiveTopics(): string[] {
        return Array.from(this.subscriptions.keys());
    }

    // ==================== EVENT LISTENERS ====================

    /**
     * Add callback for connection state changes
     */
    onConnected(callback: () => void): () => void {
        this.onConnectedCallbacks.add(callback);
        return () => this.onConnectedCallbacks.delete(callback);
    }

    /**
     * Add callback for disconnection
     */
    onDisconnected(callback: () => void): () => void {
        this.onDisconnectedCallbacks.add(callback);
        return () => this.onDisconnectedCallbacks.delete(callback);
    }

    /**
     * Add callback for errors
     */
    onError(callback: (error: string) => void): () => void {
        this.onErrorCallbacks.add(callback);
        return () => this.onErrorCallbacks.delete(callback);
    }

    // ==================== FORCE ACTIONS ====================

    /**
     * Force reconnection
     */
    async forceReconnect(): Promise<void> {
        logger.ws.info('Force reconnecting...');
        this.disconnect();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.connect();
    }
}

// Export singleton instance getter
export const getWebSocketService = () => WebSocketService.getInstance();
