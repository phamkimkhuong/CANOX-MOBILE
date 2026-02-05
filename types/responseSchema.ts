import z from "zod";

// Schema cho Response Default
export const ResponseDefaultSchema = z.object({
    code: z.number().nullable().optional().default(0),
    success: z.boolean().nullable().optional().default(true),
    message: z.string().nullable().optional().default(''),
    data: z.any().optional()
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
export const createPaginatedResponseSchema = <T extends z.ZodType>(contentSchema: T) =>
    ResponseDefaultSchema.extend({
        data: z.object({
            content: z.array(contentSchema).default([]),
            page: z.number().catch(0),
            size: z.number().catch(20),
            totalElements: z.number().optional().catch(0),
            totalPages: z.number().catch(0),
            hasNext: z.boolean().catch(false),
            hasPrevious: z.boolean().optional().catch(false),
            nextPage: z.number().nullable().optional(),
            previousPage: z.number().nullable().optional(),
            empty: z.boolean().optional(),
            first: z.boolean().optional(),
            last: z.boolean().optional(),
        }).nullable().optional(),
    });