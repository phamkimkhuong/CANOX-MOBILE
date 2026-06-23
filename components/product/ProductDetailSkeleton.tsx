import React, { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

const SHIMMER_DURATION = 1000;

// ============================================
// LIGHTWEIGHT SKELETON BOX (No internal animation — uses parent's shared style)
// Eliminates 33× redundant useSharedValue + useEffect + useAnimatedStyle allocations
// ============================================
const SkeletonBox: React.FC<{
    width: number | string;
    height: number;
    borderRadius?: number;
    style?: object;
    animatedStyle: object;
}> = ({ width, height, borderRadius = 4, style, animatedStyle }) => {
    const { theme } = useUnistyles();

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.colors.secondaryLight,
                },
                animatedStyle,
                style,
            ]}
        />
    );
};

export const ProductDetailSkeleton: React.FC<{
    animatedStyle?: object;
    hideBottomBar?: boolean;
    hideSafeTop?: boolean;
}> = ({ animatedStyle, hideBottomBar = false, hideSafeTop = false }) => {
    // Reactive screen dimensions - tự động update khi xoay màn hình
    const { width: screenWidth } = useWindowDimensions();
    const galleryHeight = screenWidth; // Gallery là hình vuông

    // Internal shared animation if none provided (Parent should usually provide this)
    const opacity = useSharedValue(0.4);
    useEffect(() => {
        if (animatedStyle) return;
        opacity.value = withRepeat(
            withTiming(1, { duration: SHIMMER_DURATION }),
            -1,
            true
        );
        return () => {
            cancelAnimation(opacity);
        };
    }, [animatedStyle, opacity]);

    const internalAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const finalAnimatedStyle = animatedStyle ?? internalAnimatedStyle;

    return (
        <View style={[styles.container, !hideSafeTop && styles.safeTop]}>
            {/* Gallery Skeleton */}
            <SkeletonBox
                width={screenWidth}
                height={galleryHeight}
                borderRadius={0}
                animatedStyle={finalAnimatedStyle}
            />

            {/* Price Section */}
            <View style={styles.section}>
                <SkeletonBox width={120} height={28} borderRadius={4} animatedStyle={finalAnimatedStyle} />
                <View style={styles.row}>
                    <SkeletonBox width={80} height={16} borderRadius={4} animatedStyle={finalAnimatedStyle} />
                    <SkeletonBox width={60} height={20} borderRadius={4} animatedStyle={finalAnimatedStyle} />
                </View>
                <SkeletonBox width={screenWidth - 32} height={48} borderRadius={8} style={styles.titleSkeleton} animatedStyle={finalAnimatedStyle} />
                <View style={styles.row}>
                    <SkeletonBox width={60} height={16} borderRadius={4} animatedStyle={finalAnimatedStyle} />
                    <SkeletonBox width={80} height={16} borderRadius={4} animatedStyle={finalAnimatedStyle} />
                    <SkeletonBox width={70} height={16} borderRadius={4} animatedStyle={finalAnimatedStyle} />
                </View>
            </View>

            {/* Variant Selector */}
            <View style={styles.variantSection}>
                <SkeletonBox width={60} height={14} borderRadius={4} animatedStyle={finalAnimatedStyle} />
                <SkeletonBox width={100} height={14} borderRadius={4} animatedStyle={finalAnimatedStyle} />
            </View>

            {/* Bottom Bar Skeleton */}
            {!hideBottomBar && (
                <View style={[styles.bottomBar, styles.safeBottom]}>
                    <View style={styles.leftActions}>
                        <SkeletonBox width={40} height={40} borderRadius={8} animatedStyle={finalAnimatedStyle} />
                        <SkeletonBox width={40} height={40} borderRadius={8} animatedStyle={finalAnimatedStyle} />
                    </View>
                    <View style={styles.rightActions}>
                        <SkeletonBox width={110} height={40} borderRadius={8} animatedStyle={finalAnimatedStyle} />
                        <SkeletonBox width={110} height={40} borderRadius={8} animatedStyle={finalAnimatedStyle} />
                    </View>
                </View>
            )}
        </View>
    );
};


const styles = StyleSheet.create((theme) => ({
    safeTop: {
        paddingTop: UnistylesRuntime.insets.top,
    },
    safeBottom: {
        paddingBottom: UnistylesRuntime.insets.bottom + 8,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    section: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        gap: theme.margins.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
    },
    titleSkeleton: {
        marginVertical: theme.margins.sm,
    },
    variantSection: {
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        marginTop: theme.margins.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingTop: 8,
        paddingHorizontal: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    leftActions: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    rightActions: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        marginLeft: theme.margins.smd,
    },
}));

export default ProductDetailSkeleton;
