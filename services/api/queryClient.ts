import { logger } from '@/utils/logger';
/**
 * QueryClient Configuration
 * 
 * Features:
 * - Global retry logic with SessionExpiredError handling
 * - Prevents retries when session expired (pointless)
 * - Individual hooks handle their own error toasts
 */

import { Mutation, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { ApiError, isSessionExpiredError } from './errors';

/**
 * Global retry logic for queries
 * 
 * @param failureCount - Number of times the query has failed
 * @param error - The error object
 * @param maxRetries - Maximum number of retries (default from global config)
 */
export const handleQueryRetry = (failureCount: number, error: unknown, maxRetries: number = 2): boolean => {
    // Never retry SessionExpiredError - pointless, session is dead
    if (isSessionExpiredError(error)) {
        return false;
    }
    // Never retry 403 Forbidden
    if ((error as { status?: number })?.status === 403) {
        return false;
    }
    // Never retry 401 Unauthorized
    if ((error as { status?: number })?.status === 401) {
        return false;
    }

    // Normal errors: retry up to maxRetries
    return failureCount < maxRetries;
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
const handleMutationError = (
    error: unknown,
    _variables: unknown,
    _context: unknown,
    mutation: Mutation<unknown, unknown, unknown, unknown>
): void => {
    // SessionExpiredError: Silently ignore (logout is happening)
    if (isSessionExpiredError(error)) {
        return;
    }
    if (mutation.options.meta?.handledLocally) {
        return;
    }

    // Log for debugging
    logger.api.error('[MutationCache] Error:', error);

    // Show global toast for mutation errors
    if (error instanceof ApiError) {
        Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: error.message,
        });
    } else if (error instanceof Error) {
        Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: error.message,
        });
    } else {
        Toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Đã xảy ra lỗi. Vui lòng thử lại sau!',
        });
    }
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
            retry: handleQueryRetry,
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
