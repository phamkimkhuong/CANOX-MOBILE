/**
 * ==============================================
 * REVIEW LIST SKELETON - Loading State
 * ==============================================
 * Skeleton loader for review lists
 */

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

interface ReviewListSkeletonProps {
    /** Number of skeleton items */
    count?: number;
}

/**
 * Skeleton item for review card
 */
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
    const styles = stylesheet;
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withTiming(0.8, { duration: 800 }),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.card, animatedStyle, { opacity: 1 - index * 0.1 }]}>
            {/* Product row */}
            <View style={styles.productRow}>
                <View style={styles.imageSkeleton} />
                <View style={styles.productInfo}>
                    <View style={styles.nameSkeleton} />
                    <View style={styles.variantSkeleton} />
                </View>
            </View>

            {/* Rating row */}
            <View style={styles.ratingRow}>
                <View style={styles.starsSkeleton} />
                <View style={styles.dateSkeleton} />
            </View>

            {/* Content */}
            <View style={styles.contentSkeleton} />
            <View style={styles.contentSkeletonShort} />
        </Animated.View>
    );
};

/**
 * ReviewListSkeleton - Loading skeleton for lists
 */
export const ReviewListSkeleton: React.FC<ReviewListSkeletonProps> = ({
    count = 3,
}) => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {Array.from({ length: count }, (_, i) => (
                <SkeletonCard key={i} index={i} />
            ))}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        padding: theme.margins.md,
        gap: theme.margins.smd,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        padding: theme.margins.md,
    },
    productRow: {
        flexDirection: 'row',
        gap: theme.margins.smd,
        marginBottom: theme.margins.smd,
    },
    imageSkeleton: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.s,
        backgroundColor: theme.colors.secondaryLight,
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    nameSkeleton: {
        width: '80%',
        height: 14,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    variantSkeleton: {
        width: '50%',
        height: 12,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.margins.smd,
    },
    starsSkeleton: {
        width: 80,
        height: 14,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    dateSkeleton: {
        width: 60,
        height: 12,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    contentSkeleton: {
        width: '100%',
        height: 14,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
        marginBottom: 4,
    },
    contentSkeletonShort: {
        width: '60%',
        height: 14,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
}));

export default ReviewListSkeleton;
