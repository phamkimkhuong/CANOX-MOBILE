import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

// ============================================
// ZOD SCHEMAS (API Validation)
// ============================================

// Schema cho từng Item trong giỏ (từ API /api/v1/cart)
export const CartItemSchema = z.object({
    id: z.string(),
    cartId: z.string().nullable().optional(),
    variantId: z.string(),
    version: z.number().nullable().optional().default(0),
    productName: z.string().nullable().optional().default(''),
    sku: z.string().nullable().optional().default(''),
    variantAttributes: z.string().nullable().optional().default(''),
    shopId: z.string().nullable().optional(),
    shopName: z.string().nullable().optional().default(''),
    shopLogo: z.string().nullable().optional(),
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),

    // Pricing
    priceBeforeDiscount: z.number().nullable().optional().default(0),
    unitPrice: z.number().nullable().optional().default(0),
    priceAtAddTime: z.number().nullable().optional(),
    quantity: z.number().nullable().optional().default(1),
    totalPrice: z.number().nullable().optional().default(0),
    discountAmount: z.number().nullable().optional().default(0),
    promotion: z.any().nullable().optional(),

    // Selection (Server-managed)
    selectedForCheckout: z.boolean().nullable().optional().default(false),

    // Stock Management
    availableStock: z.number().nullable().optional().default(0),
    stockStatus: z.string().nullable().optional().default('IN_STOCK'),
    stockMessage: z.string().nullable().optional().default(''),
    previousQuantity: z.number().nullable().optional(),
});

// Schema cho Shop trong giỏ
export const CartShopSchema = z.object({
    shopId: z.string(),
    shopName: z.string().nullable().optional().default(''),
    shopLogo: z.string().nullable().optional(),
    ownerName: z.string().nullable().optional(),
    isVerified: z.boolean().nullable().optional(),
    rating: z.number().nullable().optional(),
    items: z.array(CartItemSchema).default([]),

    // Shop-level aggregates (from API)
    itemCount: z.number().nullable().optional().default(0),
    totalQuantity: z.number().nullable().optional().default(0),
    subtotal: z.number().nullable().optional().default(0),
    discount: z.number().nullable().optional().default(0),
    total: z.number().nullable().optional().default(0),

    // Selection state (Server-managed)
    allSelected: z.boolean().nullable().optional().default(false),
    hasSelectedItems: z.boolean().nullable().optional().default(false),
});

// Schema cho Voucher
export const VoucherSchema = z.object({
    id: z.string(),
    code: z.string().nullable().optional().default(''),
    title: z.string().nullable().optional().default(''),
    description: z.string().nullable().optional().default(''),
    discountType: z.string().nullable().optional().default('fixed'),
    discountValue: z.number().nullable().optional().default(0),
    minOrderAmount: z.number().nullable().optional().default(0),
    maxDiscountAmount: z.number().nullable().optional(),
    expiresAt: z.string().nullable().optional(),
    isApplicable: z.boolean().nullable().optional().default(true),
});

// Schema cho toàn bộ Giỏ hàng (Root - từ API)
export const CartResponseSchema = z.object({
    id: z.string(),
    buyerId: z.string().nullable().optional(),
    currency: z.string().nullable().optional().default('VND'),
    totalAmount: z.number().nullable().optional().default(0),
    totalDiscount: z.number().nullable().optional().default(0),
    itemCount: z.number().nullable().optional().default(0),
    createdDate: z.string().nullable().optional().default(''),
    lastModifiedDate: z.string().nullable().optional().default(''),
    version: z.number().nullable().optional().default(0),
    shops: z.array(CartShopSchema).default([]),
    shopCount: z.number().nullable().optional().default(0),
    warnings: z.array(z.string()).nullable().optional().default([]),
    hasChanges: z.boolean().nullable().optional().default(false),
});

// Full API Response Wrapper
export const CartApiResponseSchema = ResponseDefaultSchema.extend({
    message: z.string().nullable().optional(),
    data: CartResponseSchema.nullable().optional(),
});
// ============================================
// INFERRED TYPES (API Response)
// ============================================

export type CartItem = z.infer<typeof CartItemSchema>;
export type CartShop = z.infer<typeof CartShopSchema>;
export type Voucher = z.infer<typeof VoucherSchema>;
export type CartResponse = z.infer<typeof CartResponseSchema>;

// ============================================
// UI TYPES (For Rendering & Client State)
// ============================================

/**
 * CartItemUI - Extended item for UI rendering
 * Includes calculated fields and display-ready data
 */
export interface CartItemUI {
    id: string;
    version: number; // For concurrency control (If-Match header)
    variantId: string;
    productName: string;
    variantAttributes: string;
    imageUrl: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    shopId: string;

    // Server-managed selection
    selectedForCheckout: boolean;

    // Stock management
    availableStock: number;
    stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    stockMessage: string;
    isOutOfStock: boolean;
    maxQuantity: number;

    // Discount
    discountAmount: number;
    originalPrice: number | null;
    discountPercent: number | null;
}

/**
 * CartShopUI - Shop group for UI rendering
 */
export interface CartShopUI {
    shopId: string;
    shopName: string;
    shopLogoUrl: string | null;
    items: CartItemUI[];

    // Shop totals (from API)
    itemCount: number;
    totalQuantity: number;
    subtotal: number;
    discount: number;
    total: number;

    // Selection state (Server-managed)
    allSelected: boolean;
    hasSelectedItems: boolean;

    // Voucher (Client state - optional feature)
    appliedVoucherId: string | null;
    availableVouchers: VoucherUI[];
}

/**
 * VoucherUI - Voucher for UI rendering
 */
export interface VoucherUI {
    id: string;
    code: string;
    title: string;
    description: string;
    discountDisplay: string; // "Giảm 15k" or "Giảm 10%"
    minOrderDisplay: string; // "Đơn từ 200k"
    isApplicable: boolean;
    expiresAt: string | null;
    category?: 'SHIPPING' | 'DISCOUNT';
}

/**
 * CartUI - Full cart state for UI
 */
export interface CartUI {
    shops: CartShopUI[];
    platformVouchers: VoucherUI[];
    appliedPlatformVoucherId: string | null;
}

// ============================================
// SELECTION & CALCULATION TYPES
// ============================================

/**
 * CheckboxState - Trạng thái của checkbox 3 tầng
 */
export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate';

/**
 * CartSelectionState - Client state for item selection
 * Stored in Zustand, NOT derived from server
 */
export interface CartSelectionState {
    /** Set of selected item IDs */
    selectedItemIds: Set<string>;
}

/**
 * CartCalculationResult - Kết quả tính toán giá tiền
 * Derived state - KHÔNG lưu vào store
 */
export interface CartCalculationResult {
    /** Tổng tiền hàng gốc (chưa giảm) */
    subtotal: number;
    /** Tổng giảm giá từ Shop Vouchers */
    shopVoucherDiscount: number;
    /** Giảm giá từ Platform Voucher */
    platformVoucherDiscount: number;
    /** Tổng tiền phải trả */
    totalAmount: number;
    /** Số tiền tiết kiệm được */
    totalSavings: number;
    /** Số item đang chọn */
    selectedCount: number;
    /** Có item nào hết hàng không */
    hasOutOfStockItems: boolean;
    /** Đang trong quá trình tính toán (loading animation) */
    isCalculating?: boolean;
}