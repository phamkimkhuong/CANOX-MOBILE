import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface FlashProduct {
    id: number;
    image: string;
    price: number;
    discount: number;
    sold: number;
    total: number;
}

const FLASH_PRODUCTS: FlashProduct[] = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
        price: 15.99,
        discount: 50,
        sold: 120,
        total: 150,
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
        price: 89.0,
        discount: 30,
        sold: 45,
        total: 100,
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
        price: 65.0,
        discount: 25,
        sold: 98,
        total: 100,
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        price: 199.0,
        discount: 40,
        sold: 35,
        total: 50,
    },
];

export const FlashSale = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 15, seconds: 30 });

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (num: number) => num.toString().padStart(2, '0');

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>FLASH SALE</Text>
                    <View style={styles.timerRow}>
                        <View style={styles.timerBox}>
                            <Text style={styles.timerText}>{formatTime(timeLeft.hours)}</Text>
                        </View>
                        <Text style={styles.timerColon}>:</Text>
                        <View style={styles.timerBox}>
                            <Text style={styles.timerText}>{formatTime(timeLeft.minutes)}</Text>
                        </View>
                        <Text style={styles.timerColon}>:</Text>
                        <View style={styles.timerBox}>
                            <Text style={styles.timerText}>{formatTime(timeLeft.seconds)}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>See All</Text>
                    <MaterialIcons name="chevron-right" size={16} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Products Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FLASH_PRODUCTS.map((product) => (
                    <TouchableOpacity key={product.id} style={styles.productCard} activeOpacity={0.8}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: product.image }}
                                style={styles.productImage}
                                contentFit="cover"
                            />
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{product.discount}%</Text>
                            </View>
                        </View>
                        <View style={styles.productInfo}>
                            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                            {/* Progress Bar */}
                            <View style={styles.progressBg}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(product.sold / product.total) * 100}%` },
                                    ]}
                                />
                            </View>
                            <Text style={styles.soldText}>{product.sold} sold</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.margins.md,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
        color: '#f97316',
        letterSpacing: 1,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timerBox: {
        backgroundColor: theme.colors.typography,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    timerText: {
        color: theme.colors.surface,
        fontSize: 12,
        fontWeight: 'bold',
    },
    timerColon: {
        color: theme.colors.typography,
        fontWeight: 'bold',
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        fontSize: 12,
        color: theme.colors.secondary,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 12,
    },
    productCard: {
        width: 130,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.primarySubtle,
        borderWidth: 1,
        borderColor: `${theme.colors.primary}10`,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#facc15',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderBottomLeftRadius: theme.radius.m,
    },
    discountText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
    productInfo: {
        marginTop: theme.margins.sm,
        gap: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    progressBg: {
        height: 6,
        backgroundColor: `${theme.colors.secondary}30`,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#f97316',
        borderRadius: 3,
    },
    soldText: {
        fontSize: 10,
        color: theme.colors.secondary,
    },
}));
