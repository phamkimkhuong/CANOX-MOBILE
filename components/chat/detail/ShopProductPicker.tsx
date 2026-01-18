/**
 * ShopProductPicker - Bottom Sheet for selecting shop products
 * Used in chat to send product cards to partner
 */
const SEARCH_THRESHOLD = 10;

import { IconSymbol } from '@/components/ui/Icon';
import { useShopProducts } from '@/hooks/api/useShop';
import { ShopProductItemUI } from '@/types/shop';
import { formatCurrency } from '@/utils/format';
import { toPublicUrl } from '@/utils/url';
import {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetModal,
    BottomSheetTextInput,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator, Dimensions, Pressable,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopProductPickerProps {
    shopId: string | undefined;
    onSelectProduct: (product: ShopProductItemUI) => void;
}

/**
 * ShopProductPicker component
 * Displays a searchable list of shop products in a bottom sheet
 */
export const ShopProductPicker = forwardRef<BottomSheetModal, ShopProductPickerProps>(
    ({ shopId, onSelectProduct }, ref) => {
        const { theme } = useUnistyles();
        const styles = stylesheet;
        const insets = useSafeAreaInsets();

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

        // Show search bar if there are more than SEARCH_THRESHOLD products
        const showSearchBar = totalCount > SEARCH_THRESHOLD;

        // Sizing strategy:
        // - Few products: Use dynamic sizing to "fit content"
        // - Many products: Use fixed snap points to prevent gesture conflicts when scrolling
        const useDynamicSizing = totalCount <= SEARCH_THRESHOLD && totalCount > 0;
        const snapPoints = useMemo(() => ['60%', '90%'], []);
        const { height: screenHeight } = Dimensions.get('window');
        const maxDynamicContentSize = screenHeight * 0.85;

        // Backdrop component
        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.4}
                />
            ),
            []
        );

        // Handle product selection
        const handleSelectProduct = useCallback((product: ShopProductItemUI) => {
            onSelectProduct(product);
            // Close the modal after selection
            (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
        }, [onSelectProduct, ref]);

        // Handle load more
        const handleLoadMore = useCallback(() => {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

        // Render footer (loading indicator)
        const renderFooter = useCallback(() => {
            if (!isFetchingNextPage) return null;

            return (
                <View style={styles.footerLoading}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            );
        }, [isFetchingNextPage, styles.footerLoading, theme.colors.primary]);

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

        /**
         * Render Header + Search bar as ListHeaderComponent
         */
        const renderListHeader = useCallback(() => {
            return (
                <View>
                    {/* Header Title */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Chọn sản phẩm</Text>
                        {totalCount > 0 && (
                            <Text style={styles.countBadge}>{totalCount} sản phẩm</Text>
                        )}
                    </View>

                    {/* Search Input - Only show if products > threshold */}
                    {showSearchBar && (
                        <View style={styles.searchContainer}>
                            <IconSymbol name="search" size={20} color={theme.colors.secondary} />
                            <BottomSheetTextInput
                                style={styles.searchInput}
                                placeholder="Tìm sản phẩm..."
                                placeholderTextColor={theme.colors.secondary}
                                value={searchKeyword}
                                onChangeText={setSearchKeyword}
                            />
                            {searchKeyword.length > 0 && (
                                <Pressable onPress={() => setSearchKeyword('')}>
                                    <IconSymbol name="close" size={18} color={theme.colors.secondary} />
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            );
        }, [showSearchBar, searchKeyword, totalCount, styles, theme.colors.secondary]);

        return (
            <BottomSheetModal
                ref={ref}
                // Conditional sizing: dynamic for few items, fixed for many
                {...(useDynamicSizing
                    ? {
                        enableDynamicSizing: true,
                        maxDynamicContentSize: maxDynamicContentSize,
                    }
                    : {
                        snapPoints: snapPoints,
                    }
                )}
                enablePanDownToClose
                // Increase resistance when dragging down to prevent accidental close while scrolling
                overDragResistanceFactor={2.5}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={styles.indicator}
                backgroundStyle={styles.background}
                keyboardBehavior="interactive"
                keyboardBlurBehavior="restore"
            >
                {/* Loading State */}
                {isLoading ? (
                    <BottomSheetView style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
                    </BottomSheetView>
                ) : (
                    /* Product List */
                    <BottomSheetFlatList
                        data={products}
                        renderItem={renderProduct}
                        keyExtractor={(item: ShopProductItemUI) => item.id}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: insets.bottom + 16 }
                        ]}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        ListHeaderComponent={renderListHeader}
                        ListEmptyComponent={renderEmpty}
                        ListFooterComponent={renderFooter}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                )}
            </BottomSheetModal >
        );
    }
);

const stylesheet = StyleSheet.create((theme) => ({
    background: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    indicator: {
        backgroundColor: theme.colors.border,
        width: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingTop: theme.margins.sm,
        paddingBottom: theme.margins.smd,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    countBadge: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        backgroundColor: theme.colors.primaryMuted,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: theme.radius.full,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundInput,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        marginHorizontal: theme.margins.md,
        marginBottom: theme.margins.sm,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: theme.colors.typography,
        paddingVertical: 12,
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
        paddingTop: theme.margins.sm,
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
        backgroundColor: theme.colors.primaryMuted,
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
        paddingVertical: 48,
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
