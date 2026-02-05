/**
 * ==============================================
 * VOUCHER PICKER CARD - Rich Voucher Item for Bottom Sheet
 * ==============================================
 */

import { TicketSeparator } from '@/components/ui/TicketSeparator';
import type { VoucherUI } from '@/types/cart';
import { formatCurrency } from '@/utils/format';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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

    const handlePress = () => {
        if (!isDisabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onPress();
        }
    };

    return (
        <View style={styles.shadowWrapper}>
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    isSelected && styles.containerSelected,
                    pressed && !isDisabled && styles.containerPressed,
                    isDisabled && styles.containerDisabled,
                ]}
                onPress={handlePress}
            >
                {/* Glossy Overlay effect */}
                <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />

                {/* Radio Button */}
                <View style={styles.radioContainer}>
                    <View style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                        isDisabled && styles.radioOuterDisabled,
                    ]}>
                        {isSelected && (
                            <LinearGradient
                                colors={[theme.colors.primary, '#0066aa']}
                                style={styles.radioInner}
                            />
                        )}
                    </View>
                </View>

                {/* Left Section - Discount Highlight (Vibrant Glass Stub) */}
                <View style={[styles.leftSection, { backgroundColor: `${accentColor}15` }]}>
                    <LinearGradient
                        colors={[`${accentColor}25`, `${accentColor}10`]}
                        style={StyleSheet.absoluteFill}
                    />

                    <Text
                        style={[styles.discountText, { color: accentColor }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                    >
                        {voucher.discountDisplay}
                    </Text>

                    {/* Separator positioned at edge */}
                    <View style={styles.separatorWrapper}>
                        <TicketSeparator
                            height={CARD_HEIGHT - 16}
                            separatorBgColor="transparent"
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
                    </View>

                    {/* Row 2: Min order condition */}
                    <Text style={styles.conditionText} numberOfLines={1}>
                        {voucher.minOrderDisplay}
                    </Text>

                    {/* Row 3: Expiry */}
                    {expiryDisplay && !isDisabled && (
                        <Text style={styles.expiryText}>{expiryDisplay}</Text>
                    )}

                    {/* Row 4: Calculated discount or Reason */}
                    {isDisabled && voucher.reason ? (
                        <View style={styles.reasonRow}>
                            <Text style={styles.reasonText}>{voucher.reason}</Text>
                        </View>
                    ) : savingsDisplay ? (
                        <View style={styles.savingsRow}>
                            <LinearGradient
                                colors={[`${theme.colors.success}15`, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.savingsHighlight}
                            />
                            <Text style={styles.savingsText}>{savingsDisplay}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Absolute Usage Badge - Floating Glass Pod */}
                {voucher.maxUsage && voucher.maxUsage > 0 && voucher.maxUsage < 10 && (
                    <View style={styles.absoluteUsageBadge}>
                        <Text style={styles.absoluteUsageBadgeText}>x{voucher.maxUsage}</Text>
                    </View>
                )}

                {/* Best Value Badge - Floating Glass Pod */}
                {isBestValue && voucher.isApplicable && (
                    <View style={styles.bestValueBadge}>
                        <LinearGradient
                            colors={[theme.colors.error, '#FF4500']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                        <Text style={styles.bestValueText}>Tốt nhất</Text>
                    </View>
                )}
            </Pressable>
        </View>
    );
});

VoucherPickerCard.displayName = 'VoucherPickerCard';

const styles = StyleSheet.create((theme) => ({
    shadowWrapper: {
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: CARD_HEIGHT,
        backgroundColor: theme.colors.surface || 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24, // High-end liquid radius
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)', // Glass inner stroke
        overflow: 'hidden',
        position: 'relative',
    },
    containerSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}05`,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 15,
    },
    containerPressed: {
        transform: [{ scale: 0.98 }],
    },
    containerDisabled: {
        opacity: 0.5,
    },

    // Radio Button
    radioContainer: {
        paddingLeft: theme.margins.smd,
        paddingRight: theme.margins.sm,
        zIndex: 1,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    radioOuterDisabled: {
        borderColor: 'transparent',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },

    // Left Section
    leftSection: {
        width: 88,
        height: CARD_HEIGHT - 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius.m,
        position: 'relative',
        marginRight: 6,
        overflow: 'hidden',
    },
    discountText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 4,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
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
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.typography,
        flexShrink: 1,
    },
    titleTextDisabled: {
        color: theme.colors.typographySecondary,
    },
    bestValueBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderTopLeftRadius: 18,
        overflow: 'hidden',
    },
    bestValueText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    absoluteUsageBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderBottomLeftRadius: 12,
    },
    absoluteUsageBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: theme.colors.typographySecondary,
    },
    conditionText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
    },
    expiryText: {
        fontSize: 12,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    savingsRow: {
        marginTop: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
    },
    savingsHighlight: {
        ...StyleSheet.absoluteFillObject,
    },
    savingsText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.colors.success,
    },
    reasonRow: {
        marginTop: 4,
    },
    reasonText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.typographySecondary,
        fontStyle: 'italic',
    },
}));

export default VoucherPickerCard;
