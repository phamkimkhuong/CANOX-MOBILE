import { orderRoutes, productRoutes } from '@/constants/routes';
import { mmkvStorage } from '@/store/storage';
import { useAuthStore } from '@/store/useAuthStore';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
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
import * as Notifications from 'expo-notifications';
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

// Notification channel IDs
const CHANNELS = {
    DEFAULT: 'default',
    ORDERS: 'orders',
    PROMOTIONS: 'promotions',
} as const;

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
 * Cấu hình foreground handler cho expo-notifications
 * Khi app đang mở, notification sẽ hiện banner + sound
 */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Setup Android notification channels
 * Âm thầm, không cần xin quyền user
 */
async function setupNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    // Channel Mặc định
    await Notifications.setNotificationChannelAsync(CHANNELS.DEFAULT, {
        name: 'Thông báo chung',
        importance: Notifications.AndroidImportance.HIGH,
        enableVibrate: true,
    });

    // Channel Đơn hàng
    await Notifications.setNotificationChannelAsync(CHANNELS.ORDERS, {
        name: 'Đơn hàng',
        description: 'Thông báo về đơn hàng mới, cập nhật trạng thái',
        importance: Notifications.AndroidImportance.HIGH,
        enableVibrate: true,
    });

    // Channel Khuyến mãi
    await Notifications.setNotificationChannelAsync(CHANNELS.PROMOTIONS, {
        name: 'Khuyến mãi',
        description: 'Flash sale, chương trình khuyến mãi',
        importance: Notifications.AndroidImportance.DEFAULT,
    });
}

/**
 * Hiển thị notification
 */
async function displayLocalNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
    const channelId = (remoteMessage.data?.channelId as string) || CHANNELS.DEFAULT;

    await Notifications.scheduleNotificationAsync({
        content: {
            title: remoteMessage.notification?.title ?? undefined,
            body: remoteMessage.notification?.body ?? undefined,
            data: (remoteMessage.data as Record<string, unknown>) ?? {},
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(),
            channelId,
        },
    });
}

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

    // Hiển thị thông báo
    if (remoteMessage.notification) {
        await displayLocalNotification(remoteMessage);
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

        // Setup Android channels khi khởi tạo (âm thầm, không popup)
        void setupNotificationChannels();

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

        // Listen to notification when app is open (foreground)
        unsubscribeRef.current = onMessage(messaging, async remoteMessage => {
            logger.push.info('FCM Notification received (foreground):', remoteMessage);
            setNotification(remoteMessage);

            const isOrder = remoteMessage.data?.type === 'ORDER' || remoteMessage.notification?.title?.includes('Đơn hàng');
            const isChat = remoteMessage.data?.type === 'CHAT' || remoteMessage.notification?.title?.includes('Tin nhắn');

            // Client-side filtering check
            if (isOrder && !mmkvStorage.getBoolean(NOTIFY_STORAGE_KEYS.ORDERS)) return;
            if (isChat && !mmkvStorage.getBoolean(NOTIFY_STORAGE_KEYS.CHAT)) return;

            if (remoteMessage.notification) {
                await displayLocalNotification(remoteMessage);
            }
        });

        // Handle notification tap khi user bấm vào notification
        const notificationResponseSubscription =
            Notifications.addNotificationResponseReceivedListener((response) => {
                const data = response.notification.request.content.data as
                    FirebaseMessagingTypes.RemoteMessage['data'] | undefined;
                if (data) {
                    handleNotificationNavigation({ data } as FirebaseMessagingTypes.RemoteMessage);
                }
            });

        // Handle notification tap when app was killed
        const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(messaging, remoteMessage => {
            handleNotificationNavigation(remoteMessage);
        });

        // Check if app was opened from a notification (cold start)
        getInitialNotification(messaging).then(remoteMessage => {
            if (remoteMessage) handleNotificationNavigation(remoteMessage);
        });

        // Listen for token refresh
        const unsubscribeTokenRefresh = onTokenRefresh(messaging, newToken => {
            setFcmToken(newToken);
            setTokenChanged(true);
            savePushToken(newToken);
        });

        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
            notificationResponseSubscription.remove();
            if (unsubscribeOnNotificationOpenedApp) unsubscribeOnNotificationOpenedApp();
            if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
        };
    }, [isAuthenticated]);

    /**
     * Hàm chủ động xin quyền từ UI
     */
    const requestNotificationPermission = async () => {
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
        requestPermission: requestNotificationPermission,
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

    // iOS: Request permission
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

    // Android: Request permission + setup channels
    if (Platform.OS === 'android') {
        // Request permission cho Android 13+
        await Notifications.requestPermissionsAsync();

        // Setup channels (idempotent, safe to call multiple times)
        await setupNotificationChannels();
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