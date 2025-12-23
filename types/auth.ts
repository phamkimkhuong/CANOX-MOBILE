import { z } from 'zod';

// Regex: Tối thiểu 6 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 số
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{6,}$/;

// 1. Schema cho Request
export const LoginRequestSchema = z.object({
    username: z.string().min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    deviceId: z.string().optional(), // Gửi kèm Device ID để quản lý phiên
    fcmToken: z.string().optional(), // Để push notification
});
export const RegisterRequestSchema = z.object({
    username: z.string()
        .min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự')
        .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập không được chứa ký tự đặc biệt'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string()
        .min(6, 'Mật khẩu tối thiểu 6 ký tự')
        .regex(PASSWORD_REGEX, 'Mật khẩu phải chứa chữ hoa, chữ thường và số'),
});

// 2. Schema cho Response
export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        avatar: z.string().nullable().optional(),
    }),
});

// Schema cho Register Response
export const RegisterResponseSchema = z.object({
    code: z.number(),
    success: z.boolean(),
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
export type RegisterPayload = z.infer<typeof RegisterRequestSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;