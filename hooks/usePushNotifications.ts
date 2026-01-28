import { mmkvStorage } from '@/store/storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

// Key save push token on MMKV
const FCM_TOKEN_KEY = 'fcm_push_token';

// Config notification when app is open (vẫn dùng expo-notifications cho local notifications)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

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
        // Register for push token
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setFcmToken(token);

                // Check if token has changed
                const changed = hasTokenChanged(token);
                setTokenChanged(changed);

                // Always save the latest token
                savePushToken(token);
            }
        });

        // Subscribe to topics for broadcast notifications
        subscribeToTopics();

        // Listen when notification received (app is FOREGROUND)
        // FCM không tự hiển thị notification khi app đang mở, cần xử lý thủ công
        unsubscribeRef.current = messaging().onMessage(async remoteMessage => {
            console.log('FCM Notification received (foreground):', remoteMessage);
            setNotification(remoteMessage);

            // Hiển thị local notification khi app đang mở
            if (remoteMessage.notification) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: remoteMessage.notification.title ?? '',
                        body: remoteMessage.notification.body ?? '',
                        data: remoteMessage.data,
                    },
                    trigger: null, // Hiển thị ngay lập tức
                });
            }
        });

        // Listen when user tap on notification (app is BACKGROUND)
        const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('FCM Notification tapped (background):', remoteMessage);
            handleNotificationNavigation(remoteMessage);
        });

        // Check if app was opened from notification (app was QUIT)
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('FCM App opened from notification (quit state):', remoteMessage);
                    handleNotificationNavigation(remoteMessage);
                }
            });

        // Listen for token refresh
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(newToken => {
            console.log('FCM Token refreshed:', newToken);
            setFcmToken(newToken);
            setTokenChanged(true);
            savePushToken(newToken);
        });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
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
 * Handle navigation when user taps on notification
 */
function handleNotificationNavigation(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
    const data = remoteMessage.data;
    console.log('Notification data:', data);

    // TODO: Handle navigation based on data
    // Example: router.push(data?.screen as string);

    if (data?.orderId) {
        // Navigate to order detail
        // router.push(`/orders/${data.orderId}`);
    }

    if (data?.productId) {
        // Navigate to product detail
        // router.push(`/products/${data.productId}`);
    }
}

/**
 * Subscribe to FCM topics for broadcast notifications
 */
async function subscribeToTopics(): Promise<void> {
    try {
        // Subscribe to all_users topic for general broadcasts
        await messaging().subscribeToTopic(FCM_TOPICS.ALL_USERS);
        console.log('Subscribed to topic:', FCM_TOPICS.ALL_USERS);

        // Subscribe to promotions topic (user có thể unsubscribe sau)
        await messaging().subscribeToTopic(FCM_TOPICS.PROMOTIONS);
        console.log('Subscribed to topic:', FCM_TOPICS.PROMOTIONS);
    } catch (error) {
        console.error('Error subscribing to topics:', error);
    }
}

/**
 * Unsubscribe from a topic (when user turns off notification settings)
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
    try {
        await messaging().unsubscribeFromTopic(topic);
        console.log('Unsubscribed from topic:', topic);
    } catch (error) {
        console.error('Error unsubscribing from topic:', error);
    }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
    }

    // Configure channels for Android (vẫn dùng expo-notifications)
    if (Platform.OS === 'android') {
        // Channel mặc định
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Thông báo chung',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });

        // Channel riêng cho Đơn hàng
        await Notifications.setNotificationChannelAsync('orders', {
            name: 'Đơn hàng',
            description: 'Thông báo về tình trạng đơn hàng của bạn',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 200, 500],
            lightColor: '#FFD700',
        });

        // Channel cho Khuyến mãi
        await Notifications.setNotificationChannelAsync('promotions', {
            name: 'Khuyến mãi',
            description: 'Thông báo về khuyến mãi và ưu đãi',
            importance: Notifications.AndroidImportance.HIGH,
        });
    }

    // Request permission
    let hasPermission = false;

    if (Platform.OS === 'ios') {
        // iOS: Dùng FCM requestPermission
        const authStatus = await messaging().requestPermission();
        hasPermission =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } else if (Platform.OS === 'android') {
        // Android 13+: Cần xin quyền POST_NOTIFICATIONS
        if (Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
            // Android < 13: Tự động có quyền
            hasPermission = true;
        }
    }

    if (!hasPermission) {
        console.log('Permission for push notifications was denied');
        return null;
    }

    // Get FCM Token
    try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}