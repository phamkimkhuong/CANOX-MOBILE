import { orderRoutes, productRoutes } from '@/constants/routes';
import { mmkvStorage } from '@/store/storage';
import { useAuthStore } from '@/store/useAuthStore';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import notifee, { AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import {
    AuthorizationStatus,
    unsubscribeFromTopic as fcmUnsubscribeFromTopic,
    FirebaseMessagingTypes,
    getInitialNotification,
    getMessaging,
    getToken,
    hasPermission,
    onMessage,
    onNotificationOpenedApp,
    onTokenRefresh,
    requestPermission,
    setBackgroundMessageHandler,
    subscribeToTopic,
} from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Key save push token on MMKV
const FCM_TOKEN_KEY = 'fcm_push_token';

// Sync with STORAGE_KEYS from notification settings screen
const NOTIFY_STORAGE_KEYS = {
    PROMOTIONS: 'notify_promotions',
    NEWS: 'notify_news',
    ORDERS: 'notify_orders',
    CHAT: 'notify_chat',
};

/**
 * Get FCM token saved on MMKV
 */
export function getSavedPushToken(): string | null {
    return mmkvStorage.getString(FCM_TOKEN_KEY) ?? null;
}

/**
 * Save FCM token on MMKV
 */
function savePushToken(token: string): void {
    mmkvStorage.set(FCM_TOKEN_KEY, token);
}

/**
 * Clear FCM token on MMKV (when logout)
 */
export function clearPushToken(): void {
    mmkvStorage.remove(FCM_TOKEN_KEY);
}

/**
 * Check if token has changed compared to the last saved token
 */
function hasTokenChanged(newToken: string): boolean {
    const savedToken = getSavedPushToken();
    return savedToken !== newToken;
}

/**
 * FCM Topics để subscribe
 * Mobile sẽ subscribe vào các topic này để nhận broadcast notifications
 */
export const FCM_TOPICS = {
    /** Tất cả users - dùng cho broadcast chung */
    ALL_USERS: 'all_users',
    /** Khuyến mãi, Flash Sale */
    PROMOTIONS: 'promotions',
    /** Tin tức, cập nhật */
    NEWS: 'news',
} as const;

/**
 * Đăng ký xử lý sự kiện Background của Notifee
 * Phải đặt ở ngoài Hook và gọi càng sớm càng tốt
 */
notifee.onBackgroundEvent(async ({ type, detail }) => {
    logger.push.info('Notifee Background Event:', { type, detail });

    if (type === EventType.PRESS) {
        // Lưu ý: Navigation thực tế sẽ được xử lý khi App mở lên thông qua onNotificationOpenedApp hoặc getInitialNotification
        logger.push.info('User pressed notification in background');
    }
});

/**
 * Đăng ký xử lý tin nhắn FCM Background
 */
setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
    logger.push.info('FCM Background message received:', remoteMessage);

    const isOrder = remoteMessage.data?.type === 'ORDER' || remoteMessage.notification?.title?.includes('Đơn hàng');
    const isChat = remoteMessage.data?.type === 'CHAT' || remoteMessage.notification?.title?.includes('Tin nhắn');

    // Client-side filtering check
    if (isOrder && !mmkvStorage.getBoolean(NOTIFY_STORAGE_KEYS.ORDERS)) {
        logger.push.info('Order notification suppressed by user settings');
        return;
    }
    if (isChat && !mmkvStorage.getBoolean(NOTIFY_STORAGE_KEYS.CHAT)) {
        logger.push.info('Chat notification suppressed by user settings');
        return;
    }

    // Hiển thị thông báo bằng Notifee nếu cần (FCM Data messages)
    if (remoteMessage.notification) {
        await notifee.displayNotification({
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            android: {
                channelId: remoteMessage.data?.channelId as string || 'default',
                importance: AndroidImportance.HIGH,
                pressAction: { id: 'default' },
            },
            data: remoteMessage.data,
        });
    }
});

export function usePushNotifications() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);
    const [tokenChanged, setTokenChanged] = useState(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setFcmToken(null);
            return;
        }

        // Get token if permission already granted
        const checkAndGetToken = async () => {
            const messaging = getMessaging();
            const authStatus = await hasPermission(messaging);

            if (authStatus === AuthorizationStatus.AUTHORIZED || authStatus === AuthorizationStatus.PROVISIONAL) {
                const token = await getToken(messaging);
                if (token) {
                    setFcmToken(token);
                    const changed = hasTokenChanged(token);
                    setTokenChanged(changed);
                    savePushToken(token);
                    await subscribeToTopics();
                }
            }
        };

        checkAndGetToken();

        const messaging = getMessaging();

        // Listen to notification when app is open
        unsubscribeRef.current = onMessage(messaging, async remoteMessage => {
            logger.push.info('FCM Notification received (foreground):', remoteMessage);
            setNotification(remoteMessage);

            const isOrder = remoteMessage.data?.type === 'ORDER' || remoteMessage.notification?.title?.includes('Đơn hàng');
            const isChat = remoteMessage.data?.type === 'CHAT' || remoteMessage.notification?.title?.includes('Tin nhắn');

            // Client-side filtering check
            if (isOrder && !mmkvStorage.getBoolean(NOTIFY_STORAGE_KEYS.ORDERS)) return;
            if (isChat && !mmkvStorage.getBoolean(NOTIFY_STORAGE_KEYS.CHAT)) return;

            if (remoteMessage.notification) {
                await notifee.displayNotification({
                    title: remoteMessage.notification.title,
                    body: remoteMessage.notification.body,
                    android: {
                        channelId: remoteMessage.data?.channelId as string || 'default',
                        importance: AndroidImportance.HIGH,
                        pressAction: { id: 'default' },
                    },
                    data: remoteMessage.data,
                });
            }
        });

        // ... (keep other listeners)
        const unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
                if (detail.notification?.data) {
                    handleNotificationNavigation(detail.notification as FirebaseMessagingTypes.RemoteMessage);
                }
            }
        });

        const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(messaging, remoteMessage => {
            handleNotificationNavigation(remoteMessage);
        });

        getInitialNotification(messaging).then(remoteMessage => {
            if (remoteMessage) handleNotificationNavigation(remoteMessage);
        });

        const unsubscribeTokenRefresh = onTokenRefresh(messaging, newToken => {
            setFcmToken(newToken);
            setTokenChanged(true);
            savePushToken(newToken);
        });

        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
            if (unsubscribeNotifeeForeground) unsubscribeNotifeeForeground();
            if (unsubscribeOnNotificationOpenedApp) unsubscribeOnNotificationOpenedApp();
            if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
        };
    }, [isAuthenticated]);

    /**
     * Hàm chủ động xin quyền từ UI
     */
    const requestPermission = async () => {
        try {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                setFcmToken(token);
                setTokenChanged(true);
                savePushToken(token);
                await subscribeToTopics();
                return true;
            }
            return false;
        } catch (error) {
            logger.push.error('Manual permission request failed:', error);
            return false;
        }
    };

    return {
        fcmToken,
        notification,
        tokenChanged,
        requestPermission, // Trả về hàm để UI gọi
    };
}

/**
 * Handle navigation khi user bấm vào notification
 */
function handleNotificationNavigation(message: FirebaseMessagingTypes.RemoteMessage) {
    const data = message.data;
    if (!data) return;

    logger.push.info('Handling navigation for notification data:', data);

    try {
        // 1. Nếu là thông báo đơn hàng
        if (data.type === 'ORDER' && data.orderId) {
            Navigator.push(orderRoutes.detail(data.orderId as string));
            return;
        }

        // 2. Nếu là thông báo khuyến mãi sản phẩm
        if (data.type === 'PRODUCT' && data.productId) {
            Navigator.push(productRoutes.detail(data.productId as string));
            return;
        }

        // 3. Điều hướng linh hoạt theo màn hình chỉ định
        if (typeof data.screen === 'string') {
            Navigator.push(data.screen);
            return;
        }

        // 4. Mặc định vào danh sách thông báo nếu không rõ loại
        Navigator.push('/(main)/(user)/settings/notifications');
    } catch (error) {
        logger.push.error('Failed to handle notification navigation:', error);
    }
}

/**
 * Subscribe to FCM topics
 */
async function subscribeToTopics(): Promise<void> {
    try {
        const messaging = getMessaging();
        // Chỉ subscribe vào các topic mang tính hệ thống/bắt buộc
        await subscribeToTopic(messaging, FCM_TOPICS.ALL_USERS);
        logger.push.info('Subscribed to system topic:', FCM_TOPICS.ALL_USERS);

        // Topic PROMOTIONS sẽ để user tự bật trong màn hình Settings sau này
    } catch (error) {
        logger.push.error('Error subscribing to topics:', error);
    }
}

/**
 * Unsubscribe from a topic
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
    try {
        const messaging = getMessaging();
        await fcmUnsubscribeFromTopic(messaging, topic);
        logger.push.info('Unsubscribed from topic:', topic);
    } catch (error) {
        logger.push.error('Error unsubscribing from topic:', error);
    }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        logger.push.info('Push notifications only work on physical devices');
        return null;
    }

    // iOS: Request permission qua messaging()
    if (Platform.OS === 'ios') {
        const messaging = getMessaging();
        const authStatus = await requestPermission(messaging);
        const enabled =
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
            logger.push.info('Permission for push notifications was denied on iOS');
            return null;
        }
    }

    // Android: Create channels and request permission
    if (Platform.OS === 'android') {
        // Request permission cho Android 13+
        await notifee.requestPermission();

        // Channel Mặc định
        await notifee.createChannel({
            id: 'default',
            name: 'Thông báo chung',
            importance: AndroidImportance.HIGH,
            visibility: AndroidVisibility.PUBLIC,
        });

        // Channel Đơn hàng
        await notifee.createChannel({
            id: 'orders',
            name: 'Đơn hàng',
            importance: AndroidImportance.HIGH,
            sound: 'default',
            vibration: true,
        });

        // Channel Khuyến mãi
        await notifee.createChannel({
            id: 'promotions',
            name: 'Khuyến mãi',
            importance: AndroidImportance.DEFAULT,
        });
    }

    // Get FCM Token
    try {
        const messaging = getMessaging();
        const token = await getToken(messaging);
        logger.push.info('FCM Token:', token);
        return token;
    } catch (error) {
        logger.push.error('Error getting FCM token:', error);
        return null;
    }
}