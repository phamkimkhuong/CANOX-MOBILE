/**
 * ==============================================
 * ORDER ADAPTER - Transform API to UI
 * ==============================================
 */

import {
    Carrier,
    Order,
    OrderItem,
    OrderItemUI,
    OrderLoyalty,
    OrderShippingAddress,
    OrderUI,
    OrdersApiResponse,
    OrdersPageResponse,
    PaymentMethod
} from '@/types/order/order';
import { formatDate } from '@/utils/date';
import { toPublicUrl, toSizedImageUrl } from '@/utils/url';
import { getStatusDisplay } from './orderStatusMapper';

const CARRIER_NAMES: Record<Carrier, string> = {
    GHN: 'Giao Hàng Nhanh',
    SUPERSHIP: 'SuperShip',
    GHTK: 'Giao Hàng Tiết Kiệm',
    VIETTEL_POST: 'Viettel Post',
};

const PAYMENT_METHOD_NAMES: Record<PaymentMethod, string> = {
    COD: 'Thanh toán khi nhận hàng',
    PAYOS: 'PayOS',
    STRIPE: 'Stripe',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

/**
 * Default loyalty object khi không có data
 */
const DEFAULT_LOYALTY: OrderLoyalty = {
    pointsUsed: 0,
    discountAmount: 0,
    pointsEarned: 0,
};

/**
 * Transform OrderItem (API) => OrderItemUI
 */
export const transformOrderItem = (item: OrderItem): OrderItemUI => {
    // Prioritize new imagePath format, fallback to legacy basePath/ext
    const imageUrl = toSizedImageUrl(item.imagePath || item.imageBasePath, item.imageExtension, 'thumb')
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
 * Format time from ISO string
 * Returns empty string if input is null/invalid
 */
const formatTime = (isoString: string | null): string => {
    if (!isoString) return '';

    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return '';

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch {
        return '';
    }
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
    const statusDisplay = getStatusDisplay(order.status);
    const shopLogoUrl = order.shopInfo?.logoUrl ? toPublicUrl(order.shopInfo.logoUrl) : null;

    // Extract nested objects with safe defaults
    const pricing = order.pricing ?? {
        subtotal: 0,
        shopDiscount: 0,
        platformDiscount: 0,
        shippingDiscount: 0,
        originalShippingFee: 0,
        appliedVoucherCodes: null,
        totalDiscount: 0,
        taxAmount: 0,
        shippingFee: 0,
        grandTotal: 0,
    };
    const payment = order.payment ?? {
        method: 'COD' as PaymentMethod,
        url: null,
        intentId: null,
        groupId: null,
        expiresAt: null,
    };
    const shipment = order.shipment ?? {
        trackingNumber: null,
        carrier: null,
    };
    const shippingAddress = order.shippingAddress;
    const loyalty = order.loyalty || DEFAULT_LOYALTY;

    return {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        shopId: order.shopId,
        shopUserId: order.shopInfo?.userId || '',
        shopName: order.shopInfo?.shopName || 'Cửa hàng',
        shopLogoUrl,
        status: order.status,
        statusDisplay,

        // Formatted dates - handle null createdAt
        formattedDate: order.createdAt ? formatDate(order.createdAt) : '',
        formattedTime: formatTime(order.createdAt),

        // Prices - from nested pricing object
        subtotal: pricing.subtotal,
        shopDiscount: pricing.shopDiscount,
        platformDiscount: pricing.platformDiscount,
        shippingDiscount: pricing.shippingDiscount,
        totalDiscount: pricing.totalDiscount,
        taxAmount: pricing.taxAmount,
        shippingFee: pricing.shippingFee,
        grandTotal: pricing.grandTotal,

        // Items
        items: order.items.map(transformOrderItem),
        itemCount: order.itemCount,
        totalQuantity: order.totalQuantity,

        // Shipping - from nested shipment object
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        carrierName: shipment.carrier ? CARRIER_NAMES[shipment.carrier] : null,

        // Payment - from nested payment object
        paymentMethod: payment.method,
        paymentMethodDisplay: PAYMENT_METHOD_NAMES[payment.method],
        expiresAt: payment.expiresAt,

        // Address - from nested shippingAddress object
        recipientName: shippingAddress?.recipientName || '',
        phoneNumber: shippingAddress?.phoneNumber || '',
        fullAddress: buildFullAddress(shippingAddress),

        // Notes
        customerNote: order.customerNote,
        cancellationReason: order.cancellationReason,

        // Loyalty
        loyalty,

        // Raw data
        _raw: order,
    };
};

/**
 * Transform OrdersPageResponse (API) => OrderUI[]
 */
export const transformOrdersPage = (response: OrdersPageResponse): OrderUI[] => {
    return response.content.map(transformOrder);
};

/**
 * Transform OrdersApiResponse => OrderUI[]
 */
export const transformOrdersResponse = (apiResponse: OrdersApiResponse): OrderUI[] => {
    return transformOrdersPage(apiResponse.data);
};
