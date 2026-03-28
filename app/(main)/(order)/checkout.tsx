/**
 * Checkout Screen
 * ARCHITECTURE:
 * - Server data: previewData (shops, calculation, validation)
 * - User selections: store Maps (shipping, vouchers, notes)
 */

import { createRouteErrorBoundary } from '@/components/common/AppCrashFallback';
import { ROUTES } from '@/constants/routes';
import { useNavigationUnlockOnFocus } from '@/hooks/useNavigationUnlockOnFocus';
import { ApiError } from '@/services/api/client';
import { Alert } from '@/utils/AlertHelper';
import { Navigator } from '@/utils/navigation';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
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
    PlatformLoyaltyRow,
    PlatformVoucherSelector,
} from '@/components/checkout';
import { SkeletonBox } from '@/components/ui/feedback/Skeleton';
import { StateView } from '@/components/ui/feedback/StateView';

// Store & Hooks
import { CART_QUERY_KEY } from '@/hooks/api/cart/useCart';
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
import { toCheckoutApiPaymentMethod, type CheckoutShopUI, type PaymentMethodType, type ShippingMethod } from '@/types/checkout';
import type { CheckoutPreviewRequest, CheckoutPreviewShopRequest } from '@/types/checkout/checkoutPreview';
import type { CreateOrderRequest } from '@/types/checkout/order';
import type { RecommendPlatformVoucherRequest } from '@/types/checkout/platformVoucherRecommendation';
import { CheckoutPreviewUI } from '@/utils/adapter/checkoutPreviewAdapter';
import { logger } from '@/utils/logger';
import { getFriendlyVoucherReason } from '@/utils/voucherReason';

// ============================================
// SCREEN COMPONENT
// ============================================

const INTERNATIONAL_SHIPPING_UNAVAILABLE_ERROR_CODE = 13100;
const CHECKOUT_EXPIRED_ERROR_CODE = 110113;

export const ErrorBoundary = createRouteErrorBoundary({
    scope: 'screen',
    titleKey: 'common:crash.checkout.title',
    messageKey: 'common:crash.checkout.message',
});

export default function CheckoutScreen() {
    // Unlock navigation when screen gains focus
    useNavigationUnlockOnFocus();

    const { t } = useTranslation('checkout');

    const { theme } = useUnistyles();
    const styles = stylesheet;

    // ========================================
    // ROUTE PARAMS - Buy Now mode detection
    // ========================================
    const { mode, variantId, quantity, shopId } = useLocalSearchParams<{
        mode?: 'buy-now';
        variantId?: string;
        quantity?: string;
        shopId?: string;
    }>();
    const isBuyNowMode = mode === 'buy-now' && !!variantId && !!shopId;

    // ========================================
    // API Hooks
    // ========================================
    const queryClient = useQueryClient();
    const { mutate: callPreview } = useCheckoutPreview();
    const { mutateAsync: placeOrder } = useCreateOrder();

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
    const platformLoyaltyEnabled = useCheckoutStore((s) => s.platformLoyaltyEnabled);
    const selectedLoyaltyRedemptions = useCheckoutStore((s) => s.selectedLoyaltyRedemptions);
    const selectedItemIds = useCheckoutStore((s) => s.selectedItemIds);
    const checkoutShops = useCheckoutStore((s) => s.checkoutShops);
    const isLoadingPreview = useCheckoutStore((s) => s.isLoadingPreview);

    // ========================================
    // Animation state
    // ========================================
    const shimmerValue = useSharedValue(0.3);
    const contentOpacity = useSharedValue(0);
    const [previewError, setPreviewError] = useState<ApiError | Error | null>(null);

    useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 800 }),
            -1,
            true
        );
    }, [shimmerValue]);

    const shimmerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: shimmerValue.value,
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    useEffect(() => {
        if (isInitialized && previewData) {
            contentOpacity.value = withTiming(1, { duration: 400 });
        } else {
            contentOpacity.value = 0;
        }
    }, [isInitialized, previewData, contentOpacity]);

    // Computed selectors from store
    const shops = useCheckoutShops();
    const calculationData = useCheckoutCalculation();
    const canPlaceOrder = useCanPlaceOrder();
    const orderBlockReasons = useOrderBlockReasons();
    const warnings = usePreviewWarnings();
    const effectivePlatformLoyaltyEnabled = useMemo(() => {
        if (platformLoyaltyEnabled !== null) return platformLoyaltyEnabled;
        return (previewData?.platformLoyalty?.totalPointsToRedeem ?? 0) > 0;
    }, [platformLoyaltyEnabled, previewData?.platformLoyalty?.totalPointsToRedeem]);

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
        loyaltyDiscount: 0,
        platformLoyaltyDiscount: 0,
    }, [calculationData]);

    const platformVoucherWarning = useMemo(() => {
        if (selectedPlatformDiscountVoucher || selectedPlatformShippingVoucher) {
            for (const shop of shops) {
                const invalidSelected = shop.availableVouchers.find(
                    (v) => !v.isApplicable &&
                        (v.code === selectedPlatformDiscountVoucher || v.code === selectedPlatformShippingVoucher)
                );
                const invalidSelectedReason = getFriendlyVoucherReason(
                    invalidSelected?.reason ?? invalidSelected?.description,
                    t
                );
                if (invalidSelectedReason) {
                    return invalidSelectedReason;
                }
            }
        }

        if (calculation.platformVoucherValidation && !calculation.platformVoucherValidation.isValid) {
            return getFriendlyVoucherReason(
                calculation.platformVoucherValidation.invalidReason,
                t
            ) ?? t('voucher.reasons.genericInvalid');
        }

        const voucherWarning = warnings.find(
            (w) => w.toLowerCase().includes('voucher') || w.toLowerCase().includes('mã giảm')
        );
        return getFriendlyVoucherReason(voucherWarning, t) ?? null;
    }, [warnings, calculation.platformVoucherValidation, shops, selectedPlatformDiscountVoucher, selectedPlatformShippingVoucher, t]);

    const isPlatformVoucherValid = platformVoucherWarning === null;

    // Toast error when platform voucher becomes invalid
    const lastToastRef = useRef<string | null>(null);
    useEffect(() => {
        if (platformVoucherWarning) {
            if (lastToastRef.current !== platformVoucherWarning) {
                Toast.show({
                    type: 'error',
                    text1: t('voucher.platformTitle'),
                    text2: platformVoucherWarning,
                    position: 'bottom',
                    visibilityTime: 4000,
                });
                lastToastRef.current = platformVoucherWarning;
            }
        } else {
            lastToastRef.current = null;
        }
    }, [platformVoucherWarning, t]);

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
    const setPlatformLoyaltyEnabled = useCheckoutStore((s) => s.setPlatformLoyaltyEnabled);
    const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
    const setPreviewData = useCheckoutStore((s) => s.setPreviewData);
    const setLoadingPreview = useCheckoutStore((s) => s.setLoadingPreview);

    // ========================================
    // BUY NOW MODE PROCESSING
    // ========================================
    useEffect(() => {
        if (!isBuyNowMode) return;
        if (isInitialized) return;

        const parsedQuantity = parseInt(quantity || '1', 10) || 1;

        // Khởi tạo session rỗng item để Checkout UI fetch Preview ngay lập tức
        initSession([variantId], [{
            shopId: shopId!,
            items: [{
                itemId: variantId, // Fake id to run preview
                quantity: parsedQuantity,
            }],
        }]);

    }, [isBuyNowMode, variantId, quantity, shopId, isInitialized, initSession]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            resetSession();
        };
    }, [resetSession]);

    // ========================================
    // BUILD PREVIEW REQUEST
    // ========================================
    const getPlatformLoyaltyPointsForShop = useCallback((shopId: string) => {
        if (!effectivePlatformLoyaltyEnabled) return undefined;

        const currentPlatformLoyalty = useCheckoutStore.getState().previewData?.platformLoyalty;
        const allocation = currentPlatformLoyalty?.allocations.find((item) => item.shopId === shopId);
        if (!allocation) return undefined;

        const points = allocation.pointsToRedeem > 0
            ? allocation.pointsToRedeem
            : allocation.maxPointsForShop;

        return points > 0 ? points : undefined;
    }, [effectivePlatformLoyaltyEnabled]);

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

                // Lấy server default ID (với Fallback nếu user chưa chọn)
                const currentPreviewOption = useCheckoutStore.getState().previewData?.shops.find(
                    (s: CheckoutShopUI) => s.shopId === shop.shopId
                )?.shippingOptions.selectedMethodId;

                const finalShippingCode = userShippingCode || currentPreviewOption;

                return {
                    shopId: shop.shopId,
                    items: isBuyNowMode ? undefined : shop.items,
                    vouchers: (!isBuyNowMode && voucherCode) ? [voucherCode] : undefined,
                    // Use distributed global vouchers inside each shop
                    globalVouchers: (!isBuyNowMode && globalVouchersArray.length > 0) ? globalVouchersArray : undefined,
                    serviceCode: isBuyNowMode ? undefined : (finalShippingCode ? Number(finalShippingCode) : undefined),
                    shippingFee: (function () {
                        const previewShop = useCheckoutStore.getState().previewData?.shops.find(
                            (s: CheckoutShopUI) => s.shopId === shop.shopId
                        );
                        if (!previewShop || !finalShippingCode) return undefined;
                        return previewShop.shippingOptions.methods.find((m: ShippingMethod) => m.id === finalShippingCode)?.fee;
                    })(),
                    loyaltyPoints: isBuyNowMode ? undefined : (selectedLoyaltyRedemptions.get(shop.shopId) || undefined),
                    platformLoyaltyPoints: isBuyNowMode ? undefined : getPlatformLoyaltyPointsForShop(shop.shopId),
                };
            }),
            paymentMethod: toCheckoutApiPaymentMethod(paymentMethod),
            buyNow: isBuyNowMode ? true : undefined,
            directItem: isBuyNowMode ? {
                variantId: variantId!,
                quantity: parseInt(quantity || '1', 10),
                options: {
                    loyaltyPoints: Array.from(selectedLoyaltyRedemptions.values())[0] || undefined,
                    platformLoyaltyPoints: (function () {
                        const shop = checkoutShops[0];
                        if (!shop) return undefined;
                        return getPlatformLoyaltyPointsForShop(shop.shopId);
                    })(),
                    serviceCode: (function () {
                        const shop = checkoutShops[0];
                        if (!shop) return undefined;
                        const userShippingCode = selectedShipping.get(shop.shopId);
                        const currentPreviewOption = useCheckoutStore.getState().previewData?.shops.find(
                            (s: CheckoutShopUI) => s.shopId === shop.shopId
                        )?.shippingOptions.selectedMethodId;
                        const finalCode = userShippingCode || currentPreviewOption;
                        return finalCode ? Number(finalCode) : undefined;
                    })(),
                    shippingFee: (function () {
                        const shop = checkoutShops[0];
                        const previewShop = useCheckoutStore.getState().previewData?.shops.find(
                            (s: CheckoutShopUI) => s.shopId === shop?.shopId
                        );
                        if (!shop || !previewShop) return undefined;
                        const userShippingCode = selectedShipping.get(shop.shopId);
                        const finalCode = userShippingCode || previewShop.shippingOptions.selectedMethodId;
                        return previewShop.shippingOptions.methods.find((m: ShippingMethod) => m.id === finalCode)?.fee;
                    })()
                }
            } : undefined,
            // For Buy Now flow, also populate root fields for vouchers
            allDiscountCodes: isBuyNowMode ? [
                ...globalVouchersArray,
                ...Array.from(selectedShopVouchers.values())
            ] : undefined,
        };

        return request;
    }, [
        checkoutShops,
        selectedItemIds,
        selectedShipping,
        selectedShopVouchers,
        selectedPlatformDiscountVoucher,
        selectedPlatformShippingVoucher,
        selectedLoyaltyRedemptions,
        selectedAddressId,
        paymentMethod,
        isBuyNowMode,
        quantity,
        variantId,
        getPlatformLoyaltyPointsForShop,
    ]);

    /**
     * Check if the current request exactly matches what the server already calculated.
     * This prevents the "double call" when the store syncs vouchers from the first response.
     */
    const isRequestMatchingPreview = useCallback((req: CheckoutPreviewRequest, preview: CheckoutPreviewUI) => {
        const haveSameCodes = (left: string[], right: string[]) => {
            if (left.length !== right.length) return false;
            return left.every((code) => right.includes(code));
        };

        // Check Address
        if (req.shippingAddress?.addressId !== preview.addressId) return false;
        if (req.paymentMethod !== preview.paymentMethod) return false;

        if (req.buyNow) {
            const previewShop = preview.shops[0];
            if (!previewShop) return false;

            const requestedCodes = req.allDiscountCodes ?? [];
            const previewCodes: string[] = [];

            if (previewShop.appliedVoucherId) {
                previewCodes.push(previewShop.appliedVoucherId);
            }
            if (preview.calculation.appliedPlatformVoucherId) {
                previewCodes.push(preview.calculation.appliedPlatformVoucherId);
            }
            if (preview.calculation.appliedShippingVoucherId) {
                previewCodes.push(preview.calculation.appliedShippingVoucherId);
            }

            if (!haveSameCodes(requestedCodes, previewCodes)) return false;

            const reqShipping = req.directItem?.options?.serviceCode;
            const previewShipping = Number(previewShop.shippingOptions.selectedMethodId);
            if (reqShipping && reqShipping !== previewShipping) return false;

            const reqLoyalty = req.directItem?.options?.loyaltyPoints || 0;
            const previewLoyalty = previewShop.loyaltyInfo?.pointsToRedeem || 0;
            if (reqLoyalty !== previewLoyalty) return false;

            const reqPlatformLoyalty = req.directItem?.options?.platformLoyaltyPoints || 0;
            const previewPlatformLoyalty = preview.platformLoyalty?.allocations[0]?.pointsToRedeem || 0;
            if (reqPlatformLoyalty !== previewPlatformLoyalty) return false;

            return true;
        }

        // Standard checkout compares shop-distributed vouchers directly on each shop selection.
        for (const reqShop of req.shops) {
            const previewShop = preview.shops.find((s: CheckoutShopUI) => s.shopId === reqShop.shopId);
            if (!previewShop) return false;

            // Check global vouchers inside each shop
            const reqGlobals = reqShop.globalVouchers || [];
            const previewGlobals: string[] = [];
            if (preview.calculation.appliedPlatformVoucherId) previewGlobals.push(preview.calculation.appliedPlatformVoucherId);
            if (preview.calculation.appliedShippingVoucherId) previewGlobals.push(preview.calculation.appliedShippingVoucherId);

            if (!haveSameCodes(reqGlobals, previewGlobals)) return false;

            // Check applied shop-specific voucher
            const reqVoucher = reqShop.vouchers?.[0] || null;
            const previewVoucher = previewShop.appliedVoucherId;
            if (reqVoucher !== previewVoucher) return false;

            // Check custom shipping selection
            const reqShipping = req.buyNow ? req.directItem?.options?.serviceCode : reqShop.serviceCode;
            const previewShipping = Number(previewShop.shippingOptions.selectedMethodId);
            if (reqShipping && reqShipping !== previewShipping) return false;

            // Check loyalty redemption
            const reqLoyalty = (req.buyNow ? req.directItem?.options?.loyaltyPoints : reqShop.loyaltyPoints) || 0;
            const previewLoyalty = previewShop.loyaltyInfo?.pointsToRedeem || 0;
            if (reqLoyalty !== previewLoyalty) return false;

            const reqPlatformLoyalty = (
                req.buyNow
                    ? req.directItem?.options?.platformLoyaltyPoints
                    : reqShop.platformLoyaltyPoints
            ) || 0;
            const previewPlatformLoyalty = preview.platformLoyalty?.allocations.find(
                (allocation) => allocation.shopId === reqShop.shopId
            )?.pointsToRedeem || 0;
            if (reqPlatformLoyalty !== previewPlatformLoyalty) return false;
        }

        return true;
    }, []);

    // ========================================
    // CALL PREVIEW API
    // ========================================

    // Track last fetched request to avoid duplicates
    const lastRequestKey = useRef<string | null>(null);
    const pendingCheckoutRefreshToastRef = useRef(false);

    // Stable ref cho mutation function
    const callPreviewRef = useRef(callPreview);
    callPreviewRef.current = callPreview;

    const doFetchPreview = useCallback(
        (request: CheckoutPreviewRequest) => {
            setPreviewError(null);
            setLoadingPreview(true);
            callPreviewRef.current(request, {
                onSuccess: (data) => {
                    setPreviewData({
                        ...data,
                        paymentMethod: request.paymentMethod,
                    });
                    setLoadingPreview(false);
                    setPreviewError(null);

                    if (pendingCheckoutRefreshToastRef.current) {
                        pendingCheckoutRefreshToastRef.current = false;
                        Toast.show({
                            type: 'success',
                            text1: t('status.checkoutRefreshedTitle'),
                            text2: t('status.checkoutRefreshedMessage'),
                            position: 'top',
                            visibilityTime: 4200,
                        });
                    }
                },
                onError: (error) => {
                    pendingCheckoutRefreshToastRef.current = false;
                    setPreviewData(null);
                    setLoadingPreview(false);
                    setPreviewError(error);
                    logger.checkout.error('Preview failed', { error: error.message });
                },
            });
        },
        [setPreviewData, setLoadingPreview, t]
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

    const handlePlatformLoyaltyToggle = useCallback(
        (enabled: boolean) => {
            setPlatformLoyaltyEnabled(enabled);
        },
        [setPlatformLoyaltyEnabled]
    );

    const handlePlaceOrder = useCallback(async () => {
        if (!canPlaceOrder || !previewData) return;

        showGlobalLoading();

        try {
            const store = useCheckoutStore.getState();
            const globalVouchersArray: string[] = [];
            if (selectedPlatformDiscountVoucher) globalVouchersArray.push(selectedPlatformDiscountVoucher);
            if (selectedPlatformShippingVoucher) globalVouchersArray.push(selectedPlatformShippingVoucher);
            const buyNowPreviewShop = isBuyNowMode ? previewData.shops[0] : null;
            const buyNowSelectedShippingCode = (() => {
                if (!isBuyNowMode || !buyNowPreviewShop) return undefined;
                const userShippingCode = store.selectedShipping.get(buyNowPreviewShop.shopId);
                const finalShippingCode = userShippingCode || buyNowPreviewShop.shippingOptions.selectedMethodId;
                return finalShippingCode ? Number(finalShippingCode) : undefined;
            })();
            const buyNowSelectedShippingFee = (() => {
                if (!isBuyNowMode || !buyNowPreviewShop) return undefined;
                const selectedMethod = buyNowPreviewShop.shippingOptions.methods.find(
                    (method) => Number(method.id) === buyNowSelectedShippingCode
                );
                return selectedMethod?.fee ?? previewData.calculation.totalShippingFee ?? undefined;
            })();
            const buyNowDirectItemOptions = (() => {
                if (!isBuyNowMode || !buyNowPreviewShop) return undefined;

                const appliedGlobalVouchers: string[] = [];
                if (previewData.calculation.appliedPlatformVoucherId) {
                    appliedGlobalVouchers.push(previewData.calculation.appliedPlatformVoucherId);
                }
                if (previewData.calculation.appliedShippingVoucherId) {
                    appliedGlobalVouchers.push(previewData.calculation.appliedShippingVoucherId);
                }

                const options = {
                    vouchers: buyNowPreviewShop.appliedVoucherId ? [buyNowPreviewShop.appliedVoucherId] : undefined,
                    globalVouchers: appliedGlobalVouchers.length > 0 ? appliedGlobalVouchers : undefined,
                    loyaltyPoints: buyNowPreviewShop.loyaltyPoints || undefined,
                    platformLoyaltyPoints: getPlatformLoyaltyPointsForShop(buyNowPreviewShop.shopId),
                    serviceCode: buyNowSelectedShippingCode,
                };

                return Object.values(options).some((value) => Array.isArray(value) ? value.length > 0 : value != null)
                    ? options
                    : undefined;
            })();
            const buyNowShopSelection = (() => {
                if (!isBuyNowMode || !buyNowPreviewShop || buyNowSelectedShippingFee == null) return [];

                return [{
                    shopId: buyNowPreviewShop.shopId,
                    items: buyNowPreviewShop.items.map((item) => ({
                        itemId: item.id,
                        expectedUnitPrice: item.unitPrice,
                        quantity: item.quantity,
                        promotionId: item.promotionId || undefined,
                    })),
                    vouchers: buyNowDirectItemOptions?.vouchers,
                    globalVouchers: buyNowDirectItemOptions?.globalVouchers,
                    loyaltyPoints: buyNowDirectItemOptions?.loyaltyPoints,
                    platformLoyaltyPoints: buyNowDirectItemOptions?.platformLoyaltyPoints,
                    shippingFee: buyNowSelectedShippingFee,
                    serviceCode: buyNowDirectItemOptions?.serviceCode ?? buyNowSelectedShippingCode,
                }];
            })();

            const request: CreateOrderRequest = {
                shops: isBuyNowMode ? buyNowShopSelection : previewData.shops.map(shop => {
                    const shopVouchers: string[] = [];
                    if (shop.appliedVoucherId) shopVouchers.push(shop.appliedVoucherId);

                    const userShippingCode = store.selectedShipping.get(shop.shopId);
                    const finalShippingCode = userShippingCode || shop.shippingOptions.selectedMethodId;

                    return {
                        shopId: shop.shopId,
                        items: shop.items.map(item => ({
                            itemId: item.id,
                            expectedUnitPrice: item.unitPrice,
                            quantity: item.quantity,
                            promotionId: item.promotionId || undefined,
                        })),
                        vouchers: (!isBuyNowMode && shopVouchers.length > 0) ? shopVouchers : undefined,
                        serviceCode: isBuyNowMode ? undefined : (Number(finalShippingCode) || undefined),
                        shippingFee: shop.shippingOptions.methods.find((m: ShippingMethod) => m.id === finalShippingCode)?.fee,
                        globalVouchers: (!isBuyNowMode && globalVouchersArray.length > 0) ? globalVouchersArray : undefined,
                        loyaltyPoints: isBuyNowMode ? undefined : (shop.loyaltyPoints || undefined),
                        platformLoyaltyPoints: isBuyNowMode ? undefined : getPlatformLoyaltyPointsForShop(shop.shopId),
                    };
                }),
                buyerAddressData: {
                    buyerAddressId: previewData.addressId,
                },
                paymentMethod: toCheckoutApiPaymentMethod(paymentMethod),
                customerNote: Array.from(store.shopNotes.values()).filter(Boolean).join('; ') || undefined,
                previewId: previewData.cartId,
                previewChecksum: previewData.previewChecksum,
                previewAt: previewData.previewAt,
                buyNow: isBuyNowMode ? true : undefined,
                directItem: isBuyNowMode ? {
                    variantId: variantId!,
                    quantity: parseInt(quantity || '1', 10),
                    options: buyNowDirectItemOptions,
                } : undefined,
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

            if (
                error instanceof ApiError &&
                error.code === CHECKOUT_EXPIRED_ERROR_CODE
            ) {
                logger.checkout.warn('Checkout preview became stale before create order', {
                    status: error.status,
                    code: error.code,
                    message: error.message,
                });

                pendingCheckoutRefreshToastRef.current = true;
                Toast.show({
                    type: 'error',
                    text1: t('status.checkoutRefreshingTitle'),
                    text2: t('status.checkoutRefreshingMessage'),
                    position: 'top',
                    visibilityTime: 4200,
                });

                const refreshRequest = buildPreviewRequest();
                if (refreshRequest) {
                    lastRequestKey.current = null;
                    doFetchPreview(refreshRequest);
                }
                return;
            }

            const message = error instanceof Error ? error.message : t('status.orderFailed');
            logger.checkout.error('Place order failed', { error: message });
            Alert.error(t('status.orderFailed'));
        }
    }, [
        buildPreviewRequest,
        canPlaceOrder,
        doFetchPreview,
        previewData,
        paymentMethod,
        selectedPlatformDiscountVoucher,
        selectedPlatformShippingVoucher,
        placeOrder,
        resetSession,
        queryClient,
        isBuyNowMode,
        quantity,
        variantId,
        t,
        getPlatformLoyaltyPointsForShop,
    ]);


    const handleBack = useCallback(() => {
        Navigator.back();
    }, []);

    // ================================
    // PLATFORM VOUCHER RECOMMENDATIONS
    // ================================
    const recommendationsRequest = useMemo<RecommendPlatformVoucherRequest | null>(() => {
        if (!isInitialized || !previewData) return null;
        if (!previewData.isValid) return null;
        if (previewData.calculation.subtotal <= 0) return null;
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
                    lineTotal: i.finalLinePrice,
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

    const shouldShowPreviewErrorState = isInitialized && !isLoadingPreview && !previewData && !!previewError;
    const shouldShowSkeleton = !isInitialized || (!previewData && !previewError);

    const handleRetryPreview = useCallback(() => {
        const refreshRequest = buildPreviewRequest();
        if (!refreshRequest) return;

        lastRequestKey.current = null;
        doFetchPreview(refreshRequest);
    }, [buildPreviewRequest, doFetchPreview]);

    const previewErrorContent = useMemo(() => {
        if (!previewError) {
            return {
                title: t('error.previewTitle'),
                message: t('error.previewMessage'),
            };
        }

        if (previewError instanceof ApiError && previewError.code === INTERNATIONAL_SHIPPING_UNAVAILABLE_ERROR_CODE) {
            return {
                title: t('error.internationalShippingUnavailableTitle'),
                message: t('error.internationalShippingUnavailableMessage'),
            };
        }

        return {
            title: t('error.previewTitle'),
            message: previewError.message || t('error.previewMessage'),
        };
    }, [previewError, t]);

    return (
        <View style={styles.container}>
            {/* Header - Static shell */}
            <CheckoutHeader title={t('header.title')} onBack={handleBack} />

            <View style={styles.flex1}>
                {shouldShowPreviewErrorState && (
                    <StateView
                        type="error"
                        title={previewErrorContent.title}
                        message={previewErrorContent.message}
                        onRetry={handleRetryPreview}
                        primaryActionLabel={t('error.retryPreview')}
                    />
                )}

                {/* Real Content - Fades in */}
                {isInitialized && previewData && !shouldShowPreviewErrorState && (
                    <Animated.View style={[styles.flex1, contentAnimatedStyle]}>
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Address Card */}
                            <AddressCard address={deliveryAddress} onPress={handleAddressPress} />

                            {/* Shop Groups */}
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

                            {/* Platform Loyalty */}
                            <PlatformLoyaltyRow
                                platformLoyalty={previewData.platformLoyalty}
                                isEnabled={effectivePlatformLoyaltyEnabled}
                                onToggle={handlePlatformLoyaltyToggle}
                            />

                            {/* Payment Method */}
                            <PaymentMethodSection
                                selectedMethod={paymentMethod}
                                onSelect={handlePaymentMethodSelect}
                            />

                            {/* Bill Summary */}
                            <BillSummary calculation={calculation} />

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
                    </Animated.View>
                )}

                {/* Skeleton Overlay - Fades out */}
                {shouldShowSkeleton && (
                    <Animated.View
                        entering={FadeIn}
                        exiting={FadeOut.duration(300)}
                        style={[StyleSheet.absoluteFill, styles.skeletonOverlay]}
                        pointerEvents="none"
                    >
                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <CheckoutSkeleton animatedStyle={shimmerAnimatedStyle} />
                        </ScrollView>

                        {/* Skeleton Footer */}
                        <View style={styles.skeletonFooter}>
                            <View style={styles.skeletonFooterLeft}>
                                <SkeletonBox width={80} height={12} animatedStyle={shimmerAnimatedStyle} />
                                <SkeletonBox width={120} height={20} animatedStyle={shimmerAnimatedStyle} style={styles.mt4} />
                            </View>
                            <SkeletonBox width={120} height={44} borderRadius={theme.radius.m} animatedStyle={shimmerAnimatedStyle} />
                        </View>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const stylesheet = StyleSheet.create((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    flex1: {
        flex: 1,
    },
    skeletonOverlay: {
        backgroundColor: theme.colors.background,
    },
    skeletonFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.margins.md,
        paddingVertical: theme.margins.sm,
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    skeletonFooterLeft: {
        gap: 4,
    },
    mt4: {
        marginTop: 4,
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
