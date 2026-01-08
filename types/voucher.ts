import { z } from 'zod';
import { createPaginatedResponseSchema } from './responseSchema';

// ============================================
// VOUCHER ENUMS & CONSTANTS
// ============================================

/**
 * Loại voucher - Quyết định icon/màu sắc hiển thị
 */
export const VoucherType = {
    SHIPPING: 'shipping',       // Freeship - Màu xanh lá
    DISCOUNT: 'discount',       // Giảm giá % - Màu cam
    CASHBACK: 'cashback',       // Hoàn xu - Màu vàng
    INTERNATIONAL: 'international', // Quốc tế - Màu tím
    LIVE: 'live',               // Live stream - Màu hồng
    SHOP: 'shop',               // Voucher shop - Màu xanh dương
} as const;

export type VoucherType = (typeof VoucherType)[keyof typeof VoucherType];

/**
 * Trạng thái nút voucher
 * - collect: Có thể lưu (Hiện nút "Lưu" màu nổi)
 * - use: Đã lưu, có thể dùng (Hiện nút "Dùng ngay")
 * - collected: Đã lưu, chờ dùng (Hiện "Đã lưu" màu xám)
 * - expired: Hết hạn (Disabled)
 * - soldout: Hết lượt (Disabled)
 * - reminder: Voucher live sắp diễn ra (Hiện "Nhắc tôi")
 */
export const VoucherStatus = {
    COLLECT: 'collect',
    USE: 'use',
    COLLECTED: 'collected',
    EXPIRED: 'expired',
    SOLDOUT: 'soldout',
    REMINDER: 'reminder',
} as const;

export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus];

/**
 * Cấu hình màu sắc cho từng loại voucher
 */
export interface VoucherTypeConfig {
    type: VoucherType;
    bgColor: string;
    textColor: string;
    icon: string;
    label: string;
}

export const VOUCHER_TYPE_CONFIG: Record<VoucherType, VoucherTypeConfig> = {
    shipping: {
        type: 'shipping',
        bgColor: '#26aa99',
        textColor: '#ffffff',
        icon: 'shipping',
        label: 'FREESHIP',
    },
    discount: {
        type: 'discount',
        bgColor: '#f97316',
        textColor: '#ffffff',
        icon: 'percent',
        label: 'Giảm giá',
    },
    cashback: {
        type: 'cashback',
        bgColor: '#eab308',
        textColor: '#ffffff',
        icon: 'cash',
        label: 'Hoàn Xu',
    },
    international: {
        type: 'international',
        bgColor: '#8b5cf6',
        textColor: '#ffffff',
        icon: 'airplane',
        label: 'Quốc tế',
    },
    live: {
        type: 'live',
        bgColor: '#f43f5e',
        textColor: '#ffffff',
        icon: 'videocam',
        label: 'LIVE',
    },
    shop: {
        type: 'shop',
        bgColor: '#3b82f6',
        textColor: '#ffffff',
        icon: 'store',
        label: 'Shop',
    },
};

// ============================================
// ZOD SCHEMAS - Validate API Response
// ============================================

/**
 * Voucher từ API Response
 */
export const VoucherResponseSchema = z.object({
    id: z.string(),
    code: z.string(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    voucherScope: z.enum(['SHOP_ORDER', 'PLATFORM_ORDER', 'PRODUCT', 'CATEGORY']).nullable().optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'SHIPPING']),
    discountValue: z.number(),
    maxDiscount: z.number().nullable().optional(),
    minOrderValue: z.number().nullable().optional(),
    sponsorType: z.enum(['PLATFORM', 'SHOP']).nullable().optional(),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    // Usage tracking
    totalQuantity: z.number().nullable().optional(),
    usedQuantity: z.number().nullable().optional(),
    remainingQuantity: z.number().nullable().optional(),
    // User state
    isCollected: z.boolean().nullable().optional(),
    isUsed: z.boolean().nullable().optional(),
    // Brand/Shop info
    brandLogo: z.string().nullable().optional(),
    brandName: z.string().nullable().optional(),
    shopId: z.string().nullable().optional(),
    shopName: z.string().nullable().optional(),
    // Tags
    tags: z.array(z.string()).nullable().optional(),
});

export type VoucherResponse = z.infer<typeof VoucherResponseSchema>;

/**
 * Voucher list response from API
 */
export const VoucherListResponseSchema = createPaginatedResponseSchema(VoucherResponseSchema);

// ============================================
// UI MODELS - Đã transform cho render
// ============================================

/**
 * Voucher UI Model - Đã chuẩn hóa từ API
 */
export interface VoucherUI {
    id: string;
    code: string;
    type: VoucherType;
    // Display info
    title: string;              // "Giảm 15k" hoặc "Miễn phí vận chuyển"
    subtitle: string;           // "Đơn tối thiểu 50k"
    description?: string;       // Mô tả chi tiết
    // Brand/Shop
    brandLogo?: string | null;
    brandName?: string;
    // Progress & FOMO
    percentageUsed: number;     // 0-100 để hiện thanh progress
    showProgress: boolean;      // Chỉ hiện khi > 50%
    // Expiry
    expiryDate?: string;
    expiryText: string;         // "HSD: 31/12/2023" hoặc "Hết hạn: 23:59 hôm nay"
    isExpiringSoon: boolean;    // < 24h -> Hiện màu đỏ
    // Status & Action
    status: VoucherStatus;
    // Tags
    tags: string[];
    // Original data for detail view
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'SHIPPING';
    discountValue: number;
    maxDiscount?: number | null;
    minOrderValue?: number;
}

/**
 * Filter tab item
 */
export interface VoucherFilterTab {
    id: string;
    label: string;
    type?: VoucherType;
    count?: number;
}

/**
 * Voucher list response from API
 */
export interface VoucherListResponse {
    vouchers: VoucherResponse[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ============================================
// FILTER TABS CONFIG
// ============================================

export const VOUCHER_FILTER_TABS: VoucherFilterTab[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'shipping', label: 'Vận chuyển', type: 'shipping' },
    { id: 'cashback', label: 'Hoàn Xu', type: 'cashback' },
    { id: 'international', label: 'Quốc tế', type: 'international' },
    { id: 'shop', label: 'Shop Mall', type: 'shop' },
];

// ============================================
// HELPER TYPES
// ============================================

/**
 * Props cho VoucherCard component
 */
export interface VoucherCardProps {
    voucher: VoucherUI;
    onCollect?: (id: string) => void;
    onUse?: (id: string) => void;
    onReminder?: (id: string) => void;
    onViewConditions?: (id: string) => void;
    backgroundColor?: string; // Để match với nền cha (cho răng cưa)
}

/**
 * Props cho Featured Voucher (AI Pick)
 */
export interface FeaturedVoucherProps {
    voucher: VoucherUI;
    onCollect?: (id: string) => void;
}

/**
 * Voucher action result
 */
export interface VoucherActionResult {
    success: boolean;
    message?: string;
    voucher?: VoucherUI;
}

