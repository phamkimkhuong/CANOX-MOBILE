import { z } from 'zod';
import { ResponseDefaultSchema } from './responseSchema';

// Regex: Tối thiểu 6 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/;

// ===============================
// SHARED VALIDATION PIECES
// ===============================

export const EmailSchema = z.string().email('Email không hợp lệ');

export const PasswordSchema = z.string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .regex(PASSWORD_REGEX, 'Mật khẩu phải chứa chữ hoa, chữ thường và số');

export const ConfirmPasswordSchema = z.string().min(1, 'Vui lòng xác nhận mật khẩu');

/**
 * Modular schema for password and confirmation
 */
export const PasswordGroupSchema = z.object({
    password: PasswordSchema,
    confirmPassword: ConfirmPasswordSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

/**
 * Shared refinement for matching passwords
 */
export const passwordMatchRefine = (passwordKey: string, confirmKey: string) => {
    return (data: Record<string, unknown>) => data[passwordKey] === data[confirmKey];
};

// 1. Schema cho Request
export const LoginRequestSchema = z.object({
    username: z.string().min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    deviceId: z.string().optional(), // Gửi kèm Device ID để quản lý phiên
    fcmToken: z.string().optional(), // Để push notification
});

export const GoogleLoginRequestSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    loginType: z.literal('GOOGLE'),
    role: z.literal('BUYER'),
    deviceId: z.string().optional(),
    fcmToken: z.string().optional(),
});
/**
 * API REQUEST SCHEMAS (Matches Backend)
 * ===============================
 */
export const RegisterRequestSchema = z.object({
    username: z.string()
        .min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập không được chứa ký tự đặc biệt'),
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: ConfirmPasswordSchema,
});

/**
 * UI FORM SCHEMAS (Includes Confirmation)
 * ===============================
 */
export const RegisterFormSchema = RegisterRequestSchema.refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

// 2. Schema cho Response Login
export const AuthResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: z.object({
        accessToken: z.string(),
        refreshToken: z.string(),
        emailVerified: z.boolean(),
        email: z.string().optional(),
        user: z.object({
            userId: z.string(),
            username: z.string(),
            email: z.string(),
            roles: z.array(z.string()).optional(),
            image: z.string().nullable().optional(),
            fullNameBuyer: z.string().nullable().optional(),
            fullNameEmployee: z.string().nullable().optional(),
            shopId: z.string().nullable().optional(),
            shopName: z.string().nullable().optional(),
            logoUrl: z.string().nullable().optional(),
            // Legacy/Optional fields
            status: z.string().optional(),
            buyerId: z.string().nullable().optional(),
        }),
    }),
});

// Schema cho Response Social Login (Google, Facebook, Apple)
export const SocialLoginResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: z.object({
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        emailVerified: z.boolean(),
        hasShopRole: z.boolean().optional(),
        hasBuyerRole: z.boolean().optional(),
        shopProfileExists: z.boolean().optional(),
        requiresShopProfile: z.boolean().optional(),
        requiresShopVerification: z.boolean().optional(),
        loginContextRole: z.string().optional(),
        user: z.object({
            userId: z.string(),
            username: z.string(),
            email: z.string(),
            status: z.string().optional(),
            roles: z.array(z.string()).optional(),
            image: z.string().nullable().optional(),
            buyerId: z.string().nullable().optional(),
            buyer: z.unknown().nullable().optional(),
        }),
    }),
});

// Schema cho Register Response
export const RegisterResponseSchema = ResponseDefaultSchema.extend({
    message: z.string(),
    data: z.object({
        userId: z.string(),
        username: z.string(),
        email: z.string(),
        image: z.string().nullable().optional(),
        status: z.string(), // 'INACTIVE' -> cần verify OTP
        roleName: z.string(),
    }),
});

export const VerifyOtpSchema = z.object({
    email: z.string().email(), // Email người dùng
    otpCode: z.string().length(6, 'Mã xác thực phải đủ 6 số'), // Mã 6 số
});

export type VerifyOtpPayload = z.infer<typeof VerifyOtpSchema>;
// Type inference
export type LoginPayload = z.infer<typeof LoginRequestSchema>;
export type GoogleLoginPayload = z.infer<typeof GoogleLoginRequestSchema>;
export type RegisterPayload = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

// ===============================
// CHANGE PASSWORD SCHEMAS
// ===============================

/**
 * Schema for Change Password Request
 * Uses the same PASSWORD_REGEX as register to ensure consistency
 */
export const ChangePasswordRequestSchema = z.object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: PasswordSchema,
    confirmPassword: ConfirmPasswordSchema,
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
}).refine((data) => data.oldPassword !== data.newPassword, {
    message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
    path: ['newPassword'],
});

/**
 * Schema cho Change Password Response
 */
export const ChangePasswordResponseSchema = ResponseDefaultSchema.extend({
    data: z.object({}).optional(),
});

export type ChangePasswordPayload = z.infer<typeof ChangePasswordRequestSchema>;
export type ChangePasswordResponse = z.infer<typeof ChangePasswordResponseSchema>;

// ===============================
// FORGOT PASSWORD SCHEMAS
// ===============================

/**
 * Schema for Check Email Exists Response
 * GET /api/v1/users/exists/email?email=xxx
 */
export const CheckEmailExistsResponseSchema = ResponseDefaultSchema.extend({
    data: z.boolean(), // true = email exists, false = not found
});

export type CheckEmailExistsResponse = z.infer<typeof CheckEmailExistsResponseSchema>;

/**
 * Schema for Forgot Password Request
 * POST /api/v1/auth/password/forgot
 */
export const ForgotPasswordRequestSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordRequestSchema>;

/**
 * Schema for Verify Forgot Password OTP
 * POST /api/v1/auth/password/verify-otp
 */
export const VerifyForgotPasswordOtpSchema = z.object({
    email: z.string().email(),
    otpCode: z.string().length(6, 'Mã xác thực phải đủ 6 số'),
});

export type VerifyForgotPasswordOtpPayload = z.infer<typeof VerifyForgotPasswordOtpSchema>;

/**
 * Schema for Reset Password Request
 * POST /api/v1/auth/password/reset
 */
export const ResetPasswordRequestSchema = z.object({
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: ConfirmPasswordSchema, // Keep if backend actually wants it as user said
});

/**
 * UI Form Schema
 */
export const ResetPasswordFormSchema = ResetPasswordRequestSchema.refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

export type ResetPasswordPayload = z.infer<typeof ResetPasswordRequestSchema>;
