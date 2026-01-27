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
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface IncentiveBannerProps {
    /** Number of photos added */
    photoCount: number;
    /** Whether video is added */
    hasVideo: boolean;
}

/**
 * CoinIcon - Vibrant coin icon with custom coloring
 */
const CoinIcon: React.FC<{ active: boolean }> = ({ active }) => {
    return (
        <View style={[innerStyles.coinWrapper, active && innerStyles.coinWrapperActive]}>
            <IconSymbol
                name="coin"
                size={22}
                color={active ? '#FFD700' : '#BDBDBD'}
            />
        </View>
    );
};

// Internal styles for sub-components
const innerStyles = StyleSheet.create((theme) => ({
    coinWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FDE68A',
    },
    coinWrapperActive: {
        backgroundColor: '#DCFCE7',
        borderColor: '#BBF7D0',
    },
}));

/**
 * IncentiveBanner - Shows estimated reward for review with modern UI
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
            {/* Left Content: Icon & Main Message */}
            <View style={styles.mainContent}>
                <CoinIcon active={isMaxReward} />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        {isMaxReward
                            ? 'Tuyệt vời! Bạn nhận được tối đa xu'
                            : `Viết đánh giá để nhận đến ${maxReward} ${rewardLabel}`}
                    </Text>
                    <Text style={styles.rewardText}>
                        Tổng cộng: <Text style={styles.highlightText}>{estimatedReward} {rewardLabel}</Text>
                    </Text>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Bottom Content: Interactive Progress Chips */}
            <View style={styles.progressRow}>
                {/* Base reward */}
                <View style={[styles.progressChip, hasBaseReward && styles.progressChipActive]}>
                    <IconSymbol
                        name={hasBaseReward ? "checkmark-circle-fill" : "circle"}
                        size={14}
                        color={hasBaseReward ? theme.colors.success : theme.colors.secondary}
                    />
                    <Text style={[styles.progressText, hasBaseReward && styles.progressTextActive]}>
                        +{REVIEW_INCENTIVE.baseReward} {rewardLabel}
                    </Text>
                </View>

                {/* Photo bonus */}
                <View style={[styles.progressChip, hasPhotoBonus && styles.progressChipActive]}>
                    <IconSymbol
                        name={hasPhotoBonus ? "checkmark-circle-fill" : "camera-fill"}
                        size={14}
                        color={hasPhotoBonus ? theme.colors.success : theme.colors.secondary}
                    />
                    <Text style={[styles.progressText, hasPhotoBonus && styles.progressTextActive]}>
                        +{REVIEW_INCENTIVE.bonusWithPhoto} Có ảnh
                    </Text>
                </View>

                {/* Video bonus */}
                <View style={[styles.progressChip, hasVideoBonus && styles.progressChipActive]}>
                    <IconSymbol
                        name={hasVideoBonus ? "checkmark-circle-fill" : "videocam-fill"}
                        size={14}
                        color={hasVideoBonus ? theme.colors.success : theme.colors.secondary}
                    />
                    <Text style={[styles.progressText, hasVideoBonus && styles.progressTextActive]}>
                        +{REVIEW_INCENTIVE.bonusWithVideo} Có video
                    </Text>
                </View>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: '#FFFBEB', // Light warm yellow
        borderRadius: theme.radius.l,
        padding: theme.margins.md,
        borderWidth: 1,
        borderColor: '#FEF3C7',
        // Subtle shadow
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    containerMax: {
        backgroundColor: '#F0FDF4', // Light green
        borderColor: '#DCFCE7',
        shadowColor: '#10B981',
    },
    mainContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
    },
    coinWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FDE68A',
    },
    coinWrapperActive: {
        backgroundColor: '#DCFCE7',
        borderColor: '#BBF7D0',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#92400E', // Darker warm brown/orange
        marginBottom: 2,
    },
    rewardText: {
        fontSize: 12,
        color: '#B45309',
    },
    highlightText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#D97706', // Bright orange/gold
    },
    divider: {
        height: 1,
        backgroundColor: '#FDE68A',
        marginVertical: theme.margins.md,
        opacity: 0.5,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.sm,
    },
    progressChip: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    progressChipActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#BBF7D0',
    },
    progressText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
    },
    progressTextActive: {
        color: theme.colors.success,
    },
}));

export default IncentiveBanner;
