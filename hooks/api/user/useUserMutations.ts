import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { ResponseDefaultSchema } from '@/types/responseSchema';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

/**
 * Hook to delete user account
 * DELETE /api/v1/users/{userId}
 */
export const useDeleteAccount = () => {
    const logout = useAuthStore((state) => state.logout);
    const userId = useAuthStore((state) => state.userId);

    return useMutation({
        mutationFn: async () => {
            if (!userId) {
                throw new Error('User ID is required for account deletion');
            }
            return request(
                {
                    url: API_ROUTES.USERS.DELETE(userId),
                    method: 'DELETE',
                },
                ResponseDefaultSchema
            );
        },
        onMutate: () => {
            showGlobalLoading();
        },
        onSuccess: async () => {
            hideGlobalLoading();
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Tài khoản của bạn đã được xóa.',
            });
            // Perform logout and cleanup
            await logout();
        },
        onError: (error: any) => {
            hideGlobalLoading();
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error.message || 'Không thể xóa tài khoản. Vui lòng thử lại sau.',
            });
        },
    });
};
