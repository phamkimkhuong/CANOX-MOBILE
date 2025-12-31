import { z } from 'zod';

// ============================================
// ZOD SCHEMAS (API Validation)
// ============================================

// Schema cho từng Item trong giỏ (dựa trên JSON items)
export const CartItemSchema = z.object({
    id: z.string(),
    variantId: z.string(),
    productName: z.string(),
    sku: z.string().optional(),
    variantAttributes: z.string().optional(),
    unitPrice: z.number(),
    quantity: z.number(),
    totalPrice: z.number(),
    shopId: z.string(),
    shopName: z.string(),
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),
    // Extended fields from API
    originalPrice: z.number().optional(),
    discountPercent: z.number().optional(),
    isOutOfStock: z.boolean().optional(),
    maxQuantity: z.number().optional(),
});

// Schema cho Shop trong giỏ
export const CartShopSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    items: z.array(CartItemSchema),
    itemCount: z.number(),
    // Extended fields
    shopAvatarUrl: z.string().optional(),
    isMall: z.boolean().optional(),
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

// Schema cho toàn bộ Giỏ hàng (Root)
export const CartResponseSchema = z.object({
    id: z.string(),
    totalAmount: z.number(),
    itemCount: z.number(),
    shops: z.array(CartShopSchema),
    // Extended fields
    availableShopVouchers: z.array(VoucherSchema).optional(),
    availablePlatformVouchers: z.array(VoucherSchema).optional(),
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
    variantId: string;
    productName: string;
    variantAttributes: string; // "Màu: Trắng, Size: L"
    imageUrl: string;
    unitPrice: number;
    originalPrice: number | null;
    discountPercent: number | null;
    quantity: number;
    maxQuantity: number;
    isOutOfStock: boolean;
    shopId: string;
}

/**
 * CartShopUI - Shop group for UI rendering
 */
export interface CartShopUI {
    shopId: string;
    shopName: string;
    shopAvatarUrl: string | null;
    isMall: boolean;
    items: CartItemUI[];
    /** Voucher đang được áp dụng cho shop này */
    appliedVoucherId: string | null;
    /** Danh sách voucher có thể chọn */
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
}