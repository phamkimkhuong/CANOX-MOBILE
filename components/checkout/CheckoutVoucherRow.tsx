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
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { VoucherPickerCard } from './VoucherPickerCard';

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
    const insets = useSafeAreaInsets();
    const { t } = useTranslation('checkout');
    const styles = stylesheet;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [manualCode, setManualCode] = useState('');

    const selectedVoucher = availableVouchers.find((v) => v.id === selectedVoucherId);

    // Count applicable vouchers (isApplicable = true)
    const applicableVouchersCount = availableVouchers.filter(v => v.isApplicable !== false).length;
    const hasApplicableVouchers = applicableVouchersCount > 0;

    const handleOpenModal = useCallback(() => {
        setIsModalVisible(true);
    }, []);

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

    // Determine placeholder text
    const getPlaceholderText = () => {
        if (availableVouchers.length === 0) return t('voucher.noVouchers');
        if (!hasApplicableVouchers) return t('voucher.noApplicableVouchers');
        return t('voucher.placeholder');
    };

    // Show secondary styling if has vouchers but none are applicable
    const showSecondaryStyling = !hasApplicableVouchers && availableVouchers.length > 0;

    return (
        <>
            {/* Whole section is pressable for better UX */}
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && !disabled && styles.containerPressed,
                    (disabled || showSecondaryStyling) && styles.containerSecondary,
                ]}
                onPress={handleOpenModal}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={t('voucher.selectShopVoucher')}
            >
                {/* Section Title */}
                <View style={styles.titleRow}>
                    <View style={[styles.titleIcon, showSecondaryStyling && styles.titleIconSecondary]}>
                        <IconSymbol
                            name="percent"
                            size={18}
                            color={showSecondaryStyling ? theme.colors.typographySecondary : theme.colors.error}
                        />
                    </View>
                    <Text style={[styles.title, showSecondaryStyling && styles.titleSecondary]}>
                        {t('voucher.shopTitle')}
                    </Text>
                </View>

                {/* Content Row */}
                <View style={styles.selectorRow}>
                    <View style={styles.content}>
                        {selectedVoucher ? (
                            <View style={styles.selectedRow}>
                                <Text style={styles.voucherCode}>
                                    {selectedVoucher.maxDiscountDisplay || selectedVoucher.title}
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
                                (availableVouchers.length === 0 || showSecondaryStyling) && styles.placeholderTextSecondary
                            ]}>
                                {getPlaceholderText()}
                            </Text>
                        )}
                    </View>

                    <IconSymbol
                        name="chevron-right"
                        size={18}
                        color={theme.colors.typographySecondary}
                    />
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
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={styles.keyboardAvoid}
                        >
                            <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
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

                                {/* Unified Scroll Flow */}
                                <ScrollView
                                    style={styles.voucherList}
                                    contentContainerStyle={styles.scrollContent}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {/* Manual Input Section - Integrated into ScrollView */}
                                    <View style={styles.manualInputSection}>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.manualInput}
                                                placeholder={t('voucher.manualInputPlaceholder')}
                                                placeholderTextColor={theme.colors.typographySecondary}
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
                                    {availableVouchers.map((voucher, index) => {
                                        const isSelected = voucher.id === selectedVoucherId;
                                        const isBestValue = index === 0 && voucher.isApplicable;

                                        return (
                                            <VoucherPickerCard
                                                key={voucher.id}
                                                voucher={voucher}
                                                isSelected={isSelected}
                                                isBestValue={isBestValue}
                                                onPress={() => handleSelect(voucher.id)}
                                            />
                                        );
                                    })}
                                </ScrollView>

                                {/* Footer spacing */}
                                <View style={[styles.modalFooter, { height: insets.bottom + theme.margins.lg }]} />
                            </Pressable>
                        </KeyboardAvoidingView>
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
        fontWeight: '500',
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
        fontSize: 13,
        fontWeight: '500',
        color: theme.colors.typography,
    },

    discountText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.success,
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
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: '85%',
        width: '100%',
    },
    keyboardAvoid: {
        width: '100%',
        justifyContent: 'flex-end',
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
        fontWeight: '500',
        color: theme.colors.typography,
    },

    voucherList: {
        flex: 1,
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

    modalFooter: {
        height: 44,
    },
    scrollContent: {
        paddingBottom: 20,
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
        backgroundColor: theme.colors.borderMuted,
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

    // Secondary/Disabled styles
    containerSecondary: {
        opacity: 0.8,
    },
    titleIconSecondary: {
        backgroundColor: `${theme.colors.typographySecondary}12`,
    },
    titleSecondary: {
        color: theme.colors.typographySecondary,
    },
    placeholderTextSecondary: {
        color: theme.colors.typographySecondary,
    },
}));

export default CheckoutVoucherRow;
