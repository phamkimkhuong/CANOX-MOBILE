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
            } catch (error) {
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
    });
};

/**
 * Verify OTP and create bank account
 */
export const useVerifyAndCreateBank = () => {
    const queryClient = useQueryClient();

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
        },
    });
};

/**
 * Set a bank account as default
 */
export const useSetDefaultBank = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bankAccountId: string) => {
            await request(
                {
                    url: API_ROUTES.BANKS.SET_DEFAULT(bankAccountId),
                    method: 'PATCH',
                },
                BankAccountResponseSchema
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.myAccounts() });
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.default() });
        },
    });
};

/**
 * Delete a bank account
 */
export const useDeleteBank = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bankAccountId: string) => {
            await request(
                {
                    url: API_ROUTES.BANKS.DELETE(bankAccountId),
                    method: 'DELETE',
                },
                BankAccountResponseSchema
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.myAccounts() });
            queryClient.invalidateQueries({ queryKey: bankQueryKeys.default() });
        },
    });
};
