/**
 * API Client - Centralized HTTP client with authentication
 * 
 * Features:
 * - Axios instance with base configuration
 * - Request interceptor: Auto-attach auth token
 * - Response interceptor: Error handling with token refresh
 * - Zod validation wrapper for type-safe responses
 * - Integration with TokenManager for 3-layer refresh strategy
 */

import { getErrorMessageByCode } from '@/constants/errorCodes';
import i18n from '@/constants/i18n';
import { useAppStore } from '@/store/useAppStore';
import { logger } from '@/utils/logger';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import {
    getAccessToken,
    getTokenExpiry,
    handle401Error,
    isTokenRefreshing,
    performTokenRefresh,
    waitForTokenRefresh
} from '../auth/tokenManager';
import { queryClient } from './queryClient';

// ============================================
// CONFIGURATION
// ============================================

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const TIMEOUT = 30000; // 30s for mobile (slow network)

/** Time before expiry to trigger proactive refresh in Request Interceptor (60 minutes) */
const PROACTIVE_REFRESH_THRESHOLD_MS = 60 * 60 * 1000;

/** Endpoints that don't require authentication */
const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/refresh',
    '/auth/otp/verify',
    '/auth/otp/resend',
    '/auth/password/forgot',
    '/auth/password/verify',
    '/auth/password/reset',
    '/users/exists/email',
    '/users/exists/username',
    '/users/buyer',
    '/public/**',
    '/categories/tree',
    '/reviews/PRODUCT/**',
];

/**
 * Check if URL is a public endpoint (no auth required)
 */
const isPublicEndpoint = (url?: string): boolean => {
    if (!url) return false;
    return PUBLIC_ENDPOINTS.some((endpoint) => {
        if (endpoint.endsWith('/**')) {
            const prefix = endpoint.slice(0, -2);
            return url.includes(prefix);
        }
        return url === endpoint || url.includes(endpoint);
    });
};

// ============================================
// CUSTOM ERROR CLASSES
// ============================================

/**
 * Generic API Error for consistent error handling across the app
 */
export class ApiError extends Error {
    constructor(
        public message: string,
        public status?: number,
        public code?: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Special error for session expiry
 * 
 * Purpose:
 * - Prevents React Query from retrying (pointless when session expired)
 * - Prevents Toast spam (UI should stay silent, logout is happening)
 * - Separates Auth logic from UI logic
 * 
 * Usage in QueryClient:
 * - retry: (count, error) => !(error instanceof SessionExpiredError)
 * - onError: (error) => { if (error instanceof SessionExpiredError) return; }
 */
export class SessionExpiredError extends Error {
    constructor(message: string = 'Phiên đăng nhập đã hết hạn') {
        super(message);
        this.name = 'SessionExpiredError';
    }
}

/**
 * Type guard to check if error is SessionExpiredError
 * Use this in components to conditionally handle session expiry
 */
export const isSessionExpiredError = (error: unknown): error is SessionExpiredError => {
    return error instanceof SessionExpiredError;
};

// ============================================
// AXIOS INSTANCE
// ============================================

/**
 * Singleton Axios instance for all API calls
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// ============================================
// REQUEST INTERCEPTOR (Proactive Token Refresh)
// ============================================

apiClient.interceptors.request.use(
    async (config) => {
        // Build full URL for logging
        const buildFullUrl = () => {
            let fullUrl = `${config.baseURL}${config.url}`;
            if (config.params && Object.keys(config.params).length > 0) {
                const queryString = new URLSearchParams(config.params).toString();
                fullUrl += `?${queryString}`;
            }
            return fullUrl;
        };

        // Public endpoints - no auth required
        if (isPublicEndpoint(config.url)) {
            if (config.headers) {
                delete config.headers.Authorization;
            }
            logger.api.info(`📤 [PUBLIC] ${config.method?.toUpperCase()} ${buildFullUrl()}`);
            return config;
        }

        logger.api.info(`🔐 [AUTH] ${config.method?.toUpperCase()} ${buildFullUrl()}`);

        try {
            // If token refresh is in progress, wait for it
            if (isTokenRefreshing()) {
                logger.auth.info('Request waiting for token refresh...');
                const newToken = await waitForTokenRefresh();
                if (config.headers) {
                    config.headers.Authorization = `Bearer ${newToken}`;
                }
                return config;
            }

            // Check if token is expiring soon (within threshold)
            const tokenExpiry = await getTokenExpiry();
            const isExpiringSoon = tokenExpiry !== null &&
                (tokenExpiry - Date.now() < PROACTIVE_REFRESH_THRESHOLD_MS);

            if (isExpiringSoon) {
                logger.auth.info('Token expiring soon - proactive refresh before request');
                const newToken = await performTokenRefresh();
                if (newToken && config.headers) {
                    config.headers.Authorization = `Bearer ${newToken}`;
                }
                return config;
            }

            // Token is healthy - attach it normally
            const token = await getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            logger.api.error('Error in Request Interceptor:', error);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR (Layer 2: Error Handling & Token Refresh)
// ============================================

/** Maximum retry attempts for 401 errors per request */
const MAX_401_RETRY_COUNT = 1;

/** Custom config property to track retry count */
interface RetryConfig {
    _retryCount?: number;
}

apiClient.interceptors.response.use(
    // Success - pass through
    (response) => response,

    // Error handling
    async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfig & RetryConfig;
        const data = error.response?.data as Record<string, unknown> | undefined;
        const statusCode = error.response?.status;
        const errorCode = data?.code as number | undefined;

        // Build error message for UI
        const currentLang = (i18n.language?.split('-')[0] || 'vi') as 'vi' | 'en';
        const mappedMessage = errorCode ? getErrorMessageByCode(errorCode, currentLang) : undefined;
        const genericFallback = getErrorMessageByCode(6005, currentLang) || 'Đã xảy ra lỗi. Vui lòng thử lại sau!';

        const finalMessage = mappedMessage || genericFallback;

        // For PUBLIC endpoints, don't attempt token refresh - just pass the error through
        if (isPublicEndpoint(error.config?.url)) {
            // Global check for 502 (Server Down)
            if (statusCode === 502) {
                logger.api.error('CRITICAL: Gateway 502 detected on Public endpoint. Triggering Maintenance Mode.');
                useAppStore.getState().setSystemDown(true);
                queryClient.cancelQueries();
                throw new ApiError(i18n.t('common:maintenance.title'), 502, 502);
            }

            logger.api.warn(`Public endpoint returned ${statusCode}:`, error.config?.url);
            const customError = new ApiError(finalMessage, statusCode, errorCode);
            return Promise.reject(customError);
        }

        // Global check for 502 (Server Down) for AUTH endpoints
        if (statusCode === 502) {
            logger.api.error('CRITICAL: Gateway 502 detected on Auth endpoint. Triggering Maintenance Mode.');
            useAppStore.getState().setSystemDown(true);
            queryClient.cancelQueries();
            throw new ApiError(i18n.t('common:maintenance.title'), 502, 502);
        }

        // Handle 401 Unauthorized - Token expired or invalid access (AUTH endpoints only)
        if (statusCode === 401) {
            // Initialize retry count
            config._retryCount = config._retryCount ?? 0;

            // Check if max retries exceeded
            if (config._retryCount >= MAX_401_RETRY_COUNT) {
                logger.auth.error(`Max 401 retry (${MAX_401_RETRY_COUNT}) exceeded for: ${config.url}`);
                throw new SessionExpiredError('Phiên đăng nhập không hợp lệ');
            }

            // Increment retry count
            config._retryCount += 1;

            logger.api.error('Received 401 Error from Backend:', {
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                data: data,
                timestamp: new Date().toISOString(),
                retryCount: config._retryCount,
            });

            logger.auth.warn(`Attempting token refresh due to 401 (attempt ${config._retryCount}/${MAX_401_RETRY_COUNT})...`);

            try {
                // Use TokenManager to handle 401 with refresh logic
                return await handle401Error(error, async (retryConfig) => {
                    // Preserve retry count in the retried request
                    (retryConfig as RetryConfig)._retryCount = config._retryCount;
                    return apiClient.request(retryConfig);
                });
            } catch (refreshError) {
                logger.auth.error('Token refresh failed - throwing SessionExpiredError');
                throw new SessionExpiredError();
            }
        }

        // Log error details for non-401 errors
        logger.api.error('API Error:', {
            message: error.message,
            code: error.code,
            status: statusCode,
            data: data,
        });

        // Throw custom error for consistent handling
        const customError = new ApiError(finalMessage, statusCode, errorCode);
        return Promise.reject(customError);
    }
);

// ============================================
// ZOD VALIDATION WRAPPER
// ============================================

/**
 * Make API request with Zod schema validation
 * Ensures response data matches expected structure
 * 
 * @param config - Axios request configuration
 * @param schema - Zod schema for response validation
 * @returns Validated response data
 * @throws ApiError if validation fails
 */
export async function request<T>(
    config: AxiosRequestConfig,
    schema: z.ZodType<T>
): Promise<T> {
    const response: AxiosResponse = await apiClient(config);
    const parseResult = schema.safeParse(response.data);

    if (!parseResult.success) {
        // Schema mismatch - log for debugging
        logger.api.error('API Validation Error:', {
            url: config.url,
            errors: parseResult.error.format(),
            data: response.data,
        });
        const currentLang = (i18n.language?.split('-')[0] || 'vi') as 'vi' | 'en';
        const validationErrorMessage = getErrorMessageByCode(6006, currentLang) || 'Invalid response structure from server!';
        throw new ApiError(validationErrorMessage, 500, 6006);
    }

    return parseResult.data;
}