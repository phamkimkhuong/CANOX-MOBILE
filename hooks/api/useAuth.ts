import { API_ROUTES } from '@/constants/apiRoutes';
import { ApiError, request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthResponseSchema, LoginPayload, RegisterPayload, RegisterResponseSchema, VerifyOtpPayload } from '@/types/auth';
import { ResponseDefaultSchema } from '@/types/responseSchema';
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
        onSuccess: async (response) => {
            const { accessToken, refreshToken, emailVerified, email } = response.data;
            // Kiểm tra email verified
            if (emailVerified === false) {
                Toast.show({
                    type: 'warning',
                    text1: 'Tài khoản chưa kích hoạt',
                    text2: 'Vui lòng xác thực email của bạn.',
                });
                router.push({
                    pathname: '/(auth)/verify-otp',
                    params: { email: email || '' },
                });
                return;
            }
            // Email đã verify -> Lưu token và đăng nhập
            await loginStore(accessToken);
            // TODO: Lưu refreshToken
            // await SecureStore.setItemAsync('refresh_token', refreshToken);
            Toast.show({
                type: 'success',
                text1: 'Đăng nhập thành công',
            });
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
                RegisterResponseSchema
            );
        },
        onError: (error: ApiError) => {
            if (error.code !== 208 && error.code !== 209) {
                Toast.hide();
                Toast.show({
                    type: 'error',
                    text1: 'Đăng ký thất bại',
                    text2: error.message,
                    visibilityTime: 2000,
                });
            }
        },
    });
};

// Logout hook
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

// Verify OTP hook
export const useVerifyOtp = () => {
    return useMutation({
        mutationFn: async (data: VerifyOtpPayload) => {
            return request(
                {
                    url: API_ROUTES.AUTH.VERIFY_OTP,
                    method: 'POST',
                    data,
                },
                ResponseDefaultSchema
            );
        },
    });
};

// Hook gửi lại mã
export const useResendOtp = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            return request({
                url: API_ROUTES.AUTH.RESEND_OTP,
                method: 'POST',
                data: { email, otpType: 'ACCOUNT_ACTIVATION' },
            }, ResponseDefaultSchema);
        },
    });
};