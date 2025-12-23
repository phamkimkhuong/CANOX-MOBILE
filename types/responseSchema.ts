import z from "zod";

// Schema cho Response Default
export const ResponseDefaultSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: z.any()
});