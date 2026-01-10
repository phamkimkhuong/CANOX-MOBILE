import { formatCurrency, formatSoldCount } from '@/utils/format';
import { createLogger } from '@/utils/logger';
import { Image } from 'expo-image';
import { Href } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { IconSymbol } from '../Icon';
import { SmartNavButton } from '../navigation/SmartNavButton';

const log = createLogger('ProductCard');

interface ProductCardProps {
    title: string;
    price: number;
    image: string;
    originalPrice?: number;
    rating?: number;
    reviews?: number;
    sold?: number;
    location?: string;
    discount?: number;
    isMall?: boolean;
    onPress: () => void;
    onPressIn?: () => void;
    route: Href | string;
    priceDisplay?: string;
}

export const ProductCard = ({
    title,
    price,
    image,
    originalPrice,
    rating = 4.5,
    reviews = 0,
    sold = 0,
    location,
    discount,
    isMall,
    onPress,
    onPressIn,
    route,
    priceDisplay,
}: ProductCardProps) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <SmartNavButton
            route={route}
            onPress={onPress}
            onPressIn={onPressIn}
            style={styles.container}
        >
            {({ pressed }) => (
                <View style={[styles.surface, { opacity: pressed ? 0.85 : 1 }]}>
                    {/* Image Container */}
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: image }} style={styles.image} contentFit="cover" />

                        {/* Discount Badge */}
                        {discount != null && discount > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{discount}%</Text>
                            </View>
                        )}

                        {/* Mall Badge */}
                        {isMall && (
                            <View style={styles.mallBadge}>
                                <Text style={styles.mallText}>Mall</Text>
                            </View>
                        )}

                        {/* Favorite Button */}
                        <Pressable
                            style={styles.favoriteBtn}
                            onPress={(e) => {
                                e.stopPropagation();
                                log.info('Toggle favorite');
                            }}
                        >
                            <IconSymbol name="favorite-border" size={18} color={theme.colors.secondary} />
                        </Pressable>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text numberOfLines={2} style={styles.title}>
                            {title}
                        </Text>

                        {/* Rating */}
                        <View style={styles.ratingRow}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <IconSymbol
                                    key={star}
                                    name={star <= Math.floor(rating) ? 'star' : 'star-border'}
                                    size={12}
                                    color="#facc15"
                                />
                            ))}
                            {reviews > 0 && (
                                <Text style={styles.reviewsText}>
                                    ({reviews >= 1000 ? `${(reviews / 1000).toFixed(1)}k` : reviews})
                                </Text>
                            )}
                        </View>

                        {/* Price Row */}
                        <View style={styles.priceRow}>
                            <Text style={styles.price}>{priceDisplay || formatCurrency(price)}</Text>
                            {originalPrice != null && originalPrice > price && (
                                <Text style={styles.originalPrice}>{formatCurrency(originalPrice)}</Text>
                            )}
                        </View>

                        {/* Sold & Location Row */}
                        <View style={styles.metaRow}>
                            {sold != null && (
                                <Text style={styles.soldText}>Đã bán {formatSoldCount(sold)}</Text>
                            )}
                            {location && <Text style={styles.location}>{location}</Text>}
                        </View>
                    </View>
                </View>
            )}
        </SmartNavButton>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        padding: theme.margins.sm / 2,
        paddingTop: 0,
    },
    surface: {
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.primaryLight,
        shadowColor: theme.colors.typography,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: theme.colors.primaryMuted,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: theme.margins.sm,
        left: theme.margins.sm,
        backgroundColor: theme.colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    discountText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    mallBadge: {
        position: 'absolute',
        top: theme.margins.sm,
        left: theme.margins.sm,
        backgroundColor: theme.colors.error,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: theme.radius.s,
    },
    mallText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
    },
    favoriteBtn: {
        position: 'absolute',
        top: theme.margins.sm,
        right: theme.margins.sm,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.colors.surfaceOverlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: theme.margins.sm,
    },
    title: {
        marginBottom: 4,
        fontSize: 13,
        lineHeight: 18,
        height: 36,
        color: theme.colors.typography,
        fontWeight: '500',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginBottom: 4,
    },
    reviewsText: {
        fontSize: 11,
        color: theme.colors.secondary,
        marginLeft: 4,
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
        color: theme.colors.secondary,
        fontSize: 11,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    soldText: {
        fontSize: 11,
        color: theme.colors.secondary,
    },
    location: {
        fontSize: 11,
        color: theme.colors.secondary,
    },
}));