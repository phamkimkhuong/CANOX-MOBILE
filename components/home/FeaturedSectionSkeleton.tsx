import { SkeletonBox, SkeletonText } from '@/components/ui/feedback/Skeleton';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

// Constants matching FeaturedSection dimensions
const MAIN_BANNER_HEIGHT = 180;
const SMALL_CARD_WIDTH = 100;
const SMALL_IMAGE_SIZE = 100;
const SMALL_PRODUCTS_COUNT = 3;

/**
 * Small product card skeleton
 */
const SmallCardSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.smallCard}>
            {/* Image skeleton */}
            <SkeletonBox
                width={SMALL_CARD_WIDTH}
                height={SMALL_IMAGE_SIZE}
                borderRadius={12}
            />
            {/* Title skeleton - 2 lines */}
            <View style={styles.smallInfo}>
                <SkeletonText width="90%" height={12} />
                <SkeletonText width="60%" height={12} />
            </View>
            {/* Price skeleton */}
            <SkeletonText width="50%" height={14} />
        </View>
    );
};

/**
 * FeaturedSectionSkeleton - Loading placeholder for FeaturedSection
 * Matches exact layout and dimensions to prevent layout shift
 * 
 * @example
 * if (isLoading) return <FeaturedSectionSkeleton />;
 */
export const FeaturedSectionSkeleton: React.FC = () => {
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            {/* Header skeleton */}
            <View style={styles.headerPadding}>
                <View style={styles.headerRow}>
                    <SkeletonText width={140} height={16} />
                    <SkeletonText width={60} height={12} />
                </View>
            </View>

            {/* Main Banner skeleton */}
            <View style={styles.mainBanner}>
                <SkeletonBox width="100%" height={MAIN_BANNER_HEIGHT} borderRadius={16} />
            </View>

            {/* Small Products scroll skeleton */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.scrollContent}
            >
                {Array.from({ length: SMALL_PRODUCTS_COUNT }).map((_, index) => (
                    <SmallCardSkeleton key={`featured-small-skeleton-${index}`} />
                ))}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginTop: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        paddingBottom: theme.margins.md,
    },
    headerPadding: {
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mainBanner: {
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 12,
    },
    smallCard: {
        width: SMALL_CARD_WIDTH,
    },
    smallInfo: {
        marginTop: theme.margins.sm,
        gap: 4,
        marginBottom: 4,
    },
}));
