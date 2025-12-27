import { Notification, NotificationResponseItem } from '@/types/notification';

/**
 * Map API Response Item → UI Model
 */
export const mapApiNotificationToUi = (item: NotificationResponseItem): Notification => {
    return {
        id: item.id,
        // Logic map type: Ưu tiên category, nếu null thì fallback về type
        type: (item.category || item.type) as any,
        title: item.title,
        message: item.content,
        timestamp: item.createdDate,
        isRead: item.readStatus === 'READ',
        image: item.imageUrl || undefined,
        actionUrl: item.redirectUrl || undefined,
        // actionLabel: Có thể tự sinh dựa trên relatedEntityType (VD: "Xem đơn hàng")
        actionLabel: item.relatedEntityType === 'ORDER' ? 'Xem chi tiết' : undefined,
    };
}; 