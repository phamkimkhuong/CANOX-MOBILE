/**
 * ==============================================
 * ORDER CARD SKELETON - Loading Placeholder
 * ==============================================
 * Hiển thị khi đang load danh sách đơn hàng.
 */

import React, { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

const SHIMMER_DURATION = 800;

/**
 * Single order card skeleton — zero hook overhead
 */
const SkeletonCard: React.FC<{ animatedStyle: object }> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.card}>
            {/* Header: Shop icon + name */}
            <View style={styles.header}>
                <Animated.View style={[styles.iconCircle, animatedStyle]} />
                <Animated.View style={[styles.line, styles.headerName, animatedStyle]} />
            </View>

            {/* Product: Image + text */}
            <View style={styles.productRow}>
                <Animated.View style={[styles.productImage, animatedStyle]} />
                <View style={styles.productText}>
                    <Animated.View style={[styles.line, styles.w100, animatedStyle]} />
                    <Animated.View style={[styles.line, styles.w60, animatedStyle]} />
                </View>
            </View>

            {/* Summary: price total */}
            <View style={styles.summary}>
                <Animated.View style={[styles.line, styles.summaryLabel, animatedStyle]} />
                <Animated.View style={[styles.line, styles.summaryPrice, animatedStyle]} />
            </View>
        </View>
    );
};

/**
 * Exported for backward compat — single card with optional shared animation
 */
export const OrderCardSkeleton = memo<{ animatedStyle?: object }>(({ animatedStyle }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        if (animatedStyle) return;
        opacity.value = withRepeat(
            withTiming(1, { duration: SHIMMER_DURATION }),
            -1,
            true
        );
    }, [animatedStyle, opacity]);

    const internalStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return <SkeletonCard animatedStyle={animatedStyle ?? internalStyle} />;
});

OrderCardSkeleton.displayName = 'OrderCardSkeleton';

/**
 * Multiple Skeletons for list
 */
export const OrderListSkeleton = memo<{ count?: number }>(({ count = 3 }) => {
    const styles = stylesheet;

    // Single shared animation for ALL elements
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: SHIMMER_DURATION }),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={styles.listContainer}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} animatedStyle={animatedStyle} />
            ))}
        </View>
    );
});

OrderListSkeleton.displayName = 'OrderListSkeleton';

const stylesheet = StyleSheet.create((theme) => ({
    // ============ List ============
    listContainer: {
        paddingTop: theme.margins.md,
    },

    // ============ Card ============
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
        overflow: 'hidden',
    },

    // ============ Header ============
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.secondaryLight,
    },
    headerName: {
        width: 100,
    },

    // ============ Product ============
    productRow: {
        flexDirection: 'row',
        padding: theme.margins.md,
        gap: theme.margins.smd,
    },
    productImage: {
        width: 72,
        height: 72,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.secondaryLight,
    },
    productText: {
        flex: 1,
        gap: 8,
        justifyContent: 'center',
    },

    // ============ Summary ============
    summary: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    summaryLabel: {
        width: 80,
    },
    summaryPrice: {
        width: 100,
        height: 16,
    },

    // ============ Shared ============
    line: {
        height: 12,
        backgroundColor: theme.colors.secondaryLight,
        borderRadius: 4,
    },
    w100: { width: '90%' },
    w60: { width: '55%' },
}));
