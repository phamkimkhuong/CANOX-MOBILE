import { z } from 'zod';
import { ProductResponseItemSchema } from './product/product';
import { createPaginatedResponseSchema } from './responseSchema';

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
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    soldCount: number;
    totalStock: number;
    progress: number; // 0 to 100
    isSoldOut: boolean;
    purchaseLimitPerUser?: number | null;
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
export const FlashSaleResponseSchema = createPaginatedResponseSchema(ProductResponseItemSchema);

export type FlashSaleResponse = z.infer<typeof FlashSaleResponseSchema>;
