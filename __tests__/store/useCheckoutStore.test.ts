/**
 * Unit Tests for useCheckoutStore
 * Tests the global client state for checkout sessions, including voucher Sync and validation state.
 */

import { act } from '@testing-library/react-native';
import { useCheckoutStore } from '@/store/useCheckoutStore';

describe('useCheckoutStore', () => {
    beforeEach(() => {
        act(() => {
            useCheckoutStore.getState().resetSession();
        });
    });

    describe('Session Management', () => {
        it('should initialize correctly with initSession', () => {
            act(() => {
                useCheckoutStore.getState().initSession(
                    ['item-1', 'item-2'],
                    [{ shopId: 'shop-1', items: [{ itemId: 'item-1', quantity: 1 }] }]
                );
            });

            const state = useCheckoutStore.getState();
            expect(state.isInitialized).toBe(true);
            expect(state.selectedItemIds).toEqual(['item-1', 'item-2']);
            expect(state.checkoutShops.length).toBe(1);
            expect(state.paymentMethod).toBe('cod');
        });

        it('should perform full reset when resetSession is called', () => {
            // First muddy the state
            act(() => {
                useCheckoutStore.getState().initSession(['item-1'], []);
                useCheckoutStore.getState().setPaymentMethod('vnpay');
                useCheckoutStore.getState().setShopNote('shop-1', 'fragile');
            });

            // Then reset
            act(() => {
                useCheckoutStore.getState().resetSession();
            });

            const state = useCheckoutStore.getState();
            expect(state.isInitialized).toBe(false);
            expect(state.selectedItemIds).toEqual([]);
            expect(state.shopNotes.size).toBe(0);
            expect(state.paymentMethod).toBe('cod');
        });
    });

    describe('Voucher and Shipping Synchronization from Preview Data', () => {
        it('should automatically select applied vouchers and shipping from preview response on first sync', () => {
            const mockPreviewData: any = {
                shops: [
                    {
                        shopId: 'shop-A',
                        shippingOptions: {
                            selectedMethodId: 'ship-method-1',
                        },
                        availableVouchers: [
                            { isApplicable: true, title: 'SHOP', code: 'SHOP-VOUCHER', category: 'DISCOUNT' },
                            { isApplicable: true, title: 'PLATFORM', code: 'PLAT-SHIP', category: 'SHIPPING' },
                        ],
                    },
                    {
                        shopId: 'shop-B',
                        shippingOptions: {
                            selectedMethodId: 'ship-method-2',
                        },
                        availableVouchers: [
                            { isApplicable: false, title: 'SHOP', code: 'CANT-USE' },
                            { isApplicable: true, title: 'PLATFORM', code: 'PLAT-DISC', category: 'DISCOUNT' },
                        ],
                    }
                ],
            };

            act(() => {
                useCheckoutStore.getState().setPreviewData(mockPreviewData);
            });

            const state = useCheckoutStore.getState();
            expect(state.previewData).toEqual(mockPreviewData);
            
            // Should extract shipping IDs
            expect(state.selectedShipping.get('shop-A')).toBe('ship-method-1');
            expect(state.selectedShipping.get('shop-B')).toBe('ship-method-2');

            // Should extract applicable vouchers
            expect(state.selectedShopVouchers.get('shop-A')).toBe('SHOP-VOUCHER');
            expect(state.selectedShopVouchers.has('shop-B')).toBe(false); // isApplicable was false
            
            expect(state.selectedPlatformShippingVoucher).toBe('PLAT-SHIP');
            expect(state.selectedPlatformDiscountVoucher).toBe('PLAT-DISC');
        });

        it('should not overwrite user selected vouchers on subsequent setPreviewData calls', () => {
            // Simulate user setting a voucher manually
            act(() => {
                useCheckoutStore.getState().applyPlatformVoucher('USER-MANUAL-PLAT', 'DISCOUNT');
            });

            const mockPreviewData: any = {
                shops: [
                    {
                        shopId: 'shop-A',
                        shippingOptions: { selectedMethodId: 'ship-method-1' },
                        availableVouchers: [
                            { isApplicable: true, title: 'PLATFORM', code: 'SERVER-PLAT', category: 'DISCOUNT' },
                        ]
                    }
                ]
            };

            act(() => {
                useCheckoutStore.getState().setPreviewData(mockPreviewData);
            });

            const state = useCheckoutStore.getState();
            // Because selectedPlatformDiscountVoucher was already set, it shouldn't be overwritten
            expect(state.selectedPlatformDiscountVoucher).toBe('USER-MANUAL-PLAT');
        });
    });

    describe('User Selections (Modifiers)', () => {
        it('should apply shop note correctly', () => {
            act(() => {
                useCheckoutStore.getState().setShopNote('shop-A', 'Leave at door');
            });
            expect(useCheckoutStore.getState().shopNotes.get('shop-A')).toBe('Leave at door');
        });

        it('should select shipping method properly', () => {
            act(() => {
                useCheckoutStore.getState().selectShippingMethod('shop-1', 'method-z');
            });
            expect(useCheckoutStore.getState().selectedShipping.get('shop-1')).toBe('method-z');
        });

        it('should apply and clear shop voucher securely', () => {
            act(() => {
                useCheckoutStore.getState().applyShopVoucher('shop-A', 'VOUCHER-X');
            });
            expect(useCheckoutStore.getState().selectedShopVouchers.get('shop-A')).toBe('VOUCHER-X');

            act(() => {
                useCheckoutStore.getState().applyShopVoucher('shop-A', null); // clear
            });
            expect(useCheckoutStore.getState().selectedShopVouchers.has('shop-A')).toBe(false);
        });

        it('should apply specific loyalty points or clear them if 0', () => {
            act(() => {
                useCheckoutStore.getState().applyLoyaltyPoints('shop-A', 500);
            });
            expect(useCheckoutStore.getState().selectedLoyaltyRedemptions.get('shop-A')).toBe(500);

            act(() => {
                useCheckoutStore.getState().applyLoyaltyPoints('shop-A', 0);
            });
            expect(useCheckoutStore.getState().selectedLoyaltyRedemptions.has('shop-A')).toBe(false);
        });
    });
});
