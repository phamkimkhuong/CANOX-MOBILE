/**
 * ==============================================
 * WISHLIST TYPES - Re-export from canonical source
 * ==============================================
 */

// Re-export everything from the canonical wishlist types
export {
    WishlistSummarySchema as WishlistDTOSchema,
    WishlistPageSchema,
    type WishlistSummarySchemaType as WishlistDTO,
    type WishlistPageSchemaType
} from '@/types/wishlist/wishlistSchema';

export { type WishlistQueryParams as WishlistFilterParams } from '@/types/wishlist/request';
export { type WishlistCardUI as WishlistUI } from '@/types/wishlist/ui';

import { WishlistPageSchema } from '@/types/wishlist/wishlistSchema';
import { z } from 'zod';
import { ResponseDefaultSchema } from '../responseSchema';

export const WishlistsResponseSchema = ResponseDefaultSchema.extend({
    data: WishlistPageSchema.shape.data,
});

export type WishlistsResponse = z.infer<typeof WishlistsResponseSchema>;
