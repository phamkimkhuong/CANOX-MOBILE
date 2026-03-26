import { KnownPaymentMethod, PaymentMethod } from '@/types/order/order';

const KNOWN_PAYMENT_METHOD_LABELS: Record<KnownPaymentMethod, string> = {
    COD: 'Thanh toán khi nhận hàng',
    PAYOS: 'Chuyển khoản ngân hàng (QR)',
    VNPAY: 'Ví điện tử VNPAY',
    STRIPE: 'Stripe',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

export const normalizePaymentMethodCode = (method: string | null | undefined): PaymentMethod => {
    return (method?.trim().toUpperCase() || 'COD') as PaymentMethod;
};

export const formatUnknownPaymentMethodLabel = (method: string): string => {
    return method
        .trim()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .toUpperCase();
};

export const getPaymentMethodDisplayName = (method: string | null | undefined): string => {
    const normalized = normalizePaymentMethodCode(method);
    return KNOWN_PAYMENT_METHOD_LABELS[normalized as KnownPaymentMethod]
        ?? formatUnknownPaymentMethodLabel(normalized);
};
