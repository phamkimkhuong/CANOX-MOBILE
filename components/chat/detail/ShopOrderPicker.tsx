/**
 * ShopOrderPicker - Bottom Sheet for selecting shop orders
 * Used in chat to send order cards to partner
 */
import { IconSymbol } from '@/components/ui/Icon';
import { useShopOrders } from '@/hooks/api/order/useOrders';
import { OrderUI } from '@/types/order/order';
import { formatCurrency } from '@/utils/format';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
    BottomSheetModal,
    BottomSheetTextInput,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface ShopOrderPickerProps {
    shopId: string | undefined;
    onSelectOrder: (order: OrderUI) => void;
}

const SEARCH_THRESHOLD = 5;

/**
 * ShopOrderPicker component
 * Displays a searchable list of user's orders at a specific shop in a bottom sheet
 */
export const ShopOrderPicker = forwardRef<BottomSheetModal, ShopOrderPickerProps>(
    ({ shopId, onSelectOrder }, ref) => {
        const { theme } = useUnistyles();
        const styles = stylesheet;
        const insets = useSafeAreaInsets();

        // Search state
        const [searchKeyword, setSearchKeyword] = useState('');

        // Fetch shop orders with infinite scroll
        const {
            data,
            isLoading,
            isFetchingNextPage,
            hasNextPage,
            fetchNextPage,
        } = useShopOrders(shopId);

        // Flatten pages into single array
        const allOrders = useMemo(() => {
            if (!data?.pages) return [];
            return data.pages.flatMap(page => page.content);
        }, [data?.pages]);

        // Client-side filtering for order number
        const filteredOrders = useMemo(() => {
            if (!searchKeyword) return allOrders;
            const keyword = searchKeyword.toLowerCase();
            return allOrders.filter(order =>
                order.orderNumber.toLowerCase().includes(keyword)
            );
        }, [allOrders, searchKeyword]);

        // Total count for display
        const totalCount = data?.pages?.[0]?.totalElements ?? 0;

        // Search bar visibility
        const showSearchBar = totalCount > SEARCH_THRESHOLD;

        // Dynamic sizing logic: use for few items, fixed for many items/scroll performance
        const useDynamicSizing = totalCount <= SEARCH_THRESHOLD && totalCount > 0;
        const snapPoints = useMemo(() => ['65%', '85%'], []);
        const { height: screenHeight } = Dimensions.get('window');
        const maxDynamicContentSize = screenHeight * 0.85;

        // Backdrop component
        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.4}
                />
            ),
            []
        );

        // Handle order selection
        const handleSelectOrder = useCallback((order: OrderUI) => {
            onSelectOrder(order);
            // Close the modal after selection
            (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
        }, [onSelectOrder, ref]);

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
                    <IconSymbol name="shipping" size={48} color={theme.colors.secondary} />
                    <Text style={styles.emptyText}>
                        {searchKeyword ? 'Không tìm thấy đơn hàng' : 'Bạn chưa có đơn hàng nào tại shop này'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {searchKeyword
                            ? 'Thử tìm với mã đơn hàng khác'
                            : 'Đơn hàng bạn mua tại shop sẽ hiển thị ở đây'
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

        // Render order item
        const renderOrder = useCallback(({ item }: { item: OrderUI }) => {
            return (
                <Pressable
                    style={({ pressed }) => [
                        styles.orderRow,
                        pressed && styles.orderRowPressed
                    ]}
                    onPress={() => handleSelectOrder(item)}
                >
                    {/* 1. Image Stack (Left) */}
                    <View style={styles.imageStackContainer}>
                        {item.items.slice(0, 3).map((orderItem, idx) => (
                            <Image
                                key={orderItem.itemId}
                                source={{ uri: orderItem.imageUrl }}
                                style={[
                                    styles.rowItemThumb,
                                    idx > 0 && styles.stackedImage
                                ]}
                                contentFit="cover"
                            />
                        ))}
                        {item.itemCount > 3 && (
                            <View style={styles.moreBadgeMini}>
                                <Text style={styles.moreTextMini}>+{item.itemCount - 3}</Text>
                            </View>
                        )}
                    </View>

                    {/* 2. Order Info (Center) */}
                    <View style={styles.orderInfoCenter}>
                        <View style={styles.orderIdRow}>
                            <Text style={styles.orderNumberSmall} numberOfLines={1}>
                                #{item.orderNumber.split('-').pop()}
                            </Text>
                            <View style={[styles.statusDot, styles.dynamicStatusBg(item.statusDisplay.color)]} />
                            <Text style={[styles.statusLabelSmall, styles.dynamicStatusColor(item.statusDisplay.color)]}>
                                {item.statusDisplay.label}
                            </Text>
                        </View>
                        <Text style={styles.orderDateSmall}>{item.formattedDate}</Text>
                        <View style={styles.priceRowMini}>
                            <Text style={styles.itemCountMini}>{item.totalQuantity} SP</Text>
                            <Text style={styles.totalPriceMini}>{formatCurrency(item.grandTotal)}</Text>
                        </View>
                    </View>

                    {/* 3. Send Action (Right) */}
                    <View style={styles.sendButtonMini}>
                        <IconSymbol name="send" size={16} color={theme.colors.primary} />
                    </View>
                </Pressable>
            );
        }, [handleSelectOrder, styles, theme.colors]);

        return (
            <BottomSheetModal
                ref={ref}
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
                        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
                    </BottomSheetView>
                ) : (
                    <View style={styles.contentWrapper}>
                        {/* STICKY HEADER - Không cuộn */}
                        <View style={styles.stickyHeader}>
                            <View style={styles.headerContainer}>
                                <Text style={styles.title}>Chọn đơn hàng</Text>
                                {totalCount > 0 && (
                                    <Text style={styles.countBadge}>{totalCount} đơn</Text>
                                )}
                            </View>

                            {/* Search Input - Conditional */}
                            {showSearchBar && (
                                <View style={styles.searchContainer}>
                                    <IconSymbol name="search" size={18} color={theme.colors.secondary} />
                                    <BottomSheetTextInput
                                        style={styles.searchInput}
                                        placeholder="Mã đơn hàng..."
                                        placeholderTextColor={theme.colors.secondary}
                                        value={searchKeyword}
                                        onChangeText={setSearchKeyword}
                                    />
                                </View>
                            )}
                        </View>

                        {/* SCROLLABLE ORDER LIST */}
                        <BottomSheetFlatList
                            data={filteredOrders}
                            renderItem={renderOrder}
                            keyExtractor={(item: OrderUI) => item.orderId}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.3}
                            ListEmptyComponent={renderEmpty}
                            ListFooterComponent={renderFooter}
                        />
                    </View>
                )}
            </BottomSheetModal >
        );
    }
);

const stylesheet = StyleSheet.create((theme, rt) => ({
    background: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    indicator: {
        backgroundColor: theme.colors.border,
        width: 36,
    },
    contentWrapper: {
        flex: 1,
    },
    stickyHeader: {
        backgroundColor: theme.colors.surface,
        paddingTop: theme.margins.sm,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingBottom: theme.margins.sm,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    countBadge: {
        fontSize: 12,
        color: theme.colors.primary,
        backgroundColor: theme.colors.primaryMuted,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: theme.radius.full,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.backgroundInput,
        borderRadius: theme.radius.m,
        paddingHorizontal: theme.margins.smd,
        marginHorizontal: theme.margins.md,
        height: 44,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: theme.colors.typography,
    },
    loadingContainer: {
        paddingVertical: 40,
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
        paddingBottom: rt.insets.bottom + 24,
    },
    orderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.margins.smd,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.m,
        marginBottom: 8,
        gap: 12,
    },
    orderRowPressed: {
        backgroundColor: theme.colors.primarySoft,
    },
    imageStackContainer: {
        flexDirection: 'row',
        width: 60,
        height: 50,
        alignItems: 'center',
    },
    rowItemThumb: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: theme.colors.surface,
        backgroundColor: theme.colors.backgroundInput,
    },
    stackedImage: {
        marginLeft: -24,
        marginTop: 4,
    },
    moreBadgeMini: {
        position: 'absolute',
        right: -4,
        bottom: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    moreTextMini: {
        fontSize: 8,
        color: '#fff',
        fontWeight: 'bold',
    },
    orderInfoCenter: {
        flex: 1,
        gap: 2,
    },
    orderIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    orderNumberSmall: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    statusDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    dynamicStatusBg: (color: string) => ({
        backgroundColor: color,
    }),
    dynamicStatusColor: (color: string) => ({
        color: color,
    }),
    statusLabelSmall: {
        fontSize: 11,
        fontWeight: '600',
    },
    orderDateSmall: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
    },
    priceRowMini: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    itemCountMini: {
        fontSize: 11,
        color: theme.colors.typographySecondary,
        backgroundColor: theme.colors.backgroundInput,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
    totalPriceMini: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.error,
    },
    sendButtonMini: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    emptySubtext: {
        fontSize: 13,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    footerLoading: {
        paddingVertical: 16,
        alignItems: 'center',
    },
}));
