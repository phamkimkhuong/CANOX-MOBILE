/**
 * ==============================================
 * INTRO POPUP BANNER HOOK
 * ==============================================
 *
 * Hook để fetch và quản lý Intro Popup Banner.
 * Sử dụng `displayLocation: HOMEPAGE_INTRO` để lấy banner popup.
 * - Tích hợp với PopupFrequency (MMKV sync) để kiểm tra điều kiện hiển thị
 * - Auto-dismiss khi user đã từ chối campaign
 * - Hỗ trợ đa ngôn ngữ (i18n)
 *
 * @example
 * const { shouldShow, banner, dismiss, skipToday } = useIntroPopup();
 *
 * if (shouldShow && banner) {
 *     return <IntroPopupBanner banner={banner} onDismiss={dismiss} />;
 * }
 */

import { API_ROUTES } from '@/constants/apiRoutes';
import { apiClient } from '@/services/api/client';
import type { Banner, BannerUI } from '@/types/banner';
import { toBannerUI } from '@/utils/adapter/bannerAdapter';
import { PopupFrequency } from '@/utils/popupFrequency';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// ============================================
// CONSTANTS
// ============================================

const POPUP_STALE_TIME = 10 * 60 * 1000; // 10 minutes
const POPUP_CACHE_TIME = 30 * 60 * 1000; // 30 minutes

// ============================================
// API FUNCTIONS
// ============================================

interface FetchIntroPopupParams {
    locale: string;
}

/**
 * Fetch intro popup banners from API
 */
async function fetchIntroPopupBanner(
    params: FetchIntroPopupParams
): Promise<Banner[]> {
    const response = await apiClient.get<{ data: Banner[] }>(
        API_ROUTES.BANNERS.ACTIVE,
        {
            params: {
                displayLocation: 'HOMEPAGE_INTRO',
                device: 'MOBILE',
                locale: params.locale,
            },
        }
    );

    return response.data.data || [];
}

// ============================================
// HOOK OPTIONS
// ============================================

export interface UseIntroPopupOptions {
    /** Có phải đến từ deep link không */
    isDeepLink?: boolean;
    /** Cho phép fetch data (default: true) */
    enabled?: boolean;
}

// ============================================
// HOOK RETURN TYPE
// ============================================

export interface UseIntroPopupResult {
    /** Có nên hiển thị popup không (sau khi check tất cả điều kiện) */
    shouldShow: boolean;
    /** Banner data đã transform cho UI */
    banner: BannerUI | null;
    /** Raw banner data (có thêm campaignId etc) */
    rawBanner: Banner | null;
    isLoading: boolean;
    /** Đóng popup và ghi nhận đã xem */
    dismiss: () => void;
    /** Đóng popup và đánh dấu "Không hiện lại hôm nay" */
    skipToday: () => void;
    /** Đóng popup và dismiss campaign này vĩnh viễn */
    dismissCampaign: () => void;
    /** Force refresh data */
    refetch: () => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Hook để quản lý Intro Popup Banner
 */
export function useIntroPopup(
    options: UseIntroPopupOptions = {}
): UseIntroPopupResult {
    const { isDeepLink = false, enabled = true } = options;
    const { i18n } = useTranslation();
    const currentLanguage = i18n.language;

    // State for visibility (controlled by dismiss actions)
    const [isVisible, setIsVisible] = useState(true);

    // Fetch banner data
    const query = useQuery({
        queryKey: ['intro-popup-banner', currentLanguage],
        queryFn: () => fetchIntroPopupBanner({ locale: currentLanguage }),
        enabled: enabled && !isDeepLink,
        staleTime: POPUP_STALE_TIME,
        gcTime: POPUP_CACHE_TIME,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    // Get primary banner
    const rawBanner = query.data?.[0] || null;
    const banner = rawBanner ? toBannerUI(rawBanner, true) : null;

    // Check frequency rules (SYNC - using MMKV)
    const canShowByFrequency = useMemo(() => {
        if (!rawBanner) return false;
        return PopupFrequency.canShowIntroPopup(rawBanner.id, isDeepLink);
    }, [rawBanner, isDeepLink]);

    // Dismiss popup (simple close)
    const dismiss = useCallback(() => {
        setIsVisible(false);
        if (rawBanner) {
            PopupFrequency.recordPopupShown(rawBanner.id);
        }
    }, [rawBanner]);

    // Skip popups for today
    const skipToday = useCallback(() => {
        setIsVisible(false);
        PopupFrequency.setSkipToday();
        if (rawBanner) {
            PopupFrequency.recordPopupShown(rawBanner.id);
        }
    }, [rawBanner]);

    // Dismiss this campaign permanently
    const dismissCampaign = useCallback(() => {
        setIsVisible(false);
        if (rawBanner) {
            PopupFrequency.recordCampaignDismissed(rawBanner.id);
            PopupFrequency.recordPopupShown(rawBanner.id);
        }
    }, [rawBanner]);

    // Calculate final shouldShow
    const shouldShow =
        enabled &&
        !isDeepLink &&
        !query.isLoading &&
        canShowByFrequency &&
        isVisible &&
        !!banner;

    return {
        shouldShow,
        banner,
        rawBanner,
        isLoading: query.isLoading,
        dismiss,
        skipToday,
        dismissCampaign,
        refetch: query.refetch,
    };
}

export default useIntroPopup;
