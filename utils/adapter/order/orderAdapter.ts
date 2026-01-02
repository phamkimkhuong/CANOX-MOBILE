/**
 * ==============================================
 * ORDER ADAPTER - Transform API to UI
 * ==============================================
 * Centralized transformation logic for Order data
 */

import { Carrier, Order, OrderItem, OrderItemUI, OrderUI, OrdersApiResponse, OrdersPageResponse, PaymentMethod } from '@/types/order/order';
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
 * Transform OrderItem (API) => OrderItemUI
 */
export const transformOrderItem = (item: OrderItem): OrderItemUI => {
    const imageUrl = toSizedImageUrl(item.imageBasePath, item.imageExtension, '_thumb')
        || 'https://via.placeholder.com/72';

    return {
        itemId: item.itemId,
        productId: item.productId,
        variantId: item.variantId,
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
 * Format date string to Vietnamese format
 */
const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Format time from ISO string
 */
const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

/**
 * Build full address string
 */
const buildFullAddress = (order: Order): string => {
    const parts = [
        order.addressLine1,
        order.addressLine2,
        order.city,
        order.province,
        order.postalCode,
    ].filter(Boolean);

    return parts.join(', ');
};

/**
 * Transform Order (API) => OrderUI
 */
export const transformOrder = (order: Order): OrderUI => {
    const statusDisplay = getStatusDisplay(order.status);
    const shopLogoUrl = order.shopInfo.logoUrl ? toPublicUrl(order.shopInfo.logoUrl) : null;

    return {
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        shopId: order.shopId,
        shopName: order.shopInfo.shopName,
        shopLogoUrl,
        status: order.status,
        statusDisplay,

        // Formatted dates
        formattedDate: formatDate(order.createdAt),
        formattedTime: formatTime(order.createdAt),

        // Prices
        subtotal: order.subtotal,
        totalDiscount: order.totalDiscount || (order.shopDiscount + order.platformDiscount + order.shippingDiscount),
        shippingFee: order.shippingFee,
        grandTotal: order.grandTotal,

        // Items
        items: order.items.map(transformOrderItem),
        itemCount: order.itemCount,
        totalQuantity: order.totalQuantity,

        // Shipping
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        carrierName: order.carrier ? CARRIER_NAMES[order.carrier] : null,

        // Payment
        paymentMethod: order.paymentMethod,
        paymentMethodDisplay: PAYMENT_METHOD_NAMES[order.paymentMethod],

        // Address
        recipientName: order.recipientName,
        phoneNumber: order.phoneNumber,
        fullAddress: buildFullAddress(order),

        // Notes
        customerNote: order.customerNote,
        cancellationReason: order.cancellationReason,

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
