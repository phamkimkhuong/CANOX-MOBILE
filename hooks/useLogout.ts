import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { clearAllCache } from '@/utils/cache';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface UseLogoutReturn {
    /** Whether logout is in progress */
    isLoggingOut: boolean;
    /** Error message if logout failed */
    error: string | null;
    /** Execute logout with confirmation */
    logout: () => void;
    /** Execute logout without confirmation */
    logoutImmediate: () => Promise<void>;
}

/**
 * Hook for handling user logout
 * Clears tokens, query cache, persistent cache, and navigates to login
 */
export function useLogout(): UseLogoutReturn {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const authLogout = useAuthStore((state) => state.logout);

    // Reset app settings to default on logout (especially sensitive ones)
    const setBiometrics = useAppStore((state) => state.setBiometrics);

    /**
     * Execute logout immediately without confirmation
     */
    const logoutImmediate = useCallback(async () => {
        try {
            setIsLoggingOut(true);
            setError(null);
            // Clear all TanStack Query cache (RAM)
            queryClient.clear();
            // Clear Device Disk Cache (Images, Temp files)
            await clearAllCache();
            // Reset sensitive app states
            setBiometrics(false);
            // Clear auth store (also clears SecureStore and navigates)
            await authLogout();

        } catch (err) {
            setError('Không thể đăng xuất. Vui lòng thử lại.');
            throw err;
        } finally {
            setIsLoggingOut(false);
        }
    }, [queryClient, authLogout, setBiometrics]);

    /**
     * Logout with confirmation dialog
     */
    const logout = useCallback(() => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
            [
                {
                    text: 'Hủy',
                    style: 'cancel',
                },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: () => {
                        logoutImmediate().catch(() => {
                            // Error already set in logoutImmediate
                        });
                    },
                },
            ],
            { cancelable: true }
        );
    }, [logoutImmediate]);

    return {
        isLoggingOut,
        error,
        logout,
        logoutImmediate,
    };
}
