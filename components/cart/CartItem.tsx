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
import { useCartStore } from '@/store/useCartStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { CartItemUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { buildImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';
import { QuantityStepper } from '../ui/QuantityStepper';
import { CartCheckbox } from './CartCheckbox';

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
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('cart');
    const isSelected = useCartStore(state => state.selectedItemIds.has(item.id));

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
        discountPercent,
        quantity,
        maxQuantity,
        isOutOfStock,
        lowStockWarning,
    } = item;
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
                        style={({ pressed }) => [
                            styles.imageContainer,
                            pressed && styles.imagePressed
                        ]}
                    >
                        <Image
                            source={{ uri: buildImageUrl(imageUrl, null, 'medium') }}
                            style={[styles.image, isOutOfStock && styles.outOfStockImage]}
                            contentFit="cover"
                            transition={200}
                            accessibilityLabel={productName}
                        />

                        {/* Discount Badge */}
                        {discountPercent && !isOutOfStock && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{discountPercent}%</Text>
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
                            {({ pressed }) => (
                                <Text
                                    style={[
                                        styles.productName,
                                        pressed && styles.productNamePressed
                                    ]}
                                    numberOfLines={2}
                                >
                                    {productName}
                                </Text>
                            )}
                        </Pressable>

                        {/* Variant Selector */}
                        {variantAttributes && (
                            <Pressable
                                onPress={() => onVariantPress?.(item.id)}
                                style={styles.variantSelector}
                                disabled={isDisabled}
                                accessibilityLabel={t('item.selectVariation')}
                                accessibilityRole="button"
                            >
                                <Text style={styles.variantText} numberOfLines={1}>
                                    {variantAttributes}
                                </Text>
                                <IconSymbol
                                    name="chevron-down"
                                    size={14}
                                    color={theme.colors.secondary}
                                />
                            </Pressable>
                        )}

                        {/* Region Badge - subtle pill tag */}
                        {regionBadgeInfo && (
                            <View style={[
                                styles.regionPill,
                                regionBadgeInfo.type === 'international' && styles.regionPillIntl,
                                regionBadgeInfo.type === 'both' && styles.regionPillBoth,
                            ]}>
                                <View style={[
                                    styles.regionDot,
                                    regionBadgeInfo.type === 'international' && styles.regionDotIntl,
                                    regionBadgeInfo.type === 'both' && styles.regionDotBoth,
                                ]} />
                                <Text style={[
                                    styles.regionPillText,
                                    regionBadgeInfo.type === 'international' && styles.regionPillTextIntl,
                                    regionBadgeInfo.type === 'both' && styles.regionPillTextBoth,
                                ]}>
                                    {item.regionLabel}
                                </Text>
                            </View>
                        )}

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
                                {/* Low Stock Warning */}
                                {lowStockWarning && (
                                    <Text
                                        style={[
                                            styles.lowStockWarning,
                                            lowStockWarning.isUrgent && styles.lowStockWarningUrgent
                                        ]}
                                    >
                                        {lowStockWarning.text}
                                    </Text>
                                )}
                            </View>

                            {/* Quantity Stepper or Find Similar Button */}
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
            paddingTop: 32, // Align with middle of image
        },
        contentRow: {
            flex: 1,
            flexDirection: 'row',
            gap: theme.margins.smd,
        },
        imageContainer: {
            position: 'relative',
            width: 96,
            height: 96,
        },
        image: {
            width: 96,
            height: 96,
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
        productNamePressed: {
            color: theme.colors.newPrimary,
            opacity: 0.7,
        },
        imagePressed: {
            opacity: 0.8,
            transform: [{ scale: 0.96 }],
        },
        textPressed: {
            opacity: 0.7,
        },
        variantSelector: {
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.background,
            borderRadius: theme.radius.s,
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 4,
            marginTop: 4,
        },
        variantText: {
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.typographySecondary,
        },
        bottomRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 8,
            gap: 8,
        },
        priceContainer: {
            gap: 2,
            flex: 1,
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
        },
        lowStockWarningUrgent: {
            color: theme.colors.error,
            fontWeight: '600',
        },
        // Region Pill Tag (Liquid Glass-inspired)
        regionPill: {
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(34, 197, 94, 0.06)',
            borderWidth: 0.5,
            borderColor: 'rgba(34, 197, 94, 0.3)',
            borderRadius: theme.radius.l,
            paddingHorizontal: 8,
            paddingVertical: 3,
            marginTop: 5,
        },
        regionPillIntl: {
            backgroundColor: 'rgba(14, 165, 233, 0.06)',
            borderColor: 'rgba(14, 165, 233, 0.3)',
        },
        regionPillBoth: {
            backgroundColor: 'rgba(0, 136, 204, 0.06)',
            borderColor: 'rgba(0, 136, 204, 0.25)',
        },
        regionDot: {
            width: 5,
            height: 5,
            borderRadius: 3,
            backgroundColor: theme.colors.success,
        },
        regionDotIntl: {
            backgroundColor: theme.colors.info,
        },
        regionDotBoth: {
            backgroundColor: theme.colors.primary,
        },
        regionPillText: {
            fontSize: f(theme.fontSizes.xs),
            fontWeight: '500',
            color: theme.colors.success,
            letterSpacing: 0.2,
        },
        regionPillTextIntl: {
            color: theme.colors.info,
        },
        regionPillTextBoth: {
            color: theme.colors.primary,
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
