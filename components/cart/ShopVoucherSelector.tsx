/**
 * ShopVoucherSelector - Molecule for shop voucher selection
 * 
 * Displays:
 * - Applied voucher summary
 * - "Select Voucher" prompt if none applied
 * - Opens voucher selection bottom sheet on press
 * 
 * @example
 * <ShopVoucherSelector 
 *   appliedVoucher={voucher}
 *   onPress={() => openVoucherSheet(shopId)}
 * />
 */

import type { VoucherUI } from '@/types/cart';
import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../ui/Icon';

// ============================================
// TYPES
// ============================================

interface ShopVoucherSelectorProps {
    /** Currently applied voucher (null if none) */
    appliedVoucher: VoucherUI | null;
    /** Available vouchers count */
    availableCount?: number;
    /** Press handler to open voucher selection */
    onPress: () => void;
    /** Disabled state */
    disabled?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const ShopVoucherSelector: React.FC<ShopVoucherSelectorProps> = memo(({
    appliedVoucher,
    availableCount = 0,
    onPress,
    disabled = false,
}) => {
    const { theme } = useUnistyles();

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[styles.container, disabled && styles.disabled]}
            accessibilityLabel={appliedVoucher ? 'Thay đổi voucher' : 'Chọn voucher'}
            accessibilityRole="button"
        >
            {/* Voucher Icon */}
            <IconSymbol
                name="confirmation-number"
                size={18}
                color={theme.colors.primary}
            />

            {/* Voucher Content */}
            <View style={styles.content}>
                {appliedVoucher ? (
                    <Text style={styles.appliedText} numberOfLines={1}>
                        {appliedVoucher.discountDisplay} - {appliedVoucher.minOrderDisplay}
                    </Text>
                ) : availableCount > 0 ? (
                    <Text style={styles.promptText}>
                        Có {availableCount} voucher khả dụng
                    </Text>
                ) : (
                    <Text style={styles.promptText}>
                        Chọn hoặc nhập mã
                    </Text>
                )}
            </View>

            {/* Action */}
            <View style={styles.action}>
                {appliedVoucher ? (
                    <Text style={styles.changeText}>Thay đổi</Text>
                ) : (
                    <IconSymbol
                        name="chevron-right"
                        size={18}
                        color={theme.colors.secondary}
                    />
                )}
            </View>
        </Pressable>
    );
});

ShopVoucherSelector.displayName = 'ShopVoucherSelector';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.smd,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primaryMuted,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: theme.margins.sm,
    },
    disabled: {
        opacity: 0.5,
    },
    content: {
        flex: 1,
    },
    appliedText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    promptText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    action: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    changeText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.primary,
    },
}));
