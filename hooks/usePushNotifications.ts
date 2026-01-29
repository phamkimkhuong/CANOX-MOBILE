import { mmkvStorage } from '@/store/storage';
import notifee, { AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import {
    AuthorizationStatus,
    unsubscribeFromTopic as fcmUnsubscribeFromTopic,
    FirebaseMessagingTypes,
    getInitialNotification,
    getMessaging,
    getToken,
    onMessage,
    onNotificationOpenedApp,
    onTokenRefresh,
    requestPermission,
    subscribeToTopic,
} from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Key save push token on MMKV
const FCM_TOKEN_KEY = 'fcm_push_token';

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

export function usePushNotifications() {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);
    const [tokenChanged, setTokenChanged] = useState(false);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Register for push token and setup notifications
        const setup = async () => {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                setFcmToken(token);
                // Check if token has changed
                const changed = hasTokenChanged(token);
                setTokenChanged(changed);
                // Always save the latest token
                savePushToken(token);
            }

            // Subscribe to topics
            await subscribeToTopics();
        };

        setup();

        const messaging = getMessaging();

        // Listen when notification received (app is FOREGROUND)
        // Dùng Notifee để hiển thị Heads-up notification
        unsubscribeRef.current = onMessage(messaging, async remoteMessage => {
            console.log('FCM Notification received (foreground):', remoteMessage);
            setNotification(remoteMessage);

            // Nếu là tin nhắn chat, hiện Banner (Heads-up)
            // Nếu là quảng cáo, chỉ cập nhật badge (Notifee hỗ trợ tốt việc này)
            // Nếu đang ở màn hình Checkout, có thể lọc không hiện tin quảng cáo

            if (remoteMessage.notification) {
                // Hiển thị notification qua Notifee
                await notifee.displayNotification({
                    title: remoteMessage.notification.title,
                    body: remoteMessage.notification.body,
                    android: {
                        channelId: remoteMessage.data?.channelId as string || 'default',
                        // Giúp hiện banner ngay cả khi đang mở app
                        importance: AndroidImportance.HIGH,
                        pressAction: {
                            id: 'default',
                        },
                    },
                    data: remoteMessage.data,
                });
            }
        });

        // Notifee Foreground Event Listener (Khi user bấm vào banner lúc app đang mở)
        const unsubscribeNotifeeForeground = notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) {
                console.log('User pressed notification in foreground', detail.notification);
                if (detail.notification?.data) {
                    handleNotificationNavigation(detail.notification as any);
                }
            }
        });

        // Listen when user tap on notification (app is BACKGROUND)
        const unsubscribeOnNotificationOpenedApp = onNotificationOpenedApp(messaging, remoteMessage => {
            console.log('FCM Notification tapped (background):', remoteMessage);
            handleNotificationNavigation(remoteMessage);
        });

        // Check if app was opened from notification (app was QUIT)
        getInitialNotification(messaging)
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('FCM App opened from notification (quit state):', remoteMessage);
                    handleNotificationNavigation(remoteMessage);
                }
            });

        // Listen for token refresh
        const unsubscribeTokenRefresh = onTokenRefresh(messaging, newToken => {
            console.log('FCM Token refreshed:', newToken);
            setFcmToken(newToken);
            setTokenChanged(true);
            savePushToken(newToken);
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
            unsubscribeNotifeeForeground();
            unsubscribeOnNotificationOpenedApp();
            unsubscribeTokenRefresh();
        };
    }, []);

    return {
        /** FCM Token - gửi lên Backend để nhận notification cá nhân */
        fcmToken,
        /** Notification vừa nhận được */
        notification,
        /**
         * Return true if token has changed compared to the last saved token
         * Use to determine whether to send token to server or not
         */
        tokenChanged,
    };
}

/**
 * Handle navigation khi user bấm vào notification
 */
function handleNotificationNavigation(message: FirebaseMessagingTypes.RemoteMessage) {
    const data = message.data;
    if (!data) return;

    console.log('Handling navigation for notification data:', data);

    // TODO: Thực hiện điều hướng dựa trên data.screen, data.productId, v.v.
    // Ví dụ: router.push(data.screen);
}

/**
 * Subscribe to FCM topics
 */
async function subscribeToTopics(): Promise<void> {
    try {
        const messaging = getMessaging();
        await subscribeToTopic(messaging, FCM_TOPICS.ALL_USERS);
        console.log('Subscribed to topic:', FCM_TOPICS.ALL_USERS);

        await subscribeToTopic(messaging, FCM_TOPICS.PROMOTIONS);
        console.log('Subscribed to topic:', FCM_TOPICS.PROMOTIONS);
    } catch (error) {
        console.error('Error subscribing to topics:', error);
    }
}

/**
 * Unsubscribe from a topic
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
    try {
        const messaging = getMessaging();
        await fcmUnsubscribeFromTopic(messaging, topic);
        console.log('Unsubscribed from topic:', topic);
    } catch (error) {
        console.error('Error unsubscribing from topic:', error);
    }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
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
            console.log('Permission for push notifications was denied on iOS');
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
        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}