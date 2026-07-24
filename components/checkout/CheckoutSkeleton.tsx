/**
 * CheckoutSkeleton Component
 * 
 * Mirrors the structure of actual checkout components:
 * - Address Card
 * - Shop Groups (Items + Voucher + Shipping + Note)
 * - Platform Voucher
 * - Payment Method
 * - Bill Summary
 */

import React from 'react';
import { type DimensionValue, View, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CheckoutSkeletonProps {
    /** Shared shimmer animation from parent — REQUIRED for performance */
    animatedStyle?: any;
}

/**
 * Lightweight skeleton block — no internal hooks, just Animated.View + shared style
 * Eliminates useSharedValue + useEffect + useAnimatedStyle overhead per element
 */
const Block: React.FC<{
    w: DimensionValue;
    h: number;
    r?: number;
    style?: ViewStyle;
    animatedStyle?: any;
}> = ({ w, h, r = 4, style, animatedStyle }) => {
    const { theme } = useUnistyles();
    return (
        <Animated.View
            style={[
                { width: w, height: h, borderRadius: r, backgroundColor: theme.colors.secondaryLight },
                animatedStyle,
                style,
            ]}
        />
    );
};

/**
 * Skeleton for Address Card section
 */
const SkeletonAddressCard: React.FC<CheckoutSkeletonProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.addressCard}>
            <Block w={32} h={32} r={16} animatedStyle={animatedStyle} />
            <View style={styles.addressContent}>
                <Block w="50%" h={14} animatedStyle={animatedStyle} />
                <Block w="30%" h={12} animatedStyle={animatedStyle} />
                <Block w="80%" h={12} animatedStyle={animatedStyle} />
            </View>
            <Block w={20} h={20} animatedStyle={animatedStyle} />
        </View>
    );
};

/**
 * Skeleton for a single checkout item — simplified shell
 */
const SkeletonCheckoutItem: React.FC<CheckoutSkeletonProps> = ({ animatedStyle }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.itemRow}>
            <Block w={72} h={72} r={theme.radius.m} animatedStyle={animatedStyle} />
            <View style={styles.itemInfo}>
                <Block w="90%" h={14} animatedStyle={animatedStyle} />
                <Block w={100} h={20} style={styles.mt4} animatedStyle={animatedStyle} />
                <Block w={80} h={14} style={styles.mt6} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

/**
 * Skeleton for Shop Group section
 * Optimized: 1 item instead of 2 (reduces 3 elements)
 */
const SkeletonShopGroup: React.FC<CheckoutSkeletonProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.shopGroup}>
            {/* Shop Header */}
            <View style={styles.shopHeader}>
                <Block w={32} h={32} r={10} animatedStyle={animatedStyle} />
                <Block w={120} h={15} animatedStyle={animatedStyle} />
                <Block w={18} h={18} animatedStyle={animatedStyle} />
            </View>

            <View style={styles.divider} />

            {/* Single representative item (was 2) */}
            <View style={styles.itemsContainer}>
                <SkeletonCheckoutItem animatedStyle={animatedStyle} />
            </View>

            <View style={styles.divider} />

            {/* Voucher Row */}
            <View style={styles.sectionRow}>
                <Block w={36} h={36} r={10} animatedStyle={animatedStyle} />
                <Block w={150} h={14} animatedStyle={animatedStyle} />
            </View>

            <View style={styles.divider} />

            {/* Shipping Row — simplified: icon + 1 combined text block */}
            <View style={styles.sectionRow}>
                <Block w={40} h={40} r={12} animatedStyle={animatedStyle} />
                <Block w="60%" h={14} animatedStyle={animatedStyle} />
            </View>

            <View style={styles.divider} />

            {/* Note Row */}
            <View style={styles.sectionRow}>
                <Block w={36} h={36} r={10} animatedStyle={animatedStyle} />
                <Block w={120} h={14} animatedStyle={animatedStyle} />
            </View>

            {/* Subtotal Row */}
            <View style={styles.subtotalRow}>
                <Block w={100} h={14} animatedStyle={animatedStyle} />
                <Block w={80} h={16} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

/**
 * Skeleton for Platform Voucher section
 */
const SkeletonPlatformVoucher: React.FC<CheckoutSkeletonProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Block w={32} h={32} r={10} animatedStyle={animatedStyle} />
                <Block w={120} h={15} animatedStyle={animatedStyle} />
            </View>
            <View style={styles.sectionRow}>
                <Block w={200} h={14} animatedStyle={animatedStyle} />
                <Block w={18} h={18} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

/**
 * Skeleton for Payment Method section
 */
const SkeletonPaymentMethod: React.FC<CheckoutSkeletonProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Block w={32} h={32} r={10} animatedStyle={animatedStyle} />
                <Block w={160} h={15} animatedStyle={animatedStyle} />
            </View>
            <View style={styles.sectionRow}>
                <Block w={40} h={40} r={12} animatedStyle={animatedStyle} />
                <Block w={180} h={14} animatedStyle={animatedStyle} />
                <Block w={18} h={18} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

/**
 * Skeleton for Bill Summary section
 * Optimized: 3 summary rows → 2 rows + 1 total (was 3 rows + divider)
 */
const SkeletonBillSummary: React.FC<CheckoutSkeletonProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Block w={32} h={32} r={10} animatedStyle={animatedStyle} />
                <Block w={140} h={15} animatedStyle={animatedStyle} />
            </View>
            <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                    <Block w={120} h={14} animatedStyle={animatedStyle} />
                    <Block w={80} h={14} animatedStyle={animatedStyle} />
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Block w={100} h={16} animatedStyle={animatedStyle} />
                    <Block w={100} h={20} animatedStyle={animatedStyle} />
                </View>
            </View>
        </View>
    );
};

/**
 * CheckoutSkeleton - Main optimized loading placeholder for Checkout screen
 * 
 * @example
 * if (!isInitialized) return <CheckoutSkeleton />;
 */
export const CheckoutSkeleton: React.FC<CheckoutSkeletonProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <SkeletonAddressCard animatedStyle={animatedStyle} />
            <SkeletonShopGroup animatedStyle={animatedStyle} />
            <SkeletonPlatformVoucher animatedStyle={animatedStyle} />
            <SkeletonPaymentMethod animatedStyle={animatedStyle} />
            <SkeletonBillSummary animatedStyle={animatedStyle} />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    // Address Card
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primaryMuted,
        gap: theme.margins.smd,
    },
    addressContent: {
        flex: 1,
        gap: 4,
    },

    // Shop Group
    shopGroup: {
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.sm,
    },
    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.smd,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.md,
    },
    itemsContainer: {
        paddingVertical: theme.margins.sm,
    },
    itemRow: {
        flexDirection: 'row',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.md,
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    mt4: {
        marginTop: 4,
    },
    mt6: {
        marginTop: 6,
    },
    sectionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },
    subtotalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        gap: theme.margins.sm,
    },

    // Generic Section
    section: {
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.sm,
        gap: theme.margins.sm,
    },

    // Bill Summary
    summaryContent: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.margins.sm,
    },
}));

export default CheckoutSkeleton;
