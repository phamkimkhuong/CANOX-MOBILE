/**
 * Context Bar Types
 * Types for the sticky context bar in chat detail view.
 * Supports Product context, Order context, or no context.
 */

import { OrderStatus } from '@/types/order/order';

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Type of context displayed in the bar
 */
export type ContextType = 'PRODUCT' | 'ORDER' | 'NONE';

/**
 * Product context data
 * When user enters chat from a product page
 */
export interface ProductContext {
    productId: string;
    name: string;
    price: number;
    originalPrice?: number;
    thumbnail: string;
    variantId?: string;
    variantName?: string;
    shopId: string;
    shopName: string;
}

/**
 * Order context data
 * When user enters chat from an order page
 */
export interface OrderContext {
    orderId: string;
    orderCode: string;
    status: OrderStatus;
    totalAmount: number;
    thumbnail?: string; // First product image
    itemCount: number;
}

/**
 * Props for ContextBar component
 */
export interface ContextBarProps {
    type: ContextType;
    productData?: ProductContext;
    orderData?: OrderContext;
    onDismiss: () => void;
    onAction: () => void;
}

// ============================================
// QUICK REPLY TYPES
// ============================================

/**
 * Quick reply chip data
 */
export interface QuickReply {
    id: string;
    text: string;
    icon?: string;
    isPrimary?: boolean;
}

/**
 * Get quick replies based on context type
 */
export const getQuickRepliesByContext = (contextType: ContextType): QuickReply[] => {
    const commonReplies: QuickReply[] = [
        { id: 'shipping', text: 'Phí ship bao nhiêu?' },
        { id: 'voucher', text: 'Có voucher không?' },
        { id: 'return', text: 'Chính sách đổi trả?' },
    ];

    switch (contextType) {
        case 'PRODUCT':
            return [
                { id: 'stock', text: 'Còn hàng không?', isPrimary: true },
                { id: 'real-photo', text: 'Có ảnh thật không?' },
                { id: 'warranty', text: 'Bảo hành thế nào?' },
                ...commonReplies,
            ];
        case 'ORDER':
            return [
                { id: 'delivery', text: 'Đơn đến khi nào?', isPrimary: true },
                { id: 'tracking', text: 'Số tracking?' },
                { id: 'delay', text: 'Sao chưa giao?' },
                { id: 'cancel', text: 'Hủy đơn được không?' },
            ];
        case 'NONE':
        default:
            return [
                { id: 'support', text: 'Tôi cần hỗ trợ', isPrimary: true },
                ...commonReplies,
            ];
    }
};

// ============================================
// CONTEXT ACTION LABELS
// ============================================

export interface ContextActionConfig {
    label: string;
    icon: string;
}

export const CONTEXT_ACTION_CONFIG: Record<Exclude<ContextType, 'NONE'>, ContextActionConfig> = {
    PRODUCT: {
        label: 'Mua ngay',
        icon: 'cart',
    },
    ORDER: {
        label: 'Theo dõi',
        icon: 'shipping',
    },
};
