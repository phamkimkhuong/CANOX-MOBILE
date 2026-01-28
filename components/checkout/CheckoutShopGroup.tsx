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
 * DATA SOURCES:
 * - Display data: previewData.shops[] (server)
 * - User selections: store.selectedShipping, store.selectedShopVouchers
 */

import { IconSymbol } from '@/components/ui/Icon';
import { formatCurrency } from '@/utils/format';
import { Image } from 'expo-image';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { CheckoutItem } from './CheckoutItem';
import { CheckoutVoucherRow } from './CheckoutVoucherRow';
import { ShippingSelector } from './ShippingSelector';
import { ShopNoteInput } from './ShopNoteInput';

import { useRecommendShopVouchers } from '@/hooks/api/checkout/useRecommendShopVouchers';
import {
    useCheckoutStore,
    useSelectedShopVoucher,
    useShopNote,
    useShopShipping,
} from '@/store/useCheckoutStore';
import type { CheckoutShopUI } from '@/types/checkout';
import type { RecommendShopVoucherRequest } from '@/types/checkout/shopVoucherRecommendation';

interface CheckoutShopGroupProps {
    shop: CheckoutShopUI;
}

export const CheckoutShopGroup: React.FC<CheckoutShopGroupProps> = ({ shop }) => {
    const { theme } = useUnistyles();
    const { t } = useTranslation('checkout');
    const styles = stylesheet;


    // Store actions
    const selectShippingMethod = useCheckoutStore((s) => s.selectShippingMethod);
    const setShopNote = useCheckoutStore((s) => s.setShopNote);
    const applyShopVoucher = useCheckoutStore((s) => s.applyShopVoucher);
    const previewData = useCheckoutStore((s) => s.previewData);

    // Selector hooks for this shop
    const shippingData = useShopShipping(shop.shopId);
    const selectedVoucherId = useSelectedShopVoucher(shop.shopId);
    const currentNote = useShopNote(shop.shopId);

    // Get shop subtotal from previewData
    const shopSubtotal = previewData?.calculation.shopSubtotals.find(
        (s) => s.shopId === shop.shopId
    );

    // Build recommendation request body
    const recommendRequest = useMemo((): RecommendShopVoucherRequest | null => {
        if (!shopSubtotal) return null;
        return {
            shopId: shop.shopId,
            totalAmount: shopSubtotal.itemsTotal,
            shippingFee: shopSubtotal.shippingFee,
            shopIds: [shop.shopId],
            productIds: shop.items.map(i => i.productId),
            failedVoucherCodes: [],
            preferences: {
                scopes: ['SHOP_ORDER', 'SHIPPING'],
                limit: 10,
            }
        };
    }, [shop.shopId, shop.items, shopSubtotal]);

    // Fetch recommended vouchers for this shop
    const { data: recommendedVouchers } = useRecommendShopVouchers(
        shop.shopId,
        recommendRequest,
        { enabled: !!recommendRequest }
    );
    const shopVouchersFromPreview = useMemo(() => {
        return shop.availableVouchers.filter(v => v.title === 'SHOP');
    }, [shop.availableVouchers]);
    const availableVouchers = recommendedVouchers || shopVouchersFromPreview;

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


    return (
        <View style={styles.container}>
            {/* Shop Header */}
            <View style={styles.shopHeader}>
                <View style={styles.shopIcon}>
                    {shop.shopLogo ? (
                        <Image
                            source={{ uri: shop.shopLogo }}
                            style={styles.shopLogoImage}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <IconSymbol
                            name="store"
                            size={16}
                            color={theme.colors.buttonActive}
                        />
                    )}
                </View>
                <Text style={styles.shopName} numberOfLines={1}>
                    {shop.shopName}
                </Text>
            </View>

            {/* Divider */}
            {/* <View style={styles.divider} /> */}

            {/* Items List */}
            <View>
                {shop.items.map((item) => (
                    <CheckoutItem key={item.id} item={item} />
                ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Shop Voucher */}
            <CheckoutVoucherRow
                availableVouchers={availableVouchers}
                selectedVoucherId={selectedVoucherId}
                discountAmount={shopSubtotal?.shopVoucherDiscount ?? 0}
                onSelect={handleVoucherSelect}
            />

            {/* Divider */}
            <View style={styles.divider} />

            {/* Shipping Method */}
            {shippingData && (
                <ShippingSelector
                    methods={shippingData.methods}
                    selectedMethodId={shippingData.selectedMethodId}
                    isLoading={shippingData.isLoading}
                    onSelect={handleShippingSelect}
                />
            )}

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
                        {t('shopGroup.totalItems', { count: shopSubtotal.itemCount })}
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
    shopIcon: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: theme.colors.activeSoft,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.margins.smd,
        overflow: 'hidden',
    },
    shopLogoImage: {
        width: '100%',
        height: '100%',
    },

    shopName: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.typography,
    },

    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: theme.margins.md,
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
        fontWeight: '600',
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
