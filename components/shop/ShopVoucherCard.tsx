/**
 * ==============================================
 * SHOP VOUCHER CARD - Compact Horizontal Voucher
 * ==============================================
 * 
 * Designed for horizontal scroll in Shop Detail screen
 * Features:
 * - Compact ticket-style design
 * - Left section with discount highlight
 * - Right section with details
 * - TicketSeparator for authentic voucher look
 * - Navigate to Voucher Detail on press
 */

import { TicketSeparator } from '@/components/ui/TicketSeparator';
import { shopRoutes } from '@/constants/routes';
import type { ShopVoucherUI } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

/** Card dimensions - dynamic based on screen size for consistent peek effect */
export const CARD_HEIGHT = 80;
export const getVoucherWidth = () => UnistylesRuntime.screen.width * 0.7;

interface ShopVoucherCardProps {
    voucher: ShopVoucherUI;
    shopName?: string;
    onPress?: (voucher: ShopVoucherUI) => void;
    onCollect?: (voucherId: string) => void;
}

/**
 * ShopVoucherCard Component
 * Compact voucher card for horizontal list in shop detail
 */
export const ShopVoucherCard = memo<ShopVoucherCardProps>(({
    voucher,
    shopName,
    onPress,
    onCollect,
}) => {
    const { theme } = useUnistyles();

    const handlePress = useCallback(() => {
        const voucherData = JSON.stringify(voucher);
        Navigator.push(shopRoutes.voucherDetail(voucher.id, voucherData, shopName));
        onPress?.(voucher);
    }, [onPress, voucher, shopName]);

    const handleCollect = useCallback(() => {
        onCollect?.(voucher.id);
    }, [onCollect, voucher.id]);

    // Determine accent color based on discount type
    const isPercentage = voucher.discountType === 'PERCENTAGE';
    const accentColor = isPercentage ? theme.colors.error : theme.colors.primary;
    const accentBgColor = isPercentage ? theme.colors.errorSoft : theme.colors.primarySoft;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                { width: getVoucherWidth() },
                pressed && styles.containerPressed,
            ]}
            onPress={handlePress}
        >
            {/* Left Section - Discount Highlight */}
            <View style={[styles.leftSection, { backgroundColor: accentBgColor }]}>
                <Text style={[styles.discountText, { color: accentColor }]}>
                    {voucher.discountDisplay}
                </Text>

                {/* Separator positioned at edge */}
                <View style={styles.separatorWrapper}>
                    <TicketSeparator
                        height={CARD_HEIGHT}
                        separatorBgColor={accentBgColor}
                        dashedLineColor={`${accentColor}40`}
                        circleRadius={8}
                        width={16}
                    />
                </View>
            </View>

            {/* Right Section - Details */}
            <View style={styles.rightSection}>
                {/* Title Row with Scope Badge */}
                <View style={styles.titleRow}>
                    <Text style={styles.titleText} numberOfLines={1}>
                        {voucher.titleDisplay}
                    </Text>
                    <View style={[styles.scopeBadge, { backgroundColor: accentBgColor }]}>
                        <Text style={[styles.scopeBadgeText, { color: accentColor }]}>
                            {voucher.scopeLabel}
                        </Text>
                    </View>
                </View>

                {/* Min Order Condition */}
                <Text
                    style={styles.minOrderText}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.7}
                >
                    {voucher.minOrderDisplay}
                </Text>

                {/* Bottom Row: Expiry */}
                <View style={styles.bottomRow}>
                    <Text style={styles.expiryText} numberOfLines={1}>
                        HSD: {voucher.endDate}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
});

ShopVoucherCard.displayName = 'ShopVoucherCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        height: CARD_HEIGHT,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    containerPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },

    // Left Section
    leftSection: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingRight: 8,
    },
    discountText: {
        fontSize: 14,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 18,
    },
    separatorWrapper: {
        position: 'absolute',
        right: -8,
        top: 0,
        bottom: 0,
    },

    // Right Section
    rightSection: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.smd,
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    titleText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.typography,
        flex: 1,
    },
    scopeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    scopeBadgeText: {
        fontSize: 9,
        fontWeight: '600',
    },
    minOrderText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    expiryText: {
        fontSize: 10,
        color: theme.colors.secondary,
    },
    collectButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
    },
    collectButtonPressed: {
        opacity: 0.8,
    },
    collectButtonText: {
        fontSize: 11,
        fontWeight: '700',
        color: theme.colors.onPrimary,
    },
}));

export default ShopVoucherCard;
