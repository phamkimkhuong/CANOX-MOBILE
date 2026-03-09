import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

// ============================================
// ZOD SCHEMAS (API Validation)
// ============================================

// Schema cho từng Item trong giỏ (từ API /api/v1/cart)
export const CartItemSchema = z.object({
    id: z.string(),
    productId: z.string().nullable().optional(),
    variantId: z.string(),
    productName: z.string().nullable().optional().default(''),
    variantAttributes: z.string().nullable().optional().default(''),
    shopId: z.string().nullable().optional(),
    imagePath: z.string().nullable().optional(),

    // Pricing
    priceBeforeDiscount: z.number().nullable().optional().default(0),
    unitPrice: z.number().nullable().optional().default(0),
    quantity: z.number().nullable().optional().default(1),
    totalPrice: z.number().nullable().optional().default(0),
    promotion: z.object({
        discountPercent: z.number().nullable().optional(),
        campaignType: z.string().nullable().optional(),
        stockRemaining: z.number().nullable().optional(),
        secondsRemaining: z.number().nullable().optional(),
    }).nullable().optional(),

    // Selection (Server-managed)
    selectedForCheckout: z.boolean().nullable().optional().default(false),

    // Stock Management
    availableStock: z.number().nullable().optional().default(0),
    stockStatus: z.string().nullable().optional().default('IN_STOCK'),

    // Region / Address filtering
    availableRegions: z.array(z.string()).nullable().optional().default([]),
    regionLabel: z.string().nullable().optional(),
});

// Schema cho Shop trong giỏ
export const CartShopSchema = z.object({
    shopId: z.string(),
    shopName: z.string().nullable().optional().default(''),
    logoPath: z.string().nullable().optional(),
    items: z.array(CartItemSchema).default([]),

    // Shop totals (from API)
    discount: z.number().nullable().optional().default(0),

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
    discountValue: z.number().nullable().optional().default(0),
    minOrderAmount: z.number().nullable().optional().default(0),
    isApplicable: z.boolean().nullable().optional().default(true),
    discountType: z.string().nullable().optional(),
    expiresAt: z.string().nullable().optional(),
});

export const CartResponseSchema = z.object({
    id: z.string(),
    itemCount: z.number().nullable().optional().default(0),
    shops: z.array(CartShopSchema).default([]),
});

// Add To Cart Response
export const AddToCartResponseSchema = CartItemSchema;

// Full API Response Wrapper
export const CartApiResponseSchema = ResponseDefaultSchema.extend({
    message: z.string().nullable().optional(),
    data: CartResponseSchema.nullable().optional(),
});

export const AddToCartApiResponseSchema = ResponseDefaultSchema.extend({
    data: AddToCartResponseSchema.nullable().optional(),
});
// ============================================
// INFERRED TYPES (API Response)
// ============================================

export type CartItem = z.infer<typeof CartItemSchema>;
export type CartShop = z.infer<typeof CartShopSchema>;
export type Voucher = z.infer<typeof VoucherSchema>;
export type CartResponse = z.infer<typeof CartResponseSchema>;
export type AddToCartResponse = z.infer<typeof AddToCartResponseSchema>;

// ============================================
// UI TYPES (For Rendering & Client State)
// ============================================
/**
 * CartItemUI - Extended item for UI rendering
 * Includes calculated fields and display-ready data
 */
export interface CartItemUI {
    id: string;
    productId: string;
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
    isOutOfStock: boolean;
    maxQuantity: number;

    // Low stock warning
    lowStockWarning: {
        text: string;        // "Chỉ còn 3 sản phẩm" or "Còn 8 sản phẩm"
        isUrgent: boolean;   // true = red color, false = orange color
    } | null;

    // Discount
    originalPrice: number | null;

    // Active Promotion
    promotion: {
        campaignType: string;
        discountPercent: number;
        stockRemaining: number;
        secondsRemaining: number;
    } | null;

    // Region Delivery
    availableRegions: string[];
    regionLabel: string | null;
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
    discount: number;

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

    // Extended fields for rich voucher display
    discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue?: number;
    maxDiscount?: number | null;
    maxDiscountDisplay?: string;
    maxUsage?: number | null;
    calculatedDiscount?: number | null;
    reason?: string | null;
}

/**
 * CartUI - Full cart state for UI
 */
export interface CartUI {
    itemCount: number;
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