/**
 * ==============================================
 * ORDER ADAPTER - Transform API to UI
 * ==============================================
 */

import i18n from '@/constants/i18n';
import {
    Carrier,
    KnownPaymentMethod,
    Order,
    OrderItem,
    OrderItemUI,
    OrderShippingAddress,
    OrderUI,
    PaymentMethod
} from '@/types/order/order';
import { formatClockTime, formatDate, formatDateTime } from '@/utils/date';
import { toPublicUrl, toSizedImageUrl } from '@/utils/url';
import { getPaymentMethodDisplayName } from './paymentMethodLabel';
import { getStatusDisplay } from './orderStatusMapper';

const CARRIER_NAMES: Record<Carrier, string> = {
    GHN: 'Giao Hàng Nhanh',
    SUPERSHIP: 'SuperShip',
    GHTK: 'Giao Hàng Tiết Kiệm',
    VIETTEL_POST: 'Viettel Post',
};

const PAYMENT_METHOD_NAMES: Record<KnownPaymentMethod, string> = {
    COD: 'Thanh toán khi nhận hàng',
    PAYOS: 'Chuyển khoản ngân hàng (QR)',
    VNPAY: 'Ví điện tử VNPAY',
    STRIPE: 'Stripe',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

/**
 * Transform OrderItem (API) => OrderItemUI
 */
export const transformOrderItem = (item: OrderItem): OrderItemUI => {
    // Prioritize new imagePath format, fallback to legacy basePath/ext
    const imageUrl = toSizedImageUrl(item.imagePath, null, 'thumb')
        || 'https://via.placeholder.com/72';

    return {
        itemId: item.itemId,
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku || '',
        productName: item.productName,
        imageUrl,
        variantAttributes: item.variantAttributes || '',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
        reviewed: item.reviewed,
    };
};


/**
 * Build full address string from OrderShippingAddress
 * Returns default message if address is null
 */
const buildFullAddress = (address: OrderShippingAddress | null): string => {
    if (!address) {
        return 'Không có thông tin địa chỉ';
    }

    const parts = [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.province,
        address.postalCode,
    ].filter(Boolean);

    return parts.join(', ');
};

/**
 * Transform Order (API) => OrderUI
 * Updated to read from nested objects
 */
export const transformOrder = (order: Order): OrderUI => {
    const statusDisplay = getStatusDisplay(order.status, order.statusRaw);
    const placedAt = order.createdAt || order.createdDate;
    const shopLogoUrl = toSizedImageUrl(
        order.shopInfo?.logoPath ?? order.shopInfo?.logoUrl,
        null,
        'thumb'
    ) ?? toPublicUrl(order.shopInfo?.logoUrl) ?? null;

    // Extract nested objects with safe defaults
    const pricing = order.pricing ?? {
        subtotal: 0,
        shopDiscount: 0,
        platformDiscount: 0,
        shippingDiscount: 0,
        appliedVoucherCodes: null,
        totalDiscount: 0,
        taxAmount: 0,
        shippingFee: 0,
        grandTotal: 0,
    };
    const loyalty = order.loyalty ?? {
        pointsUsed: 0,
        discountAmount: 0,
        pointsEarned: 0,
        platformPointsUsed: 0,
        platformDiscountAmount: 0,
        platformPointsEarned: 0,
    };
    const payment = order.payment ?? {
        method: 'COD' as PaymentMethod,
        url: null,
    };
    const shipment = order.shipment ?? {
        trackingNumber: null,
        carrier: null,
    };
    const shippingAddress = order.shippingAddress;
    const returnInfo = order.returnInfo;
    // Defensive fallback for partial or stale cache entries.
    const items = Array.isArray(order.items) ? order.items : [];
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const returnReasonLabel = returnInfo?.reasonCode
        ? i18n.t(`order:returnRequest.reasons.${returnInfo.reasonCode}` as never, {
            defaultValue: returnInfo.reason || '',
        })
        : (returnInfo?.reason || '');

    return {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        shopId: order.shopId,
        shopUserId: order.shopInfo?.userId || '',
        shopName: order.shopInfo?.shopName || 'Cửa hàng',
        shopLogoUrl,
        status: order.status,
        statusRaw: order.statusRaw,
        currency: order.currency,
        statusDisplay,

        // Formatted dates - handle null createdAt
        formattedDate: placedAt ? formatDate(placedAt) : '',
        formattedTime: formatClockTime(placedAt),
        formattedPlacedAt: placedAt ? formatDateTime(placedAt) : '',
        deliveredAt: order.deliveredAt ?? null,

        // Prices - from nested pricing object
        subtotal: pricing.subtotal,
        shopDiscount: pricing.shopDiscount,
        platformDiscount: pricing.platformDiscount,
        shippingDiscount: pricing.shippingDiscount,
        loyaltyDiscount: loyalty.discountAmount,
        platformLoyaltyDiscount: loyalty.platformDiscountAmount,
        totalDiscount: pricing.totalDiscount,
        taxAmount: pricing.taxAmount,
        shippingFee: pricing.shippingFee,
        grandTotal: pricing.grandTotal,

        // Loyalty earned
        pointsEarned: loyalty.pointsEarned,
        platformPointsEarned: loyalty.platformPointsEarned,

        // Items
        items: items.map(transformOrderItem),
        itemCount: order.itemCount ?? items.length,
        totalQuantity: order.totalQuantity ?? totalQuantity,
        // Shipping - from nested shipment object
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        carrierName: shipment.carrier ? CARRIER_NAMES[shipment.carrier] : null,

        // Payment - from nested payment object
        paymentMethod: payment.method,
        paymentUrl: payment.url,
        paymentMethodDisplay: PAYMENT_METHOD_NAMES[payment.method as KnownPaymentMethod]
            ?? getPaymentMethodDisplayName(payment.method),
        returnInfo: returnInfo ? {
            returnId: returnInfo.returnId,
            status: returnInfo.status,
            reasonCode: returnInfo.reasonCode,
            reasonLabel: returnReasonLabel,
            description: returnInfo.description,
            imageUrls: returnInfo.images
                .map((path) => toPublicUrl(path))
                .filter((url): url is string => Boolean(url)),
            videoUrls: returnInfo.evidenceVideos
                .map((path) => toPublicUrl(path))
                .filter((url): url is string => Boolean(url)),
            trackingNumber: returnInfo.trackingNumber,
            carrier: returnInfo.carrier,
            rejectedReason: returnInfo.rejectedReason,
            requestedAt: returnInfo.requestedAt,
            approvedAt: returnInfo.approvedAt,
            rejectedAt: returnInfo.rejectedAt,
            returnedAt: returnInfo.returnedAt,
        } : null,

        // Address - from nested shippingAddress object
        recipientName: shippingAddress?.recipientName || '',
        phoneNumber: shippingAddress?.phoneNumber || '',
        fullAddress: buildFullAddress(shippingAddress),

        // Notes
        customerNote: order.customerNote,
        cancellationReason: order.cancellationReason,
    };
};

