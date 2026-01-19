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
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
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
    const { t, i18n } = useTranslation('checkout');
    const styles = stylesheet;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [manualCode, setManualCode] = useState('');

    const selectedVoucher = availableVouchers.find((v) => v.id === selectedVoucherId);

    const handleOpenModal = useCallback(() => {
        if (!disabled) {
            setIsModalVisible(true);
        }
    }, [disabled]);

    const handleSelect = useCallback((voucherId: string | null) => {
        onSelect(voucherId);
        setIsModalVisible(false);
        setManualCode('');
    }, [onSelect]);

    const handleManualApply = useCallback(() => {
        if (!manualCode.trim()) return;
        onSelect(manualCode.trim().toUpperCase());
        setIsModalVisible(false);
        setManualCode('');
    }, [manualCode, onSelect]);

    return (
        <>
            {/* Whole section is pressable for better UX */}
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && !disabled && availableVouchers.length > 0 && styles.containerPressed,
                    (disabled || availableVouchers.length === 0) && styles.containerDisabled,
                ]}
                onPress={handleOpenModal}
                disabled={disabled || availableVouchers.length === 0}
                accessibilityRole="button"
                accessibilityLabel={t('voucher.selectShopVoucher')}
            >
                {/* Section Title */}
                <View style={styles.titleRow}>
                    <View style={styles.titleIcon}>
                        <IconSymbol
                            name="percent"
                            size={18}
                            color={theme.colors.error}
                        />
                    </View>
                    <Text style={styles.title}>{t('voucher.shopTitle')}</Text>
                </View>

                {/* Content Row */}
                <View style={styles.selectorRow}>
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
                                    ? t('voucher.placeholder')
                                    : t('voucher.noVouchers')}
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
                </View>
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
                                            {t('voucher.shopTitle')}
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
                                {/* Manual Input Section */}
                                <View style={styles.manualInputSection}>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.manualInput}
                                            placeholder={t('voucher.manualInputPlaceholder')}
                                            value={manualCode}
                                            onChangeText={setManualCode}
                                            autoCapitalize="characters"
                                            autoCorrect={false}
                                            returnKeyType="done"
                                        />
                                        {manualCode.length > 0 && (
                                            <Pressable
                                                onPress={() => setManualCode('')}
                                                style={styles.clearButton}
                                            >
                                                <IconSymbol name="close-circle" size={18} color={theme.colors.typographySecondary} />
                                            </Pressable>
                                        )}
                                    </View>
                                    <Pressable
                                        style={[
                                            styles.applyButton,
                                            !manualCode.trim() && styles.applyButtonDisabled
                                        ]}
                                        onPress={handleManualApply}
                                        disabled={!manualCode.trim()}
                                    >
                                        <Text style={styles.applyButtonText}>{t('voucher.applyButton')}</Text>
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
                                            {t('voucher.noUsing')}
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
                                                        {voucher.minOrderDisplay}
                                                    </Text>
                                                    {voucher.expiresAt && (
                                                        <Text style={styles.voucherExpiry}>
                                                            {t('voucher.expiry', { date: new Date(voucher.expiresAt).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'vi-VN') })}
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
        paddingVertical: theme.margins.sm,
    },

    containerPressed: {
        backgroundColor: theme.colors.background,
    },

    containerDisabled: {
        opacity: 0.5,
    },

    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingBottom: 4,
        gap: theme.margins.sm,
    },

    selectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingLeft: theme.margins.md + 32 + theme.margins.sm, // Align with title text
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

    manualInputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.sm,
    },

    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        paddingHorizontal: theme.margins.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },

    manualInput: {
        flex: 1,
        height: 40,
        fontSize: 14,
        color: theme.colors.typography,
    },

    clearButton: {
        padding: 4,
    },

    applyButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.lg,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    applyButtonDisabled: {
        backgroundColor: theme.colors.border,
    },

    applyButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
}));

export default CheckoutVoucherRow;
