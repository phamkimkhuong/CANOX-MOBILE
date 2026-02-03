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
    onClose?: () => void;
}

export const ProductCard = ({ id, name, price, imageUrl, onPress, onClose }: ProductCardProps) => {
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
                    colors={[theme.colors.newPrimary, '#ff4b6e']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buyButton}
                >
                    <IconSymbol name="shopping-cart" size={16} color="#fff" />
                </LinearGradient>

                {onClose && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <IconSymbol name="close" size={12} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                )}
            </BlurView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create((theme) => ({
    outerContainer: {
        width: 260,
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
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    price: {
        color: theme.colors.newPrimary,
        fontSize: 15,
        fontWeight: '700',
        marginTop: 2,
    },
    buyButton: {
        width: 35,
        height: 35,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 4,
        elevation: 4,
        shadowColor: theme.colors.newPrimary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    closeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    }
}));
