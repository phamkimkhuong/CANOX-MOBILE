import { IconSymbol } from '@/components/ui/Icon';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    onPress?: () => void;
}

export const ProductCard = ({ id, name, price, imageUrl, onPress }: ProductCardProps) => {
    const { theme } = useUnistyles();

    return (
        <TouchableOpacity
            style={styles.outerContainer}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <BlurView intensity={30} tint="dark" style={styles.container}>
                <Image source={imageUrl} style={styles.image} contentFit="cover" />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.price}>₫{price.toLocaleString()}</Text>
                </View>

                <LinearGradient
                    colors={[theme.colors.newPrimary, '#ff4b6e']} // Tạo dải gradient từ Primary sang màu nhạt hơn
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buyButton}
                >
                    <IconSymbol name="shopping-cart" size={16} color="#fff" />
                </LinearGradient>
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create((theme) => ({
    outerContainer: {
        width: 230, // Tăng nhẹ để chứa border
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.25)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    container: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'center',
    },
    image: {
        width: 46,
        height: 46,
        borderRadius: 6,
        backgroundColor: '#333',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    price: {
        color: theme.colors.newPrimary,
        fontSize: 13,
        fontWeight: '800',
        marginTop: 2,
    },
    buyButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
        elevation: 4,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    }
}));
