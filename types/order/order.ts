/**
 * ==============================================
 * ORDER TYPES - Domain Layer
 * ==============================================
 */

// Enum cho các trạng thái đơn hàng
export type OrderStatus =
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
    | 'CANCELLED';          // Đã hủy

// Các tab hiển thị trong UI (simplified)
export type OrderTabStatus =
    | 'AWAITING_PAYMENT'  // Chờ thanh toán
    | 'CREATED'           // Chờ xác nhận
    | 'FULFILLING'        // Đang xử lý/Giao
    | 'DELIVERED'         // Đã giao
    | 'COMPLETED'         // Hoàn thành
    | 'CANCELLED';        // Đã hủy

export type PaymentMethod = 'COD' | 'PAYOS' | 'STRIPE' | 'BANK_TRANSFER';
export type Carrier = 'GHN' | 'SUPERSHIP' | 'GHTK' | 'VIETTEL_POST';

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
    originalShippingFee: number;
    appliedVoucherCodes: string | null;
    totalDiscount: number;
    taxAmount: number;
    shippingFee: number;
    grandTotal: number;
}

/**
 * Order Payment - Payment method and status
 */
export interface OrderPayment {
    method: PaymentMethod;
    url: string | null;
    intentId: string | null;
    groupId: string | null;
    expiresAt: string | null;
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
    postalCode: string;
    country: string;
    email: string;
}

/**
 * Order Loyalty - Points and rewards
 */
export interface OrderLoyalty {
    pointsUsed: number;
    discountAmount: number;
    pointsEarned: number;
}

// ============================================
// SHOP & ITEM TYPES
// ============================================

// Shop Info từ API
export interface OrderShopInfo {
    shopId: string;
    shopName: string;
    description: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | string;
    rejectedReason: string | null;
    verifyBy: string | null;
    verifyDate: string | null;
    userId: string;
    username: string;
}

// Order Item từ API
export interface OrderItem {
    itemId: string | null;
    productId: string;
    variantId: string;
    sku: string;
    productName: string;
    imagePath?: string | null;      // New field: template path with '*'
    imageAssetId?: string | null;   // New field: asset identifier
    imageBasePath?: string | null;  // Legacy
    imageExtension?: string | null; // Legacy
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
export interface Order {
    orderId: string;
    orderNumber: string;
    shopId: string | null;
    shopInfo: OrderShopInfo | null;
    status: OrderStatus;
    currency: string;

    // Nested objects
    pricing: OrderPricing;
    payment: OrderPayment;
    shipment: OrderShipment;
    shippingAddress: OrderShippingAddress | null; // Can be null
    loyalty: OrderLoyalty;

    // Order summary
    itemCount: number;
    totalQuantity: number;
    customerNote: string | null;
    cancellationReason: string | null;
    createdAt: string | null;
    createdDate: string | null;

    // Items
    items: OrderItem[];
}

// Paginated Response từ API
export interface OrdersPageResponse {
    content: Order[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    previousPage: number;
    nextPage: number;
    empty: boolean;
    first: boolean;
    last: boolean;
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

// Tab Configuration
export interface OrderTabConfig {
    key: OrderTabStatus;
    label: string;
    color: string;
    icon: string;
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
    statusDisplay: {
        label: string;
        color: string;
        bgColor: string;
        icon: string;
    };

    // Formatted values
    formattedDate: string; //  "12/01/2024"
    formattedTime: string; // "14:30"

    // Price fields (flattened from pricing object)
    subtotal: number;
    shopDiscount: number;
    platformDiscount: number;
    shippingDiscount: number;
    totalDiscount: number;
    taxAmount: number;
    shippingFee: number;
    grandTotal: number;

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
    paymentMethodDisplay: string; //  "Thanh toán khi nhận hàng"
    expiresAt: string | null;

    // Delivery address (formatted from shippingAddress object)
    recipientName: string;
    phoneNumber: string;
    fullAddress: string; //  Combined address

    // Notes
    customerNote: string | null;
    cancellationReason: string | null;

    // Loyalty (NEW)
    loyalty: OrderLoyalty;

    // Raw data (for actions)
    _raw: Order; //  Keep original for detail screen
}
