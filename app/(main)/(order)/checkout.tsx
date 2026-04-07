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
import { Navigator } from '@/utils/navigation';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
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
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useShallow } from 'zustand/react/shallow';

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
import { useRecommendPlatformVouchers } from '@/hooks/api/checkout/useRecommendPlatformVouchers';
import { useCheckoutNotifications } from '@/hooks/checkout/useCheckoutNotifications';
import { useCheckoutPreviewOrchestrator } from '@/hooks/checkout/useCheckoutPreviewOrchestrator';
import { useCreateOrderFlow } from '@/hooks/checkout/useCreateOrderFlow';
import {
    useCanPlaceOrder,
    useCheckoutCalculation,
    useCheckoutShops,
    useCheckoutStore,
    useOrderBlockReasons,
    usePreviewWarnings,
} from '@/store/useCheckoutStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import { type PaymentMethodType } from '@/types/checkout';
import type { RecommendPlatformVoucherRequest } from '@/types/checkout/platformVoucherRecommendation';

// ============================================
// SCREEN COMPONENT
// ============================================

const INTERNATIONAL_SHIPPING_UNAVAILABLE_ERROR_CODE = 13100;

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

    // ========================================
    // Preview Orchestrator (build → debounce → dedup → fetch → postSync)
    // ========================================
    const { previewError, effectivePlatformLoyaltyEnabled, refreshPreview } = useCheckoutPreviewOrchestrator({
        isBuyNowMode: !!isBuyNowMode,
        quantity,
        variantId,
    });

    // ========================================
    // Store state & selectors
    // ========================================


    // Address from Global Store
    const { selectedAddressId, addresses: allAddresses } = useUserAddressStore(
        useShallow((s) => ({
            selectedAddressId: s.selectedAddressId,
            addresses: s.addresses,
        }))
    );

    // Delivery address for UI display
    const deliveryAddress = useMemo(() => {
        return allAddresses.find((addr) => addr.id === selectedAddressId) || null;
    }, [allAddresses, selectedAddressId]);

    // Store state & actions
    const {
        isInitialized,
        previewData,
        paymentMethod,
        selectedShipping,
        selectedPlatformDiscountVoucher,
        selectedPlatformShippingVoucher,
        isLoadingPreview,
        resetSession,
        initSession,
        applyBulkPlatformVouchers,
        setPlatformLoyaltyEnabled,
        setPaymentMethod,
    } = useCheckoutStore(useShallow((s) => ({
        isInitialized: s.isInitialized,
        previewData: s.previewData,
        paymentMethod: s.paymentMethod,
        selectedShipping: s.selectedShipping,
        selectedPlatformDiscountVoucher: s.selectedPlatformDiscountVoucher,
        selectedPlatformShippingVoucher: s.selectedPlatformShippingVoucher,
        isLoadingPreview: s.isLoadingPreview,
        resetSession: s.resetSession,
        initSession: s.initSession,
        applyBulkPlatformVouchers: s.applyBulkPlatformVouchers,
        setPlatformLoyaltyEnabled: s.setPlatformLoyaltyEnabled,
        setPaymentMethod: s.setPaymentMethod,
    })));

    // ========================================
    // Animation state
    // ========================================
    const shimmerValue = useSharedValue(0.3);
    const contentOpacity = useSharedValue(0);

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

    const { platformVoucherWarning, isPlatformVoucherValid } = useCheckoutNotifications({
        shops,
        calculation,
        warnings,
        selectedPlatformDiscountVoucher,
        selectedPlatformShippingVoucher,
        isInitialized,
        previewData,
        isLoadingPreview,
        canPlaceOrder
    });



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

    // ========================================
    // Create Order Flow
    // ========================================
    const { handlePlaceOrder, isPlacingOrder } = useCreateOrderFlow({
        isBuyNowMode: !!isBuyNowMode,
        quantity,
        variantId,
        effectivePlatformLoyaltyEnabled: !!effectivePlatformLoyaltyEnabled,
        refreshPreview,
    });

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
        const currentShippingCode = firstShop?.shippingOptions.selectedMethodId;
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
    }, [isInitialized, previewData, deliveryAddress]);

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
        refreshPreview();
    }, [refreshPreview]);

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
