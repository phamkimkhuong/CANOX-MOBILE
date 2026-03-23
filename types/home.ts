import { z } from 'zod';

/**
 * Flash Sale Slot Data (from Public Campaign API)
 */
export const FlashSaleSlotSchema = z.object({
    id: z.string(),
    startTime: z.string(), // ISO String
    endTime: z.string(),   // ISO String
    label: z.string(),     // e.g. "Khung giờ vàng", "Flash Sale 12h"
    isUpcoming: z.boolean().optional().default(false), // true = countdown to startTime, false = countdown to endTime
});

export type FlashSaleSlot = z.infer<typeof FlashSaleSlotSchema>;

/**
 * Flash Sale Item for UI
 */
export const FlashSaleItemSchema = z.object({
    id: z.string(),
    productId: z.string(),
    name: z.string(),
    image: z.string(),
    price: z.number(),
    originalPrice: z.number(),
    discountPercentage: z.number(),
    soldCount: z.number(),
    totalStock: z.number(),
    stockRemaining: z.number(),
    progress: z.number(), // 0 to 100
    isSoldOut: z.boolean(),
});

export type FlashSaleItem = z.infer<typeof FlashSaleItemSchema>;

/**
 * Flash Sale UI State
 */
export const FlashSaleDataSchema = z.object({
    slot: FlashSaleSlotSchema,
    items: z.array(FlashSaleItemSchema),
});

export type FlashSaleData = z.infer<typeof FlashSaleDataSchema>;
