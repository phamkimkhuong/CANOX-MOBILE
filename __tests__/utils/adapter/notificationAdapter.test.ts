/**
 * Notification Adapter Unit Tests
 */

import type { NotificationResponseItem } from '@/types/notification';
import { mapApiNotificationToUi } from '@/utils/adapter/notificationAdapter';

const createNotification = (overrides: Partial<NotificationResponseItem> = {}): NotificationResponseItem => ({
    id: 'notif-1',
    title: 'Đơn hàng mới',
    content: 'Đơn hàng #12345 đã được xác nhận',
    type: 'ORDER',
    category: 'ORDER',
    readStatus: 'UNREAD',
    createdDate: '2026-04-20T10:00:00Z',
    relatedEntityType: 'ORDER',
    relatedEntityId: 'order-123',
    redirectUrl: '/orders/order-123',
    imageUrl: 'https://example.com/img.jpg',
    ...overrides,
});

describe('notificationAdapter', () => {
    describe('mapApiNotificationToUi', () => {
        it('maps basic fields', () => {
            const result = mapApiNotificationToUi(createNotification());

            expect(result.id).toBe('notif-1');
            expect(result.title).toBe('Đơn hàng mới');
            expect(result.message).toBe('Đơn hàng #12345 đã được xác nhận');
            expect(result.timestamp).toBe('2026-04-20T10:00:00Z');
        });

        it('sets isRead based on readStatus', () => {
            const unread = mapApiNotificationToUi(createNotification({ readStatus: 'UNREAD' }));
            const read = mapApiNotificationToUi(createNotification({ readStatus: 'READ' }));

            expect(unread.isRead).toBe(false);
            expect(read.isRead).toBe(true);
        });

        it('sets ORDER type and action properties', () => {
            const result = mapApiNotificationToUi(createNotification({
                relatedEntityType: 'ORDER',
                relatedEntityId: 'order-456',
            }));

            expect(result.type).toBe('ORDER');
            expect(result.actionLabel).toBe('Xem chi tiết');
            expect(result.actionUrl).toBe('/orders/order-456');
        });

        it('handles PROMO type', () => {
            const result = mapApiNotificationToUi(createNotification({
                category: 'PROMO',
                type: 'PROMO',
                relatedEntityType: 'PRODUCT',
            }));

            expect(result.type).toBe('PROMO');
            expect(result.actionLabel).toBeUndefined();
        });

        it('maps image correctly', () => {
            const withImg = mapApiNotificationToUi(createNotification({ imageUrl: 'https://example.com/img.jpg' }));
            const noImg = mapApiNotificationToUi(createNotification({ imageUrl: '' }));

            expect(withImg.image).toBe('https://example.com/img.jpg');
            expect(noImg.image).toBeUndefined();
        });

        it('falls back to SYSTEM for unknown type', () => {
            const result = mapApiNotificationToUi(createNotification({
                category: 'UNKNOWN_TYPE',
                type: 'UNKNOWN_TYPE',
            }));

            expect(result.type).toBe('SYSTEM');
        });

        it('categorizes valid types correctly', () => {
            const validTypes = ['ORDER', 'PROMO', 'SYSTEM', 'SHIPPING', 'PRODUCT', 'WALLET'];
            validTypes.forEach(type => {
                const result = mapApiNotificationToUi(createNotification({ category: type, type }));
                expect(result.type).toBe(type);
            });
        });
    });
});
