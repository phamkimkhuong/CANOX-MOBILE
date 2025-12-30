import { z } from 'zod';

// Schema cho từng Item trong giỏ (dựa trên JSON items)
export const CartItemSchema = z.object({
    id: z.string(),
    variantId: z.string(),
    productName: z.string(),
    sku: z.string().optional(),
    variantAttributes: z.string().optional(),
    unitPrice: z.number(),
    quantity: z.number(),
    totalPrice: z.number(),
    shopId: z.string(),
    shopName: z.string(),
    imageBasePath: z.string().nullable().optional(),
    imageExtension: z.string().nullable().optional(),
});

// Schema cho Shop trong giỏ
export const CartShopSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    items: z.array(CartItemSchema),
    itemCount: z.number(), // Số lượng item của shop này
});

// Schema cho toàn bộ Giỏ hàng (Root)
export const CartResponseSchema = z.object({
    id: z.string(),
    totalAmount: z.number(),
    itemCount: z.number(), // Đây là số hiển thị trên Badge
    shops: z.array(CartShopSchema),
});

export type CartResponse = z.infer<typeof CartResponseSchema>;