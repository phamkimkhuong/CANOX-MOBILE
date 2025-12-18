import {
    FlattenedNotificationItem,
    Notification,
    NotificationFilter,
    NotificationPage,
    NotificationPageSchema,
} from '@/types/notification';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

/**
 * Mock notification data
 */
const MOCK_NOTIFICATIONS: Notification[] = [
    // Today
    {
        id: '1',
        type: 'PROMO',
        title: 'Flash Sale đang diễn ra!',
        message: 'Săn deal hời giá chỉ từ 1K. Số lượng có hạn, nhanh tay chốt đơn ngay kẻo lỡ!',
        timestamp: new Date().toISOString(),
        isRead: false,
    },
    {
        id: '2',
        type: 'ORDER',
        title: 'Giao hàng thành công',
        message: 'Kiện hàng VN298347923 (Đồng hồ thông minh...) đã được giao thành công đến bạn. Hãy đánh giá để nhận xu nhé!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: true,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
        actionLabel: 'Đánh giá ngay',
        actionUrl: '/review/VN298347923',
    },
    {
        id: '3',
        type: 'SYSTEM',
        title: 'Cập nhật chính sách bảo mật',
        message: 'Chúng tôi đã cập nhật chính sách bảo mật để bảo vệ thông tin của bạn tốt hơn.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        isRead: true,
    },
    // Yesterday
    {
        id: '4',
        type: 'ORDER',
        title: 'Đơn hàng đang vận chuyển',
        message: 'Đơn hàng #SHP202399 của bạn đã rời kho phân loại và đang trên đường đến trạm giao nhận.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    },
    {
        id: '5',
        type: 'WALLET',
        title: 'Hoàn tiền thành công',
        message: 'Yêu cầu hoàn tiền cho đơn hàng #RF99283 đã được chấp nhận. Số tiền 150.000đ đã được cộng vào ví của bạn.',
        timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
    {
        id: '6',
        type: 'PROMO',
        title: 'Voucher mới cho bạn!',
        message: 'Tặng bạn mã freeship đơn từ 0đ. Hết hạn sau 24h.',
        timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        actionLabel: 'Dùng ngay',
        actionUrl: '/voucher/FREESHIP24',
    },
    // Earlier this week
    {
        id: '7',
        type: 'ORDER',
        title: 'Đơn hàng đã xác nhận',
        message: 'Đơn hàng #ORD887766 đã được xác nhận và đang chờ lấy hàng.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
    },
    {
        id: '8',
        type: 'PROMO',
        title: 'Sale cuối tuần - Giảm đến 50%',
        message: 'Hàng ngàn sản phẩm giảm giá sốc. Chỉ trong 2 ngày!',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
    {
        id: '9',
        type: 'SYSTEM',
        title: 'Xác minh tài khoản thành công',
        message: 'Tài khoản của bạn đã được xác minh. Giờ đây bạn có thể sử dụng đầy đủ tính năng.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
    {
        id: '10',
        type: 'WALLET',
        title: 'Nạp tiền thành công',
        message: 'Bạn đã nạp thành công 500.000đ vào ví. Số dư hiện tại: 650.000đ.',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
];

const PAGE_SIZE = 5;

/**
 * Simulate API fetch with pagination
 */
const fetchNotifications = async (
    cursor: string | null,
    filter: NotificationFilter
): Promise<NotificationPage> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter notifications by type
    let filtered = MOCK_NOTIFICATIONS;
    if (filter !== NotificationFilter.ALL) {
        filtered = MOCK_NOTIFICATIONS.filter((n) => {
            if (filter === NotificationFilter.ORDER) return n.type === 'ORDER';
            if (filter === NotificationFilter.PROMO) return n.type === 'PROMO';
            if (filter === NotificationFilter.WALLET) return n.type === 'WALLET' || n.type === 'SYSTEM';
            return true;
        });
    }

    // Paginate
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const endIndex = startIndex + PAGE_SIZE;
    const data = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    const response: NotificationPage = {
        data,
        nextCursor: hasMore ? endIndex.toString() : null,
        hasMore,
    };

    // Validate response with Zod
    return NotificationPageSchema.parse(response);
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

    if (notifDate.getTime() === today.getTime()) return 'Hôm nay';
    if (notifDate.getTime() === yesterday.getTime()) return 'Hôm qua';
    if (notifDate.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) return 'Tuần này';
    return 'Trước đó';
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

/**
 * Hook to fetch notifications with infinite scroll
 */
export const useNotifications = (filter: NotificationFilter = NotificationFilter.ALL) => {
    const query = useInfiniteQuery({
        queryKey: ['notifications', filter],
        queryFn: ({ pageParam }) => fetchNotifications(pageParam, filter),
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
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
 * Hook to mark notification as read (placeholder for mutation)
 */
export const useMarkAsRead = () => {
    // TODO: Implement mutation when API is ready
    const markAsRead = (notificationId: string) => {
        console.log('Marking as read:', notificationId);
    };

    const markAllAsRead = () => {
        console.log('Marking all as read');
    };

    return { markAsRead, markAllAsRead };
};
