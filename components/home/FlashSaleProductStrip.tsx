import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, DimensionValue } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/ui/Icon';
import { FlashSaleData } from '@/types/home';
import { formatCurrency } from '@/utils/format';

interface FlashSaleProductStripProps {
    displayedData: FlashSaleData;
    displayedIsUpcoming: boolean;
    onProductPress?: (
        productId: string,
        action?: 'buy-now' | 'add-to-cart',
        previewImageUrl?: string | null
    ) => void;
    shouldShowPendingShell: boolean;
}

export const FlashSaleProductStrip = memo(({
    displayedData,
    displayedIsUpcoming,
    onProductPress,
    shouldShowPendingShell
}: FlashSaleProductStripProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('home');

    const productStripKey = `products:${displayedData.slot.id}`;

    return (
        <Animated.View
            key={productStripKey}
            entering={FadeIn.duration(220)}
            exiting={FadeOut.duration(140)}
            style={styles.productsSection}
        >
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {displayedData.items.map((item) => {
                    const isUrgent = item.progress >= 80 && !item.isSoldOut;
                    const upcomingCurrentPrice =
                        displayedIsUpcoming && item.originalPrice > item.price
                            ? item.originalPrice
                            : null;
                    const progressLabel = item.isSoldOut
                        ? t('flashSale.soldOut') || 'Hết hàng'
                        : item.soldCount === 0
                            ? t('flashSale.sellingFast') || 'Vừa mở bán'
                            : isUrgent
                                ? t('flashSale.urgentStock') || 'SẮP CHÁY HÀNG'
                                : t('flashSale.soldCount', { count: item.soldCount });

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.productCard, item.isSoldOut && styles.soldOutCard]}
                            activeOpacity={item.isSoldOut ? 1 : 0.85}
                            onPress={() => !item.isSoldOut && onProductPress?.(
                                item.productId,
                                undefined,
                                item.image
                            )}
                        >
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={[styles.productImage, item.isSoldOut && styles.grayscaleImage]}
                                    contentFit="cover"
                                    transition={200}
                                />
                                {item.isSoldOut ? (
                                    <View style={styles.soldOutOverlay}>
                                        <View style={styles.soldOutBadge}>
                                            <Text style={styles.soldOutText}>{t('flashSale.soldOut') || 'HẾT HÀNG'}</Text>
                                        </View>
                                    </View>
                                ) : item.discountPercentage > 0 ? (
                                    <View style={styles.discountBadge}>
                                        <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                                    </View>
                                ) : null}
                            </View>

                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={1}>
                                    {item.name}
                                </Text>

                                {item.rating > 0 ? (
                                    <View style={styles.productMetaRow}>
                                        <View style={styles.ratingBadge}>
                                            <IconSymbol name="star" size={12} color={theme.colors.warning} />
                                            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                                        </View>
                                    </View>
                                ) : null}

                                {displayedIsUpcoming ? (
                                    upcomingCurrentPrice ? (
                                        <View style={styles.priceRow}>
                                            <Text style={[styles.upcomingCurrentPrice, item.isSoldOut && styles.soldOutPrice]}>
                                                {formatCurrency(upcomingCurrentPrice)}
                                            </Text>
                                        </View>
                                    ) : null
                                ) : (
                                    <View style={styles.priceRow}>
                                        <Text style={[styles.price, item.isSoldOut && styles.soldOutPrice]}>
                                            {formatCurrency(item.price)}
                                        </Text>
                                        {!item.isSoldOut && item.originalPrice > item.price ? (
                                            <Text style={styles.originalPrice}>
                                                {formatCurrency(item.originalPrice)}
                                            </Text>
                                        ) : null}
                                    </View>
                                )}

                                {displayedIsUpcoming ? (
                                    <View style={styles.upcomingInfoStrip}>
                                        <View style={styles.upcomingInfoTextGroup}>
                                            <Text style={styles.upcomingInfoLabel}>
                                                {t('flashSale.upcomingPriceLabel')}
                                            </Text>
                                        </View>
                                        <Text style={styles.upcomingInfoValue}>
                                            {formatCurrency(item.price)}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={[styles.progressBg, isUrgent && styles.progressBgUrgent, item.isSoldOut && styles.progressBgSoldOut]}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                item.isSoldOut ? styles.fullWidthSecondary : styles.dynamicWidth(Math.max(item.progress, 20)),
                                                isUrgent && styles.progressFillUrgent,
                                            ]}
                                        />
                                        <View style={styles.progressLabelContainer}>
                                            {isUrgent ? (
                                                <IconSymbol name="fire" size={10} color={theme.colors.background} />
                                            ) : null}
                                            <Text style={styles.progressText}>{progressLabel}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {shouldShowPendingShell ? <View style={styles.productsVeil} /> : null}
        </Animated.View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    productsSection: {
        position: 'relative',
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 12,
    },
    productsVeil: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.surfaceTranslucent,
    },
    productCard: {
        width: 140,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: `${theme.colors.primary}10`,
        backgroundColor: '#f8fafc',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#facc15',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderBottomLeftRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    discountText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.notification,
    },
    productInfo: {
        marginTop: theme.margins.sm,
        gap: 4,
    },
    productName: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    productMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.warning,
        fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    price: {
        fontSize: theme.fontSizes.md,
        fontWeight: 'bold',
        color: theme.colors.error,
    },
    originalPrice: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    upcomingCurrentPrice: {
        fontSize: theme.fontSizes.sm,
        fontWeight: '600',
        color: theme.colors.secondary,
    },
    progressBg: {
        position: 'relative',
        height: 12,
        backgroundColor: '#ffaa94',
        borderRadius: 5,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#ee4d2d',
        borderRadius: 9,
    },
    fullWidthSecondary: {
        width: '100%',
        backgroundColor: theme.colors.secondary,
    },
    dynamicWidth: (width: number) => ({
        width: `${width}%` as DimensionValue,
    }),
    progressLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        zIndex: 1,
    },
    progressText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: 'bold',
        color: theme.colors.background,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowRadius: 2,
    },
    soldOutCard: {
        opacity: 0.8,
    },
    grayscaleImage: {
        opacity: 0.6,
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldOutBadge: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    soldOutText: {
        color: '#fff',
        fontSize: theme.fontSizes.xs,
        fontWeight: 'bold',
    },
    soldOutPrice: {
        color: theme.colors.secondary,
    },
    progressBgUrgent: {
        backgroundColor: '#fed7aa',
    },
    progressFillUrgent: {
        backgroundColor: '#f97316',
    },
    progressBgSoldOut: {
        backgroundColor: theme.colors.secondaryLight,
    },
    upcomingInfoStrip: {
        minHeight: 32,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: theme.margins.xs + 2,
        backgroundColor: theme.colors.warningSubtle,
        borderWidth: 1,
        borderColor: theme.colors.warningLight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.margins.xs,
    },
    upcomingInfoTextGroup: {
        flex: 1,
        gap: 2,
    },
    upcomingInfoLabel: {
        fontSize: theme.fontSizes.xs,
        fontWeight: '600',
        color: theme.colors.secondary,
        flexShrink: 1,
    },
    upcomingInfoValue: {
        fontSize: theme.fontSizes.sm,
        fontWeight: 'bold',
        color: theme.colors.newPrimary,
    },
}));
