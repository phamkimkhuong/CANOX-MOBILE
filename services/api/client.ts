import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { z } from 'zod';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL_LOCAL || 'http://localhost:8888/api/v1';
const TIMEOUT = 30000; // 30s cho mobile (mạng yếu)
const AUTH_TOKEN_KEY = 'user_access_token'; // Key lưu trong SecureStore

// Định nghĩa lỗi chuẩn của App để dễ handle ở UI
export class ApiError extends Error {
    constructor(public message: string, public status?: number, public code?: string) {
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
// Tự động gắn Token vào mỗi request gửi đi
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Lấy token từ nơi an toàn nhất (theo rule Persistence)
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
        if (error.response?.status === 401) {
            // TODO: Implement logic Refresh Token hoặc Logout tại đây.
            // Vì đây là file utility, ta có thể emit event hoặc gọi store global để logout.
            console.warn('Session expired. User needs to re-login.');
            await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        }

        // Chuẩn hóa lỗi để ném ra ngoài
        const customError = new ApiError(
            (error.response?.data as any)?.message || error.message || 'Unknown Error',
            error.response?.status,
            error.code
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
            throw new ApiError('Invalid response structure from server', 500, 'VALIDATION_ERROR');
        }

        return parseResult.data;
    } catch (error) {
        // Ném lỗi tiếp cho TanStack Query xử lý
        throw error;
    }
}