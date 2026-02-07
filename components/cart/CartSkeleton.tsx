import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

const SHIMMER_DURATION = 1000;

/**
 * Simplified Cart Item Block
 * Focuses on major shapes (Image + Text Block) to reduce component count
 */
const SkeletonCartItem: React.FC<{ animatedStyle: object }> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.itemContainer}>
            {/* Image Block */}
            <Animated.View style={[styles.imageBlock, animatedStyle]} />

            {/* Content Blocks */}
            <View style={styles.textStack}>
                <Animated.View style={[styles.line, styles.w90p, animatedStyle]} />
                <Animated.View style={[styles.line, styles.w60p, animatedStyle]} />
                <View style={styles.spacer} />
                <Animated.View style={[styles.line, styles.w40p, animatedStyle]} />
            </View>
        </View>
    );
};

/**
 * Simplified Shop Group Block
 */
const SkeletonShopGroup: React.FC<{ animatedStyle: object }> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.shopContainer}>
            {/* Shop Header: Simplified to Icon + Title block */}
            <View style={styles.shopHeader}>
                <Animated.View style={[styles.iconCircle, animatedStyle]} />
                <Animated.View style={[styles.line, styles.w40p, animatedStyle]} />
            </View>

            {/* Items: Only 2 items to represent the list */}
            <SkeletonCartItem animatedStyle={animatedStyle} />
            <SkeletonCartItem animatedStyle={animatedStyle} />

            {/* Bottom Row: Combined into one long line */}
            <View style={styles.voucherRow}>
                <Animated.View style={[styles.line, styles.w70p, animatedStyle]} />
            </View>
        </View>
    );
};

/**
 * CartSkeleton - Optimized Shell for performance
 * Uses direct Animated.Views and fewer nested components
 */
export const CartSkeleton: React.FC = () => {
    const styles = stylesheet;
    const opacity = useSharedValue(0.4);

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
        <View style={styles.container}>
            <View style={styles.listContent}>
                <SkeletonShopGroup animatedStyle={animatedStyle} />
                <SkeletonShopGroup animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: theme.margins.smd,
    },
    listContent: {
        paddingHorizontal: theme.margins.smd,
    },
    shopContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        marginBottom: theme.margins.smd,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        gap: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    itemContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.md,
        gap: theme.margins.smd,
    },
    imageBlock: {
        width: 80,
        height: 80,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.border,
    },
    iconCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.border,
    },
    textStack: {
        flex: 1,
        gap: 8,
        justifyContent: 'center',
    },
    line: {
        height: 12,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
    },
    spacer: {
        height: 4,
    },
    w90p: { width: '90%' },
    w70p: { width: '70%' },
    w60p: { width: '60%' },
    w40p: { width: '40%' },
    voucherRow: {
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.backgroundSurface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
}));
