/**
 * useVoucherList - Custom hook để quản lý danh sách voucher
 * 
 * Features:
 * - Filter by type
 * - Sort by popularity/expiry
 * - Optimistic update khi lưu voucher
 * - Search functionality
 */

import i18n from '@/constants/i18n';
import { VOUCHER_STRINGS as VOUCHER_STRINGS_EN } from '@/constants/i18n/en/voucher';
import { VOUCHER_STRINGS as VOUCHER_STRINGS_VI } from '@/constants/i18n/vi/voucher';
import type { VoucherFilterTab, VoucherUI } from '@/types/voucher';
import { VOUCHER_FILTER_TABS } from '@/types/voucher';
import {
    formatExpiryText,
    filterVouchersByType,
    sortVouchers
} from '@/utils/adapter/voucherAdapter';
import { formatClockTime } from '@/utils/date';
import { createLogger } from '@/utils/logger';
import { useCallback, useMemo, useState } from 'react';

const log = createLogger('Voucher');

// ============================================
// MOCK DATA - Replace with API call
// ============================================

const getVoucherStrings = () =>
    (i18n.resolvedLanguage || i18n.language || '').startsWith('vi')
        ? VOUCHER_STRINGS_VI
        : VOUCHER_STRINGS_EN;

const buildMockExpiryDate = (daysFromNow: number, hours = 23, minutes = 59): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
};

const buildMockDateHoursFromNow = (hoursFromNow: number): string => {
    const date = new Date();
    date.setTime(date.getTime() + hoursFromNow * 60 * 60 * 1000);
    return date.toISOString();
};

const formatLiveStartText = (startDate: string): string => {
    const strings = getVoucherStrings();
    return `${strings.live.startingAt} ${formatClockTime(startDate)}`.trim();
};

const createMockVouchers = (): VoucherUI[] => {
    const shippingExpiry = buildMockExpiryDate(30);
    const discountExpiry = buildMockExpiryDate(5);
    const cashbackExpiry = buildMockExpiryDate(10);
    const internationalExpiry = buildMockExpiryDate(3);
    const liveStart = buildMockExpiryDate(2, 20, 0);

    return [
        {
            id: '1',
            code: 'FREESHIP001',
            type: 'shipping',
            title: 'Miễn phí vận chuyển',
            subtitle: 'Đơn tối thiểu ₫0 - Ưu đãi phí vận chuyển',
            brandLogo: null,
            brandName: undefined,
            percentageUsed: 30,
            showProgress: false,
            expiryDate: shippingExpiry,
            expiryText: formatExpiryText(shippingExpiry),
            isExpiringSoon: false,
            status: 'collect',
            tags: ['FREESHIP', 'EXTRA'],
            discountType: 'SHIPPING',
            discountValue: 0,
        },
        {
            id: '2',
            code: 'DISCOUNT10',
            type: 'discount',
            title: 'Giảm tối đa ₫50k',
            subtitle: 'Đơn tối thiểu ₫300k - Mọi hình thức',
            brandLogo: null,
            brandName: undefined,
            percentageUsed: 85,
            showProgress: true,
            expiryDate: discountExpiry,
            expiryText: formatExpiryText(discountExpiry),
            isExpiringSoon: false,
            status: 'use',
            tags: ['HOT'],
            discountType: 'PERCENTAGE',
            discountValue: 10,
            maxDiscount: 50000,
            minOrderValue: 300000,
        },
        {
            id: '3',
            code: 'CASHBACK50K',
            type: 'cashback',
            title: 'Hoàn 50k Xu',
            subtitle: 'Cho đơn hàng từ ₫5tr',
            brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNqZdQwNzkuLgwoNvjGoSP13SBu1hT2h3r9zxuHOlytBYjoYo2_wFfRxVkG-6wvDhbFK97b4-z23vqr23FGrQ9iv5yadvgU0ud8RG1peSvf7lIof9-QOSf_LBMlglEE07yTdIUXI933gASBfO5pPk_P0vTYPZ8p3RX8lx3P6l3iVz0ESFJd109ySwPhN1f41RnERFkx9K30nPmjhTLPrbfb53lu0W73zc0JtpM-Zyg2msJLVtTJTMD61xteE98ET0viwh1QXjqZ7Q',
            brandName: 'Apple Official',
            percentageUsed: 20,
            showProgress: false,
            expiryDate: cashbackExpiry,
            expiryText: formatExpiryText(cashbackExpiry),
            isExpiringSoon: false,
            status: 'collect',
            tags: [],
            discountType: 'FIXED_AMOUNT',
            discountValue: 50000,
            minOrderValue: 5000000,
        },
        {
            id: '4',
            code: 'INTL20K',
            type: 'international',
            title: 'Giảm ₫20k phí ship',
            subtitle: 'Đơn hàng quốc tế từ ₫99k',
            brandLogo: null,
            brandName: undefined,
            percentageUsed: 60,
            showProgress: true,
            expiryDate: internationalExpiry,
            expiryText: formatExpiryText(internationalExpiry),
            isExpiringSoon: false,
            status: 'collected',
            tags: [],
            discountType: 'FIXED_AMOUNT',
            discountValue: 20000,
            minOrderValue: 99000,
        },
        {
            id: '5',
            code: 'LIVE25K',
            type: 'live',
            title: 'Giảm ₫25k',
            subtitle: 'Chỉ áp dụng sản phẩm trong Live',
            brandLogo: null,
            brandName: undefined,
            percentageUsed: 0,
            showProgress: false,
            expiryDate: liveStart,
            expiryText: formatLiveStartText(liveStart),
            isExpiringSoon: false,
            status: 'reminder',
            tags: ['LIVE'],
            discountType: 'FIXED_AMOUNT',
            discountValue: 25000,
        },
    ];
};

const createMockFeaturedVoucher = (): VoucherUI => {
    const featuredExpiry = buildMockDateHoursFromNow(6);

    return {
        id: 'featured-1',
        code: 'LOREAL50',
        type: 'discount',
        title: 'Giảm 50%',
        subtitle: 'Đơn tối thiểu 200k - Giảm tối đa 50k',
        brandLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdTkA1Y5tiztuzhD5_K3RToLQk859nWHyKiBkpj3547GCw-l616Nny_KNRWmUlkFvYHdij6qaSiQNGoQwJ4XayTacXSiOgBu6lnuYo6sExvpVzOxV34EbZEXUGN9QY_PLnqaPN_yqnCDyiYB1pqyMrfkXKrBY2lfz9oJ8NMCwCXQxbwga6dHzDZLrNDbFVZ7Y2lsrtxoRFUGG-2E-_qGahu6Vfgv93uxywfnb_RhC5BgS1HNEVb1S9UzpuZATgtKO7KWAOItBOV3k',
        brandName: "L'Oréal",
        percentageUsed: 75,
        showProgress: true,
        expiryDate: featuredExpiry,
        expiryText: formatExpiryText(featuredExpiry),
        isExpiringSoon: true,
        status: 'collect',
        tags: ['AI_PICK'],
        discountType: 'PERCENTAGE',
        discountValue: 50,
        maxDiscount: 50000,
        minOrderValue: 200000,
    };
};

// ============================================
// TYPES
// ============================================

export type SortOption = 'popular' | 'newest' | 'expiring';

interface UseVoucherListResult {
    // Data
    vouchers: VoucherUI[];
    featuredVoucher: VoucherUI | null;
    isLoading: boolean;
    error: Error | null;

    // Filter state
    activeTab: string;
    tabs: VoucherFilterTab[];
    setActiveTab: (tabId: string) => void;

    // Sort state
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;

    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Actions
    collectVoucher: (id: string) => Promise<void>;
    handleUseVoucher: (id: string) => void;
    setReminder: (id: string) => Promise<void>;

    // Refresh
    refetch: () => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export const useVoucherList = (): UseVoucherListResult => {
    // State
    const [vouchers, setVouchers] = useState<VoucherUI[]>(() => createMockVouchers());
    const [featuredVoucher, setFeaturedVoucher] = useState<VoucherUI | null>(() => createMockFeaturedVoucher());
    const [isLoading, setIsLoading] = useState(false);
    const [error] = useState<Error | null>(null);

    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [searchQuery, setSearchQuery] = useState('');

    // Memoized filtered & sorted vouchers
    const filteredVouchers = useMemo(() => {
        let result = [...vouchers];

        // Filter by type based on active tab
        const activeTabConfig = VOUCHER_FILTER_TABS.find(t => t.id === activeTab);
        if (activeTabConfig?.type) {
            result = filterVouchersByType(result, activeTabConfig.type);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(v =>
                v.title.toLowerCase().includes(query) ||
                v.subtitle.toLowerCase().includes(query) ||
                v.code.toLowerCase().includes(query) ||
                (v.brandName?.toLowerCase().includes(query) ?? false)
            );
        }

        // Sort
        result = sortVouchers(result, sortBy);

        return result;
    }, [vouchers, activeTab, searchQuery, sortBy]);

    // Actions
    const collectVoucher = useCallback(async (id: string) => {
        // Optimistic update
        setVouchers(prev => prev.map(v =>
            v.id === id ? { ...v, status: 'use' as const } : v
        ));

        // Also update featured if it matches
        setFeaturedVoucher(prev =>
            prev?.id === id ? { ...prev, status: 'use' as const } : prev
        );

        // TODO: Call API
        // try {
        //     await api.collectVoucher(id);
        // } catch (error) {
        //     // Rollback on error
        //     setVouchers(prev => prev.map(v =>
        //         v.id === id ? { ...v, status: 'collect' as const } : v
        //     ));
        //     throw error;
        // }
    }, []);

    const handleUseVoucher = useCallback((id: string) => {
        // Navigate to checkout or show usage modal
        log.info('Use voucher:', id);
    }, []);

    const setReminder = useCallback(async (id: string) => {
        // TODO: Call API to set reminder
        log.info('Set reminder for:', id);
    }, []);

    const refetch = useCallback(() => {
        setIsLoading(true);
        // TODO: Fetch from API
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    return {
        vouchers: filteredVouchers,
        featuredVoucher,
        isLoading,
        error,

        activeTab,
        tabs: VOUCHER_FILTER_TABS,
        setActiveTab,

        sortBy,
        setSortBy,

        searchQuery,
        setSearchQuery,

        collectVoucher,
        handleUseVoucher,
        setReminder,

        refetch,
    };
};

export default useVoucherList;

