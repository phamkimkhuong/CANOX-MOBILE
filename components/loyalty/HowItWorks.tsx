/**
 * HowItWorks - Ways to earn Canox loyalty value.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { IconSymbolName } from '@/components/ui/Icon';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type EarnCardTone = 'warm' | 'cool' | 'green';

interface EarnCardProps {
    icon: IconSymbolName;
    title: string;
    tone: EarnCardTone;
}

const EarnCard = memo<EarnCardProps>(({ icon, title, tone }) => {
    const { theme } = useUnistyles();
    const toneStyle = {
        warm: {
            card: styles.earnCardWarm,
            iconBackground: theme.colors.activeLight,
            iconColor: theme.colors.sunsetOrange,
        },
        cool: {
            card: styles.earnCardCool,
            iconBackground: theme.colors.infoLight,
            iconColor: theme.colors.info,
        },
        green: {
            card: styles.earnCardGreen,
            iconBackground: theme.colors.successLight,
            iconColor: theme.colors.forestGreen,
        },
    }[tone];

    return (
        <View style={[styles.earnCard, toneStyle.card]}>
            <View style={[styles.earnIcon, { backgroundColor: toneStyle.iconBackground }]}>
                <IconSymbol name={icon} size={26} color={toneStyle.iconColor} />
            </View>
            <Text style={styles.earnTitle}>{title}</Text>
        </View>
    );
});

EarnCard.displayName = 'EarnCard';

export const HowItWorks: React.FC = memo(() => {
    const { t } = useTranslation('loyalty');

    return (
        <Animated.View entering={FadeInDown.duration(350).delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>{t('guestDashboard.earn.title')}</Text>
            <View style={styles.earnGrid}>
                <EarnCard
                    icon="bag"
                    title={t('guestDashboard.earn.purchase')}
                    tone="warm"
                />
                <EarnCard
                    icon="star"
                    title={t('guestDashboard.earn.review')}
                    tone="cool"
                />
                <EarnCard
                    icon="gift"
                    title={t('guestDashboard.earn.program')}
                    tone="green"
                />
            </View>
        </Animated.View>
    );
});

HowItWorks.displayName = 'HowItWorks';

const styles = StyleSheet.create((theme) => ({
    section: {
        marginTop: theme.margins.lg,
        marginHorizontal: theme.margins.md,
        gap: theme.margins.smd,
    },
    sectionTitle: {
        fontSize: theme.fontSizes.base,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.typography,
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
