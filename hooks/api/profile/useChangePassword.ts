import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    ChangePasswordPayload,
    ChangePasswordResponse,
    ChangePasswordResponseSchema
} from '@/types/auth';
import { useMutation } from '@tanstack/react-query';

/**
 * ==============================================
 * useChangePassword Hook
 * ==============================================
 * Handles password change mutation with proper error handling.
 * @example
 * const { mutate, isPending, error } = useChangePassword();
 * mutate({ oldPassword: '...', newPassword: '...', confirmPassword: '...' });
 */
export const useChangePassword = () => {
    const userId = useAuthStore((state) => state.userId);

    return useMutation({
        mutationKey: ['change-password'],
        mutationFn: async (payload: Omit<ChangePasswordPayload, 'confirmPassword'>) => {
            if (!userId) {
                throw new Error('Vui lòng đăng nhập lại');
            }

            const response = await request<ChangePasswordResponse>(
                {
                    url: API_ROUTES.USERS.CHANGE_PASSWORD(userId),
                    method: 'PATCH',
                    data: {
                        oldPassword: payload.oldPassword,
                        newPassword: payload.newPassword,
                        confirmPassword: payload.newPassword,
                    },
                },
                ChangePasswordResponseSchema
            );

            return response;
        },
    });
};

/**
 * Error code mapping for change password API
 * Used to display appropriate error message for each error type
 */
export const CHANGE_PASSWORD_ERROR_CODES = {
    /** Old password is wrong */
    WRONG_OLD_PASSWORD: 220,
    /** New password is too weak */
    WEAK_PASSWORD: 422,
    /** User not found */
    USER_NOT_FOUND: 404,
} as const;

/**
 * Helper function to check type of error from API response
 */
export const isWrongOldPasswordError = (error: unknown): boolean => {
    const apiError = error as { code?: number };
    return apiError.code === CHANGE_PASSWORD_ERROR_CODES.WRONG_OLD_PASSWORD;
};
