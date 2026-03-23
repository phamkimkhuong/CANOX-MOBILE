import { IconSymbol } from '@/components/ui/Icon';
import { SlotStatus } from '@/types/campaign';
import { FlashSaleItem } from '@/types/home';
import { formatCurrency } from '@/utils/format';
import { buildImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { FlashSaleProgressBar } from './FlashSaleProgressBar';

interface FlashSaleProductCardProps {
    item: FlashSaleItem;
    status: SlotStatus;
    onPress?: (productId: string) => void;
    onRemindMe?: (id: string) => void;
    index?: number;
}

/**
 * FlashSaleProductCard - Premium Liquid Glass Flash Sale Card
 */
export const FlashSaleProductCard = memo(({
    item,
    status,
    onPress,
    onRemindMe,
    index = 0
}: FlashSaleProductCardProps) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('home');
    const styles = stylesheet;

    const isLive = status === SlotStatus.ACTIVE;
    const isUpcoming = status === SlotStatus.UPCOMING;
    const isSoldOut = item.isSoldOut || (item.soldCount >= item.totalStock);
    const hasDiscount = !isSoldOut && item.discountPercentage > 0;

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).duration(600)}
            style={styles.container}
        >
            <Pressable
                onPress={() => onPress?.(item.productId)}
                style={({ pressed }) => [
                    styles.card,
                    isSoldOut && styles.cardSoldOut,
                    pressed && styles.pressed,
                ]}
                disabled={isSoldOut && isLive}
            >
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: buildImageUrl(item.image, null, 'thumb') }}
                        style={[styles.image, isSoldOut && styles.grayscale]}
                        contentFit="cover"
                        transition={300}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0, 0, 0, 0.06)']}
                        locations={[0.5, 1]}
                        style={styles.imageShade}
                    />

                    {hasDiscount && (
                        <LinearGradient
                            colors={[theme.colors.newPrimary, theme.colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.discountBadge}
                        >
                            <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                        </LinearGradient>
                    )}

                    {isSoldOut && (
                        <View style={styles.soldOutOverlay}>
                            <View style={styles.soldOutBadge}>
                                <Text style={styles.soldOutLabel}>{t('flashSale.soldOut')}</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.contentTop}>
                        <Text style={styles.title} numberOfLines={2}>{item.name}</Text>

                        {item.rating > 0 ? (
                            <View style={styles.metaRow}>
                                <View style={styles.ratingBadge}>
                                    <IconSymbol name="star" size={12} color={theme.colors.warning} />
                                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.priceSection}>
                            <View style={styles.priceRow}>
                                <Text style={[styles.salePrice, isSoldOut && styles.textSecondary]}>
                                    {formatCurrency(item.price)}
                                </Text>
                                {item.originalPrice > item.price && (
                                    <Text style={styles.originalPrice}>
                                        {formatCurrency(item.originalPrice)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.contentBottom}>
                        {isLive && (
                            <View style={styles.progressContainer}>
                                <FlashSaleProgressBar
                                    totalStock={item.totalStock}
                                    soldCount={item.soldCount}
                                    stockRemaining={item.stockRemaining}
                                    isSoldOut={isSoldOut}
                                />
                            </View>
                        )}

                        <View style={styles.ctaWrapper}>
                            {isUpcoming ? (
                                <Pressable
                                    onPress={() => onRemindMe?.(item.id)}
                                    style={({ pressed }) => [styles.remindBtn, pressed && styles.btnPressed]}
                                >
                                    <IconSymbol name="notifications" size={16} color={theme.colors.warning} />
                                    <Text style={styles.remindBtnText}>{t('flashSale.remindMe')}</Text>
                                </Pressable>
                            ) : isSoldOut ? (
                                <View style={[styles.buyBtn, styles.disabledBtn]}>
                                    <Text style={[styles.buyBtnText, styles.buyBtnTextDisabled]}>
                                        {t('flashSale.soldOut')}
                                    </Text>
                                </View>
                            ) : (
                                <LinearGradient
                                    colors={[theme.colors.newPrimary, theme.colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buyBtn}
                                >
                                    <Text style={styles.buyBtnText}>
                                        {t('flashSale.buyNow')}
                                    </Text>
                                </LinearGradient>
                            )}
                        </View>
                    </View>
                </View>
            </Pressable>

            <View style={styles.innerStroke} />
        </Animated.View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: theme.margins.smd,
        borderRadius: theme.radius.xl,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
        elevation: 4,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
    },
    card: {
        flexDirection: 'row',
        padding: theme.margins.smd,
        gap: theme.margins.smd,
        backgroundColor: theme.colors.surface,
    },
    cardSoldOut: {
        borderLeftColor: theme.colors.secondary,
    },
    pressed: {
        opacity: 0.95,
        transform: [{ scale: 0.992 }],
    },
    imageWrapper: {
        width: 108,
        height: 108,
        borderRadius: theme.radius.l,
        backgroundColor: theme.colors.header.background,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.borderMuted,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageShade: {
        ...StyleSheet.absoluteFillObject,
    },
    grayscale: {
        opacity: 0.55,
    },
    discountBadge: {
        position: 'absolute',
        top: theme.margins.sm,
        left: theme.margins.sm,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
    },
    discountText: {
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.bold,
        color: theme.colors.onPrimary,
        letterSpacing: 0.2,
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.surfaceGlassOverlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldOutBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.typography,
    },
    soldOutLabel: {
        color: theme.colors.onPrimary,
        fontSize: theme.fontSizes.xsm,
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.2,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    contentTop: {
        gap: theme.margins.xs + 2,
    },
    contentBottom: {
        gap: theme.margins.sm,
    },
    title: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.typography,
        lineHeight: 20,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.warning,
    },
    priceSection: {
        gap: theme.margins.xs,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    salePrice: {
        fontSize: theme.fontSizes.xl,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.newPrimary,
    },
    originalPrice: {
        fontSize: theme.fontSizes.sm,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    textSecondary: {
        color: theme.colors.secondary,
    },
    progressContainer: {
        marginTop: 2,
    },
    ctaWrapper: {
        marginTop: 2,
    },
    buyBtn: {
        borderRadius: theme.radius.l,
        paddingVertical: theme.margins.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyBtnText: {
        color: theme.colors.onPrimary,
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.bold,
        letterSpacing: 0.2,
    },
    buyBtnTextDisabled: {
        color: theme.colors.surface,
    },
    remindBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: theme.margins.sm + 1,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        backgroundColor: theme.colors.warningSubtle,
    },
    remindBtnText: {
        color: theme.colors.warning,
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.bold,
    },
    disabledBtn: {
        backgroundColor: theme.colors.secondary,
        opacity: 0.85,
    },
    btnPressed: {
        opacity: 0.88,
    },
    innerStroke: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: theme.colors.surfaceOverlay,
    },
}));
