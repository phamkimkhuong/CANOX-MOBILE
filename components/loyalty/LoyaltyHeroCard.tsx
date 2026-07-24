/**
 * LoyaltyHeroCard - Balance hero for users with available loyalty value.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { LoyaltyOverviewUI } from '@/types/loyalty/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface LoyaltyHeroCardProps {
    overview: LoyaltyOverviewUI;
    onUseNow: () => void;
    onLearnMore: () => void;
}

const heroImage = require('@/assets/images/loyalty/tcano-xu-guest-hero.png');

export const LoyaltyHeroCard: React.FC<LoyaltyHeroCardProps> = memo(({
    overview,
    onUseNow,
    onLearnMore,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('loyalty');
    const isPlatformBalance = overview.displayBalanceKind === 'PLATFORM';
    const formattedBalance = overview.displayBalance.toLocaleString('vi-VN');
    const balanceUnit = isPlatformBalance
        ? t('overviewDashboard.hero.coinUnit')
        : t('overviewDashboard.hero.pointUnit');
    const heroLabel = isPlatformBalance
        ? t('overviewDashboard.hero.platformLabel')
        : t('overviewDashboard.hero.combinedLabel');
    const heroDescription = isPlatformBalance
        ? t('overviewDashboard.hero.platformDescription', { amount: formattedBalance })
        : t('overviewDashboard.hero.combinedDescription');
    const nearestExpiry = overview.nearestExpiry;
    const expiryUnit = nearestExpiry?.sourceType === 'PLATFORM'
        ? t('overviewDashboard.hero.coinUnit')
        : t('overviewDashboard.hero.pointUnit');

    return (
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.heroWrapper}>
            <LinearGradient
                colors={[theme.colors.surface, theme.colors.surface, theme.colors.warningSubtle]}
                locations={[0, 0.58, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                <View style={styles.heroTop}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroLabel}>{heroLabel}</Text>
                        <Text style={styles.heroPoints}>
                            {formattedBalance} <Text style={styles.heroUnit}>{balanceUnit}</Text>
                        </Text>
                        <Text style={styles.heroDescription}>{heroDescription}</Text>
                    </View>
                    <View style={styles.heroArt}>
                        <Image
                            source={heroImage}
                            style={styles.heroImage}
                            contentFit="contain"
                            transition={120}
                        />
                    </View>
                </View>

                {nearestExpiry ? (
                    <View style={styles.expiryPill}>
                        <IconSymbol name="calendar" size={17} color={theme.colors.typographySecondary} />
                        <Text style={styles.expiryText} numberOfLines={2}>
                            {t('overviewDashboard.hero.expiringTemplate', {
                                amount: nearestExpiry.points.toLocaleString('vi-VN'),
                                unit: expiryUnit,
                                source: nearestExpiry.sourceName,
                                date: nearestExpiry.expiryDate,
                            })}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.heroActions}>
                    <Pressable style={styles.primaryButton} onPress={onUseNow}>
                        <LinearGradient
                            colors={[theme.colors.accent, theme.colors.buttonActive]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.primaryButtonFill}
                        >
                            <Text style={styles.primaryButtonText}>{t('overviewDashboard.hero.useNow')}</Text>
                        </LinearGradient>
                    </Pressable>
                    <Pressable style={styles.secondaryButton} onPress={onLearnMore}>
                        <Text style={styles.secondaryButtonText}>{t('overviewDashboard.hero.howItWorks')}</Text>
                    </Pressable>
                </View>
            </LinearGradient>
        </Animated.View>
    );
});

LoyaltyHeroCard.displayName = 'LoyaltyHeroCard';

const stylesheet = StyleSheet.create((theme) => ({
    heroWrapper: {
        marginHorizontal: theme.margins.smd,
        marginTop: theme.margins.sm,
        borderRadius: theme.radius.l,
        shadowColor: theme.colors.sunsetOrange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
    },
    heroCard: {
        minHeight: 228,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        padding: theme.margins.smd,
        overflow: 'hidden',
    },
    heroTop: {
        minHeight: 112,
        justifyContent: 'center',
    },
    heroContent: {
        width: '58%',
        zIndex: 1,
    },
    heroLabel: {
        fontSize: theme.fontSizes.md,
        lineHeight: 15,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
        marginBottom: theme.margins.xs,
    },
    heroPoints: {
        fontSize: 35,
        lineHeight: 45,
        fontWeight: '800',
        color: theme.colors.buttonActive,
    },
    heroUnit: {
        fontSize: theme.fontSizes.xl,
        lineHeight: 26,
        fontWeight: theme.fontWeights.bold,
    },
    heroDescription: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 15,
        color: theme.colors.typographySecondary,
        marginTop: theme.margins.xs,
    },
    heroArt: {
        position: 'absolute',
        right: -theme.margins.xs,
        top: -theme.margins.sm,
        width: 166,
        height: 144,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    expiryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.xs,
        alignSelf: 'stretch',
        minHeight: 35,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        backgroundColor: theme.colors.warningSubtle,
        paddingHorizontal: theme.margins.sm,
        marginTop: theme.margins.smd,
    },
    expiryText: {
        flex: 1,
        fontSize: theme.fontSizes.xsm,
        lineHeight: 15,
        color: theme.colors.typography,
    },
    heroActions: {
        flexDirection: 'row',
        gap: theme.margins.sm,
        marginTop: theme.margins.md,
        zIndex: 1,
    },
    primaryButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
    },
    primaryButtonFill: {
        flex: 1,
        minHeight: 45,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.sm,
    },
    primaryButtonText: {
        color: theme.colors.onAccent,
        fontSize: theme.fontSizes.mdbase,
        fontWeight: theme.fontWeights.bold,
    },
    secondaryButton: {
        flex: 1,
        minHeight: 45,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.buttonActive,
        backgroundColor: theme.colors.surfaceOverlay,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.sm,
    },
    secondaryButtonText: {
        color: theme.colors.buttonActive,
        fontSize: theme.fontSizes.mdbase,
        fontWeight: theme.fontWeights.bold,
        textAlign: 'center',
    },
}));
