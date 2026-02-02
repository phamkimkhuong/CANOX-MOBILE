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
                        separatorBgColor={theme.colors.surface}
                        dashedLineColor={`${accentColor}40`}
                        circleRadius={6}
                        width={16}
                    />
                </View>
            </View>

            {/* Right Section - Details */}
            <View style={styles.rightSection}>
                {/* Title Row with Scope Badge */}
                <View style={styles.titleRow}>
                    <Text style={styles.titleText}>
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
                >
                    {voucher.minOrderDisplay}
                </Text>

                {/* Bottom Row: Expiry + Action */}
                {/* <View style={styles.bottomRow}>
                    <Text style={styles.expiryText} numberOfLines={1}>
                        HSD: {voucher.endDate}
                    </Text>

                    <Pressable
                        style={({ pressed }) => [
                            styles.collectButton,
                            { backgroundColor: accentColor },
                            pressed && styles.collectButtonPressed,
                        ]}
                        onPress={handleCollect}
                    >
                        <Text style={styles.collectButtonText}>Lưu</Text>
                    </Pressable>
                </View> */}
            </View>
        </Pressable>
    );
});

ShopVoucherCard.displayName = 'ShopVoucherCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        minHeight: CARD_HEIGHT,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    containerPressed: {
        transform: [{ scale: 0.97 }],
        opacity: 0.9,
    },

    // Left Section
    leftSection: {
        width: 85,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        paddingRight: 4,
    },
    discountText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    separatorWrapper: {
        position: 'absolute',
        right: -8,
        top: 0,
        bottom: 0,
        zIndex: 10,
    },

    // Right Section
    rightSection: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 16,
        justifyContent: 'center',
        gap: 2,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 6,
    },
    titleText: {
        fontSize: 13,
        fontWeight: '700',
        color: theme.colors.typography,
        flex: 1,
        letterSpacing: -0.2,
    },
    scopeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    scopeBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    minOrderText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        fontWeight: '600',
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    expiryText: {
        fontSize: 10,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
    },
    collectButton: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    collectButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
    collectButtonText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
}));

export default ShopVoucherCard;
