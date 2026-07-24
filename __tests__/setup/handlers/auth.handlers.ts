import { http, HttpResponse } from 'msw';

const API_PREFIX = '/api/v1';

/** Successful login response fixture */
const loginSuccessResponse = {
    code: 200,
    success: true,
    message: 'Login successful',
    data: {
        accessToken: 'mock-access-token-xyz',
        refreshToken: 'mock-refresh-token-xyz',
        emailVerified: true,
        email: 'test@example.com',
        user: {
            userId: 'user-001',
            username: 'testuser',
            email: 'test@example.com',
            image: null,
            buyerId: 'buyer-001',
        },
    },
};

/** Login response for unverified email */
const loginUnverifiedResponse = {
    ...loginSuccessResponse,
    data: {
        ...loginSuccessResponse.data,
        emailVerified: false,
    },
};

/** Register success response */
const registerSuccessResponse = {
    code: 200,
    success: true,
    message: 'Registration successful',
    data: {
        userId: 'user-002',
        username: 'newuser',
        email: 'new@example.com',
        status: 'INACTIVE',
    },
};

const logoutSuccessResponse = {
    code: 200,
    success: true,
    message: 'Logged out successfully',
    data: {
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
        emailVerified: true,
        email: 'test@example.com',
        user: {
            userId: 'test',
            username: 'test',
            email: 'test@example.com',
            image: null,
            buyerId: null,
        },
    },
};

export const authHandlers = [
    // Login
    http.post(`http://app.test${API_PREFIX}/auth/login/mobile`, () => {
        return HttpResponse.json(loginSuccessResponse, { status: 200 });
    }),

    // Register
    http.post(`http://app.test${API_PREFIX}/users/buyer`, () => {
        return HttpResponse.json(registerSuccessResponse, { status: 200 });
    }),

    // Logout
    http.post(`http://app.test${API_PREFIX}/auth/logout`, () => {
        return HttpResponse.json(logoutSuccessResponse, { status: 200 });
    }),

    // Verify OTP
    http.post(`http://app.test${API_PREFIX}/auth/otp/verify`, () => {
        return HttpResponse.json({ code: 200, success: true, message: 'OTP verified', data: null }, { status: 200 });
    }),

    // Resend OTP
    http.post(`http://app.test${API_PREFIX}/auth/otp/resend`, () => {
        return HttpResponse.json({ code: 200, success: true, message: 'OTP resent', data: null }, { status: 200 });
    }),

    // Forgot Password Flow
    http.post(`http://app.test${API_PREFIX}/auth/password/forgot`, () => {
        return HttpResponse.json({ code: 200, success: true, message: 'Password reset OTP sent', data: null }, { status: 200 });
    }),
    http.post(`http://app.test${API_PREFIX}/auth/password/verify`, () => {
        return HttpResponse.json({ code: 200, success: true, message: 'Password reset OTP verified', data: { resetToken: 'mock-reset-token-xyz' } }, { status: 200 });
    }),
    http.post(`http://app.test${API_PREFIX}/auth/password/reset`, () => {
        return HttpResponse.json({ code: 200, success: true, message: 'Password reset successful', data: null }, { status: 200 });
    }),

    // Check email exists
    http.get(`http://app.test${API_PREFIX}/users/exists/email`, ({ request }) => {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        if (email === 'existing@example.com') {
            return HttpResponse.json({ code: 200, success: true, message: 'Email exists', data: true }, { status: 200 });
        }
        return HttpResponse.json({ code: 200, success: true, message: 'Email not found', data: false }, { status: 200 });
    }),
];

export {
    loginSuccessResponse,
    loginUnverifiedResponse,
    registerSuccessResponse,
    logoutSuccessResponse,
};
