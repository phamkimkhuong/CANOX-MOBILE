import { z } from 'zod';

/**
 * Notification Types Enum
 */
export const NotificationType = {
    ORDER: 'ORDER',
    PROMO: 'PROMO',
    SYSTEM: 'SYSTEM',
    WALLET: 'WALLET',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/**
 * Filter Tab Types
 */
export const NotificationFilter = {
    ALL: 'ALL',
    ORDER: 'ORDER',
    PROMO: 'PROMO',
    WALLET: 'WALLET',
} as const;

export type NotificationFilter = (typeof NotificationFilter)[keyof typeof NotificationFilter];

/**
 * Zod Schema for Notification
 * Used for API response validation
 */
export const NotificationSchema = z.object({
    id: z.string(),
    type: z.enum(['ORDER', 'PROMO', 'SYSTEM', 'WALLET']),
    title: z.string(),
    message: z.string(),
    timestamp: z.string(), // ISO date string
    isRead: z.boolean(),
    image: z.string().url().optional(), // Product image for ORDER type
    actionLabel: z.string().optional(), // e.g., "Đánh giá ngay", "Dùng ngay"
    actionUrl: z.string().optional(), // Deep link or route
    metadata: z.record(z.string(), z.unknown()).optional(), // Extra data (orderId, voucherId, etc.)
});

export type Notification = z.infer<typeof NotificationSchema>;

/**
 * Zod Schema for paginated API response
 */
export const NotificationPageSchema = z.object({
    data: z.array(NotificationSchema),
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
});

export type NotificationPage = z.infer<typeof NotificationPageSchema>;

/**
 * Section types for FlashList data flattening
 */
export interface NotificationSectionHeader {
    type: 'section-header';
    title: string;
    id: string;
}

export interface NotificationListItem {
    type: 'notification';
    data: Notification;
}

export type FlattenedNotificationItem = NotificationSectionHeader | NotificationListItem;

/**
 * Filter tab configuration
 */
export interface FilterTab {
    key: NotificationFilter;
    label: string;
    icon: string; // MaterialIcons name
}

export const FILTER_TABS: FilterTab[] = [
    { key: NotificationFilter.ALL, label: 'Tất cả', icon: '' },
    { key: NotificationFilter.ORDER, label: 'Đơn hàng', icon: 'local-shipping' },
    { key: NotificationFilter.PROMO, label: 'Khuyến mãi', icon: 'percent' },
    { key: NotificationFilter.WALLET, label: 'Ví & Dịch vụ', icon: 'account-balance-wallet' },
];

/**
 * Icon/Color mapping for notification types
 */
export interface NotificationTypeConfig {
    icon: string;
    backgroundColor: string;
    iconColor: string;
}

export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
    ORDER: {
        icon: 'local-shipping',
        backgroundColor: '#dbeafe', // blue-100
        iconColor: '#2563eb', // blue-600
    },
    PROMO: {
        icon: 'local-fire-department',
        backgroundColor: '#ffedd5', // orange-100
        iconColor: '#ea580c', // orange-600
    },
    SYSTEM: {
        icon: 'shield',
        backgroundColor: '#dbeafe', // blue-100
        iconColor: '#2563eb', // blue-600
    },
    WALLET: {
        icon: 'account-balance-wallet',
        backgroundColor: '#dcfce7', // green-100
        iconColor: '#16a34a', // green-600
    },
};
