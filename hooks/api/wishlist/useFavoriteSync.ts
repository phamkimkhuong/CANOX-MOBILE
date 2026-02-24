import { wishlistService } from '@/services/api/wishlist';
import { useWishlistStore } from '@/store/useWishlistStore';
import type { ProductFeedItem } from '@/types/product/product';
import { createLogger } from '@/utils/logger';
import { useCallback, useRef } from 'react';

const log = createLogger('useFavoriteSync');

/**
 * Product-Variant mapping entry
 * Used to map check-variants results back to the deterministic defaultVariantId
 */
interface ProductVariantMap {
    defaultVariantId: string;
    allVariantIds: string[];
}

/**
 * ==============================================
 * USE FAVORITE SYNC — Incremental Variant Check
 * ==============================================
 * Collects ALL variantIds from product list pages
 * and calls check-variants API only for NEW IDs.
 */
export const useFavoriteSync = () => {
    const syncFavorites = useWishlistStore(state => state.syncFavorites);
    // Track which products (by defaultVariantId) have been checked
    const checkedProductsRef = useRef<Set<string>>(new Set());
    // Pending batch: product-variant mappings to check
    const pendingProductsRef = useRef<ProductVariantMap[]>([]);
    // Debounce timer
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Sync favorites for a list of products.
     * Sends ALL variant IDs to check-variants, then maps results
     * back to each product's defaultVariantId.
     */
    const syncFromProducts = useCallback((products: ProductFeedItem[]) => {
        let hasNew = false;

        for (const product of products) {
            const defaultVid = product.defaultVariantId;
            const allVids = product.allVariantIds;

            // Skip if no variants or already checked this product
            if (!defaultVid || !allVids?.length) continue;
            if (checkedProductsRef.current.has(defaultVid)) continue;

            pendingProductsRef.current.push({
                defaultVariantId: defaultVid,
                allVariantIds: allVids,
            });
            hasNew = true;
        }

        if (!hasNew) return;

        // Debounce: wait 100ms to batch consecutive page loads
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async () => {
            const batch = [...pendingProductsRef.current];
            pendingProductsRef.current = [];

            if (batch.length === 0) return;

            // Collect ALL variant IDs from all pending products (dedup)
            const allIdsToCheck = Array.from(
                batch.reduce((set, entry) => {
                    for (const vid of entry.allVariantIds) set.add(vid);
                    return set;
                }, new Set<string>())
            );

            try {
                if (__DEV__) {
                    log.info(`Checking ${allIdsToCheck.length} variantIds for ${batch.length} products`);
                }

                // API limit: max 100 variantIds per request → chunk with 90 margin
                const CHUNK_SIZE = 90;
                let mergedResult: Record<string, boolean> = {};

                if (allIdsToCheck.length <= CHUNK_SIZE) {
                    // Fast path: single request
                    mergedResult = await wishlistService.checkVariants(allIdsToCheck);
                } else {
                    // Chunked: split into parallel requests
                    const chunks: string[][] = [];
                    for (let i = 0; i < allIdsToCheck.length; i += CHUNK_SIZE) {
                        chunks.push(allIdsToCheck.slice(i, i + CHUNK_SIZE));
                    }
                    const results = await Promise.all(
                        chunks.map(chunk => wishlistService.checkVariants(chunk))
                    );
                    for (const partial of results) {
                        mergedResult = { ...mergedResult, ...partial };
                    }
                }

                // Map results back: if ANY variant of a product is liked → defaultVariantId = true
                const favoriteMap: Record<string, boolean> = {};

                for (const entry of batch) {
                    const isAnyLiked = entry.allVariantIds.some(vid => mergedResult[vid] === true);
                    favoriteMap[entry.defaultVariantId] = isAnyLiked;
                    // Mark product as checked
                    checkedProductsRef.current.add(entry.defaultVariantId);
                }

                // Sync to Zustand store
                syncFavorites(favoriteMap);
            } catch {
                // Silently fail — heart stays hidden, user can still interact
                if (__DEV__) {
                    log.warn('Failed to check variant favorites');
                }
            }
        }, 100);
    }, [syncFavorites]);

    /**
     * Reset checked IDs (e.g., on tab change or pull-to-refresh)
     */
    const resetCheckedIds = useCallback(() => {
        checkedProductsRef.current.clear();
        pendingProductsRef.current = [];
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return { syncFromProducts, resetCheckedIds };
};
