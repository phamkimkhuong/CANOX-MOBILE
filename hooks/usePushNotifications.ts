import { mmkvStorage } from '@/store/storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Key save push token on MMKV
const PUSH_TOKEN_KEY = 'expo_push_token';

// Config notification when app is open
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
 * Get push token saved on MMKV
 */
export function getSavedPushToken(): string | null {
    return mmkvStorage.getString(PUSH_TOKEN_KEY) ?? null;
}

/**
 * Save push token on MMKV
 */
function savePushToken(token: string): void {
    mmkvStorage.set(PUSH_TOKEN_KEY, token);
}

/**
 * Clear push token on MMKV (when logout)
 */
export function clearPushToken(): void {
    mmkvStorage.remove(PUSH_TOKEN_KEY);
}

/**
 * Check if token has changed compared to the last saved token
 */
function hasTokenChanged(newToken: string): boolean {
    const savedToken = getSavedPushToken();
    return savedToken !== newToken;
}

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const [tokenChanged, setTokenChanged] = useState(false);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        // Register for push token
        registerForPushNotificationsAsync().then(token => {
            if (token) {
                setExpoPushToken(token);

                // Check if token has changed
                const changed = hasTokenChanged(token);
                setTokenChanged(changed);

                // Always save the latest token
                savePushToken(token);
            }
        });

        // Listen when notification received (app is open)
        notificationListener.current = Notifications.addNotificationReceivedListener(notif => {
            setNotification(notif);
            console.log('Notification received:', notif.request.content.title);
        });

        // Listen when user tap on notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification tapped:', response.notification.request.content.title);
            // TODO: Handle navigation based on data in notification
            const data = response.notification.request.content.data;
            console.log('Notification data:', data);
            // Example: router.push(data.screen);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        expoPushToken,
        notification,
        /**
         * Return true if token has changed compared to the last saved token
         * Use to determine whether to send token to server or not
         */
        tokenChanged,
    };
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
        console.log('Push notifications only work on physical devices');
        return null;
    }

    // Configure channels for Android
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
            vibrationPattern: [0, 500, 200, 500], // Rung mạnh hơn cho đơn hàng
            lightColor: '#FFD700', // Màu vàng Gold
        });
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permission for push notifications was denied');
        return null;
    }

    // Get Expo Push Token
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) {
            console.error('Project ID not found in app config');
            return null;
        }
        const token = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
        return token.data;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}