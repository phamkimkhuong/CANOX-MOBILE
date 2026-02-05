/**
 * ==============================================
 * ORDER CARD SKELETON - Loading Placeholder
 * ==============================================
 * Hiển thị khi đang load danh sách đơn hàng
 */

import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const OrderCardSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Header Skeleton */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <SkeletonBox width={28} height={28} borderRadius={8} />
                    <SkeletonBox width={100} height={14} />
                </View>
                <SkeletonBox width={80} height={24} borderRadius={8} />
            </View>

            {/* Product Skeleton */}
            <View style={styles.productRow}>
                <SkeletonBox width={72} height={72} borderRadius={8} />
                <View style={styles.productInfo}>
                    <SkeletonBox width="100%" height={14} />
                    <SkeletonBox width="60%" height={12} style={styles.mt6} />
                    <View style={styles.priceRow}>
                        <SkeletonBox width={80} height={14} />
                        <SkeletonBox width={24} height={12} />
                    </View>
                </View>
            </View>


            {/* Summary Skeleton */}
            <View style={styles.summary}>
                <SkeletonBox width={100} height={12} />
                <SkeletonBox width={120} height={16} />
            </View>

            {/* Actions Skeleton */}
            <View style={styles.actions}>
                <SkeletonBox width={100} height={36} borderRadius={8} />
                <SkeletonBox width={100} height={36} borderRadius={8} />
            </View>
        </View>
    );
};

/**
 * Multiple Skeletons for list
 */
export const OrderListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
    const styles = stylesheet;
    return (
        <View style={styles.listContainer}>
            {Array.from({ length: count }).map((_, index) => (
                <OrderCardSkeleton key={index} />
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    mt6: {
        marginTop: 6,
    },
    listContainer: {
        paddingTop: 16,
    },
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    productRow: {
        flexDirection: 'row',
        padding: theme.margins.md,
        gap: theme.margins.smd,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
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
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
}));
