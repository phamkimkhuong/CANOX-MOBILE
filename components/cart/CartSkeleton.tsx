import { SkeletonBox, SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * Single cart item skeleton 
 * Mirrors the layout of CartItem component
 */
const SkeletonCartItem: React.FC<{ isLast?: boolean }> = ({ isLast }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.itemWrapper}>
            <View style={styles.itemContainer}>
                {/* Checkbox skeleton */}
                <View style={styles.checkboxColumn}>
                    <SkeletonBox width={20} height={20} borderRadius={4} />
                </View>

                {/* Content Row */}
                <View style={styles.contentRow}>
                    {/* Image skeleton */}
                    <SkeletonBox width={96} height={96} borderRadius={theme.radius.m} />

                    {/* Info Column */}
                    <View style={styles.infoColumn}>
                        {/* Product Name skeleton */}
                        <SkeletonText width="90%" height={16} />
                        <SkeletonText width="60%" height={16} />

                        {/* Variant Selector skeleton */}
                        <SkeletonBox width={100} height={24} borderRadius={4} style={{ marginTop: 8 }} />

                        {/* Bottom Row: Price & Quantity */}
                        <View style={styles.bottomRow}>
                            <View style={styles.priceContainer}>
                                <SkeletonText width={60} height={12} />
                                <SkeletonText width={80} height={18} />
                            </View>
                            <SkeletonBox width={100} height={32} borderRadius={theme.radius.m} />
                        </View>
                    </View>
                </View>
            </View>
            {!isLast && <View style={styles.divider} />}
        </View>
    );
};

/**
 * Shop group skeleton
 * Mirrors the layout of CartShopGroup component
 */
const SkeletonShopGroup: React.FC = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.shopContainer}>
            {/* Shop Header skeleton */}
            <View style={styles.shopHeader}>
                <SkeletonBox width={20} height={20} borderRadius={4} />
                <SkeletonCircle size={20} />
                <SkeletonText width={120} height={16} />
            </View>

            {/* Items list skeleton */}
            <View>
                <SkeletonCartItem />
                <SkeletonCartItem isLast />
            </View>

            {/* Voucher Row skeleton */}
            <View style={styles.voucherRow}>
                <SkeletonText width={150} height={14} />
                <SkeletonText width={80} height={14} />
            </View>
        </View>
    );
};

/**
 * CartSkeleton - Loading placeholder for the Cart screen
 * 
 * @example
 * if (isLoading) return <CartSkeleton />;
 */
export const CartSkeleton: React.FC = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Address Bar skeleton */}
            <View style={styles.addressBarSkeleton}>
                <SkeletonCircle size={32} />
                <View style={{ flex: 1, gap: 4 }}>
                    <SkeletonText width="40%" height={14} />
                    <SkeletonText width="80%" height={12} />
                </View>
            </View>

            {/* Shop Groups skeletons */}
            <View style={styles.listContent}>
                <SkeletonShopGroup />
                <SkeletonShopGroup />
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    addressBarSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.primaryMuted,
        gap: theme.margins.smd,
        marginBottom: theme.margins.smd,
    },
    listContent: {
        paddingHorizontal: theme.margins.smd,
        gap: theme.margins.smd,
    },
    shopContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
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
    itemWrapper: {
        // Wrapper for item + divider
    },
    itemContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.md,
        gap: theme.margins.smd,
    },
    checkboxColumn: {
        justifyContent: 'flex-start',
        paddingTop: 32,
    },
    contentRow: {
        flex: 1,
        flexDirection: 'row',
        gap: theme.margins.smd,
    },
    infoColumn: {
        flex: 1,
        gap: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 8,
    },
    priceContainer: {
        gap: 2,
    },
    voucherRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.smd,
        backgroundColor: theme.colors.backgroundSurface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.smd,
    },
}));
