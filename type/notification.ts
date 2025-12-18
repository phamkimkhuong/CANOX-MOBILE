import { z } from 'zod';

export enum NotificationType {
    ORDER = 'ORDER',       // Đơn hàng (Icon xe tải/hộp)
    PROMO = 'PROMO',       // Khuyến mãi (Icon lửa/tag)
    WALLET = 'WALLET',     // Ví (Icon ví)
    SYSTEM = 'SYSTEM',     // Hệ thống (Icon khiên)
}

// Schema cho API Response
export const NotificationSchema = z.object({
    id: z.number(),
    type: z.nativeEnum(NotificationType),
    title: z.string(),
    body: z.string(),
    createdAt: z.string(), // ISO String
    isRead: z.boolean(),
    image: z.string().optional(), // Ảnh sản phẩm (nếu có)
    actionLabel: z.string().optional(), // Nút "Đánh giá ngay", "Dùng ngay"
    actionLink: z.string().optional(), // Deep link
});

export type Notification = z.infer<typeof NotificationSchema>;