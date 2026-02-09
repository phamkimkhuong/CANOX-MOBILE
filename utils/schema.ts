import { z } from 'zod';
import { logger } from './logger';

/**
 * Validate API data safely.
 * If schema validation fails: Log detailed error for debugging, but return fallback to prevent app crashes.
 * 
 * @param schema - Zod Schema for validation
 * @param data - Actual data from API
 * @param fallback - Default value if validation fails
 * @param context - API name or context for easier debugging
 */
export function safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    fallback: T,
    context: string
): T {
    const result = schema.safeParse(data);

    if (!result.success) {
        // Log error details for debugging
        logger.api.error(
            `[Schema Mismatch] ${context}:`,
            {
                errors: result.error.format(),
                receivedData: data
            }
        );
        return fallback;
    }

    return result.data;
}
