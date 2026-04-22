import { useEffect, useMemo, useRef } from 'react';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { CheckoutShopUI, CheckoutCalculationResult } from '@/types/checkout';
import { CheckoutPreviewUI } from '@/utils/adapter/checkoutPreviewAdapter';
import { getFriendlyVoucherReason } from '@/utils/voucherReason';

interface UseCheckoutNotificationsProps {
    shops: CheckoutShopUI[];
    calculation: CheckoutCalculationResult;
    warnings: string[];
    selectedPlatformDiscountVoucher: string | null;
    selectedPlatformShippingVoucher: string | null;
    isInitialized: boolean;
    previewData: CheckoutPreviewUI | null;
    isLoadingPreview: boolean;
    canPlaceOrder: boolean;
}

export function useCheckoutNotifications({
    shops,
    calculation,
    warnings,
    selectedPlatformDiscountVoucher,
    selectedPlatformShippingVoucher,
    isInitialized,
    previewData,
    isLoadingPreview,
    canPlaceOrder
}: UseCheckoutNotificationsProps) {
    const { t } = useTranslation('checkout');
    const tCheckout = t as TFunction<'checkout'>;

    const platformVoucherWarning = useMemo(() => {
        if (selectedPlatformDiscountVoucher || selectedPlatformShippingVoucher) {
            for (const shop of shops) {
                const invalidSelected = shop.availableVouchers.find(
                    (v) => !v.isApplicable &&
                        (v.code === selectedPlatformDiscountVoucher || v.code === selectedPlatformShippingVoucher)
                );
                const invalidSelectedReason = getFriendlyVoucherReason(
                    invalidSelected?.reason ?? invalidSelected?.description,
                    tCheckout
                );
                if (invalidSelectedReason) {
                    return invalidSelectedReason;
                }
            }
        }

        if (calculation.platformVoucherValidation && !calculation.platformVoucherValidation.isValid) {
            return getFriendlyVoucherReason(
                calculation.platformVoucherValidation.invalidReason,
                tCheckout
            ) ?? t('voucher.reasons.genericInvalid');
        }

        const voucherWarning = warnings.find(
            (w) => w.toLowerCase().includes('voucher') || w.toLowerCase().includes('mã giảm')
        );
        return getFriendlyVoucherReason(voucherWarning, tCheckout) ?? null;
    }, [warnings, calculation.platformVoucherValidation, shops, selectedPlatformDiscountVoucher, selectedPlatformShippingVoucher, t, tCheckout]);

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

    // Show "best voucher applied" toast when data is ready
    const hasShownVoucherToast = useRef(false);
    useEffect(() => {
        const isReady = isInitialized && !!previewData && !isLoadingPreview;

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

    return {
        platformVoucherWarning,
        isPlatformVoucherValid,
    };
}
