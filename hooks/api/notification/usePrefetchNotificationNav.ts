/**
 * ==============================================
 * USE PREFETCH NOTIFICATION NAVIGATION
 * ==============================================
 * 
 * Hook để prefetch data khi user bắt đầu chạm vào notification item.
 * Phân tích actionUrl và prefetch tương ứng (order detail, product detail, etc.)
 * 
 * Pattern: onPressIn → prefetch → onPress → navigate
 * 
 * Supported Routes:
 * - /orders/[id] → prefetch order detail
 * - /product/[id] → prefetch product detail (future)
 */

import { usePrefetchOrderDetail } from '@/hooks/api/order/useOrderDetail';
import { useCallback, useRef } from 'react';

/**
 * Parse actionUrl to extract route type and ID
 * 
 * @example
 * parseActionUrl('/orders/abc-123') → { type: 'order', id: 'abc-123' }
 * parseActionUrl('/product/xyz-456') → { type: 'product', id: 'xyz-456' }
 */
const parseActionUrl = (url: string | null | undefined): { type: 'order' | 'product' | 'unknown'; id: string | null } => {
    if (!url) return { type: 'unknown', id: null };

    // Order detail: /orders/[id]
    const orderMatch = url.match(/\/orders\/([^/?]+)/);
    if (orderMatch) {
        return { type: 'order', id: orderMatch[1] };
    }

    // Product detail: /product/[id]
    const productMatch = url.match(/\/product\/([^/?]+)/);
    if (productMatch) {
        return { type: 'product', id: productMatch[1] };
    }

    return { type: 'unknown', id: null };
};

/**
 * Hook to prefetch data based on notification's actionUrl
 * 
 * Usage:
 * ```tsx
 * const prefetchNav = usePrefetchNotificationNav();
 * 
 * <NotificationItem 
 *   onPressIn={() => prefetchNav(item.actionUrl)}
 *   onPress={() => navigate(item.actionUrl)}
 * />
 * ```
 */
export const usePrefetchNotificationNav = () => {
    const prefetchOrderDetail = usePrefetchOrderDetail();

    /**
     * Ref to store pending prefetch timeout
     * Used to cancel prefetch if user releases finger quickly (scrolling)
     */
    const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Cancel any pending prefetch (call this on scroll or finger release)
     */
    const cancelPrefetch = useCallback(() => {
        if (prefetchTimeoutRef.current) {
            clearTimeout(prefetchTimeoutRef.current);
            prefetchTimeoutRef.current = null;
        }
    }, []);

    /**
     * Prefetch data based on actionUrl
     * Called on onPressIn to load data while user's finger is still on screen
     */
    const prefetch = useCallback((actionUrl: string | null | undefined) => {
        // Cancel any existing pending prefetch
        cancelPrefetch();

        const { type, id } = parseActionUrl(actionUrl);

        if (!id) return;

        switch (type) {
            case 'order':
                prefetchOrderDetail(id);
                break;

            case 'product':
                // TODO: Implement product prefetch
                break;

            default:
                break;
        }
    }, [prefetchOrderDetail, cancelPrefetch]);

    return { prefetch, cancelPrefetch };
};

export default usePrefetchNotificationNav;
