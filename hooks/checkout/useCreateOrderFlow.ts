/**
 * useCreateOrderFlow
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';
import { CART_QUERY_KEY } from '@/hooks/api/cart/useCart';
import { useCreateOrder } from '@/hooks/api/checkout/useCreateOrder';
import { useCartStore } from '@/store/useCartStore';
import { useCanPlaceOrder, useCheckoutStore } from '@/store/useCheckoutStore';
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
import { Alert } from '@/utils/AlertHelper';
import { buildCreateOrderRequest } from '@/utils/checkoutRequestBuilder';
import { logger } from '@/utils/logger';
import { Navigator } from '@/utils/navigation';

interface UseCreateOrderFlowOptions {
    isBuyNowMode: boolean;
    quantity?: string;
    variantId?: string;
    effectivePlatformLoyaltyEnabled: boolean;
    refreshPreview: (showToastOnSuccess?: boolean) => void;
}

export function useCreateOrderFlow(options: UseCreateOrderFlowOptions) {
    const { isBuyNowMode, quantity, variantId, effectivePlatformLoyaltyEnabled, refreshPreview } = options;
    const { t } = useTranslation('checkout');
    const queryClient = useQueryClient();
    const { mutateAsync: placeOrder, isPending: isPlacingOrder } = useCreateOrder();

    // Selectors
    const canPlaceOrder = useCanPlaceOrder();
    const previewData = useCheckoutStore((s) => s.previewData);
    const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
    const resetSession = useCheckoutStore((s) => s.resetSession);

    const handlePlaceOrder = useCallback(async () => {
        if (!canPlaceOrder || !previewData) return;

        showGlobalLoading();

        try {
            const store = useCheckoutStore.getState();
            const request = buildCreateOrderRequest({
                checkoutShops: store.checkoutShops,
                selectedItemIds: store.selectedItemIds,
                selectedShipping: store.selectedShipping,
                selectedShopVouchers: store.selectedShopVouchers,
                selectedPlatformDiscountVoucher: store.selectedPlatformDiscountVoucher,
                selectedPlatformShippingVoucher: store.selectedPlatformShippingVoucher,
                selectedLoyaltyRedemptions: store.selectedLoyaltyRedemptions,
                selectedAddressId: previewData.addressId,
                paymentMethod: paymentMethod,
                isBuyNowMode: !!isBuyNowMode,
                quantity: quantity,
                variantId: variantId,
                effectivePlatformLoyaltyEnabled: !!effectivePlatformLoyaltyEnabled,
                previewData: previewData,
                shopNotes: store.shopNotes,
            });

            if (!request) {
                hideGlobalLoading();
                return;
            }

            const response = await placeOrder(request);

            // Background Cart Refresh
            // Invalidate cart query to trigger background refetch
            queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

            // Invalidate notification count (badge in Tab Bar)
            queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });

            // Clear client-side selection and vouchers (Clean up session)
            const cartStore = useCartStore.getState();
            cartStore.clearSelection();
            cartStore.clearShopVouchers();
            cartStore.setPlatformVoucher(null);

            // Reset checkout session
            resetSession();

            // Prepare order info for success screen
            const orders = response.data?.orders || [];
            const orderCount = orders.length;

            const orderInfos = orders.map((order) => ({
                orderId: order.orderId,
                orderNumber: order.orderNumber,
                shopName: order.shopInfo?.shopName || 'Shop',
                // Additional fields for single order display
                grandTotal: order.pricing?.grandTotal,
                currency: order.currency || 'VND',
                paymentMethod: order.payment?.paymentMethod,
                createdAt: order.createdAt,
                itemCount: order.itemCount || order.items?.length || 0,
                // Product images for thumbnails (limit to 3)
                productImages: order.items?.slice(0, 3).map((item) => {
                    if (item.imageBasePath && item.imageExtension) {
                        const cdnUrl = process.env.EXPO_PUBLIC_CDN_BASE_URL || 'https://pub-5341c10461574a539df355b9fbe87197.r2.dev/';
                        return `${cdnUrl}${item.imageBasePath}${item.imageExtension}`;
                    }
                    return null;
                }).filter(Boolean) || [],
            }));

            // Hide loading overlay before navigating
            hideGlobalLoading();

            // Redirect based on payment method
            if (paymentMethod !== 'cod' && response.data?.paymentInfo) {
                Navigator.replace({
                    pathname: ROUTES.ORDERS.PAYMENT_PAYOS,
                    params: {
                        paymentInfo: JSON.stringify(response.data.paymentInfo),
                        id: response.data.orders?.[0]?.orderId || '',
                    },
                } as never);
            } else {
                // Navigate to Order Success screen
                Navigator.replace({
                    pathname: ROUTES.ORDERS.SUCCESS,
                    params: {
                        orderCount: String(orderCount),
                        orders: JSON.stringify(orderInfos),
                    },
                } as never);
            }
        } catch (error: unknown) {
            hideGlobalLoading();

            const message = t('status.orderFailed');
            logger.checkout.error('Place order failed', { error: message });

            Alert.show({
                title: t('status.orderFailed', { defaultValue: 'Lỗi' }),
                message: message,
                type: 'error',
                confirmText: t('actions.refresh', { defaultValue: 'Làm mới' }),
                cancelText: t('actions.close', { defaultValue: 'Đóng' }),
                showCancel: true,
                onConfirm: () => refreshPreview(true),
            });
        }
    }, [
        canPlaceOrder,
        previewData,
        placeOrder,
        queryClient,
        resetSession,
        paymentMethod,
        isBuyNowMode,
        quantity,
        variantId,
        effectivePlatformLoyaltyEnabled,
        refreshPreview,
        t,
    ]);

    return {
        handlePlaceOrder,
        isPlacingOrder,
    };
}
