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
    RecommendedProducts
} from '@/components/cart';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES, addressRoutes, shopRoutes } from '@/constants/routes';
import {
    useBatchRemoveCartItems,
    useCart,
    useCartCalculations,
    useMoveCartItemsToWishlist,
    useRemoveCartItem,
    useUpdateCartItemQuantity
} from '@/hooks/api/cart';
import { usePrefetchShopDetail } from '@/hooks/api/useShop';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { PREFETCH_GRACE_PERIOD_MS } from '@/hooks/usePrefetchTiming';
import { useIsAuthenticated } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { CartItemUI, CartShopUI, CartUI } from '@/types/cart';
import { getShopCheckboxState } from '@/utils/adapter/cartAdapter';
import { Alert as CustomAlert } from '@/utils/AlertHelper';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';
import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, RefreshControl, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';


interface CartHeaderProps {
    onEditPress: () => void;
    isEditMode: boolean;
}

const CART_PROMOTION_EXPIRED_PROBE_DELAYS_MS = [0, 1500, 3000] as const;
const CART_PROMOTION_RESET_THRESHOLD_SECONDS = 30;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface CartPromotionBoundarySnapshot {
    itemId: string;
    unitPrice: number;
    originalPrice: number | null;
    discountPercent: number;
}

const createCartPromotionBoundarySnapshot = (item: CartItemUI): CartPromotionBoundarySnapshot | null => {
    if (!item.promotion) {
        return null;
    }

    return {
        itemId: item.id,
        unitPrice: item.unitPrice,
        originalPrice: item.originalPrice,
        discountPercent: item.promotion.discountPercent,
    };
};

const findCartItemById = (cart: CartUI | null | undefined, itemId: string): CartItemUI | null => {
    if (!cart) {
        return null;
    }

    for (const shop of cart.shops) {
        const foundItem = shop.items.find((item) => item.id === itemId);
        if (foundItem) {
            return foundItem;
        }
    }

    return null;
};

const isCartPromotionBoundaryResolved = (
    snapshot: CartPromotionBoundarySnapshot,
    latestItem: CartItemUI | null
): boolean => {
    if (!latestItem?.promotion) {
        return true;
    }

    if (latestItem.unitPrice !== snapshot.unitPrice) {
        return true;
    }

    if (latestItem.originalPrice !== snapshot.originalPrice) {
        return true;
    }

    if (latestItem.promotion.discountPercent !== snapshot.discountPercent) {
        return true;
    }

    return (latestItem.promotion.secondsRemaining ?? 0) > CART_PROMOTION_RESET_THRESHOLD_SECONDS;
};

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
                    accessibilityLabel={t('header.back' as never)} // Fallback or add to cart i18n
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

const CompactAddressBar: React.FC = () => {
    const { theme } = useUnistyles();
    const addresses = useUserAddressStore((state) => state.addresses);
    const selectedAddressId = useUserAddressStore((state) => state.selectedAddressId);
    const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null;

    const addressText = selectedAddress
        ? `Giao đến: ${[selectedAddress.streetAddress, selectedAddress.wardName, selectedAddress.districtName, selectedAddress.provinceName].filter(Boolean).join(', ')}`
        : 'Chọn địa chỉ nhận hàng để xem phí ship & hỗ trợ giao';

    return (
        <Pressable
            style={styles.addressBar}
            onPress={() => Navigator.push(addressRoutes.list({ mode: 'selection' }))}
        >
            <IconSymbol name="location.on" size={16} color={theme.colors.buttonActive} />
            <Text style={styles.addressBarText} numberOfLines={2}>
                {addressText}
            </Text>
            <IconSymbol name="chevron.right" size={16} color={theme.colors.typographySecondary} />
        </Pressable>
    );
};

interface EmptyCartProps {
    onRefresh: () => void;
    refreshing: boolean;
    isAuthenticated: boolean;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ onRefresh, refreshing, isAuthenticated }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation(['cart', 'common']);

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
                    <IconSymbol
                        name="cart"
                        size={60}
                        color={theme.colors.newPrimary}
                    />
                </View>
                <Text style={styles.emptyTitle}>
                    {isAuthenticated ? t('cart:empty.title') : t('cart:authRequired.title')}
                </Text>
                {isAuthenticated && (
                    <Text style={styles.emptySubtitle}>{t('cart:empty.subtitle')}</Text>
                )}

                <View style={styles.emptyActions}>
                    {!isAuthenticated ? (
                        <Pressable
                            onPress={() => Navigator.push('/(auth)/login')}
                            style={({ pressed }) => [
                                styles.loginButton,
                                pressed && styles.buttonPressed
                            ]}
                            accessibilityLabel={t('cart:authRequired.login')}
                            accessibilityRole="button"
                        >
                            <Text style={styles.loginButtonText}>{t('cart:authRequired.login')}</Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            onPress={() => Navigator.push('/')}
                            style={({ pressed }) => [
                                styles.shopNowButton,
                                pressed && styles.shopNowButtonPressed
                            ]}
                            accessibilityLabel={t('cart:empty.shopNow')}
                            accessibilityRole="button"
                        >
                            <Text style={styles.shopNowText}>{t('cart:empty.shopNow')}</Text>
                        </Pressable>
                    )}
                </View>
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
    const { t } = useTranslation(['cart', 'common']);
    const isAuthenticated = useIsAuthenticated();
    const queryClient = useQueryClient();

    // Safety mechanism: unlock navigation when this screen gains focus
    useNavigationUnlockOnFocus();

    const { rebuySuccess } = useLocalSearchParams<{ rebuySuccess?: string }>();

    // ========================================
    // API HOOKS
    // ========================================

    // Fetch cart data from API
    const { data: cartData, isLoading, isFetching, refetch } = useCart();

    // API Mutations
    const { mutate: updateQuantity, isPending: isUpdating } = useUpdateCartItemQuantity();
    const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
    const { mutate: batchRemove, isPending: isBatchRemoving } = useBatchRemoveCartItems();
    const { mutate: moveItemsToWishlist, isPending: isMovingToWishlist } = useMoveCartItemsToWishlist();

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
    const [isManualRefreshing, setIsManualRefreshing] = useState(false);
    const [promotionSyncingItemIds, setPromotionSyncingItemIds] = useState<string[]>([]);
    const promotionBoundarySnapshotsRef = useRef<Map<string, CartPromotionBoundarySnapshot>>(new Map());
    const promotionBoundaryRefreshInProgressRef = useRef(false);

    // ========================================
    // DEFERRED RENDERING (UX OPTIMIZATION)
    // ========================================
    const [isReady, setIsReady] = useState(false);
    const promotionSyncingItemIdSet = useMemo(
        () => new Set(promotionSyncingItemIds),
        [promotionSyncingItemIds]
    );
    const isPromotionBoundarySyncing = promotionSyncingItemIds.length > 0;

    useFocusEffect(
        useCallback(() => {
            // Screen focused + animation done
            const task = requestAnimationFrame(() => {
                setIsReady(true);
            });
            return () => {
                cancelAnimationFrame(task);
            };
        }, [])
    );

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

    const addresses = useUserAddressStore((state) => state.addresses);
    const selectedAddressId = useUserAddressStore((state) => state.selectedAddressId);

    // Derived state for items that cannot be selected (unsupported shipping region or out of stock)
    const disabledItemIds = useMemo(() => {
        const ids = new Set<string>();
        if (!cartData) return ids;

        const selectedAddress = addresses.find(a => a.id === selectedAddressId) || null;

        cartData.shops.forEach(shop => {
            shop.items.forEach(item => {
                let isUnsupported = false;
                if (selectedAddress) {
                    const regions = item.availableRegions ?? [];
                    if (regions.length > 0 && !(regions.includes('VIETNAM') && regions.includes('INTERNATIONAL'))) {
                        const isIntlItemForDomestic = regions.includes('INTERNATIONAL') && !selectedAddress.isInternational;
                        const isDomItemForIntl = regions.includes('VIETNAM') && selectedAddress.isInternational;
                        isUnsupported = isIntlItemForDomestic || isDomItemForIntl;
                    }
                }
                if (isUnsupported || item.isOutOfStock) {
                    ids.add(item.id);
                }
            });
        });
        return ids;
    }, [cartData, addresses, selectedAddressId]);

    const {
        calculation,
        selectAllState,
        toggleItem,
        toggleShop,
        toggleSelectAll,
    } = useCartCalculations({
        cartData: cartData ?? null, // Convert undefined to null
        selectedIds: selectedItemIds,
        disabledItemIds,
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

            // Auto-select item if it's unselected (and not disabled)
            if (!selectedItemIds.has(itemId) && !disabledItemIds.has(itemId)) {
                toggleItem(itemId);
            }

            updateQuantity({ itemId, quantity });
        },
        [updateQuantity, selectedItemIds, disabledItemIds, toggleItem]
    );

    // API mutation: Remove item
    const handleDeleteItem = useCallback(
        (itemId: string) => {
            CustomAlert.show({
                title: t('cart:confirmations.deleteSelected.title'),
                message: t('cart:confirmations.deleteSelected.message', { count: 1 }),
                type: 'warning',
                onConfirm: () => {
                    setUserInteracted(true);
                    logger.cart.info('Delete item', { itemId });

                    // Remove from client selection
                    if (selectedItemIds.has(itemId)) {
                        toggleItemSelection(itemId);
                    }

                    // Call API to remove
                    removeItem({ itemId });
                }
            });
        },
        [removeItem, selectedItemIds, toggleItemSelection, t]
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

    const clearPromotionBoundarySync = useCallback(() => {
        promotionBoundarySnapshotsRef.current.clear();
        setPromotionSyncingItemIds([]);
    }, []);

    const runPromotionBoundarySync = useCallback(async () => {
        if (promotionBoundaryRefreshInProgressRef.current) {
            return;
        }

        promotionBoundaryRefreshInProgressRef.current = true;

        try {
            for (const delayMs of CART_PROMOTION_EXPIRED_PROBE_DELAYS_MS) {
                if (delayMs > 0) {
                    await wait(delayMs);
                }

                const result = await refetch();
                const latestCart =
                    result.data ??
                    queryClient.getQueryData<CartUI>(['cart']) ??
                    null;

                const unresolvedEntries = Array.from(promotionBoundarySnapshotsRef.current.entries()).filter(
                    ([itemId, snapshot]) => !isCartPromotionBoundaryResolved(snapshot, findCartItemById(latestCart, itemId))
                );

                if (unresolvedEntries.length === 0) {
                    clearPromotionBoundarySync();
                    return;
                }

                promotionBoundarySnapshotsRef.current = new Map(unresolvedEntries);
                setPromotionSyncingItemIds(unresolvedEntries.map(([itemId]) => itemId));
            }
        } finally {
            promotionBoundaryRefreshInProgressRef.current = false;
            if (promotionBoundarySnapshotsRef.current.size > 0) {
                clearPromotionBoundarySync();
            }
        }
    }, [clearPromotionBoundarySync, queryClient, refetch]);

    const handlePromotionExpired = useCallback((item: CartItemUI) => {
        const snapshot = createCartPromotionBoundarySnapshot(item);
        if (!snapshot) {
            return;
        }

        promotionBoundarySnapshotsRef.current.set(item.id, snapshot);
        setPromotionSyncingItemIds(Array.from(promotionBoundarySnapshotsRef.current.keys()));

        if (!promotionBoundaryRefreshInProgressRef.current) {
            void runPromotionBoundarySync();
        }
    }, [runPromotionBoundarySync]);

    const handleManualRefresh = useCallback(async () => {
        setIsManualRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsManualRefreshing(false);
        }
    }, [refetch]);

    const handleCheckout = useCallback(() => {
        if (calculation.selectedCount === 0) {
            logger.cart.warn('No items selected');
            return;
        }

        if (!cartData) return;

        // Group selected items by shop, including quantity for each item
        const selectedShops = cartData.shops
            .map((shop) => {
                const selectedItems = shop.items.filter((item) => selectedItemIds.has(item.id));

                return {
                    shopId: shop.shopId,
                    items: selectedItems.map((item) => ({
                        itemId: item.id,
                        quantity: item.quantity,
                    })),
                };
            })
            .filter((shop) => shop.items.length > 0);

        useCheckoutStore.getState().initSession([...selectedItemIds], selectedShops);

        Navigator.push(ROUTES.CHECKOUT.INDEX);
    }, [calculation.selectedCount, cartData, selectedItemIds]);

    const handleDeleteSelected = useCallback(() => {
        if (selectedItemIds.size === 0) return;

        CustomAlert.show({
            title: t('cart:confirmations.deleteSelected.title'),
            message: t('cart:confirmations.deleteSelected.message', { count: selectedItemIds.size }),
            type: 'warning',
            onConfirm: () => {
                setUserInteracted(true);
                batchRemove({ itemIds: Array.from(selectedItemIds) });
            }
        });
    }, [selectedItemIds, batchRemove, t]);

    const handleMoveToWishlist = useCallback(() => {
        if (selectedItemIds.size === 0 || !cartData) return;

        const itemsToMove: { itemId: string; variantId: string; quantity: number }[] = [];

        cartData.shops.forEach((shop) => {
            shop.items.forEach((item) => {
                if (selectedItemIds.has(item.id)) {
                    itemsToMove.push({
                        itemId: item.id,
                        variantId: item.variantId,
                        quantity: item.quantity,
                    });
                }
            });
        });

        if (itemsToMove.length > 0) {
            setUserInteracted(true);
            moveItemsToWishlist({ items: itemsToMove });
        }
    }, [selectedItemIds, cartData, moveItemsToWishlist]);

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
                    promotionSyncingItemIds={promotionSyncingItemIdSet}
                    onPromotionExpired={handlePromotionExpired}
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
            promotionSyncingItemIdSet,
            handlePromotionExpired,
        ]
    );



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
        //  Empty cart or Unauthenticated
        if (!isLoading && isReady && (!isAuthenticated || !cartData || shops.length === 0)) {
            return (
                <EmptyCart
                    onRefresh={handleManualRefresh}
                    refreshing={isManualRefreshing}
                    isAuthenticated={isAuthenticated}
                />
            );
        }
        return (
            <View style={styles.flex1}>
                {/* ALWAYS show the compact address bar at the top as requested unless empty cart */}
                <CompactAddressBar />

                {cartData && shops.length > 0 && (
                    <Animated.View
                        entering={FadeIn.duration(400)}
                        style={styles.flex1}
                    >
                        {/*
                          * Price Sync Bar
                        */}
                        {(isFetching && userInteracted || isUpdating || isRemoving || isBatchRemoving || isMovingToWishlist) && (
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
                            style={StyleSheet.flatten([
                                styles.flex1,
                                isFetching && !isPromotionBoundarySyncing ? styles.fetchingOpacity : undefined
                            ])}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isManualRefreshing}
                                    onRefresh={handleManualRefresh}
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
                            isEditMode={isEditMode}
                            onDeleteSelected={handleDeleteSelected}
                            onMoveToWishlist={handleMoveToWishlist}
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
    addressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: theme.margins.sm,
    },
    addressBarText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.typography,
        fontWeight: '500',
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
        color: theme.colors.buttonActive,
    },
    emptyScrollContent: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
    },
    emptyContainer: {
        paddingTop: theme.margins.md,
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 50,
        backgroundColor: theme.colors.activeSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.margins.sm,
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
        backgroundColor: theme.colors.buttonActive,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
        shadowColor: theme.colors.buttonActive,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    shopNowButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    shopNowText: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.onPrimary,
        // letterSpacing: 0.5,
    },
    emptyActions: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.margins.md,
        width: '100%',
        paddingHorizontal: theme.margins.xl,
    },
    loginButton: {
        backgroundColor: theme.colors.activeSoft,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.md,
        borderRadius: theme.radius.full,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.buttonActive,
    },
    loginButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.buttonActive,
    },
    buttonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
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
