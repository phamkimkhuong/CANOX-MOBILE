/**
 * CheckoutShopGroup Component
 * 
 * Organism that groups all checkout items by shop.
 * Contains:
 * - Shop header with name
 * - List of checkout items
 * - Shop voucher selector
 * - Shipping method selector
 * - Shop note input
 * 
 * Layout follows the HTML design: Shop Icon | Shop Name > items > voucher > shipping > note
 */

import { IconSymbol } from '@/components/ui/Icon';
import { formatCurrency } from '@/utils/format';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { CheckoutItem } from './CheckoutItem';
import { CheckoutVoucherRow } from './CheckoutVoucherRow';
import { ShippingSelector } from './ShippingSelector';
import { ShopNoteInput } from './ShopNoteInput';

import { useCheckoutCalculation } from '@/hooks/api/useCheckoutCalculation';
import { useCheckoutStore, useShopShippingMethod } from '@/store/useCheckoutStore';
import type { CheckoutShopUI } from '@/types/checkout';

interface CheckoutShopGroupProps {
    shop: CheckoutShopUI;
}

export const CheckoutShopGroup: React.FC<CheckoutShopGroupProps> = ({ shop }) => {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();

    // Store actions
    const selectShippingMethod = useCheckoutStore((s) => s.selectShippingMethod);
    const setShopNote = useCheckoutStore((s) => s.setShopNote);
    const applyShopVoucher = useCheckoutStore((s) => s.applyShopVoucher);
    const shopVouchers = useCheckoutStore((s) => s.shopVouchers);
    const shopNotes = useCheckoutStore((s) => s.shopNotes);
    const isLoadingShipping = useCheckoutStore((s) => s.isLoadingShipping);

    // Derived state
    const selectedShippingMethod = useShopShippingMethod(shop.shopId);
    const { getShopSubtotal } = useCheckoutCalculation();
    const shopSubtotal = getShopSubtotal(shop.shopId);

    // Current values
    const selectedVoucherId = shopVouchers.get(shop.shopId) ?? null;
    const currentNote = shopNotes.get(shop.shopId) ?? '';
    const isShippingLoading = isLoadingShipping.get(shop.shopId) ?? true;

    // Handlers
    const handleShippingSelect = useCallback(
        (methodId: string) => {
            selectShippingMethod(shop.shopId, methodId);
        },
        [shop.shopId, selectShippingMethod]
    );

    const handleVoucherSelect = useCallback(
        (voucherId: string | null) => {
            applyShopVoucher(shop.shopId, voucherId);
        },
        [shop.shopId, applyShopVoucher]
    );

    const handleNoteChange = useCallback(
        (note: string) => {
            setShopNote(shop.shopId, note);
        },
        [shop.shopId, setShopNote]
    );

    const handleShopPress = useCallback(() => {
        router.push(`/shop/${shop.shopId}` as never);
    }, [router, shop.shopId]);

    return (
        <View style={styles.container}>
            {/* Shop Header */}
            <Pressable
                style={({ pressed }) => [
                    styles.shopHeader,
                    pressed && styles.shopHeaderPressed,
                ]}
                onPress={handleShopPress}
                accessibilityRole="button"
                accessibilityLabel={`Xem shop ${shop.shopName}`}
            >
                <View style={styles.shopIcon}>
                    <IconSymbol
                        name="store"
                        size={16}
                        color={theme.colors.primary}
                    />
                </View>
                <Text style={styles.shopName} numberOfLines={1}>
                    {shop.shopName}
                </Text>
                <IconSymbol
                    name="chevron-right"
                    size={18}
                    color={theme.colors.typographySecondary}
                />
            </Pressable>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Items List */}
            <View style={styles.itemsContainer}>
                {shop.items.map((item) => (
                    <CheckoutItem key={item.id} item={item} />
                ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Shop Voucher */}
            <CheckoutVoucherRow
                availableVouchers={shop.availableVouchers}
                selectedVoucherId={selectedVoucherId}
                discountAmount={shopSubtotal?.shopVoucherDiscount ?? 0}
                onSelect={handleVoucherSelect}
            />

            {/* Divider */}
            <View style={styles.divider} />

            {/* Shipping Method */}
            <ShippingSelector
                methods={shop.shippingOptions.methods}
                selectedMethodId={shop.shippingOptions.selectedMethodId}
                isLoading={isShippingLoading}
                onSelect={handleShippingSelect}
            />

            {/* Divider */}
            <View style={styles.divider} />

            {/* Shop Note */}
            <ShopNoteInput
                value={currentNote}
                onChange={handleNoteChange}
            />

            {/* Shop Subtotal */}
            {shopSubtotal && (
                <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>
                        Tổng ({shopSubtotal.itemCount} sản phẩm):
                    </Text>
                    <Text style={styles.subtotalValue}>
                        {formatCurrency(shopSubtotal.shopTotal)}
                    </Text>
                </View>
            )}
        </View>
    );
};

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        backgroundColor: theme.colors.surface,
        marginBottom: theme.margins.sm,
    },

    shopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.margins.sm,
        paddingHorizontal: theme.margins.md,
    },

    shopHeaderPressed: {
        backgroundColor: theme.colors.background,
    },

    shopIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: `${theme.colors.primary}12`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.margins.smd,
    },

    shopName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.md,
    },

    itemsContainer: {
        paddingVertical: theme.margins.sm,
    },

    subtotalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: theme.margins.smd,
        paddingHorizontal: theme.margins.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },

    subtotalLabel: {
        fontSize: 14,
        color: theme.colors.typographySecondary,
        marginRight: theme.margins.sm,
    },

    subtotalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.error,
    },
}));

export default CheckoutShopGroup;
