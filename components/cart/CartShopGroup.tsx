/**
 * CartShopGroup - Organism component for a shop's cart section
 * 
 * Combines:
 * - ShopHeader with 3-state checkbox
 * - List of CartItems
 * - ShopVoucherSelector
 * - SwipeableRow wrapper for each item
 * 
 * @example
 * <CartShopGroup 
 *   shop={shopData}
 *   selectedIds={selectedIds}
 *   onToggleShop={() => toggleShop(shopId)}
 *   onToggleItem={(id) => toggleItem(id)}
 * />
 */

import type { CartItemUI, CartShopUI, CheckboxState } from '@/types/cart';
import React, { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { SwipeableRow } from '../ui/SwipeableRow';
import { CartItem } from './CartItem';
import { ShopHeader } from './ShopHeader';
// import { ShopVoucherSelector } from './ShopVoucherSelector';

interface CartShopGroupProps {
    /** Shop data with items */
    shop: CartShopUI;
    /** Set of selected item IDs */
    selectedIds: Set<string>;
    /** Shop checkbox state (calculated externally) */
    shopCheckboxState: CheckboxState;
    /** Toggle all items in shop */
    onToggleShop: () => void;
    /** Toggle single item */
    onToggleItem: (itemId: string) => void;
    onQuantityChange: (itemId: string, quantity: number) => void;
    onDeleteItem: (itemId: string) => void;
    /** Navigate to shop detail */
    onNavigateToShop?: () => void;
    /** Prefetch shop data on press in (Hybrid Pattern) */
    onShopPressIn?: () => void;
    /** Open variant selector for item */
    onVariantPress?: (itemId: string) => void;
    /** Find similar product */
    onFindSimilar?: (itemId: string) => void;
    /** Open voucher selection */
    onVoucherPress: () => void;
    /** Is in edit mode */
    isEditMode?: boolean;
    /** Toggle edit mode */
    onEditModeToggle?: () => void;
}

// ============================================
// COMPONENT
// ============================================

export const CartShopGroup: React.FC<CartShopGroupProps> = memo(({
    shop,
    selectedIds: _selectedIds,
    shopCheckboxState,
    onToggleShop,
    onToggleItem,
    onQuantityChange,
    onDeleteItem,
    onNavigateToShop,
    onShopPressIn,
    onVariantPress,
    onFindSimilar,
    onVoucherPress: _onVoucherPress,
    isEditMode = false,
    onEditModeToggle,
}) => {
    const { t } = useTranslation('cart');
    const {
        shopName,
        items,
    } = shop;

    // Render single item (memoized factory)
    const renderItem = useCallback(
        (item: CartItemUI, index: number) => {
            const isLast = index === items.length - 1;

            return (
                <View key={item.id}>
                    <SwipeableRow
                        onDelete={() => onDeleteItem(item.id)}
                        onFindSimilar={
                            item.isOutOfStock
                                ? undefined
                                : () => onFindSimilar?.(item.id)
                        }
                        deleteLabel={t('item.delete')}
                        findSimilarLabel={t('item.findSimilar')}
                        disabled={isEditMode}
                    >
                        <CartItem
                            item={item}
                            onToggleSelect={onToggleItem}
                            onQuantityChange={onQuantityChange}
                            onVariantPress={onVariantPress}
                            onFindSimilar={onFindSimilar}
                            onDelete={onDeleteItem}
                        />
                    </SwipeableRow>

                    {/* Divider (except for last item) */}
                    {!isLast && <View style={styles.divider} />}
                </View>
            );
        },
        [
            items.length,
            isEditMode,
            onToggleItem,
            onQuantityChange,
            onDeleteItem,
            onVariantPress,
            onFindSimilar,
            t
        ]
    );

    return (
        <View style={styles.container}>
            {/* Shop Header */}
            <ShopHeader
                shopName={shopName}
                shopLogoUrl={shop.shopLogoUrl}
                checkboxState={shopCheckboxState}
                onToggleSelect={onToggleShop}
                onNavigateToShop={onNavigateToShop}
                onShopPressIn={onShopPressIn}
                onEditPress={onEditModeToggle}
                isEditMode={isEditMode}
            />

            {/* Cart Items */}
            <View style={styles.itemsContainer}>
                {items.map((item, index) => renderItem(item, index))}
            </View>


            {/* TEMPORARILY HIDDEN - Shop Voucher Selector */}
            {/* {availableVouchers.length > 0 && (
                <ShopVoucherSelector
                    appliedVoucher={appliedVoucher}
                    availableCount={availableVouchers.length}
                    onPress={onVoucherPress}
                />
            )} */}
        </View>
    );
});

CartShopGroup.displayName = 'CartShopGroup';

const styles = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.l,
        overflow: 'hidden',
        marginBottom: theme.margins.smd,
    },
    itemsContainer: {
        // Items render here
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.smd,
    },
}));
