/**
 * ==============================================
 * ORDER COUNT ADAPTER
 * ==============================================
 * Transform API response to UI OrderStats format
 */

import { OrderCountApiResponse } from '@/types/order/orderCount';
import { OrderStats } from '@/types/profile/profile';

/**
 * Transform Order Count API Response → OrderStats (Profile UI)
 * 
 * Mapping logic:
 * - pendingPayment: awaitingPayment
 * - processing: processing (CREATED + FULFILLING from API)
 * - shipping: shipping
 * - review: delivered (chưa đánh giá - cần check từ API khác)
 */
export const transformOrderCount = (apiData: OrderCountApiResponse): OrderStats => {
    return {
        pendingPayment: apiData.awaitingPayment,
        processing: apiData.processing,
        shipping: apiData.shipping,
        // Review = delivered orders (assumption: chưa đánh giá)
        review: apiData.delivered,
    };
};
