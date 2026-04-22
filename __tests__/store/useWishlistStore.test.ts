/**
 * Unit Tests for useWishlistStore
 */
import { act } from '@testing-library/react-native';
import { useWishlistStore } from '@/store/useWishlistStore';

describe('useWishlistStore', () => {
    beforeEach(() => {
        act(() => {
            useWishlistStore.getState().clearFavorites();
        });
    });

    it('should initialize empty', () => {
        expect(useWishlistStore.getState().favoritesMap).toEqual({});
    });

    it('should bulk sync favorites correctly', () => {
        const mockMap = { 'v-1': true, 'v-2': false, 'v-3': true };
        act(() => {
            useWishlistStore.getState().syncFavorites(mockMap);
        });

        expect(useWishlistStore.getState().favoritesMap).toEqual(mockMap);
    });

    it('should optimistic toggle favorite state locally', () => {
        // Assume empty initially, toggle v-1 (should become true)
        act(() => {
            useWishlistStore.getState().toggleFavoriteLocal('v-1');
        });
        expect(useWishlistStore.getState().favoritesMap['v-1']).toBe(true);

        // Toggle again (should become false)
        act(() => {
            useWishlistStore.getState().toggleFavoriteLocal('v-1');
        });
        expect(useWishlistStore.getState().favoritesMap['v-1']).toBe(false);
    });

    it('should force set favorite state regardless of current state', () => {
        act(() => {
            useWishlistStore.getState().setFavoriteState('v-1', true);
            useWishlistStore.getState().setFavoriteState('v-2', false);
        });

        expect(useWishlistStore.getState().favoritesMap['v-1']).toBe(true);
        expect(useWishlistStore.getState().favoritesMap['v-2']).toBe(false);
    });
});
