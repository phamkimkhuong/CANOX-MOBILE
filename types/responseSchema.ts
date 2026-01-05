import z from "zod";

// Schema cho Response Default
export const ResponseDefaultSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string().optional(),
    data: z.any()
});

export interface PaginatedResponse<T> {
    code: number;
    success: boolean;
    data: {
        content: T[];
        page: number;
        size: number;
        totalPages: number;
        hasNext: boolean;
    };
}

/**
 * Helper function to create a paginated response schema
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(contentSchema: T) =>
    ResponseDefaultSchema.extend({
        data: z.object({
            content: z.array(contentSchema),
            page: z.number(),
            size: z.number(),
            totalElements: z.number().optional(),
            totalPages: z.number(),
            hasNext: z.boolean(),
        }),
    });