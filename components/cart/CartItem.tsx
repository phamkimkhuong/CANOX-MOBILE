/**
 * CartItem - Molecule component for a single cart item
 * 
 * Features:
 * - Checkbox for selection
 * - Product image with discount badge
 * - Variant selector (dropdown trigger)
 * - Quantity stepper
 * - Out of stock state
 * - Optimized with React.memo
 */

import { productRoutes } from '@/constants/routes';
import { createScaledFontSize } from '@/constants/unistyles';
import { useCountdown } from '@/hooks/useCountdown';
import { useCartStore } from '@/store/useCartStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { CartItemUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { buildImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { CountdownDigits } from '../ui/CountdownDigits';
import { IconSymbol } from '../ui/Icon';
import { QuantityStepper } from '../ui/QuantityStepper';
import { CartCheckbox } from './CartCheckbox';

const PROMOTION_RESET_THRESHOLD_SECONDS = 30;

const formatRegionLabel = (str?: string | null, t?: any) => {
    if (!str) return '';
    const upper = str.toUpperCase();
    if (upper === 'NỘI ĐỊA & QUỐC TẾ') return t ? t('item.regionBoth', 'Nội địa & Quốc tế') : 'Nội địa & Quốc tế';
    if (upper === 'NỘI ĐỊA') return t ? t('item.regionDomestic', 'Nội địa') : 'Nội địa';
    if (upper === 'QUỐC TẾ') return t ? t('item.regionInternational', 'Quốc tế') : 'Quốc tế';
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

interface CartItemProps {
    /** Cart item data */
    item: CartItemUI;
    /** Toggle selection callback (receives id) */
    onToggleSelect: (id: string) => void;
    /** Quantity change callback (receives id and value) */
    onQuantityChange: (id: string, quantity: number) => void;
    /** Variant change callback (receives id) */
    onVariantPress?: (id: string) => void;
    /** Find similar product callback (receives id) */
    onFindSimilar?: (id: string) => void;
    onDelete?: (id: string) => void;
    onPromotionExpired?: (item: CartItemUI) => void;
    isPromotionSyncing?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const CartItem: React.FC<CartItemProps> = memo(({
    item,
    onToggleSelect,
    onQuantityChange,
    onVariantPress,
    onFindSimilar,
    onDelete: _onDelete,
    onPromotionExpired,
    isPromotionSyncing = false,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('cart');
    const isSelected = useCartStore(state => state.selectedItemIds.has(item.id));

    const promotionSecondsRemaining = item.promotion?.secondsRemaining ?? 0;
    const lastPromotionSecondsRef = useRef(promotionSecondsRemaining);

    // Promotion Countdown logic
    const countdown = useCountdown({
        duration: promotionSecondsRemaining,
        autoStart: promotionSecondsRemaining > 0,
        onComplete: item.promotion && promotionSecondsRemaining > 0
            ? () => onPromotionExpired?.(item)
            : undefined,
    });
    const {
        duration: countdownDuration,
        isActive: isCountdownActive,
        isExpired: isCountdownExpired,
        reset: resetCountdown,
        start: startCountdown,
    } = countdown;

    useEffect(() => {
        const previousPromotionSeconds = lastPromotionSecondsRef.current;
        lastPromotionSecondsRef.current = promotionSecondsRemaining;

        if (promotionSecondsRemaining <= 0) {
            return;
        }

        const hasResetToNewPromotionWindow =
            promotionSecondsRemaining > previousPromotionSeconds + PROMOTION_RESET_THRESHOLD_SECONDS;

        if (isCountdownExpired || !isCountdownActive || hasResetToNewPromotionWindow) {
            resetCountdown();
            startCountdown();
        }
    }, [
        isCountdownActive,
        isCountdownExpired,
        promotionSecondsRemaining,
        resetCountdown,
        startCountdown,
    ]);

    // Evaluate region support
    const selectedAddressId = useUserAddressStore(state => state.selectedAddressId);
    const selectedAddress = useUserAddressStore(state =>
        state.addresses.find(a => a.id === selectedAddressId)
    );

    // Determine current address region from isInternational field
    const currentAddressRegion = selectedAddress
        ? (selectedAddress.isInternational ? 'INTERNATIONAL' : 'VIETNAM')
        : null;

    // Check if the current region is NOT supported by this item
    // null/empty availableRegions = supports ALL regions (no restriction)
    const isUnsupportedRegion = currentAddressRegion !== null &&
        item.availableRegions != null &&
        item.availableRegions.length > 0 &&
        !item.availableRegions.includes(currentAddressRegion);

    const isDisabled = item.isOutOfStock || isUnsupportedRegion;

    const handleProductPress = useCallback(() => {
        if (!item.productId) return;
        Navigator.push(productRoutes.detail(item.productId));
    }, [item.productId]);

    // Build region badge info
    const regionBadgeInfo = (() => {
        if (!item.regionLabel) return null;
        const regions = item.availableRegions ?? [];
        const hasVN = regions.includes('VIETNAM');
        const hasIntl = regions.includes('INTERNATIONAL');
        if (hasVN && hasIntl) return { type: 'both' as const };
        if (hasIntl) return { type: 'international' as const };
        return { type: 'domestic' as const };
    })();

    // Build friendly unsupported message
    const unsupportedMessage = isUnsupportedRegion && selectedAddress
        ? t('item.unsupportedRegion', { location: selectedAddress.provinceName || selectedAddress.countryName })
        : null;

    const {
        productName,
        variantAttributes,
        imageUrl,
        unitPrice,
        originalPrice,
        promotion,
        quantity,
        maxQuantity,
        isOutOfStock,
        lowStockWarning,
    } = item;
    const shouldShowPromotionRow = !!promotion && (isPromotionSyncing || !isCountdownExpired);

    return (
        <View style={[styles.container, isDisabled && styles.outOfStockContainer]}>
            <View style={styles.itemRow}>
                {/* Checkbox Column */}
                <View style={styles.checkboxColumn}>
                    <CartCheckbox
                        checked={isSelected}
                        onToggle={() => onToggleSelect(item.id)}
                        disabled={isDisabled}
                    />
                </View>

                {/* Product Content */}
                <View style={styles.contentRow}>
                    {/* Image */}
                    <Pressable
                        onPress={handleProductPress}
                        style={styles.imageContainer}
                    >
                        <Image
                            source={{ uri: buildImageUrl(imageUrl, null, 'medium') }}
                            style={[styles.image, isOutOfStock && styles.outOfStockImage]}
                            contentFit="cover"
                            transition={200}
                            accessibilityLabel={productName}
                        />

                        {/* Discount Badge */}
                        {promotion?.discountPercent && !isOutOfStock && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{promotion.discountPercent}%</Text>
                            </View>
                        )}

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                            <View style={styles.outOfStockOverlay}>
                                <Text style={styles.outOfStockText}>{t('item.outOfStock')}</Text>
                            </View>
                        )}
                    </Pressable>

                    {/* Info Column */}
                    <View style={[styles.infoColumn, isOutOfStock && styles.outOfStockInfo]}>
                        {/* Product Name */}
                        <Pressable
                            onPress={handleProductPress}
                        >
                            <Text
                                style={styles.productName}
                                numberOfLines={2}
                            >
                                {productName}
                            </Text>
                        </Pressable>

                        {/* Variant and Region Row */}
                        {(variantAttributes || regionBadgeInfo) && (
                            <View style={styles.variantAndRegionRow}>
                                {/* Variant Selector */}
                                {variantAttributes && (
                                    <View
                                        style={styles.variantSelector}
                                    >
                                        <Text
                                            style={styles.variantText}
                                            numberOfLines={1}
                                        >
                                            {variantAttributes}
                                        </Text>
                                    </View>
                                )}

                                {/* Region Badge - subtle pill tag */}
                                {regionBadgeInfo && (
                                    <View style={[
                                        styles.regionPill,
                                        regionBadgeInfo.type === 'international' && styles.regionPillIntl,
                                        regionBadgeInfo.type === 'both' && styles.regionPillBoth,
                                    ]}>
                                        <IconSymbol
                                            name={
                                                regionBadgeInfo.type === 'international' ? 'airplane' :
                                                    regionBadgeInfo.type === 'both' ? 'globe' : 'local-shipping'
                                            }
                                            size={12}
                                            color={
                                                regionBadgeInfo.type === 'international' ? '#0284c7' :
                                                    regionBadgeInfo.type === 'both' ? '#4f46e5' : theme.colors.forestGreen
                                            }
                                        />
                                        <Text style={[
                                            styles.regionPillText,
                                            regionBadgeInfo.type === 'international' && styles.regionPillTextIntl,
                                            regionBadgeInfo.type === 'both' && styles.regionPillTextBoth,
                                        ]}>
                                            {formatRegionLabel(item.regionLabel, t)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Promotion / Campaign Row */}
                        {shouldShowPromotionRow ? (
                            <View style={styles.campaignRow}>
                                <View style={styles.campaignNameContainer}>
                                    <Text
                                        style={styles.campaignNameText}
                                        numberOfLines={1}
                                        adjustsFontSizeToFit={true}
                                        minimumFontScale={0.5}
                                    >
                                        🏷️ {promotion?.campaignType ? promotion.campaignType.replace(/_/g, ' ') : 'SHOP SALE'}
                                    </Text>
                                </View>
                                {isPromotionSyncing ? (
                                    <View style={styles.promotionSyncState}>
                                        <ActivityIndicator size="small" color={theme.colors.error} />
                                        <Text style={styles.promotionSyncText}>
                                            {t('status.promotionSyncing')}
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.timerScale}>
                                        <CountdownDigits
                                            duration={countdownDuration}
                                            size="small"
                                            variant="sale"
                                            hideHoursIfZero={true}
                                        />
                                    </View>
                                )}
                            </View>
                        ) : null}

                        {/* Price & Quantity Row */}
                        <View style={styles.bottomRow}>
                            {/* Price */}
                            <View style={styles.priceContainer}>
                                {originalPrice && (
                                    <Text style={styles.originalPrice}>
                                        {formatCurrency(originalPrice)}
                                    </Text>
                                )}
                                <Text
                                    style={styles.currentPrice}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.5}
                                >
                                    {formatCurrency(unitPrice)}
                                </Text>
                            </View>

                            {/* Quantity Stepper or Find Similar Button */}
                            <View style={styles.stepperContainer}>
                                {isOutOfStock ? (
                                    <Pressable
                                        onPress={() => onFindSimilar?.(item.id)}
                                        style={styles.findSimilarButton}
                                        accessibilityLabel={t('item.findSimilar')}
                                        accessibilityRole="button"
                                    >
                                        <Text style={styles.findSimilarText}>{t('item.findSimilar')}</Text>
                                    </Pressable>
                                ) : (
                                    <QuantityStepper
                                        value={quantity}
                                        min={1}
                                        max={maxQuantity}
                                        onValueChange={(newQty) => onQuantityChange(item.id, newQty)}
                                        size="small"
                                        disabled={isUnsupportedRegion}
                                    />
                                )}
                            </View>
                        </View>

                        {/* Stock Warnings - moved out of price container, aligned to the right below the stepper */}
                        {promotion?.secondsRemaining && promotion.stockRemaining > 0 && !isCountdownExpired && !isPromotionSyncing ? (
                            <View style={styles.promoWarningRow}>
                                <IconSymbol name="local-fire-department" size={14} color={theme.colors.error} />
                                <Text style={[styles.lowStockWarning, styles.lowStockWarningUrgent, styles.noMarginTop]}>
                                    {t('item.promoStockWarning', { count: promotion.stockRemaining })}
                                </Text>
                            </View>
                        ) : lowStockWarning ? (
                            <Text
                                style={[
                                    styles.lowStockWarning,
                                    lowStockWarning.isUrgent && styles.lowStockWarningUrgent
                                ]}
                            >
                                {lowStockWarning.text}
                            </Text>
                        ) : null}
                    </View>
                </View>
            </View>

            {/* Unsupported Region Warning - friendly message, full width */}
            {unsupportedMessage && (
                <View style={styles.regionWarningRow}>
                    <IconSymbol name="alert-circle" size={14} color={theme.colors.warning} />
                    <Text style={styles.regionWarningText}>{unsupportedMessage}</Text>
                </View>
            )}
        </View>
    );
});

CartItem.displayName = 'CartItem';

const styles = StyleSheet.create((theme, rt) => {
    const f = (size: number) => createScaledFontSize(size, rt.screen.width);

    return {
        container: {
            flexDirection: 'column',
            paddingHorizontal: theme.margins.smd,
            paddingVertical: theme.margins.md,
            gap: theme.margins.smd,
            backgroundColor: theme.colors.surface,
        },
        itemRow: {
            flexDirection: 'row',
            gap: theme.margins.smd,
        },
        outOfStockContainer: {
            opacity: 0.7,
        },
        checkboxColumn: {
            justifyContent: 'flex-start',
            paddingTop: 24, // Align with middle of image
        },
        contentRow: {
            flex: 1,
            flexDirection: 'row',
            gap: theme.margins.smd,
        },
        imageContainer: {
            position: 'relative',
            width: 75,
            height: 75,
        },
        image: {
            width: 75,
            height: 75,
            borderRadius: theme.radius.m,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        outOfStockImage: {
            opacity: 0.6,
        },
        discountBadge: {
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: theme.colors.error,
            borderTopLeftRadius: theme.radius.m,
            borderBottomRightRadius: theme.radius.m,
            paddingHorizontal: 6,
            paddingVertical: 2,
        },
        discountText: {
            fontSize: f(theme.fontSizes.xs),
            fontWeight: '700',
            color: theme.colors.onPrimary,
        },
        outOfStockOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderBottomLeftRadius: theme.radius.m,
            borderBottomRightRadius: theme.radius.m,
            paddingVertical: 4,
            alignItems: 'center',
        },
        outOfStockText: {
            fontSize: f(theme.fontSizes.xs),
            fontWeight: '600',
            color: theme.colors.onPrimary,
        },
        infoColumn: {
            flex: 1,
            justifyContent: 'space-between',
        },
        outOfStockInfo: {
            opacity: 0.8,
        },
        productName: {
            fontSize: f(theme.fontSizes.sm),
            fontWeight: '500',
            lineHeight: 20,
            color: theme.colors.typography,
        },
        variantAndRegionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            rowGap: 4,
            columnGap: 6,
            width: '100%',
        },
        variantSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
            borderRadius: theme.radius.s,
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 4,
            flexShrink: 1,
            overflow: 'hidden',
        },
        variantText: {
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.typographySecondary,
            flexShrink: 1,
        },
        bottomRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: 8,
            gap: 8,
            width: '100%',
        },
        priceContainer: {
            gap: 2,
            flexShrink: 1,
            flexGrow: 1,
            justifyContent: 'center',
            minHeight: 28,
        },
        stepperContainer: {
            flexShrink: 0,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingTop: 0,
        },
        campaignRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            paddingHorizontal: 6,
            paddingVertical: 5,
            borderRadius: theme.radius.s,
            marginTop: 6,
            borderWidth: 0.5,
            borderColor: 'rgba(239, 68, 68, 0.2)',
            width: '100%',
            overflow: 'hidden',
        },
        campaignNameContainer: {
            flex: 1,
            flexShrink: 1,
            marginRight: 6,
            justifyContent: 'center',
        },
        campaignNameText: {
            fontSize: f(11),
            fontWeight: '600',
            color: theme.colors.error,
        },
        timerScale: {
            flexShrink: 1,
            justifyContent: 'center',
            alignItems: 'flex-end',
            transform: [{ scale: 0.85 }],
            marginRight: -4,
        },
        promotionSyncState: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            flexShrink: 1,
        },
        promotionSyncText: {
            fontSize: f(10),
            fontWeight: '600',
            color: theme.colors.error,
        },
        originalPrice: {
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.secondary,
            textDecorationLine: 'line-through',
        },
        currentPrice: {
            fontSize: f(theme.fontSizes.base),
            fontWeight: '700',
            color: theme.colors.error,
        },
        findSimilarButton: {
            borderWidth: 1,
            borderColor: theme.colors.newPrimary,
            borderRadius: theme.radius.m,
            paddingHorizontal: 8,
            paddingVertical: 6,
        },
        findSimilarText: {
            fontSize: f(theme.fontSizes.sm),
            fontWeight: '500',
            color: theme.colors.newPrimary,
        },
        lowStockWarning: {
            fontSize: f(theme.fontSizes.xs),
            fontWeight: '500',
            color: theme.colors.warning,
            marginTop: 2,
            alignSelf: 'flex-start',
        },
        lowStockWarningUrgent: {
            color: theme.colors.error,
            fontWeight: '600',
        },
        promoWarningRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            alignSelf: 'flex-start',
            gap: 4,
            marginTop: 2,
        },
        noMarginTop: {
            marginTop: 0,
        },
        // Region Pill Tag (Liquid Glass-inspired)
        regionPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(34, 197, 94, 0.06)', // Muted sage/green tint
            borderWidth: 0.5,
            borderColor: 'rgba(34, 197, 94, 0.15)', // Super fine border
            borderRadius: 6, // Rounded rect for modern premium feel
            paddingHorizontal: 6,
            paddingVertical: 3,
            flexShrink: 0,
        },
        regionPillIntl: {
            backgroundColor: 'rgba(14, 165, 233, 0.06)', // Muted sky blue
            borderColor: 'rgba(14, 165, 233, 0.15)',
        },
        regionPillBoth: {
            backgroundColor: 'rgba(99, 102, 241, 0.06)', // Soft indigo tint
            borderColor: 'rgba(99, 102, 241, 0.15)',
        },
        regionPillText: {
            fontSize: f(10),
            fontWeight: '600', // Semibold
            color: theme.colors.forestGreen, // Premium dark green
        },
        regionPillTextIntl: {
            color: '#0284c7', // Professional dark sky blue
        },
        regionPillTextBoth: {
            color: '#4f46e5', // Royal indigo for dual support
        },
        // Unsupported Region Warning (Soft amber bar)
        regionWarningRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            marginTop: 6,
            backgroundColor: 'rgba(249, 115, 22, 0.06)',
            borderWidth: 0.5,
            borderColor: 'rgba(249, 115, 22, 0.25)',
            borderRadius: theme.radius.m,
            paddingHorizontal: 8,
            paddingVertical: 5,
        },
        regionWarningText: {
            fontSize: f(theme.fontSizes.xsm),
            fontWeight: '500',
            color: theme.colors.warning,
            flex: 1,
        }
    };
});
