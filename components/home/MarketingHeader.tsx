import React, { memo, useCallback, useRef } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
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
    onProductPress?: (productId: string) => void;
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
            <FlashSale onProductPress={onProductPress} />
            <FeaturedSection onProductPress={onProductPress} />
        </View>
    );
});
// }, () => true);

MarketingHeader.displayName = 'MarketingHeader';

const stylesheet = StyleSheet.create((theme) => ({
    categoryContainer: {
        paddingHorizontal: theme.margins.md,
    },
}));
