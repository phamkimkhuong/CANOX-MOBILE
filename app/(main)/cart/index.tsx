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
    VOUCHER_BAR_HEIGHT,
} from '@/components/cart';
import { IconSymbol } from '@/components/ui/Icon';
import { ROUTES } from '@/constants/routes';
import {
    useCart,
    useCartCalculations,
    useRemoveCartItem,
    useUpdateCartItemQuantity,
} from '@/hooks/api/cart';
import { useCartStore } from '@/store/useCartStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import type { CartShopUI } from '@/types/cart';
import { getShopCheckboxState } from '@/utils/adapter/cartAdapter';
import { logger } from '@/utils/logger';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
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
    const router = useRouter();
    const totalQuantity = useCartStore((state) => state.totalQuantity);

    return (
        <View style={[styles.header, { paddingTop: insets.top }]}>
            <View style={styles.headerContent}>
                <Pressable
                    onPress={() => router.back()}
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

const EmptyCart: React.FC = () => {
    const { theme } = useUnistyles();
    const router = useRouter();

    return (
        <View style={styles.emptyContainer}>
            <IconSymbol name="shopping-cart" size={64} color={theme.colors.secondary} />
            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
            <Text style={styles.emptySubtitle}>Hãy thêm sản phẩm vào giỏ hàng nhé!</Text>
            <Pressable
                onPress={() => router.push('/')}
                style={styles.shopNowButton}
                accessibilityLabel="Mua sắm ngay"
                accessibilityRole="button"
            >
                <Text style={styles.shopNowText}>Mua sắm ngay</Text>
            </Pressable>
        </View>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function CartScreen() {
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    // ========================================
    // API HOOKS
    // ========================================

    // Fetch cart data from API
    const { data: cartData, isLoading, isFetching, error, refetch } = useCart();

    // API Mutations
    const { mutate: updateQuantity } = useUpdateCartItemQuantity();
    const { mutate: removeItem } = useRemoveCartItem();

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

    // ========================================
    // EFFECTS
    // ========================================

    // Auto-select all items when cart data loads
    useEffect(() => {
        if (cartData && cartData.shops.length > 0) {
            const allSelectableIds = cartData.shops
                .flatMap((shop) => shop.items)
                .filter((item) => !item.isOutOfStock)
                .map((item) => item.id);
            setSelectedItemIds(new Set(allSelectableIds));
        }
    }, [cartData, setSelectedItemIds]); // Dependency on cartData object

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
        toggleItem(itemId);
    }, [toggleItem]);

    const handleToggleShop = useCallback((shopId: string) => {
        toggleShop(shopId);
    }, [toggleShop]);

    const handleToggleSelectAll = useCallback(() => {
        toggleSelectAll();
    }, [toggleSelectAll]);

    // API mutation: Update quantity
    const handleQuantityChange = useCallback(
        (itemId: string, quantity: number) => {
            updateQuantity({ itemId, quantity });
        },
        [updateQuantity]
    );

    // API mutation: Remove item
    const handleDeleteItem = useCallback(
        (itemId: string) => {
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

    const handleNavigateToShop = useCallback(
        (shopId: string) => {
            logger.cart.info('Navigate to shop', { shopId });
            // TODO: Implement shop page navigation
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
            // TODO: Show toast
            return;
        }

        if (!cartData) return;

        // Initialize checkout session
        useCheckoutStore.getState().initSession(
            cartData.shops,
            selectedItemIds,
            null, // TODO: Get default address
            cartData.platformVouchers
        );

        router.push(ROUTES.CHECKOUT.INDEX);
    }, [calculation.selectedCount, cartData, selectedItemIds, router]);

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

    // Loading state
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <CartHeader onEditPress={() => { }} isEditMode={false} />
                <CartSkeleton />
            </View>
        );
    }

    // Error state
    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <CartHeader onEditPress={() => { }} isEditMode={false} />
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
            </View>
        );
    }

    // Empty cart
    if (!cartData || shops.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <CartHeader onEditPress={() => { }} isEditMode={false} />
                <EmptyCart />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <CartHeader
                onEditPress={() => setEditMode(!isEditMode)}
                isEditMode={isEditMode}
            />

            {/* Show when background revalidation is happening */}
            {isFetching && cartData && (
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
                    padding: theme.margins.smd,
                    paddingBottom: footerHeight + theme.margins.md,
                }}
                showsVerticalScrollIndicator={false}
                // Apply opacity when syncing for "honest" visual feedback
                style={{ opacity: isFetching ? 0.7 : 1 }}
            />

            <CartFooter
                selectAllState={selectAllState}
                calculation={{
                    ...calculation,
                    isCalculating: isFetching, // Disable checkout & show loader when syncing
                }}
                onToggleSelectAll={handleToggleSelectAll}
                onCheckout={handleCheckout}
                onVoucherPress={handlePlatformVoucherPress}
                appliedPlatformVoucher={appliedPlatformVoucher}
                tabBarHeight={0}
            />
        </View>
    );
}

const styles = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.margins.xl,
        gap: theme.margins.md,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        textAlign: 'center',
    },
    shopNowButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.margins.lg,
        paddingVertical: theme.margins.smd,
        borderRadius: theme.radius.m,
        marginTop: theme.margins.md,
    },
    shopNowText: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.onPrimary,
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
