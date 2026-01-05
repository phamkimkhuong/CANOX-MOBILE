import { Notification, NotificationResponseItem } from '@/types/notification';

/**
 * Map API Response Item → UI Model
 */
export const mapApiNotificationToUi = (item: NotificationResponseItem): Notification => {
    return {
        id: item.id,
        // Logic map type: Prioritize category, if null then fallback to type
        type: (item.category || item.type) as any,
        title: item.title,
        message: item.content,
        timestamp: item.createdDate,
        isRead: item.readStatus === 'READ',
        image: item.imageUrl || undefined,
        actionUrl: item.redirectUrl || undefined,
        // actionLabel: Can be generated based on relatedEntityType (Ex: "View order")
        actionLabel: item.relatedEntityType === 'ORDER' ? 'Xem chi tiết' : undefined,
    };
}; 