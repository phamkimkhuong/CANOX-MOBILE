import type { DeviceInfo, PushTokenPayload } from '@/types/pushToken';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';

/**
 * Get unique device identifier
 * Uses different methods for Android and iOS
 */
async function getDeviceId(): Promise<string> {
    if (Platform.OS === 'android') {
        // Android: Use Android ID (persists across app reinstalls)
        const androidId = Application.getAndroidId();
        if (androidId) return androidId;
    }

    if (Platform.OS === 'ios') {
        // iOS: Use identifierForVendor (changes if all apps from vendor are uninstalled)
        const iosId = await Application.getIosIdForVendorAsync();
        if (iosId) return iosId;
    }

    // Fallback: Use OS build ID
    return Device.osBuildId ?? `unknown-${Date.now()}`;
}

/**
 * Get human-readable device name
 */
function getDeviceName(): string | null {
    // Device.deviceName returns user's custom name (e.g., "John's iPhone")
    // Device.modelName returns model (e.g., "iPhone 15 Pro")
    return Device.deviceName ?? Device.modelName ?? null;
}

/**
 * Get OS version string
 * e.g., "Android 14", "iOS 17.2"
 */
function getOsVersion(): string | null {
    if (Device.osName && Device.osVersion) {
        return `${Device.osName} ${Device.osVersion}`;
    }
    return Device.osVersion ?? null;
}

/**
 * Get app version
 * e.g., "1.0.0"
 */
function getAppVersion(): string | null {
    return Application.nativeApplicationVersion ?? null;
}

/**
 * Get device locale
 * e.g., "vi-VN", "en-US"
 */
function getLocale(): string {
    const locales = getLocales();
    // getLocales() returns at least one locale
    return locales[0]?.languageTag ?? 'en-US';
}

/**
 * Collect all device information
 * Call this when preparing to register push token
 */
export async function collectDeviceInfo(): Promise<DeviceInfo> {
    const deviceId = await getDeviceId();

    return {
        deviceId,
        deviceName: getDeviceName(),
        platform: (Platform.OS.toUpperCase()) as 'ANDROID' | 'IOS',
        appVersion: getAppVersion(),
        osVersion: getOsVersion(),
        locale: getLocale(),
    };
}

/**
 * Build the full payload to send to backend
 * Combines push token with device info
 */
export async function buildPushTokenPayload(
    token: string
): Promise<PushTokenPayload> {
    const deviceInfo = await collectDeviceInfo();

    return {
        ...deviceInfo,
        token,
    };
}
