import {
    ORDER_STATUS_ROUTES,
    ROUTES,
    SERVICE_MENU_ROUTES,
    SETTINGS_MENU_ROUTES,
} from '@/constants/routes';
import { z } from 'zod';

// ============================================
// USER PROFILE SCHEMAS
// ============================================


/**
 * Order statistics schema - for badge counts
 */
export const OrderStatsSchema = z.object({
    pendingPayment: z.number().default(0),
    processing: z.number().default(0),
    shipping: z.number().default(0),
    review: z.number().default(0),
    completed: z.number().default(0),
    total: z.number().default(0),
});

export type OrderStats = z.infer<typeof OrderStatsSchema>;

/**
 * Wallet balance schema
 */
export const WalletBalanceSchema = z.object({
    balance: z.number().default(0),
    coins: z.number().default(0),
    vouchers: z.number().default(0),
});

export type WalletBalance = z.infer<typeof WalletBalanceSchema>;

/**
 * Member level enum
 */
export const MemberLevel = {
    BRONZE: 'BRONZE',
    SILVER: 'SILVER',
    GOLD: 'GOLD',
    PLATINUM: 'PLATINUM',
    DIAMOND: 'DIAMOND',
} as const;

export type MemberLevel = (typeof MemberLevel)[keyof typeof MemberLevel];

/**
 * Member level config for display
 */
export interface MemberLevelConfig {
    key: MemberLevel;
    label: string;
    color: string;
    bgColor: string;
    icon: string;
}

export const MEMBER_LEVEL_CONFIG: Record<MemberLevel, MemberLevelConfig> = {
    BRONZE: {
        key: 'BRONZE',
        label: 'Đồng',
        color: '#cd7f32',
        bgColor: 'rgba(205, 127, 50, 0.15)',
        icon: 'star',
    },
    SILVER: {
        key: 'SILVER',
        label: 'Bạc',
        color: '#94a3b8',
        bgColor: 'rgba(148, 163, 184, 0.15)',
        icon: 'star',
    },
    GOLD: {
        key: 'GOLD',
        label: 'Vàng',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.15)',
        icon: 'star',
    },
    PLATINUM: {
        key: 'PLATINUM',
        label: 'Bạch Kim',
        color: '#6366f1',
        bgColor: 'rgba(99, 102, 241, 0.15)',
        icon: 'diamond',
    },
    DIAMOND: {
        key: 'DIAMOND',
        label: 'Kim Cương',
        color: '#06b6d4',
        bgColor: 'rgba(6, 182, 212, 0.15)',
        icon: 'diamond',
    },
};

/**
 * User profile schema
 */
export const UserProfileSchema = z.object({
    id: z.string(),
    username: z.string(),
    fullName: z.string(),
    email: z.email().optional(),
    phone: z.string().optional(),
    avatar: z.string().nullable(),
    dateOfBirth: z.string().nullable().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
    memberLevel: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']).default('BRONZE'),
    isVerified: z.boolean().default(false),
    recentViewCount: z.number().default(0),
    followingShops: z.number().default(0),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Followed shop schema
 */
export const FollowedShopSchema = z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
    isPreferred: z.boolean().default(false),
});

export type FollowedShop = z.infer<typeof FollowedShopSchema>;

// ============================================
// MENU CONFIG TYPES
// ============================================

/**
 * Profile menu item type
 */
export interface ProfileMenuItem {
    id: string;
    key: string;
    icon: string;
    label: string;
    route: string;
    badge?: 'new' | number;
    iconBgColor: string;
    iconColor: string;
    backgroundColor?: string;
    iconType?: 'icon' | 'image';
    iconSource?: number; // for require() images
    group?: string;
}

/**
 * Order status item config
 */
export interface OrderStatusItem {
    key: keyof OrderStats;
    icon: string;
    label: string;
    route: string;
}

export const ORDER_STATUS_CONFIG: OrderStatusItem[] = [
    {
        key: 'pendingPayment',
        icon: 'card',
        label: 'Chờ thanh toán',
        route: ORDER_STATUS_ROUTES.pendingPayment,
    },
    {
        key: 'processing',
        icon: 'cube',
        label: 'Chờ xác nhận',
        route: ORDER_STATUS_ROUTES.processing,
    },
    {
        key: 'shipping',
        icon: 'shipping',
        label: 'Đang giao',
        route: ORDER_STATUS_ROUTES.shipping,
    },
    {
        key: 'completed',
        icon: 'bag',
        label: 'Đã mua',
        route: ORDER_STATUS_ROUTES.completed,
    },
];

/**
 * Quick stats card config
 */
export interface QuickStatCard {
    key: string;
    icon: string;
    label: string;
    bgColor: string;
    iconColor: string;
    valueKey: string;
    route: string;
}

export const QUICK_STATS_CONFIG: QuickStatCard[] = [];

/**
 * Service menu items
 */
export const SERVICE_MENU_CONFIG: ProfileMenuItem[] = [
    {
        id: 'favorites',
        key: 'favorites',
        icon: 'heart',
        label: 'Yêu thích',
        route: ROUTES.WISHLIST.INDEX,
        iconBgColor: 'rgba(244, 63, 94, 0.1)',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        iconColor: '#f43f5e',
    },
    {
        id: 'coins',
        key: 'coins',
        icon: 'cash',
        label: 'Xu Tích Lũy',
        route: SERVICE_MENU_ROUTES.coins,
        iconBgColor: 'rgba(234, 179, 8, 0.1)',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        iconColor: '#eab308',
    },
    {
        id: 'vouchers',
        key: 'vouchers',
        icon: 'ticket',
        label: 'Kho Voucher',
        route: SERVICE_MENU_ROUTES.vouchers,
        iconBgColor: 'rgba(249, 115, 22, 0.1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        iconColor: '#f97316',
    },
    {
        id: 'reviews',
        key: 'reviews',
        icon: 'star',
        label: 'Đánh giá của tôi',
        route: ROUTES.USER.REVIEWS,
        iconBgColor: 'rgba(16, 185, 129, 0.1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        iconColor: '#10b981',
    },
    // {
    //     id: 'international',
    //     key: 'shipping',
    //     icon: 'airplane',
    //     label: 'Vận chuyển QT',
    //     route: SERVICE_MENU_ROUTES.shipping,
    //     iconBgColor: 'rgba(139, 92, 246, 0.1)',
    //     backgroundColor: 'rgba(139, 92, 246, 0.1)',
    //     iconColor: '#8b5cf6',
    // },
];

/**
 * Settings menu items - SettingsMenuItem alias
 */
export type SettingsMenuItem = ProfileMenuItem;

/**
 * Settings menu items
 */
export const SETTINGS_MENU_CONFIG: ProfileMenuItem[] = [
    {
        id: 'support',
        key: 'support',
        icon: 'headset',
        label: 'Trung tâm hỗ trợ',
        route: SETTINGS_MENU_ROUTES.support,
        iconBgColor: 'rgba(59, 130, 246, 0.1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        iconColor: '#3b82f6',
        group: 'support',
    },
    {
        id: 'security',
        key: 'security',
        icon: 'shield',
        label: 'Thiết lập tài khoản & Bảo mật',
        route: SETTINGS_MENU_ROUTES.security,
        iconBgColor: 'rgba(34, 197, 94, 0.1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        iconColor: '#22c55e',
        group: 'settings',
    },
];
