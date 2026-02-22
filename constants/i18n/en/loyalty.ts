import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'Loyalty Coins',
    hero: {
        totalCoinsLabel: 'Total accumulated coins',
        unit: 'coins',
        shopCountLabel: 'shops',
        expiringLabel: 'expiring soon'
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
    }
};
