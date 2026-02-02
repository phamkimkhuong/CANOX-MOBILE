import { API_ROUTES } from '@/constants/apiRoutes';
import { authRoutes, ROUTES } from '@/constants/routes';
import { ApiError, isSessionExpiredError, request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { AuthResponseSchema, LoginPayload, RegisterPayload, RegisterResponseSchema, ResetPasswordPayload, VerifyOtpPayload } from '@/types/auth';
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
            const { accessToken, refreshToken, emailVerified, email, user } = response.data;
            const buyerId = user.buyerId ?? null;
            const userId = user.userId ?? null;

            // Kiểm tra email verified
            if (emailVerified === false) {
                hideGlobalLoading();
                Toast.show({
                    type: 'warning',
                    text1: 'Tài khoản chưa kích hoạt',
                    text2: 'Vui lòng xác thực email của bạn.',
                });
                router.push(authRoutes.verifyOtp({ email: email || '', type: 'register' }));
                return;
            }
            // Email đã verify -> Lưu token, userId và buyerId vào store
            await loginStore(accessToken, refreshToken, userId, buyerId);

            hideGlobalLoading();
            Toast.show({
                type: 'success',
                text1: 'Đăng nhập thành công',
            });
            router.replace(ROUTES.TABS.HOME);
        },
        onError: (error: ApiError) => {
            hideGlobalLoading();
            Toast.show({
                type: 'error',
                text1: 'Đăng nhập thất bại',
                text2: error.message || 'Vui lòng kiểm tra lại thông tin.',
            });
        },
        meta: { handledLocally: true },
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
        meta: { handledLocally: true },
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
        onMutate: () => {
            showGlobalLoading();
        },
        onSuccess: async () => {
            // logoutStore already handles GlobalLoadingOverlay and navigation
            await logoutStore();
            hideGlobalLoading();
        },
        onError: (error: ApiError) => {
            hideGlobalLoading();
            const message = error.message;
            if (isSessionExpiredError(error)) return;
            Toast.show({
                type: 'error',
                text1: 'Đăng xuất thất bại',
                text2: message,
            });
        },
        meta: { handledLocally: true },
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

// ===============================
// FORGOT PASSWORD HOOKS
// ===============================

/**
 * Check if email exists in the system
 * GET /api/v1/users/exists/email?email=xxx
 */
export const useCheckEmailExists = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            return request({
                url: API_ROUTES.USERS.CHECK_EMAIL_EXISTS(email),
                method: 'GET',
            }, ResponseDefaultSchema);
        },
    });
};

/**
 * Send forgot password OTP to email
 * POST /api/v1/auth/password/forgot
 */
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            return request({
                url: API_ROUTES.AUTH.FORGOT_PASSWORD,
                method: 'POST',
                data: { email },
            }, ResponseDefaultSchema);
        },
    });
};

/**
 * Verify OTP for forgot password flow
 * This returns a token/confirmation that allows password reset
 */
export const useVerifyForgotPasswordOtp = () => {
    return useMutation({
        mutationFn: async (data: { email: string; otpCode: string }) => {
            return request({
                url: API_ROUTES.AUTH.VERIFY_FORGOT_PASSWORD_OTP,
                method: 'POST',
                data,
            }, ResponseDefaultSchema);
        },
    });
};

/**
 * Resend OTP for forgot password flow
 */
export const useResendForgotPasswordOtp = () => {
    return useMutation({
        mutationFn: async (email: string) => {
            return request({
                url: API_ROUTES.AUTH.RESEND_OTP,
                method: 'POST',
                data: {
                    email,
                    otpType: 'PASSWORD_RESET'
                },
            }, ResponseDefaultSchema);
        },
    });
};

/**
 * Reset password with verified OTP
 * POST /api/v1/auth/password/reset
 */
export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (data: ResetPasswordPayload) => {
            return request({
                url: API_ROUTES.AUTH.RESET_PASSWORD,
                method: 'POST',
                data,
            }, ResponseDefaultSchema);
        },
    });
};
