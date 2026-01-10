/**
 * useLoadingStore - Zustand store for Global Loading Overlay
 * 
 * PURPOSE:
 * Manages the visibility of a fullscreen blocking overlay that prevents
 * user interactions during critical async operations (e.g., add to cart, checkout).
 * 
 * ARCHITECTURE:
 * - Uses Zustand for minimal re-renders (only components subscribing to isLoading will update)
 * - Supports optional loading message for context-aware feedback
 * - Reference counting to handle nested loading calls (show called multiple times)
 * 
 * USAGE:
 * ```tsx
 * // In mutation hooks or components:
 * import { useLoadingStore } from '@/store/useLoadingStore';
 * 
 * const showLoading = useLoadingStore.getState().show;
 * const hideLoading = useLoadingStore.getState().hide;
 * 
 * // Or with hook:
 * const { show, hide } = useLoadingStore();
 * ```
 */

import { create } from 'zustand';

interface LoadingState {
    /** Whether the loading overlay is currently visible */
    isLoading: boolean;
    /** Optional message to display below the spinner */
    message: string | null;
    /** Internal counter for nested show/hide calls */
    _loadingCount: number;

    /**
     * Show the loading overlay
     * @param message - Optional message to display (e.g., "Đang thêm vào giỏ...")
     */
    show: (message?: string) => void;

    /**
     * Hide the loading overlay
     * Uses reference counting - overlay only hides when all show() calls are matched with hide()
     */
    hide: () => void;

    /**
     * Force hide the loading overlay regardless of count
     * Use sparingly - mainly for error recovery scenarios
     */
    forceHide: () => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
    isLoading: false,
    message: null,
    _loadingCount: 0,

    show: (message?: string) => {
        const currentCount = get()._loadingCount;
        set({
            isLoading: true,
            message: message ?? null,
            _loadingCount: currentCount + 1,
        });
    },

    hide: () => {
        const currentCount = get()._loadingCount;
        const newCount = Math.max(0, currentCount - 1);

        set({
            _loadingCount: newCount,
            // Only hide if count reaches 0
            isLoading: newCount > 0,
            message: newCount > 0 ? get().message : null,
        });
    },

    forceHide: () => {
        set({
            isLoading: false,
            message: null,
            _loadingCount: 0,
        });
    },
}));

/**
 * Selector hook for isLoading state only
 * Optimized to prevent unnecessary re-renders
 */
export const useIsGlobalLoading = () => useLoadingStore((s) => s.isLoading);

/**
 * Selector hook for loading message
 */
export const useLoadingMessage = () => useLoadingStore((s) => s.message);

/**
 * Non-hook accessors for use in callbacks/effects
 * These don't cause re-renders and are safe to use anywhere
 */
export const showGlobalLoading = (message?: string) => {
    useLoadingStore.getState().show(message);
};

export const hideGlobalLoading = () => {
    useLoadingStore.getState().hide();
};

export const forceHideGlobalLoading = () => {
    useLoadingStore.getState().forceHide();
};
