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

import { shopRoutes } from '@/constants/routes';
import type { ShopVoucherUI } from '@/types/shop';
import { Navigator } from '@/utils/navigation';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback } from 'react';
import { GestureResponderEvent, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

/** Card dimensions - dynamic based on screen size for consistent peek effect */
export const CARD_HEIGHT = 90;
export const getVoucherWidth = () => UnistylesRuntime.screen.width * 0.75;

interface ShopVoucherCardProps {
    voucher: ShopVoucherUI;
    shopName?: string;
    onPress?: (voucher: ShopVoucherUI) => void;
    onCollect?: (voucherId: string) => void;
}

/**
 * ShopVoucherCard Component
 * Premium voucher card inspired by Bank Card design
 */
export const ShopVoucherCard = memo<ShopVoucherCardProps>(({
    voucher,
    shopName,
    onPress,
    onCollect,
}) => {


    const handlePress = useCallback(() => {
        const voucherData = JSON.stringify(voucher);
        Navigator.push(shopRoutes.voucherDetail(voucher.id, voucherData, shopName));
        onPress?.(voucher);
    }, [onPress, voucher, shopName]);

    const handleCollect = useCallback((e: GestureResponderEvent) => {
        e.stopPropagation();
        onCollect?.(voucher.id);
    }, [onCollect, voucher.id]);

    // Premium gradients inspired by BankCardItem
    const isPercentage = voucher.discountType === 'PERCENTAGE';
    const cardGradient = isPercentage
        ? ['rgba(239, 68, 68, 0.95)', 'rgba(255, 122, 0, 0.85)'] // Red/Orange for brand
        : ['rgba(30, 41, 59, 1)', 'rgba(15, 23, 42, 0.9)'];   // Slate/Dark for others

    return (
        <Animated.View style={[styles.container, { width: getVoucherWidth() }]}>
            <Pressable
                style={({ pressed }) => [
                    styles.cardWrapper,
                    pressed && styles.containerPressed,
                ]}
                onPress={handlePress}
            >
                <LinearGradient
                    colors={cardGradient as [string, string, ...string[]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <BlurView intensity={20} tint="light" style={styles.blurContent}>
                        {/* Highlights (Specular) */}
                        <View style={styles.highlight} />

                        {/* Layout: Ticket Style with Line */}
                        <View style={styles.mainLayout}>
                            {/* Left: Discount */}
                            <View style={styles.leftInfo}>
                                <Text style={styles.discountText}>
                                    {voucher.discountDisplay}
                                </Text>
                                <View style={styles.scopeBadge}>
                                    <Text style={styles.scopeBadgeText}>{voucher.scopeLabel}</Text>
                                </View>
                            </View>

                            {/* Separator Line */}
                            <View style={styles.verticalLine} />

                            {/* Right: Info */}
                            <View style={styles.rightInfo}>
                                <Text style={styles.titleText} numberOfLines={2}>
                                    {voucher.titleDisplay}
                                </Text>
                                <Text style={styles.minOrderText}>
                                    {voucher.minOrderDisplay}
                                </Text>
                                <View style={styles.footerRow}>
                                    <View>
                                        <Text style={styles.expiryLabel}>HẠN SỬ DỤNG</Text>
                                        <Text style={styles.expiryText}>{voucher.endDate}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.actionBtn}
                                        onPress={handleCollect}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.actionBtnText}>Lưu</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </BlurView>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
});

ShopVoucherCard.displayName = 'ShopVoucherCard';

const styles = StyleSheet.create((theme) => ({
    container: {
        marginRight: 12,
    },
    cardWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    containerPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    gradient: {
        width: '100%',
        height: CARD_HEIGHT,
    },
    blurContent: {
        flex: 1,
        padding: 12,
        paddingHorizontal: 16,
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    mainLayout: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftInfo: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
    },
    discountText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
    },
    scopeBadge: {
        marginTop: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    scopeBadgeText: {
        fontSize: 8,
        fontWeight: '700',
        color: '#FFF',
        textTransform: 'uppercase',
    },
    verticalLine: {
        width: 1,
        height: '70%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 16,
    },
    rightInfo: {
        flex: 1,
        justifyContent: 'space-between',
        height: '100%',
    },
    titleText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: -0.2,
    },
    minOrderText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    expiryLabel: {
        fontSize: 7,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 0.5,
    },
    expiryText: {
        fontSize: 10,
        color: '#FFF',
        fontWeight: '700',
    },
    actionBtn: {
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#FFF',
    },
    actionBtnText: {
        fontSize: 11,
        fontWeight: '800',
        color: theme.colors.buttonActive,
    },
}));

export default ShopVoucherCard;
