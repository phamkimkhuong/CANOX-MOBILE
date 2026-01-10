import { useAuthStore } from '@/store/useAuthStore';
import { Alert as CustomAlert } from '@/utils/AlertHelper';
import { useCallback, useState } from 'react';

interface UseLogoutReturn {
    error: string | null;
    logout: () => void;
    /** Execute logout without confirmation */
    logoutImmediate: () => Promise<void>;
}

/**
 * Hook for handling user logout
 * Clears tokens, query cache, persistent cache, and navigates to login
 */
export function useLogout(): UseLogoutReturn {
    const [error, setError] = useState<string | null>(null);
    const authLogout = useAuthStore((state) => state.logout);

    /**
     * Execute logout immediately without confirmation
     */
    const logoutImmediate = useCallback(async () => {
        try {
            setError(null);
            await authLogout();
        } catch (err) {
            setError('Không thể đăng xuất. Vui lòng thử lại.');
            throw err;
        }
    }, [authLogout]);

    /**
     * Logout with confirmation dialog
     */
    const logout = useCallback(() => {
        CustomAlert.show({
            title: 'Đăng xuất',
            message: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?',
            type: 'warning',
            confirmText: 'Đăng xuất',
            cancelText: 'Huỷ',
            showCancel: true,
            onConfirm: () => {
                logoutImmediate().catch(() => {
                    // Error already set in logoutImmediate
                });
            },
        });
    }, [logoutImmediate]);

    return {
        error,
        logout,
        logoutImmediate,
    };
}
