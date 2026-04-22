import { rest } from 'msw';

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

/** Default logout response */
const logoutSuccessResponse = {
    code: 200,
    success: true,
    message: 'Logged out successfully',
    data: {
        accessToken: '',
        refreshToken: '',
        emailVerified: true,
        email: '',
        user: {
            userId: '',
            username: '',
            email: 'placeholder@test.com',
            image: null,
            buyerId: null,
        },
    },
};

export const authHandlers = [
    // Login
    rest.post(`http://app.test${API_PREFIX}/auth/login/mobile`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(loginSuccessResponse));
    }),

    // Register
    rest.post(`http://app.test${API_PREFIX}/users/buyer`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(registerSuccessResponse));
    }),

    // Logout
    rest.post(`http://app.test${API_PREFIX}/auth/logout`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(logoutSuccessResponse));
    }),

    // Verify OTP
    rest.post(`http://app.test${API_PREFIX}/auth/otp/verify`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ code: 200, success: true, message: 'OTP verified', data: null }));
    }),

    // Resend OTP
    rest.post(`http://app.test${API_PREFIX}/auth/otp/resend`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ code: 200, success: true, message: 'OTP resent', data: null }));
    }),
];

export {
    loginSuccessResponse,
    loginUnverifiedResponse,
    registerSuccessResponse,
    logoutSuccessResponse,
};
