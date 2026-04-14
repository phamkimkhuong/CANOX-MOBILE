/**
 * SelectOrderScreen - Full page order picker for chat
 */

import { IconSymbol } from '@/components/ui/Icon';
import { useOrderListUI, useShopOrdersUI } from '@/hooks/api/order/useOrders';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { useChatPickerStore } from '@/store/useChatPickerStore';
import { OrderUI } from '@/types/order/order';
import { formatMoney } from '@/utils/format';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const SEARCH_THRESHOLD = 5;
interface DateHeaderItem {
    type: 'date-header';
    id: string;  // Unique key for FlashList
    date: string;
}

interface OrderItem {
    type: 'order';
    data: OrderUI;
}

type SectionedOrderItem = DateHeaderItem | OrderItem;

// ============================================
// COMPONENT
// ============================================

export default function SelectOrderScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { theme } = useUnistyles();

    const styles = stylesheet;
    const insets = useSafeAreaInsets();

    // URL params
    const params = useLocalSearchParams<{
        shopId: string;
        conversationId: string;
    }>();

    const shopId = params.shopId as string;
    const conversationId = params.conversationId as string;

    // Platform chat = no shopId → show ALL buyer orders
    const isPlatformChat = !shopId;

    // Store actions
    const { selectOrderFromUI, setConversationId } = useChatPickerStore();

    // Search state
    const [searchKeyword, setSearchKeyword] = useState('');

    // ---- Data hooks (conditional on isPlatformChat) ----
    // Shop chat: orders with a specific shop
    const shopOrdersResult = useShopOrdersUI(shopId, !isPlatformChat);
    // Platform chat: ALL buyer orders
    const allOrdersResult = useOrderListUI('ALL', isPlatformChat);

    // Unify interface
    const data = isPlatformChat ? allOrdersResult.query.data : shopOrdersResult.query.data;
    const isLoading = isPlatformChat ? allOrdersResult.query.isLoading : shopOrdersResult.query.isLoading;
    const isFetchingNextPage = isPlatformChat ? allOrdersResult.query.isFetchingNextPage : shopOrdersResult.query.isFetchingNextPage;
    const hasNextPage = isPlatformChat ? allOrdersResult.query.hasNextPage : shopOrdersResult.query.hasNextPage;
    const fetchNextPage = isPlatformChat ? allOrdersResult.query.fetchNextPage : shopOrdersResult.query.fetchNextPage;
    const rawOrders = isPlatformChat ? allOrdersResult.orders : shopOrdersResult.orders;

    // Flatten pages into single array (deduplicate)
    const allOrders = useMemo(() => {
        const uniqueOrders: OrderUI[] = [];
        const seenIds = new Set<string>();

        rawOrders.forEach(order => {
            if (!seenIds.has(order.orderId)) {
                seenIds.add(order.orderId);
                uniqueOrders.push(order);
            }
        });

        return uniqueOrders;
    }, [rawOrders]);

    // Client-side filtering for order number
    const filteredOrders = useMemo(() => {
        if (!searchKeyword) return allOrders;
        const keyword = searchKeyword.toLowerCase();
        return allOrders.filter(order =>
            order.orderNumber.toLowerCase().includes(keyword)
        );
    }, [allOrders, searchKeyword]);

    // Group orders by date for sectioned display
    const sectionedData = useMemo((): SectionedOrderItem[] => {
        const result: SectionedOrderItem[] = [];
        let lastDate = '';

        filteredOrders.forEach((order) => {
            if (order.formattedDate !== lastDate) {
                lastDate = order.formattedDate;
                // Date Header Item
                result.push({
                    type: 'date-header',
                    id: `header-${lastDate}`,
                    date: lastDate,
                });
            }
            // Order Item
            result.push({
                type: 'order',
                data: order,
            });
        });

        return result;
    }, [filteredOrders]);


    // Total count for display
    const totalCount = data?.pages?.[0]?.totalElements ?? 0;

    // Show search bar if there are enough orders
    const showSearchBar = totalCount > SEARCH_THRESHOLD;

    const handleSelectOrder = useCallback((order: OrderUI) => {
        if (conversationId) {
            setConversationId(conversationId as string);
        }
        selectOrderFromUI(order);
        Navigator.back();
    }, [selectOrderFromUI, setConversationId, conversationId]);

    // Handle load more
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // ============================================
    // FLASHLIST CALLBACKS
    // ============================================

    const getItemType = useCallback((item: SectionedOrderItem) => {
        return item.type;
    }, []);

    /**
     * keyExtractor - Return unique key for each item.
     */
    const keyExtractor = useCallback((item: SectionedOrderItem) => {
        if (item.type === 'date-header') {
            return item.id;
        }
        return item.data.orderId;
    }, []);

    /**
     * renderItem - Render for both Date Header and Order Row
     */
    const renderItem = useCallback(({ item }: { item: SectionedOrderItem }) => {
        // CASE 1: Date Header
        if (item.type === 'date-header') {
            return (
                <View style={styles.dateHeader}>
                    <Text style={styles.dateHeaderText}>{item.date}</Text>
                </View>
            );
        }
        const order = item.data;

        return (
            <Pressable
                style={({ pressed }) => [
                    styles.orderRow,
                    pressed && styles.orderRowPressed
                ]}
                onPress={() => handleSelectOrder(order)}
            >
                {/* 1. Image Stack (Left) */}
                <View style={styles.imageStackContainer}>
                    {order.items.slice(0, 3).map((orderItem, idx) => (
                        <Image
                            key={orderItem.itemId || `order-item-${order.orderId}-${orderItem.variantId}-${idx}`}
                            source={{ uri: orderItem.imageUrl }}
                            style={[
                                styles.rowItemThumb,
                                idx > 0 && styles.stackedImage
                            ]}
                            contentFit="cover"
                        />
                    ))}
                    {order.itemCount > 3 && (
                        <View style={styles.moreBadgeMini}>
                            <Text style={styles.moreTextMini}>+{order.itemCount - 3}</Text>
                        </View>
                    )}
                </View>

                {/* 2. Order Info (Center) */}
                <View style={styles.orderInfoCenter}>
                    <View style={styles.orderIdRow}>
                        <Text style={styles.orderNumberSmall} numberOfLines={1}>
                            Đơn hàng {order.orderNumber}
                        </Text>
                    </View>

                    <View style={styles.statusRowMini}>
                        <View style={[styles.statusDot, { backgroundColor: order.statusDisplay.color }]} />
                        <Text style={[styles.statusLabelSmall, { color: order.statusDisplay.color }]}>
                            {order.statusDisplay.label}
                        </Text>
                        <View style={styles.dot} />
                        <Text style={styles.itemCountMini}>{order.totalQuantity} Sản Phẩm</Text>
                    </View>

                    <Text style={styles.totalPriceMini}>{formatMoney(order.grandTotal, order.currency)}</Text>
                </View>

                {/* 3. Send Action (Right) */}
                <View style={styles.sendButtonMini}>
                    <IconSymbol name="send" size={16} color={theme.colors.primary} />
                </View>
            </Pressable>
        );
    }, [handleSelectOrder, styles, theme.colors]);

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
                <IconSymbol name="shipping" size={48} color={theme.colors.secondary} />
                <Text style={styles.emptyText}>
                    {searchKeyword
                        ? 'Không tìm thấy đơn hàng'
                        : isPlatformChat
                            ? 'Bạn chưa có đơn hàng nào'
                            : 'Bạn chưa có đơn hàng nào tại shop này'}
                </Text>
                <Text style={styles.emptySubtext}>
                    {searchKeyword
                        ? 'Thử tìm với mã đơn hàng khác'
                        : isPlatformChat
                            ? 'Đơn hàng sẽ hiển thị khi bạn mua sắm'
                            : 'Đơn hàng bạn mua tại shop sẽ hiển thị ở đây'
                    }
                </Text>
            </View>
        );
    }, [isLoading, isPlatformChat, searchKeyword, styles, theme.colors.secondary]);

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
                        <Text style={styles.title}>Chọn đơn hàng</Text>
                        {totalCount > 0 && (
                            <Text style={styles.countBadge}>{totalCount}</Text>
                        )}
                    </View>
                </View>

                {/* SEARCH BAR  */}
                {showSearchBar && (
                    <View style={styles.searchContainer}>
                        <IconSymbol name="search" size={18} color={theme.colors.secondary} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Mã đơn hàng..."
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
                )}
            </View>

            {/* ORDER LIST */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
                </View>
            ) : (
                <FlashList
                    data={sectionedData}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    getItemType={getItemType}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.3}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                />
            )}
        </View>
    );
}

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
    dateHeader: {
        backgroundColor: theme.colors.background,
        paddingVertical: 12,
        paddingTop: 16,
    },
    dateHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.typographySecondary,
        textTransform: 'uppercase',
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
        backgroundColor: theme.colors.background,
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
    statusRowMini: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusLabelSmall: {
        fontSize: 12,
        fontWeight: '600',
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: theme.colors.secondary,
        opacity: 0.5,
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
        paddingVertical: 80,
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
