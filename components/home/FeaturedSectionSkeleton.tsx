import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import React, { memo } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Constants matching FeaturedSection styling
const MAIN_BANNER_HEIGHT = 180;

/**
 * Small product card skeleton matching exactly the dimensions of the real one
 */
const SmallCardSkeleton: React.FC<{ cardWidth: number, imageHeight: number }> = ({ cardWidth, imageHeight }) => {
    const styles = stylesheet;

    return (
        <View style={[styles.smallCard, { width: cardWidth }]}>
            {/* Image container matching exactly */}
            <View style={[styles.smallImageContainer, { height: imageHeight }]}>
                <SkeletonBox
                    width="100%"
                    height={undefined}
                    style={styles.imageBlock}
                    borderRadius={0}
                />
            </View>

            <View style={styles.smallCardContent}>
                {/* Title skeleton - 2 lines */}
                <SkeletonBox width="90%" height={12} />
                <SkeletonBox width="60%" height={12} />

                {/* Price skeleton */}
                <View style={styles.smallPriceRow}>
                    <SkeletonBox width="50%" height={14} />
                </View>
            </View>
        </View>
    );
};

SmallCardSkeleton.displayName = 'SmallCardSkeleton';

/**
 * FeaturedSectionSkeleton - Loading placeholder for FeaturedSection
 * Matches exact layout and dimensions to prevent layout shift
 */
export const FeaturedSectionSkeleton: React.FC = memo(() => {
    const styles = stylesheet;
    const { theme } = useUnistyles();
    const { width: screenWidth } = useWindowDimensions();

    // Exactly match width calculation from FeaturedSection.tsx
    const VISIBLE_CARDS = 2.6;
    const horizontalPadding = theme.margins.md * 2;
    const gapBetweenCards = theme.margins.sm;
    const totalGaps = gapBetweenCards * (Math.ceil(VISIBLE_CARDS) - 1);
    const cardWidth = (screenWidth - horizontalPadding - totalGaps) / VISIBLE_CARDS;
    const imageHeight = cardWidth * 0.85;

    return (
        <View style={styles.container}>
            {/* Header skeleton */}
            <View style={styles.headerPadding}>
                <SkeletonBox width={150} height={20} />
            </View>

            {/* Main Banner skeleton */}
            <View style={styles.mainBanner}>
                <SkeletonBox width="100%" height={MAIN_BANNER_HEIGHT} borderRadius={theme.radius.l} />
            </View>

            {/* Small Products scroll skeleton */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={styles.scrollContent}
            >
                {Array.from({ length: Math.ceil(VISIBLE_CARDS) }).map((_, index) => (
                    <SmallCardSkeleton
                        key={`featured-small-skeleton-${index}`}
                        cardWidth={cardWidth}
                        imageHeight={imageHeight}
                    />
                ))}
            </ScrollView>
        </View>
    );
});

FeaturedSectionSkeleton.displayName = 'FeaturedSectionSkeleton';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginTop: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.md,
        borderRadius: 10
    },
    headerPadding: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.md,
    },
    mainBanner: {
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
        height: MAIN_BANNER_HEIGHT,
        borderRadius: theme.radius.l,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
        gap: theme.margins.sm,
    },
    smallCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        // Match shadow exactly
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.04)',
        paddingBottom: 4,
    },
    smallImageContainer: {
        width: '100%',
        backgroundColor: theme.colors.backgroundInput,
    },
    imageBlock: {
        width: '100%',
        height: '100%',
    },
    smallCardContent: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        gap: 6,
    },
    smallPriceRow: {
        marginTop: 4,
    }
}));
