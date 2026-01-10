/**
 * Checkout Screen
 * ARCHITECTURE:
 * - Server data: previewData (shops, calculation, validation)
 * - User selections: store Maps (shipping, vouchers, notes)
 */

import { ROUTES } from '@/constants/routes';
import { Alert } from '@/utils/AlertHelper';
import { Navigator } from '@/utils/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Components
import {
    AddressCard,
    BillSummary,
    CheckoutFooter,
    CheckoutHeader,
    CheckoutShopGroup,
    CheckoutSkeleton,
    PaymentMethodSection,
    PlatformVoucherSelector,
} from '@/components/checkout';

// Store & Hooks
import { CART_QUERY_KEY } from '@/hooks/api/cart/useCart';
import { useCheckoutPreview } from '@/hooks/api/checkout/useCheckoutPreview';
import { useCreateOrder } from '@/hooks/api/checkout/useCreateOrder';
import { useRecommendPlatformVouchers } from '@/hooks/api/checkout/useRecommendPlatformVouchers';
import { useUserAddresses } from '@/hooks/api/useUserAddresses';
import { useDebounce } from '@/hooks/useDebounce';
import { useCartStore } from '@/store/useCartStore';
import {
    useCanPlaceOrder,
    useCheckoutCalculation,
    useCheckoutShops,
    useCheckoutStore,
    useOrderBlockReasons,
    usePreviewWarnings,
} from '@/store/useCheckoutStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { CheckoutShopUI, PaymentMethodType } from '@/types/checkout';
import type { CheckoutPreviewRequest, CheckoutPreviewShopRequest } from '@/types/checkout/checkoutPreview';
import type { CreateOrderRequest } from '@/types/checkout/order';
import type { RecommendPlatformVoucherRequest } from '@/types/checkout/platformVoucherRecommendation';
import { CheckoutPreviewUI } from '@/utils/adapter/checkoutPreviewAdapter';
import { logger } from '@/utils/logger';

// ============================================
// SCREEN COMPONENT
// ============================================

export default function CheckoutScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;

    // ========================================
    // API Hooks
    // ========================================
    const queryClient = useQueryClient();
    const { mutate: callPreview } = useCheckoutPreview();
    const { mutateAsync: placeOrder } = useCreateOrder();
    const { data: userAddresses } = useUserAddresses();

    // ========================================
    // Store state & selectors
    // ========================================
    const isInitialized = useCheckoutStore((s) => s.isInitialized);
    const previewData = useCheckoutStore((s) => s.previewData);
    const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
    const isSubmitting = useCheckoutStore((s) => s.isSubmitting);
    const selectedShipping = useCheckoutStore((s) => s.selectedShipping);
    const selectedShopVouchers = useCheckoutStore((s) => s.selectedShopVouchers);
    const selectedPlatformDiscountVoucher = useCheckoutStore((s) => s.selectedPlatformDiscountVoucher);
    const selectedPlatformShippingVoucher = useCheckoutStore((s) => s.selectedPlatformShippingVoucher);
    const selectedItemIds = useCheckoutStore((s) => s.selectedItemIds);
    const checkoutShops = useCheckoutStore((s) => s.checkoutShops);
    const isLoadingPreview = useCheckoutStore((s) => s.isLoadingPreview);

    // Computed selectors from store
    const shops = useCheckoutShops();
    const calculationData = useCheckoutCalculation();
    const canPlaceOrder = useCanPlaceOrder();
    const orderBlockReasons = useOrderBlockReasons();
    const warnings = usePreviewWarnings();

    // Default calculation for null safety
    const calculation = calculationData ?? {
        subtotal: 0,
        totalShippingFee: 0,
        totalShopVoucherDiscount: 0,
        platformVoucherDiscount: 0,
        shippingDiscount: 0,
        totalAmount: 0,
        taxAmount: 0,
        totalSavings: 0,
        totalItemCount: 0,
        shopSubtotals: [],
        isCalculatingShipping: true,
        platformVoucherValidation: null,
    };

    // Platform voucher validation from warnings
    const platformVoucherWarning = useMemo(() => {
        const voucherWarning = warnings.find(
            (w) => w.toLowerCase().includes('voucher') || w.toLowerCase().includes('mã giảm')
        );
        return voucherWarning ?? null;
    }, [warnings]);
    const isPlatformVoucherValid = platformVoucherWarning === null;

    // Address from Global Store
    const selectedAddressId = useUserAddressStore((s) => s.selectedAddressId);
    const allAddresses = useUserAddressStore((s) => s.addresses);

    // Delivery address for UI display
    const deliveryAddress = useMemo(() => {
        return allAddresses.find((addr) => addr.id === selectedAddressId) || null;
    }, [allAddresses, selectedAddressId]);

    // Store actions
    const resetSession = useCheckoutStore((s) => s.resetSession);
    const applyPlatformVoucher = useCheckoutStore((s) => s.applyPlatformVoucher);
    const applyBulkPlatformVouchers = useCheckoutStore((s) => s.applyBulkPlatformVouchers);
    const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
    const setSubmitting = useCheckoutStore((s) => s.setSubmitting);
    const setPreviewData = useCheckoutStore((s) => s.setPreviewData);
    const setLoadingPreview = useCheckoutStore((s) => s.setLoadingPreview);

    // ========================================
    // BUILD PREVIEW REQUEST
    // ========================================
    const buildPreviewRequest = useCallback((): CheckoutPreviewRequest | null => {
        // Cần selected items từ store
        if (selectedItemIds.length === 0) return null;
        if (checkoutShops.length === 0) return null;

        const currentAddressId = selectedAddressId;

        const globalVouchersArray: string[] = [];
        if (selectedPlatformDiscountVoucher) globalVouchersArray.push(selectedPlatformDiscountVoucher);
        if (selectedPlatformShippingVoucher) globalVouchersArray.push(selectedPlatformShippingVoucher);

        const request: CheckoutPreviewRequest = {
            shippingAddress: currentAddressId ? {
                addressId: currentAddressId,
                addressChanged: false,
            } : undefined,
            globalVouchers: globalVouchersArray.length > 0 ? globalVouchersArray : undefined,
            shops: checkoutShops.map((shop) => {
                const voucherCode = selectedShopVouchers.get(shop.shopId);
                const userShippingCode = selectedShipping.get(shop.shopId);

                return {
                    shopId: shop.shopId,
                    itemIds: shop.itemIds,
                    vouchers: voucherCode ? [voucherCode] : undefined,
                    globalVouchers: globalVouchersArray.length > 0 ? globalVouchersArray : undefined,
                    serviceCode: userShippingCode ? Number(userShippingCode) : undefined,
                    shippingFee: undefined,
                };
            }),
            allSelectedItemIds: [...selectedItemIds],
            previewAllSelected: true,
            paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
        };

        return request;
    }, [
        checkoutShops,
        selectedItemIds,
        selectedShipping,
        selectedShopVouchers,
        selectedPlatformDiscountVoucher,
        selectedPlatformShippingVoucher,
        selectedAddressId,
        paymentMethod,
    ]);

    /**
     * Check if the current request exactly matches what the server already calculated.
     * This prevents the "double call" when the store syncs vouchers from the first response.
     */
    const isRequestMatchingPreview = useCallback((req: CheckoutPreviewRequest, preview: CheckoutPreviewUI) => {
        // Check Address
        if (req.shippingAddress?.addressId !== preview.addressId) return false;

        // Check Global Vouchers
        const reqGlobals = req.globalVouchers || [];
        const previewGlobals: string[] = [];
        if (preview.calculation.appliedPlatformVoucherId) previewGlobals.push(preview.calculation.appliedPlatformVoucherId);
        if (preview.calculation.appliedShippingVoucherId) previewGlobals.push(preview.calculation.appliedShippingVoucherId);

        if (reqGlobals.length !== previewGlobals.length) return false;
        if (!reqGlobals.every(v => previewGlobals.includes(v))) return false;

        //  Check Shop Vouchers & Items
        for (const reqShop of req.shops) {
            const previewShop = preview.shops.find((s: CheckoutShopUI) => s.shopId === reqShop.shopId);
            if (!previewShop) return false;

            // Check applied voucher
            const reqVoucher = reqShop.vouchers?.[0] || null;
            const previewVoucher = previewShop.appliedVoucherId;
            if (reqVoucher !== previewVoucher) return false;

            // Check custom shipping selection
            const reqShipping = reqShop.serviceCode;
            const previewShipping = Number(previewShop.shippingOptions.selectedMethodId);
            if (reqShipping && reqShipping !== previewShipping) return false;
        }

        return true;
    }, []);

    // ========================================
    // CALL PREVIEW API
    // ========================================

    // Track last fetched request to avoid duplicates
    const lastRequestKey = useRef<string | null>(null);

    // Stable ref cho mutation function
    const callPreviewRef = useRef(callPreview);
    callPreviewRef.current = callPreview;

    const doFetchPreview = useCallback(
        (request: CheckoutPreviewRequest) => {
            setLoadingPreview(true);
            callPreviewRef.current(request, {
                onSuccess: (data) => {
                    setPreviewData(data);
                    setLoadingPreview(false);
                },
                onError: (error) => {
                    setLoadingPreview(false);
                    logger.checkout.error('Preview failed', { error: error.message });
                },
            });
        },
        [setPreviewData, setLoadingPreview]
    );

    // ========================================
    // DEBOUNCED REQUEST
    // ========================================

    const currentRequest = useMemo(() => {
        if (!isInitialized) return null;
        return buildPreviewRequest();
    }, [isInitialized, buildPreviewRequest]);

    const debouncedRequest = useDebounce(currentRequest, 300);

    useEffect(() => {
        if (!debouncedRequest) return;

        const triggeringRequest = {
            ...debouncedRequest,
            paymentMethod: undefined,
            shops: debouncedRequest.shops.map((s: CheckoutPreviewShopRequest) => ({
                ...s,
                serviceCode: undefined,
                shippingFee: undefined,
            }))
        };

        const requestKey = JSON.stringify(triggeringRequest);
        if (lastRequestKey.current === requestKey) {
            return;
        }
        if (previewData && isRequestMatchingPreview(debouncedRequest, previewData)) {
            logger.checkout.debug('Skipping redundant preview call - request matches current data');
            lastRequestKey.current = requestKey;
            return;
        }

        lastRequestKey.current = requestKey;

        doFetchPreview(debouncedRequest);
    }, [debouncedRequest, doFetchPreview, previewData, isRequestMatchingPreview]);

    // Cleanup on unmount
    useFocusEffect(
        useCallback(() => {
            return () => {
                // Don't reset here - only reset when explicitly leaving
            };
        }, [])
    );

    // ========================================
    // HANDLERS
    // ========================================

    const handleAddressPress = useCallback(() => {
        const params = new URLSearchParams({ mode: 'selection' });
        if (deliveryAddress?.id) {
            params.append('selectedId', deliveryAddress.id);
        }
        Navigator.push(`${ROUTES.ADDRESS.LIST}?${params.toString()}` as never);
    }, [deliveryAddress?.id]);

    const handlePlatformVoucherApply = useCallback(
        (discountId: string | null, shippingId: string | null) => {
            applyBulkPlatformVouchers(discountId, shippingId);
        },
        [applyBulkPlatformVouchers]
    );

    const handlePaymentMethodSelect = useCallback(
        (method: PaymentMethodType) => {
            setPaymentMethod(method);
        },
        [setPaymentMethod]
    );

    const handlePlaceOrder = useCallback(async () => {
        if (!canPlaceOrder || !previewData) return;

        setSubmitting(true);

        try {
            const store = useCheckoutStore.getState();
            const globalVouchersArray: string[] = [];
            if (selectedPlatformDiscountVoucher) globalVouchersArray.push(selectedPlatformDiscountVoucher);
            if (selectedPlatformShippingVoucher) globalVouchersArray.push(selectedPlatformShippingVoucher);

            const request: CreateOrderRequest = {
                shops: previewData.shops.map(shop => {
                    const shopVouchers: string[] = [];
                    if (shop.appliedVoucherId) shopVouchers.push(shop.appliedVoucherId);

                    return {
                        shopId: shop.shopId,
                        itemIds: shop.items.map(i => i.id),
                        vouchers: shopVouchers,
                        serviceCode: Number(shop.shippingOptions.selectedMethodId) || 0,
                        shippingFee: shop.shippingOptions.methods.find(m => m.id === shop.shippingOptions.selectedMethodId)?.fee || 0,
                        globalVouchers: globalVouchersArray,
                        loyaltyPoints: 0,
                    };
                }),
                buyerAddressData: {
                    addressId: previewData.addressId,
                    buyerAddressId: previewData.addressId,
                    addressType: previewData.addressType ?? 0,
                    taxAddress: previewData.taxAddress,
                },
                loyaltyPoints: 0,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
                previewId: previewData.previewId ?? '',
                previewAt: previewData.previewAt,
                customerNote: Array.from(store.shopNotes.values()).filter(Boolean).join('; ') || '',
                confirmAllSelected: true,
                allSelectedItemIds: [...selectedItemIds],
            };

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
                grandTotal: order.grandTotal,
                paymentMethod: order.paymentMethod,
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

            // Navigate to Order Success screen
            Navigator.replace({
                pathname: ROUTES.ORDERS.SUCCESS,
                params: {
                    orderCount: String(orderCount),
                    orders: JSON.stringify(orderInfos),
                },
            } as never);
        } catch (error: any) {
            logger.checkout.error('Place order failed', { error: error.message });
            Alert.error(error.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    }, [
        canPlaceOrder,
        previewData,
        paymentMethod,
        selectedPlatformDiscountVoucher,
        selectedPlatformShippingVoucher,
        selectedItemIds,
        placeOrder,
        resetSession,
        setSubmitting
    ]);

    const handleBack = useCallback(() => {
        Alert.show({
            title: 'Hủy thanh toán?',
            message: 'Thông tin thanh toán sẽ không được lưu.',
            type: 'warning',
            showCancel: true,
            cancelText: 'Ở lại',
            confirmText: 'Hủy',
            onConfirm: () => {
                resetSession(); // Retaining resetSession as it was in the original logic
                Navigator.back();
            }
        });
    }, [resetSession]);

    // ================================
    // PLATFORM VOUCHER RECOMMENDATIONS
    // ================================
    const recommendationsRequest = useMemo<RecommendPlatformVoucherRequest | null>(() => {
        if (!isInitialized || !previewData) return null;
        const firstShop = previewData.shops[0];
        const currentShippingCode = selectedShipping.get(firstShop?.shopId) || firstShop?.shippingOptions.selectedMethodId;

        return {
            totalAmount: previewData.calculation.subtotal,
            shippingFee: previewData.calculation.totalShippingFee,
            shippingMethod: currentShippingCode || undefined,
            shippingProvince: deliveryAddress?.provinceCode,
            shippingWard: deliveryAddress?.wardCode,
            shopIds: previewData.shops.map((s) => s.shopId),
            productIds: previewData.shops.flatMap((s) => s.items.map((i) => i.productId)),
            items: previewData.shops.flatMap((s) =>
                s.items.map((i) => ({
                    productId: i.productId,
                    shopId: s.shopId,
                    unitPrice: i.unitPrice,
                    quantity: i.quantity,
                    lineTotal: i.lineTotal,
                }))
            ),
            failedVoucherCodes: [],
            preferences: {
                scopes: ['SHOP_ORDER', 'SHIPPING'],
                limit: 10,
            },
        };
    }, [isInitialized, previewData, selectedShipping, deliveryAddress]);

    const { data: availablePlatformVouchers = [], isLoading: isLoadingRecommendations } = useRecommendPlatformVouchers(
        recommendationsRequest,
        { enabled: !!recommendationsRequest }
    );

    // ========================================
    // RENDER
    // ========================================

    // Show skeleton while loading
    if (!isInitialized || (!previewData && isLoadingPreview)) {
        return (
            <View style={styles.container}>
                <CheckoutHeader title="Thanh toán" onBack={handleBack} />
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <CheckoutSkeleton />
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <CheckoutHeader title="Thanh toán" onBack={handleBack} />

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Address Card */}
                <AddressCard address={deliveryAddress} onPress={handleAddressPress} />

                {/* Shop Groups - từ previewData */}
                {shops.map((shop) => (
                    <CheckoutShopGroup key={shop.shopId} shop={shop} />
                ))}

                {/* Platform Voucher */}
                <PlatformVoucherSelector
                    availableVouchers={availablePlatformVouchers}
                    selectedDiscountVoucherId={selectedPlatformDiscountVoucher}
                    selectedShippingVoucherId={selectedPlatformShippingVoucher}
                    discountAmount={calculation.platformVoucherDiscount}
                    isInvalid={!isPlatformVoucherValid}
                    warningMessage={platformVoucherWarning}
                    onApply={handlePlatformVoucherApply}
                    isLoading={isLoadingRecommendations}
                />

                {/* Payment Method */}
                <PaymentMethodSection
                    selectedMethod={paymentMethod}
                    onSelect={handlePaymentMethodSelect}
                />

                {/* Bill Summary */}
                <BillSummary calculation={calculation} />

                {/* Bottom spacing for footer */}
                <View style={styles.footerSpacer} />
            </ScrollView>

            {/* Sticky Footer */}
            <CheckoutFooter
                totalAmount={calculation.totalAmount}
                itemCount={calculation.totalItemCount}
                totalSavings={calculation.totalSavings}
                canPlaceOrder={canPlaceOrder}
                blockReasons={orderBlockReasons}
                isSubmitting={isSubmitting}
                onPlaceOrder={handlePlaceOrder}
            />
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: theme.margins.zero,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    footerSpacer: {
        height: theme.margins.sm,
    },
}));
