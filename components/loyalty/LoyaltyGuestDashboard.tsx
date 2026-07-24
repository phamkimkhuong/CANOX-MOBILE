/**
 * LoyaltyGuestDashboard - Login onboarding for unauthenticated TCano Coins users.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { IconSymbolName } from '@/components/ui/Icon';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface LoyaltyGuestDashboardProps {
    onLogin: () => void;
}

const guestHeroImage = require('@/assets/images/loyalty/tcano-xu-guest-hero.png');

const GuestHeroIllustration = memo(() => (
    <Image
        source={guestHeroImage}
        style={styles.heroImage}
        contentFit="contain"
        transition={120}
    />
));

GuestHeroIllustration.displayName = 'GuestHeroIllustration';

const BenefitIcon = memo<{
    icon: IconSymbolName;
    color: string;
    backgroundColor: string;
}>(({ icon, color, backgroundColor }) => (
    <View style={[styles.benefitIcon, { backgroundColor }]}>
        <IconSymbol name={icon} size={24} color={color} />
    </View>
));

BenefitIcon.displayName = 'BenefitIcon';

const BenefitRow = memo<{
    icon: IconSymbolName;
    color: string;
    backgroundColor: string;
    title: string;
    description: string;
}>(({ icon, color, backgroundColor, title, description }) => (
    <View style={styles.benefitRow}>
        <BenefitIcon icon={icon} color={color} backgroundColor={backgroundColor} />
        <View style={styles.benefitCopy}>
            <Text style={styles.benefitTitle}>{title}</Text>
            <Text style={styles.benefitDescription}>{description}</Text>
        </View>
    </View>
));

BenefitRow.displayName = 'BenefitRow';

const EarnCard = memo<{
    icon: IconSymbolName;
    iconColor: string;
    iconBackground: string;
    cardStyle: object;
    title: string;
}>(({ icon, iconColor, iconBackground, cardStyle, title }) => (
    <View style={[styles.earnCard, cardStyle]}>
        <View style={[styles.earnIcon, { backgroundColor: iconBackground }]}>
            <IconSymbol name={icon} size={24} color={iconColor} />
        </View>
        <Text style={styles.earnTitle}>{title}</Text>
    </View>
));

EarnCard.displayName = 'EarnCard';

export const LoyaltyGuestDashboard = memo<LoyaltyGuestDashboardProps>(({
    onLogin,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('loyalty');

    return (
        <Animated.View entering={FadeInDown.duration(350).delay(100)} style={styles.container}>
            <LinearGradient
                colors={[
                    theme.colors.surface,
                    theme.colors.surface,
                    theme.colors.warningSubtle,
                ]}
                locations={[0, 0.62, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
            >
                <View style={styles.heroText}>
                    <Text style={styles.heroTitle}>{t('guestDashboard.hero.title')}</Text>
                    <Text style={styles.heroDescription}>{t('guestDashboard.hero.description')}</Text>
                </View>
                <View style={styles.heroArt}>
                    <GuestHeroIllustration />
                </View>
                <View style={styles.heroActions}>
                    <Pressable style={styles.primaryButton} onPress={onLogin}>
                        <LinearGradient
                            colors={[theme.colors.accent, theme.colors.buttonActive]}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={styles.primaryButtonFill}
                        >
                            <Text style={styles.primaryButtonText}>{t('guestDashboard.hero.loginAction')}</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </LinearGradient>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('guestDashboard.benefits.title')}</Text>
                <View style={styles.benefitCard}>
                    <BenefitRow
                        icon="ticket"
                        color={theme.colors.sunsetOrange}
                        backgroundColor={theme.colors.activeLight}
                        title={t('guestDashboard.benefits.discount.title')}
                        description={t('guestDashboard.benefits.discount.description')}
                    />
                    <View style={styles.divider} />
                    <BenefitRow
                        icon="wallet"
                        color={theme.colors.info}
                        backgroundColor={theme.colors.infoLight}
                        title={t('guestDashboard.benefits.balance.title')}
                        description={t('guestDashboard.benefits.balance.description')}
                    />
                    <View style={styles.divider} />
                    <BenefitRow
                        icon="storefront"
                        color={theme.colors.forestGreen}
                        backgroundColor={theme.colors.successLight}
                        title={t('guestDashboard.benefits.shop.title')}
                        description={t('guestDashboard.benefits.shop.description')}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('guestDashboard.earn.title')}</Text>
                <View style={styles.earnGrid}>
                    <EarnCard
                        icon="cart"
                        iconColor={theme.colors.sunsetOrange}
                        iconBackground={theme.colors.activeLight}
                        cardStyle={styles.earnCardWarm}
                        title={t('guestDashboard.earn.purchase')}
                    />
                    <EarnCard
                        icon="star"
                        iconColor={theme.colors.info}
                        iconBackground={theme.colors.infoLight}
                        cardStyle={styles.earnCardCool}
                        title={t('guestDashboard.earn.review')}
                    />
                    <EarnCard
                        icon="gift"
                        iconColor={theme.colors.forestGreen}
                        iconBackground={theme.colors.successLight}
                        cardStyle={styles.earnCardGreen}
                        title={t('guestDashboard.earn.program')}
                    />
                </View>
            </View>
        </Animated.View>
    );
});

LoyaltyGuestDashboard.displayName = 'LoyaltyGuestDashboard';

const styles = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        gap: theme.margins.lg,
    },
    heroCard: {
        minHeight: 196,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        padding: theme.margins.md,
        overflow: 'hidden',
        shadowColor: theme.colors.sunsetOrange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
    },
    heroText: {
        width: '52%',
        zIndex: 1,
    },
    heroTitle: {
        fontSize: theme.fontSizes.xl,
        lineHeight: 25,
        fontWeight: '800',
        color: theme.colors.typography,
        marginBottom: theme.margins.sm,
    },
    heroDescription: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 19,
        color: theme.colors.typographySecondary,
    },
    heroArt: {
        position: 'absolute',
        right: theme.margins.smd,
        top: theme.margins.sm,
        width: 152,
        height: 144,
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroActions: {
        flexDirection: 'row',
        gap: theme.margins.sm,
        marginTop: theme.margins.lg,
        zIndex: 1,
    },
    primaryButton: {
        flex: 1,
        minHeight: 42,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
    },
    primaryButtonFill: {
        flex: 1,
        minHeight: 42,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.sm,
    },
    primaryButtonText: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.onAccent,
        textAlign: 'center',
    },
    section: {
        gap: theme.margins.smd,
    },
    sectionTitle: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    benefitCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        overflow: 'hidden',
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.md,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.smd,
    },
    benefitIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitCopy: {
        flex: 1,
        gap: 2,
    },
    benefitTitle: {
        fontSize: theme.fontSizes.md,
        lineHeight: 19,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
    },
    benefitDescription: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 18,
        color: theme.colors.typographySecondary,
    },
    divider: {
        height: 1,
        marginLeft: 76,
        backgroundColor: theme.colors.borderMuted,
    },
    earnGrid: {
        flexDirection: 'row',
        gap: theme.margins.sm,
    },
    earnCard: {
        flex: 1,
        minHeight: 104,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.margins.sm,
        gap: theme.margins.sm,
    },
    earnCardWarm: {
        backgroundColor: theme.colors.activeSubtle,
        borderColor: theme.colors.activeLight,
    },
    earnCardCool: {
        backgroundColor: theme.colors.infoSubtle,
        borderColor: theme.colors.infoLight,
    },
    earnCardGreen: {
        backgroundColor: theme.colors.successSubtle,
        borderColor: theme.colors.successLight,
    },
    earnIcon: {
        width: 42,
        height: 42,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    earnTitle: {
        fontSize: theme.fontSizes.sm,
        lineHeight: 16,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
        textAlign: 'center',
    },
}));
