/**
 * Checkout Domain Types
 * 
 * Types specific to the Checkout flow.
 * This is a "Draft Session" - state exists only during checkout process.
 * 
 * Key Concepts:
 * 1. CheckoutSession: Temporary state derived from selected Cart items
 * 2. ShippingMethod: Different delivery options per shop
 * 3. PaymentMethod: COD or Digital Wallet
 * 4. VoucherValidation: Logic for voucher stacking & auto-removal
 */

import type { ShippingAddress } from '@/types/address';
import type { CartItemUI, VoucherUI } from './cart';

// ============================================
// SHIPPING TYPES
// ============================================

/**
 * ShippingMethodType - Các loại hình vận chuyển
 */
export type ShippingMethodType = 'standard' | 'fast' | 'express' | 'supper_ship';

/**
 * ShippingMethod - Thông tin một phương thức vận chuyển
 */
export interface ShippingMethod {
    id: string;
    type: ShippingMethodType;
    name: string; // "Nhanh", "Hỏa tốc", "Tiết kiệm"
    description: string; // "Nhận hàng vào 25 Th10"
    estimatedDays: number; // Số ngày dự kiến
    fee: number; // Phí ship
    isFreeShip?: boolean;
    /** Phí ship gốc trước khi giảm */
    originalFee?: number;
}

/**
 * Cấu hình hiển thị cho phương thức vận chuyển
 */
export interface ShippingMethodConfig {
    icon: string;
    color: string;
    label: string;
}

/**
 * Map cấu hình mặc định theo type
 */
export const SHIPPING_CONFIG: Record<ShippingMethodType, ShippingMethodConfig> = {
    standard: {
        icon: 'cube-outline',
        color: '#3b82f6', // theme.colors.primary (mặc định blue)
        label: 'Tiết kiệm',
    },
    fast: {
        icon: 'bicycle-outline',
        color: '#10B981', // emerald
        label: 'Nhanh',
    },
    supper_ship: {
        icon: 'shipping',
        color: '#3b82f6',
        label: 'Tiêu chuẩn',
    },
    express: {
        icon: 'flash',
        color: '#F59E0B', // amber
        label: 'Hỏa tốc',
    },
};

/**
 * Helper để lấy cấu hình hiển thị cho một phương thức vận chuyển
 */
export const getShippingMethodConfig = (method?: ShippingMethod | null): ShippingMethodConfig => {
    if (!method) {
        return SHIPPING_CONFIG.standard;
    }

    const name = method.name.toLowerCase();

    // Ưu tiên check theo tên cho các đơn vị vận chuyển VN phổ biến
    if (method.type === 'express' || name.includes('hỏa tốc')) {
        return SHIPPING_CONFIG.express;
    }
    if (method.type === 'fast' || name.includes('nhanh')) {
        return SHIPPING_CONFIG.fast;
    }
    if (method.type === 'supper_ship' || name.includes('tiêu chuẩn')) {
        return SHIPPING_CONFIG.supper_ship;
    }
    return SHIPPING_CONFIG.standard;
};

/**
 * ShopShippingOptions - Danh sách shipping options cho 1 shop
 */
export interface ShopShippingOptions {
    shopId: string;
    methods: ShippingMethod[];
    /** Method đang được chọn */
    selectedMethodId: string;
    /** Đang loading shipping options */
    isLoading: boolean;
}

// ============================================
// PAYMENT TYPES
// ============================================

/**
 * PaymentMethodType - Các phương thức thanh toán
 */
export type PaymentMethodType = 'cod' | 'bank_transfer' | 'e_wallet' | 'credit_card';

/**
 * PaymentMethod - Thông tin phương thức thanh toán
 */
export interface PaymentMethod {
    id: PaymentMethodType;
    name: string; // "Thanh toán khi nhận hàng"
    description: string;
    icon: string; // Icon name
    isAvailable: boolean;
    /** Số dư ví (nếu là e_wallet) */
    balance?: number;
}

// ============================================
// ADDRESS TYPES
// ============================================

// Use ShippingAddress as the unified address type
// DeliveryAddress is deprecated - use ShippingAddress instead
export type { ShippingAddress } from '@/types/address';

/**
 * Format địa chỉ đầy đủ cho hiển thị
 */
export const formatFullAddress = (address: ShippingAddress): string => {
    return [
        address.streetAddress,
        address.wardName,
        address.provinceName,
    ].filter(Boolean).join(', ');
};

// ============================================
// CHECKOUT SESSION TYPES
// ============================================

/**
 * CheckoutItemUI - Item trong checkout (simplified CartItemUI)
 * Không có checkbox, không có quantity stepper
 */
export interface CheckoutItemUI {
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    variantAttributes: string;
    imageUrl: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    shopId: string;
    promotionId: string | null;
}

/**
 * CheckoutShopUI - Shop group trong checkout
 */
export interface CheckoutShopUI {
    shopId: string;
    shopName: string;
    shopLogo?: string;
    items: CheckoutItemUI[];
    /** Shipping options cho shop này */
    shippingOptions: ShopShippingOptions;
    /** Voucher đang áp dụng */
    appliedVoucherId: string | null;
    /** Available shop vouchers */
    availableVouchers: VoucherUI[];
    note: string;
    loyaltyPoints: number;
}

/**
 * Transform CartItemUI -> CheckoutItemUI
 */
export const toCheckoutItem = (cartItem: CartItemUI): CheckoutItemUI => ({
    id: cartItem.id,
    productId: '', // CartItemUI missing productId, should be populated from API if possible
    variantId: cartItem.variantId,
    productName: cartItem.productName,
    variantAttributes: cartItem.variantAttributes,
    imageUrl: cartItem.imageUrl,
    unitPrice: cartItem.unitPrice,
    quantity: cartItem.quantity,
    lineTotal: cartItem.totalPrice,
    shopId: cartItem.shopId,
    promotionId: null,
});

// ============================================
// VOUCHER VALIDATION TYPES
// ============================================

/**
 * VoucherValidationResult - Kết quả validate voucher
 * Xử lý case: Voucher bị văng khi không đủ điều kiện
 */
export interface VoucherValidationResult {
    isValid: boolean;
    /** Lý do không valid */
    invalidReason?: string;
    /** Số tiền giảm thực tế */
    discountAmount: number;
    /** Voucher có bị auto-remove không */
    shouldAutoRemove: boolean;
}

/**
 * VoucherType - Phân loại voucher để xử lý stacking
 */
export type VoucherType = 'shop_discount' | 'platform_discount' | 'free_shipping';

// ============================================
// CHECKOUT CALCULATION TYPES
// ============================================

/**
 * ShopSubtotal - Tính toán cho từng shop
 */
export interface ShopSubtotal {
    shopId: string;
    /** Tổng tiền hàng của shop */
    itemsTotal: number;
    /** Phí ship của shop */
    shippingFee: number;
    /** Giảm giá từ shop voucher */
    shopVoucherDiscount: number;
    /** Tổng sau giảm giá shop */
    shopTotal: number;
    /** Số lượng item */
    itemCount: number;
}

/**
 * CheckoutCalculationResult - Kết quả tính toán checkout
 * Derived state - KHÔNG lưu vào store
 */
export interface CheckoutCalculationResult {
    /** Tổng tiền hàng tất cả shop */
    subtotal: number;
    totalShippingFee: number;
    totalShopVoucherDiscount: number;
    platformVoucherDiscount: number;
    shippingDiscount: number;
    appliedPlatformVoucherId?: string | null;
    appliedShippingVoucherId?: string | null;
    /** Tổng tiền phải trả */
    totalAmount: number;
    /** Tổng thuế */
    taxAmount: number;
    /** Tổng tiền tiết kiệm */
    totalSavings: number;
    /** Tổng số item */
    totalItemCount: number;
    /** Chi tiết từng shop */
    shopSubtotals: ShopSubtotal[];
    /** Có đang loading shipping fee không */
    isCalculatingShipping: boolean;
    /** Platform voucher có valid không (để hiển thị warning) */
    platformVoucherValidation: VoucherValidationResult | null;
    /** Tổng điểm loyalty quy đổi của toàn đơn hàng */
    loyaltyPoints: number;
}
