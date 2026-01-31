import { z } from 'zod';

// ============================================
// PUSH TOKEN - API SCHEMAS
// ============================================

/**
 * Schema for registering/updating push token
 * FE sends this to BE when user logs in
 */
export const RegisterPushTokenRequestSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    platform: z.enum(['ANDROID', 'IOS', 'WEB']),
    deviceName: z.string().nullable().optional(),
    // Keep these as optional if they are still useful for analytics
    deviceId: z.string().optional(),
    appVersion: z.string().nullable().optional(),
    osVersion: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
});

export type RegisterPushTokenRequest = z.infer<typeof RegisterPushTokenRequestSchema>;

/**
 * Schema for push token stored in database
 * BE returns this when querying user devices
 */
export const UserDeviceSchema = z.object({
    id: z.string(),
    userId: z.string(),
    pushToken: z.string(),
    deviceId: z.string(),
    deviceName: z.string().nullable(),
    platform: z.enum(['android', 'ios']),
    appVersion: z.string().nullable(),
    osVersion: z.string().nullable(),
    locale: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type UserDevice = z.infer<typeof UserDeviceSchema>;

/**
 * Schema for listing user's registered devices
 */
export const UserDevicesResponseSchema = z.object({
    devices: z.array(UserDeviceSchema),
    totalCount: z.number(),
});

export type UserDevicesResponse = z.infer<typeof UserDevicesResponseSchema>;

// ============================================
// PUSH TOKEN - UI TYPES
// ============================================

/**
 * Device info collected from the phone
 * Used to build the request payload
 */
export interface DeviceInfo {
    deviceId: string;
    deviceName: string | null;
    platform: 'ANDROID' | 'IOS';
    appVersion: string | null;
    osVersion: string | null;
    locale: string | null;
}

/**
 * Full payload to send to BE
 * Combines push token with device info
 */
export interface PushTokenPayload extends Omit<DeviceInfo, 'platform'> {
    token: string;
    platform: 'ANDROID' | 'IOS' | 'WEB';
}

// ============================================
// NOTIFICATION TYPES (for handling incoming notifications)
// ============================================

/**
 * Data payload received in push notification
 * Server can send custom data to trigger specific actions
 */
export interface NotificationData {
    /** Screen to navigate to when tapped */
    screen?: string;
    /** Order ID if notification is about an order */
    orderId?: string;
    /** Product ID if notification is about a product */
    productId?: string;
    /** Chat room ID if notification is about a message */
    chatRoomId?: string;
    /** Voucher ID if notification is about a promotion */
    voucherId?: string;
    /** Any additional custom data */
    [key: string]: unknown;
}

/**
 * Notification channel IDs for Android
 * Must match the channels created in usePushNotifications.ts
 */
export const NotificationChannels = {
    /** General notifications */
    DEFAULT: 'default',
    /** Order status updates */
    ORDERS: 'orders',
    /** Promotional notifications */
    PROMOTIONS: 'promotions',
    /** Chat messages */
    CHAT: 'chat',
} as const;

export type NotificationChannel = typeof NotificationChannels[keyof typeof NotificationChannels];
