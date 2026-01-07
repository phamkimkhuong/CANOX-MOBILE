/**
 * ==============================================
 * ORDER TYPES - Domain Layer
 * ==============================================
 * Định nghĩa Interface khớp với API Response
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
    itemId: string;
    productId: string;
    variantId: string;
    sku: string;
    productName: string;
    imageBasePath: string | null;
    imageExtension: string | null;
    variantAttributes: string | null;
    unitPrice: number;
    quantity: number;
    discountAmount: number;
    lineTotal: number;
    reviewed: boolean;
}

// Order chính từ API
export interface Order {
    orderId: string;
    orderNumber: string;
    shopId: string;
    shopInfo: OrderShopInfo;
    status: OrderStatus;
    currency: string;
    subtotal: number;
    shopDiscount: number;
    platformDiscount: number;
    shippingDiscount: number;
    originalShippingFee: number;
    appliedVoucherCodes: string | null;
    totalDiscount: number | null;
    taxAmount: number;
    shippingFee: number;
    grandTotal: number;
    itemCount: number;
    totalQuantity: number;
    customerNote: string | null;
    cancellationReason: string | null;
    createdAt: string;
    items: OrderItem[];
    paymentMethod: PaymentMethod;
    paymentUrl: string | null;
    paymentIntentId: string | null;
    paymentGroupId: string | null;
    expiresAt: string | null;
    trackingNumber: string | null;
    carrier: Carrier | null;
    // Shipping Address
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
    label: string;
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
    itemId: string;
    productId: string;
    variantId: string;
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
    shopId: string;
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

    // Price fields
    subtotal: number;
    totalDiscount: number;
    shippingFee: number;
    grandTotal: number;

    // Items
    items: OrderItemUI[];
    itemCount: number;
    totalQuantity: number;

    // Shipping info
    trackingNumber: string | null;
    carrier: Carrier | null;
    carrierName: string | null; // "Giao Hàng Nhanh"

    // Payment
    paymentMethod: PaymentMethod;
    paymentMethodDisplay: string; //  "Thanh toán khi nhận hàng"

    // Delivery address (formatted)
    recipientName: string;
    phoneNumber: string;
    fullAddress: string; //  Combined address

    // Notes
    customerNote: string | null;
    cancellationReason: string | null;
    expiresAt: string | null;

    // Raw data (for actions)
    _raw: Order; //  Keep original for detail screen
}
