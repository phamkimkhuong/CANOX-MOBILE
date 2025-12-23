import { FollowedShop } from '@/types/profile';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { memo, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface FollowedShopsSectionProps {
    shops: FollowedShop[];
    isLoading?: boolean;
    onPressShop?: (shopId: string) => void;
    onViewAll?: () => void;
}

interface ShopItemProps {
    shop: FollowedShop;
    onPress: (shopId: string) => void;
}

/**
 * Single shop item in horizontal list
 */
const ShopItem: React.FC<ShopItemProps> = memo(({ shop, onPress }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    return (
        <TouchableOpacity
            style={styles.shopItem}
            onPress={() => onPress(shop.id)}
            activeOpacity={0.7}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: shop.avatar ?? undefined }}
                    style={styles.shopAvatar}
                    contentFit="cover"
                    placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                    transition={200}
                />
                {shop.isPreferred && (
                    <View style={styles.preferredBadge}>
                        <MaterialIcons name="verified" size={14} color={theme.colors.primary} />
                    </View>
                )}
            </View>
            <Text style={styles.shopName} numberOfLines={2}>
                {shop.name}
            </Text>
        </TouchableOpacity>
    );
});

ShopItem.displayName = 'ShopItem';

/**
 * Skeleton item for loading state
 */
const ShopItemSkeleton: React.FC = memo(() => {
    const styles = stylesheet;

    return (
        <View style={styles.shopItem}>
            <View style={styles.avatarSkeleton} />
            <View style={styles.nameSkeleton} />
        </View>
    );
});

ShopItemSkeleton.displayName = 'ShopItemSkeleton';

/**
 * Followed shops horizontal section
 */
export const FollowedShopsSection: React.FC<FollowedShopsSectionProps> = memo(({
    shops,
    isLoading = false,
    onPressShop,
    onViewAll,
}) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    const handlePressShop = useCallback((shopId: string) => {
        onPressShop?.(shopId);
    }, [onPressShop]);

    // Don't render if no shops and not loading
    if (!isLoading && shops.length === 0) {
        return null;
    }

    // Loading skeleton
    if (isLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.titleSkeleton} />
                </View>
                <View style={styles.listContainer}>
                    <View style={styles.skeletonRow}>
                        {[1, 2, 3, 4].map((i) => (
                            <ShopItemSkeleton key={i} />
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Shop đang theo dõi</Text>
                <TouchableOpacity
                    style={styles.viewAllBtn}
                    onPress={onViewAll}
                    activeOpacity={0.7}
                >
                    <Text style={styles.viewAllText}>Xem tất cả ({shops.length})</Text>
                    <MaterialIcons name="chevron-right" size={16} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>

            {/* Horizontal List */}
            <View style={styles.listContainer}>
                <FlatList
                    data={shops}
                    renderItem={({ item }) => (
                        <ShopItem shop={item} onPress={handlePressShop} />
                    )}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </View>
    );
});

FollowedShopsSection.displayName = 'FollowedShopsSection';

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        marginBottom: theme.margins.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        marginBottom: theme.margins.md,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.colors.secondary,
    },
    listContainer: {
        height: 110,
    },
    listContent: {
        paddingHorizontal: theme.margins.md,
    },
    shopItem: {
        width: 72,
        alignItems: 'center',
        marginRight: theme.margins.md,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: theme.margins.sm,
    },
    shopAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.secondaryLight,
    },
    preferredBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    shopName: {
        fontSize: 11,
        fontWeight: '500',
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        lineHeight: 14,
    },
    // Skeleton styles
    titleSkeleton: {
        width: 120,
        height: 16,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
    skeletonRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.margins.md,
    },
    avatarSkeleton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.secondaryLight,
        marginBottom: theme.margins.sm,
    },
    nameSkeleton: {
        width: 50,
        height: 12,
        borderRadius: 4,
        backgroundColor: theme.colors.secondaryLight,
    },
}));
