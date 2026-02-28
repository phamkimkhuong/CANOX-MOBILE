import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import React, { memo } from 'react';
import { type StyleProp, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Constants matching FeaturedSection styling
const MAIN_BANNER_HEIGHT = 180;

/**
 * Small product card skeleton — simplified shell
 */
const SmallCardSkeleton: React.FC<{
    cardWidth: number;
    imageHeight: number;
    animatedStyle?: StyleProp<ViewStyle>;
}> = ({ cardWidth, imageHeight, animatedStyle }) => {
    const styles = stylesheet;

    return (
        <View style={[styles.smallCard, { width: cardWidth }]}>
            {/* Image block */}
            <View style={[styles.smallImageContainer, { height: imageHeight }]}>
                <SkeletonBox
                    width="100%"
                    height={undefined}
                    style={styles.imageBlock}
                    borderRadius={0}
                    animatedStyle={animatedStyle}
                />
            </View>

            {/* Content — simplified: 1 title block + 1 price block */}
            <View style={styles.smallCardContent}>
                <SkeletonBox width="85%" height={12} animatedStyle={animatedStyle} />
                <SkeletonBox width="50%" height={14} animatedStyle={animatedStyle} />
            </View>
        </View>
    );
};

SmallCardSkeleton.displayName = 'SmallCardSkeleton';

interface FeaturedSectionSkeletonProps {
    /** Shared shimmer animation from parent — prevents multiple animation loops */
    animatedStyle?: StyleProp<ViewStyle>;
}

/**
 * FeaturedSectionSkeleton - Optimized shell-based loading placeholder
 */
export const FeaturedSectionSkeleton: React.FC<FeaturedSectionSkeletonProps> = memo(({ animatedStyle }) => {
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
                <SkeletonBox width={150} height={20} animatedStyle={animatedStyle} />
            </View>

            {/* Main Banner skeleton */}
            <View style={styles.mainBanner}>
                <SkeletonBox width="100%" height={MAIN_BANNER_HEIGHT} borderRadius={theme.radius.l} animatedStyle={animatedStyle} />
            </View>

            {/* Small Products — static View row instead of ScrollView */}
            <View style={styles.scrollContent}>
                {Array.from({ length: Math.ceil(VISIBLE_CARDS) }).map((_, index) => (
                    <SmallCardSkeleton
                        key={`feat-sk-${index}`}
                        cardWidth={cardWidth}
                        imageHeight={imageHeight}
                        animatedStyle={animatedStyle}
                    />
                ))}
            </View>
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
        flexDirection: 'row',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
        gap: theme.margins.sm,
        overflow: 'hidden',
    },
    smallCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
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
}));
