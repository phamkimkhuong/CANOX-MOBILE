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
        totalElements?: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious?: boolean;
        nextPage?: number | null;
        previousPage?: number | null;
        empty?: boolean;
        first?: boolean;
        last?: boolean;
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
            hasPrevious: z.boolean().optional(),
            nextPage: z.number().nullable().optional(),
            previousPage: z.number().nullable().optional(),
            empty: z.boolean().optional(),
            first: z.boolean().optional(),
            last: z.boolean().optional(),
        }),
    });