/**
 * Cart Adapter
 * Transform API response to UI-ready data structures
 * Updated for server-side selection state
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
import { toPublicUrl, toSizedImageUrl } from '../url';

const DEFAULT_IMAGE = 'https://via.placeholder.com/96';

/**
 * Build full image URL using centralized URL utility
 */
export const buildImageUrl = (
    basePath: string | null | undefined,
    extension: string | null | undefined
): string => {
    return toSizedImageUrl(basePath, extension, '_thumb') ?? DEFAULT_IMAGE;
};

// ============================================
// TRANSFORM FUNCTIONS (API => UI)
// ============================================

// Stock warning thresholds
const LOW_STOCK_THRESHOLD = 20;   // Show warning when stock <= 20
const URGENT_STOCK_THRESHOLD = 10; // Show urgent warning when stock <= 10

/**
 * Calculate low stock warning based on available stock
 * 
 * - stock <= 10: Urgent warning (red) - "Chỉ còn X sản phẩm"
 * - stock 11-20: Normal warning (orange) - "Còn X sản phẩm"  
 * - stock > 20: No warning (null)
 * - stock = 0: No warning (handled by OUT_OF_STOCK overlay)
 */
const calculateLowStockWarning = (availableStock: number): CartItemUI['lowStockWarning'] => {
    if (availableStock <= 0 || availableStock > LOW_STOCK_THRESHOLD) {
        return null;
    }

    if (availableStock <= URGENT_STOCK_THRESHOLD) {
        return {
            text: `Chỉ còn ${availableStock} sản phẩm`,
            isUrgent: true,
        };
    }

    return {
        text: `Còn ${availableStock} sản phẩm`,
        isUrgent: false,
    };
};

/**
 * Transform CartItem (API) => CartItemUI
 * 
 * Pricing Logic:
 * - originalPrice: Use priceBeforeDiscount (shown as struck-through when discounted)
 * - unitPrice: Current selling price per unit (after discount)
 * - discountPercent: From promotion.discountPercent if available
 * - totalPrice: unitPrice × quantity (pre-calculated by API)
 */
export const transformCartItem = (item: CartItem): CartItemUI => {
    const unitPrice = item.unitPrice ?? 0;
    const priceBeforeDiscount = item.priceBeforeDiscount ?? 0;
    const availableStock = item.availableStock ?? 0;

    // Only show original price if there's an actual discount
    const hasDiscount = priceBeforeDiscount > unitPrice;

    // Extract discount percent from promotion object if available
    const discountPercent = item.promotion?.discountPercent ?? null;

    return {
        id: item.id,
        productId: item.productId ?? '',
        version: item.version ?? 0,
        variantId: item.variantId,
        productName: item.productName ?? '',
        variantAttributes: item.variantAttributes || '',
        imageUrl: buildImageUrl(item.imageBasePath, item.imageExtension),
        unitPrice,
        quantity: item.quantity ?? 1,
        totalPrice: item.totalPrice ?? 0,
        shopId: item.shopId ?? '',

        // Server selection state
        selectedForCheckout: item.selectedForCheckout ?? false,

        // Stock management
        availableStock,
        stockStatus: (item.stockStatus as 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK') ?? 'IN_STOCK',
        stockMessage: item.stockMessage ?? '',
        isOutOfStock: item.stockStatus === 'OUT_OF_STOCK',
        maxQuantity: availableStock,

        // Low stock warning
        lowStockWarning: calculateLowStockWarning(availableStock),

        // Discount pricing
        discountAmount: item.discountAmount ?? 0,
        originalPrice: hasDiscount ? priceBeforeDiscount : null,
        discountPercent,
    };
};

/**
 * Transform Voucher (API) => VoucherUI
 */
export const transformVoucher = (voucher: Voucher): VoucherUI => {
    const discountValue = voucher.discountValue ?? 0;
    const minOrderAmount = voucher.minOrderAmount ?? 0;

    const discountDisplay =
        voucher.discountType === 'percentage'
            ? `Giảm ${discountValue}%`
            : `Giảm ${formatShortCurrency(discountValue)}`;

    const minOrderDisplay = minOrderAmount > 0
        ? `Đơn từ ${formatShortCurrency(minOrderAmount)}`
        : 'Không giới hạn';

    return {
        id: voucher.id,
        code: voucher.code ?? '',
        title: voucher.title ?? '',
        description: voucher.description || '',
        discountDisplay,
        minOrderDisplay,
        isApplicable: voucher.isApplicable ?? true,
        expiresAt: voucher.expiresAt ?? null,
    };
};

/**
 * Transform CartShop (API) => CartShopUI
 */
export const transformCartShop = (shop: CartShop): CartShopUI => {
    return {
        shopId: shop.shopId,
        shopName: shop.shopName ?? '',
        shopLogoUrl: shop.shopLogo ? toPublicUrl(shop.shopLogo) : null,
        items: shop.items ? shop.items.map(transformCartItem) : [],

        // Shop totals from API
        itemCount: shop.itemCount ?? 0,
        totalQuantity: shop.totalQuantity ?? 0,
        subtotal: shop.subtotal ?? 0,
        discount: shop.discount ?? 0,
        total: shop.total ?? 0,

        // Selection state from API
        allSelected: shop.allSelected ?? false,
        hasSelectedItems: shop.hasSelectedItems ?? false,

        // Voucher (client state - optional)
        appliedVoucherId: null,
        availableVouchers: [],
    };
};

/**
 * Transform CartResponse (API) => CartUI
 */
export const transformCart = (response: CartResponse): CartUI => {
    return {
        shops: response.shops.map(transformCartShop),
        platformVouchers: [],
        appliedPlatformVoucherId: null,
    };
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate totals for selected items
 * With server-side totals, this is mainly for display/verification
 */
export const calculateCartTotals = (
    shops: CartShopUI[]
): CartCalculationResult => {
    let subtotal = 0;
    let shopVoucherDiscount = 0;
    let selectedCount = 0;
    let hasOutOfStockItems = false;

    shops.forEach((shop) => {
        shop.items.forEach((item) => {
            if (item.selectedForCheckout) {
                subtotal += item.totalPrice;
                selectedCount++;

                if (item.isOutOfStock) {
                    hasOutOfStockItems = true;
                }
            }
        });

        // Add shop discount if applicable
        if (shop.hasSelectedItems) {
            shopVoucherDiscount += shop.discount;
        }
    });

    const platformVoucherDiscount = 0; // TODO: Implement platform voucher logic
    const totalSavings = shopVoucherDiscount + platformVoucherDiscount;
    const totalAmount = subtotal - totalSavings;

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

/**
 * Get checkbox state for all items
 */
export const getAllItemsCheckboxState = (shops: CartShopUI[]): CheckboxState => {
    const allSelected = shops.every((shop) => shop.allSelected);
    const someSelected = shops.some((shop) => shop.hasSelectedItems);

    if (allSelected && shops.length > 0) return 'checked';
    if (someSelected) return 'indeterminate';
    return 'unchecked';
};

// ============================================
// CLIENT-SIDE SELECTION HELPERS
// ============================================

/**
 * Get shop checkbox state from client selectedIds
 * Used when selection is managed client-side
 */
export const getShopCheckboxState = (
    shop: CartShopUI,
    selectedIds: Set<string>
): CheckboxState => {
    const selectableItems = shop.items.filter(item => !item.isOutOfStock);
    if (selectableItems.length === 0) return 'unchecked';

    const selectedCount = selectableItems.filter(item => selectedIds.has(item.id)).length;

    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === selectableItems.length) return 'checked';
    return 'indeterminate';
};

/**
 * Get all checkbox state from client selectedIds
 */
export const getAllCheckboxState = (
    shops: CartShopUI[],
    selectedIds: Set<string>
): CheckboxState => {
    const allSelectableItems = shops.flatMap(shop =>
        shop.items.filter(item => !item.isOutOfStock)
    );

    if (allSelectableItems.length === 0) return 'unchecked';

    const selectedCount = allSelectableItems.filter(item =>
        selectedIds.has(item.id)
    ).length;

    if (selectedCount === 0) return 'unchecked';
    if (selectedCount === allSelectableItems.length) return 'checked';
    return 'indeterminate';
};

/**
 * Get all selectable item IDs from shops
 */
export const getSelectableItemIds = (shops: CartShopUI[]): string[] => {
    return shops.flatMap(shop =>
        shop.items
            .filter(item => !item.isOutOfStock)
            .map(item => item.id)
    );
};

/**
 * Get all item IDs from a shop (including out of stock)
 */
export const getShopItemIds = (shop: CartShopUI): string[] => {
    return shop.items
        .filter(item => !item.isOutOfStock)
        .map(item => item.id);
};

/**
 * Calculate cart total from client selection
 * Used when selection is client-side managed
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

    shops.forEach((shop) => {
        shop.items.forEach((item) => {
            if (selectedIds.has(item.id)) {
                subtotal += item.totalPrice;
                selectedCount++;

                if (item.isOutOfStock) {
                    hasOutOfStockItems = true;
                }
            }
        });

        // Apply shop voucher if exists
        const voucherId = appliedShopVouchers.get(shop.shopId);
        if (voucherId && shop.availableVouchers) {
            const voucher = shop.availableVouchers.find(v => v.id === voucherId);
            if (voucher) {
                // TODO: Calculate shop voucher discount
                shopVoucherDiscount += 0; // Placeholder
            }
        }
    });

    // Apply platform voucher
    let platformVoucherDiscount = 0;
    if (appliedPlatformVoucherId) {
        const voucher = platformVouchers.find(v => v.id === appliedPlatformVoucherId);
        if (voucher) {
            // TODO: Calculate platform voucher discount
            platformVoucherDiscount = 0; // Placeholder
        }
    }

    const totalSavings = shopVoucherDiscount + platformVoucherDiscount;
    const totalAmount = Math.max(0, subtotal - totalSavings);

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
