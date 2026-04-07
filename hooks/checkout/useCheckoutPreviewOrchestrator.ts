/**
 * useCheckoutPreviewOrchestrator
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

import { useCheckoutPreview } from '@/hooks/api/checkout/useCheckoutPreview';
import { useDebounce } from '@/hooks/useDebounce';
import { ApiError } from '@/services/api/client';
import { useCheckoutStore } from '@/store/useCheckoutStore';
import { useUserAddressStore } from '@/store/useUserAddressStore';
import type { CheckoutPreviewRequest, CheckoutPreviewShopRequest } from '@/types/checkout/checkoutPreview';
import { CheckoutPreviewUI } from '@/utils/adapter/checkoutPreviewAdapter';
import { buildCheckoutPreviewRequest } from '@/utils/checkoutRequestBuilder';
import { logger } from '@/utils/logger';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────

interface UseCheckoutPreviewOrchestratorOptions {
    isBuyNowMode: boolean;
    quantity?: string;
    variantId?: string;
}

interface UseCheckoutPreviewOrchestratorReturn {
    /** Error from the latest preview call (null = healthy). */
    previewError: ApiError | Error | null;
    /** Computed value: is platform loyalty effectively enabled? */
    effectivePlatformLoyaltyEnabled: boolean;
    /** Force-refresh preview (bypasses dedup). Optional toast on success. */
    refreshPreview: (showToastOnSuccess?: boolean) => void;
}

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────

/** Strip volatile `shippingFee` before JSON-serialising for dedup key. */
function toRequestKey(req: CheckoutPreviewRequest): string {
    return JSON.stringify({
        ...req,
        shops: req.shops.map((s: CheckoutPreviewShopRequest) => ({
            ...s,
            shippingFee: undefined,
        })),
    });
}

// ────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────

export function useCheckoutPreviewOrchestrator(
    options: UseCheckoutPreviewOrchestratorOptions,
): UseCheckoutPreviewOrchestratorReturn {
    const { isBuyNowMode, quantity, variantId } = options;
    const { t } = useTranslation('checkout');

    // ── API mutation ──
    const { mutate: callPreview } = useCheckoutPreview();

    // ── Store: reactive selectors (only what preview needs) ──
    const isInitialized = useCheckoutStore((s) => s.isInitialized);
    const selectedItemIds = useCheckoutStore((s) => s.selectedItemIds);
    const checkoutShops = useCheckoutStore((s) => s.checkoutShops);
    const selectedShipping = useCheckoutStore((s) => s.selectedShipping);
    const selectedShopVouchers = useCheckoutStore((s) => s.selectedShopVouchers);
    const selectedPlatformDiscountVoucher = useCheckoutStore((s) => s.selectedPlatformDiscountVoucher);
    const selectedPlatformShippingVoucher = useCheckoutStore((s) => s.selectedPlatformShippingVoucher);
    const selectedLoyaltyRedemptions = useCheckoutStore((s) => s.selectedLoyaltyRedemptions);
    const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
    const platformLoyaltyEnabled = useCheckoutStore((s) => s.platformLoyaltyEnabled);
    const previewData = useCheckoutStore((s) => s.previewData);

    // ── Store: actions ──
    const setPreviewData = useCheckoutStore((s) => s.setPreviewData);
    const setLoadingPreview = useCheckoutStore((s) => s.setLoadingPreview);

    // ── Address from global store ──
    const selectedAddressId = useUserAddressStore((s) => s.selectedAddressId);

    // ── Derived state ──
    const effectivePlatformLoyaltyEnabled = useMemo(() => {
        if (platformLoyaltyEnabled !== null) return platformLoyaltyEnabled;
        return (previewData?.platformLoyalty?.totalPointsToRedeem ?? 0) > 0;
    }, [platformLoyaltyEnabled, previewData?.platformLoyalty?.totalPointsToRedeem]);

    // ── Local state ──
    const [previewError, setPreviewError] = useState<ApiError | Error | null>(null);

    // ── Refs (break reactive chains / stabilise callbacks) ──
    const lastRequestKey = useRef<string | null>(null);
    const pendingRefreshToastRef = useRef(false);
    const callPreviewRef = useRef(callPreview);
    callPreviewRef.current = callPreview;

    // ── Build request (pure, delegates to utility) ──
    const buildPreviewRequest = useCallback(
        (): CheckoutPreviewRequest | null => {
            return buildCheckoutPreviewRequest({
                selectedItemIds,
                checkoutShops,
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
                effectivePlatformLoyaltyEnabled: !!effectivePlatformLoyaltyEnabled,
                previewData: useCheckoutStore.getState().previewData,
            });
        },
        [
            checkoutShops, selectedItemIds, selectedShipping, selectedShopVouchers,
            selectedPlatformDiscountVoucher, selectedPlatformShippingVoucher,
            selectedLoyaltyRedemptions, selectedAddressId, paymentMethod,
            isBuyNowMode, quantity, variantId, effectivePlatformLoyaltyEnabled,
        ],
    );

    // Ref for postSync inside onSuccess
    const buildPreviewRequestRef = useRef(buildPreviewRequest);
    buildPreviewRequestRef.current = buildPreviewRequest;

    // ── Fetch preview ──
    const doFetchPreview = useCallback(
        (request: CheckoutPreviewRequest) => {
            setPreviewError(null);
            setLoadingPreview(true);
            callPreviewRef.current(request, {
                onSuccess: (data: CheckoutPreviewUI) => {
                    setPreviewData({
                        ...data,
                        paymentMethod: request.paymentMethod,
                    });
                    setLoadingPreview(false);
                    setPreviewError(null);

                    const postSyncRequest = buildPreviewRequestRef.current();
                    if (postSyncRequest) {
                        lastRequestKey.current = toRequestKey(postSyncRequest);
                    }

                    if (pendingRefreshToastRef.current) {
                        pendingRefreshToastRef.current = false;
                        Toast.show({
                            type: 'success',
                            text1: t('status.checkoutRefreshedTitle'),
                            text2: t('status.checkoutRefreshedMessage'),
                            position: 'top',
                            visibilityTime: 4200,
                        });
                    }
                },
                onError: (error: ApiError | Error) => {
                    pendingRefreshToastRef.current = false;
                    setPreviewData(null);
                    setLoadingPreview(false);
                    setPreviewError(error);
                    logger.checkout.error('Preview failed', { error: error.message });
                },
            });
        },
        [setPreviewData, setLoadingPreview, t],
    );

    // ── Debounced reactive trigger ──
    const currentRequest = useMemo(() => {
        if (!isInitialized) return null;
        return buildPreviewRequest();
    }, [isInitialized, buildPreviewRequest]);

    const debouncedRequest = useDebounce(currentRequest, 300);

    useEffect(() => {
        if (!debouncedRequest) return;

        const requestKey = toRequestKey(debouncedRequest);
        if (lastRequestKey.current === requestKey) return;

        lastRequestKey.current = requestKey;
        doFetchPreview(debouncedRequest);
    }, [debouncedRequest, doFetchPreview]);

    // ── Public: force-refresh (bypass dedup) ──
    const refreshPreview = useCallback(
        (showToastOnSuccess = false) => {
            const request = buildPreviewRequest();
            if (!request) return;

            if (showToastOnSuccess) {
                pendingRefreshToastRef.current = true;
            }
            lastRequestKey.current = null;
            doFetchPreview(request);
        },
        [buildPreviewRequest, doFetchPreview],
    );

    return {
        previewError,
        effectivePlatformLoyaltyEnabled,
        refreshPreview,
    };
}
