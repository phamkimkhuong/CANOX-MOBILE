import { z } from 'zod';

/**
 * ==============================================
 * ORDER COUNT API TYPES
 * ==============================================
 */

/**
 * API Response Schema
 */
export const OrderCountApiResponseSchema = z.object({
    awaitingPayment: z.number().default(0), // Chờ thanh toán
    processing: z.number().default(0),      // Đang xử lý (CREATED, FULFILLING)
    shipping: z.number().default(0),        // Đang giao
    delivered: z.number().default(0),       // Đã giao
    completed: z.number().default(0),       // Hoàn thành
    returning: z.number().default(0),       // Đang hoàn/trả hàng
    cancelled: z.number().default(0),       // Đã hủy
    total: z.number().default(0),           // Tổng số đơn
});

export type OrderCountApiResponse = z.infer<typeof OrderCountApiResponseSchema>;

/**
 * Full API Response Wrapper
 */
export const OrderCountResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: OrderCountApiResponseSchema,
});

export type OrderCountResponse = z.infer<typeof OrderCountResponseSchema>;
