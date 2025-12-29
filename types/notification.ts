import type { IconSymbolName } from '@/components/ui/Icon';
import { z } from 'zod';

/**
 * Notification Types Enum
 */
export const NotificationType = {
    ORDER: 'ORDER',
    PRODUCT: 'PRODUCT',
    PROMO: 'PROMO',
    SHIPPING: 'SHIPPING',
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
    PRODUCT: 'PRODUCT',
    PROMO: 'PROMO',
    SHIPPING: 'SHIPPING',
    WALLET: 'WALLET',
} as const;

export type NotificationFilter = (typeof NotificationFilter)[keyof typeof NotificationFilter];

/**
 * UI MODEL (Domain Model cho Frontend) Frontend
 */
export const NotificationSchema = z.object({
    id: z.string(),
    type: z.enum(['ORDER', 'PROMO', 'SYSTEM', 'SHIPPING', 'PRODUCT', 'WALLET']),
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

export interface NotificationPage {
    data: Notification[];
    nextCursor: number | null;
    hasMore: boolean;
}

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
    icon: IconSymbolName | '';
}

export const FILTER_TABS: FilterTab[] = [
    { key: NotificationFilter.ALL, label: 'Tất cả', icon: '' },
    { key: NotificationFilter.ORDER, label: 'Đơn hàng', icon: 'local-shipping' },
    { key: NotificationFilter.PROMO, label: 'Khuyến mãi', icon: 'percent' },
    { key: NotificationFilter.PRODUCT, label: 'Sản phẩm', icon: 'cube-outline' },
    { key: NotificationFilter.SHIPPING, label: 'Vận chuyển', icon: 'airplane-outline' },
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
        backgroundColor: '#dbeafe',
        iconColor: '#2563eb',
    },
    PRODUCT: {
        icon: 'cube-outline',
        backgroundColor: '#fef3c7',
        iconColor: '#d97706',
    },
    PROMO: {
        icon: 'local-fire-department',
        backgroundColor: '#ffedd5',
        iconColor: '#ea580c',
    },
    SHIPPING: {
        icon: 'airplane-outline',
        backgroundColor: '#e0e7ff',
        iconColor: '#4f46e5',
    },
    SYSTEM: {
        icon: 'shield',
        backgroundColor: '#dbeafe',
        iconColor: '#2563eb',
    },
    WALLET: {
        icon: 'account-balance-wallet',
        backgroundColor: '#dcfce7',
        iconColor: '#16a34a',
    },
};

/**
 * API RESPONSE MODEL (Data Transfer Object) Backend Response
 */
export const NotificationResponseItemSchema = z.object({
    id: z.string(),
    userId: z.string(),
    recipientRole: z.enum(['BUYER', 'SHOP', 'ADMIN', 'SYSTEM', 'EMPLOYEE']),
    type: z.string(), // SYSTEM, etc.
    priority: z.enum(['HIGH', 'NORMAL', 'LOW']),
    title: z.string(),
    content: z.string(),
    readStatus: z.enum(['READ', 'UNREAD']),
    redirectUrl: z.string().nullable(),
    redirectType: z.enum(['INTERNAL_PAGE', 'EXTERNAL_URL', 'DEEP_LINK']).nullable(),
    relatedEntityType: z.string().nullable(),
    relatedEntityId: z.string().nullable(),
    category: z.string().nullable(), // ORDER, PROMO...
    imageUrl: z.string().nullable(),
    groupId: z.string().nullable(),
    campaignId: z.string().nullable(),
    traceId: z.string().nullable(),
    expiresAt: z.string().nullable(),
    scheduledAt: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdDate: z.string(),
    updatedDate: z.string().nullable(),
    isExpired: z.boolean(),
    isVisible: z.boolean(),
});
export type NotificationResponseItem = z.infer<typeof NotificationResponseItemSchema>;

/**
 * Schema cho API Response pagination
 */
export const NotificationApiResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    data: z.object({
        content: z.array(NotificationResponseItemSchema),
        page: z.number(),
        size: z.number(),
        totalElements: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        nextPage: z.number(),
    }),
});
