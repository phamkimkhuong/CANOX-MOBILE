import { SkeletonBox, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface NotificationSkeletonProps {
    count?: number;
}

/**
 * Single notification item skeleton
 * Mirrors the layout of NotificationItem component
 */
const SkeletonItem: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.item}>
            {/* Icon/Avatar skeleton */}
            <SkeletonBox width={56} height={56} borderRadius={12} />

            {/* Text content skeleton */}
            <View style={styles.textContainer}>
                {/* Title skeleton */}
                <SkeletonText width="70%" height={16} />

                {/* Message skeleton (2 lines) */}
                <SkeletonText width="100%" height={36} />

                {/* Time skeleton */}
                <SkeletonText width={60} height={12} />
            </View>
        </View>
    );
};

/**
 * NotificationSkeleton - Loading placeholder for notification list
 * 
 * @example
 * if (isLoading) return <NotificationSkeleton count={6} />;
 */
export const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({ count = 5 }) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Section header skeleton */}
            <View style={styles.sectionSkeleton}>
                <SkeletonText width={80} height={12} />
            </View>

            {/* Items skeleton */}
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={`notification-skeleton-${index}`} />
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
    },
    sectionSkeleton: {
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        backgroundColor: theme.colors.backgroundSurface,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.smd,
    },
    textContainer: {
        flex: 1,
        gap: theme.margins.sm,
    },
}));
