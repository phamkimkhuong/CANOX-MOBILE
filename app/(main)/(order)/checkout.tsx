/**
 * Checkout Screen
 * ARCHITECTURE:
 * - Server data: previewData (shops, calculation, validation)
 * - User selections: store Maps (shipping, vouchers, notes)
 */

import { ROUTES } from '@/constants/routes';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Alert, ScrollView, View } from 'react-native';
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
import { useCart } from '@/hooks/api/cart/useCart';
import { useCheckoutPreview } from '@/hooks/api/checkout/useCheckoutPreview';
import { useRecommendPlatformVouchers } from '@/hooks/api/checkout/useRecommendPlatformVouchers';
import { useUserAddresses } from '@/hooks/api/useUserAddresses';
import { useDebounce } from '@/hooks/useDebounce';
import {
    useCanPlaceOrder,
    useCheckoutCalculation,
    useCheckoutShops,
    useCheckoutStore,
    useOrderBlockReasons,
    usePreviewWarnings,
} from '@/store/useCheckoutStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { PaymentMethodType } from '@/types/checkout';
import type { CheckoutPreviewRequest } from '@/types/checkout/checkoutPreview';
import type { RecommendPlatformVoucherRequest } from '@/types/checkout/platformVoucherRecommendation';
import { logger } from '@/utils/logger';

// ============================================
// SCREEN COMPONENT
// ============================================

export default function CheckoutScreen() {
    const { theme } = useUnistyles();
    const styles = stylesheet;
    const router = useRouter();

    // ========================================
    // API Hooks
    // ========================================
    const { mutate: callPreview } = useCheckoutPreview();
    const { data: cartData } = useCart();
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
    const selectedPlatformVoucher = useCheckoutStore((s) => s.selectedPlatformVoucher);
    const selectedItemIds = useCheckoutStore((s) => s.selectedItemIds);
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
    const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
    const setSubmitting = useCheckoutStore((s) => s.setSubmitting);
    const setPreviewData = useCheckoutStore((s) => s.setPreviewData);
    const setLoadingPreview = useCheckoutStore((s) => s.setLoadingPreview);

    // ========================================
    // BUILD PREVIEW REQUEST
    // ========================================
    const buildPreviewRequest = useCallback((): CheckoutPreviewRequest | null => {
        // Cần cart data để lấy shop info
        if (!cartData?.shops?.length) return null;

        // Cần selected items từ store
        if (selectedItemIds.size === 0) return null;
        const currentAddressId = selectedAddressId;

        // Filter shops có items được chọn
        const shopsWithSelection = cartData.shops
            .map((shop) => ({
                ...shop,
                items: shop.items.filter((item) => selectedItemIds.has(item.id)),
            }))
            .filter((shop) => shop.items.length > 0);

        if (shopsWithSelection.length === 0) return null;

        const request: CheckoutPreviewRequest = {
            addressId: currentAddressId || undefined,
            globalVouchers: [],
            shops: shopsWithSelection.map((shop) => {
                const voucherCode = selectedShopVouchers.get(shop.shopId);
                const userShippingCode = selectedShipping.get(shop.shopId);

                let shippingFee = 0;
                if (userShippingCode) {
                    const shopUI = shops.find((s) => s.shopId === shop.shopId);
                    const method = shopUI?.shippingOptions.methods.find(m => m.id === userShippingCode);
                    shippingFee = method?.fee || 0;
                }

                return {
                    shopId: shop.shopId,
                    itemIds: shop.items.map((item) => item.id),
                    vouchers: voucherCode ? [voucherCode] : [],
                    globalVouchers: selectedPlatformVoucher ? [selectedPlatformVoucher] : [],
                    shippingMethodCode: userShippingCode || undefined,
                    shippingFee: shippingFee,
                };
            }),
            allSelectedItemIds: [...selectedItemIds],
        };

        return request;
    }, [
        cartData,
        selectedItemIds,
        selectedShipping,
        selectedShopVouchers,
        selectedPlatformVoucher,
        selectedAddressId,
        previewData?.addressId,
        shops,
        paymentMethod,
    ]);

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

        // Serialize request để compare - SKIP nếu giống hệt
        const requestKey = JSON.stringify(debouncedRequest);
        if (lastRequestKey.current === requestKey) {
            return;
        }
        lastRequestKey.current = requestKey;

        doFetchPreview(debouncedRequest);
    }, [debouncedRequest, doFetchPreview]);

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
        router.push(`${ROUTES.ADDRESS.LIST}?${params.toString()}` as never);
    }, [router, deliveryAddress?.id]);

    const handlePlatformVoucherSelect = useCallback(
        (voucherId: string | null) => {
            applyPlatformVoucher(voucherId);
        },
        [applyPlatformVoucher]
    );

    const handlePaymentMethodSelect = useCallback(
        (method: PaymentMethodType) => {
            setPaymentMethod(method);
        },
        [setPaymentMethod]
    );

    const handlePlaceOrder = useCallback(async () => {
        if (!canPlaceOrder) return;

        setSubmitting(true);

        try {
            // TODO: Call actual create order API
            await new Promise((resolve) => setTimeout(resolve, 2000));

            Alert.alert(
                'Đặt hàng thành công!',
                `Đơn hàng của bạn đang được xử lý.\nTổng thanh toán: ${new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(calculation.totalAmount)}`,
                [
                    {
                        text: 'Xem đơn hàng',
                        onPress: () => {
                            resetSession();
                            router.back();
                        },
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Lỗi', 'Đặt hàng thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    }, [canPlaceOrder, calculation.totalAmount, resetSession, router, setSubmitting]);

    const handleBack = useCallback(() => {
        Alert.alert('Hủy thanh toán?', 'Thông tin thanh toán sẽ không được lưu.', [
            { text: 'Ở lại', style: 'cancel' },
            {
                text: 'Hủy',
                style: 'destructive',
                onPress: () => {
                    resetSession();
                    router.back();
                },
            },
        ]);
    }, [resetSession, router]);

    // ========================================
    // DERIVED STATE
    // ========================================

    // ========================================
    // PLATFORM VOUCHER RECOMMENDATIONS
    // ========================================
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
                    selectedVoucherId={selectedPlatformVoucher}
                    discountAmount={calculation.platformVoucherDiscount}
                    isInvalid={!isPlatformVoucherValid}
                    warningMessage={platformVoucherWarning}
                    onSelect={handlePlatformVoucherSelect}
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
