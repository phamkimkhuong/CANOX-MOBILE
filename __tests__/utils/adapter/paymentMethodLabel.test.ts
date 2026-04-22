/**
 * Payment Method Label Unit Tests
 */

import {
    formatUnknownPaymentMethodLabel,
    getPaymentMethodDisplayName,
    normalizePaymentMethodCode,
} from '@/utils/adapter/order/paymentMethodLabel';

describe('paymentMethodLabel', () => {
    describe('normalizePaymentMethodCode', () => {
        it('normalizes to uppercase trimmed string', () => {
            expect(normalizePaymentMethodCode('cod')).toBe('COD');
            expect(normalizePaymentMethodCode('  payos  ')).toBe('PAYOS');
            expect(normalizePaymentMethodCode('VnPay')).toBe('VNPAY');
        });

        it('defaults to COD for null/undefined/empty', () => {
            expect(normalizePaymentMethodCode(null)).toBe('COD');
            expect(normalizePaymentMethodCode(undefined)).toBe('COD');
            expect(normalizePaymentMethodCode('')).toBe('COD');
        });
    });

    describe('formatUnknownPaymentMethodLabel', () => {
        it('replaces underscores and dashes with spaces', () => {
            expect(formatUnknownPaymentMethodLabel('bank_transfer')).toBe('BANK TRANSFER');
            expect(formatUnknownPaymentMethodLabel('e-wallet')).toBe('E WALLET');
        });

        it('collapses multiple spaces', () => {
            expect(formatUnknownPaymentMethodLabel('a___b--c')).toBe('A B C');
        });

        it('trims and uppercases', () => {
            expect(formatUnknownPaymentMethodLabel('  momo  ')).toBe('MOMO');
        });
    });

    describe('getPaymentMethodDisplayName', () => {
        it('returns known labels for standard methods', () => {
            expect(getPaymentMethodDisplayName('cod')).toBe('Thanh toán khi nhận hàng');
            expect(getPaymentMethodDisplayName('PAYOS')).toBe('Chuyển khoản ngân hàng (QR)');
            expect(getPaymentMethodDisplayName('vnpay')).toBe('Ví điện tử VNPAY');
            expect(getPaymentMethodDisplayName('stripe')).toBe('Stripe');
            expect(getPaymentMethodDisplayName('bank_transfer')).toBe('Chuyển khoản ngân hàng');
        });

        it('formats unknown methods as uppercase label', () => {
            expect(getPaymentMethodDisplayName('zalopay')).toBe('ZALOPAY');
            expect(getPaymentMethodDisplayName('apple_pay')).toBe('APPLE PAY');
        });

        it('defaults to COD label for null/undefined', () => {
            expect(getPaymentMethodDisplayName(null)).toBe('Thanh toán khi nhận hàng');
            expect(getPaymentMethodDisplayName(undefined)).toBe('Thanh toán khi nhận hàng');
        });
    });
});
