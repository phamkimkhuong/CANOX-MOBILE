/**
 * TokenManager - Centralized Token Refresh Logic
 * 
 * Implements 3-Layer Token Refresh Strategy:
 * - Layer 1: Eager refresh on app launch/foreground
 * - Layer 2: Proactive timer (refresh 60 min before expiry)
 * - Layer 3: Reactive interceptor (catch 401 and refresh)
 * 
 * Features:
 * - Race condition handling (isRefreshing lock)
 * - Request queue for failed requests during refresh
 * - Exponential backoff for retry
 * - Secure token storage with expo-secure-store
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { logger } from '@/utils/logger';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'user_access_token',
    REFRESH_TOKEN: 'user_refresh_token',
    TOKEN_EXPIRY: 'user_token_expiry',
} as const;

const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;

/** Time before expiry to trigger proactive refresh (60 minutes in ms) */
const PROACTIVE_REFRESH_THRESHOLD_MS = 60 * 60 * 1000;

/** Token lifetime (10 hours in ms) - used for calculating expiry */
const TOKEN_LIFETIME_MS = 10 * 60 * 60 * 1000;

/** Safety margin for eager refresh - refresh if > 50% lifetime used */
const EAGER_REFRESH_THRESHOLD_PERCENT = 0.5;

// ============================================
// TYPES
// ============================================

interface RefreshTokenResponse {
    code: number;
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
    message?: string;
}

interface QueuedRequest {
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}

// ============================================
// STATE (Module-level singleton)
// ============================================

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null;

/** Callback when refresh fails - used to trigger logout */
let onRefreshFailedCallback: (() => void) | null = null;

/**
 * Set callback to be called when token refresh fails
 * This should be called once from useAuthStore to trigger logout
 */
export const setOnRefreshFailedCallback = (callback: () => void): void => {
    onRefreshFailedCallback = callback;
};

// ============================================
// TOKEN STORAGE HELPERS
// ============================================

/**
 * Get access token from secure storage
 */
export const getAccessToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
        logger.auth.error('Failed to get access token:', error);
        return null;
    }
};

/**
 * Get refresh token from secure storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
        logger.auth.error('Failed to get refresh token:', error);
        return null;
    }
};

/**
 * Get token expiry timestamp from secure storage
 */
export const getTokenExpiry = async (): Promise<number | null> => {
    try {
        const expiry = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
        return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
        logger.auth.error('Failed to get token expiry:', error);
        return null;
    }
};

/**
 * Save tokens to secure storage
 */
export const saveTokens = async (
    accessToken: string,
    refreshToken: string
): Promise<void> => {
    try {
        const expiryTime = Date.now() + TOKEN_LIFETIME_MS;

        await Promise.all([
            SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
            SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
            SecureStore.setItemAsync(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString()),
        ]);

        logger.auth.info('Tokens saved successfully');

        // Schedule proactive refresh
        scheduleProactiveRefresh(expiryTime);
    } catch (error) {
        logger.auth.error('Failed to save tokens:', error);
        throw error;
    }
};

/**
 * Clear all tokens from secure storage
 */
export const clearTokens = async (): Promise<void> => {
    try {
        // Cancel proactive refresh timer
        if (proactiveRefreshTimer) {
            clearTimeout(proactiveRefreshTimer);
            proactiveRefreshTimer = null;
        }

        await Promise.all([
            SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
            SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
            SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
        ]);

        logger.auth.info('Tokens cleared');
    } catch (error) {
        logger.auth.error('Failed to clear tokens:', error);
    }
};

// ============================================
// LAYER 2: PROACTIVE REFRESH TIMER
// ============================================

/**
 * Schedule proactive token refresh
 * Triggers when token has 60 minutes remaining
 */
const scheduleProactiveRefresh = (expiryTime: number): void => {
    // Cancel existing timer
    if (proactiveRefreshTimer) {
        clearTimeout(proactiveRefreshTimer);
    }

    const timeUntilRefresh = expiryTime - Date.now() - PROACTIVE_REFRESH_THRESHOLD_MS;

    if (timeUntilRefresh <= 0) {
        // Token already in refresh zone - refresh now
        logger.auth.info('Token in refresh zone, refreshing now...');
        performTokenRefresh();
        return;
    }

    logger.auth.info(`Proactive refresh scheduled in ${Math.round(timeUntilRefresh / 60000)} minutes`);

    proactiveRefreshTimer = setTimeout(() => {
        logger.auth.info('Proactive refresh triggered');
        performTokenRefresh();
    }, timeUntilRefresh);
};

// ============================================
// LAYER 1: EAGER REFRESH ON APP LAUNCH
// ============================================

/**
 * Check token health on app launch/foreground
 * Refreshes if token has used > 50% of lifetime
 * 
 * Call this from App root or AppState listener
 */
export const checkTokenOnAppLaunch = async (): Promise<void> => {
    try {
        const [accessToken, expiryTime] = await Promise.all([
            getAccessToken(),
            getTokenExpiry(),
        ]);

        if (!accessToken || !expiryTime) {
            logger.auth.info('No token found - user not logged in');
            return;
        }

        const now = Date.now();
        const timeRemaining = expiryTime - now;
        const percentUsed = 1 - (timeRemaining / TOKEN_LIFETIME_MS);

        if (percentUsed >= EAGER_REFRESH_THRESHOLD_PERCENT) {
            logger.auth.info(`Token ${Math.round(percentUsed * 100)}% used - eager refresh triggered`);
            await performTokenRefresh();
        } else {
            logger.auth.info(`Token healthy - ${Math.round(timeRemaining / 60000)} min remaining`);
            // Ensure proactive refresh is scheduled
            scheduleProactiveRefresh(expiryTime);
        }
    } catch (error) {
        logger.auth.error('Error checking token on app launch:', error);
    }
};

// ============================================
// CORE REFRESH LOGIC
// ============================================

/**
 * Perform token refresh with race condition handling
 * Returns new access token on success, null on failure
 */
export const performTokenRefresh = async (): Promise<string | null> => {
    // If already refreshing, wait for the result
    if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
        });
    }

    isRefreshing = true;

    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        logger.auth.info('Refreshing token...');

        // Create fresh axios instance to avoid interceptor loops
        const response = await axios.post<RefreshTokenResponse>(
            `${EXPO_PUBLIC_API_URL}${API_ROUTES.AUTH.REFRESH_TOKEN}`,
            { refreshToken },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            }
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Token refresh failed');
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // Save new tokens
        await saveTokens(newAccessToken, newRefreshToken);

        logger.auth.info('Token refreshed successfully');

        // Resolve all queued requests with new token
        processQueue(null, newAccessToken);

        return newAccessToken;
    } catch (error) {
        logger.auth.error('Token refresh failed:', error);

        // Reject all queued requests
        processQueue(error as Error, null);

        // Clear tokens - user needs to login again
        await clearTokens();

        // Notify auth store to trigger logout flow
        if (onRefreshFailedCallback) {
            onRefreshFailedCallback();
        }

        return null;
    } finally {
        isRefreshing = false;
    }
};

/**
 * Process queued requests after refresh completes
 */
const processQueue = (error: Error | null, token: string | null): void => {
    failedQueue.forEach((request) => {
        if (error) {
            request.reject(error);
        } else if (token) {
            request.resolve(token);
        }
    });

    failedQueue = [];
};

// ============================================
// LAYER 3: 401 INTERCEPTOR HANDLER
// ============================================

/**
 * Handle 401 error in response interceptor
 * Attempts to refresh token and retry the original request
 * 
 * @param error - Original axios error
 * @param retryRequest - Function to retry the failed request with new config
 * @returns Promise that resolves to retry response or rejects
 */
export const handle401Error = async (
    error: AxiosError,
    retryRequest: (config: InternalAxiosRequestConfig) => Promise<unknown>
): Promise<unknown> => {
    const originalRequest = error.config;

    if (!originalRequest) {
        throw error;
    }

    // Try to refresh the token
    const newToken = await performTokenRefresh();

    if (newToken) {
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        logger.auth.info('Retrying request with new token...');

        // Retry the original request
        return retryRequest(originalRequest);
    }

    // Refresh failed - throw original error
    throw error;
};

/**
 * Check if token is about to expire (within threshold)
 */
export const isTokenExpiringSoon = async (): Promise<boolean> => {
    const expiryTime = await getTokenExpiry();

    if (!expiryTime) return false;

    const timeRemaining = expiryTime - Date.now();
    return timeRemaining < PROACTIVE_REFRESH_THRESHOLD_MS;
};
