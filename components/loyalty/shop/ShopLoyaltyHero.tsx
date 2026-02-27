import { IconSymbol } from '@/components/ui/Icon';
import type { PointBalanceUI } from '@/types/loyalty/ui';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopLoyaltyHeroProps {
    shopLogo?: string;
    shopName?: string;
    pointBalance?: PointBalanceUI;
}

export const ShopLoyaltyHero: React.FC<ShopLoyaltyHeroProps> = ({
    shopLogo,
    shopName,
    pointBalance,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['loyalty']);
    const styles = stylesheet;

    const total = pointBalance?.total ?? 0;
    const expiringSoon = pointBalance?.expiringSoon ?? 0;

    return (
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.container}>
            {/* Liquid Glass Hologram Card */}
            <LinearGradient
                colors={[theme.colors.vibrantRed, theme.colors.sunsetOrange]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
            >
                {/* Inner Glass Layer for visual depth */}
                <View style={styles.innerGlass}>

                    {/* Header: Shop Info */}
                    <View style={styles.header}>
                        <View style={styles.shopInfo}>
                            {shopLogo ? (
                                <Image source={{ uri: shopLogo }} style={styles.logo} contentFit="cover" />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <IconSymbol name="storefront" size={20} color={theme.colors.vibrantRed} />
                                </View>
                            )}
                            <Text style={styles.shopName} numberOfLines={1}>
                                {shopName || t('loyalty:shopDetail.hero.defaultShopName')}
                            </Text>
                        </View>
                        <IconSymbol name="sparkles" size={20} color="rgba(255,255,255,0.8)" />
                    </View>

                    {/* Balance Info */}
                    <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>{t('loyalty:shopDetail.hero.availableCoins')}</Text>
                        <Text style={styles.balanceAmount}>{total.toLocaleString('vi-VN')}</Text>
                        <Text style={styles.balanceSub}>{t('loyalty:shopDetail.hero.equivalent', { amount: total.toLocaleString('vi-VN') })}</Text>
                    </View>

                    {/* Expiring Warning Box - Liquid Design */}
                    {expiringSoon > 0 && (
                        <View style={styles.expiringBox}>
                            <View style={styles.expiringIconWrapper}>
                                <IconSymbol name="warning" size={16} color={theme.colors.onPrimary} />
                            </View>
                            <View style={styles.expiringTextWrapper}>
                                <Text style={styles.expiringTextStrong}>
                                    {t('loyalty:shopDetail.hero.warningMsg', { amount: expiringSoon.toLocaleString('vi-VN') })}
                                </Text>
                                <Text style={styles.expiringTextSub}>{t('loyalty:shopDetail.hero.urgentText')}</Text>
                            </View>
                            <View style={styles.actionBtn}>
                                <Text style={styles.actionBtnText}>{t('loyalty:shopDetail.hero.buyNow')}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.md,
        paddingBottom: theme.margins.lg,
    },
    cardGradient: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: theme.colors.vibrantRed,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    innerGlass: {
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.4)',
        borderRadius: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 100,
        maxWidth: '80%',
    },
    logo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 6,
    },
    logoPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        marginRight: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shopName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    balanceContainer: {
        alignItems: 'center',
        marginVertical: 12,
    },
    balanceLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '800',
        color: theme.colors.onPrimary,
        letterSpacing: -1,
    },
    balanceSub: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    expiringBox: {
        marginTop: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    expiringIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    expiringTextWrapper: {
        flex: 1,
    },
    expiringTextStrong: {
        color: theme.colors.onPrimary,
        fontSize: 13,
        fontWeight: '700',
    },
    expiringTextSub: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 11,
        marginTop: 2,
    },
    actionBtn: {
        backgroundColor: theme.colors.onPrimary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    actionBtnText: {
        color: theme.colors.vibrantRed,
        fontSize: 11,
        fontWeight: '800',
    },
}));
