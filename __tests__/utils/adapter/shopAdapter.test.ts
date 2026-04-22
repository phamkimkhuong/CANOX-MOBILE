/**
 * Shop Adapter Unit Tests
 *
 * Tests actual exports: transformShopVoucher, toShopVouchersUI, toShopHeaderUI, toShopBrandProfileUI
 */

import type { ShopVoucherDTO } from '@/types/shop';
import {
    transformShopVoucher,
    toShopVouchersUI,
} from '@/utils/adapter/shopAdapter';

// ============================================
// Fixtures
// ============================================

const createShopVoucherDTO = (overrides: Partial<ShopVoucherDTO> = {}): ShopVoucherDTO => ({
    id: 'voucher-1',
    code: 'SHOP50',
    name: 'Giảm 50K',
    description: 'Áp dụng cho đơn từ 200K',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    maxDiscount: 50000,
    minOrderAmount: 200000,
    startDate: '2026-04-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    voucherScope: 'SHOP_ORDER',
    maxUsage: 100,
    sponsorType: 'SHOP',
    applyToAllProducts: true,
    ...overrides,
});

// ============================================
// transformShopVoucher
// ============================================

describe('transformShopVoucher', () => {
    it('maps basic voucher fields', () => {
        const result = transformShopVoucher(createShopVoucherDTO());

        expect(result.id).toBe('voucher-1');
        expect(result.code).toBe('SHOP50');
        expect(result.name).toBe('Giảm 50K');
        expect(result.description).toBe('Áp dụng cho đơn từ 200K');
    });

    it('formats discount display for FIXED_AMOUNT', () => {
        const result = transformShopVoucher(createShopVoucherDTO({
            discountType: 'FIXED_AMOUNT',
            discountValue: 50000,
        }));

        expect(result.discountDisplay).toBeTruthy();
        expect(result.discountDisplay).toContain('GIẢM');
        expect(result.discountDisplay).not.toContain('%');
    });

    it('formats discount display for PERCENTAGE', () => {
        const result = transformShopVoucher(createShopVoucherDTO({
            discountType: 'PERCENTAGE',
            discountValue: 15,
        }));

        expect(result.discountDisplay).toContain('15%');
    });

    it('shows min order display when > 0', () => {
        const result = transformShopVoucher(createShopVoucherDTO({ minOrderAmount: 350000 }));
        expect(result.minOrderDisplay).toContain('tối thiểu');
    });

    it('shows "Mọi đơn hàng" when minOrderAmount is 0', () => {
        const result = transformShopVoucher(createShopVoucherDTO({ minOrderAmount: 0 }));
        expect(result.minOrderDisplay).toBe('Mọi đơn hàng');
    });

    // SCOPE
    it('maps scope labels correctly', () => {
        const shopOrder = transformShopVoucher(createShopVoucherDTO({ voucherScope: 'SHOP_ORDER' }));
        const shipping = transformShopVoucher(createShopVoucherDTO({ voucherScope: 'SHIPPING' }));
        const product = transformShopVoucher(createShopVoucherDTO({ voucherScope: 'PRODUCT' }));

        expect(shopOrder.scopeLabel).toBe('Đơn hàng');
        expect(shipping.scopeLabel).toBe('Vận chuyển');
        expect(product.scopeLabel).toBe('Sản phẩm');
    });

    // SHIPPING VOUCHER TITLE
    it('generates free shipping title for 100% shipping voucher', () => {
        const result = transformShopVoucher(createShopVoucherDTO({
            voucherScope: 'SHIPPING',
            discountType: 'PERCENTAGE',
            discountValue: 100,
        }));

        expect(result.titleDisplay).toBe('Miễn phí vận chuyển');
    });

    it('generates partial shipping discount title', () => {
        const result = transformShopVoucher(createShopVoucherDTO({
            voucherScope: 'SHIPPING',
            discountType: 'PERCENTAGE',
            discountValue: 30,
        }));

        expect(result.titleDisplay).toContain('30%');
        expect(result.titleDisplay).toContain('ship');
    });

    // EXPIRY
    it('detects expired voucher', () => {
        const result = transformShopVoucher(createShopVoucherDTO({
            endDate: '2020-01-01T00:00:00Z', // Past date
        }));

        expect(result.isExpired).toBe(true);
    });

    it('detects non-expired voucher', () => {
        const result = transformShopVoucher(createShopVoucherDTO({
            endDate: '2030-12-31T23:59:59Z', // Future date
        }));

        expect(result.isExpired).toBe(false);
    });

    // DEFAULTS
    it('defaults nullable fields', () => {
        const result = transformShopVoucher(createShopVoucherDTO({
            name: undefined as unknown as string,
            description: undefined as unknown as string,
            discountValue: undefined as unknown as number,
            minOrderAmount: undefined as unknown as number,
            maxDiscount: undefined as unknown as number,
            voucherScope: undefined as unknown as 'SHOP_ORDER',
            maxUsage: undefined as unknown as number,
            sponsorType: undefined as unknown as string,
        }));

        expect(result.name).toBe('');
        expect(result.description).toBe('');
        expect(result.discountValue).toBe(0);
        expect(result.minOrderAmount).toBe(0);
        expect(result.maxDiscount).toBe(0);
        expect(result.maxUsage).toBe(0);
    });
});

// ============================================
// toShopVouchersUI
// ============================================

describe('toShopVouchersUI', () => {
    it('transforms array of voucher DTOs', () => {
        const vouchers = [
            createShopVoucherDTO({ id: 'v1' }),
            createShopVoucherDTO({ id: 'v2' }),
        ];

        const result = toShopVouchersUI(vouchers);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('v1');
        expect(result[1].id).toBe('v2');
    });

    it('handles empty array', () => {
        expect(toShopVouchersUI([])).toEqual([]);
    });
});
