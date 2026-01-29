/**
 * CartFooter - Sticky checkout bar at bottom of cart
 * 
 * Features:
 * - Select All checkbox
 * - Total price display with savings
 * - Buy button with item count
 * - Platform voucher selector
 * - Proper safe area handling
 */

import { createScaledFontSize } from '@/constants/unistyles';
import type { CartCalculationResult, CheckboxState, VoucherUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { CartCheckbox } from './CartCheckbox';

// ============================================
// TYPES
// ============================================

interface CartFooterProps {
    /** Select All checkbox state */
    selectAllState: CheckboxState;
    /** Cart calculation results */
    calculation: CartCalculationResult;
    /** Toggle select all */
    onToggleSelectAll: () => void;
    /** Proceed to checkout */
    onCheckout: () => void;
    /** Open platform voucher selector */
    onVoucherPress?: () => void;
    /** Applied platform voucher */
    appliedPlatformVoucher?: VoucherUI | null;
    /** Height of tab bar (for proper positioning) */
    tabBarHeight?: number;
    /** Whether the cart is in edit mode */
    isEditMode?: boolean;
    /** Callback for deleting selected items */
    onDeleteSelected?: () => void;
    /** Callback for moving selected items to wishlist */
    onMoveToWishlist?: () => void;
}

const CHECKOUT_BAR_HEIGHT = 56;
const VOUCHER_BAR_HEIGHT = 44;

// ============================================
// COMPONENT
// ============================================

const AnimatedPrice: React.FC<{ value: number; isCalculating?: boolean }> = ({ value, isCalculating }) => {
    const { theme } = useUnistyles();
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);
    const [displayValue, setDisplayValue] = React.useState(value);

    // Trigger animation when value changes
    React.useEffect(() => {
        if (value !== displayValue) {
            // Sequence: Rotate out -> Switch Value -> Rotate in
            rotation.value = withSequence(
                withTiming(-90, { duration: 150 }, (finished) => {
                    if (finished) {
                        runOnJS(setDisplayValue)(value);
                        rotation.value = withTiming(0, { duration: 150 });
                    }
                })
            );
            opacity.value = withSequence(
                withTiming(0, { duration: 150 }),
                withTiming(1, { duration: 150 })
            );
        }
    }, [value]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotateX: `${rotation.value}deg` }],
        opacity: opacity.value,
    }));

    return (
        <View style={styles.priceWrapper}>
            {isCalculating && (
                <ActivityIndicator
                    size="small"
                    color={theme.colors.newPrimary}
                    style={styles.priceLoader}
                />
            )}
            <Animated.View style={[animatedStyle, isCalculating && styles.calculatingOpacity]}>
                <Text
                    style={styles.totalAmount}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    ellipsizeMode="tail"
                >
                    {formatCurrency(displayValue)}
                </Text>
            </Animated.View>
        </View>
    );
};

export const CartFooter: React.FC<CartFooterProps> = memo(({
    selectAllState,
    calculation,
    onToggleSelectAll,
    onCheckout,
    onVoucherPress,
    appliedPlatformVoucher,
    tabBarHeight = 0,
    isEditMode = false,
    onDeleteSelected,
    onMoveToWishlist,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('cart');
    const insets = useSafeAreaInsets();

    const {
        totalAmount,
        totalSavings,
        selectedCount,
    } = calculation;

    const hasSelection = selectedCount > 0;
    const showVoucherBar = onVoucherPress !== undefined;

    // Calculate total footer height for external use
    const totalFooterHeight =
        CHECKOUT_BAR_HEIGHT +
        (showVoucherBar ? VOUCHER_BAR_HEIGHT : 0) +
        insets.bottom;

    return (
        <View
            style={[
                styles.container,
                styles.dynamicBottom(tabBarHeight),
            ]}
        >
            {/* Main Checkout Bar */}
            <View style={styles.checkoutBar}>
                {/* Select All */}
                <View style={styles.selectAllContainer}>
                    <CartCheckbox
                        state={selectAllState}
                        onToggle={onToggleSelectAll}
                    />
                    <Text style={styles.selectAllText}>{t('footer.selectAll')}</Text>
                </View>

                {/* Price & Checkout OR Edit Actions */}
                <View style={styles.checkoutRight}>
                    {!isEditMode ? (
                        <>
                            {/* Price Info */}
                            <View style={styles.priceContainer}>
                                <AnimatedPrice
                                    value={totalAmount}
                                    isCalculating={calculation.isCalculating}
                                />
                                {totalSavings > 0 && (
                                    <Text style={styles.savingsText}>
                                        {t('footer.savings', { amount: formatCurrency(totalSavings) })}
                                    </Text>
                                )}
                            </View>

                            {/* Checkout Button */}
                            <Pressable
                                onPress={onCheckout}
                                disabled={!hasSelection}
                                style={[
                                    styles.checkoutButton,
                                    !hasSelection && styles.checkoutButtonDisabled,
                                ]}
                                accessibilityLabel={t('footer.checkoutWithCount', { count: selectedCount })}
                                accessibilityRole="button"
                            >
                                <Text
                                    style={styles.checkoutButtonText}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.8}
                                >
                                    {hasSelection
                                        ? t('footer.checkoutWithCount', { count: selectedCount })
                                        : t('footer.checkout')}
                                </Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <Pressable
                                onPress={onMoveToWishlist}
                                disabled={!hasSelection}
                                style={[
                                    styles.wishlistButton,
                                    !hasSelection && styles.editButtonDisabled,
                                ]}
                            >
                                <Text style={styles.wishlistButtonText}>
                                    {t('footer.moveToWishlist' as any)}
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={onDeleteSelected}
                                disabled={!hasSelection}
                                style={[
                                    styles.deleteButton,
                                    !hasSelection && styles.deleteButtonDisabled,
                                ]}
                            >
                                <Text style={styles.deleteButtonText}>
                                    {t('footer.deleteSelected' as any)}
                                </Text>
                            </Pressable>
                        </>
                    )}
                </View>
            </View>
        </View>
    );
});

CartFooter.displayName = 'CartFooter';

// Export constants for layout calculations
export { CHECKOUT_BAR_HEIGHT, VOUCHER_BAR_HEIGHT };

const styles = StyleSheet.create((theme, rt) => {
    const f = (size: number) => createScaledFontSize(size, rt.screen.width);

    return {
        container: {
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 8,
        },
        dynamicBottom: (tabBarHeight: number) => ({
            bottom: tabBarHeight,
            paddingBottom: rt.insets.bottom,
        }),
        calculatingOpacity: {
            opacity: 0.5,
        },
        voucherBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.margins.md,
            paddingVertical: theme.margins.sm,
            backgroundColor: theme.colors.activeMuted,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        voucherLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.margins.sm,
        },
        voucherLabel: {
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.typography,
        },
        voucherRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        voucherPrompt: {
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.typographySecondary,
        },
        checkoutBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.margins.md,
            paddingVertical: theme.margins.smd,
            gap: theme.margins.sm,
        },
        selectAllContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.margins.sm,
        },
        selectAllText: {
            fontSize: f(theme.fontSizes.md),
            fontWeight: '500',
            color: theme.colors.typography,
        },
        checkoutRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.margins.smd,
        },
        priceContainer: {
            alignItems: 'flex-end',
            justifyContent: 'center',
        },
        priceWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        priceLoader: {
            transform: [{ scale: 0.8 }],
        },
        totalRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            gap: 4,
        },
        totalAmount: {
            fontSize: f(theme.fontSizes.lg),
            fontWeight: '700',
            color: theme.colors.error,
        },
        savingsText: {
            fontSize: f(theme.fontSizes.xs),
            fontWeight: '500',
            color: theme.colors.success,
        },
        checkoutButton: {
            backgroundColor: theme.colors.newPrimary,
            borderRadius: theme.radius.m,
            paddingHorizontal: theme.margins.lg,
            paddingVertical: theme.margins.smd,
            shadowColor: theme.colors.newPrimary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        checkoutButtonDisabled: {
            backgroundColor: theme.colors.secondary,
            shadowOpacity: 0,
            elevation: 0,
        },
        checkoutButtonText: {
            fontSize: f(theme.fontSizes.md),
            fontWeight: '700',
            color: theme.colors.onPrimary,
        },
        editButtonDisabled: {
            opacity: 0.5,
            borderColor: theme.colors.border,
        },
        wishlistButton: {
            paddingHorizontal: theme.margins.md,
            paddingVertical: theme.margins.smd,
            borderRadius: theme.radius.m,
            borderWidth: 1,
            borderColor: theme.colors.newPrimary,
            backgroundColor: theme.colors.surface,
        },
        wishlistButtonText: {
            fontSize: f(theme.fontSizes.sm),
            fontWeight: '600',
            color: theme.colors.newPrimary,
        },
        deleteButton: {
            paddingHorizontal: theme.margins.lg,
            paddingVertical: theme.margins.smd,
            borderRadius: theme.radius.m,
            backgroundColor: theme.colors.error,
        },
        deleteButtonDisabled: {
            backgroundColor: theme.colors.secondary,
            opacity: 0.5,
        },
        deleteButtonText: {
            fontSize: f(theme.fontSizes.sm),
            fontWeight: '700',
            color: theme.colors.onPrimary,
        },
    };
});
