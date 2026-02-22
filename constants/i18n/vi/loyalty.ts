import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'Xu Tích Lũy',
    hero: {
        totalCoinsLabel: 'Tổng xu tích lũy',
        unit: 'xu',
        shopCountLabel: 'shop',
        expiringLabel: 'sắp hết hạn'
    },
    shopSection: {
        title: 'Xu theo từng shop'
    },
    emptyState: {
        title: 'Chưa có xu tích lũy',
        message: 'Mua hàng để nhận xu tích lũy từ các shop.\nDùng xu để giảm giá cho đơn hàng tiếp theo!',
        shopNowBtn: 'Mua sắm ngay'
    },
    howItWorks: {
        title: 'Cách sử dụng xu',
        steps: {
            buy: { title: 'Mua hàng', desc: 'Nhận xu khi đơn hàng hoàn thành' },
            accumulate: { title: 'Tích lũy', desc: 'Xu tự động cộng vào tài khoản' },
            use: { title: 'Sử dụng', desc: 'Đổi xu lấy giảm giá khi thanh toán' }
        }
    }
};
