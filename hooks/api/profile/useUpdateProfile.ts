import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    UpdateProfilePayload,
    UpdateProfilePayloadSchema,
    UpdateProfileResponse,
    UpdateProfileResponseSchema,
} from '@/types/user';
import { devLog } from '@/utils/logger';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { profileQueryKeys } from './useProfile';

/**
 * Hook to update buyer profile
 * - Validates payload with zod before sending
 * - Invalidates profile cache on success
 * - Returns mutation state for form handling
 */
export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const buyerId = useAuthStore((state) => state.buyerId);

    return useMutation<UpdateProfileResponse, Error, UpdateProfilePayload>({
        mutationFn: async (payload: UpdateProfilePayload) => {
            if (!buyerId) {
                throw new Error('Không tìm thấy thông tin người dùng');
            }

            // Validate payload before sending
            const validatedPayload = UpdateProfilePayloadSchema.parse(payload);
            devLog('[useUpdateProfile] Payload:', validatedPayload);

            const response = await request(
                {
                    url: API_ROUTES.BUYERS_INFORMATION.UPDATE(buyerId),
                    method: 'PUT',
                    data: validatedPayload,
                },
                UpdateProfileResponseSchema
            );

            return response;
        },
        onSuccess: () => {
            // Invalidate user profile cache to refetch latest data
            queryClient.invalidateQueries({ queryKey: profileQueryKeys.user() });
            devLog('[useUpdateProfile] Profile updated successfully');
        },
        onError: (error) => {
            devLog('[useUpdateProfile] Error:', error);
            Toast.show({
                type: 'error',
                text1: 'Cập nhật thất bại',
                text2: error.message || 'Vui lòng kiểm tra lại thông tin và thử lại.',
            });
        },
        meta: { handledLocally: true },
    });
};

/**
 * Helper: Convert Date object to API format (YYYY-MM-DD)
 */
export const dateToApiFormat = (date: Date | null): string | null => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

/**
 * Helper: Convert API format (YYYY-MM-DD) to Date object
 */
export const apiFormatToDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Helper: Format Date to display format (DD/MM/YYYY)
 */
export const dateToDisplayFormat = (date: Date | null): string => {
    if (!date) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};
