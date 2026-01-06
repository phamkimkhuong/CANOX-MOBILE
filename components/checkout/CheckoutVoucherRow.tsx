/**
 * CheckoutVoucherRow Component
 * 
 * Displays applied shop voucher with discount.
 * Tap to open voucher selector bottom sheet.
 * Re-uses the ShopVoucherSelector from cart flow.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { VoucherUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import React, { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CheckoutVoucherRowProps {
    /** Available vouchers for this shop */
    availableVouchers: VoucherUI[];
    /** Currently selected voucher ID */
    selectedVoucherId: string | null;
    /** Discount amount to display */
    discountAmount: number;
    /** Callback when voucher is selected/deselected */
    onSelect: (voucherId: string | null) => void;
    /** Whether selection is disabled */
    disabled?: boolean;
}

export const CheckoutVoucherRow: React.FC<CheckoutVoucherRowProps> = ({
    availableVouchers,
    selectedVoucherId,
    discountAmount,
    onSelect,
    disabled = false,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [isModalVisible, setIsModalVisible] = useState(false);

    const selectedVoucher = availableVouchers.find((v) => v.id === selectedVoucherId);

    const handleOpenModal = useCallback(() => {
        if (!disabled) {
            setIsModalVisible(true);
        }
    }, [disabled]);

    const handleSelect = useCallback((voucherId: string | null) => {
        onSelect(voucherId);
        setIsModalVisible(false);
    }, [onSelect]);

    return (
        <>
            {/* Row Display */}
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && !disabled && availableVouchers.length > 0 && styles.containerPressed,
                    (disabled || availableVouchers.length === 0) && styles.containerDisabled,
                ]}
                onPress={handleOpenModal}
                disabled={disabled || availableVouchers.length === 0}
                accessibilityRole="button"
                accessibilityLabel="Chọn voucher Shop"
            >
                <View style={styles.iconWrapper}>
                    <IconSymbol
                        name="percent"
                        size={18}
                        color={theme.colors.error}
                    />
                </View>

                <View style={styles.content}>
                    {selectedVoucher ? (
                        <View style={styles.selectedRow}>
                            <Text style={styles.voucherCode}>
                                {selectedVoucher.code}
                            </Text>
                            {discountAmount > 0 && (
                                <Text style={styles.discountText}>
                                    -{formatCurrency(discountAmount)}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text style={[
                            styles.placeholderText,
                            availableVouchers.length === 0 && { color: theme.colors.typographySecondary }
                        ]}>
                            {availableVouchers.length > 0
                                ? `Chọn Voucher Shop (${availableVouchers.length} khả dụng)`
                                : 'Không có voucher khả dụng'}
                        </Text>
                    )}
                </View>

                {availableVouchers.length > 0 && (
                    <IconSymbol
                        name="chevron-right"
                        size={18}
                        color={theme.colors.typographySecondary}
                    />
                )}
            </Pressable>

            {/* Voucher Selection Modal */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                {/* Handle bar */}
                                <View style={styles.handleBar} />

                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalHeaderLeft}>
                                        <IconSymbol
                                            name="confirmation-number"
                                            size={22}
                                            color={theme.colors.error}
                                        />
                                        <Text style={styles.modalTitle}>
                                            Voucher của Shop
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={() => setIsModalVisible(false)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <IconSymbol
                                            name="close"
                                            size={22}
                                            color={theme.colors.typographySecondary}
                                        />
                                    </Pressable>
                                </View>

                                {/* Voucher List */}
                                <ScrollView style={styles.voucherList}>
                                    {/* Option: No voucher */}
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.voucherItem,
                                            !selectedVoucherId && styles.voucherItemSelected,
                                            pressed && styles.voucherItemPressed,
                                        ]}
                                        onPress={() => handleSelect(null)}
                                    >
                                        <View style={styles.radioContainer}>
                                            <View
                                                style={[
                                                    styles.radioOuter,
                                                    !selectedVoucherId && styles.radioOuterSelected,
                                                ]}
                                            >
                                                {!selectedVoucherId && (
                                                    <View style={styles.radioInner} />
                                                )}
                                            </View>
                                        </View>
                                        <Text style={styles.noVoucherText}>
                                            Không sử dụng voucher
                                        </Text>
                                    </Pressable>

                                    {/* Voucher options */}
                                    {availableVouchers.map((voucher) => {
                                        const isSelected = voucher.id === selectedVoucherId;
                                        return (
                                            <Pressable
                                                key={voucher.id}
                                                style={({ pressed }) => [
                                                    styles.voucherItem,
                                                    isSelected && styles.voucherItemSelected,
                                                    pressed && styles.voucherItemPressed,
                                                ]}
                                                onPress={() => handleSelect(voucher.id)}
                                            >
                                                <View style={styles.radioContainer}>
                                                    <View
                                                        style={[
                                                            styles.radioOuter,
                                                            isSelected && styles.radioOuterSelected,
                                                        ]}
                                                    >
                                                        {isSelected && (
                                                            <View style={styles.radioInner} />
                                                        )}
                                                    </View>
                                                </View>

                                                <View style={styles.voucherInfo}>
                                                    <View style={styles.voucherHeader}>
                                                        <View style={styles.voucherBadge}>
                                                            <Text style={styles.voucherBadgeText}>
                                                                {voucher.discountDisplay}
                                                            </Text>
                                                        </View>
                                                        <Text style={styles.voucherCode}>
                                                            {voucher.code}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.voucherCondition}>
                                                        Đơn tối thiểu {voucher.minOrderDisplay}
                                                    </Text>
                                                    {voucher.expiresAt && (
                                                        <Text style={styles.voucherExpiry}>
                                                            HSD: {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                                                        </Text>
                                                    )}
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </ScrollView>

                                {/* Footer spacing */}
                                <View style={styles.modalFooter} />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
        gap: theme.margins.sm,
    },

    containerPressed: {
        backgroundColor: theme.colors.background,
    },

    containerDisabled: {
        opacity: 0.5,
    },

    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: `${theme.colors.error}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },

    content: {
        flex: 1,
    },

    selectedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    voucherCode: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    discountText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.error,
    },

    placeholderText: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },

    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '75%',
    },

    handleBar: {
        width: 36,
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: theme.margins.sm,
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },

    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },

    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    voucherList: {
        maxHeight: 400,
    },

    voucherItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: theme.margins.md,
        paddingHorizontal: theme.margins.lg,
    },

    voucherItemSelected: {
        backgroundColor: `${theme.colors.primary}08`,
    },

    voucherItemPressed: {
        backgroundColor: theme.colors.background,
    },

    radioContainer: {
        marginRight: theme.margins.md,
        marginTop: 2,
    },

    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },

    radioOuterSelected: {
        borderColor: theme.colors.primary,
    },

    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },

    noVoucherText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },

    voucherInfo: {
        flex: 1,
    },

    voucherHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        marginBottom: 4,
    },

    voucherBadge: {
        backgroundColor: theme.colors.error,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },

    voucherBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    voucherCondition: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },

    voucherExpiry: {
        fontSize: 11,
        color: theme.colors.secondary,
        marginTop: 2,
    },

    modalFooter: {
        height: 34,
    },
}));

export default CheckoutVoucherRow;
