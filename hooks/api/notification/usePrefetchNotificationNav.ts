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

import { API_ROUTES } from '@/constants/apiRoutes';
import { orderKeys } from '@/hooks/api/order/useOrders';
import { apiClient } from '@/services/api/client';
import type { Order } from '@/types/order/order';
import { transformOrder } from '@/utils/adapter/order/orderAdapter';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

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
 * Fetch order detail (duplicate from useOrderDetail to avoid circular deps)
 */
interface OrderDetailApiResponse {
    code: number;
    success: boolean;
    message: string;
    data: Order;
}

const fetchOrderDetail = async (orderId: string): Promise<Order> => {
    const response = await apiClient.get<OrderDetailApiResponse>(
        API_ROUTES.ORDERS.DETAIL(orderId)
    );
    if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch order');
    }
    return response.data.data;
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
    const queryClient = useQueryClient();

    /**
     * Prefetch data based on actionUrl
     * Called on onPressIn to load data while user's finger is still on screen
     */
    const prefetch = useCallback((actionUrl: string | null | undefined) => {
        const { type, id } = parseActionUrl(actionUrl);

        if (!id) return;

        switch (type) {
            case 'order':
                // Prefetch order detail
                queryClient.prefetchQuery({
                    queryKey: orderKeys.detail(id),
                    queryFn: async () => {
                        const order = await fetchOrderDetail(id);
                        return {
                            raw: order,
                            ui: transformOrder(order),
                        };
                    },
                    staleTime: 5 * 60 * 1000, // 5 minutes
                });
                break;

            case 'product':
                // TODO: Implement product prefetch when needed
                // queryClient.prefetchQuery({
                //     queryKey: productKeys.detail(id),
                //     queryFn: () => fetchProductDetail(id),
                // });
                break;

            default:
                // Unknown route type, do nothing
                break;
        }
    }, [queryClient]);

    return prefetch;
};

export default usePrefetchNotificationNav;
