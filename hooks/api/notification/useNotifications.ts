import { API_ROUTES } from '@/constants/apiRoutes';
import { useSmartRefresh } from '@/hooks/useSmartRefresh';
import { apiClient, isSessionExpiredError, request } from '@/services/api/client';
import { handleQueryRetry } from '@/services/api/queryClient';
import { useAuthStore } from '@/store/useAuthStore';
import {
    FlattenedNotificationItem,
    Notification,
    NotificationApiResponseSchema,
    NotificationFilter,
    NotificationPage
} from '@/types/notification';
import { ResponseDefaultSchema } from '@/types/responseSchema';
import { mapApiNotificationToUi } from '@/utils/adapter/notificationAdapter';
import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const PAGE_SIZE = 20;

// ============================================
// UNREAD COUNT HOOK (Lightweight for TabBar badge)
// ============================================

interface UnreadCountResponse {
    code: number;
    success: boolean;
    data: number;
}

/**
 * Hook to fetch unread notification count
 * Lightweight polling for TabBar badge display
 */
export const useUnreadNotificationCount = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async (): Promise<number> => {
            const response = await apiClient.get<UnreadCountResponse>(
                API_ROUTES.NOTIFICATIONS.COUNT_UNREAD
            );

            if (response.data.success) {
                return response.data.data;
            }
            return 0;
        },
        enabled: isAuthenticated,
        staleTime: 1000 * 60, // 1 minute - data is fresh for 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes - keep in cache
        refetchInterval: isAuthenticated ? 1000 * 60 * 2 : false, // Poll every 2 minutes
        refetchOnWindowFocus: false, // Disable to avoid duplicate calls
        refetchOnMount: false, // Don't refetch on every mount if data is fresh
        retry: (count, error) => handleQueryRetry(count, error, 1), // Only retry once on failure, but skip 403
    });
};

// ============================================
// NOTIFICATIONS LIST HOOK
// ============================================


/**
 * Fetch notifications with pagination
 */
const fetchNotifications = async (
    pageParam: number,
    filter: NotificationFilter
): Promise<NotificationPage> => {
    const params: Record<string, string | number> = {
        recipientRole: 'BUYER',
        page: pageParam,
        size: PAGE_SIZE,

    };

    // Filter by type/category if not "ALL"
    if (filter !== NotificationFilter.ALL) {
        params.type = filter;
    }

    const response = await request(
        {
            url: API_ROUTES.NOTIFICATIONS.GET,
            method: 'GET',
            params,
        },
        NotificationApiResponseSchema
    );

    // Guard: Check response.data exists
    if (!response.data) {
        return {
            data: [],
            nextCursor: null,
            hasMore: false,
        };
    }

    const { content, hasNext, nextPage } = response.data;
    return {
        data: content.map(mapApiNotificationToUi),
        nextCursor: hasNext ? (nextPage ?? null) : null,
        hasMore: hasNext,
    };
};

/**
 * Hook to fetch notifications with infinite scroll
 */
export const useNotifications = (filter: NotificationFilter = NotificationFilter.ALL) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const query = useInfiniteQuery({
        queryKey: ['notifications', filter],
        queryFn: ({ pageParam = 0 }) => fetchNotifications(pageParam as number, filter), // Default page 0
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });

    // Flatten all pages into a single list with section headers
    const flattenedData = useMemo(() => {
        if (!query.data?.pages) return [];
        const allNotifications = query.data.pages.flatMap((page) => page.data);
        return flattenNotifications(allNotifications);
    }, [query.data?.pages]);

    // Get sticky header indices (section headers)
    const stickyHeaderIndices = useMemo(() => {
        return flattenedData
            .map((item, index) => (item.type === 'section-header' ? index : -1))
            .filter((index) => index !== -1);
    }, [flattenedData]);

    // Count unread notifications
    const unreadCount = useMemo(() => {
        if (!query.data?.pages) return 0;
        return query.data.pages
            .flatMap((page) => page.data)
            .filter((n) => !n.isRead).length;
    }, [query.data?.pages]);

    return {
        ...query,
        flattenedData,
        stickyHeaderIndices,
        unreadCount,
    };
};

/**
 * useRefreshNotifications - Smart refresh for notifications infinite query
 * Only fetches page 0 instead of all loaded pages.
 * 
 * @param filter - Current notification filter
 * @returns refresh function
 */
export const useRefreshNotifications = (filter: NotificationFilter = NotificationFilter.ALL) => {
    return useSmartRefresh(['notifications', filter]);
};

/**
 * Hook to mark ONE notification as read
 * Dùng onSuccess thay vì onMutate vì user đã navigate sang trang chi tiết,
 * không cần optimistic update UI
 */
export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (notificationId: string) => {
            return request(
                {
                    url: API_ROUTES.NOTIFICATIONS.MARK_AS_READ(notificationId),
                    method: 'PATCH',
                },
                ResponseDefaultSchema
            );
        },
        onSuccess: () => {
            // Invalidate để khi user quay lại, data đã được cập nhật
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
        // Không cần onError vì đây là fire-and-forget
        // User đã ở trang khác, không cần hiện Toast
    });
};

/**
 * Hook to mark ALL notifications as read
 */
export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation('notification');
    return useMutation({
        mutationFn: async () => {
            return request(
                {
                    url: API_ROUTES.NOTIFICATIONS.MARK_ALL_AS_READ,
                    method: 'PATCH',
                },
                ResponseDefaultSchema
            );
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            // Snapshot dữ liệu cũ (để rollback nếu lỗi)
            const previousData = queryClient.getQueriesData<InfiniteData<NotificationPage>>({
                queryKey: ['notifications']
            });
            // Optimistic: Đánh dấu TẤT CẢ là đã đọc
            queryClient.setQueriesData<any>(
                { queryKey: ['notifications'] },
                (oldData: any) => {
                    if (!oldData) return oldData;

                    // Infinite Query data (Notification List)
                    if (oldData.pages && Array.isArray(oldData.pages)) {
                        return {
                            ...oldData,
                            pages: oldData.pages.map((page: any) => ({
                                ...page,
                                data: page.data.map((notif: any) => ({ ...notif, isRead: true })),
                            })),
                        };
                    }

                    //Simple Query data (Unread Count)
                    if (typeof oldData === 'number') {
                        return 0;
                    }

                    return oldData;
                }
            );
            return { previousData };
        },
        onError: (_err, _vars, context) => {
            // Rollback: Nếu lỗi thì trả lại dữ liệu cũ
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }

            // Ignore SessionExpiredError - logout is happening
            if (isSessionExpiredError(_err)) return;

            Toast.show({
                type: 'error',
                text1: t('errors.markAllAsReadFailed'),
                text2: t('errors.tryAgain'),
            });
        },
        onSuccess: () => {
            // Toast.show({
            //     type: 'success',
            //     text1: 'Đã đánh dấu tất cả đã đọc',
            // });
        },
        onSettled: () => {
            //Fetch lại dữ liệu mới nhất (đảm bảo đồng bộ server)
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};


/**
 * Group notifications by date section
 */
const getDateSection = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (notifDate.getTime() === today.getTime()) return 'today';
    if (notifDate.getTime() === yesterday.getTime()) return 'yesterday';
    if (notifDate.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) return 'thisWeek';
    return 'earlier';
};

/**
 * Flatten notifications into sections for FlashList
 */
const flattenNotifications = (notifications: Notification[]): FlattenedNotificationItem[] => {
    const result: FlattenedNotificationItem[] = [];
    let currentSection = '';

    for (const notification of notifications) {
        const section = getDateSection(notification.timestamp);
        if (section !== currentSection) {
            currentSection = section;
            result.push({
                type: 'section-header',
                title: section,
                id: `section-${section}`,
            });
        }
        result.push({
            type: 'notification',
            data: notification,
        });
    }
    return result;
};
