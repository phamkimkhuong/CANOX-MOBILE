/**
 * useChatPickerStore - Zustand store for Chat Picker selections
 * 
 * Used to pass selected product/order from picker pages back to chat detail.
 * This is an ephemeral store (no persistence) - data is cleared after consumption.
 */

import { OrderUI } from '@/types/order/order';
import { ShopProductItemUI } from '@/types/shop';
import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

interface SelectedProduct {
    id: string;
    title: string;
    price: number;
    thumbnail: string;
    shopId: string;
    shopName: string;
}

interface SelectedOrder {
    orderId: string;
    orderNumber: string;
    status: string;
    grandTotal: number;
    shopId: string;
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        imageUrl: string;
    }>;
}

interface ChatPickerState {
    // Conversation context
    conversationId: string | null;
    setConversationId: (id: string | null) => void;

    // Selected product (from product picker page)
    selectedProduct: SelectedProduct | null;
    setSelectedProduct: (product: SelectedProduct | null) => void;

    // Selected order (from order picker page)
    selectedOrder: SelectedOrder | null;
    setSelectedOrder: (order: SelectedOrder | null) => void;

    // Clear all selections
    clearSelections: () => void;

    // Helper to transform ShopProductItemUI to SelectedProduct
    selectProductFromUI: (product: ShopProductItemUI, shopId: string, shopName: string) => void;

    // Helper to transform OrderUI to SelectedOrder
    selectOrderFromUI: (order: OrderUI) => void;
}

// ============================================
// STORE
// ============================================

export const useChatPickerStore = create<ChatPickerState>((set) => ({
    // Initial state
    conversationId: null,
    selectedProduct: null,
    selectedOrder: null,

    // Actions
    setConversationId: (id) => set({ conversationId: id }),

    setSelectedProduct: (product) => set({ selectedProduct: product }),

    setSelectedOrder: (order) => set({ selectedOrder: order }),

    clearSelections: () => set({
        selectedProduct: null,
        selectedOrder: null,
        conversationId: null,
    }),

    selectProductFromUI: (product, shopId, shopName) => set({
        selectedProduct: {
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail || '',
            shopId,
            shopName,
        },
    }),

    selectOrderFromUI: (order) => set({
        selectedOrder: {
            orderId: order.orderId,
            orderNumber: order.orderNumber,
            status: order.status,
            grandTotal: order.grandTotal,
            shopId: order.shopId || '',
            items: order.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
            })),
        },
    }),
}));
