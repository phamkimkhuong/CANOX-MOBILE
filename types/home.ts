import { z } from 'zod';
import { ProductResponseItemSchema } from './product';

/**
 * Flash Sale Slot Data (FE Simulated)
 */
export interface FlashSaleSlot {
    id: string;
    startTime: string; // ISO String
    endTime: string;   // ISO String
    label: string;     // e.g. "09:00", "12:00"
}

/**
 * Flash Sale Item for UI
 */
export interface FlashSaleItem {
    id: string;
    productId: string;
    image: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    soldCount: number;
    totalStock: number;
    progress: number; // 0 to 100
}

/**
 * Flash Sale UI State
 */
export interface FlashSaleData {
    slot: FlashSaleSlot;
    items: FlashSaleItem[];
}

/**
 * Schema cho API response
 */
export const FlashSaleResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    data: z.object({
        content: z.array(ProductResponseItemSchema),
        page: z.number(),
        size: z.number(),
        totalElements: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
    }),
});

export type FlashSaleResponse = z.infer<typeof FlashSaleResponseSchema>;
