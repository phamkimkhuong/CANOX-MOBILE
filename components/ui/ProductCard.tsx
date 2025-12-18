import '@/constants/unistyles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ProductCardProps {
    title: string;
    price: number;
    image: string;
    originalPrice?: number;
    onPress: () => void;
}

export const ProductCard = ({ title, price, image, originalPrice, onPress }: ProductCardProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
            <View style={styles.surface}>
                <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                <View style={styles.content}>
                    <Text numberOfLines={2} style={styles.title}>
                        {title}
                    </Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.price}>${price}</Text>
                        {originalPrice != null && (
                            <Text style={styles.originalPrice}>${originalPrice}</Text>
                        )}
                    </View>
                </View>
                {/* Cart Button */}
                <View style={styles.cartBtn}>
                    <Ionicons name="add" size={18} color={theme.colors.onPrimary} />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        width: '90%',
        marginBottom: theme.margins.md,
    },
    surface: {
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: '#f8fafc',
    },
    content: {
        padding: theme.margins.sm + 2,
    },
    title: {
        marginBottom: 6,
        height: 36,
        fontSize: 13,
        lineHeight: 18,
        color: theme.colors.typography,
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    price: {
        color: theme.colors.error,
        fontWeight: '700',
        fontSize: 15,
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: theme.colors.typographySecondary,
        fontSize: 11,
    },
    cartBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.full,
    }
}));