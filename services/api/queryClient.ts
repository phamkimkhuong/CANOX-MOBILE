import { logger } from '@/utils/logger';
/**
 * QueryClient Configuration
 * 
 * Features:
 * - Global retry logic with SessionExpiredError handling
 * - Prevents retries when session expired (pointless)
 * - Individual hooks handle their own error toasts
 */

import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isSessionExpiredError } from './client';

/**
 * Check if error should trigger retry
 * SessionExpiredError should NOT retry (session is dead)
 */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
    // Never retry SessionExpiredError - pointless, session is dead
    if (isSessionExpiredError(error)) {
        return false;
    }

    // Normal errors: retry up to 2 times
    return failureCount < 2;
};

/**
 * Global error handler for queries
 * Logs errors but doesn't show UI - individual hooks handle that
 */
const handleQueryError = (error: unknown): void => {
    // SessionExpiredError: Silently ignore (logout is happening)
    if (isSessionExpiredError(error)) {
        return;
    }

    // Log for debugging (individual hooks show UI feedback)
    logger.api.error('[QueryCache] Error:', error);
};

/**
 * Global error handler for mutations
 * Logs errors but doesn't show UI - individual hooks handle that
 * This is called AFTER the individual hook's onError
 */
const handleMutationError = (error: unknown): void => {
    // SessionExpiredError: Silently ignore (logout is happening)
    if (isSessionExpiredError(error)) {
        return;
    }

    // Log for debugging (individual hooks show UI feedback)
    logger.api.error('[MutationCache] Error:', error);
};

export const queryClient = new QueryClient({
    // Query cache with global error logging
    queryCache: new QueryCache({
        onError: handleQueryError,
    }),

    // Mutation cache with global error logging
    mutationCache: new MutationCache({
        onError: handleMutationError,
    }),

    defaultOptions: {
        queries: {
            // Custom retry logic - no retry on SessionExpiredError
            retry: shouldRetry,
            // Data considered fresh for 1 minute
            staleTime: 1000 * 60,
            // Refetch on reconnect (useful for mobile)
            refetchOnReconnect: true,
        },
        mutations: {
            retry: false,
        },
    },
});
