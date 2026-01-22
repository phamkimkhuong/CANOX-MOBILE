import { IconSymbol } from '@/components/ui/Icon';
import { useActiveFlashSale } from '@/hooks/api/useActiveFlashSale';
import { formatTimeLeft } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { Image } from 'expo-image';
import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { FlashSaleSkeleton } from './FlashSaleSkeleton';

/**
 * FlashSale - Component hiển thị sản phẩm Flash Sale
 */
interface FlashSaleProps {
    onProductPress?: (productId: string) => void;
}

export const FlashSale = memo(({ onProductPress }: FlashSaleProps = {}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const { t } = useTranslation('home');

    // Fetch data from API Campaign Slots
    const { data: flashSaleData, isLoading, isError, refetch } = useActiveFlashSale();

    // State for timer
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!flashSaleData?.slot?.endTime) return;

        const updateTimer = () => {
            const time = formatTimeLeft(flashSaleData.slot.endTime);
            if (time.total <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                // When time is up, refetch to get the next slot or hide the component
                refetch();
            } else {
                setTimeLeft({
                    days: time.days,
                    hours: time.hours,
                    minutes: time.minutes,
                    seconds: time.seconds,
                });
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);
    }, [flashSaleData?.slot?.endTime, refetch]);

    if (isLoading) {
        return <FlashSaleSkeleton />;
    }

    if (isError || !flashSaleData || flashSaleData.items.length === 0) {
        return null;
    }
    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{t('flashSale.title')}</Text>
                    <View style={styles.timerRow}>
                        {timeLeft.days > 0 && (
                            <>
                                <View style={styles.timerBox}>
                                    <Text style={styles.timerText}>{timeLeft.days}</Text>
                                </View>
                                <Text style={styles.timerDayText}>ngày</Text>
                            </>
                        )}
                        <View style={styles.timerBox}>
                            <Text style={styles.timerText}>{formatNumber(timeLeft.hours)}</Text>
                        </View>
                        <Text style={styles.timerColon}>:</Text>
                        <View style={styles.timerBox}>
                            <Text style={styles.timerText}>{formatNumber(timeLeft.minutes)}</Text>
                        </View>
                        <Text style={styles.timerColon}>:</Text>
                        <View style={styles.timerBox}>
                            <Text style={styles.timerText}>{formatNumber(timeLeft.seconds)}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>{t('flashSale.seeAll')}</Text>
                    <IconSymbol name="chevron-right" size={16} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Products Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {flashSaleData.items.map((item) => {
                    const isUrgent = item.progress >= 80 && !item.isSoldOut;
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
                            onPress={() => !item.isSoldOut && onProductPress?.(item.productId)}
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
                                ) : (
                                    item.discountPercentage > 0 && (
                                        <View style={styles.discountBadge}>
                                            <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                                        </View>
                                    )
                                )}
                            </View>
                            <View style={styles.productInfo}>
                                <Text style={styles.productName} numberOfLines={1}>
                                    {item.name}
                                </Text>
                                <View style={styles.priceRow}>
                                    <Text style={[styles.price, item.isSoldOut && styles.soldOutPrice]}>
                                        {formatCurrency(item.price)}
                                    </Text>
                                    {!item.isSoldOut && item.originalPrice > item.price && (
                                        <Text style={styles.originalPrice}>
                                            {formatCurrency(item.originalPrice)}
                                        </Text>
                                    )}
                                </View>
                                {/* Progress Bar */}
                                <View style={[styles.progressBg, isUrgent && styles.progressBgUrgent, item.isSoldOut && styles.progressBgSoldOut]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            item.isSoldOut ? { width: '100%', backgroundColor: theme.colors.secondary } : { width: `${Math.max(item.progress, 20)}%` },
                                            isUrgent && styles.progressFillUrgent
                                        ]}
                                    />
                                    <View style={styles.progressLabelContainer}>
                                        {isUrgent && (
                                            <IconSymbol name="fire" size={10} color={theme.colors.background} />
                                        )}
                                        <Text style={styles.progressText}>
                                            {progressLabel}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.m,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: theme.fontSizes.base,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: theme.colors.warning,
        letterSpacing: 0.5,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerBox: {
        backgroundColor: theme.colors.typography,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    timerText: {
        color: theme.colors.surface,
        fontSize: theme.fontSizes.xs,
        fontWeight: 'bold',
    },
    timerColon: {
        color: theme.colors.typography,
        fontWeight: 'bold',
    },
    timerDayText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.typography,
        fontWeight: '600',
        marginHorizontal: 1,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 12,
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
    // Sold Out Styles
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
    // Urgent / Progress Styles
    progressBgUrgent: {
        backgroundColor: '#fed7aa', // Light orange
    },
    progressFillUrgent: {
        backgroundColor: '#f97316', // Bright orange
    },
    progressBgSoldOut: {
        backgroundColor: theme.colors.secondaryLight,
    },
}));

