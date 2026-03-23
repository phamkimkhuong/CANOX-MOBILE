import React, { memo, useCallback, useEffect, useRef } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { CategoryRail } from './CategoryRail';
import { FeaturedSection } from './FeaturedSection';
import { FlashSale } from './FlashSale';

/**
 * Props for MarketingHeader component
 */
interface MarketingHeaderProps {
    /**
     * Callback to measure header height
     * Used by parent to know when to trigger scroll on tab change
     */
    onHeightMeasured?: (height: number) => void;
    /**
     * Callback khi user tap vào sản phẩm
     */
    onProductPress?: (
        productId: string,
        action?: 'buy-now' | 'add-to-cart',
        previewImageUrl?: string | null
    ) => void;
}

/**
 * Debounce threshold for layout changes (pixels)
 * Prevents excessive onHeightMeasured calls on small layout shifts
 */
const HEIGHT_CHANGE_THRESHOLD = 10;

/**
 * MarketingHeader
 * 
 * Bao gồm:
 * - CategoryRail
 * - FlashSale
 * - FeaturedSection
 */
export const MarketingHeader = memo(({ onHeightMeasured, onProductPress }: MarketingHeaderProps) => {
    const styles = stylesheet;
    const lastHeight = useRef(0);

    // Shared Animation Pattern: ONE animation loop for ALL skeletons in MarketingHeader
    const shimmerValue = useSharedValue(0.4);
    useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 1000 }),
            -1,
            true
        );
    }, [shimmerValue]);

    const shimmerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: shimmerValue.value,
    }));

    /**
     * Đo chiều cao của Marketing Header
     * Chỉ gọi callback khi height thay đổi đáng kể (> threshold)
     */
    const handleLayout = useCallback((event: LayoutChangeEvent) => {
        const newHeight = event.nativeEvent.layout.height;

        if (Math.abs(newHeight - lastHeight.current) > HEIGHT_CHANGE_THRESHOLD) {
            lastHeight.current = newHeight;
            onHeightMeasured?.(newHeight);
        }
    }, [onHeightMeasured]);

    return (
        <View onLayout={handleLayout}>
            <View style={styles.categoryContainer}>
                <CategoryRail />
            </View>
            <FlashSale onProductPress={onProductPress} shimmerAnimatedStyle={shimmerAnimatedStyle} />
            <FeaturedSection onProductPress={onProductPress} shimmerAnimatedStyle={shimmerAnimatedStyle} />
        </View>
    );
});
// }, () => true);

MarketingHeader.displayName = 'MarketingHeader';

const stylesheet = StyleSheet.create((_theme) => ({
    categoryContainer: {
        // paddingHorizontal: theme.margins.md,
    },
}));
