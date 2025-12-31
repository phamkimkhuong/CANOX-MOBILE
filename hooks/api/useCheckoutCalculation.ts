/**
 * useCheckoutCalculation Hook
 * 
 * Central hook for checkout price calculations.
 * SINGLE SOURCE OF TRUTH for all pricing in checkout.
 * 
 * Key Features:
 * 1. Real-time calculation as user changes shipping/vouchers
 * 2. Voucher validation with auto-removal warning
 * 3. Mock shipping fee calculation (to be replaced with API)
 * 4. Shop-level and platform-level discount stacking
 * 
 * CRITICAL: Prices are DERIVED, never stored in state.
 */

import { useCheckoutStore } from '@/store/useCheckoutStore';
import type { VoucherUI } from '@/types/cart';
import type {
    CheckoutCalculationResult,
    CheckoutShopUI,
    ShippingMethod,
    ShopSubtotal,
    VoucherValidationResult,
} from '@/types/checkout';
import { useCallback, useEffect, useMemo } from 'react';

// ============================================
// MOCK DATA - SHIPPING METHODS
// ============================================

/**
 * Mock shipping methods generator
 * In production: Call API based on shop location + delivery address
 */
export const generateMockShippingMethods = (shopId: string): ShippingMethod[] => {
    // Simulate different shipping options based on shopId
    const baseDeliveryDays = shopId.includes('001') ? 2 : 3;

    return [
        {
            id: `${shopId}-standard`,
            type: 'standard',
            name: 'Tiết kiệm',
            description: `Nhận hàng trong ${baseDeliveryDays + 3}-${baseDeliveryDays + 5} ngày`,
            estimatedDays: baseDeliveryDays + 4,
            fee: 15000,
        },
        {
            id: `${shopId}-fast`,
            type: 'fast',
            name: 'Nhanh',
            description: `Nhận hàng trong ${baseDeliveryDays}-${baseDeliveryDays + 2} ngày`,
            estimatedDays: baseDeliveryDays + 1,
            fee: 25000,
        },
        {
            id: `${shopId}-express`,
            type: 'express',
            name: 'Hỏa tốc',
            description: 'Nhận hàng trong 24h',
            estimatedDays: 1,
            fee: 45000,
        },
    ];
};

// ============================================
// VOUCHER VALIDATION
// ============================================

/**
 * Validate voucher against current order state
 * Handles the critical case: Voucher bị văng khi không đủ điều kiện
 */
const validateVoucher = (
    voucher: VoucherUI | undefined,
    applicableAmount: number,
    minOrderAmount: number
): VoucherValidationResult => {
    if (!voucher) {
        return {
            isValid: false,
            discountAmount: 0,
            shouldAutoRemove: false,
        };
    }

    // Check minimum order amount
    if (applicableAmount < minOrderAmount) {
        return {
            isValid: false,
            invalidReason: `Đơn hàng tối thiểu ${formatCurrencyShort(minOrderAmount)}`,
            discountAmount: 0,
            shouldAutoRemove: true, // Will be auto-removed
        };
    }

    // Calculate discount based on type
    const isPercentage = voucher.discountDisplay.includes('%');
    let discountAmount = 0;

    if (isPercentage) {
        const percent = parseInt(voucher.discountDisplay.replace(/[^\d]/g, ''), 10) || 0;
        discountAmount = Math.floor(applicableAmount * (percent / 100));
        // Cap at max discount if specified (parse from description or assume 50k)
        const maxDiscount = 50000; // Default cap
        discountAmount = Math.min(discountAmount, maxDiscount);
    } else {
        // Fixed amount (parse "15k" -> 15000)
        const amount = parseInt(voucher.discountDisplay.replace(/[^\d]/g, ''), 10) || 0;
        discountAmount = amount * 1000;
    }

    // Discount cannot exceed order amount
    discountAmount = Math.min(discountAmount, applicableAmount);

    return {
        isValid: true,
        discountAmount,
        shouldAutoRemove: false,
    };
};

/**
 * Format currency for validation messages
 */
const formatCurrencyShort = (amount: number): string => {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)}tr`;
    }
    if (amount >= 1000) {
        return `${Math.round(amount / 1000)}k`;
    }
    return `${amount}đ`;
};

// ============================================
// SHOP SUBTOTAL CALCULATION
// ============================================

/**
 * Calculate subtotal for a single shop
 */
const calculateShopSubtotal = (
    shop: CheckoutShopUI,
    shopVouchers: Map<string, string>
): ShopSubtotal => {
    // 1. Calculate items total
    const itemsTotal = shop.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    );
    const itemCount = shop.items.reduce((sum, item) => sum + item.quantity, 0);

    // 2. Get shipping fee from selected method
    const selectedMethod = shop.shippingOptions.methods.find(
        (m) => m.id === shop.shippingOptions.selectedMethodId
    );
    const shippingFee = selectedMethod?.fee ?? 0;

    // 3. Calculate shop voucher discount
    let shopVoucherDiscount = 0;
    const voucherId = shopVouchers.get(shop.shopId);
    if (voucherId) {
        const voucher = shop.availableVouchers.find((v) => v.id === voucherId);
        if (voucher) {
            // Parse min order from voucher (simplified)
            const minOrderMatch = voucher.minOrderDisplay.match(/(\d+)k/);
            const minOrder = minOrderMatch ? parseInt(minOrderMatch[1], 10) * 1000 : 0;

            const validation = validateVoucher(voucher, itemsTotal, minOrder);
            if (validation.isValid) {
                shopVoucherDiscount = validation.discountAmount;
            }
        }
    }

    // 4. Calculate shop total
    const shopTotal = itemsTotal + shippingFee - shopVoucherDiscount;

    return {
        shopId: shop.shopId,
        itemsTotal,
        shippingFee,
        shopVoucherDiscount,
        shopTotal: Math.max(0, shopTotal),
        itemCount,
    };
};

// ============================================
// MAIN CALCULATION FUNCTION
// ============================================

/**
 * Calculate entire checkout
 * This is the SINGLE SOURCE OF TRUTH for checkout pricing
 */
const calculateCheckoutTotal = (
    shops: CheckoutShopUI[],
    shopVouchers: Map<string, string>,
    platformVoucherId: string | null,
    platformVouchers: VoucherUI[],
    isLoadingShipping: Map<string, boolean>
): CheckoutCalculationResult => {
    // 1. Calculate each shop's subtotal
    const shopSubtotals = shops.map((shop) => calculateShopSubtotal(shop, shopVouchers));

    // 2. Aggregate totals
    const subtotal = shopSubtotals.reduce((sum, s) => sum + s.itemsTotal, 0);
    const totalShippingFee = shopSubtotals.reduce((sum, s) => sum + s.shippingFee, 0);
    const totalShopVoucherDiscount = shopSubtotals.reduce(
        (sum, s) => sum + s.shopVoucherDiscount,
        0
    );
    const totalItemCount = shopSubtotals.reduce((sum, s) => sum + s.itemCount, 0);

    // 3. Calculate platform voucher discount
    let platformVoucherDiscount = 0;
    let platformVoucherValidation: VoucherValidationResult | null = null;

    if (platformVoucherId) {
        const platformVoucher = platformVouchers.find((v) => v.id === platformVoucherId);
        if (platformVoucher) {
            // Platform voucher applies to (subtotal - shop discounts)
            const applicableAmount = subtotal - totalShopVoucherDiscount;

            // Parse min order (simplified - in production, store minOrderAmount in VoucherUI)
            const minOrderMatch = platformVoucher.minOrderDisplay.match(/(\d+)k/);
            const minOrder = minOrderMatch ? parseInt(minOrderMatch[1], 10) * 1000 : 0;

            platformVoucherValidation = validateVoucher(
                platformVoucher,
                applicableAmount,
                minOrder
            );

            if (platformVoucherValidation.isValid) {
                platformVoucherDiscount = platformVoucherValidation.discountAmount;
            }
        }
    }

    // 4. Shipping discount (from free ship voucher - simplified)
    // In production: Check for specific "free_shipping" voucher type
    const shippingDiscount = 0; // Placeholder

    // 5. Final calculation
    const totalAmount = Math.max(
        0,
        subtotal +
        totalShippingFee -
        totalShopVoucherDiscount -
        platformVoucherDiscount -
        shippingDiscount
    );

    const totalSavings =
        totalShopVoucherDiscount + platformVoucherDiscount + shippingDiscount;

    // 6. Check if any shipping is still loading
    let isCalculatingShipping = false;
    for (const isLoading of isLoadingShipping.values()) {
        if (isLoading) {
            isCalculatingShipping = true;
            break;
        }
    }

    return {
        subtotal,
        totalShippingFee,
        totalShopVoucherDiscount,
        platformVoucherDiscount,
        shippingDiscount,
        totalAmount,
        totalSavings,
        totalItemCount,
        shopSubtotals,
        isCalculatingShipping,
        platformVoucherValidation,
    };
};

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export interface UseCheckoutCalculationReturn {
    /** Calculation results (derived state) */
    calculation: CheckoutCalculationResult;
    /** Get subtotal for a specific shop */
    getShopSubtotal: (shopId: string) => ShopSubtotal | undefined;
    /** Check if platform voucher is valid */
    isPlatformVoucherValid: boolean;
    /** Warning message for invalid platform voucher */
    platformVoucherWarning: string | null;
    /** Load shipping methods for all shops */
    loadAllShippingMethods: () => void;
    /** Check if order can be placed */
    canPlaceOrder: boolean;
    /** Reasons why order cannot be placed */
    orderBlockReasons: string[];
}

export const useCheckoutCalculation = (): UseCheckoutCalculationReturn => {
    // Get state from store
    const shops = useCheckoutStore((state) => state.shops);
    const shopVouchers = useCheckoutStore((state) => state.shopVouchers);
    const platformVoucherId = useCheckoutStore((state) => state.platformVoucherId);
    const platformVouchers = useCheckoutStore((state) => state.platformVouchers);
    const isLoadingShipping = useCheckoutStore((state) => state.isLoadingShipping);
    const deliveryAddress = useCheckoutStore((state) => state.deliveryAddress);
    const isInitialized = useCheckoutStore((state) => state.isInitialized);

    // Actions
    const setShopShippingOptions = useCheckoutStore((state) => state.setShopShippingOptions);
    const applyPlatformVoucher = useCheckoutStore((state) => state.applyPlatformVoucher);

    // ========================================
    // MEMOIZED CALCULATION
    // ========================================
    const calculation = useMemo<CheckoutCalculationResult>(() => {
        if (!isInitialized || shops.length === 0) {
            return {
                subtotal: 0,
                totalShippingFee: 0,
                totalShopVoucherDiscount: 0,
                platformVoucherDiscount: 0,
                shippingDiscount: 0,
                totalAmount: 0,
                totalSavings: 0,
                totalItemCount: 0,
                shopSubtotals: [],
                isCalculatingShipping: true,
                platformVoucherValidation: null,
            };
        }

        return calculateCheckoutTotal(
            shops,
            shopVouchers,
            platformVoucherId,
            platformVouchers,
            isLoadingShipping
        );
    }, [shops, shopVouchers, platformVoucherId, platformVouchers, isLoadingShipping, isInitialized]);

    // ========================================
    // SHOP SUBTOTAL GETTER
    // ========================================
    const getShopSubtotal = useCallback(
        (shopId: string): ShopSubtotal | undefined => {
            return calculation.shopSubtotals.find((s) => s.shopId === shopId);
        },
        [calculation.shopSubtotals]
    );

    // ========================================
    // PLATFORM VOUCHER VALIDATION
    // ========================================
    const isPlatformVoucherValid = calculation.platformVoucherValidation?.isValid ?? true;
    const platformVoucherWarning = calculation.platformVoucherValidation?.invalidReason ?? null;

    // Auto-remove invalid platform voucher
    useEffect(() => {
        if (calculation.platformVoucherValidation?.shouldAutoRemove && platformVoucherId) {
            // Show warning before removing (in production: use toast)
            console.warn('Platform voucher auto-removed:', platformVoucherWarning);
            applyPlatformVoucher(null);
        }
    }, [calculation.platformVoucherValidation, platformVoucherId, platformVoucherWarning, applyPlatformVoucher]);

    // ========================================
    // LOAD SHIPPING METHODS
    // ========================================
    const loadAllShippingMethods = useCallback(() => {
        // Simulate API call for each shop
        shops.forEach((shop) => {
            // In production: Call actual API
            setTimeout(() => {
                const methods = generateMockShippingMethods(shop.shopId);
                setShopShippingOptions(shop.shopId, methods);
            }, 500 + Math.random() * 500); // Random delay 500-1000ms
        });
    }, [shops, setShopShippingOptions]);

    // Auto-load shipping methods when session initializes
    useEffect(() => {
        if (isInitialized && shops.length > 0) {
            // Check if shipping needs to be loaded
            const needsLoading = shops.some(
                (shop) => shop.shippingOptions.methods.length === 0
            );
            if (needsLoading) {
                loadAllShippingMethods();
            }
        }
    }, [isInitialized, shops, loadAllShippingMethods]);

    // ========================================
    // ORDER VALIDATION
    // ========================================
    const orderBlockReasons = useMemo<string[]>(() => {
        const reasons: string[] = [];

        if (!deliveryAddress) {
            reasons.push('Chưa có địa chỉ giao hàng');
        }

        if (calculation.isCalculatingShipping) {
            reasons.push('Đang tính phí vận chuyển');
        }

        if (shops.length === 0) {
            reasons.push('Không có sản phẩm nào');
        }

        // Check if all shops have shipping selected
        const missingShipping = shops.some(
            (shop) => !shop.shippingOptions.selectedMethodId
        );
        if (missingShipping) {
            reasons.push('Chưa chọn phương thức vận chuyển');
        }

        return reasons;
    }, [deliveryAddress, calculation.isCalculatingShipping, shops]);

    const canPlaceOrder = orderBlockReasons.length === 0;

    return {
        calculation,
        getShopSubtotal,
        isPlatformVoucherValid,
        platformVoucherWarning,
        loadAllShippingMethods,
        canPlaceOrder,
        orderBlockReasons,
    };
};
