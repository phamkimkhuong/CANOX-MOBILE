/**
 * ==============================================
 * ORDER TYPES - Domain Layer
 * ==============================================
 */

// Enum cho các trạng thái đơn hàng
export type KnownOrderStatus =
    | 'CREATED'           // Chờ xác nhận
    | 'AWAITING_PAYMENT'  // Chờ thanh toán
    | 'PAID'              // Đã thanh toán
    | 'REJECTED'          // Bị từ chối
    | 'FULFILLING'        // Đang xử lý/giao
    | 'READY_FOR_PICKUP'  // Sẵn sàng lấy hàng
    | 'SHIPPED'           // Đã vận chuyển
    | 'OUT_FOR_DELIVERY'  // Đang giao
    | 'DELIVERED'         // Đã giao
    | 'COMPLETED'         // Hoàn thành

    | 'DELIVERY_FAILED'   // Giao hàng thất bại
    | 'RETURNING_TO_SENDER' // Đang trả về người gửi
    | 'RETURNED_TO_SENDER'  // Đã trả về người gửi
    | 'RETURN_REQUESTED'    // Yêu cầu trả hàng
    | 'RETURN_APPROVED'     // Đã chấp nhận trả hàng
    | 'RETURN_REJECTED'     // Từ chối trả hàng
    | 'RETURNING'           // Đang trả hàng
    | 'RETURNED'            // Đã trả hàng
    | 'RETURN_DISPUTED'     // Đang tranh chấp trả hàng
    | 'REFUND_PENDING'      // Chờ hoàn tiền
    | 'REFUNDED'            // Đã hoàn tiền
    | 'CANCELLED';          // Đã hủy

export type OrderStatus = KnownOrderStatus | 'UNKNOWN_STATUS';

// Các tab hiển thị trong UI (simplified)
export type OrderTabStatus =
    | 'ALL'               // Tất cả
    | 'AWAITING_PAYMENT'  // Chờ thanh toán
    | 'CREATED'           // Chờ xác nhận
    | 'FULFILLING'        // Đang xử lý/Giao
    | 'POST_DELIVERY'     // Bucket UI_COMPLETED: gồm DELIVERED + COMPLETED
    | 'RETURN_REFUND'     // Trả hàng/Hoàn tiền
    | 'CANCELLED';        // Đã hủy

export type KnownPaymentMethod = 'COD' | 'PAYOS' | 'VNPAY' | 'STRIPE' | 'BANK_TRANSFER';
export type PaymentMethod = KnownPaymentMethod | (string & {});
export type Carrier = 'GHN' | 'SUPERSHIP' | 'GHTK' | 'VIETTEL_POST';

export interface OrderLifecycleTimestamps {
    createdAt: string | null;
    createdDate: string | null;
    paidAt?: string | null;
    confirmedAt?: string | null;
    shippedAt?: string | null;
    deliveredAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
    resolvedAt?: string | null;
}

// ============================================
// NESTED OBJECTS - NEW API STRUCTURE
// ============================================

/**
 * Order Pricing - All price-related fields
 */
export interface OrderPricing {
    subtotal: number;
    shopDiscount: number;
    platformDiscount: number;
    shippingDiscount: number;
    appliedVoucherCodes: string | null;
    totalDiscount: number;
    taxAmount: number;
    shippingFee: number;
    grandTotal: number;
}

export interface OrderLoyalty {
    pointsUsed: number;
    discountAmount: number;
    pointsEarned: number;
    platformPointsUsed: number;
    platformDiscountAmount: number;
    platformPointsEarned: number;
}

export interface OrderReturnBuyerInfo {
    buyerId: string;
    userId: string;
    fullName: string;
    phone: string;
    profileCompleted: boolean;
}

export interface OrderReturnInfo {
    returnId: string;
    buyerInfo: OrderReturnBuyerInfo | null;
    status: string | null;
    reasonCode: string | null;
    reason: string | null;
    description: string | null;
    images: string[];
    evidenceVideos: string[];
    trackingNumber: string | null;
    carrier: Carrier | null;
    rejectedReason: string | null;
    requestedAt: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
    returnedAt: string | null;
}

/**
 * Order Payment - Payment method and status
 */
export interface OrderPayment {
    method: PaymentMethod;
    url: string | null;
}

/**
 * Order Shipment - Tracking and carrier info
 */
export interface OrderShipment {
    trackingNumber: string | null;
    carrier: Carrier | null;
}

/**
 * Order Shipping Address - Delivery destination
 */
export interface OrderShippingAddress {
    recipientName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    province: string;
    postalCode: string | null;
}

// ============================================
// SHOP & ITEM TYPES
// ============================================

// Shop Info từ API
export interface OrderShopInfo {
    shopId: string | null;
    shopName: string;
    logoUrl: string | null;
    logoPath?: string | null;
    userId: string;
}

// Order Item từ API
export interface OrderItem {
    itemId: string | null;
    productId: string;
    variantId: string;
    sku: string;
    productName: string;
    imagePath?: string | null;      // New field: template path with '*'
    variantAttributes: string | null;
    unitPrice: number;
    quantity: number;
    discountAmount: number;
    lineTotal: number;
    reviewed: boolean;
}

// ============================================
// ORDER MAIN TYPE - UPDATED STRUCTURE
// ============================================

/**
 * Order 
 */
export interface Order extends OrderLifecycleTimestamps {
    orderId: string;
    orderNumber: string;
    shopInfo: OrderShopInfo | null;
    status: OrderStatus;
    statusRaw: string;
    currency: string;

    // Nested objects
    pricing: OrderPricing;
    loyalty: OrderLoyalty;
    payment: OrderPayment;
    shipment: OrderShipment;
    shippingAddress: OrderShippingAddress | null; // Can be null
    returnInfo: OrderReturnInfo | null;

    // Order summary
    itemCount: number;
    totalQuantity: number;
    customerNote: string | null;
    cancellationReason: string | null;

    // Items
    items: OrderItem[];
}

// Paginated Response từ API
export interface OrdersPageResponse {
    content: Order[];
    page: number;
    totalElements: number;
    hasNext: boolean;
    nextPage: number;
}

// API Response wrapper
export interface OrdersApiResponse {
    code: number;
    success: boolean;
    message: string;
    data: OrdersPageResponse;
}

// Action Button Configuration
export interface OrderAction {
    labelKey: string;
    type: 'primary' | 'secondary' | 'danger';
    action: 'cancel' | 'track' | 'received' | 'review' | 'return' | 'rebuy' | 'contact' | 'pay';
    icon?: string;
}

// ============================================
// UI TYPES (For Components - Enhanced)
// ============================================

/**
 * OrderItemUI - Enhanced item for UI rendering
 */
export interface OrderItemUI {
    itemId: string | null;
    productId: string;
    variantId: string;
    sku: string; // Unique identifier for each variant
    productName: string;
    imageUrl: string; //  Pre-built URL
    variantAttributes: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    reviewed: boolean;
}

/**
 * OrderUI - Enhanced order for UI rendering
 * Includes pre-calculated and formatted fields
 */
export interface OrderUI {
    orderId: string;
    orderNumber: string;
    shopId: string | null;
    shopUserId: string; // Shop owner's user ID for chat
    shopName: string;
    shopLogoUrl: string | null; // Pre-built URL
    status: OrderStatus;
    statusRaw: string;
    currency: string;
    statusDisplay: {
        label: string;
        color: string;
        bgColor: string;
        icon: string;
    };

    // Formatted values
    formattedDate: string; //  "12/01/2024"
    formattedTime: string; // "14:30"
    formattedPlacedAt: string; // Locale-aware datetime string
    deliveredAt: string | null;

    // Price fields (flattened from pricing object)
    subtotal: number;
    shopDiscount: number;
    platformDiscount: number;
    shippingDiscount: number;
    loyaltyDiscount: number;
    platformLoyaltyDiscount: number;
    totalDiscount: number;
    taxAmount: number;
    shippingFee: number;
    grandTotal: number;

    // Loyalty earned
    pointsEarned: number;
    platformPointsEarned: number;

    // Items
    items: OrderItemUI[];
    itemCount: number;
    totalQuantity: number;

    // Shipping info (from shipment object)
    trackingNumber: string | null;
    carrier: Carrier | null;
    carrierName: string | null; // "Giao Hàng Nhanh"

    // Payment (from payment object)
    paymentMethod: PaymentMethod;
    paymentUrl: string | null;
    paymentMethodDisplay: string; //  "Thanh toán khi nhận hàng"

    returnInfo: {
        returnId: string;
        status: string | null;
        reasonCode: string | null;
        reasonLabel: string;
        description: string | null;
        imageUrls: string[];
        videoUrls: string[];
        trackingNumber: string | null;
        carrier: Carrier | null;
        rejectedReason: string | null;
        requestedAt: string | null;
        approvedAt: string | null;
        rejectedAt: string | null;
        returnedAt: string | null;
    } | null;

    // Delivery address (formatted from shippingAddress object)
    recipientName: string;
    phoneNumber: string;
    fullAddress: string; //  Combined address

    // Notes
    customerNote: string | null;
    cancellationReason: string | null;
}
