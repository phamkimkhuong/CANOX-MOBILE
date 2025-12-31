/**
 * CheckoutFooter Component
 * 
 * Sticky footer for checkout screen.
 * Contains:
 * - Total price display
 * - "Đặt hàng" button
 * - Loading/disabled states
 */

import { IconSymbol } from '@/components/ui/Icon';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

interface CheckoutFooterProps {
    /** Total amount to pay */
    totalAmount: number;
    /** Number of items */
    itemCount: number;
    /** Whether order can be placed */
    canPlaceOrder: boolean;
    /** Reasons why order cannot be placed */
    blockReasons: string[];
    /** Whether order is being submitted */
    isSubmitting: boolean;
    /** Callback when place order button is pressed */
    onPlaceOrder: () => void;
}

export const CheckoutFooter: React.FC<CheckoutFooterProps> = ({
    totalAmount,
    itemCount,
    canPlaceOrder,
    blockReasons,
    isSubmitting,
    onPlaceOrder,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const isDisabled = !canPlaceOrder || isSubmitting;
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
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalAmount}>
                        {formatCurrency(totalAmount)}
                    </Text>
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
                    accessibilityLabel={`Đặt hàng, tổng ${formatCurrency(totalAmount)}`}
                    accessibilityState={{ disabled: isDisabled }}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.orderButtonText}>
                            Đặt hàng ({itemCount})
                        </Text>
                    )}
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
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },

    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.error,
        marginTop: 2,
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
