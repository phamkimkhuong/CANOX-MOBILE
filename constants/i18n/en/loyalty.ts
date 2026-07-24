import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'TCano Coins',
    guestDashboard: {
        hero: {
            title: 'Login to view TCano Coins',
            description: 'TCano Coins and shop points are saved to your account. Login to view balances, history, and usable offers.',
            loginAction: 'Login / Sign up',
        },
        benefits: {
            title: 'How TCano Coins help',
            discount: {
                title: 'Use coins for discounts',
                description: 'Applies to eligible orders',
            },
            balance: {
                title: 'Track balances',
                description: 'View available, pending, and expiring coins',
            },
            shop: {
                title: 'Earn shop points',
                description: 'Collect points from participating shops',
            },
        },
        earn: {
            title: 'Ways to earn coins',
            purchase: 'Buy eligible items',
            review: 'Review after receiving orders',
            program: 'Join TCano programs',
        },
    },
    overviewDashboard: {
        hero: {
            platformLabel: 'Available TCano Coins',
            combinedLabel: 'Total available points',
            platformDescription: 'Can discount up to {{amount}}đ',
            combinedDescription: 'Usable under each shop’s conditions',
            coinUnit: 'coins',
            pointUnit: 'points',
            expiringTemplate: 'Expiring soon: {{amount}} {{unit}} · {{source}} · {{date}}',
            useNow: 'Use now',
            howItWorks: 'How it works',
        },
        shopPoints: {
            unit: 'points',
            shopOnlyBadge: 'Shop only',
        },
    },
    shopSection: {
        title: 'Shop points',
        availableCount: '{{count}} shops with available points',
    },
    emptyState: {
        title: 'No loyalty coins yet',
        message: 'Buy items to earn loyalty coins from shops.\nUse coins to get discounts on your next orders!',
        shopNowBtn: 'Shop now'
    },
    emptyDashboard: {
        hero: {
            label: 'Available TCano Coins',
            description: 'You do not have available coins yet',
            expiryStatus: 'No pending or expiring coins yet',
            primaryAction: 'Shop to earn coins',
            secondaryAction: 'How it works',
        },
        shopPoints: {
            title: 'Shop points',
            status: 'No available points',
            emptyTitle: 'No shop points yet',
            emptyMessage: 'Buy from shops with point programs to earn shop-specific points.',
            action: 'View point shops',
        },
        earn: {
            title: 'Ways to earn coins',
            purchaseTitle: 'Shop and earn',
            reviewTitle: 'Review to earn',
            programTitle: 'TCano programs',
            action: 'earn',
        },
        history: {
            title: 'Recent history',
            emptyTitle: 'No coin transactions',
            emptyMessage: 'Coin earning, redemption, expiry, and refund history will appear here.',
        },
    },
    guideSheet: {
        title: 'How it works',
        understood: 'Got it',
        what: {
            title: 'What are TCano Coins?',
            body: 'TCano Coins are reward points used to discount eligible orders on TCano. Coins cannot be converted to cash.',
        },
        earn: {
            title: 'How to earn coins',
            bullets: {
                purchase: 'Buy eligible items',
                review: 'Review after receiving orders',
                program: 'Join TCano programs',
            },
        },
        use: {
            title: 'How to use coins',
            body: 'You can use coins at checkout for eligible orders.',
        },
        available: {
            title: 'When are coins available?',
            body: 'Reward coins are added after the order is completed with no cancellation, return, or refund.',
        },
        note: {
            title: 'Note',
            callout: 'Coins may expire. Track expiring coins so you can use them in time.',
        },
    },
    pdp: {
        chipEarn: 'Earn +{{points}} coins',
        chipGeneric: 'Earn loyalty coins',
        sheetTitle: 'Shop loyalty reward',
        sheetShop: 'Eligible shop',
        sheetEarn: 'You will earn',
        sheetEarnValue: '+{{points}} coins when the order is completed',
        sheetCondition: 'Condition',
        sheetConditionValue: 'Coins are added after a successful completed order from this shop',
        sheetExpiry: 'Validity',
        sheetExpiryValue: 'Coins remain valid for {{days}} days after being added',
        sheetMaxDiscount: 'Usage limit',
        sheetMaxDiscountValue: 'Use coins for up to {{percent}}% off your next order',
    },
    shopDetail: {
        title: 'Shop Member',
        tabs: {
            batches: 'Pending Batches',
            history: 'History',
        },
        hero: {
            availableCoins: 'Available Coins',
            equivalent: 'Equivalent to ₫{{amount}}',
            warningMsg: 'Red flag: {{amount}} Coins expiring soon',
            urgentText: 'Use now!',
            buyNow: 'BUY NOW',
            defaultShopName: 'Shop',
        },
        batchesTab: {
            empty: 'No pending coin batches.',
            available: 'AVAILABLE',
            unit: 'Coins',
        },
        historyTab: {
            expired: 'Expired',
            empty: 'No coin transactions yet.',
        },
    },
};
