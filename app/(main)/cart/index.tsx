/**
 * Cart Screen - Hybrid Architecture
 * 
 * Features:
 * - Real API data fetching (useCart)
 * - Client-side selection state (Zustand)
 * - API mutations for quantity & remove
 * - Shop groups with 3-level checkbox logic
 * - Swipe-to-delete functionality
 * - 2-tier voucher system
 * - Sticky checkout footer
 * 
 * Architecture:
 * - Data: From API (server)
 * - Selection: Client-side (Zustand) - backend doesn't support
 * - Quantity/Remove: API mutations (optimistic updates)
 */

import '@/constants/unistyles';

import {
    CartFooter,
    CartShopGroup,
    CartSkeleton,
    CHECKOUT_BAR_HEIGHT,
    RecommendedProducts,
    VOUCHER_BAR_HEIGHT,
} from '@/components/cart';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES, shopRoutes } from '@/constants/routes';
import {
    useCart,
    useCartCalculations,
    useRemoveCartItem,
    useUpdateCartItemQuantity,
} from '@/hooks/api/cart';
import { usePrefetchShopDetail } from '@/hooks/api/useShop';
import { PREFETCH_GRACE_PERIOD_MS } from '@/hooks/usePrefetchTiming';
import { useCartStore } from '@/store/useCartStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import type { CartShopUI } from '@/types/cart';
import { getShopCheckboxState } from '@/utils/adapter/cartAdapter';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

interface CartHeaderProps {
    onEditPress: () => void;
    isEditMode: boolean;
}

// ============================================
// SUB-COMPONENTS
// ============================================

const CartHeader: React.FC<CartHeaderProps> = ({ onEditPress, isEditMode }) => {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const totalQuantity = useCartStore((state) => state.totalQuantity);

    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.headerContent}>
                <Pressable
                    onPress={() => Navigator.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel="Quay lại"
                    accessibilityRole="button"
                >
                    <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                </Pressable>
                <Text style={styles.headerTitle}>Giỏ hàng ({totalQuantity})</Text>

                <Pressable
                    onPress={onEditPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={isEditMode ? 'Xong' : 'Sửa'}
                    accessibilityRole="button"
                >
                    <Text style={[styles.headerAction, { color: theme.colors.primary }]}>
                        {isEditMode ? 'Xong' : 'Sửa'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

interface EmptyCartProps {
    onRefresh: () => void;
    refreshing: boolean;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ onRefresh, refreshing }) => {
    const { theme } = useUnistyles();

    return (
        <Animated.ScrollView
            entering={FadeIn.duration(400)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.emptyScrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={theme.colors.primary}
                    colors={[theme.colors.primary]}
                />
            }
        >
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <IconSymbol name="cart" size={48} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
                <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm vào giỏ hàng nhé!</Text>

                <Pressable
                    onPress={() => Navigator.push('/')}
                    style={styles.shopNowButton}
                    accessibilityLabel="Mua sắm ngay"
                    accessibilityRole="button"
                >
                    <Text style={styles.shopNowText}>MUA SẮM NGAY</Text>
                </Pressable>
            </View>

            {/* Recommended Products Section */}
            <RecommendedProducts />
        </Animated.ScrollView>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function CartScreen() {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();

    // ========================================
    // API HOOKS
    // ========================================

    // Fetch cart data from API
    const { data: cartData, isLoading, isFetching, error, refetch } = useCart();

    // API Mutations
    const { mutate: updateQuantity, isPending: isUpdating } = useUpdateCartItemQuantity();
    const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();

    // Prefetch hook for shop navigation (Hybrid Pattern)
    const prefetchShopDetail = usePrefetchShopDetail();
    const shopPressTimingMap = useRef<Map<string, number>>(new Map());

    // ========================================
    // CLIENT STATE (Zustand)
    // ========================================

    const {
        selectedItemIds,
        setSelectedItemIds,
        appliedShopVouchers,
        setShopVoucher,
        appliedPlatformVoucherId,
        setPlatformVoucher,
        isEditMode,
        setEditMode,
        toggleItemSelection,
    } = useCartStore();

    // Only show sync bar when user has performed at least 1 action
    const [userInteracted, setUserInteracted] = useState(false);

    // ========================================
    // DEFERRED RENDERING (UX OPTIMIZATION)
    // ========================================
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const handle = requestIdleCallback(() => {
            setIsReady(true);
        }, { timeout: 500 });

        return () => cancelIdleCallback(handle);
    }, []);

    // ========================================
    // CALCULATIONS (Client-side selection)
    // ========================================

    const {
        calculation,
        selectAllState,
        toggleItem,
        toggleShop,
        toggleSelectAll,
    } = useCartCalculations({
        cartData: cartData ?? null, // Convert undefined to null
        selectedIds: selectedItemIds,
        appliedShopVouchers,
        appliedPlatformVoucherId,
        onSelectionChange: setSelectedItemIds,
        onShopVoucherChange: setShopVoucher,
        onPlatformVoucherChange: setPlatformVoucher,
    });

    // ========================================
    // EVENT HANDLERS
    // ========================================

    const handleToggleItem = useCallback((itemId: string) => {
        setUserInteracted(true);
        toggleItem(itemId);
    }, [toggleItem]);

    const handleToggleShop = useCallback((shopId: string) => {
        setUserInteracted(true);
        toggleShop(shopId);
    }, [toggleShop]);

    const handleToggleSelectAll = useCallback(() => {
        setUserInteracted(true);
        toggleSelectAll();
    }, [toggleSelectAll]);

    // API mutation: Update quantity
    const handleQuantityChange = useCallback(
        (itemId: string, quantity: number) => {
            setUserInteracted(true);
            updateQuantity({ itemId, quantity });
        },
        [updateQuantity]
    );

    // API mutation: Remove item
    const handleDeleteItem = useCallback(
        (itemId: string) => {
            setUserInteracted(true);
            logger.cart.info('Delete item', { itemId });

            // Remove from client selection
            if (selectedItemIds.has(itemId)) {
                toggleItemSelection(itemId);
            }

            // Call API to remove
            removeItem({ itemId });
        },
        [removeItem, selectedItemIds, toggleItemSelection]
    );

    /**
     * HYBRID PATTERN: Shop Navigation with Prefetch
     * - PressIn: Start prefetch and record timing
     * - Press: Navigate with instant flag if tap was quick enough
     */
    const handleShopPressIn = useCallback(
        (shopId: string) => {
            // Record timestamp for calculating elapsed time
            shopPressTimingMap.current.set(shopId, Date.now());
            // Start prefetch immediately
            prefetchShopDetail(shopId);
        },
        [prefetchShopDetail]
    );

    const handleNavigateToShop = useCallback(
        (shopId: string) => {
            const pressInTime = shopPressTimingMap.current.get(shopId) || 0;
            const elapsed = pressInTime ? Date.now() - pressInTime : 0;
            shopPressTimingMap.current.delete(shopId);

            const isInstantTap = elapsed > 0 && elapsed < PREFETCH_GRACE_PERIOD_MS;
            Navigator.push(shopRoutes.detail(shopId, { instantNav: isInstantTap }));
        },
        []
    );

    const handleVoucherPress = useCallback(
        (shopId: string) => {
            logger.cart.info('Open shop voucher sheet', { shopId });
            // TODO: Open voucher bottom sheet
        },
        []
    );

    const handlePlatformVoucherPress = useCallback(() => {
        logger.cart.info('Open platform voucher sheet');
        // TODO: Open platform voucher bottom sheet
    }, []);

    const handleCheckout = useCallback(() => {
        if (calculation.selectedCount === 0) {
            logger.cart.warn('No items selected');
            return;
        }

        if (!cartData) return;

        // Group selected items by shop
        const selectedShops = cartData.shops
            .map((shop) => ({
                shopId: shop.shopId,
                itemIds: shop.items
                    .filter((item) => selectedItemIds.has(item.id))
                    .map((item) => item.id),
            }))
            .filter((shop) => shop.itemIds.length > 0);

        useCheckoutStore.getState().initSession([...selectedItemIds], selectedShops);

        Navigator.push(ROUTES.CHECKOUT.INDEX);
    }, [calculation.selectedCount, cartData, selectedItemIds]);

    // ========================================
    // RENDER HELPERS
    // ========================================

    const renderShopGroup = useCallback(
        ({ item: shop }: { item: CartShopUI }) => {
            const shopCheckboxState = getShopCheckboxState(shop, selectedItemIds);

            return (
                <CartShopGroup
                    shop={shop}
                    selectedIds={selectedItemIds}
                    shopCheckboxState={shopCheckboxState}
                    onToggleShop={() => handleToggleShop(shop.shopId)}
                    onToggleItem={handleToggleItem}
                    onQuantityChange={handleQuantityChange}
                    onDeleteItem={handleDeleteItem}
                    onNavigateToShop={() => handleNavigateToShop(shop.shopId)}
                    onShopPressIn={() => handleShopPressIn(shop.shopId)}
                    onVoucherPress={() => handleVoucherPress(shop.shopId)}
                    isEditMode={isEditMode}
                    onEditModeToggle={() => setEditMode(!isEditMode)}
                />
            );
        },
        [
            selectedItemIds,
            handleToggleShop,
            handleToggleItem,
            handleQuantityChange,
            handleDeleteItem,
            handleNavigateToShop,
            handleShopPressIn,
            handleVoucherPress,
            isEditMode,
            setEditMode,
        ]
    );

    const footerHeight = useMemo(() => {
        return CHECKOUT_BAR_HEIGHT + VOUCHER_BAR_HEIGHT + insets.bottom;
    }, [insets.bottom]);

    // ========================================
    // RENDER
    // ========================================

    const shops = cartData?.shops ?? [];

    const appliedPlatformVoucher = appliedPlatformVoucherId
        ? cartData?.platformVouchers.find((v) => v.id === appliedPlatformVoucherId) ?? null
        : null;

    // ========================================
    // FINAL RENDER
    // ========================================

    const renderContent = () => {
        // 1. Error state (High priority)
        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="error-outline" size={64} color={theme.colors.error} />
                    <Text style={styles.emptyTitle}>Không thể tải giỏ hàng</Text>
                    <Text style={styles.emptySubtitle}>Vui lòng thử lại sau</Text>
                    <Pressable
                        onPress={() => refetch()}
                        style={styles.shopNowButton}
                    >
                        <Text style={styles.shopNowText}>Thử lại</Text>
                    </Pressable>
                </View>
            );
        }

        //  Empty cart
        if (!isLoading && isReady && (!cartData || shops.length === 0)) {
            return (
                <EmptyCart
                    onRefresh={refetch}
                    refreshing={isFetching && !isLoading}
                />
            );
        }
        return (
            <View style={{ flex: 1 }}>
                {cartData && shops.length > 0 && (
                    <Animated.View
                        entering={FadeIn.duration(400)}
                        style={{ flex: 1 }}
                    >
                        {/* 
                          * Price Sync Bar
                        */}
                        {(isFetching && userInteracted || isUpdating || isRemoving) && (
                            <View style={styles.syncBar}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={styles.syncText}>Đang cập nhật giá mới nhất...</Text>
                            </View>
                        )}

                        <FlashList
                            data={shops}
                            renderItem={renderShopGroup}
                            keyExtractor={(shop) => shop.shopId}
                            contentContainerStyle={{
                                paddingHorizontal: theme.margins.smd,
                                paddingTop: theme.margins.smd,
                                paddingBottom: theme.margins.lg,
                            }}
                            showsVerticalScrollIndicator={false}
                            style={{ flex: 1, opacity: isFetching ? 0.7 : 1 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isFetching && !isLoading}
                                    onRefresh={refetch}
                                    tintColor={theme.colors.primary}
                                    colors={[theme.colors.primary]}
                                />
                            }
                        />

                        <CartFooter
                            selectAllState={selectAllState}
                            calculation={{
                                ...calculation,
                                isCalculating: isFetching,
                            }}
                            onToggleSelectAll={handleToggleSelectAll}
                            onCheckout={handleCheckout}
                            onVoucherPress={handlePlatformVoucherPress}
                            appliedPlatformVoucher={appliedPlatformVoucher}
                            tabBarHeight={0}
                        />
                    </Animated.View>
                )}
                {(isLoading || !isReady) && (
                    <Animated.View
                        exiting={FadeOut.duration(400)}
                        style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.surface }]}
                    >
                        <CartSkeleton />
                    </Animated.View>
                )}
            </View>
        );
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: isReady ? theme.colors.background : theme.colors.surface }
        ]}>
            <CartHeader
                onEditPress={() => setEditMode(!isEditMode)}
                isEditMode={isEditMode}
            />
            {renderContent()}
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        height: 56,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    headerAction: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyScrollContent: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
    },
    emptyContainer: {
        paddingTop: theme.margins.xl * 2,
        paddingBottom: theme.margins.lg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        gap: theme.margins.sm,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primaryMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.md,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
        marginBottom: theme.margins.md,
    },
    shopNowButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.xl,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.m,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    shopNowText: {
        fontSize: 14,
        fontWeight: '800',
        color: theme.colors.onPrimary,
        letterSpacing: 1,
    },
    syncBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.margins.sm,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primaryMuted,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    syncText: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: '500',
    },
}));
