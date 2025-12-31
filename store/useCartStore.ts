import { create } from 'zustand';

// ============================================
// TYPES
// ============================================

interface CartState {
    // Badge count (synced with server)
    totalQuantity: number;
    setTotalQuantity: (quantity: number) => void;
    increment: (qty?: number) => void;
    clear: () => void;

    // Selection state (client-only)
    selectedItemIds: Set<string>;
    setSelectedItemIds: (ids: Set<string>) => void;
    toggleItemSelection: (itemId: string) => void;
    clearSelection: () => void;

    // Applied vouchers (client-only)
    appliedShopVouchers: Map<string, string>; // shopId -> voucherId
    setShopVoucher: (shopId: string, voucherId: string | null) => void;
    clearShopVouchers: () => void;

    appliedPlatformVoucherId: string | null;
    setPlatformVoucher: (voucherId: string | null) => void;

    // Edit mode
    isEditMode: boolean;
    setEditMode: (isEdit: boolean) => void;
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useCartStore = create<CartState>((set) => ({
    // ========================================
    // Badge Count
    // ========================================
    totalQuantity: 0,
    setTotalQuantity: (quantity) => set({ totalQuantity: quantity }),
    increment: (qty = 1) => set((state) => ({ totalQuantity: state.totalQuantity + qty })),
    clear: () => set({ totalQuantity: 0 }),

    // ========================================
    // Selection State
    // ========================================
    selectedItemIds: new Set<string>(),
    setSelectedItemIds: (ids) => set({ selectedItemIds: ids }),
    toggleItemSelection: (itemId) =>
        set((state) => {
            const newSet = new Set(state.selectedItemIds);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return { selectedItemIds: newSet };
        }),
    clearSelection: () => set({ selectedItemIds: new Set() }),

    // ========================================
    // Voucher State
    // ========================================
    appliedShopVouchers: new Map<string, string>(),
    setShopVoucher: (shopId, voucherId) =>
        set((state) => {
            const newMap = new Map(state.appliedShopVouchers);
            if (voucherId === null) {
                newMap.delete(shopId);
            } else {
                newMap.set(shopId, voucherId);
            }
            return { appliedShopVouchers: newMap };
        }),
    clearShopVouchers: () => set({ appliedShopVouchers: new Map() }),

    appliedPlatformVoucherId: null,
    setPlatformVoucher: (voucherId) => set({ appliedPlatformVoucherId: voucherId }),

    // ========================================
    // Edit Mode
    // ========================================
    isEditMode: false,
    setEditMode: (isEdit) => set({ isEditMode: isEdit }),
}));