/**
 * ==============================================
 * SHOP VOUCHER SKELETON - Loading Placeholder
 * ==============================================
 * 
 * Skeleton loading state for ShopVoucherCard
 * Matches the exact dimensions of the actual card
 */

import React, { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { CARD_HEIGHT, getVoucherWidth } from './ShopVoucherCard';

/**
 * ShopVoucherSkeleton Component
 * Animated loading placeholder for voucher cards
 */
export const ShopVoucherSkeleton = memo(() => {
    const { theme } = useUnistyles();
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 800 }),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[styles.container, { width: getVoucherWidth() }]}>
            {/* Left Section Skeleton */}
            <Animated.View style={[styles.leftSection, animatedStyle]} />

            {/* Right Section Skeleton */}
            <View style={styles.rightSection}>
                <Animated.View style={[styles.codeSkeleton, animatedStyle]} />
                <Animated.View style={[styles.minOrderSkeleton, animatedStyle]} />
                <View style={styles.bottomRow}>
                    <Animated.View style={[styles.expirySkeleton, animatedStyle]} />
                    <Animated.View style={[styles.buttonSkeleton, animatedStyle]} />
                </View>
            </View>
        </View>
    );
});

ShopVoucherSkeleton.displayName = 'ShopVoucherSkeleton';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        height: CARD_HEIGHT,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        ...theme.shadows.small,
    },

    leftSection: {
        width: 80,
        backgroundColor: theme.colors.secondarySoft,
    },

    rightSection: {
        flex: 1,
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.smd,
        justifyContent: 'space-between',
    },

    codeSkeleton: {
        width: '70%',
        height: 14,
        backgroundColor: theme.colors.secondarySoft,
        borderRadius: theme.radius.s,
    },

    minOrderSkeleton: {
        width: '50%',
        height: 12,
        backgroundColor: theme.colors.secondarySoft,
        borderRadius: theme.radius.s,
        marginTop: 4,
    },

    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },

    expirySkeleton: {
        width: 60,
        height: 10,
        backgroundColor: theme.colors.secondarySoft,
        borderRadius: theme.radius.s,
    },

    buttonSkeleton: {
        width: 40,
        height: 20,
        backgroundColor: theme.colors.secondarySoft,
        borderRadius: theme.radius.s,
    },
}));

export default ShopVoucherSkeleton;
