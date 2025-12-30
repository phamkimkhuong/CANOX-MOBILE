import { create } from 'zustand';

interface CartState {
    totalQuantity: number;
    setTotalQuantity: (quantity: number) => void;
    // Actions phụ trợ nếu muốn optimistic update thủ công
    increment: (qty?: number) => void;
    clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    totalQuantity: 0,
    setTotalQuantity: (quantity) => set({ totalQuantity: quantity }),
    increment: (qty = 1) => set((state) => ({ totalQuantity: state.totalQuantity + qty })),
    clear: () => set({ totalQuantity: 0 }),
}));