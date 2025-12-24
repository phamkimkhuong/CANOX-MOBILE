import type { CacheInfo } from '@/types/settings';
import { calculateCacheSize, clearAllCache, formatBytes } from '@/utils/cache';
import { useCallback, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';

interface UseCacheReturn {
    /** Cache information */
    cacheInfo: CacheInfo;
    /** Formatted cache size string */
    formattedSize: string;
    /** Whether cache is being calculated */
    isCalculating: boolean;
    /** Whether cache is being cleared */
    isClearing: boolean;
    /** Error message if any */
    error: string | null;
    /** Recalculate cache size */
    refreshCacheSize: () => Promise<void>;
    /** Clear all cached data */
    clearCache: () => Promise<boolean>;
}

const INITIAL_CACHE_INFO: CacheInfo = {
    size: 0,
    lastCalculated: null,
};

/**
 * Hook for managing app cache
 * Handles cache size calculation and clearing
 */
export function useCache(): UseCacheReturn {
    const [cacheInfo, setCacheInfo] = useState<CacheInfo>(INITIAL_CACHE_INFO);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Calculate cache size
     */
    const refreshCacheSize = useCallback(async () => {
        try {
            setIsCalculating(true);
            setError(null);

            const size = await calculateCacheSize();

            setCacheInfo({
                size,
                lastCalculated: new Date(),
            });
        } catch (err) {
            setError('Không thể tính toán cache');
            setCacheInfo({
                size: 0,
                lastCalculated: null,
            });
        } finally {
            setIsCalculating(false);
        }
    }, []);

    /**
     * Clear all cached data
     */
    const clearCache = useCallback(async (): Promise<boolean> => {
        try {
            setIsClearing(true);
            setError(null);

            const success = await clearAllCache();

            if (success) {
                // Reset cache info after clearing
                setCacheInfo({
                    size: 0,
                    lastCalculated: new Date(),
                });
            } else {
                setError('Không thể xóa cache hoàn toàn');
            }

            return success;
        } catch (err) {
            setError('Lỗi khi xóa cache');
            return false;
        } finally {
            setIsClearing(false);
        }
    }, []);

    // Calculate cache size on mount with a delay to let UI transition finish
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            // Thêm một khoảng nghỉ ngắn tầm 500ms để người dùng kịp nhìn thấy màn hình
            setTimeout(() => {
                refreshCacheSize();
            }, 500);
        });

        return () => task.cancel();
    }, [refreshCacheSize]);

    // Format cache size for display
    const formattedSize = (isCalculating || cacheInfo.lastCalculated === null)
        ? '...'
        : formatBytes(cacheInfo.size);

    return {
        cacheInfo,
        formattedSize,
        isCalculating,
        isClearing,
        error,
        refreshCacheSize,
        clearCache,
    };
}
