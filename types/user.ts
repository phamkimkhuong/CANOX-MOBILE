import { z } from 'zod';

/**
 * ==============================================
 * USER ME API TYPES
 * ==============================================
 * API Response /api/v1/users/me
 */

/**
 * Buyer Info from API
 */
export const BuyerInfoSchema = z.object({
    buyerId: z.string(),
    fullName: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    dateOfBirth: z.string().nullable().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
});

export type BuyerInfo = z.infer<typeof BuyerInfoSchema>;

/**
 * Shop Info from API
 */
export const ShopInfoSchema = z.object({
    shopId: z.string(),
    shopName: z.string(),
    description: z.string().nullable().optional(),
    logoUrl: z.string().nullable().optional(),
    bannerUrl: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    rejectedReason: z.string().nullable().optional(),
    verifyBy: z.string().nullable().optional(),
    verifyDate: z.string().nullable().optional(),
    userId: z.string(),
    username: z.string(),
});

export type ShopInfo = z.infer<typeof ShopInfoSchema>;

/**
 * User Me Data from API
 */
export const UserMeDataSchema = z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string().email(),
    image: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    isDeleted: z.boolean().nullable().optional(),
    roleName: z.string(),
    roles: z.array(z.string()),
    lockedAt: z.string().nullable().optional(),
    buyerId: z.string().nullable().optional(),
    shopId: z.string().nullable().optional(),
    employeeId: z.string().nullable().optional(),
    buyer: BuyerInfoSchema.nullable().optional(),
    shop: ShopInfoSchema.nullable().optional(),
    employee: z.any().nullable().optional(),
});

export type UserMeData = z.infer<typeof UserMeDataSchema>;

/**
 * Full API Response Wrapper
 */
export const UserMeResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
    message: z.string(),
    data: UserMeDataSchema,
});

export type UserMeResponse = z.infer<typeof UserMeResponseSchema>;