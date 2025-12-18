import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { SectionHeader } from '@/components/ui/SectionHeader';

interface FeaturedProduct {
    id: number;
    title: string;
    price: number;
    image: string;
    badge?: string;
    discount?: number;
}

const FEATURED_MAIN = {
    id: 0,
    title: 'iPhone 15 Pro Max',
    subtitle: 'Capture life in cinematic detail. Unbeatable performance.',
    price: 1199,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
};

const FEATURED_PRODUCTS: FeaturedProduct[] = [
    {
        id: 1,
        title: 'Fast Wireless Charger',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=300',
        badge: 'New',
    },
    {
        id: 2,
        title: 'Portable Bluetooth Speaker',
        price: 49.50,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
        discount: 10,
    },
    {
        id: 3,
        title: 'Ergonomic Laptop Stand',
        price: 35.0,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
        badge: 'Best Deal',
    },
];

export const FeaturedSection = () => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <View style={styles.container}>
            <View style={styles.headerPadding}>
                <SectionHeader title="DÀNH RIÊNG CHO BẠN" onSeeAll={() => { }} />
            </View>

            {/* Main Featured Banner */}
            <TouchableOpacity style={styles.mainBanner} activeOpacity={0.9}>
                <Image source={{ uri: FEATURED_MAIN.image }} style={styles.mainImage} contentFit="cover" />
                <View style={styles.mainOverlay}>
                    <View style={styles.editorBadge}>
                        <Text style={styles.editorBadgeText}>Editor's Pick</Text>
                    </View>
                    <Text style={styles.mainTitle}>{FEATURED_MAIN.title}</Text>
                    <Text style={styles.mainSubtitle}>{FEATURED_MAIN.subtitle}</Text>
                    <View style={styles.mainFooter}>
                        <Text style={styles.mainPrice}>${FEATURED_MAIN.price}</Text>
                        <TouchableOpacity style={styles.buyNowBtn}>
                            <Text style={styles.buyNowText}>Buy Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Small Featured Products */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FEATURED_PRODUCTS.map((product) => (
                    <TouchableOpacity key={product.id} style={styles.smallCard} activeOpacity={0.8}>
                        <View style={styles.smallImageContainer}>
                            <Image source={{ uri: product.image }} style={styles.smallImage} contentFit="cover" />
                            {product.badge && (
                                <View
                                    style={[
                                        styles.smallBadge,
                                        product.badge === 'Best Deal' && styles.bestDealBadge,
                                    ]}
                                >
                                    <Text style={styles.smallBadgeText}>{product.badge}</Text>
                                </View>
                            )}
                            {product.discount != null && (
                                <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>-{product.discount}%</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.smallTitle} numberOfLines={2}>
                            {product.title}
                        </Text>
                        <Text style={styles.smallPrice}>${product.price.toFixed(2)}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginTop: theme.margins.smd,
        backgroundColor: theme.colors.surface,
    },
    headerPadding: {
        paddingHorizontal: theme.margins.md,
    },
    mainBanner: {
        marginHorizontal: theme.margins.md,
        height: 180,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        marginBottom: theme.margins.md,
    },
    mainImage: {
        width: '100%',
        height: '100%',
    },
    mainOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: theme.margins.md,
        justifyContent: 'flex-end',
    },
    editorBadge: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
        marginBottom: theme.margins.sm,
    },
    editorBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
        marginBottom: 4,
    },
    mainSubtitle: {
        fontSize: 13,
        color: theme.colors.textOnOverlay,
        marginBottom: theme.margins.sm,
    },
    mainFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    mainPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    buyNowBtn: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radius.m,
    },
    buyNowText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.onPrimary,
    },
    scrollContent: {
        paddingHorizontal: theme.margins.md,
        gap: 12,
    },
    smallCard: {
        width: 100,
    },
    smallImageContainer: {
        width: '100%',
        height: 100,
        borderRadius: theme.radius.m,
        overflow: 'hidden',
        backgroundColor: theme.colors.backgroundInput,
        marginBottom: theme.margins.sm,
    },
    smallImage: {
        width: '100%',
        height: '100%',
    },
    smallBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    bestDealBadge: {
        backgroundColor: '#f97316',
    },
    smallBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    discountBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: theme.colors.error,
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    discountText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    smallTitle: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.typography,
        height: 32,
        lineHeight: 16,
    },
    smallPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
}));
