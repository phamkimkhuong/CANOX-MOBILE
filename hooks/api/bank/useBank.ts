import { API_ROUTES } from '@/constants/apiRoutes';
import { request } from '@/services/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import {
    BankAccountListResponseSchema,
    BankAccountResponseSchema,
    BankInitVerificationResponseSchema,
    SupportedBankListResponseSchema
} from '@/types/bank/bankSchema';
import { BankSupportedUI, UserBankAccountUI } from '@/types/bank/ui';
import { transformSupportedBank, transformUserBankAccount } from '@/utils/adapter/bankAdapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

// ============================================
// QUERY KEYS
// ============================================

export const bankQueryKeys = {
    all: ['banks'] as const,
    supported: () => [...bankQueryKeys.all, 'supported'] as const,
    myAccounts: () => [...bankQueryKeys.all, 'my-accounts'] as const,
    default: () => [...bankQueryKeys.all, 'default'] as const,
    detail: (id: string) => [...bankQueryKeys.all, 'detail', id] as const,
};

// ============================================
// HOOKS - QUERIES
// ============================================

/**
 * Fetch all supported banks in the system
 */
export const useSupportedBanks = () => {
    return useQuery({
        queryKey: bankQueryKeys.supported(),
        queryFn: async (): Promise<BankSupportedUI[]> => {
            const response = await request(
                {
                    url: API_ROUTES.BANKS.LIST,
                    method: 'GET',
                },
                SupportedBankListResponseSchema
            );
            return response.data.map(transformSupportedBank);
        },
        staleTime: 1000 * 60 * 60, // 1 hour - rarely changes
    });
};

/**
 * Fetch current user's bank accounts
 */
export const useMyBankAccounts = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: bankQueryKeys.myAccounts(),
        queryFn: async (): Promise<UserBankAccountUI[]> => {
            const response = await request(
                {
                    url: API_ROUTES.BANKS.ME_ACCOUNTS,
                    method: 'GET',
                },
                BankAccountListResponseSchema
            );

            // Filter: Only BUYER accounts and NOT deleted
            return response.data
                .filter(item => item.accountType === 'BUYER' && !item.deleted)
                .map(transformUserBankAccount);
        },
        enabled: isAuthenticated,
    });
};

/**
 * Fetch user's default bank account
 */
export const useDefaultBankAccount = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: bankQueryKeys.default(),
        queryFn: async (): Promise<UserBankAccountUI | null> => {
            try {
                const response = await request(
                    {
                        url: API_ROUTES.BANKS.DEFAULT_ACCOUNT,
                        method: 'GET',
                    },
                    BankAccountResponseSchema
                );
                return transformUserBankAccount(response.data);
            } catch {
                // Return null if no default account found
                return null;
            }
        },
        enabled: isAuthenticated,
    });
};

// ============================================
// HOOKS - MUTATIONS
// ============================================

/**
 * Start bank verification (sends OTP)
 */
export const useInitBankVerification = () => {
    const { t } = useTranslation(['bank', 'common']);

    return useMutation({
        mutationFn: async (data: {
            bankName: string;
            bankAccountNumber: string;
            bankAccountHolder: string;
            branch?: string;
            accountType: 'BUYER' | 'SHOP';
            isDefault?: boolean;
        }) => {
            const response = await request(
                {
                    url: API_ROUTES.BANKS.INIT_VERIFICATION,
                    method: 'POST',
                    data,
                },
                BankInitVerificationResponseSchema
            );
            return response.data;
        },
        onError: (error) => {
            Toast.show({
                type: 'error',
                text1: t('bank:status.initVerifyFailed'),
                text2: error instanceof Error ? error.message : t('common:status.error'),
            });
        },
        meta: { handledLocally: true },
    });
};

/**
 * Verify OTP and create bank account
 */
export const useVerifyAndCreateBank = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation(['bank', 'common']);

    return useMutation({
        mutationFn: async (data: {
            verificationId: string;
            otpCode: string;
        }) => {
            const response = await request(
                {
                    url: API_ROUTES.BANKS.VERIFY_CREATE,
                    method: 'POST',
                    data,
                },
                BankAccountResponseSchema
            );
            return response.data;
        },
        onSuccess: () => {
            // Refresh bank lists
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.myAccounts() });
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.default() });
            Toast.show({
                type: 'success',
                text1: t('bank:status.addSuccess'),
            });
        },
        onError: (error) => {
            Toast.show({
                type: 'error',
                text1: t('bank:status.addFailed'),
                text2: error instanceof Error ? error.message : t('common:status.error'),
            });
        },
        meta: { handledLocally: true },
    });
};

/**
 * Set a bank account as default
 */
export const useSetDefaultBank = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation(['bank', 'common']);

    return useMutation({
        mutationFn: async (bankAccountId: string) => {
            await request(
                {
                    url: API_ROUTES.BANKS.SET_DEFAULT(bankAccountId),
                    method: 'PATCH',
                },
                BankAccountResponseSchema.partial() // Use partial as it might only return message
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.myAccounts() });
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.default() });
            Toast.show({
                type: 'success',
                text1: t('bank:status.setDefaultSuccess'),
            });
        },
        onError: (error) => {
            Toast.show({
                type: 'error',
                text1: t('bank:status.setDefaultFailed'),
                text2: error instanceof Error ? error.message : t('common:status.error'),
            });
        },
        meta: { handledLocally: true },
    });
};

/**
 * Update a bank account
 */
export const useUpdateBank = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation(['bank', 'common']);

    return useMutation({
        mutationFn: async ({ id, data }: {
            id: string;
            data: {
                bankName?: string;
                bankAccountNumber?: string;
                bankAccountHolder?: string;
                branch?: string;
                isDefault?: boolean;
            }
        }) => {
            const response = await request(
                {
                    url: API_ROUTES.BANKS.DETAIL(id),
                    method: 'PUT',
                    data,
                },
                BankAccountResponseSchema
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.myAccounts() });
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.default() });
            Toast.show({
                type: 'success',
                text1: t('bank:status.updateSuccess'),
            });
        },
        onError: (error) => {
            Toast.show({
                type: 'error',
                text1: t('bank:status.updateFailed'),
                text2: error instanceof Error ? error.message : t('common:status.error'),
            });
        },
        meta: { handledLocally: true },
    });
};

/**
 * Delete a bank account
 */
export const useDeleteBank = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation(['bank', 'common']);

    return useMutation({
        mutationFn: async (bankAccountId: string) => {
            await request(
                {
                    url: API_ROUTES.BANKS.DELETE(bankAccountId),
                    method: 'DELETE',
                },
                BankAccountListResponseSchema.partial() // Use partial as delete doesn't return data
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.myAccounts() });
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.default() });
            Toast.show({
                type: 'success',
                text1: t('bank:status.deleteSuccess'),
            });
        },
        onError: (error) => {
            Toast.show({
                type: 'error',
                text1: t('bank:status.deleteFailed'),
                text2: error instanceof Error ? error.message : t('common:status.error'),
            });
        },
        meta: { handledLocally: true },
    });
};
