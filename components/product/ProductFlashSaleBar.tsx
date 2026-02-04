import { CountdownDigits } from '@/components/ui/CountdownDigits';
import { IconSymbol, IconSymbolName } from '@/components/ui/Icon';
import { useCountdown } from '@/hooks/useCountdown';
import type { FlashSaleInfo } from '@/types/product/productDetail';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ProductFlashSaleBarProps {
    /** Flash Sale info từ ProductDetailUI */
    flashSale: FlashSaleInfo;
    /** Callback khi countdown kết thúc */
    onExpired?: () => void;
}

export const ProductFlashSaleBar = memo<ProductFlashSaleBarProps>(({
    flashSale,
    onExpired,
}) => {
    const { t } = useTranslation('product');

    // Mapping UI theo campaignType with Premium Gradients
    const campaignTheme = useMemo(() => {
        const type = flashSale.campaignType;
        switch (type) {
            case 'FLASH_SALE':
                return {
                    label: t('flashSale.campaigns.flashSale'),
                    icon: 'flash' as IconSymbolName,
                    iconColor: '#FFD700',
                    gradient: ['#FF4B2B', '#FF416C'], // Vibrant Red
                    textColor: '#FFFFFF',
                    badgeColor: 'rgba(255, 255, 255, 0.2)',
                };
            case 'MEGA_SALE':
                return {
                    label: t('flashSale.campaigns.megaSale'),
                    icon: 'flame' as IconSymbolName,
                    iconColor: '#FFD700',
                    gradient: ['#9C27B0', '#E91E63'], // Purple/Pink
                    textColor: '#FFFFFF',
                    badgeColor: 'rgba(255, 255, 255, 0.2)',
                };
            case 'DAILY_DEAL':
                return {
                    label: t('flashSale.campaigns.dailyDeal'),
                    icon: 'gift' as IconSymbolName,
                    iconColor: '#FFFFFF',
                    gradient: ['#2196F3', '#00BCD4'], // Blue/Cyan
                    textColor: '#FFFFFF',
                    badgeColor: 'rgba(255, 255, 255, 0.2)',
                };
            case 'SHOP_SALE':
                return {
                    label: t('flashSale.campaigns.shopSale'),
                    icon: 'tag' as IconSymbolName,
                    iconColor: '#FFD700',
                    gradient: ['#F97316', '#EF4444'], // Orange/Red (Brand Colors)
                    textColor: '#FFFFFF',
                    badgeColor: 'rgba(255, 255, 255, 0.2)',
                };
            case 'SHOP_PROMOTION':
                return {
                    label: t('flashSale.campaigns.shopPromotion'),
                    icon: 'gift' as IconSymbolName,
                    iconColor: '#FFFFFF',
                    gradient: ['#10B981', '#059669'], // Emerald/Green
                    textColor: '#FFFFFF',
                    badgeColor: 'rgba(255, 255, 255, 0.2)',
                };
            default:
                return {
                    label: t('flashSale.campaigns.flashSale'),
                    icon: 'flash' as IconSymbolName,
                    iconColor: '#FFD700',
                    gradient: ['#EF4444', '#F97316'],
                    textColor: '#FFFFFF',
                    badgeColor: 'rgba(255, 255, 255, 0.2)',
                };
        }
    }, [flashSale.campaignType, t]);

    // Sử dụng useCountdown - Ưu tiên secondsRemaining để tránh drift timezone
    const { duration, isExpired } = useCountdown({
        duration: flashSale.secondsRemaining,
        targetDate: flashSale.secondsRemaining ? undefined : flashSale.endTime,
        autoStart: true,
        onComplete: onExpired,
    });

    const soldPercentage = flashSale.quantityLimit && flashSale.quantitySold !== undefined
        ? Math.min((flashSale.quantitySold / flashSale.quantityLimit) * 100, 100)
        : 0;

    // Xác định trạng thái hiển thị
    const isAlmostSoldOut = soldPercentage >= 80;

    // Memoize dynamic progress style to avoid inline-styles warning
    const progressFillStyle = useMemo(() => ({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        width: `${Math.max(soldPercentage, 15)}%` as any,
        backgroundColor: isAlmostSoldOut ? '#FFD700' : '#FFFFFF',
    }), [soldPercentage, isAlmostSoldOut]);

    // Không render nếu không active hoặc đã hết hạn
    if (!flashSale.isActive || isExpired || (!flashSale.endTime && !flashSale.secondsRemaining)) {
        return null;
    }

    const statusText = isAlmostSoldOut
        ? t('flashSale.soldOut')
        : flashSale.quantitySold && flashSale.quantitySold > 0
            ? `${t('flashSale.soldPrefix')} ${flashSale.quantitySold}`
            : t('flashSale.selling');

    return (
        <View style={styles.container}>
            <LinearGradient
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                colors={campaignTheme.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                <BlurView intensity={10} tint="light" style={styles.blurContent}>
                    {/* Specular Highlight */}
                    <View style={styles.highlight} />

                    {/* Header Row */}
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <IconSymbol name={campaignTheme.icon} size={20} color={campaignTheme.iconColor} />
                            <Text style={[styles.title, { color: campaignTheme.textColor }]}>
                                {campaignTheme.label}
                            </Text>
                            {!!flashSale.discountPercentage && flashSale.discountPercentage > 0 && (
                                <View style={[styles.discountBadge, { backgroundColor: campaignTheme.badgeColor }]}>
                                    <BlurView intensity={20} tint="light" style={styles.badgeBlur}>
                                        <Text style={styles.discountText}>
                                            -{flashSale.discountPercentage}%
                                        </Text>
                                    </BlurView>
                                </View>
                            )}
                        </View>

                        {/* Countdown - Sử dụng CountdownDigits */}
                        <CountdownDigits
                            duration={duration}
                            size="small"
                            variant="glass"
                        />
                    </View>

                    {/* Progress Bar Container */}
                    {!!flashSale.quantityLimit && flashSale.quantityLimit > 0 && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressTrack}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                                    style={StyleSheet.absoluteFill}
                                />
                                <View
                                    style={[
                                        styles.progressFill,
                                        progressFillStyle,
                                    ]}
                                >
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.4)', 'transparent']}
                                        style={StyleSheet.absoluteFill}
                                    />
                                </View>
                                {isAlmostSoldOut && (
                                    <View style={styles.fireIcon}>
                                        <IconSymbol name="flame" size={10} color={isAlmostSoldOut ? '#E53935' : '#FFF'} />
                                    </View>
                                )}
                            </View>
                            <Text style={[
                                styles.statusText,
                                { color: campaignTheme.textColor },
                                isAlmostSoldOut && styles.statusTextUrgent,
                            ]}>
                                {statusText}
                            </Text>
                        </View>
                    )}
                </BlurView>
            </LinearGradient>
        </View>
    );
});

ProductFlashSaleBar.displayName = 'ProductFlashSaleBar';

export const styles = StyleSheet.create((theme) => ({
    container: {
        marginBottom: theme.margins.sm,
        overflow: 'hidden',
    },
    gradient: {
        width: '100%',
    },
    blurContent: {
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 10,
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    discountBadge: {
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    badgeBlur: {
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    discountText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    progressContainer: {
        marginTop: 8,
        gap: 2,
    },
    progressTrack: {
        height: 10,
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
        overflow: 'hidden',
    },
    fireIcon: {
        position: 'absolute',
        right: 8,
        top: 2,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 2,
        opacity: 0.9,
    },
    statusTextUrgent: {
        fontWeight: '700',
        opacity: 1,
    },
}));
