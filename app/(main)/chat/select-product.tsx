/**
 * SelectProductScreen - Full page product picker for chat
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useShopProducts } from '@/hooks/api/useShop';
import { useChatPickerStore } from '@/store/useChatPickerStore';
import { ShopProductItemUI } from '@/types/shop';
import { formatCurrency } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { toPublicUrl } from '@/utils/url';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================
// COMPONENT
// ============================================

export default function SelectProductScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    // URL params
    const params = useLocalSearchParams<{
        shopId: string;
        conversationId: string;
        shopName?: string;
    }>();

    const shopId = params.shopId as string;
    const conversationId = params.conversationId as string;
    const shopName = (params.shopName as string) || 'Shop';

    // Store actions
    const { selectProductFromUI, setConversationId } = useChatPickerStore();

    // Search state
    const [searchKeyword, setSearchKeyword] = useState('');

    // Fetch shop products with infinite scroll
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useShopProducts(shopId, {
        keyword: searchKeyword || undefined,
        size: 20,
    });

    // Flatten pages into single array
    const products = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap(page => page.items);
    }, [data?.pages]);

    // Total count for display
    const totalCount = data?.pages?.[0]?.totalElements ?? 0;

    const handleSelectProduct = useCallback((product: ShopProductItemUI) => {
        if (conversationId) {
            setConversationId(conversationId as string);
        }
        selectProductFromUI(product, shopId, shopName);
        Navigator.back();
    }, [selectProductFromUI, setConversationId, conversationId, shopId, shopName]);

    // Handle load more
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Render product item
    const renderProduct = useCallback(({ item }: { item: ShopProductItemUI }) => {
        const imageUrl = toPublicUrl(item.thumbnail);

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.productItem,
                    pressed && styles.productItemPressed
                ]}
                onPress={() => handleSelectProduct(item)}
            >
                {/* Product Image */}
                <Image
                    source={{ uri: imageUrl || 'https://via.placeholder.com/80' }}
                    style={styles.productImage}
                    contentFit="cover"
                />

                {/* Product Info */}
                <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                        {item.title}
                    </Text>

                    {/* Rating & Sold */}
                    {(item.rating > 0 || item.sold > 0) && (
                        <View style={styles.productMeta}>
                            {item.rating > 0 && (
                                <View style={styles.ratingBadge}>
                                    <IconSymbol name="star" size={12} color={theme.colors.warning} />
                                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                                </View>
                            )}
                            {item.sold > 0 && (
                                <Text style={styles.soldText}>Đã bán {item.sold}</Text>
                            )}
                        </View>
                    )}

                    {/* Price */}
                    <View style={styles.priceRow}>
                        <Text style={styles.productPrice}>
                            {formatCurrency(item.price)}
                        </Text>
                        {item.originalPrice && item.originalPrice > item.price && (
                            <Text style={styles.originalPrice}>
                                {formatCurrency(item.originalPrice)}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Select Button */}
                <View style={styles.selectButton}>
                    <IconSymbol name="send" size={18} color={theme.colors.primary} />
                </View>
            </Pressable>
        );
    }, [handleSelectProduct, styles, theme.colors]);

    // Render footer (loading indicator)
    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;

        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }, [isFetchingNextPage, styles.footerLoading, theme.colors.primary]);

    // Render empty state
    const renderEmpty = useCallback(() => {
        if (isLoading) return null;

        return (
            <View style={styles.emptyContainer}>
                <IconSymbol name="shopping-bag" size={48} color={theme.colors.secondary} />
                <Text style={styles.emptyText}>
                    {searchKeyword ? 'Không tìm thấy sản phẩm' : 'Shop chưa có sản phẩm nào'}
                </Text>
                <Text style={styles.emptySubtext}>
                    {searchKeyword
                        ? 'Thử tìm kiếm với từ khóa khác'
                        : 'Sản phẩm sẽ hiển thị khi shop đăng bán'
                    }
                </Text>
            </View>
        );
    }, [isLoading, searchKeyword, styles, theme.colors.secondary]);

    return (
        <View style={styles.container}>
            {/* STICKY HEADER */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerContent}>
                    {/* Back Button */}
                    <Pressable
                        style={styles.backButton}
                        onPress={Navigator.back}
                        hitSlop={12}
                    >
                        <IconSymbol name="back" size={24} color={theme.colors.typography} />
                    </Pressable>

                    {/* Title */}
                    <View style={styles.headerTitle}>
                        <Text style={styles.title}>Chọn sản phẩm</Text>
                        {totalCount > 0 && (
                            <Text style={styles.countBadge}>{totalCount}</Text>
                        )}
                    </View>

                    {/* Placeholder for alignment */}
                    <View style={styles.headerRight} />
                </View>

                {/* SEARCH BAR  */}
                <View style={styles.searchContainer}>
                    <IconSymbol name="search" size={18} color={theme.colors.secondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm sản phẩm..."
                        placeholderTextColor={theme.colors.secondary}
                        value={searchKeyword}
                        onChangeText={setSearchKeyword}
                        returnKeyType="search"
                    />
                    {searchKeyword.length > 0 && (
                        <Pressable onPress={() => setSearchKeyword('')} hitSlop={8}>
                            <IconSymbol name="close" size={16} color={theme.colors.secondary} />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* PRODUCT LIST */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}
        </View>
    );
}

// ============================================
// STYLES
// ============================================

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.margins.sm,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        height: 56,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.typography,
        letterSpacing: -0.3,
    },
    countBadge: {
        fontSize: 12,
        color: theme.colors.primary,
        backgroundColor: theme.colors.primaryMuted,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: theme.radius.full,
        fontWeight: '600',
    },
    headerRight: {
        width: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.sm,
        marginHorizontal: theme.margins.md,
        height: 38,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
        paddingVertical: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
    },
    listContent: {
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.xl,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.margins.smd,
        borderRadius: theme.radius.m,
        gap: 12,
    },
    productItemPressed: {
        backgroundColor: theme.colors.background,
    },
    productImage: {
        width: 72,
        height: 72,
        borderRadius: theme.radius.m,
        backgroundColor: theme.colors.backgroundInput,
    },
    productInfo: {
        flex: 1,
        gap: 4,
    },
    productName: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
        lineHeight: 20,
    },
    productMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    ratingText: {
        fontSize: 12,
        color: theme.colors.warning,
        fontWeight: '600',
    },
    soldText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.error,
    },
    originalPrice: {
        fontSize: 13,
        color: theme.colors.secondary,
        textDecorationLine: 'line-through',
    },
    selectButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    separator: {
        height: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        gap: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    footerLoading: {
        paddingVertical: 16,
        alignItems: 'center',
    },
}));
