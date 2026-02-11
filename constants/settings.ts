import { ROUTES } from '@/constants/routes';
import type { IconColorConfig, IconColorPreset, SettingsSection, SocialLinkConfig } from '@/types/settings';

// ICON COLOR PRESETS
// ============================================
// Maps color preset names to actual rgba values
// Using semantic colors that work in both light/dark mode

export const ICON_COLOR_MAP: Record<IconColorPreset, IconColorConfig> = {
    blue: {
        bg: 'rgba(59, 130, 246, 0.1)',
        icon: '#3b82f6',
    },
    orange: {
        bg: 'rgba(249, 115, 22, 0.1)',
        icon: '#f97316',
    },
    purple: {
        bg: 'rgba(168, 85, 247, 0.1)',
        icon: '#a855f7',
    },
    emerald: {
        bg: 'rgba(16, 185, 129, 0.1)',
        icon: '#10b981',
    },
    teal: {
        bg: 'rgba(20, 184, 166, 0.1)',
        icon: '#14b8a6',
    },
    pink: {
        bg: 'rgba(236, 72, 153, 0.1)',
        icon: '#ec4899',
    },
    indigo: {
        bg: 'rgba(99, 102, 241, 0.1)',
        icon: '#6366f1',
    },
    slate: {
        bg: 'rgba(100, 116, 139, 0.1)',
        icon: '#64748b',
    },
    rose: {
        bg: 'rgba(244, 63, 94, 0.1)',
        icon: '#f43f5e',
    },
    cyan: {
        bg: 'rgba(6, 182, 212, 0.1)',
        icon: '#06b6d4',
    },
    sky: {
        bg: 'rgba(14, 165, 233, 0.1)',
        icon: '#0ea5e9',
    },
    yellow: {
        bg: 'rgba(234, 179, 8, 0.1)',
        icon: '#eab308',
    },
    red: {
        bg: 'rgba(239, 68, 68, 0.1)',
        icon: '#ef4444',
    },
    violet: {
        bg: 'rgba(139, 92, 246, 0.1)',
        icon: '#8b5cf6',
    },
    amber: {
        bg: 'rgba(245, 158, 11, 0.1)',
        icon: '#f59e0b',
    },
};

// SETTINGS SECTIONS CONFIGURATION
// ============================================
// Config-driven UI - Thêm mục mới chỉ cần thêm JSON

export const SETTINGS_SECTIONS: SettingsSection[] = [
    {
        id: 'account',
        title: 'Tài khoản & An ninh',
        items: [
            {
                id: 'profile',
                type: 'link',
                label: 'Hồ sơ & Địa chỉ',
                icon: 'badge',
                iconColor: 'blue',
                route: ROUTES.USER.EDIT_PROFILE,
            },
            {
                id: 'change-password',
                type: 'link',
                label: 'Đổi mật khẩu',
                icon: 'lock',
                iconColor: 'orange',
                route: ROUTES.SETTINGS.CHANGE_PASSWORD,
            },
            {
                id: 'linked-accounts',
                type: 'link',
                label: 'Tài khoản liên kết',
                icon: 'link',
                iconColor: 'purple',
                route: ROUTES.SETTINGS.LINKED_ACCOUNTS,
            },
            {
                id: 'support',
                type: 'link',
                label: 'Trung tâm hỗ trợ',
                icon: 'headset',
                iconColor: 'blue',
                route: ROUTES.PROFILE.SUPPORT,
            },
        ],
    },
    {
        id: 'legal',
        title: 'Pháp lý & Hỗ trợ',
        items: [
            {
                id: 'legal-policies',
                type: 'link',
                label: 'Chính sách & Điều khoản',
                icon: 'policy',
                iconColor: 'cyan',
                route: ROUTES.SETTINGS.LEGAL_POLICIES,
            },
            {
                id: 'rate-app',
                type: 'link',
                label: 'Đánh giá ứng dụng',
                icon: 'star',
                iconColor: 'yellow',
                route: ROUTES.SETTINGS.RATE_APP,
            },
        ],
    },
    {
        id: 'payment',
        title: 'Thanh toán',
        items: [
            {
                id: 'bank-cards',
                type: 'link',
                label: 'Tài khoản / Thẻ ngân hàng',
                icon: 'credit-card',
                iconColor: 'teal',
                route: ROUTES.SETTINGS.BANK_CARDS,
            },
        ],
    },
    {
        id: 'app',
        title: 'Cài đặt ứng dụng',
        items: [
            {
                id: 'notifications',
                type: 'link',
                label: 'Cài đặt thông báo',
                icon: 'notifications',
                iconColor: 'pink',
                route: ROUTES.SETTINGS.NOTIFICATIONS,
            },
            {
                id: 'language',
                type: 'link',
                label: 'Ngôn ngữ / Language',
                icon: 'language',
                iconColor: 'indigo',
                route: ROUTES.SETTINGS.LANGUAGE,
                subtitle: 'Tiếng Việt',
            },
            {
                id: 'cache',
                type: 'info',
                label: 'Xóa bộ nhớ đệm',
                icon: 'delete-sweep',
                iconColor: 'rose',
                valueKey: 'cacheSize',
            },
            {
                id: 'app-version',
                type: 'info',
                label: 'Phiên bản ứng dụng',
                icon: 'system-update',
                iconColor: 'emerald',
                valueKey: 'appVersion',
            },
        ],
    },
];

// SOCIAL LINKS CONFIGURATION

export const SOCIAL_LINKS_CONFIG: SocialLinkConfig[] = [
    {
        id: 'google',
        provider: 'google',
        label: 'Google',
        connected: false,
    },
    {
        id: 'facebook',
        provider: 'facebook',
        label: 'Facebook',
        connected: false,
    },
    {
        id: 'apple',
        provider: 'apple',
        label: 'Apple',
        connected: false,
    },
];

// CACHE SETTINGS

export const CACHE_DIRECTORIES = [
    'ImageCache', // expo-image cache
    'ExponentExperienceData', // Expo data
] as const;

// Maximum cache warning threshold (in bytes)
export const CACHE_WARNING_THRESHOLD = 100 * 1024 * 1024; // 100 MB
