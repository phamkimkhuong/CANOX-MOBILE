/**
 * API Error Definitions
 * 
 * Separated from client.ts to avoid circular dependencies.
 */

/**
 * Generic API Error for consistent error handling across the app
 */
export class ApiError extends Error {
    constructor(
        public message: string,
        public status?: number,
        public code?: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Special error for session expiry
 */
export class SessionExpiredError extends Error {
    constructor(message: string = 'Phiên đăng nhập đã hết hạn') {
        super(message);
        this.name = 'SessionExpiredError';
    }
}

/**
 * Type guard to check if error is SessionExpiredError
 */
export const isSessionExpiredError = (error: unknown): error is SessionExpiredError => {
    return error instanceof SessionExpiredError;
};
