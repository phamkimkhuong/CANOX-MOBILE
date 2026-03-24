import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'Loyalty Coins',
    hero: {
        totalCoinsLabel: 'Total accumulated coins',
        unit: 'coins',
        shopCountLabel: 'shops',
        expiringLabel: 'expiring soon'
    },
    guest: {
        title: 'Login to view coins',
        message: 'Login now to track and hunt for point redemption offers from your favorite shops.',
        actionLabel: 'Login'
    },
    shopSection: {
        title: 'Coins by shop'
    },
    emptyState: {
        title: 'No loyalty coins yet',
        message: 'Buy items to earn loyalty coins from shops.\nUse coins to get discounts on your next orders!',
        shopNowBtn: 'Shop now'
    },
    howItWorks: {
        title: 'How to use coins',
        steps: {
            buy: { title: 'Buy items', desc: 'Earn coins when order completes' },
            accumulate: { title: 'Accumulate', desc: 'Coins are automatically added to account' },
            use: { title: 'Use', desc: 'Redeem coins for discounts at checkout' }
        }
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
