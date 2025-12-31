/**
 * useCartCalculations Hook
 * 
 * Central hook for cart price calculations and selection state management.
 * Follows "Derived State" pattern - prices are NEVER stored, always calculated.
 * 
 * @example
 * const { calculation, toggleItem, toggleShop, selectAll } = useCartCalculations(cartData);
 */

import {
    calculateCartTotal,
    getAllCheckboxState,
    getSelectableItemIds,
    getShopCheckboxState,
    getShopItemIds,
} from '@/utils/adapter/cartAdapter';
import { useCallback, useMemo } from 'react';
import type {
    CartCalculationResult,
    CartShopUI,
    CartUI,
    CheckboxState,
    VoucherUI,
} from '@/types/cart';

// ============================================
// TYPES
// ============================================

export interface UseCartCalculationsReturn {
    /** Kết quả tính toán giá (Derived State) */
    calculation: CartCalculationResult;
    /** Trạng thái checkbox "Tất cả" */
    selectAllState: CheckboxState;
    /** Lấy trạng thái checkbox của shop */
    getShopState: (shopId: string) => CheckboxState;
    /** Toggle một item */
    toggleItem: (itemId: string) => void;
    /** Toggle tất cả items của một shop */
    toggleShop: (shopId: string) => void;
    /** Toggle tất cả items */
    toggleSelectAll: () => void;
    /** Kiểm tra item có được chọn không */
    isItemSelected: (itemId: string) => boolean;
    /** Apply shop voucher */
    applyShopVoucher: (shopId: string, voucherId: string | null) => void;
    /** Apply platform voucher */
    applyPlatformVoucher: (voucherId: string | null) => void;
}

export interface UseCartCalculationsOptions {
    /** Cart data từ API/Mock */
    cartData: CartUI | null;
    /** Selected item IDs (từ Zustand store) */
    selectedIds: Set<string>;
    /** Applied shop vouchers Map */
    appliedShopVouchers: Map<string, string>;
    /** Applied platform voucher ID */
    appliedPlatformVoucherId: string | null;
    /** Callbacks để update Zustand store */
    onSelectionChange: (newSelectedIds: Set<string>) => void;
    onShopVoucherChange: (shopId: string, voucherId: string | null) => void;
    onPlatformVoucherChange: (voucherId: string | null) => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export const useCartCalculations = ({
    cartData,
    selectedIds,
    appliedShopVouchers,
    appliedPlatformVoucherId,
    onSelectionChange,
    onShopVoucherChange,
    onPlatformVoucherChange,
}: UseCartCalculationsOptions): UseCartCalculationsReturn => {
    const shops = cartData?.shops ?? [];
    const platformVouchers = cartData?.platformVouchers ?? [];

    // ========================================
    // DERIVED CALCULATIONS (Memoized)
    // ========================================

    /**
     * Main price calculation - recalculates on any dependency change
     * This is the "Single Source of Truth" for all pricing
     */
    const calculation = useMemo<CartCalculationResult>(() => {
        if (!cartData || shops.length === 0) {
            return {
                subtotal: 0,
                shopVoucherDiscount: 0,
                platformVoucherDiscount: 0,
                totalAmount: 0,
                totalSavings: 0,
                selectedCount: 0,
                hasOutOfStockItems: false,
            };
        }

        return calculateCartTotal(
            shops,
            selectedIds,
            appliedShopVouchers,
            appliedPlatformVoucherId,
            platformVouchers
        );
    }, [shops, selectedIds, appliedShopVouchers, appliedPlatformVoucherId, platformVouchers, cartData]);

    /**
     * "Select All" checkbox state
     */
    const selectAllState = useMemo<CheckboxState>(() => {
        return getAllCheckboxState(shops, selectedIds);
    }, [shops, selectedIds]);

    // ========================================
    // SELECTION HELPERS
    // ========================================

    /**
     * Get checkbox state for a specific shop
     */
    const getShopState = useCallback(
        (shopId: string): CheckboxState => {
            const shop = shops.find((s) => s.shopId === shopId);
            if (!shop) return 'unchecked';
            return getShopCheckboxState(shop, selectedIds);
        },
        [shops, selectedIds]
    );

    /**
     * Check if an item is selected
     */
    const isItemSelected = useCallback(
        (itemId: string): boolean => {
            return selectedIds.has(itemId);
        },
        [selectedIds]
    );

    // ========================================
    // SELECTION ACTIONS
    // ========================================

    /**
     * Toggle single item selection
     */
    const toggleItem = useCallback(
        (itemId: string) => {
            const newSelectedIds = new Set(selectedIds);
            if (newSelectedIds.has(itemId)) {
                newSelectedIds.delete(itemId);
            } else {
                newSelectedIds.add(itemId);
            }
            onSelectionChange(newSelectedIds);
        },
        [selectedIds, onSelectionChange]
    );

    /**
     * Toggle all items in a shop
     * - If shop is unchecked/indeterminate -> select all shop items
     * - If shop is checked -> deselect all shop items
     */
    const toggleShop = useCallback(
        (shopId: string) => {
            const shop = shops.find((s) => s.shopId === shopId);
            if (!shop) return;

            const shopState = getShopCheckboxState(shop, selectedIds);
            const shopItemIds = getShopItemIds(shop);
            const newSelectedIds = new Set(selectedIds);

            if (shopState === 'checked') {
                // Deselect all shop items
                shopItemIds.forEach((id) => newSelectedIds.delete(id));
            } else {
                // Select all shop items
                shopItemIds.forEach((id) => newSelectedIds.add(id));
            }

            onSelectionChange(newSelectedIds);
        },
        [shops, selectedIds, onSelectionChange]
    );

    /**
     * Toggle select all
     * - If not all selected -> select all
     * - If all selected -> deselect all
     */
    const toggleSelectAll = useCallback(() => {
        const allSelectableIds = getSelectableItemIds(shops);

        if (selectAllState === 'checked') {
            // Deselect all
            onSelectionChange(new Set());
        } else {
            // Select all
            onSelectionChange(new Set(allSelectableIds));
        }
    }, [shops, selectAllState, onSelectionChange]);

    // ========================================
    // VOUCHER ACTIONS
    // ========================================

    const applyShopVoucher = useCallback(
        (shopId: string, voucherId: string | null) => {
            onShopVoucherChange(shopId, voucherId);
        },
        [onShopVoucherChange]
    );

    const applyPlatformVoucher = useCallback(
        (voucherId: string | null) => {
            onPlatformVoucherChange(voucherId);
        },
        [onPlatformVoucherChange]
    );

    return {
        calculation,
        selectAllState,
        getShopState,
        toggleItem,
        toggleShop,
        toggleSelectAll,
        isItemSelected,
        applyShopVoucher,
        applyPlatformVoucher,
    };
};

// ============================================
// HELPER HOOK: Selection State Only
// ============================================

/**
 * Lightweight hook for components that only need selection state
 * (e.g., CartCheckbox in isolated memo components)
 */
export interface UseItemSelectionReturn {
    isSelected: boolean;
    toggle: () => void;
}

export const useItemSelection = (
    itemId: string,
    selectedIds: Set<string>,
    onToggle: (itemId: string) => void
): UseItemSelectionReturn => {
    const isSelected = selectedIds.has(itemId);
    const toggle = useCallback(() => onToggle(itemId), [itemId, onToggle]);

    return { isSelected, toggle };
};
