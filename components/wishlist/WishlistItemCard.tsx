/**
 * ==============================================
 * WISHLIST ITEM CARD - Item trong bộ sưu tập
 * ==============================================
 * Displays a single product in wishlist with:
 * - Product info, price, options
 * - Desired price tracking
 * - Priority indicator
 * - Red heart toggle (tap to remove with undo)
 * - Quick add to cart
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { WishlistItemUI } from '@/types/wishlist';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface WishlistItemCardProps {
    item: WishlistItemUI;
    /** Whether this item is pending removal (shown faded) */
    isPendingRemoval?: boolean;
    onPress: (item: WishlistItemUI) => void;
    onAddToCart?: (item: WishlistItemUI) => void;
    /** Called when user taps the heart (toggle unfavorite) */
    onHeartPress?: (item: WishlistItemUI) => void;
}

/**
 * WishlistItemCard - Hiển thị sản phẩm trong wishlist
 * 
 * @example
 * <WishlistItemCard 
 *   item={item} 
 *   onPress={handlePress}
 *   onHeartPress={handleHeartPress}
 *   onAddToCart={handleAddToCart}
 * />
 */
export const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
    item,
    isPendingRemoval = false,
    onPress,
    onAddToCart,
    onHeartPress,
}) => {
    const { t } = useTranslation(['wishlist', 'common']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // Heart beat animation
    const heartScale = useSharedValue(1);

    const heartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const handlePress = useCallback(() => onPress(item), [onPress, item]);
    const handleAddToCart = useCallback(() => onAddToCart?.(item), [onAddToCart, item]);

    const handleHeartPress = useCallback(() => {
        // Heart-break animation: scale up then down
        heartScale.value = withSequence(
            withSpring(1.3, { damping: 4, stiffness: 300 }),
            withSpring(0.8, { damping: 6, stiffness: 200 }),
            withSpring(1, { damping: 8, stiffness: 250 }),
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onHeartPress?.(item);
    }, [onHeartPress, item, heartScale]);

    /**
     * Get priority badge style based on priority level
     */
    const getPriorityStyle = () => {
        switch (item.priority) {
            case 2:
                return { bg: theme.colors.errorLight, color: theme.colors.error };
            case 1:
                return { bg: theme.colors.warningLight, color: theme.colors.warning };
            default:
                return null;
        }
    };

    const priorityStyle = getPriorityStyle();

    return (
        <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            style={[
                isPendingRemoval && { opacity: 0.35, transform: [{ scale: 0.97 }] },
            ]}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.container,
                    pressed && styles.pressed,
                ]}
                onPress={handlePress}
                disabled={isPendingRemoval}
            >
                {/* Product Image */}
                <View style={styles.imageWrapper}>
                    {item.imageUrl ? (
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.image}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <IconSymbol
                                name="cube"
                                size={24}
                                color={theme.colors.secondary}
                            />
                        </View>
                    )}

                    {/* Priority Badge */}
                    {priorityStyle && (
                        <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                            <Text style={[styles.priorityText, { color: priorityStyle.color }]}>
                                {item.priorityLabel}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Product Info */}
                <View style={styles.content}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.productName}
                    </Text>

                    {/* Variant Options */}
                    {item.optionsDisplay && (
                        <Text style={styles.options} numberOfLines={1}>
                            {item.optionsDisplay}
                        </Text>
                    )}

                    {/* Price Section */}
                    <View style={styles.priceSection}>
                        <Text style={styles.price}>{item.formattedPrice}</Text>
                        {item.quantity > 1 && (
                            <Text style={styles.quantity}>
                                {t('common:actions.quantityTemplate', { count: item.quantity })}
                            </Text>
                        )}
                    </View>

                    {/* Desired Price Tracking */}
                    {item.desiredPrice !== null && (
                        <View style={[
                            styles.targetPriceContainer,
                            item.isPriceTargetMet ? styles.targetMet : styles.targetNotMet,
                        ]}>
                            <IconSymbol
                                name={item.isPriceTargetMet ? 'check-circle' : 'time'}
                                size={14}
                                color={item.isPriceTargetMet ? theme.colors.success : theme.colors.warning}
                            />
                            <Text style={[
                                styles.targetPriceText,
                                { color: item.isPriceTargetMet ? theme.colors.success : theme.colors.warning },
                            ]}>
                                {item.isPriceTargetMet
                                    ? t('targetPriceMet', { price: item.formattedDesiredPrice })
                                    : t('targetPriceGoal', { price: item.formattedDesiredPrice })
                                }
                            </Text>
                        </View>
                    )}

                    {/* Notes */}
                    {item.notes && (
                        <View style={styles.notesContainer}>
                            <IconSymbol name="note" size={12} color={theme.colors.secondary} />
                            <Text style={styles.notes} numberOfLines={1}>
                                {item.notes}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Actions: Heart + Cart */}
                <View style={styles.actions}>
                    {/* Heart Toggle - Always Red */}
                    <AnimatedPressable
                        style={[styles.heartButton, heartAnimatedStyle]}
                        onPress={handleHeartPress}
                        hitSlop={10}
                        disabled={isPendingRemoval}
                    >
                        <IconSymbol
                            name="heart"
                            size={22}
                            color={theme.colors.error}
                        />
                    </AnimatedPressable>

                    {/* Add to Cart */}
                    <Pressable
                        style={styles.actionButton}
                        onPress={handleAddToCart}
                        hitSlop={8}
                        disabled={isPendingRemoval}
                    >
                        <IconSymbol
                            name="cart"
                            size={20}
                            color={theme.colors.primary}
                        />
                    </Pressable>
                </View>
            </Pressable>
        </Animated.View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: theme.margins.smd,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        borderRadius: theme.radius.l,
        ...theme.shadows.small,
    },
    pressed: {
        opacity: 0.9,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: theme.radius.m,
    },
    imagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundSurface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    priorityBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        marginLeft: theme.margins.smd,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.typography,
        lineHeight: 20,
    },
    options: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    priceSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.margins.sm,
        gap: theme.margins.sm,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.error,
    },
    quantity: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
    },
    targetPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.margins.sm,
        paddingHorizontal: theme.margins.sm,
        paddingVertical: 4,
        borderRadius: theme.radius.s,
        gap: 4,
        alignSelf: 'flex-start',
    },
    targetMet: {
        backgroundColor: theme.colors.successLight,
    },
    targetNotMet: {
        backgroundColor: theme.colors.warningLight,
    },
    targetPriceText: {
        fontSize: 12,
        fontWeight: '500',
    },
    notesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.margins.sm,
        gap: 4,
    },
    notes: {
        flex: 1,
        fontSize: 12,
        color: theme.colors.typographySecondary,
        fontStyle: 'italic',
    },
    actions: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.margins.smd,
        paddingLeft: theme.margins.sm,
    },
    heartButton: {
        padding: theme.margins.sm,
    },
    actionButton: {
        padding: theme.margins.sm,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundSurface,
    },
}));
