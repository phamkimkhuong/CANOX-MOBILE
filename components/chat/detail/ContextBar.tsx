/**
 * ContextBar - Sticky context bar for product/order
 * Shows at the top of chat when there's a product or order context
 */

import { IconSymbol } from '@/components/ui/Icon';
import {
    CONTEXT_ACTION_CONFIG,
    ContextBarProps,
} from '@/types/chat/contextBar';
import { formatCurrency } from '@/utils/format';
import { buildImageUrl } from '@/utils/url';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

/**
 * ContextBar - Product/Order context sticky bar
 * 
 * States:
 * - PRODUCT: Shows product info + "Mua ngay" button
 * - ORDER: Shows order info + "Theo dõi" button
 * - NONE: Hidden
 */
export const ContextBar: React.FC<ContextBarProps> = React.memo(({
    type,
    productData,
    orderData,
    onDismiss,
    onAction,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    if (type === 'NONE') return null;

    const isProduct = type === 'PRODUCT' && productData;
    const isOrder = type === 'ORDER' && orderData;

    if (!isProduct && !isOrder) return null;

    const actionConfig = CONTEXT_ACTION_CONFIG[type];

    const renderProductContext = () => {
        if (!productData) return null;

        return (
            <>
                <Image
                    source={{ uri: buildImageUrl(productData.thumbnail, null, 'thumb') }}
                    style={styles.thumbnail}
                    contentFit="cover"
                />
                <View style={styles.info}>
                    <View style={styles.labelRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Hỏi về SP</Text>
                        </View>
                        <Text style={styles.name} numberOfLines={1}>
                            {productData.name}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>
                            {formatCurrency(productData.price)}
                        </Text>
                        {productData.originalPrice && productData.originalPrice > productData.price && (
                            <Text style={styles.originalPrice}>
                                {formatCurrency(productData.originalPrice)}
                            </Text>
                        )}
                    </View>
                </View>
            </>
        );
    };

    const renderOrderContext = () => {
        if (!orderData) return null;

        return (
            <>
                {orderData.thumbnail ? (
                    <Image
                        source={{ uri: buildImageUrl(orderData.thumbnail, null, 'thumb') }}
                        style={styles.thumbnail}
                        contentFit="cover"
                    />
                ) : (
                    <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                        <IconSymbol name="shipping" size={24} color={theme.colors.secondary} />
                    </View>
                )}
                <View style={styles.info}>
                    <View style={styles.labelRow}>
                        <View style={[styles.badge, styles.badgeOrder]}>
                            <Text style={[styles.badgeText, styles.badgeTextOrder]}>Đơn hàng</Text>
                        </View>
                        <Text style={styles.name} numberOfLines={1}>
                            #{orderData.orderCode}
                        </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>
                            {formatCurrency(orderData.totalAmount)}
                        </Text>
                        <Text style={styles.itemCount}>
                            • {orderData.itemCount} sản phẩm
                        </Text>
                    </View>
                </View>
            </>
        );
    };

    return (
        <View style={styles.container}>
            {/* Content Left: Thumbnail + Info */}
            <View style={styles.leftContent}>
                {isProduct && renderProductContext()}
                {isOrder && renderOrderContext()}
            </View>

            {/* Content Right: Close (top) and Send (bottom) */}
            <View style={styles.rightContent}>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onDismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <IconSymbol name="close" size={18} color={theme.colors.secondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={onAction}>
                    <Text style={styles.actionText}>{actionConfig.label}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.smd,
        minHeight: 80,
    },
    leftContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.smd,
    },
    rightContent: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    closeButton: {
        marginTop: -6,
        marginRight: -6,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundInput,
    },
    thumbnailPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badge: {
        backgroundColor: theme.colors.primarySoft,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeOrder: {
        backgroundColor: theme.colors.infoSoft,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'uppercase',
    },
    badgeTextOrder: {
        color: theme.colors.info,
    },
    name: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.secondary,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginTop: 2,
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.error,
    },
    originalPrice: {
        fontSize: 12,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    itemCount: {
        fontSize: 12,
        color: theme.colors.secondary,
    },
    actionButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderRadius: theme.radius.m,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.surface,
    },
}));

export default ContextBar;
