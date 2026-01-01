/**
 * CheckoutItem Component
 * 
 * Displays a single product item in checkout.
 * Simplified version of CartItem:
 * - No checkbox (already selected)
 * - No quantity stepper (locked)
 * - Shows quantity as text badge
 */

import type { CheckoutItemUI } from '@/types/checkout';
import { formatCurrency } from '@/utils/format';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CheckoutItemProps {
    item: CheckoutItemUI;
}

export const CheckoutItem: React.FC<CheckoutItemProps> = ({ item }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const formattedPrice = formatCurrency(item.unitPrice);
    const totalPrice = formatCurrency(item.unitPrice * item.quantity);

    return (
        <View style={styles.container}>
            {/* Product Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                    transition={200}
                    accessibilityLabel={`Ảnh sản phẩm ${item.productName}`}
                />
                {/* Quantity Badge */}
                <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>x{item.quantity}</Text>
                </View>
            </View>

            {/* Product Info */}
            <View style={styles.infoContainer}>
                {/* Name */}
                <Text style={styles.name} numberOfLines={2}>
                    {item.productName}
                </Text>

                {/* Variant */}
                {item.variantAttributes && (
                    <View style={styles.variantContainer}>
                        <Text style={styles.variantText}>
                            Phân loại: {item.variantAttributes}
                        </Text>
                    </View>
                )}

                {/* Price Row */}
                <View style={styles.priceRow}>
                    <Text style={styles.unitPrice}>{formattedPrice}</Text>
                    {item.quantity > 1 && (
                        <Text style={styles.totalPrice}>= {totalPrice}</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },

    imageContainer: {
        position: 'relative',
    },

    image: {
        width: 72,
        height: 72,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.background,
    },

    quantityBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },

    quantityText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    infoContainer: {
        flex: 1,
        marginLeft: theme.margins.md,
        justifyContent: 'center',
    },

    name: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
        lineHeight: 20,
    },

    variantContainer: {
        marginTop: 4,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
        alignSelf: 'flex-start',
    },

    variantText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },

    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        gap: theme.margins.sm,
    },

    unitPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.error,
    },

    totalPrice: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
}));

export default CheckoutItem;
