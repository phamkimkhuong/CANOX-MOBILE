import { create } from 'zustand';

/**
 * ==============================================
 * WISHLIST STORE (Zustand)
 * ==============================================
 * Local UI State for Optimistic UI updates.
 * Stores map of variantId -> boolean (liked/unliked)
 */

interface WishlistState {
    // Dictionary mapping variantId -> isLiked
    favoritesMap: Record<string, boolean>;

    // Actions
    /** Sync data from server (check-variants response) */
    syncFavorites: (map: Record<string, boolean>) => void;

    /** Toggle like state optimistically */
    toggleFavoriteLocal: (variantId: string) => void;

    /** Override manually if API fails */
    setFavoriteState: (variantId: string, isLiked: boolean) => void;

    /** Clear all states on logout */
    clearFavorites: () => void;
}

export const useWishlistStore = create<WishlistState>()((set) => ({
    favoritesMap: {},

    syncFavorites: (map) => set((state) => ({
        favoritesMap: { ...state.favoritesMap, ...map },
    })),

    toggleFavoriteLocal: (variantId) => set((state) => ({
        favoritesMap: {
            ...state.favoritesMap,
            [variantId]: !state.favoritesMap[variantId],
        },
    })),

    setFavoriteState: (variantId, isLiked) => set((state) => ({
        favoritesMap: {
            ...state.favoritesMap,
            [variantId]: isLiked,
        },
    })),

    clearFavorites: () => set({ favoritesMap: {} }),
}));
