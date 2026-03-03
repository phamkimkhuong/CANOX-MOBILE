import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'Xu Tích Lũy',
    hero: {
        totalCoinsLabel: 'Tổng xu tích lũy',
        unit: 'xu',
        shopCountLabel: 'shop',
        expiringLabel: 'sắp hết hạn'
    },
    guest: {
        title: 'Đăng nhập để xem điểm',
        message: 'Đăng nhập ngay để theo dõi và săn các ưu đãi đổi điểm thưởng từ các shop bạn yêu thích.',
        actionLabel: 'Đăng nhập'
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
    },
    shopDetail: {
        title: 'Hội viên Cửa hàng',
        tabs: {
            batches: 'Lô xu chờ duyệt',
            history: 'Lịch sử',
        },
        hero: {
            availableCoins: 'Số Xu Khả Dụng',
            equivalent: 'Tương đương {{amount}}₫',
            warningMsg: 'Thẻ đỏ: {{amount}} Xu sắp hết hạn',
            urgentText: 'Dùng ngay kẻo lỡ!',
            buyNow: 'MUA NGAY',
            defaultShopName: 'Cửa hàng',
        },
        batchesTab: {
            empty: 'Hiện chưa có lô xu nào đang chờ.',
            available: 'KHẢ DỤNG',
            unit: 'Xu',
        },
        historyTab: {
            expired: 'Đã quá hạn',
            empty: 'Chưa có giao dịch xu nào.',
        },
    },
};
