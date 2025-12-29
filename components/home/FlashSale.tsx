import { IconSymbol } from '@/components/ui/Icon';
import { useFlashSale } from '@/hooks/api/useFlashSale';
import { formatTimeLeft } from '@/utils/date';
import { formatCurrency } from '@/utils/format';
import { Image } from 'expo-image';
import React, { memo, useEffect, useState } from 'react';
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

    // Fetch data từ API
    const { data: flashSaleData, isLoading, isError } = useFlashSale();

    // State cho đồng hồ đếm ngược
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!flashSaleData?.slot.endTime) return;

        const timer = setInterval(() => {
            const time = formatTimeLeft(flashSaleData.slot.endTime);
            if (time.total <= 0) {
                clearInterval(timer);
                // Có thể trigger refetch ở đây
            } else {
                setTimeLeft({
                    hours: time.hours,
                    minutes: time.minutes,
                    seconds: time.seconds,
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [flashSaleData?.slot.endTime]);
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
                    <Text style={styles.title}>FLASH SALE</Text>
                    <View style={styles.timerRow}>
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
                    <Text style={styles.seeAllText}>Xem tất cả</Text>
                    <IconSymbol name="chevron-right" size={16} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Products Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {flashSaleData.items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.productCard}
                        activeOpacity={0.8}
                        onPress={() => onProductPress?.(item.id)}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: item.image }}
                                style={styles.productImage}
                                contentFit="cover"
                                transition={200}
                            />
                            {item.discountPercentage > 0 && (
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>-{item.discountPercentage}%</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text style={styles.price}>
                                {formatCurrency(item.price)}
                            </Text>
                            {/* Progress Bar */}
                            <View style={styles.progressBg}>
                                {/* Progress Fill with gradient effect */}
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${Math.max(item.progress, 30)}%` }, // Min 30% để luôn thấy màu
                                    ]}
                                />
                                <View style={styles.progressLabelContainer}>

                                    <Text style={styles.progressText}>
                                        {item.soldCount > 0 ? `Đã bán ${item.soldCount}` : 'Đang bán chạy'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
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
        fontSize: 18,
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
        fontSize: 12,
        fontWeight: 'bold',
    },
    timerColon: {
        color: theme.colors.typography,
        fontWeight: 'bold',
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 12,
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
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: theme.colors.error,
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
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.background,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowRadius: 2,
    },
}));

