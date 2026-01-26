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
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
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
    const { t } = useTranslation('cart');
    const totalQuantity = useCartStore((state) => state.totalQuantity);

    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <Pressable
                    onPress={() => Navigator.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={t('header.back' as any)} // Fallback or add to cart i18n
                    accessibilityRole="button"
                >
                    <IconSymbol name="arrow-back" size={24} color={theme.colors.typography} />
                </Pressable>
                <Text style={styles.headerTitle}>{t('header.title')} ({totalQuantity})</Text>

                <Pressable
                    onPress={onEditPress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={isEditMode ? t('header.done') : t('header.edit')}
                    accessibilityRole="button"
                >
                    <Text style={styles.headerAction}>
                        {isEditMode ? t('header.done') : t('header.edit')}
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
    const { t } = useTranslation('cart');

    return (
        <Animated.ScrollView
            entering={FadeIn.duration(400)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.emptyScrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={theme.colors.buttonActive}
                    colors={[theme.colors.buttonActive]}
                />
            }
        >
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                    <IconSymbol name="cart" size={48} color={theme.colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>{t('empty.title')}</Text>
                <Text style={styles.emptySubtitle}>{t('empty.subtitle')}</Text>

                <Pressable
                    onPress={() => Navigator.push('/')}
                    style={styles.shopNowButton}
                    accessibilityLabel={t('empty.shopNow')}
                    accessibilityRole="button"
                >
                    <Text style={styles.shopNowText}>{t('empty.shopNow')}</Text>
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
    const { t } = useTranslation('cart');
    const insets = useSafeAreaInsets();
    const { rebuySuccess } = useLocalSearchParams<{ rebuySuccess?: string }>();

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

    useEffect(() => {
        if (isReady && !isLoading && rebuySuccess === 'true') {
            Toast.show({
                type: 'success',
                text1: t('status.rebuySuccess'),
                text2: t('status.rebuySuccessDetail'),
                visibilityTime: 3000,
            });
        }
    }, [isReady, isLoading, rebuySuccess, t]);

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
                    <Text style={styles.emptyTitle}>{t('error.loadFailed')}</Text>
                    <Text style={styles.emptySubtitle}>{t('error.tryAgainLater')}</Text>
                    <Pressable
                        onPress={() => refetch()}
                        style={styles.shopNowButton}
                    >
                        <Text style={styles.shopNowText}>{t('error.retryButton')}</Text>
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
            <View style={styles.flex1}>
                {cartData && shops.length > 0 && (
                    <Animated.View
                        entering={FadeIn.duration(400)}
                        style={styles.flex1}
                    >
                        {/*
                          * Price Sync Bar
                        */}
                        {(isFetching && userInteracted || isUpdating || isRemoving) && (
                            <View style={styles.syncBar}>
                                <ActivityIndicator size="small" color={theme.colors.buttonActive} />
                                <Text style={styles.syncText}>{t('status.syncing')}</Text>
                            </View>
                        )}

                        <FlashList
                            data={shops}
                            renderItem={renderShopGroup}
                            keyExtractor={(shop) => shop.shopId}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            style={StyleSheet.flatten([styles.flex1, isFetching ? styles.fetchingOpacity : undefined])}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isFetching && !isLoading}
                                    onRefresh={refetch}
                                    tintColor={theme.colors.buttonActive}
                                    colors={[theme.colors.buttonActive]}
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
                        style={styles.skeletonOverlay}
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
            !isReady && styles.bgSurface
        ]}>
            <CartHeader
                onEditPress={() => setEditMode(!isEditMode)}
                isEditMode={isEditMode}
            />
            {renderContent()}
        </View>
    );
}

const styles = StyleSheet.create((theme, runtime) => ({
    flex1: {
        flex: 1,
    },
    fetchingOpacity: {
        opacity: 0.7,
    },
    listContent: {
        paddingHorizontal: theme.margins.smd,
        paddingTop: theme.margins.smd,
        paddingBottom: theme.margins.lg,
    },
    skeletonOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.surface,
    },
    bgSurface: {
        backgroundColor: theme.colors.surface,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingTop: runtime.insets.top,
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
        color: theme.colors.primary,
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
        backgroundColor: theme.colors.activeSoft,
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
        backgroundColor: theme.colors.activeSoft,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    syncText: {
        fontSize: 12,
        color: theme.colors.buttonActive,
        fontWeight: '500',
    },
}));
