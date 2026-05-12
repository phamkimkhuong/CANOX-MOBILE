import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES, SERVICE_MENU_ROUTES } from '@/constants/routes';
import { mmkvStorage } from '@/store/storage';
import { LoyaltyOverviewUI } from '@/types/loyalty/ui';
import { UserProfile } from '@/types/profile/profile';
import { Navigator } from '@/utils/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface SmartInsightBannerProps {
    userProfile?: UserProfile;
    loyaltyOverview?: LoyaltyOverviewUI;
    pendingReviewsCount?: number;
    isLoading?: boolean;
}

type InsightPriority = 'URGENT_COIN' | 'PROFILE_INCOMPLETE' | 'PENDING_REVIEW' | 'IDLE_COIN' | null;

export const SmartInsightBanner: React.FC<SmartInsightBannerProps> = ({
    userProfile,
    loyaltyOverview,
    pendingReviewsCount,
    isLoading,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('profile');
    const styles = stylesheet;
    const [isDismissed, setIsDismissed] = useState(false);

    // Build Rule Engine to determine which banner needs to be displayed (evaluate priority from high to low)
    const activeInsight = React.useMemo<InsightPriority>(() => {
        if (!userProfile && !loyaltyOverview) return null;

        // Priority 1: Core Application Utility - Missing contact or unverified
        if (userProfile && (!userProfile.phone || !userProfile.isVerified)) {
            return 'PROFILE_INCOMPLETE';
        }

        // Priority 2: Loss Aversion / Urgent - Expiring points under 15 days
        if (loyaltyOverview?.hasUrgentPoints) {
            return 'URGENT_COIN';
        }

        // Priority 3: Engagement/UGC - Pending reviews waiting for user action
        if (pendingReviewsCount !== undefined && pendingReviewsCount > 0) {
            return 'PENDING_REVIEW';
        }

        // Priority 4: Awareness - Have reward points but haven't used them yet
        if (loyaltyOverview?.totalPoints && loyaltyOverview.totalPoints > 0) {
            return 'IDLE_COIN';
        }

        return null; // Nothing to remind
    }, [userProfile, loyaltyOverview, pendingReviewsCount]);

    // Check if already dismissed via persistent storage (MMKV)
    useEffect(() => {
        if (activeInsight) {
            const memoryKey = `dismissed_insight_${activeInsight}`;
            const dismissedUntil = mmkvStorage.getNumber(memoryKey);
            if (dismissedUntil && Date.now() < dismissedUntil) {
                setIsDismissed(true);
            } else {
                setIsDismissed(false);
            }
        }
    }, [activeInsight]);

    if (isLoading || isDismissed || !activeInsight) return null;

    const handleDismiss = () => {
        setIsDismissed(true);
        // Persist to MMKV for 24 hours (24 * 60 * 60 * 1000)
        const memoryKey = `dismissed_insight_${activeInsight}`;
        mmkvStorage.set(memoryKey, Date.now() + 24 * 60 * 60 * 1000);
    };

    // Get UX configuration corresponding to the activated insight
    const getInsightConfig = () => {
        switch (activeInsight) {
            case 'URGENT_COIN':
                return {
                    message: t('smartInsight.urgentCoin.message', { points: loyaltyOverview?.expiringPoints?.toLocaleString() }),
                    icon: 'hourglass-outline',
                    btnText: t('smartInsight.urgentCoin.action'),
                    colors: ['rgba(227, 27, 35, 0.85)', 'rgba(255, 109, 0, 0.85)'] as const,
                    iconColor: theme.colors.onPrimary,
                    action: () => Navigator.push(ROUTES.TABS.HOME), // Suggest user to hunt for goods to buy
                };
            case 'PROFILE_INCOMPLETE':
                return {
                    message: t('smartInsight.profileIncomplete.message'),
                    icon: 'shield-checkmark-outline',
                    btnText: t('smartInsight.profileIncomplete.action'),
                    colors: [theme.colors.warningSoft, theme.colors.warningLight] as const,
                    iconColor: theme.colors.warning,
                    action: () => Navigator.push(ROUTES.USER.EDIT_PROFILE as never),
                };
            case 'PENDING_REVIEW':
                return {
                    message: t('smartInsight.pendingReview.message'),
                    icon: 'star-half-outline',
                    btnText: t('smartInsight.pendingReview.action'),
                    colors: [theme.colors.infoSoft, theme.colors.infoLight] as const,
                    iconColor: theme.colors.primary,
                    action: () => Navigator.push(ROUTES.USER.REVIEWS as never),
                };
            case 'IDLE_COIN':
                return {
                    message: t('smartInsight.idleCoin.message', { points: loyaltyOverview?.totalPoints?.toLocaleString() }),
                    icon: 'star',
                    btnText: t('smartInsight.idleCoin.action'),
                    colors: ['rgba(46, 125, 50, 0.1)', 'rgba(46, 125, 50, 0.15)'] as const,
                    iconColor: theme.colors.forestGreen,
                    action: () => Navigator.push(SERVICE_MENU_ROUTES.coins as never),
                };
            default:
                return null;
        }
    };

    const config = getInsightConfig();
    if (!config) return null;

    const isLightGradient = activeInsight !== 'URGENT_COIN';
    const textColor = isLightGradient ? theme.colors.typography : theme.colors.onPrimary;
    const btnTextColor = isLightGradient ? theme.colors.vibrantRed : theme.colors.vibrantRed;
    const btnBgColor = isLightGradient ? theme.colors.redSoft : theme.colors.surface;

    return (
        <Animated.View
            entering={FadeInDown.duration(400).springify()}
            exiting={FadeOutUp.duration(300)}
            layout={LinearTransition.springify().damping(18).stiffness(150)}
            style={styles.container}
        >
            <LinearGradient
                colors={config.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
            >
                {/* Dismiss Button */}
                <Pressable
                    style={styles.dismissBtn}
                    onPress={handleDismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol name="close" size={14} color={isLightGradient ? theme.colors.typographySecondary : 'rgba(255,255,255,0.7)'} />
                </Pressable>

                <View style={styles.contentRow}>
                    <View style={styles.iconBox}>
                        <IconSymbol name={config.icon as React.ComponentProps<typeof IconSymbol>['name']} size={28} color={config.iconColor} />
                    </View>

                    <View style={styles.textWrap}>
                        <Text style={[styles.message, { color: textColor }]}>
                            {config.message}
                        </Text>
                        <Pressable style={[styles.actionBtn, { backgroundColor: btnBgColor }]} onPress={config.action}>
                            <Text style={[styles.actionText, { color: btnTextColor }]}>{config.btnText}</Text>
                        </Pressable>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginHorizontal: theme.margins.md,
        marginTop: 12,
        marginBottom: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    gradientCard: {
        borderRadius: 16,
        padding: 16,
        paddingVertical: 18,
        borderWidth: 0.5,
        borderColor: theme.colors.borderGlass,
        overflow: 'hidden',
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    textWrap: {
        flex: 1,
        paddingRight: 12, // Dành khoảng trống cho nut Close nếu cận biên
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 10,
    },
    actionBtn: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 100,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '700',
    },
    dismissBtn: {
        position: 'absolute',
        top: 10,
        right: 12,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: 6,
        borderRadius: 20,
    }
}));
