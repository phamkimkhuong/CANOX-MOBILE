/**
 * CheckoutFooter Component
 * 
 * Sticky footer for checkout screen.
 * Contains:
 * - Total price display
 * - "Đặt hàng" button
 * - Disabled state when order cannot be placed
 */

import { IconSymbol } from '@/components/ui/Icon';
import { formatCurrency } from '@/utils/format';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface CheckoutFooterProps {
    /** Total amount to pay */
    totalAmount: number;
    /** Number of items */
    itemCount: number;
    /** Total savings amount */
    totalSavings?: number;
    /** Whether order can be placed */
    canPlaceOrder: boolean;
    /** Reasons why order cannot be placed */
    blockReasons: string[];
    /** Callback when place order button is pressed */
    onPlaceOrder: () => void;
}

export const CheckoutFooter: React.FC<CheckoutFooterProps> = ({
    totalAmount,
    itemCount,
    totalSavings = 0,
    canPlaceOrder,
    blockReasons,
    onPlaceOrder,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('checkout');
    const styles = stylesheet;

    const isDisabled = !canPlaceOrder;
    const firstBlockReason = blockReasons[0];

    return (
        <View style={styles.container}>
            {/* Warning if blocked */}
            {!canPlaceOrder && firstBlockReason && (
                <View style={styles.warningRow}>
                    <IconSymbol
                        name="alert-circle-outline"
                        size={16}
                        color={theme.colors.warning}
                    />
                    <Text style={styles.warningText} numberOfLines={1}>
                        {firstBlockReason}
                    </Text>
                </View>
            )}

            {/* Main Footer */}
            <View style={styles.mainRow}>
                {/* Total Section */}
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>{t('footer.total')}</Text>
                    <Text style={styles.totalAmount}>
                        {formatCurrency(totalAmount)}
                    </Text>
                    {totalSavings > 0 && (
                        <View style={styles.savingsRow}>
                            <IconSymbol
                                name="check-circle"
                                size={14}
                                color={theme.colors.success}
                            />
                            <Text style={styles.savingsText}>
                                {t('footer.savings', { amount: formatCurrency(totalSavings) })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Place Order Button */}
                <Pressable
                    style={({ pressed }) => [
                        styles.orderButton,
                        isDisabled && styles.orderButtonDisabled,
                        pressed && !isDisabled && styles.orderButtonPressed,
                    ]}
                    onPress={onPlaceOrder}
                    disabled={isDisabled}
                    accessibilityRole="button"
                    accessibilityLabel={t('footer.accessibilityPlaceOrder', { amount: formatCurrency(totalAmount) })}
                    accessibilityState={{ disabled: isDisabled }}
                >
                    <Text style={styles.orderButtonText}>
                        {t('footer.placeOrderWithCount', { count: itemCount })}
                    </Text>
                </Pressable>
            </View>

            {/* Safe Area Bottom Padding */}
            <View style={{ height: UnistylesRuntime.insets.bottom || 16 }} />
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },

    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        backgroundColor: `${theme.colors.warning}12`,
        gap: 6,
    },

    warningText: {
        fontSize: 13,
        color: theme.colors.warning,
        fontWeight: '500',
    },

    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
    },

    totalSection: {
        flex: 1,
        marginRight: theme.margins.md,
    },

    totalLabel: {
        fontWeight: '600',
        fontSize: 14,
        color: theme.colors.typography,
    },

    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.error,
        marginTop: 2,
    },

    savingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },

    savingsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },

    orderButton: {
        backgroundColor: theme.colors.error,
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.xl,
        borderRadius: 12,
        minWidth: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },

    orderButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },

    orderButtonDisabled: {
        backgroundColor: theme.colors.border,
    },

    orderButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
}));

export default CheckoutFooter;
