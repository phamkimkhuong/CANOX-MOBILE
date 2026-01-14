import { API_ROUTES } from '@/constants/apiRoutes';
import { ROUTES } from '@/constants/routes';
import { ApiError, request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { GoogleLoginPayload, SocialLoginResponseSchema } from '@/types/auth';
import { createLogger } from '@/utils/logger';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import Toast from 'react-native-toast-message';

const log = createLogger('GoogleAuth');

// Lấy Client IDs từ biến môi trường
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/**
 * Cấu hình Google Sign-In SDK
  */
const configureGoogleSignIn = () => {
    GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        offlineAccess: true,
    });
    log.info('Google Sign-In configured successfully');
};

/**
 * useGoogleLogin - Hook xử lý login with Google
 * Bao gồm: Gọi SDK native và sau đó gửi idToken lên server
 */
export const useGoogleLogin = () => {
    const loginStore = useAuthStore((state) => state.login);
    const isConfigured = useRef(false);
    useEffect(() => {
        if (!isConfigured.current) {
            configureGoogleSignIn();
            isConfigured.current = true;
        }
    }, []);

    const loginMutation = useMutation({
        mutationFn: async (payload: GoogleLoginPayload) => {
            console.log("payload", payload);
            return request(
                {
                    url: API_ROUTES.AUTH.GOOGLE,
                    method: 'POST',
                    data: payload,
                },
                SocialLoginResponseSchema
            );
        },
        onSuccess: async (response) => {
            log.debug('Full response data:', JSON.stringify(response.data, null, 2));

            const { accessToken, refreshToken, user } = response.data;
            const buyerId = user.buyerId ?? null;
            const userId = user.userId ?? null;

            if (!accessToken || !refreshToken) {
                log.error('Missing tokens in social login response. Backend needs to return accessToken and refreshToken.');
                hideGlobalLoading();
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi đăng nhập',
                    text2: 'Backend chưa trả về token. Vui lòng liên hệ hỗ trợ.',
                });
                return;
            }

            // Lưu token và thông tin user
            await loginStore(accessToken, refreshToken, userId, buyerId);

            hideGlobalLoading();
            Toast.show({
                type: 'success',
                text1: 'Đăng nhập Google thành công',
            });
            router.replace(ROUTES.TABS.HOME);
        },
        onError: (error: ApiError) => {
            log.error('Backend authentication failed', error);
            hideGlobalLoading();
            Toast.show({
                type: 'error',
                text1: 'Lỗi đăng nhập hệ thống',
                text2: error.message || 'Không thể xác thực với máy chủ.',
            });
        },
    });

    const handleGoogleSignIn = useCallback(async () => {
        try {
            log.info('Initiating Google Sign-In SDK...');
            await GoogleSignin.hasPlayServices();

            // Xóa phiên đăng nhập cũ để luôn hiện bảng chọn tài khoản
            try {
                await GoogleSignin.signOut();
            } catch (e) {
                // Ignore if not signed in
            }

            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.serverAuthCode) {
                log.info('Google SDK Sign-In successful, sending auth code to backend');
                showGlobalLoading();
                loginMutation.mutate({
                    code: userInfo.data.serverAuthCode,
                    loginType: 'GOOGLE',
                    role: 'BUYER'
                });
            } else {
                log.error('No serverAuthCode found. Ensure offlineAccess: true in configuration.');
                throw new Error('No serverAuthCode found');
            }
        } catch (error: any) {
            hideGlobalLoading();
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                log.info('User cancelled Google Sign-in');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                log.warn('Google Sign-in already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Toast.show({
                    type: 'error',
                    text1: 'Google Play Services không khả dụng',
                });
            } else {
                log.error('Unknown Google Sign-In error', error);
            }
        }
    }, [loginMutation]);

    return {
        signIn: handleGoogleSignIn,
        isLoading: loginMutation.isPending,
    };
};
