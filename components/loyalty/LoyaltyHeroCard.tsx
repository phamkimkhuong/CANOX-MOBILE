/**
 * LoyaltyHeroCard 
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { LoyaltyOverviewUI } from '@/types/loyalty/ui';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface LoyaltyHeroCardProps {
    overview: LoyaltyOverviewUI;
}

export const LoyaltyHeroCard: React.FC<LoyaltyHeroCardProps> = memo(({ overview }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('loyalty');

    return (
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <View style={styles.heroWrapper}>
                <LinearGradient
                    colors={[theme.colors.vibrantRed, theme.colors.buttonActive, theme.colors.accent]}
                    locations={[0, 0.5, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroCard}
                >
                    {/* Background Decoration */}
                    <View style={styles.heroDecoration}>
                        <IconSymbol name="cash" size={120} color="rgba(255,255,255,0.08)" />
                    </View>

                    {/* Points Display */}
                    <View style={styles.heroContent}>
                        <View style={styles.heroIconRow}>
                            <View style={styles.coinIcon}>
                                <IconSymbol name="cash" size={28} color="#fff" />
                            </View>
                            <Text style={styles.heroLabel}>{t('hero.totalCoinsLabel')}</Text>
                        </View>

                        <Text style={styles.heroPoints}>
                            {overview.totalPoints.toLocaleString('vi-VN')}
                        </Text>
                        <Text style={styles.heroUnit}>{t('hero.unit')}</Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.heroStats}>
                        <View style={styles.heroStatItem}>
                            <IconSymbol name="storefront" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.heroStatValue}>{overview.shopCount}</Text>
                            <Text style={styles.heroStatLabel}>{t('hero.shopCountLabel')}</Text>
                        </View>

                        <View style={styles.heroStatDivider} />

                        <View style={styles.heroStatItem}>
                            <IconSymbol
                                name="time"
                                size={16}
                                color={overview.expiringPoints > 0 ? '#fef08a' : 'rgba(255,255,255,0.8)'}
                            />
                            <Text style={[
                                styles.heroStatValue,
                                overview.expiringPoints > 0 && styles.expiringValue,
                            ]}>
                                {overview.expiringPoints.toLocaleString('vi-VN')}
                            </Text>
                            <Text style={styles.heroStatLabel}>{t('hero.expiringLabel')}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        </Animated.View>
    );
});

LoyaltyHeroCard.displayName = 'LoyaltyHeroCard';

const stylesheet = StyleSheet.create((theme) => ({
    heroWrapper: {
        marginHorizontal: theme.margins.md,
        marginTop: theme.margins.md,
        borderRadius: 20,
        overflow: 'hidden',
        // Shadow
        shadowColor: theme.colors.vibrantRed,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
    },
    heroCard: {
        padding: 24,
        position: 'relative',
    },
    heroDecoration: {
        position: 'absolute',
        top: -20,
        right: -20,
        opacity: 0.6,
    },
    heroContent: {
        alignItems: 'center',
        marginBottom: 20,
    },
    heroIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    coinIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.85)',
    },
    heroPoints: {
        fontSize: 48,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: -1,
        lineHeight: 56,
    },
    heroUnit: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.65)',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    heroStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    heroStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        justifyContent: 'center',
    },
    heroStatDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    heroStatValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
    },
    heroStatLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.65)',
    },
    expiringValue: {
        color: '#fef08a', // Vàng nhạt nổi bật trên nền đỏ-cam
    },
}));
