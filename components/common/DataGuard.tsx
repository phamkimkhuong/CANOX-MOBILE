/**
 * ==============================================
 * DATA GUARD - SMART CONTAINER COMPONENT
 * ==============================================
 * 
 * Purpose: Tự động hóa việc xử lý loading, error, empty states
 * cho React Query hooks.
 * 
 * Design Philosophy:
 * - Smart component: Logic quyết định UI
 * - Hybrid UX: Soft error (có data cũ) vs Hard error (không có data)
 * - Type-safe: Render props với TypeScript generics
 * 
 * Features:
 * - Auto-detect error type (network, 404, 500)
 * - Smart refresh: Giữ data cũ nếu refresh fail
 * - Customizable skeleton, empty state
 * - Error Boundary integration (optional)
 */

import { UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query';
import React, { ReactNode, useEffect, useRef } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { StateType, StateView } from './StateView';

// ============================================
// TYPES
// ============================================

type SupportedQuery<T, E = Error> =
    | UseQueryResult<T, E>
    | UseInfiniteQueryResult<T, E>;

export interface DataGuardProps<T> {
    /** React Query result object */
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    query: SupportedQuery<T, any>;

    /** Render function receiving data - only called when data is valid */
    children: (data: T, meta: DataGuardMeta) => ReactNode;

    /** Custom loading skeleton (replaces default spinner) */
    skeleton?: ReactNode;

    /** Custom empty state config */
    emptyConfig?: {
        title?: string;
        message?: string;
        actionLabel?: string;
        onAction?: () => void;
    };

    /** Custom logic to check if data is empty */
    isDataEmpty?: (data: T) => boolean;

    /** Show toast on soft error (refresh failed but has cached data) */
    showSoftErrorToast?: boolean;

    /** Custom soft error message */
    softErrorMessage?: string;

    /** Enable Error Boundary for render crashes */
    withErrorBoundary?: boolean;

    /** Custom error config */
    errorConfig?: {
        title?: string;
        message?: string;
    };

    /** Handler when secondary action is pressed (e.g., "Go Home") */
    onSecondaryAction?: () => void;

    /** Label for secondary action button */
    secondaryActionLabel?: string;
}

export interface DataGuardMeta {
    /** Is currently refetching (for pull-to-refresh) */
    isRefetching: boolean;
    /** Refetch function */
    refetch: () => void;
    /** Whether there's a soft error (refresh failed but showing cached data) */
    hasSoftError: boolean;
}

// ============================================
// ERROR DETECTION
// ============================================

const detectErrorType = (error: unknown): StateType => {
    // 1. Check network error (no response at all)
    if (error instanceof TypeError) {
        return 'network';
    }

    const errorMessage = (error as { message?: string })?.message?.toLowerCase() || '';
    const errorCode = (error as { code?: string })?.code || '';

    if (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('failed to fetch') ||
        errorCode === 'ERR_NETWORK' ||
        errorCode === 'ECONNABORTED'
    ) {
        return 'network';
    }

    // 2. Check HTTP status codes
    const status =
        (error as { status?: number })?.status ||
        (error as { response?: { status?: number } })?.response?.status ||
        (error as { statusCode?: number })?.statusCode;

    if (status === 404) return 'not-found';
    if (status === 403 || status === 401) return 'forbidden';
    if (status && status >= 500) return 'server';

    // 3. Default to server error for unknown cases
    return 'server';
};

// ============================================
// EMPTY DATA DETECTION
// ============================================

const defaultIsEmpty = (data: unknown): boolean => {
    if (data === null || data === undefined) return true;
    if (Array.isArray(data)) return data.length === 0;

    if (typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        // Check common API response patterns
        if ('items' in obj) {
            return (obj.items as unknown[])?.length === 0;
        }
        if ('data' in obj) {
            return defaultIsEmpty(obj.data);
        }
        // InfiniteQuery pages
        if ('pages' in obj) {
            const pages = obj.pages as unknown[];
            if (!pages || pages.length === 0) return true;
            return pages.every((page) => {
                if (Array.isArray(page)) return page.length === 0;
                const pageObj = page as Record<string, unknown>;
                if (pageObj?.items) return (pageObj.items as unknown[]).length === 0;
                if (pageObj?.data) return defaultIsEmpty(pageObj.data);
                return false;
            });
        }
    }

    return false;
};

// ============================================
// ERROR BOUNDARY FALLBACK
// ============================================

const ErrorFallback: React.FC<FallbackProps & { onSecondaryAction?: () => void }> = ({
    resetErrorBoundary,
    onSecondaryAction,
}) => (
    <StateView
        type="server"
        title="Lỗi hiển thị"
        message="Đã xảy ra lỗi khi hiển thị dữ liệu. Vui lòng thử lại."
        onAction={resetErrorBoundary}
        actionLabel="Thử lại"
        onSecondaryAction={onSecondaryAction}
        secondaryActionLabel="Về trang chủ"
        fullScreen
    />
);

// ============================================
// DEFAULT LOADING COMPONENT
// ============================================

const DefaultSkeleton: React.FC = () => {
    const { theme } = useUnistyles();

    return (
        <View style={defaultStyles.skeletonContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
    );
};

const defaultStyles = StyleSheet.create((theme) => ({
    skeletonContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
    },
}));

// ============================================
// MAIN COMPONENT
// ============================================

export function DataGuard<T>({
    query,
    children,
    skeleton,
    emptyConfig,
    isDataEmpty = defaultIsEmpty,
    showSoftErrorToast = true,
    softErrorMessage = 'Không thể tải dữ liệu mới',
    withErrorBoundary = false,
    errorConfig,
    onSecondaryAction,
    secondaryActionLabel,
}: DataGuardProps<T>) {
    const { data, isLoading, isError, error, refetch, isRefetching } = query;

    // Track previous error to avoid duplicate toasts
    const prevErrorRef = useRef<unknown>(null);

    // Handle soft error toast
    useEffect(() => {
        if (isError && data && showSoftErrorToast && error !== prevErrorRef.current) {
            prevErrorRef.current = error;
            Toast.show({
                type: 'error',
                text1: 'Lỗi tải dữ liệu',
                text2: softErrorMessage,
                position: 'top',
                visibilityTime: 3000,
            });
        }
    }, [isError, data, error, showSoftErrorToast, softErrorMessage]);

    if (isLoading && !data) {
        return <>{skeleton || <DefaultSkeleton />}</>;
    }

    if (isError) {
        // Case A: SOFT ERROR - Has cached data, refresh failed
        // Don't block UI, show toast, render cached data
        if (data) {
            const meta: DataGuardMeta = {
                isRefetching,
                refetch,
                hasSoftError: true,
            };

            const content = children(data, meta);

            if (withErrorBoundary) {
                return (
                    <ErrorBoundary
                        FallbackComponent={(props: FallbackProps) => (
                            <ErrorFallback {...props} onSecondaryAction={onSecondaryAction} />
                        )}
                    >
                        {content}
                    </ErrorBoundary>
                );
            }

            return <>{content}</>;
        }

        // Case B: HARD ERROR - No data at all
        // Full screen error state
        const errorType = detectErrorType(error);
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const statusCode = (error as any)?.status || (error as any)?.response?.status;

        return (
            <StateView
                type={errorType}
                title={errorConfig?.title}
                message={errorConfig?.message}
                onAction={() => refetch()}
                errorCode={statusCode}
                onSecondaryAction={onSecondaryAction}
                secondaryActionLabel={secondaryActionLabel}
                fullScreen
            />
        );
    }

    // ============================================
    // EMPTY STATE
    // ============================================
    if (data && isDataEmpty(data)) {
        return (
            <StateView
                type="empty"
                title={emptyConfig?.title}
                message={emptyConfig?.message}
                actionLabel={emptyConfig?.actionLabel}
                onAction={emptyConfig?.onAction || (() => refetch())}
                fullScreen
            />
        );
    }

    // ============================================
    // SUCCESS - Render children with data
    // ============================================
    const meta: DataGuardMeta = {
        isRefetching,
        refetch,
        hasSoftError: false,
    };

    // Non-null assertion safe here - we've checked all null cases above
    const content = children(data!, meta);

    if (withErrorBoundary) {
        return (
            <ErrorBoundary
                FallbackComponent={(props: FallbackProps) => (
                    <ErrorFallback {...props} onSecondaryAction={onSecondaryAction} />
                )}
            >
                {content}
            </ErrorBoundary>
        );
    }

    return <>{content}</>;
}

export { defaultIsEmpty, detectErrorType };

