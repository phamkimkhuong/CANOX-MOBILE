import { Notification, NotificationResponseItem } from '@/types/notification';

/**
 * Map API Response Item → UI Model
 */
export const mapApiNotificationToUi = (item: NotificationResponseItem): Notification => {
    let actionLabel = undefined;
    if (item.relatedEntityType === 'ORDER') {
        actionLabel = 'Xem chi tiết';
    }
    let actionUrl = item.redirectUrl || undefined;
    if (item.relatedEntityType === 'ORDER' && item.relatedEntityId) {
        actionUrl = `/orders/${item.relatedEntityId}`;
    }

    return {
        id: item.id,
        type: (item.category || item.type) as any,
        title: item.title,
        message: item.content,
        timestamp: item.createdDate,
        isRead: item.readStatus === 'READ',
        image: item.imageUrl || undefined,
        actionUrl: actionUrl,
        actionLabel: actionLabel,
    };
};