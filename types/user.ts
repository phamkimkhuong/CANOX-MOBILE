import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

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
    email: z.email(),
    image: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    roleName: z.string(),
    buyerId: z.string().nullable().optional(),
    shopId: z.string().nullable().optional(),
    buyer: BuyerInfoSchema.nullable().optional(),
});

export type UserMeData = z.infer<typeof UserMeDataSchema>;

/**
 * Full API Response Wrapper
 */
export const UserMeResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: UserMeDataSchema,
});

export type UserMeResponse = z.infer<typeof UserMeResponseSchema>;

/**
 * ==============================================
 * UPDATE PROFILE TYPES
 * ==============================================
 * API PUT /api/v1/buyers/{buyerId}
 */

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

/**
 * Payload for updating buyer profile
 */
export const UpdateProfilePayloadSchema = z.object({
    fullName: z.string().min(1, 'Họ tên không được để trống').max(100, 'Họ tên tối đa 100 ký tự'),
    phone: z.string()
        .min(10, 'Số điện thoại phải có ít nhất 10 số')
        .max(11, 'Số điện thoại tối đa 11 số')
        .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày sinh không hợp lệ').nullable().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable().optional(),
});

export type UpdateProfilePayload = z.infer<typeof UpdateProfilePayloadSchema>;

/**
 * Form data type (display format DD/MM/YYYY -> API format YYYY-MM-DD)
 */
export interface ProfileFormData {
    fullName: string;
    phone: string;
    dateOfBirth: Date | null;
    gender: Gender | null;
}

/**
 * Form validation schema for EditProfileScreen
 * Uses Date type for dateOfBirth (for DatePicker component)
 * Must be converted to string (YYYY-MM-DD) before sending to API
 */
export const ProfileFormSchema = z.object({
    fullName: z
        .string()
        .min(1, 'Họ tên không được để trống')
        .max(100, 'Họ tên tối đa 100 ký tự'),
    phone: z
        .string()
        .min(10, 'Số điện thoại phải có ít nhất 10 số')
        .max(11, 'Số điện thoại tối đa 11 số')
        .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
    dateOfBirth: z.date().nullable(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).nullable(),
    email: z.email().optional(), // Read-only field
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

/**
 * Update Profile Response
 */
export const UpdateProfileResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: z.any().optional(),
});

export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponseSchema>;