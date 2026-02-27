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
 */
export const transformOrderCount = (apiData: OrderCountApiResponse): OrderStats => {
    return {
        pendingPayment: apiData.await_payment,
        processing: apiData.pending,
        shipping: apiData.processing,
        review: 0,
        completed: apiData.completed,
        total: apiData.total,
    };
};
