/**
 * Cart Screen
 * 
 * Main shopping cart screen with:
 * - Shop groups with 3-level checkbox logic
 * - Quantity stepper with debounce
 * - Swipe-to-delete functionality
 * - 2-tier voucher system (Shop + Platform)
 * - Sticky checkout footer above TabBar
 * 
 * Auth protection is handled centrally by useAuthGuard in app/_layout.tsx
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
import { useCartCalculations } from '@/hooks/api/useCartCalculations';
import { useCartStore } from '@/store/useCartStore';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import type { CartShopUI, CartUI } from '@/types/cart';
import { generateMockCartData, getShopCheckboxState } from '@/utils/adapter/cartAdapter';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// const TAB_BAR_HEIGHT = 60; // No longer needed for Full Screen
const ADDRESS_BAR_HEIGHT = 72;

interface CartHeaderProps {
    onEditPress: () => void;
    isEditMode: boolean;
}

interface AddressBarProps {
    onPress: () => void;
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

const AddressBar: React.FC<AddressBarProps> = ({ onPress }) => {
    const { theme } = useUnistyles();

    return (
        <Pressable
            onPress={onPress}
            style={styles.addressBar}
            accessibilityLabel="Thay đổi địa chỉ giao hàng"
            accessibilityRole="button"
        >
            <View style={styles.addressIcon}>
                <IconSymbol name="location-on" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.addressContent}>
                <View style={styles.addressTitleRow}>
                    <Text style={styles.addressTitle}>Giao tới: Nhà riêng</Text>
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Mặc định</Text>
                    </View>
                </View>
                <Text style={styles.addressText} numberOfLines={1}>
                    123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM
                </Text>
            </View>
            <IconSymbol name="chevron-right" size={20} color={theme.colors.secondary} />
        </Pressable>
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
    // STATE
    // ========================================

    // Mock data - Replace with useCart() query later
    const [cartData, setCartData] = useState<CartUI | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Zustand store
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
        totalQuantity,
        setTotalQuantity,
    } = useCartStore();

    // ========================================
    // EFFECTS
    // ========================================

    // Load mock data on mount
    useEffect(() => {
        const mockData = generateMockCartData();
        setCartData(mockData);

        // Auto-select all items initially (UX improvement)
        const allSelectableIds = mockData.shops
            .flatMap((shop) => shop.items)
            .filter((item) => !item.isOutOfStock)
            .map((item) => item.id);
        setSelectedItemIds(new Set(allSelectableIds));

        // Simulated loading delay for skeleton demo
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [setSelectedItemIds]);

    useEffect(() => {
        if (cartData) {
            const count = cartData.shops.reduce(
                (sum, shop) => sum + shop.items.length,
                0
            );
            setTotalQuantity(count);
        }
    }, [cartData, setTotalQuantity]);

    // ========================================
    // CALCULATIONS (Derived State)
    // ========================================

    const {
        calculation,
        selectAllState,
        toggleItem,
        toggleShop,
        toggleSelectAll,
        isItemSelected,
    } = useCartCalculations({
        cartData,
        selectedIds: selectedItemIds,
        appliedShopVouchers,
        appliedPlatformVoucherId,
        onSelectionChange: setSelectedItemIds,
        onShopVoucherChange: setShopVoucher,
        onPlatformVoucherChange: setPlatformVoucher,
    });

    // ========================================
    // CALLBACKS
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

    const handleQuantityChange = useCallback(
        (itemId: string, quantity: number) => {
            // TODO: Call API to update quantity
            // For now, update local mock data
            setCartData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    shops: prev.shops.map((shop) => ({
                        ...shop,
                        items: shop.items.map((item) =>
                            item.id === itemId ? { ...item, quantity } : item
                        ),
                    })),
                };
            });
        },
        []
    );

    const handleDeleteItem = useCallback(
        (itemId: string) => {
            // Remove from selection if exists
            if (selectedItemIds.has(itemId)) {
                toggleItemSelection(itemId);
            }

            // Remove from cart data
            setCartData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    shops: prev.shops
                        .map((shop) => ({
                            ...shop,
                            items: shop.items.filter((item) => item.id !== itemId),
                        }))
                        .filter((shop) => shop.items.length > 0), // Remove empty shops
                };
            });
        },
        [setSelectedItemIds]
    );

    const handleNavigateToShop = useCallback(
        (shopId: string) => {
            // TODO: Navigate to shop page
            console.log('Navigate to shop:', shopId);
        },
        []
    );

    const handleVoucherPress = useCallback(
        (shopId: string) => {
            // TODO: Open voucher bottom sheet
            console.log('Open voucher sheet for shop:', shopId);
        },
        []
    );

    const handlePlatformVoucherPress = useCallback(() => {
        // TODO: Open platform voucher bottom sheet
        console.log('Open platform voucher sheet');
    }, []);

    const handleAddressPress = useCallback(() => {
        // TODO: Open address selection
        console.log('Open address selection');
    }, []);

    const handleCheckout = useCallback(() => {
        if (calculation.selectedCount === 0) {
            // In production: Show toast or alert
            console.log('No items selected');
            return;
        }

        if (!cartData) return;

        // Initialize Checkout Session before navigation
        // This transfers selected items from Cart store to Checkout store
        useCheckoutStore.getState().initSession(
            cartData.shops,
            selectedItemIds,
            null, // In production: Get default address from user store
            cartData.platformVouchers // Pass platform vouchers from cart
        );

        // Proceed to checkout
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

    // Calculate footer height for list padding
    const footerHeight = useMemo(() => {
        return CHECKOUT_BAR_HEIGHT + VOUCHER_BAR_HEIGHT + insets.bottom;
    }, [insets.bottom]);

    // ========================================
    // RENDER
    // ========================================

    const shops = cartData?.shops ?? [];

    // Get applied platform voucher object
    const appliedPlatformVoucher = appliedPlatformVoucherId
        ? cartData?.platformVouchers.find((v) => v.id === appliedPlatformVoucherId) ?? null
        : null;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <CartHeader
                onEditPress={() => setEditMode(!isEditMode)}
                isEditMode={isEditMode}
            />

            {/* Content */}
            {isLoading ? (
                <CartSkeleton />
            ) : shops.length === 0 ? (
                <EmptyCart />
            ) : (
                <>
                    {/* Address Bar */}
                    <AddressBar onPress={handleAddressPress} />

                    {/* Shop Groups List */}
                    <FlashList
                        data={shops}
                        renderItem={renderShopGroup}
                        keyExtractor={(shop) => shop.shopId}
                        contentContainerStyle={{
                            padding: theme.margins.smd,
                            paddingBottom: footerHeight + theme.margins.md,
                        }}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Checkout Footer */}
                    <CartFooter
                        selectAllState={selectAllState}
                        calculation={calculation}
                        onToggleSelectAll={handleToggleSelectAll}
                        onCheckout={handleCheckout}
                        onVoucherPress={handlePlatformVoucherPress}
                        appliedPlatformVoucher={appliedPlatformVoucher}
                        tabBarHeight={0}
                    />
                </>
            )}
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
        height: 56, // Fixed height for content
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
    addressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.primaryMuted,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primarySubtle,
        gap: theme.margins.smd,
    },
    addressIcon: {
        width: 32,
        height: 32,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressContent: {
        flex: 1,
    },
    addressTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.margins.sm,
    },
    addressTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.typography,
    },
    defaultBadge: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: theme.radius.s,
    },
    defaultBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.primary,
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: 12,
        color: theme.colors.typographySecondary,
        marginTop: 2,
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
}));
