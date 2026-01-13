/**
 * ==============================================
 * WISHLIST SKELETON - Loading States
 * ==============================================
 * Shimmer loading placeholders for wishlist screens
 */

import { SkeletonBox, SkeletonCircle, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/**
 * Skeleton for WishlistCard
 */
export const WishlistCardSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.cardContainer}>
            <SkeletonBox width={64} height={64} borderRadius={8} />
            <View style={styles.cardContent}>
                <SkeletonText width="70%" height={16} />
                <SkeletonText width="50%" height={12} style={{ marginTop: 4 }} />
                <View style={styles.cardFooter}>
                    <SkeletonText width={80} height={12} />
                </View>
            </View>
            <SkeletonBox width={20} height={20} borderRadius={4} />
        </View>
    );
};

/**
 * Skeleton for WishlistItemCard
 */
export const WishlistItemSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.itemContainer}>
            <SkeletonBox width={80} height={80} borderRadius={8} />
            <View style={styles.itemContent}>
                <SkeletonText width="90%" height={14} />
                <SkeletonText width="60%" height={12} style={{ marginTop: 4 }} />
                <SkeletonText width={100} height={16} style={{ marginTop: 8 }} />
            </View>
            <View style={styles.itemActions}>
                <SkeletonCircle size={32} />
                <SkeletonCircle size={32} />
                <SkeletonCircle size={32} />
            </View>
        </View>
    );
};

/**
 * Skeleton list for my wishlists tab
 */
export const WishlistListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
    return (
        <View style={stylesheet.listContainer}>
            {Array.from({ length: count }).map((_, index) => (
                <WishlistCardSkeleton key={index} />
            ))}
        </View>
    );
};

/**
 * Skeleton list for wishlist items
 */
export const WishlistItemListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
    return (
        <View style={stylesheet.listContainer}>
            {Array.from({ length: count }).map((_, index) => (
                <WishlistItemSkeleton key={index} />
            ))}
        </View>
    );
};

/**
 * Skeleton for discover section (horizontal cards)
 */
export const DiscoverSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.discoverContainer}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
                <SkeletonText width={120} height={18} />
            </View>

            {/* Horizontal Cards */}
            <View style={styles.horizontalList}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <View key={index} style={styles.discoverCard}>
                        <SkeletonBox width={140} height={100} borderRadius={8} />
                        <SkeletonText width={120} height={14} style={{ marginTop: 8 }} />
                        <SkeletonText width={80} height={12} style={{ marginTop: 4 }} />
                    </View>
                ))}
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    listContainer: {
        paddingTop: theme.margins.sm,
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        borderRadius: theme.radius.l,
    },
    cardContent: {
        flex: 1,
        marginLeft: theme.margins.smd,
    },
    cardFooter: {
        marginTop: theme.margins.sm,
    },
    itemContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: theme.margins.smd,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        borderRadius: theme.radius.l,
    },
    itemContent: {
        flex: 1,
        marginLeft: theme.margins.smd,
        justifyContent: 'center',
    },
    itemActions: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.margins.sm,
        paddingLeft: theme.margins.sm,
    },
    discoverContainer: {
        marginTop: theme.margins.md,
    },
    sectionHeader: {
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
    },
    horizontalList: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.md,
    },
    discoverCard: {
        width: 140,
    },
}));
