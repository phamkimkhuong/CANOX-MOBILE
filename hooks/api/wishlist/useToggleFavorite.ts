import { wishlistService } from '@/services/api/wishlist';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import Toast from 'react-native-toast-message';
import { wishlistKeys } from './useWishlists';

/**
 * ==============================================
 * USE TOGGLE FAVORITE - Optimistic Mutation + Debounce
 * ==============================================
 * Handling rapid user clicks (spam clicks):
 * 1. UI resolves INSTANTLY via Zustand without friction.
 * 2. API calls are DEBOUNCED (~500ms) to prevent network spam & race conditions.
 * 3. Only the FINAL desired state triggers a network request.
 */
export const useToggleFavorite = () => {
    const queryClient = useQueryClient();
    const store = useWishlistStore();

    // Map: variantId -> SetTimeout timer
    const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    // Map: variantId -> original state before the first click in a rapid sequence
    const previousStates = useRef<Record<string, boolean>>({});

    const mutation = useMutation({
        mutationFn: async ({ variantId, targetState }: { variantId: string, targetState: boolean }) => {
            if (targetState) {
                // ACTION: ADD TO DEFAULT WISHLIST (Final state is Heart=Red)
                await wishlistService.addToDefaultWishlist({
                    variantId,
                    quantity: 1,
                    priority: 0,
                });
                return { action: 'added' };
            } else {
                // ACTION: REMOVE FROM WISHLIST (Final state is Heart=White)
                const defaultWl = await wishlistService.getDefaultWishlist();
                const itemToRemove = defaultWl.items?.find(i => i.variantId === variantId);

                if (itemToRemove && itemToRemove.id) {
                    await wishlistService.removeFromWishlist(defaultWl.id, itemToRemove.id);
                    return { action: 'removed' };
                } else {
                    // It's possible the item was in a custom wishlist, not the default one.
                    // For now, if we can't find it to remove, we just resolve.
                    console.warn('Item not found in default wishlist to remove');
                    return { action: 'ignored' };
                }
            }
        },
        onError: (err, { variantId }) => {
            // Revert to the ORIGINAL state before the click storm
            const rollbackState = previousStates.current[variantId];
            if (rollbackState !== undefined) {
                store.setFavoriteState(variantId, rollbackState);
            }
            Toast.show({
                type: 'error',
                text1: 'Lỗi đồng bộ',
                text2: 'Không thể cập nhật danh sách Yêu thích lúc này!',
            });
            console.error('[useToggleFavorite]', err);
        },
        onSuccess: (data) => {
            if (data.action === 'added') {
                Toast.show({
                    type: 'success',
                    text1: 'Đã lưu',
                    text2: 'Sản phẩm đã nằm trong Bộ sưu tập của bạn 💖',
                    visibilityTime: 2000,
                });
            } else if (data.action === 'removed') {
                Toast.show({
                    type: 'success',
                    text1: 'Đã bỏ yêu thích',
                    text2: 'Đã xóa sản phẩm khỏi bộ sưu tập.',
                    visibilityTime: 1500,
                });
            }
        },
        onSettled: (_, __, { variantId }) => {
            // Clean up tracking and invalidate cache
            delete previousStates.current[variantId];
            queryClient.invalidateQueries({ queryKey: wishlistKeys.default() });
            queryClient.invalidateQueries({ queryKey: [...wishlistKeys.all, 'check-variants'] });
        },
    });

    /**
     * The exposed trigger function:
     * - Immediate UI update
     * - Debounced network request
     */
    const toggleDebounced = ({ variantId, isCurrentlyLiked: _isCurrentlyLiked }: { variantId: string, isCurrentlyLiked: boolean }) => {
        // Here we read the LIVE fresh state manually in case the parent passed a stale `isCurrentlyLiked` during rapid clicks
        const currentState = !!useWishlistStore.getState().favoritesMap[variantId];
        const targetState = !currentState;

        // INSTANT OPTIMISTIC UI UPDATE
        store.setFavoriteState(variantId, targetState);

        // Clear existing timer for this specific product if user is spam-clicking
        if (debounceTimers.current[variantId]) {
            clearTimeout(debounceTimers.current[variantId]);
        }

        // Record the "original" state if this is the FIRST click in a sequence
        if (previousStates.current[variantId] === undefined) {
            // we use the state BEFORE this current click
            previousStates.current[variantId] = currentState;
        }

        // Setup the execution timer (debounce)
        debounceTimers.current[variantId] = setTimeout(() => {
            // Read the final state decided after the delay
            const finalState = !!useWishlistStore.getState().favoritesMap[variantId];
            const originalState = previousStates.current[variantId];

            delete debounceTimers.current[variantId];

            // NO NETWORK CALL NEEDED IF CANCELLED OUT
            if (finalState === originalState) {
                delete previousStates.current[variantId];
                return;
            }

            // STATES DIVERGED => MATCH FINAL UI STATE TO BACKEND
            mutation.mutate({ variantId, targetState: finalState });

        }, 1000); // 1000ms delay to absorb rapid clicks
    };

    return { mutate: toggleDebounced, isLoading: mutation.isPending };
};
