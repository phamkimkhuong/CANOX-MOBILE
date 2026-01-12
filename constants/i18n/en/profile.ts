import { ProfileTranslation } from '../types';

export const PROFILE_STRINGS: ProfileTranslation = {
    header: {
        login: 'Login',
        register: 'Register',
    },
    stats: {
        favorites: 'Favorites',
        followed: 'Followed',
        recent: 'Recently Viewed',
        coins: 'Coins',
        vouchers: 'Vouchers',
    },
    orders: {
        title: 'My Purchase',
        viewAll: 'View Purchase History',
    },
    menu: {
        wallet: 'Calatha Wallet',
        rewards: 'Member Rewards',
        affiliate: 'Affiliate Program',
        support: 'Support Center',
        settings: 'Account Settings',
    },
    settings: {
        title: 'Account Settings',
        sections: {
            account: 'Account & Security',
            payment: 'Payment',
            app: 'App Settings',
            legal: 'Legal & Support',
        },
        items: {
            profile: 'Profile & Address',
            'change-password': 'Change Password',
            'linked-accounts': 'Linked Accounts',
            biometrics: 'Biometrics (FaceID/TouchID)',
            'bank-cards': 'Bank Accounts / Cards',
            notifications: 'Notification Settings',
            language: 'Language / Ngôn ngữ',
            'dark-mode': 'Dark Mode',
            cache: 'Clear Cache',
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            'rate-app': 'Rate Our App',
        },
        actions: {
            logout: 'Logout',
            deleteAccount: 'Delete Account',
            deleteAccountConfirm: 'This will permanently delete your account and all your data. This action cannot be undone.',
            confirmClearCache: 'Are you sure you want to clear {{size}} of cache?',
            cacheCleared: 'Cache cleared successfully',
        },
    },
};
