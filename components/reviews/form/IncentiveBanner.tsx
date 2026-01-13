/**
 * ==============================================
 * INCENTIVE BANNER - Gamification Banner
 * ==============================================
 * Shows reward info to encourage reviews with media
 */

import { IconSymbol } from '@/components/ui/Icon';
import {
    calculateEstimatedReviewReward as calculateEstimatedReward,
    getMaxReviewReward as getMaxReward,
    getReviewRewardTypeLabel as getRewardTypeLabel,
} from '@/utils/adapter/review/reviewAdapter';
import { REVIEW_INCENTIVE } from '@/utils/adapter/review/reviewIncentives';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface IncentiveBannerProps {
    /** Number of photos added */
    photoCount: number;
    /** Whether video is added */
    hasVideo: boolean;
}

/**
 * AnimatedCoin - Coin icon with pulse animation
 */
const AnimatedCoin: React.FC<{ active: boolean }> = ({ active }) => {
    const { theme } = useUnistyles();
    const scale = useSharedValue(1);

    React.useEffect(() => {
        if (active) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 300 }),
                    withTiming(1, { duration: 300 })
                ),
                3, // Repeat 3 times
                false
            );
        }
    }, [active, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <IconSymbol
                name="coin"
                size={20}
                color={active ? theme.colors.warning : theme.colors.secondary}
            />
        </Animated.View>
    );
};

/**
 * IncentiveBanner - Shows estimated reward for review
 */
export const IncentiveBanner: React.FC<IncentiveBannerProps> = ({
    photoCount,
    hasVideo,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const hasPhotos = photoCount > 0;
    const maxReward = getMaxReward();
    const rewardLabel = getRewardTypeLabel();

    // Calculate current estimated reward
    const estimatedReward = useMemo(() => {
        return calculateEstimatedReward(hasPhotos, hasVideo);
    }, [hasPhotos, hasVideo]);

    // Check if max reward is achieved
    const isMaxReward = hasPhotos && hasVideo;

    // Progress indicators
    const hasBaseReward = true; // Always have base reward for text review
    const hasPhotoBonus = hasPhotos;
    const hasVideoBonus = hasVideo;

    return (
        <View style={[styles.container, isMaxReward && styles.containerMax]}>
            {/* Icon & Title */}
            <View style={styles.header}>
                <AnimatedCoin active={isMaxReward} />
                <Text style={[styles.title, isMaxReward && styles.titleMax]}>
                    {isMaxReward
                        ? `Tuyệt vời! Nhận ${estimatedReward} ${rewardLabel}`
                        : `Nhận đến ${maxReward} ${rewardLabel}`}
                </Text>
            </View>

            {/* Progress indicators */}
            <View style={styles.progressRow}>
                {/* Base reward */}
                <View style={styles.progressItem}>
                    <View
                        style={[
                            styles.progressDot,
                            hasBaseReward && styles.progressDotActive,
                        ]}
                    >
                        <IconSymbol name="checkmark" size={10} color="#fff" />
                    </View>
                    <Text style={styles.progressText}>
                        +{REVIEW_INCENTIVE.baseReward} Nhận xét
                    </Text>
                </View>

                {/* Photo bonus */}
                <View style={styles.progressItem}>
                    <View
                        style={[
                            styles.progressDot,
                            hasPhotoBonus && styles.progressDotActive,
                        ]}
                    >
                        {hasPhotoBonus ? (
                            <IconSymbol name="checkmark" size={10} color="#fff" />
                        ) : (
                            <IconSymbol name="camera" size={10} color={theme.colors.secondary} />
                        )}
                    </View>
                    <Text
                        style={[
                            styles.progressText,
                            !hasPhotoBonus && styles.progressTextInactive,
                        ]}
                    >
                        +{REVIEW_INCENTIVE.bonusWithPhoto} Có ảnh
                    </Text>
                </View>

                {/* Video bonus */}
                <View style={styles.progressItem}>
                    <View
                        style={[
                            styles.progressDot,
                            hasVideoBonus && styles.progressDotActive,
                        ]}
                    >
                        {hasVideoBonus ? (
                            <IconSymbol name="checkmark" size={10} color="#fff" />
                        ) : (
                            <IconSymbol name="videocam" size={10} color={theme.colors.secondary} />
                        )}
                    </View>
                    <Text
                        style={[
                            styles.progressText,
                            !hasVideoBonus && styles.progressTextInactive,
                        ]}
                    >
                        +{REVIEW_INCENTIVE.bonusWithVideo} Có video
                    </Text>
                </View>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.warningSoft,
        borderRadius: theme.radius.m,
        padding: theme.margins.smd,
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
    },
    containerMax: {
        backgroundColor: theme.colors.successSoft,
        borderColor: theme.colors.successLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: theme.margins.sm,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF5722',
    },
    titleMax: {
        color: theme.colors.success,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
        flexWrap: 'wrap',
    },
    progressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    progressDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: theme.colors.secondaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressDotActive: {
        backgroundColor: theme.colors.success,
    },
    progressText: {
        fontSize: 12,
        color: theme.colors.typography,
    },
    progressTextInactive: {
        color: theme.colors.secondary,
    },
}));

export default IncentiveBanner;
