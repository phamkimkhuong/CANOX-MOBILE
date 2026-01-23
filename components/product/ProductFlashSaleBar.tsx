import { CountdownDigits } from '@/components/ui/CountdownDigits';
import { IconSymbol } from '@/components/ui/Icon';
import { PRODUCT_STRINGS } from '@/constants/i18n/vi/product';
import { useCountdown } from '@/hooks/useCountdown';
import type { FlashSaleInfo } from '@/types/product/productDetail';
import React, { memo, useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';


interface ProductFlashSaleBarProps {
    /** Flash Sale info từ ProductDetailUI */
    flashSale: FlashSaleInfo;
    /** Callback khi countdown kết thúc */
    onExpired?: () => void;
}

/**
 * ProductFlashSaleBar - Flash Sale banner cho Product Detail
 * 
 * Features:
 * - Sử dụng useCountdown (Single Source of Truth)
 * - Sử dụng CountdownDigits (Atomic Component)
 * - Progress bar hiển thị "Đã bán / Sắp hết"
 * - Auto hide khi expired
 * 
 * @example
 * ```tsx
 * {flashSale?.isActive && (
 *   <ProductFlashSaleBar 
 *     flashSale={flashSale} 
 *     onExpired={refetch}
 *   />
 * )}
 * ```
 */
export const ProductFlashSaleBar = memo<ProductFlashSaleBarProps>(({
    flashSale,
    onExpired,
}) => {
    const { theme } = useUnistyles();

    // Mapping UI theo campaignType
    const campaignTheme = useMemo(() => {
        const type = flashSale.campaignType;
        switch (type) {
            case 'FLASH_SALE':
                return {
                    label: 'FLASH SALE',
                    icon: 'flash' as any,
                    iconColor: '#FFD700',
                    bgColor: '#FFF5F5',
                    borderColor: '#FFE0E0',
                    textColor: theme.colors.error,
                    badgeColor: theme.colors.error,
                };
            case 'MEGA_SALE':
                return {
                    label: 'MEGA SALE',
                    icon: 'flame' as any,
                    iconColor: '#FFD700',
                    bgColor: '#F3E5F5', // Purple light
                    borderColor: '#E1BEE7',
                    textColor: '#6A1B9A', // Deep purple
                    badgeColor: '#9C27B0',
                };
            case 'DAILY_DEAL':
                return {
                    label: 'DEAL DAILY',
                    icon: 'gift' as any,
                    iconColor: '#2196F3',
                    bgColor: '#E3F2FD', // Blue light
                    borderColor: '#BBDEFB',
                    textColor: '#1565C0',
                    badgeColor: '#2196F3',
                };
            case 'SHOP_SALE':
                return {
                    label: 'SHOP SALE',
                    icon: 'tag' as any,
                    iconColor: '#FF9800',
                    bgColor: '#FFF8E1', // Amber light
                    borderColor: '#FFECB3',
                    textColor: '#EF6C00',
                    badgeColor: '#FF9800',
                };
            case 'SHOP_PROMOTION':
                return {
                    label: 'SHOP PROMOTION',
                    icon: 'gift' as any,
                    iconColor: '#E91E63',
                    bgColor: '#FCE4EC', // Pink light
                    borderColor: '#F8BBD0',
                    textColor: '#C2185B',
                    badgeColor: '#E91E63',
                };
            default:
                return {
                    label: 'FLASH SALE',
                    icon: 'flash' as any,
                    iconColor: '#FFD700',
                    bgColor: '#FFF5F5',
                    borderColor: '#FFE0E0',
                    textColor: theme.colors.error,
                    badgeColor: theme.colors.error,
                };
        }
    }, [flashSale.campaignType, theme]);

    // Sử dụng useCountdown - Ưu tiên secondsRemaining để tránh drift timezone
    const { duration, isExpired } = useCountdown({
        duration: flashSale.secondsRemaining,
        targetDate: flashSale.secondsRemaining ? undefined : flashSale.endTime,
        autoStart: true,
        onComplete: onExpired,
    });

    // Không render nếu không active hoặc đã hết hạn
    if (!flashSale.isActive || isExpired || (!flashSale.endTime && !flashSale.secondsRemaining)) {
        return null;
    }

    // Tính progress percentage
    const soldPercentage = flashSale.quantityLimit && flashSale.quantitySold !== undefined
        ? Math.min((flashSale.quantitySold / flashSale.quantityLimit) * 100, 100)
        : 0;

    // Xác định trạng thái hiển thị
    const isAlmostSoldOut = soldPercentage >= 80;
    const statusText = isAlmostSoldOut
        ? PRODUCT_STRINGS.flashSale.soldOut
        : flashSale.quantitySold && flashSale.quantitySold > 0
            ? `${PRODUCT_STRINGS.flashSale.soldPrefix} ${flashSale.quantitySold}`
            : PRODUCT_STRINGS.flashSale.selling;

    return (
        <View style={[
            styles.container,
            { backgroundColor: campaignTheme.bgColor, borderColor: campaignTheme.borderColor }
        ]}>
            {/* Header Row */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <IconSymbol name={campaignTheme.icon} size={18} color={campaignTheme.iconColor} />
                    <Text style={[styles.title, { color: campaignTheme.textColor }]}>
                        {campaignTheme.label}
                    </Text>
                    {!!flashSale.discountPercentage && flashSale.discountPercentage > 0 && (
                        <View style={[styles.discountBadge, { backgroundColor: campaignTheme.badgeColor }]}>
                            <Text style={styles.discountText}>
                                -{flashSale.discountPercentage}%
                            </Text>
                        </View>
                    )}
                </View>

                {/* Countdown - Sử dụng CountdownDigits */}
                <CountdownDigits
                    duration={duration}
                    size="small"
                    variant="dark"
                />
            </View>

            {/* Progress Bar */}
            {!!flashSale.quantityLimit && flashSale.quantityLimit > 0 && (
                <View style={styles.progressContainer}>
                    <View style={[styles.progressTrack, { backgroundColor: campaignTheme.borderColor }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${Math.max(soldPercentage, 15)}%`, // Min 15% để luôn thấy
                                    backgroundColor: isAlmostSoldOut
                                        ? theme.colors.error
                                        : campaignTheme.badgeColor,
                                },
                            ]}
                        />
                        {/* Fire icon for urgency */}
                        {isAlmostSoldOut && (
                            <View style={styles.fireIcon}>
                                <IconSymbol name="flame" size={12} color="#FFF" />
                            </View>
                        )}
                    </View>
                    <Text style={[
                        styles.statusText,
                        { color: isAlmostSoldOut ? theme.colors.error : campaignTheme.textColor },
                        isAlmostSoldOut && styles.statusTextUrgent,
                    ]}>
                        {statusText}
                    </Text>
                </View>
            )}
        </View>
    );
});

ProductFlashSaleBar.displayName = 'ProductFlashSaleBar';

export const styles = StyleSheet.create((theme) => ({
    container: {
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: theme.margins.sm,
        marginBottom: theme.margins.sm,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    title: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    discountBadge: {
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.surface,
    },
    progressContainer: {
        marginTop: 6,
        gap: 2,
    },
    progressTrack: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 4,
    },
    fireIcon: {
        position: 'absolute',
        right: 4,
        top: 1,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    statusTextUrgent: {
        fontWeight: '700',
    },
}));
