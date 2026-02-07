/**
 * CheckoutSkeleton Component
 * 
 * Loading placeholder for the Checkout screen.
 * Mirrors the structure of actual checkout components:
 * - Address Card
 * - Shop Groups (Items + Voucher + Shipping + Note)
 * - Platform Voucher
 * - Payment Method
 * - Bill Summary
 */

import { SkeletonBox, SkeletonCircle, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SkeletonSubProps {
    animatedStyle?: object;
}

/**
 * Skeleton for Address Card section
 */
const SkeletonAddressCard: React.FC<SkeletonSubProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.addressCard}>
            <SkeletonCircle size={32} animatedStyle={animatedStyle} />
            <View style={styles.addressContent}>
                <SkeletonText width="50%" height={14} animatedStyle={animatedStyle} />
                <SkeletonText width="30%" height={12} animatedStyle={animatedStyle} />
                <SkeletonText width="80%" height={12} animatedStyle={animatedStyle} />
            </View>
            <SkeletonBox width={20} height={20} borderRadius={4} animatedStyle={animatedStyle} />
        </View>
    );
};

/**
 * Skeleton for a single checkout item
 */
const SkeletonCheckoutItem: React.FC<SkeletonSubProps> = ({ animatedStyle }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.itemRow}>
            {/* Product Image */}
            <SkeletonBox width={72} height={72} borderRadius={theme.radius.m} animatedStyle={animatedStyle} />

            {/* Product Info */}
            <View style={styles.itemInfo}>
                <SkeletonText width="90%" height={14} animatedStyle={animatedStyle} />
                <SkeletonBox width={100} height={20} borderRadius={4} style={styles.mt4} animatedStyle={animatedStyle} />
                <View style={styles.itemPriceRow}>
                    <SkeletonText width={80} height={14} animatedStyle={animatedStyle} />
                </View>
            </View>
        </View>
    );
};


/**
 * Skeleton for Shop Group section
 */
const SkeletonShopGroup: React.FC<SkeletonSubProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.shopGroup}>
            {/* Shop Header */}
            <View style={styles.shopHeader}>
                <SkeletonBox width={32} height={32} borderRadius={10} animatedStyle={animatedStyle} />
                <SkeletonText width={120} height={15} animatedStyle={animatedStyle} />
                <SkeletonBox width={18} height={18} borderRadius={4} animatedStyle={animatedStyle} />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Items */}
            <View style={styles.itemsContainer}>
                <SkeletonCheckoutItem animatedStyle={animatedStyle} />
                <SkeletonCheckoutItem animatedStyle={animatedStyle} />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Voucher Row */}
            <View style={styles.sectionRow}>
                <SkeletonBox width={36} height={36} borderRadius={10} animatedStyle={animatedStyle} />
                <SkeletonText width={150} height={14} animatedStyle={animatedStyle} />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Shipping Row */}
            <View style={styles.sectionRow}>
                <SkeletonBox width={40} height={40} borderRadius={12} animatedStyle={animatedStyle} />
                <View style={styles.shippingContent}>
                    <SkeletonText width="60%" height={14} animatedStyle={animatedStyle} />
                    <SkeletonText width="40%" height={12} style={styles.mt4} animatedStyle={animatedStyle} />
                </View>
            </View>


            {/* Divider */}
            <View style={styles.divider} />

            {/* Note Row */}
            <View style={styles.sectionRow}>
                <SkeletonBox width={36} height={36} borderRadius={10} animatedStyle={animatedStyle} />
                <SkeletonText width={120} height={14} animatedStyle={animatedStyle} />
            </View>

            {/* Subtotal Row */}
            <View style={styles.subtotalRow}>
                <SkeletonText width={100} height={14} animatedStyle={animatedStyle} />
                <SkeletonText width={80} height={16} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

/**
 * Skeleton for Platform Voucher section
 */
const SkeletonPlatformVoucher: React.FC<SkeletonSubProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <SkeletonBox width={32} height={32} borderRadius={10} animatedStyle={animatedStyle} />
                <SkeletonText width={120} height={15} animatedStyle={animatedStyle} />
            </View>
            <View style={styles.sectionRow}>
                <SkeletonText width={200} height={14} animatedStyle={animatedStyle} />
                <SkeletonBox width={18} height={18} borderRadius={4} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

/**
 * Skeleton for Payment Method section
 */
const SkeletonPaymentMethod: React.FC<SkeletonSubProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <SkeletonBox width={32} height={32} borderRadius={10} animatedStyle={animatedStyle} />
                <SkeletonText width={160} height={15} animatedStyle={animatedStyle} />
            </View>
            <View style={styles.sectionRow}>
                <SkeletonBox width={40} height={40} borderRadius={12} animatedStyle={animatedStyle} />
                <SkeletonText width={180} height={14} animatedStyle={animatedStyle} />
                <SkeletonBox width={18} height={18} borderRadius={4} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

/**
 * Skeleton for Bill Summary section
 */
const SkeletonBillSummary: React.FC<SkeletonSubProps> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <SkeletonBox width={32} height={32} borderRadius={10} animatedStyle={animatedStyle} />
                <SkeletonText width={140} height={15} animatedStyle={animatedStyle} />
            </View>
            <View style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                    <SkeletonText width={120} height={14} animatedStyle={animatedStyle} />
                    <SkeletonText width={80} height={14} animatedStyle={animatedStyle} />
                </View>
                <View style={styles.summaryRow}>
                    <SkeletonText width={140} height={14} animatedStyle={animatedStyle} />
                    <SkeletonText width={60} height={14} animatedStyle={animatedStyle} />
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <SkeletonText width={100} height={16} animatedStyle={animatedStyle} />
                    <SkeletonText width={100} height={20} animatedStyle={animatedStyle} />
                </View>
            </View>
        </View>
    );
};

/**
 * CheckoutSkeleton - Main loading placeholder for Checkout screen
 * 
 * @example
 * if (!isInitialized) return <CheckoutSkeleton />;
 */
export const CheckoutSkeleton: React.FC<{
    animatedStyle?: object;
}> = ({ animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Address Card */}
            <SkeletonAddressCard animatedStyle={animatedStyle} />

            {/* Shop Groups */}
            <SkeletonShopGroup animatedStyle={animatedStyle} />

            {/* Platform Voucher */}
            <SkeletonPlatformVoucher animatedStyle={animatedStyle} />

            {/* Payment Method */}
            <SkeletonPaymentMethod animatedStyle={animatedStyle} />

            {/* Bill Summary */}
            <SkeletonBillSummary animatedStyle={animatedStyle} />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    mt4: {
        marginTop: 4,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    shippingContent: {
        flex: 1,
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
    itemPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
