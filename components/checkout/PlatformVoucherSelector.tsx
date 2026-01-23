/**
 * PlatformVoucherSelector Component
 * 
 * Allows user to select a platform-wide voucher (e.g., Free Shipping, % off).
 * These vouchers apply to the entire order, not specific shops.
 */

import { IconSymbol } from '@/components/ui/Icon';
import { createScaledFontSize } from '@/constants/unistyles';
import type { VoucherUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface PlatformVoucherSelectorProps {
    /** Available platform vouchers */
    availableVouchers: VoucherUI[];
    /** Currently selected discount voucher ID */
    selectedDiscountVoucherId: string | null;
    /** Currently selected shipping voucher ID */
    selectedShippingVoucherId: string | null;
    /** Discount amount from this voucher */
    discountAmount: number;
    /** Whether the voucher is invalid (doesn't meet conditions) */
    isInvalid?: boolean;
    /** Warning message for invalid voucher */
    warningMessage?: string | null;
    /** Callback when user clicks Done */
    onApply: (discountId: string | null, shippingId: string | null) => void;
    /** Whether vouchers are being fetched */
    isLoading?: boolean;
}

export const PlatformVoucherSelector: React.FC<PlatformVoucherSelectorProps> = ({
    availableVouchers,
    selectedDiscountVoucherId,
    selectedShippingVoucherId,
    discountAmount,
    isInvalid = false,
    warningMessage = null,
    onApply,
    isLoading = false,
}) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('checkout');
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Local state for modal interaction - only commit on "Xong"
    const [tempDiscountId, setTempDiscountId] = useState<string | null>(null);
    const [tempShippingId, setTempShippingId] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState('');

    const selectedDiscountVoucher = availableVouchers.find((v) => v.id === selectedDiscountVoucherId);
    const selectedShippingVoucher = availableVouchers.find((v) => v.id === selectedShippingVoucherId);

    // Filter vouchers by category
    const shippingVouchers = availableVouchers.filter(v => v.category === 'SHIPPING');
    const discountVouchers = availableVouchers.filter(v => v.category !== 'SHIPPING');

    // Count applicable vouchers (isApplicable = true)
    const applicableVouchersCount = availableVouchers.filter(v => v.isApplicable).length;
    const hasApplicableVouchers = applicableVouchersCount > 0;

    const handleOpenModal = useCallback(() => {
        setTempDiscountId(selectedDiscountVoucherId);
        setTempShippingId(selectedShippingVoucherId);
        setIsModalVisible(true);
    }, [selectedDiscountVoucherId, selectedShippingVoucherId]);

    const handleSelect = useCallback(
        (voucherId: string | null, category: 'SHIPPING' | 'DISCOUNT') => {
            if (category === 'SHIPPING') {
                setTempShippingId(voucherId);
            } else {
                setTempDiscountId(voucherId);
            }
        },
        []
    );

    const handleApply = useCallback(() => {
        onApply(tempDiscountId, tempShippingId);
        setIsModalVisible(false);
        setManualCode('');
    }, [onApply, tempDiscountId, tempShippingId]);

    const handleManualApply = useCallback(() => {
        const code = manualCode.trim().toUpperCase();
        if (!code) return;

        // Try to find in existing vouchers to know category
        const existing = availableVouchers.find(v => v.code === code);
        if (existing) {
            handleSelect(existing.id, existing.category === 'SHIPPING' ? 'SHIPPING' : 'DISCOUNT');
        } else {
            // Default to discount if unknown
            setTempDiscountId(code);
        }
        setManualCode('');
    }, [manualCode, availableVouchers, handleSelect]);

    const getSelectedSummary = () => {
        const parts = [];
        if (selectedShippingVoucher) parts.push(selectedShippingVoucher.discountDisplay);
        if (selectedDiscountVoucher) parts.push(selectedDiscountVoucher.discountDisplay);

        if (parts.length === 0) return null;
        return parts.join(' & ');
    };

    const hasAnySelection = !!selectedDiscountVoucher || !!selectedShippingVoucher;

    // Determine placeholder text based on voucher availability
    const getPlaceholderText = (): string => {
        if (isLoading) return t('voucher.findingBest');
        if (availableVouchers.length === 0) return t('voucher.noVouchers');
        if (!hasApplicableVouchers) return t('voucher.noApplicableVouchers');
        return t('voucher.placeholder', { count: applicableVouchersCount });
    };

    // Check if we should show secondary styling (no applicable vouchers but has vouchers)
    const showSecondaryStyling = !hasApplicableVouchers && availableVouchers.length > 0;

    return (
        <>
            {/* Whole container is pressable for better UX */}
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && styles.containerPressed,
                    showSecondaryStyling && styles.containerSecondary,
                ]}
                onPress={handleOpenModal}
                accessibilityRole="button"
                accessibilityLabel={t('voucher.selectPlatformVoucher')}
            >
                {/* Title Row */}
                <View style={styles.titleRow}>
                    <View style={[styles.titleIcon, showSecondaryStyling && styles.titleIconSecondary]}>
                        <IconSymbol
                            name="percent"
                            size={18}
                            color={showSecondaryStyling ? theme.colors.typographySecondary : theme.colors.error}
                        />
                    </View>
                    <Text style={[styles.title, showSecondaryStyling && styles.titleSecondary]}>
                        {t('voucher.platformTitle')}
                    </Text>
                </View>

                {/* Selector Row */}
                <View style={styles.selectorRow}>
                    {hasAnySelection ? (
                        <View style={styles.selectedContent}>
                            <View style={styles.voucherBadge}>
                                <Text style={styles.voucherBadgeText}>
                                    {getSelectedSummary()}
                                </Text>
                            </View>
                            <Text
                                style={[
                                    styles.voucherCode,
                                    isInvalid && styles.voucherCodeInvalid,
                                ]}
                                numberOfLines={1}
                            >
                                {selectedShippingVoucher ? (selectedShippingVoucher.maxDiscountDisplay || selectedShippingVoucher.title) : ''}
                                {selectedShippingVoucher && selectedDiscountVoucher ? ', ' : ''}
                                {selectedDiscountVoucher ? (selectedDiscountVoucher.maxDiscountDisplay || selectedDiscountVoucher.title) : ''}
                            </Text>
                            {discountAmount > 0 && !isInvalid && (
                                <Text style={styles.discountText}>
                                    -{formatCurrency(discountAmount)}
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text style={[
                            styles.placeholderText,
                            showSecondaryStyling && styles.placeholderTextSecondary,
                        ]}>
                            {getPlaceholderText()}
                        </Text>
                    )}
                    <IconSymbol
                        name="chevron-right"
                        size={20}
                        color={theme.colors.typographySecondary}
                    />
                </View>
            </Pressable>

            {/* Warning Message - Only show if invalid and outside pressable to not trigger press */}
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
                                            {t('voucher.platformTitle')}
                                        </Text>
                                    </View>
                                    <Pressable
                                        onPress={handleApply}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <View style={styles.doneButton}>
                                            <Text style={styles.doneButtonText}>{t('actions.done')}</Text>
                                        </View>
                                    </Pressable>
                                </View>

                                {/* Manual Input Section */}
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
                                                <IconSymbol name="close-circle" size={16} color={theme.colors.typographySecondary} />
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
                                    {/* SECTION 1: SHIPPING VOUCHERS */}
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>{t('voucher.shippingVoucherTitle')}</Text>
                                    </View>

                                    {shippingVouchers.map((voucher) => {
                                        const isSelected = voucher.id === tempShippingId;
                                        return (
                                            <VoucherItem
                                                key={voucher.id}
                                                voucher={voucher}
                                                isSelected={isSelected}
                                                onPress={() => handleSelect(isSelected ? null : voucher.id, 'SHIPPING')}
                                            />
                                        );
                                    })}
                                    {shippingVouchers.length === 0 && (
                                        <Text style={styles.emptyCategoryText}>{t('voucher.noShippingVoucher')}</Text>
                                    )}

                                    {/* SECTION 2: DISCOUNT VOUCHERS */}
                                    <View style={styles.sectionHeader}>
                                        <Text style={styles.sectionTitle}>{t('voucher.discountVoucherTitle')}</Text>
                                    </View>

                                    {discountVouchers.map((voucher) => {
                                        const isSelected = voucher.id === tempDiscountId;
                                        return (
                                            <VoucherItem
                                                key={voucher.id}
                                                voucher={voucher}
                                                isSelected={isSelected}
                                                onPress={() => handleSelect(isSelected ? null : voucher.id, 'DISCOUNT')}
                                            />
                                        );
                                    })}
                                    {discountVouchers.length === 0 && (
                                        <Text style={styles.emptyCategoryText}>{t('voucher.noDiscountVoucher')}</Text>
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

interface VoucherItemProps {
    voucher: VoucherUI;
    isSelected: boolean;
    onPress: () => void;
}

const VoucherItem: React.FC<VoucherItemProps> = ({ voucher, isSelected, onPress }) => {
    const { theme } = useUnistyles();
    const { t, i18n } = useTranslation('checkout');
    const isShipping = voucher.category === 'SHIPPING';
    const isDisabled = !voucher.isApplicable;

    const handlePress = () => {
        if (isDisabled) return; // Prevent selection if not applicable
        onPress();
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.voucherItem,
                isSelected && styles.voucherItemSelected,
                pressed && !isDisabled && styles.voucherItemPressed,
                isDisabled && styles.voucherItemDisabled,
            ]}
            onPress={handlePress}
            disabled={isDisabled}
        >
            <View style={styles.radioContainer}>
                <View
                    style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                        isDisabled && styles.radioOuterDisabled,
                    ]}
                >
                    {isSelected && (
                        <View style={styles.radioInner} />
                    )}
                </View>
            </View>

            {/* Voucher card */}
            <View style={[styles.voucherCard, isDisabled && styles.voucherCardDisabled]}>
                {/* Left badge */}
                <View
                    style={[
                        styles.voucherLeftBadge,
                        isShipping && styles.voucherLeftBadgeShipping,
                        isDisabled && styles.voucherLeftBadgeDisabled,
                    ]}
                >
                    <IconSymbol
                        name={isShipping ? 'shipping' : 'percent'}
                        size={16}
                        color="#FFFFFF"
                    />
                    <Text
                        style={styles.voucherLeftBadgeText}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                    >
                        {voucher.discountDisplay}
                    </Text>
                </View>

                {/* Info */}
                <View style={styles.voucherCardInfo}>
                    <Text style={[styles.voucherCardCode, isDisabled && styles.voucherCardCodeDisabled]} numberOfLines={1}>
                        {voucher.maxDiscountDisplay || voucher.title}
                    </Text>
                    <Text style={styles.voucherCardCondition}>
                        {voucher.minOrderDisplay}
                    </Text>
                    {/* Show reason why voucher is not applicable */}
                    {isDisabled && voucher.description && (
                        <Text style={styles.voucherNotApplicableReason}>
                            {voucher.description}
                        </Text>
                    )}
                    {!isDisabled && voucher.expiresAt && (
                        <Text style={styles.voucherCardExpiry}>
                            {t('voucher.expiry', {
                                date: new Date(voucher.expiresAt).toLocaleDateString(
                                    i18n.language === 'en' ? 'en-US' : 'vi-VN'
                                )
                            })}
                        </Text>
                    )}
                </View>
            </View>
        </Pressable>
    );
};
const styles = StyleSheet.create((theme, rt) => {
    const f = (size: number) => createScaledFontSize(size, rt.screen.width);

    return {
        container: {
            backgroundColor: theme.colors.surface,
            marginBottom: theme.margins.sm,
            paddingVertical: theme.margins.sm,
        },

        containerPressed: {
            backgroundColor: theme.colors.background,
        },

        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.margins.md,
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
            fontSize: f(theme.fontSizes.md),
            fontWeight: '600',
            color: theme.colors.typography,
        },

        selectorRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.margins.md,
            paddingLeft: theme.margins.md + 32 + theme.margins.sm, // Align with title text
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
            fontSize: f(theme.fontSizes.xs),
            fontWeight: '700',
            color: '#FFFFFF',
        },

        voucherCode: {
            flex: 1,
            fontSize: f(theme.fontSizes.md),
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
            color: theme.colors.success,
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
            marginBottom: theme.margins.sm,
        },

        warningText: {
            fontSize: f(theme.fontSizes.sm),
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

        doneButton: {
            paddingHorizontal: theme.margins.md,
            paddingVertical: theme.margins.sm,
            backgroundColor: `${theme.colors.primary}12`,
            borderRadius: 8,
        },

        doneButtonText: {
            color: theme.colors.primary,
            fontWeight: '700',
            fontSize: f(theme.fontSizes.sm),
        },

        modalHeaderLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.margins.sm,
        },

        modalTitle: {
            fontSize: f(theme.fontSizes.mdbase),
            fontWeight: '600',
            color: theme.colors.typography,
        },

        voucherList: {
            maxHeight: 500,
        },

        sectionHeader: {
            paddingHorizontal: theme.margins.lg,
            paddingTop: theme.margins.md,
            paddingBottom: theme.margins.sm,
            backgroundColor: theme.colors.surface,
        },

        sectionTitle: {
            fontSize: f(theme.fontSizes.md),
            fontWeight: '700',
            color: theme.colors.typography,
        },

        emptyCategoryText: {
            paddingHorizontal: theme.margins.lg,
            paddingVertical: theme.margins.md,
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.typographySecondary,
            fontStyle: 'italic',
        },

        voucherItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.margins.sm,
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
            fontSize: f(theme.fontSizes.md),
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
            width: 88,
            backgroundColor: theme.colors.error,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.margins.smd,
            paddingHorizontal: 4,
        },

        voucherLeftBadgeShipping: {
            backgroundColor: theme.colors.success,
        },

        voucherLeftBadgeText: {
            fontSize: f(theme.fontSizes.sm),
            fontWeight: '700',
            color: '#FFFFFF',
            marginTop: 4,
            textAlign: 'center',
        },

        voucherCardInfo: {
            flex: 1,
            padding: theme.margins.smd,
        },

        voucherCardCode: {
            fontSize: f(theme.fontSizes.sm),
            fontWeight: '600',
            color: theme.colors.typography,
        },

        voucherCardCondition: {
            fontSize: f(theme.fontSizes.sm),
            color: theme.colors.typographySecondary,
            marginTop: 4,
        },

        voucherCardExpiry: {
            fontSize: f(theme.fontSizes.xs),
            color: theme.colors.secondary,
            marginTop: 4,
        },

        emptyState: {
            alignItems: 'center',
            paddingVertical: theme.margins.xxl,
        },

        emptyText: {
            fontSize: f(theme.fontSizes.md),
            color: theme.colors.typographySecondary,
            marginTop: theme.margins.md,
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
            backgroundColor: theme.colors.borderMuted,
            borderRadius: 8,
            paddingHorizontal: theme.margins.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },

        manualInput: {
            flex: 1,
            height: 40,
            fontSize: f(theme.fontSizes.md),
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
            fontSize: f(theme.fontSizes.sm),
        },

        // Disabled voucher styles (when isApplicable = false)
        voucherItemDisabled: {
            opacity: 0.6,
        },

        radioOuterDisabled: {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
        },

        voucherCardDisabled: {
            backgroundColor: `${theme.colors.background}80`,
        },

        voucherLeftBadgeDisabled: {
            backgroundColor: theme.colors.typographySecondary,
        },

        voucherCardCodeDisabled: {
            color: theme.colors.typographySecondary,
        },

        voucherNotApplicableReason: {
            fontSize: f(theme.fontSizes.xs),
            color: theme.colors.typographySecondary,
            marginTop: 4,
            fontWeight: '500',
        },

        // Selector secondary styles (when no applicable vouchers but still clickable)
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
    }
});

export default PlatformVoucherSelector;
