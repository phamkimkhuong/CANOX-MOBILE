/**
 * ==============================================
 * SHOP HEADER SKELETON - Loading State
 * ==============================================
 * 
 * Shows shimmer animation while shop detail is loading
 * Matches layout of ShopBanner + ShopHeaderInfo
 */

import { SkeletonBox, SkeletonCircle, SkeletonText } from '@/components/ui/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const BANNER_HEIGHT = 180;
const AVATAR_SIZE = 80;

/**
 * ShopHeaderSkeleton - Loading skeleton for shop header
 */
export const ShopHeaderSkeleton: React.FC = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Banner Skeleton */}
            <SkeletonBox width="100%" height={BANNER_HEIGHT} borderRadius={0} />

            {/* Info Section */}
            <View style={styles.infoContainer}>
                {/* Avatar */}
                <SkeletonCircle size={AVATAR_SIZE} style={styles.avatar} />

                {/* Text Content */}
                <View style={styles.textContainer}>
                    {/* Shop Name */}
                    <SkeletonText width="60%" height={20} />

                    {/* Location */}
                    <SkeletonText width="40%" height={14} style={styles.metaItem} />

                    {/* Join Date */}
                    <SkeletonText width="50%" height={14} style={styles.metaItem} />
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsRow}>
                <SkeletonBox width="48%" height={44} borderRadius={theme.radius.m} />
                <SkeletonBox width="48%" height={44} borderRadius={theme.radius.m} />
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
    },
    infoContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.md,
        marginTop: -AVATAR_SIZE / 2,
    },
    avatar: {
        borderWidth: 3,
        borderColor: theme.colors.surface,
    },
    textContainer: {
        flex: 1,
        marginLeft: theme.margins.smd,
        marginTop: AVATAR_SIZE / 4,
    },
    metaItem: {
        marginTop: theme.margins.sm,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
    },
}));

export default ShopHeaderSkeleton;
