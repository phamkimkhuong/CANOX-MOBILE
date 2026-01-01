/**
 * Voucher i18n strings - Vietnamese
 * 
 * @example
 * ```tsx
 * import { VOUCHER_STRINGS } from '@/constants/i18n/vi/voucher';
 * <Text>{VOUCHER_STRINGS.header.title}</Text>
 * ```
 */

import type { VoucherTranslation } from '../types';

export const VOUCHER_STRINGS: VoucherTranslation = {
    // === Header ===
    header: {
        title: 'Kho Voucher',
        myVouchers: 'Voucher của tôi',
        searchPlaceholder: 'Tìm voucher Ebay, Shop...',
    },

    // === Filter Tabs ===
    filters: {
        all: 'Tất cả',
        shipping: 'Vận chuyển',
        cashback: 'Hoàn Xu',
        international: 'Quốc tế',
        shopMall: 'Shop Mall',
        discount: 'Giảm giá',
        live: 'LIVE',
    },

    // === Sort Options ===
    sort: {
        label: 'Sắp xếp',
        popular: 'Phổ biến',
        newest: 'Mới nhất',
        expiring: 'Sắp hết hạn',
    },

    // === Voucher Card ===
    card: {
        minOrder: 'Đơn tối thiểu',
        maxDiscount: 'Giảm tối đa',
        expiry: 'HSD',
        expiryToday: 'Hết hạn hôm nay',
        expiringSoon: 'Sắp hết hạn',
        almostGone: 'Sắp hết lượt',
        used: 'Đã dùng',
        conditions: 'Điều kiện',
        freeShipping: 'Miễn phí vận chuyển',
        discount: 'Giảm',
        discountUpTo: 'Giảm tối đa',
        cashback: 'Hoàn',
        coins: 'Xu',
    },

    // === Action Buttons ===
    actions: {
        collect: 'Lưu',
        use: 'Dùng ngay',
        collected: 'Đã lưu',
        expired: 'Hết hạn',
        soldout: 'Hết lượt',
        reminder: 'Nhắc tôi',
    },

    // === Featured Section ===
    featured: {
        title: 'Gợi ý dành riêng cho bạn',
        aiPick: 'AI PICK',
    },

    // === List Section ===
    list: {
        title: 'Danh sách mã giảm giá',
        empty: 'Không có voucher nào',
        emptyDescription: 'Hãy quay lại sau để săn thêm voucher nhé!',
        loadMore: 'Xem thêm',
        loading: 'Đang tải...',
    },

    // === Badges ===
    badges: {
        hot: 'HOT',
        new: 'MỚI',
        limited: 'Số lượng có hạn',
        extra: 'EXTRA',
        xtra: 'Xtra',
        exclusive: 'Độc quyền',
    },

    // === Progress Bar ===
    progress: {
        used: 'Đã dùng',
    },

    // === Error States ===
    error: {
        loadFailed: 'Không thể tải voucher',
        collectFailed: 'Không thể lưu voucher',
        retry: 'Thử lại',
    },

    // === Success Messages ===
    success: {
        collected: 'Đã lưu voucher thành công!',
        reminderSet: 'Đã đặt nhắc nhở!',
    },

    // === Live Voucher ===
    live: {
        startingAt: 'Sắp diễn ra',
        liveNow: 'Đang diễn ra',
    },

    // === Type Labels ===
    types: {
        shipping: 'FREESHIP',
        discount: 'Giảm giá',
        cashback: 'Hoàn Xu',
        international: 'QUỐC TẾ',
        live: 'LIVE',
        shop: 'Shop',
    },
} as const;

export type VoucherStringKeys = typeof VOUCHER_STRINGS;

