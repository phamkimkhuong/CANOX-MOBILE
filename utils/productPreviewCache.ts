/**
 * Lightweight in-memory preview cache for product navigation.
 * Used to keep the listing hero available for the first detail reveal.
 */

export interface ProductPreviewSnapshot {
    productId: string;
    imageUrl: string;
}

interface CachedProductPreview extends ProductPreviewSnapshot {
    cachedAt: number;
}

const PREVIEW_TTL_MS = 5 * 60 * 1000;
const MAX_PREVIEW_ENTRIES = 30;

const previewCache = new Map<string, CachedProductPreview>();

const pruneExpiredEntries = (): void => {
    const now = Date.now();

    for (const [productId, preview] of previewCache.entries()) {
        if (now - preview.cachedAt > PREVIEW_TTL_MS) {
            previewCache.delete(productId);
        }
    }
};

const trimCache = (): void => {
    while (previewCache.size > MAX_PREVIEW_ENTRIES) {
        const oldestKey = previewCache.keys().next().value as string | undefined;
        if (!oldestKey) break;
        previewCache.delete(oldestKey);
    }
};

export const seedProductPreview = (preview: ProductPreviewSnapshot): void => {
    if (!preview.productId || !preview.imageUrl) {
        return;
    }

    pruneExpiredEntries();

    previewCache.set(preview.productId, {
        ...preview,
        cachedAt: Date.now(),
    });

    trimCache();
};

export const getProductPreview = (
    productId: string | null | undefined
): ProductPreviewSnapshot | null => {
    if (!productId) {
        return null;
    }

    pruneExpiredEntries();

    const preview = previewCache.get(productId);
    if (!preview) {
        return null;
    }

    return {
        productId: preview.productId,
        imageUrl: preview.imageUrl,
    };
};
