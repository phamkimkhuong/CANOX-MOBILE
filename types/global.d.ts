/**
 * Global Type Declarations
 * 
 * Defines types for global variables used across the application.
 * This ensures TypeScript recognizes these globals and provides proper type checking.
 */

declare global {
    /**
     * Navigation lock state
     * Used to prevent double-tap navigation issues
     */
    var __NAV_LOCKED__: boolean;

    /**
     * Navigation lock timeout handle
     * Used to auto-unlock navigation after a duration
     */
    var __NAV_LOCK_TIMEOUT__: ReturnType<typeof setTimeout> | null;
}

export { };

