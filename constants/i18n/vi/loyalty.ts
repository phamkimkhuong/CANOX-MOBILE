import { LoyaltyTranslation } from '../types';

export const LOYALTY_STRINGS: LoyaltyTranslation = {
    title: 'Xu Canox',
    guestDashboard: {
        hero: {
            title: 'Đăng nhập để xem Xu Canox',
            description: 'Xu Canox và điểm từ shop được lưu theo tài khoản của bạn. Đăng nhập để xem số dư, lịch sử và ưu đãi có thể sử dụng.',
            loginAction: 'Đăng nhập / Đăng ký',
        },
        benefits: {
            title: 'Xu Canox giúp bạn',
            discount: {
                title: 'Dùng xu giảm giá',
                description: 'Áp dụng cho đơn hàng đủ điều kiện',
            },
            balance: {
                title: 'Theo dõi số dư',
                description: 'Xem xu khả dụng, xu đang chờ và sắp hết hạn',
            },
            shop: {
                title: 'Nhận điểm từ shop',
                description: 'Tích điểm riêng từ các shop tham gia chương trình',
            },
        },
        earn: {
            title: 'Cách kiếm xu',
            purchase: 'Mua hàng đủ điều kiện',
            review: 'Đánh giá sau khi nhận hàng',
            program: 'Tham gia chương trình Canox',
        },
    },
    overviewDashboard: {
        hero: {
            platformLabel: 'Xu Canox khả dụng',
            combinedLabel: 'Tổng điểm khả dụng',
            platformDescription: 'Có thể giảm đến {{amount}}đ',
            combinedDescription: 'Có thể dùng theo điều kiện từng shop',
            coinUnit: 'xu',
            pointUnit: 'điểm',
            expiringTemplate: 'Sắp hết hạn: {{amount}} {{unit}} · {{source}} · {{date}}',
            useNow: 'Dùng ngay',
            howItWorks: 'Cách hoạt động',
        },
        shopPoints: {
            unit: 'điểm',
            shopOnlyBadge: 'Dùng tại shop',
        },
    },
    shopSection: {
        title: 'Điểm từ shop',
        availableCount: '{{count}} shop đang có điểm khả dụng',
    },
    emptyState: {
        title: 'Chưa có xu tích lũy',
        message: 'Mua hàng để nhận xu tích lũy từ các shop.\nDùng xu để giảm giá cho đơn hàng tiếp theo!',
        shopNowBtn: 'Mua sắm ngay'
    },
    emptyDashboard: {
        hero: {
            label: 'Xu Canox khả dụng',
            description: 'Bạn chưa có xu khả dụng',
            expiryStatus: 'Chưa có xu đang chờ hoặc sắp hết hạn',
            primaryAction: 'Mua hàng tích xu',
            secondaryAction: 'Cách hoạt động',
        },
        shopPoints: {
            title: 'Điểm từ shop',
            status: 'Chưa có điểm khả dụng',
            emptyTitle: 'Bạn chưa có điểm từ shop',
            emptyMessage: 'Mua tại shop có chương trình điểm để tích điểm riêng của shop.',
            action: 'Xem shop tặng điểm',
        },
        earn: {
            title: 'Cách kiếm xu',
            purchaseTitle: 'Mua hàng tích xu',
            reviewTitle: 'Đánh giá nhận xu',
            programTitle: 'Chương trình Canox',
            action: 'tích xu',
        },
        history: {
            title: 'Lịch sử gần đây',
            emptyTitle: 'Chưa có giao dịch xu',
            emptyMessage: 'Khi bạn nhận, sử dụng, hết hạn hoặc được hoàn xu, lịch sử sẽ hiển thị tại đây.',
        },
    },
    guideSheet: {
        title: 'Cách hoạt động',
        understood: 'Đã hiểu',
        what: {
            title: 'Xu Canox là gì?',
            body: 'Xu Canox là điểm thưởng dùng để giảm giá đơn hàng đủ điều kiện trên Canox. Xu không quy đổi thành tiền mặt.',
        },
        earn: {
            title: 'Cách kiếm xu',
            bullets: {
                purchase: 'Mua hàng đủ điều kiện',
                review: 'Đánh giá sau khi nhận hàng',
                program: 'Tham gia chương trình Canox',
            },
        },
        use: {
            title: 'Cách dùng xu',
            body: 'Bạn có thể dùng xu khi thanh toán cho đơn hàng đủ điều kiện.',
        },
        available: {
            title: 'Khi nào xu khả dụng?',
            body: 'Xu thưởng được cộng sau khi đơn hàng hoàn tất và không phát sinh huỷ, trả hàng hoặc hoàn tiền.',
        },
        note: {
            title: 'Lưu ý',
            callout: 'Xu có thể có hạn sử dụng. Hãy theo dõi xu sắp hết hạn để dùng kịp thời.',
        },
    },
    pdp: {
        chipEarn: 'Nhận +{{points}} xu',
        chipGeneric: 'Nhận xu thưởng',
        sheetTitle: 'Điểm thưởng từ shop',
        sheetShop: 'Shop áp dụng',
        sheetEarn: 'Bạn sẽ nhận',
        sheetEarnValue: '+{{points}} xu khi đơn hoàn tất',
        sheetCondition: 'Điều kiện',
        sheetConditionValue: 'Xu được cộng sau khi đơn hàng từ shop này hoàn tất thành công',
        sheetExpiry: 'Hạn sử dụng',
        sheetExpiryValue: 'Xu có hiệu lực trong {{days}} ngày kể từ khi được cộng',
        sheetMaxDiscount: 'Dùng tối đa',
        sheetMaxDiscountValue: 'Giảm tối đa {{percent}}% cho đơn hàng tiếp theo',
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
