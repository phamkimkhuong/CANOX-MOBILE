export const WEBSOCKET_CONFIG = {
    // Endpoint - thay bằng URL thực tế
    endpoint: 'wss://api.calatha.com/ws/chat',

    // Connection settings
    connection: {
        connectTimeout: 10000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        reconnectDelay: 5000,
        maxReconnectAttempts: 5,
    },

    // Topics
    topics: {
        notifications: '/user/queue/notifications',
    },
};
