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

    // Fallback to SYSTEM if type is unknown or 'OTHER'
    const rawType = item.category || item.type;
    const validTypes = ['ORDER', 'PROMO', 'SYSTEM', 'SHIPPING', 'PRODUCT', 'WALLET'];
    const finalType = validTypes.includes(rawType) ? rawType : 'SYSTEM';

    return {
        id: item.id,
        type: finalType as Notification['type'],
        title: item.title,
        message: item.content,
        timestamp: item.createdDate,
        isRead: item.readStatus === 'READ',
        image: item.imageUrl || undefined,
        actionUrl: actionUrl,
        actionLabel: actionLabel,
    };
};