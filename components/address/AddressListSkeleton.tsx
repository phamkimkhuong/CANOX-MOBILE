/**
 * AddressListSkeleton - Loading skeleton for address list
 */

import { SkeletonBox, SkeletonCircle } from '@/components/ui/feedback/Skeleton';
import React, { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const AddressCardSkeleton: React.FC = memo(() => {
    const styles = stylesheet;

    return (
        <View style={styles.card}>
            {/* Icon */}
            <SkeletonCircle size={40} />

            {/* Content */}
            <View style={styles.content}>
                {/* Name & Phone */}
                <View style={styles.nameRow}>
                    <SkeletonBox width={100} height={16} />
                    <SkeletonBox width={90} height={14} />
                </View>

                {/* Address */}
                <SkeletonBox width="100%" height={14} />
                <SkeletonBox width="70%" height={14} />

                {/* Badges */}
                <View style={styles.badgeRow}>
                    <SkeletonBox width={60} height={20} borderRadius={4} />
                    <SkeletonBox width={70} height={20} borderRadius={4} />
                </View>
            </View>
        </View>
    );
});

AddressCardSkeleton.displayName = 'AddressCardSkeleton';

export const AddressListSkeleton: React.FC = memo(() => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <AddressCardSkeleton />
            <AddressCardSkeleton />
            <AddressCardSkeleton />
        </View>
    );
});

AddressListSkeleton.displayName = 'AddressListSkeleton';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        padding: theme.margins.md,
        gap: theme.margins.smd,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        gap: theme.margins.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    content: {
        flex: 1,
        gap: theme.margins.sm,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: theme.margins.sm,
        marginTop: 4,
    },
}));
