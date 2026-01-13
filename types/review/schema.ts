import { z } from 'zod';

/**
 * Zod schema for review form validation
 */
export const ReviewFormSchema = z.object({
    rating: z.number().min(1, 'Vui lòng chọn số sao').max(5),
    comment: z.string().min(1, 'Vui lòng nhập nhận xét'),
    selectedTags: z.array(z.string()),
    isAnonymous: z.boolean(),
});
