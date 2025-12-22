import { API_ROUTES } from '@/constants/apiRoutes';
import { ApiError, request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthResponseSchema, LoginPayload, RegisterPayload } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

export const useLogin = () => {
    const loginStore = useAuthStore((state) => state.login);

    return useMutation({
        mutationFn: async (data: LoginPayload) => {
            return request(
                {
                    url: API_ROUTES.AUTH.LOGIN,
                    method: 'POST',
                    data,
                },
                AuthResponseSchema
            );
        },
        onSuccess: async (data) => {
            // 1. Lưu token vào SecureStore & Zustand
            await loginStore(data.accessToken);
            // 2. Lưu thêm Refresh Token (nếu có)
            // await SecureStore.setItemAsync('refresh_token', data.refreshToken);
            router.replace('/(tabs)');
        },
        onError: (error: ApiError) => {
            Toast.show({
                type: 'error',
                text1: 'Đăng nhập thất bại',
                text2: error.message || 'Vui lòng kiểm tra lại thông tin.',
            });
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: async (data: RegisterPayload) => {
            return request(
                {
                    url: API_ROUTES.USERS.CREATE_ACCOUNT,
                    method: 'POST',
                    data,
                },
                AuthResponseSchema

            );
        },
        onSuccess: (data) => {
            console.log('Registration Successful:', data);
        },
        onError: (error: ApiError) => {
            if (error.status !== 208 && error.status !== 209) {
                Toast.hide();
                Toast.show({
                    type: 'error',
                    text1: 'Đăng ký thất bại',
                    text2: error.message,
                    visibilityTime: 2000,
                });
            }
            console.error('Registration Error:', error);
        },
    });
};

export const useLogout = () => {
    const logoutStore = useAuthStore((state) => state.logout);

    return useMutation({
        mutationFn: async () => {
            return request({
                url: API_ROUTES.AUTH.LOGOUT,
                method: 'POST',
            },
                AuthResponseSchema
            );
        },
        onSuccess: async () => {
            // 1. Xoá token khỏi SecureStore & Zustand
            await logoutStore();
            router.replace('/(auth)/login');
        },
        onError: (error: ApiError) => {
            Toast.show({
                type: 'error',
                text1: 'Đăng xuất thất bại',
                text2: error.message,
            });
        },
    });
};


