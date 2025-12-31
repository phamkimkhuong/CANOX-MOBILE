/**
 * Cart Adapter
 * Transform API response to UI-ready data structures
 * Contains all price calculation logic (Single Source of Truth)
 */

import type {
    CartCalculationResult,
    CartItem,
    CartItemUI,
    CartResponse,
    CartShop,
    CartShopUI,
    CartUI,
    CheckboxState,
    Voucher,
    VoucherUI,
} from '@/types/cart';
import { formatPriceShort as formatShortCurrency } from '../format';
import { toSizedImageUrl } from '../url';

const DEFAULT_IMAGE = 'https://via.placeholder.com/96';
const DEFAULT_MAX_QUANTITY = 99;

/**
 * Build full image URL using centralized URL utility
 */
export const buildImageUrl = (
    basePath: string | null | undefined,
    extension: string | null | undefined
): string => {
    return toSizedImageUrl(basePath, extension) ?? DEFAULT_IMAGE;
};

// ============================================
// TRANSFORM FUNCTIONS (API -> UI)
// ============================================

/**
 * Transform CartItem (API) -> CartItemUI
 */
export const transformCartItem = (item: CartItem): CartItemUI => {
    return {
        id: item.id,
        variantId: item.variantId,
        productName: item.productName,
        variantAttributes: item.variantAttributes || '',
        imageUrl: buildImageUrl(item.imageBasePath, item.imageExtension),
        unitPrice: item.unitPrice,
        originalPrice: item.originalPrice ?? null,
        discountPercent: item.discountPercent ?? null,
        quantity: item.quantity,
        maxQuantity: item.maxQuantity ?? DEFAULT_MAX_QUANTITY,
        isOutOfStock: item.isOutOfStock ?? false,
        shopId: item.shopId,
    };
};

/**
 * Transform Voucher (API) -> VoucherUI
 */
export const transformVoucher = (voucher: Voucher): VoucherUI => {
    const discountDisplay =
        voucher.discountType === 'percentage'
            ? `Giảm ${voucher.discountValue}%`
            : `Giảm ${formatShortCurrency(voucher.discountValue)}`;

    const minOrderDisplay = voucher.minOrderAmount > 0
        ? `Đơn từ ${formatShortCurrency(voucher.minOrderAmount)}`
        : 'Không giới hạn';

    return {
        id: voucher.id,
        code: voucher.code,
        title: voucher.title,
        description: voucher.description || '',
        discountDisplay,
        minOrderDisplay,
        isApplicable: voucher.isApplicable ?? true,
        expiresAt: voucher.expiresAt ?? null,
    };
};

/**
 * Transform CartShop (API) -> CartShopUI
 */
export const transformCartShop = (
    shop: CartShop,
    shopVouchers: Voucher[] = []
): CartShopUI => {
    return {
        shopId: shop.shopId,
        shopName: shop.shopName,
        shopAvatarUrl: shop.shopAvatarUrl ?? null,
        isMall: shop.isMall ?? false,
        items: shop.items.map(transformCartItem),
        appliedVoucherId: null, // Client state - set separately
        availableVouchers: shopVouchers.map(transformVoucher),
    };
};

/**
 * Transform full CartResponse (API) -> CartUI
 */
export const transformCartResponse = (response: CartResponse): CartUI => {
    return {
        shops: response.shops.map((shop) =>
            transformCartShop(shop, response.availableShopVouchers?.filter(
                (v) => v.id.startsWith(shop.shopId) // Basic filter - adjust based on API
            ) || [])
        ),
        platformVouchers: response.availablePlatformVouchers?.map(transformVoucher) || [],
        appliedPlatformVoucherId: null, // Client state
    };
};

// ============================================
// SELECTION HELPERS
// ============================================

/**
 * Get all item IDs from cart
 */
export const getAllItemIds = (shops: CartShopUI[]): string[] => {
    return shops.flatMap((shop) => shop.items.map((item) => item.id));
};

/**
 * Get all selectable (not out of stock) item IDs
 */
export const getSelectableItemIds = (shops: CartShopUI[]): string[] => {
    return shops.flatMap((shop) =>
        shop.items.filter((item) => !item.isOutOfStock).map((item) => item.id)
    );
};

/**
 * Get item IDs for a specific shop
 */
export const getShopItemIds = (shop: CartShopUI): string[] => {
    return shop.items.filter((item) => !item.isOutOfStock).map((item) => item.id);
};

/**
 * Calculate checkbox state for a shop based on selected items
 * Returns: 'checked' | 'unchecked' | 'indeterminate'
 */
export const getShopCheckboxState = (
    shop: CartShopUI,
    selectedIds: Set<string>
): CheckboxState => {
    const selectableItems = shop.items.filter((item) => !item.isOutOfStock);
    if (selectableItems.length === 0) return 'unchecked';

    const selectedCount = selectableItems.filter((item) => selectedIds.has(item.id)).length;

    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === selectableItems.length) return 'checked';
    return 'indeterminate';
};

/**
 * Calculate "Select All" checkbox state
 */
export const getAllCheckboxState = (
    shops: CartShopUI[],
    selectedIds: Set<string>
): CheckboxState => {
    const allSelectableIds = getSelectableItemIds(shops);
    if (allSelectableIds.length === 0) return 'unchecked';

    const selectedCount = allSelectableIds.filter((id) => selectedIds.has(id)).length;

    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === allSelectableIds.length) return 'checked';
    return 'indeterminate';
};

// ============================================
// PRICE CALCULATION (Core Logic)
// ============================================

/**
 * Calculate voucher discount for a subtotal
 */
const calculateVoucherDiscount = (
    voucher: VoucherUI | undefined,
    subtotal: number,
    vouchers: VoucherUI[]
): number => {
    if (!voucher) return 0;

    const originalVoucher = vouchers.find((v) => v.id === voucher.id);
    if (!originalVoucher) return 0;

    // Parse discount info from display string (simplified)
    // In real app, you'd store discountType and discountValue in VoucherUI
    const isPercentage = voucher.discountDisplay.includes('%');
    const discountValue = parseInt(voucher.discountDisplay.replace(/[^\d]/g, ''), 10) || 0;

    if (isPercentage) {
        return Math.min(subtotal * (discountValue / 100), subtotal);
    }
    return Math.min(discountValue * 1000, subtotal); // Convert "15k" back to 15000
};

/**
 * Main calculation function - Single Source of Truth for pricing
 * 
 * @param shops - Cart shops data
 * @param selectedIds - Set of selected item IDs
 * @param appliedShopVouchers - Map of shopId -> voucherId
 * @param appliedPlatformVoucherId - Platform voucher ID
 * @param platformVouchers - Available platform vouchers
 */
export const calculateCartTotal = (
    shops: CartShopUI[],
    selectedIds: Set<string>,
    appliedShopVouchers: Map<string, string>,
    appliedPlatformVoucherId: string | null,
    platformVouchers: VoucherUI[]
): CartCalculationResult => {
    let subtotal = 0;
    let shopVoucherDiscount = 0;
    let selectedCount = 0;
    let hasOutOfStockItems = false;

    // Calculate per-shop subtotals and apply shop vouchers
    for (const shop of shops) {
        let shopSubtotal = 0;

        for (const item of shop.items) {
            if (item.isOutOfStock) {
                hasOutOfStockItems = true;
                continue;
            }

            if (selectedIds.has(item.id)) {
                shopSubtotal += item.unitPrice * item.quantity;
                selectedCount += item.quantity;
            }
        }

        subtotal += shopSubtotal;

        // Apply shop voucher if any
        const shopVoucherId = appliedShopVouchers.get(shop.shopId);
        if (shopVoucherId && shopSubtotal > 0) {
            const shopVoucher = shop.availableVouchers.find((v) => v.id === shopVoucherId);
            if (shopVoucher) {
                shopVoucherDiscount += calculateVoucherDiscount(
                    shopVoucher,
                    shopSubtotal,
                    shop.availableVouchers
                );
            }
        }
    }

    // Calculate after shop voucher discount
    const afterShopDiscount = subtotal - shopVoucherDiscount;

    // Apply platform voucher
    let platformVoucherDiscount = 0;
    if (appliedPlatformVoucherId && afterShopDiscount > 0) {
        const platformVoucher = platformVouchers.find((v) => v.id === appliedPlatformVoucherId);
        if (platformVoucher) {
            platformVoucherDiscount = calculateVoucherDiscount(
                platformVoucher,
                afterShopDiscount,
                platformVouchers
            );
        }
    }

    const totalAmount = Math.max(0, afterShopDiscount - platformVoucherDiscount);
    const totalSavings = shopVoucherDiscount + platformVoucherDiscount;

    return {
        subtotal,
        shopVoucherDiscount,
        platformVoucherDiscount,
        totalAmount,
        totalSavings,
        selectedCount,
        hasOutOfStockItems,
    };
};

// ============================================
// MOCK DATA FACTORY (For Development)
// ============================================

/**
 * Generate mock cart data for testing
 * Shop A: 2 items, has voucher
 * Shop B: 1 item (out of stock), no voucher
 */
export const generateMockCartData = (): CartUI => {
    const mockShops: CartShopUI[] = [
        {
            shopId: 'shop-001',
            shopName: 'Tech Official Store',
            shopAvatarUrl: null,
            isMall: true,
            items: [
                {
                    id: 'item-001',
                    variantId: 'var-001',
                    productName: 'Tai nghe Bluetooth True Wireless chống ồn chủ động',
                    variantAttributes: 'Màu: Trắng, Size: Tiêu chuẩn',
                    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjlVVQ9-LOiQyapFQcFbV55C7cIhGQ_nANY2ySOi-vRXGcjOPxqTQL3bVfBn0FnLVud0y9upO7iAZSBumH3Uhd2SsowZnlcpFqRfubDiR2n5ZBLvBO4k-O6jMQ9BIOg4a-w5igbg4B1uKHTiIrOkP0dguY_gEfvioBkXOF_BB7Ef0WjrQWbJiFcN7BUQTOMCnJJlA8CBi3aOO81MDAQYG43xI0aGRJ9IClhioVb2_F0_Ktni-yu63W2Zw9v3_I3fqUOvHfmWi4MU4',
                    unitPrice: 250000,
                    originalPrice: 350000,
                    discountPercent: 29,
                    quantity: 1,
                    maxQuantity: 10,
                    isOutOfStock: false,
                    shopId: 'shop-001',
                },
                {
                    id: 'item-002',
                    variantId: 'var-002',
                    productName: 'Cáp sạc nhanh Type-C 20W bọc dù siêu bền 1m',
                    variantAttributes: 'Màu: Đen, Dài: 1m',
                    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu7RZ_08jG6ml7oRo4f8DNYvny0zBv4yWdASEOSaLXOYxhXg3N5lvdVfMVWYoYSUlxvzkW5pSPc7OYGKjb3El1XBrAI2T4xl-MmKRHGTEvEvAGwMYgnO04fF2LdCaRbtDfG-c2T4zDR6yf3wVDlN1aVEGxbZvHnxcyxZliSvdUYmCgvEg0gKGpkf3PjqUz4M-2VlKJ1fSYgVHNWDna_effi50X1r4MrDhJUXkECcMjVBOdM9ZWj9AN2xqezRIkj2O7jdAW2egYZdA',
                    unitPrice: 50000,
                    originalPrice: 70000,
                    discountPercent: 20,
                    quantity: 2,
                    maxQuantity: 50,
                    isOutOfStock: false,
                    shopId: 'shop-001',
                },
            ],
            appliedVoucherId: 'voucher-shop-001',
            availableVouchers: [
                {
                    id: 'voucher-shop-001',
                    code: 'TECH15K',
                    title: 'Giảm ₫15k',
                    description: 'Đơn tối thiểu ₫200k',
                    discountDisplay: 'Giảm 15k',
                    minOrderDisplay: 'Đơn từ 200k',
                    isApplicable: true,
                    expiresAt: '2025-01-31T23:59:59Z',
                },
            ],
        },
        {
            shopId: 'shop-002',
            shopName: 'Fashion Mall',
            shopAvatarUrl: null,
            isMall: false,
            items: [
                {
                    id: 'item-003',
                    variantId: 'var-003',
                    productName: 'Áo Thun Nam Cotton Premium Basic',
                    variantAttributes: 'Màu: Xám, Size: L',
                    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbQgrMhfQ_7eYD6MhY_HrIMR0bOMsgLOSIG7QpeOqc-WerrnqzxlEcoUPymd3sSYl8jSiBo1pM8n9pwMZ5OLTptQhQWcmadvsDQQBzpASsEVT9ydo_buLztRRZDyw7busY6moSBd0XLNm3wZWATOlO9WNVpe5VEVPBh15QUEw4bX6AXvo8xHb6Rsrs-lxdkw3bhOg674mcLzagJulT0dsxOZt2zYj4WhurzfFYL9lIUm0nifeHkxo5YGI602zKnDSCwtSeOc9C9y4',
                    unitPrice: 120000,
                    originalPrice: null,
                    discountPercent: null,
                    quantity: 1,
                    maxQuantity: 5,
                    isOutOfStock: true, // Out of stock
                    shopId: 'shop-002',
                },
            ],
            appliedVoucherId: null,
            availableVouchers: [],
        },
    ];

    const mockPlatformVouchers: VoucherUI[] = [
        {
            id: 'voucher-platform-001',
            code: 'FREESHIP',
            title: 'Miễn phí vận chuyển',
            description: 'Áp dụng cho đơn từ 0đ',
            discountDisplay: 'Freeship',
            minOrderDisplay: 'Không giới hạn',
            isApplicable: true,
            expiresAt: '2025-12-31T23:59:59Z',
        },
    ];

    return {
        shops: mockShops,
        platformVouchers: mockPlatformVouchers,
        appliedPlatformVoucherId: null,
    };
};
