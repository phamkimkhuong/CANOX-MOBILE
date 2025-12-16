import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';

// Định nghĩa kiểu dữ liệu đầu vào (Props)
interface ProductCardProps {
    title: string;
    price: number;
    image: string;
    originalPrice?: number;
    onPress: () => void;
}

export const ProductCard = ({ title, price, image, originalPrice, onPress }: ProductCardProps) => {
    const theme = useTheme();

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
            <Surface style={styles.surface} elevation={1}>
                {/* Ảnh sản phẩm */}
                <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />

                {/* Nội dung */}
                <View style={styles.content}>
                    <Text variant="bodyMedium" numberOfLines={2} style={styles.title}>
                        {title}
                    </Text>

                    <View style={styles.priceRow}>
                        <Text variant="titleMedium" style={{ color: theme.colors.error, fontWeight: 'bold' }}>
                            ${price}
                        </Text>
                        {originalPrice && (
                            <Text variant="bodySmall" style={styles.originalPrice}>
                                ${originalPrice}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Nút Add to Cart nhỏ (Optional) */}
                <IconButton
                    icon="cart-plus"
                    size={20}
                    iconColor={theme.colors.primary}
                    style={styles.cartBtn}
                />
            </Surface>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%', // Chia đôi màn hình (có khoảng cách ở giữa)
        marginBottom: 10,
    },
    surface: {
        borderRadius: 8,
        backgroundColor: 'white',
        overflow: 'hidden', // Để ảnh bo góc theo surface
    },
    image: {
        width: '100%',
        height: 140,
    },
    content: {
        padding: 8,
    },
    title: {
        marginBottom: 4,
        height: 40, // Cố định chiều cao text để card đều nhau
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: '#94a3b8',
    },
    cartBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: 0,
    }
});