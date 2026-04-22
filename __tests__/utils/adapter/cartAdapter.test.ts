/**
 * Cart Adapter Unit Tests
 *
 * Tests all pure transformation and calculation functions
 * without any network or mock dependencies.
 */

import type { CartItem, CartResponse, CartShop, CartShopUI, Voucher } from '@/types/cart';
import {
    buildImageUrl,
    calculateCartTotal,
    calculateCartTotals,
    getAllCheckboxState,
    getAllItemsCheckboxState,
    getSelectableItemIds,
    getShopCheckboxState,
    getShopItemIds,
    transformCart,
    transformCartItem,
    transformCartShop,
    transformVoucher,
} from '@/utils/adapter/cartAdapter';

// ============================================
// FIXTURES
// ============================================

const createCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
    id: 'item-1',
    productId: 'prod-1',
    variantId: 'var-1',
    productName: 'Test Product',
    variantAttributes: 'Đỏ / M',
    imagePath: 'products/img1.webp',
    unitPrice: 100000,
    quantity: 2,
    totalPrice: 200000,
    shopId: 'shop-1',
    selectedForCheckout: true,
    availableStock: 50,
    stockStatus: 'IN_STOCK',
    priceBeforeDiscount: 150000,
    promotion: null,
    availableRegions: ['VIETNAM'],
    regionLabel: 'Nội địa',
    ...overrides,
});

const createCartShop = (overrides: Partial<CartShop> = {}): CartShop => ({
    shopId: 'shop-1',
    shopName: 'Test Shop',
    logoPath: 'shops/logo.webp',
    items: [createCartItem()],
    discount: 10000,
    allSelected: true,
    hasSelectedItems: true,
    ...overrides,
});

const createVoucher = (overrides: Partial<Voucher> = {}): Voucher => ({
    id: 'voucher-1',
    code: 'SALE50',
    title: 'Giảm 50K',
    description: 'Giảm giá 50K cho đơn từ 200K',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderAmount: 200000,
    isApplicable: true,
    expiresAt: '2026-12-31T23:59:59Z',
    ...overrides,
});

// ============================================
// buildImageUrl
// ============================================

describe('buildImageUrl', () => {
    it('returns a URL when path is provided', () => {
        const url = buildImageUrl('products/img.webp');
        expect(url).toBeTruthy();
        expect(url).not.toBe('https://via.placeholder.com/300');
    });

    it('returns default image when path is null', () => {
        expect(buildImageUrl(null)).toBe('https://via.placeholder.com/300');
    });

    it('returns default image when path is undefined', () => {
        expect(buildImageUrl(undefined)).toBe('https://via.placeholder.com/300');
    });

    it('returns default image when path is empty string', () => {
        expect(buildImageUrl('')).toBe('https://via.placeholder.com/300');
    });
});

// ============================================
// transformCartItem
// ============================================

describe('transformCartItem', () => {
    it('transforms basic fields correctly', () => {
        const result = transformCartItem(createCartItem());

        expect(result.id).toBe('item-1');
        expect(result.productId).toBe('prod-1');
        expect(result.variantId).toBe('var-1');
        expect(result.productName).toBe('Test Product');
        expect(result.variantAttributes).toBe('Đỏ / M');
        expect(result.quantity).toBe(2);
        expect(result.totalPrice).toBe(200000);
        expect(result.shopId).toBe('shop-1');
        expect(result.selectedForCheckout).toBe(true);
    });

    it('calculates discount pricing correctly', () => {
        const result = transformCartItem(createCartItem({
            unitPrice: 100000,
            priceBeforeDiscount: 150000,
        }));

        expect(result.unitPrice).toBe(100000);
        expect(result.originalPrice).toBe(150000);
    });

    it('hides original price when no discount', () => {
        const result = transformCartItem(createCartItem({
            unitPrice: 100000,
            priceBeforeDiscount: 100000,
        }));

        expect(result.originalPrice).toBeNull();
    });

    it('hides original price when priceBeforeDiscount < unitPrice', () => {
        const result = transformCartItem(createCartItem({
            unitPrice: 100000,
            priceBeforeDiscount: 80000,
        }));

        expect(result.originalPrice).toBeNull();
    });

    // LOW STOCK WARNING
    it('shows urgent warning when stock <= 10', () => {
        const result = transformCartItem(createCartItem({ availableStock: 5 }));

        expect(result.lowStockWarning).not.toBeNull();
        expect(result.lowStockWarning?.isUrgent).toBe(true);
        expect(result.lowStockWarning?.text).toContain('5');
    });

    it('shows normal warning when stock 11-20', () => {
        const result = transformCartItem(createCartItem({ availableStock: 15 }));

        expect(result.lowStockWarning).not.toBeNull();
        expect(result.lowStockWarning?.isUrgent).toBe(false);
    });

    it('shows no warning when stock > 20', () => {
        const result = transformCartItem(createCartItem({ availableStock: 50 }));

        expect(result.lowStockWarning).toBeNull();
    });

    it('shows no warning when stock is 0 (handled by OUT_OF_STOCK)', () => {
        const result = transformCartItem(createCartItem({ availableStock: 0 }));

        expect(result.lowStockWarning).toBeNull();
    });

    // OUT OF STOCK
    it('sets isOutOfStock correctly', () => {
        const oos = transformCartItem(createCartItem({ stockStatus: 'OUT_OF_STOCK' }));
        const inStock = transformCartItem(createCartItem({ stockStatus: 'IN_STOCK' }));

        expect(oos.isOutOfStock).toBe(true);
        expect(inStock.isOutOfStock).toBe(false);
    });

    // PROMOTION
    it('transforms promotion data correctly', () => {
        const result = transformCartItem(createCartItem({
            promotion: {
                campaignType: 'FLASH_SALE',
                discountPercent: 20,
                stockRemaining: 5,
                secondsRemaining: 3600,
            },
        }));

        expect(result.promotion).toEqual({
            campaignType: 'FLASH_SALE',
            discountPercent: 20,
            stockRemaining: 5,
            secondsRemaining: 3600,
        });
    });

    it('returns null promotion when not present', () => {
        const result = transformCartItem(createCartItem({ promotion: null }));
        expect(result.promotion).toBeNull();
    });

    // NULL SAFETY
    it('handles null/undefined fields with defaults', () => {
        const result = transformCartItem({
            id: 'item-null',
            variantId: 'v1',
        } as CartItem);

        expect(result.productId).toBe('');
        expect(result.productName).toBe('');
        expect(result.unitPrice).toBe(0);
        expect(result.quantity).toBe(1);
        expect(result.totalPrice).toBe(0);
        expect(result.selectedForCheckout).toBe(false);
        expect(result.availableRegions).toEqual([]);
    });
});

// ============================================
// transformVoucher
// ============================================

describe('transformVoucher', () => {
    it('transforms percentage voucher display', () => {
        const result = transformVoucher(createVoucher({
            discountType: 'percentage',
            discountValue: 15,
        }));

        expect(result.discountDisplay).toContain('15%');
    });

    it('transforms fixed amount voucher display', () => {
        const result = transformVoucher(createVoucher({
            discountType: 'fixed',
            discountValue: 50000,
        }));

        expect(result.discountDisplay).toBeTruthy();
        expect(result.discountDisplay).not.toContain('%');
    });

    it('shows min order display when > 0', () => {
        const result = transformVoucher(createVoucher({ minOrderAmount: 200000 }));
        expect(result.minOrderDisplay).toBeTruthy();
        expect(result.minOrderDisplay).not.toBe('Không giới hạn');
    });

    it('shows "Không giới hạn" when minOrderAmount is 0', () => {
        const result = transformVoucher(createVoucher({ minOrderAmount: 0 }));
        expect(result.minOrderDisplay).toBe('Không giới hạn');
    });

    it('maps basic fields', () => {
        const result = transformVoucher(createVoucher());

        expect(result.id).toBe('voucher-1');
        expect(result.code).toBe('SALE50');
        expect(result.title).toBe('Giảm 50K');
        expect(result.isApplicable).toBe(true);
    });
});

// ============================================
// transformCartShop
// ============================================

describe('transformCartShop', () => {
    it('transforms shop fields correctly', () => {
        const result = transformCartShop(createCartShop());

        expect(result.shopId).toBe('shop-1');
        expect(result.shopName).toBe('Test Shop');
        expect(result.items).toHaveLength(1);
        expect(result.discount).toBe(10000);
        expect(result.allSelected).toBe(true);
        expect(result.hasSelectedItems).toBe(true);
    });

    it('initializes client-side voucher state', () => {
        const result = transformCartShop(createCartShop());

        expect(result.appliedVoucherId).toBeNull();
        expect(result.availableVouchers).toEqual([]);
    });

    it('handles missing items array', () => {
        const result = transformCartShop(createCartShop({
            items: undefined as unknown as CartItem[],
        }));

        expect(result.items).toEqual([]);
    });
});

// ============================================
// transformCart
// ============================================

describe('transformCart', () => {
    it('transforms full cart response', () => {
        const response: CartResponse = {
            id: 'cart-1',
            itemCount: 3,
            shops: [createCartShop()],
        };

        const result = transformCart(response);

        expect(result.itemCount).toBe(3);
        expect(result.shops).toHaveLength(1);
        expect(result.platformVouchers).toEqual([]);
        expect(result.appliedPlatformVoucherId).toBeNull();
    });
});

// ============================================
// calculateCartTotals (server-side selection)
// ============================================

describe('calculateCartTotals', () => {
    const createShopUI = (items: Partial<CartShopUI['items'][0]>[]): CartShopUI => ({
        shopId: 'shop-1',
        shopName: 'Shop',
        shopLogoUrl: null,
        items: items.map((item, i) => ({
            id: `item-${i}`,
            productId: `prod-${i}`,
            variantId: `var-${i}`,
            productName: `Product ${i}`,
            variantAttributes: '',
            imageUrl: '',
            unitPrice: 100000,
            quantity: 1,
            totalPrice: 100000,
            shopId: 'shop-1',
            selectedForCheckout: false,
            availableStock: 50,
            stockStatus: 'IN_STOCK' as const,
            isOutOfStock: false,
            maxQuantity: 50,
            lowStockWarning: null,
            originalPrice: null,
            promotion: null,
            availableRegions: [],
            regionLabel: null,
            ...item,
        })),
        discount: 0,
        allSelected: false,
        hasSelectedItems: false,
        appliedVoucherId: null,
        availableVouchers: [],
    });

    it('calculates totals for selected items', () => {
        const shops = [createShopUI([
            { selectedForCheckout: true, totalPrice: 100000 },
            { selectedForCheckout: true, totalPrice: 200000 },
            { selectedForCheckout: false, totalPrice: 50000 },
        ])];

        const result = calculateCartTotals(shops);

        expect(result.subtotal).toBe(300000);
        expect(result.selectedCount).toBe(2);
    });

    it('returns zero when nothing is selected', () => {
        const shops = [createShopUI([
            { selectedForCheckout: false, totalPrice: 100000 },
        ])];

        const result = calculateCartTotals(shops);

        expect(result.subtotal).toBe(0);
        expect(result.selectedCount).toBe(0);
    });

    it('detects out of stock items in selection', () => {
        const shops = [createShopUI([
            { selectedForCheckout: true, isOutOfStock: true, totalPrice: 100000 },
        ])];

        const result = calculateCartTotals(shops);
        expect(result.hasOutOfStockItems).toBe(true);
    });

    it('includes shop discount when hasSelectedItems', () => {
        const shop = createShopUI([
            { selectedForCheckout: true, totalPrice: 200000 },
        ]);
        shop.discount = 20000;
        shop.hasSelectedItems = true;

        const result = calculateCartTotals([shop]);

        expect(result.shopVoucherDiscount).toBe(20000);
        expect(result.totalSavings).toBe(20000);
    });
});

// ============================================
// getAllItemsCheckboxState
// ============================================

describe('getAllItemsCheckboxState', () => {
    const makeShop = (all: boolean, some: boolean): CartShopUI =>
        ({
            allSelected: all,
            hasSelectedItems: some,
        } as CartShopUI);

    it('returns checked when all shops are fully selected', () => {
        expect(getAllItemsCheckboxState([makeShop(true, true), makeShop(true, true)])).toBe('checked');
    });

    it('returns indeterminate when some shops have selections', () => {
        expect(getAllItemsCheckboxState([makeShop(true, true), makeShop(false, true)])).toBe('indeterminate');
    });

    it('returns unchecked when no shops have selections', () => {
        expect(getAllItemsCheckboxState([makeShop(false, false)])).toBe('unchecked');
    });

    it('returns unchecked for empty shops array', () => {
        expect(getAllItemsCheckboxState([])).toBe('unchecked');
    });
});

// ============================================
// getShopCheckboxState (client selection)
// ============================================

describe('getShopCheckboxState', () => {
    const shop: CartShopUI = {
        shopId: 'shop-1',
        shopName: 'Shop',
        shopLogoUrl: null,
        items: [
            { id: 'a', isOutOfStock: false } as CartShopUI['items'][0],
            { id: 'b', isOutOfStock: false } as CartShopUI['items'][0],
            { id: 'c', isOutOfStock: true } as CartShopUI['items'][0],
        ],
        discount: 0,
        allSelected: false,
        hasSelectedItems: false,
        appliedVoucherId: null,
        availableVouchers: [],
    };

    it('returns checked when all selectable items are selected', () => {
        expect(getShopCheckboxState(shop, new Set(['a', 'b']))).toBe('checked');
    });

    it('returns indeterminate when some items are selected', () => {
        expect(getShopCheckboxState(shop, new Set(['a']))).toBe('indeterminate');
    });

    it('returns unchecked when nothing is selected', () => {
        expect(getShopCheckboxState(shop, new Set())).toBe('unchecked');
    });

    it('ignores out of stock items', () => {
        // Only a and b are selectable, selecting both = checked
        expect(getShopCheckboxState(shop, new Set(['a', 'b', 'c']))).toBe('checked');
    });

    it('respects disabledItemIds', () => {
        // Disable item 'a', only 'b' is selectable
        expect(getShopCheckboxState(shop, new Set(['b']), new Set(['a']))).toBe('checked');
    });
});

// ============================================
// getAllCheckboxState (client selection)
// ============================================

describe('getAllCheckboxState', () => {
    const shops: CartShopUI[] = [{
        shopId: 'shop-1',
        shopName: 'Shop',
        shopLogoUrl: null,
        items: [
            { id: 'a', isOutOfStock: false } as CartShopUI['items'][0],
            { id: 'b', isOutOfStock: false } as CartShopUI['items'][0],
        ],
        discount: 0,
        allSelected: false,
        hasSelectedItems: false,
        appliedVoucherId: null,
        availableVouchers: [],
    }];

    it('returns checked when all selectable items are selected', () => {
        expect(getAllCheckboxState(shops, new Set(['a', 'b']))).toBe('checked');
    });

    it('returns indeterminate when some are selected', () => {
        expect(getAllCheckboxState(shops, new Set(['a']))).toBe('indeterminate');
    });

    it('returns unchecked when none are selected', () => {
        expect(getAllCheckboxState(shops, new Set())).toBe('unchecked');
    });
});

// ============================================
// getSelectableItemIds
// ============================================

describe('getSelectableItemIds', () => {
    it('returns only in-stock item IDs', () => {
        const shops: CartShopUI[] = [{
            shopId: 'shop-1',
            shopName: 'X',
            shopLogoUrl: null,
            items: [
                { id: 'a', isOutOfStock: false } as CartShopUI['items'][0],
                { id: 'b', isOutOfStock: true } as CartShopUI['items'][0],
            ],
            discount: 0,
            allSelected: false,
            hasSelectedItems: false,
            appliedVoucherId: null,
            availableVouchers: [],
        }];

        expect(getSelectableItemIds(shops)).toEqual(['a']);
    });

    it('excludes disabled items', () => {
        const shops: CartShopUI[] = [{
            shopId: 'shop-1',
            shopName: 'X',
            shopLogoUrl: null,
            items: [
                { id: 'a', isOutOfStock: false } as CartShopUI['items'][0],
                { id: 'b', isOutOfStock: false } as CartShopUI['items'][0],
            ],
            discount: 0,
            allSelected: false,
            hasSelectedItems: false,
            appliedVoucherId: null,
            availableVouchers: [],
        }];

        expect(getSelectableItemIds(shops, new Set(['b']))).toEqual(['a']);
    });
});

// ============================================
// getShopItemIds
// ============================================

describe('getShopItemIds', () => {
    it('returns selectable item IDs from a single shop', () => {
        const shop: CartShopUI = {
            shopId: 'shop-1',
            shopName: 'X',
            shopLogoUrl: null,
            items: [
                { id: 'a', isOutOfStock: false } as CartShopUI['items'][0],
                { id: 'b', isOutOfStock: true } as CartShopUI['items'][0],
                { id: 'c', isOutOfStock: false } as CartShopUI['items'][0],
            ],
            discount: 0,
            allSelected: false,
            hasSelectedItems: false,
            appliedVoucherId: null,
            availableVouchers: [],
        };

        expect(getShopItemIds(shop)).toEqual(['a', 'c']);
    });
});

// ============================================
// calculateCartTotal (client-side selection)
// ============================================

describe('calculateCartTotal', () => {
    it('calculates subtotal from selected items', () => {
        const shops: CartShopUI[] = [{
            shopId: 'shop-1',
            shopName: 'X',
            shopLogoUrl: null,
            items: [
                { id: 'a', totalPrice: 100000, isOutOfStock: false } as CartShopUI['items'][0],
                { id: 'b', totalPrice: 200000, isOutOfStock: false } as CartShopUI['items'][0],
            ],
            discount: 0,
            allSelected: false,
            hasSelectedItems: false,
            appliedVoucherId: null,
            availableVouchers: [],
        }];

        const result = calculateCartTotal(
            shops,
            new Set(['a']),
            new Map(),
            null,
            []
        );

        expect(result.subtotal).toBe(100000);
        expect(result.selectedCount).toBe(1);
        expect(result.totalAmount).toBe(100000);
    });

    it('never returns negative totalAmount', () => {
        const shops: CartShopUI[] = [{
            shopId: 'shop-1',
            shopName: 'X',
            shopLogoUrl: null,
            items: [],
            discount: 0,
            allSelected: false,
            hasSelectedItems: false,
            appliedVoucherId: null,
            availableVouchers: [],
        }];

        const result = calculateCartTotal(shops, new Set(), new Map(), null, []);
        expect(result.totalAmount).toBeGreaterThanOrEqual(0);
    });
});
