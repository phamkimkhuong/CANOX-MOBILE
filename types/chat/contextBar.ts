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
    currency: string;
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
// CONTEXT ACTION LABELS
// ============================================

export interface ContextActionConfig {
    label: string;
    icon: string;
}

export const CONTEXT_ACTION_CONFIG: Record<Exclude<ContextType, 'NONE'>, ContextActionConfig> = {
    PRODUCT: {
        label: 'Gửi',
        icon: 'send',
    },
    ORDER: {
        label: 'Gửi',
        icon: 'send',
    },
};
