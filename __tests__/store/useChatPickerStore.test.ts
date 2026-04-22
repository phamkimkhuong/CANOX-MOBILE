/**
 * Unit Tests for useChatPickerStore
 */
import { act } from '@testing-library/react-native';
import { useChatPickerStore } from '@/store/useChatPickerStore';
import type { OrderUI } from '@/types/order/order';
import type { ShopProductItemUI } from '@/types/shop';

describe('useChatPickerStore', () => {
    beforeEach(() => {
        act(() => {
            useChatPickerStore.getState().clearSelections();
        });
    });

    it('should initialize empty', () => {
        const state = useChatPickerStore.getState();
        expect(state.conversationId).toBeNull();
        expect(state.selectedProduct).toBeNull();
        expect(state.selectedOrder).toBeNull();
    });

    it('should set conversation ID', () => {
        act(() => {
            useChatPickerStore.getState().setConversationId('conv-123');
        });
        expect(useChatPickerStore.getState().conversationId).toBe('conv-123');
    });

    it('should map ShopProductItemUI to SelectedProduct', () => {
        const mockProduct: ShopProductItemUI = {
            id: 'prod-1',
            title: 'Laptop VIP',
            price: 1000,
            originalPrice: 1500,
            thumbnail: 'https://img.com/lap.png',
            rating: 5,
            sold: 99,
            reviews: 10,
            location: 'HN',
        };

        act(() => {
            useChatPickerStore.getState().selectProductFromUI(mockProduct, 'shop-abc', 'PC Shop');
        });

        const state = useChatPickerStore.getState();
        expect(state.selectedProduct).toMatchObject({
            id: 'prod-1',
            title: 'Laptop VIP',
            price: 1000,
            thumbnail: 'https://img.com/lap.png',
            shopId: 'shop-abc',
            shopName: 'PC Shop',
        });
    });

    it('should map OrderUI to SelectedOrder', () => {
        const mockOrder: Partial<OrderUI> = {
            orderId: 'order-123',
            orderNumber: 'ORD-123',
            status: 'COMPLETED',
            grandTotal: 500,
            currency: 'VND',
            shopId: 'shop-abc',
            items: [
                {
                    itemId: 'item-1',
                    productId: 'prod-1',
                    productName: 'Mouse',
                    quantity: 2,
                    imageUrl: 'img.png',
                    variantId: 'v-1',
                    unitPrice: 250,
                    lineTotal: 500,
                    sku: 'sku-1',
                    reviewed: false,
                    variantAttributes: 'Color: Red',
                }
            ],
        };

        act(() => {
            useChatPickerStore.getState().selectOrderFromUI(mockOrder as OrderUI);
        });

        const state = useChatPickerStore.getState();
        expect(state.selectedOrder).toMatchObject({
            orderId: 'order-123',
            orderNumber: 'ORD-123',
            status: 'COMPLETED',
            grandTotal: 500,
            currency: 'VND',
            shopId: 'shop-abc',
            items: [
                {
                    productId: 'prod-1',
                    productName: 'Mouse',
                    quantity: 2,
                    imageUrl: 'img.png',
                }
            ],
        });
    });

    it('should allow manually clearing and setting selections', () => {
        act(() => {
            useChatPickerStore.getState().setSelectedProduct({ id: '1', title: 'A', price: 10, thumbnail: '', shopId: 's', shopName: 's' });
            useChatPickerStore.getState().setSelectedOrder({ orderId: '1', orderNumber: '1', status: 'PENDING', grandTotal: 10, currency: 'VND', shopId: 's', items: [] });
            
            useChatPickerStore.getState().clearSelections();
        });

        const state = useChatPickerStore.getState();
        expect(state.selectedProduct).toBeNull();
        expect(state.selectedOrder).toBeNull();
    });
});
