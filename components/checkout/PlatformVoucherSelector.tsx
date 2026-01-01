/**
 * PlatformVoucherSelector Component
 * 
 * Allows user to select a platform-wide voucher (e.g., Free Shipping, % off).
 * These vouchers apply to the entire order, not specific shops.
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { VoucherUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import React, { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PlatformVoucherSelectorProps {
    /** Available platform vouchers */
    availableVouchers: VoucherUI[];
    /** Currently selected voucher ID */
    selectedVoucherId: string | null;
    /** Discount amount from this voucher */
    discountAmount: number;
    /** Whether the voucher is invalid (doesn't meet conditions) */
    isInvalid?: boolean;
    /** Warning message for invalid voucher */
    warningMessage?: string | null;
    /** Callback when voucher is selected/deselected */
    onSelect: (voucherId: string | null) => void;
}

export const PlatformVoucherSelector: React.FC<PlatformVoucherSelectorProps> = ({
    availableVouchers,
    selectedVoucherId,
    discountAmount,
    isInvalid = false,
    warningMessage = null,
    onSelect,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [isModalVisible, setIsModalVisible] = useState(false);

    const selectedVoucher = availableVouchers.find((v) => v.id === selectedVoucherId);

    const handleSelect = useCallback(
        (voucherId: string | null) => {
            onSelect(voucherId);
            setIsModalVisible(false);
        },
        [onSelect]
    );

    return (
        <>
            {/* Section Container */}
            <View style={styles.container}>
                {/* Title Row */}
                <View style={styles.titleRow}>
                    <View style={styles.titleIcon}>
                        <IconSymbol
                            name="percent"
                            size={18}
                            color={theme.colors.error}
                        />
                    </View>
                    <Text style={styles.title}>Voucher Ebay</Text>
                </View>

                {/* Selector */}
                <Pressable
                    style={({ pressed }) => [
                        styles.selectorRow,
                        pressed && styles.selectorRowPressed,
                    ]}
                    onPress={() => setIsModalVisible(true)}
                    accessibilityRole="button"
                    accessibilityLabel="Chọn voucher Ebay"
                >
                    {selectedVoucher ? (
                        <View style={styles.selectedContent}>
                            <View style={styles.voucherBadge}>
                                <Text style={styles.voucherBadgeText}>
                                    {selectedVoucher.discountDisplay}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.voucherCode,
                                    isInvalid && styles.voucherCodeInvalid,
                                ]}
                                numberOfLines={1}
                            >
                                {selectedVoucher.code}
                            </Text>
                            {discountAmount > 0 && !isInvalid && (
                                <Text style={styles.discountText}>
                                    -{formatCurrency(discountAmount)}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text style={styles.placeholderText}>
                            {availableVouchers.length > 0
                                ? `Chọn hoặc nhập mã (${availableVouchers.length} khả dụng)`
                                : 'Không có voucher khả dụng'}
                        </Text>
                    )}
                    <IconSymbol
                        name="chevron-right"
                        size={20}
                        color={theme.colors.typographySecondary}
                    />
                </Pressable>

                {/* Warning Message */}
                {isInvalid && warningMessage && (
                    <View style={styles.warningRow}>
                        <IconSymbol
                            name="alert-circle-outline"
                            size={16}
                            color={theme.colors.warning}
                        />
                        <Text style={styles.warningText}>{warningMessage}</Text>
                    </View>
                )}
            </View>

            {/* Selection Modal */}
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
                                            name="percent"
                                            size={22}
                                            color={theme.colors.error}
                                        />
                                        <Text style={styles.modalTitle}>
                                            Voucher Ebay
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
                                        const isShipping = voucher.code.toLowerCase().includes('freeship');

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

                                                {/* Voucher card */}
                                                <View style={styles.voucherCard}>
                                                    {/* Left badge */}
                                                    <View
                                                        style={[
                                                            styles.voucherLeftBadge,
                                                            isShipping && styles.voucherLeftBadgeShipping,
                                                        ]}
                                                    >
                                                        <IconSymbol
                                                            name={isShipping ? 'shipping' : 'percent'}
                                                            size={16}
                                                            color="#FFFFFF"
                                                        />
                                                        <Text style={styles.voucherLeftBadgeText}>
                                                            {voucher.discountDisplay}
                                                        </Text>
                                                    </View>

                                                    {/* Info */}
                                                    <View style={styles.voucherCardInfo}>
                                                        <Text style={styles.voucherCardCode}>
                                                            {voucher.code}
                                                        </Text>
                                                        <Text style={styles.voucherCardCondition}>
                                                            Đơn tối thiểu {voucher.minOrderDisplay}
                                                        </Text>
                                                        {voucher.expiresAt && (
                                                            <Text style={styles.voucherCardExpiry}>
                                                                HSD: {new Date(voucher.expiresAt).toLocaleDateString('vi-VN')}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                            </Pressable>
                                        );
                                    })}

                                    {/* Empty state */}
                                    {availableVouchers.length === 0 && (
                                        <View style={styles.emptyState}>
                                            <IconSymbol
                                                name="percent"
                                                size={48}
                                                color={theme.colors.border}
                                            />
                                            <Text style={styles.emptyText}>
                                                Không có voucher khả dụng
                                            </Text>
                                        </View>
                                    )}
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
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.sm,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.sm,
        gap: theme.margins.sm,
    },

    titleIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: `${theme.colors.error}12`,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    selectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
    },

    selectorRowPressed: {
        backgroundColor: theme.colors.background,
    },

    selectedContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
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

    voucherCode: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    voucherCodeInvalid: {
        textDecorationLine: 'line-through',
        color: theme.colors.typographySecondary,
    },

    discountText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.error,
    },

    placeholderText: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '500',
    },

    warningRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.md,
        gap: theme.margins.sm,
        backgroundColor: `${theme.colors.warning}10`,
        marginHorizontal: theme.margins.md,
        borderRadius: 8,
        paddingVertical: theme.margins.sm,
    },

    warningText: {
        fontSize: 13,
        color: theme.colors.warning,
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
        alignItems: 'center',
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
    },

    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },

    radioOuterSelected: {
        borderColor: theme.colors.primary,
    },

    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
    },

    noVoucherText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },

    voucherCard: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        overflow: 'hidden',
    },

    voucherLeftBadge: {
        width: 70,
        backgroundColor: theme.colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.margins.smd,
    },

    voucherLeftBadgeShipping: {
        backgroundColor: '#10B981',
    },

    voucherLeftBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 4,
    },

    voucherCardInfo: {
        flex: 1,
        padding: theme.margins.smd,
    },

    voucherCardCode: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    voucherCardCondition: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 4,
    },

    voucherCardExpiry: {
        fontSize: 11,
        color: theme.colors.secondary,
        marginTop: 4,
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: theme.margins.xxl,
    },

    emptyText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        marginTop: theme.margins.md,
    },

    modalFooter: {
        height: 34,
    },
}));

export default PlatformVoucherSelector;
