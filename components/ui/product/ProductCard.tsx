import { formatCurrency, formatSoldCount } from '@/utils/format';
import { createLogger } from '@/utils/logger';
import { Image } from 'expo-image';
import { Href } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
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

export const ProductCard = React.memo(({
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
    const { t } = useTranslation(['product']);
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
                <View
                    style={[styles.shadowWrapper, pressed && styles.pressedOpacity]}
                    shouldRasterizeIOS={true}
                    renderToHardwareTextureAndroid={true}
                >
                    <View style={styles.surface}>
                        {/* Specular Highlight (Liquid Feel) */}
                        <View style={styles.specularHighlight} />

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
                                    <Text style={styles.mallText}>{t('badges.mall')}</Text>
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
                                <IconSymbol name="favorite-border" size={18} color="#333" />
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
                                        size={10}
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
                                <Text style={stylesheet.price}>{priceDisplay || formatCurrency(price)}</Text>
                                {originalPrice != null && originalPrice > price && (
                                    <Text style={stylesheet.originalPrice}>{formatCurrency(originalPrice)}</Text>
                                )}
                            </View>

                            {/* Sold & Location Row */}
                            <View style={styles.metaRow}>
                                {sold != null && (
                                    <Text style={styles.soldText}>
                                        {t('info.soldCountTemplate', { soldCount: formatSoldCount(sold) })}
                                    </Text>
                                )}
                                {location && (
                                    <View style={styles.locationRow}>
                                        <IconSymbol name="location-outline" size={10} color={theme.colors.typographySecondary} />
                                        <Text style={styles.location} numberOfLines={1}>{location}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </SmartNavButton>
    );
});

ProductCard.displayName = 'ProductCard';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        padding: 4,
    },
    shadowWrapper: {
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        // Premium Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    surface: {
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    specularHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        zIndex: 10,
    },
    pressedOpacity: {
        opacity: 0.9,
        transform: [{ scale: 1 }],
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: theme.colors.background,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: theme.colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        zIndex: 2,
    },
    discountText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
    },
    mallBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: theme.colors.error,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 2,
    },
    mallText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#FFF',
        textTransform: 'uppercase',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    content: {
        padding: 10,
        gap: 2,
    },
    title: {
        fontSize: 13,
        lineHeight: 18,
        color: theme.colors.typography,
        fontWeight: '500',
        letterSpacing: -0.2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginTop: 2,
    },
    reviewsText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        marginLeft: 2,
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    price: {
        color: theme.colors.error,
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: -0.5,
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: theme.colors.typographySecondary,
        fontSize: 11,
        fontWeight: '400',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    soldText: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        flexShrink: 1,
    },
    location: {
        fontSize: 10,
        color: theme.colors.typographySecondary,
        flexShrink: 1,
        fontWeight: '500',
    },
}));