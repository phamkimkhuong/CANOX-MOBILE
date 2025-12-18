// Local cart state (draft) with MMKV persistence
// This is CLIENT state, not server state. Final cart sync to API happens separately.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { zustandMMKVStorage } from './storage';

interface CartItem {
    productId: number;
    title: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const existing = get().items.find((i) => i.productId === item.productId);

                if (existing) {
                    set({
                        items: get().items.map((i) =>
                            i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    });
                    return;
                }

                set({ items: [...get().items, { ...item, quantity: 1 }] });
            },

            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.productId !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: get().items.map((i) =>
                        i.productId === productId ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        {
            name: 'cart-draft',
            storage: zustandMMKVStorage,
        }
    )
);
