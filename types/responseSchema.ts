import z from "zod";

// Schema cho Response Default
export const ResponseDefaultSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
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