import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

// ============================================
// ZOD SCHEMAS (API Validation)
// ============================================

// Schema cho từng Item trong giỏ (từ API /api/v1/cart)
export const CartItemSchema = z.object({
    id: z.string(),
    cartId: z.string(),
    variantId: z.string(),
    version: z.number(),
    productName: z.string(),
    sku: z.string(),
    variantAttributes: z.string().nullable().optional(),
    shopId: z.string(),
    shopName: z.string(),
    shopLogo: z.string().nullable().optional(),
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),

    // Pricing
    unitPrice: z.number(),
    discountAmount: z.number(),
    quantity: z.number(),
    totalPrice: z.number(),

    // Selection (Server-managed)
    selectedForCheckout: z.boolean(),

    // Stock Management
    availableStock: z.number(),
    stockStatus: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']),
    stockMessage: z.string(),
    previousQuantity: z.number().nullable().optional(),
});

// Schema cho Shop trong giỏ
export const CartShopSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    shopLogo: z.string().nullable().optional(),
    ownerName: z.string().nullable().optional(),
    isVerified: z.boolean().nullable().optional(),
    rating: z.number().nullable().optional(),
    items: z.array(CartItemSchema),

    // Shop-level aggregates (from API)
    itemCount: z.number(),
    totalQuantity: z.number(),
    subtotal: z.number(),
    discount: z.number(),
    total: z.number(),

    // Selection state (Server-managed)
    allSelected: z.boolean(),
    hasSelectedItems: z.boolean(),
});

// Schema cho Voucher
export const VoucherSchema = z.object({
    id: z.string(),
    code: z.string(),
    title: z.string(),
    description: z.string().optional(),
    discountType: z.enum(['fixed', 'percentage']),
    discountValue: z.number(),
    minOrderAmount: z.number(),
    maxDiscountAmount: z.number().optional(),
    expiresAt: z.string().optional(),
    isApplicable: z.boolean().optional(),
});

// Schema cho toàn bộ Giỏ hàng (Root - từ API)
export const CartResponseSchema = z.object({
    id: z.string(),
    buyerId: z.string(),
    currency: z.string(),
    totalAmount: z.number(),
    totalDiscount: z.number(),
    itemCount: z.number(),
    createdDate: z.string(),
    lastModifiedDate: z.string(),
    version: z.number(),
    shops: z.array(CartShopSchema),
    shopCount: z.number(),
    warnings: z.array(z.any()).optional(),
    hasChanges: z.boolean().nullish(),
});

// Full API Response Wrapper
export const CartApiResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: CartResponseSchema,
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