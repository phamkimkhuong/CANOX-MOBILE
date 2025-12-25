import { useCallback, useRef } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

/**
 * Configuration cho Sticky Tabs
 */
interface StickyTabsConfig {
    /** Tổng chiều cao của phần header phía trên tabs (CategoryRail + FlashSale + FeaturedSection) */
    headerContentHeight: number;
}

/**
 * Return type của hook
 */
interface StickyTabsReturn {
    /** Function xử lý scroll event */
    handleScroll: (offsetY: number) => void;
    /** Animated style cho sticky tabs overlay */
    stickyTabsAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
    /** Trạng thái tabs có đang sticky không */
    isTabsSticky: React.MutableRefObject<boolean>;
}

/**
 * useStickyTabs - Hook quản lý logic Sticky Tabs đơn giản
 * 
 * Cơ chế:
 * - Khi scroll position >= headerContentHeight: Tabs DÍNH (sticky)
 * - Khi scroll position < headerContentHeight: Tabs cuộn bình thường (ẩn overlay)
 */
export const useStickyTabs = (config: StickyTabsConfig): StickyTabsReturn => {
    const { headerContentHeight } = config;

    // Track trạng thái sticky
    const isTabsSticky = useRef(false);

    // Animation: 0 = ẩn, 1 = hiện
    const stickyVisibility = useSharedValue(0);

    /**
     * Xử lý scroll event
     */
    const handleScroll = useCallback((offsetY: number) => {
        const shouldBeSticky = offsetY >= headerContentHeight;

        if (shouldBeSticky && !isTabsSticky.current) {
            // Tabs cần dính → Hiện sticky overlay
            stickyVisibility.value = withTiming(1, { duration: 150 });
            isTabsSticky.current = true;
        } else if (!shouldBeSticky && isTabsSticky.current) {
            // Tabs không cần dính → Ẩn sticky overlay
            stickyVisibility.value = withTiming(0, { duration: 150 });
            isTabsSticky.current = false;
        }
    }, [headerContentHeight]);

    /**
     * Animated style cho sticky tabs overlay
     */
    const stickyTabsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: stickyVisibility.value,
    }));

    return {
        handleScroll,
        stickyTabsAnimatedStyle,
        isTabsSticky,
    };
};

/**
 * Constants cho layout
 */
export const HEADER_LAYOUT = {
    /** Chiều cao ước tính của phần content trước tabs */
    CONTENT_BEFORE_TABS: 500,
    /** Chiều cao của ProductTabs */
    TABS_HEIGHT: 48,
} as const;
