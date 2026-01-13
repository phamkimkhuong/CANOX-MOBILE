/**
 * ==============================================
 * WISHLIST CARD - Bộ sưu tập card component
 * ==============================================
 * Displays wishlist summary in list view
 * Shows cover image, name, item count, and visibility
 */

import { IconSymbol } from '@/components/ui/Icon';
import type { WishlistCardUI } from '@/types/wishlist';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface WishlistCardProps {
    wishlist: WishlistCardUI;
    onPress: (wishlistId: string) => void;
    onLongPress?: (wishlist: WishlistCardUI) => void;
}

/**
 * WishlistCard - Hiển thị một bộ sưu tập yêu thích
 * 
 * @example
 * <WishlistCard 
 *   wishlist={wishlist} 
 *   onPress={(id) => navigate(id)} 
 * />
 */
export const WishlistCard: React.FC<WishlistCardProps> = ({
    wishlist,
    onPress,
    onLongPress,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handlePress = () => onPress(wishlist.id);
    const handleLongPress = () => onLongPress?.(wishlist);

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed,
            ]}
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={300}
        >
            {/* Cover Image */}
            <View style={styles.imageContainer}>
                {wishlist.coverImageUrl ? (
                    <Image
                        source={{ uri: wishlist.coverImageUrl }}
                        style={styles.coverImage}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <IconSymbol
                            name="favorite-border"
                            size={32}
                            color={theme.colors.secondary}
                        />
                    </View>
                )}

                {/* Default Badge */}
                {wishlist.isDefault && (
                    <View style={styles.defaultBadge}>
                        <IconSymbol name="star" size={12} color={theme.colors.warning} />
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>
                        {wishlist.name}
                    </Text>
                    <IconSymbol
                        name={wishlist.isPublic ? 'public' : 'lock'}
                        size={16}
                        color={wishlist.isPublic ? theme.colors.info : theme.colors.secondary}
                    />
                </View>

                {wishlist.description && (
                    <Text style={styles.description} numberOfLines={1}>
                        {wishlist.description}
                    </Text>
                )}

                <View style={styles.footer}>
                    <Text style={styles.itemCount}>
                        {wishlist.itemCount} sản phẩm
                    </Text>
                    <View style={styles.dot} />
                    <Text style={styles.date}>
                        {wishlist.formattedDate}
                    </Text>
                </View>
            </View>

            {/* Arrow */}
            <IconSymbol
                name="chevron-right"
                size={20}
                color={theme.colors.secondary}
            />
        </Pressable>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.margins.md,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        borderRadius: theme.radius.l,
        ...theme.shadows.small,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    imageContainer: {
        position: 'relative',
    },
    coverImage: {
        width: 64,
        height: 64,
        borderRadius: theme.radius.m,
    },
    placeholderImage: {
        width: 64,
        height: 64,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundSurface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.warningLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    content: {
        flex: 1,
        marginLeft: theme.margins.smd,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    description: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.margins.sm,
    },
    itemCount: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '500',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: theme.colors.secondary,
        marginHorizontal: theme.margins.sm,
    },
    date: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
}));
