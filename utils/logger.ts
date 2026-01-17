/**
 * ==============================================
 * LOGGER UTILITY - Development-Only Logging
 * ==============================================
 * 
 * Centralized logging utility that only outputs in development mode.
 * In production builds, these functions become no-ops (empty functions)
 * and are stripped by dead code elimination.
 */

// ============================================
// TYPES
// ============================================

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface ScopedLogger {
    /** General log (same as console.log) */
    log: (...args: unknown[]) => void;
    /** Info level log */
    info: (...args: unknown[]) => void;
    /** Warning level log */
    warn: (...args: unknown[]) => void;
    /** Error level log */
    error: (...args: unknown[]) => void;
    /** Debug level log (more verbose) */
    debug: (...args: unknown[]) => void;
}

// ============================================
// CORE LOGGING FUNCTIONS
// ============================================

/**
 * Development-only console.log
 * @param args - Arguments to log
 */
export const devLog = (...args: unknown[]): void => {
    if (__DEV__) {
        console.log(...args);
    }
};

/**
 * Development-only console.info
 * @param args - Arguments to log
 */
export const devInfo = (...args: unknown[]): void => {
    if (__DEV__) {
        console.info(...args);
    }
};

/**
 * Development-only console.warn
 * @param args - Arguments to log
 */
export const devWarn = (...args: unknown[]): void => {
    if (__DEV__) {
        console.warn(...args);
    }
};

/**
 * Development-only console.error
 * @param args - Arguments to log
 */
export const devError = (...args: unknown[]): void => {
    if (__DEV__) {
        console.error(...args);
    }
};

/**
 * Development-only console.debug
 * @param args - Arguments to log
 */
export const devDebug = (...args: unknown[]): void => {
    if (__DEV__) {
        console.debug(...args);
    }
};

// ============================================
// SCOPED LOGGER FACTORY
// ============================================

/**
 * Creates a scoped logger with a prefix tag.
 * Useful for services, hooks, or components that need consistent logging.
 * 
 * @param scope - The scope/tag to prefix all logs (e.g., 'WebSocket', 'Auth', 'Cart')
 * @returns ScopedLogger instance with log, info, warn, error, debug methods
 */
export const createLogger = (scope: string): ScopedLogger => {
    const prefix = `[${scope}]`;

    return {
        log: (...args: unknown[]) => {
            if (__DEV__) {
                console.log(prefix, ...args);
            }
        },
        info: (...args: unknown[]) => {
            if (__DEV__) {
                console.info(prefix, ...args);
            }
        },
        warn: (...args: unknown[]) => {
            if (__DEV__) {
                console.warn(prefix, ...args);
            }
        },
        error: (...args: unknown[]) => {
            if (__DEV__) {
                console.error(prefix, ...args);
            }
        },
        debug: (...args: unknown[]) => {
            if (__DEV__) {
                console.debug(prefix, ...args);
            }
        },
    };
};

// ============================================
// EMOJI PREFIXED LOGS (Optional convenience)
// ============================================

/**
 * Pre-configured loggers with emoji prefixes for common categories.
 * Makes logs more scannable in the console.
 */
export const logger = {
    /** API related logs: */
    api: createLogger(' API'),

    /** Authentication logs: */
    auth: createLogger(' Auth'),

    /** WebSocket logs:  */
    ws: createLogger(' WebSocket'),

    /** Navigation logs:  */
    nav: createLogger(' Navigation'),

    /** Storage/Cache logs:  */
    storage: createLogger(' Storage'),

    /** UI/Component logs:  */
    ui: createLogger(' UI'),

    /** Performance logs:  */
    perf: createLogger(' Perf'),

    /** Product logs:  */
    product: createLogger(' Product'),

    /** User logs:  */
    user: createLogger(' User'),

    /** Cart/Checkout logs:  */
    cart: createLogger(' Cart'),

    checkout: createLogger(' Checkout'),

    /** Orders logs:  */
    orders: createLogger(' Orders'),

    /** Chat logs:  */
    chat: createLogger('Chat'),

    /** Push notification logs: */
    push: createLogger('Push'),
};

// ============================================
// CONDITIONAL LOGGING HELPERS
// ============================================

/**
 * Log only if a condition is true (in development)
 * Useful for verbose/optional debugging
 * 
 * @param condition - When true, the log will be printed
 * @param args - Arguments to log
 * 
 * @example
 * devLogIf(items.length > 100, 'Large list detected:', items.length);
 */
export const devLogIf = (condition: boolean, ...args: unknown[]): void => {
    if (__DEV__ && condition) {
        console.log(...args);
    }
};

/**
 * Log with a timestamp prefix (in development)
 * 
 * @param args - Arguments to log
 * 
 * @example
 * devLogTimed('API call completed');
 * // Output: [10:45:32.123] API call completed
 */
export const devLogTimed = (...args: unknown[]): void => {
    if (__DEV__) {
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }) + '.' + now.getMilliseconds().toString().padStart(3, '0');

        console.log(`[${timestamp}]`, ...args);
    }
};
