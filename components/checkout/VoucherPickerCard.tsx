/**
 * ==============================================
 * VOUCHER PICKER CARD - Rich Voucher Item for Bottom Sheet
 * ==============================================
 */

import { TicketSeparator } from '@/components/ui/TicketSeparator';
import type { VoucherUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import React, { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const CARD_HEIGHT = 100;

interface VoucherPickerCardProps {
    voucher: VoucherUI;
    isSelected: boolean;
    isBestValue?: boolean;
    onPress: () => void;
}

/**
 * VoucherPickerCard Component
 * Rich voucher display for checkout bottom sheet
 */
export const VoucherPickerCard = memo<VoucherPickerCardProps>(({
    voucher,
    isSelected,
    isBestValue = false,
    onPress,
}) => {
    const { theme } = useUnistyles();
    const isDisabled = !voucher.isApplicable;
    const isPercentage = voucher.discountType === 'PERCENTAGE';

    // Accent colors based on discount type
    const accentColor = isPercentage ? theme.colors.error : theme.colors.primary;
    const accentBgColor = isPercentage ? theme.colors.errorSoft : theme.colors.primarySoft;

    // Format expiry date
    const expiryDisplay = useMemo(() => {
        if (!voucher.expiresAt) return null;
        try {
            const date = new Date(voucher.expiresAt);
            return `HSD: ${date.toLocaleDateString('vi-VN')}`;
        } catch {
            return null;
        }
    }, [voucher.expiresAt]);

    // Format calculated discount
    const savingsDisplay = useMemo(() => {
        if (!voucher.isApplicable || !voucher.calculatedDiscount || voucher.calculatedDiscount <= 0) {
            return null;
        }
        return `Tiết kiệm: -${formatCurrency(voucher.calculatedDiscount)}`;
    }, [voucher.isApplicable, voucher.calculatedDiscount]);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                isSelected && styles.containerSelected,
                pressed && !isDisabled && styles.containerPressed,
                isDisabled && styles.containerDisabled,
            ]}
            onPress={onPress}
            disabled={isDisabled}
        >
            {/* Radio Button */}
            <View style={styles.radioContainer}>
                <View style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                    isDisabled && styles.radioOuterDisabled,
                ]}>
                    {isSelected && <View style={styles.radioInner} />}
                </View>
            </View>

            {/* Left Section - Discount Highlight */}
            <View style={[styles.leftSection, { backgroundColor: accentBgColor }]}>
                <Text style={[styles.discountText, { color: accentColor }]}>
                    {voucher.discountDisplay}
                </Text>

                {/* Separator positioned at edge */}
                <View style={styles.separatorWrapper}>
                    <TicketSeparator
                        height={CARD_HEIGHT - 16}
                        separatorBgColor={accentBgColor}
                        dashedLineColor={`${accentColor}40`}
                        circleRadius={6}
                        width={12}
                    />
                </View>
            </View>

            {/* Right Section - Details */}
            <View style={styles.rightSection}>
                {/* Row 1: Title + Badges */}
                <View style={styles.titleRow}>
                    <Text style={[styles.titleText, isDisabled && styles.titleTextDisabled]} numberOfLines={1}>
                        {voucher.maxDiscountDisplay || voucher.title}
                    </Text>
                    {isBestValue && voucher.isApplicable && (
                        <View style={styles.bestValueBadge}>
                            <Text style={styles.bestValueText}>Tốt nhất</Text>
                        </View>
                    )}
                </View>

                {/* Row 2: Min order condition */}
                <Text style={styles.conditionText} numberOfLines={1}>
                    {voucher.minOrderDisplay}
                </Text>

                {/* Row 3: Expiry */}
                {expiryDisplay && !isDisabled && (
                    <Text style={styles.expiryText}>{expiryDisplay}</Text>
                )}

                {/* Row 4: Calculated discount (highlight) or Reason */}
                {isDisabled && voucher.reason ? (
                    <View style={styles.reasonRow}>
                        <Text style={styles.reasonText}>{voucher.reason}</Text>
                    </View>
                ) : savingsDisplay ? (
                    <View style={styles.savingsRow}>
                        <Text style={styles.savingsText}>{savingsDisplay}</Text>
                    </View>
                ) : null}
            </View>

            {/* Absolute Usage Badge in top right */}
            {voucher.maxUsage && voucher.maxUsage > 0 && (
                <View style={styles.absoluteUsageBadge}>
                    <Text style={styles.absoluteUsageBadgeText}>x{voucher.maxUsage}</Text>
                </View>
            )}
        </Pressable>
    );
});

VoucherPickerCard.displayName = 'VoucherPickerCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: CARD_HEIGHT,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        overflow: 'hidden',
        position: 'relative',
    },
    containerSelected: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
        backgroundColor: `${theme.colors.primary}05`,
    },
    containerPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    containerDisabled: {
        opacity: 0.6,
    },

    // Radio Button
    radioContainer: {
        paddingLeft: theme.margins.smd,
        paddingRight: theme.margins.sm,
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
    radioOuterDisabled: {
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colors.primary,
    },

    // Left Section
    leftSection: {
        width: 70,
        height: CARD_HEIGHT - 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.s,
        position: 'relative',
        marginRight: 6,
    },
    discountText: {
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'center',
        paddingHorizontal: 4,
    },
    separatorWrapper: {
        position: 'absolute',
        right: -6,
        top: 0,
        bottom: 0,
    },

    // Right Section
    rightSection: {
        flex: 1,
        paddingVertical: theme.margins.sm,
        paddingLeft: theme.margins.sm,
        paddingRight: theme.margins.smd,
        justifyContent: 'center',
        gap: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    titleText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.typography,
        flexShrink: 1,
    },
    titleTextDisabled: {
        color: theme.colors.typographySecondary,
    },
    bestValueBadge: {
        backgroundColor: theme.colors.warningSoft,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    bestValueText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.warning,
    },
    absoluteUsageBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: theme.colors.errorSoft,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomLeftRadius: theme.radius.m,
    },
    absoluteUsageBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.error,
    },
    conditionText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    expiryText: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
    savingsRow: {
        marginTop: 2,
    },
    savingsText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.success,
    },
    reasonRow: {
        marginTop: 2,
    },
    reasonText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.warning,
    },
}));

export default VoucherPickerCard;
