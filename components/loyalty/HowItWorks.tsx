/**
 * HowItWorks - Hướng dẫn 3 bước sử dụng xu tích lũy
 */

import { IconSymbol } from '@/components/ui/Icon';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export const HowItWorks: React.FC = memo(() => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('loyalty');

    const steps = [
        { icon: 'bag' as const, title: t('howItWorks.steps.buy.title'), desc: t('howItWorks.steps.buy.desc') },
        { icon: 'cash' as const, title: t('howItWorks.steps.accumulate.title'), desc: t('howItWorks.steps.accumulate.desc') },
        { icon: 'ticket' as const, title: t('howItWorks.steps.use.title'), desc: t('howItWorks.steps.use.desc') },
    ];

    return (
        <Animated.View entering={FadeInDown.duration(350).delay(300)}>
            <View style={styles.howSection}>
                <Text style={styles.sectionTitle}>{t('howItWorks.title')}</Text>
                <View style={styles.stepsRow}>
                    {steps.map((step, i) => (
                        <View key={step.title} style={styles.stepItem}>
                            <View style={styles.stepIcon}>
                                <IconSymbol name={step.icon} size={22} color={theme.colors.buttonActive} />
                            </View>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                            <Text style={styles.stepDesc}>{step.desc}</Text>
                            {i < steps.length - 1 && (
                                <View style={styles.stepArrow}>
                                    <IconSymbol name="chevron-right" size={14} color={theme.colors.secondary} />
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </View>
        </Animated.View>
    );
});

HowItWorks.displayName = 'HowItWorks';

const stylesheet = StyleSheet.create((theme) => ({
    howSection: {
        marginTop: theme.margins.lg,
        marginHorizontal: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: theme.margins.smd,
    },
    stepsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    stepItem: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    stepIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: theme.colors.activeSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    stepTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.typography,
        marginBottom: 4,
    },
    stepDesc: {
        fontSize: 11,
        color: theme.colors.secondary,
        textAlign: 'center',
        lineHeight: 16,
    },
    stepArrow: {
        position: 'absolute',
        right: -14,
        top: 16,
    },
}));
