import { IconSymbol } from '@/components/ui/Icon';
import { SlotStatus } from '@/types/campaign';
import { FlashSaleItem } from '@/types/home';
import { formatCurrency } from '@/utils/format';
import { buildImageUrl } from '@/utils/url';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
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

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).duration(600)}
            style={styles.container}
        >
            <Pressable
                onPress={() => onPress?.(item.productId)}
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.pressed
                ]}
                disabled={isSoldOut && isLive}
            >
                {/* 1. Image Section with Glass Elements */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: buildImageUrl(item.image, null, 'thumb') }}
                        style={[styles.image, isSoldOut && styles.grayscale]}
                        contentFit="cover"
                        transition={300}
                    />

                    {/* Discount Badge - Floating Glass */}
                    {!isSoldOut && item.discountPercentage > 0 && (
                        <View style={styles.discountBadge}>
                            <BlurView intensity={30} tint="light" style={styles.badgeBlur}>
                                <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                            </BlurView>
                        </View>
                    )}

                    {/* Sold Out Overlay */}
                    {item.isSoldOut && (
                        <View style={styles.soldOutOverlay}>
                            <BlurView intensity={40} tint="dark" style={styles.soldOutBadge}>
                                <Text style={styles.soldOutLabel}>{t('flashSale.soldOut') || 'HẾT HÀNG'}</Text>
                            </BlurView>
                        </View>
                    )}
                </View>

                {/* 2. Content Section */}
                <View style={styles.content}>
                    <Text style={styles.title} numberOfLines={2}>{item.name}</Text>

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

                    {/* Progress with Glass Effect */}
                    {isLive && (
                        <View style={styles.progressContainer}>
                            <FlashSaleProgressBar
                                totalStock={item.totalStock}
                                soldCount={item.soldCount}
                                stockRemaining={item.stockRemaining}
                                isSoldOut={item.isSoldOut}
                            />
                        </View>
                    )}

                    {/* CTA - Floating Gradient Button */}
                    <View style={styles.ctaWrapper}>
                        {isUpcoming ? (
                            <Pressable
                                onPress={() => onRemindMe?.(item.id)}
                                style={({ pressed }) => [styles.remindBtn, pressed && styles.btnPressed]}
                            >
                                <IconSymbol name="notifications" size={16} color={theme.colors.primary} />
                                <Text style={styles.remindBtnText}>{t('flashSale.remindMe')}</Text>
                            </Pressable>
                        ) : (
                            <View
                                style={[
                                    styles.buyBtn,
                                    isSoldOut ? styles.disabledBtn : { backgroundColor: theme.colors.newPrimary }
                                ]}
                            >
                                <Text style={styles.buyBtnText}>
                                    {isSoldOut ? t('flashSale.soldOut') : t('flashSale.buyNow')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>

            {/* Inner Border Highlight (Specular Highlight) */}
            <View style={styles.innerStroke} />
        </Animated.View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: 10,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',

        // Shadow for depth
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    card: {
        flexDirection: 'row',
        padding: 10,
        gap: 12,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    grayscale: {
        opacity: 0.5,
    },
    discountBadge: {
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        borderBottomRightRadius: 12,
    },
    badgeBlur: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(255, 243, 232, 0.8)',
    },
    discountText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#ee4d2d',
    },
    soldOutOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    soldOutBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
    },
    soldOutLabel: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        lineHeight: 18,
    },
    priceSection: {
        marginVertical: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    salePrice: {
        fontSize: 17,
        fontWeight: '800',
        color: '#ee4d2d',
    },
    originalPrice: {
        fontSize: 12,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    textSecondary: {
        color: theme.colors.secondary,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    metaText: {
        fontSize: 11,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    progressContainer: {
        marginTop: 4,
    },
    ctaWrapper: {
        marginTop: 8,
    },
    buyBtn: {
        borderRadius: 12,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buyBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    remindBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    remindBtnText: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    disabledBtn: {
        backgroundColor: '#94a3b8',
        opacity: 0.8,
    },
    btnPressed: {
        opacity: 0.85,
    },
    innerStroke: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
}));
