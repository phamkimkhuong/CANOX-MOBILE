import { z } from 'zod';

export const UserProfileSchema = z.object({
    id: z.string(),
    username: z.string(),
    fullName: z.string(),
    avatar: z.string().nullable(),
    memberLevel: z.string(), // "Silver", "Gold"
    followingCount: z.number(),
    followerCount: z.number(),
    likeCount: z.number(),
    // Thống kê đơn hàng (để hiện badge đỏ)
    orderStats: z.object({
        pendingPayment: z.number(),
        processing: z.number(),
        shipping: z.number(),
        review: z.number(),
    }),
    // Ví
    wallet: z.object({
        coins: z.number(),
        vouchers: z.number(),
    }),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;