/**
 * Order Count Adapter Unit Tests
 */

import type { OrderCountApiResponse } from '@/types/order/orderCount';
import { transformOrderCount } from '@/utils/adapter/order/orderCountAdapter';

describe('orderCountAdapter', () => {
    describe('transformOrderCount', () => {
        it('maps API response fields to OrderStats', () => {
            const apiData: OrderCountApiResponse = {
                await_payment: 2,
                pending: 3,
                processing: 5,
                shipping: 4,
                completed: 10,
                returnRefund: 1,
                cancelled: 0,
                total: 20,
            };

            const result = transformOrderCount(apiData);

            expect(result.pendingPayment).toBe(2);
            expect(result.processing).toBe(3);
            expect(result.shipping).toBe(5);
            expect(result.review).toBe(0); // Always 0 (hardcoded)
            expect(result.completed).toBe(10);
            expect(result.total).toBe(20);
        });

        it('handles zero counts', () => {
            const apiData: OrderCountApiResponse = {
                await_payment: 0,
                pending: 0,
                processing: 0,
                shipping: 0,
                completed: 0,
                returnRefund: 0,
                cancelled: 0,
                total: 0,
            };

            const result = transformOrderCount(apiData);

            expect(result.pendingPayment).toBe(0);
            expect(result.processing).toBe(0);
            expect(result.shipping).toBe(0);
            expect(result.total).toBe(0);
        });
    });
});
