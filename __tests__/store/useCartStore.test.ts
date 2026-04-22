/**
 * Unit Tests for useCartStore
 * Tests the global client state for cart selections, vouchers, and badge count.
 */

import { act } from '@testing-library/react-native';
import { useCartStore } from '@/store/useCartStore';

describe('useCartStore', () => {
    // 1. Badge Count
    describe('Badge Count', () => {
        it('should have initial totalQuantity of 0', () => {
            expect(useCartStore.getState().totalQuantity).toBe(0);
        });

        it('should update totalQuantity exactly', () => {
            act(() => {
                useCartStore.getState().setTotalQuantity(5);
            });
            expect(useCartStore.getState().totalQuantity).toBe(5);
        });

        it('should increment totalQuantity by 1 by default', () => {
            act(() => {
                useCartStore.getState().setTotalQuantity(2);
                useCartStore.getState().increment();
            });
            expect(useCartStore.getState().totalQuantity).toBe(3);
        });

        it('should increment totalQuantity by specific amount', () => {
            act(() => {
                useCartStore.getState().setTotalQuantity(2);
                useCartStore.getState().increment(10);
            });
            expect(useCartStore.getState().totalQuantity).toBe(12);
        });

        it('should clear totalQuantity', () => {
            act(() => {
                useCartStore.getState().setTotalQuantity(5);
                useCartStore.getState().clear();
            });
            expect(useCartStore.getState().totalQuantity).toBe(0);
        });
    });

    // 2. Selection State
    describe('Selection State', () => {
        it('should initialize with empty selectedItemIds', () => {
            expect(useCartStore.getState().selectedItemIds.size).toBe(0);
        });

        it('should explicitly set selectedItemIds', () => {
            act(() => {
                const newSet = new Set(['item-1', 'item-2']);
                useCartStore.getState().setSelectedItemIds(newSet);
            });
            expect(useCartStore.getState().selectedItemIds.has('item-1')).toBe(true);
            expect(useCartStore.getState().selectedItemIds.has('item-2')).toBe(true);
        });

        it('should toggle selection state of an item', () => {
            // First toggle -> add to set
            act(() => {
                useCartStore.getState().toggleItemSelection('item-3');
            });
            expect(useCartStore.getState().selectedItemIds.has('item-3')).toBe(true);

            // Second toggle -> remove from set
            act(() => {
                useCartStore.getState().toggleItemSelection('item-3');
            });
            expect(useCartStore.getState().selectedItemIds.has('item-3')).toBe(false);
        });

        it('should clear all selections', () => {
            act(() => {
                useCartStore.getState().toggleItemSelection('item-1');
                useCartStore.getState().toggleItemSelection('item-2');
                useCartStore.getState().clearSelection();
            });
            expect(useCartStore.getState().selectedItemIds.size).toBe(0);
        });
    });

    // 3. Voucher State
    describe('Voucher State', () => {
        it('should manage shop vouchers correctly', () => {
            expect(useCartStore.getState().appliedShopVouchers.size).toBe(0);

            // Apply a shop voucher
            act(() => {
                useCartStore.getState().setShopVoucher('shop-1', 'voucher-abc');
            });
            expect(useCartStore.getState().appliedShopVouchers.get('shop-1')).toBe('voucher-abc');

            // Apply to another shop
            act(() => {
                useCartStore.getState().setShopVoucher('shop-2', 'voucher-xyz');
            });
            expect(useCartStore.getState().appliedShopVouchers.get('shop-2')).toBe('voucher-xyz');

            // Remove a shop voucher by setting to null
            act(() => {
                useCartStore.getState().setShopVoucher('shop-1', null);
            });
            expect(useCartStore.getState().appliedShopVouchers.has('shop-1')).toBe(false);
            expect(useCartStore.getState().appliedShopVouchers.get('shop-2')).toBe('voucher-xyz');

            // Clear all shop vouchers
            act(() => {
                useCartStore.getState().clearShopVouchers();
            });
            expect(useCartStore.getState().appliedShopVouchers.size).toBe(0);
        });

        it('should manage platform voucher correctly', () => {
            expect(useCartStore.getState().appliedPlatformVoucherId).toBeNull();

            act(() => {
                useCartStore.getState().setPlatformVoucher('global-voucher');
            });
            expect(useCartStore.getState().appliedPlatformVoucherId).toBe('global-voucher');

            act(() => {
                useCartStore.getState().setPlatformVoucher(null);
            });
            expect(useCartStore.getState().appliedPlatformVoucherId).toBeNull();
        });
    });

    // 4. UI Modes (Edit & Calculate)
    describe('UI Modes', () => {
        it('should manage edit mode', () => {
            expect(useCartStore.getState().isEditMode).toBe(false);

            act(() => {
                useCartStore.getState().setEditMode(true);
            });
            expect(useCartStore.getState().isEditMode).toBe(true);

            act(() => {
                useCartStore.getState().setEditMode(false);
            });
            expect(useCartStore.getState().isEditMode).toBe(false);
        });

        it('should manage calculating status', () => {
            expect(useCartStore.getState().isCalculating).toBe(false);

            act(() => {
                useCartStore.getState().setIsCalculating(true);
            });
            expect(useCartStore.getState().isCalculating).toBe(true);
        });
    });
});
