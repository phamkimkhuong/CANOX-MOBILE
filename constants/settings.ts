import { ROUTES } from '@/constants/routes';
import type { SettingsSection, SocialLinkConfig } from '@/types/settings';

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
                route: ROUTES.USER.EDIT_PROFILE,
            },
            {
                id: 'change-password',
                type: 'link',
                label: 'Đổi mật khẩu',
                icon: 'lock',
                route: ROUTES.SETTINGS.CHANGE_PASSWORD,
            },
            {
                id: 'support',
                type: 'link',
                label: 'Trung tâm hỗ trợ',
                icon: 'headset',
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
                route: ROUTES.SETTINGS.LEGAL_POLICIES,
            },
            {
                id: 'rate-app',
                type: 'link',
                label: 'Đánh giá ứng dụng',
                icon: 'star',
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
                route: ROUTES.SETTINGS.NOTIFICATIONS,
            },
            {
                id: 'language',
                type: 'link',
                label: 'Ngôn ngữ / Language',
                icon: 'language',
                route: ROUTES.SETTINGS.LANGUAGE,
                subtitle: 'Tiếng Việt',
            },
            {
                id: 'cache',
                type: 'info',
                label: 'Xóa bộ nhớ đệm',
                icon: 'delete-sweep',
                valueKey: 'cacheSize',
            },
            {
                id: 'app-version',
                type: 'info',
                label: 'Phiên bản ứng dụng',
                icon: 'system-update',
                valueKey: 'appVersion',
            },
            {
                id: 'delete-account',
                type: 'link',
                label: 'Xoá tài khoản',
                icon: 'delete-forever',
                route: ROUTES.SETTINGS.DELETE_ACCOUNT,
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
