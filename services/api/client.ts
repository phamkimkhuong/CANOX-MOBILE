import { getErrorMessageByCode } from '@/constants/errorCodes';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';

const BASE_URL =
    // 'http://10.0.2.2:8888';
    // 'http://192.168.1.15:8888';
    // process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL_LOCAL ||
    'https://api.calatha.com';
const PUBLIC_ENDPOINTS = [
    '/auth/login',
    '/auth/refresh',
    '/auth/otp/verify',
    '/auth/otp/resend',
    '/password/forgot',
    '/password/reset',
    '/users/exists/email',
    '/users/exists/username',
    '/users/buyer',
    '/public/**',
    '/categories/tree',
];
const isPublicEndpoint = (url?: string): boolean => {
    if (!url) return false;
    return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};
// console.log('API Base URL:', BASE_URL);
const TIMEOUT = 30000; // 30s cho mobile (mạng yếu)
const AUTH_TOKEN_KEY = 'user_access_token'; // Key lưu trong SecureStore

// Định nghĩa lỗi chuẩn của App để dễ handle ở UI
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

// 2. Khởi tạo Axios Instance
// Singleton pattern: Chỉ tạo 1 instance duy nhất cho toàn App
export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// 3. Request Interceptor (Lớp bảo vệ 1: Authentication)
apiClient.interceptors.request.use(
    async (config) => {
        if (isPublicEndpoint(config.url)) {
            if (config.headers) {
                delete config.headers.Authorization;
            }
            console.log("" + config.baseURL + config.url);
            return config;
        }
        console.log("no public " + config.baseURL + config.url);
        try {
            // Lấy token từ SecureStore
            const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error retrieving token from SecureStore:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 4. Response Interceptor (Lớp bảo vệ 2: Error Handling)
// Xử lý chung các lỗi mạng, lỗi 401, 500 trước khi về đến Component
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // Xử lý lỗi 401 (Unauthorized) - Token hết hạn

        const data = error.response?.data as any;
        const statusCode = error.response?.status;
        const errorCode = data?.code;
        const finalMessage = errorCode
            ? getErrorMessageByCode(errorCode, 'vi')
            : (data?.message || error.message);

        if (statusCode === 401 && !isPublicEndpoint(error.config?.url)) {
            // TODO: Implement logic Refresh Token hoặc Logout tại đây.
            // Vì đây là file utility, ta có thể emit event hoặc gọi store global để logout.
            console.warn('Session expired. User needs to re-login.');
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        }
        console.log('🚨 Raw Axios Error:', {
            message: error.message,
            code: error.code,
            stack: error.stack?.substring(0, 200),
        });
        const customError = new ApiError(
            finalMessage,
            statusCode,
            errorCode
        );
        return Promise.reject(customError);
    }
);

/**
 * 5. Wrapper function với Zod Validation (Lớp bảo vệ 3: Data Safety)
 * Đây là hàm Senior Feature: Gọi API và ép kiểu dữ liệu trả về phải khớp với Schema.
 * * @param config - Axios config (url, method, data...)
 * @param schema - Zod Schema để validate response
 * @returns Promise<T> - Dữ liệu đã được validate và clean
 */
export async function request<T>(
    config: AxiosRequestConfig,
    schema: z.ZodType<T>
): Promise<T> {
    try {
        const response: AxiosResponse = await apiClient(config);

        // Validate dữ liệu trả về từ Server
        const parseResult = schema.safeParse(response.data);

        if (!parseResult.success) {
            // Nếu Backend trả sai cấu trúc so với quy định -> Báo lỗi ngay lập tức
            // Giúp Dev phát hiện lỗi Backend sớm, tránh crash App ngầm
            console.error('❌ API Validation Error:', {
                url: config.url,
                errors: parseResult.error.format(),
                data: response.data,
            });
            throw new ApiError('Invalid response structure from server', 500, 501);
        }
        return parseResult.data;
    } catch (error) {
        // Ném lỗi tiếp cho TanStack Query xử lý
        throw error;
    }
}