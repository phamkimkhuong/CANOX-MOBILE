/**
 * Checkout Screen
 * ARCHITECTURE:
 * - Server data: previewData (shops, calculation, validation)
 * - User selections: store Maps (shipping, vouchers, notes)
 */

import { ROUTES } from '@/constants/routes';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { Alert } from '@/utils/AlertHelper';
import { Navigator } from '@/utils/navigation';
import { NavigationAction, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { StyleSheet } from 'react-native-unistyles';

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
import { CART_QUERY_KEY, useAddToCart } from '@/hooks/api/cart/useCart';
import { useRemoveCartItem } from '@/hooks/api/cart/useCartMutations';
import { useCheckoutPreview } from '@/hooks/api/checkout/useCheckoutPreview';
import { useCreateOrder } from '@/hooks/api/checkout/useCreateOrder';
import { useRecommendPlatformVouchers } from '@/hooks/api/checkout/useRecommendPlatformVouchers';
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
import { hideGlobalLoading, showGlobalLoading } from '@/store/useLoadingStore';
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
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { t } = useTranslation('checkout');

    const styles = stylesheet;

    // ========================================
    // ROUTE PARAMS - Buy Now mode detection
    // ========================================
    const { mode, variantId, quantity } = useLocalSearchParams<{
        mode?: 'buy-now';
        variantId?: string;
        quantity?: string;
    }>();
    const isBuyNowMode = mode === 'buy-now' && !!variantId;

    // ========================================
    // API Hooks
    // ========================================
    const queryClient = useQueryClient();
    const { mutate: callPreview } = useCheckoutPreview();
    const { mutateAsync: placeOrder } = useCreateOrder();
    const { mutateAsync: addToCart } = useAddToCart();
    const { mutate: removeCartItem } = useRemoveCartItem();

    // Buy Now processing state
    const [isBuyNowProcessing, setIsBuyNowProcessing] = useState(false);
    const buyNowProcessedRef = useRef(false);
    const buyNowItemIdRef = useRef<string | null>(null);
    const orderPlacedRef = useRef(false);

    // ========================================
    // Store state & selectors
    // ========================================
    const isInitialized = useCheckoutStore((s) => s.isInitialized);
    const previewData = useCheckoutStore((s) => s.previewData);
    const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
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

    const calculation = useMemo(() => calculationData ?? {
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
        loyaltyPoints: 0,
    }, [calculationData]);

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
    const initSession = useCheckoutStore((s) => s.initSession);
    const applyBulkPlatformVouchers = useCheckoutStore((s) => s.applyBulkPlatformVouchers);
    const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
    const setPreviewData = useCheckoutStore((s) => s.setPreviewData);
    const setLoadingPreview = useCheckoutStore((s) => s.setLoadingPreview);

    // ========================================
    // BUY NOW MODE PROCESSING
    // ========================================
    useEffect(() => {
        if (!isBuyNowMode || buyNowProcessedRef.current) return;
        if (isInitialized) return; // Already initialized from cart flow

        const processBuyNow = async () => {
            buyNowProcessedRef.current = true;
            setIsBuyNowProcessing(true);

            try {
                const parsedQuantity = parseInt(quantity || '1', 10) || 1;

                logger.checkout.info('Buy Now: Adding to cart', { variantId, quantity: parsedQuantity });
                // Add to cart
                const addResult = await addToCart({
                    variantId: variantId!,
                    quantity: parsedQuantity,
                    hideToast: true,
                });

                if (!addResult) {
                    throw new Error('Failed to add item to cart');
                }

                const addedItemId = addResult.id;
                const addedShopId = addResult.shopId;

                if (!addedItemId || !addedShopId) {
                    throw new Error('Could not find added item in cart');
                }

                // Save item ID for cleanup if user cancels
                buyNowItemIdRef.current = addedItemId;

                logger.checkout.info('Buy Now: Item added, initializing session', {
                    itemId: addedItemId,
                    shopId: addedShopId,
                });

                // Initialize checkout session with just this item
                initSession([addedItemId], [{
                    shopId: addedShopId,
                    items: [{
                        itemId: addedItemId,
                        quantity: parsedQuantity,
                    }],
                }]);

                // Preview will be triggered automatically by the debounced effect
            } catch (error) {
                logger.checkout.error('Buy Now failed', { error });
                Toast.show({
                    type: 'error',
                    text1: 'Không thể mua ngay',
                    text2: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
                });
                // Navigate back on failure
                Navigator.back();
            } finally {
                setIsBuyNowProcessing(false);
            }
        };

        processBuyNow();
    }, [isBuyNowMode, variantId, quantity, isInitialized, addToCart, initSession, t]);

    // ========================================
    // BACK NAVIGATION HANDLING (GESTURES & SYSTEM BACK)
    // ========================================
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e: { preventDefault: () => void; data: { action: NavigationAction } }) => {
            if (orderPlacedRef.current) return;
            e.preventDefault();
            Alert.show({
                title: t('actions.cancelTitle'),
                message: t('actions.cancelMessage'),
                type: 'warning',
                showCancel: true,
                cancelText: t('actions.cancelStay'),
                confirmText: t('actions.cancelConfirm'),
                onConfirm: () => {
                    // Logic to actually leave the screen
                    navigation.dispatch(e.data.action);
                },
            });
        });

        return unsubscribe;
    }, [navigation, t]);

    // Cleanup on unmount: Reset store and remove Buy Now item if order was NOT placed
    useEffect(() => {
        return () => {
            // Reset refs
            buyNowProcessedRef.current = false;

            // If Buy Now mode and order was NOT placed, remove the item from cart
            if (isBuyNowMode && buyNowItemIdRef.current && !orderPlacedRef.current) {
                logger.checkout.info('Buy Now cancelled, removing item from cart', {
                    itemId: buyNowItemIdRef.current,
                });
                removeCartItem({ itemId: buyNowItemIdRef.current });
            }

            // Reset refs
            buyNowItemIdRef.current = null;
            if (!orderPlacedRef.current) {
                resetSession();
            }
        };
    }, [isBuyNowMode, removeCartItem, resetSession]);

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
            shippingAddress: currentAddressId
                ? {
                    addressId: currentAddressId,
                    addressChanged: false,
                }
                : undefined,
            shops: checkoutShops.map((shop) => {
                const voucherCode = selectedShopVouchers.get(shop.shopId);
                const userShippingCode = selectedShipping.get(shop.shopId);

                return {
                    shopId: shop.shopId,
                    items: shop.items,
                    vouchers: voucherCode ? [voucherCode] : undefined,
                    // Use distributed global vouchers inside each shop
                    globalVouchers: globalVouchersArray.length > 0 ? globalVouchersArray : undefined,
                    serviceCode: userShippingCode ? Number(userShippingCode) : undefined,
                    shippingFee: undefined,
                };
            }),
            paymentMethod: paymentMethod === 'cod' ? 'COD' : 'PAYOS',
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

        // Check Global Vouchers at Shop Level (since it's distributed)
        for (const reqShop of req.shops) {
            const previewShop = preview.shops.find((s: CheckoutShopUI) => s.shopId === reqShop.shopId);
            if (!previewShop) return false;

            // Check global vouchers inside each shop
            const reqGlobals = reqShop.globalVouchers || [];
            const previewGlobals: string[] = [];
            if (preview.calculation.appliedPlatformVoucherId) previewGlobals.push(preview.calculation.appliedPlatformVoucherId);
            if (preview.calculation.appliedShippingVoucherId) previewGlobals.push(preview.calculation.appliedShippingVoucherId);

            if (reqGlobals.length !== previewGlobals.length) return false;
            // Use local variable to avoid implicit 'any' lint or just use type-safe comparison
            if (!reqGlobals.every((v: string) => previewGlobals.includes(v))) return false;

            // Check applied shop-specific voucher
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

    // ========================================
    // NOTIFICATIONS
    // ========================================
    const hasShownVoucherToast = useRef(false);

    useEffect(() => {
        // Condition: Render finished && preview data ready && can place order
        const isReady = isInitialized && previewData && !isLoadingPreview;

        if (isReady && canPlaceOrder && !hasShownVoucherToast.current) {
            // Check if any voucher actually applied (shop or platform)
            const hasVoucher =
                calculation.platformVoucherDiscount > 0 ||
                calculation.shippingDiscount > 0 ||
                calculation.totalShopVoucherDiscount > 0;

            if (hasVoucher) {
                // Delay a bit to ensure UI has settled and user is focused
                const timer = setTimeout(() => {
                    Toast.show({
                        type: 'success',
                        text1: t('voucher.bestApplied'),
                        text2: t('voucher.bestAppliedDetail'),
                        position: 'bottom',
                        visibilityTime: 3000,
                    });
                }, 500);

                hasShownVoucherToast.current = true;
                return () => clearTimeout(timer);
            }
        }
    }, [isInitialized, previewData, isLoadingPreview, canPlaceOrder, calculation, t]);


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

        showGlobalLoading();

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
                        items: shop.items.map(item => ({
                            itemId: item.id,
                            expectedUnitPrice: item.unitPrice,
                            quantity: item.quantity,
                            promotionId: item.promotionId,
                        })),
                        vouchers: shopVouchers,
                        serviceCode: Number(shop.shippingOptions.selectedMethodId) || 0,
                        shippingFee: shop.shippingOptions.methods.find(m => m.id === shop.shippingOptions.selectedMethodId)?.fee || 0,
                        globalVouchers: globalVouchersArray,
                        loyaltyPoints: shop.loyaltyPoints,
                    };
                }),
                buyerAddressData: {
                    addressId: previewData.addressId,
                    buyerAddressId: previewData.addressId,
                },
                loyaltyPoints: calculation.loyaltyPoints,
                paymentMethod: paymentMethod === 'cod' ? 'COD' : 'PAYOS',
                customerNote: Array.from(store.shopNotes.values()).filter(Boolean).join('; ') || '',
            };

            const response = await placeOrder(request);

            // Mark order as placed to prevent Buy Now cleanup from removing item
            orderPlacedRef.current = true;

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
            const message = error instanceof Error ? error.message : t('status.orderFailed');
            logger.checkout.error('Place order failed', { error: message });
            Alert.error(t('status.orderFailed'));
        }
    }, [
        canPlaceOrder,
        previewData,
        paymentMethod,
        selectedPlatformDiscountVoucher,
        selectedPlatformShippingVoucher,
        placeOrder,
        resetSession,
        calculation.loyaltyPoints,
        queryClient,
        t,
    ]);


    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

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

    const shouldShowSkeleton = !isInitialized || !previewData || isBuyNowProcessing;

    if (shouldShowSkeleton) {
        return (
            <View style={styles.container}>
                <CheckoutHeader title={t('header.title')} onBack={handleBack} />
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
            <CheckoutHeader title={t('header.title')} onBack={handleBack} />

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
                    discountAmount={calculation.platformVoucherDiscount + calculation.shippingDiscount}
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
