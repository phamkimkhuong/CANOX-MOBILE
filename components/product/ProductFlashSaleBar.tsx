import { CountdownDigits } from '@/components/ui/CountdownDigits';
import { IconSymbol } from '@/components/ui/Icon';
import { useCountdown } from '@/hooks/useCountdown';
import type { FlashSaleInfo } from '@/types/productDetail';
import React, { memo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// TYPES
// ============================================

interface ProductFlashSaleBarProps {
    /** Flash Sale info từ ProductDetailUI */
    flashSale: FlashSaleInfo;
    /** Callback khi countdown kết thúc */
    onExpired?: () => void;
}

// ============================================
// COMPONENT
// ============================================

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

    // Sử dụng useCountdown - Single Source of Truth
    const { duration, isExpired } = useCountdown({
        targetDate: flashSale.endTime,
        autoStart: true,
        onComplete: onExpired,
    });

    // Không render nếu không active hoặc đã hết hạn
    if (!flashSale.isActive || isExpired || !flashSale.endTime) {
        return null;
    }

    // Tính progress percentage
    const soldPercentage = flashSale.quantityLimit && flashSale.quantitySold !== undefined
        ? Math.min((flashSale.quantitySold / flashSale.quantityLimit) * 100, 100)
        : 0;

    // Xác định trạng thái hiển thị
    const isAlmostSoldOut = soldPercentage >= 80;
    const statusText = isAlmostSoldOut
        ? 'Sắp hết hàng'
        : flashSale.quantitySold && flashSale.quantitySold > 0
            ? `Đã bán ${flashSale.quantitySold}`
            : 'Đang bán chạy';

    return (
        <View style={styles.container}>
            {/* Header Row */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <IconSymbol name="bolt" size={18} color="#FFD700" />
                    <Text style={styles.title}>FLASH SALE</Text>
                    {flashSale.discountPercentage && flashSale.discountPercentage > 0 && (
                        <View style={styles.discountBadge}>
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
                    showLabel
                    labelText="Kết thúc trong"
                />
            </View>

            {/* Progress Bar */}
            {flashSale.quantityLimit && flashSale.quantityLimit > 0 && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${Math.max(soldPercentage, 15)}%`, // Min 15% để luôn thấy
                                    backgroundColor: isAlmostSoldOut
                                        ? theme.colors.error
                                        : theme.colors.warning,
                                },
                            ]}
                        />
                        {/* Fire icon for urgency */}
                        {isAlmostSoldOut && (
                            <View style={styles.fireIcon}>
                                <IconSymbol name="local-fire-department" size={12} color="#FFF" />
                            </View>
                        )}
                    </View>
                    <Text style={[
                        styles.statusText,
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

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: '#FFF5F5',
        borderRadius: theme.radius.m,
        padding: theme.margins.smd,
        marginBottom: theme.margins.md,
        borderWidth: 1,
        borderColor: '#FFE0E0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: theme.margins.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 14,
        fontWeight: '800',
        color: theme.colors.error,
        letterSpacing: 1,
    },
    discountBadge: {
        backgroundColor: theme.colors.error,
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    discountText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.surface,
    },
    progressContainer: {
        marginTop: theme.margins.sm,
        gap: 4,
    },
    progressTrack: {
        height: 18,
        backgroundColor: '#FFE0E0',
        borderRadius: 9,
        overflow: 'hidden',
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: 4,
    },
    fireIcon: {
        position: 'absolute',
        right: 4,
        top: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.warning,
        textAlign: 'center',
    },
    statusTextUrgent: {
        color: theme.colors.error,
        fontWeight: '700',
    },
}));
