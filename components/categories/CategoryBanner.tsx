/**
 * ==============================================
 * CATEGORY BANNER COMPONENT
 * ==============================================
 *
 * Banner component cho Category Page.
 * Hiển thị banner quảng cáo được target theo categoryId.
 *
 * Features:
 * - Auto-hide khi không có banner
 * - Loading skeleton
 * - Click tracking
 * - Smooth image loading với expo-image
 *
 * @example
 * <CategoryBanner categoryId="cat-123" />
 */

import { useCategoryBanner } from '@/hooks/api/useCategoryBanner';
import type { BannerUI } from '@/types/banner';
import { Navigator } from '@/utils/navigation';
import { Image } from 'expo-image';
import React, { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

interface CategoryBannerProps {
    /** Category ID để fetch banner targeted */
    categoryId: string | null | undefined;
    /** Callback khi banner được click */
    onPress?: (banner: BannerUI) => void;
    /** Custom aspect ratio (default: 3/1 cho wide banner) */
    aspectRatio?: number;
    /** Margin horizontal */
    marginHorizontal?: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const CategoryBanner = memo(({
    categoryId,
    onPress,
    aspectRatio = 3 / 1,
    marginHorizontal = 0,
}: CategoryBannerProps) => {
    const styles = stylesheet;
    const { primaryBanner, isLoading } = useCategoryBanner(categoryId);

    // Handle banner click
    const handlePress = useCallback(() => {
        if (!primaryBanner) return;

        // Custom handler if provided
        if (onPress) {
            onPress(primaryBanner);
            return;
        }

        // Default: Navigate to href if available
        if (primaryBanner.href) {
            // Handle deep links or URLs
            if (primaryBanner.href.startsWith('http')) {
                // External URL - could open in WebView or browser
                console.log('[Banner] External URL:', primaryBanner.href);
            } else {
                // Internal route
                Navigator.push(primaryBanner.href as any);
            }
        }

        // Track click event
        if (primaryBanner.trackingId) {
            // TODO: Send analytics event
            console.log('[Banner] Click tracked:', primaryBanner.trackingId);
        }
    }, [primaryBanner, onPress]);

    // Loading state - show skeleton
    if (isLoading) {
        return (
            <View
                style={[
                    styles.container,
                    { aspectRatio, marginHorizontal },
                ]}
            >
                <View style={styles.skeleton} />
            </View>
        );
    }

    // No banner - hide completely (Empty State)
    if (!primaryBanner || !primaryBanner.imageUrl) {
        return null;
    }

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={[styles.container, { marginHorizontal }]}
        >
            <Pressable
                onPress={handlePress}
                style={({ pressed }) => [
                    styles.pressable,
                    { aspectRatio },
                    pressed && styles.pressed,
                ]}
            >
                <Image
                    source={{ uri: primaryBanner.imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                />
            </Pressable>
        </Animated.View>
    );
});

CategoryBanner.displayName = 'CategoryBanner';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    pressable: {
        width: '100%',
        borderRadius: theme.radius.m,
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    image: {
        width: '100%',
        height: '100%',
    },
    skeleton: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
    },
}));

export default CategoryBanner;
