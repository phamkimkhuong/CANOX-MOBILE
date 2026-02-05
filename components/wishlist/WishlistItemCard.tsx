/**
 * ==============================================
 * WISHLIST ITEM CARD - Item trong bộ sưu tập
 * ==============================================
 * Displays a single product in wishlist with:
 * - Product info, price, options
 * - Desired price tracking
 * - Priority indicator
 * - Quick actions (add to cart, edit, delete)
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { WishlistItemUI } from '@/types/wishlist';
import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface WishlistItemCardProps {
    item: WishlistItemUI;
    onPress: (item: WishlistItemUI) => void;
    onAddToCart?: (item: WishlistItemUI) => void;
    onEdit?: (item: WishlistItemUI) => void;
    onDelete?: (item: WishlistItemUI) => void;
}

/**
 * WishlistItemCard - Hiển thị sản phẩm trong wishlist
 * 
 * @example
 * <WishlistItemCard 
 *   item={item} 
 *   onPress={handlePress}
 *   onAddToCart={handleAddToCart}
 * />
 */
export const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
    item,
    onPress,
    onAddToCart,
    onEdit,
    onDelete,
}) => {
    const { t } = useTranslation(['wishlist', 'common']);
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handlePress = () => onPress(item);
    const handleAddToCart = () => onAddToCart?.(item);
    const handleEdit = () => onEdit?.(item);
    const handleDelete = () => onDelete?.(item);

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
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
            onPress={handlePress}
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

            {/* Quick Actions */}
            <View style={styles.actions}>
                <Pressable
                    style={styles.actionButton}
                    onPress={handleAddToCart}
                    hitSlop={8}
                >
                    <IconSymbol
                        name="cart"
                        size={20}
                        color={theme.colors.primary}
                    />
                </Pressable>

                <Pressable
                    style={styles.actionButton}
                    onPress={handleEdit}
                    hitSlop={8}
                >
                    <IconSymbol
                        name="edit"
                        size={18}
                        color={theme.colors.secondary}
                    />
                </Pressable>

                <Pressable
                    style={styles.actionButton}
                    onPress={handleDelete}
                    hitSlop={8}
                >
                    <IconSymbol
                        name="delete"
                        size={18}
                        color={theme.colors.error}
                    />
                </Pressable>
            </View>
        </Pressable>
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
        gap: theme.margins.sm,
        paddingLeft: theme.margins.sm,
    },
    actionButton: {
        padding: theme.margins.sm,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundSurface,
    },
}));
